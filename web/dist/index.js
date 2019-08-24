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
                group: []
            };
            this.groupList.forEach((v, k) => {
                jsonData.group.push({ name: this.groupNameList.get(k), list: [] });
                v.forEach((mv) => {
                    if (!this.allItemList.has(mv)) {
                        jsonData.all.push(mv);
                    }
                    this.allItemList.add(mv);
                });
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
    //# sourceMappingURL=Main.js.map

    return Main;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9EYXRhTWFuYWdlci50cyIsIi4uL3NyYy9WaWV3TG9naWMudHMiLCIuLi9zcmMvTWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICog5pWw5o2u566h55CG5ZmoXHJcbiAqL1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFNYW5hZ2VyIHtcclxuXHJcbiAgICAvKirmoLnnm67lvZUgKi9cclxuICAgIHJvb3Q6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIC8qKiDmiYDmnInnmoTnsbvlnosgKi9cclxuICAgIGFsbFR5cGU6IFNldDxzdHJpbmc+O1xyXG4gICAgLyoqIOe7hOaVsOaNruWIl+ihqCAqL1xyXG4gICAgZ3JvdXBMaXN0OiBNYXA8bnVtYmVyLCBNYXA8c3RyaW5nLCByZXNPYmo+PjtcclxuICAgIC8qKiDnu4TlkI3np7DliJfooaggKi9cclxuICAgIGdyb3VwTmFtZUxpc3Q6IE1hcDxudW1iZXIsIHN0cmluZz47XHJcbiAgICAvKiog6YCS5aKe55qE57uEaWQgKi9cclxuICAgIHByaXZhdGUgZ3JvdXBJZDogbnVtYmVyO1xyXG4gICAgLyoqIOe8k+WtmOaVsOaNruWIl+ihqCA9PiDmiYDmnInnu4TnmoTmlbDmja7lkIggPT4g6L+Z6YeM6LKM5Ly85Y+v5Lul5LyY5YyW5LiL5pWw5o2u57uT5p6EICovXHJcbiAgICBhbGxJdGVtTGlzdDogU2V0PHJlc09iaj47XHJcblxyXG4gICAgLyoqIOagueebruW9leaVsOaNruWIl+ihqCAqL1xyXG4gICAgcm9vdFJlc0xpc3Q6IE1hcDxzdHJpbmcsIHJvb3RMaXN0T2JqPjtcclxuICAgIC8qKiDmoLnnm67lvZXkuIvmiYDmnInotYTmupDnm67lvZXlkI3np7AgKi9cclxuICAgIGRpck5hbWVzOiBTZXQ8c3RyaW5nPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwSWQgPSAwO1xyXG4gICAgICAgIHRoaXMucm9vdFJlc0xpc3QgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3QgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5hbGxUeXBlID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmRpck5hbWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMuYWxsSXRlbUxpc3QgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDkuIDnu4RcclxuICAgICAqIEBwYXJhbSBuYW1lIOe7hOWQjeensFxyXG4gICAgICogQHJldHVybnMg6L+U5Zue55Sf5oiQ55qE57uEaWRcclxuICAgICAqL1xyXG4gICAgYWRkR3JvdXAobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgICAgICB0aGlzLmdyb3VwSWQrKztcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdC5zZXQodGhpcy5ncm91cElkLCBuZXcgTWFwKCkpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5zZXQodGhpcy5ncm91cElkLCBuYW1lKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cElkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5LiA57uEXHJcbiAgICAgKiBAcGFyYW0gbmFtZSDnu4TlkI3np7BcclxuICAgICAqL1xyXG4gICAgY2xlYXJHcm91cChpZDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGdyb3VwID0gdGhpcy5ncm91cExpc3QuZ2V0KGlkKSBhcyBNYXA8c3RyaW5nLCByZXNPYmo+O1xyXG5cclxuICAgICAgICBpZiAoIWdyb3VwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmIChncm91cC5zaXplKSB7Ly/lpoLmnpzmnInmlbDmja7mmK/lkKbliKDpmaRcclxuICAgICAgICAgICAgdGhpcy5ncm91cExpc3QuZGVsZXRlKGlkKTtcclxuICAgICAgICAgICAgdGhpcy5ncm91cE5hbWVMaXN0LmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfSBlbHNlIHsvL+ebtOaOpeWIoOmZpFxyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlkJHmn5Dnu4Tph4zmt7vliqDkuIDmnaHmlbDmja5cclxuICAgICAqIEBwYXJhbSBpZCDmoLnnm67lvZXlhoXnmoRpZFxyXG4gICAgICogQHBhcmFtIGdyb3VwSWQg57uEaWRcclxuICAgICAqL1xyXG4gICAgYWRkSXRtZUJ5R3JvdXBJZChpZDogc3RyaW5nLCBncm91cElkOiBudW1iZXIpOiByZXNPYmogfCBudWxsIHtcclxuICAgICAgICBsZXQgcm9vdERhdGEgPSB0aGlzLnJvb3RSZXNMaXN0LmdldChpZCk7Ly/ojrflj5bmoLnnm67lvZXmlbDmja5cclxuICAgICAgICBpZiAocm9vdERhdGEpIHtcclxuICAgICAgICAgICAgbGV0IG9iaiA9IHRoaXMuZ3JvdXBMaXN0LmdldChncm91cElkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvYmogJiYgIW9iai5nZXQoaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzT2JqOiByZXNPYmogPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzTmFtZTogcm9vdERhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiByb290RGF0YS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHJvb3REYXRhLnBhdGhcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBvYmouc2V0KGlkLCByZXNPYmopO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc09iajtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDku47mn5Dnu4TkuK3liKDpmaTkuIDmnaHmlbDmja5cclxuICAgICAqIEBwYXJhbSBpZCDmoLnnm67lvZXlhoXnmoRpZFxyXG4gICAgICogQHBhcmFtIGdyb3VwSWQg57uEaWRcclxuICAgICAqL1xyXG4gICAgZGVsZXRlSXRlbUJ5R3JvdXBJZChpZDogc3RyaW5nLCBncm91cElkOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcm9vdERhdGEgPSB0aGlzLmdyb3VwTGlzdC5nZXQoZ3JvdXBJZCkhOy8v6I635Y+W5qC555uu5b2V5pWw5o2uXHJcbiAgICAgICAgaWYgKHJvb3REYXRhKSB7XHJcbiAgICAgICAgICAgIHJvb3REYXRhLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5L+u5pS557uE5ZCN56ewXHJcbiAgICAgKi9cclxuICAgIHJlcGxhY2VHcm91cE5hbWUoaWQ6IG51bWJlciwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBOYW1lTGlzdC5nZXQoaWQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5zZXQoaWQsIG5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bnu4TlkI3np7BcclxuICAgICAqL1xyXG4gICAgZ2V0R3JvdXBOYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBuOiBzdHJpbmcgPSAnJztcclxuICAgICAgICB0aGlzLmdyb3VwTmFtZUxpc3QuZm9yRWFjaCgodmFsOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IHZhbCkgbiA9IHZhbDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5omA5pyJ6LWE5rqQ5YiX6KGoIOWvvOWHuuWIsGpzb27ml7bnlKgg5ZSv5LiA5oCnXHJcbiAgICAgKi9cclxuICAgIGdldEpzb25EYXRhKCkge1xyXG4gICAgICAgIGxldCBhbGxMaXN0OiByZXNPYmpbXSxcclxuICAgICAgICAgICAganNvbkRhdGE6IHtcclxuICAgICAgICAgICAgICAgIGdyb3VwOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpc3Q6IHJlc09ialtdXHJcbiAgICAgICAgICAgICAgICB9W10sXHJcbiAgICAgICAgICAgICAgICBhbGw6IHJlc09ialtdXHJcbiAgICAgICAgICAgIH09IHtcclxuICAgICAgICAgICAgICAgIGFsbDpbXSxcclxuICAgICAgICAgICAgICAgIGdyb3VwOltdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3QuZm9yRWFjaCgodiwgaykgPT4ge1xyXG4gICAgICAgICAgICBqc29uRGF0YS5ncm91cC5wdXNoKHtuYW1lOnRoaXMuZ3JvdXBOYW1lTGlzdC5nZXQoaykhLCBsaXN0OltdfSlcclxuICAgICAgICAgICAgdi5mb3JFYWNoKChtdikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuYWxsSXRlbUxpc3QuaGFzKG12KSl7XHJcbiAgICAgICAgICAgICAgICAgICAganNvbkRhdGEuYWxsLnB1c2gobXYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hbGxJdGVtTGlzdC5hZGQobXYpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5hbGxJdGVtTGlzdClcclxuICAgICAgICBjb25zb2xlLmxvZyhqc29uRGF0YSlcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUT0RPIOmcgOimgeS8mOWMlue8k+WtmOeahOaVsOaNrue7k+aehO+8jOS4jeeEtuS4jeaWueS+v+WvvOaIkOS4umpzb25cclxuICAgICAqIOe7k+aenOWcqHJlc09iaueahOWfuuacrOS4iua3u+WKoOS4iuWIhue7hGlkIOeEtuWQjuaVtOS9k+ebtOaOpeWvvOWFpeS4umpzb25cclxuICAgICAqL1xyXG59IiwiaW1wb3J0IERhdGFNYW5hZ2VyIGZyb20gXCIuL0RhdGFNYW5hZ2VyXCI7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xyXG5cclxuLyoqXHJcbiAqIOeVjOmdoumAu+i+kVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlld0xvZ2ljIHtcclxuXHJcbiAgICAvKiog5LiK5Lyg5oyJ6ZKuICovXHJcbiAgICBwcml2YXRlIGJyb3dzZUJ0bjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIC8qKiDnu4TlkI3np7DliJfooajoioLngrkgKi9cclxuICAgIHByaXZhdGUgZ3JvdXBMaXN0Tm9kZTogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcclxuICAgIC8qKiDmt7vliqDnu4TmjInpkq4gKi9cclxuICAgIHByaXZhdGUgYWRkR3JvdXBCdG46IEpRdWVyeTxIVE1MRWxlbWVudD47XHJcbiAgICAvKiog5oiR55qE5pWw5o2u5YiX6KGoICovXHJcbiAgICBwcml2YXRlIG15TGlzdE5vZGU6IEpRdWVyeTxIVE1MRWxlbWVudD47XHJcbiAgICAvKiog5qC555uu5b2V5YiX6KGo6IqC54K5ICovXHJcbiAgICBwcml2YXRlIHJvb3RMaXN0OiBKUXVlcnk8SFRNTEVsZW1lbnQ+O1xyXG5cclxuXHJcbiAgICAvKiog5pWw5o2u566h55CGICovXHJcbiAgICBwcml2YXRlIGRhdGFNYW5hZ2VyOiBEYXRhTWFuYWdlcjtcclxuICAgIC8qKiDlvZPliY3pgInmi6nnmoTliIbnu4RpZCAqL1xyXG4gICAgcHJpdmF0ZSBjdXJHcm91cElkOiBudW1iZXI7XHJcbiAgICAvKiog6buY6K6k57uEICovXHJcbiAgICBwcml2YXRlIGluaXRHcm91cDogc3RyaW5nO1xyXG4gICAgLyoqIGhpbnTlrprml7blmaggKi9cclxuICAgIHByaXZhdGUgaGludFRpbWU6IGFueTtcclxuICAgIC8qKiDnu4TpgJLlop5pZCAqL1xyXG4gICAgcHJpdmF0ZSBncm91cElkOiBudW1iZXI7XHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBJZCA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdEdyb3VwID0gJ2luaXQnO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyID0gbmV3IERhdGFNYW5hZ2VyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnJvd3NlQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Jyb3dzZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlID0gJCgnI2dyb3VwTGlzdE5vZGUnKTtcclxuICAgICAgICB0aGlzLmFkZEdyb3VwQnRuID0gJCgnI2FkZEdyb3VwQnRuJyk7XHJcbiAgICAgICAgdGhpcy5teUxpc3ROb2RlID0gJCgnI215TGlzdE5vZGUnKTtcclxuICAgICAgICB0aGlzLnJvb3RMaXN0ID0gJCgnI3Jvb3RMaXN0Jyk7XHJcblxyXG4gICAgICAgIC8v5re75Yqg5qC555uu5b2V6LWE5rqQ54K55Ye75LqL5Lu2XHJcbiAgICAgICAgdGhpcy5icm93c2VCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGU6IEV2ZW50KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmlsZTogYW55ID0gKHRoaXMuYnJvd3NlQnRuLmZpbGVzIGFzIEZpbGVMaXN0KS5pdGVtKDApIGFzIEZpbGU7XHJcbiAgICAgICAgICAgIGlmIChmaWxlLnR5cGUgPT09IFwiYXBwbGljYXRpb24vanNvblwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy/ojrflj5botYTmupDmoLnnm67lvZVcclxuICAgICAgICAgICAgICAgIGxldCBwYXRoOiBzdHJpbmcgPSBmaWxlLnBhdGg7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aEFycjogYW55W10gPSBwYXRoLnNwbGl0KCdcXFxcJyk7XHJcbiAgICAgICAgICAgICAgICBwYXRoQXJyLnNwbGljZShwYXRoQXJyLmxlbmd0aCAtIDIsIDIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJvb3RQYXRoOiBzdHJpbmcgPSBwYXRoQXJyLmpvaW4oJy8nKSArICcvYXNzZXRzL3Jlc291cmNlcydcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Um9vdFBhdGgocm9vdFBhdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8v6aqM6K+B5qC555uu5b2V5piv5ZCm5a2Y5ZyoXHJcbiAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhyb290UGF0aCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLnJvb3QgPSByb290UGF0aDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWREaXIocm9vdFBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1Jvb3RMaXN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8v5qOA5rWL5a+85YWl55qEanNvbuaWh+S7tuWGheWuuVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXNEYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGUucGF0aCkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzRGF0YS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzRGF0YSA9IEpTT04ucGFyc2UocmVzRGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdqc29u5paH5Lu25Li656m6Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkR3JvdXAodGhpcy5pbml0R3JvdXAsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydCgncm9vdCBwYXRoIGlzIGVycm9yIScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyb290UGF0aClcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdUaGUgZm9ybWF0IG11c3QgYmUgSlNPTiEnKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHRoaXMuc2V0Um9vdFBhdGgoZmlsZSlcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZmlsZSk7XHJcbiAgICAgICAgfSlcclxuXHJcblxyXG4gICAgICAgIC8v5re75Yqg57uEXHJcbiAgICAgICAgdGhpcy5hZGRHcm91cEJ0bi5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR3JvdXAoJ0dyb3VwTmFtZScgKyB0aGlzLmdyb3VwSWQsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUuZmluZCgnaW5wdXQnKS5mb2N1cygpO1xyXG4gICAgICAgIH0pXHJcblxyXG5cclxuICAgICAgICAvL+WIoOmZpOS4gOS4que7hFxyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5vbignY2xpY2snLCAnLmRlbGV0ZScsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IE51bWJlcihlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmdyb3VwTmFtZUxpc3QuZGVsZXRlKGlkKTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5ncm91cExpc3QuZGVsZXRlKGlkKTtcclxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudHMoJ2RkJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1ckdyb3VwSWQgPT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUuZmluZCgnZGQnKS5lcSgwKS5hZGRDbGFzcygnY3VyJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnY3VyJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdCeUdyb3VwSWRMaXN0KDEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93U2VsZWN0ZWQoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy8g57uE5ZCN56ew54K55Ye75LqL5Lu2XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLm9uKCdjbGljaycsICdkZCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmN1cnJlbnRUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5hZGRDbGFzcygnY3VyJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnY3VyJyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBOdW1iZXIoZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1ckdyb3VwSWQgIT09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3QnlHcm91cElkTGlzdChpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJHcm91cElkID0gaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93U2VsZWN0ZWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLy/kv67mlLnlkI3np7Dlj4zlh7vkuovku7ZcclxuICAgICAgICBsZXQgY3VyVmFsOiBhbnk7XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLm9uKCdkYmxjbGljaycsICcucmVwbGFjZUdyb3VwTmFtZScsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmN1cnJlbnRUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbnB1dCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5maW5kKCdpbnB1dCcpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQucHJvcCgnZGlzYWJsZWQnLCAnJyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgY3VyVmFsID0gaW5wdXQudmFsKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLm9uKCdmb2N1c291dCBibHVyJywgJ2lucHV0JywgKGUpID0+IHtcclxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgIC8vICQoZS5jdXJyZW50VGFyZ2V0KS5vZmYoKTtcclxuICAgICAgICAgICAgbGV0IHZhbDogYW55ID0gJChlLmN1cnJlbnRUYXJnZXQpLnZhbCgpO1xyXG4gICAgICAgICAgICBpZiAodmFsLm1hdGNoKC9eW0Etel0vKSAmJiAhdmFsLm1hdGNoKC9bXkEtejAtOVxcX10vKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJzEyMzEyMzLlj6/ku6XlvIDlp4snKVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS52YWwoY3VyVmFsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGludCgn5YaF5a655b+F6aG75Lul5a2X5q+N5byA5aS077yM6Zmk5LqGX+S4jeWPr+S7peacieWFtuWug+eJueauiuWtl+espiEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG5cclxuICAgICAgICAvL+agueebruW9leWIl+ihqOeCueWHu+S6i+S7tj09PuWPjOWHuyAg5re75Yqg5pWw5o2u5Yiw5LiL5YiXXHJcbiAgICAgICAgdGhpcy5yb290TGlzdC5vbignZGJsY2xpY2snLCAnZGQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5jdXJyZW50VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZERhdGFMaXN0KGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL+WIoOmZpOW3sue7j+e8k+WtmOaVsOaNriDmoLnnm67lvZXngrnlh7vkuovku7ZcclxuICAgICAgICB0aGlzLnJvb3RMaXN0Lm9uKCdjbGljaycsICcuZGVsZXRlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckl0ZW1CdElkKGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5teUxpc3ROb2RlLm9uKCdjbGljaycsICcuZGVsZXRlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckl0ZW1CdElkKGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8v6LWE5rqQ57G75Z6L5L+u5pS5XHJcbiAgICAgICAgdGhpcy5teUxpc3ROb2RlLm9uKCdjaGFuZ2UnLCAnc2VsZWN0JywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VyR3JvdXBJZCkgdGhpcy5kYXRhTWFuYWdlci5ncm91cExpc3QuZ2V0KHRoaXMuY3VyR3JvdXBJZCkhLmdldChlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpIS50eXBlID0gZS5jdXJyZW50VGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy/moLnmja7nm67lvZXnrZvpgIlcclxuICAgICAgICAkKCcjZGlyU2VsZWN0Jykub24oJ2NoYW5nZScsIChlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbCA9IGUuY3VycmVudFRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWwgPT09ICdBbGwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290TGlzdC5maW5kKCdkZCcpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3RMaXN0LmZpbmQoJ2RkJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290TGlzdC5maW5kKCcucGF0aCcpLmVhY2goKGUsIG0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJChtKS50ZXh0KCkuaW5kZXhPZih2YWwpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChtKS5wYXJlbnRzKCdkZCcpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy/kv53lrZhcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gODMgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaCgnTWFjJykgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7Ly9jdHJsK3NcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUpzb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5LiA5p2h5pWw5o2u5Yiw5pWw5o2u5YiX6KGoXHJcbiAgICAgKiBAcGFyYW0gaWQg6LWE5rqQaWRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhZGREYXRhTGlzdChpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5kcmF3SXRlbSh0aGlzLmRhdGFNYW5hZ2VyLmFkZEl0bWVCeUdyb3VwSWQoaWQsIHRoaXMuY3VyR3JvdXBJZCkhKTtcclxuICAgICAgICB0aGlzLnNob3dTZWxlY3RlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5riy5p+T5LiA5p2h5pWw5o2u5Yiw5YmN56uvXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZHJhd0l0ZW0ob2JqOiByZXNPYmopIHtcclxuICAgICAgICBpZiAoIW9iaikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v57uR5a6a57G75Z6LXHJcbiAgICAgICAgbGV0IHR5cGVTdHI6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIHRoaXMuZGF0YU1hbmFnZXIuYWxsVHlwZS5mb3JFYWNoKCh2KSA9PiB7XHJcbiAgICAgICAgICAgIHR5cGVTdHIgKz0gYDxvcHRpb24gJHtvYmoudHlwZSA9PT0gdiA/ICdzZWxlY3RlZCcgOiAnJ30+JHt2fTwvb3B0aW9uPmA7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubXlMaXN0Tm9kZS5wcmVwZW5kKGA8ZGQgZGF0YS1pZD0ke29iai5wYXRofT5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZzAgcmVzTmFtZVwiPiR7b2JqLnJlc05hbWV9PC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImcwIHJlc1R5cGUgc2VsZWN0IGlzLXNtYWxsXCI+XHJcbiAgICAgICAgICAgIDxzZWxlY3QgZGF0YS1pZD0ke29iai5wYXRofT4ke3R5cGVTdHJ9PC9zZWxlY3Q+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImcxXCI+PGEgZGF0YS1pZD0ke29iai5wYXRofSBjbGFzcz1cImRlbGV0ZSBpcy1zbWFsbFwiPjwvYT4ke29iai5wYXRofTwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnMCBhbm5vdGF0aW9uXCI+XHJcbiAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImlucHV0IGlzLXNtYWxsXCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIiR7b2JqLm5vdGUgPyBvYmoubm90ZSA6ICcnfVwiIHBsYWNlaG9sZGVyPVwi5rOo6YeKXCI+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L2RkPmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5YiG57uEXHJcbiAgICAgKiBAcGFyYW0gbmFtZSDnu4TlkI3lrZdcclxuICAgICAqIEBwYXJhbSB0eXBlIOaYr+WQpuWPr+S/ruaUueWSjOWIoOmZpCB0cnVlIOWPr+S/ruaUuSBmYWxzZSDkuI3lj6/kv67mlLlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhZGRHcm91cChuYW1lOiBzdHJpbmcsIHR5cGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5kYXRhTWFuYWdlci5nZXRHcm91cE5hbWUobmFtZSkpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ+WIhue7hOWQjeensOW3sue7j+WtmOWcqCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN1ckdyb3VwSWQgPSB0aGlzLmRhdGFNYW5hZ2VyLmFkZEdyb3VwKG5hbWUpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUuZmluZCgnZGQnKS5yZW1vdmVDbGFzcygnY3VyJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5hcHBlbmQoYDxkZCBkYXRhLWlkPSR7dGhpcy5jdXJHcm91cElkfSBjbGFzcz1cInRhZyBnMSBpcy13aGl0ZSBjdXIgJHt0eXBlID8gJ3JlcGxhY2VHcm91cE5hbWUnIDogJyd9XCI+XHJcbiAgICAgICAgPGlucHV0ICBkaXNhYmxlZCBjbGFzcz1cImlucHV0IGlzLXNtYWxsIGdyb3VwTmFtZVwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJHcm91cCBuYW1lXCIgdmFsdWU9XCIke25hbWV9XCI+XHJcbiAgICAgICAgJHt0eXBlID8gJyA8YnV0dG9uIGRhdGEtaWQ9JyArIHRoaXMuY3VyR3JvdXBJZCArICcgY2xhc3M9XCJkZWxldGUgaXMtc21hbGxcIj48L2J1dHRvbj4nIDogJyd9XHJcbiAgICA8L2RkPmApO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdCeUdyb3VwSWRMaXN0KHRoaXMuY3VyR3JvdXBJZCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd1NlbGVjdGVkKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cElkKys7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja7nu4TmlbDmja7muLLmn5NcclxuICAgICAqIEBwYXJhbSBpZCDnu4RpZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRyYXdCeUdyb3VwSWRMaXN0KGlkOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbGlzdCA9IHRoaXMuZGF0YU1hbmFnZXIuZ3JvdXBMaXN0LmdldChpZCk7XHJcbiAgICAgICAgaWYgKGxpc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5teUxpc3ROb2RlLmh0bWwoJycpO1xyXG4gICAgICAgICAgICBsaXN0LmZvckVhY2goKHZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SXRlbSh2YWwpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsaXN0KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5riF6Zmk5YiX6KGo5Yid5aeL5YyW562JXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5yb290UmVzTGlzdC5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5odG1sKCcnKTtcclxuICAgICAgICB0aGlzLm15TGlzdE5vZGUuaHRtbCgnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7moLnnm67lvZXot6/lvoRcclxuICAgICAqIEBwYXJhbSBwYXRoIOi3r+W+hFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNldFJvb3RQYXRoKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGxldCByb290Tm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyb290Tm9kZScpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgICAgIHJvb3ROb2RlLmlubmVyVGV4dCA9IHBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuLLmn5PmoLnmlofku7bmiYDmnInotYTmupBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcmF3Um9vdExpc3QoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhTWFuYWdlci5yb290UmVzTGlzdClcclxuICAgICAgICBsZXQgaHRtbCA9ICcnLFxyXG4gICAgICAgICAgICBsaXN0ID0gdGhpcy5kYXRhTWFuYWdlci5yb290UmVzTGlzdDtcclxuXHJcbiAgICAgICAgLy90aGlzLmRhdGFNYW5hZ2VyLnJvb3QgKyBcclxuICAgICAgICBsaXN0LmZvckVhY2goKHZhbCwga2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gYDxkZCBkYXRhLWlkPSR7a2V5fSBkYXRhLXR5cGU9JHt2YWwudHlwZX0gdGl0bGU9JHt2YWwubmFtZX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZzAgcmVzTmFtZVwiPiR7dmFsLm5hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZzAgcmVzVHlwZVwiPiR7dmFsLnR5cGV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZzFcIj48YSBkYXRhLWlkPSR7a2V5fSBjbGFzcz1cImRlbGV0ZSByb290RGVsIGlzLXNtYWxsXCI+PC9hPjxzcGFuIGNsYXNzPVwicGF0aFwiPiR7dmFsLnBhdGh9PC9zcGFuPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImcwIHNpemVfbWVcIj4ke3RoaXMuY29udmVydEZpbGVTaXplKHZhbC5zaXplKX08L2Rpdj5cclxuICAgICAgICAgICAgPC9kZD5gO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMucm9vdExpc3QuaHRtbChodG1sKTtcclxuXHJcbiAgICAgICAgLy/muLLmn5Pnm67lvZVcclxuICAgICAgICAkKCcjZGlyU2VsZWN0JykuaHRtbCgnJyk7XHJcbiAgICAgICAgaHRtbCA9ICc8b3B0aW9uIHNlbGVjdGVkPkFsbDwvb3B0aW9uPic7XHJcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5kaXJOYW1lcy5mb3JFYWNoKCh2YWwpID0+IHtcclxuICAgICAgICAgICAgaHRtbCArPSBgPG9wdGlvbj4ke3ZhbH08L29wdGlvbj5gO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgJCgnI2RpclNlbGVjdCcpLmh0bWwoaHRtbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpgJrov4fnu53lr7nlnLDlnYBpZOWIoOmZpFxyXG4gICAgICogQHBhcmFtIGlkIOi1hOa6kGlkXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2xlYXJJdGVtQnRJZChpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5kZWxldGVJdGVtQnlHcm91cElkKGlkLCB0aGlzLmN1ckdyb3VwSWQpO1xyXG4gICAgICAgIHRoaXMuc2hvd1NlbGVjdGVkKCk7XHJcbiAgICAgICAgdGhpcy5kcmF3QnlHcm91cElkTGlzdCh0aGlzLmN1ckdyb3VwSWQpOy8v6ZyA6KaB5LyY5YyWXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDor7vlj5bnm67lvZXmiYDmnInotYTmupBcclxuICAgICAqIEBwYXJhbSBwYXRoIOi3r+W+hFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlYWREaXIocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZpbGVzID0gZnMucmVhZGRpclN5bmMocGF0aCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHggPSBmaWxlcy5sZW5ndGggLSAxOyB4ID4gLTE7IHgtLSkge1xyXG4gICAgICAgICAgICBpZiAoZmlsZXNbeF0uaW5kZXhPZignLm1ldGEnKSA9PT0gLTEpIHsvL+aOkumZpC5tYXRl5paH5Lu2XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RhdHMgPSBmcy5zdGF0U3luYyhwYXRoICsgJy8nICsgZmlsZXNbeF0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHsvL+ebruW9lVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZERpcihwYXRoICsgJy8nICsgZmlsZXNbeF0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdGF0cy5pc0ZpbGUoKSkgey8v5piv5paH5Lu2XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBmaWxlc1t4XS5yZXBsYWNlKCdfJywgJycpLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5hbGxUeXBlLmFkZChuYW1lWzFdKTsvL+mHjeWkjeS4gOebtOa3u+WKoOexu+WeiyDkv53or4HnsbvlnovllK/kuIDmgKdcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG15UGF0aCA9IChwYXRoICsgJy8nICsgZmlsZXNbeF0pLnJlcGxhY2UodGhpcy5kYXRhTWFuYWdlci5yb290ICsgJycsICcnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpciA9IG15UGF0aC5zcGxpdCgnLycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHggPSAwLCBsID0gZGlyLmxlbmd0aCAtIDE7IHggPCBsOyB4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGlyICs9IGRpclt4XSArICcvJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5kaXJOYW1lcy5hZGQobmV3RGlyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5yb290UmVzTGlzdC5zZXQobXlQYXRoLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUuam9pbignXycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBteVBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IG5hbWVbMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHN0YXRzLnNpemVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqIOaWh+S7tuWkp+Wwj+WAvOi9rOaNoiAqL1xyXG4gICAgcHJpdmF0ZSBjb252ZXJ0RmlsZVNpemUoc2l6ZTogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBzaXplID0gc2l6ZSAvIDEwMDA7XHJcbiAgICAgICAgaWYgKHNpemUgPCAxMDI0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzaXplLnRvRml4ZWQoMikgKyAnS0InO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNpemUgPSBzaXplIC8gMTAwMDtcclxuICAgICAgICAgICAgcmV0dXJuIHNpemUudG9GaXhlZCgyKSArICdNQic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5o+Q56S6XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGludChzdHI6IHN0cmluZywgdGltZTogbnVtYmVyID0gMjAwMCkge1xyXG4gICAgICAgIGxldCBoaW50VmlldyA9ICQoJyNoaW50VmlldycpO1xyXG4gICAgICAgIGhpbnRWaWV3LnNob3coKTtcclxuICAgICAgICBoaW50Vmlldy50ZXh0KHN0cik7XHJcbiAgICAgICAgaWYgKHRoaXMuaGludFRpbWUpIGNsZWFyVGltZW91dCh0aGlzLmhpbnRUaW1lKTtcclxuICAgICAgICB0aGlzLmhpbnRUaW1lID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGhpbnRWaWV3LmZhZGVPdXQoMzAwKTtcclxuICAgICAgICB9LCB0aW1lKVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja7lt7Lnu4/pgInmi6nnmoTliJfooajvvIzlnKjmoLnnm67lvZXliJfooajkuK3mmL7npLrlh7rmnaVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzaG93U2VsZWN0ZWQoKSB7XHJcbiAgICAgICAgbGV0IGxpc3QgPSB0aGlzLnJvb3RMaXN0LmZpbmQoJ2RkJykgYXMgSlF1ZXJ5PEhUTUxFbGVtZW50PixcclxuICAgICAgICAgICAgZ3JvdXAgPSB0aGlzLmRhdGFNYW5hZ2VyLmdyb3VwTGlzdC5nZXQodGhpcy5jdXJHcm91cElkKSEsXHJcbiAgICAgICAgICAgIGwgPSBsaXN0Lmxlbmd0aCxcclxuICAgICAgICAgICAgZGQ6IEpRdWVyeTxIVE1MRWxlbWVudD47XHJcblxyXG4gICAgICAgIGxpc3QucmVtb3ZlQ2xhc3MoJ2N1cicpO1xyXG4gICAgICAgIGlmIChncm91cCkge1xyXG4gICAgICAgICAgICBncm91cC5mb3JFYWNoKCh2LCBrKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGw7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRkID0gbGlzdC5lcSh4KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRkLmF0dHIoJ2RhdGEtaWQnKSA9PT0gaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGQuYWRkQ2xhc3MoJ2N1cicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5L+d5a2Y5Li6anNvblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNhdmVKc29uKCkge1xyXG4gICAgICAgIHRoaXMuaGludCgn5L+d5a2Y5oiQ5YqfJywgNjAwKTtcclxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmdldEpzb25EYXRhKCk7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IFZpZXdMb2dpYyBmcm9tIFwiLi9WaWV3TG9naWNcIjtcclxuLyoqXHJcbiAqIOa4suafk+mAu+i+keWFpeWPo1xyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFpbiB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBuZXcgVmlld0xvZ2ljKCk7XHJcbiAgICB9XHJcbn1cclxuLy8gbmV3IE1haW4oKSJdLCJuYW1lcyI6WyJmcy5leGlzdHNTeW5jIiwiZnMucmVhZEZpbGVTeW5jIiwiZnMucmVhZGRpclN5bmMiLCJmcy5zdGF0U3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUE7OztBQUtBLFVBQXFCLFdBQVc7UUFvQjVCO1lBQ0ksSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7U0FDaEM7Ozs7OztRQU9ELFFBQVEsQ0FBQyxJQUFZO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ3ZCOzs7OztRQU1ELFVBQVUsQ0FBQyxFQUFVO1lBQ2pCLElBQUksS0FBSyxH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
