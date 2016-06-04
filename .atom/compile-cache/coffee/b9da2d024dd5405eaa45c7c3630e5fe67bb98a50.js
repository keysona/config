(function() {
  var Base, CompositeDisposable, Disposable, Emitter, StatusBarManager, VimState, getVisibleEditors, globalState, settings, swrap, _, _ref;

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  StatusBarManager = require('./status-bar-manager');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  swrap = require('./selection-wrapper');

  getVisibleEditors = require('./utils').getVisibleEditors;

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var developer, workspaceClassList;
      this.subscriptions = new CompositeDisposable;
      this.statusBarManager = new StatusBarManager;
      this.vimStatesByEditor = new Map;
      this.emitter = new Emitter;
      this.highlightSearchPattern = null;
      this.subscribe(Base.init(this.provideVimModePlus()));
      this.subscribe(swrap.init());
      this.registerCommands();
      this.registerVimStateCommands();
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(this.provideVimModePlus()));
      }
      this.subscribe(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorSubscriptions, vimState;
          if (editor.isMini()) {
            return;
          }
          vimState = new VimState(_this, editor, _this.statusBarManager);
          _this.vimStatesByEditor.set(editor, vimState);
          editorSubscriptions = new CompositeDisposable;
          editorSubscriptions.add(editor.onDidDestroy(function() {
            editorSubscriptions.dispose();
            _this.unsubscribe(editorSubscriptions);
            vimState.destroy();
            return _this.vimStatesByEditor["delete"](editor);
          }));
          editorSubscriptions.add(editor.onDidStopChanging(function() {
            return vimState.refreshHighlightSearch();
          }));
          _this.subscribe(editorSubscriptions);
          return _this.emitter.emit('did-add-vim-state', vimState);
        };
      })(this)));
      this.subscribe(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var _ref1;
          if (atom.workspace.isTextEditor(item)) {
            return (_ref1 = _this.getEditorState(item)) != null ? _ref1.refreshHighlightSearch() : void 0;
          }
        };
      })(this)));
      workspaceClassList = atom.views.getView(atom.workspace).classList;
      this.subscribe(atom.workspace.onDidChangeActivePane(function() {
        return workspaceClassList.remove('vim-mode-plus-pane-maximized', 'hide-tab-bar');
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
    onDidAddVimState: function(fn) {
      return this.emitter.on('did-add-vim-state', fn);
    },
    observeVimStates: function(fn) {
      this.vimStatesByEditor.forEach(fn);
      return this.onDidAddVimState(fn);
    },
    refreshHighlightSearchForVisibleEditors: function() {
      var editor, _i, _len, _ref1, _results;
      _ref1 = getVisibleEditors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        _results.push(this.getEditorState(editor).refreshHighlightSearch());
      }
      return _results;
    },
    clearHighlightSearchForEditors: function() {
      var editor, _i, _len, _ref1;
      _ref1 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        this.getEditorState(editor).clearHighlightSearch();
      }
      return this.highlightSearchPattern = null;
    },
    clearRangeMarkerForEditors: function() {
      var editor, _i, _len, _ref1, _results;
      _ref1 = atom.workspace.getTextEditors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
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
      return this.subscriptions.remove(arg);
    },
    registerCommands: function() {
      this.subscribe(atom.commands.add('atom-text-editor:not([mini])', {
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
      return this.subscribe(atom.commands.add('atom-workspace', {
        'vim-mode-plus:maximize-pane': (function(_this) {
          return function() {
            return _this.maximizePane();
          };
        })(this)
      }));
    },
    maximizePane: function() {
      var classList, selector;
      selector = 'vim-mode-plus-pane-maximized';
      classList = atom.views.getView(atom.workspace).classList;
      classList.toggle(selector);
      if (classList.contains(selector)) {
        if (settings.get('hideTabBarOnMaximizePane')) {
          return classList.add('hide-tab-bar');
        }
      } else {
        return classList.remove('hide-tab-bar');
      }
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
        getEditorState: this.getEditorState.bind(this),
        observeVimStates: this.observeVimStates.bind(this),
        onDidAddVimState: this.onDidAddVimState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9JQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFQSxPQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLGtCQUFBLFVBQUQsRUFBYSxlQUFBLE9BQWIsRUFBc0IsMkJBQUEsbUJBRnRCLENBQUE7O0FBQUEsRUFJQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FKUCxDQUFBOztBQUFBLEVBS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSLENBTG5CLENBQUE7O0FBQUEsRUFNQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBTmQsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVBYLENBQUE7O0FBQUEsRUFRQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FSWCxDQUFBOztBQUFBLEVBU0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQVRSLENBQUE7O0FBQUEsRUFVQyxvQkFBcUIsT0FBQSxDQUFRLFNBQVIsRUFBckIsaUJBVkQsQ0FBQTs7QUFBQSxFQVlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsNkJBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEdBQUEsQ0FBQSxnQkFEcEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEdBQUEsQ0FBQSxHQUZyQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUhYLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixJQUoxQixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FBVixDQUFYLENBTkEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxLQUFLLENBQUMsSUFBTixDQUFBLENBQVgsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQVJBLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBLENBVEEsQ0FBQTtBQVdBLE1BQUEsSUFBRyxJQUFJLENBQUMsU0FBTCxDQUFBLENBQUg7QUFDRSxRQUFBLFNBQUEsR0FBYSxHQUFBLENBQUEsQ0FBSyxPQUFBLENBQVEsYUFBUixDQUFELENBQWpCLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxTQUFELENBQVcsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUFmLENBQVgsQ0FEQSxDQURGO09BWEE7QUFBQSxNQWVBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7QUFDM0MsY0FBQSw2QkFBQTtBQUFBLFVBQUEsSUFBVSxNQUFNLENBQUMsTUFBUCxDQUFBLENBQVY7QUFBQSxrQkFBQSxDQUFBO1dBQUE7QUFBQSxVQUNBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxLQUFULEVBQWUsTUFBZixFQUF1QixLQUFDLENBQUEsZ0JBQXhCLENBRGYsQ0FBQTtBQUFBLFVBRUEsS0FBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLE1BQXZCLEVBQStCLFFBQS9CLENBRkEsQ0FBQTtBQUFBLFVBSUEsbUJBQUEsR0FBc0IsR0FBQSxDQUFBLG1CQUp0QixDQUFBO0FBQUEsVUFLQSxtQkFBbUIsQ0FBQyxHQUFwQixDQUF3QixNQUFNLENBQUMsWUFBUCxDQUFvQixTQUFBLEdBQUE7QUFDMUMsWUFBQSxtQkFBbUIsQ0FBQyxPQUFwQixDQUFBLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLFdBQUQsQ0FBYSxtQkFBYixDQURBLENBQUE7QUFBQSxZQUVBLFFBQVEsQ0FBQyxPQUFULENBQUEsQ0FGQSxDQUFBO21CQUdBLEtBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxRQUFELENBQWxCLENBQTBCLE1BQTFCLEVBSjBDO1VBQUEsQ0FBcEIsQ0FBeEIsQ0FMQSxDQUFBO0FBQUEsVUFXQSxtQkFBbUIsQ0FBQyxHQUFwQixDQUF3QixNQUFNLENBQUMsaUJBQVAsQ0FBeUIsU0FBQSxHQUFBO21CQUMvQyxRQUFRLENBQUMsc0JBQVQsQ0FBQSxFQUQrQztVQUFBLENBQXpCLENBQXhCLENBWEEsQ0FBQTtBQUFBLFVBYUEsS0FBQyxDQUFBLFNBQUQsQ0FBVyxtQkFBWCxDQWJBLENBQUE7aUJBY0EsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsbUJBQWQsRUFBbUMsUUFBbkMsRUFmMkM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFYLENBZkEsQ0FBQTtBQUFBLE1BZ0NBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQywrQkFBZixDQUErQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDeEQsY0FBQSxLQUFBO0FBQUEsVUFBQSxJQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBZixDQUE0QixJQUE1QixDQUFIO3VFQUd1QixDQUFFLHNCQUF2QixDQUFBLFdBSEY7V0FEd0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQyxDQUFYLENBaENBLENBQUE7QUFBQSxNQXNDQSxrQkFBQSxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQWtDLENBQUMsU0F0Q3hELENBQUE7QUFBQSxNQXVDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQWYsQ0FBcUMsU0FBQSxHQUFBO2VBQzlDLGtCQUFrQixDQUFDLE1BQW5CLENBQTBCLDhCQUExQixFQUEwRCxjQUExRCxFQUQ4QztNQUFBLENBQXJDLENBQVgsQ0F2Q0EsQ0FBQTtBQUFBLE1BMENBLElBQUMsQ0FBQSx5QkFBRCxDQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3pCLFVBQUEsS0FBQyxDQUFBLHNCQUFELEdBQTBCLFdBQVcsQ0FBQyxpQkFBdEMsQ0FBQTtpQkFDQSxLQUFDLENBQUEsdUNBQUQsQ0FBQSxFQUZ5QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCLENBMUNBLENBQUE7YUE4Q0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxRQUFRLENBQUMsT0FBVCxDQUFpQixpQkFBakIsRUFBb0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsUUFBRCxHQUFBO0FBQzdDLFVBQUEsSUFBRyxRQUFIO21CQUNFLEtBQUMsQ0FBQSx1Q0FBRCxDQUFBLEVBREY7V0FBQSxNQUFBO21CQUdFLEtBQUMsQ0FBQSw4QkFBRCxDQUFBLEVBSEY7V0FENkM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQyxDQUFYLEVBL0NRO0lBQUEsQ0FGVjtBQUFBLElBdURBLHlCQUFBLEVBQTJCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksNkJBQVosRUFBMkMsRUFBM0MsRUFBUjtJQUFBLENBdkQzQjtBQUFBLElBd0RBLDJCQUFBLEVBQTZCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsNkJBQWQsRUFBUjtJQUFBLENBeEQ3QjtBQUFBLElBOERBLGdCQUFBLEVBQWtCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksbUJBQVosRUFBaUMsRUFBakMsRUFBUjtJQUFBLENBOURsQjtBQUFBLElBb0VBLGdCQUFBLEVBQWtCLFNBQUMsRUFBRCxHQUFBO0FBQ2hCLE1BQUEsSUFBQyxDQUFBLGlCQUFpQixDQUFDLE9BQW5CLENBQTJCLEVBQTNCLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixFQUFsQixFQUZnQjtJQUFBLENBcEVsQjtBQUFBLElBd0VBLHVDQUFBLEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxVQUFBLGlDQUFBO0FBQUE7QUFBQTtXQUFBLDRDQUFBOzJCQUFBO0FBQ0Usc0JBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsQ0FBdUIsQ0FBQyxzQkFBeEIsQ0FBQSxFQUFBLENBREY7QUFBQTtzQkFEdUM7SUFBQSxDQXhFekM7QUFBQSxJQTRFQSw4QkFBQSxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsVUFBQSx1QkFBQTtBQUFBO0FBQUEsV0FBQSw0Q0FBQTsyQkFBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsQ0FBdUIsQ0FBQyxvQkFBeEIsQ0FBQSxDQUFBLENBREY7QUFBQSxPQUFBO2FBRUEsSUFBQyxDQUFBLHNCQUFELEdBQTBCLEtBSEk7SUFBQSxDQTVFaEM7QUFBQSxJQWlGQSwwQkFBQSxFQUE0QixTQUFBLEdBQUE7QUFDMUIsVUFBQSxpQ0FBQTtBQUFBO0FBQUE7V0FBQSw0Q0FBQTsyQkFBQTtBQUNFLHNCQUFBLElBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLENBQXVCLENBQUMsaUJBQXhCLENBQUEsRUFBQSxDQURGO0FBQUE7c0JBRDBCO0lBQUEsQ0FqRjVCO0FBQUEsSUFxRkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLE9BQW5CLENBQTJCLFNBQUMsUUFBRCxHQUFBO2VBQ3pCLFFBQVEsQ0FBQyxPQUFULENBQUEsRUFEeUI7TUFBQSxDQUEzQixFQUZVO0lBQUEsQ0FyRlo7QUFBQSxJQTBGQSxTQUFBLEVBQVcsU0FBQyxHQUFELEdBQUE7YUFDVCxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFEUztJQUFBLENBMUZYO0FBQUEsSUE2RkEsV0FBQSxFQUFhLFNBQUMsR0FBRCxHQUFBO2FBQ1gsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLEdBQXRCLEVBRFc7SUFBQSxDQTdGYjtBQUFBLElBZ0dBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTtBQUNoQixNQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLDhCQUFsQixFQUdUO0FBQUEsUUFBQSxzQ0FBQSxFQUF3QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsOEJBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEM7QUFBQSxRQUNBLHVDQUFBLEVBQXlDLFNBQUEsR0FBQTtpQkFBRyxRQUFRLENBQUMsTUFBVCxDQUFnQixpQkFBaEIsRUFBSDtRQUFBLENBRHpDO0FBQUEsUUFFQSxrQ0FBQSxFQUFvQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsMEJBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGcEM7T0FIUyxDQUFYLENBQUEsQ0FBQTthQU9BLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNUO0FBQUEsUUFBQSw2QkFBQSxFQUErQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtPQURTLENBQVgsRUFSZ0I7SUFBQSxDQWhHbEI7QUFBQSxJQTJHQSxZQUFBLEVBQWMsU0FBQSxHQUFBO0FBQ1osVUFBQSxtQkFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLDhCQUFYLENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBWSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQWtDLENBQUMsU0FEL0MsQ0FBQTtBQUFBLE1BRUEsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsQ0FGQSxDQUFBO0FBR0EsTUFBQSxJQUFHLFNBQVMsQ0FBQyxRQUFWLENBQW1CLFFBQW5CLENBQUg7QUFDRSxRQUFBLElBQWlDLFFBQVEsQ0FBQyxHQUFULENBQWEsMEJBQWIsQ0FBakM7aUJBQUEsU0FBUyxDQUFDLEdBQVYsQ0FBYyxjQUFkLEVBQUE7U0FERjtPQUFBLE1BQUE7ZUFHRSxTQUFTLENBQUMsTUFBVixDQUFpQixjQUFqQixFQUhGO09BSlk7SUFBQSxDQTNHZDtBQUFBLElBb0hBLHdCQUFBLEVBQTBCLFNBQUEsR0FBQTtBQUV4QixVQUFBLDhFQUFBO0FBQUEsTUFBQSxRQUFBLEdBQ0U7QUFBQSxRQUFBLHNCQUFBLEVBQXdCLFNBQUEsR0FBQTtpQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFBSDtRQUFBLENBQXhCO0FBQUEsUUFDQSwrQkFBQSxFQUFpQyxTQUFBLEdBQUE7aUJBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBQW9CLFVBQXBCLEVBQUg7UUFBQSxDQURqQztBQUFBLFFBRUEsb0NBQUEsRUFBc0MsU0FBQSxHQUFBO2lCQUFHLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUFvQixlQUFwQixFQUFIO1FBQUEsQ0FGdEM7QUFBQSxRQUdBLGdDQUFBLEVBQWtDLFNBQUEsR0FBQTtpQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFBb0IsV0FBcEIsRUFBSDtRQUFBLENBSGxDO0FBQUEsUUFJQSxtQkFBQSxFQUFxQixTQUFBLEdBQUE7aUJBQUcsSUFBQyxDQUFBLGVBQUQsQ0FBQSxFQUFIO1FBQUEsQ0FKckI7QUFBQSxRQUtBLG1CQUFBLEVBQXFCLFNBQUEsR0FBQTtpQkFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBQSxFQUFIO1FBQUEsQ0FMckI7QUFBQSxRQU1BLGFBQUEsRUFBZSxTQUFBLEdBQUE7aUJBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWLEVBQUg7UUFBQSxDQU5mO0FBQUEsUUFPQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2lCQUFHLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixFQUFIO1FBQUEsQ0FQZjtBQUFBLFFBUUEsYUFBQSxFQUFlLFNBQUEsR0FBQTtpQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLENBQVYsRUFBSDtRQUFBLENBUmY7QUFBQSxRQVNBLGFBQUEsRUFBZSxTQUFBLEdBQUE7aUJBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWLEVBQUg7UUFBQSxDQVRmO0FBQUEsUUFVQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2lCQUFHLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixFQUFIO1FBQUEsQ0FWZjtBQUFBLFFBV0EsYUFBQSxFQUFlLFNBQUEsR0FBQTtpQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLENBQVYsRUFBSDtRQUFBLENBWGY7QUFBQSxRQVlBLGFBQUEsRUFBZSxTQUFBLEdBQUE7aUJBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWLEVBQUg7UUFBQSxDQVpmO0FBQUEsUUFhQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2lCQUFHLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBVixFQUFIO1FBQUEsQ0FiZjtBQUFBLFFBY0EsYUFBQSxFQUFlLFNBQUEsR0FBQTtpQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLENBQVYsRUFBSDtRQUFBLENBZGY7QUFBQSxRQWVBLGFBQUEsRUFBZSxTQUFBLEdBQUE7aUJBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWLEVBQUg7UUFBQSxDQWZmO0FBQUEsUUFpQkEsaUJBQUEsRUFBbUIsU0FBQSxHQUFBO2lCQUFHLElBQUMsQ0FBQSxjQUFELENBQWdCLFdBQWhCLEVBQUg7UUFBQSxDQWpCbkI7QUFBQSxRQWtCQSxvQkFBQSxFQUFzQixTQUFBLEdBQUE7aUJBQUcsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsY0FBaEIsRUFBSDtRQUFBLENBbEJ0QjtBQUFBLFFBbUJBLHlCQUFBLEVBQTJCLFNBQUEsR0FBQTtpQkFBRyxJQUFDLENBQUEsY0FBRCxDQUFnQixtQkFBaEIsRUFBSDtRQUFBLENBbkIzQjtPQURGLENBQUE7QUFBQSxNQXNCQSxLQUFBLEdBQVE7Ozs7b0JBQVMsQ0FBQyxHQUFWLENBQWMsU0FBQyxJQUFELEdBQUE7ZUFBVSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQixFQUFWO01BQUEsQ0FBZCxDQXRCUixDQUFBO0FBdUJBLFlBQ0ssU0FBQyxJQUFELEdBQUE7ZUFDRCxRQUFTLENBQUMsaUJBQUEsR0FBaUIsSUFBbEIsQ0FBVCxHQUFxQyxTQUFBLEdBQUE7aUJBQUcsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBQUg7UUFBQSxFQURwQztNQUFBLENBREw7QUFBQSxXQUFBLDRDQUFBO3lCQUFBO0FBQ0UsWUFBSSxLQUFKLENBREY7QUFBQSxPQXZCQTtBQUFBLE1BMkJBLEtBQUEsR0FBUSw4QkEzQlIsQ0FBQTtBQTRCQTtXQUFBLGdCQUFBOzRCQUFBO0FBQ0UsdUJBQUcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLEVBQUQsR0FBQTttQkFDRCxLQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixLQUFsQixFQUEwQixnQkFBQSxHQUFnQixJQUExQyxFQUFrRCxTQUFDLEtBQUQsR0FBQTtBQUMzRCxrQkFBQSxNQUFBO0FBQUEsY0FBQSxJQUFHLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBWjt1QkFDRSxFQUFFLENBQUMsSUFBSCxDQUFRLEtBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLENBQVIsRUFERjtlQUQyRDtZQUFBLENBQWxELENBQVgsRUFEQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUgsQ0FBSSxFQUFKLEVBQUEsQ0FERjtBQUFBO3VCQTlCd0I7SUFBQSxDQXBIMUI7QUFBQSxJQXdKQSxnQkFBQSxFQUFrQixTQUFDLFNBQUQsR0FBQTtBQUNoQixNQUFBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxVQUFsQixDQUE2QixTQUE3QixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxTQUFELENBQWUsSUFBQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDeEIsS0FBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQUEsRUFEd0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQWYsRUFIZ0I7SUFBQSxDQXhKbEI7QUFBQSxJQWdLQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTthQUNkLFlBRGM7SUFBQSxDQWhLaEI7QUFBQSxJQW1LQSxjQUFBLEVBQWdCLFNBQUMsTUFBRCxHQUFBO2FBQ2QsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLE1BQXZCLEVBRGM7SUFBQSxDQW5LaEI7QUFBQSxJQXNLQSxrQkFBQSxFQUFvQixTQUFBLEdBQUE7YUFDbEI7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsUUFDQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FEaEI7QUFBQSxRQUVBLGNBQUEsRUFBZ0IsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQUZoQjtBQUFBLFFBR0EsZ0JBQUEsRUFBa0IsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBSGxCO0FBQUEsUUFJQSxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FKbEI7UUFEa0I7SUFBQSxDQXRLcEI7R0FiRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/main.coffee
