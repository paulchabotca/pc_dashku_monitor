'use strict';

// GLOBALS
// - ss
// - mainState
// - showLogoutState
// - serializeFormData
// - alert



var Helpers = require('./helpers');



// Change Email



/* Render the account page state if the user 
   clicks on their name */
$(document).on('click', 'a#name', function () {
	ss.rpc('authentication.account', function (response) {
		if (response.status === 'success') {
			mainState.setState('account', response.user);
		} else {
			showLogoutState();
		}
	});
});



/* A helper function which validates
   the change email address form, and
   handles error rendering. */
var checkChangeEmailFormIsReady = function () {
	$('#changeEmailModal input[name="email"]').parent().removeClass('control-group error');
	if ($('#changeEmailModal input[name="email"]').val().match('@') !== null) {
		$('#changeEmailModal button').removeAttr('disabled');
	} else {
		$('#changeEmailModal button').attr('disabled', 'disabled');
	}
};



// Change email dialogue modal
$(document).on('click', '#changeEmail', function () {
	$(ss.tmpl['account-changeEmailModal'].r()).modal();
});



// Create Event bindings on the change email modal being shown
$(document).on('shown', '#changeEmailModal', function () {
	$('#changeEmailModal button').attr('disabled', 'disabled');
	$('#changeEmailModal').on('hidden', function () { $(this).remove(); });
	$('#changeEmailModal input[name="email"]').keyup(function () { checkChangeEmailFormIsReady(); });
	$('#changeEmailModal input[name="email"]').blur(function () { checkChangeEmailFormIsReady(); });
});



// Event binding on the change email form being submitted
$(document).on('submit', '#changeEmailModal form', function () {
	ss.rpc('authentication.changeEmail', Helpers.serializeFormData(this), function (response) {
		if (response.status === 'success') {
			$('#changeEmailModal').modal('hide');
			ss.rpc('authentication.account', function (response) {
				if (response.status === 'success') {
					mainState.setState('account', response.user);
				} else {
					showLogoutState();
				}
			});
		} else {
			$('#changeEmailModal input[name="email"]').val('').attr('placeholder', response.reason).parent().addClass('control-group error');
		}
	});
	return false;
});



// Change Password



// A helper function which validates
// the fields in the change password form,
// and handles error rendering
var checkChangeAccountPasswordFormIsReady = function () {
	var currentPassword = $('#changeAccountPasswordModal input[name="currentPassword"]').val();
	var newPassword     = $('#changeAccountPasswordModal input[name="newPassword"]').val();
	$('#changeAccountPasswordModal input').parent().removeClass('control-group error');
	if (currentPassword.length > 5 && newPassword.length > 5) {
		$('#changeAccountPasswordModal button').removeAttr('disabled');
	} else {
		$('#changeAccountPasswordModal button').attr('disabled', 'disabled');
	}
};



// Event binding to display the change password modal
$(document).on('click', '#changePassword', function () {
	$(ss.tmpl['account-changePasswordModal'].r()).modal();
});



// create Event bindings when the change
// account password modal is shown
$(document).on('shown', '#changeAccountPasswordModal', function () {
	$(this).find('button').attr('disabled', 'disabled');
	$(this).on('hidden', function () { $(this).remove(); });
	$(this).find('input[name="newPassword"]').keyup(function () { checkChangeAccountPasswordFormIsReady(); });
	$(this).find('input[name="newPassword"]').blur(function () { checkChangeAccountPasswordFormIsReady(); });
});



// Handle the submission of the change password form
$(document).on('submit', '#changeAccountPasswordModal form', function () {
	ss.rpc('authentication.changeAccountPassword', Helpers.serializeFormData(this), function (response) {
		if (response.status === 'success') {
			$('#changeAccountPasswordModal').modal('hide');
			alert('Password changed');
		} else {
			$('#changeAccountPasswordModal input').val('').attr('placeholder', response.reason).parent().addClass('control-group error');
		}
	});
	return false;
});



// Cancel Account



// A helper function for the cancel account form.
// Checks that the values in the form are valid,
// and performs error rendering.
var checkCancelAccountFormIsReady = function () {
	$('#cancelAccountModal input[name="password"]').parent().removeClass('control-group error');
	if ($('#cancelAccountModal input[name="password"]').val().length > 5) {
		$('#cancelAccountModal button').removeAttr('disabled');
	} else {
		$('#cancelAccountModal button').attr('disabled', 'disabled');
	}
};



// Render the cancel account modal when the link is clicked
$(document).on('click', '#cancelAccount', function () {
	$(ss.tmpl['account-cancelAccountModal'].r()).modal();
});



// Create event bindings on the cancel account form
$(document).on('shown', '#cancelAccountModal', function () {
	$('#cancelAccountModal button').attr('disabled', 'disabled');
	$('#cancelAccountModal').on('hidden', function () { $(this).remove(); });
	$('#cancelAccountModal input[name="password"]').keyup(function () { checkCancelAccountFormIsReady(); });
	$('#cancelAccountModal input[name="password"]').blur(function () { checkCancelAccountFormIsReady(); });
});



// Handle the cancel account form submission
$(document).on('submit', '#cancelAccountModal form', function () {
	ss.rpc('authentication.cancelAccount', Helpers.serializeFormData(this), function (response) {
		if (response.status === 'success') {
			$('#cancelAccountModal').modal('hide');
			showLogoutState();
		} else {
			$('#cancelAccountModal input[name="password"]').val('').attr('placeholder', response.reason).parent().addClass('control-group error');
		}
	});
	return false;
});