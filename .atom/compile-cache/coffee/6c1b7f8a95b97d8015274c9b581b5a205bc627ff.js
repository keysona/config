(function() {
  var ActivateInsertMode, ActivateReplaceMode, AddSelection, AutoIndent, Base, BufferedProcess, CamelCase, Change, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, ChangeToLastCharacterOfLine, CompactSpaces, CompositeDisposable, DashCase, DecodeUriComponent, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteRight, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, DeleteToLastCharacterOfLine, EncodeUriComponent, Increase, IncrementNumber, Indent, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfSelection, InsertAtEndOfTarget, InsertAtHeadOfTarget, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfSelection, InsertAtStartOfTarget, InsertAtTailOfTarget, InsertBelowWithNewline, InsertByTarget, Join, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, MarkRange, Operator, OperatorError, Outdent, Point, PutAfter, PutAfterAndSelect, PutBefore, PutBeforeAndSelect, Range, Repeat, Replace, ReplaceWithRegister, Reverse, Select, SelectAllInRangeMarker, SelectLatestChange, SelectPreviousSelection, SetCursorsToStartOfMarkedRange, SetCursorsToStartOfTarget, SnakeCase, SplitByCharacter, SplitString, Substitute, SubstituteLine, Surround, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, UpperCase, Yank, YankLine, YankToLastCharacterOfLine, getNewTextRangeFromCheckpoint, haveSomeSelection, highlightRanges, isAllWhiteSpace, isEndsWithNewLineForBufferRow, moveCursorLeft, moveCursorRight, settings, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, BufferedProcess = _ref.BufferedProcess;

  _ref1 = require('./utils'), haveSomeSelection = _ref1.haveSomeSelection, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, highlightRanges = _ref1.highlightRanges, getNewTextRangeFromCheckpoint = _ref1.getNewTextRangeFromCheckpoint, isEndsWithNewLineForBufferRow = _ref1.isEndsWithNewLineForBufferRow, isAllWhiteSpace = _ref1.isAllWhiteSpace;

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
            return marker = _this.editor.markBufferRange(_this.editor.getSelectedBufferRange());
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

    DeleteRight.prototype.hover = null;

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

  SplitByCharacter = (function(_super) {
    __extends(SplitByCharacter, _super);

    function SplitByCharacter() {
      return SplitByCharacter.__super__.constructor.apply(this, arguments);
    }

    SplitByCharacter.extend();

    SplitByCharacter.prototype.getNewText = function(text) {
      return text.split('').join(' ');
    };

    return SplitByCharacter;

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

  CompactSpaces = (function(_super) {
    __extends(CompactSpaces, _super);

    function CompactSpaces() {
      return CompactSpaces.__super__.constructor.apply(this, arguments);
    }

    CompactSpaces.extend();

    CompactSpaces.description = "Compact multiple spaces to single space";

    CompactSpaces.prototype.displayName = 'Compact space';

    CompactSpaces.prototype.mutateSelection = function(selection) {
      var text;
      text = this.getNewText(selection.getText(), selection);
      selection.insertText(text, {
        autoIndent: this.autoIndent
      });
      if (this.setPoint) {
        return this.restorePoint(selection);
      }
    };

    CompactSpaces.prototype.getNewText = function(text) {
      if (text.match(/^[ ]+$/)) {
        return ' ';
      } else {
        return text.replace(/^(\s*)(.*?)(\s*)$/gm, function(m, leading, middle, trailing) {
          return leading + middle.split(/[ \t]+/).join(' ') + trailing;
        });
      }
    };

    return CompactSpaces;

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

  YankToLastCharacterOfLine = (function(_super) {
    __extends(YankToLastCharacterOfLine, _super);

    function YankToLastCharacterOfLine() {
      return YankToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    YankToLastCharacterOfLine.extend();

    YankToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    return YankToLastCharacterOfLine;

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
      var lastSelection, pattern, ranges, scanRange, selection, word, _i, _len, _ref2;
      lastSelection = this.editor.getLastSelection();
      if (!this.isMode('visual')) {
        lastSelection.selectWord();
      }
      word = this.editor.getSelectedText();
      if (word === '') {
        return;
      }
      if (!this.selectTarget()) {
        return;
      }
      ranges = [];
      pattern = this.isMode('visual') ? RegExp("" + (_.escapeRegExp(word)), "g") : RegExp("\\b" + (_.escapeRegExp(word)) + "\\b", "g");
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

    SelectAllInRangeMarker.prototype.requireTarget = false;

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
    __extends(MarkRange, _super);

    function MarkRange() {
      return MarkRange.__super__.constructor.apply(this, arguments);
    }

    MarkRange.extend();

    MarkRange.prototype.keepCursorPosition = true;

    MarkRange.prototype.mutateSelection = function(selection) {
      var marker, range;
      range = selection.getBufferRange();
      marker = highlightRanges(this.editor, range, {
        "class": 'vim-mode-plus-range-marker'
      });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwweERBQUE7SUFBQTs7O3NGQUFBOztBQUFBLEVBQUEsZ0JBQUEsR0FBbUIsY0FBbkIsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FGSixDQUFBOztBQUFBLEVBR0EsT0FBdUQsT0FBQSxDQUFRLE1BQVIsQ0FBdkQsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsRUFBZSwyQkFBQSxtQkFBZixFQUFvQyx1QkFBQSxlQUhwQyxDQUFBOztBQUFBLEVBS0EsUUFNSSxPQUFBLENBQVEsU0FBUixDQU5KLEVBQ0UsMEJBQUEsaUJBREYsRUFFRSx1QkFBQSxjQUZGLEVBRWtCLHdCQUFBLGVBRmxCLEVBR0Usd0JBQUEsZUFIRixFQUdtQixzQ0FBQSw2QkFIbkIsRUFJRSxzQ0FBQSw2QkFKRixFQUtFLHdCQUFBLGVBVkYsQ0FBQTs7QUFBQSxFQVlBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FaUixDQUFBOztBQUFBLEVBYUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBYlgsQ0FBQTs7QUFBQSxFQWNBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQWRQLENBQUE7O0FBQUEsRUFpQk07QUFDSixvQ0FBQSxDQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFDYSxJQUFBLHVCQUFFLE9BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFVBQUEsT0FDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLGdCQUFSLENBRFc7SUFBQSxDQURiOzt5QkFBQTs7S0FEMEIsS0FqQjVCLENBQUE7O0FBQUEsRUF1Qk07QUFDSiwrQkFBQSxDQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSx1QkFDQSxVQUFBLEdBQVksSUFEWixDQUFBOztBQUFBLHVCQUVBLFdBQUEsR0FBYSxJQUZiLENBQUE7O0FBQUEsdUJBR0EsV0FBQSxHQUFhLEtBSGIsQ0FBQTs7QUFBQSx1QkFJQSxhQUFBLEdBQWUsSUFKZixDQUFBOztBQUFBLHVCQUtBLFNBQUEsR0FBVyxRQUxYLENBQUE7O0FBQUEsdUJBTUEsWUFBQSxHQUFjLElBTmQsQ0FBQTs7QUFBQSx1QkFRQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsR0FBQTtBQUNoQixVQUFBLFVBQUE7QUFBQSxNQURrQixhQUFBLE9BQU8sV0FBQSxHQUN6QixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLEVBQXdCLEtBQXhCLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsR0FBeEIsRUFGZ0I7SUFBQSxDQVJsQixDQUFBOztBQUFBLHVCQVlBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLEtBQUE7QUFBQSxNQUFBLElBQUcsQ0FBQSxJQUFLLENBQUEsTUFBRCxDQUFRLFFBQVIsQ0FBSixJQUEwQixJQUFDLENBQUEsV0FBM0IsSUFBMkMsUUFBUSxDQUFDLEdBQVQsQ0FBYSxnQkFBYixDQUE5Qzt1QkFDRSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsRUFBQSxlQUFrQixRQUFRLENBQUMsR0FBVCxDQUFhLHlCQUFiLENBQWxCLEVBQUEsS0FBQSxNQURGO09BQUEsTUFBQTtlQUdFLE1BSEY7T0FEUztJQUFBLENBWlgsQ0FBQTs7QUFBQSx1QkFrQkEsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDZixJQUFDLENBQUEsWUFEYztJQUFBLENBbEJqQixDQUFBOztBQUFBLHVCQXdCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSxZQUFBO0FBQUEsTUFBQSxJQUFlLElBQUMsQ0FBQSxrQkFBaEI7QUFBQSxlQUFPLElBQVAsQ0FBQTtPQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVcsSUFBQyxDQUFBLFlBQUEsQ0FBRCxDQUFZLGlCQUFaLENBQUgsR0FDTix1QkFETSxHQUdMLFFBQUEsR0FBTyxDQUFDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBRCxDQUxWLENBQUE7QUFPQSxNQUFBLElBQUcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFVBQWxCLENBQUg7ZUFDRSxRQUFRLENBQUMsR0FBVCxDQUFhLEtBQWIsRUFERjtPQUFBLE1BQUE7ZUFHRSxRQUFRLENBQUMsR0FBVCxDQUFhLEtBQWIsQ0FBQSxJQUF1QixDQUFDLElBQUMsQ0FBQSxjQUFELG1FQUEyQixDQUFDLHNCQUE3QixFQUh6QjtPQVJRO0lBQUEsQ0F4QlYsQ0FBQTs7QUFxQ2EsSUFBQSxrQkFBQSxHQUFBO0FBQ1gsTUFBQSwyQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUVBLE1BQUEsSUFBVSxJQUFDLENBQUEsWUFBQSxDQUFELENBQVksUUFBWixDQUFWO0FBQUEsY0FBQSxDQUFBO09BRkE7O1FBS0EsSUFBQyxDQUFBO09BTEQ7QUFNQSxNQUFBLElBQTRCLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLE1BQVosQ0FBNUI7QUFBQSxRQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLEtBQUEsQ0FBRCxDQUFLLElBQUMsQ0FBQSxNQUFOLENBQVgsQ0FBQSxDQUFBO09BUFc7SUFBQSxDQXJDYjs7QUFBQSx1QkE4Q0EsWUFBQSxHQUFjLFNBQUMsU0FBRCxHQUFBO0FBQ1osTUFBQSxJQUFHLElBQUMsQ0FBQSxXQUFKO2VBQ0UsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxtQkFBakIsQ0FBcUMsTUFBckMsRUFBNkM7QUFBQSxVQUFBLFlBQUEsRUFBYyxJQUFkO1NBQTdDLEVBREY7T0FBQSxNQUFBO2VBR0UsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxtQkFBakIsQ0FBcUMsT0FBckMsRUFBOEM7QUFBQSxVQUFBLFlBQUEsRUFBYyxJQUFkO1NBQTlDLEVBSEY7T0FEWTtJQUFBLENBOUNkLENBQUE7O0FBQUEsdUJBb0RBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUduQixVQUFBLE1BQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsWUFBQSxDQUFELENBQVksUUFBWixDQUFQO0FBQ0UsUUFBQSxJQUFHLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFsQjtBQUNFLFVBQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxNQUFELENBQVEsUUFBUixDQUFQO0FBQ0UsWUFBQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtxQkFBQSxTQUFBLEdBQUE7dUJBQUcsS0FBQyxDQUFBLHlCQUFELENBQUEsRUFBSDtjQUFBLEVBQUE7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBQUEsQ0FERjtXQURGO1NBQUEsTUFBQTtBQUlFLFVBQUEsSUFBQyxDQUFBLGlCQUFELENBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7bUJBQUEsU0FBQSxHQUFBO3FCQUFHLEtBQUMsQ0FBQSx5QkFBRCxDQUFBLEVBQUg7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixDQUFBLENBSkY7U0FERjtPQUFBO0FBT0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLGlCQUFELENBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUNqQixLQUFDLENBQUEsS0FBRCxDQUFPLEtBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxDQUFQLEVBRGlCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FBQSxDQURGO09BUEE7QUFXQSxNQUFBLElBQUcsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFIO0FBQ0UsUUFBQSxNQUFBLEdBQVMsSUFBVCxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQ2pCLE1BQUEsR0FBUyxLQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyxzQkFBUixDQUFBLENBQXhCLEVBRFE7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixDQURBLENBQUE7ZUFJQSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDcEIsZ0JBQUEsS0FBQTtBQUFBLFlBQUEsSUFBNEIsQ0FBQyxLQUFBLEdBQVEsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQUFULENBQTVCO3FCQUFBLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFsQixFQUFBO2FBRG9CO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsRUFMRjtPQWRtQjtJQUFBLENBcERyQixDQUFBOztBQUFBLHVCQTJFQSxTQUFBLEdBQVcsU0FBRSxNQUFGLEdBQUE7QUFDVCxNQURVLElBQUMsQ0FBQSxTQUFBLE1BQ1gsQ0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLENBQVEsQ0FBQyxVQUFGLENBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFyQixDQUFQO0FBQ0UsUUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUF1Qix3QkFBdkIsQ0FBQSxDQUFBO0FBQ0EsY0FBVSxJQUFBLGFBQUEsQ0FBYyxFQUFBLEdBQUUsQ0FBQyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUQsQ0FBRixHQUFjLGNBQWQsR0FBMkIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUFELENBQTNCLEdBQThDLFlBQTVELENBQVYsQ0FGRjtPQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsSUFBcEIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBbEIsQ0FKQSxDQUFBO2FBS0EsS0FOUztJQUFBLENBM0VYLENBQUE7O0FBQUEsdUJBcUZBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixNQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBSEEsQ0FBQTthQUlBLGlCQUFBLENBQWtCLElBQUMsQ0FBQSxNQUFuQixFQUxZO0lBQUEsQ0FyRmQsQ0FBQTs7QUFBQSx1QkE0RkEsNkJBQUEsR0FBK0IsU0FBQyxTQUFELEdBQUE7YUFDN0IsSUFBQyxDQUFBLGlCQUFELENBQW1CLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBbkIsRUFBd0MsU0FBeEMsRUFENkI7SUFBQSxDQTVGL0IsQ0FBQTs7QUFBQSx1QkErRkEsaUJBQUEsR0FBbUIsU0FBQyxJQUFELEVBQU8sU0FBUCxHQUFBO0FBQ2pCLFVBQUEsS0FBQTtBQUFBLE1BQUEsbUVBQVUsQ0FBQyxzQkFBUixJQUEwQixDQUFBLElBQVEsQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFqQztBQUNFLFFBQUEsSUFBQSxJQUFRLElBQVIsQ0FERjtPQUFBO0FBRUEsTUFBQSxJQUFHLElBQUg7ZUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFuQixDQUF1QjtBQUFBLFVBQUMsTUFBQSxJQUFEO0FBQUEsVUFBTyxXQUFBLFNBQVA7U0FBdkIsRUFERjtPQUhpQjtJQUFBLENBL0ZuQixDQUFBOztBQUFBLHVCQXFHQSxLQUFBLEdBQU8sU0FBQyxNQUFELEdBQUE7YUFDTCxlQUFBLENBQWdCLElBQUMsQ0FBQSxNQUFqQixFQUF5QixNQUF6QixFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQU8scUJBQVA7QUFBQSxRQUNBLE9BQUEsRUFBUyxRQUFRLENBQUMsR0FBVCxDQUFhLHdCQUFiLENBRFQ7T0FERixFQURLO0lBQUEsQ0FyR1AsQ0FBQTs7QUFBQSx1QkEwR0EsZ0JBQUEsR0FBa0IsU0FBQyxFQUFELEdBQUE7QUFDaEIsTUFBQSxJQUFHLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUNmLGdCQUFBLG9DQUFBO0FBQUE7QUFBQTtpQkFBQSw0Q0FBQTtvQ0FBQTtBQUFBLDRCQUFBLEVBQUEsQ0FBRyxTQUFILEVBQUEsQ0FBQTtBQUFBOzRCQURlO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsRUFERjtPQURnQjtJQUFBLENBMUdsQixDQUFBOztBQUFBLHVCQStHQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBRVAsVUFBQSxhQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixDQUFIO0FBQ0UsUUFBQSxhQUFBLEdBQW1CLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixXQUFsQixDQUFILEdBQ2QsSUFBQyxDQUFBLFFBQVEsQ0FBQyx5QkFBVixDQUFBLENBRGMsR0FHZCxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FIRixDQUFBO0FBQUEsUUFJQSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyx5QkFBdEIsQ0FBZ0QsYUFBaEQsQ0FKQSxDQURGO09BQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxTQUFELEdBQUE7aUJBQ2hCLEtBQUMsQ0FBQSxlQUFELENBQWlCLFNBQWpCLEVBRGdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FQQSxDQUFBO2FBU0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsU0FBZixFQUEwQixJQUFDLENBQUEsWUFBM0IsRUFYTztJQUFBLENBL0dULENBQUE7O29CQUFBOztLQURxQixLQXZCdkIsQ0FBQTs7QUFBQSxFQXFKTTtBQUNKLDZCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLE1BQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEscUJBQ0EsV0FBQSxHQUFhLEtBRGIsQ0FBQTs7QUFBQSxxQkFFQSxVQUFBLEdBQVksS0FGWixDQUFBOztBQUFBLHFCQUdBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGNBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFELENBQVEsa0JBQVIsQ0FBQSxJQUErQixJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFBa0IsV0FBbEIsQ0FBekM7QUFBQSxjQUFBLENBQUE7T0FEQTtBQUVBLE1BQUEsSUFBRyxDQUFBLElBQUssQ0FBQSxNQUFELENBQVEsUUFBUixDQUFQO0FBQ0UsUUFBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLHVCQUFOLENBQThCLElBQUMsQ0FBQSxNQUEvQixDQUFWLENBQUE7ZUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsRUFBd0IsT0FBeEIsRUFGRjtPQUFBLE1BQUE7QUFJRSxRQUFBLDRFQUFVLENBQUMsK0JBQVg7QUFDRSxVQUFBLE9BQUEsR0FBVSxLQUFLLENBQUMsdUJBQU4sQ0FBOEIsSUFBQyxDQUFBLE1BQS9CLENBQVYsQ0FBQTtBQUNBLFVBQUEsSUFBRyxpQkFBQSxJQUFhLENBQUEsSUFBSyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLE9BQWxCLENBQXBCO21CQUNFLElBQUMsQ0FBQSxZQUFELENBQWMsUUFBZCxFQUF3QixPQUF4QixFQURGO1dBRkY7U0FKRjtPQUhPO0lBQUEsQ0FIVCxDQUFBOztrQkFBQTs7S0FEbUIsU0FySnJCLENBQUE7O0FBQUEsRUFxS007QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxrQkFBQyxDQUFBLFdBQUQsR0FBYyx1Q0FEZCxDQUFBOztBQUFBLGlDQUVBLE1BQUEsR0FBUSxlQUZSLENBQUE7OzhCQUFBOztLQUQrQixPQXJLakMsQ0FBQTs7QUFBQSxFQTBLTTtBQUNKLDhDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHVCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxzQ0FDQSxhQUFBLEdBQWUsS0FEZixDQUFBOztBQUFBLHNDQUVBLFVBQUEsR0FBWSxLQUZaLENBQUE7O0FBQUEsSUFHQSx1QkFBQyxDQUFBLFdBQUQsR0FBYyxvREFIZCxDQUFBOztBQUFBLHNDQUlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHFDQUFBO0FBQUEsTUFBQSxRQUF3QixJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyx3QkFBdEIsQ0FBQSxDQUF4QixFQUFDLG1CQUFBLFVBQUQsRUFBYSxnQkFBQSxPQUFiLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxDQUFjLG9CQUFBLElBQWdCLGlCQUE5QixDQUFBO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUdBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FIWixDQUFBO0FBQUEsTUFJQSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLGtCQUFqQixDQUFvQyxVQUFwQyxDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUE1QixFQUF3RDtBQUFBLFFBQUMsTUFBQSxFQUFRLElBQVQ7T0FBeEQsQ0FMQSxDQUFBO2FBTUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBQXdCLE9BQXhCLEVBUE87SUFBQSxDQUpULENBQUE7O21DQUFBOztLQURvQyxTQTFLdEMsQ0FBQTs7QUFBQSxFQXlMTTtBQUNKLDZCQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsSUFBQSxNQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxxQkFDQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxVQUFOO0FBQUEsTUFBa0IsS0FBQSxFQUFPLFlBQXpCO0tBRFAsQ0FBQTs7QUFBQSxxQkFFQSxXQUFBLEdBQWEsSUFGYixDQUFBOztBQUFBLHFCQUdBLFdBQUEsR0FBYSxLQUhiLENBQUE7O0FBQUEscUJBS0EsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLFVBQUEsMkJBQUE7QUFBQSxNQUFDLFNBQVUsVUFBVixNQUFELENBQUE7QUFBQSxNQUNBLFdBQUEsR0FBYyxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLFVBQWpCLENBQUEsQ0FEZCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsNkJBQUQsQ0FBK0IsU0FBL0IsQ0FGQSxDQUFBO0FBQUEsTUFHQSxTQUFTLENBQUMsa0JBQVYsQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUtBLE1BQUEsR0FBUyxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUxULENBQUE7QUFNQSxNQUFBLElBQUcsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBMEIsQ0FBQyxhQUEzQixDQUF5QyxNQUF6QyxDQUFIO0FBQ0UsUUFBQSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxNQUFNLENBQUMsR0FBUixFQUFhLENBQWIsQ0FBekIsQ0FBQSxDQURGO09BTkE7QUFRQSxNQUFBLElBQWtDLFdBQWxDO2VBQUEsTUFBTSxDQUFDLHFCQUFQLENBQUEsRUFBQTtPQVRlO0lBQUEsQ0FMakIsQ0FBQTs7a0JBQUE7O0tBRG1CLFNBekxyQixDQUFBOztBQUFBLEVBME1NO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsMEJBQ0EsTUFBQSxHQUFRLFdBRFIsQ0FBQTs7QUFBQSwwQkFFQSxLQUFBLEdBQU8sSUFGUCxDQUFBOzt1QkFBQTs7S0FEd0IsT0ExTTFCLENBQUE7O0FBQUEsRUErTU07QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSx5QkFDQSxNQUFBLEdBQVEsVUFEUixDQUFBOztzQkFBQTs7S0FEdUIsT0EvTXpCLENBQUE7O0FBQUEsRUFtTk07QUFDSixrREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSwyQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsMENBQ0EsTUFBQSxHQUFRLDJCQURSLENBQUE7O0FBQUEsMENBRUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBRyxJQUFDLENBQUEsaUJBQUQsR0FBcUIsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFdBQWxCLENBQXhCO2VBQ0UsSUFBQyxDQUFBLGFBQUQsR0FBaUIsTUFEbkI7T0FEVTtJQUFBLENBRlosQ0FBQTs7QUFBQSwwQ0FNQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSx5QkFBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsaUJBQUo7QUFDRSxRQUFBLHlCQUFBLEdBQTRCLEdBQUEsQ0FBQSxHQUE1QixDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUF5QixDQUFDLE9BQTFCLENBQWtDLFNBQUMsRUFBRCxHQUFBO0FBQ2hDLFVBQUEsRUFBRSxDQUFDLHFCQUFILENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxFQUFFLENBQUMsd0JBQUgsQ0FBNEIsT0FBNUIsQ0FEQSxDQUFBO2lCQUVBLHlCQUF5QixDQUFDLEdBQTFCLENBQThCLEVBQTlCLEVBQWtDLEVBQUUsQ0FBQyxpQkFBSCxDQUFBLENBQXNCLENBQUMscUJBQXZCLENBQUEsQ0FBbEMsRUFIZ0M7UUFBQSxDQUFsQyxDQURBLENBREY7T0FBQTtBQUFBLE1BT0EsMERBQUEsU0FBQSxDQVBBLENBQUE7QUFTQSxNQUFBLElBQUcsSUFBQyxDQUFBLGlCQUFKO2VBQ0UseUJBQXlCLENBQUMsT0FBMUIsQ0FBa0MsU0FBQyxLQUFELEVBQVEsRUFBUixHQUFBO2lCQUNoQyxFQUFFLENBQUMscUJBQUgsQ0FBeUIsS0FBekIsRUFEZ0M7UUFBQSxDQUFsQyxFQURGO09BVk87SUFBQSxDQU5ULENBQUE7O3VDQUFBOztLQUR3QyxPQW5OMUMsQ0FBQTs7QUFBQSxFQXlPTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsOEJBQ0EsV0FBQSxHQUFhLElBRGIsQ0FBQTs7QUFBQSw4QkFFQSxjQUFBLEdBQWdCLElBRmhCLENBQUE7O0FBQUEsOEJBR0EsUUFBQSxHQUFVLElBSFYsQ0FBQTs7QUFBQSw4QkFJQSxVQUFBLEdBQVksS0FKWixDQUFBOztBQUFBLDhCQU1BLGVBQUEsR0FBaUIsU0FBQyxTQUFELEdBQUE7QUFDZixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsVUFBRCxDQUFZLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBWixFQUFpQyxTQUFqQyxDQUFQLENBQUE7QUFBQSxNQUNBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCO0FBQUEsUUFBRSxZQUFELElBQUMsQ0FBQSxVQUFGO09BQTNCLENBREEsQ0FBQTtBQUVBLE1BQUEsSUFBNEIsSUFBQyxDQUFBLFFBQTdCO2VBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxTQUFkLEVBQUE7T0FIZTtJQUFBLENBTmpCLENBQUE7OzJCQUFBOztLQUQ0QixTQXpPOUIsQ0FBQTs7QUFBQSxFQXVQTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHlCQUNBLFdBQUEsR0FBYSxVQURiLENBQUE7O0FBQUEseUJBRUEsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sZUFBTjtBQUFBLE1BQXVCLEtBQUEsRUFBTyxRQUE5QjtLQUZQLENBQUE7O0FBQUEseUJBR0EsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSxTQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFaLENBQUE7QUFDQSxNQUFBLElBQUcsU0FBQSxLQUFhLElBQWhCO2VBQ0UsSUFBSSxDQUFDLFdBQUwsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLFVBSEY7T0FGVTtJQUFBLENBSFosQ0FBQTs7QUFBQSx5QkFVQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixJQUFJLENBQUMsS0FBTCxDQUFXLEVBQVgsQ0FBYyxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFVBQXBCLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsRUFBckMsRUFEVTtJQUFBLENBVlosQ0FBQTs7c0JBQUE7O0tBRHVCLGdCQXZQekIsQ0FBQTs7QUFBQSxFQXFRTTtBQUNKLDZDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHNCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxxQ0FDQSxLQUFBLEdBQU8sSUFEUCxDQUFBOztBQUFBLHFDQUVBLFFBQUEsR0FBVSxLQUZWLENBQUE7O0FBQUEscUNBR0EsTUFBQSxHQUFRLFdBSFIsQ0FBQTs7a0NBQUE7O0tBRG1DLFdBclFyQyxDQUFBOztBQUFBLEVBMlFNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsd0JBQ0EsV0FBQSxHQUFhLE9BRGIsQ0FBQTs7QUFBQSx3QkFFQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxjQUFOO0FBQUEsTUFBc0IsS0FBQSxFQUFPLFlBQTdCO0tBRlAsQ0FBQTs7QUFBQSx3QkFHQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixJQUFJLENBQUMsV0FBTCxDQUFBLEVBRFU7SUFBQSxDQUhaLENBQUE7O3FCQUFBOztLQURzQixnQkEzUXhCLENBQUE7O0FBQUEsRUFrUk07QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSx3QkFDQSxXQUFBLEdBQWEsT0FEYixDQUFBOztBQUFBLHdCQUVBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLGNBQU47QUFBQSxNQUFzQixLQUFBLEVBQU8sY0FBN0I7S0FGUCxDQUFBOztBQUFBLHdCQUdBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUNWLElBQUksQ0FBQyxXQUFMLENBQUEsRUFEVTtJQUFBLENBSFosQ0FBQTs7cUJBQUE7O0tBRHNCLGdCQWxSeEIsQ0FBQTs7QUFBQSxFQTBSTTtBQUNKLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSwrQkFDQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixJQUFJLENBQUMsS0FBTCxDQUFXLEVBQVgsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsR0FBcEIsRUFEVTtJQUFBLENBRFosQ0FBQTs7NEJBQUE7O0tBRDZCLGdCQTFSL0IsQ0FBQTs7QUFBQSxFQStSTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHdCQUNBLFdBQUEsR0FBYSxVQURiLENBQUE7O0FBQUEsd0JBRUEsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sY0FBTjtBQUFBLE1BQXNCLEtBQUEsRUFBTyxTQUE3QjtLQUZQLENBQUE7O0FBQUEsd0JBR0EsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO2FBQ1YsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFYLEVBRFU7SUFBQSxDQUhaLENBQUE7O3FCQUFBOztLQURzQixnQkEvUnhCLENBQUE7O0FBQUEsRUFzU007QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFNBQUMsQ0FBQSxXQUFELEdBQWMseUJBRGQsQ0FBQTs7QUFBQSx3QkFFQSxXQUFBLEdBQWEsY0FGYixDQUFBOztBQUFBLHdCQUdBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLGNBQU47QUFBQSxNQUFzQixLQUFBLEVBQU8sU0FBN0I7S0FIUCxDQUFBOztBQUFBLHdCQUlBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUNWLENBQUMsQ0FBQyxVQUFGLENBQWEsSUFBYixFQURVO0lBQUEsQ0FKWixDQUFBOztxQkFBQTs7S0FEc0IsZ0JBdFN4QixDQUFBOztBQUFBLEVBOFNNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsdUJBQ0EsV0FBQSxHQUFhLGFBRGIsQ0FBQTs7QUFBQSx1QkFFQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxhQUFOO0FBQUEsTUFBcUIsS0FBQSxFQUFPLFFBQTVCO0tBRlAsQ0FBQTs7QUFBQSx1QkFHQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixDQUFDLENBQUMsU0FBRixDQUFZLElBQVosRUFEVTtJQUFBLENBSFosQ0FBQTs7b0JBQUE7O0tBRHFCLGdCQTlTdkIsQ0FBQTs7QUFBQSxFQXFUTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsU0FBQyxDQUFBLFdBQUQsR0FBYyx5QkFEZCxDQUFBOztBQUFBLHdCQUVBLFdBQUEsR0FBYSxTQUZiLENBQUE7O0FBQUEsd0JBR0EsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO2FBQ1YsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLENBQUMsQ0FBQyxTQUFGLENBQVksSUFBWixDQUFwQixFQURVO0lBQUEsQ0FIWixDQUFBOztxQkFBQTs7S0FEc0IsZ0JBclR4QixDQUFBOztBQUFBLEVBNFRNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0Esa0JBQUMsQ0FBQSxXQUFELEdBQWMsbUJBRGQsQ0FBQTs7QUFBQSxpQ0FFQSxXQUFBLEdBQWEsd0JBRmIsQ0FBQTs7QUFBQSxpQ0FHQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsTUFBbUIsS0FBQSxFQUFPLFdBQTFCO0tBSFAsQ0FBQTs7QUFBQSxpQ0FJQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixrQkFBQSxDQUFtQixJQUFuQixFQURVO0lBQUEsQ0FKWixDQUFBOzs4QkFBQTs7S0FEK0IsZ0JBNVRqQyxDQUFBOztBQUFBLEVBb1VNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0Esa0JBQUMsQ0FBQSxXQUFELEdBQWMsMkJBRGQsQ0FBQTs7QUFBQSxpQ0FFQSxXQUFBLEdBQWEseUJBRmIsQ0FBQTs7QUFBQSxpQ0FHQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsTUFBbUIsS0FBQSxFQUFPLFdBQTFCO0tBSFAsQ0FBQTs7QUFBQSxpQ0FJQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7YUFDVixrQkFBQSxDQUFtQixJQUFuQixFQURVO0lBQUEsQ0FKWixDQUFBOzs4QkFBQTs7S0FEK0IsZ0JBcFVqQyxDQUFBOztBQUFBLEVBNFVNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxhQUFDLENBQUEsV0FBRCxHQUFjLHlDQURkLENBQUE7O0FBQUEsNEJBRUEsV0FBQSxHQUFhLGVBRmIsQ0FBQTs7QUFBQSw0QkFHQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO0FBQ2YsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFTLENBQUMsT0FBVixDQUFBLENBQVosRUFBaUMsU0FBakMsQ0FBUCxDQUFBO0FBQUEsTUFDQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQjtBQUFBLFFBQUUsWUFBRCxJQUFDLENBQUEsVUFBRjtPQUEzQixDQURBLENBQUE7QUFFQSxNQUFBLElBQTRCLElBQUMsQ0FBQSxRQUE3QjtlQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsU0FBZCxFQUFBO09BSGU7SUFBQSxDQUhqQixDQUFBOztBQUFBLDRCQVFBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNWLE1BQUEsSUFBRyxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsQ0FBSDtlQUNFLElBREY7T0FBQSxNQUFBO2VBR0UsSUFBSSxDQUFDLE9BQUwsQ0FBYSxxQkFBYixFQUFvQyxTQUFDLENBQUQsRUFBSSxPQUFKLEVBQWEsTUFBYixFQUFxQixRQUFyQixHQUFBO2lCQUNsQyxPQUFBLEdBQVUsTUFBTSxDQUFDLEtBQVAsQ0FBYSxRQUFiLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsR0FBNUIsQ0FBVixHQUE2QyxTQURYO1FBQUEsQ0FBcEMsRUFIRjtPQURVO0lBQUEsQ0FSWixDQUFBOzt5QkFBQTs7S0FEMEIsZ0JBNVU1QixDQUFBOztBQUFBLEVBNlZNO0FBQ0osdURBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0NBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsK0NBQ0EsVUFBQSxHQUFZLElBRFosQ0FBQTs7QUFBQSwrQ0FFQSxPQUFBLEdBQVMsRUFGVCxDQUFBOztBQUFBLCtDQUdBLElBQUEsR0FBTSxFQUhOLENBQUE7O0FBQUEsK0NBSUEsaUJBQUEsR0FBbUIsSUFKbkIsQ0FBQTs7QUFBQSwrQ0FNQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ0gsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxHQUFBO2lCQUNWLEtBQUMsQ0FBQSxPQUFELENBQVMsT0FBVCxFQURVO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixDQUVKLENBQUMsSUFGRyxDQUVFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ0osZ0VBQUEsU0FBQSxFQURJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGRixFQURHO0lBQUEsQ0FOVCxDQUFBOztBQUFBLCtDQVlBLE9BQUEsR0FBUyxTQUFDLE9BQUQsR0FBQTtBQUNQLFVBQUEsa0dBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixHQUFBLENBQUEsR0FBckIsQ0FBQTtBQUFBLE1BQ0EsWUFBQSxHQUFlLElBRGYsQ0FBQTtBQUVBLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxNQUFELENBQVEsUUFBUixDQUFQO0FBQ0UsUUFBQSxJQUFDLENBQUEseUJBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBLENBREEsQ0FERjtPQUZBO0FBQUEsTUFNQSxPQUFBLEdBQVUsUUFBQSxHQUFXLENBTnJCLENBQUE7QUFPQTtBQUFBO1dBQUEsNENBQUE7OEJBQUE7QUFDRSxRQUFBLE9BQUEsRUFBQSxDQUFBO0FBQUEsUUFDQSwrREFBMkMsRUFBM0MsRUFBQyxnQkFBQSxPQUFELEVBQVUsYUFBQSxJQURWLENBQUE7QUFFQSxRQUFBLElBQUcsaUJBQUEsSUFBYSxjQUFoQjt3QkFDSyxDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUMsU0FBRCxHQUFBO0FBQ0Qsa0JBQUEsbUJBQUE7QUFBQSxjQUFBLEtBQUEsR0FBUSxLQUFDLENBQUEsUUFBRCxDQUFVLFNBQVYsQ0FBUixDQUFBO0FBQUEsY0FDQSxNQUFBLEdBQVMsU0FBQyxNQUFELEdBQUE7dUJBQ1AsS0FBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLFNBQXZCLEVBQWtDLE1BQWxDLEVBRE87Y0FBQSxDQURULENBQUE7QUFBQSxjQUdBLElBQUEsR0FBTyxTQUFDLElBQUQsR0FBQTtBQUNMLGdCQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsZ0JBQUEsSUFBYyxPQUFBLEtBQVcsUUFBekI7eUJBQUEsT0FBQSxDQUFBLEVBQUE7aUJBRks7Y0FBQSxDQUhQLENBQUE7QUFBQSxjQU9BLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQjtBQUFBLGdCQUFDLFNBQUEsT0FBRDtBQUFBLGdCQUFVLE1BQUEsSUFBVjtBQUFBLGdCQUFnQixRQUFBLE1BQWhCO0FBQUEsZ0JBQXdCLE1BQUEsSUFBeEI7QUFBQSxnQkFBOEIsT0FBQSxLQUE5QjtlQUFwQixDQVBBLENBQUE7QUFRQSxjQUFBLElBQUEsQ0FBQSxLQUFpQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLENBQWhDO3VCQUFBLEtBQUMsQ0FBQSxZQUFELENBQWMsU0FBZCxFQUFBO2VBVEM7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFILENBQUksU0FBSixHQURGO1NBQUEsTUFBQTtnQ0FBQTtTQUhGO0FBQUE7c0JBUk87SUFBQSxDQVpULENBQUE7O0FBQUEsK0NBbUNBLGtCQUFBLEdBQW9CLFNBQUMsT0FBRCxHQUFBO0FBQ2xCLFVBQUEsc0JBQUE7QUFBQSxNQUFDLFFBQVMsUUFBVCxLQUFELENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBQSxPQUFjLENBQUMsS0FEZixDQUFBO0FBQUEsTUFFQSxlQUFBLEdBQXNCLElBQUEsZUFBQSxDQUFnQixPQUFoQixDQUZ0QixDQUFBO0FBQUEsTUFHQSxlQUFlLENBQUMsZ0JBQWhCLENBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUUvQixjQUFBLDBCQUFBO0FBQUEsVUFGaUMsYUFBQSxPQUFPLGNBQUEsTUFFeEMsQ0FBQTtBQUFBLFVBQUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLFFBQWQsSUFBMkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFkLENBQXNCLE9BQXRCLENBQUEsS0FBa0MsQ0FBaEU7QUFDRSxZQUFBLFdBQUEsR0FBYyxLQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBQSxDQUFkLENBQUE7QUFBQSxZQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksRUFBQSxHQUFHLFdBQUgsR0FBZSw0QkFBZixHQUEyQyxLQUFLLENBQUMsSUFBakQsR0FBc0QsR0FBbEUsQ0FEQSxDQURGO1dBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxlQUFELENBQUEsQ0FIQSxDQUFBO2lCQUlBLE1BQUEsQ0FBQSxFQU4rQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLENBSEEsQ0FBQTtBQVdBLE1BQUEsSUFBRyxLQUFIO0FBQ0UsUUFBQSxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUE5QixDQUFvQyxLQUFwQyxDQUFBLENBQUE7ZUFDQSxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUE5QixDQUFBLEVBRkY7T0Faa0I7SUFBQSxDQW5DcEIsQ0FBQTs7QUFBQSwrQ0FtREEsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLFNBQVAsR0FBQTtBQUNWLFVBQUEsS0FBQTttRUFBd0IsS0FEZDtJQUFBLENBbkRaLENBQUE7O0FBQUEsK0NBdURBLFVBQUEsR0FBWSxTQUFDLFNBQUQsR0FBQTthQUNWO0FBQUEsUUFBRSxTQUFELElBQUMsQ0FBQSxPQUFGO0FBQUEsUUFBWSxNQUFELElBQUMsQ0FBQSxJQUFaO1FBRFU7SUFBQSxDQXZEWixDQUFBOztBQUFBLCtDQTJEQSxRQUFBLEdBQVUsU0FBQyxTQUFELEdBQUE7YUFDUixTQUFTLENBQUMsT0FBVixDQUFBLEVBRFE7SUFBQSxDQTNEVixDQUFBOztBQUFBLCtDQStEQSxTQUFBLEdBQVcsU0FBQyxTQUFELEdBQUE7YUFDVCxJQUFDLENBQUEsaUJBQWlCLENBQUMsR0FBbkIsQ0FBdUIsU0FBdkIsRUFEUztJQUFBLENBL0RYLENBQUE7OzRDQUFBOztLQUQ2QyxnQkE3Vi9DLENBQUE7O0FBQUEsRUFpYU07QUFDSixrREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSwyQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSwyQkFBQyxDQUFBLFdBQUQsR0FBYyxpRUFEZCxDQUFBOztBQUFBLDBDQUVBLFlBQUEsR0FBYyxJQUZkLENBQUE7O0FBQUEsMENBTUEsWUFBQSxHQUFjLENBQ1osV0FEWSxFQUVaLFVBRlksRUFHWixXQUhZLEVBSVosV0FKWSxFQUtaLG9CQUxZLEVBTVosb0JBTlksRUFPWixTQVBZLEVBUVosVUFSWSxFQVNaLGFBVFksRUFVWixpQkFWWSxFQVdaLGlCQVhZLEVBWVosYUFaWSxFQWFaLHNCQWJZLEVBY1osYUFkWSxFQWVaLFdBZlksRUFnQlosV0FoQlksRUFpQlosWUFqQlksQ0FOZCxDQUFBOztBQUFBLDBDQTBCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLFNBQUMsS0FBRCxHQUFBO0FBQ2hCLFlBQUEsV0FBQTtBQUFBLFFBQUEsSUFBZ0MsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxLQUFYLENBQWhDO0FBQUEsVUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFkLENBQVIsQ0FBQTtTQUFBO0FBQ0EsUUFBQSxJQUFvQyxLQUFLLENBQUEsU0FBRSxDQUFBLGNBQVAsQ0FBc0IsYUFBdEIsQ0FBcEM7QUFBQSxVQUFBLFdBQUEsR0FBYyxLQUFLLENBQUEsU0FBRSxDQUFBLFdBQXJCLENBQUE7U0FEQTs7VUFFQSxjQUFlLENBQUMsQ0FBQyxpQkFBRixDQUFvQixDQUFDLENBQUMsU0FBRixDQUFZLEtBQUssQ0FBQyxJQUFsQixDQUFwQjtTQUZmO2VBR0E7QUFBQSxVQUFDLElBQUEsRUFBTSxLQUFQO0FBQUEsVUFBYyxhQUFBLFdBQWQ7VUFKZ0I7TUFBQSxDQUFsQixFQURRO0lBQUEsQ0ExQlYsQ0FBQTs7QUFBQSwwQ0FpQ0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDZCxLQUFDLENBQUEsZUFBRCxDQUFpQjtBQUFBLFlBQUMsS0FBQSxFQUFPLEtBQUMsQ0FBQSxRQUFELENBQUEsQ0FBUjtXQUFqQixFQURjO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEIsQ0FBQSxDQUFBO2FBR0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxzQkFBVixDQUFpQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxXQUFELEdBQUE7QUFDL0IsVUFBQSxLQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBQSxDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBekIsQ0FBNkIsV0FBVyxDQUFDLElBQXpDLEVBQStDO0FBQUEsWUFBQyxNQUFBLEVBQVEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBN0I7V0FBL0MsRUFGK0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQyxFQUpVO0lBQUEsQ0FqQ1osQ0FBQTs7QUFBQSwwQ0F5Q0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUVQLFlBQVUsSUFBQSxLQUFBLENBQU0sRUFBQSxHQUFFLENBQUMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFELENBQUYsR0FBYyx5QkFBcEIsQ0FBVixDQUZPO0lBQUEsQ0F6Q1QsQ0FBQTs7dUNBQUE7O0tBRHdDLFNBamExQyxDQUFBOztBQUFBLEVBK2NNO0FBQ0osZ0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEseUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHdDQUNBLE1BQUEsR0FBUSxXQURSLENBQUE7O3FDQUFBOztLQURzQyw0QkEvY3hDLENBQUE7O0FBQUEsRUFtZE07QUFDSixxREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSw4QkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSw4QkFBQyxDQUFBLFdBQUQsR0FBYywrREFEZCxDQUFBOztBQUFBLDZDQUVBLE1BQUEsR0FBUSxnQkFGUixDQUFBOzswQ0FBQTs7S0FEMkMsNEJBbmQ3QyxDQUFBOztBQUFBLEVBeWRNO0FBQ0osMENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsbUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsbUJBQUMsQ0FBQSxXQUFELEdBQWMsOENBRGQsQ0FBQTs7QUFBQSxrQ0FFQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSx5QkFBTjtBQUFBLE1BQWlDLEtBQUEsRUFBTyxVQUF4QztLQUZQLENBQUE7O0FBQUEsa0NBR0EsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO2FBQ1YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBQSxFQURVO0lBQUEsQ0FIWixDQUFBOzsrQkFBQTs7S0FEZ0MsZ0JBemRsQyxDQUFBOztBQUFBLEVBaWVNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZ0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsZ0JBQUMsQ0FBQSxXQUFELEdBQWMsaUNBRGQsQ0FBQTs7QUFBQSwrQkFFQSxVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sU0FBUCxHQUFBO0FBQ1YsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBbkIsQ0FBQSxDQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixJQUFuQixFQUF5QixTQUF6QixDQURBLENBQUE7YUFFQSxRQUhVO0lBQUEsQ0FGWixDQUFBOzs0QkFBQTs7S0FENkIsZ0JBamUvQixDQUFBOztBQUFBLEVBMGVNO0FBQ0osNkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsTUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEscUJBQ0EsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sVUFBTjtBQUFBLE1BQWtCLEtBQUEsRUFBTyxlQUF6QjtLQURQLENBQUE7O0FBQUEscUJBRUEsY0FBQSxHQUFnQixLQUZoQixDQUFBOztBQUFBLHFCQUdBLGNBQUEsR0FBZ0Isb0JBSGhCLENBQUE7O0FBQUEscUJBS0EsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLE1BQUEsU0FBVSxDQUFBLElBQUMsQ0FBQSxjQUFELENBQVYsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsU0FBZCxDQURBLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsUUFBRCxDQUFBLENBQVA7ZUFDRSxTQUFTLENBQUMsTUFBTSxDQUFDLDBCQUFqQixDQUFBLEVBREY7T0FIZTtJQUFBLENBTGpCLENBQUE7O2tCQUFBOztLQURtQixnQkExZXJCLENBQUE7O0FBQUEsRUFzZk07QUFDSiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxPQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxzQkFDQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsTUFBbUIsS0FBQSxFQUFPLGNBQTFCO0tBRFAsQ0FBQTs7QUFBQSxzQkFFQSxjQUFBLEdBQWdCLHFCQUZoQixDQUFBOzttQkFBQTs7S0FEb0IsT0F0ZnRCLENBQUE7O0FBQUEsRUEyZk07QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSx5QkFDQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxlQUFOO0FBQUEsTUFBdUIsS0FBQSxFQUFPLGNBQTlCO0tBRFAsQ0FBQTs7QUFBQSx5QkFFQSxjQUFBLEdBQWdCLHdCQUZoQixDQUFBOztzQkFBQTs7S0FEdUIsT0EzZnpCLENBQUE7O0FBQUEsRUFpZ0JNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLGlDQUNBLEtBQUEsR0FBTztBQUFBLE1BQUEsSUFBQSxFQUFNLHdCQUFOO0FBQUEsTUFBZ0MsS0FBQSxFQUFPLFFBQXZDO0tBRFAsQ0FBQTs7QUFBQSxpQ0FFQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO0FBQ2YsTUFBQSxTQUFTLENBQUMsa0JBQVYsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFNBQWQsRUFGZTtJQUFBLENBRmpCLENBQUE7OzhCQUFBOztLQUQrQixnQkFqZ0JqQyxDQUFBOztBQUFBLEVBeWdCTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsUUFBQyxDQUFBLFdBQUQsR0FBYyw0REFEZCxDQUFBOztBQUFBLHVCQUVBLFdBQUEsR0FBYSxhQUZiLENBQUE7O0FBQUEsdUJBR0EsS0FBQSxHQUFPLENBQ0wsQ0FBQyxHQUFELEVBQU0sR0FBTixDQURLLEVBRUwsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUZLLEVBR0wsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUhLLEVBSUwsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUpLLENBSFAsQ0FBQTs7QUFBQSx1QkFTQSxLQUFBLEdBQU8sSUFUUCxDQUFBOztBQUFBLHVCQVVBLFFBQUEsR0FBVSxDQVZWLENBQUE7O0FBQUEsdUJBV0EsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sWUFBTjtBQUFBLE1BQW9CLEtBQUEsRUFBTywyQkFBM0I7S0FYUCxDQUFBOztBQUFBLHVCQVlBLFlBQUEsR0FBYyxJQVpkLENBQUE7O0FBQUEsdUJBYUEsVUFBQSxHQUFZLEtBYlosQ0FBQTs7QUFBQSx1QkFlQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLFlBQWY7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGlCQUFELENBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtpQkFBVyxLQUFDLENBQUEsU0FBRCxDQUFXLEtBQVgsRUFBWDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGdCQUFELENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtpQkFBVyxLQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYsRUFBWDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGdCQUFELENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FIQSxDQUFBO0FBSUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFKO2VBQ0UsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQ2QsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBaEIsQ0FBc0I7QUFBQSxjQUFFLFVBQUQsS0FBQyxDQUFBLFFBQUY7YUFBdEIsRUFEYztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLEVBREY7T0FBQSxNQUFBO2VBSUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBaEIsQ0FBc0I7QUFBQSxVQUFFLFVBQUQsSUFBQyxDQUFBLFFBQUY7U0FBdEIsRUFKRjtPQUxVO0lBQUEsQ0FmWixDQUFBOztBQUFBLHVCQTBCQSxTQUFBLEdBQVcsU0FBRSxLQUFGLEdBQUE7QUFDVCxNQURVLElBQUMsQ0FBQSxRQUFBLEtBQ1gsQ0FBQTthQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBRFM7SUFBQSxDQTFCWCxDQUFBOztBQUFBLHVCQTZCQSxPQUFBLEdBQVMsU0FBQyxLQUFELEdBQUE7QUFDUCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxLQUFWLEVBQWlCLFNBQUMsSUFBRCxHQUFBO2VBQVUsZUFBUyxJQUFULEVBQUEsS0FBQSxPQUFWO01BQUEsQ0FBakIsQ0FBUCxDQUFBOzRCQUNBLE9BQUEsT0FBUSxDQUFDLEtBQUQsRUFBUSxLQUFSLEVBRkQ7SUFBQSxDQTdCVCxDQUFBOztBQUFBLHVCQWlDQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sSUFBUCxHQUFBO0FBQ1IsVUFBQSw4REFBQTtBQUFBLE1BQUMsY0FBRCxFQUFPLGVBQVAsQ0FBQTtBQUNBLE1BQUEsSUFBRyxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixJQUF0QixDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQWQsQ0FBQTtBQUFBLFFBQ0EsSUFBQSxJQUFRLElBRFIsQ0FBQTtBQUFBLFFBRUEsS0FBQSxJQUFTLElBRlQsQ0FERjtPQURBO0FBQUEsTUFNQSxxQkFBQSxHQUF3QixrQkFOeEIsQ0FBQTtBQUFBLE1BT0EsbUJBQUEsR0FBc0IsU0FBQyxJQUFELEdBQUE7ZUFDcEIscUJBQXFCLENBQUMsSUFBdEIsQ0FBMkIsSUFBM0IsRUFEb0I7TUFBQSxDQVB0QixDQUFBO0FBVUEsTUFBQSxJQUFHLFNBQUEsSUFBQyxDQUFBLEtBQUQsRUFBQSxlQUFVLFFBQVEsQ0FBQyxHQUFULENBQWEsZ0NBQWIsQ0FBVixFQUFBLEtBQUEsTUFBQSxDQUFBLElBQTZELENBQUEsbUJBQUksQ0FBb0IsSUFBcEIsQ0FBcEU7ZUFDRSxJQUFBLEdBQU8sR0FBUCxHQUFhLElBQWIsR0FBb0IsR0FBcEIsR0FBMEIsTUFENUI7T0FBQSxNQUFBO2VBR0UsSUFBQSxHQUFPLElBQVAsR0FBYyxNQUhoQjtPQVhRO0lBQUEsQ0FqQ1YsQ0FBQTs7QUFBQSx1QkFpREEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO2FBQ1YsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBQWdCLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBQyxDQUFBLEtBQVYsQ0FBaEIsRUFEVTtJQUFBLENBakRaLENBQUE7O29CQUFBOztLQURxQixnQkF6Z0J2QixDQUFBOztBQUFBLEVBOGpCTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsWUFBQyxDQUFBLFdBQUQsR0FBYyxtQkFEZCxDQUFBOztBQUFBLDJCQUVBLE1BQUEsR0FBUSxXQUZSLENBQUE7O3dCQUFBOztLQUR5QixTQTlqQjNCLENBQUE7O0FBQUEsRUFta0JNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWMseUJBRGQsQ0FBQTs7QUFBQSxnQ0FFQSxNQUFBLEdBQVEsZ0JBRlIsQ0FBQTs7NkJBQUE7O0tBRDhCLFNBbmtCaEMsQ0FBQTs7QUFBQSxFQXdrQk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFdBQUMsQ0FBQSxXQUFELEdBQWMsMkNBRGQsQ0FBQTs7QUFBQSwwQkFFQSxTQUFBLEdBQVcsTUFGWCxDQUFBOztBQUFBLDBCQUlBLGVBQUEsR0FBaUIsU0FBQyxTQUFELEdBQUE7QUFDZixVQUFBLFNBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxTQUFTLENBQUMsY0FBVixDQUFBLENBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixJQUFDLENBQUEsU0FBM0IsRUFBc0MsU0FBdEMsRUFBaUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQy9DLGNBQUEsa0JBQUE7QUFBQSxVQURpRCxpQkFBQSxXQUFXLGVBQUEsT0FDNUQsQ0FBQTtpQkFBQSxPQUFBLENBQVEsS0FBQyxDQUFBLFVBQUQsQ0FBWSxTQUFaLENBQVIsRUFEK0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqRCxDQURBLENBQUE7QUFHQSxNQUFBLElBQTRCLElBQUMsQ0FBQSxRQUE3QjtlQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsU0FBZCxFQUFBO09BSmU7SUFBQSxDQUpqQixDQUFBOzt1QkFBQTs7S0FEd0IsU0F4a0IxQixDQUFBOztBQUFBLEVBbWxCTTtBQUNKLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsY0FBQyxDQUFBLFdBQUQsR0FBYyx5REFEZCxDQUFBOztBQUFBLDZCQUVBLFNBQUEsR0FBVyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixDQUFrQixDQUFDLElBQW5CLENBQXdCLEVBQXhCLENBRlgsQ0FBQTs7QUFBQSw2QkFHQSxhQUFBLEdBQWUsS0FIZixDQUFBOztBQUFBLDZCQUtBLFNBQUEsR0FBVyxTQUFFLEtBQUYsR0FBQTtBQUVULFVBQUEsS0FBQTtBQUFBLE1BRlUsSUFBQyxDQUFBLFFBQUEsS0FFWCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxLQUFBLENBQUQsQ0FBSyxNQUFMLEVBQ1Q7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsT0FBRCxDQUFTLElBQUMsQ0FBQSxLQUFWLENBQU47QUFBQSxRQUNBLEtBQUEsRUFBTyxLQURQO0FBQUEsUUFFQSxhQUFBLEVBQWUsU0FBQyxJQUFDLENBQUEsS0FBRCxFQUFBLGVBQVUsSUFBQyxDQUFBLFNBQVgsRUFBQSxLQUFBLE1BQUQsQ0FGZjtPQURTLENBQVgsQ0FBQSxDQUFBO2FBSUEsSUFBQyxDQUFBLGdCQUFELENBQUEsRUFOUztJQUFBLENBTFgsQ0FBQTs7QUFBQSw2QkFhQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixVQUFBLFlBQUE7QUFBQSxNQUFBLFlBQUEsR0FBZSxTQUFDLElBQUQsR0FBQTtlQUNiLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxDQUFxQixDQUFDLE1BQXRCLEtBQWdDLEVBRG5CO01BQUEsQ0FBZixDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sSUFBSyxhQUZaLENBQUE7QUFHQSxNQUFBLElBQUcsWUFBQSxDQUFhLElBQWIsQ0FBSDtlQUNFLElBQUksQ0FBQyxJQUFMLENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxLQUhGO09BSlU7SUFBQSxDQWJaLENBQUE7OzBCQUFBOztLQUQyQixTQW5sQjdCLENBQUE7O0FBQUEsRUEwbUJNO0FBQ0osNENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEscUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EscUJBQUMsQ0FBQSxXQUFELEdBQWMsZ0ZBRGQsQ0FBQTs7QUFBQSxvQ0FFQSxZQUFBLEdBQWMsS0FGZCxDQUFBOztBQUFBLG9DQUdBLE1BQUEsR0FBUSxVQUhSLENBQUE7O2lDQUFBOztLQURrQyxlQTFtQnBDLENBQUE7O0FBQUEsRUFnbkJNO0FBQ0osMkRBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsb0NBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0Esb0NBQUMsQ0FBQSxXQUFELEdBQWMscUhBRGQsQ0FBQTs7QUFBQSxtREFFQSxNQUFBLEdBQVEseUJBRlIsQ0FBQTs7Z0RBQUE7O0tBRGlELHNCQWhuQm5ELENBQUE7O0FBQUEsRUFxbkJNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxjQUFDLENBQUEsV0FBRCxHQUFjLCtEQURkLENBQUE7O0FBQUEsNkJBRUEsUUFBQSxHQUFVLENBRlYsQ0FBQTs7QUFBQSw2QkFHQSxJQUFBLEdBQU0sSUFITixDQUFBOztBQUFBLDZCQUtBLFNBQUEsR0FBVyxTQUFDLEtBQUQsR0FBQTtBQUNULFVBQUEsV0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLEtBQUE7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsUUFBZ0IsS0FBSyxDQUFDLEtBQU4sQ0FBWSxFQUFaLENBQWhCLEVBQUMsZUFBRCxFQUFPLElBQUMsQ0FBQSxlQURSLENBQUE7YUFFQSw4Q0FBTSxJQUFOLEVBSFM7SUFBQSxDQUxYLENBQUE7O0FBQUEsNkJBVUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSxrQkFBQTtBQUFBLE1BQUEsUUFBZ0IsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFDLENBQUEsSUFBVixDQUFoQixFQUFDLGVBQUQsRUFBTyxnQkFBUCxDQUFBO2FBQ0EsSUFBQSxHQUFPLElBQUssYUFBWixHQUFzQixNQUZaO0lBQUEsQ0FWWixDQUFBOzswQkFBQTs7S0FEMkIsZUFybkI3QixDQUFBOztBQUFBLEVBb29CTTtBQUNKLDRDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHFCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLHFCQUFDLENBQUEsV0FBRCxHQUFjLHVEQURkLENBQUE7O0FBQUEsb0NBRUEsUUFBQSxHQUFVLENBRlYsQ0FBQTs7QUFBQSxvQ0FHQSxNQUFBLEdBQVEsVUFIUixDQUFBOztBQUFBLG9DQUtBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxjQUFELENBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZCxVQUFBLEtBQUMsQ0FBQSx5QkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUEsQ0FEQSxDQUFBO0FBRUEsVUFBQSxJQUFBLENBQUEsaUJBQU8sQ0FBa0IsS0FBQyxDQUFBLE1BQW5CLENBQVA7QUFDRSxZQUFBLEtBQUMsQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQWhCLENBQUEsQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsS0FBRCxDQUFBLENBREEsQ0FERjtXQUZBO2lCQUtBLEtBQUMsQ0FBQSxRQUFELENBQVUsS0FBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUEsQ0FBMEIsQ0FBQSxDQUFBLENBQXBDLEVBTmM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQixDQUFBLENBQUE7YUFPQSx1REFBQSxTQUFBLEVBUlU7SUFBQSxDQUxaLENBQUE7O0FBQUEsb0NBZUEsU0FBQSxHQUFXLFNBQUUsSUFBRixHQUFBO0FBRVQsVUFBQSwwQkFBQTtBQUFBLE1BRlUsSUFBQyxDQUFBLE9BQUEsSUFFWCxDQUFBO0FBQUE7QUFBQSxXQUFBLDRDQUFBOzhCQUFBO0FBQUEsUUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLFNBQWQsQ0FBQSxDQUFBO0FBQUEsT0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsSUFEVixDQUFBO2FBRUEsSUFBQyxDQUFBLGdCQUFELENBQUEsRUFKUztJQUFBLENBZlgsQ0FBQTs7aUNBQUE7O0tBRGtDLGVBcG9CcEMsQ0FBQTs7QUFBQSxFQTBwQk07QUFDSiwyREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxvQ0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxvQ0FBQyxDQUFBLFdBQUQsR0FBYyx5RkFEZCxDQUFBOztBQUFBLG1EQUVBLE1BQUEsR0FBUSx5QkFGUixDQUFBOztnREFBQTs7S0FEaUQsc0JBMXBCbkQsQ0FBQTs7QUFBQSxFQWdxQk07QUFDSiwyQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxtQkFDQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsTUFBZ0IsS0FBQSxFQUFPLGFBQXZCO0tBRFAsQ0FBQTs7QUFBQSxtQkFFQSxXQUFBLEdBQWEsSUFGYixDQUFBOztBQUFBLG1CQUdBLGNBQUEsR0FBZ0IsSUFIaEIsQ0FBQTs7QUFBQSxtQkFLQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsNkJBQUQsQ0FBK0IsU0FBL0IsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxTQUFkLEVBRmU7SUFBQSxDQUxqQixDQUFBOztnQkFBQTs7S0FEaUIsU0FocUJuQixDQUFBOztBQUFBLEVBMHFCTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHVCQUNBLE1BQUEsR0FBUSxvQkFEUixDQUFBOztvQkFBQTs7S0FEcUIsS0ExcUJ2QixDQUFBOztBQUFBLEVBOHFCTTtBQUNKLGdEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHlCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSx3Q0FDQSxNQUFBLEdBQVEsMkJBRFIsQ0FBQTs7cUNBQUE7O0tBRHNDLEtBOXFCeEMsQ0FBQTs7QUFBQSxFQXNyQk07QUFDSiwyQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxtQkFDQSxNQUFBLEdBQVEsb0JBRFIsQ0FBQTs7QUFBQSxtQkFFQSxXQUFBLEdBQWEsS0FGYixDQUFBOztBQUFBLG1CQUlBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxNQUFIO0lBQUEsQ0FKVixDQUFBOztBQUFBLG1CQU1BLGVBQUEsR0FBaUIsU0FBQyxTQUFELEdBQUE7QUFDZixVQUFBLFVBQUE7QUFBQSxNQUFBLElBQUcsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxVQUFqQixDQUFBLENBQUg7QUFDRSxRQUFBLEtBQUEsR0FBUSxTQUFTLENBQUMsY0FBVixDQUFBLENBQVIsQ0FBQTtBQUFBLFFBQ0EsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFoQixFQUF3QixDQUFDLENBQUEsQ0FBRCxFQUFLLFFBQUwsQ0FBeEIsQ0FBekIsQ0FEQSxDQURGO09BQUE7QUFBQSxNQUdBLFNBQVMsQ0FBQyxTQUFWLENBQUEsQ0FIQSxDQUFBO0FBQUEsTUFJQSxHQUFBLEdBQU0sU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUEwQixDQUFDLEdBSmpDLENBQUE7YUFLQSxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFtQyxHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUEsQ0FBSixDQUFkLENBQW5DLEVBTmU7SUFBQSxDQU5qQixDQUFBOztnQkFBQTs7S0FEaUIsZ0JBdHJCbkIsQ0FBQTs7QUFBQSxFQXFzQk07QUFDSiwyQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxvQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsbUNBQ0EsS0FBQSxHQUFPLEVBRFAsQ0FBQTs7QUFBQSxtQ0FFQSxhQUFBLEdBQWUsS0FGZixDQUFBOztBQUFBLG1DQUdBLElBQUEsR0FBTSxLQUhOLENBQUE7O0FBQUEsbUNBSUEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLEtBQUEsQ0FBRCxDQUFLLCtCQUFMLEVBQXNDO0FBQUEsUUFBQyxHQUFBLEVBQUssQ0FBTjtPQUF0QyxDQUFYLEVBRFU7SUFBQSxDQUpaLENBQUE7O0FBQUEsbUNBT0EsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLFVBQUEsd0NBQUE7QUFBQSxNQUFBLFFBQXFCLFNBQVMsQ0FBQyxpQkFBVixDQUFBLENBQXJCLEVBQUMsbUJBQUQsRUFBVyxpQkFBWCxDQUFBO0FBQUEsTUFDQSxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLGNBQWpCLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFBOztBQUFPO2FBQVcsNkdBQVgsR0FBQTtBQUNMLFVBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsR0FBN0IsQ0FBUCxDQUFBO0FBQ0EsVUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFELElBQVUsR0FBQSxLQUFTLFFBQXRCOzBCQUNFLElBQUksQ0FBQyxRQUFMLENBQUEsR0FERjtXQUFBLE1BQUE7MEJBR0UsTUFIRjtXQUZLO0FBQUE7O21CQUZQLENBQUE7YUFRQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFDLENBQUEsSUFBRCxDQUFNLElBQU4sQ0FBQSxHQUFjLElBQW5DLEVBVGU7SUFBQSxDQVBqQixDQUFBOztBQUFBLG1DQWtCQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7YUFDSixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxLQUFYLEVBREk7SUFBQSxDQWxCTixDQUFBOztnQ0FBQTs7S0FEaUMsZ0JBcnNCbkMsQ0FBQTs7QUFBQSxFQTJ0Qk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLFdBQUMsQ0FBQSxXQUFELEdBQWMsMkVBRGQsQ0FBQTs7QUFBQSwwQkFFQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsTUFBZ0IsS0FBQSxFQUFPLFVBQXZCO0tBRlAsQ0FBQTs7QUFBQSwwQkFHQSxZQUFBLEdBQWMsSUFIZCxDQUFBOztBQUFBLDBCQUlBLEtBQUEsR0FBTyxJQUpQLENBQUE7O0FBQUEsMEJBS0EsSUFBQSxHQUFNLElBTE4sQ0FBQTs7QUFBQSwwQkFNQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSw2Q0FBQSxTQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFELENBQVk7QUFBQSxRQUFBLFFBQUEsRUFBVSxFQUFWO09BQVosRUFGVTtJQUFBLENBTlosQ0FBQTs7QUFBQSwwQkFVQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7YUFDSixJQUFJLENBQUMsSUFBTCxDQUFXLEdBQUEsR0FBRyxJQUFDLENBQUEsS0FBSixHQUFVLEdBQXJCLEVBREk7SUFBQSxDQVZOLENBQUE7O3VCQUFBOztLQUR3QixxQkEzdEIxQixDQUFBOztBQUFBLEVBeXVCTTtBQUNKLGtEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLDJCQUFDLENBQUEsV0FBRCxHQUFjLG9EQUFkLENBQUE7O0FBQUEsSUFDQSwyQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQURBLENBQUE7O0FBQUEsMENBRUEsSUFBQSxHQUFNLEtBRk4sQ0FBQTs7QUFBQSwwQ0FHQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7YUFDSixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxLQUFYLEVBREk7SUFBQSxDQUhOLENBQUE7O3VDQUFBOztLQUR3QyxZQXp1QjFDLENBQUE7O0FBQUEsRUFrdkJNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxXQUFDLENBQUEsV0FBRCxHQUFjLDBFQURkLENBQUE7O0FBQUEsMEJBRUEsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sZ0JBQU47QUFBQSxNQUF3QixLQUFBLEVBQU8sU0FBL0I7S0FGUCxDQUFBOztBQUFBLDBCQUdBLFlBQUEsR0FBYyxJQUhkLENBQUE7O0FBQUEsMEJBSUEsS0FBQSxHQUFPLElBSlAsQ0FBQTs7QUFBQSwwQkFNQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLE1BQUQsQ0FBUSxRQUFSLENBQVA7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLEtBQUEsQ0FBRCxDQUFLLG9CQUFMLEVBQTJCO0FBQUEsVUFBQyxHQUFBLEVBQUssQ0FBTjtTQUEzQixDQUFYLENBQUEsQ0FERjtPQUFBO2FBRUEsSUFBQyxDQUFBLFVBQUQsQ0FBWTtBQUFBLFFBQUEsUUFBQSxFQUFVLEVBQVY7T0FBWixFQUhVO0lBQUEsQ0FOWixDQUFBOztBQUFBLDBCQVdBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNWLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBa0IsSUFBQyxDQUFBLEtBQUQsS0FBVSxFQUE1QjtBQUFBLFFBQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQUFULENBQUE7T0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLE1BQUEsQ0FBQSxFQUFBLEdBQUksQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLElBQUMsQ0FBQSxLQUFoQixDQUFELENBQUosRUFBK0IsR0FBL0IsQ0FEUixDQUFBO2FBRUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsRUFIVTtJQUFBLENBWFosQ0FBQTs7dUJBQUE7O0tBRHdCLGdCQWx2QjFCLENBQUE7O0FBQUEsRUFtd0JNO0FBQ0osOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsT0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxPQUFDLENBQUEsV0FBRCxHQUFjLGdEQURkLENBQUE7O0FBQUEsc0JBRUEsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLFVBQUEsb0JBQUE7QUFBQSxNQUFBLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsY0FBakIsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLFdBQUEsR0FBYyxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLHFCQUFqQixDQUFBLENBRGQsQ0FBQTtBQUFBLE1BRUEsT0FBQSxHQUFVLFdBQVcsQ0FBQyxPQUFaLENBQUEsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixJQUEzQixDQUFBLEdBQW1DLElBRjdDLENBQUE7QUFBQSxNQUdBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLE9BQXJCLENBSEEsQ0FBQTthQUlBLElBQUMsQ0FBQSxZQUFELENBQWMsU0FBZCxFQUxlO0lBQUEsQ0FGakIsQ0FBQTs7bUJBQUE7O0tBRG9CLGdCQW53QnRCLENBQUE7O0FBQUEsRUE4d0JNO0FBQ0osNkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsTUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEscUJBQ0EsYUFBQSxHQUFlLEtBRGYsQ0FBQTs7QUFBQSxxQkFFQSxVQUFBLEdBQVksS0FGWixDQUFBOztBQUFBLHFCQUlBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDZixLQUFDLENBQUEsVUFBRCxDQUFZLFNBQUEsR0FBQTtBQUNWLGdCQUFBLFNBQUE7QUFBQSxZQUFBLElBQUcsU0FBQSxHQUFZLEtBQUMsQ0FBQSxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQXpCLENBQUEsQ0FBZjtBQUNFLGNBQUEsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFBLENBQUE7cUJBQ0EsU0FBUyxDQUFDLE9BQVYsQ0FBQSxFQUZGO2FBRFU7VUFBQSxDQUFaLEVBRGU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixFQURPO0lBQUEsQ0FKVCxDQUFBOztrQkFBQTs7S0FEbUIsU0E5d0JyQixDQUFBOztBQUFBLEVBOHhCTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHVCQUNBLGFBQUEsR0FBZSxLQURmLENBQUE7O0FBQUEsdUJBRUEsSUFBQSxHQUFNLENBRk4sQ0FBQTs7QUFBQSx1QkFJQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxrQkFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLE1BQUEsQ0FBQSxFQUFBLEdBQUksQ0FBQyxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBRCxDQUFKLEVBQW9DLEdBQXBDLENBQVYsQ0FBQTtBQUFBLE1BRUEsU0FBQSxHQUFZLEVBRlosQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZixjQUFBLG9EQUFBO0FBQUE7QUFBQTtlQUFBLDRDQUFBOytCQUFBO0FBQ0UsWUFBQSxTQUFBLEdBQWUsS0FBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLENBQUgsR0FDVixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWpCLENBQUEsQ0FEVSxHQUdWLE1BQU0sQ0FBQyx5QkFBUCxDQUFBLENBSEYsQ0FBQTtBQUFBLFlBSUEsTUFBQSxHQUFTLEtBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLEVBQXdCLFNBQXhCLEVBQW1DLE9BQW5DLENBSlQsQ0FBQTtBQUtBLFlBQUEsSUFBRyxDQUFBLEtBQUssQ0FBQSxNQUFELENBQVEsUUFBUixDQUFKLElBQTBCLE1BQU0sQ0FBQyxNQUFwQztBQUNFLGNBQUEsTUFBTSxDQUFDLGlCQUFQLENBQXlCLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxHQUFHLENBQUMsU0FBZCxDQUF3QixDQUFDLENBQUQsRUFBSSxDQUFBLENBQUosQ0FBeEIsQ0FBekIsQ0FBQSxDQURGO2FBTEE7QUFBQSwwQkFPQSxTQUFTLENBQUMsSUFBVixDQUFlLE1BQWYsRUFQQSxDQURGO0FBQUE7MEJBRGU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQUhBLENBQUE7QUFjQSxNQUFBLElBQUcsQ0FBQyxTQUFBLEdBQVksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxTQUFWLENBQWIsQ0FBa0MsQ0FBQyxNQUF0QztBQUNFLFFBQUEsSUFBcUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFyQjtpQkFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLFNBQVAsRUFBQTtTQURGO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxJQUFMLENBQUEsRUFIRjtPQWZPO0lBQUEsQ0FKVCxDQUFBOztBQUFBLHVCQXdCQSxjQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsT0FBcEIsR0FBQTtBQUNkLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixPQUExQixFQUFtQyxTQUFuQyxFQUE4QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDNUMsY0FBQSx3Q0FBQTtBQUFBLFVBRDhDLGlCQUFBLFdBQVcsYUFBQSxPQUFPLFlBQUEsTUFBTSxlQUFBLE9BQ3RFLENBQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxNQUFBLENBQU8sUUFBQSxDQUFTLFNBQVQsRUFBb0IsRUFBcEIsQ0FBQSxHQUEwQixLQUFDLENBQUEsSUFBRCxHQUFRLEtBQUMsQ0FBQSxRQUFELENBQUEsQ0FBekMsQ0FBVixDQUFBO0FBQ0EsVUFBQSxJQUFHLEtBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixDQUFIO21CQUNFLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBQSxDQUFRLE9BQVIsQ0FBZixFQURGO1dBQUEsTUFBQTtBQUdFLFlBQUEsSUFBQSxDQUFBLEtBQW1CLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBeEIsQ0FBZDtBQUFBLG9CQUFBLENBQUE7YUFBQTtBQUFBLFlBQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxPQUFBLENBQVEsT0FBUixDQUFmLENBREEsQ0FBQTttQkFFQSxJQUFBLENBQUEsRUFMRjtXQUY0QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDLENBREEsQ0FBQTthQVNBLFVBVmM7SUFBQSxDQXhCaEIsQ0FBQTs7b0JBQUE7O0tBRHFCLFNBOXhCdkIsQ0FBQTs7QUFBQSxFQW0wQk07QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSx1QkFDQSxJQUFBLEdBQU0sQ0FBQSxDQUROLENBQUE7O29CQUFBOztLQURxQixTQW4wQnZCLENBQUE7O0FBQUEsRUF3MEJNO0FBQ0osc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsOEJBQ0EsV0FBQSxHQUFhLGNBRGIsQ0FBQTs7QUFBQSw4QkFFQSxJQUFBLEdBQU0sQ0FGTixDQUFBOztBQUFBLDhCQUdBLFVBQUEsR0FBWSxJQUhaLENBQUE7O0FBQUEsOEJBS0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsOENBQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxNQUFBLENBQUEsRUFBQSxHQUFJLENBQUMsUUFBUSxDQUFDLEdBQVQsQ0FBYSxhQUFiLENBQUQsQ0FBSixFQUFvQyxHQUFwQyxDQUFWLENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBWSxJQURaLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNmLGNBQUEsU0FBQTtpQkFBQSxTQUFBOztBQUFZO0FBQUE7aUJBQUEsNENBQUE7b0NBQUE7QUFDViw0QkFBQSxJQUFDLENBQUEsYUFBRCxDQUFlLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBZixFQUEyQyxPQUEzQyxFQUFBLENBRFU7QUFBQTs7eUJBREc7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQUhBLENBQUE7QUFNQSxNQUFBLElBQUcsQ0FBQyxTQUFBLEdBQVksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxTQUFWLENBQWIsQ0FBa0MsQ0FBQyxNQUF0QztBQUNFLFFBQUEsSUFBcUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFyQjtBQUFBLFVBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLENBQUEsQ0FBQTtTQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFBLENBSEY7T0FOQTtBQVVBO0FBQUEsV0FBQSw0Q0FBQTs4QkFBQTtBQUNFLFFBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBakIsQ0FBbUMsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUEwQixDQUFDLEtBQTlELENBQUEsQ0FERjtBQUFBLE9BVkE7YUFZQSxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsRUFiTztJQUFBLENBTFQsQ0FBQTs7QUFBQSw4QkFvQkEsYUFBQSxHQUFlLFNBQUMsU0FBRCxFQUFZLE9BQVosR0FBQTtBQUNiLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixPQUExQixFQUFtQyxTQUFuQyxFQUE4QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDNUMsY0FBQSxrQkFBQTtBQUFBLFVBRDhDLGlCQUFBLFdBQVcsZUFBQSxPQUN6RCxDQUFBO2lCQUFBLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBQSxDQUFRLEtBQUMsQ0FBQSxVQUFELENBQVksU0FBWixDQUFSLENBQWYsRUFENEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QyxDQURBLENBQUE7YUFHQSxVQUphO0lBQUEsQ0FwQmYsQ0FBQTs7QUFBQSw4QkEwQkEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsVUFBRCxHQUFpQix1QkFBSCxHQUNaLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsUUFBRCxDQUFBLENBRFYsR0FHWixRQUFBLENBQVMsSUFBVCxFQUFlLEVBQWYsQ0FIRixDQUFBO2FBSUEsTUFBQSxDQUFPLElBQUMsQ0FBQSxVQUFSLEVBTFU7SUFBQSxDQTFCWixDQUFBOzsyQkFBQTs7S0FENEIsU0F4MEI5QixDQUFBOztBQUFBLEVBMDJCTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDhCQUNBLFdBQUEsR0FBYSxjQURiLENBQUE7O0FBQUEsOEJBRUEsSUFBQSxHQUFNLENBQUEsQ0FGTixDQUFBOzsyQkFBQTs7S0FENEIsZ0JBMTJCOUIsQ0FBQTs7QUFBQSxFQWkzQk07QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSx3QkFDQSxhQUFBLEdBQWUsS0FEZixDQUFBOztBQUFBLHdCQUVBLFFBQUEsR0FBVSxRQUZWLENBQUE7O0FBQUEsd0JBSUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsT0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZixjQUFBLHlFQUFBO0FBQUE7QUFBQTtlQUFBLDRDQUFBO2tDQUFBO0FBQ0UsWUFBQyxTQUFVLFVBQVYsTUFBRCxDQUFBO0FBQUEsWUFFQSxRQUFlLEtBQUMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLElBQXZCLEVBQTZCLFNBQTdCLENBQWYsRUFBQyxhQUFBLElBQUQsRUFBTyxhQUFBLElBRlAsQ0FBQTtBQUdBLFlBQUEsSUFBQSxDQUFBLElBQUE7QUFBQSxvQkFBQTthQUhBO0FBQUEsWUFJQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLGNBQUYsQ0FBaUIsSUFBakIsRUFBdUIsS0FBQyxDQUFBLFFBQUQsQ0FBQSxDQUF2QixDQUpQLENBQUE7QUFBQSxZQUtBLFFBQUEsR0FBVyxLQUFDLENBQUEsS0FBRCxDQUFPLFNBQVAsRUFBa0IsSUFBbEIsRUFDVDtBQUFBLGNBQUEsUUFBQSxFQUFVLENBQUMsSUFBQSxLQUFRLFVBQVQsQ0FBQSxJQUF3QixLQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFBa0IsVUFBbEIsQ0FBbEM7QUFBQSxjQUNBLE1BQUEsRUFBUSxLQUFDLENBQUEsZ0JBRFQ7YUFEUyxDQUxYLENBQUE7QUFBQSxZQVFBLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixRQUFsQixDQVJBLENBQUE7QUFTQSxZQUFBLElBQW9CLEtBQUMsQ0FBQSxTQUFELENBQUEsQ0FBcEI7NEJBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxRQUFQLEdBQUE7YUFBQSxNQUFBO29DQUFBO2FBVkY7QUFBQTswQkFEZTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLENBQUEsQ0FBQTtBQWFBLE1BQUEsSUFBRyxJQUFDLENBQUEsZ0JBQUo7QUFDRSxRQUFBLE9BQUEsR0FBVSxLQUFLLENBQUMsdUJBQU4sQ0FBOEIsSUFBQyxDQUFBLE1BQS9CLENBQVYsQ0FBQTtBQUNBLFFBQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixPQUFsQixDQUFQO2lCQUNFLElBQUMsQ0FBQSxZQUFELENBQWMsUUFBZCxFQUF3QixPQUF4QixFQURGO1NBRkY7T0FBQSxNQUFBO2VBS0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBTEY7T0FkTztJQUFBLENBSlQsQ0FBQTs7QUFBQSx3QkF5QkEsS0FBQSxHQUFPLFNBQUMsU0FBRCxFQUFZLElBQVosRUFBa0IsSUFBbEIsR0FBQTtBQUNMLFVBQUEsZ0RBQUE7QUFBQSxNQUR3QixnQkFBQSxVQUFVLGNBQUEsTUFDbEMsQ0FBQTtBQUFBLE1BQUMsU0FBVSxVQUFWLE1BQUQsQ0FBQTs7UUFDQSxTQUFVO09BRFY7O1FBRUEsV0FBWTtPQUZaO0FBR0EsTUFBQSxJQUFHLFFBQUg7QUFDRSxRQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsYUFBRCxDQUFlLFNBQWYsRUFBMEIsSUFBMUIsQ0FBWCxDQUFBO0FBQUEsUUFDQSxZQUFBLEdBQWUsU0FBQyxLQUFELEdBQUE7QUFDYixVQUFBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUFLLENBQUMsS0FBL0IsQ0FBQSxDQUFBO2lCQUNBLE1BQU0sQ0FBQywwQkFBUCxDQUFBLEVBRmE7UUFBQSxDQURmLENBREY7T0FBQSxNQUFBO0FBTUUsUUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGtCQUFELENBQW9CLFNBQXBCLEVBQStCLElBQS9CLENBQVgsQ0FBQTtBQUFBLFFBQ0EsWUFBQSxHQUFlLFNBQUMsS0FBRCxHQUFBO2lCQUNiLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVYsQ0FBb0IsQ0FBQyxDQUFELEVBQUksQ0FBQSxDQUFKLENBQXBCLENBQXpCLEVBRGE7UUFBQSxDQURmLENBTkY7T0FIQTtBQWFBLE1BQUEsSUFBRyxNQUFIO0FBQ0UsUUFBQSxTQUFTLENBQUMsY0FBVixDQUF5QixRQUF6QixDQUFBLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxZQUFBLENBQWEsUUFBYixDQUFBLENBSEY7T0FiQTthQWlCQSxTQWxCSztJQUFBLENBekJQLENBQUE7O0FBQUEsd0JBOENBLGFBQUEsR0FBZSxTQUFDLFNBQUQsRUFBWSxJQUFaLEdBQUE7QUFDYixVQUFBLHVCQUFBO0FBQUEsTUFBQyxTQUFVLFVBQVYsTUFBRCxDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBd0IsQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFwQjtBQUFBLFFBQUEsSUFBQSxJQUFRLElBQVIsQ0FBQTtPQURBO0FBRUEsTUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBSDtBQUNFLFFBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBTixDQUFBO0FBQ0EsZ0JBQU8sSUFBQyxDQUFBLFFBQVI7QUFBQSxlQUNPLFFBRFA7QUFFSSxZQUFBLEtBQUEsR0FBUSxDQUFDLENBQUMsR0FBRCxFQUFNLENBQU4sQ0FBRCxFQUFXLENBQUMsR0FBRCxFQUFNLENBQU4sQ0FBWCxDQUFSLENBRko7QUFDTztBQURQLGVBR08sT0FIUDtBQUlJLFlBQUEsSUFBQSxDQUFBLDZCQUFPLENBQThCLElBQUMsQ0FBQSxNQUEvQixFQUF1QyxHQUF2QyxDQUFQO0FBQ0UsY0FBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxnQkFBYixFQUErQixFQUEvQixDQUFQLENBREY7YUFBQTtBQUFBLFlBRUEsTUFBTSxDQUFDLGVBQVAsQ0FBQSxDQUZBLENBQUE7QUFBQSxZQUdDLE1BQU8sU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBUCxHQUhELENBQUE7QUFBQSxZQUlBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLEdBQUcsQ0FBQyxHQUFwQyxFQUF5QztBQUFBLGNBQUMsY0FBQSxFQUFnQixJQUFqQjthQUF6QyxDQUpSLENBSko7QUFBQSxTQURBO2VBVUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixLQUE3QixFQUFvQyxJQUFwQyxFQVhGO09BQUEsTUFBQTtBQWFFLFFBQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFBa0IsVUFBbEIsQ0FBSDtBQUNFLFVBQUEsSUFBTyxTQUFTLENBQUMsY0FBVixDQUFBLENBQTBCLENBQUMsR0FBRyxDQUFDLE1BQS9CLEtBQXlDLENBQWhEO0FBQ0UsWUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxnQkFBYixFQUErQixFQUEvQixDQUFQLENBREY7V0FERjtTQUFBLE1BQUE7QUFJRSxVQUFBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLENBQUEsQ0FKRjtTQUFBO2VBS0EsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFsQkY7T0FIYTtJQUFBLENBOUNmLENBQUE7O0FBQUEsd0JBcUVBLGtCQUFBLEdBQW9CLFNBQUMsU0FBRCxFQUFZLElBQVosR0FBQTtBQUNsQixNQUFBLElBQUcsSUFBQyxDQUFBLFFBQUQsS0FBYSxPQUFiLElBQXlCLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBNUI7QUFDRSxRQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBakIsQ0FBQSxDQUFBLENBREY7T0FBQTthQUVBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBSGtCO0lBQUEsQ0FyRXBCLENBQUE7O3FCQUFBOztLQURzQixTQWozQnhCLENBQUE7O0FBQUEsRUE0N0JNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsdUJBQ0EsUUFBQSxHQUFVLE9BRFYsQ0FBQTs7b0JBQUE7O0tBRHFCLFVBNTdCdkIsQ0FBQTs7QUFBQSxFQWc4Qk07QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsSUFDQSxrQkFBQyxDQUFBLFdBQUQsR0FBYywwQkFEZCxDQUFBOztBQUFBLGlDQUVBLGdCQUFBLEdBQWtCLElBRmxCLENBQUE7OzhCQUFBOztLQUQrQixVQWg4QmpDLENBQUE7O0FBQUEsRUFxOEJNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLElBQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWMseUJBRGQsQ0FBQTs7QUFBQSxnQ0FFQSxnQkFBQSxHQUFrQixJQUZsQixDQUFBOzs2QkFBQTs7S0FEOEIsU0FyOEJoQyxDQUFBOztBQUFBLEVBNDhCTTtBQUNKLDhCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLE9BQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHNCQUNBLEtBQUEsR0FBTyxJQURQLENBQUE7O0FBQUEsc0JBRUEsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLE1BQW1CLEtBQUEsRUFBTyxXQUExQjtLQUZQLENBQUE7O0FBQUEsc0JBR0EsV0FBQSxHQUFhLEtBSGIsQ0FBQTs7QUFBQSxzQkFJQSxXQUFBLEdBQWEsSUFKYixDQUFBOztBQUFBLHNCQUtBLFlBQUEsR0FBYyxJQUxkLENBQUE7O0FBQUEsc0JBT0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBaUMsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLENBQWpDO0FBQUEsUUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxLQUFBLENBQUQsQ0FBSyxXQUFMLENBQVgsQ0FBQSxDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBRlU7SUFBQSxDQVBaLENBQUE7O0FBQUEsc0JBV0EsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLHVDQUFBLFNBQUEsQ0FBUixDQUFBO0FBQ0EsTUFBQSxJQUFnQixLQUFBLEtBQVMsRUFBekI7QUFBQSxRQUFBLEtBQUEsR0FBUSxJQUFSLENBQUE7T0FEQTthQUVBLE1BSFE7SUFBQSxDQVhWLENBQUE7O0FBQUEsc0JBZ0JBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHNDQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFSLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxTQUFELEdBQUE7QUFDaEIsY0FBQSxJQUFBO0FBQUEsVUFBQSxJQUFBLEdBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFtQixDQUFDLE9BQXBCLENBQTRCLElBQTVCLEVBQWtDLEtBQWxDLENBQVAsQ0FBQTtBQUNBLFVBQUEsSUFBQSxDQUFBLENBQVEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxZQUFELENBQVAsQ0FBbUIsV0FBbkIsQ0FBQSxJQUFvQyxDQUFDLElBQUksQ0FBQyxNQUFMLEdBQWMsS0FBQyxDQUFBLFFBQUQsQ0FBQSxDQUFmLENBQXJDLENBQVA7QUFDRSxZQUFBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCO0FBQUEsY0FBQSxpQkFBQSxFQUFtQixJQUFuQjthQUEzQixDQUFBLENBREY7V0FEQTtBQUdBLFVBQUEsSUFBZ0MsS0FBQSxLQUFTLElBQXpDO21CQUFBLEtBQUMsQ0FBQSxZQUFELENBQWMsU0FBZCxFQUFBO1dBSmdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FEQSxDQUFBO0FBU0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixXQUFsQixDQUFIO0FBQ0UsUUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQ0FBUixDQUFBLENBQStDLENBQUEsQ0FBQSxDQUFyRCxDQUFBO0FBQ0E7QUFBQSxhQUFBLDRDQUFBO2dDQUFBO2NBQStDLFNBQUEsS0FBZTtBQUM1RCxZQUFBLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBQTtXQURGO0FBQUEsU0FGRjtPQVRBO2FBY0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBZk87SUFBQSxDQWhCVCxDQUFBOzttQkFBQTs7S0FEb0IsU0E1OEJ0QixDQUFBOztBQUFBLEVBOCtCTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDJCQUVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLDJFQUFBO0FBQUEsTUFBQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUFoQixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBbUMsQ0FBQSxNQUFELENBQVEsUUFBUixDQUFsQztBQUFBLFFBQUEsYUFBYSxDQUFDLFVBQWQsQ0FBQSxDQUFBLENBQUE7T0FEQTtBQUFBLE1BRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUFBLENBRlAsQ0FBQTtBQUdBLE1BQUEsSUFBVSxJQUFBLEtBQVEsRUFBbEI7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUlBLE1BQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxZQUFELENBQUEsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUpBO0FBQUEsTUFNQSxNQUFBLEdBQVMsRUFOVCxDQUFBO0FBQUEsTUFPQSxPQUFBLEdBQWEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLENBQUgsR0FDUixNQUFBLENBQUEsRUFBQSxHQUFJLENBQUMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxJQUFmLENBQUQsQ0FBSixFQUE2QixHQUE3QixDQURRLEdBR1IsTUFBQSxDQUFHLEtBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZixDQUFELENBQUgsR0FBeUIsS0FBNUIsRUFBaUMsR0FBakMsQ0FWRixDQUFBO0FBWUE7QUFBQSxXQUFBLDRDQUFBOzhCQUFBO0FBQ0UsUUFBQSxTQUFBLEdBQVksU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUFaLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBMEIsT0FBMUIsRUFBbUMsU0FBbkMsRUFBOEMsU0FBQyxJQUFELEdBQUE7QUFDNUMsY0FBQSxLQUFBO0FBQUEsVUFEOEMsUUFBRCxLQUFDLEtBQzlDLENBQUE7aUJBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLEVBRDRDO1FBQUEsQ0FBOUMsQ0FEQSxDQURGO0FBQUEsT0FaQTtBQWlCQSxNQUFBLElBQUcsTUFBTSxDQUFDLE1BQVY7QUFDRSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsTUFBaEMsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLGVBQWxCLENBQVA7aUJBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxRQUFkLEVBQXdCLGVBQXhCLEVBREY7U0FGRjtPQWxCTztJQUFBLENBRlQsQ0FBQTs7d0JBQUE7O0tBRHlCLFNBOStCM0IsQ0FBQTs7QUFBQSxFQXdnQ007QUFDSiw2Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxzQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEscUNBQ0EsYUFBQSxHQUFlLEtBRGYsQ0FBQTs7QUFBQSxxQ0FFQSxNQUFBLEdBQVEsYUFGUixDQUFBOztBQUFBLHFDQUdBLFdBQUEsR0FBYSxLQUhiLENBQUE7O2tDQUFBOztLQURtQyxhQXhnQ3JDLENBQUE7O0FBQUEsRUE4Z0NNO0FBQ0osZ0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEseUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHdDQUNBLFdBQUEsR0FBYSxLQURiLENBQUE7O0FBQUEsd0NBRUEsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTthQUNmLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsbUJBQWpCLENBQXFDLE9BQXJDLEVBRGU7SUFBQSxDQUZqQixDQUFBOztxQ0FBQTs7S0FEc0MsU0E5Z0N4QyxDQUFBOztBQUFBLEVBb2hDTTtBQUNKLHFEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLDhCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSw2Q0FDQSxXQUFBLEdBQWEsS0FEYixDQUFBOztBQUFBLDZDQUVBLE1BQUEsR0FBUSxhQUZSLENBQUE7OzBDQUFBOztLQUQyQywwQkFwaEM3QyxDQUFBOztBQUFBLEVBeWhDTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHdCQUNBLGtCQUFBLEdBQW9CLElBRHBCLENBQUE7O0FBQUEsd0JBR0EsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLFVBQUEsYUFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsZUFBQSxDQUFnQixJQUFDLENBQUEsTUFBakIsRUFBeUIsS0FBekIsRUFBZ0M7QUFBQSxRQUFBLE9BQUEsRUFBTyw0QkFBUDtPQUFoQyxDQURULENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUEwQixNQUExQixDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEsWUFBRCxDQUFjLFNBQWQsRUFKZTtJQUFBLENBSGpCLENBQUE7O3FCQUFBOztLQURzQixTQXpoQ3hCLENBQUE7O0FBQUEsRUFxaUNNO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsa0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLGlDQUNBLGFBQUEsR0FBZSxLQURmLENBQUE7O0FBQUEsaUNBRUEsV0FBQSxHQUFhLEtBRmIsQ0FBQTs7QUFBQSxpQ0FHQSxVQUFBLEdBQVksSUFIWixDQUFBOztBQUFBLGlDQUlBLFlBQUEsR0FBYyxJQUpkLENBQUE7O0FBQUEsaUNBS0EscUJBQUEsR0FBdUIsSUFMdkIsQ0FBQTs7QUFBQSxpQ0FPQSx5QkFBQSxHQUEyQixTQUFBLEdBQUE7QUFDekIsVUFBQSxVQUFBO2FBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF0QixDQUFnRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDM0QsY0FBQSw0QkFBQTtBQUFBLFVBRDZELE9BQUQsS0FBQyxJQUM3RCxDQUFBO0FBQUEsVUFBQSxJQUFjLElBQUEsS0FBUSxRQUF0QjtBQUFBLGtCQUFBLENBQUE7V0FBQTtBQUFBLFVBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWYsQ0FBbUIsR0FBbkIsRUFBd0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQXhCLENBSEEsQ0FBQTtBQUlBLFVBQUEsSUFBRyw0RkFBSDtBQUNFLFlBQUEsS0FBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCLENBQUEsQ0FBQTtBQUFBLFlBQ0EsZUFBQSxHQUFrQixLQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLEtBQTdCLENBRGxCLENBREY7V0FBQSxNQUFBO0FBSUUsWUFBQSxlQUFBLEdBQWtCLEVBQWxCLENBSkY7V0FKQTtBQUFBLFVBU0EsS0FBQyxDQUFBLGdCQUFELENBQWtCLGVBQWxCLENBVEEsQ0FBQTtBQUFBLFVBVUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsR0FBdkIsRUFBNEI7QUFBQSxZQUFDLElBQUEsRUFBTSxlQUFQO1dBQTVCLENBVkEsQ0FBQTtBQUFBLFVBWUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFSLEVBQThCLFNBQUEsR0FBQTtBQUM1QixnQkFBQSwwQ0FBQTtBQUFBLFlBQUEsSUFBQSxHQUFPLEtBQUMsQ0FBQSxjQUFELEdBQWtCLGVBQXpCLENBQUE7QUFDQTtBQUFBO2lCQUFBLDRDQUFBO29DQUFBO0FBQ0UsNEJBQUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBMkI7QUFBQSxnQkFBQSxVQUFBLEVBQVksSUFBWjtlQUEzQixFQUFBLENBREY7QUFBQTs0QkFGNEI7VUFBQSxDQUE5QixDQVpBLENBQUE7aUJBa0JBLEtBQUMsQ0FBQSxNQUFNLENBQUMsMkJBQVIsQ0FBb0MsS0FBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLENBQXBDLEVBbkIyRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhELEVBRFk7SUFBQSxDQVAzQixDQUFBOztBQUFBLGlDQTZCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBQWQsQ0FBQTtBQUNBLE1BQUEsSUFBQSxDQUFBLElBQStCLENBQUEsVUFBRCxDQUFBLENBQTlCO0FBQUEsUUFBQSxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsQ0FBQSxDQUFBO09BREE7YUFFQSxJQUFDLENBQUEseUJBQUQsQ0FBQSxFQUhVO0lBQUEsQ0E3QlosQ0FBQTs7QUFBQSxpQ0FxQ0EsYUFBQSxHQUFlLFNBQUMsT0FBRCxHQUFBO2FBQ2IsSUFBQyxDQUFBLFVBQVcsQ0FBQSxPQUFBLENBQVosR0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLEVBRFY7SUFBQSxDQXJDZixDQUFBOztBQUFBLGlDQXdDQSxhQUFBLEdBQWUsU0FBQyxPQUFELEdBQUE7YUFDYixJQUFDLENBQUEsVUFBVyxDQUFBLE9BQUEsRUFEQztJQUFBLENBeENmLENBQUE7O0FBQUEsaUNBMkNBLGdCQUFBLEdBQWtCLFNBQUUsWUFBRixHQUFBO0FBQW1CLE1BQWxCLElBQUMsQ0FBQSxlQUFBLFlBQWlCLENBQUE7YUFBQSxJQUFDLENBQUEsYUFBcEI7SUFBQSxDQTNDbEIsQ0FBQTs7QUFBQSxpQ0E2Q0EsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLEtBQUE7MkRBQWdCLEdBREQ7SUFBQSxDQTdDakIsQ0FBQTs7QUFBQSxpQ0FpREEsWUFBQSxHQUFjLFNBQUMsU0FBRCxFQUFZLElBQVosR0FBQTthQUNaLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCO0FBQUEsUUFBQSxVQUFBLEVBQVksSUFBWjtPQUEzQixFQURZO0lBQUEsQ0FqRGQsQ0FBQTs7QUFBQSxpQ0FvREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBOztRQUNqQixJQUFDLENBQUEsaUJBQXFCLElBQUMsQ0FBQSxxQkFBSixHQUFnQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsR0FBYyxDQUE5QyxHQUFzRDtPQUF6RTthQUNBLElBQUMsQ0FBQSxlQUZnQjtJQUFBLENBcERuQixDQUFBOztBQUFBLGlDQXdEQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtBQUNFLFFBQUEsSUFBQSxDQUFBLENBQWMsSUFBQSxHQUFPLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBUCxDQUFkO0FBQUEsZ0JBQUEsQ0FBQTtTQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsSUFBUSxDQUFBLFlBQUEsQ0FBRCxDQUFZLFFBQVosQ0FBUDtBQUNFLFVBQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQTlCLENBQUE7QUFBQSxVQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLFVBRUEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FGQSxDQURGO1NBREE7ZUFLQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDZixnQkFBQSxvQ0FBQTtBQUFBO0FBQUE7aUJBQUEsNENBQUE7b0NBQUE7QUFDRSxjQUFBLEtBQUMsQ0FBQSxZQUFELENBQWMsU0FBZCxFQUF5QixJQUF6QixDQUFBLENBQUE7QUFBQSw0QkFDQSxjQUFBLENBQWUsU0FBUyxDQUFDLE1BQXpCLEVBREEsQ0FERjtBQUFBOzRCQURlO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsRUFORjtPQUFBLE1BQUE7QUFXRSxRQUFBLElBQUcsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBQSxHQUF1QixDQUExQjtBQUNFLFVBQUEsS0FBQSxHQUFRLDZCQUFBLENBQThCLElBQUMsQ0FBQSxNQUEvQixFQUF1QyxJQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsQ0FBdkMsQ0FBUixDQUFBO0FBQUEsVUFDQSxJQUFDLENBQUEsY0FBRCxHQUFxQixhQUFILEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixLQUE3QixDQUFmLEdBQXdELEVBRDFFLENBREY7U0FBQTtBQUFBLFFBR0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxRQUFmLENBSEEsQ0FBQTtlQUlBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixRQUFuQixFQUE2QixJQUFDLENBQUEsWUFBOUIsRUFmRjtPQURPO0lBQUEsQ0F4RFQsQ0FBQTs7OEJBQUE7O0tBRCtCLFNBcmlDakMsQ0FBQTs7QUFBQSxFQWduQ007QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsa0NBQ0EsWUFBQSxHQUFjLFNBRGQsQ0FBQTs7QUFBQSxrQ0FHQSxZQUFBLEdBQWMsU0FBQyxTQUFELEVBQVksSUFBWixHQUFBO0FBQ1osVUFBQSxjQUFBO0FBQUEsV0FBQSwyQ0FBQTt3QkFBQTtjQUF1QixJQUFBLEtBQVU7O1NBQy9CO0FBQUEsUUFBQSxJQUFTLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBakIsQ0FBQSxDQUFUO0FBQUEsZ0JBQUE7U0FBQTtBQUFBLFFBQ0EsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQURBLENBREY7QUFBQSxPQUFBO2FBR0EsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBMkI7QUFBQSxRQUFBLFVBQUEsRUFBWSxLQUFaO09BQTNCLEVBSlk7SUFBQSxDQUhkLENBQUE7OytCQUFBOztLQURnQyxtQkFobkNsQyxDQUFBOztBQUFBLEVBMG5DTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDBCQUNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLHVCQUFBO0FBQUE7QUFBQSxXQUFBLDRDQUFBOzJCQUFBO0FBQUEsUUFBQSxlQUFBLENBQWdCLE1BQWhCLENBQUEsQ0FBQTtBQUFBLE9BQUE7YUFDQSwwQ0FBQSxTQUFBLEVBRk87SUFBQSxDQURULENBQUE7O3VCQUFBOztLQUR3QixtQkExbkMxQixDQUFBOztBQUFBLEVBZ29DTTtBQUNKLDJDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG9CQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxtQ0FDQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBQSxDQUFBLENBQUE7YUFDQSxtREFBQSxTQUFBLEVBRk87SUFBQSxDQURULENBQUE7O2dDQUFBOztLQURpQyxtQkFob0NuQyxDQUFBOztBQUFBLEVBc29DTTtBQUNKLDhDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHVCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxzQ0FDQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFSLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQUEsQ0FEQSxDQUFBO2FBRUEsc0RBQUEsU0FBQSxFQUhPO0lBQUEsQ0FEVCxDQUFBOzttQ0FBQTs7S0FEb0MsbUJBdG9DdEMsQ0FBQTs7QUFBQSxFQTZvQ007QUFDSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsaUNBQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBRyxDQUFDLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLEdBQW5CLENBQVQsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxLQUFoQyxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsc0JBQVIsQ0FBK0I7QUFBQSxVQUFDLE1BQUEsRUFBUSxJQUFUO1NBQS9CLENBREEsQ0FERjtPQUFBO2FBR0EsaURBQUEsU0FBQSxFQUpPO0lBQUEsQ0FEVCxDQUFBOzs4QkFBQTs7S0FEK0IsbUJBN29DakMsQ0FBQTs7QUFBQSxFQXFwQ007QUFDSiw2Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxzQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEscUNBQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxxREFBQSxTQUFBLEVBRk87SUFBQSxDQURULENBQUE7O0FBQUEscUNBS0EsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUNiLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBQSxFQURhO0lBQUEsQ0FMZixDQUFBOztBQUFBLHFDQVFBLFlBQUEsR0FBYyxTQUFDLFNBQUQsRUFBWSxJQUFaLEdBQUE7YUFDWixTQUFTLENBQUMsVUFBVixDQUFxQixJQUFJLENBQUMsUUFBTCxDQUFBLENBQXJCLEVBQXNDO0FBQUEsUUFBQSxVQUFBLEVBQVksSUFBWjtPQUF0QyxFQURZO0lBQUEsQ0FSZCxDQUFBOztrQ0FBQTs7S0FEbUMsbUJBcnBDckMsQ0FBQTs7QUFBQSxFQWlxQ007QUFDSiw2Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxzQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEscUNBQ0EsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUNiLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBQSxFQURhO0lBQUEsQ0FEZixDQUFBOztrQ0FBQTs7S0FEbUMsdUJBanFDckMsQ0FBQTs7QUFBQSxFQXdxQ007QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDZCQUNBLGFBQUEsR0FBZSxJQURmLENBQUE7O0FBQUEsNkJBRUEsS0FBQSxHQUFPLElBRlAsQ0FBQTs7QUFBQSw2QkFHQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSwwQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFdBQWxCLENBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLEVBQUQsR0FBQTtBQUNoQyxZQUFBLEVBQUUsQ0FBQyxxQkFBSCxDQUFBLENBQUEsQ0FBQTttQkFDQSxFQUFFLENBQUMsd0JBQUgsQ0FBNEIsS0FBQyxDQUFBLEtBQTdCLEVBRmdDO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUtFO0FBQUEsYUFBQSw0Q0FBQTtnQ0FBQTtBQUNFLFVBQUEsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxtQkFBakIsQ0FBcUMsSUFBQyxDQUFBLEtBQXRDLENBQUEsQ0FERjtBQUFBLFNBTEY7T0FEQTthQVFBLDZDQUFBLFNBQUEsRUFUTztJQUFBLENBSFQsQ0FBQTs7MEJBQUE7O0tBRDJCLG1CQXhxQzdCLENBQUE7O0FBQUEsRUF1ckNNO0FBQ0osNENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEscUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLG9DQUNBLEtBQUEsR0FBTyxPQURQLENBQUE7O2lDQUFBOztLQURrQyxlQXZyQ3BDLENBQUE7O0FBQUEsRUE0ckNNO0FBQ0osK0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsd0JBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztvQ0FBQTs7S0FEcUMsc0JBNXJDdkMsQ0FBQTs7QUFBQSxFQStyQ007QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsa0NBQ0EsS0FBQSxHQUFPLEtBRFAsQ0FBQTs7K0JBQUE7O0tBRGdDLGVBL3JDbEMsQ0FBQTs7QUFBQSxFQW9zQ007QUFDSiw2Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxzQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O2tDQUFBOztLQURtQyxvQkFwc0NyQyxDQUFBOztBQUFBLEVBdXNDTTtBQUNKLDJDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG9CQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxtQ0FDQSxLQUFBLEdBQU8sTUFEUCxDQUFBOztnQ0FBQTs7S0FEaUMsZUF2c0NuQyxDQUFBOztBQUFBLEVBMnNDTTtBQUNKLDJDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG9CQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxtQ0FDQSxLQUFBLEdBQU8sTUFEUCxDQUFBOztnQ0FBQTs7S0FEaUMsZUEzc0NuQyxDQUFBOztBQUFBLEVBK3NDTTtBQUNKLGdEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHlCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLHlCQUFDLENBQUEsV0FBRCxHQUFjLG9EQURkLENBQUE7O0FBQUEsd0NBRUEsTUFBQSxHQUFRLHlCQUZSLENBQUE7O3FDQUFBOztLQURzQyxxQkEvc0N4QyxDQUFBOztBQUFBLEVBb3RDTTtBQUNKLDRDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLHFCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxJQUNBLHFCQUFDLENBQUEsV0FBRCxHQUFjLGdEQURkLENBQUE7O0FBQUEsb0NBRUEsTUFBQSxHQUFRLHFCQUZSLENBQUE7O2lDQUFBOztLQURrQyxxQkFwdENwQyxDQUFBOztBQUFBLEVBMHRDTTtBQUNKLDZCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLE1BQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHFCQUNBLGFBQUEsR0FBZSxJQURmLENBQUE7O0FBQUEscUJBRUEsV0FBQSxHQUFhLElBRmIsQ0FBQTs7QUFBQSxxQkFHQSxxQkFBQSxHQUF1QixLQUh2QixDQUFBOztBQUFBLHFCQUtBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLFdBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sRUFEUCxDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBLENBQUEsSUFBMEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUEsQ0FBN0I7QUFDRSxRQUFBLElBQWdCLEtBQUssQ0FBQyx1QkFBTixDQUE4QixJQUFDLENBQUEsTUFBL0IsQ0FBQSxLQUEwQyxVQUExRDtBQUFBLFVBQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtTQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsa0VBQXNCLENBQUMscUJBQXZCO0FBQUEsVUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO1NBSEY7T0FGQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZixjQUFBLDJDQUFBO0FBQUE7QUFBQTtlQUFBLDRDQUFBO2tDQUFBO0FBQ0UsWUFBQSxLQUFDLENBQUEsNkJBQUQsQ0FBK0IsU0FBL0IsQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFBLEdBQVEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBMkI7QUFBQSxjQUFBLFVBQUEsRUFBWSxJQUFaO2FBQTNCLENBRFIsQ0FBQTtBQUVBLFlBQUEsSUFBQSxDQUFBLEtBQXdDLENBQUMsT0FBTixDQUFBLENBQW5DOzRCQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBQSxHQUFBO2FBQUEsTUFBQTtvQ0FBQTthQUhGO0FBQUE7MEJBRGU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixDQVBBLENBQUE7YUFZQSxxQ0FBQSxTQUFBLEVBYk87SUFBQSxDQUxULENBQUE7O2tCQUFBOztLQURtQixtQkExdENyQixDQUFBOztBQUFBLEVBK3VDTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLHlCQUNBLE1BQUEsR0FBUSxXQURSLENBQUE7O3NCQUFBOztLQUR1QixPQS91Q3pCLENBQUE7O0FBQUEsRUFtdkNNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsNkJBQ0EsTUFBQSxHQUFRLG9CQURSLENBQUE7OzBCQUFBOztLQUQyQixPQW52QzdCLENBQUE7O0FBQUEsRUF1dkNNO0FBQ0osa0RBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsMkJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLDBDQUNBLE1BQUEsR0FBUSwyQkFEUixDQUFBOztBQUFBLDBDQUdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUcsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQixXQUFsQixDQUF4QjtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsS0FBakIsQ0FERjtPQUFBO2FBRUEsNkRBQUEsU0FBQSxFQUhVO0lBQUEsQ0FIWixDQUFBOztBQUFBLDBDQVFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUcsSUFBQyxDQUFBLGlCQUFKO0FBQ0UsUUFBQSxJQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUF5QixDQUFDLE9BQTFCLENBQWtDLFNBQUMsRUFBRCxHQUFBO0FBQ2hDLFVBQUEsRUFBRSxDQUFDLHFCQUFILENBQUEsQ0FBQSxDQUFBO2lCQUNBLEVBQUUsQ0FBQyx3QkFBSCxDQUE0QixPQUE1QixFQUZnQztRQUFBLENBQWxDLENBQUEsQ0FERjtPQUFBO2FBSUEsMERBQUEsU0FBQSxFQUxPO0lBQUEsQ0FSVCxDQUFBOzt1Q0FBQTs7S0FEd0MsT0F2dkMxQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/operator.coffee
