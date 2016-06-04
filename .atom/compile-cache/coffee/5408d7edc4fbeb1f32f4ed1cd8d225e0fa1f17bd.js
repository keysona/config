(function() {
  var Base, CompositeDisposable, Disposable, Emitter, Hover, HoverElement, StatusBarManager, VimState, getVisibleEditors, globalState, poliyFillsToTextBufferHistory, settings, _, _ref, _ref1, _ref2;

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  StatusBarManager = require('./status-bar-manager');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  _ref1 = require('./hover'), Hover = _ref1.Hover, HoverElement = _ref1.HoverElement;

  _ref2 = require('./utils'), getVisibleEditors = _ref2.getVisibleEditors, poliyFillsToTextBufferHistory = _ref2.poliyFillsToTextBufferHistory;

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var developer, workspaceElement;
      this.subscriptions = new CompositeDisposable;
      this.statusBarManager = new StatusBarManager;
      this.vimStatesByEditor = new Map;
      this.emitter = new Emitter;
      this.registerViewProviders();
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
      workspaceElement = atom.views.getView(atom.workspace);
      this.subscribe(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var selector, _base, _ref3;
          selector = 'vim-mode-plus-pane-maximized';
          workspaceElement.classList.remove(selector);
          if (typeof (_base = atom.workspace).isTextEditor === "function" ? _base.isTextEditor(item) : void 0) {
            return (_ref3 = _this.getEditorState(item)) != null ? _ref3.refreshHighlightSearch() : void 0;
          }
        };
      })(this)));
      this.onDidSetHighlightSearchPattern((function(_this) {
        return function() {
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
    onDidSetHighlightSearchPattern: function(fn) {
      return this.emitter.on('did-set-highlight-search-pattern', fn);
    },
    emitDidSetHighlightSearchPattern: function(fn) {
      return this.emitter.emit('did-set-highlight-search-pattern');
    },
    refreshHighlightSearchForVisibleEditors: function() {
      var editor, _i, _len, _ref3, _results;
      _ref3 = getVisibleEditors();
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        _results.push(this.getEditorState(editor).refreshHighlightSearch());
      }
      return _results;
    },
    clearHighlightSearchForEditors: function() {
      var editor, _i, _len, _ref3, _results;
      _ref3 = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        editor = _ref3[_i];
        _results.push(this.getEditorState(editor).clearHighlightSearch());
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
            _this.clearHighlightSearchForEditors();
            return globalState.highlightSearchPattern = null;
          };
        })(this),
        'vim-mode-plus:toggle-highlight-search': function() {
          return settings.toggle('highlightSearch');
        }
      }));
    },
    registerVimStateCommands: function() {
      var commands, fn, name, scope, _results;
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
        }
      };
      scope = 'atom-text-editor:not([mini])';
      _results = [];
      for (name in commands) {
        fn = commands[name];
        _results.push((function(_this) {
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
      return _results;
    },
    registerViewProviders: function() {
      var addView;
      addView = atom.views.addViewProvider.bind(atom.views);
      return addView(Hover, function(model) {
        return new HoverElement().initialize(model);
      });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtMQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxPQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLGtCQUFBLFVBQUQsRUFBYSxlQUFBLE9BQWIsRUFBc0IsMkJBQUEsbUJBRnRCLENBQUE7O0FBQUEsRUFJQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FKUCxDQUFBOztBQUFBLEVBS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSLENBTG5CLENBQUE7O0FBQUEsRUFNQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBTmQsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVBYLENBQUE7O0FBQUEsRUFRQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FSWCxDQUFBOztBQUFBLEVBU0EsUUFBd0IsT0FBQSxDQUFRLFNBQVIsQ0FBeEIsRUFBQyxjQUFBLEtBQUQsRUFBUSxxQkFBQSxZQVRSLENBQUE7O0FBQUEsRUFVQSxRQUFxRCxPQUFBLENBQVEsU0FBUixDQUFyRCxFQUFDLDBCQUFBLGlCQUFELEVBQW9CLHNDQUFBLDZCQVZwQixDQUFBOztBQUFBLEVBWUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLFFBQVEsQ0FBQyxNQUFqQjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/main.coffee
