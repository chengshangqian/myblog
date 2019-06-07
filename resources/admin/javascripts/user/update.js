/**
 * 新增/更新用户信息
 */

$(function() {
	
	//显示上传文件的名称
	bsCustomFileInput.init();
	
	$('#account').blur(function(e){
		var accountEl = $(this);
		var account = $.trim(accountEl.val()) || '';
		
		if(account){
			var nativeAccount = $('#nativeAccount').val() || '';
			if(nativeAccount !== account){
				$.get('/api/users/query/' + account,function(result){
					if(result.status == 'success'){
						$('#accountInvalidFeedback').html('该账号已经存在');
						//accountElem.setCustomValidity('该账号已经存在');
						accountEl.addClass('is-invalid');
					}
					else{
						//$('#accountInvalidFeedback').html('请输入账号');//恢复原来的提示文字
						accountEl.removeClass('is-invalid').addClass('is-valid');//有效，可以注册
					}
				});
			}				
		}
		else{
			$('#accountInvalidFeedback').html('请输入账号');
			accountEl.addClass('is-invalid');
		}
		
	});
	
});
