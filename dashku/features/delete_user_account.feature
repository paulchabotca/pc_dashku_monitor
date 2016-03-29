Feature: Delete user account
  In order to stop using Dashku
  As a user
  I want to delete my account

  Background:
    Given a user exists with username "paulbjensen" and email "paulbjensen@gmail.com" and password "123456789"
    And a dashboard exists with name "Your Dashboard" for user "paulbjensen"
    And I am on the homepage
    And I follow "Login"
    And the "login" modal should appear
    And I fill in "identifier" with "paulbjensen"
    And I fill in "password" with "123456789"
    And I press "Login"
    And I should be on the dashboard page
    And I follow "paulbjensen"
    And I should be on the account page
    And I follow "Cancel Account"
    And the "cancel account" modal should appear

  Scenario: Delete my account
    And I fill in "password" with "123456789"
    And I press "Cancel Account"
    And the "cancel account" modal should disappear
    And I should be on the home page
    And I reload the page
    And I should be on the home page
    And there should not be a user with username "paulbjensen"

  Scenario: Fail to delete my account
    And I fill in "password" with "1234567"
    And I press "Cancel Account"
    And the field "password" placeholder should be "Password invalid"