/**
 * 高亮当前菜单
 */
function highLightMenu(){
	var path = window.location.pathname;
	var menu = [
		'/admin/categories',
		'/admin/articles',
		'/admin/tags',
		'/admin/words',
		'/admin/comments',
		'/admin/users',
		'/admin/behaviors',
		'/admin/profile',
		'/admin'//首页放在最后，default值
		];
	for(var i = 0; i < menu.length; i++){
		var m = menu[i];
		if(path.indexOf(m) > -1){
			var el = $('ul#blogMenu li a[href="' + m + '"]');
			el.addClass('active');
			el.append('<span class="sr-only">(current)</span>');
			break;
		}
	}
};

$(function() {
	/**
	 * 初始化菜单图标
	 */
	if(feather){
		feather.replace();
	}
	
	/**
	 * 高亮当前菜单
	 */
	highLightMenu();
	
	/**
	 * 初始化搜索操作
	 * 1.监控搜索按钮事件
	 * 2.监控回车键事件
	 */
	$('#searchBtn').click(function(e){
		var searchKeywords = $('#searchKeywords').val();
		if(searchKeywords){
			$('#keywds').val(searchKeywords);
		}
		$('#searchForm').submit();		
	});
	
	$(document).keyup(function(event) {
		if (event.keyCode == 13) {
			var searchKeywords = $('#searchKeywords').val();
			if(searchKeywords){
				$('#keywds').val(searchKeywords);
				$('#searchForm').submit();
			}			
		}
	});
});