/*
 * @Description:
 * @Autor: Bowen
 * @Date: 2022-03-06 14:41:53
 * @LastEditors: Bowen
 * @LastEditTime: 2022-03-06 17:09:50
 */
var fs = require("fs"); //引入fs模块
var path = require("path"); //引入path模块
/**
 * @description: 删除文件夹和内部所有文件
 * @param {*} dir
 * @return {*}
 */
function rmdirDeepSync(dir) {
  var files = fs.readdirSync(dir); //同步读取文件夹内容

  files.forEach(function (item, index) {
    //forEach循环
    let p = path.resolve(dir, item); //读取第二层的绝对路径
    let pathstat = fs.statSync(p); //独读取第二层文件状态
    if (!pathstat.isDirectory()) {
      //判断是否是文件夹
      fs.unlinkSync(p); //不是文件夹就删除
    } else {
      rmdirDeepSync(p); //是文件夹就递归
    }
  });
  fs.rmdirSync(dir); //删除已经为空的文件夹
}

module.exports = {
    rmdirDeepSync,
};
