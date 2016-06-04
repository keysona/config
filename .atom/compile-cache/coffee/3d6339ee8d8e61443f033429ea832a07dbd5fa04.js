(function() {
  var Base, CurrentSelection, Find, FindBackwards, IsKeywordDefault, MatchList, Motion, MoveDown, MoveDownToEdge, MoveLeft, MoveRight, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextParagraph, MoveToNextSmartWord, MoveToNextString, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousParagraph, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineWithMinimum, MoveToTopOfScreen, MoveUp, MoveUpToEdge, Point, Range, RepeatFind, RepeatFindReverse, RepeatSearch, RepeatSearchReverse, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, Till, TillBackwards, cursorIsAtEmptyRow, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, detectScopeStartPositionForScope, getBufferRows, getCodeFoldRowRanges, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getLastVisibleScreenRow, getStartPositionForPattern, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, getVisibleBufferRange, globalState, highlightRanges, isIncludeFunctionScopeForRow, moveCursorDown, moveCursorDownBuffer, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, moveCursorUpBuffer, saveEditorState, settings, sortRanges, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  globalState = require('./global-state');

  _ref1 = require('./utils'), saveEditorState = _ref1.saveEditorState, getVisibleBufferRange = _ref1.getVisibleBufferRange, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, moveCursorUp = _ref1.moveCursorUp, moveCursorDown = _ref1.moveCursorDown, moveCursorDownBuffer = _ref1.moveCursorDownBuffer, moveCursorUpBuffer = _ref1.moveCursorUpBuffer, cursorIsAtVimEndOfFile = _ref1.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = _ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = _ref1.getLastVisibleScreenRow, getValidVimScreenRow = _ref1.getValidVimScreenRow, getValidVimBufferRow = _ref1.getValidVimBufferRow, highlightRanges = _ref1.highlightRanges, moveCursorToFirstCharacterAtRow = _ref1.moveCursorToFirstCharacterAtRow, sortRanges = _ref1.sortRanges, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, cursorIsOnWhiteSpace = _ref1.cursorIsOnWhiteSpace, moveCursorToNextNonWhitespace = _ref1.moveCursorToNextNonWhitespace, cursorIsAtEmptyRow = _ref1.cursorIsAtEmptyRow, getCodeFoldRowRanges = _ref1.getCodeFoldRowRanges, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = _ref1.detectScopeStartPositionForScope, getBufferRows = _ref1.getBufferRows, getStartPositionForPattern = _ref1.getStartPositionForPattern, getFirstCharacterPositionForBufferRow = _ref1.getFirstCharacterPositionForBufferRow, getFirstCharacterBufferPositionForScreenRow = _ref1.getFirstCharacterBufferPositionForScreenRow, getTextInScreenRange = _ref1.getTextInScreenRange;

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
              vimLastBufferRow = _this.getVimLastBufferRow();
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
            for (var _j = _ref3 = validRow(row + 1), _ref4 = this.getVimLastScreenRow(); _ref3 <= _ref4 ? _j <= _ref4 : _j >= _ref4; _ref3 <= _ref4 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    };

    MoveUpToEdge.prototype.isMovablePoint = function(point) {
      var above, below, _ref2;
      if (this.isStoppablePoint(point)) {
        if ((_ref2 = point.row) === 0 || _ref2 === this.getVimLastScreenRow()) {
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
      scanRange = [[cursorPoint.row, 0], this.getVimEofBufferPosition()];
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
      point = Point.min(point, this.getVimEofBufferPosition());
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
          return this.getVimEofBufferPosition();
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
      row = Math.min(row + this.getCount(), this.getVimLastBufferRow());
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
      return this.getVimLastBufferRow();
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
      return Math.floor(this.getVimLastScreenRow() * (percent / 100));
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
      vimLastScreenRow = this.getVimLastScreenRow();
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
      vimLastScreenRow = this.getVimLastScreenRow();
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
      row = Math.min(this.getVimLastScreenRow(), row);
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
      if (!this.isComplete()) {
        return this.focusInput({
          hide: true
        });
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

    MoveToMark.extend(false);

    MoveToMark.prototype.input = null;

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
      var input, pattern, point;
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
      pattern = this.getPattern(input);
      globalState.lastSearchPattern = pattern;
      this.vimState.main.emitDidSetLastSearchPattern();
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

    MoveToPreviousFoldStart.prototype.linewise = false;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc3BFQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUhkLENBQUE7O0FBQUEsRUFJQSxRQXdCSSxPQUFBLENBQVEsU0FBUixDQXhCSixFQUNFLHdCQUFBLGVBREYsRUFDbUIsOEJBQUEscUJBRG5CLEVBRUUsdUJBQUEsY0FGRixFQUVrQix3QkFBQSxlQUZsQixFQUdFLHFCQUFBLFlBSEYsRUFHZ0IsdUJBQUEsY0FIaEIsRUFJRSw2QkFBQSxvQkFKRixFQUtFLDJCQUFBLGtCQUxGLEVBTUUsK0JBQUEsc0JBTkYsRUFPRSxpQ0FBQSx3QkFQRixFQU80QixnQ0FBQSx1QkFQNUIsRUFRRSw2QkFBQSxvQkFSRixFQVF3Qiw2QkFBQSxvQkFSeEIsRUFTRSx3QkFBQSxlQVRGLEVBVUUsd0NBQUEsK0JBVkYsRUFXRSxtQkFBQSxVQVhGLEVBWUUsbUNBQUEsMEJBWkYsRUFhRSw2QkFBQSxvQkFiRixFQWNFLHNDQUFBLDZCQWRGLEVBZUUsMkJBQUEsa0JBZkYsRUFnQkUsNkJBQUEsb0JBaEJGLEVBaUJFLHFDQUFBLDRCQWpCRixFQWtCRSx5Q0FBQSxnQ0FsQkYsRUFtQkUsc0JBQUEsYUFuQkYsRUFvQkUsbUNBQUEsMEJBcEJGLEVBcUJFLDhDQUFBLHFDQXJCRixFQXNCRSxvREFBQSwyQ0F0QkYsRUF1QkUsNkJBQUEsb0JBM0JGLENB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/motion.coffee
