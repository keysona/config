(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, HoverElement, InputElement, MarkManager, ModeManager, OperationStack, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, getVisibleBufferRange, globalState, haveSomeSelection, highlightRanges, matchScopes, packageScope, settings, swrap, _, _ref, _ref1, _ref2,
    __slice = [].slice;

  Delegato = require('delegato');

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  settings = require('./settings');

  globalState = require('./global-state');

  HoverElement = require('./hover').HoverElement;

  _ref1 = require('./input'), InputElement = _ref1.InputElement, SearchInputElement = _ref1.SearchInputElement;

  _ref2 = require('./utils'), haveSomeSelection = _ref2.haveSomeSelection, highlightRanges = _ref2.highlightRanges, getVisibleBufferRange = _ref2.getVisibleBufferRange, matchScopes = _ref2.matchScopes;

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
      this.rangeMarkers = [];
      this.hover = new HoverElement().initialize(this);
      this.hoverSearchCounter = new HoverElement().initialize(this);
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
      if (settings.get('startInInsertMode') || matchScopes(this.editorElement, settings.get('startInInsertModeScopes'))) {
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
      return this.toggleClassList('with-count', this.hasCount());
    };

    VimState.prototype.resetCount = function() {
      this.count = null;
      return this.toggleClassList('with-count', this.hasCount());
    };

    VimState.prototype.startCharInput = function(charInputAction) {
      this.charInputAction = charInputAction;
      this.inputCharSubscriptions = new CompositeDisposable();
      this.inputCharSubscriptions.add(this.swapClassName('vim-mode-plus-input-char-waiting'));
      return this.inputCharSubscriptions.add(atom.commands.add(this.editorElement, {
        'core:cancel': (function(_this) {
          return function() {
            return _this.resetCharInput();
          };
        })(this)
      }));
    };

    VimState.prototype.setInputChar = function(char) {
      switch (this.charInputAction) {
        case 'save-mark':
          this.saveMark(char);
          break;
        case 'move-to-mark':
          this.moveToMark(char);
          break;
        case 'move-to-mark-line':
          this.moveToMarkLine(char);
      }
      return this.resetCharInput();
    };

    VimState.prototype.resetCharInput = function() {
      var _ref3;
      return (_ref3 = this.inputCharSubscriptions) != null ? _ref3.dispose() : void 0;
    };

    VimState.prototype.saveMark = function(char) {
      return this.mark.set(char, this.editor.getCursorBufferPosition());
    };

    VimState.prototype.moveToMark = function(char) {
      return this.operationStack.run("MoveToMark", {
        input: char
      });
    };

    VimState.prototype.moveToMarkLine = function(char) {
      return this.operationStack.run("MoveToMarkLine", {
        input: char
      });
    };

    VimState.prototype.toggleClassList = function(className, bool) {
      return this.editorElement.classList.toggle(className, bool);
    };

    VimState.prototype.swapClassName = function(className) {
      var oldClassName;
      oldClassName = this.editorElement.className;
      this.editorElement.className = className;
      return new Disposable((function(_this) {
        return function() {
          return _this.editorElement.className = oldClassName;
        };
      })(this));
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

    VimState.prototype.onDidSetMark = function(fn) {
      return this.emitter.on('did-set-mark', fn);
    };

    VimState.prototype.destroy = function() {
      var _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
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
      _ref15 = {}, this.hover = _ref15.hover, this.hoverSearchCounter = _ref15.hoverSearchCounter, this.operationStack = _ref15.operationStack, this.searchHistory = _ref15.searchHistory, this.cursorStyleManager = _ref15.cursorStyleManager, this.input = _ref15.input, this.search = _ref15.search, this.modeManager = _ref15.modeManager, this.operationRecords = _ref15.operationRecords, this.register = _ref15.register, this.count = _ref15.count, this.rangeMarkers = _ref15.rangeMarkers, this.editor = _ref15.editor, this.editorElement = _ref15.editorElement, this.subscriptions = _ref15.subscriptions, this.inputCharSubscriptions = _ref15.inputCharSubscriptions, this.highlightSearchSubscription = _ref15.highlightSearchSubscription;
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
            return (_this.editor != null) && target === _this.editorElement && !_this.isMode('visual', 'blockwise') && !type.startsWith('vim-mode-plus:');
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
      this.activate('normal');
      if (settings.get('clearRangeMarkerOnResetNormalMode')) {
        this.main.clearRangeMarkerForEditors();
      }
      if (settings.get('clearHighlightSearchOnResetNormalMode')) {
        return this.main.clearHighlightSearchForEditors();
      }
    };

    VimState.prototype.reset = function() {
      this.resetCount();
      this.resetCharInput();
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
      selections = this.editor.getSelections();
      if (!(force != null ? force : true)) {
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

    VimState.prototype.hasHighlightSearch = function() {
      return this.highlightSearchMarkers != null;
    };

    VimState.prototype.getHighlightSearch = function() {
      return this.highlightSearchMarkers;
    };

    VimState.prototype.highlightSearch = function(pattern, scanRange) {
      var markers, ranges;
      ranges = [];
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range;
        range = _arg.range;
        return ranges.push(range);
      });
      markers = highlightRanges(this.editor, ranges, {
        invalidate: 'inside',
        "class": 'vim-mode-plus-highlight-search'
      });
      return markers;
    };

    VimState.prototype.refreshHighlightSearch = function() {
      var endRow, scanRange, startRow, _ref3;
      _ref3 = this.editorElement.getVisibleRowRange(), startRow = _ref3[0], endRow = _ref3[1];
      if (!(scanRange = getVisibleBufferRange(this.editor))) {
        return;
      }
      this.clearHighlightSearch();
      if (matchScopes(this.editorElement, settings.get('highlightSearchExcludeScopes'))) {
        return;
      }
      if (settings.get('highlightSearch') && (this.main.highlightSearchPattern != null)) {
        return this.highlightSearchMarkers = this.highlightSearch(this.main.highlightSearchPattern, scanRange);
      }
    };

    VimState.prototype.addRangeMarkers = function(markers) {
      var _ref3;
      (_ref3 = this.rangeMarkers).push.apply(_ref3, markers);
      return this.toggleClassList('with-range-marker', this.hasRangeMarkers());
    };

    VimState.prototype.hasRangeMarkers = function() {
      return this.rangeMarkers.length > 0;
    };

    VimState.prototype.getRangeMarkers = function(markers) {
      return this.rangeMarkers;
    };

    VimState.prototype.clearRangeMarkers = function() {
      var marker, _i, _len, _ref3;
      _ref3 = this.rangeMarkers;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        marker = _ref3[_i];
        marker.destroy();
      }
      this.rangeMarkers = [];
      return this.toggleClassList('with-range-marker', this.hasRangeMarkers());
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdVhBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLE9BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMsZUFBQSxPQUFELEVBQVUsa0JBQUEsVUFBVixFQUFzQiwyQkFBQSxtQkFBdEIsRUFBMkMsYUFBQSxLQUYzQyxDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSlgsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FMZCxDQUFBOztBQUFBLEVBTUMsZUFBZ0IsT0FBQSxDQUFRLFNBQVIsRUFBaEIsWUFORCxDQUFBOztBQUFBLEVBT0EsUUFBcUMsT0FBQSxDQUFRLFNBQVIsQ0FBckMsRUFBQyxxQkFBQSxZQUFELEVBQWUsMkJBQUEsa0JBUGYsQ0FBQTs7QUFBQSxFQVFBLFFBQTJFLE9BQUEsQ0FBUSxTQUFSLENBQTNFLEVBQUMsMEJBQUEsaUJBQUQsRUFBb0Isd0JBQUEsZUFBcEIsRUFBcUMsOEJBQUEscUJBQXJDLEVBQTRELG9CQUFBLFdBUjVELENBQUE7O0FBQUEsRUFTQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBVFIsQ0FBQTs7QUFBQSxFQVdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBWGpCLENBQUE7O0FBQUEsRUFZQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBWmQsQ0FBQTs7QUFBQSxFQWFBLFdBQUEsR0FBYyxP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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/vim-state.coffee
