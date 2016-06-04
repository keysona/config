(function() {
  var Base, CompositeDisposable, CurrentSelection, Disposable, MoveToRelativeLine, OperationStack, Select, moveCursorLeft, settings, _, _ref, _ref1,
    __slice = [].slice;

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  moveCursorLeft = require('./utils').moveCursorLeft;

  settings = require('./settings');

  _ref1 = {}, CurrentSelection = _ref1.CurrentSelection, Select = _ref1.Select, MoveToRelativeLine = _ref1.MoveToRelativeLine;

  OperationStack = (function() {
    function OperationStack(vimState) {
      var _ref2;
      this.vimState = vimState;
      _ref2 = this.vimState, this.editor = _ref2.editor, this.editorElement = _ref2.editorElement;
      if (CurrentSelection == null) {
        CurrentSelection = Base.getClass('CurrentSelection');
      }
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      this.currentSelection = new CurrentSelection(this.vimState);
      this.select = new Select(this.vimState);
      this.reset();
    }

    OperationStack.prototype.subscribe = function() {
      var args, _ref2;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref2 = this.subscriptions).add.apply(_ref2, args);
    };

    OperationStack.prototype.composeOperation = function(operation) {
      var mode;
      mode = this.vimState.mode;
      switch (false) {
        case !operation.isOperator():
          if ((mode === 'visual') && operation.isRequireTarget()) {
            operation = operation.setTarget(this.currentSelection);
          }
          break;
        case !operation.isTextObject():
          if (mode === 'visual' || mode === 'normal') {
            operation = this.select.setTarget(operation);
          }
          break;
        case !operation.isMotion():
          if (mode === 'visual') {
            operation = this.select.setTarget(operation);
          }
      }
      return operation;
    };

    OperationStack.prototype.run = function(klass, properties) {
      var error, _ref2;
      if (_.isString(klass)) {
        klass = Base.getClass(klass);
      }
      try {
        if (((_ref2 = this.peekTop()) != null ? _ref2.constructor : void 0) === klass) {
          klass = MoveToRelativeLine;
        }
        this.stack.push(this.composeOperation(new klass(this.vimState, properties)));
        return this.process();
      } catch (_error) {
        error = _error;
        return this.handleError(error);
      }
    };

    OperationStack.prototype.handleError = function(error) {
      this.vimState.reset();
      if (!(typeof error["instanceof"] === "function" ? error["instanceof"]('OperationAbortedError') : void 0)) {
        throw error;
      }
    };

    OperationStack.prototype.isProcessing = function() {
      return this.processing;
    };

    OperationStack.prototype.process = function() {
      var error, scope, _base;
      this.processing = true;
      if (this.stack.length > 2) {
        throw new Error('Operation stack must not exceeds 2 length');
      }
      try {
        this.reduce();
        if (this.peekTop().isComplete()) {
          return this.execute(this.stack.pop());
        } else {
          if (this.vimState.isMode('normal') && this.peekTop().isOperator()) {
            this.vimState.activate('operator-pending');
          }
          if (scope = typeof (_base = this.peekTop().constructor).getCommandNameWithoutPrefix === "function" ? _base.getCommandNameWithoutPrefix() : void 0) {
            scope += "-pending";
            this.editorElement.classList.add(scope);
            return this.subscribe(new Disposable((function(_this) {
              return function() {
                return _this.editorElement.classList.remove(scope);
              };
            })(this)));
          }
        }
      } catch (_error) {
        error = _error;
        if (typeof error["instanceof"] === "function" ? error["instanceof"]('OperatorError') : void 0) {
          this.vimState.resetNormalMode();
        } else {
          throw error;
        }
      }
    };

    OperationStack.prototype.execute = function(operation) {
      var execution, onReject, onResolve;
      execution = operation.execute();
      if (execution instanceof Promise) {
        onResolve = this.finish.bind(this, operation);
        onReject = this.handleError.bind(this);
        return execution.then(onResolve)["catch"](onReject);
      } else {
        return this.finish(operation);
      }
    };

    OperationStack.prototype.cancel = function() {
      var _ref2;
      if ((_ref2 = this.vimState.mode) !== 'visual' && _ref2 !== 'insert') {
        this.vimState.resetNormalMode();
      }
      return this.finish();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      if (!this.editor.getLastSelection().isEmpty()) {
        if (settings.get('throwErrorOnNonEmptySelectionInNormalMode')) {
          throw new Error("Selection is not empty in normal-mode: " + (operation.toString()));
        } else {
          return this.editor.clearSelections();
        }
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, _i, _len, _ref2, _results;
      _ref2 = this.editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        cursor = _ref2[_i];
        if (cursor.isAtEndOfLine()) {
          _results.push(moveCursorLeft(cursor, {
            preserveGoalColumn: true
          }));
        }
      }
      return _results;
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.isRecordable() : void 0) {
        this.record(operation);
      }
      this.vimState.emitter.emit('did-finish-operation');
      if (this.vimState.isMode('normal')) {
        this.ensureAllSelectionsAreEmpty(operation);
        this.ensureAllCursorsAreNotAtEndOfLine();
      }
      this.vimState.updateCursorsVisibility();
      return this.vimState.reset();
    };

    OperationStack.prototype.peekTop = function() {
      return _.last(this.stack);
    };

    OperationStack.prototype.reduce = function() {
      var operation, _results;
      _results = [];
      while (!(this.stack.length < 2)) {
        operation = this.stack.pop();
        _results.push(this.peekTop().setTarget(operation));
      }
      return _results;
    };

    OperationStack.prototype.reset = function() {
      var _ref2;
      this.stack = [];
      this.processing = false;
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      return this.subscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var _ref2, _ref3;
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      return _ref3 = {}, this.stack = _ref3.stack, this.subscriptions = _ref3.subscriptions, _ref3;
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.record = function(recorded) {
      this.recorded = recorded;
    };

    OperationStack.prototype.getRecorded = function() {
      return this.recorded;
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdGlvbi1zdGFjay5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNklBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBRUEsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQyxrQkFBQSxVQUFELEVBQWEsMkJBQUEsbUJBRmIsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQyxpQkFBa0IsT0FBQSxDQUFRLFNBQVIsRUFBbEIsY0FKRCxDQUFBOztBQUFBLEVBS0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBTFgsQ0FBQTs7QUFBQSxFQU1BLFFBQWlELEVBQWpELEVBQUMseUJBQUEsZ0JBQUQsRUFBbUIsZUFBQSxNQUFuQixFQUEyQiwyQkFBQSxrQkFOM0IsQ0FBQTs7QUFBQSxFQVFNO0FBQ1MsSUFBQSx3QkFBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLEtBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsUUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGVBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxzQkFBQSxhQUFYLENBQUE7O1FBQ0EsbUJBQW9CLElBQUksQ0FBQyxRQUFMLENBQWMsa0JBQWQ7T0FEcEI7O1FBRUEsU0FBVSxJQUFJLENBQUMsUUFBTCxDQUFjLFFBQWQ7T0FGVjs7UUFHQSxxQkFBc0IsSUFBSSxDQUFDLFFBQUwsQ0FBYyxvQkFBZDtPQUh0QjtBQUFBLE1BTUEsSUFBQyxDQUFBLGdCQUFELEdBQXdCLElBQUEsZ0JBQUEsQ0FBaUIsSUFBQyxDQUFBLFFBQWxCLENBTnhCLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLFFBQVIsQ0FQZCxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBUkEsQ0FEVztJQUFBLENBQWI7O0FBQUEsNkJBV0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsV0FBQTtBQUFBLE1BRFUsOERBQ1YsQ0FBQTthQUFBLFNBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBYyxDQUFDLEdBQWYsY0FBbUIsSUFBbkIsRUFEUztJQUFBLENBWFgsQ0FBQTs7QUFBQSw2QkFjQSxnQkFBQSxHQUFrQixTQUFDLFNBQUQsR0FBQTtBQUNoQixVQUFBLElBQUE7QUFBQSxNQUFDLE9BQVEsSUFBQyxDQUFBLFNBQVQsSUFBRCxDQUFBO0FBQ0EsY0FBQSxLQUFBO0FBQUEsY0FDTyxTQUFTLENBQUMsVUFBVixDQUFBLENBRFA7QUFFSSxVQUFBLElBQUcsQ0FBQyxJQUFBLEtBQVEsUUFBVCxDQUFBLElBQXVCLFNBQVMsQ0FBQyxlQUFWLENBQUEsQ0FBMUI7QUFDRSxZQUFBLFNBQUEsR0FBWSxTQUFTLENBQUMsU0FBVixDQUFvQixJQUFDLENBQUEsZ0JBQXJCLENBQVosQ0FERjtXQUZKOztBQUFBLGNBSU8sU0FBUyxDQUFDLFlBQVYsQ0FBQSxDQUpQO0FBS0ksVUFBQSxJQUFHLElBQUEsS0FBUyxRQUFULElBQUEsSUFBQSxLQUFtQixRQUF0QjtBQUNFLFlBQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFrQixTQUFsQixDQUFaLENBREY7V0FMSjs7QUFBQSxjQU9PLFNBQVMsQ0FBQyxRQUFWLENBQUEsQ0FQUDtBQVFJLFVBQUEsSUFBSSxJQUFBLEtBQVEsUUFBWjtBQUNFLFlBQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFrQixTQUFsQixDQUFaLENBREY7V0FSSjtBQUFBLE9BREE7YUFXQSxVQVpnQjtJQUFBLENBZGxCLENBQUE7O0FBQUEsNkJBNEJBLEdBQUEsR0FBSyxTQUFDLEtBQUQsRUFBUSxVQUFSLEdBQUE7QUFDSCxVQUFBLFlBQUE7QUFBQSxNQUFBLElBQWdDLENBQUMsQ0FBQyxRQUFGLENBQVcsS0FBWCxDQUFoQztBQUFBLFFBQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZCxDQUFSLENBQUE7T0FBQTtBQUNBO0FBR0UsUUFBQSw2Q0FBeUMsQ0FBRSxxQkFBWixLQUEyQixLQUExRDtBQUFBLFVBQUEsS0FBQSxHQUFRLGtCQUFSLENBQUE7U0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLGdCQUFELENBQXNCLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxRQUFQLEVBQWlCLFVBQWpCLENBQXRCLENBQVosQ0FGQSxDQUFBO2VBR0EsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQU5GO09BQUEsY0FBQTtBQVFFLFFBREksY0FDSixDQUFBO2VBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxLQUFiLEVBUkY7T0FGRztJQUFBLENBNUJMLENBQUE7O0FBQUEsNkJBd0NBLFdBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsNkNBQU8sS0FBSyxDQUFDLFlBQUQsRUFBYSxrQ0FBekI7QUFDRSxjQUFNLEtBQU4sQ0FERjtPQUZXO0lBQUEsQ0F4Q2IsQ0FBQTs7QUFBQSw2QkE2Q0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNaLElBQUMsQ0FBQSxXQURXO0lBQUEsQ0E3Q2QsQ0FBQTs7QUFBQSw2QkFnREEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsbUJBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBZCxDQUFBO0FBQ0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxHQUFnQixDQUFuQjtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sMkNBQU4sQ0FBVixDQURGO09BREE7QUFJQTtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsVUFBWCxDQUFBLENBQUg7aUJBQ0UsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBQSxDQUFULEVBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixRQUFqQixDQUFBLElBQStCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLFVBQVgsQ0FBQSxDQUFsQztBQUNFLFlBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLGtCQUFuQixDQUFBLENBREY7V0FBQTtBQUlBLFVBQUEsSUFBRyxLQUFBLGlHQUE4QixDQUFDLHNDQUFsQztBQUNFLFlBQUEsS0FBQSxJQUFTLFVBQVQsQ0FBQTtBQUFBLFlBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsS0FBN0IsQ0FEQSxDQUFBO21CQUVBLElBQUMsQ0FBQSxTQUFELENBQWUsSUFBQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtxQkFBQSxTQUFBLEdBQUE7dUJBQ3hCLEtBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLEtBQWhDLEVBRHdCO2NBQUEsRUFBQTtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQUFmLEVBSEY7V0FQRjtTQUZGO09BQUEsY0FBQTtBQWVFLFFBREksY0FDSixDQUFBO0FBQUEsUUFBQSxnREFBRyxLQUFLLENBQUMsWUFBRCxFQUFhLHlCQUFyQjtVQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUFBLEVBREY7U0FBQSxNQUFBO0FBSUUsZ0JBQU0sS0FBTixDQUpGO1NBZkY7T0FMTztJQUFBLENBaERULENBQUE7O0FBQUEsNkJBMEVBLE9BQUEsR0FBUyxTQUFDLFNBQUQsR0FBQTtBQUNQLFVBQUEsOEJBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxTQUFTLENBQUMsT0FBVixDQUFBLENBQVosQ0FBQTtBQUNBLE1BQUEsSUFBRyxTQUFBLFlBQXFCLE9BQXhCO0FBQ0UsUUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsSUFBYixFQUFtQixTQUFuQixDQUFaLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsSUFBbEIsQ0FEWCxDQUFBO2VBRUEsU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFmLENBQXlCLENBQUMsT0FBRCxDQUF6QixDQUFnQyxRQUFoQyxFQUhGO09BQUEsTUFBQTtlQUtFLElBQUMsQ0FBQSxNQUFELENBQVEsU0FBUixFQUxGO09BRk87SUFBQSxDQTFFVCxDQUFBOztBQUFBLDZCQW1GQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxLQUFBO0FBQUEsTUFBQSxhQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixLQUF1QixRQUF2QixJQUFBLEtBQUEsS0FBaUMsUUFBcEM7QUFDRSxRQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUFBLENBQUEsQ0FERjtPQUFBO2FBRUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUhNO0lBQUEsQ0FuRlIsQ0FBQTs7QUFBQSw2QkF3RkEsMkJBQUEsR0FBNkIsU0FBQyxTQUFELEdBQUE7QUFDM0IsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQTBCLENBQUMsT0FBM0IsQ0FBQSxDQUFQO0FBQ0UsUUFBQSxJQUFHLFFBQVEsQ0FBQyxHQUFULENBQWEsMkNBQWIsQ0FBSDtBQUNFLGdCQUFVLElBQUEsS0FBQSxDQUFPLHlDQUFBLEdBQXdDLENBQUMsU0FBUyxDQUFDLFFBQVYsQ0FBQSxDQUFELENBQS9DLENBQVYsQ0FERjtTQUFBLE1BQUE7aUJBR0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUEsRUFIRjtTQURGO09BRDJCO0lBQUEsQ0F4RjdCLENBQUE7O0FBQUEsNkJBK0ZBLGlDQUFBLEdBQW1DLFNBQUEsR0FBQTtBQUNqQyxVQUFBLGlDQUFBO0FBQUE7QUFBQTtXQUFBLDRDQUFBOzJCQUFBO1lBQXdDLE1BQU0sQ0FBQyxhQUFQLENBQUE7QUFFdEMsd0JBQUEsY0FBQSxDQUFlLE1BQWYsRUFBdUI7QUFBQSxZQUFDLGtCQUFBLEVBQW9CLElBQXJCO1dBQXZCLEVBQUE7U0FGRjtBQUFBO3NCQURpQztJQUFBLENBL0ZuQyxDQUFBOztBQUFBLDZCQW9HQSxNQUFBLEdBQVEsU0FBQyxTQUFELEdBQUE7O1FBQUMsWUFBVTtPQUNqQjtBQUFBLE1BQUEsd0JBQXNCLFNBQVMsQ0FBRSxZQUFYLENBQUEsVUFBdEI7QUFBQSxRQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsU0FBUixDQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsQ0FBdUIsc0JBQXZCLENBREEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLDJCQUFELENBQTZCLFNBQTdCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGlDQUFELENBQUEsQ0FEQSxDQURGO09BRkE7QUFBQSxNQU1BLElBQUMsQ0FBQSxRQUFRLENBQUMsdUJBQVYsQ0FBQSxDQU5BLENBQUE7YUFPQSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBQSxFQVJNO0lBQUEsQ0FwR1IsQ0FBQTs7QUFBQSw2QkE4R0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLEtBQVIsRUFETztJQUFBLENBOUdULENBQUE7O0FBQUEsNkJBaUhBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLG1CQUFBO0FBQUE7YUFBQSxDQUFBLENBQU0sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEdBQWdCLENBQXRCLENBQUEsR0FBQTtBQUNFLFFBQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFBLENBQVosQ0FBQTtBQUFBLHNCQUNBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLFNBQVgsQ0FBcUIsU0FBckIsRUFEQSxDQURGO01BQUEsQ0FBQTtzQkFETTtJQUFBLENBakhSLENBQUE7O0FBQUEsNkJBc0hBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxVQUFBLEtBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFBVCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBRGQsQ0FBQTs7YUFFYyxDQUFFLE9BQWhCLENBQUE7T0FGQTthQUdBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxvQkFKWjtJQUFBLENBdEhQLENBQUE7O0FBQUEsNkJBNEhBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLFlBQUE7O2FBQWMsQ0FBRSxPQUFoQixDQUFBO09BQUE7YUFDQSxRQUEyQixFQUEzQixFQUFDLElBQUMsQ0FBQSxjQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsc0JBQUEsYUFBVixFQUFBLE1BRk87SUFBQSxDQTVIVCxDQUFBOztBQUFBLDZCQWdJQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEtBQWlCLEVBRFY7SUFBQSxDQWhJVCxDQUFBOztBQUFBLDZCQW1JQSxNQUFBLEdBQVEsU0FBRSxRQUFGLEdBQUE7QUFBYSxNQUFaLElBQUMsQ0FBQSxXQUFBLFFBQVcsQ0FBYjtJQUFBLENBbklSLENBQUE7O0FBQUEsNkJBcUlBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFDWCxJQUFDLENBQUEsU0FEVTtJQUFBLENBckliLENBQUE7OzBCQUFBOztNQVRGLENBQUE7O0FBQUEsRUFpSkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsY0FqSmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/operation-stack.coffee
