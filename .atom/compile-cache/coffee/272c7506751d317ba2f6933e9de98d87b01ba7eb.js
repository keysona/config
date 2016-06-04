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
          _this.updateToggleAutoUpdateEnabledStatusMenuItem();
          return _this.updateToggleAutoUpdateEnabledStatusContextMenuItem();
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
        'file-header:update': (function(_this) {
          return function() {
            return _this.update(true);
          };
        })(this),
        'file-header:toggleAutoUpdateEnabledStatus': (function(_this) {
          return function() {
            return _this.toggleAutoUpdateEnabledStatus();
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
    updateToggleAutoUpdateEnabledStatusContextMenuItem: function() {
      var item, itemSet, toggle, _i, _j, _len, _len1, _ref, _ref1;
      itemSet = null;
      _ref = atom.contextMenu.itemSets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.selector === 'atom-text-editor') {
          itemSet = item;
          break;
        }
      }
      if (!itemSet) {
        return;
      }
      toggle = null;
      _ref1 = itemSet.items;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        item = _ref1[_j];
        if (item.command === 'file-header:toggleAutoUpdateEnabledStatus') {
          toggle = item;
          break;
        }
      }
      if (!toggle) {
        return;
      }
      return toggle.label = atom.config.get('file-header.autoUpdateEnabled') ? 'Disable Auto Update' : 'Enable Auto Update';
    },
    toggleAutoUpdateEnabledStatus: function() {
      atom.config.set('file-header.autoUpdateEnabled', !atom.config.get('file-header.autoUpdateEnabled'));
      this.updateToggleAutoUpdateEnabledStatusMenuItem();
      return this.updateToggleAutoUpdateEnabledStatusContextMenuItem();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2ZpbGUtaGVhZGVyL2xpYi9maWxlLWhlYWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFRQTtBQUFBLE1BQUEsaURBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FIVCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUNmO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFFBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLFdBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQURQO0FBQUEsUUFFQSxXQUFBLEVBQWEsbURBRmI7QUFBQSxRQUdBLElBQUEsRUFBTSxRQUhOO0FBQUEsUUFJQSxTQUFBLEVBQVMsRUFKVDtPQURGO0FBQUEsTUFNQSxRQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxVQUFQO0FBQUEsUUFDQSxLQUFBLEVBQU8sQ0FEUDtBQUFBLFFBRUEsV0FBQSxFQUFhLDRFQUFBLEdBQStFLENBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFmLEdBQTBCLHlDQUFBLEdBQTNILE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBK0csR0FBNEQsVUFBdEYsR0FBcUcsRUFBckcsQ0FGNUY7QUFBQSxRQUdBLElBQUEsRUFBTSxRQUhOO0FBQUEsUUFJQSxTQUFBLEVBQVMsRUFKVDtPQVBGO0FBQUEsTUFZQSxLQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFB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

//# sourceURL=/home/key/.atom/packages/file-header/lib/file-header.coffee
