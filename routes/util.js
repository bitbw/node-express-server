const express = require("express");
const router = express.Router();
const JSZip = require("jszip");
const fs = require("fs").promises;
const path = require("path");
const iconv = require("iconv-lite");
const { dirExists, handleImage2PDF, PDFToZip } = require("../util/image2pdf");
const { rmdirDeepSync } = require("../util/fs");
const Logger = require("../util/logger/logger");
const multiparty = require("multiparty");
const logger = new Logger({ perfix: "[api/util]" });
/* GET users listing. */
router.post("/image2pdf", async function (req, res, next) {
  // 获取form
  var form = new multiparty.Form();
  form.parse(req, async function (err, fields, files) {
    // zip
    var zip = new JSZip();
    let file = await fs.readFile(files.zip[0].path);
    // 读取zip文件
    let zips = await zip.loadAsync(file, {
      decodeFileName: function (bytes) {
        return iconv.decode(bytes, "gbk"); // 按中文编码
      },
    });
    // 遍历zip
    for (const key in zips.files) {
      if (Object.hasOwnProperty.call(zips.files, key)) {
        const zipObj = zips.files[key];
        let tempPath = path.resolve(__dirname, "tmp_img");
        // 是文件夹
        if (zipObj.dir) {
          let tempPath = path.resolve(__dirname, "tmp_img", zipObj.name);
          let pathExist = await dirExists(tempPath);
          if (!pathExist) logger.info(` 无法创建路径: ${tempPath}`);
          continue;
        }
        // 图片路径
        let imagepath = path.resolve(tempPath, zipObj.name);
        let buffer = await zipObj.async("nodebuffer");
        fs.writeFile(imagepath, buffer);
      }
    }
    let inputDir = path.resolve(__dirname, "tmp_img");
    let outputDir = path.resolve(__dirname, "tmp_pdf");
    // 转换 pdf
    await handleImage2PDF(inputDir, outputDir);
    var zip = new JSZip();
    // 读出 所有 outputDir中的pdf
    zip = await PDFToZip(outputDir, outputDir, zip);
    res.set({
      "Content-type": "application/zip",
      "Content-Disposition": "attachment;filename=" + encodeURI("pdfs.zip"),
      "Access-Control-Expose-Headers": "Content-Disposition",
    });
    // 创建一个可读流
    let fReadStream = await zip.generateNodeStream({ streamFiles: true });

    fReadStream.on("data", (chunk) => {
      res.write(chunk, "binary");
    });
    fReadStream.on("end", function () {
      res.end();
    });

    // 删除文件夹
    rmdirDeepSync(inputDir);
    rmdirDeepSync(outputDir);
  });
});

module.exports = router;
