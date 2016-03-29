'use strict';

// A custom Event Emitter, there is probably a better 
// solution out there.
//
// TODO - investigate if there is a better option

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };



window.EE = (function() {
	function EE(options) {
		this.emit = __bind(this.emit, this);
		this.on = __bind(this.on, this);
		this.listeners = {};
		this.widget = jQuery('.widget[data-id=\'' + options.id + '\'] .content');
		if (options.scriptType === 'javascript') {
			eval(options.code);
		} else {
			eval(CoffeeScript.compile(options.code));
		}
		if (!options.dontEmit) {
			this.emit('load', options.loadData);
		}
	}



	EE.prototype.on = function(eventName, fnk) {
		var streamId;
		if (this.listeners[eventName]) {
			this.listeners[eventName].push(fnk);
		} else {
			this.listeners[eventName] = [fnk];
		}
		if (typeof eventName.match === 'function' ? eventName.match('stream_') : void 0) {
			streamId = eventName.split('_')[1];
			return ss.rpc('stream.subscribe', streamId, (function(_this) {
				return function (response) {
					return ss.event.on('stream_' + streamId, function (data) {
						return _this.emit('stream_' + streamId, data);
					});
				};
			})(this));
		}
	};



	EE.prototype.emit = function(eventName, data) {
		var fnk, _i, _len, _ref, _results;
		if (this.listeners[eventName]) {
			_ref = this.listeners[eventName];
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				fnk = _ref[_i];
				_results.push(fnk(data));
			}
			return _results;
		}
	};



	return EE;

})();