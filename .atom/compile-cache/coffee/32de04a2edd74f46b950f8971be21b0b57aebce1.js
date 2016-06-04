(function() {
  var AAngleBracket, AAngleBracketAllowForwarding, AAnyPair, AAnyPairAllowForwarding, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurlyBracketAllowForwarding, ACurrentLine, ADoubleQuote, AEntire, AFold, AFunction, AIndentation, ALatestChange, AParagraph, AParenthesis, AParenthesisAllowForwarding, ASingleQuote, ASmartWord, ASquareBracket, ASquareBracketAllowForwarding, ATag, AWholeWord, AWord, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, BackTick, Base, Comment, CurlyBracket, CurrentLine, DoubleQuote, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAngleBracketAllowForwarding, InnerAnyPair, InnerAnyPairAllowForwarding, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurlyBracketAllowForwarding, InnerCurrentLine, InnerDoubleQuote, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerParenthesisAllowForwarding, InnerSingleQuote, InnerSmartWord, InnerSquareBracket, InnerSquareBracketAllowForwarding, InnerTag, InnerWholeWord, InnerWord, LatestChange, MarkedRange, Pair, Paragraph, Parenthesis, Point, PreviousSelection, Quote, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Tag, TextObject, WholeWord, Word, countChar, getBufferRangeForRowRange, getCodeFoldRowRangesContainesForRow, getEndPositionForPattern, getIndentLevelForBufferRow, getStartPositionForPattern, getTextToPoint, getWordRegExpForPointWithCursor, globalState, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, pointIsSurroundedByWhitespace, sortRanges, sortRangesByEndPosition, swrap, tagPattern, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  Base = require('./base');

  swrap = require('./selection-wrapper');

  globalState = require('./global-state');

  _ref1 = require('./utils'), sortRanges = _ref1.sortRanges, sortRangesByEndPosition = _ref1.sortRangesByEndPosition, countChar = _ref1.countChar, pointIsAtEndOfLine = _ref1.pointIsAtEndOfLine, getTextToPoint = _ref1.getTextToPoint, getIndentLevelForBufferRow = _ref1.getIndentLevelForBufferRow, getCodeFoldRowRangesContainesForRow = _ref1.getCodeFoldRowRangesContainesForRow, getBufferRangeForRowRange = _ref1.getBufferRangeForRowRange, isIncludeFunctionScopeForRow = _ref1.isIncludeFunctionScopeForRow, pointIsSurroundedByWhitespace = _ref1.pointIsSurroundedByWhitespace, getWordRegExpForPointWithCursor = _ref1.getWordRegExpForPointWithCursor, getStartPositionForPattern = _ref1.getStartPositionForPattern, getEndPositionForPattern = _ref1.getEndPositionForPattern;

  TextObject = (function(_super) {
    __extends(TextObject, _super);

    TextObject.extend(false);

    TextObject.prototype.allowSubmodeChange = true;

    function TextObject() {
      this.constructor.prototype.inner = this.getName().startsWith('Inner');
      TextObject.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    TextObject.prototype.isInner = function() {
      return this.inner;
    };

    TextObject.prototype.isA = function() {
      return !this.isInner();
    };

    TextObject.prototype.isAllowSubmodeChange = function() {
      return this.allowSubmodeChange;
    };

    TextObject.prototype.isLinewise = function() {
      if (this.isAllowSubmodeChange()) {
        return swrap.detectVisualModeSubmode(this.editor) === 'linewise';
      } else {
        return this.vimState.submode === 'linewise';
      }
    };

    TextObject.prototype.select = function() {
      var selection, _i, _len, _ref2;
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        this.selectTextObject(selection);
      }
      if (this.isMode('visual')) {
        return this.updateSelectionProperties();
      }
    };

    return TextObject;

  })(Base);

  Word = (function(_super) {
    __extends(Word, _super);

    function Word() {
      return Word.__super__.constructor.apply(this, arguments);
    }

    Word.extend(false);

    Word.prototype.getPattern = function(selection) {
      var point, _ref2;
      point = swrap(selection).getNormalizedBufferPosition();
      if (pointIsSurroundedByWhitespace(this.editor, point)) {
        return /[\t ]*/;
      } else {
        return (_ref2 = this.wordRegExp) != null ? _ref2 : getWordRegExpForPointWithCursor(selection.cursor, point);
      }
    };

    Word.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getRange(selection));
    };

    Word.prototype.getRange = function(selection) {
      var end, endOfSpace, from, options, pattern, start;
      pattern = this.getPattern(selection);
      from = swrap(selection).getNormalizedBufferPosition();
      options = {
        containedOnly: true
      };
      start = getStartPositionForPattern(this.editor, from, pattern, options);
      end = getEndPositionForPattern(this.editor, from, pattern, options);
      if (start == null) {
        start = from;
      }
      if (end == null) {
        end = from;
      }
      if (this.isA() && (endOfSpace = getEndPositionForPattern(this.editor, end, /\s+/, options))) {
        end = endOfSpace;
      }
      if (!start.isEqual(end)) {
        return new Range(start, end);
      } else {
        return null;
      }
    };

    return Word;

  })(TextObject);

  AWord = (function(_super) {
    __extends(AWord, _super);

    function AWord() {
      return AWord.__super__.constructor.apply(this, arguments);
    }

    AWord.extend();

    return AWord;

  })(Word);

  InnerWord = (function(_super) {
    __extends(InnerWord, _super);

    function InnerWord() {
      return InnerWord.__super__.constructor.apply(this, arguments);
    }

    InnerWord.extend();

    return InnerWord;

  })(Word);

  WholeWord = (function(_super) {
    __extends(WholeWord, _super);

    function WholeWord() {
      return WholeWord.__super__.constructor.apply(this, arguments);
    }

    WholeWord.extend(false);

    WholeWord.prototype.wordRegExp = /\S+/;

    return WholeWord;

  })(Word);

  AWholeWord = (function(_super) {
    __extends(AWholeWord, _super);

    function AWholeWord() {
      return AWholeWord.__super__.constructor.apply(this, arguments);
    }

    AWholeWord.extend();

    return AWholeWord;

  })(WholeWord);

  InnerWholeWord = (function(_super) {
    __extends(InnerWholeWord, _super);

    function InnerWholeWord() {
      return InnerWholeWord.__super__.constructor.apply(this, arguments);
    }

    InnerWholeWord.extend();

    return InnerWholeWord;

  })(WholeWord);

  SmartWord = (function(_super) {
    __extends(SmartWord, _super);

    function SmartWord() {
      return SmartWord.__super__.constructor.apply(this, arguments);
    }

    SmartWord.extend(false);

    SmartWord.prototype.wordRegExp = /[\w-]+/;

    return SmartWord;

  })(Word);

  ASmartWord = (function(_super) {
    __extends(ASmartWord, _super);

    function ASmartWord() {
      return ASmartWord.__super__.constructor.apply(this, arguments);
    }

    ASmartWord.description = "A word that consists of alphanumeric chars(`/[A-Za-z0-9_]/`) and hyphen `-`";

    ASmartWord.extend();

    return ASmartWord;

  })(SmartWord);

  InnerSmartWord = (function(_super) {
    __extends(InnerSmartWord, _super);

    function InnerSmartWord() {
      return InnerSmartWord.__super__.constructor.apply(this, arguments);
    }

    InnerSmartWord.description = "Currently No diff from `a-smart-word`";

    InnerSmartWord.extend();

    return InnerSmartWord;

  })(SmartWord);

  Pair = (function(_super) {
    var backSlashPattern;

    __extends(Pair, _super);

    function Pair() {
      return Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.extend(false);

    Pair.prototype.allowNextLine = false;

    Pair.prototype.allowSubmodeChange = false;

    Pair.prototype.adjustInnerRange = true;

    Pair.prototype.pair = null;

    Pair.prototype.getPattern = function() {
      var close, open, _ref2;
      _ref2 = this.pair, open = _ref2[0], close = _ref2[1];
      if (open === close) {
        return new RegExp("(" + (_.escapeRegExp(open)) + ")", 'g');
      } else {
        return new RegExp("(" + (_.escapeRegExp(open)) + ")|(" + (_.escapeRegExp(close)) + ")", 'g');
      }
    };

    Pair.prototype.getPairState = function(_arg) {
      var match, matchText, range;
      matchText = _arg.matchText, range = _arg.range, match = _arg.match;
      switch (match.length) {
        case 2:
          return this.pairStateInBufferRange(range, matchText);
        case 3:
          switch (false) {
            case !match[1]:
              return 'open';
            case !match[2]:
              return 'close';
          }
      }
    };

    backSlashPattern = _.escapeRegExp('\\');

    Pair.prototype.pairStateInBufferRange = function(range, char) {
      var bs, escapedChar, pattern, patterns, text;
      text = getTextToPoint(this.editor, range.end);
      escapedChar = _.escapeRegExp(char);
      bs = backSlashPattern;
      patterns = ["" + bs + bs + escapedChar, "[^" + bs + "]?" + escapedChar];
      pattern = new RegExp(patterns.join('|'));
      return ['close', 'open'][countChar(text, pattern) % 2];
    };

    Pair.prototype.isEscapedCharAtPoint = function(point) {
      var bs, found, pattern, scanRange;
      found = false;
      bs = backSlashPattern;
      pattern = new RegExp("[^" + bs + "]" + bs);
      scanRange = [[point.row, 0], point];
      this.editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
        var matchText, range, stop;
        matchText = _arg.matchText, range = _arg.range, stop = _arg.stop;
        if (range.end.isEqual(point)) {
          stop();
          return found = true;
        }
      });
      return found;
    };

    Pair.prototype.findPair = function(which, options, fn) {
      var from, pattern, scanFunc, scanRange;
      from = options.from, pattern = options.pattern, scanFunc = options.scanFunc, scanRange = options.scanRange;
      return this.editor[scanFunc](pattern, scanRange, (function(_this) {
        return function(event) {
          var matchText, range, stop;
          matchText = event.matchText, range = event.range, stop = event.stop;
          if (!(_this.allowNextLine || (from.row === range.start.row))) {
            return stop();
          }
          if (_this.isEscapedCharAtPoint(range.start)) {
            return;
          }
          return fn(event);
        };
      })(this));
    };

    Pair.prototype.findOpen = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'backwardsScanInBufferRange';
      scanRange = new Range([0, 0], from);
      stack = [];
      found = null;
      this.findPair('open', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var matchText, pairState, range, stop;
          matchText = event.matchText, range = event.range, stop = event.stop;
          pairState = _this.getPairState(event);
          if (pairState === 'close') {
            stack.push({
              pairState: pairState,
              matchText: matchText,
              range: range
            });
          } else {
            stack.pop();
            if (stack.length === 0) {
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Pair.prototype.findClose = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'scanInBufferRange';
      scanRange = new Range(from, this.editor.buffer.getEndPosition());
      stack = [];
      found = null;
      this.findPair('close', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, openStart, pairState, range, stop;
          range = event.range, stop = event.stop;
          pairState = _this.getPairState(event);
          if (pairState === 'open') {
            stack.push({
              pairState: pairState,
              range: range
            });
          } else {
            entry = stack.pop();
            if (stack.length === 0) {
              if ((openStart = entry != null ? entry.range.start : void 0)) {
                if (_this.allowForwarding) {
                  if (openStart.row > from.row) {
                    return;
                  }
                } else {
                  if (openStart.isGreaterThan(from)) {
                    return;
                  }
                }
              }
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Pair.prototype.getPairInfo = function(from) {
      var aRange, closeRange, innerEnd, innerRange, innerStart, openRange, pairInfo, pattern, targetRange, _ref2;
      pairInfo = null;
      pattern = this.getPattern();
      closeRange = this.findClose(from, pattern);
      if (closeRange != null) {
        openRange = this.findOpen(closeRange.end, pattern);
      }
      if (!((openRange != null) && (closeRange != null))) {
        return null;
      }
      aRange = new Range(openRange.start, closeRange.end);
      _ref2 = [openRange.end, closeRange.start], innerStart = _ref2[0], innerEnd = _ref2[1];
      if (this.adjustInnerRange) {
        if (pointIsAtEndOfLine(this.editor, innerStart)) {
          innerStart = new Point(innerStart.row + 1, 0);
        }
        if (getTextToPoint(this.editor, innerEnd).match(/^\s*$/)) {
          innerEnd = new Point(innerEnd.row, 0);
        }
        if ((innerEnd.column === 0) && (innerStart.column !== 0)) {
          innerEnd = new Point(innerEnd.row - 1, Infinity);
        }
      }
      innerRange = new Range(innerStart, innerEnd);
      targetRange = this.isInner() ? innerRange : aRange;
      if (this.skipEmptyPair && innerRange.isEmpty()) {
        return this.getPairInfo(aRange.end);
      } else {
        return {
          openRange: openRange,
          closeRange: closeRange,
          aRange: aRange,
          innerRange: innerRange,
          targetRange: targetRange
        };
      }
    };

    Pair.prototype.getPointToSearchFrom = function(selection, searchFrom) {
      switch (searchFrom) {
        case 'head':
          return swrap(selection).getNormalizedBufferPosition();
        case 'start':
          return swrap(selection).getBufferPositionFor('start');
      }
    };

    Pair.prototype.getRange = function(selection, options) {
      var allowForwarding, originalRange, pairInfo, searchFrom;
      if (options == null) {
        options = {};
      }
      allowForwarding = options.allowForwarding, searchFrom = options.searchFrom;
      if (searchFrom == null) {
        searchFrom = 'head';
      }
      if (allowForwarding != null) {
        this.allowForwarding = allowForwarding;
      }
      originalRange = selection.getBufferRange();
      pairInfo = this.getPairInfo(this.getPointToSearchFrom(selection, searchFrom));
      if (pairInfo != null ? pairInfo.targetRange.isEqual(originalRange) : void 0) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      return pairInfo != null ? pairInfo.targetRange : void 0;
    };

    Pair.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getRange(selection));
    };

    return Pair;

  })(TextObject);

  AnyPair = (function(_super) {
    __extends(AnyPair, _super);

    function AnyPair() {
      return AnyPair.__super__.constructor.apply(this, arguments);
    }

    AnyPair.extend(false);

    AnyPair.prototype.allowForwarding = false;

    AnyPair.prototype.skipEmptyPair = false;

    AnyPair.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'Tag', 'SquareBracket', 'Parenthesis'];

    AnyPair.prototype.getRangeBy = function(klass, selection) {
      return this["new"](klass, {
        inner: this.inner,
        skipEmptyPair: this.skipEmptyPair
      }).getRange(selection, {
        allowForwarding: this.allowForwarding,
        searchFrom: this.searchFrom
      });
    };

    AnyPair.prototype.getRanges = function(selection) {
      var klass, range, _i, _len, _ref2, _results;
      _ref2 = this.member;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        klass = _ref2[_i];
        if ((range = this.getRangeBy(klass, selection))) {
          _results.push(range);
        }
      }
      return _results;
    };

    AnyPair.prototype.getNearestRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.last(sortRanges(ranges));
      }
    };

    AnyPair.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getNearestRange(selection));
    };

    return AnyPair;

  })(Pair);

  AAnyPair = (function(_super) {
    __extends(AAnyPair, _super);

    function AAnyPair() {
      return AAnyPair.__super__.constructor.apply(this, arguments);
    }

    AAnyPair.extend();

    return AAnyPair;

  })(AnyPair);

  InnerAnyPair = (function(_super) {
    __extends(InnerAnyPair, _super);

    function InnerAnyPair() {
      return InnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPair.extend();

    return InnerAnyPair;

  })(AnyPair);

  AnyPairAllowForwarding = (function(_super) {
    __extends(AnyPairAllowForwarding, _super);

    function AnyPairAllowForwarding() {
      return AnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AnyPairAllowForwarding.extend(false);

    AnyPairAllowForwarding.description = "Range surrounded by auto-detected paired chars from enclosed and forwarding area";

    AnyPairAllowForwarding.prototype.allowForwarding = true;

    AnyPairAllowForwarding.prototype.allowNextLine = false;

    AnyPairAllowForwarding.prototype.skipEmptyPair = false;

    AnyPairAllowForwarding.prototype.searchFrom = 'start';

    AnyPairAllowForwarding.prototype.getNearestRange = function(selection) {
      var enclosingRange, enclosingRanges, forwardingRanges, from, ranges, _ref2;
      ranges = this.getRanges(selection);
      from = selection.cursor.getBufferPosition();
      _ref2 = _.partition(ranges, function(range) {
        return range.start.isGreaterThanOrEqual(from);
      }), forwardingRanges = _ref2[0], enclosingRanges = _ref2[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return forwardingRanges[0] || enclosingRange;
    };

    return AnyPairAllowForwarding;

  })(AnyPair);

  AAnyPairAllowForwarding = (function(_super) {
    __extends(AAnyPairAllowForwarding, _super);

    function AAnyPairAllowForwarding() {
      return AAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAnyPairAllowForwarding.extend();

    return AAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  InnerAnyPairAllowForwarding = (function(_super) {
    __extends(InnerAnyPairAllowForwarding, _super);

    function InnerAnyPairAllowForwarding() {
      return InnerAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPairAllowForwarding.extend();

    return InnerAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  AnyQuote = (function(_super) {
    __extends(AnyQuote, _super);

    function AnyQuote() {
      return AnyQuote.__super__.constructor.apply(this, arguments);
    }

    AnyQuote.extend(false);

    AnyQuote.prototype.allowForwarding = true;

    AnyQuote.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];

    AnyQuote.prototype.getNearestRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.first(_.sortBy(ranges, function(r) {
          return r.end.column;
        }));
      }
    };

    return AnyQuote;

  })(AnyPair);

  AAnyQuote = (function(_super) {
    __extends(AAnyQuote, _super);

    function AAnyQuote() {
      return AAnyQuote.__super__.constructor.apply(this, arguments);
    }

    AAnyQuote.extend();

    return AAnyQuote;

  })(AnyQuote);

  InnerAnyQuote = (function(_super) {
    __extends(InnerAnyQuote, _super);

    function InnerAnyQuote() {
      return InnerAnyQuote.__super__.constructor.apply(this, arguments);
    }

    InnerAnyQuote.extend();

    return InnerAnyQuote;

  })(AnyQuote);

  Quote = (function(_super) {
    __extends(Quote, _super);

    function Quote() {
      return Quote.__super__.constructor.apply(this, arguments);
    }

    Quote.extend(false);

    Quote.prototype.allowForwarding = true;

    Quote.prototype.allowNextLine = false;

    return Quote;

  })(Pair);

  DoubleQuote = (function(_super) {
    __extends(DoubleQuote, _super);

    function DoubleQuote() {
      return DoubleQuote.__super__.constructor.apply(this, arguments);
    }

    DoubleQuote.extend(false);

    DoubleQuote.prototype.pair = ['"', '"'];

    return DoubleQuote;

  })(Quote);

  ADoubleQuote = (function(_super) {
    __extends(ADoubleQuote, _super);

    function ADoubleQuote() {
      return ADoubleQuote.__super__.constructor.apply(this, arguments);
    }

    ADoubleQuote.extend();

    return ADoubleQuote;

  })(DoubleQuote);

  InnerDoubleQuote = (function(_super) {
    __extends(InnerDoubleQuote, _super);

    function InnerDoubleQuote() {
      return InnerDoubleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerDoubleQuote.extend();

    return InnerDoubleQuote;

  })(DoubleQuote);

  SingleQuote = (function(_super) {
    __extends(SingleQuote, _super);

    function SingleQuote() {
      return SingleQuote.__super__.constructor.apply(this, arguments);
    }

    SingleQuote.extend(false);

    SingleQuote.prototype.pair = ["'", "'"];

    return SingleQuote;

  })(Quote);

  ASingleQuote = (function(_super) {
    __extends(ASingleQuote, _super);

    function ASingleQuote() {
      return ASingleQuote.__super__.constructor.apply(this, arguments);
    }

    ASingleQuote.extend();

    return ASingleQuote;

  })(SingleQuote);

  InnerSingleQuote = (function(_super) {
    __extends(InnerSingleQuote, _super);

    function InnerSingleQuote() {
      return InnerSingleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerSingleQuote.extend();

    return InnerSingleQuote;

  })(SingleQuote);

  BackTick = (function(_super) {
    __extends(BackTick, _super);

    function BackTick() {
      return BackTick.__super__.constructor.apply(this, arguments);
    }

    BackTick.extend(false);

    BackTick.prototype.pair = ['`', '`'];

    return BackTick;

  })(Quote);

  ABackTick = (function(_super) {
    __extends(ABackTick, _super);

    function ABackTick() {
      return ABackTick.__super__.constructor.apply(this, arguments);
    }

    ABackTick.extend();

    return ABackTick;

  })(BackTick);

  InnerBackTick = (function(_super) {
    __extends(InnerBackTick, _super);

    function InnerBackTick() {
      return InnerBackTick.__super__.constructor.apply(this, arguments);
    }

    InnerBackTick.extend();

    return InnerBackTick;

  })(BackTick);

  CurlyBracket = (function(_super) {
    __extends(CurlyBracket, _super);

    function CurlyBracket() {
      return CurlyBracket.__super__.constructor.apply(this, arguments);
    }

    CurlyBracket.extend(false);

    CurlyBracket.prototype.pair = ['{', '}'];

    CurlyBracket.prototype.allowNextLine = true;

    return CurlyBracket;

  })(Pair);

  ACurlyBracket = (function(_super) {
    __extends(ACurlyBracket, _super);

    function ACurlyBracket() {
      return ACurlyBracket.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracket.extend();

    return ACurlyBracket;

  })(CurlyBracket);

  InnerCurlyBracket = (function(_super) {
    __extends(InnerCurlyBracket, _super);

    function InnerCurlyBracket() {
      return InnerCurlyBracket.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracket.extend();

    return InnerCurlyBracket;

  })(CurlyBracket);

  ACurlyBracketAllowForwarding = (function(_super) {
    __extends(ACurlyBracketAllowForwarding, _super);

    function ACurlyBracketAllowForwarding() {
      return ACurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracketAllowForwarding.extend();

    ACurlyBracketAllowForwarding.prototype.allowForwarding = true;

    return ACurlyBracketAllowForwarding;

  })(CurlyBracket);

  InnerCurlyBracketAllowForwarding = (function(_super) {
    __extends(InnerCurlyBracketAllowForwarding, _super);

    function InnerCurlyBracketAllowForwarding() {
      return InnerCurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracketAllowForwarding.extend();

    InnerCurlyBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerCurlyBracketAllowForwarding;

  })(CurlyBracket);

  SquareBracket = (function(_super) {
    __extends(SquareBracket, _super);

    function SquareBracket() {
      return SquareBracket.__super__.constructor.apply(this, arguments);
    }

    SquareBracket.extend(false);

    SquareBracket.prototype.pair = ['[', ']'];

    SquareBracket.prototype.allowNextLine = true;

    return SquareBracket;

  })(Pair);

  ASquareBracket = (function(_super) {
    __extends(ASquareBracket, _super);

    function ASquareBracket() {
      return ASquareBracket.__super__.constructor.apply(this, arguments);
    }

    ASquareBracket.extend();

    return ASquareBracket;

  })(SquareBracket);

  InnerSquareBracket = (function(_super) {
    __extends(InnerSquareBracket, _super);

    function InnerSquareBracket() {
      return InnerSquareBracket.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracket.extend();

    return InnerSquareBracket;

  })(SquareBracket);

  ASquareBracketAllowForwarding = (function(_super) {
    __extends(ASquareBracketAllowForwarding, _super);

    function ASquareBracketAllowForwarding() {
      return ASquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ASquareBracketAllowForwarding.extend();

    ASquareBracketAllowForwarding.prototype.allowForwarding = true;

    return ASquareBracketAllowForwarding;

  })(SquareBracket);

  InnerSquareBracketAllowForwarding = (function(_super) {
    __extends(InnerSquareBracketAllowForwarding, _super);

    function InnerSquareBracketAllowForwarding() {
      return InnerSquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracketAllowForwarding.extend();

    InnerSquareBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerSquareBracketAllowForwarding;

  })(SquareBracket);

  Parenthesis = (function(_super) {
    __extends(Parenthesis, _super);

    function Parenthesis() {
      return Parenthesis.__super__.constructor.apply(this, arguments);
    }

    Parenthesis.extend(false);

    Parenthesis.prototype.pair = ['(', ')'];

    Parenthesis.prototype.allowNextLine = true;

    return Parenthesis;

  })(Pair);

  AParenthesis = (function(_super) {
    __extends(AParenthesis, _super);

    function AParenthesis() {
      return AParenthesis.__super__.constructor.apply(this, arguments);
    }

    AParenthesis.extend();

    return AParenthesis;

  })(Parenthesis);

  InnerParenthesis = (function(_super) {
    __extends(InnerParenthesis, _super);

    function InnerParenthesis() {
      return InnerParenthesis.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesis.extend();

    return InnerParenthesis;

  })(Parenthesis);

  AParenthesisAllowForwarding = (function(_super) {
    __extends(AParenthesisAllowForwarding, _super);

    function AParenthesisAllowForwarding() {
      return AParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AParenthesisAllowForwarding.extend();

    AParenthesisAllowForwarding.prototype.allowForwarding = true;

    return AParenthesisAllowForwarding;

  })(Parenthesis);

  InnerParenthesisAllowForwarding = (function(_super) {
    __extends(InnerParenthesisAllowForwarding, _super);

    function InnerParenthesisAllowForwarding() {
      return InnerParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesisAllowForwarding.extend();

    InnerParenthesisAllowForwarding.prototype.allowForwarding = true;

    return InnerParenthesisAllowForwarding;

  })(Parenthesis);

  AngleBracket = (function(_super) {
    __extends(AngleBracket, _super);

    function AngleBracket() {
      return AngleBracket.__super__.constructor.apply(this, arguments);
    }

    AngleBracket.extend(false);

    AngleBracket.prototype.pair = ['<', '>'];

    return AngleBracket;

  })(Pair);

  AAngleBracket = (function(_super) {
    __extends(AAngleBracket, _super);

    function AAngleBracket() {
      return AAngleBracket.__super__.constructor.apply(this, arguments);
    }

    AAngleBracket.extend();

    return AAngleBracket;

  })(AngleBracket);

  InnerAngleBracket = (function(_super) {
    __extends(InnerAngleBracket, _super);

    function InnerAngleBracket() {
      return InnerAngleBracket.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracket.extend();

    return InnerAngleBracket;

  })(AngleBracket);

  AAngleBracketAllowForwarding = (function(_super) {
    __extends(AAngleBracketAllowForwarding, _super);

    function AAngleBracketAllowForwarding() {
      return AAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAngleBracketAllowForwarding.extend();

    AAngleBracketAllowForwarding.prototype.allowForwarding = true;

    return AAngleBracketAllowForwarding;

  })(AngleBracket);

  InnerAngleBracketAllowForwarding = (function(_super) {
    __extends(InnerAngleBracketAllowForwarding, _super);

    function InnerAngleBracketAllowForwarding() {
      return InnerAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracketAllowForwarding.extend();

    InnerAngleBracketAllowForwarding.prototype.allowForwarding = true;

    return InnerAngleBracketAllowForwarding;

  })(AngleBracket);

  tagPattern = /(<(\/?))([^\s>]+)[^>]*>/g;

  Tag = (function(_super) {
    __extends(Tag, _super);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.extend(false);

    Tag.prototype.allowNextLine = true;

    Tag.prototype.allowForwarding = true;

    Tag.prototype.adjustInnerRange = false;

    Tag.prototype.getPattern = function() {
      return tagPattern;
    };

    Tag.prototype.getPairState = function(_arg) {
      var match, matchText, slash, tagName, __;
      match = _arg.match, matchText = _arg.matchText;
      __ = match[0], __ = match[1], slash = match[2], tagName = match[3];
      if (slash === '') {
        return ['open', tagName];
      } else {
        return ['close', tagName];
      }
    };

    Tag.prototype.getTagStartPoint = function(from) {
      var scanRange, tagRange, _ref2;
      tagRange = null;
      scanRange = this.editor.bufferRangeForBufferRow(from.row);
      this.editor.scanInBufferRange(tagPattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.containsPoint(from, true)) {
          tagRange = range;
          return stop();
        }
      });
      return (_ref2 = tagRange != null ? tagRange.start : void 0) != null ? _ref2 : from;
    };

    Tag.prototype.findTagState = function(stack, tagState) {
      var entry, i, _i, _ref2;
      if (stack.length === 0) {
        return null;
      }
      for (i = _i = _ref2 = stack.length - 1; _ref2 <= 0 ? _i <= 0 : _i >= 0; i = _ref2 <= 0 ? ++_i : --_i) {
        entry = stack[i];
        if (entry.tagState === tagState) {
          return entry;
        }
      }
      return null;
    };

    Tag.prototype.findOpen = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'backwardsScanInBufferRange';
      scanRange = new Range([0, 0], from);
      stack = [];
      found = null;
      this.findPair('open', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, pairState, range, stop, tagName, tagState, _ref2;
          range = event.range, stop = event.stop;
          _ref2 = _this.getPairState(event), pairState = _ref2[0], tagName = _ref2[1];
          if (pairState === 'close') {
            tagState = pairState + tagName;
            stack.push({
              tagState: tagState,
              range: range
            });
          } else {
            if (entry = _this.findTagState(stack, "close" + tagName)) {
              stack = stack.slice(0, stack.indexOf(entry));
            }
            if (stack.length === 0) {
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    Tag.prototype.findClose = function(from, pattern) {
      var found, scanFunc, scanRange, stack;
      scanFunc = 'scanInBufferRange';
      from = this.getTagStartPoint(from);
      scanRange = new Range(from, this.editor.buffer.getEndPosition());
      stack = [];
      found = null;
      this.findPair('close', {
        from: from,
        pattern: pattern,
        scanFunc: scanFunc,
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var entry, openStart, pairState, range, stop, tagName, tagState, _ref2;
          range = event.range, stop = event.stop;
          _ref2 = _this.getPairState(event), pairState = _ref2[0], tagName = _ref2[1];
          if (pairState === 'open') {
            tagState = pairState + tagName;
            stack.push({
              tagState: tagState,
              range: range
            });
          } else {
            if (entry = _this.findTagState(stack, "open" + tagName)) {
              stack = stack.slice(0, stack.indexOf(entry));
            } else {
              stack = [];
            }
            if (stack.length === 0) {
              if ((openStart = entry != null ? entry.range.start : void 0)) {
                if (_this.allowForwarding) {
                  if (openStart.row > from.row) {
                    return;
                  }
                } else {
                  if (openStart.isGreaterThan(from)) {
                    return;
                  }
                }
              }
              found = range;
            }
          }
          if (found != null) {
            return stop();
          }
        };
      })(this));
      return found;
    };

    return Tag;

  })(Pair);

  ATag = (function(_super) {
    __extends(ATag, _super);

    function ATag() {
      return ATag.__super__.constructor.apply(this, arguments);
    }

    ATag.extend();

    return ATag;

  })(Tag);

  InnerTag = (function(_super) {
    __extends(InnerTag, _super);

    function InnerTag() {
      return InnerTag.__super__.constructor.apply(this, arguments);
    }

    InnerTag.extend();

    return InnerTag;

  })(Tag);

  Paragraph = (function(_super) {
    __extends(Paragraph, _super);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.extend(false);

    Paragraph.prototype.getStartRow = function(startRow, fn) {
      var row, _i;
      for (row = _i = startRow; startRow <= 0 ? _i <= 0 : _i >= 0; row = startRow <= 0 ? ++_i : --_i) {
        if (fn(row)) {
          return row + 1;
        }
      }
      return 0;
    };

    Paragraph.prototype.getEndRow = function(startRow, fn) {
      var lastRow, row, _i;
      lastRow = this.editor.getLastBufferRow();
      for (row = _i = startRow; startRow <= lastRow ? _i <= lastRow : _i >= lastRow; row = startRow <= lastRow ? ++_i : --_i) {
        if (fn(row)) {
          return row - 1;
        }
      }
      return lastRow;
    };

    Paragraph.prototype.getRange = function(startRow) {
      var fn, startRowIsBlank;
      startRowIsBlank = this.editor.isBufferRowBlank(startRow);
      fn = (function(_this) {
        return function(row) {
          return _this.editor.isBufferRowBlank(row) !== startRowIsBlank;
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    Paragraph.prototype.selectParagraph = function(selection) {
      var endRow, point, startRow, _ref2, _ref3, _ref4;
      _ref2 = selection.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      if (swrap(selection).isSingleRow()) {
        return swrap(selection).setBufferRangeSafely(this.getRange(startRow));
      } else {
        point = selection.isReversed() ? (startRow = Math.max(0, startRow - 1), (_ref3 = this.getRange(startRow)) != null ? _ref3.start : void 0) : (_ref4 = this.getRange(endRow + 1)) != null ? _ref4.end : void 0;
        if (point != null) {
          return selection.selectToBufferPosition(point);
        }
      }
    };

    Paragraph.prototype.selectTextObject = function(selection) {
      return _.times(this.getCount(), (function(_this) {
        return function() {
          _this.selectParagraph(selection);
          if (_this["instanceof"]('AParagraph')) {
            return _this.selectParagraph(selection);
          }
        };
      })(this));
    };

    return Paragraph;

  })(TextObject);

  AParagraph = (function(_super) {
    __extends(AParagraph, _super);

    function AParagraph() {
      return AParagraph.__super__.constructor.apply(this, arguments);
    }

    AParagraph.extend();

    return AParagraph;

  })(Paragraph);

  InnerParagraph = (function(_super) {
    __extends(InnerParagraph, _super);

    function InnerParagraph() {
      return InnerParagraph.__super__.constructor.apply(this, arguments);
    }

    InnerParagraph.extend();

    return InnerParagraph;

  })(Paragraph);

  Comment = (function(_super) {
    __extends(Comment, _super);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.extend(false);

    Comment.prototype.getRange = function(startRow) {
      var fn;
      if (!this.editor.isBufferRowCommented(startRow)) {
        return;
      }
      fn = (function(_this) {
        return function(row) {
          var _ref2;
          if (!_this.isInner() && _this.editor.isBufferRowBlank(row)) {
            return;
          }
          return (_ref2 = _this.editor.isBufferRowCommented(row)) === false || _ref2 === (void 0);
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    return Comment;

  })(Paragraph);

  AComment = (function(_super) {
    __extends(AComment, _super);

    function AComment() {
      return AComment.__super__.constructor.apply(this, arguments);
    }

    AComment.extend();

    return AComment;

  })(Comment);

  InnerComment = (function(_super) {
    __extends(InnerComment, _super);

    function InnerComment() {
      return InnerComment.__super__.constructor.apply(this, arguments);
    }

    InnerComment.extend();

    return InnerComment;

  })(Comment);

  Indentation = (function(_super) {
    __extends(Indentation, _super);

    function Indentation() {
      return Indentation.__super__.constructor.apply(this, arguments);
    }

    Indentation.extend(false);

    Indentation.prototype.getRange = function(startRow) {
      var baseIndentLevel, fn;
      if (this.editor.isBufferRowBlank(startRow)) {
        return;
      }
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      fn = (function(_this) {
        return function(row) {
          if (_this.editor.isBufferRowBlank(row)) {
            return _this.isInner();
          } else {
            return getIndentLevelForBufferRow(_this.editor, row) < baseIndentLevel;
          }
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    return Indentation;

  })(Paragraph);

  AIndentation = (function(_super) {
    __extends(AIndentation, _super);

    function AIndentation() {
      return AIndentation.__super__.constructor.apply(this, arguments);
    }

    AIndentation.extend();

    return AIndentation;

  })(Indentation);

  InnerIndentation = (function(_super) {
    __extends(InnerIndentation, _super);

    function InnerIndentation() {
      return InnerIndentation.__super__.constructor.apply(this, arguments);
    }

    InnerIndentation.extend();

    return InnerIndentation;

  })(Indentation);

  Fold = (function(_super) {
    __extends(Fold, _super);

    function Fold() {
      return Fold.__super__.constructor.apply(this, arguments);
    }

    Fold.extend(false);

    Fold.prototype.adjustRowRange = function(_arg) {
      var endRow, endRowIndentLevel, startRow, startRowIndentLevel;
      startRow = _arg[0], endRow = _arg[1];
      if (!this.isInner()) {
        return [startRow, endRow];
      }
      startRowIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      endRowIndentLevel = getIndentLevelForBufferRow(this.editor, endRow);
      if (startRowIndentLevel === endRowIndentLevel) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    };

    Fold.prototype.getFoldRowRangesContainsForRow = function(row) {
      var _ref2;
      return (_ref2 = getCodeFoldRowRangesContainesForRow(this.editor, row, true)) != null ? _ref2.reverse() : void 0;
    };

    Fold.prototype.selectTextObject = function(selection) {
      var range, rowRange, rowRanges, targetRange;
      range = selection.getBufferRange();
      rowRanges = this.getFoldRowRangesContainsForRow(range.start.row);
      if (rowRanges == null) {
        return;
      }
      if ((rowRange = rowRanges.shift()) != null) {
        rowRange = this.adjustRowRange(rowRange);
        targetRange = getBufferRangeForRowRange(this.editor, rowRange);
        if (targetRange.isEqual(range) && rowRanges.length) {
          rowRange = this.adjustRowRange(rowRanges.shift());
        }
      }
      if (rowRange != null) {
        return swrap(selection).selectRowRange(rowRange);
      }
    };

    return Fold;

  })(TextObject);

  AFold = (function(_super) {
    __extends(AFold, _super);

    function AFold() {
      return AFold.__super__.constructor.apply(this, arguments);
    }

    AFold.extend();

    return AFold;

  })(Fold);

  InnerFold = (function(_super) {
    __extends(InnerFold, _super);

    function InnerFold() {
      return InnerFold.__super__.constructor.apply(this, arguments);
    }

    InnerFold.extend();

    return InnerFold;

  })(Fold);

  Function = (function(_super) {
    __extends(Function, _super);

    function Function() {
      return Function.__super__.constructor.apply(this, arguments);
    }

    Function.extend(false);

    Function.prototype.omittingClosingCharLanguages = ['go'];

    Function.prototype.initialize = function() {
      return this.language = this.editor.getGrammar().scopeName.replace(/^source\./, '');
    };

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      var rowRanges, _ref2;
      rowRanges = (_ref2 = getCodeFoldRowRangesContainesForRow(this.editor, row)) != null ? _ref2.reverse() : void 0;
      return rowRanges != null ? rowRanges.filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this)) : void 0;
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, startRow, _ref2, _ref3;
      _ref2 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = _ref2[0], endRow = _ref2[1];
      if (this.isA() && (_ref3 = this.language, __indexOf.call(this.omittingClosingCharLanguages, _ref3) >= 0)) {
        endRow += 1;
      }
      return [startRow, endRow];
    };

    return Function;

  })(Fold);

  AFunction = (function(_super) {
    __extends(AFunction, _super);

    function AFunction() {
      return AFunction.__super__.constructor.apply(this, arguments);
    }

    AFunction.extend();

    return AFunction;

  })(Function);

  InnerFunction = (function(_super) {
    __extends(InnerFunction, _super);

    function InnerFunction() {
      return InnerFunction.__super__.constructor.apply(this, arguments);
    }

    InnerFunction.extend();

    return InnerFunction;

  })(Function);

  CurrentLine = (function(_super) {
    __extends(CurrentLine, _super);

    function CurrentLine() {
      return CurrentLine.__super__.constructor.apply(this, arguments);
    }

    CurrentLine.extend(false);

    CurrentLine.prototype.selectTextObject = function(selection) {
      var cursor;
      cursor = selection.cursor;
      cursor.moveToBeginningOfLine();
      if (this.isInner()) {
        cursor.moveToFirstCharacterOfLine();
      }
      return selection.selectToEndOfBufferLine();
    };

    return CurrentLine;

  })(TextObject);

  ACurrentLine = (function(_super) {
    __extends(ACurrentLine, _super);

    function ACurrentLine() {
      return ACurrentLine.__super__.constructor.apply(this, arguments);
    }

    ACurrentLine.extend();

    return ACurrentLine;

  })(CurrentLine);

  InnerCurrentLine = (function(_super) {
    __extends(InnerCurrentLine, _super);

    function InnerCurrentLine() {
      return InnerCurrentLine.__super__.constructor.apply(this, arguments);
    }

    InnerCurrentLine.extend();

    return InnerCurrentLine;

  })(CurrentLine);

  Entire = (function(_super) {
    __extends(Entire, _super);

    function Entire() {
      return Entire.__super__.constructor.apply(this, arguments);
    }

    Entire.extend(false);

    Entire.prototype.selectTextObject = function(selection) {
      return this.editor.selectAll();
    };

    return Entire;

  })(TextObject);

  AEntire = (function(_super) {
    __extends(AEntire, _super);

    function AEntire() {
      return AEntire.__super__.constructor.apply(this, arguments);
    }

    AEntire.extend();

    return AEntire;

  })(Entire);

  InnerEntire = (function(_super) {
    __extends(InnerEntire, _super);

    function InnerEntire() {
      return InnerEntire.__super__.constructor.apply(this, arguments);
    }

    InnerEntire.extend();

    return InnerEntire;

  })(Entire);

  LatestChange = (function(_super) {
    __extends(LatestChange, _super);

    function LatestChange() {
      return LatestChange.__super__.constructor.apply(this, arguments);
    }

    LatestChange.extend(false);

    LatestChange.prototype.getRange = function() {
      return this.vimState.mark.getRange('[', ']');
    };

    LatestChange.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getRange());
    };

    return LatestChange;

  })(TextObject);

  ALatestChange = (function(_super) {
    __extends(ALatestChange, _super);

    function ALatestChange() {
      return ALatestChange.__super__.constructor.apply(this, arguments);
    }

    ALatestChange.extend();

    return ALatestChange;

  })(LatestChange);

  InnerLatestChange = (function(_super) {
    __extends(InnerLatestChange, _super);

    function InnerLatestChange() {
      return InnerLatestChange.__super__.constructor.apply(this, arguments);
    }

    InnerLatestChange.extend();

    return InnerLatestChange;

  })(LatestChange);

  SearchMatchForward = (function(_super) {
    __extends(SearchMatchForward, _super);

    function SearchMatchForward() {
      return SearchMatchForward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchForward.extend();

    SearchMatchForward.prototype.getRange = function(selection) {
      var found, pattern, point, scanRange;
      if (!(pattern = globalState.lastSearchPattern)) {
        return null;
      }
      point = selection.getBufferRange().end;
      scanRange = [point.row, this.getVimEofBufferPosition()];
      found = null;
      this.editor.scanInBufferRange(pattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.end.isGreaterThan(point)) {
          found = range;
          return stop();
        }
      });
      return found;
    };

    SearchMatchForward.prototype.selectTextObject = function(selection) {
      var range, reversed;
      if (!(range = this.getRange(selection))) {
        return;
      }
      if (selection.isEmpty()) {
        reversed = this.backward;
        swrap(selection).setBufferRange(range, {
          reversed: reversed
        });
        return selection.cursor.autoscroll();
      } else {
        return swrap(selection).mergeBufferRange(range);
      }
    };

    return SearchMatchForward;

  })(TextObject);

  SearchMatchBackward = (function(_super) {
    __extends(SearchMatchBackward, _super);

    function SearchMatchBackward() {
      return SearchMatchBackward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchBackward.extend();

    SearchMatchBackward.prototype.backward = true;

    SearchMatchBackward.prototype.getRange = function(selection) {
      var found, pattern, point, scanRange;
      if (!(pattern = globalState.lastSearchPattern)) {
        return null;
      }
      point = selection.getBufferRange().start;
      scanRange = [[point.row, Infinity], [0, 0]];
      found = null;
      this.editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (range.start.isLessThan(point)) {
          found = range;
          return stop();
        }
      });
      return found;
    };

    return SearchMatchBackward;

  })(SearchMatchForward);

  PreviousSelection = (function(_super) {
    __extends(PreviousSelection, _super);

    function PreviousSelection() {
      return PreviousSelection.__super__.constructor.apply(this, arguments);
    }

    PreviousSelection.extend();

    PreviousSelection.prototype.backward = true;

    PreviousSelection.prototype.select = function() {
      var range;
      if (!(range = this.vimState.mark.getRange('<', '>'))) {
        return;
      }
      return this.editor.getLastSelection().setBufferRange(range);
    };

    return PreviousSelection;

  })(TextObject);

  MarkedRange = (function(_super) {
    __extends(MarkedRange, _super);

    function MarkedRange() {
      return MarkedRange.__super__.constructor.apply(this, arguments);
    }

    MarkedRange.extend();

    MarkedRange.prototype.backward = true;

    MarkedRange.prototype.select = function() {
      var ranges;
      ranges = this.vimState.getRangeMarkers().map(function(m) {
        return m.getBufferRange();
      });
      if (ranges.length) {
        return this.editor.setSelectedBufferRanges(ranges);
      }
    };

    return MarkedRange;

  })(TextObject);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnbURBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFLQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBTGQsQ0FBQTs7QUFBQSxFQU1BLFFBV0ksT0FBQSxDQUFRLFNBQVIsQ0FYSixFQUNFLG1CQUFBLFVBREYsRUFDYyxnQ0FBQSx1QkFEZCxFQUN1QyxrQkFBQSxTQUR2QyxFQUNrRCwyQkFBQSxrQkFEbEQsRUFFRSx1QkFBQSxjQUZGLEVBR0UsbUNBQUEsMEJBSEYsRUFJRSw0Q0FBQSxtQ0FKRixFQUtFLGtDQUFBLHlCQUxGLEVBTUUscUNBQUEsNEJBTkYsRUFPRSxzQ0FBQSw2QkFQRixFQVFFLHdDQUFBLCtCQVJGLEVBU0UsbUNBQUEsMEJBVEYsRUFVRSxpQ0FBQSx3QkFoQkYsQ0FBQTs7QUFBQSxFQW1CTTtBQUNKLGlDQUFBLENBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHlCQUNBLGtCQUFBLEdBQW9CLElBRHBCLENBQUE7O0FBR2EsSUFBQSxvQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsV0FBVyxDQUFBLFNBQUUsQ0FBQSxL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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/text-object.coffee
