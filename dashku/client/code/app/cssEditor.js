'use strict';

// Editor v2
//
// The dashboard's CSS editor. 

module.exports = {

    isInit: false,

    // loads the css editor, and puts it on the page
    init: function (dashboard) {
        if (this.isInit) {
            this.scrollToSelf();
            $('#cssEditor').clearQueue().fadeTo(200, 0.7).fadeTo(200, 1);
            return;
        }
        this.isInit = true;
        this.dashboard = dashboard;
        $('body').append(ss.tmpl['dashboard-editor'].r());
        this.scrollToSelf();
        $('#cssEditor').hide().fadeIn(500);
        this.setupDataStore();
        this.element().draggable({handle:'.header'}).css({
            top: '#' + window.innerHeight-this.element().height() / 2 + 'px',
            left: '#' + window.innerWidth-this.element().width() /2 + 'px'
        });
        this.bindCloseAction();
        this.loadEditor(this.dashboard.css, 'css', 'css');
    },

    // Loads CodeMirror with the code and the code's type
    loadEditor: function (value, mode) {
        this.element().find('#editContainer').html('');
        var self = this;
        var editor = CodeMirror(document.getElementById('editContainer'), {
            value: value,
            theme: 'twilight',
            lineWrapping: true,
            lineNumbers: true,
            tabSize: 2,
            onChange: function (cm) {
                self.css = cm.getValue();
                $('style#dashboardStyle').text(cm.getValue());
            }
        });

        editor.setOption('mode', mode);
        CodeMirror.autoLoadMode(editor, mode);
    },

  
    // return the element
    element: function () {
        return $('#cssEditor');
    },

    setupDataStore: function () {
        this.css = this.dashboard.css;
    },

    // bind the close button
    bindCloseAction: function () {
        var self = this;
        self.element().find('a.close').tooltip({}).on('click', function () {
            self.exit();
        });
    },

    // handles UI removal of editor
    wrapItUp: function (cb) {
        var self = this;
        $('.tooltip').remove(); // prevent the download tooltip hanging around
        self.element().fadeOut(250, function () {
            self.element().remove();
        });
        if (typeof cb === 'function') { cb(); }
    },

    // scroll to css editor
    scrollToSelf: function () {
        $('html, body').animate({
            scrollTop: $("#cssEditor").offset().top
        }, 250);
    },

    // Identifies any changes to the dashboard's css, and saves them if so
    identifyChanges: function (cb) {
        var changes = {};
        if (this.dashboard.css !== this.css) { changes.css = this.css; }
        cb(changes);
    },

    // Close the editor, save any changes
    exit: function (cb) {
        var self = this;
        self.isInit = false;
        self.identifyChanges(function (changes) {
            if (_.isEmpty(changes)) {
                self.wrapItUp(cb);
            } else {
                changes._id = self.dashboard._id;
                ss.rpc('dashboard.update', changes, function (response) {
                    if (response.status === 'success') {
                        self.wrapItUp(cb);
                    } else {
                        alert(response.reason);
                        self.wrapItUp(cb);
                    }
                });
            }
        });
    }

};