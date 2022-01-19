/*
 * @Description:
 * @Autor: Bowen
 * @Date: 2021-11-09 14:48:38
 * @LastEditors: Bowen
 * @LastEditTime: 2021-11-09 18:46:51
 */
const express = require("express");
const app = express();
const port = 3000;
//设置CORS
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin','*'); //当允许携带cookies此处的白名单不能写’*’
  res.header('Access-Control-Allow-Headers','Accept-Ranges, Content-Encoding,  Content-Range, content-type,Content-Length, Authorization,Origin,Accept,X-Requested-With'); //允许的请求头
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT'); //允许的请求方法
  res.header('Access-Control-Allow-Credentials',true);  //允许携带cookies
  next();
});
app.use("/public", express.static("public",{  maxAge: '1d'}));
app.use(express.static("public2",{  maxAge: '1d'}));
app.get("/", (req, res) => {
  console.log("3000 被请求了")
  res.send({
    text:"Hello  / 3000!",
    code:200
  });
});
app.get("/prod", (req, res) => {
  console.log("3000 被请求了")
  res.send("Hello  /prod 3000!");
});
app.get("/dev", (req, res) => {
  console.log("3001 dev 被请求了")
  res.send("Hello /dev 3000!");
});

app.listen(port, (e) => {
  if(e){
    console.log("error:",e)
  }
  console.log(`Example app listening at http://localhost:${port}`);
});
