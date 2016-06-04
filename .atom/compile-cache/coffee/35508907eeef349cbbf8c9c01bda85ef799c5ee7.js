(function() {
  var Base, CurrentSelection, Find, FindBackwards, MatchList, Motion, MoveDown, MoveDownToEdge, MoveLeft, MoveRight, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToColumn, MoveToEndOfAlphanumericWord, MoveToEndOfSmartWord, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextAlphanumericWord, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextParagraph, MoveToNextSmartWord, MoveToNextString, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousAlphanumericWord, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousParagraph, MoveToPreviousSmartWord, MoveToPreviousString, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineWithMinimum, MoveToTopOfScreen, MoveUp, MoveUpToEdge, Point, Range, RepeatFind, RepeatFindReverse, RepeatSearch, RepeatSearchReverse, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, Till, TillBackwards, cursorIsAtEmptyRow, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, detectScopeStartPositionForScope, getBufferRows, getCodeFoldRowRanges, getEndPositionForPattern, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getLastVisibleScreenRow, getStartPositionForPattern, getTextInScreenRange, getValidVimBufferRow, getValidVimScreenRow, getVisibleBufferRange, globalState, highlightRanges, isIncludeFunctionScopeForRow, moveCursorDown, moveCursorDownBuffer, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, moveCursorUpBuffer, saveEditorState, settings, sortRanges, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  globalState = require('./global-state');

  _ref1 = require('./utils'), saveEditorState = _ref1.saveEditorState, getVisibleBufferRange = _ref1.getVisibleBufferRange, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, moveCursorUp = _ref1.moveCursorUp, moveCursorDown = _ref1.moveCursorDown, moveCursorDownBuffer = _ref1.moveCursorDownBuffer, moveCursorUpBuffer = _ref1.moveCursorUpBuffer, cursorIsAtVimEndOfFile = _ref1.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = _ref1.getFirstVisibleScreenRow, getLastVisibleScreenRow = _ref1.getLastVisibleScreenRow, getValidVimScreenRow = _ref1.getValidVimScreenRow, getValidVimBufferRow = _ref1.getValidVimBufferRow, highlightRanges = _ref1.highlightRanges, moveCursorToFirstCharacterAtRow = _ref1.moveCursorToFirstCharacterAtRow, sortRanges = _ref1.sortRanges, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, cursorIsOnWhiteSpace = _ref1.cursorIsOnWhiteSpace, moveCursorToNextNonWhitespace = _ref1.moveCursorToNextNonWhitespace, cursorIsAtEmptyRow = _ref1.cursorIsAtEmptyRow, getCodeFoldRowRanges = _ref1.getCodeFoldRowRanges, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, detectScopeStartPositionForScope = _ref1.detectScopeStartPositionForScope, getBufferRows = _ref1.getBufferRows, getStartPositionForPattern = _ref1.getStartPositionForPattern, getEndPositionForPattern = _ref1.getEndPositionForPattern, getFirstCharacterPositionForBufferRow = _ref1.getFirstCharacterPositionForBufferRow, getFirstCharacterBufferPositionForScreenRow = _ref1.getFirstCharacterBufferPositionForScreenRow, getTextInScreenRange = _ref1.getTextInScreenRange;

  swrap = require('./selection-wrapper');

  MatchList = require('./match').MatchList;

  settings = require('./settings');

  Base = require('./base');

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
      var cursorPoint, found, pattern, scanRange, wordRange, _ref2, _ref3;
      cursorPoint = cursor.getBufferPosition();
      pattern = (_ref2 = this.wordRegex) != null ? _ref2 : cursor.wordRegExp();
      scanRange = [cursorPoint, this.getVimEofBufferPosition()];
      wordRange = null;
      found = false;
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var matchText, range, stop;
        range = _arg.range, matchText = _arg.matchText, stop = _arg.stop;
        wordRange = range;
        if (matchText === '' && range.start.column !== 0) {
          return;
        }
        if (range.start.isGreaterThan(cursorPoint)) {
          found = true;
          return stop();
        }
      });
      if (found) {
        return wordRange.start;
      } else {
        return (_ref3 = wordRange != null ? wordRange.end : void 0) != null ? _ref3 : cursorPoint;
      }
    };

    MoveToNextWord.prototype.moveCursor = function(cursor) {
      var wasOnWhiteSpace;
      if (cursorIsAtVimEndOfFile(cursor)) {
        return;
      }
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
      if (!this.isComplete()) {
        return this.focusInput();
      }
    };

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

    MoveToMarkLine.prototype.hover = {
      icon: ":move-to-mark:'",
      emoji: ":round_pushpin:'"
    };

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

    SearchCurrentWord.prototype.getNextNonWhiteSpacePoint = function(from) {
      var point, scanRange;
      point = null;
      scanRange = [from, [from.row, Infinity]];
      this.editor.scanInBufferRange(/\S/, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        return point = range.start;
      });
      return point;
    };

    SearchCurrentWord.prototype.getCurrentWordBufferRange = function() {
      var cursor, fromPoint, options, originalPoint, wordRange;
      cursor = this.editor.getLastCursor();
      originalPoint = cursor.getBufferPosition();
      fromPoint = this.getNextNonWhiteSpacePoint(originalPoint);
      if (!fromPoint) {
        return;
      }
      cursor.setBufferPosition(fromPoint);
      options = {};
      if (cursor.isBetweenWordAndNonWord()) {
        options.includeNonWordCharacters = false;
      }
      wordRange = cursor.getCurrentWordBufferRange(options);
      cursor.setBufferPosition(originalPoint);
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
      this.rows = this.getFoldRows(this.which);
      if (this.direction === 'prev') {
        return this.rows.reverse();
      }
    };

    MoveToPreviousFoldStart.prototype.getFoldRows = function(which) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOHBFQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBR0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUhkLENBQUE7O0FBQUEsRUFJQSxRQXlCSSxPQUFBLENBQVEsU0FBUixDQXpCSixFQUNFLHdCQUFBLGVBREYsRUFDbUIsOEJBQUEscUJBRG5CLEVBRUUsdUJBQUEsY0FGRixFQUVrQix3QkFBQSxlQUZsQixFQUdFLHFCQUFBLFlBSEYsRUFHZ0IsdUJBQUEsY0FIaEIsRUFJRSw2QkFBQSxvQkFKRixFQUtFLDJCQUFBLGtCQUxGLEVBTUUsK0JBQUEsc0JBTkYsRUFPRSxpQ0FBQSx3QkFQRixFQU80QixnQ0FBQSx1QkFQNUIsRUFRRSw2QkFBQSxvQkFSRixFQVF3Qiw2QkFBQSxvQkFSeEIsRUFTRSx3QkFBQSxlQVRGLEVBVUUsd0NBQUEsK0JBVkYsRUFXRSxtQkFBQSxVQVhGLEVBWUUsbUNBQUEsMEJBWkYsRUFhRSw2QkFBQSxvQkFiRixFQWNFLHNDQUFBLDZCQWRGLEVBZUUsMkJBQUEsa0JBZkYsRUFnQkUsNkJBQUEsb0JBaEJGLEVBaUJFLHFDQUFBLDRCQWpCRixFQWtCRSx5Q0FBQSxnQ0FsQkYsRUFtQkUsc0JBQUEsYUFuQkYsRUFvQkUsbUNBQUEsMEJBcEJGLEVBcUJFLGlDQUFBLHdCQXJCRixFQXNCRSw4Q0FBQSxxQ0F0QkYsRUF1QkUsb0RBQUEsMkNBdkJGLEVB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/motion.coffee
