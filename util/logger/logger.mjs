/*
 * @Description: 日志 es modul
 * @LastEditors: Bowen
 * @LastEditTime: 2021-05-07 18:58:06
 */
import { promises as fs} from 'fs'
import path from 'path'
const defaultPaht = path.resolve("./log");
class Logger {
  constructor(option) {
    const {
      path = "",
      perfix = "",
      suffix = "",
      console = false,
      date = new Date()
    } = option;
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
    const data = `\n${this.perfix}${this.getDate()} [WARN]` + info + this.suffix;
    await this.write(data);
    if (this.console) {
      console.warn(data);
    }
  }
  async info(info) {
    const data = `\n${this.perfix}${this.getDate()} [INFO]` + info + this.suffix;
    await this.write(data);
    if (this.console) {
      console.log(data);
    }
  }
  async success(info) {
    const data =
      `\n${this.perfix}${this.getDate()} [SUCCESS]` + info + this.suffix;
    await this.write(data);
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
    await this.write(data);
    if (this.console) {
      console.error(data);
    }
  }
  async write(data) {
    try {
      const log = await fs.readFile(this.path);
      // 大于 1M 进行备份
      if (log.length > 1 * 1024 * 1024 ) {
        // 重命名 ： backuplog2021_01_12_12_01_12.log
        const newPath = path.resolve(
          path.dirname(this.path),
          `backuplog${this.getDate().replace(/\s|:|-/g,"_")}.log`
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

export default Logger
