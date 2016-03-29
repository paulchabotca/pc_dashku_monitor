'use strict';



//// Signup ////
//
// At the moment, the logic for the validations is on the client,
// which isn't ideal. I would like to have them be on the server
// in the model, and be exposed to the client for the form to use.
//
// TODO - Change location of validation logic to the ODM level, 
// and find a way to expose it to the client.



// Validates that the attribute is a non-empty value
function validatePresence (value, trueFunction, falseFunction) {
	if (value !== '') {
		trueFunction();
	} else {
		falseFunction();
	}
}



// Validates that the attribute is unique
function validateUniqueness (key, value, trueFunction, falseFunction) {
	var check = {};
	check[key] = value;
	ss.rpc('authentication.isAttributeUnique', check, function (attributeIsUnique) {
		if (attributeIsUnique) {
			trueFunction();
		} else {
			falseFunction();
		}
	});
}



// Validates that the email address is valid
function validateFormat (value, format, trueFunction, falseFunction) {
	if (value.match(/^([\w.-]+)@([\w.-]+)\.([a-zA-Z.]{2,6})$/i) !== undefined) {
		trueFunction();
	} else {
		falseFunction();
	}
}



// Validates that the attribute is at least a certain length
function validateMinimumLength (value, number, trueFunction, falseFunction) {
	if (value.length > (number - 1)) {
		trueFunction();
	} else {
		falseFunction();
	}
}



var ErrorHandler;

ErrorHandler = (function() {


	function ErrorHandler() {
		this.errors = {};
	}



	ErrorHandler.prototype.addError = function(key, value, cb) {
		if (!cb) {
			cb = null;
		}
		if (this.errors[key]) {
			if (!this.errors[key].indexOf(value !== -1)) {
				this.errors[key].push(value);
			}
		} else {
			this.errors[key] = [value];
		}
		if (cb) {
			return cb();
		}
	};



	ErrorHandler.prototype.removeError = function(key, value, cb) {
		var index;
		if (!cb) {
			cb = null;
		}
		if (this.errors[key]) {
			index = this.errors[key].indexOf(value);
			if (index !== -1) {
				this.errors[key].splice(index, 1);
			}
			if (this.errors[key].length === 0) {
				delete this.errors[key];
			}
		}
		if (cb) {
			return cb();
		}
	};



	ErrorHandler.prototype.removeErrors = function(key, cb) {
		if (!cb) {
			cb = null;
		}
		delete this.errors[key];
		if (cb) {
			return cb();
		}
	};



	ErrorHandler.prototype.valid = function() {
		return Object.keys(this.errors).length === 0;
	};



	return ErrorHandler;

})();




