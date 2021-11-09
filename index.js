/*
 * @Description:
 * @Autor: Bowen
 * @Date: 2021-11-09 14:48:38
 * @LastEditors: Bowen
 * @LastEditTime: 2021-11-09 18:46:51
 */
const express = require("express");
const app = express();
const port = 80;
app.use("/public", express.static("public"));
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
