(function() {
  var Base, BlockwiseOtherEnd, MiscCommand, Range, Redo, ReplaceModeBackspace, ReverseSelections, Scroll, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ToggleFold, Undo, highlightRanges, isLinewiseRange, mergeIntersectingRanges, pointIsAtEndOfLine, settings, swrap, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  _ = require('underscore-plus');

  _ref = require('./utils'), isLinewiseRange = _ref.isLinewiseRange, pointIsAtEndOfLine = _ref.pointIsAtEndOfLine, mergeIntersectingRanges = _ref.mergeIntersectingRanges, highlightRanges = _ref.highlightRanges;

  MiscCommand = (function(_super) {
    __extends(MiscCommand, _super);

    MiscCommand.extend(false);

    function MiscCommand() {
      MiscCommand.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return MiscCommand;

  })(Base);

  ReverseSelections = (function(_super) {
    __extends(ReverseSelections, _super);

    function ReverseSelections() {
      return ReverseSelections.__super__.constructor.apply(this, arguments);
    }

    ReverseSelections.extend();

    ReverseSelections.prototype.execute = function() {
      return swrap.reverse(this.editor);
    };

    return ReverseSelections;

  })(MiscCommand);

  BlockwiseOtherEnd = (function(_super) {
    __extends(BlockwiseOtherEnd, _super);

    function BlockwiseOtherEnd() {
      return BlockwiseOtherEnd.__super__.constructor.apply(this, arguments);
    }

    BlockwiseOtherEnd.extend();

    BlockwiseOtherEnd.prototype.execute = function() {
      var bs, _i, _len, _ref1;
      _ref1 = this.getBlockwiseSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        bs = _ref1[_i];
        bs.reverse();
      }
      return BlockwiseOtherEnd.__super__.execute.apply(this, arguments);
    };

    return BlockwiseOtherEnd;

  })(ReverseSelections);

  Undo = (function(_super) {
    __extends(Undo, _super);

    function Undo() {
      return Undo.__super__.constructor.apply(this, arguments);
    }

    Undo.extend();

    Undo.prototype.saveRangeAsMarker = function(markers, range) {
      if (_.all(markers, function(m) {
        return !m.getBufferRange().intersectsWith(range);
      })) {
        return markers.push(this.editor.markBufferRange(range));
      }
    };

    Undo.prototype.trimEndOfLineRange = function(range) {
      var start;
      start = range.start;
      if ((start.column !== 0) && pointIsAtEndOfLine(this.editor, start)) {
        return range.traverse([+1, 0], [0, 0]);
      } else {
        return range;
      }
    };

    Undo.prototype.mapToChangedRanges = function(list, fn) {
      var ranges;
      ranges = list.map(function(e) {
        return fn(e);
      });
      return mergeIntersectingRanges(ranges).map((function(_this) {
        return function(r) {
          return _this.trimEndOfLineRange(r);
        };
      })(this));
    };

    Undo.prototype.mutateWithTrackingChanges = function(fn) {
      var disposable, firstAdded, lastRemoved, markersAdded, range, rangesAdded, rangesRemoved;
      markersAdded = [];
      rangesRemoved = [];
      disposable = this.editor.getBuffer().onDidChange((function(_this) {
        return function(_arg) {
          var newRange, oldRange;
          oldRange = _arg.oldRange, newRange = _arg.newRange;
          if (!oldRange.isEmpty()) {
            rangesRemoved.push(oldRange);
          }
          if (!newRange.isEmpty()) {
            return _this.saveRangeAsMarker(markersAdded, newRange);
          }
        };
      })(this));
      this.mutate();
      disposable.dispose();
      rangesAdded = this.mapToChangedRanges(markersAdded, function(m) {
        return m.getBufferRange();
      });
      markersAdded.forEach(function(m) {
        return m.destroy();
      });
      rangesRemoved = this.mapToChangedRanges(rangesRemoved, function(r) {
        return r;
      });
      firstAdded = rangesAdded[0];
      lastRemoved = _.last(rangesRemoved);
      range = (firstAdded != null) && (lastRemoved != null) ? firstAdded.start.isLessThan(lastRemoved.start) ? firstAdded : lastRemoved : firstAdded || lastRemoved;
      if (range != null) {
        fn(range);
      }
      if (settings.get('flashOnUndoRedo')) {
        return this.onDidFinishOperation((function(_this) {
          return function() {
            var timeout;
            timeout = settings.get('flashOnUndoRedoDuration');
            highlightRanges(_this.editor, rangesRemoved, {
              "class": "vim-mode-plus-flash removed",
              timeout: timeout
            });
            return highlightRanges(_this.editor, rangesAdded, {
              "class": "vim-mode-plus-flash added",
              timeout: timeout
            });
          };
        })(this));
      }
    };

    Undo.prototype.execute = function() {
      var selection, _i, _len, _ref1;
      this.mutateWithTrackingChanges((function(_this) {
        return function(_arg) {
          var end, start;
          start = _arg.start, end = _arg.end;
          _this.vimState.mark.set('[', start);
          _this.vimState.mark.set(']', end);
          if (settings.get('setCursorToStartOfChangeOnUndoRedo')) {
            return _this.editor.setCursorBufferPosition(start);
          }
        };
      })(this));
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        selection.clear();
      }
      return this.activateMode('normal');
    };

    Undo.prototype.mutate = function() {
      return this.editor.undo();
    };

    return Undo;

  })(MiscCommand);

  Redo = (function(_super) {
    __extends(Redo, _super);

    function Redo() {
      return Redo.__super__.constructor.apply(this, arguments);
    }

    Redo.extend();

    Redo.prototype.mutate = function() {
      return this.editor.redo();
    };

    return Redo;

  })(Undo);

  ToggleFold = (function(_super) {
    __extends(ToggleFold, _super);

    function ToggleFold() {
      return ToggleFold.__super__.constructor.apply(this, arguments);
    }

    ToggleFold.extend();

    ToggleFold.prototype.execute = function() {
      var point;
      point = this.editor.getCursorBufferPosition();
      return this.editor.toggleFoldAtBufferRow(point.row);
    };

    return ToggleFold;

  })(MiscCommand);

  ReplaceModeBackspace = (function(_super) {
    __extends(ReplaceModeBackspace, _super);

    function ReplaceModeBackspace() {
      return ReplaceModeBackspace.__super__.constructor.apply(this, arguments);
    }

    ReplaceModeBackspace.commandScope = 'atom-text-editor.vim-mode-plus.insert-mode.replace';

    ReplaceModeBackspace.extend();

    ReplaceModeBackspace.prototype.execute = function() {
      return this.editor.getSelections().forEach((function(_this) {
        return function(selection) {
          var char;
          char = _this.vimState.modeManager.getReplacedCharForSelection(selection);
          if (char != null) {
            selection.selectLeft();
            if (!selection.insertText(char).isEmpty()) {
              return selection.cursor.moveLeft();
            }
          }
        };
      })(this));
    };

    return ReplaceModeBackspace;

  })(MiscCommand);

  Scroll = (function(_super) {
    __extends(Scroll, _super);

    function Scroll() {
      return Scroll.__super__.constructor.apply(this, arguments);
    }

    Scroll.extend(false);

    Scroll.prototype.scrolloff = 2;

    Scroll.prototype.cursorPixel = null;

    Scroll.prototype.getFirstVisibleScreenRow = function() {
      return this.editorElement.getFirstVisibleScreenRow();
    };

    Scroll.prototype.getLastVisibleScreenRow = function() {
      return this.editorElement.getLastVisibleScreenRow();
    };

    Scroll.prototype.getLastScreenRow = function() {
      return this.editor.getLastScreenRow();
    };

    Scroll.prototype.getCursorPixel = function() {
      var point;
      point = this.editor.getCursorScreenPosition();
      return this.editorElement.pixelPositionForScreenPosition(point);
    };

    return Scroll;

  })(MiscCommand);

  ScrollDown = (function(_super) {
    __extends(ScrollDown, _super);

    function ScrollDown() {
      return ScrollDown.__super__.constructor.apply(this, arguments);
    }

    ScrollDown.extend();

    ScrollDown.prototype.execute = function() {
      var column, count, margin, newFirstRow, newPoint, oldFirstRow, row, _ref1;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      newFirstRow = this.editor.getFirstVisibleScreenRow();
      margin = this.editor.getVerticalScrollMargin();
      _ref1 = this.editor.getCursorScreenPosition(), row = _ref1.row, column = _ref1.column;
      if (row < (newFirstRow + margin)) {
        newPoint = [[row + count], column];
        return this.editor.setCursorScreenPosition(newPoint, {
          autoscroll: false
        });
      }
    };

    return ScrollDown;

  })(Scroll);

  ScrollUp = (function(_super) {
    __extends(ScrollUp, _super);

    function ScrollUp() {
      return ScrollUp.__super__.constructor.apply(this, arguments);
    }

    ScrollUp.extend();

    ScrollUp.prototype.execute = function() {
      var column, count, margin, newLastRow, newPoint, oldFirstRow, row, _ref1;
      count = this.getCount();
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      newLastRow = this.editor.getLastVisibleScreenRow();
      margin = this.editor.getVerticalScrollMargin();
      _ref1 = this.editor.getCursorScreenPosition(), row = _ref1.row, column = _ref1.column;
      if (row >= (newLastRow - margin)) {
        newPoint = [[row - count], column];
        return this.editor.setCursorScreenPosition(newPoint, {
          autoscroll: false
        });
      }
    };

    return ScrollUp;

  })(Scroll);

  ScrollCursor = (function(_super) {
    __extends(ScrollCursor, _super);

    function ScrollCursor() {
      return ScrollCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollCursor.extend(false);

    ScrollCursor.prototype.execute = function() {
      if (typeof this.moveToFirstCharacterOfLine === "function") {
        this.moveToFirstCharacterOfLine();
      }
      if (this.isScrollable()) {
        return this.editorElement.setScrollTop(this.getScrollTop());
      }
    };

    ScrollCursor.prototype.moveToFirstCharacterOfLine = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    ScrollCursor.prototype.getOffSetPixelHeight = function(lineDelta) {
      if (lineDelta == null) {
        lineDelta = 0;
      }
      return this.editor.getLineHeightInPixels() * (this.scrolloff + lineDelta);
    };

    return ScrollCursor;

  })(Scroll);

  ScrollCursorToTop = (function(_super) {
    __extends(ScrollCursorToTop, _super);

    function ScrollCursorToTop() {
      return ScrollCursorToTop.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTop.extend();

    ScrollCursorToTop.prototype.isScrollable = function() {
      return this.getLastVisibleScreenRow() !== this.getLastScreenRow();
    };

    ScrollCursorToTop.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - this.getOffSetPixelHeight();
    };

    return ScrollCursorToTop;

  })(ScrollCursor);

  ScrollCursorToTopLeave = (function(_super) {
    __extends(ScrollCursorToTopLeave, _super);

    function ScrollCursorToTopLeave() {
      return ScrollCursorToTopLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTopLeave.extend();

    ScrollCursorToTopLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToTopLeave;

  })(ScrollCursorToTop);

  ScrollCursorToBottom = (function(_super) {
    __extends(ScrollCursorToBottom, _super);

    function ScrollCursorToBottom() {
      return ScrollCursorToBottom.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottom.extend();

    ScrollCursorToBottom.prototype.isScrollable = function() {
      return this.getFirstVisibleScreenRow() !== 0;
    };

    ScrollCursorToBottom.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() - this.getOffSetPixelHeight(1));
    };

    return ScrollCursorToBottom;

  })(ScrollCursor);

  ScrollCursorToBottomLeave = (function(_super) {
    __extends(ScrollCursorToBottomLeave, _super);

    function ScrollCursorToBottomLeave() {
      return ScrollCursorToBottomLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottomLeave.extend();

    ScrollCursorToBottomLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToBottomLeave;

  })(ScrollCursorToBottom);

  ScrollCursorToMiddle = (function(_super) {
    __extends(ScrollCursorToMiddle, _super);

    function ScrollCursorToMiddle() {
      return ScrollCursorToMiddle.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddle.extend();

    ScrollCursorToMiddle.prototype.isScrollable = function() {
      return true;
    };

    ScrollCursorToMiddle.prototype.getScrollTop = function() {
      return this.getCursorPixel().top - (this.editorElement.getHeight() / 2);
    };

    return ScrollCursorToMiddle;

  })(ScrollCursor);

  ScrollCursorToMiddleLeave = (function(_super) {
    __extends(ScrollCursorToMiddleLeave, _super);

    function ScrollCursorToMiddleLeave() {
      return ScrollCursorToMiddleLeave.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddleLeave.extend();

    ScrollCursorToMiddleLeave.prototype.moveToFirstCharacterOfLine = null;

    return ScrollCursorToMiddleLeave;

  })(ScrollCursorToMiddle);

  ScrollCursorToLeft = (function(_super) {
    __extends(ScrollCursorToLeft, _super);

    function ScrollCursorToLeft() {
      return ScrollCursorToLeft.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToLeft.extend();

    ScrollCursorToLeft.prototype.execute = function() {
      return this.editorElement.setScrollLeft(this.getCursorPixel().left);
    };

    return ScrollCursorToLeft;

  })(Scroll);

  ScrollCursorToRight = (function(_super) {
    __extends(ScrollCursorToRight, _super);

    function ScrollCursorToRight() {
      return ScrollCursorToRight.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToRight.extend();

    ScrollCursorToRight.prototype.execute = function() {
      return this.editorElement.setScrollRight(this.getCursorPixel().left);
    };

    return ScrollCursorToRight;

  })(ScrollCursorToLeft);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdWJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUZSLENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUpKLENBQUE7O0FBQUEsRUFNQSxPQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSx1QkFBQSxlQURGLEVBRUUsMEJBQUEsa0JBRkYsRUFHRSwrQkFBQSx1QkFIRixFQUlFLHVCQUFBLGVBVkYsQ0FBQTs7QUFBQSxFQWFNO0FBQ0osa0NBQUEsQ0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQ2EsSUFBQSxxQkFBQSxHQUFBO0FBQ1gsTUFBQSw4Q0FBQSxTQUFBLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUE7T0FGVTtJQUFBLENBRGI7O3VCQUFBOztLQUR3QixLQWIxQixDQUFBOztBQUFBLEVBbUJNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLGdDQUNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFJUCxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxNQUFmLEVBSk87SUFBQSxDQURULENBQUE7OzZCQUFB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/misc-command.coffee
