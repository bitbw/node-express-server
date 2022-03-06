/*
 * @Description: 图片转pdf
 * @Autor: Bowen
 * @Date: 2022-03-05 19:31:40
 * @LastEditors: Bowen
 * @LastEditTime: 2022-03-06 11:29:28
 */

const path = require("path");
const fs = require("fs").promises;
const imagesToPdf = require("images-to-pdf");
const Logger = require("../logger/logger")

const logger =  new Logger()



async function handleImage2PDF(dirname, output) {
  var files = await fs.readdir(dirname);
  for (const filename of files) {
    let filePath = path.resolve(dirname, filename);
    let stat = await fs.stat(filePath);
    // 是文件夹递归
    if (stat.isDirectory()) {
      let newOutput = path.resolve(output, filename);
      let newDirname = filePath;
      await handleImage2PDF(newDirname, newOutput);
      logger.info(`[log] ${filename} is dir handle handleImage2PDF`);
      continue;
    }
    let exts = [".png", ".jpg"];
    let { name, ext } = path.parse(filename);
    // 不是图片类型
    if (!exts.includes(ext)) {
      logger.info(`[log] ${ext} is ont in ${exts}`);
      continue;
    }
    // 路径无法创建
    let existStatu = await dirExists(output);
    if (!existStatu) {
      logger.info(`[log] ${output} is ont exist`);
      continue;
    }
    let imagePath = filePath;
    let PDFPath = path.resolve(output, `${name}.pdf`);
    await imagesToPdf([imagePath], PDFPath);
    logger.info(`[log] ${PDFPath} success`);
  }
}

handleImage2PDF(
  path.resolve(__dirname, "./images"),
  path.resolve(__dirname, "./pdfs")
);

/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
async function dirExists(dir) {
  //如果该路径且不是文件，返回true
  let isExists;
  try {
    isExists = await fs.stat(dir);
  } catch (error) {
    logger.info("[log][dirExists] path is not exist");
    // 创建目录
  }
  if (isExists) {
    //如果该路径存在但是文件，返回false
    if (isExists.isFile()) {
      return false;
    }
    // 存在返回 true
    if (isExists.isDirectory()) {
      return true;
    }
  }

  //如果该路径不存在
  let pDir = path.parse(dir).dir; //拿到上级路径
  //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
  let status = await dirExists(pDir);
  let mkdirStatus;
  if (status) {
    try {
      mkdirStatus = await fs.mkdir(dir);
    } catch (error) {
      return false;
    }
  }
  logger.info(`[log] ${dir} created`);
  return true;
}
