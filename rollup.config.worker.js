import typescript from 'rollup-plugin-typescript2';
// import { uglify } from 'rollup-plugin-uglify';//代码混淆库 这个只能编译es5
// import uglify from "rollup-plugin-uglify-es";//代码混淆库  这个可以编译所有

export default {
    input: './web/src/worker/Worker.ts',
    // external:['fs'],
    plugins: [
        typescript({ tsconfig: "./tsconfig.json" }),
        // uglify({
        //     // toplevel: true,//变量名也会压缩 高级压缩，如报错可取消
        // })
    ],
    output: [
        {
            dir: './web/dist/worker/',
            // sourcemap: 'inline',
            format: 'cjs',//
        }
    ]
}