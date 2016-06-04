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
      hover = (_ref2 = this.hover) != null ? _ref2[settings.get('showHoverOnOperateIcon')] : void 0;
      if ((hover != null) && settings.get('showHoverOnOperate')) {
        this.addHover(hover);
      }
      _.extend(this, properties);
    }

    Base.prototype.isComplete = function() {
      var _ref1;
      if (this.isRequireInput() && !this.hasInput()) {
        return false;
      } else if (this.isRequireTarget()) {
        return (_ref1 = this.getTarget()) != null ? _ref1.isComplete() : void 0;
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
