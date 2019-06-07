/**
 * 阅读文章
 * @returns
 */
$(function() {
	if(marked && hljs){
		/**
		 * 输出markdown格式的内容
		 */
		marked.setOptions({
			langPrefix:'',
			highlight : code => {
				var highlightCode = hljs.highlightAuto(code).value;
				return highlightCode;
			}
		});
		
		var content = $('#content');
		var md = content.html();
		content.html(marked(md));
		
		/**
		 * 高亮代码
		 */
		$('code').each(function(i, block) {
	        hljs.lineNumbersBlock(block);
	    });		
	}
	
	$('#liked').click(event => {
		event.preventDefault();
		var id = $('#article').val();
		console.log('id =======> ' , id);
		var url = '/like?id='+id;
		
		$.getJSON( url, function( data ) {
			if(data && data.status && 'success' === data.status){
				var liked = data.liked;
				console.log('data.article.liked  =====>  ',data.article.liked);
				$('#liked').html('喜欢 ( ' + data.article.liked + ' )');
			}
		});
	});
	
	$('#shared').click(event => {
		//TODO 开发
		alert('正在开发中，敬请期待...');
	});
	
	
	//更新阅读量
	$.getJSON( '/read?id='+$('#article').val(), function( data ) {
		if(data && data.status && 'success' === data.status){
			var read = data.read;
			console.log('data.article.read  =====>  ',data.article.read);
			$('#read').html(data.article.read);
		}
		else{
			console.log('data  =====>  ',data);
		}
	});	
});