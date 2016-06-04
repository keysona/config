(function() {
  var __slice = [].slice;

  module.exports = function() {
    return {
      bindings: {},
      emit: function() {
        var args, event, _bindings, _callback, _i, _len;
        event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (!(_bindings = this.bindings[event])) {
          return;
        }
        for (_i = 0, _len = _bindings.length; _i < _len; _i++) {
          _callback = _bindings[_i];
          _callback.apply(null, args);
        }
      },
      on: function(event, callback) {
        if (!this.bindings[event]) {
          this.bindings[event] = [];
        }
        this.bindings[event].push(callback);
        return callback;
      },
      off: function(event, callback) {
        var _binding, _bindings, _i;
        if (!(_bindings = this.bindings[event])) {
          return;
        }
        _i = _bindings.length;
        while (_i-- && (_binding = _bindings[_i])) {
          if (_binding === callback) {
            _bindings.splice(_i, 1);
          }
        }
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvbW9kdWxlcy9FbWl0dGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUtJO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FBQTtXQUNiO0FBQUEsTUFBQSxRQUFBLEVBQVUsRUFBVjtBQUFBLE1BRUEsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUNGLFlBQUEsMkNBQUE7QUFBQSxRQURHLHNCQUFPLDhEQUNWLENBQUE7QUFBQSxRQUFBLElBQUEsQ0FBQSxDQUFjLFNBQUEsR0FBWSxJQUFDLENBQUEsUUFBUyxDQUFBLEtBQUEsQ0FBdEIsQ0FBZDtBQUFBLGdCQUFBLENBQUE7U0FBQTtBQUNBLGFBQUEsZ0RBQUE7b0NBQUE7QUFBQSxVQUFBLFNBQVMsQ0FBQyxLQUFWLENBQWdCLElBQWhCLEVBQXNCLElBQXRCLENBQUEsQ0FBQTtBQUFBLFNBRkU7TUFBQSxDQUZOO0FBQUEsTUFPQSxFQUFBLEVBQUksU0FBQyxLQUFELEVBQVEsUUFBUixHQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsSUFBOEIsQ0FBQSxRQUFTLENBQUEsS0FBQSxDQUF2QztBQUFBLFVBQUEsSUFBQyxDQUFBLFFBQVMsQ0FBQSxLQUFBLENBQVYsR0FBbUIsRUFBbkIsQ0FBQTtTQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsUUFBUyxDQUFBLEtBQUEsQ0FBTSxDQUFDLElBQWpCLENBQXNCLFFBQXRCLENBREEsQ0FBQTtBQUVBLGVBQU8sUUFBUCxDQUhBO01BQUEsQ0FQSjtBQUFBLE1BWUEsR0FBQSxFQUFLLFNBQUMsS0FBRCxFQUFRLFFBQVIsR0FBQTtBQUNELFlBQUEsdUJBQUE7QUFBQSxRQUFBLElBQUEsQ0FBQSxDQUFjLFNBQUEsR0FBWSxJQUFDLENBQUEsUUFBUyxDQUFBLEtBQUEsQ0FBdEIsQ0FBZDtBQUFBLGdCQUFBLENBQUE7U0FBQTtBQUFBLFFBRUEsRUFBQSxHQUFLLFNBQVMsQ0FBQyxNQUZmLENBQUE7QUFFdUIsZUFBTSxFQUFBLEVBQUEsSUFBUyxDQUFBLFFBQUEsR0FBVyxTQUFVLENBQUEsRUFBQSxDQUFyQixDQUFmLEdBQUE7QUFDbkIsVUFBQSxJQUFHLFFBQUEsS0FBWSxRQUFmO0FBQTZCLFlBQUEsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsRUFBakIsRUFBcUIsQ0FBckIsQ0FBQSxDQUE3QjtXQURtQjtRQUFBLENBSHRCO01BQUEsQ0FaTDtNQURhO0VBQUEsQ0FBakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/key/.atom/packages/color-picker/lib/modules/Emitter.coffee
