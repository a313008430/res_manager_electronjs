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

    /** 根目录数据列表 */
    rootResList: Map<string, rootListObj>;

    constructor() {
        this.groupId = 0;
        this.rootResList = new Map();
        this.groupList = new Map();
        this.allType = new Set();
        this.groupNameList = new Map();
    }

    /**
     * 添加一组
     * @param name 组名称
     * @returns 返回生成的组id
     */
    addGroup(name: string): number {
        this.groupId++;
        this.groupList.set(this.groupId, new Map());
        this.groupNameList.set(this.groupId, name);
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
        let n:string = '';
        this.groupNameList.forEach((val: string) => {
            if (name === val) n = val;
        })
        return n;
    }
}