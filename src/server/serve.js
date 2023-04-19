let createSSRApp = require('vue');
let renderToString = require('vue-server-renderer');
let render = renderToString.createRenderer();
// Vue 的服务端渲染 API 位于 `vue/server-renderer` 路径下

const ssrApp = new createSSRApp({
  data: () => ({ count: 1 }),
  template: `<button @click="count++">{{ count }}</button>`
})

//引入express中间件
let express = require('express');
let compression = require('compression');
const http = require('http');
let fromUrl = '';

var app = express();
app.use(compression());

http.createServer(app).listen(67);

app.get('/', (req, res) => {
  // res.sendFile('index.html', {root: __dirname});
  // fromUrl = req.headers['referer'];

  render.renderToString(ssrApp).then((html)=>{
    // res.sendFile("jj");
    res.send(html);
  });
});

app.get('/*', (req, res) => {
  res.sendFile(req.params[0], {root: __dirname});
});


