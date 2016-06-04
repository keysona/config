(function() {
  var Base, CompositeDisposable, Disposable, Emitter, StatusBarManager, VimState, getVisibleEditors, globalState, poliyFillsToTextBufferHistory, settings, _, _ref, _ref1;

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  StatusBarManager = require('./status-bar-manager');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  _ref1 = require('./utils'), getVisibleEditors = _ref1.getVisibleEditors, poliyFillsToTextBufferHistory = _ref1.poliyFillsToTextBufferHistory;

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var developer, workspaceElement;
      this.subscriptions = new CompositeDisposable;
      this.statusBarManager = new StatusBarManager;
      this.vimStatesByEditor = new Map;
      this.emitter = new Emitter;
      this.highlightSearchPattern = null;
      this.subscribe(Base.init(this.provideVimModePlus()));
      this.registerCommands();
      this.registerVimStateCommands();
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(this.provideVimModePlus()));
      }
      this.subscribe(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorSubscriptions, history, vimState;
          if (editor.isMini()) {
            return;
          }
          if ((history = editor.getBuffer().history).getChangesSinceCheckpoint == null) {
            poliyFillsToTextBufferHistory(history);
          }
          vimState = new VimState(_this, editor, _this.statusBarManager);
          _this.vimStatesByEditor.set(editor, vimState);
          editorSubscriptions = new CompositeDisposable;
          editorSubscriptions.add(editor.onDidDestroy(function() {
            _this.unsubscribe(editorSubscriptions);
            vimState.destroy();
            return _this.vimStatesByEditor["delete"](editor);
          }));
          editorSubscriptions.add(editor.onDidStopChanging(function() {
            return vimState.refreshHighlightSearch();
          }));
          return _this.subscribe(editorSubscriptions);
        };
      })(this)));
      this.subscribe(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var _base, _ref2;
          if (typeof (_base = atom.workspace).isTextEditor === "function" ? _base.isTextEditor(item) : void 0) {
            return (_ref2 = _this.getEditorState(item)) != null ? _ref2.refreshHighlightSearch() : void 0;
          }
        };
      })(this)));
      workspaceElement = atom.views.getView(atom.workspace);
      this.subscribe(atom.workspace.onDidChangeActivePane(function() {
        return workspaceElement.classList.remove('vim-mode-plus-pane-maximized');
      }));
      this.onDidSetLastSearchPattern((function(_this) {
        return function() {
          _this.highlightSearchPattern = globalState.lastSearchPattern;
          return _this.refreshHighlightSearchForVisibleEditors();
        };
      })(this));
      return this.subscribe(settings.observe('highlightSearch', (function(_this) {
        return function(newValue) {
          if (newValue) {
            return _this.refreshHighlightSearchForVisibleEditors();
          } else {
            return _this.clearHighlightSearchForEditors();
          }
        };
      })(this)));
    },
    onDidSetLastSearchPattern: function(fn) {
      return this.emitter.on('did-set-last-search-pattern', fn);
    },
    emitDidSetLastSearchPattern: function(fn) {
      return this.emitter.emit('did-set-last-search-pattern');
    },
    refreshHighlightSearchForVisibleEditors: function() {
      var editor, _i, _len, _ref2, _results;
      _ref2 = getVisibleEditors();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        editor = _ref2[_i];
        _results.push(this.getEditorState(editor).refreshHighlightSearch());
      }
      return _results;
    },
    clearHighlightSearchForEditors: function() {
      var editor, _i, _len, _ref2;
      _ref2 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        editor = _ref2[_i];
        this.getEditorState(editor).clearHighlightSearch();
      }
      return this.highlightSearchPattern = null;
    },
    clearRangeMarkerForEditors: function() {
      var editor, _i, _len, _ref2, _results;
      _ref2 = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        editor = _ref2[_i];
        _results.push(this.getEditorState(editor).clearRangeMarkers());
      }
      return _results;
    },
    deactivate: function() {
      this.subscriptions.dispose();
      return this.vimStatesByEditor.forEach(function(vimState) {
        return vimState.destroy();
      });
    },
    subscribe: function(arg) {
      return this.subscriptions.add(arg);
    },
    unsubscribe: function(arg) {
      if (typeof arg.dispose === "function") {
        arg.dispose();
      }
      return this.subscriptions.remove(arg);
    },
    registerCommands: function() {
      return this.subscribe(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus:clear-highlight-search': (function(_this) {
          return function() {
            return _this.clearHighlightSearchForEditors();
          };
        })(this),
        'vim-mode-plus:toggle-highlight-search': function() {
          return settings.toggle('highlightSearch');
        },
        'vim-mode-plus:clear-range-marker': (function(_this) {
          return function() {
            return _this.clearRangeMarkerForEditors();
          };
        })(this)
      }));
    },
    registerVimStateCommands: function() {
      var char, chars, commands, fn, name, scope, _fn, _i, _j, _len, _results, _results1;
      commands = {
        'activate-normal-mode': function() {
          return this.activate('normal');
        },
        'activate-linewise-visual-mode': function() {
          return this.activate('visual', 'linewise');
        },
        'activate-characterwise-visual-mode': function() {
          return this.activate('visual', 'characterwise');
        },
        'activate-blockwise-visual-mode': function() {
          return this.activate('visual', 'blockwise');
        },
        'reset-normal-mode': function() {
          return this.resetNormalMode();
        },
        'set-register-name': function() {
          return this.register.setName();
        },
        'set-count-0': function() {
          return this.setCount(0);
        },
        'set-count-1': function() {
          return this.setCount(1);
        },
        'set-count-2': function() {
          return this.setCount(2);
        },
        'set-count-3': function() {
          return this.setCount(3);
        },
        'set-count-4': function() {
          return this.setCount(4);
        },
        'set-count-5': function() {
          return this.setCount(5);
        },
        'set-count-6': function() {
          return this.setCount(6);
        },
        'set-count-7': function() {
          return this.setCount(7);
        },
        'set-count-8': function() {
          return this.setCount(8);
        },
        'set-count-9': function() {
          return this.setCount(9);
        },
        'start-save-mark': function() {
          return this.startCharInput("save-mark");
        },
        'start-move-to-mark': function() {
          return this.startCharInput("move-to-mark");
        },
        'start-move-to-mark-line': function() {
          return this.startCharInput("move-to-mark-line");
        }
      };
      chars = (function() {
        _results = [];
        for (_i = 33; _i <= 126; _i++){ _results.push(_i); }
        return _results;
      }).apply(this).map(function(code) {
        return String.fromCharCode(code);
      });
      _fn = function(char) {
        return commands["set-input-char-" + char] = function() {
          return this.setInputChar(char);
        };
      };
      for (_j = 0, _len = chars.length; _j < _len; _j++) {
        char = chars[_j];
        _fn(char);
      }
      scope = 'atom-text-editor:not([mini])';
      _results1 = [];
      for (name in commands) {
        fn = commands[name];
        _results1.push((function(_this) {
          return function(fn) {
            return _this.subscribe(atom.commands.add(scope, "vim-mode-plus:" + name, function(event) {
              var editor;
              if (editor = atom.workspace.getActiveTextEditor()) {
                return fn.call(_this.getEditorState(editor));
              }
            }));
          };
        })(this)(fn));
      }
      return _results1;
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    },
    getGlobalState: function() {
      return globalState;
    },
    getEditorState: function(editor) {
      return this.vimStatesByEditor.get(editor);
    },
    provideVimModePlus: function() {
      return {
        Base: Base,
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1LQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxPQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLGtCQUFBLFVBQUQsRUFBYSxlQUFBLE9BQWIsRUFBc0IsMkJBQUEsbUJBRnRCLENBQUE7O0FBQUEsRUFJQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FKUCxDQUFBOztBQUFBLEVBS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSLENBTG5CLENBQUE7O0FBQUEsRUFNQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBTmQsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVBYLENBQUE7O0FBQUEsRUFRQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FSWCxDQUFBOztBQUFBLEVBU0EsUUFBcUQsT0FBQSxDQUFRLFNBQVIsQ0FBckQsRUFBQywwQkFBQSxpQkFBRCxFQUFvQixzQ0FBQSw2QkFUcEIsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsMkJBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEdBQUEsQ0FBQSxnQkFEcEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEdBQUEs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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/main.coffee
