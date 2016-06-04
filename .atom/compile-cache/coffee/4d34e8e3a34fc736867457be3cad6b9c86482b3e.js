(function() {
  var Base, CurrentSelection, Find, FindBackwards, IsKeywordDefault, MatchList, Motion, MoveDown, MoveDownToEdge, MoveLeft, MoveRight, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextParagraph, MoveToNextSmartWord, MoveToNextString, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousParagraph, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineWithMinimum, MoveToTopOfScreen, MoveUp, MoveUpToEdge, Point, Range, RepeatFind, RepeatFindReverse, RepeatSearch, RepeatSearchReverse, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, Till, TillBackwards, cursorIsAtEmptyRow, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, detectScopeStartPositionForScope, getBufferRows, getCodeFoldRowRanges, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getLastVisibleScreenRow, getStartPositionForPattern, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, globalState, highlightRanges, isIncludeFunctionScopeForRow, moveCursorDown, moveCursorDownBuffer, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, moveCursorUpBuffer, saveEditorState, settings, sortRanges, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  globalState = require('./global-state');

  _ref1 = require('./utils'), saveEditorState = _ref1.saveEditorState, getVisibleBufferRange = _ref1.getVisibleBufferRange, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, moveCursorUp = _ref1.moveCursorUp, moveCursorDown = _ref1.moveCursorDown, moveCursorDownBuffer = _ref1.moveCursorDownBuffer, moveCursorUpBuffer = _ref1.moveCursorUpBuffer, cursorIsAtVimEndOfFile = _ref1.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = _ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = _ref1.getLastVisibleScreenRow, getVimEofBufferPosition = _ref1.getVimEofBufferPosition, getVimLastBufferRow = _ref1.getVimLastBufferRow, getVimLastScreenRow = _ref1.getVimLastScreenRow, getValidVimScreenRow = _ref1.getValidVimScreenRow, getValidVimBufferRow = _ref1.getValidVimBufferRow, highlightRanges = _ref1.highlightRanges, moveCursorToFirstCharacterAtRow = _ref1.moveCursorToFirstCharacterAtRow, sortRanges = _ref1.sortRanges, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, cursorIsOnWhiteSpace = _ref1.cursorIsOnWhiteSpace, moveCursorToNextNonWhitespace = _ref1.moveCursorToNextNonWhitespace, cursorIsAtEmptyRow = _ref1.cursorIsAtEmptyRow, getCodeFoldRowRanges = _ref1.getCodeFoldRowRanges, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = _ref1.detectScopeStartPositionForScope, getBufferRows = _ref1.getBufferRows, getStartPositionForPattern = _ref1.getStartPositionForPattern, getFirstCharacterPositionForBufferRow = _ref1.getFirstCharacterPositionForBufferRow, getFirstCharacterBufferPositionForScreenRow = _ref1.getFirstCharacterBufferPositionForScreenRow, getTextInScreenRange = _ref1.getTextInScreenRange;

  swrap = require('./selection-wrapper');

  MatchList = require('./match').MatchList;

  settings = require('./settings');

  Base = require('./base');

  IsKeywordDefault = "[@a-zA-Z0-9_\-]+";

  Motion = (function(_super) {
    __extends(Motion, _super);

    Motion.extend(false);

    Motion.prototype.inclusive = false;

    Motion.prototype.linewise = false;

    function Motion() {
      Motion.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    Motion.prototype.isLinewise = function() {
      if (this.isMode('visual')) {
        return this.isMode('visual', 'linewise');
      } else {
        return this.linewise;
      }
    };

    Motion.prototype.isBlockwise = function() {
      return this.isMode('visual', 'blockwise');
    };

    Motion.prototype.isInclusive = function() {
      if (this.isMode('visual')) {
        return this.isMode('visual', ['characterwise', 'blockwise']);
      } else {
        return this.inclusive;
      }
    };

    Motion.prototype.setBufferPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setBufferPosition(point);
      }
    };

    Motion.prototype.setScreenPositionSafely = function(cursor, point) {
      if (point != null) {
        return cursor.setScreenPosition(point);
      }
    };

    Motion.prototype.execute = function() {
      return this.editor.moveCursors((function(_this) {
        return function(cursor) {
          return _this.moveCursor(cursor);
        };
      })(this));
    };

    Motion.prototype.select = function() {
      var selection, _i, _len, _ref2;
      if (this.isMode('visual')) {
        this.vimState.modeManager.normalizeSelections();
      }
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        if (this.isInclusive() || this.isLinewise()) {
          this.selectInclusively(selection);
        } else {
          selection.modifySelection((function(_this) {
            return function() {
              return _this.moveCursor(selection.cursor);
            };
          })(this));
        }
      }
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
      if (this.isMode('visual')) {
        this.updateSelectionProperties();
      }
      switch (false) {
        case !this.isLinewise():
          return this.vimState.selectLinewise();
        case !this.isBlockwise():
          return this.vimState.selectBlockwise();
      }
    };

    Motion.prototype.selectInclusively = function(selection) {
      var cursor, originalPoint, tailRange;
      cursor = selection.cursor;
      originalPoint = cursor.getBufferPosition();
      tailRange = swrap(selection).getTailBufferRange();
      return selection.modifySelection((function(_this) {
        return function() {
          var allowWrap;
          _this.moveCursor(cursor);
          if (_this.isMode('visual')) {
            if (cursor.isAtEndOfLine()) {
              moveCursorLeft(cursor, {
                preserveGoalColumn: true
              });
            }
          } else {
            if (cursor.getBufferPosition().isEqual(originalPoint)) {
              return;
            }
          }
          if (!selection.isReversed()) {
            allowWrap = cursorIsAtEmptyRow(cursor);
            moveCursorRight(cursor, {
              allowWrap: allowWrap,
              preserveGoalColumn: true
            });
          }
          return swrap(selection).mergeBufferRange(tailRange, {
            preserveFolds: true
          });
        };
      })(this));
    };

    return Motion;

  })(Base);

  CurrentSelection = (function(_super) {
    __extends(CurrentSelection, _super);

    function CurrentSelection() {
      return CurrentSelection.__super__.constructor.apply(this, arguments);
    }

    CurrentSelection.extend(false);

    CurrentSelection.prototype.selectionExtent = null;

    CurrentSelection.prototype.pointBySelection = null;

    CurrentSelection.prototype.inclusive = true;

    CurrentSelection.prototype.initialize = function() {
      return this.pointInfoByCursor = new Map;
    };

    CurrentSelection.prototype.execute = function() {
      throw new Error("" + (this.getName()) + " should not be executed");
    };

    CurrentSelection.prototype.moveCursor = function(cursor) {
      var point, startOfSelection;
      if (this.isMode('visual')) {
        this.selectionExtent = this.editor.getSelectedBufferRange().getExtent();
        this.linewise = this.isLinewise();
        startOfSelection = cursor.selection.getBufferRange().start;
        return this.onDidFinishOperation((function(_this) {
          return function() {
            var atEOL, cursorPosition;
            cursorPosition = cursor.getBufferPosition();
            atEOL = cursor.isAtEndOfLine();
            return _this.pointInfoByCursor.set(cursor, {
              startOfSelection: startOfSelection,
              cursorPosition: cursorPosition,
              atEOL: atEOL
            });
          };
        })(this));
      } else {
        point = cursor.getBufferPosition();
        return cursor.setBufferPosition(point.traverse(this.selectionExtent));
      }
    };

    CurrentSelection.prototype.select = function() {
      var atEOL, cursor, cursorPosition, pointInfo, startOfSelection, _i, _len, _ref2;
      if (this.isMode('visual')) {
        return CurrentSelection.__super__.select.apply(this, arguments);
      } else {
        _ref2 = this.editor.getCursors();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          cursor = _ref2[_i];
          if (!(pointInfo = this.pointInfoByCursor.get(cursor))) {
            continue;
          }
          cursorPosition = pointInfo.cursorPosition, startOfSelection = pointInfo.startOfSelection, atEOL = pointInfo.atEOL;
          if (atEOL || cursorPosition.isEqual(cursor.getBufferPosition())) {
            cursor.setBufferPosition(startOfSelection);
          }
        }
        return CurrentSelection.__super__.select.apply(this, arguments);
      }
    };

    return CurrentSelection;

  })(Motion);

  MoveLeft = (function(_super) {
    __extends(MoveLeft, _super);

    function MoveLeft() {
      return MoveLeft.__super__.constructor.apply(this, arguments);
    }

    MoveLeft.extend();

    MoveLeft.prototype.moveCursor = function(cursor) {
      var allowWrap;
      allowWrap = settings.get('wrapLeftRightMotion');
      return this.countTimes(function() {
        return moveCursorLeft(cursor, {
          allowWrap: allowWrap
        });
      });
    };

    return MoveLeft;

  })(Motion);

  MoveRight = (function(_super) {
    __extends(MoveRight, _super);

    function MoveRight() {
      return MoveRight.__super__.constructor.apply(this, arguments);
    }

    MoveRight.extend();

    MoveRight.prototype.canWrapToNextLine = function(cursor) {
      if (!this.isMode('visual') && this.isAsOperatorTarget() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return settings.get('wrapLeftRightMotion');
      }
    };

    MoveRight.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var allowWrap;
          _this.editor.unfoldBufferRow(cursor.getBufferRow());
          allowWrap = _this.canWrapToNextLine(cursor);
          moveCursorRight(cursor);
          if (cursor.isAtEndOfLine() && allowWrap && !cursorIsAtVimEndOfFile(cursor)) {
            return moveCursorRight(cursor, {
              allowWrap: allowWrap
            });
          }
        };
      })(this));
    };

    return MoveRight;

  })(Motion);

  MoveUp = (function(_super) {
    __extends(MoveUp, _super);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.extend();

    MoveUp.prototype.linewise = true;

    MoveUp.prototype.direction = 'up';

    MoveUp.prototype.move = function(cursor) {
      return moveCursorUp(cursor);
    };

    MoveUp.prototype.moveCursor = function(cursor) {
      var isBufferRowWise, vimLastBufferRow;
      isBufferRowWise = this.editor.isSoftWrapped() && this.isMode('visual', 'linewise');
      vimLastBufferRow = null;
      return this.countTimes((function(_this) {
        return function() {
          var amount, column, row;
          if (isBufferRowWise) {
            if (vimLastBufferRow == null) {
              vimLastBufferRow = getVimLastBufferRow(_this.editor);
            }
            amount = _this.direction === 'up' ? -1 : +1;
            row = cursor.getBufferRow() + amount;
            if (row <= vimLastBufferRow) {
              column = cursor.goalColumn || cursor.getBufferColumn();
              cursor.setBufferPosition([row, column]);
              return cursor.goalColumn = column;
            }
          } else {
            return _this.move(cursor);
          }
        };
      })(this));
    };

    return MoveUp;

  })(Motion);

  MoveDown = (function(_super) {
    __extends(MoveDown, _super);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.extend();

    MoveDown.prototype.linewise = true;

    MoveDown.prototype.direction = 'down';

    MoveDown.prototype.move = function(cursor) {
      return moveCursorDown(cursor);
    };

    return MoveDown;

  })(MoveUp);

  MoveUpToEdge = (function(_super) {
    __extends(MoveUpToEdge, _super);

    function MoveUpToEdge() {
      return MoveUpToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveUpToEdge.extend();

    MoveUpToEdge.prototype.linewise = true;

    MoveUpToEdge.prototype.direction = 'up';

    MoveUpToEdge.description = "Move cursor up to **edge** char at same-column";

    MoveUpToEdge.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getScreenPosition();
      this.countTimes((function(_this) {
        return function(_arg) {
          var newPoint, stop;
          stop = _arg.stop;
          if ((newPoint = _this.getPoint(point))) {
            return point = newPoint;
          } else {
            return stop();
          }
        };
      })(this));
      return this.setScreenPositionSafely(cursor, point);
    };

    MoveUpToEdge.prototype.getPoint = function(fromPoint) {
      var point, row, _i, _len, _ref2;
      _ref2 = this.getScanRows(fromPoint);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        if (this.isMovablePoint(point = new Point(row, fromPoint.column))) {
          return point;
        }
      }
    };

    MoveUpToEdge.prototype.getScanRows = function(_arg) {
      var row, validRow, _i, _j, _ref2, _ref3, _ref4, _results, _results1;
      row = _arg.row;
      validRow = getValidVimScreenRow.bind(null, this.editor);
      switch (this.direction) {
        case 'up':
          return (function() {
            _results = [];
            for (var _i = _ref2 = validRow(row - 1); _ref2 <= 0 ? _i <= 0 : _i >= 0; _ref2 <= 0 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        case 'down':
          return (function() {
            _results1 = [];
            for (var _j = _ref3 = validRow(row + 1), _ref4 = getVimLastScreenRow(this.editor); _ref3 <= _ref4 ? _j <= _ref4 : _j >= _ref4; _ref3 <= _ref4 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    };

    MoveUpToEdge.prototype.isMovablePoint = function(point) {
      var above, below, _ref2;
      if (this.isStoppablePoint(point)) {
        if ((_ref2 = point.row) === 0 || _ref2 === getVimLastScreenRow(this.editor)) {
          return true;
        } else {
          above = point.translate([-1, 0]);
          below = point.translate([+1, 0]);
          return (!this.isStoppablePoint(above)) || (!this.isStoppablePoint(below));
        }
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isValidStoppablePoint = function(_arg) {
      var column, firstChar, lastChar, match, row, softTabText, text;
      row = _arg.row, column = _arg.column;
      text = getTextInScreenRange(this.editor, [[row, 0], [row, Infinity]]);
      softTabText = _.multiplyString(' ', this.editor.getTabLength());
      text = text.replace(/\t/g, softTabText);
      if ((match = text.match(/\S/g)) != null) {
        firstChar = match[0], lastChar = match[match.length - 1];
        return (text.indexOf(firstChar) <= column && column <= text.lastIndexOf(lastChar));
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isStoppablePoint = function(point) {
      var left, right;
      if (this.isNonBlankPoint(point)) {
        return true;
      } else if (this.isValidStoppablePoint(point)) {
        left = point.translate([0, -1]);
        right = point.translate([0, +1]);
        return this.isNonBlankPoint(left) && this.isNonBlankPoint(right);
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isNonBlankPoint = function(point) {
      var char, screenRange;
      screenRange = Range.fromPointWithDelta(point, 0, 1);
      char = getTextInScreenRange(this.editor, screenRange);
      return (char != null) && /\S/.test(char);
    };

    return MoveUpToEdge;

  })(Motion);

  MoveDownToEdge = (function(_super) {
    __extends(MoveDownToEdge, _super);

    function MoveDownToEdge() {
      return MoveDownToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveDownToEdge.extend();

    MoveDownToEdge.description = "Move cursor down to **edge** char at same-column";

    MoveDownToEdge.prototype.direction = 'down';

    return MoveDownToEdge;

  })(MoveUpToEdge);

  MoveToNextWord = (function(_super) {
    __extends(MoveToNextWord, _super);

    function MoveToNextWord() {
      return MoveToNextWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWord.extend();

    MoveToNextWord.prototype.wordRegex = null;

    MoveToNextWord.prototype.getPoint = function(cursor) {
      var cursorPoint, pattern, point, scanRange, _ref2;
      cursorPoint = cursor.getBufferPosition();
      pattern = (_ref2 = this.wordRegex) != null ? _ref2 : cursor.wordRegExp();
      scanRange = [[cursorPoint.row, 0], this.vimEof];
      point = null;
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range, stop;
        stop = _arg.stop, range = _arg.range;
        if (range.end.isGreaterThan(cursorPoint)) {
          point = range.end;
        }
        if (range.start.isGreaterThan(cursorPoint)) {
          point = range.start;
          return stop();
        }
      });
      return point != null ? point : cursorPoint;
    };

    MoveToNextWord.prototype.moveCursor = function(cursor) {
      var lastCount, wasOnWhiteSpace;
      if (cursorIsAtVimEndOfFile(cursor)) {
        return;
      }
      this.vimEof = getVimEofBufferPosition(this.editor);
      lastCount = this.getCount();
      wasOnWhiteSpace = cursorIsOnWhiteSpace(cursor);
      return this.countTimes((function(_this) {
        return function(_arg) {
          var cursorRow, isFinal, point;
          isFinal = _arg.isFinal;
          cursorRow = cursor.getBufferRow();
          if (cursorIsAtEmptyRow(cursor) && _this.isAsOperatorTarget()) {
            point = [cursorRow + 1, 0];
          } else {
            point = _this.getPoint(cursor);
            if (isFinal && _this.isAsOperatorTarget()) {
              if (_this.getOperator().getName() === 'Change' && (!wasOnWhiteSpace)) {
                point = cursor.getEndOfCurrentWordBufferPosition({
                  wordRegex: _this.wordRegex
                });
              } else if (point.row > cursorRow) {
                point = [cursorRow, Infinity];
              }
            }
          }
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToNextWord;

  })(Motion);

  MoveToPreviousWord = (function(_super) {
    __extends(MoveToPreviousWord, _super);

    function MoveToPreviousWord() {
      return MoveToPreviousWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWord.extend();

    MoveToPreviousWord.prototype.wordRegex = null;

    MoveToPreviousWord.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var point;
          point = cursor.getBeginningOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToPreviousWord;

  })(Motion);

  MoveToEndOfWord = (function(_super) {
    __extends(MoveToEndOfWord, _super);

    function MoveToEndOfWord() {
      return MoveToEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWord.extend();

    MoveToEndOfWord.prototype.wordRegex = null;

    MoveToEndOfWord.prototype.inclusive = true;

    MoveToEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      moveCursorToNextNonWhitespace(cursor);
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, getVimEofBufferPosition(this.editor));
      return cursor.setBufferPosition(point);
    };

    MoveToEndOfWord.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var originalPoint;
          originalPoint = cursor.getBufferPosition();
          _this.moveToNextEndOfWord(cursor);
          if (originalPoint.isEqual(cursor.getBufferPosition())) {
            cursor.moveRight();
            return _this.moveToNextEndOfWord(cursor);
          }
        };
      })(this));
    };

    return MoveToEndOfWord;

  })(Motion);

  MoveToNextWholeWord = (function(_super) {
    __extends(MoveToNextWholeWord, _super);

    function MoveToNextWholeWord() {
      return MoveToNextWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWholeWord.extend();

    MoveToNextWholeWord.prototype.wordRegex = /^\s*$|\S+/g;

    return MoveToNextWholeWord;

  })(MoveToNextWord);

  MoveToPreviousWholeWord = (function(_super) {
    __extends(MoveToPreviousWholeWord, _super);

    function MoveToPreviousWholeWord() {
      return MoveToPreviousWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWholeWord.extend();

    MoveToPreviousWholeWord.prototype.wordRegex = /^\s*$|\S+/;

    return MoveToPreviousWholeWord;

  })(MoveToPreviousWord);

  MoveToEndOfWholeWord = (function(_super) {
    __extends(MoveToEndOfWholeWord, _super);

    function MoveToEndOfWholeWord() {
      return MoveToEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWholeWord.extend();

    MoveToEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToEndOfWholeWord;

  })(MoveToEndOfWord);

  MoveToNextAlphanumericWord = (function(_super) {
    __extends(MoveToNextAlphanumericWord, _super);

    function MoveToNextAlphanumericWord() {
      return MoveToNextAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextAlphanumericWord.extend();

    MoveToNextAlphanumericWord.description = "Move to next alphanumeric(`/\w+/`) word";

    MoveToNextAlphanumericWord.prototype.wordRegex = /\w+/g;

    return MoveToNextAlphanumericWord;

  })(MoveToNextWord);

  MoveToPreviousAlphanumericWord = (function(_super) {
    __extends(MoveToPreviousAlphanumericWord, _super);

    function MoveToPreviousAlphanumericWord() {
      return MoveToPreviousAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousAlphanumericWord.extend();

    MoveToPreviousAlphanumericWord.description = "Move to previous alphanumeric(`/\w+/`) word";

    MoveToPreviousAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToPreviousAlphanumericWord;

  })(MoveToPreviousWord);

  MoveToEndOfAlphanumericWord = (function(_super) {
    __extends(MoveToEndOfAlphanumericWord, _super);

    function MoveToEndOfAlphanumericWord() {
      return MoveToEndOfAlphanumericWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfAlphanumericWord.extend();

    MoveToEndOfAlphanumericWord.description = "Move to end of alphanumeric(`/\w+/`) word";

    MoveToEndOfAlphanumericWord.prototype.wordRegex = /\w+/;

    return MoveToEndOfAlphanumericWord;

  })(MoveToEndOfWord);

  MoveToNextSmartWord = (function(_super) {
    __extends(MoveToNextSmartWord, _super);

    function MoveToNextSmartWord() {
      return MoveToNextSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSmartWord.extend();

    MoveToNextSmartWord.description = "Move to next smart word (`/[\w-]+/`) word";

    MoveToNextSmartWord.prototype.wordRegex = /[\w-]+/g;

    return MoveToNextSmartWord;

  })(MoveToNextWord);

  MoveToPreviousSmartWord = (function(_super) {
    __extends(MoveToPreviousSmartWord, _super);

    function MoveToPreviousSmartWord() {
      return MoveToPreviousSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSmartWord.extend();

    MoveToPreviousSmartWord.description = "Move to previous smart word (`/[\w-]+/`) word";

    MoveToPreviousSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToPreviousSmartWord;

  })(MoveToPreviousWord);

  MoveToEndOfSmartWord = (function(_super) {
    __extends(MoveToEndOfSmartWord, _super);

    function MoveToEndOfSmartWord() {
      return MoveToEndOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfSmartWord.extend();

    MoveToEndOfSmartWord.description = "Move to end of smart word (`/[\w-]+/`) word";

    MoveToEndOfSmartWord.prototype.wordRegex = /[\w-]+/;

    return MoveToEndOfSmartWord;

  })(MoveToEndOfWord);

  MoveToNextParagraph = (function(_super) {
    __extends(MoveToNextParagraph, _super);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.extend();

    MoveToNextParagraph.prototype.direction = 'next';

    MoveToNextParagraph.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getBufferPosition();
      this.countTimes((function(_this) {
        return function() {
          return point = _this.getPoint(point);
        };
      })(this));
      return cursor.setBufferPosition(point);
    };

    MoveToNextParagraph.prototype.getPoint = function(fromPoint) {
      var options, row, wasAtNonBlankRow, _i, _len, _ref2;
      wasAtNonBlankRow = !this.editor.isBufferRowBlank(fromPoint.row);
      options = {
        startRow: fromPoint.row,
        direction: this.direction,
        includeStartRow: false
      };
      _ref2 = getBufferRows(this.editor, options);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        if (this.editor.isBufferRowBlank(row)) {
          if (wasAtNonBlankRow) {
            return new Point(row, 0);
          }
        } else {
          wasAtNonBlankRow = true;
        }
      }
      switch (this.direction) {
        case 'previous':
          return new Point(0, 0);
        case 'next':
          return getVimEofBufferPosition(this.editor);
      }
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(_super) {
    __extends(MoveToPreviousParagraph, _super);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.extend();

    MoveToPreviousParagraph.prototype.direction = 'previous';

    return MoveToPreviousParagraph;

  })(MoveToNextParagraph);

  MoveToBeginningOfLine = (function(_super) {
    __extends(MoveToBeginningOfLine, _super);

    function MoveToBeginningOfLine() {
      return MoveToBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfLine.extend();

    MoveToBeginningOfLine.prototype.getPoint = function(_arg) {
      var row;
      row = _arg.row;
      return new Point(row, 0);
    };

    MoveToBeginningOfLine.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      return cursor.setBufferPosition(point);
    };

    return MoveToBeginningOfLine;

  })(Motion);

  MoveToColumn = (function(_super) {
    __extends(MoveToColumn, _super);

    function MoveToColumn() {
      return MoveToColumn.__super__.constructor.apply(this, arguments);
    }

    MoveToColumn.extend();

    MoveToColumn.prototype.getCount = function() {
      return MoveToColumn.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToColumn.prototype.getPoint = function(_arg) {
      var row;
      row = _arg.row;
      return new Point(row, this.getCount());
    };

    MoveToColumn.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getScreenPosition());
      return cursor.setScreenPosition(point);
    };

    return MoveToColumn;

  })(Motion);

  MoveToLastCharacterOfLine = (function(_super) {
    __extends(MoveToLastCharacterOfLine, _super);

    function MoveToLastCharacterOfLine() {
      return MoveToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfLine.extend();

    MoveToLastCharacterOfLine.prototype.getCount = function() {
      return MoveToLastCharacterOfLine.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToLastCharacterOfLine.prototype.getPoint = function(_arg) {
      var row;
      row = _arg.row;
      row = getValidVimBufferRow(this.editor, row + this.getCount());
      return new Point(row, Infinity);
    };

    MoveToLastCharacterOfLine.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      cursor.setBufferPosition(point);
      return cursor.goalColumn = Infinity;
    };

    return MoveToLastCharacterOfLine;

  })(Motion);

  MoveToLastNonblankCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToLastNonblankCharacterOfLineAndDown, _super);

    function MoveToLastNonblankCharacterOfLineAndDown() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToLastNonblankCharacterOfLineAndDown.extend();

    MoveToLastNonblankCharacterOfLineAndDown.prototype.inclusive = true;

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getPoint = function(_arg) {
      var from, point, row;
      row = _arg.row;
      row = Math.min(row + this.getCount(), getVimLastBufferRow(this.editor));
      from = new Point(row, Infinity);
      point = getStartPositionForPattern(this.editor, from, /\s*$/);
      return (point != null ? point : from).translate([0, -1]);
    };

    return MoveToLastNonblankCharacterOfLineAndDown;

  })(Motion);

  MoveToFirstCharacterOfLine = (function(_super) {
    __extends(MoveToFirstCharacterOfLine, _super);

    function MoveToFirstCharacterOfLine() {
      return MoveToFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLine.extend();

    MoveToFirstCharacterOfLine.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    MoveToFirstCharacterOfLine.prototype.getPoint = function(cursor) {
      return getFirstCharacterPositionForBufferRow(this.editor, cursor.getBufferRow());
    };

    return MoveToFirstCharacterOfLine;

  })(Motion);

  MoveToFirstCharacterOfLineUp = (function(_super) {
    __extends(MoveToFirstCharacterOfLineUp, _super);

    function MoveToFirstCharacterOfLineUp() {
      return MoveToFirstCharacterOfLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineUp.extend();

    MoveToFirstCharacterOfLineUp.prototype.linewise = true;

    MoveToFirstCharacterOfLineUp.prototype.moveCursor = function(cursor) {
      this.countTimes(function() {
        return moveCursorUpBuffer(cursor);
      });
      return MoveToFirstCharacterOfLineUp.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineUp;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineDown, _super);

    function MoveToFirstCharacterOfLineDown() {
      return MoveToFirstCharacterOfLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineDown.extend();

    MoveToFirstCharacterOfLineDown.prototype.linewise = true;

    MoveToFirstCharacterOfLineDown.prototype.moveCursor = function(cursor) {
      this.countTimes(function() {
        return moveCursorDownBuffer(cursor);
      });
      return MoveToFirstCharacterOfLineDown.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineDown;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineAndDown, _super);

    function MoveToFirstCharacterOfLineAndDown() {
      return MoveToFirstCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineAndDown.extend();

    MoveToFirstCharacterOfLineAndDown.prototype.defaultCount = 0;

    MoveToFirstCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToFirstCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    return MoveToFirstCharacterOfLineAndDown;

  })(MoveToFirstCharacterOfLineDown);

  MoveToFirstLine = (function(_super) {
    __extends(MoveToFirstLine, _super);

    function MoveToFirstLine() {
      return MoveToFirstLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstLine.extend();

    MoveToFirstLine.prototype.linewise = true;

    MoveToFirstLine.prototype.defaultCount = null;

    MoveToFirstLine.prototype.moveCursor = function(cursor) {
      cursor.setBufferPosition(this.getPoint());
      return cursor.autoscroll({
        center: true
      });
    };

    MoveToFirstLine.prototype.getPoint = function() {
      return getFirstCharacterPositionForBufferRow(this.editor, this.getRow());
    };

    MoveToFirstLine.prototype.getRow = function() {
      var count;
      if ((count = this.getCount())) {
        return count - 1;
      } else {
        return this.getDefaultRow();
      }
    };

    MoveToFirstLine.prototype.getDefaultRow = function() {
      return 0;
    };

    return MoveToFirstLine;

  })(Motion);

  MoveToLastLine = (function(_super) {
    __extends(MoveToLastLine, _super);

    function MoveToLastLine() {
      return MoveToLastLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastLine.extend();

    MoveToLastLine.prototype.getDefaultRow = function() {
      return getVimLastBufferRow(this.editor);
    };

    return MoveToLastLine;

  })(MoveToFirstLine);

  MoveToLineByPercent = (function(_super) {
    __extends(MoveToLineByPercent, _super);

    function MoveToLineByPercent() {
      return MoveToLineByPercent.__super__.constructor.apply(this, arguments);
    }

    MoveToLineByPercent.extend();

    MoveToLineByPercent.prototype.getRow = function() {
      var percent;
      percent = Math.min(100, this.getCount());
      return Math.floor(getVimLastScreenRow(this.editor) * (percent / 100));
    };

    return MoveToLineByPercent;

  })(MoveToFirstLine);

  MoveToRelativeLine = (function(_super) {
    __extends(MoveToRelativeLine, _super);

    function MoveToRelativeLine() {
      return MoveToRelativeLine.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLine.extend(false);

    MoveToRelativeLine.prototype.linewise = true;

    MoveToRelativeLine.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      return cursor.setBufferPosition(point);
    };

    MoveToRelativeLine.prototype.getCount = function() {
      return MoveToRelativeLine.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToRelativeLine.prototype.getPoint = function(_arg) {
      var row;
      row = _arg.row;
      return [row + this.getCount(), 0];
    };

    return MoveToRelativeLine;

  })(Motion);

  MoveToRelativeLineWithMinimum = (function(_super) {
    __extends(MoveToRelativeLineWithMinimum, _super);

    function MoveToRelativeLineWithMinimum() {
      return MoveToRelativeLineWithMinimum.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLineWithMinimum.extend(false);

    MoveToRelativeLineWithMinimum.prototype.min = 0;

    MoveToRelativeLineWithMinimum.prototype.getCount = function() {
      return Math.max(this.min, MoveToRelativeLineWithMinimum.__super__.getCount.apply(this, arguments));
    };

    return MoveToRelativeLineWithMinimum;

  })(MoveToRelativeLine);

  MoveToTopOfScreen = (function(_super) {
    __extends(MoveToTopOfScreen, _super);

    function MoveToTopOfScreen() {
      return MoveToTopOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToTopOfScreen.extend();

    MoveToTopOfScreen.prototype.linewise = true;

    MoveToTopOfScreen.prototype.scrolloff = 2;

    MoveToTopOfScreen.prototype.defaultCount = 0;

    MoveToTopOfScreen.prototype.getCount = function() {
      return MoveToTopOfScreen.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToTopOfScreen.prototype.moveCursor = function(cursor) {
      return cursor.setBufferPosition(this.getPoint());
    };

    MoveToTopOfScreen.prototype.getPoint = function() {
      return getFirstCharacterBufferPositionForScreenRow(this.editor, this.getRow());
    };

    MoveToTopOfScreen.prototype.getRow = function() {
      var offset, row;
      row = getFirstVisibleScreenRow(this.editor);
      offset = this.scrolloff;
      if (row === 0) {
        offset = 0;
      }
      return row + Math.max(this.getCount(), offset);
    };

    return MoveToTopOfScreen;

  })(Motion);

  MoveToMiddleOfScreen = (function(_super) {
    __extends(MoveToMiddleOfScreen, _super);

    function MoveToMiddleOfScreen() {
      return MoveToMiddleOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToMiddleOfScreen.extend();

    MoveToMiddleOfScreen.prototype.getRow = function() {
      var endRow, startRow, vimLastScreenRow;
      startRow = getFirstVisibleScreenRow(this.editor);
      vimLastScreenRow = getVimLastScreenRow(this.editor);
      endRow = Math.min(this.editor.getLastVisibleScreenRow(), vimLastScreenRow);
      return startRow + Math.floor((endRow - startRow) / 2);
    };

    return MoveToMiddleOfScreen;

  })(MoveToTopOfScreen);

  MoveToBottomOfScreen = (function(_super) {
    __extends(MoveToBottomOfScreen, _super);

    function MoveToBottomOfScreen() {
      return MoveToBottomOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToBottomOfScreen.extend();

    MoveToBottomOfScreen.prototype.getRow = function() {
      var offset, row, vimLastScreenRow;
      vimLastScreenRow = getVimLastScreenRow(this.editor);
      row = Math.min(this.editor.getLastVisibleScreenRow(), vimLastScreenRow);
      offset = this.scrolloff + 1;
      if (row === vimLastScreenRow) {
        offset = 0;
      }
      return row - Math.max(this.getCount(), offset);
    };

    return MoveToBottomOfScreen;

  })(MoveToTopOfScreen);

  ScrollFullScreenDown = (function(_super) {
    __extends(ScrollFullScreenDown, _super);

    function ScrollFullScreenDown() {
      return ScrollFullScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenDown.extend();

    ScrollFullScreenDown.prototype.coefficient = +1;

    ScrollFullScreenDown.prototype.initialize = function() {
      var amountInPixel;
      this.rowsToScroll = this.editor.getRowsPerPage() * this.coefficient;
      amountInPixel = this.rowsToScroll * this.editor.getLineHeightInPixels();
      return this.newScrollTop = this.editorElement.getScrollTop() + amountInPixel;
    };

    ScrollFullScreenDown.prototype.scroll = function() {
      return this.editorElement.setScrollTop(this.newScrollTop);
    };

    ScrollFullScreenDown.prototype.select = function() {
      ScrollFullScreenDown.__super__.select.apply(this, arguments);
      return this.scroll();
    };

    ScrollFullScreenDown.prototype.execute = function() {
      ScrollFullScreenDown.__super__.execute.apply(this, arguments);
      return this.scroll();
    };

    ScrollFullScreenDown.prototype.moveCursor = function(cursor) {
      var row;
      row = Math.floor(this.editor.getCursorScreenPosition().row + this.rowsToScroll);
      row = Math.min(getVimLastScreenRow(this.editor), row);
      return cursor.setScreenPosition([row, 0], {
        autoscroll: false
      });
    };

    return ScrollFullScreenDown;

  })(Motion);

  ScrollFullScreenUp = (function(_super) {
    __extends(ScrollFullScreenUp, _super);

    function ScrollFullScreenUp() {
      return ScrollFullScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenUp.extend();

    ScrollFullScreenUp.prototype.coefficient = -1;

    return ScrollFullScreenUp;

  })(ScrollFullScreenDown);

  ScrollHalfScreenDown = (function(_super) {
    __extends(ScrollHalfScreenDown, _super);

    function ScrollHalfScreenDown() {
      return ScrollHalfScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenDown.extend();

    ScrollHalfScreenDown.prototype.coefficient = +1 / 2;

    return ScrollHalfScreenDown;

  })(ScrollFullScreenDown);

  ScrollHalfScreenUp = (function(_super) {
    __extends(ScrollHalfScreenUp, _super);

    function ScrollHalfScreenUp() {
      return ScrollHalfScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenUp.extend();

    ScrollHalfScreenUp.prototype.coefficient = -1 / 2;

    return ScrollHalfScreenUp;

  })(ScrollHalfScreenDown);

  Find = (function(_super) {
    __extends(Find, _super);

    function Find() {
      return Find.__super__.constructor.apply(this, arguments);
    }

    Find.extend();

    Find.prototype.backwards = false;

    Find.prototype.inclusive = true;

    Find.prototype.hover = {
      icon: ':find:',
      emoji: ':mag_right:'
    };

    Find.prototype.offset = 0;

    Find.prototype.requireInput = true;

    Find.prototype.initialize = function() {
      if (!this.isRepeated()) {
        return this.focusInput();
      }
    };

    Find.prototype.isBackwards = function() {
      return this.backwards;
    };

    Find.prototype.getPoint = function(fromPoint) {
      var end, method, offset, points, scanRange, start, unOffset, _ref2, _ref3;
      _ref2 = this.editor.bufferRangeForBufferRow(fromPoint.row), start = _ref2.start, end = _ref2.end;
      offset = this.isBackwards() ? this.offset : -this.offset;
      unOffset = -offset * this.isRepeated();
      if (this.isBackwards()) {
        scanRange = [start, fromPoint.translate([0, unOffset])];
        method = 'backwardsScanInBufferRange';
      } else {
        scanRange = [fromPoint.translate([0, 1 + unOffset]), end];
        method = 'scanInBufferRange';
      }
      points = [];
      this.editor[method](RegExp("" + (_.escapeRegExp(this.input)), "g"), scanRange, function(_arg) {
        var range;
        range = _arg.range;
        return points.push(range.start);
      });
      return (_ref3 = points[this.getCount()]) != null ? _ref3.translate([0, offset]) : void 0;
    };

    Find.prototype.getCount = function() {
      return Find.__super__.getCount.apply(this, arguments) - 1;
    };

    Find.prototype.moveCursor = function(cursor) {
      var point;
      point = this.getPoint(cursor.getBufferPosition());
      this.setBufferPositionSafely(cursor, point);
      if (!this.isRepeated()) {
        return globalState.currentFind = this;
      }
    };

    return Find;

  })(Motion);

  FindBackwards = (function(_super) {
    __extends(FindBackwards, _super);

    function FindBackwards() {
      return FindBackwards.__super__.constructor.apply(this, arguments);
    }

    FindBackwards.extend();

    FindBackwards.prototype.inclusive = false;

    FindBackwards.prototype.backwards = true;

    FindBackwards.prototype.hover = {
      icon: ':find:',
      emoji: ':mag:'
    };

    return FindBackwards;

  })(Find);

  Till = (function(_super) {
    __extends(Till, _super);

    function Till() {
      return Till.__super__.constructor.apply(this, arguments);
    }

    Till.extend();

    Till.prototype.offset = 1;

    Till.prototype.getPoint = function() {
      return this.point = Till.__super__.getPoint.apply(this, arguments);
    };

    Till.prototype.selectInclusively = function(selection) {
      Till.__super__.selectInclusively.apply(this, arguments);
      if (selection.isEmpty() && ((this.point != null) && !this.backwards)) {
        return selection.selectRight();
      }
    };

    return Till;

  })(Find);

  TillBackwards = (function(_super) {
    __extends(TillBackwards, _super);

    function TillBackwards() {
      return TillBackwards.__super__.constructor.apply(this, arguments);
    }

    TillBackwards.extend();

    TillBackwards.prototype.inclusive = false;

    TillBackwards.prototype.backwards = true;

    return TillBackwards;

  })(Till);

  RepeatFind = (function(_super) {
    __extends(RepeatFind, _super);

    function RepeatFind() {
      return RepeatFind.__super__.constructor.apply(this, arguments);
    }

    RepeatFind.extend();

    RepeatFind.prototype.repeated = true;

    RepeatFind.prototype.initialize = function() {
      var findObj;
      if (!(findObj = globalState.currentFind)) {
        this.abort();
      }
      return this.offset = findObj.offset, this.backwards = findObj.backwards, this.input = findObj.input, findObj;
    };

    return RepeatFind;

  })(Find);

  RepeatFindReverse = (function(_super) {
    __extends(RepeatFindReverse, _super);

    function RepeatFindReverse() {
      return RepeatFindReverse.__super__.constructor.apply(this, arguments);
    }

    RepeatFindReverse.extend();

    RepeatFindReverse.prototype.isBackwards = function() {
      return !this.backwards;
    };

    return RepeatFindReverse;

  })(RepeatFind);

  MoveToMark = (function(_super) {
    __extends(MoveToMark, _super);

    function MoveToMark() {
      return MoveToMark.__super__.constructor.apply(this, arguments);
    }

    MoveToMark.extend();

    MoveToMark.prototype.requireInput = true;

    MoveToMark.prototype.hover = {
      icon: ":move-to-mark:`",
      emoji: ":round_pushpin:`"
    };

    MoveToMark.prototype.initialize = function() {
      return this.focusInput();
    };

    MoveToMark.prototype.getPoint = function(fromPoint) {
      var input, point;
      input = this.getInput();
      point = null;
      point = this.vimState.mark.get(input);
      if (input === '`') {
        if (point == null) {
          point = [0, 0];
        }
        this.vimState.mark.set('`', fromPoint);
      }
      if ((point != null) && this.linewise) {
        point = getFirstCharacterPositionForBufferRow(this.editor, point.row);
      }
      return point;
    };

    MoveToMark.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getBufferPosition();
      return this.setBufferPositionSafely(cursor, this.getPoint(point));
    };

    return MoveToMark;

  })(Motion);

  MoveToMarkLine = (function(_super) {
    __extends(MoveToMarkLine, _super);

    function MoveToMarkLine() {
      return MoveToMarkLine.__super__.constructor.apply(this, arguments);
    }

    MoveToMarkLine.extend();

    MoveToMarkLine.prototype.linewise = true;

    MoveToMarkLine.prototype.hover = {
      icon: ":move-to-mark:'",
      emoji: ":round_pushpin:'"
    };

    return MoveToMarkLine;

  })(MoveToMark);

  SearchBase = (function(_super) {
    __extends(SearchBase, _super);

    function SearchBase() {
      return SearchBase.__super__.constructor.apply(this, arguments);
    }

    SearchBase.extend(false);

    SearchBase.prototype.backwards = false;

    SearchBase.prototype.useRegexp = true;

    SearchBase.prototype.configScope = null;

    SearchBase.prototype.getCount = function() {
      var count;
      count = SearchBase.__super__.getCount.apply(this, arguments) - 1;
      if (this.isBackwards()) {
        count = -count;
      }
      return count;
    };

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.isCaseSensitive = function(term) {
      switch (this.getCaseSensitivity()) {
        case 'smartcase':
          return term.search('[A-Z]') !== -1;
        case 'insensitive':
          return false;
        case 'sensitive':
          return true;
      }
    };

    SearchBase.prototype.getCaseSensitivity = function() {
      if (settings.get("useSmartcaseFor" + this.configScope)) {
        return 'smartcase';
      } else if (settings.get("ignoreCaseFor" + this.configScope)) {
        return 'insensitive';
      } else {
        return 'sensitive';
      }
    };

    SearchBase.prototype.finish = function() {
      var _ref2;
      if ((typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0) && settings.get('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      if ((_ref2 = this.matches) != null) {
        _ref2.destroy();
      }
      return this.matches = null;
    };

    SearchBase.prototype.flashScreen = function() {
      highlightRanges(this.editor, getVisibleBufferRange(this.editor), {
        "class": 'vim-mode-plus-flash',
        timeout: 100
      });
      return atom.beep();
    };

    SearchBase.prototype.getPoint = function(cursor) {
      var input;
      input = this.getInput();
      if (this.matches == null) {
        this.matches = this.getMatchList(cursor, input);
      }
      if (this.matches.isEmpty()) {
        return null;
      } else {
        return this.matches.getCurrentStartPosition();
      }
    };

    SearchBase.prototype.moveCursor = function(cursor) {
      var input, point;
      input = this.getInput();
      if (input === '') {
        this.finish();
        return;
      }
      if (point = this.getPoint(cursor)) {
        this.visitMatch("current", {
          timeout: settings.get('showHoverSearchCounterDuration'),
          landing: true
        });
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
      } else {
        if (settings.get('flashScreenOnSearchHasNoMatch')) {
          this.flashScreen();
        }
      }
      globalState.currentSearch = this;
      this.vimState.searchHistory.save(input);
      globalState.highlightSearchPattern = this.getPattern(input);
      this.vimState.main.emitDidSetHighlightSearchPattern();
      return this.finish();
    };

    SearchBase.prototype.getFromPoint = function(cursor) {
      if (this.isMode('visual', 'linewise') && (typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0)) {
        return swrap(cursor.selection).getCharacterwiseHeadPosition();
      } else {
        return cursor.getBufferPosition();
      }
    };

    SearchBase.prototype.getMatchList = function(cursor, input) {
      return MatchList.fromScan(this.editor, {
        fromPoint: this.getFromPoint(cursor),
        pattern: this.getPattern(input),
        direction: (this.isBackwards() ? 'backward' : 'forward'),
        countOffset: this.getCount()
      });
    };

    SearchBase.prototype.visitMatch = function(direction, options) {
      var flashOptions, landing, match, timeout;
      if (direction == null) {
        direction = null;
      }
      if (options == null) {
        options = {};
      }
      timeout = options.timeout, landing = options.landing;
      if (landing == null) {
        landing = false;
      }
      match = this.matches.get(direction);
      match.scrollToStartPoint();
      flashOptions = {
        "class": 'vim-mode-plus-flash',
        timeout: settings.get('flashOnSearchDuration')
      };
      if (landing) {
        if (settings.get('flashOnSearch') && !(typeof this.isIncrementalSearch === "function" ? this.isIncrementalSearch() : void 0)) {
          match.flash(flashOptions);
        }
      } else {
        this.matches.refresh();
        if (settings.get('flashOnSearch')) {
          match.flash(flashOptions);
        }
      }
      if (settings.get('showHoverSearchCounter')) {
        return this.vimState.hoverSearchCounter.withTimeout(match.getStartPoint(), {
          text: this.matches.getCounterText(),
          classList: match.getClassList(),
          timeout: timeout
        });
      }
    };

    return SearchBase;

  })(Motion);

  Search = (function(_super) {
    __extends(Search, _super);

    function Search() {
      return Search.__super__.constructor.apply(this, arguments);
    }

    Search.extend();

    Search.prototype.configScope = "Search";

    Search.prototype.requireInput = true;

    Search.prototype.isIncrementalSearch = function() {
      return settings.get('incrementalSearch');
    };

    Search.prototype.initialize = function() {
      if (this.isIncrementalSearch()) {
        this.setIncrementalSearch();
      }
      this.onDidConfirmSearch((function(_this) {
        return function(input) {
          var searchChar, _ref2;
          _this.input = input;
          if (!_this.isIncrementalSearch()) {
            searchChar = _this.isBackwards() ? '?' : '/';
            if ((_ref2 = _this.input) === '' || _ref2 === searchChar) {
              _this.input = _this.vimState.searchHistory.get('prev');
              if (!_this.input) {
                atom.beep();
              }
            }
          }
          return _this.processOperation();
        };
      })(this));
      this.onDidCancelSearch((function(_this) {
        return function() {
          if (!(_this.isMode('visual') || _this.isMode('insert'))) {
            _this.vimState.resetNormalMode();
          }
          if (typeof _this.restoreEditorState === "function") {
            _this.restoreEditorState();
          }
          _this.vimState.reset();
          return _this.finish();
        };
      })(this));
      this.onDidChangeSearch((function(_this) {
        return function(input) {
          _this.input = input;
          if (_this.input.startsWith(' ')) {
            _this.useRegexp = false;
            _this.input = input.replace(/^ /, '');
          } else {
            _this.useRegexp = true;
          }
          _this.vimState.searchInput.updateOptionSettings({
            useRegexp: _this.useRegexp
          });
          if (_this.isIncrementalSearch()) {
            return _this.visitCursors();
          }
        };
      })(this));
      return this.vimState.searchInput.focus({
        backwards: this.backwards
      });
    };

    Search.prototype.setIncrementalSearch = function() {
      this.restoreEditorState = saveEditorState(this.editor);
      this.subscribe(this.editorElement.onDidChangeScrollTop((function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.matches) != null ? _ref2.refresh() : void 0;
        };
      })(this)));
      this.subscribe(this.editorElement.onDidChangeScrollLeft((function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.matches) != null ? _ref2.refresh() : void 0;
        };
      })(this)));
      return this.onDidCommandSearch((function(_this) {
        return function(command) {
          if (!_this.input) {
            return;
          }
          if (_this.matches.isEmpty()) {
            return;
          }
          switch (command) {
            case 'visit-next':
              return _this.visitMatch('next');
            case 'visit-prev':
              return _this.visitMatch('prev');
          }
        };
      })(this));
    };

    Search.prototype.visitCursors = function() {
      var cursor, input, visitCursor, _i, _len, _ref2, _ref3, _results;
      visitCursor = (function(_this) {
        return function(cursor) {
          if (_this.matches == null) {
            _this.matches = _this.getMatchList(cursor, input);
          }
          if (_this.matches.isEmpty()) {
            if (settings.get('flashScreenOnSearchHasNoMatch')) {
              return _this.flashScreen();
            }
          } else {
            return _this.visitMatch();
          }
        };
      })(this);
      if ((_ref2 = this.matches) != null) {
        _ref2.destroy();
      }
      this.matches = null;
      if (settings.get('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      input = this.getInput();
      if (input !== '') {
        _ref3 = this.editor.getCursors();
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          cursor = _ref3[_i];
          _results.push(visitCursor(cursor));
        }
        return _results;
      }
    };

    Search.prototype.getPattern = function(term) {
      var modifiers;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (__indexOf.call(modifiers, 'i') < 0) {
          modifiers += 'i';
        }
      }
      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (_error) {
          return new RegExp(_.escapeRegExp(term), modifiers);
        }
      } else {
        return new RegExp(_.escapeRegExp(term), modifiers);
      }
    };

    return Search;

  })(SearchBase);

  SearchBackwards = (function(_super) {
    __extends(SearchBackwards, _super);

    function SearchBackwards() {
      return SearchBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchBackwards.extend();

    SearchBackwards.prototype.backwards = true;

    return SearchBackwards;

  })(Search);

  SearchCurrentWord = (function(_super) {
    __extends(SearchCurrentWord, _super);

    function SearchCurrentWord() {
      return SearchCurrentWord.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWord.extend();

    SearchCurrentWord.prototype.configScope = "SearchCurrentWord";

    SearchCurrentWord.prototype.getInput = function() {
      var wordRange;
      return this.input != null ? this.input : this.input = (wordRange = this.getCurrentWordBufferRange(), wordRange != null ? (this.editor.setCursorBufferPosition(wordRange.start), this.editor.getTextInBufferRange(wordRange)) : '');
    };

    SearchCurrentWord.prototype.getPattern = function(term) {
      var modifiers, pattern;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      pattern = _.escapeRegExp(term);
      if (/\W/.test(term)) {
        return new RegExp("" + pattern + "\\b", modifiers);
      } else {
        return new RegExp("\\b" + pattern + "\\b", modifiers);
      }
    };

    SearchCurrentWord.prototype.getCurrentWordBufferRange = function() {
      var cursorPosition, pattern, scanRange, wordRange, _ref2;
      wordRange = null;
      cursorPosition = this.editor.getCursorBufferPosition();
      scanRange = this.editor.bufferRangeForBufferRow(cursorPosition.row);
      pattern = new RegExp((_ref2 = settings.get('iskeyword')) != null ? _ref2 : IsKeywordDefault, 'g');
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.end.isGreaterThan(cursorPosition)) {
          wordRange = range;
          return stop();
        }
      });
      return wordRange;
    };

    return SearchCurrentWord;

  })(SearchBase);

  SearchCurrentWordBackwards = (function(_super) {
    __extends(SearchCurrentWordBackwards, _super);

    function SearchCurrentWordBackwards() {
      return SearchCurrentWordBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWordBackwards.extend();

    SearchCurrentWordBackwards.prototype.backwards = true;

    return SearchCurrentWordBackwards;

  })(SearchCurrentWord);

  RepeatSearch = (function(_super) {
    __extends(RepeatSearch, _super);

    function RepeatSearch() {
      return RepeatSearch.__super__.constructor.apply(this, arguments);
    }

    RepeatSearch.extend();

    RepeatSearch.prototype.initialize = function() {
      var search;
      if (!(search = globalState.currentSearch)) {
        this.abort();
      }
      return this.input = search.input, this.backwards = search.backwards, this.getPattern = search.getPattern, this.getCaseSensitivity = search.getCaseSensitivity, this.configScope = search.configScope, search;
    };

    return RepeatSearch;

  })(SearchBase);

  RepeatSearchReverse = (function(_super) {
    __extends(RepeatSearchReverse, _super);

    function RepeatSearchReverse() {
      return RepeatSearchReverse.__super__.constructor.apply(this, arguments);
    }

    RepeatSearchReverse.extend();

    RepeatSearchReverse.prototype.isBackwards = function() {
      return !this.backwards;
    };

    return RepeatSearchReverse;

  })(RepeatSearch);

  MoveToPreviousFoldStart = (function(_super) {
    __extends(MoveToPreviousFoldStart, _super);

    function MoveToPreviousFoldStart() {
      return MoveToPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStart.extend();

    MoveToPreviousFoldStart.description = "Move to previous fold start";

    MoveToPreviousFoldStart.prototype.linewise = true;

    MoveToPreviousFoldStart.prototype.which = 'start';

    MoveToPreviousFoldStart.prototype.direction = 'prev';

    MoveToPreviousFoldStart.prototype.initialize = function() {
      this.rows = this.getFoldRow(this.which);
      if (this.direction === 'prev') {
        return this.rows.reverse();
      }
    };

    MoveToPreviousFoldStart.prototype.getFoldRow = function(which) {
      var index, rows;
      index = which === 'start' ? 0 : 1;
      rows = getCodeFoldRowRanges(this.editor).map(function(rowRange) {
        return rowRange[index];
      });
      return _.sortBy(_.uniq(rows), function(row) {
        return row;
      });
    };

    MoveToPreviousFoldStart.prototype.getScanRows = function(cursor) {
      var cursorRow, isValidRow;
      cursorRow = cursor.getBufferRow();
      isValidRow = (function() {
        switch (this.direction) {
          case 'prev':
            return function(row) {
              return row < cursorRow;
            };
          case 'next':
            return function(row) {
              return row > cursorRow;
            };
        }
      }).call(this);
      return this.rows.filter(isValidRow);
    };

    MoveToPreviousFoldStart.prototype.detectRow = function(cursor) {
      return this.getScanRows(cursor)[0];
    };

    MoveToPreviousFoldStart.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var row;
          if ((row = _this.detectRow(cursor)) != null) {
            return moveCursorToFirstCharacterAtRow(cursor, row);
          }
        };
      })(this));
    };

    return MoveToPreviousFoldStart;

  })(Motion);

  MoveToNextFoldStart = (function(_super) {
    __extends(MoveToNextFoldStart, _super);

    function MoveToNextFoldStart() {
      return MoveToNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStart.extend();

    MoveToNextFoldStart.description = "Move to next fold start";

    MoveToNextFoldStart.prototype.direction = 'next';

    return MoveToNextFoldStart;

  })(MoveToPreviousFoldStart);

  MoveToPreviousFoldStartWithSameIndent = (function(_super) {
    __extends(MoveToPreviousFoldStartWithSameIndent, _super);

    function MoveToPreviousFoldStartWithSameIndent() {
      return MoveToPreviousFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStartWithSameIndent.extend();

    MoveToPreviousFoldStartWithSameIndent.description = "Move to previous same-indented fold start";

    MoveToPreviousFoldStartWithSameIndent.prototype.detectRow = function(cursor) {
      var baseIndentLevel, row, _i, _len, _ref2;
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, cursor.getBufferRow());
      _ref2 = this.getScanRows(cursor);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        if (getIndentLevelForBufferRow(this.editor, row) === baseIndentLevel) {
          return row;
        }
      }
      return null;
    };

    return MoveToPreviousFoldStartWithSameIndent;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldStartWithSameIndent = (function(_super) {
    __extends(MoveToNextFoldStartWithSameIndent, _super);

    function MoveToNextFoldStartWithSameIndent() {
      return MoveToNextFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStartWithSameIndent.extend();

    MoveToNextFoldStartWithSameIndent.description = "Move to next same-indented fold start";

    MoveToNextFoldStartWithSameIndent.prototype.direction = 'next';

    return MoveToNextFoldStartWithSameIndent;

  })(MoveToPreviousFoldStartWithSameIndent);

  MoveToPreviousFoldEnd = (function(_super) {
    __extends(MoveToPreviousFoldEnd, _super);

    function MoveToPreviousFoldEnd() {
      return MoveToPreviousFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldEnd.extend();

    MoveToPreviousFoldEnd.description = "Move to previous fold end";

    MoveToPreviousFoldEnd.prototype.which = 'end';

    return MoveToPreviousFoldEnd;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldEnd = (function(_super) {
    __extends(MoveToNextFoldEnd, _super);

    function MoveToNextFoldEnd() {
      return MoveToNextFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldEnd.extend();

    MoveToNextFoldEnd.description = "Move to next fold end";

    MoveToNextFoldEnd.prototype.direction = 'next';

    return MoveToNextFoldEnd;

  })(MoveToPreviousFoldEnd);

  MoveToPreviousFunction = (function(_super) {
    __extends(MoveToPreviousFunction, _super);

    function MoveToPreviousFunction() {
      return MoveToPreviousFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFunction.extend();

    MoveToPreviousFunction.description = "Move to previous function";

    MoveToPreviousFunction.prototype.direction = 'prev';

    MoveToPreviousFunction.prototype.detectRow = function(cursor) {
      return _.detect(this.getScanRows(cursor), (function(_this) {
        return function(row) {
          return isIncludeFunctionScopeForRow(_this.editor, row);
        };
      })(this));
    };

    return MoveToPreviousFunction;

  })(MoveToPreviousFoldStart);

  MoveToNextFunction = (function(_super) {
    __extends(MoveToNextFunction, _super);

    function MoveToNextFunction() {
      return MoveToNextFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFunction.extend();

    MoveToNextFunction.description = "Move to next function";

    MoveToNextFunction.prototype.direction = 'next';

    return MoveToNextFunction;

  })(MoveToPreviousFunction);

  MoveToPositionByScope = (function(_super) {
    __extends(MoveToPositionByScope, _super);

    function MoveToPositionByScope() {
      return MoveToPositionByScope.__super__.constructor.apply(this, arguments);
    }

    MoveToPositionByScope.extend(false);

    MoveToPositionByScope.prototype.direction = 'backward';

    MoveToPositionByScope.prototype.scope = '.';

    MoveToPositionByScope.prototype.getPoint = function(fromPoint) {
      return detectScopeStartPositionForScope(this.editor, fromPoint, this.direction, this.scope);
    };

    MoveToPositionByScope.prototype.moveCursor = function(cursor) {
      var point;
      point = cursor.getBufferPosition();
      this.countTimes((function(_this) {
        return function(_arg) {
          var newPoint, stop;
          stop = _arg.stop;
          if ((newPoint = _this.getPoint(point))) {
            return point = newPoint;
          } else {
            return stop();
          }
        };
      })(this));
      return this.setBufferPositionSafely(cursor, point);
    };

    return MoveToPositionByScope;

  })(Motion);

  MoveToPreviousString = (function(_super) {
    __extends(MoveToPreviousString, _super);

    function MoveToPreviousString() {
      return MoveToPreviousString.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousString.extend();

    MoveToPreviousString.description = "Move to previous string(searched by `string.begin` scope)";

    MoveToPreviousString.prototype.direction = 'backward';

    MoveToPreviousString.prototype.scope = 'string.begin';

    return MoveToPreviousString;

  })(MoveToPositionByScope);

  MoveToNextString = (function(_super) {
    __extends(MoveToNextString, _super);

    function MoveToNextString() {
      return MoveToNextString.__super__.constructor.apply(this, arguments);
    }

    MoveToNextString.extend();

    MoveToNextString.description = "Move to next string(searched by `string.begin` scope)";

    MoveToNextString.prototype.direction = 'forward';

    return MoveToNextString;

  })(MoveToPreviousString);

  MoveToPreviousNumber = (function(_super) {
    __extends(MoveToPreviousNumber, _super);

    function MoveToPreviousNumber() {
      return MoveToPreviousNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousNumber.extend();

    MoveToPreviousNumber.prototype.direction = 'backward';

    MoveToPreviousNumber.description = "Move to previous number(searched by `constant.numeric` scope)";

    MoveToPreviousNumber.prototype.scope = 'constant.numeric';

    return MoveToPreviousNumber;

  })(MoveToPositionByScope);

  MoveToNextNumber = (function(_super) {
    __extends(MoveToNextNumber, _super);

    function MoveToNextNumber() {
      return MoveToNextNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToNextNumber.extend();

    MoveToNextNumber.description = "Move to next number(searched by `constant.numeric` scope)";

    MoveToNextNumber.prototype.direction = 'forward';

    return MoveToNextNumber;

  })(MoveToPreviousNumber);

  MoveToPair = (function(_super) {
    __extends(MoveToPair, _super);

    function MoveToPair() {
      return MoveToPair.__super__.constructor.apply(this, arguments);
    }

    MoveToPair.extend();

    MoveToPair.prototype.inclusive = true;

    MoveToPair.prototype.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket'];

    MoveToPair.prototype.moveCursor = function(cursor) {
      return this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    };

    MoveToPair.prototype.getPoint = function(cursor) {
      var cursorPosition, cursorRow, enclosingRange, enclosingRanges, forwardingRanges, ranges, _ref2, _ref3;
      ranges = this["new"]("AAnyPair", {
        allowForwarding: true,
        member: this.member
      }).getRanges(cursor.selection);
      cursorPosition = cursor.getBufferPosition();
      cursorRow = cursorPosition.row;
      ranges = ranges.filter(function(_arg) {
        var end, start;
        start = _arg.start, end = _arg.end;
        if ((cursorRow === start.row) && start.isGreaterThanOrEqual(cursorPosition)) {
          return true;
        }
        if ((cursorRow === end.row) && end.isGreaterThanOrEqual(cursorPosition)) {
          return true;
        }
      });
      if (!ranges.length) {
        return null;
      }
      _ref2 = _.partition(ranges, function(range) {
        return range.containsPoint(cursorPosition, true);
      }), enclosingRanges = _ref2[0], forwardingRanges = _ref2[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return ((_ref3 = forwardingRanges[0]) != null ? _ref3.end.translate([0, -1]) : void 0) || (enclosingRange != null ? enclosingRange.start : void 0);
    };

    return MoveToPair;

  })(Motion);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseXRFQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUhkLENBQUE7O0FBQUEsRUFJQSxRQTBCSSxPQUFBLENBQVEsU0FBUixDQTFCSixFQUNFLHdCQUFBLGVBREYsRUFDbUIsOEJBQUEscUJBRG5CLEVBRUUsdUJBQUEsY0FGRixFQUVrQix3QkFBQSxlQUZsQixFQUdFLHFCQUFBLFlBSEYsRUFHZ0IsdUJBQUEsY0FIaEIsRUFJRSw2QkFBQSxvQkFKRixFQUtFLDJCQUFBLGtCQUxGLEVBTUUsK0JBQUEsc0JBTkYsRUFPRSxpQ0FBQSx3QkFQRixFQU80QixnQ0FBQSx1QkFQNUIsRUFRRSxnQ0FBQSx1QkFSRixFQVNFLDRCQUFBLG1CQVRGLEVBU3VCLDRCQUFBLG1CQVR2QixFQVVFLDZCQUFBLG9CQVZGLEVBVXdCLDZCQUFBLG9CQVZ4QixFQVdFLHdCQUFBLGVBWEYsRUFZRSx3Q0FBQSwrQkFaRixFQWFFLG1CQUFBLFVBYkYsRUFjRSxtQ0FBQSwwQkFkRixFQWVFLDZCQUFBLG9CQWZGLEVBZ0JFLHNDQUFBLDZCQWhCRixFQWlCRSwyQkFBQSxrQkFqQkYsRUFrQkUsNkJBQUEsb0JBbEJGLEVBbUJFLHFDQUFBLDRCQW5CRixFQW9CRSx5Q0FBQSxnQ0FwQkYsRUFxQkUsc0JBQUEsYUFyQkYsRUFzQkUsbUNBQUEsMEJBdEJGLEVB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/motion.coffee
