/**
 * 个人信息管理操作提示
 */

$(function() {	
	//显示上传文件的名称
	bsCustomFileInput.init();
	
	/**
	 * 修改密码
	 */
	$("#updatePasswdForm").submit(function( event ) {
		var form = this;
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		}
		form.classList.add('was-validated');		  
	});
});