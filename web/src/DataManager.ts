/**
 * 数据管理器
 */

interface resObj {
    /** 资源名称 */
    resName: string,
    /** 类型 */
    type: number,
    /** 路径 */
    path: string,
    /** 注释 */
    note?: string
}

export default class DataManager {

    /**根目录 */
    root: string | undefined;
    /** 所有的类型 */
    allType: Set<string>;
    /** 组列表 */
    groupList: Map<string, Map<string, resObj>>;

    constructor() {
        this.groupList = new Map();
        this.allType = new Set();
    }

    /**
     * 添加一组
     * @param name 组名称
     */
    addGroup(name: string) {
        this.groupList.set(name, new Map());
    }

    /**
     * 删除一组
     * @param name 组名称
     */
    clearGroup(name: string) {
        let group = this.groupList.get(name) as Map<string, resObj>;

        if (!group) return;

        if (group.size) {//如果有数据是否删除
            this.groupList.delete(name);
        } else {//直接删除

        }
    }
}