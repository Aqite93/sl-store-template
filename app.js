var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookie = require("cookie-parser");
var session = require("express-session");
var bodyParser = require("body-parser");
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var bcrypt = require('bcryptjs');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'smart_locker'
});
connection.connect();

var app = express();

// ミドルウエアの設定
app.use("/public", express.static("public"));
app.use(cookie());
app.use(session({ secret: "CDDEC4AB-2792-4876-9C18-8CFC8E45D713", resave: true, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post('/login', function (req, res) {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    connection.query('SELECT * from user where name = ?;', ['testuser'], function (err, row, fields) {
      if (err) {
        console.log('err: ' + err);
      }
      console.log('compare result: ' + bcrypt.compareSync(req.body.password, row[0].password))
      // res.redirect("http://google.com");
      // res.render("./management/top.ejs");
      res.render("./management/top_template.ejs");
    });
  });
});

app.get('/user/lists', function (req, res) {
  connection.query('SELECT * from user;', function (err, rows, fields) {
    if (err) {
      console.log('err: ' + err);
    }
    console.log(rows)
    // res.render("./management/userlist.ejs", { boardList: rows });
    res.render("./management/userlist_template.ejs", { boardList: rows });
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
