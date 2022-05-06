var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// const formidable = require('express-formidable') // 引入

var indexRouter = require("./routes/index");
var utilRouter = require("./routes/util");

var app = express();

//设置CORS
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); //当允许携带cookies此处的白名单不能写’*’
  res.header(
    "Access-Control-Allow-Headers",
    "Accept-Ranges, Content-Encoding,  Content-Range, content-type,Content-Length, Authorization,Origin,Accept,X-Requested-With"
  ); //允许的请求头
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT"); //允许的请求方法
  res.header("Access-Control-Allow-Credentials", true); //允许携带cookies
  next();
});
// /public/**
app.use("/public", express.static("public", { maxAge: "1d" }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
// formdata
// app.use(formidable());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use("/", indexRouter);
app.use("/api/util", utilRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
