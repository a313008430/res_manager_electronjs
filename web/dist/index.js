(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fs')) :
    typeof define === 'function' && define.amd ? define(['fs'], factory) :
    (global = global || self, global.game = factory(global.fs));
}(this, function (fs) { 'use strict';

    /**
     * 数据管理器
     */
    class DataManager {
        constructor() {
            this.groupId = 0;
            this.rootResList = new Map();
            this.groupList = new Map();
            this.allType = new Set();
            this.groupNameList = new Map();
            this.dirNames = new Set();
            this.allItemList = new Set();
        }
        /**
         * 添加一组
         * @param name 组名称
         * @returns 返回生成的组id
         */
        addGroup(name) {
            this.groupId++;
            this.groupList.set(this.groupId, new Map());
            this.groupNameList.set(this.groupId, name);
            return this.groupId;
        }
        /**
         * 删除一组
         * @param name 组名称
         */
        clearGroup(id) {
            let group = this.groupList.get(id);
            if (!group)
                return;
            if (group.size) { //如果有数据是否删除
                this.groupList.delete(id);
                this.groupNameList.delete(id);
            }
        }
        /**
         * 向某组里添加一条数据
         * @param id 根目录内的id
         * @param groupId 组id
         */
        addItmeByGroupId(id, groupId) {
            let rootData = this.rootResList.get(id); //获取根目录数据
            if (rootData) {
                let obj = this.groupList.get(groupId);
                if (obj && !obj.get(id)) {
                    let resObj = {
                        resName: rootData.name,
                        type: rootData.type,
                        path: rootData.path
                    };
                    obj.set(id, resObj);
                    return resObj;
                }
            }
            return null;
        }
        /**
         * 从某组中删除一条数据
         * @param id 根目录内的id
         * @param groupId 组id
         */
        deleteItemByGroupId(id, groupId) {
            let rootData = this.groupList.get(groupId); //获取根目录数据
            if (rootData) {
                rootData.delete(id);
            }
        }
        /**
         * 修改组名称
         */
        replaceGroupName(id, name) {
            if (this.groupNameList.get(id)) {
                this.groupNameList.set(id, name);
                return name;
            }
            return null;
        }
        /**
         * 获取组名称
         */
        getGroupName(name) {
            let n = '';
            this.groupNameList.forEach((val) => {
                if (name === val)
                    n = val;
            });
            return n;
        }
        /**
         * 获取所有资源列表 导出到json时用 唯一性
         */
        getJsonData() {
            let jsonData = {
                all: [],
                groups: []
            };
            this.groupList.forEach((v, k) => {
                // jsonData.group.push({name:this.groupNameList.get(k)!, list:[]})
                let gorup = {
                    name: this.groupNameList.get(k),
                    ids: []
                };
                v.forEach((mv) => {
                    gorup.ids.push(mv.resName);
                    if (!this.allItemList.has(mv)) {
                        jsonData.all.push(mv);
                    }
                    this.allItemList.add(mv);
                });
                jsonData.groups.push(gorup);
            });
            console.log(this.allItemList);
            console.log(jsonData);
        }
    }

    /**
     * 界面逻辑
     */
    class ViewLogic {
        constructor() {
            this.groupId = 1;
            this.initGroup = 'init';
            this.dataManager = new DataManager();
            this.browseBtn = document.querySelector('#browse');
            this.groupListNode = $('#groupListNode');
            this.addGroupBtn = $('#addGroupBtn');
            this.myListNode = $('#myListNode');
            this.rootList = $('#rootList');
            //添加根目录资源点击事件
            this.browseBtn.addEventListener('change', (e) => {
                let file = this.browseBtn.files.item(0);
                if (file.type === "application/json") {
                    //获取资源根目录
                    let path = file.path;
                    let pathArr = path.split('\\');
                    pathArr.splice(pathArr.length - 2, 2);
                    let rootPath = pathArr.join('/') + '/assets/resources';
                    this.setRootPath(rootPath);
                    //验证根目录是否存在
                    if (fs.existsSync(rootPath)) {
                        this.clear();
                        this.dataManager.root = rootPath;
                        this.readDir(rootPath);
                        this.drawRootList();
                        //检测导入的json文件内容
                        let resData = fs.readFileSync(file.path).toString();
                        if (resData.length) {
                            resData = JSON.parse(resData);
                        }
                        else {
                            console.log('json文件为空');
                            this.addGroup(this.initGroup, false);
                        }
                    }
                    else {
                        alert('root path is error!');
                    }
                    console.log(rootPath);
                }
                else {
                    alert('The format must be JSON!');
                }
                // this.setRootPath(file)
                console.log(file);
            });
            //添加组
            this.addGroupBtn.on('click', () => {
                this.addGroup('GroupName' + this.groupId, true);
                this.groupListNode.find('input').focus();
            });
            //删除一个组
            this.groupListNode.on('click', '.delete', (e) => {
                e.stopPropagation();
                let id = Number(e.currentTarget.getAttribute('data-id'));
                this.dataManager.groupNameList.delete(id);
                this.dataManager.groupList.delete(id);
                $(e.currentTarget).parents('dd').remove();
                if (this.curGroupId === id) {
                    this.groupListNode.find('dd').eq(0).addClass('cur').siblings().removeClass('cur');
                    this.drawByGroupIdList(1);
                    this.showSelected();
                }
            });
            // 组名称点击事件
            this.groupListNode.on('click', 'dd', (e) => {
                if (e.currentTarget) {
                    $(e.currentTarget).addClass('cur').siblings().removeClass('cur');
                    let id = Number(e.currentTarget.getAttribute('data-id'));
                    if (this.curGroupId !== id) {
                        this.drawByGroupIdList(id);
                        this.curGroupId = id;
                        this.showSelected();
                    }
                }
            });
            //修改名称双击事件
            let curVal;
            this.groupListNode.on('dblclick', '.replaceGroupName', (e) => {
                if (e.currentTarget) {
                    let input = $(e.currentTarget).find('input');
                    input.prop('disabled', '');
                    input.focus();
                    curVal = input.val();
                }
            });
            this.groupListNode.on('focusout blur', 'input', (e) => {
                $(e.currentTarget).attr('disabled', 'disabled');
                // $(e.currentTarget).off();
                let val = $(e.currentTarget).val();
                if (val.match(/^[A-z]/) && !val.match(/[^A-z0-9\_]/)) {
                    console.log('1231232可以开始');
                }
                else {
                    $(e.currentTarget).val(curVal);
                    this.hint('内容必须以字母开头，除了_不可以有其它特殊字符!');
                }
            });
            //根目录列表点击事件==>双击  添加数据到下列
            this.rootList.on('dblclick', 'dd', (e) => {
                if (e.currentTarget) {
                    this.addDataList(e.currentTarget.getAttribute('data-id'));
                }
            });
            //删除已经缓存数据 根目录点击事件
            this.rootList.on('click', '.delete', (e) => {
                if (e.currentTarget) {
                    this.clearItemBtId(e.currentTarget.getAttribute('data-id'));
                }
            });
            this.myListNode.on('click', '.delete', (e) => {
                if (e.currentTarget) {
                    this.clearItemBtId(e.currentTarget.getAttribute('data-id'));
                }
            });
            //资源类型修改
            this.myListNode.on('change', 'select', (e) => {
                if (e.currentTarget) {
                    if (this.curGroupId)
                        this.dataManager.groupList.get(this.curGroupId).get(e.currentTarget.getAttribute('data-id')).type = e.currentTarget.value;
                }
            });
            //根据目录筛选
            $('#dirSelect').on('change', (e) => {
                if (e.currentTarget) {
                    let val = e.currentTarget.value;
                    if (val === 'All') {
                        this.rootList.find('dd').show();
                        return;
                    }
                    this.rootList.find('dd').hide();
                    this.rootList.find('.path').each((e, m) => {
                        if ($(m).text().indexOf(val) > -1) {
                            $(m).parents('dd').show();
                        }
                    });
                }
            });
            //保存
            window.addEventListener('keydown', (e) => {
                if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) { //ctrl+s
                    e.preventDefault();
                    this.saveJson();
                }
            });
        }
        /**
         * 添加一条数据到数据列表
         * @param id 资源id
         */
        addDataList(id) {
            this.drawItem(this.dataManager.addItmeByGroupId(id, this.curGroupId));
            this.showSelected();
        }
        /**
         * 渲染一条数据到前端
         */
        drawItem(obj) {
            if (!obj) {
                return;
            }
            //绑定类型
            let typeStr = '';
            this.dataManager.allType.forEach((v) => {
                typeStr += `<option ${obj.type === v ? 'selected' : ''}>${v}</option>`;
            });
            this.myListNode.prepend(`<dd data-id=${obj.path}>
        <div class="g0 resName">${obj.resName}</div>
        <div class="g0 resType select is-small">
            <select data-id=${obj.path}>${typeStr}</select>
        </div>
        <div class="g1"><a data-id=${obj.path} class="delete is-small"></a>${obj.path}</div>
        <div class="g0 annotation">
            <input class="input is-small" type="text" value="${obj.note ? obj.note : ''}" placeholder="注释">
        </div>
    </dd>`);
        }
        /**
         * 添加分组
         * @param name 组名字
         * @param type 是否可修改和删除 true 可修改 false 不可修改
         */
        addGroup(name, type) {
            if (this.dataManager.getGroupName(name)) {
                alert('分组名称已经存在');
                return;
            }
            this.curGroupId = this.dataManager.addGroup(name);
            this.groupListNode.find('dd').removeClass('cur');
            this.groupListNode.append(`<dd data-id=${this.curGroupId} class="tag g1 is-white cur ${type ? 'replaceGroupName' : ''}">
        <input  disabled class="input is-small groupName" type="text" placeholder="Group name" value="${name}">
        ${type ? ' <button data-id=' + this.curGroupId + ' class="delete is-small"></button>' : ''}
    </dd>`);
            this.drawByGroupIdList(this.curGroupId);
            this.showSelected();
            this.groupId++;
        }
        /**
         * 根据组数据渲染
         * @param id 组id
         */
        drawByGroupIdList(id) {
            let list = this.dataManager.groupList.get(id);
            if (list) {
                this.myListNode.html('');
                list.forEach((val) => {
                    this.drawItem(val);
                });
                console.log(list);
            }
        }
        /**
         * 清除列表初始化等
         */
        clear() {
            this.dataManager.rootResList.clear();
            this.groupListNode.html('');
            this.myListNode.html('');
        }
        /**
         * 设置根目录路径
         * @param path 路径
         */
        setRootPath(path) {
            let rootNode = document.querySelector('#rootNode');
            rootNode.innerText = path;
        }
        /**
         * 渲染根文件所有资源
         */
        drawRootList() {
            console.log(this.dataManager.rootResList);
            let html = '', list = this.dataManager.rootResList;
            //this.dataManager.root + 
            list.forEach((val, key) => {
                html += `<dd data-id=${key} data-type=${val.type} title=${val.name}>
                <div class="g0 resName">${val.name}</div>
                <div class="g0 resType">${val.type}</div>
                <div class="g1"><a data-id=${key} class="delete rootDel is-small"></a><span class="path">${val.path}</span></div>
                <div class="g0 size_me">${this.convertFileSize(val.size)}</div>
            </dd>`;
            });
            this.rootList.html(html);
            //渲染目录
            $('#dirSelect').html('');
            html = '<option selected>All</option>';
            this.dataManager.dirNames.forEach((val) => {
                html += `<option>${val}</option>`;
            });
            $('#dirSelect').html(html);
        }
        /**
         * 通过绝对地址id删除
         * @param id 资源id
         */
        clearItemBtId(id) {
            this.dataManager.deleteItemByGroupId(id, this.curGroupId);
            this.showSelected();
            this.drawByGroupIdList(this.curGroupId); //需要优化
        }
        /**
         * 读取目录所有资源
         * @param path 路径
         */
        readDir(path) {
            if (!path.length) {
                return;
            }
            let files = fs.readdirSync(path);
            for (let x = files.length - 1; x > -1; x--) {
                if (files[x].indexOf('.meta') === -1) { //排除.mate文件
                    let stats = fs.statSync(path + '/' + files[x]);
                    if (stats.isDirectory()) { //目录
                        this.readDir(path + '/' + files[x]);
                    }
                    else if (stats.isFile()) { //是文件
                        let name = files[x].replace('_', '').split('.');
                        this.dataManager.allType.add(name[1]); //重复一直添加类型 保证类型唯一性
                        let myPath = (path + '/' + files[x]).replace(this.dataManager.root + '', '');
                        let dir = myPath.split('/'), newDir = "";
                        for (let x = 0, l = dir.length - 1; x < l; x++) {
                            newDir += dir[x] + '/';
                        }
                        this.dataManager.dirNames.add(newDir);
                        this.dataManager.rootResList.set(myPath, {
                            name: name.join('_'),
                            path: myPath,
                            type: name[1],
                            size: stats.size
                        });
                    }
                }
            }
        }
        /** 文件大小值转换 */
        convertFileSize(size) {
            size = size / 1000;
            if (size < 1024) {
                return size.toFixed(2) + 'KB';
            }
            else {
                size = size / 1000;
                return size.toFixed(2) + 'MB';
            }
        }
        /**
         * 提示
         */
        hint(str, time = 2000) {
            let hintView = $('#hintView');
            hintView.show();
            hintView.text(str);
            if (this.hintTime)
                clearTimeout(this.hintTime);
            this.hintTime = setTimeout(() => {
                hintView.fadeOut(300);
            }, time);
        }
        /**
         * 根据已经选择的列表，在根目录列表中显示出来
         */
        showSelected() {
            let list = this.rootList.find('dd'), group = this.dataManager.groupList.get(this.curGroupId), l = list.length, dd;
            list.removeClass('cur');
            if (group) {
                group.forEach((v, k) => {
                    for (let x = 0; x < l; x++) {
                        dd = list.eq(x);
                        if (dd) {
                            if (dd.attr('data-id') === k) {
                                dd.addClass('cur');
                                break;
                            }
                        }
                    }
                });
            }
        }
        /**
         * 保存为json
         */
        saveJson() {
            this.hint('保存成功', 600);
            this.dataManager.getJsonData();
        }
    }

    /**
     * 渲染逻辑入口
     */
    class Main {
        constructor() {
            new ViewLogic();
        }
    }
    // new Main()

    return Main;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9EYXRhTWFuYWdlci50cyIsIi4uL3NyYy9WaWV3TG9naWMudHMiLCIuLi9zcmMvTWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICog5pWw5o2u566h55CG5ZmoXHJcbiAqL1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFNYW5hZ2VyIHtcclxuXHJcbiAgICAvKirmoLnnm67lvZUgKi9cclxuICAgIHJvb3Q6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIC8qKiDmiYDmnInnmoTnsbvlnosgKi9cclxuICAgIGFsbFR5cGU6IFNldDxzdHJpbmc+O1xyXG4gICAgLyoqIOe7hOaVsOaNruWIl+ihqCAqL1xyXG4gICAgZ3JvdXBMaXN0OiBNYXA8bnVtYmVyLCBNYXA8c3RyaW5nLCByZXNPYmo+PjtcclxuICAgIC8qKiDnu4TlkI3np7DliJfooaggKi9cclxuICAgIGdyb3VwTmFtZUxpc3Q6IE1hcDxudW1iZXIsIHN0cmluZz47XHJcbiAgICAvKiog6YCS5aKe55qE57uEaWQgKi9cclxuICAgIHByaXZhdGUgZ3JvdXBJZDogbnVtYmVyO1xyXG4gICAgLyoqIOe8k+WtmOaVsOaNruWIl+ihqCA9PiDmiYDmnInnu4TnmoTmlbDmja7lkIggPT4g6L+Z6YeM6LKM5Ly85Y+v5Lul5LyY5YyW5LiL5pWw5o2u57uT5p6EICovXHJcbiAgICBhbGxJdGVtTGlzdDogU2V0PHJlc09iaj47XHJcblxyXG4gICAgLyoqIOagueebruW9leaVsOaNruWIl+ihqCAqL1xyXG4gICAgcm9vdFJlc0xpc3Q6IE1hcDxzdHJpbmcsIHJvb3RMaXN0T2JqPjtcclxuICAgIC8qKiDmoLnnm67lvZXkuIvmiYDmnInotYTmupDnm67lvZXlkI3np7AgKi9cclxuICAgIGRpck5hbWVzOiBTZXQ8c3RyaW5nPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwSWQgPSAwO1xyXG4gICAgICAgIHRoaXMucm9vdFJlc0xpc3QgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3QgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5hbGxUeXBlID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmRpck5hbWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMuYWxsSXRlbUxpc3QgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDkuIDnu4RcclxuICAgICAqIEBwYXJhbSBuYW1lIOe7hOWQjeensFxyXG4gICAgICogQHJldHVybnMg6L+U5Zue55Sf5oiQ55qE57uEaWRcclxuICAgICAqL1xyXG4gICAgYWRkR3JvdXAobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgICAgICB0aGlzLmdyb3VwSWQrKztcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdC5zZXQodGhpcy5ncm91cElkLCBuZXcgTWFwKCkpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5zZXQodGhpcy5ncm91cElkLCBuYW1lKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cElkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5LiA57uEXHJcbiAgICAgKiBAcGFyYW0gbmFtZSDnu4TlkI3np7BcclxuICAgICAqL1xyXG4gICAgY2xlYXJHcm91cChpZDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwID0gdGhpcy5ncm91cExpc3QuZ2V0KGlkKSBhcyBNYXA8c3RyaW5nLCByZXNPYmo+O1xyXG5cclxuICAgICAgICBpZiAoIWdyb3VwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmIChncm91cC5zaXplKSB7Ly/lpoLmnpzmnInmlbDmja7mmK/lkKbliKDpmaRcclxuICAgICAgICAgICAgdGhpcy5ncm91cExpc3QuZGVsZXRlKGlkKTtcclxuICAgICAgICAgICAgdGhpcy5ncm91cE5hbWVMaXN0LmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfSBlbHNlIHsvL+ebtOaOpeWIoOmZpFxyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlkJHmn5Dnu4Tph4zmt7vliqDkuIDmnaHmlbDmja5cclxuICAgICAqIEBwYXJhbSBpZCDmoLnnm67lvZXlhoXnmoRpZFxyXG4gICAgICogQHBhcmFtIGdyb3VwSWQg57uEaWRcclxuICAgICAqL1xyXG4gICAgYWRkSXRtZUJ5R3JvdXBJZChpZDogc3RyaW5nLCBncm91cElkOiBudW1iZXIpOiByZXNPYmogfCBudWxsIHtcclxuICAgICAgICBsZXQgcm9vdERhdGEgPSB0aGlzLnJvb3RSZXNMaXN0LmdldChpZCk7Ly/ojrflj5bmoLnnm67lvZXmlbDmja5cclxuICAgICAgICBpZiAocm9vdERhdGEpIHtcclxuICAgICAgICAgICAgbGV0IG9iaiA9IHRoaXMuZ3JvdXBMaXN0LmdldChncm91cElkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvYmogJiYgIW9iai5nZXQoaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzT2JqOiByZXNPYmogPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzTmFtZTogcm9vdERhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiByb290RGF0YS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHJvb3REYXRhLnBhdGhcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBvYmouc2V0KGlkLCByZXNPYmopO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc09iajtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku47mn5Dnu4TkuK3liKDpmaTkuIDmnaHmlbDmja5cclxuICAgICAqIEBwYXJhbSBpZCDmoLnnm67lvZXlhoXnmoRpZFxyXG4gICAgICogQHBhcmFtIGdyb3VwSWQg57uEaWRcclxuICAgICAqL1xyXG4gICAgZGVsZXRlSXRlbUJ5R3JvdXBJZChpZDogc3RyaW5nLCBncm91cElkOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcm9vdERhdGEgPSB0aGlzLmdyb3VwTGlzdC5nZXQoZ3JvdXBJZCkhOy8v6I635Y+W5qC555uu5b2V5pWw5o2uXHJcbiAgICAgICAgaWYgKHJvb3REYXRhKSB7XHJcbiAgICAgICAgICAgIHJvb3REYXRhLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5L+u5pS557uE5ZCN56ewXHJcbiAgICAgKi9cclxuICAgIHJlcGxhY2VHcm91cE5hbWUoaWQ6IG51bWJlciwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBOYW1lTGlzdC5nZXQoaWQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5zZXQoaWQsIG5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bnu4TlkI3np7BcclxuICAgICAqL1xyXG4gICAgZ2V0R3JvdXBOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBuOiBzdHJpbmcgPSAnJztcclxuICAgICAgICB0aGlzLmdyb3VwTmFtZUxpc3QuZm9yRWFjaCgodmFsOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IHZhbCkgbiA9IHZhbDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5omA5pyJ6LWE5rqQ5YiX6KGoIOWvvOWHuuWIsGpzb27ml7bnlKgg5ZSv5LiA5oCnXHJcbiAgICAgKi9cclxuICAgIGdldEpzb25EYXRhKCkge1xyXG4gICAgICAgIGxldCBqc29uRGF0YToge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXBzOiB7IG5hbWU6IHN0cmluZywgaWRzOiBzdHJpbmdbXX1bXSxcclxuICAgICAgICAgICAgICAgIGFsbDogcmVzT2JqW11cclxuICAgICAgICAgICAgfSA9IHtcclxuICAgICAgICAgICAgICAgIGFsbDogW10sXHJcbiAgICAgICAgICAgICAgICBncm91cHM6IFtdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3QuZm9yRWFjaCgodiwgaykgPT4ge1xyXG5cclxuICAgICAgICAgICAgLy8ganNvbkRhdGEuZ3JvdXAucHVzaCh7bmFtZTp0aGlzLmdyb3VwTmFtZUxpc3QuZ2V0KGspISwgbGlzdDpbXX0pXHJcbiAgICAgICAgICAgIGxldCBnb3J1cDp7IG5hbWU6IHN0cmluZywgaWRzOiBzdHJpbmdbXX0gPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOnRoaXMuZ3JvdXBOYW1lTGlzdC5nZXQoaykhLFxyXG4gICAgICAgICAgICAgICAgaWRzOltdXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHYuZm9yRWFjaCgobXYpID0+IHtcclxuICAgICAgICAgICAgICAgIGdvcnVwLmlkcy5wdXNoKG12LnJlc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmFsbEl0ZW1MaXN0LmhhcyhtdikpIHtcclxuICAgICAgICAgICAgICAgICAgICBqc29uRGF0YS5hbGwucHVzaChtdik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFsbEl0ZW1MaXN0LmFkZChtdik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGpzb25EYXRhLmdyb3Vwcy5wdXNoKGdvcnVwKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuYWxsSXRlbUxpc3QpXHJcbiAgICAgICAgY29uc29sZS5sb2coanNvbkRhdGEpXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVE9ETyDpnIDopoHkvJjljJbnvJPlrZjnmoTmlbDmja7nu5PmnoTvvIzkuI3nhLbkuI3mlrnkvr/lr7zmiJDkuLpqc29uXHJcbiAgICAgKiDnu5PmnpzlnKhyZXNPYmrnmoTln7rmnKzkuIrmt7vliqDkuIrliIbnu4RpZCDnhLblkI7mlbTkvZPnm7TmjqXlr7zlhaXkuLpqc29uXHJcbiAgICAgKi9cclxufSIsImltcG9ydCBEYXRhTWFuYWdlciBmcm9tIFwiLi9EYXRhTWFuYWdlclwiO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcclxuXHJcbi8qKlxyXG4gKiDnlYzpnaLpgLvovpFcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdMb2dpYyB7XHJcblxyXG4gICAgLyoqIOS4iuS8oOaMiemSriAqL1xyXG4gICAgcHJpdmF0ZSBicm93c2VCdG46IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAvKiog57uE5ZCN56ew5YiX6KGo6IqC54K5ICovXHJcbiAgICBwcml2YXRlIGdyb3VwTGlzdE5vZGU6IEpRdWVyeTxIVE1MRWxlbWVudD47XHJcbiAgICAvKiog5re75Yqg57uE5oyJ6ZKuICovXHJcbiAgICBwcml2YXRlIGFkZEdyb3VwQnRuOiBKUXVlcnk8SFRNTEVsZW1lbnQ+O1xyXG4gICAgLyoqIOaIkeeahOaVsOaNruWIl+ihqCAqL1xyXG4gICAgcHJpdmF0ZSBteUxpc3ROb2RlOiBKUXVlcnk8SFRNTEVsZW1lbnQ+O1xyXG4gICAgLyoqIOagueebruW9leWIl+ihqOiKgueCuSAqL1xyXG4gICAgcHJpdmF0ZSByb290TGlzdDogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcclxuXHJcblxyXG4gICAgLyoqIOaVsOaNrueuoeeQhiAqL1xyXG4gICAgcHJpdmF0ZSBkYXRhTWFuYWdlcjogRGF0YU1hbmFnZXI7XHJcbiAgICAvKiog5b2T5YmN6YCJ5oup55qE5YiG57uEaWQgKi9cclxuICAgIHByaXZhdGUgY3VyR3JvdXBJZDogbnVtYmVyO1xyXG4gICAgLyoqIOm7mOiupOe7hCAqL1xyXG4gICAgcHJpdmF0ZSBpbml0R3JvdXA6IHN0cmluZztcclxuICAgIC8qKiBoaW505a6a5pe25ZmoICovXHJcbiAgICBwcml2YXRlIGhpbnRUaW1lOiBhbnk7XHJcbiAgICAvKiog57uE6YCS5aKeaWQgKi9cclxuICAgIHByaXZhdGUgZ3JvdXBJZDogbnVtYmVyO1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwSWQgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRHcm91cCA9ICdpbml0JztcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlciA9IG5ldyBEYXRhTWFuYWdlcigpO1xyXG5cclxuICAgICAgICB0aGlzLmJyb3dzZUJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNicm93c2UnKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZSA9ICQoJyNncm91cExpc3ROb2RlJyk7XHJcbiAgICAgICAgdGhpcy5hZGRHcm91cEJ0biA9ICQoJyNhZGRHcm91cEJ0bicpO1xyXG4gICAgICAgIHRoaXMubXlMaXN0Tm9kZSA9ICQoJyNteUxpc3ROb2RlJyk7XHJcbiAgICAgICAgdGhpcy5yb290TGlzdCA9ICQoJyNyb290TGlzdCcpO1xyXG5cclxuICAgICAgICAvL+a3u+WKoOagueebruW9lei1hOa6kOeCueWHu+S6i+S7tlxyXG4gICAgICAgIHRoaXMuYnJvd3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlOiBFdmVudCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpbGU6IGFueSA9ICh0aGlzLmJyb3dzZUJ0bi5maWxlcyBhcyBGaWxlTGlzdCkuaXRlbSgwKSBhcyBGaWxlO1xyXG4gICAgICAgICAgICBpZiAoZmlsZS50eXBlID09PSBcImFwcGxpY2F0aW9uL2pzb25cIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8v6I635Y+W6LWE5rqQ5qC555uu5b2VXHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aDogc3RyaW5nID0gZmlsZS5wYXRoO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGhBcnI6IGFueVtdID0gcGF0aC5zcGxpdCgnXFxcXCcpO1xyXG4gICAgICAgICAgICAgICAgcGF0aEFyci5zcGxpY2UocGF0aEFyci5sZW5ndGggLSAyLCAyKTtcclxuICAgICAgICAgICAgICAgIGxldCByb290UGF0aDogc3RyaW5nID0gcGF0aEFyci5qb2luKCcvJykgKyAnL2Fzc2V0cy9yZXNvdXJjZXMnXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFJvb3RQYXRoKHJvb3RQYXRoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL+mqjOivgeagueebruW9leaYr+WQpuWtmOWcqFxyXG4gICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocm9vdFBhdGgpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5yb290ID0gcm9vdFBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkRGlyKHJvb3RQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdSb290TGlzdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL+ajgOa1i+WvvOWFpeeahGpzb27mlofku7blhoXlrrlcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlLnBhdGgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc0RhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc0RhdGEgPSBKU09OLnBhcnNlKHJlc0RhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnanNvbuaWh+S7tuS4uuepuicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEdyb3VwKHRoaXMuaW5pdEdyb3VwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ3Jvb3QgcGF0aCBpcyBlcnJvciEnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocm9vdFBhdGgpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydCgnVGhlIGZvcm1hdCBtdXN0IGJlIEpTT04hJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0aGlzLnNldFJvb3RQYXRoKGZpbGUpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZpbGUpO1xyXG4gICAgICAgIH0pXHJcblxyXG5cclxuICAgICAgICAvL+a3u+WKoOe7hFxyXG4gICAgICAgIHRoaXMuYWRkR3JvdXBCdG4ub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEdyb3VwKCdHcm91cE5hbWUnICsgdGhpcy5ncm91cElkLCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLmZpbmQoJ2lucHV0JykuZm9jdXMoKTtcclxuICAgICAgICB9KVxyXG5cclxuXHJcbiAgICAgICAgLy/liKDpmaTkuIDkuKrnu4RcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUub24oJ2NsaWNrJywgJy5kZWxldGUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBsZXQgaWQgPSBOdW1iZXIoZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5ncm91cE5hbWVMaXN0LmRlbGV0ZShpZCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIuZ3JvdXBMaXN0LmRlbGV0ZShpZCk7XHJcbiAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnRzKCdkZCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJHcm91cElkID09PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLmZpbmQoJ2RkJykuZXEoMCkuYWRkQ2xhc3MoJ2N1cicpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2N1cicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3QnlHcm91cElkTGlzdCgxKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1NlbGVjdGVkKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIOe7hOWQjeensOeCueWHu+S6i+S7tlxyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5vbignY2xpY2snLCAnZGQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5jdXJyZW50VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuYWRkQ2xhc3MoJ2N1cicpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2N1cicpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkID0gTnVtYmVyKGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJHcm91cElkICE9PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0J5R3JvdXBJZExpc3QoaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VyR3JvdXBJZCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd1NlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC8v5L+u5pS55ZCN56ew5Y+M5Ye75LqL5Lu2XHJcbiAgICAgICAgbGV0IGN1clZhbDogYW55O1xyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5vbignZGJsY2xpY2snLCAnLnJlcGxhY2VHcm91cE5hbWUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5jdXJyZW50VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5wdXQgPSAkKGUuY3VycmVudFRhcmdldCkuZmluZCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGlucHV0LnByb3AoJ2Rpc2FibGVkJywgJycpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIGN1clZhbCA9IGlucHV0LnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5vbignZm9jdXNvdXQgYmx1cicsICdpbnB1dCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAvLyAkKGUuY3VycmVudFRhcmdldCkub2ZmKCk7XHJcbiAgICAgICAgICAgIGxldCB2YWw6IGFueSA9ICQoZS5jdXJyZW50VGFyZ2V0KS52YWwoKTtcclxuICAgICAgICAgICAgaWYgKHZhbC5tYXRjaCgvXltBLXpdLykgJiYgIXZhbC5tYXRjaCgvW15BLXowLTlcXF9dLykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcxMjMxMjMy5Y+v5Lul5byA5aeLJylcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkudmFsKGN1clZhbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpbnQoJ+WGheWuueW/hemhu+S7peWtl+avjeW8gOWktO+8jOmZpOS6hl/kuI3lj6/ku6XmnInlhbblroPnibnmrorlrZfnrKYhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuXHJcbiAgICAgICAgLy/moLnnm67lvZXliJfooajngrnlh7vkuovku7Y9PT7lj4zlh7sgIOa3u+WKoOaVsOaNruWIsOS4i+WIl1xyXG4gICAgICAgIHRoaXMucm9vdExpc3Qub24oJ2RibGNsaWNrJywgJ2RkJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGREYXRhTGlzdChlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy/liKDpmaTlt7Lnu4/nvJPlrZjmlbDmja4g5qC555uu5b2V54K55Ye75LqL5Lu2XHJcbiAgICAgICAgdGhpcy5yb290TGlzdC5vbignY2xpY2snLCAnLmRlbGV0ZScsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmN1cnJlbnRUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJJdGVtQnRJZChlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIHRoaXMubXlMaXN0Tm9kZS5vbignY2xpY2snLCAnLmRlbGV0ZScsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmN1cnJlbnRUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJJdGVtQnRJZChlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL+i1hOa6kOexu+Wei+S/ruaUuVxyXG4gICAgICAgIHRoaXMubXlMaXN0Tm9kZS5vbignY2hhbmdlJywgJ3NlbGVjdCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmN1cnJlbnRUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1ckdyb3VwSWQpIHRoaXMuZGF0YU1hbmFnZXIuZ3JvdXBMaXN0LmdldCh0aGlzLmN1ckdyb3VwSWQpIS5nZXQoZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKSEudHlwZSA9IGUuY3VycmVudFRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8v5qC55o2u55uu5b2V562b6YCJXHJcbiAgICAgICAgJCgnI2RpclNlbGVjdCcpLm9uKCdjaGFuZ2UnLCAoZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmN1cnJlbnRUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWwgPSBlLmN1cnJlbnRUYXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsID09PSAnQWxsJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdExpc3QuZmluZCgnZGQnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290TGlzdC5maW5kKCdkZCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdExpc3QuZmluZCgnLnBhdGgnKS5lYWNoKChlLCBtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQobSkudGV4dCgpLmluZGV4T2YodmFsKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQobSkucGFyZW50cygnZGQnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8v5L+d5a2YXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDgzICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goJ01hYycpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkgey8vY3RybCtzXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNhdmVKc29uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOS4gOadoeaVsOaNruWIsOaVsOaNruWIl+ihqFxyXG4gICAgICogQHBhcmFtIGlkIOi1hOa6kGlkXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYWRkRGF0YUxpc3QoaWQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZHJhd0l0ZW0odGhpcy5kYXRhTWFuYWdlci5hZGRJdG1lQnlHcm91cElkKGlkLCB0aGlzLmN1ckdyb3VwSWQpISk7XHJcbiAgICAgICAgdGhpcy5zaG93U2VsZWN0ZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa4suafk+S4gOadoeaVsOaNruWIsOWJjeerr1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRyYXdJdGVtKG9iajogcmVzT2JqKSB7XHJcbiAgICAgICAgaWYgKCFvYmopIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL+e7keWumuexu+Wei1xyXG4gICAgICAgIGxldCB0eXBlU3RyOiBzdHJpbmcgPSAnJztcclxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmFsbFR5cGUuZm9yRWFjaCgodikgPT4ge1xyXG4gICAgICAgICAgICB0eXBlU3RyICs9IGA8b3B0aW9uICR7b2JqLnR5cGUgPT09IHYgPyAnc2VsZWN0ZWQnIDogJyd9PiR7dn08L29wdGlvbj5gO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm15TGlzdE5vZGUucHJlcGVuZChgPGRkIGRhdGEtaWQ9JHtvYmoucGF0aH0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImcwIHJlc05hbWVcIj4ke29iai5yZXNOYW1lfTwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnMCByZXNUeXBlIHNlbGVjdCBpcy1zbWFsbFwiPlxyXG4gICAgICAgICAgICA8c2VsZWN0IGRhdGEtaWQ9JHtvYmoucGF0aH0+JHt0eXBlU3RyfTwvc2VsZWN0PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnMVwiPjxhIGRhdGEtaWQ9JHtvYmoucGF0aH0gY2xhc3M9XCJkZWxldGUgaXMtc21hbGxcIj48L2E+JHtvYmoucGF0aH08L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZzAgYW5ub3RhdGlvblwiPlxyXG4gICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJpbnB1dCBpcy1zbWFsbFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke29iai5ub3RlID8gb2JqLm5vdGUgOiAnJ31cIiBwbGFjZWhvbGRlcj1cIuazqOmHilwiPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgPC9kZD5gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOWIhue7hFxyXG4gICAgICogQHBhcmFtIG5hbWUg57uE5ZCN5a2XXHJcbiAgICAgKiBAcGFyYW0gdHlwZSDmmK/lkKblj6/kv67mlLnlkozliKDpmaQgdHJ1ZSDlj6/kv67mlLkgZmFsc2Ug5LiN5Y+v5L+u5pS5XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYWRkR3JvdXAobmFtZTogc3RyaW5nLCB0eXBlOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0YU1hbmFnZXIuZ2V0R3JvdXBOYW1lKG5hbWUpKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCfliIbnu4TlkI3np7Dlt7Lnu4/lrZjlnKgnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJHcm91cElkID0gdGhpcy5kYXRhTWFuYWdlci5hZGRHcm91cChuYW1lKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLmZpbmQoJ2RkJykucmVtb3ZlQ2xhc3MoJ2N1cicpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUuYXBwZW5kKGA8ZGQgZGF0YS1pZD0ke3RoaXMuY3VyR3JvdXBJZH0gY2xhc3M9XCJ0YWcgZzEgaXMtd2hpdGUgY3VyICR7dHlwZSA/ICdyZXBsYWNlR3JvdXBOYW1lJyA6ICcnfVwiPlxyXG4gICAgICAgIDxpbnB1dCAgZGlzYWJsZWQgY2xhc3M9XCJpbnB1dCBpcy1zbWFsbCBncm91cE5hbWVcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiR3JvdXAgbmFtZVwiIHZhbHVlPVwiJHtuYW1lfVwiPlxyXG4gICAgICAgICR7dHlwZSA/ICcgPGJ1dHRvbiBkYXRhLWlkPScgKyB0aGlzLmN1ckdyb3VwSWQgKyAnIGNsYXNzPVwiZGVsZXRlIGlzLXNtYWxsXCI+PC9idXR0b24+JyA6ICcnfVxyXG4gICAgPC9kZD5gKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3QnlHcm91cElkTGlzdCh0aGlzLmN1ckdyb3VwSWQpO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dTZWxlY3RlZCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBJZCsrO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u57uE5pWw5o2u5riy5p+TXHJcbiAgICAgKiBAcGFyYW0gaWQg57uEaWRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcmF3QnlHcm91cElkTGlzdChpZDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGxpc3QgPSB0aGlzLmRhdGFNYW5hZ2VyLmdyb3VwTGlzdC5nZXQoaWQpO1xyXG4gICAgICAgIGlmIChsaXN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubXlMaXN0Tm9kZS5odG1sKCcnKTtcclxuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKCh2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0l0ZW0odmFsKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobGlzdCk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa4hemZpOWIl+ihqOWIneWni+WMluetiVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIucm9vdFJlc0xpc3QuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUuaHRtbCgnJyk7XHJcbiAgICAgICAgdGhpcy5teUxpc3ROb2RlLmh0bWwoJycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5qC555uu5b2V6Lev5b6EXHJcbiAgICAgKiBAcGFyYW0gcGF0aCDot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzZXRSb290UGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgcm9vdE5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcm9vdE5vZGUnKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgICAgICByb290Tm9kZS5pbm5lclRleHQgPSBwYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5riy5p+T5qC55paH5Lu25omA5pyJ6LWE5rqQXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZHJhd1Jvb3RMaXN0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YU1hbmFnZXIucm9vdFJlc0xpc3QpXHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJyxcclxuICAgICAgICAgICAgbGlzdCA9IHRoaXMuZGF0YU1hbmFnZXIucm9vdFJlc0xpc3Q7XHJcblxyXG4gICAgICAgIC8vdGhpcy5kYXRhTWFuYWdlci5yb290ICsgXHJcbiAgICAgICAgbGlzdC5mb3JFYWNoKCh2YWwsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICBodG1sICs9IGA8ZGQgZGF0YS1pZD0ke2tleX0gZGF0YS10eXBlPSR7dmFsLnR5cGV9IHRpdGxlPSR7dmFsLm5hbWV9PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImcwIHJlc05hbWVcIj4ke3ZhbC5uYW1lfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImcwIHJlc1R5cGVcIj4ke3ZhbC50eXBlfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImcxXCI+PGEgZGF0YS1pZD0ke2tleX0gY2xhc3M9XCJkZWxldGUgcm9vdERlbCBpcy1zbWFsbFwiPjwvYT48c3BhbiBjbGFzcz1cInBhdGhcIj4ke3ZhbC5wYXRofTwvc3Bhbj48L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnMCBzaXplX21lXCI+JHt0aGlzLmNvbnZlcnRGaWxlU2l6ZSh2YWwuc2l6ZSl9PC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGQ+YDtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLnJvb3RMaXN0Lmh0bWwoaHRtbCk7XHJcblxyXG4gICAgICAgIC8v5riy5p+T55uu5b2VXHJcbiAgICAgICAgJCgnI2RpclNlbGVjdCcpLmh0bWwoJycpO1xyXG4gICAgICAgIGh0bWwgPSAnPG9wdGlvbiBzZWxlY3RlZD5BbGw8L29wdGlvbj4nO1xyXG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIuZGlyTmFtZXMuZm9yRWFjaCgodmFsKSA9PiB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gYDxvcHRpb24+JHt2YWx9PC9vcHRpb24+YDtcclxuICAgICAgICB9KVxyXG4gICAgICAgICQoJyNkaXJTZWxlY3QnKS5odG1sKGh0bWwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa6L+H57ud5a+55Zyw5Z2AaWTliKDpmaRcclxuICAgICAqIEBwYXJhbSBpZCDotYTmupBpZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNsZWFySXRlbUJ0SWQoaWQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIuZGVsZXRlSXRlbUJ5R3JvdXBJZChpZCwgdGhpcy5jdXJHcm91cElkKTtcclxuICAgICAgICB0aGlzLnNob3dTZWxlY3RlZCgpO1xyXG4gICAgICAgIHRoaXMuZHJhd0J5R3JvdXBJZExpc3QodGhpcy5jdXJHcm91cElkKTsvL+mcgOimgeS8mOWMllxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K+75Y+W55uu5b2V5omA5pyJ6LWE5rqQXHJcbiAgICAgKiBAcGFyYW0gcGF0aCDot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZWFkRGlyKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghcGF0aC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHBhdGgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4ID0gZmlsZXMubGVuZ3RoIC0gMTsgeCA+IC0xOyB4LS0pIHtcclxuICAgICAgICAgICAgaWYgKGZpbGVzW3hdLmluZGV4T2YoJy5tZXRhJykgPT09IC0xKSB7Ly/mjpLpmaQubWF0ZeaWh+S7tlxyXG4gICAgICAgICAgICAgICAgbGV0IHN0YXRzID0gZnMuc3RhdFN5bmMocGF0aCArICcvJyArIGZpbGVzW3hdKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7Ly/nm67lvZVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWREaXIocGF0aCArICcvJyArIGZpbGVzW3hdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHMuaXNGaWxlKCkpIHsvL+aYr+aWh+S7tlxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gZmlsZXNbeF0ucmVwbGFjZSgnXycsICcnKS5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIuYWxsVHlwZS5hZGQobmFtZVsxXSk7Ly/ph43lpI3kuIDnm7Tmt7vliqDnsbvlnosg5L+d6K+B57G75Z6L5ZSv5LiA5oCnXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBteVBhdGggPSAocGF0aCArICcvJyArIGZpbGVzW3hdKS5yZXBsYWNlKHRoaXMuZGF0YU1hbmFnZXIucm9vdCArICcnLCAnJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkaXIgPSBteVBhdGguc3BsaXQoJy8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGlyID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB4ID0gMCwgbCA9IGRpci5sZW5ndGggLSAxOyB4IDwgbDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0RpciArPSBkaXJbeF0gKyAnLyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIuZGlyTmFtZXMuYWRkKG5ld0Rpcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIucm9vdFJlc0xpc3Quc2V0KG15UGF0aCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLmpvaW4oJ18nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogbXlQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBuYW1lWzFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBzdGF0cy5zaXplXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKiDmlofku7blpKflsI/lgLzovazmjaIgKi9cclxuICAgIHByaXZhdGUgY29udmVydEZpbGVTaXplKHNpemU6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgc2l6ZSA9IHNpemUgLyAxMDAwO1xyXG4gICAgICAgIGlmIChzaXplIDwgMTAyNCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2l6ZS50b0ZpeGVkKDIpICsgJ0tCJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzaXplID0gc2l6ZSAvIDEwMDA7XHJcbiAgICAgICAgICAgIHJldHVybiBzaXplLnRvRml4ZWQoMikgKyAnTUInO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaPkOekulxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGhpbnQoc3RyOiBzdHJpbmcsIHRpbWU6IG51bWJlciA9IDIwMDApIHtcclxuICAgICAgICBsZXQgaGludFZpZXcgPSAkKCcjaGludFZpZXcnKTtcclxuICAgICAgICBoaW50Vmlldy5zaG93KCk7XHJcbiAgICAgICAgaGludFZpZXcudGV4dChzdHIpO1xyXG4gICAgICAgIGlmICh0aGlzLmhpbnRUaW1lKSBjbGVhclRpbWVvdXQodGhpcy5oaW50VGltZSk7XHJcbiAgICAgICAgdGhpcy5oaW50VGltZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBoaW50Vmlldy5mYWRlT3V0KDMwMCk7XHJcbiAgICAgICAgfSwgdGltZSlcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5bey57uP6YCJ5oup55qE5YiX6KGo77yM5Zyo5qC555uu5b2V5YiX6KGo5Lit5pi+56S65Ye65p2lXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2hvd1NlbGVjdGVkKCkge1xyXG4gICAgICAgIGxldCBsaXN0ID0gdGhpcy5yb290TGlzdC5maW5kKCdkZCcpIGFzIEpRdWVyeTxIVE1MRWxlbWVudD4sXHJcbiAgICAgICAgICAgIGdyb3VwID0gdGhpcy5kYXRhTWFuYWdlci5ncm91cExpc3QuZ2V0KHRoaXMuY3VyR3JvdXBJZCkhLFxyXG4gICAgICAgICAgICBsID0gbGlzdC5sZW5ndGgsXHJcbiAgICAgICAgICAgIGRkOiBKUXVlcnk8SFRNTEVsZW1lbnQ+O1xyXG5cclxuICAgICAgICBsaXN0LnJlbW92ZUNsYXNzKCdjdXInKTtcclxuICAgICAgICBpZiAoZ3JvdXApIHtcclxuICAgICAgICAgICAgZ3JvdXAuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBsOyB4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBkZCA9IGxpc3QuZXEoeCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZC5hdHRyKCdkYXRhLWlkJykgPT09IGspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRkLmFkZENsYXNzKCdjdXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS/neWtmOS4umpzb25cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzYXZlSnNvbigpIHtcclxuICAgICAgICB0aGlzLmhpbnQoJ+S/neWtmOaIkOWKnycsIDYwMCk7XHJcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5nZXRKc29uRGF0YSgpO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCBWaWV3TG9naWMgZnJvbSBcIi4vVmlld0xvZ2ljXCI7XHJcbi8qKlxyXG4gKiDmuLLmn5PpgLvovpHlhaXlj6NcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1haW4ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgbmV3IFZpZXdMb2dpYygpO1xyXG4gICAgfVxyXG59XHJcbi8vIG5ldyBNYWluKCkiXSwibmFtZXMiOlsiZnMuZXhpc3RzU3luYyIsImZzLnJlYWRGaWxlU3luYyIsImZzLnJlYWRkaXJTeW5jIiwiZnMuc3RhdFN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFBOzs7QUFLQSxVQUFxQixXQUFXO1FBb0I1QjtZQUNJLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1NBQ2hDOzs7Ozs7UUFPRCxRQUFRLENBQUMsSUFBWTtZQUNqQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxF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
