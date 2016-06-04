(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, Hover, InputElement, MarkManager, ModeManager, OperationStack, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, getVisibleBufferRange, globalState, haveSomeSelection, highlightRanges, inspect, p, packageScope, settings, swrap, _, _ref, _ref1, _ref2,
    __slice = [].slice;

  Delegato = require('delegato');

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  inspect = require('util').inspect;

  p = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log(inspect.apply(null, args));
  };

  settings = require('./settings');

  globalState = require('./global-state');

  Hover = require('./hover').Hover;

  _ref1 = require('./input'), InputElement = _ref1.InputElement, SearchInputElement = _ref1.SearchInputElement;

  _ref2 = require('./utils'), haveSomeSelection = _ref2.haveSomeSelection, highlightRanges = _ref2.highlightRanges, getVisibleBufferRange = _ref2.getVisibleBufferRange;

  swrap = require('./selection-wrapper');

  OperationStack = require('./operation-stack');

  MarkManager = require('./mark-manager');

  ModeManager = require('./mode-manager');

  RegisterManager = require('./register-manager');

  SearchHistoryManager = require('./search-history-manager');

  CursorStyleManager = require('./cursor-style-manager');

  BlockwiseSelection = null;

  packageScope = 'vim-mode-plus';

  module.exports = VimState = (function() {
    Delegato.includeInto(VimState);

    VimState.prototype.destroyed = false;

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    function VimState(main, editor, statusBarManager) {
      this.main = main;
      this.editor = editor;
      this.statusBarManager = statusBarManager;
      this.editorElement = atom.views.getView(this.editor);
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.mark = new MarkManager(this);
      this.register = new RegisterManager(this);
      this.hover = new Hover(this);
      this.hoverSearchCounter = new Hover(this);
      this.searchHistory = new SearchHistoryManager(this);
      this.input = new InputElement().initialize(this);
      this.searchInput = new SearchInputElement().initialize(this);
      this.operationStack = new OperationStack(this);
      this.cursorStyleManager = new CursorStyleManager(this);
      this.blockwiseSelections = [];
      this.observeSelection();
      this.highlightSearchSubscription = this.editorElement.onDidChangeScrollTop((function(_this) {
        return function() {
          return _this.refreshHighlightSearch();
        };
      })(this));
      this.editorElement.classList.add(packageScope);
      if (settings.get('startInInsertMode')) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
    }

    VimState.prototype.subscribe = function() {
      var args, _ref3;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref3 = this.operationStack).subscribe.apply(_ref3, args);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return this.blockwiseSelections;
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return _.last(this.blockwiseSelections);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return this.getBlockwiseSelections().sort(function(a, b) {
        return a.getStartSelection().compare(b.getStartSelection());
      });
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      return this.blockwiseSelections = [];
    };

    VimState.prototype.addBlockwiseSelectionFromSelection = function(selection) {
      if (BlockwiseSelection == null) {
        BlockwiseSelection = require('./blockwise-selection');
      }
      return this.blockwiseSelections.push(new BlockwiseSelection(selection));
    };

    VimState.prototype.selectBlockwise = function() {
      var selection, _i, _len, _ref3;
      _ref3 = this.editor.getSelections();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        selection = _ref3[_i];
        this.addBlockwiseSelectionFromSelection(selection);
      }
      return this.updateSelectionProperties();
    };

    VimState.prototype.selectLinewise = function() {
      return swrap.expandOverLine(this.editor, {
        preserveGoalColumn: true
      });
    };

    VimState.prototype.count = null;

    VimState.prototype.hasCount = function() {
      return this.count != null;
    };

    VimState.prototype.getCount = function() {
      return this.count;
    };

    VimState.prototype.setCount = function(number) {
      if (this.count == null) {
        this.count = 0;
      }
      this.count = (this.count * 10) + number;
      this.hover.add(number);
      return this.updateEditorElement();
    };

    VimState.prototype.resetCount = function() {
      this.count = null;
      return this.updateEditorElement();
    };

    VimState.prototype.updateEditorElement = function() {
      this.editorElement.classList.toggle('with-count', this.hasCount());
      return this.editorElement.classList.toggle('with-register', this.register.hasName());
    };

    VimState.prototype.onDidChangeInput = function(fn) {
      return this.subscribe(this.input.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmInput = function(fn) {
      return this.subscribe(this.input.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelInput = function(fn) {
      return this.subscribe(this.input.onDidCancel(fn));
    };

    VimState.prototype.onDidUnfocusInput = function(fn) {
      return this.subscribe(this.input.onDidUnfocus(fn));
    };

    VimState.prototype.onDidCommandInput = function(fn) {
      return this.subscribe(this.input.onDidCommand(fn));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidUnfocusSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidUnfocus(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.onDidFailToSetTarget = function(fn) {
      return this.emitter.on('did-fail-to-set-target', fn);
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.destroy = function() {
      var _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.activate('normal');
        if ((_ref3 = this.editorElement.component) != null) {
          _ref3.setInputEnabled(true);
        }
        this.editorElement.classList.remove(packageScope, 'normal-mode');
      }
      if ((_ref4 = this.hover) != null) {
        if (typeof _ref4.destroy === "function") {
          _ref4.destroy();
        }
      }
      if ((_ref5 = this.hoverSearchCounter) != null) {
        if (typeof _ref5.destroy === "function") {
          _ref5.destroy();
        }
      }
      if ((_ref6 = this.operationStack) != null) {
        if (typeof _ref6.destroy === "function") {
          _ref6.destroy();
        }
      }
      if ((_ref7 = this.searchHistory) != null) {
        if (typeof _ref7.destroy === "function") {
          _ref7.destroy();
        }
      }
      if ((_ref8 = this.cursorStyleManager) != null) {
        if (typeof _ref8.destroy === "function") {
          _ref8.destroy();
        }
      }
      if ((_ref9 = this.input) != null) {
        if (typeof _ref9.destroy === "function") {
          _ref9.destroy();
        }
      }
      if ((_ref10 = this.search) != null) {
        if (typeof _ref10.destroy === "function") {
          _ref10.destroy();
        }
      }
      if ((_ref11 = this.modeManager) != null) {
        if (typeof _ref11.destroy === "function") {
          _ref11.destroy();
        }
      }
      if ((_ref12 = this.operationRecords) != null) {
        if (typeof _ref12.destroy === "function") {
          _ref12.destroy();
        }
      }
      ((_ref13 = this.register) != null ? _ref13.destroy : void 0) != null;
      this.clearHighlightSearch();
      if ((_ref14 = this.highlightSearchSubscription) != null) {
        _ref14.dispose();
      }
      _ref15 = {}, this.hover = _ref15.hover, this.hoverSearchCounter = _ref15.hoverSearchCounter, this.operationStack = _ref15.operationStack, this.searchHistory = _ref15.searchHistory, this.cursorStyleManager = _ref15.cursorStyleManager, this.input = _ref15.input, this.search = _ref15.search, this.modeManager = _ref15.modeManager, this.operationRecords = _ref15.operationRecords, this.register = _ref15.register, this.count = _ref15.count, this.editor = _ref15.editor, this.editorElement = _ref15.editorElement, this.subscriptions = _ref15.subscriptions, this.highlightSearchSubscription = _ref15.highlightSearchSubscription;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.observeSelection = function() {
      var checkSelection, isInterestingEvent, onInterestingEvent, preserveCharacterwise, _checkSelection, _preserveCharacterwise;
      isInterestingEvent = (function(_this) {
        return function(_arg) {
          var target, type;
          target = _arg.target, type = _arg.type;
          if (_this.mode === 'insert') {
            return false;
          } else {
            return (_this.editor != null) && target === _this.editorElement && !type.startsWith('vim-mode-plus:');
          }
        };
      })(this);
      onInterestingEvent = function(fn) {
        return function(event) {
          if (isInterestingEvent(event)) {
            return fn();
          }
        };
      };
      _checkSelection = (function(_this) {
        return function() {
          var submode;
          if (_this.operationStack.isProcessing()) {
            return;
          }
          if (haveSomeSelection(_this.editor)) {
            submode = swrap.detectVisualModeSubmode(_this.editor);
            if (_this.isMode('visual', submode)) {
              return _this.updateCursorsVisibility();
            } else {
              return _this.activate('visual', submode);
            }
          } else {
            if (_this.isMode('visual')) {
              return _this.activate('normal');
            }
          }
        };
      })(this);
      _preserveCharacterwise = (function(_this) {
        return function() {
          var selection, _i, _len, _ref3, _results;
          _ref3 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            selection = _ref3[_i];
            _results.push(swrap(selection).preserveCharacterwise());
          }
          return _results;
        };
      })(this);
      checkSelection = onInterestingEvent(_checkSelection);
      preserveCharacterwise = onInterestingEvent(_preserveCharacterwise);
      this.editorElement.addEventListener('mouseup', checkSelection);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('mouseup', checkSelection);
        };
      })(this)));
      this.subscriptions.add(atom.commands.onWillDispatch(preserveCharacterwise));
      return this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
    };

    VimState.prototype.resetNormalMode = function() {
      this.editor.clearSelections();
      return this.activate('normal');
    };

    VimState.prototype.reset = function() {
      this.resetCount();
      this.register.reset();
      this.searchHistory.reset();
      this.hover.reset();
      return this.operationStack.reset();
    };

    VimState.prototype.updateCursorsVisibility = function() {
      return this.cursorStyleManager.refresh();
    };

    VimState.prototype.updateSelectionProperties = function(_arg) {
      var force, selection, selections, _i, _len, _results;
      force = (_arg != null ? _arg : {}).force;
      if (force == null) {
        force = true;
      }
      selections = this.editor.getSelections();
      if (!force) {
        selections = selections.filter(function(selection) {
          return swrap(selection).getCharacterwiseHeadPosition() == null;
        });
      }
      _results = [];
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        _results.push(swrap(selection).preserveCharacterwise());
      }
      return _results;
    };

    VimState.prototype.clearHighlightSearch = function() {
      var marker, _i, _len, _ref3, _ref4;
      _ref4 = (_ref3 = this.highlightSearchMarkers) != null ? _ref3 : [];
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        marker = _ref4[_i];
        marker.destroy();
      }
      return this.highlightSearchMarkers = null;
    };

    VimState.prototype.highlightSearch = function() {
      var pattern, ranges, scanRange;
      scanRange = getVisibleBufferRange(this.editor);
      pattern = globalState.highlightSearchPattern;
      ranges = [];
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range;
        range = _arg.range;
        return ranges.push(range);
      });
      return highlightRanges(this.editor, ranges, {
        "class": 'vim-mode-plus-highlight-search'
      });
    };

    VimState.prototype.refreshHighlightSearch = function() {
      var endRow, startRow, _ref3;
      _ref3 = this.editorElement.getVisibleRowRange(), startRow = _ref3[0], endRow = _ref3[1];
      if (!((startRow != null) && (endRow != null))) {
        return;
      }
      if (this.highlightSearchMarkers) {
        this.clearHighlightSearch();
      }
      if (settings.get('highlightSearch') && (globalState.highlightSearchPattern != null)) {
        return this.highlightSearchMarkers = this.highlightSearch();
      }
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK1dBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLE9BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMsZUFBQSxPQUFELEVBQVUsa0JBQUEsVUFBVixFQUFzQiwyQkFBQSxtQkFBdEIsRUFBMkMsYUFBQSxLQUYzQyxDQUFBOztBQUFBLEVBSUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BSkQsQ0FBQTs7QUFBQSxFQUtBLENBQUEsR0FBSSxTQUFBLEdBQUE7QUFBYSxRQUFBLElBQUE7QUFBQSxJQUFaLDhEQUFZLENBQUE7V0FBQSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQUEsYUFBUSxJQUFSLENBQVosRUFBYjtFQUFBLENBTEosQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVBYLENBQUE7O0FBQUEsRUFRQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBUmQsQ0FBQTs7QUFBQSxFQVNDLFFBQVMsT0FBQSxDQUFRLFNBQVIsRUFBVCxLQVRELENBQUE7O0FBQUEsRUFVQSxRQUFxQyxPQUFBLENBQVEsU0FBUixDQUFyQyxFQUFDLHFCQUFBLFlBQUQsRUFBZSwyQkFBQSxrQkFWZixDQUFBOztBQUFBLEVBV0EsUUFBOEQsT0FBQSxDQUFRLFNBQVIsQ0FBOUQsRUFBQywwQkFBQSxpQkFBRCxFQUFvQix3QkFBQSxlQUFwQixFQUFxQyw4QkFBQSxxQkFYckMsQ0FBQTs7QUFBQSxF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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/vim-state.coffee