module.exports = {



	// Displays the signup modal, and creates bindings 
	init: function (options) {
		var self = this;
		if (!options) { options = {}; }
		self.id = Math.random().toString().split('.')[1];
		$(ss.tmpl.signupModal.r()).attr('id', 'signup_' + self.id).modal();
		$(document).on('shown', '#signup_' + self.id, function () {
			self.bindUponRender(options);
		});
	},



	// Create bindings for the sign modal form
	bindUponRender: function (options) {
		this.errorHandler = new ErrorHandler();
		this.disableSubmitButton();
		this.bindUsernameValidation();
		this.bindEmailValidation();
		this.bindPasswordValidation();
		this.bindSignupFunction(options.signupFunction);
		this.bindUponClosure();
	},



	// A simple semanic function
	enableSubmitButton: function () {
		this.element().find('button').removeAttr('disabled');
	},



	// A simple semanic function
	disableSubmitButton: function () {
		this.element().find('button').attr('disabled', 'disabled');
	},
	


	// Binds the validations to the username field
	bindUsernameValidation: function () {
		var self = this;
		var inputElement = this.element().find('input[name="username"]');
		inputElement.blur(function () {
			validatePresence(
				inputElement.val(),
				function () {
					self.errorHandler.removeError(inputElement.attr('name'), 'cannot be empty', function () {
						validateUniqueness(
							inputElement.attr('name'),
							inputElement.val(),
							function () {
								self.removeError(inputElement, 'is already taken');
							},
							function () {
								self.applyError(inputElement, 'is already taken');
							}
						);
					});
				},
				function () {
					self.applyError(inputElement, 'cannot be empty');
				}
			);
		});
	},



	// Binds the validations to the email field
	bindEmailValidation: function () {
		var self = this;
		var inputElement = this.element().find('input[name="email"]');
		inputElement.blur(function () {
			validatePresence(
				inputElement.val(),
				function () {
					self.errorHandler.removeError(inputElement.attr('name'), 'cannot be empty', function () {
						validateFormat(
							inputElement.val(),
							/^([\w.-]+)@([\w.-]+)\.([a-zA-Z.]{2,6})$/i,
							function () {
								self.errorHandler.removeError(inputElement.attr('name'), 'is not the right format', function () {
									validateUniqueness(
										inputElement.attr('name'),
										inputElement.val(),
										function () {
											self.removeError(inputElement, 'is already taken');
										},
										function () {
											self.applyError(inputElement, 'is already taken');
										}
									);
								});
							},
							function () {
								self.applyError(inputElement, 'is not the right format');
							}
						);
					});
				},
				function () {
					self.applyError(inputElement, 'cannot be empty');
				}
			);
		});
	},



	// Binds the validations to the password field
	bindPasswordValidation: function () {
		var self = this;
		var inputElement = this.element().find('input[name="password"]');
		inputElement.keyup(function () {
			validateMinimumLength(
				inputElement.val(),
				6,
				function () {
					self.removeError(inputElement, 'is too short');
				},
				function () {
					self.applyError(inputElement, 'is too short', true);
				}
			);
		});
		
		inputElement.blur(function () {
			if (inputElement.val().length < 6) { inputElement.val(''); }
		});
 
	},



	// Stores the error in the ErrorHandler class, and renders it visually.
	//
	// Ideally, I think that this function should execute on ErrorHandler
	// receiving an error
	applyError: function (inputElement, message, dontClearValue) {
		var self = this;
	    if (!dontClearValue) { dontClearValue = false; }
		this.errorHandler.addError(inputElement.attr('name'), message, function () {
			inputElement.parent().addClass('control-group error');
			if (!dontClearValue) { inputElement.val(''); }
			inputElement.attr('placeholder', inputElement.attr('name') + ' ' + message);
			inputElement.focus(function () {
				inputElement.attr('placeholder', inputElement.attr('name'));
			});
			self.checkFormIsReady();
		});
	},



	// Removes the error in the ErrorHandler class, and removes it from the form
	//
	// Like the function above, I think that this should be bound to the ErrorHandler
	// class in some way
	removeError: function (inputElement, message) {
		var self = this;
		self.errorHandler.removeError(inputElement.attr('name'), message, function () {
			inputElement.parent().removeClass('control-group error');
			inputElement.attr('placeholder', inputElement.attr('name'));
			self.checkFormIsReady();
		});
	},



	// Checks the fields in the form have valid attributes, and will 
	// either enable or disable the submit button. 
	checkFormIsReady: function () {
		var username  = this.element().find('input[name="username"]').val() !== '';
		var email     = this.element().find('input[name="email"]').val() !== '';
		var password  = this.element().find('input[name="password"]').val() !== '';
		if (username && email && password && this.errorHandler.valid()) {
			this.enableSubmitButton();
		} else {
			this.disableSubmitButton();
		}
	},



	// This does a bit of cleanup when the modal is closed
	bindUponClosure: function () {
		this.errors = {};
		$(document).on('hidden', '#signup_' + this.id, function () {
			$(this).remove();
		});
	},



	// This binds the signup function to the form submission
	bindSignupFunction: function (signupFunction) {
		var self = this;
		if (signupFunction) {
			self.element().find('form').submit(function () {
				return signupFunction(self.element());
			});
		}
	},



	// A semantic helper function
	element: function () {
		return $('#signup_' + this.id);
	}



};