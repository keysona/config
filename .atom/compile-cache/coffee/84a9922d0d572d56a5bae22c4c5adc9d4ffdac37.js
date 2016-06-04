(function() {
  var Disposable, Range, SelectionWrapper, getClipOptions, isLinewiseRange, propertyStorage, swrap, _, _ref;

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, Disposable = _ref.Disposable;

  isLinewiseRange = require('./utils').isLinewiseRange;

  propertyStorage = null;

  getClipOptions = function(editor, direction) {
    if (editor.displayLayer != null) {
      return {
        clipDirection: direction
      };
    } else {
      switch (direction) {
        case 'backward':
          return {
            clip: direction
          };
        case 'forward':
          return {
            clip: direction,
            wrapBeyondNewlines: true
          };
      }
    }
  };

  SelectionWrapper = (function() {
    SelectionWrapper.init = function() {
      propertyStorage = new Map();
      return new Disposable(function() {
        propertyStorage.clear();
        return propertyStorage = null;
      });
    };

    function SelectionWrapper(selection) {
      this.selection = selection;
    }

    SelectionWrapper.prototype.hasProperties = function() {
      return propertyStorage.has(this.selection);
    };

    SelectionWrapper.prototype.getProperties = function() {
      var _ref1;
      return (_ref1 = propertyStorage.get(this.selection)) != null ? _ref1 : {};
    };

    SelectionWrapper.prototype.setProperties = function(prop) {
      return propertyStorage.set(this.selection, prop);
    };

    SelectionWrapper.prototype.resetProperties = function() {
      return propertyStorage != null ? propertyStorage["delete"](this.selection) : void 0;
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
      var editor, options, point, screenPoint;
      point = this.selection.getHeadBufferPosition();
      if (this.isForwarding()) {
        editor = this.selection.editor;
        screenPoint = editor.screenPositionForBufferPosition(point).translate([0, -1]);
        options = getClipOptions(editor, 'backward');
        return editor.bufferPositionForScreenPosition(screenPoint, options);
      } else {
        return point;
      }
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
      var editor, end, options, start;
      if (this.isSingleRow() && this.isLinewise()) {
        return this.getBufferRangeForTailRow();
      } else {
        editor = this.selection.editor;
        start = this.selection.getTailScreenPosition();
        end = this.selection.isReversed() ? (options = getClipOptions(editor, 'backward'), editor.clipScreenPosition(start.translate([0, -1]), options)) : (options = getClipOptions(editor, 'forward'), editor.clipScreenPosition(start.translate([0, +1]), options));
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
      screenPoint = editor.screenPositionForBufferPosition(end).translate([0, 1]);
      options = getClipOptions(editor, 'forward');
      end = editor.bufferPositionForScreenPosition(screenPoint, options);
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

  swrap.init = function() {
    return SelectionWrapper.init();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdGlvbi13cmFwcGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxR0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBc0IsT0FBQSxDQUFRLE1BQVIsQ0FBdEIsRUFBQyxhQUFBLEtBQUQsRUFBUSxrQkFBQSxVQURSLENBQUE7O0FBQUEsRUFFQyxrQkFBbUIsT0FBQSxDQUFRLFNBQVIsRUFBbkIsZUFGRCxDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixJQUpsQixDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFpQixTQUFDLE1BQUQsRUFBUyxTQUFULEdBQUE7QUFDZixJQUFBLElBQUcsMkJBQUg7YUFDRTtBQUFBLFFBQUMsYUFBQSxFQUFlLFNBQWhCO1FBREY7S0FBQSxNQUFBO0FBR0UsY0FBTyxTQUFQO0FBQUEsYUFDTyxVQURQO2lCQUN1QjtBQUFBLFlBQUMsSUFBQSxFQUFNLFNBQVA7WUFEdkI7QUFBQSxhQUVPLFNBRlA7aUJBRXNCO0FBQUEsWUFBQyxJQUFBLEVBQU0sU0FBUDtBQUFBLFlBQWtCLGtCQUFBLEVBQW9CLElBQXRDO1lBRnRCO0FBQUEsT0FIRjtLQURlO0VBQUEsQ0FOakIsQ0FBQTs7QUFBQSxFQWNNO0FBQ0osSUFBQSxnQkFBQyxDQUFBLElBQUQsR0FBTyxTQUFBLEdBQUE7QUFDTCxNQUFBLGVBQUEsR0FBc0IsSUFBQSxHQUFBLENBQUEsQ0FBdEIsQ0FBQTthQUNJLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNiLFFBQUEsZUFBZSxDQUFDLEtBQWhCLENBQUEsQ0FBQSxDQUFBO2VBQ0EsZUFBQSxHQUFrQixLQUZMO01BQUEsQ0FBWCxFQUZD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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/selection-wrapper.coffee
