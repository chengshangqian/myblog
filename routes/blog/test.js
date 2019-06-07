let t ="2018-02-13 23:59:59";
let d = new Date(t);
console.info(d);
console.info(d.toString());
console.info(d.toLocaleString());
console.info(d.toLocaleTimeString());
console.info(d.toLocaleDateString());
console.info('--------------');
d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
console.info(d);
console.info(d.toString());
console.info(d.toLocaleString());
console.info(d.toLocaleTimeString());
console.info(d.toLocaleDateString());
//var appUtil = require('../../utils/utils');
//var opts = {
//	path:'/api/users/5cf7186326925a0e6c0d4ab8',
//	method : 'DELETE'
//};
//
//appUtil.httpRequest(opts,result => {
//	console.log('result ===> ',{ok:'1'});
//});

console.log('result ===> ',{ok:'1'});
console.log('result ===> ',{ok:1});