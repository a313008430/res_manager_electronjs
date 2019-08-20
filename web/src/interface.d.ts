/**缓存的数据列表 */
interface resObj {
    /** 资源名称 */
    resName: string,
    /** 类型 */
    type: string,
    /** 路径 */
    path: string,
    /** 注释 */
    note?: string
}

/** 根目录列表数据结构 */
interface rootListObj {
    /** 路径 */
    path: string,
    /** 名称 */
    name: string,
    /** 类型 */
    type: string,
    /** 大小 */
    size: number
}