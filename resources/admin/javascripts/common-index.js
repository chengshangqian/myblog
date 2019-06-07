/**
 * 管理首页公共JS
 */
var _record = {};

/**
 * 删除操作
 */
function remove(){
	
	var successHandler = (data,statusCode,xhr) => {
		if(data && 'success' === data.status){
			$('#statusMessage').html('记录删除成功.');
			$('#statusIcon').attr('src','/admin/images/success.png');
			_record.status = 'success';
		}
		else{
			$('#statusIcon').attr('src','/admin/images/failure.png');
			$('#statusMessage').html('记录删除失败：' + data.err);
			_record.status = 'failure';
		}
		
		$('#statusEl').toast('show');
	};
	
	$('#confirmModal').modal('hide');
	$.ajax({
		type: 'DELETE',
		url: _record.url,
		dataType: 'json',
		success:successHandler
	});
}

$(function() {

	/**
	 * 初始化确认操作（删除）提示
	 * 1.监控确认提示框展示事件：获取操作的数据
	 * 2.监控确认提示框隐藏事件：清理数据和提示内容
	 * 3.监控确认操作事件：提交后台处理
	 */
	$('#confirmModal').on('show.bs.modal', e => {
		_record = {
			id : e.relatedTarget.dataset.id,
			name : e.relatedTarget.dataset.name,
			url : e.relatedTarget.dataset.url
		};
		$('#modelMessage').html('确定删除此记录 ' + _record.name + ' 吗？');
	});

	$('#confirmModal').on('hidden.bs.modal', e => {
		//_record = {};
		$('#modelMessage').html('');
	});
	
	$('#confirmBtn').click(e => {
		remove();
	});
	
	/**
	 * 初始化操作状态提示
	 * 1.初始化提示框
	 * 2.监控提示框隐藏事件
	 */
	var statusEl = $('#statusEl');
	
	statusEl.toast({
		animation:true,
		autohide:true,
		delay:600
	});
	
	statusEl.on('hidden.bs.toast', function () {
		//删除成功，刷新页面
		if('success' === _record.status){
			window.location.reload();
		}
		else{
			//clear _record
			_record = {};
		}
	});	
});
