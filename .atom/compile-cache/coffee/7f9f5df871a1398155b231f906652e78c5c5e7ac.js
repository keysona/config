(function() {
  var Base, CompositeDisposable, Delegato, OperationAbortedError, getEditorState, selectList, settings, vimStateMethods, _,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

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
      var hover, _ref, _ref1;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.vimState.hover.setPoint();
      if (hover = (_ref1 = this.hover) != null ? _ref1[settings.get('showHoverOnOperateIcon')] : void 0) {
        this.addHover(hover);
      }
      _.extend(this, properties);
    }

    Base.prototype.isComplete = function() {
      var _ref;
      if (this.isRequireInput() && !this.hasInput()) {
        return false;
      } else if (this.isRequireTarget()) {
        return (_ref = this.getTarget()) != null ? _ref.isComplete() : void 0;
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
      var _ref;
      return this.count != null ? this.count : this.count = (_ref = this.vimState.getCount()) != null ? _ref : this.getDefaultCount();
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
      if (settings.get('showHoverOnOperate')) {
        if (replace != null ? replace : false) {
          return this.vimState.hover.replaceLastSection(text);
        } else {
          return this.vimState.hover.add(text);
        }
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
      var klass, lib, __, _i, _len, _ref, _ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      _ref = ['./operator', './motion', './text-object', './insert-mode', './misc-command'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lib = _ref[_i];
        require(lib);
      }
      _ref1 = this.getRegistries();
      for (__ in _ref1) {
        klass = _ref1[__];
        if (klass.isCommand()) {
          this.subscriptions.add(klass.registerCommand());
        }
      }
      return this.subscriptions;
    };

    Base.reset = function() {
      var klass, __, _ref, _results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      _ref = this.getRegistries();
      _results = [];
      for (__ in _ref) {
        klass = _ref[__];
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
        return function() {
          return _this.run();
        };
      })(this));
    };

    Base.run = function() {
      var vimState;
      if (vimState = getEditorState(atom.workspace.getActiveTextEditor())) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9IQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLElBTGIsQ0FBQTs7QUFBQSxFQU1BLGNBQUEsR0FBaUIsSUFOakIsQ0FBQTs7QUFBQSxFQVFBLGVBQUEsR0FBa0IsQ0FDaEIsa0JBRGdCLEVBRWhCLG1CQUZnQixFQUdoQixrQkFIZ0IsRUFJaEIsbUJBSmdCLEVBS2hCLG1CQUxnQixFQU1oQixtQkFOZ0IsRUFPaEIsb0JBUGdCLEVBUWhCLG1CQVJnQixFQVNoQixvQkFUZ0IsRUFVaEIsb0JBVmdCLEVBV2hCLG9CQVhnQixFQVloQixtQkFaZ0IsRUFhaEIsZ0JBYmdCLEVBY2hCLHNCQWRnQixFQWVoQix1QkFmZ0IsRUFnQmhCLFdBaEJnQixFQWlCaEIsUUFqQmdCLEVBa0JoQixVQWxCZ0IsRUFtQmhCLHdCQW5CZ0IsRUFvQmhCLDJCQXBCZ0IsQ0FSbEIsQ0FBQTs7QUFBQSxFQStCTTtBQUNKLFFBQUEsVUFBQTs7QUFBQSxJQUFBLFFBQVEsQ0FBQyxXQUFULENBQXFCLElBQXJCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLElBQUMsQ0FBQSxnQkFBRCxhQUFrQixhQUFBLGVBQUEsQ0FBQSxRQUFvQixDQUFBO0FBQUEsTUFBQSxVQUFBLEVB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/base.coffee
