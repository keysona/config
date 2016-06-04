(function() {
  var MARKS, MarkManager, Range;

  Range = require('atom').Range;

  MARKS = /(?:[a-z]|[\[\]`.^(){}<>])/;

  MarkManager = (function() {
    MarkManager.prototype.marks = null;

    function MarkManager(vimState) {
      var _ref;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.marks = {};
    }

    MarkManager.prototype.isValid = function(name) {
      return MARKS.test(name);
    };

    MarkManager.prototype.get = function(name) {
      var _ref;
      if (!this.isValid(name)) {
        return;
      }
      return (_ref = this.marks[name]) != null ? _ref.getStartBufferPosition() : void 0;
    };

    MarkManager.prototype.getRange = function(startMark, endMark) {
      var end, start;
      start = this.get(startMark);
      end = this.get(endMark);
      if ((start != null) && (end != null)) {
        return new Range(start, end);
      }
    };

    MarkManager.prototype.set = function(name, point) {
      if (!this.isValid(name)) {
        return;
      }
      point = this.editor.clipBufferPosition(point);
      return this.marks[name] = this.editor.markBufferPosition(point, {
        invalidate: 'never',
        persistent: false
      });
    };

    return MarkManager;

  })();

  module.exports = MarkManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21hcmstbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUJBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLDJCQUZSLENBQUE7O0FBQUEsRUFPTTtBQUNKLDBCQUFBLEtBQUEsR0FBTyxJQUFQLENBQUE7O0FBRWEsSUFBQSxxQkFBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLElBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFEVCxDQURXO0lBQUEsQ0FGYjs7QUFBQSwwQkFNQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7YUFDUCxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFETztJQUFBLENBTlQsQ0FBQTs7QUFBQSwwQkFTQSxHQUFBLEdBQUssU0FBQyxJQUFELEdBQUE7QUFDSCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO3FEQUNZLENBQUUsc0JBQWQsQ0FBQSxXQUZHO0lBQUEsQ0FUTCxDQUFBOztBQUFBLDBCQWNBLFFBQUEsR0FBVSxTQUFDLFNBQUQsRUFBWSxPQUFaLEdBQUE7QUFDUixVQUFBLFVBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsQ0FBUixDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLENBRE4sQ0FBQTtBQUVBLE1BQUEsSUFBRyxlQUFBLElBQVcsYUFBZDtlQUNNLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBRE47T0FIUTtJQUFBLENBZFYsQ0FBQTs7QUFBQSwwQkFxQkEsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNILE1BQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCLENBRFIsQ0FBQTthQUVBLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFQLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQixFQUNiO0FBQUEsUUFBQSxVQUFBLEVBQVksT0FBWjtBQUFBLFFBQ0EsVUFBQSxFQUFZLEtBRFo7T0FEYSxFQUhaO0lBQUEsQ0FyQkwsQ0FBQTs7dUJBQUE7O01BUkYsQ0FBQTs7QUFBQSxFQW9DQSxNQUFNLENBQUMsT0FBUCxHQUFpQixXQXBDakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/mark-manager.coffee
