'use strict';



// Used to make sure that the CSS for the widget affects only
// that widget, and does not bleed into the rest of the html
// in the page
//
// @param 	text 	String 		The css
// @param 	id 		String 		The id of the widget
// @return 	text 	String 		The scoped css
//
var scopeCSS = function (text,id) {
	var lines = text.split('\n');

	lines.forEach(function (line) {
		if (line.match(/{/) !== null) {
			text = text.replace(line, '.widget[data-id=\''+ id +'\'] ' + line);
		}
	});

	return text;
};



// Expose the module as the public API
//
module.exports = {
	scopeCSS: scopeCSS
};