var express = require('express');
var router = express.Router(); 
var appUtil = require('../../utils/utils');
const querystring = require('querystring');

/**
 * 博客首页
 */
var index = (req, res, next) => {
	var keywds = req.query.keywds || '';
	if(keywds){
		res.redirect('/search?keywds='+keywds);
		return;
	}
	
	//导航列表:即栏目
	var categories = [];
	
	//导航ID：除首页外，其值为栏目category的id
	var navi = 'index';
	
	//从数据库中查询所有栏目：栏目正常不会多于10个
	var data = {'limit':20};
	var opts = {
		path:'/api/categories?' + querystring.stringify(data),
		method:'GET'
	};
	
	appUtil.httpRequest(opts,rst => {
		categories = rst.categories;
		
		//从数据库中查询最近更新或发表的5篇文章
		data.limit = 5;
		data.published = true;
		data.sort = '-lastModifyTime';
		opts = {
			path:'/api/articles?' + querystring.stringify(data),
			method:'GET'
		};
		
		appUtil.httpRequest(opts,result => {
			result.categories = categories;
			result.navi = navi;
			res.render('blog/index', result);
		});
	});
};

/* 博客首页 */
router.get('/', index);


/**
 * 某栏目博客文章列表页
 */
var list = (req, res, next) => {
	var keywds = req.query.keywds || '';
	if(keywds){
		res.redirect('/search?keywds='+keywds);
		return;
	}
	
	//导航列表:即栏目
	var categories = [];
	
	var category = req.params.category || '';//当前栏目
	var navi = category;//当前导航ID
	
	//从数据库中查询所有栏目
	var data = {'limit':20,'page':1};
	var opts = {
		path:'/api/categories?' + querystring.stringify(data),
		method:'GET'
	};
	
	appUtil.httpRequest(opts,rst => {
		categories = rst.categories;
		
		//从数据库中查询当前栏目下的文章
		data.category = category;
		data.limit = req.query.limit || 15;
		data.page = req.query.page || 1;
		data.published = true;
		data.sort = '-lastModifyTime';
		opts = {
			path:'/api/articles?' + querystring.stringify(data),
			method:'GET'
		};
		
		appUtil.httpRequest(opts,result => {
			result.categories = categories;
			result.navi = navi;//当前导航ID
			res.render('blog/list', result);
		});
	});
};

/* 某栏目博客文章列表  */
router.get('/list/:category', list);


/**
 * 博客文章详情页
 */
var article = (req, res, next) => {
	var keywds = req.query.keywds || '';
	if(keywds){
		res.redirect('/search?keywds='+keywds);
		return;
	}
	
	//导航列表:即栏目
	var categories = [];
	//评论列表
	var comments = [];
	
	var data = {'limit':20};
	var opts = {
		path:'/api/categories?' + querystring.stringify(data),
		method:'GET'
	};
		
	appUtil.httpRequest(opts,rst => {
		categories = rst.categories;
		
		//当前文章
		var id = req.params.id || '';
		
		data.article = id;
		data.audited = true;//审核通过
		opts = {
			path:'/api/comments?' + querystring.stringify(data),
			method : 'GET'
		};
		
		appUtil.httpRequest(opts,rest => {
			comments = rest.comments;
			opts = {
				path:'/api/articles/' + id,
				method : 'GET'
			};			
			
			appUtil.httpRequest(opts,result => {
				result.categories = categories;
				result.comments = comments;
				result.navi = result.article.category._id;// 当前导航ID
				res.render('blog/article', result);
			});			
		});		

	});	
};

/* 博客文章详情页 */
router.get('/article/:id', article);


/**
 * 发表评论
 */
