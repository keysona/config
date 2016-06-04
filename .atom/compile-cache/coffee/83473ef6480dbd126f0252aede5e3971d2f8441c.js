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

    MarkManager.prototype.setRange = function(startMark, endMark, range) {
      var end, start, _ref;
      _ref = Range.fromObject(range), start = _ref.start, end = _ref.end;
      this.set(startMark, start);
      return this.set(endMark, end);
    };

    MarkManager.prototype.set = function(name, point) {
      var bufferPosition, event;
      if (!this.isValid(name)) {
        return;
      }
      bufferPosition = this.editor.clipBufferPosition(point);
      this.marks[name] = this.editor.markBufferPosition(bufferPosition);
      event = {
        name: name,
        bufferPosition: bufferPosition,
        editor: this.editor
      };
      return this.vimState.emitter.emit('did-set-mark', event);
    };

    return MarkManager;

  })();

  module.exports = MarkManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21hcmstbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUJBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLDJCQUZSLENBQUE7O0FBQUEsRUFPTTtBQUNKLDBCQUFBLEtBQUEsR0FBTyxJQUFQLENBQUE7O0FBRWEsSUFBQSxxQkFBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLElBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFEVCxDQURXO0lBQUEsQ0FGYjs7QUFBQSwwQkFNQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7YUFDUCxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFETztJQUFBLENBTlQsQ0FBQTs7QUFBQSwwQkFTQSxHQUFBLEdBQUssU0FBQyxJQUFELEdBQUE7QUFDSCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO3FEQUNZLENBQUUsc0JBQWQsQ0FBQSxXQUZHO0lBQUEsQ0FUTCxDQUFBOztBQUFBLDBCQWNBLFFBQUEsR0FBVSxTQUFDLFNBQUQsRUFBWSxPQUFaLEdBQUE7QUFDUixVQUFBLFVBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsQ0FBUixDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLENBRE4sQ0FBQTtBQUVBLE1BQUEsSUFBRyxlQUFBLElBQVcsYUFBZDtlQUNNLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBRE47T0FIUTtJQUFBLENBZFYsQ0FBQTs7QUFBQSwwQkFvQkEsUUFBQSxHQUFVLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsS0FBckIsR0FBQTtBQUNSLFVBQUEsZ0JBQUE7QUFBQSxNQUFBLE9BQWUsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakIsQ0FBZixFQUFDLGFBQUEsS0FBRCxFQUFRLFdBQUEsR0FBUixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBZ0IsS0FBaEIsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsR0FBZCxFQUhRO0lBQUEsQ0FwQlYsQ0FBQTs7QUFBQSwwQkEwQkEsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUNILFVBQUEscUJBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsS0FBM0IsQ0FEakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLGNBQTNCLENBRmYsQ0FBQTtBQUFBLE1BR0EsS0FBQSxHQUFRO0FBQUEsUUFBQyxNQUFBLElBQUQ7QUFBQSxRQUFPLGdCQUFBLGNBQVA7QUFBQSxRQUF3QixRQUFELElBQUMsQ0FBQSxNQUF4QjtPQUhSLENBQUE7YUFJQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUF1QixjQUF2QixFQUF1QyxLQUF2QyxFQUxHO0lBQUEsQ0ExQkwsQ0FBQTs7dUJBQUE7O01BUkYsQ0FBQTs7QUFBQSxFQXlDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixXQXpDakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/mark-manager.coffee
