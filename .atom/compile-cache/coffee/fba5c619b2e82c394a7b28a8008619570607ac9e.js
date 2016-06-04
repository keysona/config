(function() {
  var BlockwiseSelection, Range, getBufferRows, sortRanges, swrap, _, _ref;

  Range = require('atom').Range;

  _ = require('underscore-plus');

  _ref = require('./utils'), sortRanges = _ref.sortRanges, getBufferRows = _ref.getBufferRows;

  swrap = require('./selection-wrapper');

  BlockwiseSelection = (function() {
    BlockwiseSelection.prototype.editor = null;

    BlockwiseSelection.prototype.selections = null;

    BlockwiseSelection.prototype.goalColumn = null;

    BlockwiseSelection.prototype.reversed = false;

    function BlockwiseSelection(selection) {
      this.editor = selection.editor;
      this.initialize(selection);
    }

    BlockwiseSelection.prototype.getSelections = function() {
      return this.selections;
    };

    BlockwiseSelection.prototype.isBlockwise = function() {
      return true;
    };

    BlockwiseSelection.prototype.isEmpty = function() {
      return this.getSelections().every(function(selection) {
        return selection.isEmpty();
      });
    };

    BlockwiseSelection.prototype.initialize = function(selection) {
      var end, range, ranges, reversed, start, wasReversed, _i, _j, _len, _ref1, _ref2, _results;
      this.goalColumn = selection.cursor.goalColumn;
      this.selections = [selection];
      wasReversed = reversed = selection.isReversed();
      if (!swrap(selection).isSingleRow()) {
        range = selection.getBufferRange();
        if (range.end.column === 0) {
          range.end.row = range.end.row - 1;
        }
        if (this.goalColumn != null) {
          if (wasReversed) {
            range.start.column = this.goalColumn;
          } else {
            range.end.column = this.goalColumn + 1;
          }
        }
        if (range.start.column >= range.end.column) {
          reversed = !reversed;
          range = range.translate([0, 1], [0, -1]);
        }
        start = range.start, end = range.end;
        ranges = (function() {
          _results = [];
          for (var _i = _ref1 = start.row, _ref2 = end.row; _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; _ref1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this).map(function(row) {
          return [[row, start.column], [row, end.column]];
        });
        selection.setBufferRange(ranges.shift(), {
          reversed: reversed
        });
        for (_j = 0, _len = ranges.length; _j < _len; _j++) {
          range = ranges[_j];
          this.selections.push(this.editor.addSelectionForBufferRange(range, {
            reversed: reversed
          }));
        }
      }
      if (wasReversed) {
        this.reverse();
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.isReversed = function() {
      return this.reversed;
    };

    BlockwiseSelection.prototype.reverse = function() {
      return this.reversed = !this.reversed;
    };

    BlockwiseSelection.prototype.updateGoalColumn = function() {
      var selection, _i, _len, _ref1, _results;
      if (this.goalColumn != null) {
        _ref1 = this.selections;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          selection = _ref1[_i];
          _results.push(selection.cursor.goalColumn = this.goalColumn);
        }
        return _results;
      }
    };

    BlockwiseSelection.prototype.isSingleRow = function() {
      return this.selections.length === 1;
    };

    BlockwiseSelection.prototype.getHeight = function() {
      var endRow, startRow, _ref1;
      _ref1 = this.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
      return (endRow - startRow) + 1;
    };

    BlockwiseSelection.prototype.getStartSelection = function() {
      return this.selections[0];
    };

    BlockwiseSelection.prototype.getEndSelection = function() {
      return _.last(this.selections);
    };

    BlockwiseSelection.prototype.getHeadSelection = function() {
      if (this.isReversed()) {
        return this.getStartSelection();
      } else {
        return this.getEndSelection();
      }
    };

    BlockwiseSelection.prototype.getTailSelection = function() {
      if (this.isReversed()) {
        return this.getEndSelection();
      } else {
        return this.getStartSelection();
      }
    };

    BlockwiseSelection.prototype.getHeadBufferPosition = function() {
      return this.getHeadSelection().getHeadBufferPosition();
    };

    BlockwiseSelection.prototype.getTailBufferPosition = function() {
      return this.getTailSelection().getTailBufferPosition();
    };

    BlockwiseSelection.prototype.getBufferRowRange = function() {
      var endRow, startRow;
      startRow = this.getStartSelection().getBufferRowRange()[0];
      endRow = this.getEndSelection().getBufferRowRange()[0];
      return [startRow, endRow];
    };

    BlockwiseSelection.prototype.headReversedStateIsInSync = function() {
      return this.isReversed() === this.getHeadSelection().isReversed();
    };

    BlockwiseSelection.prototype.setSelectedBufferRanges = function(ranges, _arg) {
      var range, reversed, _i, _len;
      reversed = _arg.reversed;
      sortRanges(ranges);
      range = ranges.shift();
      this.setHeadBufferRange(range, {
        reversed: reversed
      });
      for (_i = 0, _len = ranges.length; _i < _len; _i++) {
        range = ranges[_i];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.setPositionForSelections = function(which) {
      var selection, _i, _len, _ref1, _results;
      _ref1 = this.selections;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        _results.push(swrap(selection).setBufferPositionTo(which));
      }
      return _results;
    };

    BlockwiseSelection.prototype.clearSelections = function(_arg) {
      var except, selection, _i, _len, _ref1, _results;
      except = (_arg != null ? _arg : {}).except;
      _ref1 = this.selections.slice();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (selection !== except) {
          _results.push(this.removeSelection(selection));
        }
      }
      return _results;
    };

    BlockwiseSelection.prototype.setHeadBufferPosition = function(point) {
      var head;
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      return head.cursor.setBufferPosition(point);
    };

    BlockwiseSelection.prototype.removeEmptySelections = function() {
      var selection, _i, _len, _ref1, _results;
      _ref1 = this.selections.slice();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (selection.isEmpty()) {
          _results.push(this.removeSelection(selection));
        }
      }
      return _results;
    };

    BlockwiseSelection.prototype.removeSelection = function(selection) {
      _.remove(this.selections, selection);
      return selection.destroy();
    };

    BlockwiseSelection.prototype.setHeadBufferRange = function(range, options) {
      var goalColumn, head, _base;
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      head.setBufferRange(range, options);
      if (goalColumn != null) {
        return (_base = head.cursor).goalColumn != null ? _base.goalColumn : _base.goalColumn = goalColumn;
      }
    };

    BlockwiseSelection.prototype.getCharacterwiseProperties = function() {
      var end, head, start, tail, _ref1, _ref2;
      head = this.getHeadBufferPosition();
      tail = this.getTailBufferPosition();
      if (this.isReversed()) {
        _ref1 = [head, tail], start = _ref1[0], end = _ref1[1];
      } else {
        _ref2 = [tail, head], start = _ref2[0], end = _ref2[1];
      }
      if (end.column === 0) {
        end.row += 1;
      }
      if (!(this.isSingleRow() || this.headReversedStateIsInSync())) {
        start.column -= 1;
        end.column += 1;
      }
      return {
        head: head,
        tail: tail
      };
    };

    BlockwiseSelection.prototype.getBufferRange = function() {
      var end, start;
      if (this.headReversedStateIsInSync()) {
        start = this.getStartSelection.getBufferrange().start;
        end = this.getEndSelection.getBufferrange().end;
      } else {
        start = this.getStartSelection.getBufferrange().end.translate([0, -1]);
        end = this.getEndSelection.getBufferrange().start.translate([0, +1]);
      }
      return {
        start: start,
        end: end
      };
    };

    BlockwiseSelection.prototype.restoreCharacterwise = function() {
      var goalColumn, head, properties, _base;
      if (this.isEmpty()) {
        return;
      }
      properties = this.getCharacterwiseProperties();
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      swrap(head).selectByProperties(properties);
      if (goalColumn != null) {
        return (_base = head.cursor).goalColumn != null ? _base.goalColumn : _base.goalColumn = goalColumn;
      }
    };

    return BlockwiseSelection;

  })();

  module.exports = BlockwiseSelection;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jsb2Nrd2lzZS1zZWxlY3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9FQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR0EsT0FBOEIsT0FBQSxDQUFRLFNBQVIsQ0FBOUIsRUFBQyxrQkFBQSxVQUFELEVBQWEscUJBQUEsYUFIYixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFNTTtBQUNKLGlDQUFBLE1BQUEsR0FBUSxJQUFSLENBQUE7O0FBQUEsaUNBQ0EsVUFBQSxHQUFZLElBRFosQ0FBQTs7QUFBQSxpQ0FFQSxVQUFBLEdBQVksSUFGWixDQUFBOztBQUFBLGlDQUdBLFFBQUEsR0FBVSxLQUhWLENBQUE7O0FBS2EsSUFBQSw0QkFBQyxTQUFELEdBQUE7QUFDWCxNQUFDLElBQUMsQ0FBQSxTQUFVLFVBQVYsTUFBRixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxDQUFZLFNBQVosQ0FEQSxDQURXO0lBQUEsQ0FMYjs7QUFBQSxpQ0FTQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQ2IsSUFBQyxDQUFBLFdBRFk7SUFBQSxDQVRmLENBQUE7O0FBQUEsaUNBWUEsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUNYLEtBRFc7SUFBQSxDQVpiLENBQUE7O0FBQUEsaUNBZUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixTQUFDLFNBQUQsR0FBQTtlQUNyQixT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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/blockwise-selection.coffee
