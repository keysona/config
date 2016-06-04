(function() {
  var Base, BufferedProcess, CompositeDisposable, DevEnvironment, Developer, Disposable, Emitter, debug, generateIntrospectionReport, getAncestors, getEditorState, getKeyBindingForCommand, getParent, packageScope, path, settings, _, _ref, _ref1;

  _ = require('underscore-plus');

  path = require('path');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, BufferedProcess = _ref.BufferedProcess, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  generateIntrospectionReport = require('./introspection').generateIntrospectionReport;

  settings = require('./settings');

  _ref1 = require('./utils'), debug = _ref1.debug, getParent = _ref1.getParent, getAncestors = _ref1.getAncestors, getKeyBindingForCommand = _ref1.getKeyBindingForCommand;

  packageScope = 'vim-mode-plus';

  getEditorState = null;

  Developer = (function() {
    var kinds, modifierKeyMap, selectorMap;

    function Developer() {}

    Developer.prototype.init = function(service) {
      var commands, fn, name, subscriptions;
      getEditorState = service.getEditorState;
      this.devEnvironmentByBuffer = new Map;
      this.reloadSubscriptionByBuffer = new Map;
      commands = {
        'toggle-debug': (function(_this) {
          return function() {
            return _this.toggleDebug();
          };
        })(this),
        'open-in-vim': (function(_this) {
          return function() {
            return _this.openInVim();
          };
        })(this),
        'generate-introspection-report': (function(_this) {
          return function() {
            return _this.generateIntrospectionReport();
          };
        })(this),
        'generate-command-summary-table-for-commands-have-no-default-keymap': (function(_this) {
          return function() {
            return _this.generateCommandSummaryTableForCommandsHaveNoDefaultKeymap();
          };
        })(this),
        'generate-command-summary-table': (function(_this) {
          return function() {
            return _this.generateCommandSummaryTable();
          };
        })(this),
        'toggle-dev-environment': (function(_this) {
          return function() {
            return _this.toggleDevEnvironment();
          };
        })(this),
        'reload-packages': (function(_this) {
          return function() {
            return _this.reloadPackages();
          };
        })(this),
        'toggle-reload-packages-on-save': (function(_this) {
          return function() {
            return _this.toggleReloadPackagesOnSave();
          };
        })(this)
      };
      subscriptions = new CompositeDisposable;
      for (name in commands) {
        fn = commands[name];
        subscriptions.add(this.addCommand(name, fn));
      }
      return subscriptions;
    };

    Developer.prototype.reloadPackages = function() {
      var pack, packName, packPath, packages, _i, _len, _ref2, _results;
      packages = (_ref2 = settings.get('devReloadPackages')) != null ? _ref2 : [];
      packages.push('vim-mode-plus');
      _results = [];
      for (_i = 0, _len = packages.length; _i < _len; _i++) {
        packName = packages[_i];
        pack = atom.packages.getLoadedPackage(packName);
        if (pack != null) {
          console.log("deactivating " + packName);
          atom.packages.deactivatePackage(packName);
          atom.packages.unloadPackage(packName);
          packPath = pack.path;
          Object.keys(require.cache).filter(function(p) {
            return p.indexOf(packPath + path.sep) === 0;
          }).forEach(function(p) {
            return delete require.cache[p];
          });
          atom.packages.loadPackage(packName);
          _results.push(atom.packages.activatePackage(packName));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Developer.prototype.toggleReloadPackagesOnSave = function() {
      var buffer, editor, fileName, subscription;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      buffer = editor.getBuffer();
      fileName = path.basename(editor.getPath());
      if (subscription = this.reloadSubscriptionByBuffer.get(buffer)) {
        subscription.dispose();
        this.reloadSubscriptionByBuffer["delete"](buffer);
        return console.log("disposed reloadPackagesOnSave for " + fileName);
      } else {
        this.reloadSubscriptionByBuffer.set(buffer, buffer.onDidSave((function(_this) {
          return function() {
            console.clear();
            return _this.reloadPackages();
          };
        })(this)));
        return console.log("activated reloadPackagesOnSave for " + fileName);
      }
    };

    Developer.prototype.toggleDevEnvironment = function() {
      var buffer, editor, fileName;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      buffer = editor.getBuffer();
      fileName = path.basename(editor.getPath());
      if (this.devEnvironmentByBuffer.has(buffer)) {
        this.devEnvironmentByBuffer.get(buffer).dispose();
        this.devEnvironmentByBuffer["delete"](buffer);
        return console.log("disposed dev env " + fileName);
      } else {
        this.devEnvironmentByBuffer.set(buffer, new DevEnvironment(editor));
        return console.log("activated dev env " + fileName);
      }
    };

    Developer.prototype.addCommand = function(name, fn) {
      return atom.commands.add('atom-text-editor', "" + packageScope + ":" + name, fn);
    };

    Developer.prototype.toggleDebug = function() {
      settings.set('debug', !settings.get('debug'));
      return console.log("" + settings.scope + " debug:", settings.get('debug'));
    };

    modifierKeyMap = {
      cmd: '\u2318',
      "ctrl-": '\u2303',
      alt: '\u2325',
      option: '\u2325',
      enter: '\u23ce',
      left: '\u2190',
      right: '\u2192',
      up: '\u2191',
      down: '\u2193',
      backspace: 'BS',
      space: 'SPC'
    };

    selectorMap = {
      "atom-text-editor.vim-mode-plus": '',
      ".normal-mode": 'n',
      ".insert-mode": 'i',
      ".replace": 'R',
      ".visual-mode": 'v',
      ".characterwise": 'C',
      ".blockwise": 'B',
      ".linewise": 'L',
      ".operator-pending-mode": 'o',
      ".with-count": '#'
    };

    Developer.prototype.getCommandSpecs = function() {
      var commandName, commands, compactKeystrokes, compactSelector, description, keymap, keymaps, kind, klass, name;
      compactSelector = function(selector) {
        var pattern;
        pattern = RegExp("(" + (_.keys(selectorMap).map(_.escapeRegExp).join('|')) + ")", "g");
        return selector.split(/,\s*/g).map(function(scope) {
          return scope.replace(/:not\((.*)\)/, '!$1').replace(pattern, function(s) {
            return selectorMap[s];
          });
        }).join(",");
      };
      compactKeystrokes = function(keystrokes) {
        var pattern;
        pattern = RegExp("(" + (_.keys(modifierKeyMap).map(_.escapeRegExp).join('|')) + ")");
        return keystrokes.replace(/(`|_)/g, '\\$1').replace(pattern, function(s) {
          return modifierKeyMap[s];
        }).replace(/\s+/, '');
      };
      commands = (function() {
        var _ref2, _ref3, _results;
        _ref2 = Base.getRegistries();
        _results = [];
        for (name in _ref2) {
          klass = _ref2[name];
          if (!(klass.isCommand())) {
            continue;
          }
          kind = getAncestors(klass).map(function(k) {
            return k.name;
          }).slice(-2, -1)[0];
          commandName = klass.getCommandName();
          description = (_ref3 = klass.getDesctiption()) != null ? _ref3.replace(/\n/g, '<br/>') : void 0;
          keymap = null;
          if (keymaps = getKeyBindingForCommand(commandName, {
            packageName: "vim-mode-plus"
          })) {
            keymap = keymaps.map(function(_arg) {
              var keystrokes, selector;
              keystrokes = _arg.keystrokes, selector = _arg.selector;
              return "`" + (compactSelector(selector)) + "` <kbd>" + (compactKeystrokes(keystrokes)) + "</kbd>";
            }).join("<br/>");
          }
          _results.push({
            name: name,
            commandName: commandName,
            kind: kind,
            description: description,
            keymap: keymap
          });
        }
        return _results;
      })();
      return commands;
    };

    kinds = ["Operator", "Motion", "TextObject", "InsertMode", "MiscCommand", "Scroll", "VisualBlockwise"];

    Developer.prototype.generateSummaryTableForCommandSpecs = function(specs, _arg) {
      var commandName, description, grouped, header, keymap, kind, report, str, _i, _j, _len, _len1, _ref2;
      header = (_arg != null ? _arg : {}).header;
      grouped = _.groupBy(specs, 'kind');
      str = "";
      for (_i = 0, _len = kinds.length; _i < _len; _i++) {
        kind = kinds[_i];
        if (!(specs = grouped[kind])) {
          continue;
        }
        report = ["## " + kind, "", "| Keymap | Command | Description |", "|:-------|:--------|:------------|"];
        for (_j = 0, _len1 = specs.length; _j < _len1; _j++) {
          _ref2 = specs[_j], keymap = _ref2.keymap, commandName = _ref2.commandName, description = _ref2.description;
          commandName = commandName.replace(/vim-mode-plus:/, '');
          if (description == null) {
            description = "";
          }
          if (keymap == null) {
            keymap = "";
          }
          report.push("| " + keymap + " | `" + commandName + "` | " + description + " |");
        }
        str += report.join("\n") + "\n\n";
      }
      return atom.workspace.open().then(function(editor) {
        if (header != null) {
          editor.insertText(header + "\n");
        }
        return editor.insertText(str);
      });
    };

    Developer.prototype.generateCommandSummaryTable = function() {
      var header;
      header = "# Keymap selector abbreviations\n\nIn this document, following abbreviations are used for shortness.\n\n| Abbrev | Selector                     | Description             |\n|:-------|:-----------------------------|:------------------------|\n| `!i`   | `:not(.insert-mode)`         | except insert-mode      |\n| `i`    | `.insert-mode`               |                         |\n| `o`    | `.operator-pending-mode`     |                         |\n| `n`    | `.normal-mode`               |                         |\n| `v`    | `.visual-mode`               |                         |\n| `vB`   | `.visual-mode.blockwise`     |                         |\n| `vL`   | `.visual-mode.linewise`      |                         |\n| `vC`   | `.visual-mode.characterwise` |                         |\n| `iR`   | `.insert-mode.replace`       |                         |\n| `#`    | `.with-count`                | when count is specified |\n";
      return this.generateSummaryTableForCommandSpecs(this.getCommandSpecs(), {
        header: header
      });
    };

    Developer.prototype.generateCommandSummaryTableForCommandsHaveNoDefaultKeymap = function() {
      var commands;
      commands = this.getCommandSpecs().filter(function(command) {
        return !getKeyBindingForCommand(command.commandName, {
          packageName: 'vim-mode-plus'
        });
      });
      return this.generateSummaryTableForCommandSpecs(commands);
    };

    Developer.prototype.openInVim = function() {
      var editor, row;
      editor = atom.workspace.getActiveTextEditor();
      row = editor.getCursorBufferPosition().row;
      return new BufferedProcess({
        command: "/Applications/MacVim.app/Contents/MacOS/mvim",
        args: [editor.getPath(), "+" + (row + 1)]
      });
    };

    Developer.prototype.generateIntrospectionReport = function() {
      return generateIntrospectionReport(_.values(Base.getRegistries()), {
        excludeProperties: ['run', 'getCommandNameWithoutPrefix', 'getClass', 'extend', 'getParent', 'getAncestors', 'isCommand', 'getRegistries', 'command', 'reset', 'getDesctiption', 'description', 'init', 'getCommandName', 'getCommandScope', 'registerCommand', 'delegatesProperties', 'subscriptions', 'commandPrefix', 'commandScope', 'delegatesMethods', 'delegatesProperty', 'delegatesMethod'],
        recursiveInspect: Base
      });
    };

    return Developer;

  })();

  DevEnvironment = (function() {
    function DevEnvironment(editor) {
      var fileName;
      this.editor = editor;
      this.editorElement = atom.views.getView(this.editor);
      this.emitter = new Emitter;
      fileName = path.basename(this.editor.getPath());
      this.disposable = this.editor.onDidSave((function(_this) {
        return function() {
          console.clear();
          Base.suppressWarning = true;
          _this.reload();
          Base.suppressWarning = false;
          Base.reset();
          _this.emitter.emit('did-reload');
          return console.log("reloaded " + fileName);
        };
      })(this));
    }

    DevEnvironment.prototype.dispose = function() {
      var _ref2;
      return (_ref2 = this.disposable) != null ? _ref2.dispose() : void 0;
    };

    DevEnvironment.prototype.onDidReload = function(fn) {
      return this.emitter.on('did-reload', fn);
    };

    DevEnvironment.prototype.reload = function() {
      var originalRequire, packPath;
      packPath = atom.packages.resolvePackagePath('vim-mode-plus');
      originalRequire = global.require;
      global.require = function(libPath) {
        if (libPath.startsWith('./')) {
          return originalRequire("" + packPath + "/lib/" + libPath);
        } else {
          return originalRequire(libPath);
        }
      };
      atom.commands.dispatch(this.editorElement, 'run-in-atom:run-in-atom');
      return global.require = originalRequire;
    };

    return DevEnvironment;

  })();

  module.exports = Developer;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2RldmVsb3Blci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOE9BQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxPQUE4RCxPQUFBLENBQVEsTUFBUixDQUE5RCxFQUFDLGVBQUEsT0FBRCxFQUFVLGtCQUFBLFVBQVYsRUFBc0IsdUJBQUEsZUFBdEIsRUFBdUMsMkJBQUEsbUJBRnZDLENBQUE7O0FBQUEsRUFJQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FKUCxDQUFBOztBQUFBLEVBS0MsOEJBQStCLE9BQUEsQ0FBUSxpQkFBUixFQUEvQiwyQkFMRCxDQUFBOztBQUFBLEVBTUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBTlgsQ0FBQTs7QUFBQSxFQU9BLFFBQTRELE9BQUEsQ0FBUSxTQUFSLENBQTVELEVBQUMsY0FBQSxLQUFELEVBQVEsa0JBQUEsU0FBUixFQUFtQixxQkFBQSxZQUFuQixFQUFpQyxnQ0FBQSx1QkFQakMsQ0FBQTs7QUFBQSxFQVNBLFlBQUEsR0FBZSxlQVRmLENBQUE7O0FBQUEsRUFVQSxjQUFBLEdBQWlCLElBVmpCLENBQUE7O0FBQUEsRUFZTTtBQUNKLFFBQUEsa0NBQUE7OzJCQUFBOztBQUFBLHdCQUFBLElBQUEsR0FBTSxTQUFDLE9BQUQsR0FBQTtBQUNKLFVBQUEsaUNBQUE7QUFBQSxNQUFDLGlCQUFrQixRQUFsQixjQUFELENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixHQUFBLENBQUEsR0FEMUIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxD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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/developer.coffee
