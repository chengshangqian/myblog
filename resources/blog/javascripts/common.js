/**
 * 博客公共JS
 * @returns
 */
$(function() {
	/**
	 * 初始化搜索操作
	 * 1.监控搜索按钮事件
	 * 2.监控回车键事件
	 */
	$('#searchBtn').click(function(event){
		event.preventDefault();
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