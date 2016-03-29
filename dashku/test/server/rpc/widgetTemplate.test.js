'use strict';



// Dependencies
//
var assert          = require('assert');
var ss              = require('socketstream');
require('../../../server/internals');
var WidgetTemplate  = ss.api.app.models.WidgetTemplate;



// Omit logging
//
ss.api.log.debug	= function (){};
ss.api.log.info		= function (){};



var ass             = ss.start();



describe('WidgetTemplate', function () {



	describe('getAll', function () {



		describe('if successful', function () {



			it('should return a success status with a list of widget templates', function (done) {
				new WidgetTemplate({name: 'Widge'}).save(function (err) {
					assert.equal(null, err);
					ass.rpc('widgetTemplate.getAll', function (res) {
						assert.equal(res[0].status, 'success');
						assert.deepEqual(res[0].widgetTemplates[0].name, 'Widge');
						done();
					});
				});
			});



		});



	});



});