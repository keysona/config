(function() {
  var Disposable, Range, SelectionWrapper, isLinewiseRange, swrap, _, _ref;

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, Disposable = _ref.Disposable;

  isLinewiseRange = require('./utils').isLinewiseRange;

  SelectionWrapper = (function() {
    function SelectionWrapper(selection) {
      this.selection = selection;
    }

    SelectionWrapper.prototype.getProperties = function() {
      var _ref1;
      return (_ref1 = this.selection.marker.getProperties()['vim-mode-plus']) != null ? _ref1 : {};
    };

    SelectionWrapper.prototype.hasProperties = function() {
      return this.selection.marker.getProperties()['vim-mode-plus'] != null;
    };

    SelectionWrapper.prototype.setProperties = function(prop) {
      return this.selection.marker.setProperties({
        "vim-mode-plus": prop
      });
    };

    SelectionWrapper.prototype.resetProperties = function() {
      return this.selection.marker.setProperties({
        "vim-mode-plus": null
      });
    };

    SelectionWrapper.prototype.setBufferRangeSafely = function(range) {
      if (range) {
        this.setBufferRange(range);
        if (this.selection.isLastSelection()) {
          return this.selection.cursor.autoscroll();
        }
      }
    };

    SelectionWrapper.prototype.getBufferRange = function() {
      return this.selection.getBufferRange();
    };

    SelectionWrapper.prototype.getNormalizedBufferPosition = function() {
      var editor, point, screenPoint;
      point = this.selection.getHeadBufferPosition();
      editor = this.selection.editor;
      if (this.isForwarding()) {
        screenPoint = editor.screenPositionForBufferPosition(point);
        point = editor.bufferPositionForScreenPosition(screenPoint.translate([0, -1]), {
          clip: 'backward',
          wrapBeyondNewlines: true
        });
      }
      return point;
    };

    SelectionWrapper.prototype.normalizeBufferPosition = function() {
      var head, point;
      head = this.selection.getHeadBufferPosition();
      point = this.getNormalizedBufferPosition();
      this.selection.modifySelection((function(_this) {
        return function() {
          return _this.selection.cursor.setBufferPosition(point);
        };
      })(this));
      return new Disposable((function(_this) {
        return function() {
          if (!head.isEqual(point)) {
            return _this.selection.modifySelection(function() {
              return _this.selection.cursor.setBufferPosition(head);
            });
          }
        };
      })(this));
    };

    SelectionWrapper.prototype.getBufferPositionFor = function(which, _arg) {
      var end, fromProperty, head, start, tail, _ref1, _ref2, _ref3, _ref4;
      fromProperty = (_arg != null ? _arg : {}).fromProperty;
      if (fromProperty == null) {
        fromProperty = false;
      }
      if (fromProperty && this.hasProperties()) {
        _ref1 = this.getProperties(), head = _ref1.head, tail = _ref1.tail;
        if (head.isGreaterThanOrEqual(tail)) {
          _ref2 = [tail, head], start = _ref2[0], end = _ref2[1];
        } else {
          _ref3 = [head, tail], start = _ref3[0], end = _ref3[1];
        }
      } else {
        _ref4 = this.selection.getBufferRange(), start = _ref4.start, end = _ref4.end;
        head = this.selection.getHeadBufferPosition();
        tail = this.selection.getTailBufferPosition();
      }
      switch (which) {
        case 'start':
          return start;
        case 'end':
          return end;
        case 'head':
          return head;
        case 'tail':
          return tail;
      }
    };

    SelectionWrapper.prototype.setBufferPositionTo = function(which, options) {
      var point;
      point = this.getBufferPositionFor(which, options);
      return this.selection.cursor.setBufferPosition(point);
    };

    SelectionWrapper.prototype.mergeBufferRange = function(range, option) {
      return this.setBufferRange(this.getBufferRange().union(range), option);
    };

    SelectionWrapper.prototype.reverse = function() {
      var head, tail, _ref1;
      this.setReversedState(!this.selection.isReversed());
      _ref1 = this.getProperties(), head = _ref1.head, tail = _ref1.tail;
      if ((head != null) && (tail != null)) {
        return this.setProperties({
          head: tail,
          tail: head
        });
      }
    };

    SelectionWrapper.prototype.setReversedState = function(reversed) {
      return this.setBufferRange(this.getBufferRange(), {
        autoscroll: true,
        reversed: reversed,
        preserveFolds: true
      });
    };

    SelectionWrapper.prototype.getRows = function() {
      var endRow, startRow, _i, _ref1, _results;
      _ref1 = this.selection.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
      return (function() {
        _results = [];
        for (var _i = startRow; startRow <= endRow ? _i <= endRow : _i >= endRow; startRow <= endRow ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
    };

    SelectionWrapper.prototype.getRowCount = function() {
      var endRow, startRow, _ref1;
      _ref1 = this.selection.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
      return endRow - startRow + 1;
    };

    SelectionWrapper.prototype.selectRowRange = function(rowRange) {
      var editor, endRow, rangeEnd, rangeStart, startRow;
      editor = this.selection.editor;
      startRow = rowRange[0], endRow = rowRange[1];
      rangeStart = editor.bufferRangeForBufferRow(startRow, {
        includeNewline: true
      });
      rangeEnd = editor.bufferRangeForBufferRow(endRow, {
        includeNewline: true
      });
      return this.setBufferRange(rangeStart.union(rangeEnd), {
        preserveFolds: true
      });
    };

    SelectionWrapper.prototype.expandOverLine = function(options) {
      var goalColumn, preserveGoalColumn;
      if (options == null) {
        options = {};
      }
      preserveGoalColumn = options.preserveGoalColumn;
      if (preserveGoalColumn) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      this.selectRowRange(this.selection.getBufferRowRange());
      if (goalColumn) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.getBufferRangeForTailRow = function() {
      var endRow, row, startRow, _ref1;
      _ref1 = this.selection.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
      row = this.selection.isReversed() ? endRow : startRow;
      return this.selection.editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    };

    SelectionWrapper.prototype.getTailBufferRange = function() {
      var editor, end, start;
      if (this.isSingleRow() && this.isLinewise()) {
        return this.getBufferRangeForTailRow();
      } else {
        editor = this.selection.editor;
        start = this.selection.getTailScreenPosition();
        if (this.selection.isReversed()) {
          end = editor.clipScreenPosition(start.translate([0, -1]), {
            clip: 'backward'
          });
        } else {
          end = editor.clipScreenPosition(start.translate([0, +1]), {
            clip: 'forward',
            wrapBeyondNewlines: true
          });
        }
        return editor.bufferRangeForScreenRange([start, end]);
      }
    };

    SelectionWrapper.prototype.preserveCharacterwise = function() {
      var endPoint, point, properties;
      properties = this.detectCharacterwiseProperties();
      if (!this.selection.isEmpty()) {
        endPoint = this.selection.isReversed() ? 'tail' : 'head';
        point = properties[endPoint].translate([0, -1]);
        properties[endPoint] = this.selection.editor.clipBufferPosition(point);
      }
      return this.setProperties(properties);
    };

    SelectionWrapper.prototype.detectCharacterwiseProperties = function() {
      return {
        head: this.selection.getHeadBufferPosition(),
        tail: this.selection.getTailBufferPosition()
      };
    };

    SelectionWrapper.prototype.getCharacterwiseHeadPosition = function() {
      return this.getProperties().head;
    };

    SelectionWrapper.prototype.selectByProperties = function(_arg) {
      var head, tail;
      head = _arg.head, tail = _arg.tail;
      this.setBufferRange([tail, head]);
      return this.setReversedState(head.isLessThan(tail));
    };

    SelectionWrapper.prototype.isForwarding = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return head.isGreaterThan(tail);
    };

    SelectionWrapper.prototype.restoreCharacterwise = function(options) {
      var editor, end, goalColumn, head, preserveGoalColumn, screenPoint, start, tail, _ref1, _ref2, _ref3, _ref4;
      if (options == null) {
        options = {};
      }
      preserveGoalColumn = options.preserveGoalColumn;
      if (preserveGoalColumn) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      _ref1 = this.getProperties(), head = _ref1.head, tail = _ref1.tail;
      if (!((head != null) && (tail != null))) {
        return;
      }
      if (this.selection.isReversed()) {
        _ref2 = [head, tail], start = _ref2[0], end = _ref2[1];
      } else {
        _ref3 = [tail, head], start = _ref3[0], end = _ref3[1];
      }
      _ref4 = this.selection.getBufferRowRange(), start.row = _ref4[0], end.row = _ref4[1];
      editor = this.selection.editor;
      screenPoint = editor.screenPositionForBufferPosition(end);
      end = editor.bufferPositionForScreenPosition(screenPoint.translate([0, +1]), {
        clip: 'forward',
        wrapBeyondNewlines: true
      });
      this.setBufferRange([start, end], {
        preserveFolds: true
      });
      this.resetProperties();
      if (goalColumn) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.setBufferRange = function(range, options) {
      if (options == null) {
        options = {};
      }
      if (options.autoscroll == null) {
        options.autoscroll = false;
      }
      return this.selection.setBufferRange(range, options);
    };

    SelectionWrapper.prototype.replace = function(text) {
      var originalText;
      originalText = this.selection.getText();
      this.selection.insertText(text);
      return originalText;
    };

    SelectionWrapper.prototype.lineTextForBufferRows = function() {
      var editor;
      editor = this.selection.editor;
      return this.getRows().map(function(row) {
        return editor.lineTextForBufferRow(row);
      });
    };

    SelectionWrapper.prototype.translate = function(startDelta, endDelta, options) {
      var newRange;
      if (endDelta == null) {
        endDelta = startDelta;
      }
      newRange = this.getBufferRange().translate(startDelta, endDelta);
      return this.setBufferRange(newRange, options);
    };

    SelectionWrapper.prototype.isSingleRow = function() {
      var endRow, startRow, _ref1;
      _ref1 = this.selection.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
      return startRow === endRow;
    };

    SelectionWrapper.prototype.isLinewise = function() {
      return isLinewiseRange(this.getBufferRange());
    };

    SelectionWrapper.prototype.detectVisualModeSubmode = function() {
      switch (false) {
        case !this.isLinewise():
          return 'linewise';
        case !!this.selection.isEmpty():
          return 'characterwise';
        default:
          return null;
      }
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
  };

  swrap.setReversedState = function(editor, reversed) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).setReversedState(reversed);
    });
  };

  swrap.expandOverLine = function(editor, options) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).expandOverLine(options);
    });
  };

  swrap.reverse = function(editor) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).reverse();
    });
  };

  swrap.resetProperties = function(editor) {
    return editor.getSelections().forEach(function(selection) {
      return swrap(selection).resetProperties();
    });
  };

  swrap.detectVisualModeSubmode = function(editor) {
    var results, selection, selections;
    selections = editor.getSelections();
    results = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        _results.push(swrap(selection).detectVisualModeSubmode());
      }
      return _results;
    })();
    if (results.every(function(r) {
      return r === 'linewise';
    })) {
      return 'linewise';
    } else if (results.some(function(r) {
      return r === 'characterwise';
    })) {
      return 'characterwise';
    } else {
      return null;
    }
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdGlvbi13cmFwcGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvRUFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBc0IsT0FBQSxDQUFRLE1BQVIsQ0FBdEIsRUFBQyxhQUFBLEtBQUQsRUFBUSxrQkFBQSxVQURSLENBQUE7O0FBQUEsRUFFQyxrQkFBbUIsT0FBQSxDQUFRLFNBQVIsRUFBbkIsZUFGRCxDQUFBOztBQUFBLEVBSU07QUFDUyxJQUFBLDBCQUFFLFNBQUYsR0FBQTtBQUFjLE1BQWIsSUFBQyxDQUFBLFlBQUEsU0FBWSxDQUFkO0lBQUEsQ0FBYjs7QUFBQSwrQkFFQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxLQUFBO2dHQUFxRCxHQUR4QztJQUFBLENBRmYsQ0FBQTs7QUFBQSwrQkFLQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQ2IsK0RBRGE7SUFBQSxDQUxmLENBQUE7O0FBQUEsK0JBUUEsYUFBQSxHQUFlLFNBQUMsSUFBRCxHQUFBO2FBQ2IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBbEIsQ0FBZ0M7QUFBQSxRQUFDLGVBQUEsRUFBaUIsSUFBbEI7T0FBaEMsRUFEYTtJQUFBLENBUmYsQ0FBQTs7QUFBQSwrQkFXQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTthQUNmLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWxCLENBQWdDO0FBQUEsUUFBQyxlQUFBLEVBQWlCLElBQWxCO09BQWhDLEVBRGU7SUFBQSxDQVhqQixDQUFBOztBQUFBLCtCQWNBLG9CQUFBLEdBQXNCLFNBQUMsS0FBRCxHQUFBO0FBQ3BCLE1B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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/selection-wrapper.coffee
