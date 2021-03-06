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
    /** 图片预览节点 */
    private previewImg: JQuery<HTMLImageElement>;


    /** 数据管理 */
    private dataManager: DataManager;
    /** 当前选择的分组id */
    private curGroupId: number;
    /** 默认组 */
    private initGroup: string;
    /** hint定时器 */
    private hintTime: any;
    /** 组递增id=>用于名称添加 */
    private groupId: number;
    /** json文件路径 */
    private jsonFilePath: string;


    constructor() {

        this.initGroup = 'init';

        this.groupId = 1;

        this.dataManager = new DataManager();

        this.browseBtn = document.querySelector('#browse') as HTMLInputElement;
        this.groupListNode = $('#groupListNode');
        this.addGroupBtn = $('#addGroupBtn');
        this.myListNode = $('#myListNode');
        this.rootList = $('#rootList');
        this.previewImg = $('#previewImg');

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
                        console.log('渲染JSON文件里面数据')
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
            this.browseBtn.value = '';
            // this.setRootPath(file)
            console.log(file);
        })


        //添加组
        this.addGroupBtn.on('click', () => {
            this.addGroup('GroupName' + this.groupId, true);
            this.groupListNode.find('input').focus();
        })


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

        })

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

        this.groupListNode.on('blur', 'input', (e) => {//focusout 
            $(e.currentTarget).attr('disabled', 'disabled');
            // $(e.currentTarget).off();
            let val: any = $(e.currentTarget).val();
            if (val.match(/^[A-z]/) && !val.match(/[^A-z0-9\_]/)) {
                console.log('组名称id:' + $(e.currentTarget).parent('dd').attr('data-id') + '=>' + val);
                this.dataManager.replaceGroupName(Number($(e.currentTarget).parent('dd').attr('data-id')), val)
            } else {
                $(e.currentTarget).val(curVal);
                this.hint('内容必须以字母开头，除了_不可以有其它特殊字符!');
            }
        })


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
            if (id.indexOf('.png') > -1 || id.indexOf('.jpg') > -1 || id.indexOf('.jpeg') > -1 ) {
                this.previewImg[0].src = this.dataManager.root + id;
            }
        })

        //删除已经缓存数据 根目录点击事件
        this.rootList.on('click', '.delete', (e) => {
            if (e.currentTarget) {
                this.clearItemBtId(e.currentTarget.getAttribute('data-id'))
            }
        })
        this.myListNode.on('click', '.delete', (e) => {
            if (e.currentTarget) {
                this.clearItemBtId(e.currentTarget.getAttribute('data-id'))
            }
        })

        //资源类型修改
        this.myListNode.on('change', 'select', (e) => {
            if (e.currentTarget) {
                if (this.curGroupId) this.dataManager.groupList.get(this.curGroupId)!.get(e.currentTarget.getAttribute('data-id'))!.type = e.currentTarget.value;
            }
        })

        //根据目录筛选
        $('#dirSelect').on('change', (e: any) => {
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
                })
            }
        })

        //保存
        window.addEventListener('keydown', (e) => {
            if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {//ctrl+s
                e.preventDefault();
                this.saveJson();
            }
        })

        //添加注释功能
        this.myListNode.on('blur', 'input', (e: any) => {
            let id = e.currentTarget.getAttribute('data-id');
            this.dataManager.replaceNote(id, this.curGroupId, e.currentTarget.value);
        })

    }

    /**
     * 通过json文件渲染
     * @param data json文件数据
     */
    private drawByJson(data: any) {
        console.log(data);
        let groups = data['groups'],
            l = groups.length,
            x = 0;
        for (; x < l; x++) {
            this.addGroup(groups[x].name, groups[x].name !== "init", groups[x].items)
        }

    }

    /**
     * 添加一条数据到数据列表
     * @param id 资源id
     */
    private addDataList(id: string) {
        this.drawItem(this.dataManager.addItmeByGroupId(id, this.curGroupId)!);
        this.showSelected();
    }

    /**
     * 渲染一条数据到前端
     */
    private drawItem(obj: resObj) {
        if (!obj) {
            return;
        }
        //绑定类型
        let typeStr: string = '';
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
    private addGroup(name: string, type: boolean, items?: resObj[]) {
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
    private drawByGroupIdList(id: number) {
        let list = this.dataManager.groupList.get(id);
        if (list) {
            this.myListNode.html('');
            list.forEach((val) => {
                this.drawItem(val);
            })

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
            html += `<dd data-id=${key} data-type=${val.type} title=${val.name}>
                <div class="g0 resName">${val.name}</div>
                <div class="g0 resType">${val.type}</div>
                <div class="g1"><a data-id=${key} class="delete rootDel is-small"></a><span class="path">${val.path}</span></div>
                <div class="g0 size_me">${this.convertFileSize(val.size)}</div>
            </dd>`;
        })

        this.rootList.html(html);

        //渲染目录
        $('#dirSelect').html('');
        html = '<option selected>All</option>';
        this.dataManager.dirNames.forEach((val) => {
            html += `<option>${val}</option>`;
        })
        $('#dirSelect').html(html);
    }

    /**
     * 通过绝对地址id删除
     * @param id 资源id
     */
    private clearItemBtId(id: string) {
        this.dataManager.deleteItemByGroupId(id, this.curGroupId);
        this.showSelected();
        this.drawByGroupIdList(this.curGroupId);//需要优化
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

                    let dir = myPath.split('/'),
                        newDir = "";
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
    private hint(str: string, time: number = 2000) {
        let hintView = $('#hintView');
        hintView.show();
        hintView.text(str);
        if (this.hintTime) clearTimeout(this.hintTime);
        this.hintTime = setTimeout(() => {
            hintView.fadeOut(300);
        }, time)
    }
    /**
     * 根据已经选择的列表，在根目录列表中显示出来
     */
    private showSelected() {
        let list = this.rootList.find('dd') as JQuery<HTMLElement>,
            group = this.dataManager.groupList.get(this.curGroupId)!,
            l = list.length,
            dd: JQuery<HTMLElement>;

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
            })
        }
    }

    /**
     * 保存为json
     */
    private saveJson() {
        this.hint('保存成功', 600);
        let data = this.dataManager.getJsonData();
        fs.writeFileSync(this.jsonFilePath, JSON.stringify(data));
    }

}