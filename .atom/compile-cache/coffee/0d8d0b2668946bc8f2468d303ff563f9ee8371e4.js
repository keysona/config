(function() {
  var Base, CopyFromLineAbove, CopyFromLineBelow, InsertLastInserted, InsertMode, InsertRegister, Range,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  Base = require('./base');

  InsertMode = (function(_super) {
    __extends(InsertMode, _super);

    InsertMode.extend(false);

    function InsertMode() {
      InsertMode.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return InsertMode;

  })(Base);

  InsertRegister = (function(_super) {
    __extends(InsertRegister, _super);

    function InsertRegister() {
      return InsertRegister.__super__.constructor.apply(this, arguments);
    }

    InsertRegister.extend();

    InsertRegister.prototype.hover = {
      icon: '"',
      emoji: '"'
    };

    InsertRegister.prototype.requireInput = true;

    InsertRegister.prototype.initialize = function() {
      return this.focusInput();
    };

    InsertRegister.prototype.execute = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var selection, text, _i, _len, _ref, _results;
          _ref = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            selection = _ref[_i];
            text = _this.vimState.register.getText(_this.getInput(), selection);
            _results.push(selection.insertText(text));
          }
          return _results;
        };
      })(this));
    };

    return InsertRegister;

  })(InsertMode);

  InsertLastInserted = (function(_super) {
    __extends(InsertLastInserted, _super);

    function InsertLastInserted() {
      return InsertLastInserted.__super__.constructor.apply(this, arguments);
    }

    InsertLastInserted.extend();

    InsertLastInserted.description = "Insert text inserted in latest insert-mode.\nEquivalent to *i_CTRL-A* of pure Vim";

    InsertLastInserted.prototype.execute = function() {
      var text;
      text = this.vimState.register.getText('.');
      return this.editor.insertText(text);
    };

    return InsertLastInserted;

  })(InsertMode);

  CopyFromLineAbove = (function(_super) {
    __extends(CopyFromLineAbove, _super);

    function CopyFromLineAbove() {
      return CopyFromLineAbove.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineAbove.extend();

    CopyFromLineAbove.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-Y* of pure Vim";

    CopyFromLineAbove.prototype.rowDelta = -1;

    CopyFromLineAbove.prototype.getTargetRange = function(cursor, translation) {
      var point;
      point = cursor.getBufferPosition().translate(translation);
      return Range.fromPointWithDelta(point, 0, 1);
    };

    CopyFromLineAbove.prototype.execute = function() {
      var translation;
      translation = [this.rowDelta, 0];
      return this.editor.transact((function(_this) {
        return function() {
          var range, selection, text, _i, _len, _ref, _results;
          _ref = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            selection = _ref[_i];
            range = _this.getTargetRange(selection.cursor, translation);
            if (text = _this.editor.getTextInBufferRange(range)) {
              _results.push(selection.insertText(text));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
    };

    return CopyFromLineAbove;

  })(InsertMode);

  CopyFromLineBelow = (function(_super) {
    __extends(CopyFromLineBelow, _super);

    function CopyFromLineBelow() {
      return CopyFromLineBelow.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineBelow.extend();

    CopyFromLineBelow.description = "Insert character of same-column of above line.\nEquivalent to *i_CTRL-E* of pure Vim";

    CopyFromLineBelow.prototype.rowDelta = +1;

    return CopyFromLineBelow;

  })(CopyFromLineAbove);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2luc2VydC1tb2RlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpR0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQUZQLENBQUE7O0FBQUEsRUFJTTtBQUNKLGlDQUFBLENBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUNhLElBQUEsb0JBQUEsR0FBQTtBQUNYLE1BQUEsNkNBQUEsU0FBQSxDQUFBLENBQUE7O1FBQ0EsSUFBQyxDQUFBO09BRlU7SUFBQSxDQURiOztzQkFBQTs7S0FEdUIsS0FKekIsQ0FBQTs7QUFBQSxFQVVNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsNkJBQ0EsS0FBQSxHQUFPO0FBQUEsTUFBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLE1BQVcsS0FBQSxFQUFPLEdBQWxCO0tBRFAsQ0FBQTs7QUFBQSw2QkFFQSxZQUFBLEdBQWMsSUFGZCxDQUFBOztBQUFBLDZCQUlBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsVUFBRCxDQUFBLEVBRFU7SUFBQSxDQUpaLENBQUE7O0FBQUEsNkJBT0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2YsY0FBQSx5Q0FBQTtBQUFBO0FBQUE7ZUFBQSwyQ0FBQTtpQ0FBQTtBQUNFLFlBQUEs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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/insert-mode.coffee
