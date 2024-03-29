const express = require('express')
const router = express.Router()
const JSZip = require('jszip')
const fs = require('fs').promises
const path = require('path')
const iconv = require('iconv-lite')
const { dirExists, handleImage2PDF, PDFToZip } = require('../util/image2pdf')
const { rmdirDeepSync } = require('../util/fs')
const { parseHaomoPages } = require('../util/page')
const Logger = require('../util/logger/logger')
const multiparty = require('multiparty')
const logger = new Logger({ perfix: '[api/util]' })
/* 
/api/util/image2pdf 
将image zip 批量转 pdf
 */
router.post('/image2pdf', async function (req, res, next) {
  // 获取form
  var form = new multiparty.Form()
  form.parse(req, async function (err, fields, files) {
    // zip
    var zip = new JSZip()
    let file = await fs.readFile(files.zip[0].path)
    // 读取zip文件
    let zips = await zip.loadAsync(file, {
      decodeFileName: function (bytes) {
        return iconv.decode(bytes, 'gbk') // 按中文编码
      }
    })
    // 遍历zip
    for (const key in zips.files) {
      if (Object.hasOwnProperty.call(zips.files, key)) {
        const zipObj = zips.files[key]
        let tempPath = path.resolve(__dirname, 'tmp_img')
        // 是文件夹
        if (zipObj.dir) {
          let tempPath = path.resolve(__dirname, 'tmp_img', zipObj.name)
          let pathExist = await dirExists(tempPath)
          if (!pathExist) logger.info(` 无法创建路径: ${tempPath}`)
          continue
        }
        // 图片路径
        let imagepath = path.resolve(tempPath, zipObj.name)
        let buffer = await zipObj.async('nodebuffer')
        fs.writeFile(imagepath, buffer)
      }
    }
    let inputDir = path.resolve(__dirname, 'tmp_img')
    let outputDir = path.resolve(__dirname, 'tmp_pdf')
    // 转换 pdf
    await handleImage2PDF(inputDir, outputDir)
    var zip = new JSZip()
    // 读出 所有 outputDir中的pdf
    zip = await PDFToZip(outputDir, outputDir, zip)
    res.set({
      'Content-type': 'application/zip',
      'Content-Disposition': 'attachment;filename=' + encodeURI('pdfs.zip'),
      'Access-Control-Expose-Headers': 'Content-Disposition'
    })
    // 创建一个可读流
    let fReadStream = await zip.generateNodeStream({ streamFiles: true })

    fReadStream.on('data', (chunk) => {
      res.write(chunk, 'binary')
    })
    fReadStream.on('end', function () {
      res.end()
    })

    // 删除文件夹
    rmdirDeepSync(inputDir)
    rmdirDeepSync(outputDir)
  })
})

/* 
/api/util/upload/gallery/one
将image 上传到/root/node-express-server/public/img/my_gallery
 */
router.post('/upload/gallery/one', async function (req, res) {
  // 获取form
  req.query
  var form = new multiparty.Form()
  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.sendStatus(403)
      return
    }
    let [url] = await writeGallery([files.image[0]])
    res.send(url)
  })
})
/* 
/api/util/haomo/trigger/data 
 */
router.get('/haomo/trigger/data', async function (req, res) {
  const result = {}
  const orginData = require('../db/carData.json')
  // 分页 carData 中的每个 key
  for (const key in orginData) {
    let datas = orginData[key]
    let options = {}
    Object.keys(req.query).map(key=>{
      // query 中的 value 都是字符串通过 parseFloat 转一下 
      // TODO: 后期有需求需要加个统一处理的方法
      options[key] = parseFloat(req.query[key])
    })
    result[key] = await parseHaomoPages(options, datas)
  }
  res.status(200).send(result)
})

/**
 * @description: 写入 my_gallery 并返回 url
 * @param {*} images
 * @return {*}
 */
async function writeGallery(images) {
  let urls = []
  for (const imageFile of images) {
    // buffer
    let buf = await fs.readFile(imageFile.path)
    // 写入文件
    await fs.writeFile(
      path.resolve(
        __dirname,
        '../public/img/my_gallery',
        // "/root/node-express-server/public/img/my_gallery",
        imageFile.originalFilename
      ),
      buf
    )
    // 删除temp
    await fs.unlink(imageFile.path)
    // 创建url
    const url =
      'https://bitbw.top/public/img/my_gallery/' + imageFile.originalFilename
    urls.push(url)
  }
  return urls
}

module.exports = router
