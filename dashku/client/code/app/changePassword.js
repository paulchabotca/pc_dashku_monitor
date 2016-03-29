'use strict';


// GLOBALS
// - ss
// - serializeFormData
// - showLogoutState
// - alert


// Dependencies
//
var Helpers = require('./helpers');



// A helper function to render
// the change password page state
window.showChangePasswordState = function (token) {
	$(ss.tmpl.changePasswordModal.render({token: token})).modal();
};



// A helper function to validate
// that the change password form
// is valid, and render errors if
// it isn't.
var checkChangePasswordFormIsReady = function () {
	if ($('#changePasswordModal input[name="password"]').val().length > 5) {
		$('#changePasswordModal button').removeAttr('disabled');
	} else {
		$('#changePasswordModal button').attr('disabled', 'disabled');
	}
};



// Create event bindings on the change password modal
// being shown
$(document).on('shown', '#changePasswordModal', function () {
	$('#changePasswordModal button').attr('disabled', 'disabled');
	$('#changePasswordModal').on('hidden', function () {$(this).remove(); });
	$('#changePasswordModal input[name="password"]').keyup(function () { checkChangePasswordFormIsReady(); });
});


// Handle the change password form submission
$(document).on('submit', '#changePasswordModal form', function () {
	ss.rpc('authentication.changePassword', Helpers.serializeFormData(this), function (response) {
		if (response.status === 'success') {
			$('#changePasswordModal').modal('hide');
			showLogoutState();
			alert('Password changed. You can login now');
		} else {
			$('#changePasswordModal').modal('hide');
			alert('There was an error' + response.reason);
			// TODO - handle error messages in a better fashion		
		}
	});
	return false;
});