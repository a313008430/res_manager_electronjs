/**
 * 数据管理器
 */


export default class DataManager {

    /**根目录 */
    root: string | undefined;
    /** 所有的类型 */
    allType: Set<string>;
    /** 组数据列表 */
    groupList: Map<number, Map<string, resObj>>;
    /** 组名称列表 */
    groupNameList: Map<number, string>;
    /** 递增的组id */
    private groupId: number;
    /** 缓存数据列表 => 所有组的数据合 => 这里貌似可以优化下数据结构 */
    allItemList: Set<resObj>;

    /** 根目录数据列表 */
    rootResList: Map<string, rootListObj>;
    /** 根目录下所有资源目录名称 */
    dirNames: Set<string>;

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
    addGroup(name: string, items?: resObj[]): number {
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
    clearGroup(id: number) {
        let group = this.groupList.get(id) as Map<string, resObj>;

        if (!group) return;

        if (group.size) {//如果有数据是否删除
            this.groupList.delete(id);
            this.groupNameList.delete(id);
        } else {//直接删除

        }
    }

    /**
     * 向某组里添加一条数据
     * @param id 根目录内的id
     * @param groupId 组id
     * @param resObj 要存的数据
     */
    addItmeByGroupId(id: string | null, groupId: number, resObj?: resObj): resObj | null {
        let obj = this.groupList.get(groupId);
        if (id) {
            let rootData = this.rootResList.get(id);//获取根目录数据
            if (rootData) {
                if (obj && !obj.get(id)) {
                    let resObj: resObj = {
                        resName: rootData.name,
                        type: rootData.type,
                        path: rootData.path
                    };
                    obj.set(id, resObj);
                    return resObj;
                }

            }
        } else if (resObj) {
            if (obj) obj.set(resObj.path, resObj);
        }

        return null;
    }

    /**
     * 从某组中删除一条数据
     * @param id 根目录内的id
     * @param groupId 组id
     */
    deleteItemByGroupId(id: string, groupId: number) {
        let rootData = this.groupList.get(groupId)!;//获取根目录数据
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
    replaceNote(id: string, groupId: number, value: string) {
        let items = this.groupList.get(groupId)!;//获取根目录数据
        if (items) {
            items.get(id)!.note = value;
        }
    }

    /**
     * 修改组名称
     */
    replaceGroupName(id: number, name: string): string | null {
        if (this.groupNameList.get(id)) {
            this.groupNameList.set(id, name);
            return name;
        }
        return null;
    }

    /**
     * 获取组名称
     */
    getGroupName(name: string) {
        let n: string = '';
        this.groupNameList.forEach((val: string) => {
            if (name === val) n = val;
        })
        return n;
    }

    /**
     * 获取所有资源列表 导出到json时用 唯一性
     */
    getJsonData() {
        let jsonData: {
            groups: { name: string, items: resObj[] }[],
            all: resObj[]
        } = {
            all: [],
            groups: []
        };
        this.groupList.forEach((v, k) => {

            // jsonData.group.push({name:this.groupNameList.get(k)!, list:[]})
            let gorup: { name: string, items: resObj[] } = {
                name: this.groupNameList.get(k)!,
                items: []
            }
            let resObjInAll: resObj;
            v.forEach((mv) => {
                gorup.items.push(mv);
                resObjInAll = {
                    resName: mv.resName,
                    type: mv.type,
                    path: mv.path
                }
                if (!this.allItemList.has(resObjInAll)) {
                    jsonData.all.push(resObjInAll);
                }
                this.allItemList.add(resObjInAll);
            })
            jsonData.groups.push(gorup);
        })
        console.log(jsonData)
        return jsonData;
    }


    /**
     * TODO 需要优化缓存的数据结构，不然不方便导成为json
     * 结果在resObj的基本上添加上分组id 然后整体直接导入为json
     */
}