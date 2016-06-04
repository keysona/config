(function() {
  var Base, BlockwiseOtherEnd, MaximizePane, MiscCommand, Range, Redo, ReplaceModeBackspace, ReverseSelections, Scroll, ScrollCursor, ScrollCursorToBottom, ScrollCursorToBottomLeave, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToMiddleLeave, ScrollCursorToRight, ScrollCursorToTop, ScrollCursorToTopLeave, ScrollDown, ScrollUp, ToggleFold, Undo, highlightRanges, isLinewiseRange, mergeIntersectingRanges, pointIsAtEndOfLine, settings, swrap, _, _ref,
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

  MaximizePane = (function(_super) {
    __extends(MaximizePane, _super);

    function MaximizePane() {
      return MaximizePane.__super__.constructor.apply(this, arguments);
    }

    MaximizePane.extend();

    MaximizePane.prototype.execute = function() {
      var selector, workspaceElement;
      selector = 'vim-mode-plus-pane-maximized';
      workspaceElement = atom.views.getView(atom.workspace);
      return workspaceElement.classList.toggle(selector);
    };

    return MaximizePane;

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

    ScrollDown.prototype.direction = 'down';

    ScrollDown.prototype.execute = function() {
      var amountInPixel, scrollTop;
      amountInPixel = this.editor.getLineHeightInPixels() * this.getCount();
      scrollTop = this.editorElement.getScrollTop();
      switch (this.direction) {
        case 'down':
          scrollTop += amountInPixel;
          break;
        case 'up':
          scrollTop -= amountInPixel;
      }
      this.editorElement.setScrollTop(scrollTop);
      return typeof this.keepCursorOnScreen === "function" ? this.keepCursorOnScreen() : void 0;
    };

    ScrollDown.prototype.keepCursorOnScreen = function() {
      var column, newRow, row, rowMax, rowMin, _ref1;
      _ref1 = this.editor.getCursorScreenPosition(), row = _ref1.row, column = _ref1.column;
      newRow = row < (rowMin = this.getFirstVisibleScreenRow() + this.scrolloff) ? rowMin : row > (rowMax = this.getLastVisibleScreenRow() - (this.scrolloff + 1)) ? rowMax : void 0;
      if (newRow != null) {
        return this.editor.setCursorScreenPosition([newRow, column]);
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

    ScrollUp.prototype.direction = 'up';

    return ScrollUp;

  })(ScrollDown);

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscWNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUZSLENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUpKLENBQUE7O0FBQUEsRUFNQSxPQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSx1QkFBQSxlQURGLEVBRUUsMEJBQUEsa0JBRkYsRUFHRSwrQkFBQSx1QkFIRixFQUlFLHVCQUFBLGVBVkYsQ0FBQTs7QUFBQSxFQWFNO0FBQ0osa0NBQUEsQ0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQ2EsSUFBQSxxQkFBQSxHQUFBO0FBQ1gsTUFBQSw4Q0FBQSxTQUFBLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUE7T0FGVTtJQUFBLENBRGI7O3VCQUFBOztLQUR3QixLQWIxQixDQUFBOztBQUFBLEVBbUJNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLGdDQUNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFJUCxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxNQUFmLEVBSk87SUFBQSxDQURULENBQUE7OzZCQUFB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/misc-command.coffee
