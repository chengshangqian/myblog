var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const helmet = require('helmet');
const setting = require('./utils/appSettings');
const util = require('./utils/utils');

/*格式化Date的JSON输出*/
Date.prototype.toFormat = function (pattern) { return util.dateFormat(this,pattern)};
//Date.prototype.toJSON = function () { return util.dateFormat(this,'yyyy-MM-dd hh:mm:ss')};
Date.prototype.toJSON = function () { return this.toFormat('yyyy-MM-dd hh:mm:ss')};

/*博客前台路由*/
var blogIndexRouter = require('./routes/blog/index');

/*博客后台路由*/
var adminIndexRouter = require('./routes/admin/index');

/*博客API(RESTful)路由*/
var apiUsersRouter = require('./routes/api/users');
var apiCategoriesRouter = require('./routes/api/categories');
var apiArticlesRouter = require('./routes/api/articles');
var apiTagsRouter = require('./routes/api/tags');
var apiWordsRouter = require('./routes/api/words');
var apiCommentsRouter = require('./routes/api/comments');
var apiBehaviorsRouter = require('./routes/api/behaviors');

var app = express();
//貌似无法隐藏x-powered-by响应头：访问/admin，验证未登录然后跳转res.redirect('/admin/login')时x-powered-by依然被开启
app.use(helmet());
//app.disable('x-powered-by');//上述情况也是无法隐藏x-powered-by

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var sessionOpts = {
	secret: 'myblog', name:'myblog-sid',
	resave: false, saveUninitialized: true,	
	cookie: {}
    //session保存到数据库中
	,store: new MongoStore({
		mongooseConnection: mongoose.connection,
		ttl: 1 * 60 * 60//1小时
	})
};
		 
if (app.get('env') === 'production') {
	app.set('trust proxy', 1); // trust first proxy
	sessionOpts.cookie.secure = true // 仅限https会话
}

app.use(session(sessionOpts));

/**
 * 在pug模板文件中可以使用session 
 */
app.use(function(req, res, next){
    res.locals.session = req.session;//放入session
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'resources')));
app.use(favicon(path.join(__dirname, 'resources', 'blog/images/favicon.ico')));


/*博客前台路由*/
app.use('/', blogIndexRouter);
app.use('/list', blogIndexRouter);
app.use('/article', blogIndexRouter);
app.use('/search', blogIndexRouter);
app.use('/like', blogIndexRouter);


/*检查后台登录状态*/
app.use('/admin', setting.loginVerify);
/*博客后台路由*/
app.use('/admin', adminIndexRouter);


/*CORS方式解决api跨域调用问题*/
app.use('/api', setting.enableCORS);
/*博客API(RESTful)路由*/
app.use('/api/users', apiUsersRouter);
app.use('/api/categories', apiCategoriesRouter);
app.use('/api/articles', apiArticlesRouter);
app.use('/api/tags', apiTagsRouter);
app.use('/api/words', apiWordsRouter);
app.use('/api/comments', apiCommentsRouter);
app.use('/api/behaviors', apiBehaviorsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect('mongodb://localhost/myblog',{ useNewUrlParser: true,useFindAndModify: false },error => {
  if(error)	console.error('连接数据库失败...');
  else console.log('连接数据库成功...'); 
});

module.exports = app;
