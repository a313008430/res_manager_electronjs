import DataManager from "./DataManager";
import * as fs from "fs";

/**
 * 界面逻辑
 */
export default class ViewLogic {

    /** 上传按钮 */
    private browseBtn: HTMLInputElement;

    /** 数据管理 */
    private dataManager: DataManager;
    /** 根目录列表 */
    private rootResList: {
        /** 路径 */
        path: string,
        /** 名称 */
        name: string,
        /** 类型 */
        type: string,
        /** 大小 */
        size: number
    }[];

    constructor() {

        this.dataManager = new DataManager();

        this.browseBtn = document.querySelector('#browse') as HTMLInputElement;

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
    }

    /**
     * 清除列表初始化等
     */
    private clear() {
        this.rootResList = [];
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
        for (let x = list.length - 1; x > -1; x--) {
            html += `<dd>
            <div class="g0 resName">${list[x].name}</div>
            <div class="g0 resType select is-small">
                <select disabled>
                    <option>${list[x].type}</option>
                </select>
            </div>
            <div class="g1">${list[x].path}</div>
            <div class="g0 size_me">${list[x].size}</div>
        </dd>`
        }

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
                    this.rootResList.push({
                        name: name.join('_'),
                        path: path + '/' + files[x],
                        type: name[0],
                        size: stats.size
                    });
                }
            }
        }

    }
}