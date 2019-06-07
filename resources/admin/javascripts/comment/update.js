/**
 * 新增/修改评论
 */

$(function() {	
	//重新定义组件的样式
	$.widget( "custom.autocomplete", $.ui.autocomplete, {
		_renderItem: function( ul, item ) {
		    return $( "<li>" )
		    .addClass( "list-group-item list-group-item-action")
		    .append( item.label )
		    .appendTo( ul );
		}
	} );
	
	$('#articleEl').autocomplete({
		classes:{
			'ui-autocomplete': 'list-group',
			'ui-autocomplete-input': 'form-control'
		},
		source: function(request,response){
			var res = function (data){
				if(data && 'success' === data.status){
					var items = [];
					for(var i = 0 ; i < data.articles.length; i++){
						var article = data.articles[i];
						items.push({
							label:article.title,
							value:article.title,
							id:article._id//放入文章ID
						});
					}
					response(items);
				}
			};
			
			var url = '/api/articles';
			$.getJSON( url, {keywds: request.term}, res );
		},
	    //minLength: 2,
	    select: function( event, ui ) {
	    	$('#article').val(ui.item.id);
	    }
	 });
});