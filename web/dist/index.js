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
            this.allItemList = new Set();
        }
        /**
         * 清除所有缓存数据
         */
        clearAll() {
            this.groupId = 0;
            this.rootResList.clear();
            this.groupList.clear();
            this.allType.clear();
            this.groupNameList.clear();
            this.allItemList.clear();
        }
        /**
         * 添加一组
         * @param name 组名称
         * @param items 对应组列表数据
         * @returns 返回生成的组id
         */
        addGroup(name, items) {
            this.groupId++;
            this.groupList.set(this.groupId, new Map());
            this.groupNameList.set(this.groupId, name);
            if (items) {
                for (let x = 0, l = items.length; x < l; x++) {
                    this.addItmeByGroupId(null, this.groupId, items[x]);
                }
            }
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
         * @param resObj 要存的数据
         */
        addItmeByGroupId(id, groupId, resObj) {
            let obj = this.groupList.get(groupId);
            if (id) {
                let rootData = this.rootResList.get(id); //获取根目录数据
                if (rootData) {
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
            }
            else if (resObj) {
                if (obj)
                    obj.set(resObj.path, resObj);
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
         * 修改某条数据的注释
         * @param id 单条数据id
         * @param groupId 组id
         * @param value 注释内容
         */
        replaceNote(id, groupId, value) {
            let items = this.groupList.get(groupId); //获取根目录数据
            if (items) {
                items.get(id).note = value;
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
                    items: []
                };
                let resObjInAll;
                v.forEach((mv) => {
                    gorup.items.push(mv);
                    resObjInAll = {
                        resName: mv.resName,
                        type: mv.type,
                        path: mv.path
                    };
                    if (!this.allItemList.has(resObjInAll)) {
                        jsonData.all.push(resObjInAll);
                    }
                    this.allItemList.add(resObjInAll);
                });
                jsonData.groups.push(gorup);
            });
            console.log(jsonData);
            return jsonData;
        }
    }
    //# sourceMappingURL=DataManager.js.map

    /**
     * 界面逻辑
     */
    class ViewLogic {
        constructor() {
            this.initGroup = 'init';
            this.groupId = 1;
            this.dataManager = new DataManager();
            this.browseBtn = document.querySelector('#browse');
            this.groupListNode = $('#groupListNode');
            this.addGroupBtn = $('#addGroupBtn');
            this.myListNode = $('#myListNode');
            this.rootList = $('#rootList');
            this.previewImg = $('#previewImg');
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
                    this.jsonFilePath = file.path;
                    //验证根目录是否存在
                    if (fs.existsSync(rootPath)) {
                        this.dataManager.clearAll();
                        this.clear();
                        this.dataManager.root = rootPath;
                        this.readDir(rootPath);
                        this.drawRootList();
                        //检测导入的json文件内容
                        let resData = fs.readFileSync(file.path).toString();
                        if (resData.length) {
                            resData = JSON.parse(resData);
                            this.drawByJson(resData);
                            console.log('渲染JSON文件里面数据');
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
                this.browseBtn.value = '';
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
            // 组名称点击事件 切换组列表
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
            this.groupListNode.on('blur', 'input', (e) => {
                $(e.currentTarget).attr('disabled', 'disabled');
                // $(e.currentTarget).off();
                let val = $(e.currentTarget).val();
                if (val.match(/^[A-z]/) && !val.match(/[^A-z0-9\_]/)) {
                    console.log('组名称id:' + $(e.currentTarget).parent('dd').attr('data-id') + '=>' + val);
                    this.dataManager.replaceGroupName(Number($(e.currentTarget).parent('dd').attr('data-id')), val);
                }
                else {
                    $(e.currentTarget).val(curVal);
                    this.hint('内容必须以字母开头，除了_不可以有其它特殊字符!');
                }
            });
            //根目录列表点击事件==>双击  添加数据到下列
            this.rootList.on('dblclick', 'dd', (e) => {
                if (e.currentTarget) {
                    //向列表中添加一条数据
                    this.addDataList(e.currentTarget.getAttribute('data-id'));
                }
            });
            //图片预览
            this.rootList.on('click', 'dd', (e) => {
                let id = e.currentTarget.getAttribute('data-id');
                if (id.indexOf('.png') > -1 || id.indexOf('.jpg') > -1 || id.indexOf('.jpeg') > -1) {
                    this.previewImg[0].src = this.dataManager.root + id;
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
            //添加注释功能
            this.myListNode.on('blur', 'input', (e) => {
                let id = e.currentTarget.getAttribute('data-id');
                this.dataManager.replaceNote(id, this.curGroupId, e.currentTarget.value);
            });
        }
        /**
         * 通过json文件渲染
         * @param data json文件数据
         */
        drawByJson(data) {
            console.log(data);
            let groups = data['groups'], l = groups.length, x = 0;
            for (; x < l; x++) {
                this.addGroup(groups[x].name, groups[x].name !== "init", groups[x].items);
            }
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
            <input data-id=${obj.path} class="input is-small" type="text" value="${obj.note ? obj.note : ''}" placeholder="注释">
        </div>
    </dd>`);
        }
        /**
         * 添加分组
         * @param name 组名字
         * @param type 是否可修改和删除 true 可修改 false 不可修改
         */
        addGroup(name, type, items) {
            if (this.dataManager.getGroupName(name)) {
                alert('分组名称已经存在');
                return;
            }
            this.curGroupId = this.dataManager.addGroup(name, items);
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
            let data = this.dataManager.getJsonData();
            fs.writeFileSync(this.jsonFilePath, JSON.stringify(data));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9EYXRhTWFuYWdlci50cyIsIi4uL3NyYy9WaWV3TG9naWMudHMiLCIuLi9zcmMvTWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICog5pWw5o2u566h55CG5ZmoXHJcbiAqL1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFNYW5hZ2VyIHtcclxuXHJcbiAgICAvKirmoLnnm67lvZUgKi9cclxuICAgIHJvb3Q6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIC8qKiDmiYDmnInnmoTnsbvlnosgKi9cclxuICAgIGFsbFR5cGU6IFNldDxzdHJpbmc+O1xyXG4gICAgLyoqIOe7hOaVsOaNruWIl+ihqCAqL1xyXG4gICAgZ3JvdXBMaXN0OiBNYXA8bnVtYmVyLCBNYXA8c3RyaW5nLCByZXNPYmo+PjtcclxuICAgIC8qKiDnu4TlkI3np7DliJfooaggKi9cclxuICAgIGdyb3VwTmFtZUxpc3Q6IE1hcDxudW1iZXIsIHN0cmluZz47XHJcbiAgICAvKiog6YCS5aKe55qE57uEaWQgKi9cclxuICAgIHByaXZhdGUgZ3JvdXBJZDogbnVtYmVyO1xyXG4gICAgLyoqIOe8k+WtmOaVsOaNruWIl+ihqCA9PiDmiYDmnInnu4TnmoTmlbDmja7lkIggPT4g6L+Z6YeM6LKM5Ly85Y+v5Lul5LyY5YyW5LiL5pWw5o2u57uT5p6EICovXHJcbiAgICBhbGxJdGVtTGlzdDogU2V0PHJlc09iaj47XHJcblxyXG4gICAgLyoqIOagueebruW9leaVsOaNruWIl+ihqCAqL1xyXG4gICAgcm9vdFJlc0xpc3Q6IE1hcDxzdHJpbmcsIHJvb3RMaXN0T2JqPjtcclxuICAgIC8qKiDmoLnnm67lvZXkuIvmiYDmnInotYTmupDnm67lvZXlkI3np7AgKi9cclxuICAgIGRpck5hbWVzOiBTZXQ8c3RyaW5nPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmdyb3VwSWQgPSAwO1xyXG4gICAgICAgIHRoaXMucm9vdFJlc0xpc3QgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3QgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5hbGxUeXBlID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLmRpck5hbWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMuYWxsSXRlbUxpc3QgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgdGhpcy5hbGxJdGVtTGlzdCA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa4hemZpOaJgOaciee8k+WtmOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBjbGVhckFsbCgpIHtcclxuICAgICAgICB0aGlzLmdyb3VwSWQgPSAwO1xyXG4gICAgICAgIHRoaXMucm9vdFJlc0xpc3QuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdC5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuYWxsVHlwZS5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuYWxsSXRlbUxpc3QuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOS4gOe7hFxyXG4gICAgICogQHBhcmFtIG5hbWUg57uE5ZCN56ewXHJcbiAgICAgKiBAcGFyYW0gaXRlbXMg5a+55bqU57uE5YiX6KGo5pWw5o2uXHJcbiAgICAgKiBAcmV0dXJucyDov5Tlm57nlJ/miJDnmoTnu4RpZFxyXG4gICAgICovXHJcbiAgICBhZGRHcm91cChuYW1lOiBzdHJpbmcsIGl0ZW1zPzogcmVzT2JqW10pOiBudW1iZXIge1xyXG4gICAgICAgIHRoaXMuZ3JvdXBJZCsrO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0LnNldCh0aGlzLmdyb3VwSWQsIG5ldyBNYXAoKSk7XHJcbiAgICAgICAgdGhpcy5ncm91cE5hbWVMaXN0LnNldCh0aGlzLmdyb3VwSWQsIG5hbWUpO1xyXG5cclxuICAgICAgICBpZiAoaXRlbXMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDAsIGwgPSBpdGVtcy5sZW5ndGg7IHggPCBsOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkSXRtZUJ5R3JvdXBJZChudWxsLCB0aGlzLmdyb3VwSWQsIGl0ZW1zW3hdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBJZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIoOmZpOS4gOe7hFxyXG4gICAgICogQHBhcmFtIG5hbWUg57uE5ZCN56ewXHJcbiAgICAgKi9cclxuICAgIGNsZWFyR3JvdXAoaWQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBncm91cCA9IHRoaXMuZ3JvdXBMaXN0LmdldChpZCkgYXMgTWFwPHN0cmluZywgcmVzT2JqPjtcclxuXHJcbiAgICAgICAgaWYgKCFncm91cCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAoZ3JvdXAuc2l6ZSkgey8v5aaC5p6c5pyJ5pWw5o2u5piv5ZCm5Yig6ZmkXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBMaXN0LmRlbGV0ZShpZCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5kZWxldGUoaWQpO1xyXG4gICAgICAgIH0gZWxzZSB7Ly/nm7TmjqXliKDpmaRcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZCR5p+Q57uE6YeM5re75Yqg5LiA5p2h5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gaWQg5qC555uu5b2V5YaF55qEaWRcclxuICAgICAqIEBwYXJhbSBncm91cElkIOe7hGlkXHJcbiAgICAgKiBAcGFyYW0gcmVzT2JqIOimgeWtmOeahOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBhZGRJdG1lQnlHcm91cElkKGlkOiBzdHJpbmcgfCBudWxsLCBncm91cElkOiBudW1iZXIsIHJlc09iaj86IHJlc09iaik6IHJlc09iaiB8IG51bGwge1xyXG4gICAgICAgIGxldCBvYmogPSB0aGlzLmdyb3VwTGlzdC5nZXQoZ3JvdXBJZCk7XHJcbiAgICAgICAgaWYgKGlkKSB7XHJcbiAgICAgICAgICAgIGxldCByb290RGF0YSA9IHRoaXMucm9vdFJlc0xpc3QuZ2V0KGlkKTsvL+iOt+WPluagueebruW9leaVsOaNrlxyXG4gICAgICAgICAgICBpZiAocm9vdERhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChvYmogJiYgIW9iai5nZXQoaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc09iajogcmVzT2JqID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNOYW1lOiByb290RGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiByb290RGF0YS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiByb290RGF0YS5wYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBvYmouc2V0KGlkLCByZXNPYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNPYmo7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZXNPYmopIHtcclxuICAgICAgICAgICAgaWYgKG9iaikgb2JqLnNldChyZXNPYmoucGF0aCwgcmVzT2JqKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LuO5p+Q57uE5Lit5Yig6Zmk5LiA5p2h5pWw5o2uXHJcbiAgICAgKiBAcGFyYW0gaWQg5qC555uu5b2V5YaF55qEaWRcclxuICAgICAqIEBwYXJhbSBncm91cElkIOe7hGlkXHJcbiAgICAgKi9cclxuICAgIGRlbGV0ZUl0ZW1CeUdyb3VwSWQoaWQ6IHN0cmluZywgZ3JvdXBJZDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHJvb3REYXRhID0gdGhpcy5ncm91cExpc3QuZ2V0KGdyb3VwSWQpITsvL+iOt+WPluagueebruW9leaVsOaNrlxyXG4gICAgICAgIGlmIChyb290RGF0YSkge1xyXG4gICAgICAgICAgICByb290RGF0YS5kZWxldGUoaWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS/ruaUueafkOadoeaVsOaNrueahOazqOmHilxyXG4gICAgICogQHBhcmFtIGlkIOWNleadoeaVsOaNrmlkXHJcbiAgICAgKiBAcGFyYW0gZ3JvdXBJZCDnu4RpZFxyXG4gICAgICogQHBhcmFtIHZhbHVlIOazqOmHiuWGheWuuVxyXG4gICAgICovXHJcbiAgICByZXBsYWNlTm90ZShpZDogc3RyaW5nLCBncm91cElkOiBudW1iZXIsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgaXRlbXMgPSB0aGlzLmdyb3VwTGlzdC5nZXQoZ3JvdXBJZCkhOy8v6I635Y+W5qC555uu5b2V5pWw5o2uXHJcbiAgICAgICAgaWYgKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zLmdldChpZCkhLm5vdGUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkv67mlLnnu4TlkI3np7BcclxuICAgICAqL1xyXG4gICAgcmVwbGFjZUdyb3VwTmFtZShpZDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICBpZiAodGhpcy5ncm91cE5hbWVMaXN0LmdldChpZCkpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91cE5hbWVMaXN0LnNldChpZCwgbmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBuYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlue7hOWQjeensFxyXG4gICAgICovXHJcbiAgICBnZXRHcm91cE5hbWUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IG46IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBOYW1lTGlzdC5mb3JFYWNoKCh2YWw6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gdmFsKSBuID0gdmFsO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIG47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmiYDmnInotYTmupDliJfooagg5a+85Ye65YiwanNvbuaXtueUqCDllK/kuIDmgKdcclxuICAgICAqL1xyXG4gICAgZ2V0SnNvbkRhdGEoKSB7XHJcbiAgICAgICAgbGV0IGpzb25EYXRhOiB7XHJcbiAgICAgICAgICAgIGdyb3VwczogeyBuYW1lOiBzdHJpbmcsIGl0ZW1zOiByZXNPYmpbXSB9W10sXHJcbiAgICAgICAgICAgIGFsbDogcmVzT2JqW11cclxuICAgICAgICB9ID0ge1xyXG4gICAgICAgICAgICBhbGw6IFtdLFxyXG4gICAgICAgICAgICBncm91cHM6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdC5mb3JFYWNoKCh2LCBrKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAvLyBqc29uRGF0YS5ncm91cC5wdXNoKHtuYW1lOnRoaXMuZ3JvdXBOYW1lTGlzdC5nZXQoaykhLCBsaXN0OltdfSlcclxuICAgICAgICAgICAgbGV0IGdvcnVwOiB7IG5hbWU6IHN0cmluZywgaXRlbXM6IHJlc09ialtdIH0gPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLmdyb3VwTmFtZUxpc3QuZ2V0KGspISxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCByZXNPYmpJbkFsbDogcmVzT2JqO1xyXG4gICAgICAgICAgICB2LmZvckVhY2goKG12KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBnb3J1cC5pdGVtcy5wdXNoKG12KTtcclxuICAgICAgICAgICAgICAgIHJlc09iakluQWxsID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc05hbWU6IG12LnJlc05hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogbXYudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBtdi5wYXRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuYWxsSXRlbUxpc3QuaGFzKHJlc09iakluQWxsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGpzb25EYXRhLmFsbC5wdXNoKHJlc09iakluQWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuYWxsSXRlbUxpc3QuYWRkKHJlc09iakluQWxsKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAganNvbkRhdGEuZ3JvdXBzLnB1c2goZ29ydXApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc29sZS5sb2coanNvbkRhdGEpXHJcbiAgICAgICAgcmV0dXJuIGpzb25EYXRhO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRPRE8g6ZyA6KaB5LyY5YyW57yT5a2Y55qE5pWw5o2u57uT5p6E77yM5LiN54S25LiN5pa55L6/5a+85oiQ5Li6anNvblxyXG4gICAgICog57uT5p6c5ZyocmVzT2Jq55qE5Z+65pys5LiK5re75Yqg5LiK5YiG57uEaWQg54S25ZCO5pW05L2T55u05o6l5a+85YWl5Li6anNvblxyXG4gICAgICovXHJcbn0iLCJpbXBvcnQgRGF0YU1hbmFnZXIgZnJvbSBcIi4vRGF0YU1hbmFnZXJcIjtcclxuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XHJcblxyXG4vKipcclxuICog55WM6Z2i6YC76L6RXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3TG9naWMge1xyXG5cclxuICAgIC8qKiDkuIrkvKDmjInpkq4gKi9cclxuICAgIHByaXZhdGUgYnJvd3NlQnRuOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgLyoqIOe7hOWQjeensOWIl+ihqOiKgueCuSAqL1xyXG4gICAgcHJpdmF0ZSBncm91cExpc3ROb2RlOiBKUXVlcnk8SFRNTEVsZW1lbnQ+O1xyXG4gICAgLyoqIOa3u+WKoOe7hOaMiemSriAqL1xyXG4gICAgcHJpdmF0ZSBhZGRHcm91cEJ0bjogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcclxuICAgIC8qKiDmiJHnmoTmlbDmja7liJfooaggKi9cclxuICAgIHByaXZhdGUgbXlMaXN0Tm9kZTogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcclxuICAgIC8qKiDmoLnnm67lvZXliJfooajoioLngrkgKi9cclxuICAgIHByaXZhdGUgcm9vdExpc3Q6IEpRdWVyeTxIVE1MRWxlbWVudD47XHJcbiAgICAvKiog5Zu+54mH6aKE6KeI6IqC54K5ICovXHJcbiAgICBwcml2YXRlIHByZXZpZXdJbWc6IEpRdWVyeTxIVE1MSW1hZ2VFbGVtZW50PjtcclxuXHJcblxyXG4gICAgLyoqIOaVsOaNrueuoeeQhiAqL1xyXG4gICAgcHJpdmF0ZSBkYXRhTWFuYWdlcjogRGF0YU1hbmFnZXI7XHJcbiAgICAvKiog5b2T5YmN6YCJ5oup55qE5YiG57uEaWQgKi9cclxuICAgIHByaXZhdGUgY3VyR3JvdXBJZDogbnVtYmVyO1xyXG4gICAgLyoqIOm7mOiupOe7hCAqL1xyXG4gICAgcHJpdmF0ZSBpbml0R3JvdXA6IHN0cmluZztcclxuICAgIC8qKiBoaW505a6a5pe25ZmoICovXHJcbiAgICBwcml2YXRlIGhpbnRUaW1lOiBhbnk7XHJcbiAgICAvKiog57uE6YCS5aKeaWQ9PueUqOS6juWQjeensOa3u+WKoCAqL1xyXG4gICAgcHJpdmF0ZSBncm91cElkOiBudW1iZXI7XHJcbiAgICAvKioganNvbuaWh+S7tui3r+W+hCAqL1xyXG4gICAgcHJpdmF0ZSBqc29uRmlsZVBhdGg6IHN0cmluZztcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdEdyb3VwID0gJ2luaXQnO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwSWQgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyID0gbmV3IERhdGFNYW5hZ2VyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnJvd3NlQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Jyb3dzZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlID0gJCgnI2dyb3VwTGlzdE5vZGUnKTtcclxuICAgICAgICB0aGlzLmFkZEdyb3VwQnRuID0gJCgnI2FkZEdyb3VwQnRuJyk7XHJcbiAgICAgICAgdGhpcy5teUxpc3ROb2RlID0gJCgnI215TGlzdE5vZGUnKTtcclxuICAgICAgICB0aGlzLnJvb3RMaXN0ID0gJCgnI3Jvb3RMaXN0Jyk7XHJcbiAgICAgICAgdGhpcy5wcmV2aWV3SW1nID0gJCgnI3ByZXZpZXdJbWcnKTtcclxuXHJcbiAgICAgICAgLy/mt7vliqDmoLnnm67lvZXotYTmupDngrnlh7vkuovku7ZcclxuICAgICAgICB0aGlzLmJyb3dzZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZTogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IGZpbGU6IGFueSA9ICh0aGlzLmJyb3dzZUJ0bi5maWxlcyBhcyBGaWxlTGlzdCkuaXRlbSgwKSBhcyBGaWxlO1xyXG4gICAgICAgICAgICBpZiAoZmlsZS50eXBlID09PSBcImFwcGxpY2F0aW9uL2pzb25cIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8v6I635Y+W6LWE5rqQ5qC555uu5b2VXHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aDogc3RyaW5nID0gZmlsZS5wYXRoO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGhBcnI6IGFueVtdID0gcGF0aC5zcGxpdCgnXFxcXCcpO1xyXG4gICAgICAgICAgICAgICAgcGF0aEFyci5zcGxpY2UocGF0aEFyci5sZW5ndGggLSAyLCAyKTtcclxuICAgICAgICAgICAgICAgIGxldCByb290UGF0aDogc3RyaW5nID0gcGF0aEFyci5qb2luKCcvJykgKyAnL2Fzc2V0cy9yZXNvdXJjZXMnXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFJvb3RQYXRoKHJvb3RQYXRoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuanNvbkZpbGVQYXRoID0gZmlsZS5wYXRoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8v6aqM6K+B5qC555uu5b2V5piv5ZCm5a2Y5ZyoXHJcbiAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhyb290UGF0aCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5jbGVhckFsbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5yb290ID0gcm9vdFBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkRGlyKHJvb3RQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdSb290TGlzdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL+ajgOa1i+WvvOWFpeeahGpzb27mlofku7blhoXlrrlcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlLnBhdGgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc0RhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc0RhdGEgPSBKU09OLnBhcnNlKHJlc0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdCeUpzb24ocmVzRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmuLLmn5NKU09O5paH5Lu26YeM6Z2i5pWw5o2uJylcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnanNvbuaWh+S7tuS4uuepuicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEdyb3VwKHRoaXMuaW5pdEdyb3VwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ3Jvb3QgcGF0aCBpcyBlcnJvciEnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocm9vdFBhdGgpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydCgnVGhlIGZvcm1hdCBtdXN0IGJlIEpTT04hJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmJyb3dzZUJ0bi52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnNldFJvb3RQYXRoKGZpbGUpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZpbGUpO1xyXG4gICAgICAgIH0pXHJcblxyXG5cclxuICAgICAgICAvL+a3u+WKoOe7hFxyXG4gICAgICAgIHRoaXMuYWRkR3JvdXBCdG4ub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEdyb3VwKCdHcm91cE5hbWUnICsgdGhpcy5ncm91cElkLCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLmZpbmQoJ2lucHV0JykuZm9jdXMoKTtcclxuICAgICAgICB9KVxyXG5cclxuXHJcbiAgICAgICAgLy/liKDpmaTkuIDkuKrnu4RcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUub24oJ2NsaWNrJywgJy5kZWxldGUnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBsZXQgaWQgPSBOdW1iZXIoZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5ncm91cE5hbWVMaXN0LmRlbGV0ZShpZCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIuZ3JvdXBMaXN0LmRlbGV0ZShpZCk7XHJcbiAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnRzKCdkZCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJHcm91cElkID09PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLmZpbmQoJ2RkJykuZXEoMCkuYWRkQ2xhc3MoJ2N1cicpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2N1cicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3QnlHcm91cElkTGlzdCgxKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1NlbGVjdGVkKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIOe7hOWQjeensOeCueWHu+S6i+S7tiDliIfmjaLnu4TliJfooahcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUub24oJ2NsaWNrJywgJ2RkJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKCdjdXInKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdjdXInKTtcclxuICAgICAgICAgICAgICAgIGxldCBpZCA9IE51bWJlcihlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VyR3JvdXBJZCAhPT0gaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdCeUdyb3VwSWRMaXN0KGlkKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1ckdyb3VwSWQgPSBpZDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dTZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAvL+S/ruaUueWQjeensOWPjOWHu+S6i+S7tlxyXG4gICAgICAgIGxldCBjdXJWYWw6IGFueTtcclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUub24oJ2RibGNsaWNrJywgJy5yZXBsYWNlR3JvdXBOYW1lJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlucHV0ID0gJChlLmN1cnJlbnRUYXJnZXQpLmZpbmQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKCdkaXNhYmxlZCcsICcnKTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICBjdXJWYWwgPSBpbnB1dC52YWwoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUub24oJ2JsdXInLCAnaW5wdXQnLCAoZSkgPT4gey8vZm9jdXNvdXQgXHJcbiAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAvLyAkKGUuY3VycmVudFRhcmdldCkub2ZmKCk7XHJcbiAgICAgICAgICAgIGxldCB2YWw6IGFueSA9ICQoZS5jdXJyZW50VGFyZ2V0KS52YWwoKTtcclxuICAgICAgICAgICAgaWYgKHZhbC5tYXRjaCgvXltBLXpdLykgJiYgIXZhbC5tYXRjaCgvW15BLXowLTlcXF9dLykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfnu4TlkI3np7BpZDonICsgJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgnZGQnKS5hdHRyKCdkYXRhLWlkJykgKyAnPT4nICsgdmFsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIucmVwbGFjZUdyb3VwTmFtZShOdW1iZXIoJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgnZGQnKS5hdHRyKCdkYXRhLWlkJykpLCB2YWwpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkudmFsKGN1clZhbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpbnQoJ+WGheWuueW/hemhu+S7peWtl+avjeW8gOWktO+8jOmZpOS6hl/kuI3lj6/ku6XmnInlhbblroPnibnmrorlrZfnrKYhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuXHJcbiAgICAgICAgLy/moLnnm67lvZXliJfooajngrnlh7vkuovku7Y9PT7lj4zlh7sgIOa3u+WKoOaVsOaNruWIsOS4i+WIl1xyXG4gICAgICAgIHRoaXMucm9vdExpc3Qub24oJ2RibGNsaWNrJywgJ2RkJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgLy/lkJHliJfooajkuK3mt7vliqDkuIDmnaHmlbDmja5cclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRGF0YUxpc3QoZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8v5Zu+54mH6aKE6KeIXHJcbiAgICAgICAgdGhpcy5yb290TGlzdC5vbignY2xpY2snLCAnZGQnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaWQgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmRleE9mKCcucG5nJykgPiAtMSB8fCBpZC5pbmRleE9mKCcuanBnJykgPiAtMSB8fCBpZC5pbmRleE9mKCcuanBlZycpID4gLTEgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZpZXdJbWdbMF0uc3JjID0gdGhpcy5kYXRhTWFuYWdlci5yb290ICsgaWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL+WIoOmZpOW3sue7j+e8k+WtmOaVsOaNriDmoLnnm67lvZXngrnlh7vkuovku7ZcclxuICAgICAgICB0aGlzLnJvb3RMaXN0Lm9uKCdjbGljaycsICcuZGVsZXRlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckl0ZW1CdElkKGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5teUxpc3ROb2RlLm9uKCdjbGljaycsICcuZGVsZXRlJywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckl0ZW1CdElkKGUuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8v6LWE5rqQ57G75Z6L5L+u5pS5XHJcbiAgICAgICAgdGhpcy5teUxpc3ROb2RlLm9uKCdjaGFuZ2UnLCAnc2VsZWN0JywgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VyR3JvdXBJZCkgdGhpcy5kYXRhTWFuYWdlci5ncm91cExpc3QuZ2V0KHRoaXMuY3VyR3JvdXBJZCkhLmdldChlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJykpIS50eXBlID0gZS5jdXJyZW50VGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy/moLnmja7nm67lvZXnrZvpgIlcclxuICAgICAgICAkKCcjZGlyU2VsZWN0Jykub24oJ2NoYW5nZScsIChlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbCA9IGUuY3VycmVudFRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWwgPT09ICdBbGwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290TGlzdC5maW5kKCdkZCcpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3RMaXN0LmZpbmQoJ2RkJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290TGlzdC5maW5kKCcucGF0aCcpLmVhY2goKGUsIG0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJChtKS50ZXh0KCkuaW5kZXhPZih2YWwpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChtKS5wYXJlbnRzKCdkZCcpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy/kv53lrZhcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gODMgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaCgnTWFjJykgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7Ly9jdHJsK3NcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUpzb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8v5re75Yqg5rOo6YeK5Yqf6IO9XHJcbiAgICAgICAgdGhpcy5teUxpc3ROb2RlLm9uKCdibHVyJywgJ2lucHV0JywgKGU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgaWQgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YU1hbmFnZXIucmVwbGFjZU5vdGUoaWQsIHRoaXMuY3VyR3JvdXBJZCwgZS5jdXJyZW50VGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmAmui/h2pzb27mlofku7bmuLLmn5NcclxuICAgICAqIEBwYXJhbSBkYXRhIGpzb27mlofku7bmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcmF3QnlKc29uKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgIGxldCBncm91cHMgPSBkYXRhWydncm91cHMnXSxcclxuICAgICAgICAgICAgbCA9IGdyb3Vwcy5sZW5ndGgsXHJcbiAgICAgICAgICAgIHggPSAwO1xyXG4gICAgICAgIGZvciAoOyB4IDwgbDsgeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR3JvdXAoZ3JvdXBzW3hdLm5hbWUsIGdyb3Vwc1t4XS5uYW1lICE9PSBcImluaXRcIiwgZ3JvdXBzW3hdLml0ZW1zKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDkuIDmnaHmlbDmja7liLDmlbDmja7liJfooahcclxuICAgICAqIEBwYXJhbSBpZCDotYTmupBpZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFkZERhdGFMaXN0KGlkOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmRyYXdJdGVtKHRoaXMuZGF0YU1hbmFnZXIuYWRkSXRtZUJ5R3JvdXBJZChpZCwgdGhpcy5jdXJHcm91cElkKSEpO1xyXG4gICAgICAgIHRoaXMuc2hvd1NlbGVjdGVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuLLmn5PkuIDmnaHmlbDmja7liLDliY3nq69cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcmF3SXRlbShvYmo6IHJlc09iaikge1xyXG4gICAgICAgIGlmICghb2JqKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy/nu5HlrprnsbvlnotcclxuICAgICAgICBsZXQgdHlwZVN0cjogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5hbGxUeXBlLmZvckVhY2goKHYpID0+IHtcclxuICAgICAgICAgICAgdHlwZVN0ciArPSBgPG9wdGlvbiAke29iai50eXBlID09PSB2ID8gJ3NlbGVjdGVkJyA6ICcnfT4ke3Z9PC9vcHRpb24+YDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm15TGlzdE5vZGUucHJlcGVuZChgPGRkIGRhdGEtaWQ9JHtvYmoucGF0aH0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImcwIHJlc05hbWVcIj4ke29iai5yZXNOYW1lfTwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnMCByZXNUeXBlIHNlbGVjdCBpcy1zbWFsbFwiPlxyXG4gICAgICAgICAgICA8c2VsZWN0IGRhdGEtaWQ9JHtvYmoucGF0aH0+JHt0eXBlU3RyfTwvc2VsZWN0PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJnMVwiPjxhIGRhdGEtaWQ9JHtvYmoucGF0aH0gY2xhc3M9XCJkZWxldGUgaXMtc21hbGxcIj48L2E+JHtvYmoucGF0aH08L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZzAgYW5ub3RhdGlvblwiPlxyXG4gICAgICAgICAgICA8aW5wdXQgZGF0YS1pZD0ke29iai5wYXRofSBjbGFzcz1cImlucHV0IGlzLXNtYWxsXCIgdHlwZT1cInRleHRcIiB2YWx1ZT1cIiR7b2JqLm5vdGUgPyBvYmoubm90ZSA6ICcnfVwiIHBsYWNlaG9sZGVyPVwi5rOo6YeKXCI+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L2RkPmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5YiG57uEXHJcbiAgICAgKiBAcGFyYW0gbmFtZSDnu4TlkI3lrZdcclxuICAgICAqIEBwYXJhbSB0eXBlIOaYr+WQpuWPr+S/ruaUueWSjOWIoOmZpCB0cnVlIOWPr+S/ruaUuSBmYWxzZSDkuI3lj6/kv67mlLlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhZGRHcm91cChuYW1lOiBzdHJpbmcsIHR5cGU6IGJvb2xlYW4sIGl0ZW1zPzogcmVzT2JqW10pIHtcclxuICAgICAgICBpZiAodGhpcy5kYXRhTWFuYWdlci5nZXRHcm91cE5hbWUobmFtZSkpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ+WIhue7hOWQjeensOW3sue7j+WtmOWcqCcpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN1ckdyb3VwSWQgPSB0aGlzLmRhdGFNYW5hZ2VyLmFkZEdyb3VwKG5hbWUsIGl0ZW1zKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cExpc3ROb2RlLmZpbmQoJ2RkJykucmVtb3ZlQ2xhc3MoJ2N1cicpO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwTGlzdE5vZGUuYXBwZW5kKGA8ZGQgZGF0YS1pZD0ke3RoaXMuY3VyR3JvdXBJZH0gY2xhc3M9XCJ0YWcgZzEgaXMtd2hpdGUgY3VyICR7dHlwZSA/ICdyZXBsYWNlR3JvdXBOYW1lJyA6ICcnfVwiPlxyXG4gICAgICAgIDxpbnB1dCAgZGlzYWJsZWQgY2xhc3M9XCJpbnB1dCBpcy1zbWFsbCBncm91cE5hbWVcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiR3JvdXAgbmFtZVwiIHZhbHVlPVwiJHtuYW1lfVwiPlxyXG4gICAgICAgICR7dHlwZSA/ICcgPGJ1dHRvbiBkYXRhLWlkPScgKyB0aGlzLmN1ckdyb3VwSWQgKyAnIGNsYXNzPVwiZGVsZXRlIGlzLXNtYWxsXCI+PC9idXR0b24+JyA6ICcnfVxyXG4gICAgPC9kZD5gKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3QnlHcm91cElkTGlzdCh0aGlzLmN1ckdyb3VwSWQpO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dTZWxlY3RlZCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBJZCsrO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u57uE5pWw5o2u5riy5p+TXHJcbiAgICAgKiBAcGFyYW0gaWQg57uEaWRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcmF3QnlHcm91cElkTGlzdChpZDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGxpc3QgPSB0aGlzLmRhdGFNYW5hZ2VyLmdyb3VwTGlzdC5nZXQoaWQpO1xyXG4gICAgICAgIGlmIChsaXN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubXlMaXN0Tm9kZS5odG1sKCcnKTtcclxuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKCh2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0l0ZW0odmFsKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5riF6Zmk5YiX6KGo5Yid5aeL5YyW562JXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhTWFuYWdlci5yb290UmVzTGlzdC5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBMaXN0Tm9kZS5odG1sKCcnKTtcclxuICAgICAgICB0aGlzLm15TGlzdE5vZGUuaHRtbCgnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7moLnnm67lvZXot6/lvoRcclxuICAgICAqIEBwYXJhbSBwYXRoIOi3r+W+hFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNldFJvb3RQYXRoKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGxldCByb290Tm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyb290Tm9kZScpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG4gICAgICAgIHJvb3ROb2RlLmlubmVyVGV4dCA9IHBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmuLLmn5PmoLnmlofku7bmiYDmnInotYTmupBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkcmF3Um9vdExpc3QoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhTWFuYWdlci5yb290UmVzTGlzdClcclxuICAgICAgICBsZXQgaHRtbCA9ICcnLFxyXG4gICAgICAgICAgICBsaXN0ID0gdGhpcy5kYXRhTWFuYWdlci5yb290UmVzTGlzdDtcclxuXHJcblxyXG4gICAgICAgIGxpc3QuZm9yRWFjaCgodmFsLCBrZXkpID0+IHtcclxuICAgICAgICAgICAgaHRtbCArPSBgPGRkIGRhdGEtaWQ9JHtrZXl9IGRhdGEtdHlwZT0ke3ZhbC50eXBlfSB0aXRsZT0ke3ZhbC5uYW1lfT5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnMCByZXNOYW1lXCI+JHt2YWwubmFtZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnMCByZXNUeXBlXCI+JHt2YWwudHlwZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJnMVwiPjxhIGRhdGEtaWQ9JHtrZXl9IGNsYXNzPVwiZGVsZXRlIHJvb3REZWwgaXMtc21hbGxcIj48L2E+PHNwYW4gY2xhc3M9XCJwYXRoXCI+JHt2YWwucGF0aH08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZzAgc2l6ZV9tZVwiPiR7dGhpcy5jb252ZXJ0RmlsZVNpemUodmFsLnNpemUpfTwvZGl2PlxyXG4gICAgICAgICAgICA8L2RkPmA7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy5yb290TGlzdC5odG1sKGh0bWwpO1xyXG5cclxuICAgICAgICAvL+a4suafk+ebruW9lVxyXG4gICAgICAgICQoJyNkaXJTZWxlY3QnKS5odG1sKCcnKTtcclxuICAgICAgICBodG1sID0gJzxvcHRpb24gc2VsZWN0ZWQ+QWxsPC9vcHRpb24+JztcclxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmRpck5hbWVzLmZvckVhY2goKHZhbCkgPT4ge1xyXG4gICAgICAgICAgICBodG1sICs9IGA8b3B0aW9uPiR7dmFsfTwvb3B0aW9uPmA7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAkKCcjZGlyU2VsZWN0JykuaHRtbChodG1sKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmAmui/h+e7neWvueWcsOWdgGlk5Yig6ZmkXHJcbiAgICAgKiBAcGFyYW0gaWQg6LWE5rqQaWRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjbGVhckl0ZW1CdElkKGlkOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmRlbGV0ZUl0ZW1CeUdyb3VwSWQoaWQsIHRoaXMuY3VyR3JvdXBJZCk7XHJcbiAgICAgICAgdGhpcy5zaG93U2VsZWN0ZWQoKTtcclxuICAgICAgICB0aGlzLmRyYXdCeUdyb3VwSWRMaXN0KHRoaXMuY3VyR3JvdXBJZCk7Ly/pnIDopoHkvJjljJZcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOivu+WPluebruW9leaJgOaciei1hOa6kFxyXG4gICAgICogQHBhcmFtIHBhdGgg6Lev5b6EXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVhZERpcihwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIXBhdGgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwYXRoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeCA9IGZpbGVzLmxlbmd0aCAtIDE7IHggPiAtMTsgeC0tKSB7XHJcbiAgICAgICAgICAgIGlmIChmaWxlc1t4XS5pbmRleE9mKCcubWV0YScpID09PSAtMSkgey8v5o6S6ZmkLm1hdGXmlofku7ZcclxuICAgICAgICAgICAgICAgIGxldCBzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGggKyAnLycgKyBmaWxlc1t4XSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkgey8v55uu5b2VXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGggKyAnLycgKyBmaWxlc1t4XSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRmlsZSgpKSB7Ly/mmK/mlofku7ZcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGZpbGVzW3hdLnJlcGxhY2UoJ18nLCAnJykuc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmFsbFR5cGUuYWRkKG5hbWVbMV0pOy8v6YeN5aSN5LiA55u05re75Yqg57G75Z6LIOS/neivgeexu+Wei+WUr+S4gOaAp1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbXlQYXRoID0gKHBhdGggKyAnLycgKyBmaWxlc1t4XSkucmVwbGFjZSh0aGlzLmRhdGFNYW5hZ2VyLnJvb3QgKyAnJywgJycpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGlyID0gbXlQYXRoLnNwbGl0KCcvJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0RpciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgeCA9IDAsIGwgPSBkaXIubGVuZ3RoIC0gMTsgeCA8IGw7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXIgKz0gZGlyW3hdICsgJy8nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLmRpck5hbWVzLmFkZChuZXdEaXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFNYW5hZ2VyLnJvb3RSZXNMaXN0LnNldChteVBhdGgsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZS5qb2luKCdfJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IG15UGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmFtZVsxXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogc3RhdHMuc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKiog5paH5Lu25aSn5bCP5YC86L2s5o2iICovXHJcbiAgICBwcml2YXRlIGNvbnZlcnRGaWxlU2l6ZShzaXplOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIHNpemUgPSBzaXplIC8gMTAwMDtcclxuICAgICAgICBpZiAoc2l6ZSA8IDEwMjQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNpemUudG9GaXhlZCgyKSArICdLQic7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2l6ZSA9IHNpemUgLyAxMDAwO1xyXG4gICAgICAgICAgICByZXR1cm4gc2l6ZS50b0ZpeGVkKDIpICsgJ01CJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmj5DnpLpcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoaW50KHN0cjogc3RyaW5nLCB0aW1lOiBudW1iZXIgPSAyMDAwKSB7XHJcbiAgICAgICAgbGV0IGhpbnRWaWV3ID0gJCgnI2hpbnRWaWV3Jyk7XHJcbiAgICAgICAgaGludFZpZXcuc2hvdygpO1xyXG4gICAgICAgIGhpbnRWaWV3LnRleHQoc3RyKTtcclxuICAgICAgICBpZiAodGhpcy5oaW50VGltZSkgY2xlYXJUaW1lb3V0KHRoaXMuaGludFRpbWUpO1xyXG4gICAgICAgIHRoaXMuaGludFRpbWUgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgaGludFZpZXcuZmFkZU91dCgzMDApO1xyXG4gICAgICAgIH0sIHRpbWUpXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOagueaNruW3sue7j+mAieaLqeeahOWIl+ihqO+8jOWcqOagueebruW9leWIl+ihqOS4reaYvuekuuWHuuadpVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNob3dTZWxlY3RlZCgpIHtcclxuICAgICAgICBsZXQgbGlzdCA9IHRoaXMucm9vdExpc3QuZmluZCgnZGQnKSBhcyBKUXVlcnk8SFRNTEVsZW1lbnQ+LFxyXG4gICAgICAgICAgICBncm91cCA9IHRoaXMuZGF0YU1hbmFnZXIuZ3JvdXBMaXN0LmdldCh0aGlzLmN1ckdyb3VwSWQpISxcclxuICAgICAgICAgICAgbCA9IGxpc3QubGVuZ3RoLFxyXG4gICAgICAgICAgICBkZDogSlF1ZXJ5PEhUTUxFbGVtZW50PjtcclxuXHJcbiAgICAgICAgbGlzdC5yZW1vdmVDbGFzcygnY3VyJyk7XHJcbiAgICAgICAgaWYgKGdyb3VwKSB7XHJcbiAgICAgICAgICAgIGdyb3VwLmZvckVhY2goKHYsIGspID0+IHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgbDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGQgPSBsaXN0LmVxKHgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGQuYXR0cignZGF0YS1pZCcpID09PSBrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZC5hZGRDbGFzcygnY3VyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkv53lrZjkuLpqc29uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2F2ZUpzb24oKSB7XHJcbiAgICAgICAgdGhpcy5oaW50KCfkv53lrZjmiJDlip8nLCA2MDApO1xyXG4gICAgICAgIGxldCBkYXRhID0gdGhpcy5kYXRhTWFuYWdlci5nZXRKc29uRGF0YSgpO1xyXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5qc29uRmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgVmlld0xvZ2ljIGZyb20gXCIuL1ZpZXdMb2dpY1wiO1xyXG4vKipcclxuICog5riy5p+T6YC76L6R5YWl5Y+jXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWluIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIG5ldyBWaWV3TG9naWMoKTtcclxuICAgIH1cclxufVxyXG4vLyBuZXcgTWFpbigpIl0sIm5hbWVzIjpbImZzLmV4aXN0c1N5bmMiLCJmcy5yZWFkRmlsZVN5bmMiLCJmcy5yZWFkZGlyU3luYyIsImZzLnN0YXRTeW5jIiwiZnMud3JpdGVGaWxlU3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUE7OztBQUtBLFVBQXFCLFdBQVc7UUFvQjVCO1lBQ0ksSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1NBQ2hDOzs7O1FBS0QsUUFBUTtZQUNKLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUM1Qjs7Ozs7OztRQVFELFFBQVEsQ0FBQyxJQUFZLEVBQUUsS0FBZ0I7WUFDbkMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFD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
