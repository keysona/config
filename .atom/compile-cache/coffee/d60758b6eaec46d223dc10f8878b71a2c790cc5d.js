(function() {
  var CompositeDisposable, FileHeader, fs, moment, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs');

  path = require('path');

  moment = require('moment');

  module.exports = FileHeader = {
    config: {
      realname: {
        title: 'Real Name',
        order: 1,
        description: 'Your last and first name. Leave empty to disable.',
        type: 'string',
        "default": ''
      },
      username: {
        title: 'Username',
        order: 2,
        description: 'Your username. Only allow chars from [A-Za-z0-9_]. Leave empty to disable.' + (process.env.USER ? " Your current system username is <code>" + process.env.USER + "</code>." : ''),
        type: 'string',
        "default": ''
      },
      email: {
        title: 'Email Address',
        order: 3,
        description: 'Your email address. Leave empty to disable.',
        type: 'string',
        "default": ''
      },
      projectName: {
        title: 'Project Name',
        order: 4,
        description: 'Current project name. Leave empty to disable.',
        type: 'string',
        "default": ''
      },
      license: {
        title: 'License',
        order: 5,
        description: 'Your custom license text. Leave empty to disable.',
        type: 'string',
        "default": ''
      },
      configDirPath: {
        title: 'Config Directory Path',
        order: 6,
        description: 'Path to the directory that contains your customized File Header <code>lang-mapping.json</code> and <code>templates</code> directory. They will override default ones came with this package.',
        type: 'string',
        "default": path.join(atom.config.configDirPath, 'file-header')
      },
      dateTimeFormat: {
        title: 'Date Time Format',
        order: 7,
        description: 'Custom Moment.js format string to be used for date times in file header. For example, <code>DD-MMM-YYYY</code>. Please refer to <a href="http://momentjs.com/docs/#/displaying/format/" target="_blank">Moment.js doc</a> for details.',
        type: 'string',
        "default": ''
      },
      useFileCreationTime: {
        title: 'Use File Creation Time',
        order: 8,
        description: 'Use file creation time instead of file header creation time for <code>{{create_time}}</code>.',
        type: 'boolean',
        "default": true
      },
      autoUpdateEnabled: {
        title: 'Enable Auto Update',
        order: 9,
        description: 'Auto update file header on saving. Otherwise, you can bind your own key to <code>file-header:update</code> for manually triggering update.',
        type: 'boolean',
        "default": true
      },
      autoAddingHeaderEnabled: {
        title: 'Enable Auto Adding Header',
        order: 10,
        description: 'Auto adding header for new files on saving. Files are considered new if they do not contain any field (e.g. <code>@(Demo) Author:</code>) defined in corresponding template file.',
        type: 'boolean',
        "default": true
      },
      ignoreListForAutoUpdateAndAddingHeader: {
        title: 'Ignore List for Auto Update and Adding Header',
        order: 11,
        description: 'List of language scopes to be ignored during auto update and auto adding header. For example, <code>source.gfm, source.css</code> will ignore GitHub Markdown and CSS files.',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      ignoreCaseInTemplateField: {
        title: 'Ignore Case in Template Field',
        order: 12,
        description: 'When ignored, the template field <code>@(Demo) Last modified by:</code> is considered equivalent to <code>@(Demo) Last Modified by:</code>.',
        type: 'boolean',
        "default": true
      },
      numOfEmptyLinesAfterNewHeader: {
        title: 'Number of Empty Lines after New Header',
        order: 13,
        description: 'Number of empty lines should be kept after a new header.',
        type: 'integer',
        "default": 3,
        minimum: 0
      }
    },
    subscriptions: null,
    LAST_MODIFIED_BY: '{{last_modified_by}}',
    LAST_MODIFIED_TIME: '{{last_modified_time}}',
    LANG_MAPPING: 'lang-mapping.json',
    TEMPLATES: 'templates',
    activate: function(state) {
      var _ref;
      if (!state.notFirstTime) {
        this.state = state;
        this.state.notFirstTime = true;
        atom.config.set('file-header.username', (_ref = process.env.USER) != null ? _ref : '');
      }
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.onDidChange('file-header.username', (function(_this) {
        return function(event) {
          if (!event.newValue.match(/^\w*$/)) {
            if (!_this.usernameDidChangeTimer) {
              clearTimeout(_this.usernameDidChangeTimer);
              _this.usernameDidChangeTimer = null;
            }
            return _this.usernameDidChangeTimer = setTimeout(function() {
              atom.config.unset('file-header.username');
              return atom.notifications.addError('Invalid username', {
                detail: 'Please make sure it only contains characters from [A-Za-z0-9_]'
              });
            }, 100);
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('file-header.autoUpdateEnabled', (function(_this) {
        return function() {
          return _this.updateToggleAutoUpdateEnabledStatusMenuItem();
        };
      })(this)));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return editor.getBuffer().onWillSave(function() {
            if (!atom.config.get('file-header.autoUpdateEnabled', {
              scope: editor.getRootScopeDescriptor()
            })) {
              return;
            }
            return _this.update();
          });
        };
      })(this));
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'file-header:add': (function(_this) {
          return function() {
            return _this.add(true);
          };
        })(this),
        'file-header:toggleAutoUpdateEnabledStatus': (function(_this) {
          return function() {
            return _this.toggleAutoUpdateEnabledStatus();
          };
        })(this),
        'file-header:update': (function(_this) {
          return function() {
            return _this.update(true);
          };
        })(this)
      }));
    },
    serialize: function() {
      return this.state;
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    getHeaderTemplate: function(editor) {
      var configDirPath, currScope, langMapping, template, templateFileName;
      configDirPath = atom.config.get('file-header.configDirPath', {
        scope: editor.getRootScopeDescriptor()
      });
      currScope = editor.getRootScopeDescriptor().getScopesArray()[0];
      templateFileName = null;
      try {
        langMapping = JSON.parse(fs.readFileSync(path.join(configDirPath, this.LANG_MAPPING), {
          encoding: "utf8"
        }));
        templateFileName = langMapping[currScope];
      } catch (_error) {}
      if (!templateFileName) {
        langMapping = JSON.parse(fs.readFileSync(path.join(__dirname, this.LANG_MAPPING), {
          encoding: "utf8"
        }));
        templateFileName = langMapping[currScope];
      }
      if (!templateFileName) {
        return;
      }
      template = null;
      try {
        template = fs.readFileSync(path.join(configDirPath, this.TEMPLATES, templateFileName), {
          encoding: "utf8"
        });
      } catch (_error) {}
      if (!template) {
        template = fs.readFileSync(path.join(__dirname, this.TEMPLATES, templateFileName), {
          encoding: "utf8"
        });
      }
      return template;
    },
    getNewHeader: function(editor, headerTemplate) {
      var author, byName, creationTime, currFilePath, currTimeStr, dateTimeFormat, email, license, projectName, realname, username;
      if (!headerTemplate) {
        return null;
      }
      realname = atom.config.get('file-header.realname', {
        scope: editor.getRootScopeDescriptor()
      });
      username = atom.config.get('file-header.username', {
        scope: editor.getRootScopeDescriptor()
      });
      email = atom.config.get('file-header.email', {
        scope: editor.getRootScopeDescriptor()
      });
      if (realname) {
        author = realname;
        if (username) {
          author += " <" + username + ">";
        }
      } else {
        author = username;
      }
      byName = username ? username : realname;
      if (author) {
        headerTemplate = headerTemplate.replace(/\{\{author\}\}/g, author);
      }
      dateTimeFormat = atom.config.get('file-header.dateTimeFormat', {
        scope: editor.getRootScopeDescriptor()
      });
      currTimeStr = moment().format(dateTimeFormat);
      creationTime = currTimeStr;
      if (atom.config.get('file-header.useFileCreationTime', {
        scope: editor.getRootScopeDescriptor()
      })) {
        try {
          currFilePath = editor.getPath();
          creationTime = moment(fs.statSync(currFilePath).birthtime.getTime()).format(dateTimeFormat);
        } catch (_error) {}
      }
      headerTemplate = headerTemplate.replace(new RegExp("" + (this.escapeRegExp('{{create_time}}')), 'g'), creationTime);
      headerTemplate = headerTemplate.replace(new RegExp("" + (this.escapeRegExp(this.LAST_MODIFIED_TIME)), 'g'), currTimeStr);
      if (email) {
        headerTemplate = headerTemplate.replace(/\{\{email\}\}/g, email);
      }
      if (byName) {
        headerTemplate = headerTemplate.replace(new RegExp(this.escapeRegExp(this.LAST_MODIFIED_BY), 'g'), byName);
      }
      projectName = atom.config.get('file-header.projectName', {
        scope: editor.getRootScopeDescriptor()
      });
      if (projectName) {
        headerTemplate = headerTemplate.replace(/\{\{project_name\}\}/g, projectName);
      }
      license = atom.config.get('file-header.license', {
        scope: editor.getRootScopeDescriptor()
      });
      if (license) {
        headerTemplate = headerTemplate.replace(/\{\{license\}\}/g, license);
      }
      return headerTemplate = headerTemplate.replace(/^.*\{\{\w+\}\}(?:\r\n|\r|\n)/gm, '');
    },
    escapeRegExp: function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },
    hasHeader: function(editor, buffer, headerTemplate) {
      var hasMatch, preambles, re;
      if (!(preambles = headerTemplate.match(/@[^:]+:/g))) {
        return false;
      }
      preambles = preambles.map(this.escapeRegExp);
      re = new RegExp(preambles.join('|'), atom.config.get('file-header.ignoreCaseInTemplateField', {
        scope: editor.getRootScopeDescriptor()
      }) ? 'gi' : 'g');
      hasMatch = false;
      buffer.scan(re, (function(_this) {
        return function(result) {
          hasMatch = true;
          return result.stop();
        };
      })(this));
      return hasMatch;
    },
    updateField: function(editor, placeholder, headerTemplate, buffer, newValue) {
      var anchor, escaptedPlaceholder, match, newLine, re, reB, _results;
      escaptedPlaceholder = this.escapeRegExp(placeholder);
      re = new RegExp(".*(@[^:]+:).*" + escaptedPlaceholder + ".*(?:\r\n|\r|\n)", 'g');
      _results = [];
      while (match = re.exec(headerTemplate)) {
        anchor = match[1];
        newLine = match[0];
        newLine = newLine.replace(new RegExp(escaptedPlaceholder, 'g'), newValue);
        reB = new RegExp(".*" + (this.escapeRegExp(anchor)) + ".*(?:\r\n|\r|\n)", atom.config.get('file-header.ignoreCaseInTemplateField', {
          scope: editor.getRootScopeDescriptor()
        }) ? 'gi' : 'g');
        _results.push(buffer.scan(reB, (function(_this) {
          return function(result) {
            return result.replace(newLine);
          };
        })(this)));
      }
      return _results;
    },
    update: function(manual) {
      var buffer, byName, editor, headerTemplate, realname, username;
      if (manual == null) {
        manual = false;
      }
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(manual || !this.isInIgnoreListForAutoUpdateAndAddingHeader(editor))) {
        return;
      }
      buffer = editor.getBuffer();
      if (!(headerTemplate = this.getHeaderTemplate(editor))) {
        return;
      }
      if (this.hasHeader(editor, buffer, headerTemplate)) {
        realname = atom.config.get('file-header.realname', {
          scope: editor.getRootScopeDescriptor()
        });
        username = atom.config.get('file-header.username', {
          scope: editor.getRootScopeDescriptor()
        });
        byName = username ? username : realname;
        this.updateField(editor, this.LAST_MODIFIED_BY, headerTemplate, buffer, byName);
        return this.updateField(editor, this.LAST_MODIFIED_TIME, headerTemplate, buffer, moment().format(atom.config.get('file-header.dateTimeFormat', {
          scope: editor.getRootScopeDescriptor()
        })));
      } else if (atom.config.get('file-header.autoAddingHeaderEnabled', {
        scope: editor.getRootScopeDescriptor()
      })) {
        return this.addHeader(editor, buffer, headerTemplate);
      }
    },
    addHeader: function(editor, buffer, headerTemplate) {
      var newHeader;
      if (!(newHeader = this.getNewHeader(editor, headerTemplate))) {
        return;
      }
      newHeader += "\n".repeat(atom.config.get('file-header.numOfEmptyLinesAfterNewHeader', {
        scope: editor.getRootScopeDescriptor()
      }));
      buffer.scan(/\s*(?:\r\n|\r|\n)(?=\S)/, (function(_this) {
        return function(result) {
          if (result.range.start.isEqual([0, 0])) {
            result.replace('');
          }
          return result.stop();
        };
      })(this));
      return buffer.insert([0, 0], newHeader, {
        normalizeLineEndings: true
      });
    },
    add: function(manual) {
      var buffer, editor, headerTemplate;
      if (manual == null) {
        manual = false;
      }
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(manual || !this.isInIgnoreListForAutoUpdateAndAddingHeader(editor))) {
        return;
      }
      buffer = editor.getBuffer();
      if (!(headerTemplate = this.getHeaderTemplate(editor))) {
        return;
      }
      if (!this.hasHeader(editor, buffer, headerTemplate)) {
        return this.addHeader(editor, buffer, headerTemplate);
      }
    },
    isInIgnoreListForAutoUpdateAndAddingHeader: function(editor) {
      var currScope;
      currScope = editor.getRootScopeDescriptor().getScopesArray()[0];
      return __indexOf.call(atom.config.get('file-header.ignoreListForAutoUpdateAndAddingHeader', {
        scope: editor.getRootScopeDescriptor()
      }), currScope) >= 0;
    },
    updateToggleAutoUpdateEnabledStatusMenuItem: function() {
      var fileHeader, item, packages, toggle, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      packages = null;
      _ref = atom.menu.template;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.label === 'Packages') {
          packages = item;
          break;
        }
      }
      if (!packages) {
        return;
      }
      fileHeader = null;
      _ref1 = packages.submenu;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        item = _ref1[_j];
        if (item.label === 'File Header') {
          fileHeader = item;
          break;
        }
      }
      if (!fileHeader) {
        return;
      }
      toggle = null;
      _ref2 = fileHeader.submenu;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        item = _ref2[_k];
        if (item.command === 'file-header:toggleAutoUpdateEnabledStatus') {
          toggle = item;
          break;
        }
      }
      if (!toggle) {
        return;
      }
      toggle.label = atom.config.get('file-header.autoUpdateEnabled') ? 'Disable Auto Update' : 'Enable Auto Update';
      return atom.menu.update();
    },
    toggleAutoUpdateEnabledStatus: function() {
      atom.config.set('file-header.autoUpdateEnabled', !atom.config.get('file-header.autoUpdateEnabled'));
      return this.updateToggleAutoUpdateEnabledStatusMenuItem();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2ZpbGUtaGVhZGVyL2xpYi9maWxlLWhlYWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFRQTtBQUFBLE1BQUEsaURBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FIVCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUNmO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFFBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLFdBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQURQO0FBQUEsUUFFQSxXQUFBLEVBQWEsbURBRmI7QUFBQSxRQUdBLElBQUEsRUFBTSxRQUhOO0FBQUEsUUFJQSxTQUFBLEVBQVMsRUFKVDtPQURGO0FBQUEsTUFNQSxRQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxVQUFQO0FBQUEsUUFDQSxLQUFBLEVBQU8sQ0FEUDtBQUFBLFFBRUEsV0FBQSxFQUFhLDRFQUFBLEdBQStFLENBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFmLEdBQTBCLHlDQUFBLEdBQTNILE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBK0csR0FBNEQsVUFBdEYsR0FBcUcsRUFBckcsQ0FGNUY7QUFBQSxRQUdBLElBQUEsRUFBTSxRQUhOO0FBQUEsUUFJQSxTQUFBLEVBQVMsRUFKVDtPQVBGO0FBQUEsTUFZQSxLQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFB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

//# sourceURL=/home/key/.atom/packages/file-header/lib/file-header.coffee
