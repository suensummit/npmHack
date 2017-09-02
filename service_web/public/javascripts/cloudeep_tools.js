// Neil_20150603: Modify origin to naturalWidth and naturalHeight, and add fadeIn()
// Neil_20121129: Fit, scale, and crop image into a DIV.
function fitImageEvent(event) {
	var img = (event.currentTarget) ? event.currentTarget : event.srcElement;
	fitImage(img);
}
function fitImage(img) {
	if (!img || typeof($(img).attr('src'))=='undefined')
		return;

	var wParent = $(img).parent().width();
	var hParent = $(img).parent().height();
	var ratioParent = wParent / hParent;

	var w = $(img)[0].naturalWidth;
	var h = $(img)[0].naturalHeight;
	var ratio = w / h;

	var wResult, hResult;
	if (ratio > ratioParent) {
		wResult = Math.floor(ratio * hParent);
		hResult = hParent;			
	}
	else {
		wResult = wParent;
		hResult = Math.floor(wParent / ratio);
	}

	// var top = 0;
	var top = Math.floor((hParent - hResult) / 2);
	var left = Math.floor((wParent - wResult) / 2);

	$(img)
	.css({
		'position':'relative',
		'width': wResult+'px',
		'height': hResult+'px',
		'left': left+'px',
		'top': top+'px'
	})
	.fadeIn()
	;
}
// Neil_20160203
function fitAllImage() {
	$('.image img').each(function() {
		if (this.complete) fitImage($(this));
		else $(this).one('load', fitImageEvent);
	});
}

// Neil_20140903: Scale image into a DIV, no crop.
function fitDivEvent(event) {
	var img = (event.currentTarget)? event.currentTarget: event.srcElement;
	fitDiv(img);
}
function fitDiv(img) {
	if (!img || typeof($(img).attr('src'))=='undefined') return;

	var wParent = $(img).parent().width();
	var hParent = $(img).parent().height();
	var ratioParent = wParent / hParent;

	var origin = new Image();
	origin.src = $(img).attr('src');
	var w = origin.width;
	var h = origin.height;
	var ratio = w / h;

	var fitWidth = (ratioParent > ratio)? false: true;

	if (fitWidth) {
		$(img)
		.css({
			'position': 'relative',
			'top': (hParent - (wParent/ratio)) / 2,
			'left': 0,
			'width': wParent + 'px',
			'height': 'auto'
		})
		.fadeIn();
	}
	else {
		$(img)
		.css({
			// 'position': 'relative',
			// 'top': 0,
			// 'left': (wParent - (hParent*ratio)) / 2,
			'width': 'auto',
			'height': hParent + 'px'
		})
		.fadeIn();
	}
}

// Neil_20151230: Override the original message boxes and using bootstrap dialogs.
$('.modal').on('shown.bs.modal', function() {
	$('.modal .default_focus').focus();
});
function alert(message, callback) { 
	$('#modal_alert_message').html(message);
	$('#modal_alert').modal();
	$('#modal_alert').off('hidden.bs.modal');
	if (typeof(callback)=='function') {
		$('#modal_alert').on('hidden.bs.modal', callback);
	}
}
function inform(message, callback) {
	$('#modal_inform_message').html(message);
	$('#modal_inform').modal();
	$('#modal_inform').off('hidden.bs.modal');
	if (typeof(callback)=='function') {
		$('#modal_inform').on('hidden.bs.modal', callback);
	}
}
function confirm(message, confirm_callback, callback) {
	$('#modal_confirm_message').html(message);
	$('#modal_confirm').modal();
	$('#modal_confirm_ok').off('click');
	if (typeof(confirm_callback)=='function') {
		$('#modal_confirm_ok').on('click', confirm_callback)
	}
	$('#modal_confirm').off('hidden.bs.modal');
	if (typeof(callback)=='function') {
		$('#modal_confirm').on('hidden.bs.modal', callback);
	}
}
