(function() {
  var Match, MatchList, getIndex, getVisibleBufferRange, highlightRanges, smartScrollToBufferPosition, _, _ref,
    __slice = [].slice;

  _ = require('underscore-plus');

  _ref = require('./utils'), getIndex = _ref.getIndex, highlightRanges = _ref.highlightRanges, smartScrollToBufferPosition = _ref.smartScrollToBufferPosition, getVisibleBufferRange = _ref.getVisibleBufferRange;

  MatchList = (function() {
    MatchList.prototype.index = null;

    MatchList.prototype.entries = null;

    MatchList.fromScan = function(editor, _arg) {
      var countOffset, current, direction, fromPoint, index, pattern, ranges, reversed;
      fromPoint = _arg.fromPoint, pattern = _arg.pattern, direction = _arg.direction, countOffset = _arg.countOffset;
      index = 0;
      ranges = [];
      editor.scan(pattern, function(_arg1) {
        var range;
        range = _arg1.range;
        return ranges.push(range);
      });
      if (direction === 'backward') {
        reversed = ranges.slice().reverse();
        current = _.detect(reversed, function(_arg1) {
          var start;
          start = _arg1.start;
          return start.isLessThan(fromPoint);
        });
        if (current == null) {
          current = _.last(ranges);
        }
      } else if (direction === 'forward') {
        current = _.detect(ranges, function(_arg1) {
          var start;
          start = _arg1.start;
          return start.isGreaterThan(fromPoint);
        });
        if (current == null) {
          current = ranges[0];
        }
      }
      index = ranges.indexOf(current);
      index = getIndex(index + countOffset, ranges);
      return new this(editor, ranges, index);
    };

    function MatchList(editor, ranges, index) {
      var first, last, others, _i, _ref1;
      this.editor = editor;
      this.index = index;
      this.entries = [];
      if (!ranges.length) {
        return;
      }
      this.entries = ranges.map((function(_this) {
        return function(range) {
          return new Match(_this.editor, range);
        };
      })(this));
      _ref1 = this.entries, first = _ref1[0], others = 3 <= _ref1.length ? __slice.call(_ref1, 1, _i = _ref1.length - 1) : (_i = 1, []), last = _ref1[_i++];
      first.first = true;
      if (last != null) {
        last.last = true;
      }
    }

    MatchList.prototype.isEmpty = function() {
      return this.entries.length === 0;
    };

    MatchList.prototype.setIndex = function(index) {
      return this.index = getIndex(index, this.entries);
    };

    MatchList.prototype.get = function(direction) {
      var match;
      if (direction == null) {
        direction = null;
      }
      this.entries[this.index].current = false;
      switch (direction) {
        case 'next':
          this.setIndex(this.index + 1);
          break;
        case 'prev':
          this.setIndex(this.index - 1);
      }
      match = this.entries[this.index];
      match.current = true;
      return match;
    };

    MatchList.prototype.getCurrentStartPosition = function() {
      return this.get().getStartPoint();
    };

    MatchList.prototype.getVisible = function() {
      var range;
      range = getVisibleBufferRange(this.editor);
      return this.entries.filter(function(match) {
        return range.intersectsWith(match.range);
      });
    };

    MatchList.prototype.refresh = function() {
      var match, _i, _len, _ref1, _results;
      this.reset();
      _ref1 = this.getVisible();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        match = _ref1[_i];
        _results.push(match.show());
      }
      return _results;
    };

    MatchList.prototype.reset = function() {
      var match, _i, _len, _ref1, _results;
      _ref1 = this.entries;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        match = _ref1[_i];
        _results.push(match.reset());
      }
      return _results;
    };

    MatchList.prototype.destroy = function() {
      var match, _i, _len, _ref1, _ref2;
      _ref1 = this.entries;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        match = _ref1[_i];
        match.destroy();
      }
      return _ref2 = {}, this.entries = _ref2.entries, this.index = _ref2.index, this.editor = _ref2.editor, _ref2;
    };

    MatchList.prototype.getCounterText = function() {
      return "" + (this.index + 1) + "/" + this.entries.length;
    };

    return MatchList;

  })();

  Match = (function() {
    var markersForFlash;

    Match.prototype.first = false;

    Match.prototype.last = false;

    Match.prototype.current = false;

    function Match(editor, range) {
      this.editor = editor;
      this.range = range;
    }

    Match.prototype.getClassList = function() {
      var classes;
      classes = [];
      if (this.first) {
        classes.push('first');
      }
      if (!this.first && this.last) {
        classes.push('last');
      }
      if (this.current) {
        classes.push('current');
      }
      return classes;
    };

    Match.prototype.compare = function(other) {
      return this.range.compare(other.range);
    };

    Match.prototype.isEqual = function(other) {
      return this.range.isEqual(other.range);
    };

    Match.prototype.getStartPoint = function() {
      return this.range.start;
    };

    Match.prototype.scrollToStartPoint = function() {
      var point;
      point = this.getStartPoint();
      this.editor.unfoldBufferRow(point.row);
      return smartScrollToBufferPosition(this.editor, point);
    };

    markersForFlash = null;

    Match.prototype.flash = function(options) {
      var _ref1;
      if (markersForFlash != null) {
        if ((_ref1 = markersForFlash[0]) != null) {
          _ref1.destroy();
        }
      }
      return markersForFlash = highlightRanges(this.editor, this.range, {
        "class": options["class"],
        timeout: options.timeout
      });
    };

    Match.prototype.show = function() {
      var classes, _ref1;
      classes = (_ref1 = ['vim-mode-plus-search-match']).concat.apply(_ref1, this.getClassList());
      this.marker = this.editor.markBufferRange(this.range);
      return this.editor.decorateMarker(this.marker, {
        type: 'highlight',
        "class": classes.join(" ")
      });
    };

    Match.prototype.reset = function() {
      var _ref1;
      return (_ref1 = this.marker) != null ? _ref1.destroy() : void 0;
    };

    Match.prototype.destroy = function() {
      var _ref1;
      this.reset();
      return _ref1 = {}, this.marker = _ref1.marker, this.range = _ref1.range, this.editor = _ref1.editor, this.first = _ref1.first, this.last = _ref1.last, this.current = _ref1.current, _ref1;
    };

    return Match;

  })();

  module.exports = {
    MatchList: MatchList
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21hdGNoLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3R0FBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSxnQkFBQSxRQURGLEVBRUUsdUJBQUEsZUFGRixFQUdFLG1DQUFBLDJCQUhGLEVBSUUsNkJBQUEscUJBTEYsQ0FBQTs7QUFBQSxFQVFNO0FBQ0osd0JBQUEsS0FBQSxHQUFPLElBQVAsQ0FBQTs7QUFBQSx3QkFDQSxPQUFBLEdBQVMsSUFEVCxDQUFBOztBQUFBLElBR0EsU0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLE1BQUQsRUFBUyxJQUFULEdBQUE7QUFDVCxVQUFBLDRFQUFBO0FBQUEsTUFEbUIsaUJBQUEsV0FBVyxlQUFBLFNBQVMsaUJBQUEsV0FBVyxtQkFBQSxXQUNsRCxDQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsQ0FBUixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsRUFEVCxDQUFBO0FBQUEsTUFFQSxNQUFNLENBQUMsSUFBUCxDQUFZLE9BQVosRUFBcUIsU0FBQyxLQUFELEdBQUE7QUFDbkIsWUFBQSxLQUFBO0FBQUEsUUFEcUIsUUFBRCxNQUFDLEtBQ3JCLENBQUE7ZUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVosRUFEbUI7TUFBQSxDQUFyQixDQUZBLENBQUE7QUFLQSxNQUFBLElBQUcsU0FBQSxLQUFhLFVBQWhCO0FBQ0UsUUFBQSxRQUFBLEdBQVcsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFjLENBQUMsT0FBZixDQUFBLENBQVgsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxHQUFVLENBQUMsQ0FBQyxNQUFGLENBQVMsUUFBVCxFQUFtQixTQUFDLEtBQUQsR0FBQTtBQUFhLGNBQUEsS0FBQTtBQUFBLFVBQVgsUUFBRCxNQUFDLEtBQVcsQ0FBQTtpQkFBQSxLQUFLLENBQUMsVUFBTixDQUFpQixTQUFqQixFQUFiO1FBQUEsQ0FBbkIsQ0FEVixDQUFBOztVQUVBLFVBQVcsQ0FBQyxDQUFDLElBQUYsQ0FBTyxNQUFQO1NBSGI7T0FBQSxNQUlLLElBQUcsU0FBQSxLQUFhLFNBQWhCO0FBQ0gsUUFBQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxNQUFULEVBQWlCLFNBQUMsS0FBRCxHQUFBO0FBQWEsY0FBQSxLQUFBO0FBQUEsVUFBWCxRQUFELE1BQUMsS0FBVyxDQUFBO2lCQUFBLEtBQUssQ0FBQyxhQUFOLENBQW9CLFNBQXBCLEVBQWI7UUFBQSxDQUFqQixDQUFWLENBQUE7O1VBQ0EsVUFBVyxNQUFPLENBQUEsQ0FBQTtTQUZmO09BVEw7QUFBQSxNQWFBLEtBQUEsR0FBUSxNQUFNLENBQUMsT0FBUCxDQUFlLE9BQWYsQ0FiUixDQUFBO0FBQUEsTUFjQSxLQUFBLEdBQVEsUUFBQSxDQUFTLEtBQUEsR0FBUSxXQUFqQixFQUE4QixNQUE5QixDQWRSLENBQUE7YUFlSSxJQUFBLElBQUEsQ0FBSyxNQUFMLEVBQWEsTUFBYixFQUFxQixLQUFyQixFQWhCSztJQUFBLENBSFgsQ0FBQTs7QUFxQmEsSUFBQSxtQkFBRSxNQUFGLEVBQVUsTUFBVixFQUFtQixLQUFuQixHQUFBO0FBQ1gsVUFBQSw4QkFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFENkIsSUFBQyxDQUFBLFFBQUEsS0FDOUIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLENBQUE7QUFDQSxNQUFBLElBQUEsQ0FBQSxNQUFvQixDQUFDLE1BQXJCO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsTUFBTSxDQUFDLEdBQVAsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7aUJBQ2hCLElBQUEsS0FBQSxDQUFNLEtBQUMsQ0FBQSxNQUFQLEVBQWUsS0FBZixFQURnQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FGWCxDQUFBO0FBQUEsTUFLQSxRQUEyQixJQUFDLENBQUEsT0FBNUIsRUFBQyxnQkFBRCxFQUFRLHlGQUFSLEVBQW1CLGtCQUxuQixDQUFBO0FBQUEsTUFNQSxLQUFLLENBQUMsS0FBTixHQUFjLElBTmQsQ0FBQTs7UUFPQSxJQUFJLENBQUUsSUFBTixHQUFhO09BUkY7SUFBQSxDQXJCYjs7QUFBQSx3QkErQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxLQUFtQixFQURaO0lBQUEsQ0EvQlQsQ0FBQTs7QUFBQSx3QkFrQ0EsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEtBQUQsR0FBUyxRQUFBLENBQVMsS0FBVCxFQUFnQixJQUFDLENBQUEsT0FBakIsRUFERDtJQUFBLENBbENWLENBQUE7O0FBQUEsd0JBcUNBLEdBQUEsR0FBSyxTQUFDLFNBQUQsR0FBQTtBQUNILFVBQUEsS0FBQTs7UUFESSxZQUFVO09BQ2Q7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLE9BQWpCLEdBQTJCLEtBQTNCLENBQUE7QUFDQSxjQUFPLFNBQVA7QUFBQSxhQUNPLE1BRFA7QUFDbUIsVUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBbkIsQ0FBQSxDQURuQjtBQUNPO0FBRFAsYUFFTyxNQUZQO0FBRW1CLFVBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsS0FBRCxHQUFTLENBQW5CLENBQUEsQ0FGbkI7QUFBQSxPQURBO0FBQUEsTUFJQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFDLENBQUEsS0FBRCxDQUpqQixDQUFBO0FBQUEsTUFLQSxLQUFLLENBQUMsT0FBTixHQUFnQixJQUxoQixDQUFBO2FBTUEsTUFQRztJQUFBLENBckNMLENBQUE7O0FBQUEsd0JBOENBLHVCQUFBLEdBQXlCLFNBQUEsR0FBQTthQUN2QixJQUFDLENBQUEsR0FBRCxDQUFBLENBQU0sQ0FBQyxhQUFQLENBQUEsRUFEdUI7SUFBQSxDQTlDekIsQ0FBQTs7QUFBQSx3QkFpREEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLHFCQUFBLENBQXNCLElBQUMsQ0FBQSxNQUF2QixDQUFSLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsU0FBQyxLQUFELEdBQUE7ZUFDZCxLQUFLLENBQUMsY0FBTixDQUFxQixLQUFLLENBQUMsS0FBM0IsRUFEYztNQUFBLENBQWhCLEVBRlU7SUFBQSxDQWpEWixDQUFBOztBQUFBLHdCQXNEQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxnQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUFBO1dBQUEsNENBQUE7MEJBQUE7QUFDRSxzQkFBQSxLQUFLLENBQUMsSUFBTixDQUFBLEVBQUEsQ0FERjtBQUFBO3NCQUZPO0lBQUEsQ0F0RFQsQ0FBQTs7QUFBQSx3QkEyREEsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFVBQUEsZ0NBQUE7QUFBQTtBQUFBO1dBQUEsNENBQUE7MEJBQUE7QUFDRSxzQkFBQSxLQUFLLENBQUMsS0FBTixDQUFBLEVBQUEsQ0FERjtBQUFBO3NCQURLO0lBQUEsQ0EzRFAsQ0FBQTs7QUFBQSx3QkErREEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsNkJBQUE7QUFBQTtBQUFBLFdBQUEsNENBQUE7MEJBQUE7QUFDRSxRQUFBLEtBQUssQ0FBQyxPQUFOLENBQUEsQ0FBQSxDQURGO0FBQUEsT0FBQTthQUVBLFFBQThCLEVBQTlCLEVBQUMsSUFBQyxDQUFBLGdCQUFBLE9BQUYsRUFBVyxJQUFDLENBQUEsY0FBQSxLQUFaLEVBQW1CLElBQUMsQ0FBQSxlQUFBLE1BQXBCLEVBQUEsTUFITztJQUFBLENBL0RULENBQUE7O0FBQUEsd0JBb0VBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO2FBQ2QsRUFBQSxHQUFFLENBQUMsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUFWLENBQUYsR0FBYyxHQUFkLEdBQWlCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FEWjtJQUFBLENBcEVoQixDQUFBOztxQkFBQTs7TUFURixDQUFBOztBQUFBLEVBZ0ZNO0FBQ0osUUFBQSxlQUFBOztBQUFBLG9CQUFBLEtBQUEsR0FBTyxLQUFQLENBQUE7O0FBQUEsb0JBQ0EsSUFBQSxHQUFNLEtBRE4sQ0FBQTs7QUFBQSxvQkFFQSxPQUFBLEdBQVMsS0FGVCxDQUFBOztBQUlhLElBQUEsZUFBRSxNQUFGLEVBQVcsS0FBWCxHQUFBO0FBQW1CLE1BQWxCLElBQUMsQ0FBQSxTQUFBLE1BQWlCLENBQUE7QUFBQSxNQUFULElBQUMsQ0FBQSxRQUFBLEtBQVEsQ0FBbkI7SUFBQSxDQUpiOztBQUFBLG9CQU1BLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFFWixVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxFQUFWLENBQUE7QUFDQSxNQUFBLElBQXlCLElBQUMsQ0FBQSxLQUExQjtBQUFBLFFBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxPQUFiLENBQUEsQ0FBQTtPQURBO0FBRUEsTUFBQSxJQUF5QixDQUFBLElBQUssQ0FBQSxLQUFMLElBQWUsSUFBQyxDQUFBLElBQXpDO0FBQUEsUUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsQ0FBQSxDQUFBO09BRkE7QUFHQSxNQUFBLElBQTJCLElBQUMsQ0FBQSxPQUE1QjtBQUFBLFFBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxTQUFiLENBQUEsQ0FBQTtPQUhBO2FBSUEsUUFOWTtJQUFBLENBTmQsQ0FBQTs7QUFBQSxvQkFjQSxPQUFBLEdBQVMsU0FBQyxLQUFELEdBQUE7YUFDUCxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBZSxLQUFLLENBQUMsS0FBckIsRUFETztJQUFBLENBZFQsQ0FBQTs7QUFBQSxvQkFpQkEsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBO2FBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQWUsS0FBSyxDQUFDLEtBQXJCLEVBRE87SUFBQSxDQWpCVCxDQUFBOztBQUFBLG9CQW9CQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQ2IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQURNO0lBQUEsQ0FwQmYsQ0FBQTs7QUFBQSxvQkF1QkEsa0JBQUEsR0FBb0IsU0FBQSxHQUFBO0FBQ2xCLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBUixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsS0FBSyxDQUFDLEdBQTlCLENBREEsQ0FBQTthQUVBLDJCQUFBLENBQTRCLElBQUMsQ0FBQSxNQUE3QixFQUFxQyxLQUFyQyxFQUhrQjtJQUFBLENBdkJwQixDQUFBOztBQUFBLElBNkJBLGVBQUEsR0FBa0IsSUE3QmxCLENBQUE7O0FBQUEsb0JBOEJBLEtBQUEsR0FBTyxTQUFDLE9BQUQsR0FBQTtBQUNMLFVBQUEsS0FBQTs7O2VBQW1CLENBQUUsT0FBckIsQ0FBQTs7T0FBQTthQUNBLGVBQUEsR0FBa0IsZUFBQSxDQUFnQixJQUFDLENBQUEsTUFBakIsRUFBeUIsSUFBQyxDQUFBLEtBQTFCLEVBQ2hCO0FBQUEsUUFBQSxPQUFBLEVBQU8sT0FBTyxDQUFDLE9BQUQsQ0FBZDtBQUFBLFFBQ0EsT0FBQSxFQUFTLE9BQU8sQ0FBQyxPQURqQjtPQURnQixFQUZiO0lBQUEsQ0E5QlAsQ0FBQTs7QUFBQSxvQkFvQ0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsY0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLFNBQUEsQ0FBQyw0QkFBRCxDQUFBLENBQThCLENBQUMsTUFBL0IsY0FBc0MsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUF0QyxDQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLElBQUMsQ0FBQSxLQUF6QixDQURWLENBQUE7YUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsSUFBQyxDQUFBLE1BQXhCLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxXQUFOO0FBQUEsUUFDQSxPQUFBLEVBQU8sT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiLENBRFA7T0FERixFQUhJO0lBQUEsQ0FwQ04sQ0FBQTs7QUFBQSxvQkEyQ0EsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFVBQUEsS0FBQTtrREFBTyxDQUFFLE9BQVQsQ0FBQSxXQURLO0lBQUEsQ0EzQ1AsQ0FBQTs7QUFBQSxvQkE4Q0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxRQUFzRCxFQUF0RCxFQUFDLElBQUMsQ0FBQSxlQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsY0FBQSxLQUFYLEVBQWtCLElBQUMsQ0FBQSxlQUFBLE1BQW5CLEVBQTJCLElBQUMsQ0FBQSxjQUFBLEtBQTVCLEVBQW1DLElBQUMsQ0FBQSxhQUFBLElBQXBDLEVBQTBDLElBQUMsQ0FBQSxnQkFBQSxPQUEzQyxFQUFBLE1BRk87SUFBQSxDQTlDVCxDQUFBOztpQkFBQTs7TUFqRkYsQ0FBQTs7QUFBQSxFQW1JQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQUMsV0FBQSxTQUFEO0dBbklqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/match.coffee
