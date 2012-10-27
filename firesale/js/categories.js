$(function(){

	var tabs = $('#tabs').tabs({add: function(event,ui) { $(ui.panel).insertAfter('#general'); $('#'+ui.panel.id).addClass('form_inputs'); }});
	if( !window.location.hash ) {
		tabs.tabs("select", '#general');
	}
	
	$item_list	= $('ul.sortable');
	$url		= 'admin/firesale/categories/order';
	$cookie		= 'open_cats';
	
	$details 	= $('div#category-sort');
	$details.append('<input type="hidden" name="cat-id" id="cat-id" value="" />');
	$details_id	= $('div#category-sort #cat-id');
		
	$item_list.find('li a').live('click', function(e) {

		e.preventDefault();
		$a = $(this);
			
		cat_id		= $a.attr('rel');
		cat_title 	= $a.text();
		$('#category-sort a').removeClass('selected');
		$a.addClass('selected');
		$details_id.val(cat_id);

		$('li a[href=#images]').parents('li').remove();
		$('#images').remove();
		tabs.tabs('refresh');
		
		$.getJSON(SITE_URL+'admin/firesale/categories/ajax_cat_details/' + $details_id.val(), function(data) {

			$('button.delete').remove();
			$('.one_half.last .title h4').text('Edit "' + data.title + '"');
			$('#tabs input[name=id]').val(data.id);
			$('.form_inputs input[name=title]').val(data.title);
			$('.form_inputs input[name=slug]').val(data.slug);
			if( data.parent != null ) { $('.form_inputs select[name=parent]').val(data.parent.id).trigger('liszt:updated'); }
			if( data.status != null ) { $('.form_inputs select[name=status]').val(data.status.key).trigger('liszt:updated'); }
			$('.form_inputs textarea[name=description]').val(data.description);
			$('div.buttons').html('').append('<button type="submit" class="btn blue" value="save" name="btnAction"><span>Edit Category</span></button>')
			.append(( data.id != 1 ? ' <button name="btnAction" value="delete" class="btn red confirm"><span>Delete</span></button>' : '' ));

			tabs.tabs('add', '#images', 'Images');
			$("#images").load(SITE_URL+'admin/firesale/categories/ajax_cat_images/' + $details_id.val(), function() {
				bind_upload('admin/firesale/categories/upload/'+data.id);
				$('#dropbox').sortable({
					cursor: 'move',
					cancel: 'span.message',
					stop: function(event, ui) {
						var o = '';
						$('#dropbox .preview').each(function(){ o += ',' + $(this).attr('id').replace('image-', ''); });
						$.post(SITE_URL+'admin/firesale/products/ajax_order_images', { order: o.substr(1), csrf_hash_name: $.cookie(pyro.csrf_cookie_name) }, function(data) {
							if( data != 'ok' ) { alert(data); }
						});
					}
				});
			});

		});
		
		return false;
	});
	
	data_callback = function(even, ui) {

		root_cats = [];
	
		$('ul.sortable').children('li').each(function(){
			root_cats.push($(this).attr('id').replace('cat_', ''));
		});
	
		return { 'root_cats' : root_cats };
	}
	
	post_sort_callback = function() {		
		$details 	= $('div#category-sort');
		$details_id	= $('div#category-sort #cat-id');
	}

	pyro.sort_tree($item_list, $url, $cookie, data_callback, post_sort_callback);
	
	pyro.generate_slug($('input[name=title]'), $('input[name=slug]'), '-');
	
});
