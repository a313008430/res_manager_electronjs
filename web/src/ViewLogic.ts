import DataManager from "./DataManager";
import * as fs from "fs";

/**
 * 界面逻辑
 */
export default class ViewLogic {

    /** 上传按钮 */
    private browseBtn: HTMLInputElement;
    /** 组列表节点 */
    private groupListNode: HTMLDListElement;
    /** 添加组按钮 */
    private addGroupBtn: HTMLElement;
    /** 我的数据列表 */
    private myListNode: HTMLDListElement;

    /** 数据管理 */
    private dataManager: DataManager;
    /** 根目录列表 */
    private rootResList: Map<string, {
        /** 路径 */
        path: string,
        /** 名称 */
        name: string,
        /** 类型 */
        type: string,
        /** 大小 */
        size: number
    }>;

    constructor() {

        this.rootResList = new Map();

        this.dataManager = new DataManager();

        this.browseBtn = document.querySelector('#browse') as HTMLInputElement;
        this.groupListNode = document.querySelector('#groupListNode') as HTMLDListElement;
        this.addGroupBtn = document.querySelector('#addGroupBtn') as HTMLDListElement;
        this.myListNode = document.querySelector('#myListNode') as HTMLDListElement;

        //点击事件
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
                        this.addGroup('init', false);
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
        this.addGroupBtn.addEventListener('click', ()=>{
           var a =  prompt("请输入您的名字","Bill Gates");
           console.log(a)
        })
    }

    /**
     * 添加分组
     * @param name 组名字
     * @param type 是否可修改和删除 true 可修改 false 不可修改
     */
    private addGroup(name: string, type: boolean) {
        if (this.dataManager.groupList.has(name)) {
            alert('分组已经存在');
            return;
        }
        this.dataManager.addGroup(name);

        let node = document.createElement('DD');
        node.className = "tag g1 is-white";
        node.innerHTML = `<input ${type ? '' : 'disabled'} class="input is-small groupName" type="text" placeholder="Group name" value=${name}>
        ${type ? ' <button class="delete is-small"></button>' : ''}`;

        this.groupListNode.appendChild(node);
    }

    /**
     * 清除列表初始化等
     */
    private clear() {
        this.rootResList.clear();
        this.groupListNode.innerHTML = '';
        this.myListNode.innerHTML = '';
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
        console.log(this.rootResList)
        let html = '',
            list = this.rootResList;

        list.forEach((val, key) => {
            html += `<dd data-id=${key} data-type=${val.type}>
                <div class="g0 resName">${val.name}</div>
                <div class="g0 resType select is-small">
                    <select disabled>
                        <option>${val.type}</option>
                    </select>
                </div>
                <div class="g1">${this.dataManager.root + val.path} <a class="delete is-small"></a></div>
                <div class="g0 size_me">${this.convertFileSize(val.size)}</div>
            </dd>`
        })

        let rootListNode = document.querySelector('#rootList') as HTMLDivElement;
        rootListNode.innerHTML = html;
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
                    this.rootResList.set(myPath, {
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
}