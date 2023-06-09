// nodejs服务器
const express = require("express");
const fs = require("fs");
let axios = require('axios');
// 创建express实例和vue实例
const app = express();

// 创建渲染器 获得一个createBundleRenderer
const { createBundleRenderer } = require("vue-server-renderer");
const serverBundle = require("../dist/server/vue-ssr-server-bundle.json");
const clientManifest = require("../dist/client/vue-ssr-client-manifest.json");
const template = fs.readFileSync("../src/index.template.html", "utf-8"); // ssr模板文件
const renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false,
    template,
    clientManifest,
});

// 中间件处理静态文件请求
app.use(express.static("../blog-user-ssr/client", { index: false })); // 为false是不让它渲染成dist/client/index.html
// app.use(express.static('../dist/client'))  //如果换成这行代码，那么需要把dist/client/index.html 删除 ，不然会优先渲染该目录下的index.html文件

// 前端请求返回数据
app.get("*", async (req, res) => {
    try {
        const context = { url: req.url, title: "ssr",};
    // nodejs流数据，文件太大，用renderToString会卡
        const stream = renderer.renderToStream(context);
        let buffer = [];
        stream.on("data", (chunk) => {
            buffer.push(chunk);
        });
        stream.on("end", () => {
            res.end(Buffer.concat(buffer));
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("服务器内部错误");
    }
});

app.post('/*', (req, res) => {
  let pathName = req.params[0],
    clientIp = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

  // 转发时带着原请求的ip信息
  req.body.clientIp = clientIp.replace('::ffff:','');
  req.body.fromUrl = fromUrl;

  axios.post(
    'http://39.104.22.73:8888' + pathName.replace('api',''),
    // req.body
  ).then(function (response) {
    res.end(JSON.stringify(response.data));
  }).catch(function (e) {
    console.log('转发 ajax error');
  });
});

/*服务启动*/
const port = 8080;
app.listen(port, () => {
    console.log(`server started at localhost:${port}`);
});