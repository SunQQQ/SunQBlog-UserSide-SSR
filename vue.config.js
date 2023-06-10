// 服务器渲染插件
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin"); // 生成服务端包
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin"); // 生成客户端包
const nodeExternals = require("webpack-node-externals");
const merge = require("lodash.merge");

// 环境变量：决定入口是客户端还是服务端，webpack_target在启动项中设置的，见package.json文件
const TARGET_NODE = process.env.WEBPACK_TARGET === "node";
const target = TARGET_NODE ? "server" : "client";

module.exports = {
  baseUrl: './',
  outputDir: 'blog-user',
  devServer: {
    // 设置代理
    proxy: {
      '/api': {
        // target: 'http://localhost:8888/', // 开发环境下使用
        target: 'http://39.104.22.73:8888/', // 生产环境下需要根据实际情况修改
        changeOrigin: true, //改变源
        pathRewrite: {
          '^/api': '' //路径重写
        },
        pathRequiresRewrite: {
          '^/api': ''
        }
      }
    }
  },
  // 包分析工具，可看到各种资源的体积
  // chainWebpack:config=>{
  //   config
  //     .plugin('webpack-bundle-analyzer')
  //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
  // },
  productionSourceMap: false, // 关闭map文件的生成，map文件保存映射保证在程序报错时能找到资源文件
  configureWebpack: config => {
    // GZip压缩
    const CompressionPlugin = require('compression-webpack-plugin');
    // build时关闭console、debugger
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
    config.plugins.push(
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|woff|woff2|svg)$/,  // 要压缩的文件
        threshold: 10240, // 压缩超过10k的数据
        deleteOriginalAssets: false, // 不删除压缩前的文件，如果浏览器不支持Gzip，则会加载源文件
        minRatio: 0.8 // 压缩比大于0.8的文件将不会被压缩
      })
    );

    config.plugins.push(
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            drop_debugger: true,//关闭debug
            drop_console: true,//关闭console
          }
        },
        cache: true
      })
    );

    return {
      // 将 entry 指向应用程序的 server / client 文件
      entry: `./src/entry-${target}.js`,
      // 对 bundle renderer 提供 source map 支持
      devtool: "source-map",
      // 这允许 webpack 以 Node 适用方式处理动态导入(dynamic import)， // 并且还会在编译 Vue 组件时告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
      target: TARGET_NODE ? "node" : "web",
      node: TARGET_NODE ? undefined : false,
      output: {
        // 此处配置服务器端使用node的风格构建
        libraryTarget: TARGET_NODE ? "commonjs2" : undefined
      },
      // 外置化应用程序依赖模块。可以使服务器构建速度更快，并生成较小的 bundle 文件。
      externals: TARGET_NODE ? nodeExternals({
        // 不要外置化 webpack 需要处理的依赖模块。（以前whitelist，改成allowlist）
        allowlist: [/\.css$/]
      }) : undefined,
      optimization: { splitChunks: TARGET_NODE ? false : undefined }, // 这是将服务器的整个输出构建为单个 JSON 文件的插件。 // 服务端默认文件名为 `vue-ssr-server-bundle.json` // 客户端默认文件名为 `vue-ssr-client-manifest.json`
      plugins: [TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()]
    }
  }
};