var comment = (req, res, next) => {
	var article = req.body.article || '';
	
	var remoteAddress = req.ip;
	var code = '评论（comment）';
	
	var data = { 
		article : article,
		nickname : req.body.nickname,
		email : req.body.email,
		content : req.body.content,
		audited : !!req.body.audited,
		remoteAddress : remoteAddress
	};
	
	var opts = {
		path:'/api/comments',
		data:data,
		method : 'POST'
	};
	
	//添加评论
	appUtil.httpRequest(opts,result => {
		if(result && 'success' === result.status){
			//开发机先用http版本，代部署产品环境，服务器配置了ssl后再启用https方式调用 
			var ipParam = remoteAddress.indexOf('127.0.0.1') > -1 ? '' : '&ip='+remoteAddress;
			opts = {
				host:appUtil.globalData.AMAP_WEB_API_SERVER_HOST,
				port:80,
				path:appUtil.globalData.AMAP_WEB_API_SERVER_PATH + '?key=' + appUtil.globalData.AMAP_WEB_APP_KEY + ipParam
			};
			
			//获取IP定位信息
			appUtil.httpRequest(opts,resp => {
				data = {
					article:article,
					code:code,
					target:req.headers.referer,
					remoteAddress:remoteAddress
				};
				
				if(resp && '1' == resp.status){
					data.position = {
						province:resp.province,
						city:resp.city,
						adcode:resp.adcode,
						rectangle:resp.rectangle
					};
				}
				
				opts = {
					path:'/api/behaviors',
					data:data,
					method : 'POST'
				};
				
				//新增评论行为记录
				appUtil.httpRequest(opts,rest => {
					console.log('添加评论行为：',rest);
				});					
			});
		}
		
		res.redirect('/article/'+article+'?status='+result.status + '#comments');
	});	
};

/* 发表评论 */
//router.get('/comment', comment);
router.post('/comment',comment);

/**
 * 阅读:每个IP每篇文章每天只算一次阅读
 * 由于数据库存储的是0时区的时间，所以对于服务器所在时区为北京时区（+8）来说，北京时间早上8点后可以刷新一次
 * 也可以将时间日期的字段，补上时间差再保存到数据库或进行比较，单显示在界面时，需要另外做相应处理
 */
var read =(req, res, next) => {
	var article = req.query.id || '';
	
	if(!article){
		res.json({status:'failure',err:'缺少必要参数article._id：'+id});
		return;
	}
	
	var remoteAddress = req.ip;
	
	var code = '阅读（read）';
	//发生时间大于等于今天
	var gteHappenedTime = appUtil.dateFormat(appUtil.UTCDate(),'yyyy-MM-dd');
	
	console.log("gteHappenedTime => ",gteHappenedTime);
	
	var data = {
		article:article	,
		remoteAddress:remoteAddress,
		gteHappenedTime: gteHappenedTime,
		code:code
	};
	
	var opts = {
		path:'/api/behaviors/?' + querystring.stringify(data),
		method : 'GET'
	};
	
	//查询是否有效阅读
	appUtil.httpRequest(opts,r => {
		if('success' === r.status){
			
			//无效阅读
			if(r.behaviors && r.behaviors.length > 0){
				res.json({status:'failure',err:'无效阅读量'});
				return;
			}
			
			//开发机先用http版本，代部署产品环境，服务器配置了ssl后再启用https方式调用 
			var ipParam = remoteAddress.indexOf('127.0.0.1') > -1 ? '' : '&ip='+remoteAddress;
			opts = {
				host:appUtil.globalData.AMAP_WEB_API_SERVER_HOST,
				port:80,
				path:appUtil.globalData.AMAP_WEB_API_SERVER_PATH + '?key=' + appUtil.globalData.AMAP_WEB_APP_KEY + ipParam
			};
			
			//获取IP定位信息
			appUtil.httpRequest(opts,resp => {
				data = {
					article:article,
					code:code,
					target:req.headers.referer || ('/article/'+article),
					remoteAddress:remoteAddress
				};
				
				if(resp && '1' == resp.status){
					data.position = {
						province:resp.province,
						city:resp.city,
						adcode:resp.adcode,
						rectangle:resp.rectangle
					};
				}				
				
				opts = {
					path:'/api/behaviors',
					data:data,
					method : 'POST'
				};
				
				//新增阅读行为，同时更新阅读量
				appUtil.httpRequest(opts,rest => {
					if('success' === rest.status){
						opts = {
							path:'/api/articles/' + article,
							data:{
								read:1//阅读量+1，如果是有效阅读量的话
							},
							method : 'PUT'
						};
						
						//更新文章阅读数
						appUtil.httpRequest(opts,result => {
							res.json(result);
						});
					}
					else{
						res.json(rest);
						console.log('添加阅读行为时出错：',rest);
					}
				});
			});
		}
		else{
			res.json(r);
			console.log('查询阅读量有效时出错：',r);
		}
	});	
};

