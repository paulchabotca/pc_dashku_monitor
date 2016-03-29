'use strict';



// Dependencies
//
var Helpers = require('./helpers');



// Enable the user to submit the login form if the fields are valid
var checkLoginFormIsReady = function () {
	if ($('#loginModal input[name="password"]').val().length > 5 && $('#loginModal input[name="identifier"]').val().length > 0) {
		$('#loginModal button').removeAttr('disabled');
	} else {
		$('#loginModal button').attr('disabled', 'disabled');
	}
};



// Bind events when the login form is visible
$(document).on('shown', '#loginModal', function () {
	$('#loginModal button').attr('disabled', 'disabled');
	$('#loginModal').on('hidden', function () {
		$(this).remove();
	});

	$('#loginModal input[name="identifier"]').keyup(function () { checkLoginFormIsReady(); });
	$('#loginModal input[name="password"]').keyup(function () { checkLoginFormIsReady(); });
	checkLoginFormIsReady();
});



// Remove the modal once it is hidden
$(document).on('hidden', '#loginModal', function () {
	$(this).remove();
});



// Login the user when they submit the login form
$(document).on('submit', '#loginModal form', function () {
	ss.rpc('authentication.login', Helpers.serializeFormData(this), function (response) {
		if (response.status === 'success') {
			$('#loginModal').modal('hide');
			showLoginState({username: response.user.username});
		} else {
			$('#loginModal input[name="password"]').val('').attr('placeholder', response.reason).parent().addClass('control-group error');
			$('#loginModal .forgotPassword').removeClass('hidden');
		}
	});
	return false;
});



// Display the login modal when clicking the login button
$(document).on('click', 'a#login', function () {
	$(ss.tmpl.loginModal.r()).modal();
});



// change the page state to that of the homepage
$(document).on('click', 'a#logout', function () {
	ss.rpc('authentication.logout', function (response) {
		if (response.status === 'success') {
			showLogoutState();
		} else {
			alert('There was an error - ' + response.reason);
		}
	});
});



// Clear the error style when the user focuses on the password field
$(document).on('focus', '#loginModal input[name="password"]', function () {
	$(this).parent().removeClass('control-group error');
});



// Send an email for the forgotten password issue
$(document).on('click', '.forgotPassword a', function () {
	var element = $(this);
	ss.rpc('authentication.forgotPassword', $('#loginModal input[name="identifier"]').val(), function (response) {
		if (response.status === 'success') {
			element.replaceWith('<span>An email has been sent to you.</span>');
		} else {
			// TODO - tell the user that an error occurred, with the error message in question.
		}
	});
});