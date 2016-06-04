(function() {
  var ActivateInsertMode, ActivateReplaceMode, AddSelection, AutoIndent, Base, BufferedProcess, CamelCase, Change, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, ChangeToLastCharacterOfLine, CompositeDisposable, DashCase, DecodeUriComponent, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteRight, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, DeleteToLastCharacterOfLine, EncodeUriComponent, Increase, IncrementNumber, Indent, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfSelection, InsertAtEndOfTarget, InsertAtHeadOfTarget, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfSelection, InsertAtStartOfTarget, InsertAtTailOfTarget, InsertBelowWithNewline, InsertByTarget, Join, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, MarkRange, Operator, OperatorError, Outdent, Point, PutAfter, PutAfterAndSelect, PutBefore, PutBeforeAndSelect, Range, Repeat, Replace, ReplaceWithRegister, Reverse, Select, SelectAllInRangeMarker, SelectLatestChange, SelectPreviousSelection, SetCursorsToStartOfMarkedRange, SetCursorsToStartOfTarget, SnakeCase, SplitString, Substitute, SubstituteLine, Surround, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, UpperCase, Yank, YankLine, getNewTextRangeFromCheckpoint, haveSomeSelection, highlightRanges, isEndsWithNewLineForBufferRow, moveCursorLeft, moveCursorRight, settings, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, BufferedProcess = _ref.BufferedProcess;

  _ref1 = require('./utils'), haveSomeSelection = _ref1.haveSomeSelection, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, highlightRanges = _ref1.highlightRanges, getNewTextRangeFromCheckpoint = _ref1.getNewTextRangeFromCheckpoint, isEndsWithNewLineForBufferRow = _ref1.isEndsWithNewLineForBufferRow;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  Base = require('./base');

  OperatorError = (function(_super) {
    __extends(OperatorError, _super);

    OperatorError.extend(false);

    function OperatorError(message) {
      this.message = message;
      this.name = 'Operator Error';
    }

    return OperatorError;

  })(Base);

  Operator = (function(_super) {
    __extends(Operator, _super);

    Operator.extend(false);

    Operator.prototype.recordable = true;

    Operator.prototype.flashTarget = true;

    Operator.prototype.trackChange = false;

    Operator.prototype.requireTarget = true;

    Operator.prototype.finalMode = "normal";

    Operator.prototype.finalSubmode = null;

    Operator.prototype.setMarkForChange = function(_arg) {
      var end, start;
      start = _arg.start, end = _arg.end;
      this.vimState.mark.set('[', start);
      return this.vimState.mark.set(']', end);
    };

    Operator.prototype.needFlash = function() {
      var _ref2;
      if (!this.isMode('visual') && this.flashTarget && settings.get('flashOnOperate')) {
        return _ref2 = this.getName(), __indexOf.call(settings.get('flashOnOperateBlacklist'), _ref2) < 0;
      } else {
        return false;
      }
    };

    Operator.prototype.needTrackChange = function() {
      return this.trackChange;
    };

    Operator.prototype.needStay = function() {
      var param, _base;
      if (this.keepCursorPosition) {
        return true;
      }
      param = this["instanceof"]('TransformString') ? "stayOnTransformString" : "stayOn" + (this.getName());
      if (this.isMode('visual', 'linewise')) {
        return settings.get(param);
      } else {
        return settings.get(param) || (this.stayOnLinewise && (typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0));
      }
    };

    function Operator() {
      Operator.__super__.constructor.apply(this, arguments);
      if (this["instanceof"]("Repeat")) {
        return;
      }
      if (typeof this.initialize === "function") {
        this.initialize();
      }
      if (_.isString(this.target)) {
        this.setTarget(this["new"](this.target));
      }
    }

    Operator.prototype.markSelectedBufferRange = function() {
      return this.editor.markBufferRange(this.editor.getSelectedBufferRange(), {
        invalidate: 'never',
        persistent: false
      });
    };

    Operator.prototype.restorePoint = function(selection) {
      if (this.wasNeedStay) {
        return swrap(selection).setBufferPositionTo('head', {
          fromProperty: true
        });
      } else {
        return swrap(selection).setBufferPositionTo('start', {
          fromProperty: true
        });
      }
    };

    Operator.prototype.observeSelectAction = function() {
      var marker;
      if (!this["instanceof"]('Select')) {
        if (this.wasNeedStay = this.needStay()) {
          if (!this.isMode('visual')) {
            this.onWillSelectTarget((function(_this) {
              return function() {
                return _this.updateSelectionProperties();
              };
            })(this));
          }
        } else {
          this.onDidSelectTarget((function(_this) {
            return function() {
              return _this.updateSelectionProperties();
            };
          })(this));
        }
      }
      if (this.needFlash()) {
        this.onDidSelectTarget((function(_this) {
          return function() {
            return _this.flash(_this.editor.getSelectedBufferRanges());
          };
        })(this));
      }
      if (this.needTrackChange()) {
        marker = null;
        this.onDidSelectTarget((function(_this) {
          return function() {
            return marker = _this.markSelectedBufferRange();
          };
        })(this));
        return this.onDidFinishOperation((function(_this) {
          return function() {
            var range;
            if ((range = marker.getBufferRange())) {
              return _this.setMarkForChange(range);
            }
          };
        })(this));
      }
    };

    Operator.prototype.setTarget = function(target) {
      this.target = target;
      if (!_.isFunction(this.target.select)) {
        this.vimState.emitter.emit('did-fail-to-set-target');
        throw new OperatorError("" + (this.getName()) + " cannot set " + (this.target.getName()) + " as target");
      }
      this.target.setOperator(this);
      this.emitDidSetTarget(this);
      return this;
    };

    Operator.prototype.selectTarget = function() {
      this.observeSelectAction();
      this.emitWillSelectTarget();
      this.target.select();
      this.emitDidSelectTarget();
      return haveSomeSelection(this.editor);
    };

    Operator.prototype.setTextToRegisterForSelection = function(selection) {
      return this.setTextToRegister(selection.getText(), selection);
    };

    Operator.prototype.setTextToRegister = function(text, selection) {
      var _base;
      if ((typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) && !text.endsWith('\n')) {
        text += "\n";
      }
      if (text) {
        return this.vimState.register.set({
          text: text,
          selection: selection
        });
      }
    };

    Operator.prototype.flash = function(ranges) {
      return highlightRanges(this.editor, ranges, {
        "class": 'vim-mode-plus-flash',
        timeout: settings.get('flashOnOperateDuration')
      });
    };

    Operator.prototype.mutateSelections = function(fn) {
      if (this.selectTarget()) {
        return this.editor.transact((function(_this) {
          return function() {
            var selection, _i, _len, _ref2, _results;
            _ref2 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              _results.push(fn(selection));
            }
            return _results;
          };
        })(this));
      }
    };

    Operator.prototype.execute = function() {
      var lastSelection;
      if (this.isMode('visual')) {
        lastSelection = this.isMode('visual', 'blockwise') ? this.vimState.getLastBlockwiseSelection() : this.editor.getLastSelection();
        this.vimState.modeManager.preservePreviousSelection(lastSelection);
      }
      this.mutateSelections((function(_this) {
        return function(selection) {
          return _this.mutateSelection(selection);
        };
      })(this));
      return this.activateMode(this.finalMode, this.finalSubmode);
    };

    return Operator;

  })(Base);

  Select = (function(_super) {
    __extends(Select, _super);

    function Select() {
      return Select.__super__.constructor.apply(this, arguments);
    }

    Select.extend(false);

    Select.prototype.flashTarget = false;

    Select.prototype.recordable = false;

    Select.prototype.execute = function() {
      var submode, _base;
      this.selectTarget();
      if (this.isMode('operator-pending') || this.isMode('visual', 'blockwise')) {
        return;
      }
      if (!this.isMode('visual')) {
        submode = swrap.detectVisualModeSubmode(this.editor);
        return this.activateMode('visual', submode);
      } else {
        if (typeof (_base = this.target).isAllowSubmodeChange === "function" ? _base.isAllowSubmodeChange() : void 0) {
          submode = swrap.detectVisualModeSubmode(this.editor);
          if ((submode != null) && !this.isMode('visual', submode)) {
            return this.activateMode('visual', submode);
          }
        }
      }
    };

    return Select;

  })(Operator);

  SelectLatestChange = (function(_super) {
    __extends(SelectLatestChange, _super);

    function SelectLatestChange() {
      return SelectLatestChange.__super__.constructor.apply(this, arguments);
    }

    SelectLatestChange.extend();

    SelectLatestChange.description = "Select latest yanked or changed range";

    SelectLatestChange.prototype.target = 'ALatestChange';

    return SelectLatestChange;

  })(Select);

  SelectPreviousSelection = (function(_super) {
    __extends(SelectPreviousSelection, _super);

    function SelectPreviousSelection() {
      return SelectPreviousSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPreviousSelection.extend();

    SelectPreviousSelection.prototype.requireTarget = false;

    SelectPreviousSelection.prototype.recordable = false;

    SelectPreviousSelection.description = "Select last selected visual area in current buffer";

    SelectPreviousSelection.prototype.execute = function() {
      var properties, selection, submode, _ref2;
      _ref2 = this.vimState.modeManager.getPreviousSelectionInfo(), properties = _ref2.properties, submode = _ref2.submode;
      if (!((properties != null) && (submode != null))) {
        return;
      }
      selection = this.editor.getLastSelection();
      swrap(selection).selectByProperties(properties);
      this.editor.scrollToScreenRange(selection.getScreenRange(), {
        center: true
      });
      return this.activateMode('visual', submode);
    };

    return SelectPreviousSelection;

  })(Operator);

  Delete = (function(_super) {
    __extends(Delete, _super);

    function Delete() {
      this.mutateSelection = __bind(this.mutateSelection, this);
      return Delete.__super__.constructor.apply(this, arguments);
    }

    Delete.extend();

    Delete.prototype.hover = {
      icon: ':delete:',
      emoji: ':scissors:'
    };

    Delete.prototype.trackChange = true;

    Delete.prototype.flashTarget = false;

    Delete.prototype.mutateSelection = function(selection) {
      var cursor, vimEof, wasLinewise;
      cursor = selection.cursor;
      wasLinewise = swrap(selection).isLinewise();
      this.setTextToRegisterForSelection(selection);
      selection.deleteSelectedText();
      vimEof = this.getVimEofBufferPosition();
      if (cursor.getBufferPosition().isGreaterThan(vimEof)) {
        cursor.setBufferPosition([vimEof.row, 0]);
      }
      if (wasLinewise) {
        return cursor.skipLeadingWhitespace();
      }
    };

    return Delete;

  })(Operator);

  DeleteRight = (function(_super) {
    __extends(DeleteRight, _super);

    function DeleteRight() {
      return DeleteRight.__super__.constructor.apply(this, arguments);
    }

    DeleteRight.extend();

    DeleteRight.prototype.target = 'MoveRight';

    return DeleteRight;

  })(Delete);

  DeleteLeft = (function(_super) {
    __extends(DeleteLeft, _super);

    function DeleteLeft() {
      return DeleteLeft.__super__.constructor.apply(this, arguments);
    }

    DeleteLeft.extend();

    DeleteLeft.prototype.target = 'MoveLeft';

    return DeleteLeft;

  })(Delete);

  DeleteToLastCharacterOfLine = (function(_super) {
    __extends(DeleteToLastCharacterOfLine, _super);

    function DeleteToLastCharacterOfLine() {
      return DeleteToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    DeleteToLastCharacterOfLine.extend();

    DeleteToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    DeleteToLastCharacterOfLine.prototype.initialize = function() {
      if (this.isVisualBlockwise = this.isMode('visual', 'blockwise')) {
        return this.requireTarget = false;
      }
    };

    DeleteToLastCharacterOfLine.prototype.execute = function() {
      var pointByBlockwiseSelection;
      if (this.isVisualBlockwise) {
        pointByBlockwiseSelection = new Map;
        this.getBlockwiseSelections().forEach(function(bs) {
          bs.removeEmptySelections();
          bs.setPositionForSelections('start');
          return pointByBlockwiseSelection.set(bs, bs.getStartSelection().getHeadBufferPosition());
        });
      }
      DeleteToLastCharacterOfLine.__super__.execute.apply(this, arguments);
      if (this.isVisualBlockwise) {
        return pointByBlockwiseSelection.forEach(function(point, bs) {
          return bs.setHeadBufferPosition(point);
        });
      }
    };

    return DeleteToLastCharacterOfLine;

  })(Delete);

  TransformString = (function(_super) {
    __extends(TransformString, _super);

    function TransformString() {
      return TransformString.__super__.constructor.apply(this, arguments);
    }

    TransformString.extend(false);

    TransformString.prototype.trackChange = true;

    TransformString.prototype.stayOnLinewise = true;

    TransformString.prototype.setPoint = true;

    TransformString.prototype.autoIndent = false;

    TransformString.prototype.mutateSelection = function(selection) {
      var text;
      text = this.getNewText(selection.getText(), selection);
      selection.insertText(text, {
        autoIndent: this.autoIndent
      });
      if (this.setPoint) {
        return this.restorePoint(selection);
      }
    };

    return TransformString;

  })(Operator);

  ToggleCase = (function(_super) {
    __extends(ToggleCase, _super);

    function ToggleCase() {
      return ToggleCase.__super__.constructor.apply(this, arguments);
    }

    ToggleCase.extend();

    ToggleCase.prototype.displayName = 'Toggle ~';

    ToggleCase.prototype.hover = {
      icon: ':toggle-case:',
      emoji: ':clap:'
    };

    ToggleCase.prototype.toggleCase = function(char) {
      var charLower;
      charLower = char.toLowerCase();
      if (charLower === char) {
        return char.toUpperCase();
      } else {
        return charLower;
      }
    };

    ToggleCase.prototype.getNewText = function(text) {
      return text.split('').map(this.toggleCase).join('');
    };

    return ToggleCase;

  })(TransformString);

  ToggleCaseAndMoveRight = (function(_super) {
    __extends(ToggleCaseAndMoveRight, _super);

    function ToggleCaseAndMoveRight() {
      return ToggleCaseAndMoveRight.__super__.constructor.apply(this, arguments);
    }

    ToggleCaseAndMoveRight.extend();

    ToggleCaseAndMoveRight.prototype.hover = null;

    ToggleCaseAndMoveRight.prototype.setPoint = false;

    ToggleCaseAndMoveRight.prototype.target = 'MoveRight';

    return ToggleCaseAndMoveRight;

  })(ToggleCase);

  UpperCase = (function(_super) {
    __extends(UpperCase, _super);

    function UpperCase() {
      return UpperCase.__super__.constructor.apply(this, arguments);
    }

    UpperCase.extend();

    UpperCase.prototype.displayName = 'Upper';

    UpperCase.prototype.hover = {
      icon: ':upper-case:',
      emoji: ':point_up:'
    };

    UpperCase.prototype.getNewText = function(text) {
      return text.toUpperCase();
    };

    return UpperCase;

  })(TransformString);

  LowerCase = (function(_super) {
    __extends(LowerCase, _super);

    function LowerCase() {
      return LowerCase.__super__.constructor.apply(this, arguments);
    }

    LowerCase.extend();

    LowerCase.prototype.displayName = 'Lower';

    LowerCase.prototype.hover = {
      icon: ':lower-case:',
      emoji: ':point_down:'
    };

    LowerCase.prototype.getNewText = function(text) {
      return text.toLowerCase();
    };

    return LowerCase;

  })(TransformString);

  CamelCase = (function(_super) {
    __extends(CamelCase, _super);

    function CamelCase() {
      return CamelCase.__super__.constructor.apply(this, arguments);
    }

    CamelCase.extend();

    CamelCase.prototype.displayName = 'Camelize';

    CamelCase.prototype.hover = {
      icon: ':camel-case:',
      emoji: ':camel:'
    };

    CamelCase.prototype.getNewText = function(text) {
      return _.camelize(text);
    };

    return CamelCase;

  })(TransformString);

  SnakeCase = (function(_super) {
    __extends(SnakeCase, _super);

    function SnakeCase() {
      return SnakeCase.__super__.constructor.apply(this, arguments);
    }

    SnakeCase.extend();

    SnakeCase.description = "CamelCase -> camel_case";

    SnakeCase.prototype.displayName = 'Underscore _';

    SnakeCase.prototype.hover = {
      icon: ':snake-case:',
      emoji: ':snake:'
    };

    SnakeCase.prototype.getNewText = function(text) {
      return _.underscore(text);
    };

    return SnakeCase;

  })(TransformString);

  DashCase = (function(_super) {
    __extends(DashCase, _super);

    function DashCase() {
      return DashCase.__super__.constructor.apply(this, arguments);
    }

    DashCase.extend();

    DashCase.prototype.displayName = 'Dasherize -';

    DashCase.prototype.hover = {
      icon: ':dash-case:',
      emoji: ':dash:'
    };

    DashCase.prototype.getNewText = function(text) {
      return _.dasherize(text);
    };

    return DashCase;

  })(TransformString);

  TitleCase = (function(_super) {
    __extends(TitleCase, _super);

    function TitleCase() {
      return TitleCase.__super__.constructor.apply(this, arguments);
    }

    TitleCase.extend();

    TitleCase.description = "CamelCase -> Camel Case";

    TitleCase.prototype.displayName = 'Titlize';

    TitleCase.prototype.getNewText = function(text) {
      return _.humanizeEventName(_.dasherize(text));
    };

    return TitleCase;

  })(TransformString);

  EncodeUriComponent = (function(_super) {
    __extends(EncodeUriComponent, _super);

    function EncodeUriComponent() {
      return EncodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    EncodeUriComponent.extend();

    EncodeUriComponent.description = "URI encode string";

    EncodeUriComponent.prototype.displayName = 'Encode URI Component %';

    EncodeUriComponent.prototype.hover = {
      icon: 'encodeURI',
      emoji: 'encodeURI'
    };

    EncodeUriComponent.prototype.getNewText = function(text) {
      return encodeURIComponent(text);
    };

    return EncodeUriComponent;

  })(TransformString);

  DecodeUriComponent = (function(_super) {
    __extends(DecodeUriComponent, _super);

    function DecodeUriComponent() {
      return DecodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    DecodeUriComponent.extend();

    DecodeUriComponent.description = "Decode URL encoded string";

    DecodeUriComponent.prototype.displayName = 'Decode URI Component %%';

    DecodeUriComponent.prototype.hover = {
      icon: 'decodeURI',
      emoji: 'decodeURI'
    };

    DecodeUriComponent.prototype.getNewText = function(text) {
      return decodeURIComponent(text);
    };

    return DecodeUriComponent;

  })(TransformString);

  TransformStringByExternalCommand = (function(_super) {
    __extends(TransformStringByExternalCommand, _super);

    function TransformStringByExternalCommand() {
      return TransformStringByExternalCommand.__super__.constructor.apply(this, arguments);
    }

    TransformStringByExternalCommand.extend(false);

    TransformStringByExternalCommand.prototype.autoIndent = true;

    TransformStringByExternalCommand.prototype.command = '';

    TransformStringByExternalCommand.prototype.args = [];

    TransformStringByExternalCommand.prototype.stdoutBySelection = null;

    TransformStringByExternalCommand.prototype.execute = function() {
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.collect(resolve);
        };
      })(this)).then((function(_this) {
        return function() {
          return TransformStringByExternalCommand.__super__.execute.apply(_this, arguments);
        };
      })(this));
    };

    TransformStringByExternalCommand.prototype.collect = function(resolve) {
      var args, command, finished, restorePoint, running, selection, _i, _len, _ref2, _ref3, _ref4, _results;
      this.stdoutBySelection = new Map;
      restorePoint = null;
      if (!this.isMode('visual')) {
        this.updateSelectionProperties();
        this.target.select();
      }
      running = finished = 0;
      _ref2 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        running++;
        _ref4 = (_ref3 = this.getCommand(selection)) != null ? _ref3 : {}, command = _ref4.command, args = _ref4.args;
        if ((command != null) && (args != null)) {
          _results.push((function(_this) {
            return function(selection) {
              var exit, stdin, stdout;
              stdin = _this.getStdin(selection);
              stdout = function(output) {
                return _this.stdoutBySelection.set(selection, output);
              };
              exit = function(code) {
                finished++;
                if (running === finished) {
                  return resolve();
                }
              };
              _this.runExternalCommand({
                command: command,
                args: args,
                stdout: stdout,
                exit: exit,
                stdin: stdin
              });
              if (!_this.isMode('visual')) {
                return _this.restorePoint(selection);
              }
            };
          })(this)(selection));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    TransformStringByExternalCommand.prototype.runExternalCommand = function(options) {
      var bufferedProcess, stdin;
      stdin = options.stdin;
      delete options.stdin;
      bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError((function(_this) {
        return function(_arg) {
          var commandName, error, handle;
          error = _arg.error, handle = _arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            commandName = _this.constructor.getCommandName();
            console.log("" + commandName + ": Failed to spawn command " + error.path + ".");
          }
          _this.cancelOperation();
          return handle();
        };
      })(this));
      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        return bufferedProcess.process.stdin.end();
      }
    };

    TransformStringByExternalCommand.prototype.getNewText = function(text, selection) {
      var _ref2;
      return (_ref2 = this.getStdout(selection)) != null ? _ref2 : text;
    };

    TransformStringByExternalCommand.prototype.getCommand = function(selection) {
      return {
        command: this.command,
        args: this.args
      };
    };

    TransformStringByExternalCommand.prototype.getStdin = function(selection) {
      return selection.getText();
    };

    TransformStringByExternalCommand.prototype.getStdout = function(selection) {
      return this.stdoutBySelection.get(selection);
    };

    return TransformStringByExternalCommand;

  })(TransformString);

  TransformStringBySelectList = (function(_super) {
    __extends(TransformStringBySelectList, _super);

    function TransformStringBySelectList() {
      return TransformStringBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformStringBySelectList.extend();

    TransformStringBySelectList.description = "Transform string by specified oprator selected from select-list";

    TransformStringBySelectList.prototype.requireInput = true;

    TransformStringBySelectList.prototype.transformers = ['CamelCase', 'DashCase', 'SnakeCase', 'TitleCase', 'EncodeUriComponent', 'DecodeUriComponent', 'Reverse', 'Surround', 'MapSurround', 'IncrementNumber', 'DecrementNumber', 'JoinByInput', 'JoinWithKeepingSpace', 'SplitString', 'LowerCase', 'UpperCase', 'ToggleCase'];

    TransformStringBySelectList.prototype.getItems = function() {
      return this.transformers.map(function(klass) {
        var displayName;
        if (_.isString(klass)) {
          klass = Base.getClass(klass);
        }
        if (klass.prototype.hasOwnProperty('displayName')) {
          displayName = klass.prototype.displayName;
        }
        if (displayName == null) {
          displayName = _.humanizeEventName(_.dasherize(klass.name));
        }
        return {
          name: klass,
          displayName: displayName
        };
      });
    };

    TransformStringBySelectList.prototype.initialize = function() {
      this.onDidSetTarget((function(_this) {
        return function() {
          return _this.focusSelectList({
            items: _this.getItems()
          });
        };
      })(this));
      return this.vimState.onDidConfirmSelectList((function(_this) {
        return function(transformer) {
          _this.vimState.reset();
          return _this.vimState.operationStack.run(transformer.name, {
            target: _this.target.constructor.name
          });
        };
      })(this));
    };

    TransformStringBySelectList.prototype.execute = function() {
      throw new Error("" + (this.getName()) + " should not be executed");
    };

    return TransformStringBySelectList;

  })(Operator);

  TransformWordBySelectList = (function(_super) {
    __extends(TransformWordBySelectList, _super);

    function TransformWordBySelectList() {
      return TransformWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformWordBySelectList.extend();

    TransformWordBySelectList.prototype.target = "InnerWord";

    return TransformWordBySelectList;

  })(TransformStringBySelectList);

  TransformSmartWordBySelectList = (function(_super) {
    __extends(TransformSmartWordBySelectList, _super);

    function TransformSmartWordBySelectList() {
      return TransformSmartWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformSmartWordBySelectList.extend();

    TransformSmartWordBySelectList.description = "Transform InnerSmartWord by `transform-string-by-select-list`";

    TransformSmartWordBySelectList.prototype.target = "InnerSmartWord";

    return TransformSmartWordBySelectList;

  })(TransformStringBySelectList);

  ReplaceWithRegister = (function(_super) {
    __extends(ReplaceWithRegister, _super);

    function ReplaceWithRegister() {
      return ReplaceWithRegister.__super__.constructor.apply(this, arguments);
    }

    ReplaceWithRegister.extend();

    ReplaceWithRegister.description = "Replace target with specified register value";

    ReplaceWithRegister.prototype.hover = {
      icon: ':replace-with-register:',
      emoji: ':pencil:'
    };

    ReplaceWithRegister.prototype.getNewText = function(text) {
      return this.vimState.register.getText();
    };

    return ReplaceWithRegister;

  })(TransformString);

  SwapWithRegister = (function(_super) {
    __extends(SwapWithRegister, _super);

    function SwapWithRegister() {
      return SwapWithRegister.__super__.constructor.apply(this, arguments);
    }

    SwapWithRegister.extend();

    SwapWithRegister.description = "Swap register value with target";

    SwapWithRegister.prototype.getNewText = function(text, selection) {
      var newText;
      newText = this.vimState.register.getText();
      this.setTextToRegister(text, selection);
      return newText;
    };

    return SwapWithRegister;

  })(TransformString);

  Indent = (function(_super) {
    __extends(Indent, _super);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    Indent.extend();

    Indent.prototype.hover = {
      icon: ':indent:',
      emoji: ':point_right:'
    };

    Indent.prototype.stayOnLinewise = false;

    Indent.prototype.indentFunction = "indentSelectedRows";

    Indent.prototype.mutateSelection = function(selection) {
      selection[this.indentFunction]();
      this.restorePoint(selection);
      if (!this.needStay()) {
        return selection.cursor.moveToFirstCharacterOfLine();
      }
    };

    return Indent;

  })(TransformString);

  Outdent = (function(_super) {
    __extends(Outdent, _super);

    function Outdent() {
      return Outdent.__super__.constructor.apply(this, arguments);
    }

    Outdent.extend();

    Outdent.prototype.hover = {
      icon: ':outdent:',
      emoji: ':point_left:'
    };

    Outdent.prototype.indentFunction = "outdentSelectedRows";

    return Outdent;

  })(Indent);

  AutoIndent = (function(_super) {
    __extends(AutoIndent, _super);

    function AutoIndent() {
      return AutoIndent.__super__.constructor.apply(this, arguments);
    }

    AutoIndent.extend();

    AutoIndent.prototype.hover = {
      icon: ':auto-indent:',
      emoji: ':open_hands:'
    };

    AutoIndent.prototype.indentFunction = "autoIndentSelectedRows";

    return AutoIndent;

  })(Indent);

  ToggleLineComments = (function(_super) {
    __extends(ToggleLineComments, _super);

    function ToggleLineComments() {
      return ToggleLineComments.__super__.constructor.apply(this, arguments);
    }

    ToggleLineComments.extend();

    ToggleLineComments.prototype.hover = {
      icon: ':toggle-line-comments:',
      emoji: ':mute:'
    };

    ToggleLineComments.prototype.mutateSelection = function(selection) {
      selection.toggleLineComments();
      return this.restorePoint(selection);
    };

    return ToggleLineComments;

  })(TransformString);

  Surround = (function(_super) {
    __extends(Surround, _super);

    function Surround() {
      return Surround.__super__.constructor.apply(this, arguments);
    }

    Surround.extend();

    Surround.description = "Surround target by specified character like `(`, `[`, `\"`";

    Surround.prototype.displayName = "Surround ()";

    Surround.prototype.pairs = [['[', ']'], ['(', ')'], ['{', '}'], ['<', '>']];

    Surround.prototype.input = null;

    Surround.prototype.charsMax = 1;

    Surround.prototype.hover = {
      icon: ':surround:',
      emoji: ':two_women_holding_hands:'
    };

    Surround.prototype.requireInput = true;

    Surround.prototype.autoIndent = false;

    Surround.prototype.initialize = function() {
      if (!this.requireInput) {
        return;
      }
      this.onDidConfirmInput((function(_this) {
        return function(input) {
          return _this.onConfirm(input);
        };
      })(this));
      this.onDidChangeInput((function(_this) {
        return function(input) {
          return _this.addHover(input);
        };
      })(this));
      this.onDidCancelInput((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (this.requireTarget) {
        return this.onDidSetTarget((function(_this) {
          return function() {
            return _this.vimState.input.focus({
              charsMax: _this.charsMax
            });
          };
        })(this));
      } else {
        return this.vimState.input.focus({
          charsMax: this.charsMax
        });
      }
    };

    Surround.prototype.onConfirm = function(input) {
      this.input = input;
      return this.processOperation();
    };

    Surround.prototype.getPair = function(input) {
      var pair;
      pair = _.detect(this.pairs, function(pair) {
        return __indexOf.call(pair, input) >= 0;
      });
      return pair != null ? pair : pair = [input, input];
    };

    Surround.prototype.surround = function(text, pair) {
      var SpaceSurroundedRegExp, close, isSurroundedBySpace, open, _ref2;
      open = pair[0], close = pair[1];
      if (LineEndingRegExp.test(text)) {
        this.autoIndent = true;
        open += "\n";
        close += "\n";
      }
      SpaceSurroundedRegExp = /^\s([\s|\S]+)\s$/;
      isSurroundedBySpace = function(text) {
        return SpaceSurroundedRegExp.test(text);
      };
      if ((_ref2 = this.input, __indexOf.call(settings.get('charactersToAddSpaceOnSurround'), _ref2) >= 0) && !isSurroundedBySpace(text)) {
        return open + ' ' + text + ' ' + close;
      } else {
        return open + text + close;
      }
    };

    Surround.prototype.getNewText = function(text) {
      return this.surround(text, this.getPair(this.input));
    };

    return Surround;

  })(TransformString);

  SurroundWord = (function(_super) {
    __extends(SurroundWord, _super);

    function SurroundWord() {
      return SurroundWord.__super__.constructor.apply(this, arguments);
    }

    SurroundWord.extend();

    SurroundWord.description = "Surround **word**";

    SurroundWord.prototype.target = 'InnerWord';

    return SurroundWord;

  })(Surround);

  SurroundSmartWord = (function(_super) {
    __extends(SurroundSmartWord, _super);

    function SurroundSmartWord() {
      return SurroundSmartWord.__super__.constructor.apply(this, arguments);
    }

    SurroundSmartWord.extend();

    SurroundSmartWord.description = "Surround **smart-word**";

    SurroundSmartWord.prototype.target = 'InnerSmartWord';

    return SurroundSmartWord;

  })(Surround);

  MapSurround = (function(_super) {
    __extends(MapSurround, _super);

    function MapSurround() {
      return MapSurround.__super__.constructor.apply(this, arguments);
    }

    MapSurround.extend();

    MapSurround.description = "Surround each word(`/\w+/`) within target";

    MapSurround.prototype.mapRegExp = /\w+/g;

    MapSurround.prototype.mutateSelection = function(selection) {
      var scanRange;
      scanRange = selection.getBufferRange();
      this.editor.scanInBufferRange(this.mapRegExp, scanRange, (function(_this) {
        return function(_arg) {
          var matchText, replace;
          matchText = _arg.matchText, replace = _arg.replace;
          return replace(_this.getNewText(matchText));
        };
      })(this));
      if (this.setPoint) {
        return this.restorePoint(selection);
      }
    };

    return MapSurround;

  })(Surround);

  DeleteSurround = (function(_super) {
    __extends(DeleteSurround, _super);

    function DeleteSurround() {
      return DeleteSurround.__super__.constructor.apply(this, arguments);
    }

    DeleteSurround.extend();

    DeleteSurround.description = "Delete specified surround character like `(`, `[`, `\"`";

    DeleteSurround.prototype.pairChars = ['[]', '()', '{}'].join('');

    DeleteSurround.prototype.requireTarget = false;

    DeleteSurround.prototype.onConfirm = function(input) {
      var _ref2;
      this.input = input;
      this.setTarget(this["new"]('Pair', {
        pair: this.getPair(this.input),
        inner: false,
        allowNextLine: (_ref2 = this.input, __indexOf.call(this.pairChars, _ref2) >= 0)
      }));
      return this.processOperation();
    };

    DeleteSurround.prototype.getNewText = function(text) {
      var isSingleLine;
      isSingleLine = function(text) {
        return text.split(/\n|\r\n/).length === 1;
      };
      text = text.slice(1, -1);
      if (isSingleLine(text)) {
        return text.trim();
      } else {
        return text;
      }
    };

    return DeleteSurround;

  })(Surround);

  DeleteSurroundAnyPair = (function(_super) {
    __extends(DeleteSurroundAnyPair, _super);

    function DeleteSurroundAnyPair() {
      return DeleteSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPair.extend();

    DeleteSurroundAnyPair.description = "Delete surround character by auto-detect paired char from cursor enclosed pair";

    DeleteSurroundAnyPair.prototype.requireInput = false;

    DeleteSurroundAnyPair.prototype.target = 'AAnyPair';

    return DeleteSurroundAnyPair;

  })(DeleteSurround);

  DeleteSurroundAnyPairAllowForwarding = (function(_super) {
    __extends(DeleteSurroundAnyPairAllowForwarding, _super);

    function DeleteSurroundAnyPairAllowForwarding() {
      return DeleteSurroundAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPairAllowForwarding.extend();

    DeleteSurroundAnyPairAllowForwarding.description = "Delete surround character by auto-detect paired char from cursor enclosed pair and forwarding pair within same line";

    DeleteSurroundAnyPairAllowForwarding.prototype.target = 'AAnyPairAllowForwarding';

    return DeleteSurroundAnyPairAllowForwarding;

  })(DeleteSurroundAnyPair);

  ChangeSurround = (function(_super) {
    __extends(ChangeSurround, _super);

    function ChangeSurround() {
      return ChangeSurround.__super__.constructor.apply(this, arguments);
    }

    ChangeSurround.extend();

    ChangeSurround.description = "Change surround character, specify both from and to pair char";

    ChangeSurround.prototype.charsMax = 2;

    ChangeSurround.prototype.char = null;

    ChangeSurround.prototype.onConfirm = function(input) {
      var from, _ref2;
      if (!input) {
        return;
      }
      _ref2 = input.split(''), from = _ref2[0], this.char = _ref2[1];
      return ChangeSurround.__super__.onConfirm.call(this, from);
    };

    ChangeSurround.prototype.getNewText = function(text) {
      var close, open, _ref2;
      _ref2 = this.getPair(this.char), open = _ref2[0], close = _ref2[1];
      return open + text.slice(1, -1) + close;
    };

    return ChangeSurround;

  })(DeleteSurround);

  ChangeSurroundAnyPair = (function(_super) {
    __extends(ChangeSurroundAnyPair, _super);

    function ChangeSurroundAnyPair() {
      return ChangeSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPair.extend();

    ChangeSurroundAnyPair.description = "Change surround character, from char is auto-detected";

    ChangeSurroundAnyPair.prototype.charsMax = 1;

    ChangeSurroundAnyPair.prototype.target = "AAnyPair";

    ChangeSurroundAnyPair.prototype.initialize = function() {
      this.onDidSetTarget((function(_this) {
        return function() {
          _this.updateSelectionProperties();
          _this.target.select();
          if (!haveSomeSelection(_this.editor)) {
            _this.vimState.input.cancel();
            _this.abort();
          }
          return _this.addHover(_this.editor.getSelectedText()[0]);
        };
      })(this));
      return ChangeSurroundAnyPair.__super__.initialize.apply(this, arguments);
    };

    ChangeSurroundAnyPair.prototype.onConfirm = function(char) {
      var selection, _i, _len, _ref2;
      this.char = char;
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        this.restorePoint(selection);
      }
      this.input = this.char;
      return this.processOperation();
    };

    return ChangeSurroundAnyPair;

  })(ChangeSurround);

  ChangeSurroundAnyPairAllowForwarding = (function(_super) {
    __extends(ChangeSurroundAnyPairAllowForwarding, _super);

    function ChangeSurroundAnyPairAllowForwarding() {
      return ChangeSurroundAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPairAllowForwarding.extend();

    ChangeSurroundAnyPairAllowForwarding.description = "Change surround character, from char is auto-detected from enclosed and forwarding area";

    ChangeSurroundAnyPairAllowForwarding.prototype.target = "AAnyPairAllowForwarding";

    return ChangeSurroundAnyPairAllowForwarding;

  })(ChangeSurroundAnyPair);

  Yank = (function(_super) {
    __extends(Yank, _super);

    function Yank() {
      return Yank.__super__.constructor.apply(this, arguments);
    }

    Yank.extend();

    Yank.prototype.hover = {
      icon: ':yank:',
      emoji: ':clipboard:'
    };

    Yank.prototype.trackChange = true;

    Yank.prototype.stayOnLinewise = true;

    Yank.prototype.mutateSelection = function(selection) {
      this.setTextToRegisterForSelection(selection);
      return this.restorePoint(selection);
    };

    return Yank;

  })(Operator);

  YankLine = (function(_super) {
    __extends(YankLine, _super);

    function YankLine() {
      return YankLine.__super__.constructor.apply(this, arguments);
    }

    YankLine.extend();

    YankLine.prototype.target = 'MoveToRelativeLine';

    return YankLine;

  })(Yank);

  Join = (function(_super) {
    __extends(Join, _super);

    function Join() {
      return Join.__super__.constructor.apply(this, arguments);
    }

    Join.extend();

    Join.prototype.target = "MoveToRelativeLine";

    Join.prototype.flashTarget = false;

    Join.prototype.needStay = function() {
      return false;
    };

    Join.prototype.mutateSelection = function(selection) {
      var end, range;
      if (swrap(selection).isLinewise()) {
        range = selection.getBufferRange();
        selection.setBufferRange(range.translate([0, 0], [-1, Infinity]));
      }
      selection.joinLines();
      end = selection.getBufferRange().end;
      return selection.cursor.setBufferPosition(end.translate([0, -1]));
    };

    return Join;

  })(TransformString);

  JoinWithKeepingSpace = (function(_super) {
    __extends(JoinWithKeepingSpace, _super);

    function JoinWithKeepingSpace() {
      return JoinWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinWithKeepingSpace.extend();

    JoinWithKeepingSpace.prototype.input = '';

    JoinWithKeepingSpace.prototype.requireTarget = false;

    JoinWithKeepingSpace.prototype.trim = false;

    JoinWithKeepingSpace.prototype.initialize = function() {
      return this.setTarget(this["new"]("MoveToRelativeLineWithMinimum", {
        min: 1
      }));
    };

    JoinWithKeepingSpace.prototype.mutateSelection = function(selection) {
      var endRow, row, rows, startRow, text, _ref2;
      _ref2 = selection.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      swrap(selection).expandOverLine();
      rows = (function() {
        var _i, _results;
        _results = [];
        for (row = _i = startRow; startRow <= endRow ? _i <= endRow : _i >= endRow; row = startRow <= endRow ? ++_i : --_i) {
          text = this.editor.lineTextForBufferRow(row);
          if (this.trim && row !== startRow) {
            _results.push(text.trimLeft());
          } else {
            _results.push(text);
          }
        }
        return _results;
      }).call(this);
      return selection.insertText(this.join(rows) + "\n");
    };

    JoinWithKeepingSpace.prototype.join = function(rows) {
      return rows.join(this.input);
    };

    return JoinWithKeepingSpace;

  })(TransformString);

  JoinByInput = (function(_super) {
    __extends(JoinByInput, _super);

    function JoinByInput() {
      return JoinByInput.__super__.constructor.apply(this, arguments);
    }

    JoinByInput.extend();

    JoinByInput.description = "Transform multi-line to single-line by with specified separator character";

    JoinByInput.prototype.hover = {
      icon: ':join:',
      emoji: ':couple:'
    };

    JoinByInput.prototype.requireInput = true;

    JoinByInput.prototype.input = null;

    JoinByInput.prototype.trim = true;

    JoinByInput.prototype.initialize = function() {
      JoinByInput.__super__.initialize.apply(this, arguments);
      return this.focusInput({
        charsMax: 10
      });
    };

    JoinByInput.prototype.join = function(rows) {
      return rows.join(" " + this.input + " ");
    };

    return JoinByInput;

  })(JoinWithKeepingSpace);

  JoinByInputWithKeepingSpace = (function(_super) {
    __extends(JoinByInputWithKeepingSpace, _super);

    function JoinByInputWithKeepingSpace() {
      return JoinByInputWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinByInputWithKeepingSpace.description = "Join lines without padding space between each line";

    JoinByInputWithKeepingSpace.extend();

    JoinByInputWithKeepingSpace.prototype.trim = false;

    JoinByInputWithKeepingSpace.prototype.join = function(rows) {
      return rows.join(this.input);
    };

    return JoinByInputWithKeepingSpace;

  })(JoinByInput);

  SplitString = (function(_super) {
    __extends(SplitString, _super);

    function SplitString() {
      return SplitString.__super__.constructor.apply(this, arguments);
    }

    SplitString.extend();

    SplitString.description = "Split single-line into multi-line by splitting specified separator chars";

    SplitString.prototype.hover = {
      icon: ':split-string:',
      emoji: ':hocho:'
    };

    SplitString.prototype.requireInput = true;

    SplitString.prototype.input = null;

    SplitString.prototype.initialize = function() {
      if (!this.isMode('visual')) {
        this.setTarget(this["new"]("MoveToRelativeLine", {
          min: 1
        }));
      }
      return this.focusInput({
        charsMax: 10
      });
    };

    SplitString.prototype.getNewText = function(text) {
      var regex;
      if (this.input === '') {
        this.input = "\\n";
      }
      regex = RegExp("" + (_.escapeRegExp(this.input)), "g");
      return text.split(regex).join("\n");
    };

    return SplitString;

  })(TransformString);

  Reverse = (function(_super) {
    __extends(Reverse, _super);

    function Reverse() {
      return Reverse.__super__.constructor.apply(this, arguments);
    }

    Reverse.extend();

    Reverse.description = "Reverse lines(e.g reverse selected three line)";

    Reverse.prototype.mutateSelection = function(selection) {
      var newText, textForRows;
      swrap(selection).expandOverLine();
      textForRows = swrap(selection).lineTextForBufferRows();
      newText = textForRows.reverse().join("\n") + "\n";
      selection.insertText(newText);
      return this.restorePoint(selection);
    };

    return Reverse;

  })(TransformString);

  Repeat = (function(_super) {
    __extends(Repeat, _super);

    function Repeat() {
      return Repeat.__super__.constructor.apply(this, arguments);
    }

    Repeat.extend();

    Repeat.prototype.requireTarget = false;

    Repeat.prototype.recordable = false;

    Repeat.prototype.execute = function() {
      return this.editor.transact((function(_this) {
        return function() {
          return _this.countTimes(function() {
            var operation;
            if (operation = _this.vimState.operationStack.getRecorded()) {
              operation.setRepeated();
              return operation.execute();
            }
          });
        };
      })(this));
    };

    return Repeat;

  })(Operator);

  Increase = (function(_super) {
    __extends(Increase, _super);

    function Increase() {
      return Increase.__super__.constructor.apply(this, arguments);
    }

    Increase.extend();

    Increase.prototype.requireTarget = false;

    Increase.prototype.step = 1;

    Increase.prototype.execute = function() {
      var newRanges, pattern;
      pattern = RegExp("" + (settings.get('numberRegex')), "g");
      newRanges = [];
      this.editor.transact((function(_this) {
        return function() {
          var cursor, ranges, scanRange, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            cursor = _ref2[_i];
            scanRange = _this.isMode('visual') ? cursor.selection.getBufferRange() : cursor.getCurrentLineBufferRange();
            ranges = _this.increaseNumber(cursor, scanRange, pattern);
            if (!_this.isMode('visual') && ranges.length) {
              cursor.setBufferPosition(ranges[0].end.translate([0, -1]));
            }
            _results.push(newRanges.push(ranges));
          }
          return _results;
        };
      })(this));
      if ((newRanges = _.flatten(newRanges)).length) {
        if (this.needFlash()) {
          return this.flash(newRanges);
        }
      } else {
        return atom.beep();
      }
    };

    Increase.prototype.increaseNumber = function(cursor, scanRange, pattern) {
      var newRanges;
      newRanges = [];
      this.editor.scanInBufferRange(pattern, scanRange, (function(_this) {
        return function(_arg) {
          var matchText, newText, range, replace, stop;
          matchText = _arg.matchText, range = _arg.range, stop = _arg.stop, replace = _arg.replace;
          newText = String(parseInt(matchText, 10) + _this.step * _this.getCount());
          if (_this.isMode('visual')) {
            return newRanges.push(replace(newText));
          } else {
            if (!range.end.isGreaterThan(cursor.getBufferPosition())) {
              return;
            }
            newRanges.push(replace(newText));
            return stop();
          }
        };
      })(this));
      return newRanges;
    };

    return Increase;

  })(Operator);

  Decrease = (function(_super) {
    __extends(Decrease, _super);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.extend();

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  IncrementNumber = (function(_super) {
    __extends(IncrementNumber, _super);

    function IncrementNumber() {
      return IncrementNumber.__super__.constructor.apply(this, arguments);
    }

    IncrementNumber.extend();

    IncrementNumber.prototype.displayName = 'Increment ++';

    IncrementNumber.prototype.step = 1;

    IncrementNumber.prototype.baseNumber = null;

    IncrementNumber.prototype.execute = function() {
      var newRanges, pattern, selection, _i, _len, _ref2;
      pattern = RegExp("" + (settings.get('numberRegex')), "g");
      newRanges = null;
      this.selectTarget();
      this.editor.transact((function(_this) {
        return function() {
          var selection;
          return newRanges = (function() {
            var _i, _len, _ref2, _results;
            _ref2 = this.editor.getSelectionsOrderedByBufferPosition();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              _results.push(this.replaceNumber(selection.getBufferRange(), pattern));
            }
            return _results;
          }).call(_this);
        };
      })(this));
      if ((newRanges = _.flatten(newRanges)).length) {
        if (this.needFlash()) {
          this.flash(newRanges);
        }
      } else {
        atom.beep();
      }
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        selection.cursor.setBufferPosition(selection.getBufferRange().start);
      }
      return this.activateMode('normal');
    };

    IncrementNumber.prototype.replaceNumber = function(scanRange, pattern) {
      var newRanges;
      newRanges = [];
      this.editor.scanInBufferRange(pattern, scanRange, (function(_this) {
        return function(_arg) {
          var matchText, replace;
          matchText = _arg.matchText, replace = _arg.replace;
          return newRanges.push(replace(_this.getNewText(matchText)));
        };
      })(this));
      return newRanges;
    };

    IncrementNumber.prototype.getNewText = function(text) {
      this.baseNumber = this.baseNumber != null ? this.baseNumber + this.step * this.getCount() : parseInt(text, 10);
      return String(this.baseNumber);
    };

    return IncrementNumber;

  })(Operator);

  DecrementNumber = (function(_super) {
    __extends(DecrementNumber, _super);

    function DecrementNumber() {
      return DecrementNumber.__super__.constructor.apply(this, arguments);
    }

    DecrementNumber.extend();

    DecrementNumber.prototype.displayName = 'Decrement --';

    DecrementNumber.prototype.step = -1;

    return DecrementNumber;

  })(IncrementNumber);

  PutBefore = (function(_super) {
    __extends(PutBefore, _super);

    function PutBefore() {
      return PutBefore.__super__.constructor.apply(this, arguments);
    }

    PutBefore.extend();

    PutBefore.prototype.requireTarget = false;

    PutBefore.prototype.location = 'before';

    PutBefore.prototype.execute = function() {
      var submode;
      this.editor.transact((function(_this) {
        return function() {
          var cursor, newRange, selection, text, type, _i, _len, _ref2, _ref3, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
            cursor = selection.cursor;
            _ref3 = _this.vimState.register.get(null, selection), text = _ref3.text, type = _ref3.type;
            if (!text) {
              break;
            }
            text = _.multiplyString(text, _this.getCount());
            newRange = _this.paste(selection, text, {
              linewise: (type === 'linewise') || _this.isMode('visual', 'linewise'),
              select: _this.selectPastedText
            });
            _this.setMarkForChange(newRange);
            if (_this.needFlash()) {
              _results.push(_this.flash(newRange));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
      if (this.selectPastedText) {
        submode = swrap.detectVisualModeSubmode(this.editor);
        if (!this.isMode('visual', submode)) {
          return this.activateMode('visual', submode);
        }
      } else {
        return this.activateMode('normal');
      }
    };

    PutBefore.prototype.paste = function(selection, text, _arg) {
      var adjustCursor, cursor, linewise, newRange, select;
      linewise = _arg.linewise, select = _arg.select;
      cursor = selection.cursor;
      if (select == null) {
        select = false;
      }
      if (linewise == null) {
        linewise = false;
      }
      if (linewise) {
        newRange = this.pasteLinewise(selection, text);
        adjustCursor = function(range) {
          cursor.setBufferPosition(range.start);
          return cursor.moveToFirstCharacterOfLine();
        };
      } else {
        newRange = this.pasteCharacterwise(selection, text);
        adjustCursor = function(range) {
          return cursor.setBufferPosition(range.end.translate([0, -1]));
        };
      }
      if (select) {
        selection.setBufferRange(newRange);
      } else {
        adjustCursor(newRange);
      }
      return newRange;
    };

    PutBefore.prototype.pasteLinewise = function(selection, text) {
      var cursor, end, range, row;
      cursor = selection.cursor;
      if (!text.endsWith("\n")) {
        text += "\n";
      }
      if (selection.isEmpty()) {
        row = cursor.getBufferRow();
        switch (this.location) {
          case 'before':
            range = [[row, 0], [row, 0]];
            break;
          case 'after':
            if (!isEndsWithNewLineForBufferRow(this.editor, row)) {
              text = text.replace(LineEndingRegExp, '');
            }
            cursor.moveToEndOfLine();
            end = selection.insertText("\n").end;
            range = this.editor.bufferRangeForBufferRow(end.row, {
              includeNewline: true
            });
        }
        return this.editor.setTextInBufferRange(range, text);
      } else {
        if (this.isMode('visual', 'linewise')) {
          if (selection.getBufferRange().end.column !== 0) {
            text = text.replace(LineEndingRegExp, '');
          }
        } else {
          selection.insertText("\n");
        }
        return selection.insertText(text);
      }
    };

    PutBefore.prototype.pasteCharacterwise = function(selection, text) {
      if (this.location === 'after' && selection.isEmpty()) {
        selection.cursor.moveRight();
      }
      return selection.insertText(text);
    };

    return PutBefore;

  })(Operator);

  PutAfter = (function(_super) {
    __extends(PutAfter, _super);

    function PutAfter() {
      return PutAfter.__super__.constructor.apply(this, arguments);
    }

    PutAfter.extend();

    PutAfter.prototype.location = 'after';

    return PutAfter;

  })(PutBefore);

  PutBeforeAndSelect = (function(_super) {
    __extends(PutBeforeAndSelect, _super);

    function PutBeforeAndSelect() {
      return PutBeforeAndSelect.__super__.constructor.apply(this, arguments);
    }

    PutBeforeAndSelect.extend();

    PutBeforeAndSelect.description = "Paste before then select";

    PutBeforeAndSelect.prototype.selectPastedText = true;

    return PutBeforeAndSelect;

  })(PutBefore);

  PutAfterAndSelect = (function(_super) {
    __extends(PutAfterAndSelect, _super);

    function PutAfterAndSelect() {
      return PutAfterAndSelect.__super__.constructor.apply(this, arguments);
    }

    PutAfterAndSelect.extend();

    PutAfterAndSelect.description = "Paste after then select";

    PutAfterAndSelect.prototype.selectPastedText = true;

    return PutAfterAndSelect;

  })(PutAfter);

  Replace = (function(_super) {
    __extends(Replace, _super);

    function Replace() {
      return Replace.__super__.constructor.apply(this, arguments);
    }

    Replace.extend();

    Replace.prototype.input = null;

    Replace.prototype.hover = {
      icon: ':replace:',
      emoji: ':tractor:'
    };

    Replace.prototype.flashTarget = false;

    Replace.prototype.trackChange = true;

    Replace.prototype.requireInput = true;

    Replace.prototype.initialize = function() {
      if (this.isMode('normal')) {
        this.setTarget(this["new"]('MoveRight'));
      }
      return this.focusInput();
    };

    Replace.prototype.getInput = function() {
      var input;
      input = Replace.__super__.getInput.apply(this, arguments);
      if (input === '') {
        input = "\n";
      }
      return input;
    };

    Replace.prototype.execute = function() {
      var input, selection, top, _i, _len, _ref2;
      input = this.getInput();
      this.mutateSelections((function(_this) {
        return function(selection) {
          var text;
          text = selection.getText().replace(/./g, input);
          if (!(_this.target["instanceof"]('MoveRight') && (text.length < _this.getCount()))) {
            selection.insertText(text, {
              autoIndentNewline: true
            });
          }
          if (input !== "\n") {
            return _this.restorePoint(selection);
          }
        };
      })(this));
      if (this.isMode('visual', 'blockwise')) {
        top = this.editor.getSelectionsOrderedByBufferPosition()[0];
        _ref2 = this.editor.getSelections();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          selection = _ref2[_i];
          if (selection !== top) {
            selection.destroy();
          }
        }
      }
      return this.activateMode('normal');
    };

    return Replace;

  })(Operator);

  AddSelection = (function(_super) {
    __extends(AddSelection, _super);

    function AddSelection() {
      return AddSelection.__super__.constructor.apply(this, arguments);
    }

    AddSelection.extend();

    AddSelection.prototype.execute = function() {
      var pattern, ranges, scanRange, selection, word, _i, _len, _ref2;
      this.editor.getLastSelection().selectWord();
      word = this.editor.getSelectedText();
      if (word === '') {
        return;
      }
      if (!this.selectTarget()) {
        return;
      }
      ranges = [];
      pattern = RegExp("" + (_.escapeRegExp(word)), "g");
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        scanRange = selection.getBufferRange();
        this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
          var range;
          range = _arg.range;
          return ranges.push(range);
        });
      }
      if (ranges.length) {
        this.editor.setSelectedBufferRanges(ranges);
        if (!this.isMode('visual', 'characterwise')) {
          return this.activateMode('visual', 'characterwise');
        }
      }
    };

    return AddSelection;

  })(Operator);

  SelectAllInRangeMarker = (function(_super) {
    __extends(SelectAllInRangeMarker, _super);

    function SelectAllInRangeMarker() {
      return SelectAllInRangeMarker.__super__.constructor.apply(this, arguments);
    }

    SelectAllInRangeMarker.extend();

    SelectAllInRangeMarker.prototype.target = "MarkedRange";

    SelectAllInRangeMarker.prototype.flashTarget = false;

    return SelectAllInRangeMarker;

  })(AddSelection);

  SetCursorsToStartOfTarget = (function(_super) {
    __extends(SetCursorsToStartOfTarget, _super);

    function SetCursorsToStartOfTarget() {
      return SetCursorsToStartOfTarget.__super__.constructor.apply(this, arguments);
    }

    SetCursorsToStartOfTarget.extend();

    SetCursorsToStartOfTarget.prototype.flashTarget = false;

    SetCursorsToStartOfTarget.prototype.mutateSelection = function(selection) {
      return swrap(selection).setBufferPositionTo('start');
    };

    return SetCursorsToStartOfTarget;

  })(Operator);

  SetCursorsToStartOfMarkedRange = (function(_super) {
    __extends(SetCursorsToStartOfMarkedRange, _super);

    function SetCursorsToStartOfMarkedRange() {
      return SetCursorsToStartOfMarkedRange.__super__.constructor.apply(this, arguments);
    }

    SetCursorsToStartOfMarkedRange.extend();

    SetCursorsToStartOfMarkedRange.prototype.flashTarget = false;

    SetCursorsToStartOfMarkedRange.prototype.target = "MarkedRange";

    return SetCursorsToStartOfMarkedRange;

  })(SetCursorsToStartOfTarget);

  MarkRange = (function(_super) {
    var options;

    __extends(MarkRange, _super);

    function MarkRange() {
      return MarkRange.__super__.constructor.apply(this, arguments);
    }

    MarkRange.extend();

    MarkRange.prototype.keepCursorPosition = true;

    options = {
      "class": 'vim-mode-plus-range-marker'
    };

    MarkRange.prototype.mutateSelection = function(selection) {
      var marker;
      marker = highlightRanges(this.editor, selection.getBufferRange(), options);
      this.vimState.addRangeMarkers(marker);
      return this.restorePoint(selection);
    };

    return MarkRange;

  })(Operator);

  ActivateInsertMode = (function(_super) {
    __extends(ActivateInsertMode, _super);

    function ActivateInsertMode() {
      return ActivateInsertMode.__super__.constructor.apply(this, arguments);
    }

    ActivateInsertMode.extend();

    ActivateInsertMode.prototype.requireTarget = false;

    ActivateInsertMode.prototype.flashTarget = false;

    ActivateInsertMode.prototype.checkpoint = null;

    ActivateInsertMode.prototype.finalSubmode = null;

    ActivateInsertMode.prototype.supportInsertionCount = true;

    ActivateInsertMode.prototype.observeWillDeactivateMode = function() {
      var disposable;
      return disposable = this.vimState.modeManager.preemptWillDeactivateMode((function(_this) {
        return function(_arg) {
          var mode, range, textByUserInput;
          mode = _arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          if ((range = getNewTextRangeFromCheckpoint(_this.editor, _this.getCheckpoint('insert'))) != null) {
            _this.setMarkForChange(range);
            textByUserInput = _this.editor.getTextInBufferRange(range);
          } else {
            textByUserInput = '';
          }
          _this.saveInsertedText(textByUserInput);
          _this.vimState.register.set('.', {
            text: textByUserInput
          });
          _.times(_this.getInsertionCount(), function() {
            var selection, text, _i, _len, _ref2, _results;
            text = _this.textByOperator + textByUserInput;
            _ref2 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              _results.push(selection.insertText(text, {
                autoIndent: true
              }));
            }
            return _results;
          });
          return _this.editor.groupChangesSinceCheckpoint(_this.getCheckpoint('undo'));
        };
      })(this));
    };

    ActivateInsertMode.prototype.initialize = function() {
      this.checkpoint = {};
      if (!this.isRepeated()) {
        this.setCheckpoint('undo');
      }
      return this.observeWillDeactivateMode();
    };

    ActivateInsertMode.prototype.setCheckpoint = function(purpose) {
      return this.checkpoint[purpose] = this.editor.createCheckpoint();
    };

    ActivateInsertMode.prototype.getCheckpoint = function(purpose) {
      return this.checkpoint[purpose];
    };

    ActivateInsertMode.prototype.saveInsertedText = function(insertedText) {
      this.insertedText = insertedText;
      return this.insertedText;
    };

    ActivateInsertMode.prototype.getInsertedText = function() {
      var _ref2;
      return (_ref2 = this.insertedText) != null ? _ref2 : '';
    };

    ActivateInsertMode.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text, {
        autoIndent: true
      });
    };

    ActivateInsertMode.prototype.getInsertionCount = function() {
      if (this.insertionCount == null) {
        this.insertionCount = this.supportInsertionCount ? this.getCount() - 1 : 0;
      }
      return this.insertionCount;
    };

    ActivateInsertMode.prototype.execute = function() {
      var range, text;
      if (this.isRepeated()) {
        if (!(text = this.getInsertedText())) {
          return;
        }
        if (!this["instanceof"]('Change')) {
          this.flashTarget = this.trackChange = true;
          this.observeSelectAction();
          this.emitDidSelectTarget();
        }
        return this.editor.transact((function(_this) {
          return function() {
            var selection, _i, _len, _ref2, _results;
            _ref2 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              _this.repeatInsert(selection, text);
              _results.push(moveCursorLeft(selection.cursor));
            }
            return _results;
          };
        })(this));
      } else {
        if (this.getInsertionCount() > 0) {
          range = getNewTextRangeFromCheckpoint(this.editor, this.getCheckpoint('undo'));
          this.textByOperator = range != null ? this.editor.getTextInBufferRange(range) : '';
        }
        this.setCheckpoint('insert');
        return this.vimState.activate('insert', this.finalSubmode);
      }
    };

    return ActivateInsertMode;

  })(Operator);

  ActivateReplaceMode = (function(_super) {
    __extends(ActivateReplaceMode, _super);

    function ActivateReplaceMode() {
      return ActivateReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ActivateReplaceMode.extend();

    ActivateReplaceMode.prototype.finalSubmode = 'replace';

    ActivateReplaceMode.prototype.repeatInsert = function(selection, text) {
      var char, _i, _len;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        char = text[_i];
        if (!(char !== "\n")) {
          continue;
        }
        if (selection.cursor.isAtEndOfLine()) {
          break;
        }
        selection.selectRight();
      }
      return selection.insertText(text, {
        autoIndent: false
      });
    };

    return ActivateReplaceMode;

  })(ActivateInsertMode);

  InsertAfter = (function(_super) {
    __extends(InsertAfter, _super);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.extend();

    InsertAfter.prototype.execute = function() {
      var cursor, _i, _len, _ref2;
      _ref2 = this.editor.getCursors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        cursor = _ref2[_i];
        moveCursorRight(cursor);
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(ActivateInsertMode);

  InsertAfterEndOfLine = (function(_super) {
    __extends(InsertAfterEndOfLine, _super);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.extend();

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(ActivateInsertMode);

  InsertAtBeginningOfLine = (function(_super) {
    __extends(InsertAtBeginningOfLine, _super);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.extend();

    InsertAtBeginningOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(ActivateInsertMode);

  InsertAtLastInsert = (function(_super) {
    __extends(InsertAtLastInsert, _super);

    function InsertAtLastInsert() {
      return InsertAtLastInsert.__super__.constructor.apply(this, arguments);
    }

    InsertAtLastInsert.extend();

    InsertAtLastInsert.prototype.execute = function() {
      var point;
      if ((point = this.vimState.mark.get('^'))) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({
          center: true
        });
      }
      return InsertAtLastInsert.__super__.execute.apply(this, arguments);
    };

    return InsertAtLastInsert;

  })(ActivateInsertMode);

  InsertAboveWithNewline = (function(_super) {
    __extends(InsertAboveWithNewline, _super);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.extend();

    InsertAboveWithNewline.prototype.execute = function() {
      this.insertNewline();
      return InsertAboveWithNewline.__super__.execute.apply(this, arguments);
    };

    InsertAboveWithNewline.prototype.insertNewline = function() {
      return this.editor.insertNewlineAbove();
    };

    InsertAboveWithNewline.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text.trimLeft(), {
        autoIndent: true
      });
    };

    return InsertAboveWithNewline;

  })(ActivateInsertMode);

  InsertBelowWithNewline = (function(_super) {
    __extends(InsertBelowWithNewline, _super);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.extend();

    InsertBelowWithNewline.prototype.insertNewline = function() {
      return this.editor.insertNewlineBelow();
    };

    return InsertBelowWithNewline;

  })(InsertAboveWithNewline);

  InsertByTarget = (function(_super) {
    __extends(InsertByTarget, _super);

    function InsertByTarget() {
      return InsertByTarget.__super__.constructor.apply(this, arguments);
    }

    InsertByTarget.extend(false);

    InsertByTarget.prototype.requireTarget = true;

    InsertByTarget.prototype.which = null;

    InsertByTarget.prototype.execute = function() {
      var selection, _i, _len, _ref2;
      this.selectTarget();
      if (this.isMode('visual', 'blockwise')) {
        this.getBlockwiseSelections().forEach((function(_this) {
          return function(bs) {
            bs.removeEmptySelections();
            return bs.setPositionForSelections(_this.which);
          };
        })(this));
      } else {
        _ref2 = this.editor.getSelections();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          selection = _ref2[_i];
          swrap(selection).setBufferPositionTo(this.which);
        }
      }
      return InsertByTarget.__super__.execute.apply(this, arguments);
    };

    return InsertByTarget;

  })(ActivateInsertMode);

  InsertAtStartOfTarget = (function(_super) {
    __extends(InsertAtStartOfTarget, _super);

    function InsertAtStartOfTarget() {
      return InsertAtStartOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfTarget.extend();

    InsertAtStartOfTarget.prototype.which = 'start';

    return InsertAtStartOfTarget;

  })(InsertByTarget);

  InsertAtStartOfSelection = (function(_super) {
    __extends(InsertAtStartOfSelection, _super);

    function InsertAtStartOfSelection() {
      return InsertAtStartOfSelection.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfSelection.extend();

    return InsertAtStartOfSelection;

  })(InsertAtStartOfTarget);

  InsertAtEndOfTarget = (function(_super) {
    __extends(InsertAtEndOfTarget, _super);

    function InsertAtEndOfTarget() {
      return InsertAtEndOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfTarget.extend();

    InsertAtEndOfTarget.prototype.which = 'end';

    return InsertAtEndOfTarget;

  })(InsertByTarget);

  InsertAtEndOfSelection = (function(_super) {
    __extends(InsertAtEndOfSelection, _super);

    function InsertAtEndOfSelection() {
      return InsertAtEndOfSelection.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfSelection.extend();

    return InsertAtEndOfSelection;

  })(InsertAtEndOfTarget);

  InsertAtHeadOfTarget = (function(_super) {
    __extends(InsertAtHeadOfTarget, _super);

    function InsertAtHeadOfTarget() {
      return InsertAtHeadOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtHeadOfTarget.extend();

    InsertAtHeadOfTarget.prototype.which = 'head';

    return InsertAtHeadOfTarget;

  })(InsertByTarget);

  InsertAtTailOfTarget = (function(_super) {
    __extends(InsertAtTailOfTarget, _super);

    function InsertAtTailOfTarget() {
      return InsertAtTailOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtTailOfTarget.extend();

    InsertAtTailOfTarget.prototype.which = 'tail';

    return InsertAtTailOfTarget;

  })(InsertByTarget);

  InsertAtPreviousFoldStart = (function(_super) {
    __extends(InsertAtPreviousFoldStart, _super);

    function InsertAtPreviousFoldStart() {
      return InsertAtPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtPreviousFoldStart.extend();

    InsertAtPreviousFoldStart.description = "Move to previous fold start then enter insert-mode";

    InsertAtPreviousFoldStart.prototype.target = 'MoveToPreviousFoldStart';

    return InsertAtPreviousFoldStart;

  })(InsertAtHeadOfTarget);

  InsertAtNextFoldStart = (function(_super) {
    __extends(InsertAtNextFoldStart, _super);

    function InsertAtNextFoldStart() {
      return InsertAtNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtNextFoldStart.extend();

    InsertAtNextFoldStart.description = "Move to next fold start then enter insert-mode";

    InsertAtNextFoldStart.prototype.target = 'MoveToNextFoldStart';

    return InsertAtNextFoldStart;

  })(InsertAtHeadOfTarget);

  Change = (function(_super) {
    __extends(Change, _super);

    function Change() {
      return Change.__super__.constructor.apply(this, arguments);
    }

    Change.extend();

    Change.prototype.requireTarget = true;

    Change.prototype.trackChange = true;

    Change.prototype.supportInsertionCount = false;

    Change.prototype.getAutoIndentedTextForNewLine = function(selection, text) {
      var desiredIndentLevel, range;
      range = selection.getBufferRange();
      desiredIndentLevel = this.editor.languageMode.suggestedIndentForLineAtBufferRow(range.start.row, text);
      return this.editor.buildIndentString(desiredIndentLevel) + text;
    };

    Change.prototype.execute = function() {
      var text, _base;
      this.selectTarget();
      text = '';
      if (this.target.isTextObject() || this.target.isMotion()) {
        if (swrap.detectVisualModeSubmode(this.editor) === 'linewise') {
          text = "\n";
        }
      } else {
        if (typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) {
          text = "\n";
        }
      }
      this.editor.transact((function(_this) {
        return function() {
          var range, selection, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
            _this.setTextToRegisterForSelection(selection);
            if (text === "\n") {
              text = _this.getAutoIndentedTextForNewLine(selection, text);
            }
            range = selection.insertText(text, {
              autoIndent: true
            });
            if (!range.isEmpty()) {
              _results.push(selection.cursor.moveLeft());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
      return Change.__super__.execute.apply(this, arguments);
    };

    return Change;

  })(ActivateInsertMode);

  Substitute = (function(_super) {
    __extends(Substitute, _super);

    function Substitute() {
      return Substitute.__super__.constructor.apply(this, arguments);
    }

    Substitute.extend();

    Substitute.prototype.target = 'MoveRight';

    return Substitute;

  })(Change);

  SubstituteLine = (function(_super) {
    __extends(SubstituteLine, _super);

    function SubstituteLine() {
      return SubstituteLine.__super__.constructor.apply(this, arguments);
    }

    SubstituteLine.extend();

    SubstituteLine.prototype.target = 'MoveToRelativeLine';

    return SubstituteLine;

  })(Change);

  ChangeToLastCharacterOfLine = (function(_super) {
    __extends(ChangeToLastCharacterOfLine, _super);

    function ChangeToLastCharacterOfLine() {
      return ChangeToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    ChangeToLastCharacterOfLine.extend();

    ChangeToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    ChangeToLastCharacterOfLine.prototype.initialize = function() {
      if (this.isVisualBlockwise = this.isMode('visual', 'blockwise')) {
        this.requireTarget = false;
      }
      return ChangeToLastCharacterOfLine.__super__.initialize.apply(this, arguments);
    };

    ChangeToLastCharacterOfLine.prototype.execute = function() {
      if (this.isVisualBlockwise) {
        this.getBlockwiseSelections().forEach(function(bs) {
          bs.removeEmptySelections();
          return bs.setPositionForSelections('start');
        });
      }
      return ChangeToLastCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return ChangeToLastCharacterOfLine;

  })(Change);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2c0RBQUE7SUFBQTs7O3NGQUFBOztBQUFBLEVBQUEsZ0JBQUEsR0FBbUIsY0FBbkIsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FGSixDQUFBOztBQUFBLEVBR0EsT0FBdUQsT0FBQSxDQUFRLE1BQVIsQ0FBdkQsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsRUFBZSwyQkFBQSxtQkFBZixFQUFvQyx1QkFBQSxlQUhwQyxDQUFBOztBQUFBLEVBS0EsUUFLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0UsMEJBQUEsaUJBREYsRUFFRSx1QkFBQSxjQUZGLEVBRWtCLHdCQUFBLGVBRmxCLEVBR0Usd0JBQUEsZUFIRixFQUdtQixzQ0FBQSw2QkFIbkIsRUFJRSxzQ0FBQSw2QkFURixDQUFBOztBQUFBLEVBV0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQVhSLENBQUE7O0FBQUEsRUFZQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FaWCxDQUFBOztBQUFBLEVBYUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBYlAsQ0FBQTs7QUFBQSxFQWdCTTtBQUNKLG9DQUFBLENBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUNhLElBQUEsdUJBQUUsT0FBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsVUFBQSxPQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsZ0JBQVIsQ0FEVztJQUFBLENBRGI7O3lCQUFBOztLQUQwQixLQWhCNUIsQ0FBQTs7QUFBQSxFQXNCTTtB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/operator.coffee