/* 阅读 */
router.get('/read',read);

/**
 * 喜欢/点赞
 */
var like =(req, res, next) => {
	var article = req.query.id || '';
	
	if(!article){
		res.json({status:'failure',err:'缺少必要参数article._id：'+id});
		return;
	}
	
	var remoteAddress = req.ip;
	var data = {
		article:article	,
		remoteAddress:remoteAddress,
		code:'点赞（like）'
	};
	
	var opts = {
		path:'/api/behaviors/?' + querystring.stringify(data)
	};
	
	var operation = 'liked';
	var liked = 1;//自增1
	
	appUtil.httpRequest(opts,r => {
		if('success' === r.status){
			//存在相同IP的点赞，则取消点赞
			if(r.behaviors && r.behaviors.length > 0){
				var beahavior = r.behaviors[0];
				opts = {
					path:'/api/behaviors/' + beahavior._id,
					method : 'DELETE'
				};
				operation = 'cancelliked';
				liked = -1;//自减1
				
				//取消点赞
				appUtil.httpRequest(opts,rest => {
					if('success' === rest.status){
						opts = {
							path:'/api/articles/' + article,
							data:{
								liked:liked
							},
							method : 'PUT'
						};
						
						//更新文章点赞数
						appUtil.httpRequest(opts,result => {
							result.operation = operation;
							result.liked = liked;
							res.json(result);
						});
					}
				});				
			}
			else{
				//开发机先用http版本，代部署产品环境，服务器配置了ssl后再启用https方式调用 
				var ipParam = remoteAddress.indexOf('127.0.0.1') > -1 ? '' : '&ip='+remoteAddress;
				opts = {
					host:appUtil.globalData.AMAP_WEB_API_SERVER_HOST,
					port:80,
					path:appUtil.globalData.AMAP_WEB_API_SERVER_PATH + '?key=' + appUtil.globalData.AMAP_WEB_APP_KEY + ipParam
				};				
				//获取IP定位信息
				appUtil.httpRequest(opts,resp => {
					data.target = req.headers.referer;
					
					if(resp && '1' == resp.status){
						data.position = {
							province:resp.province,
							city:resp.city,
							adcode:resp.adcode,
							rectangle:resp.rectangle
						};
					}
					
					//添加新的点赞
					opts = {
						path:'/api/behaviors',
						data:data,
						method : 'POST'
					};
					
					//新增点赞
					appUtil.httpRequest(opts,rest => {
						if('success' === rest.status){
							opts = {
								path:'/api/articles/' + article,
								data:{
									liked:liked
								},
								method : 'PUT'
							};
							
							//更新文章点赞数
							appUtil.httpRequest(opts,result => {
								result.operation = operation;
								result.liked = liked;
								res.json(result);
							});
						}
					});					
				});				
			}
		}
		else{
			res.json(r);
			console.log('点赞/取消点赞时出错：',r);
		}
	});	
};

/* 喜欢 */
router.get('/like',like);


/**
 * 博客文章搜索
 */
var search = (req, res, next) => {
	//导航列表:即栏目
	var categories = [];
	
	var data = {'limit':20};
	var opts = {
			path:'/api/categories?' + querystring.stringify(data),
			method:'GET'
	};
	
	appUtil.httpRequest(opts,rst => {
		categories = rst.categories;
		
		//关键字模糊查询，匹配title,subtitle,summary,content四个字段
		var keywds = req.query.keywds || '';
		if(keywds){
			data.keywds = keywds;
			data.keywdsFields = 'title,subtitle,summary,content';
		}
		
		//从数据库中查询符合条件的文章
		data.limit = req.query.limit || 15;
		data.page = req.query.page || 1;
		data.published = true;
		data.sort = '-lastModifyTime';
		opts = {
			path:'/api/articles?' + querystring.stringify(data),
			method:'GET'
		};
		
		appUtil.httpRequest(opts,result => {
			result.categories = categories;
			result.keywds = keywds;
			result.navi = 'search';//当前导航ID，不active导航栏文字
			res.render('blog/search', result);
		});
	});		
};

/* 博客文章搜索 */
router.get('/search', search);
router.post('/search',search);

module.exports = router;

