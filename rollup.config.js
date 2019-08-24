import typescript from 'rollup-plugin-typescript2';
// import { uglify } from 'rollup-plugin-uglify';//代码混淆库 这个只能编译es5
import uglify from "rollup-plugin-uglify-es";//代码混淆库  这个可以编译所有
// import server from 'rollup-plugin-serve';

export default {
    input: './web/src/Main.ts',
    // external:['fs'],
    plugins: [
        // typescript({ lib: ["es5", "es6", "dom"], target: "esnext", sourceMap: true }),
        typescript({ tsconfig: "./tsconfig.json" }),
        // uglify({
        //     // toplevel: true,//变量名也会压缩 高级压缩，如报错可取消
        // })
        // server({
        //     host:'192.168.1.3',
        //     port:888,
        //     contentBase:'../'
        // })
    ],
    output: {
        file: './web/dist/index.js',
        sourcemap: 'inline',
        format: 'umd',//
        name: 'game',//默认可以不暴露出去，默认也可以不加export
        globals:{
            'fs':"fs",              //告诉rollup 全局变量THREE即是three'
            
        }
    }
}