import typescript from 'rollup-plugin-typescript2';
// import server from 'rollup-plugin-serve';

export default {
    input: './web/src/Main.ts',
    plugins: [
        typescript({ lib: ["es5", "es6", "dom"], target: "esnext", sourceMap: true }),
        // server({
        //     host:'192.168.1.3',
        //     port:888,
        //     contentBase:'../'
        // })
    ],
    output: {
        file: './web/dist/index.js',
        sourceMap: true,
        format: 'umd',//
        name: 'main',//默认可以不暴露出去，默认也可以不加export
    }
}