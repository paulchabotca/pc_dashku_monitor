'use strict';
// Documentation ruling the nation

// GLOBALS
// - ss
// - mainState
// - hljs



// View the documentation page
$(document).on('click', 'a#docs', function () {
	mainState.setState('docs');
	ss.rpc('general.getDocument', 'introduction/index', function (res) {
		$('#doc-content').html(res.content);
	});
});



// Render a document from the list on the left
$(document).on('click', '.document', function () {
	var doc = $(this).attr('data-document');
	ss.rpc('general.getDocument', doc, function (res) {
		$('#doc-content').html(res.content);
		$('#doc-content pre code').each(function (i, e) {
			hljs.highlightBlock(e);
		});
	});
});