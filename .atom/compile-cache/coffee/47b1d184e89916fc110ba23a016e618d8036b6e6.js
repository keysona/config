(function() {
  var Base, CompositeDisposable, Delegato, OperationAbortedError, getEditorState, getVimEofBufferPosition, getVimLastBufferRow, getVimLastScreenRow, selectList, settings, vimStateMethods, _, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('./utils'), getVimEofBufferPosition = _ref.getVimEofBufferPosition, getVimLastBufferRow = _ref.getVimLastBufferRow, getVimLastScreenRow = _ref.getVimLastScreenRow;

  settings = require('./settings');

  selectList = null;

  getEditorState = null;

  vimStateMethods = ["onDidChangeInput", "onDidConfirmInput", "onDidCancelInput", "onDidUnfocusInput", "onDidCommandInput", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidUnfocusSearch", "onDidCommandSearch", "onWillSelectTarget", "onDidSelectTarget", "onDidSetTarget", "onDidFinishOperation", "onDidCancelSelectList", "subscribe", "isMode", "hasCount", "getBlockwiseSelections", "updateSelectionProperties"];

  Base = (function() {
    var registries;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, __slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    function Base(vimState, properties) {
      var hover, _ref1, _ref2;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
      _.extend(this, properties);
      if (settings.get('showHoverOnOperate')) {
        hover = (_ref2 = this.hover) != null ? _ref2[settings.get('showHoverOnOperateIcon')] : void 0;
        if ((hover != null) && !this.isComplete()) {
          this.addHover(hover);
        }
      }
    }

    Base.prototype.isComplete = function() {
      var _ref1;
      if (this.isRequireInput() && !this.hasInput()) {
        return false;
      } else if (this.isRequireTarget()) {
        return (_ref1 = this.getTarget()) != null ? typeof _ref1.isComplete === "function" ? _ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.target = null;

    Base.prototype.hasTarget = function() {
      return this.target != null;
    };

    Base.prototype.getTarget = function() {
      return this.target;
    };

    Base.prototype.requireTarget = false;

    Base.prototype.isRequireTarget = function() {
      return this.requireTarget;
    };

    Base.prototype.requireInput = false;

    Base.prototype.isRequireInput = function() {
      return this.requireInput;
    };

    Base.prototype.recordable = false;

    Base.prototype.isRecordable = function() {
      return this.recordable;
    };

    Base.prototype.repeated = false;

    Base.prototype.isRepeated = function() {
      return this.repeated;
    };

    Base.prototype.setRepeated = function() {
      return this.repeated = true;
    };

    Base.prototype.operator = null;

    Base.prototype.hasOperator = function() {
      return this.operator != null;
    };

    Base.prototype.getOperator = function() {
      return this.operator;
    };

    Base.prototype.setOperator = function(operator) {
      this.operator = operator;
      return this.operator;
    };

    Base.prototype.isAsOperatorTarget = function() {
      return this.hasOperator() && !this.getOperator()["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
      throw new OperationAbortedError();
    };

    Base.prototype.defaultCount = 1;

    Base.prototype.getDefaultCount = function() {
      return this.defaultCount;
    };

    Base.prototype.getCount = function() {
      var _ref1;
      return this.count != null ? this.count : this.count = (_ref1 = this.vimState.getCount()) != null ? _ref1 : this.getDefaultCount();
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.getDefaultCount();
    };

    Base.prototype.countTimes = function(fn) {
      var count, isFinal, last, stop, stopped, _i, _results;
      if ((last = this.getCount()) < 1) {
        return;
      }
      stopped = false;
      stop = function() {
        return stopped = true;
      };
      _results = [];
      for (count = _i = 1; 1 <= last ? _i <= last : _i >= last; count = 1 <= last ? ++_i : --_i) {
        isFinal = count === last;
        fn({
          count: count,
          isFinal: isFinal,
          stop: stop
        });
        if (stopped) {
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.addHover = function(text, _arg) {
      var replace;
      replace = (_arg != null ? _arg : {}).replace;
      if (replace != null ? replace : false) {
        return this.vimState.hover.replaceLastSection(text);
      } else {
        return this.vimState.hover.add(text);
      }
    };

    Base.prototype["new"] = function(name, properties) {
      var klass;
      if (properties == null) {
        properties = {};
      }
      klass = Base.getClass(name);
      return new klass(this.vimState, properties);
    };

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel();
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (selectList == null) {
        selectList = require('./select-list');
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.hasInput = function() {
      return this.input != null;
    };

    Base.prototype.getInput = function() {
      return this.input;
    };

    Base.prototype.focusInput = function(options) {
      var replace;
      if (options == null) {
        options = {};
      }
      if (options.charsMax == null) {
        options.charsMax = 1;
      }
      this.onDidConfirmInput((function(_this) {
        return function(input) {
          _this.input = input;
          return _this.processOperation();
        };
      })(this));
      replace = false;
      this.onDidChangeInput((function(_this) {
        return function(input) {
          _this.addHover(input, {
            replace: replace
          });
          return replace = true;
        };
      })(this));
      this.onDidCancelInput((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      return this.vimState.input.focus(options);
    };

    Base.prototype.getVimEofBufferPosition = function() {
      return getVimEofBufferPosition(this.editor);
    };

    Base.prototype.getVimLastBufferRow = function() {
      return getVimLastBufferRow(this.editor);
    };

    Base.prototype.getVimLastScreenRow = function() {
      return getVimLastScreenRow(this.editor);
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this["instanceof"]('Operator');
    };

    Base.prototype.isMotion = function() {
      return this["instanceof"]('Motion');
    };

    Base.prototype.isTextObject = function() {
      return this["instanceof"]('TextObject');
    };

    Base.prototype.getName = function() {
      return this.constructor.name;
    };

    Base.prototype.toString = function() {
      var str;
      str = this.getName();
      if (this.hasTarget()) {
        str += ", target=" + (this.getTarget().toString());
      }
      return str;
    };

    Base.prototype.emitWillSelectTarget = function() {
      return this.vimState.emitter.emit('will-select-target');
    };

    Base.prototype.emitDidSelectTarget = function() {
      return this.vimState.emitter.emit('did-select-target');
    };

    Base.prototype.emitDidSetTarget = function(operator) {
      return this.vimState.emitter.emit('did-set-target', operator);
    };

    Base.init = function(service) {
      var klass, lib, __, _i, _len, _ref1, _ref2;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      _ref1 = ['./operator', './motion', './text-object', './insert-mode', './misc-command'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        lib = _ref1[_i];
        require(lib);
      }
      _ref2 = this.getRegistries();
      for (__ in _ref2) {
        klass = _ref2[__];
        if (klass.isCommand()) {
          this.subscriptions.add(klass.registerCommand());
        }
      }
      return this.subscriptions;
    };

    Base.reset = function() {
      var klass, __, _ref1, _results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      _ref1 = this.getRegistries();
      _results = [];
      for (__ in _ref1) {
        klass = _ref1[__];
        if (klass.isCommand()) {
          _results.push(this.subscriptions.add(klass.registerCommand()));
        }
      }
      return _results;
    };

    registries = {
      Base: Base
    };

    Base.extend = function(command) {
      this.command = command != null ? command : true;
      if ((name in registries) && (!this.suppressWarning)) {
        console.warn("Duplicate constructor " + this.name);
      }
      return registries[this.name] = this;
    };

    Base.getClass = function(name) {
      var klass;
      if (klass = registries[name]) {
        return klass;
      } else {
        throw new Error("class '" + name + "' not found");
      }
    };

    Base.getRegistries = function() {
      return registries;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _.dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _.dasherize(this.name);
    };

    Base.commandScope = 'atom-text-editor';

    Base.getCommandScope = function() {
      return this.commandScope;
    };

    Base.description;

    Base.getDesctiption = function() {
      if (this.hasOwnProperty("description")) {
        return this.description;
      } else {
        return null;
      }
    };

    Base.registerCommand = function() {
      return atom.commands.add(this.getCommandScope(), this.getCommandName(), (function(_this) {
        return function(event) {
          return _this.run(event);
        };
      })(this));
    };

    Base.run = function(event) {
      var vimState;
      if (vimState = getEditorState(atom.workspace.getActiveTextEditor())) {
        vimState.domEvent = event;
        return vimState.operationStack.run(this);
      }
    };

    return Base;

  })();

  OperationAbortedError = (function(_super) {
    __extends(OperationAbortedError, _super);

    OperationAbortedError.extend(false);

    function OperationAbortedError(message) {
      this.message = message;
      this.name = 'OperationAborted Error';
    }

    return OperationAbortedError;

  })(Base);

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZMQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFHQSxPQUlJLE9BQUEsQ0FBUSxTQUFSLENBSkosRUFDRSwrQkFBQSx1QkFERixFQUVFLDJCQUFBLG1CQUZGLEVBR0UsMkJBQUEsbUJBTkYsQ0FBQTs7QUFBQSxFQVNBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVRYLENBQUE7O0FBQUEsRUFVQSxVQUFBLEdBQWEsSUFWYixDQUFBOztBQUFBLEVBV0EsY0FBQSxHQUFpQixJQVhqQixDQUFBOztBQUFBLEVBYUEsZUFBQSxHQUFrQixDQUNoQixrQkFEZ0IsRUFFaEIsbUJBRmdCLEVBR2hCLGtCQUhnQixFQUloQixtQkFKZ0IsRUFLaEIsbUJBTGdCLEVBTWhCLG1CQU5nQixFQU9oQixvQkFQZ0IsRUFRaEIsbUJBUmdCLEVBU2hCLG9CQVRnQixFQVVoQixvQkFWZ0IsRUFXaEIsb0JBWGdCLEVBWWhCLG1CQVpnQixFQWFoQixnQkFiZ0IsRUFjaEIsc0JBZGdCLEVBZWhCLHVCQWZnQixFQWdCaEIsV0FoQmdCLEVBaUJoQixRQWpCZ0IsRUFrQmhCLFVBbEJnQixFQW1CaEIsd0JBbkJnQixFQW9CaEIsMkJBcEJnQixDQWJsQixDQUFBOztBQUFBLEVBb0NNO0FBQ0osUUFBQSxVQUFBOztBQUFBLElBQUEsUUFBUSxDQUFDLFdBQVQsQ0FBcUIs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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/base.coffee
