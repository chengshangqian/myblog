/**
 * 成序员博客管理系统
 * 登录验证
 */
$(function() {	
	$("#updateForm").submit(function( event ) {
		var form = this;
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		}
		form.classList.add('was-validated');		  
	});
});
