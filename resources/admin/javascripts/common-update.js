/**
 * 新增/修改验证与成功提示
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
	
	/**
	 * 初始化操作状态提示
	 */
	$('#statusEl').toast({
		animation:true,
		autohide:true,
		delay:600
	});
	
	/**
	 * 提示操作状态信息
	 */
	var searchUrl = window.location.search;
	if(searchUrl.indexOf('status=success') > -1){
		$('#statusMessage').html('记录保存成功.');
		$('#statusIcon').attr('src','/admin/images/success.png');
		$('#statusEl').toast('show');
	}
	else if(searchUrl.indexOf('status=failure') > -1){
		$('#statusMessage').html('记录保存失败，请联系管理员.');
		$('#statusIcon').attr('src','/admin/images/failure.png');
		$('#statusEl').toast('show');		
	}
});