/*
 * @Description: 日志
 * @LastEditors: Bowen
 * @LastEditTime: 2022-03-06 11:31:55
 */

const fs = require("fs").promises;
const path = require("path");
const defaultPaht = path.resolve(__dirname, "log");

/**
 * @description:
 * @param  {*} write   是否写入文件
 * @param  {*} path    写入文件路径
 * @param  {*} perfix
 * @param  {*} suffix
 * @param  {*} console   是否 console.log
 * @param  {*} date
 * @return {*}
 */
class Logger {
  constructor(option = {}) {
    const {
      write = false,
      path = "",
      perfix = "",
      suffix = "",
      console = true,
      date = new Date(),
    } = option;
    this.write = write;
    this.path = path ? path : defaultPaht;
    this.perfix = perfix;
    this.suffix = suffix;
    this.console = console;
    this.date = date;
  }
  // 2021-01-12 12:01:12
  getDate() {
    const date = this.date;
    let month = date.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let day = date.getDay();
    day = day < 10 ? "0" + day : day;
    return `${date.getFullYear()}-${month}-${day} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }
  async warn(info) {
    const data =
      `\n${this.perfix}${this.getDate()} [WARN]` + info + this.suffix;
    if (this.write) {
      await this.write(data);
    }
    if (this.console) {
      console.warn(data);
    }
  }
  async info(info) {
    const data =
      `\n${this.perfix}${this.getDate()} [INFO]` + info + this.suffix;
    if (this.write) {
      await this.write(data);
    }
    if (this.console) {
      console.log(data);
    }
  }
  async success(info) {
    const data =
      `\n${this.perfix}${this.getDate()} [SUCCESS]` + info + this.suffix;
    if (this.write) {
      await this.write(data);
    }
    if (this.console) {
      console.log(data);
    }
  }
  async error(info) {
    const data =
      `\n${
        this.perfix
      }${this.getDate()} [ERROR]\n------Error Stack Begin------\n` +
      info +
      `\n-------Error Stack End------- ` +
      this.suffix;
    if (this.write) {
      await this.write(data);
    }
    if (this.console) {
      console.error(data);
    }
  }
  async write(data) {
    try {
      const log = await fs.readFile(this.path);
      // 大于 1M 进行备份
      if (log.length > 1 * 1024 * 1024) {
        // 重命名 ： backuplog2021_01_12_12_01_12.log
        const newPath = path.resolve(
          path.dirname(this.path),
          `backuplog${this.getDate().replace(/\s|:|-/g, "_")}.log`
        );
        await fs.rename(this.path, newPath);
      }
    } catch (error) {
      console.log("[日志备份失败]", error);
    }
    try {
      await fs.writeFile(this.path, data, { flag: "a+" });
    } catch (error) {
      console.log("[日志写入失败]:", this.path);
    }
  }
}

module.exports = Logger;
