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
        'debug-highlight-search': function() {
          var editor, globalState, vimState;
          globalState = require('./global-state');
          editor = atom.workspace.getActiveTextEditor();
          vimState = getEditorState(editor);
          console.log('highlightSearchPattern', globalState.highlightSearchPattern);
          console.log("vimState's id is " + vimState.id);
          console.log("hlmarkers are");
          return vimState.highlightSearchMarkers.forEach(function(marker) {
            return console.log(marker.getBufferRange().toString());
          });
        },
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
