import DataManager from "./DataManager";
import * as fs from "fs";

/**
 * 界面逻辑
 */
export default class ViewLogic {

    /** 上传按钮 */
    private browseBtn: HTMLInputElement;
    /** 组名称列表节点 */
    private groupListNode: JQuery<HTMLElement>;
    /** 添加组按钮 */
    private addGroupBtn: JQuery<HTMLElement>;
    /** 我的数据列表 */
    private myListNode: JQuery<HTMLElement>;
    /** 根目录列表节点 */
    private rootList: JQuery<HTMLElement>;


    /** 数据管理 */
    private dataManager: DataManager;
    /** 当前选择的分组id */
    private curGroupId: number;
    /** 默认组 */
    private initGroup: string;
    /** hint定时器 */
    private hintTime: any;


    constructor() {

        this.initGroup = 'init';

        this.dataManager = new DataManager();

        this.browseBtn = document.querySelector('#browse') as HTMLInputElement;
        this.groupListNode = $('#groupListNode');
        this.addGroupBtn = $('#addGroupBtn');
        this.myListNode = $('#myListNode');
        this.rootList = $('#rootList');

        //添加根目录资源点击事件
        this.browseBtn.addEventListener('change', (e: Event) => {

            let file: any = (this.browseBtn.files as FileList).item(0) as File;
            if (file.type === "application/json") {

                //获取资源根目录
                let path: string = file.path;
                let pathArr: any[] = path.split('\\');
                pathArr.splice(pathArr.length - 2, 2);
                let rootPath: string = pathArr.join('/') + '/assets/resources'
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

                    } else {
                        console.log('json文件为空');
                        this.addGroup(this.initGroup, false);
                    }

                } else {
                    alert('root path is error!')
                }
                console.log(rootPath)
            } else {
                alert('The format must be JSON!')
            }
            // this.setRootPath(file)
            console.log(file);
        })


        //添加组
        this.addGroupBtn.on('click', () => {
            this.addGroup('GroupName' + this.dataManager.groupList.size, true);
            this.groupListNode.find('input').focus();
        })

        // 组名称点击事件
        this.groupListNode.on('click', 'dd', (e) => {
            if (e.currentTarget) {
                $(e.currentTarget).addClass('cur').siblings().removeClass('cur');
                let id = Number(e.currentTarget.getAttribute('data-id'));
                if (this.curGroupId !== id) {
                    this.drawByGroupIdList(id);
                    this.curGroupId = id;
                }
            }
        })
        //修改名称双击事件
        let curVal: any;
        this.groupListNode.on('dblclick', '.replaceGroupName', (e) => {
            if (e.currentTarget) {
                let input = $(e.currentTarget).find('input');
                input.prop('disabled', '');
                input.focus();
                curVal = input.val();

            }
        })

        this.groupListNode.on('focusout blur', 'input', (e) => {
            $(e.currentTarget).attr('disabled', 'disabled');
            // $(e.currentTarget).off();
            let val: any = $(e.currentTarget).val();
            if (val.match(/^[A-z]/) && !val.match(/[^A-z0-9\_]/)) {
                console.log('1231232可以开始')

            } else {
                $(e.currentTarget).val(curVal);
                this.hint('内容必须以字母开头，除了_不可以有其它特殊字符!');
            }
            console.log($(e.currentTarget).val())
        })

        //根目录列表点击事件==>双击
        this.rootList.on('dblclick', 'dd', (e) => {
            if (e.currentTarget) {
                this.addDataList(e.currentTarget.getAttribute('data-id'));
            }
        })

    }

    /**
     * 添加一条数据到数据列表
     * @param id 资源id
     */
    private addDataList(id: string) {
        let rootData = this.dataManager.rootResList.get(id);//获取根目录数据
        if (rootData) {
            let obj = this.dataManager.groupList.get(this.curGroupId);

            if (obj && !obj.get(id)) {
                obj.set(id, {
                    resName: rootData.name,
                    type: rootData.type,
                    path: rootData.path
                });
                this.drawItem(obj.get(id)!);
            }

        }
    }

    /**
     * 渲染一条数据到前端
     */
    private drawItem(obj: resObj) {
        //绑定类型
        let typeStr: string = '';
        this.dataManager.allType.forEach((v) => {
            typeStr += `<option ${obj.type === v ? 'selected' : ''}>${v}</option>`;
        });

        this.myListNode.prepend(`<dd data-id=${obj.path}>
        <div class="g0 resName">${obj.resName}</div>
        <div class="g0 resType select is-small">
            <select>${typeStr}</select>
        </div>
        <div class="g1">${obj.path}</div>
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
    private addGroup(name: string, type: boolean) {
        if (this.dataManager.getGroupName(name)) {
            alert('分组名称已经存在');
            return;
        }

        this.curGroupId = this.dataManager.addGroup(name);

        this.groupListNode.find('dd').removeClass('cur');

        this.groupListNode.append(`<dd data-id=${this.curGroupId} class="tag g1 is-white cur ${type ? 'replaceGroupName' : ''}">
        <input  disabled class="input is-small groupName" type="text" placeholder="Group name" value="${name}">
        ${type ? ' <button class="delete is-small"></button>' : ''}
    </dd>`);

        this.drawByGroupIdList(this.curGroupId);
    }

    /**
     * 根据组数据渲染
     * @param id 组id
     */
    private drawByGroupIdList(id: number) {
        let list = this.dataManager.groupList.get(id);
        if (list) {
            this.myListNode.html('');
            list.forEach((val) => {
                this.drawItem(val);
            })
            console.log(list)
        }
    }

    /**
     * 清除列表初始化等
     */
    private clear() {
        this.dataManager.rootResList.clear();
        this.groupListNode.html('');
        this.myListNode.html('');
    }

    /**
     * 设置根目录路径
     * @param path 路径
     */
    private setRootPath(path: string) {
        let rootNode = document.querySelector('#rootNode') as HTMLDivElement;
        rootNode.innerText = path;
    }

    /**
     * 渲染根文件所有资源
     */
    private drawRootList() {
        console.log(this.dataManager.rootResList)
        let html = '',
            list = this.dataManager.rootResList;

        list.forEach((val, key) => {
            html += `<dd data-id=${key} data-type=${val.type}>
                <div class="g0 resName">${val.name}</div>
                <div class="g0 resType">${val.type}</div>
                <div class="g1">${this.dataManager.root + val.path} <a class="delete is-small"></a></div>
                <div class="g0 size_me">${this.convertFileSize(val.size)}</div>
            </dd>`
        })

        this.rootList.html(html);
    }

    /**
     * 读取目录所有资源
     * @param path 路径
     */
    private readDir(path: string) {
        if (!path.length) {
            return
        }
        let files = fs.readdirSync(path);

        for (let x = files.length - 1; x > -1; x--) {
            if (files[x].indexOf('.meta') === -1) {//排除.mate文件
                let stats = fs.statSync(path + '/' + files[x]);
                if (stats.isDirectory()) {//目录
                    this.readDir(path + '/' + files[x]);
                } else if (stats.isFile()) {//是文件
                    let name = files[x].replace('_', '').split('.');
                    this.dataManager.allType.add(name[1]);//重复一直添加类型 保证类型唯一性

                    let myPath = (path + '/' + files[x]).replace(this.dataManager.root + '', '');
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
    private convertFileSize(size: number): string {
        size = size / 1000;
        if (size < 1024) {
            return size.toFixed(2) + 'KB';
        } else {
            size = size / 1000;
            return size.toFixed(2) + 'MB';
        }
    }

    /**
     * 提示
     */
    private hint(str: string) {
        let hintView = $('#hintView');
        hintView.show();
        hintView.text(str);
        if (this.hintTime) clearTimeout(this.hintTime);
        this.hintTime = setTimeout(() => {
            hintView.fadeOut(300);
        }, 2000)
    }
}