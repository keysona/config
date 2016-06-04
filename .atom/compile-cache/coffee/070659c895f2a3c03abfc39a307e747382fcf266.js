(function() {
  var ActivateInsertMode, ActivateReplaceMode, AutoIndent, Base, BufferedProcess, CamelCase, Change, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, ChangeToLastCharacterOfLine, CompositeDisposable, DashCase, DecodeUriComponent, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteRight, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, DeleteToLastCharacterOfLine, EncodeUriComponent, Increase, IncrementNumber, Indent, InsertAboveWithNewline, InsertAfter, InsertAfterByMotion, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfSelection, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfSelection, InsertBelowWithNewline, InsertByMotion, Join, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, Mark, Operator, OperatorError, Outdent, Point, PutAfter, PutAfterAndSelect, PutBefore, PutBeforeAndSelect, Range, Repeat, Replace, ReplaceWithRegister, Reverse, Select, SelectLatestChange, SelectPreviousSelection, SnakeCase, SplitString, Substitute, SubstituteLine, Surround, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, UpperCase, Yank, YankLine, getNewTextRangeFromCheckpoint, getVimEofBufferPosition, haveSomeSelection, highlightRanges, isEndsWithNewLineForBufferRow, moveCursorLeft, moveCursorRight, settings, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, BufferedProcess = _ref.BufferedProcess;

  _ref1 = require('./utils'), haveSomeSelection = _ref1.haveSomeSelection, getVimEofBufferPosition = _ref1.getVimEofBufferPosition, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, highlightRanges = _ref1.highlightRanges, getNewTextRangeFromCheckpoint = _ref1.getNewTextRangeFromCheckpoint, isEndsWithNewLineForBufferRow = _ref1.isEndsWithNewLineForBufferRow;

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
      vimEof = getVimEofBufferPosition(this.editor);
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

    TransformStringBySelectList.prototype.execute = function() {};

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

    Indent.prototype.mutateSelection = function(selection) {
      this.indent(selection);
      this.restorePoint(selection);
      if (!this.needStay()) {
        return selection.cursor.moveToFirstCharacterOfLine();
      }
    };

    Indent.prototype.indent = function(selection) {
      return selection.indentSelectedRows();
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

    Outdent.prototype.indent = function(selection) {
      return selection.outdentSelectedRows();
    };

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

    AutoIndent.prototype.indent = function(selection) {
      return selection.autoIndentSelectedRows();
    };

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

    Join.prototype.requireTarget = false;

    Join.prototype.execute = function() {
      this.editor.transact((function(_this) {
        return function() {
          return _this.countTimes(function() {
            return _this.editor.joinLines();
          });
        };
      })(this));
      return this.activateMode('normal');
    };

    return Join;

  })(Operator);

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

  Mark = (function(_super) {
    __extends(Mark, _super);

    function Mark() {
      return Mark.__super__.constructor.apply(this, arguments);
    }

    Mark.extend();

    Mark.prototype.hover = {
      icon: ':mark:',
      emoji: ':round_pushpin:'
    };

    Mark.prototype.requireInput = true;

    Mark.prototype.requireTarget = false;

    Mark.prototype.initialize = function() {
      return this.focusInput();
    };

    Mark.prototype.execute = function() {
      this.vimState.mark.set(this.input, this.editor.getCursorBufferPosition());
      return this.activateMode('normal');
    };

    return Mark;

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

  InsertAtStartOfSelection = (function(_super) {
    __extends(InsertAtStartOfSelection, _super);

    function InsertAtStartOfSelection() {
      return InsertAtStartOfSelection.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfSelection.extend();

    InsertAtStartOfSelection.prototype.which = 'start';

    InsertAtStartOfSelection.prototype.execute = function() {
      if (this.isMode('visual', 'blockwise')) {
        this.getBlockwiseSelections().forEach((function(_this) {
          return function(bs) {
            bs.removeEmptySelections();
            return bs.setPositionForSelections(_this.which);
          };
        })(this));
      }
      return InsertAtStartOfSelection.__super__.execute.apply(this, arguments);
    };

    return InsertAtStartOfSelection;

  })(ActivateInsertMode);

  InsertAtEndOfSelection = (function(_super) {
    __extends(InsertAtEndOfSelection, _super);

    function InsertAtEndOfSelection() {
      return InsertAtEndOfSelection.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfSelection.extend();

    InsertAtEndOfSelection.prototype.which = 'end';

    return InsertAtEndOfSelection;

  })(InsertAtStartOfSelection);

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

  InsertByMotion = (function(_super) {
    __extends(InsertByMotion, _super);

    function InsertByMotion() {
      return InsertByMotion.__super__.constructor.apply(this, arguments);
    }

    InsertByMotion.extend();

    InsertByMotion.description = "Move by specified motion then enter insert-mode(`i`)";

    InsertByMotion.prototype.requireTarget = true;

    InsertByMotion.prototype.execute = function() {
      var cursor, _i, _len, _ref2;
      if (this.target.isMotion()) {
        this.target.execute();
      }
      if (this["instanceof"]('InsertAfterByMotion')) {
        _ref2 = this.editor.getCursors();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          cursor = _ref2[_i];
          moveCursorRight(cursor);
        }
      }
      return InsertByMotion.__super__.execute.apply(this, arguments);
    };

    return InsertByMotion;

  })(ActivateInsertMode);

  InsertAfterByMotion = (function(_super) {
    __extends(InsertAfterByMotion, _super);

    function InsertAfterByMotion() {
      return InsertAfterByMotion.__super__.constructor.apply(this, arguments);
    }

    InsertAfterByMotion.description = "Move by specified motion then enter insert-mode(`a`)";

    InsertAfterByMotion.extend();

    return InsertAfterByMotion;

  })(InsertByMotion);

  InsertAtPreviousFoldStart = (function(_super) {
    __extends(InsertAtPreviousFoldStart, _super);

    function InsertAtPreviousFoldStart() {
      return InsertAtPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtPreviousFoldStart.extend();

    InsertAtPreviousFoldStart.description = "Move to previous fold start then enter insert-mode";

    InsertAtPreviousFoldStart.prototype.target = 'MoveToPreviousFoldStart';

    return InsertAtPreviousFoldStart;

  })(InsertByMotion);

  InsertAtNextFoldStart = (function(_super) {
    __extends(InsertAtNextFoldStart, _super);

    function InsertAtNextFoldStart() {
      return InsertAtNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtNextFoldStart.extend();

    InsertAtNextFoldStart.description = "Move to next fold start then enter insert-mode";

    InsertAtNextFoldStart.prototype.target = 'MoveToNextFoldStart';

    return InsertAtNextFoldStart;

  })(InsertAtPreviousFoldStart);

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2akRBQUE7SUFBQTs7O3NGQUFBOztBQUFBLEVBQUEsZ0JBQUEsR0FBbUIsY0FBbkIsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FGSixDQUFBOztBQUFBLEVBR0EsT0FBdUQsT0FBQSxDQUFRLE1BQVIsQ0FBdkQsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsRUFBZSwyQkFBQSxtQkFBZixFQUFvQyx1QkFBQSxlQUhwQyxDQUFBOztBQUFBLEVBS0EsUUFLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0UsMEJBQUEsaUJBREYsRUFDcUIsZ0NBQUEsdUJBRHJCLEVBRUUsdUJBQUEsY0FGRixFQUVrQix3QkFBQSxlQUZsQixFQUdFLHdCQUFBLGVBSEYsRUFHbUIsc0NBQUEsNkJBSG5CLEVBSUUsc0NBQUEsNkJBVEYsQ0FBQTs7QUFBQSxFQVdBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FYUixDQUFBOztBQUFBLEVBWUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBWlgsQ0FBQTs7QUFBQSxFQWFBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQWJQLENBQUE7O0FBQUEsRUFnQk07QUFDSixvQ0FBQSxDQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFDYSxJQUFBLHVCQUFFLE9BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFVBQUEsT0FDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLGdCQUFSLENBRFc7SUFBQSxDQURiOzt5QkFBQTs7S0FEMEIsS0FoQjVC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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/operator.coffee
