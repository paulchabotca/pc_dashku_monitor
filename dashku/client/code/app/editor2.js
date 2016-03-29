'use strict';



// Dependencies
//
var scopeCSS  = require('./shared').scopeCSS;



// Editor v2
//
// A rewrite of the code editor. 
// Dependencies: $, $-ui(draggable), ss.tmpl(Hogan), CodeMirror, scopeCss global function, underscore.js

module.exports = {



	// loads the widget editor, and puts it on the page
	init: function (dashboardId, widget, exitCb) {
		this.dashboardId = dashboardId;
		this.widget = widget;
		if (!exitCb) { this.exitCb = null; } else {this.exitCb = exitCb; }
		$('body').append(ss.tmpl['widget-editor2'].render({scriptType: this.titleify(this.widget.scriptType)}));
		$('#editor2').hide().fadeIn(500);
		this.setupDataStore();
		this.element().draggable({handle:'.header'}).css({
			top: (window.innerHeight-this.element().height())/2 + 'px',
			left: (window.innerWidth-this.element().width())/2 + 'px'
		});
		this.bindTabs();
		this.bindActionButtons();
		this.bindCloseAction();
		this.selectTab('json');
	},



	// return the element
	element: function () {
		return $('#editor2');
	},



	// Loads CodeMirror with the code and the code's type
	loadEditor: function (value, mode, codeType) {
		var self = this;
		this.element().find('#editContainer').html('');
		this.editor = new CodeMirror(document.getElementById('editContainer'), {
			value: value,
			theme: 'twilight',
			lineWrapping: true,
			lineNumbers: true,
			tabSize: 2,
			onChange: function (cm) {
				self.store[codeType] = cm.getValue();
				self.liveUpdate(codeType, cm.getValue());
			}
		});

		this.editor.setOption('mode', mode);
		CodeMirror.autoLoadMode(this.editor, mode);
	},



	// binds the tabs for switching between different part's of the widget's code
	bindTabs: function () {
		var self = this;
		self.element().find('li.tab#script').tooltip({});
		self.element().find('li.tab').on('click', function (event) {
			self.selectTab($(event.currentTarget).attr('id'));
		});
	},



	// add Twitter tooltips to the action buttons, and bind their clicks
	bindActionButtons: function () {

		var self = this;

		self.element().find('#load').tooltip({});
		self.element().find('#transmit').tooltip({});
		self.element().find('#download').tooltip({});

		// bind the load click event
		self.element().find('#load').on('click', function () {
			self.liveUpdate('html', self.store.html);
			self.liveUpdate('css', self.store.css);
			self.ee = new EE({code: self.store.script, id: self.widget._id, scriptType: self.store.scriptType});
		});
	  
		// bind the transmit click event
		self.element().find('#transmit').on('click', function () {
			if (!self.ee) {
				self.ee = new EE({code: self.store.script, id: self.widget._id, scriptType: self.store.scriptType, loadData: {}});
			}
			self.ee.emit('transmission', JSON.parse(self.store.json));
		});

		self.element().find('#download').on('click', function () {
			self.exit(function () {
				self.exitCb();
				$(ss.tmpl['widget-scriptModal'].render({dashboardId: self.dashboardId, _id: self.widget._id})).modal();
			});
		});

	},



	// bind the close button
	bindCloseAction: function () {
		var self = this;
		self.element().find('a.close').tooltip({}).on('click', function () {
			self.exit(self.exitCb);
		});
	},



	// titleize's a title i.e 'coffeescript' => 'CoffeeScript'
	titleify: function (text) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	},



	// changes between javascript and coffeescript if the previous tab was 'script'
	changeScriptType: function (codeType) {
		var self = this;
		if (this.previousTab && this.previousTab === 'script' && codeType === 'script') {
			var newScriptType = _.difference(['javascript','coffeescript'],[self.store.scriptType])[0];
			self.store.scriptType = newScriptType;
			self.element().find('li.tab#script').text(this.titleify(newScriptType));
		}
	},



	// handles selection of tabs
	selectTab: function (codeType) {
		this.changeScriptType(codeType);
		this.element().find('li.tab').removeClass('active');
		this.element().find('li.tab#'+codeType).addClass('active');
		var cmCodeType = codeType;
		if (cmCodeType === 'html') { cmCodeType = 'xml'; }
		if (cmCodeType === 'script') { cmCodeType = this.store.scriptType; }
		if (cmCodeType === 'json') { cmCodeType = 'javascript'; }
		this.loadEditor(this.store[codeType], cmCodeType, codeType);
		this.previousTab = codeType;
	},



	// Creates an editable copy of the widget's code
	setupDataStore: function () {
		this.store = {
			html:       this.widget.html,
			css:        this.widget.css,
			script:     this.widget.script,
			scriptType: this.widget.scriptType,
			json:       this.widget.json
		};
	},



	// Updates ther widget's html and css on-the-fly
	liveUpdate: function (codeType, value) {
		var widgetElement = $('#widgets .widget[data-id="' + this.widget._id + '"]');
		switch (codeType) {
		case 'html':
			widgetElement.find('.content').html(value);
			break;
		case 'css':
			widgetElement.find('style').text(scopeCSS(value, this.widget._id));
			break;
		}
	},



	// Identifies any changes to the widget's code, and saves them if so
	identifyChanges: function (cb) {
		var changes = {};
		var code, codeType, _ref;

		_ref = this.store;
		for (codeType in _ref) {
			code = _ref[codeType];
			if (this.widget[codeType] !== code) {
				changes[codeType] = code;
			}
		}

		cb(changes);
	},



	// handles UI removal of editor
	wrapItUp: function (cb) {
		$('.tooltip').remove(); // prevent the download tooltip hanging around
		this.element().remove();
		if (typeof cb === 'function') { cb(); }
	},



	// removes the editor from the DOM, and saves any changes
	exit: function (cb) {
		var self = this;
		delete self.ee;
		self.identifyChanges(function (changes) {

			if (_.isEmpty(changes)) {
				self.wrapItUp(cb);
			} else {
				changes._id = self.widget._id;
				changes.dashboardId = self.dashboardId;
				ss.rpc('widget.update', changes, function (response) {
					if (response.status === 'success') {
						self.wrapItUp(cb);
					} else {
						// TODO - figure out a nice, generic way to handle these errors
						alert(response.reason);
						self.wrapItUp(cb);
					}
				});
			}
		});
	}


};