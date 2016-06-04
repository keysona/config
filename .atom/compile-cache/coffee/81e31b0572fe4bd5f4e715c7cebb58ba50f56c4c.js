(function() {
  var QuickSort;

  QuickSort = (function() {
    function QuickSort() {}

    QuickSort.prototype.sort = function(items) {
      var current, left, pivot, right;
      if (items.length <= 1) {
        return items;
      }
      pivot = items.shift();
      left = [];
      right = [];
      while (items.length > 0) {
        current = items.shift();
        if (current < pivot) {
          left.push(current);
        } else {
          right.push(current);
        }
      }
      return sort(left).concat(pivot).concat(sort(right));
    };

    QuickSort.prototype.noop = function() {};

    return QuickSort;

  })();

  exports.modules = quicksort;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9maXh0dXJlcy9zYW1wbGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBUUE7QUFBQSxNQUFBLFNBQUE7O0FBQUEsRUFBTTsyQkFDSjs7QUFBQSx3QkFBQSxJQUFBLEdBQU0sU0FBQyxLQUFELEdBQUE7QUFDSixVQUFBLDJCQUFBO0FBQUEsTUFBQSxJQUFnQixLQUFLLENBQUMsTUFBTixJQUFnQixDQUFoQztBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxLQUFLLENBQUMsS0FBTixDQUFBLENBRlIsQ0FBQTtBQUFBLE1BR0EsSUFBQSxHQUFPLEVBSFAsQ0FBQTtBQUFBLE1BSUEsS0FBQSxHQUFRLEVBSlIsQ0FBQTtBQVFBLGFBQU0sS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFyQixHQUFBO0FBQ0UsUUFBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFWLENBQUE7QUFDQSxRQUFBLElBQUcsT0FBQSxHQUFVLEtBQWI7QUFDRSxVQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixDQUFBLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLE9BQVgsQ0FBQSxDQUhGO1NBRkY7TUFBQSxDQVJBO2FBZUEsSUFBQSxDQUFLLElBQUwsQ0FBVSxDQUFDLE1BQVgsQ0FBa0IsS0FBbEIsQ0FBd0IsQ0FBQyxNQUF6QixDQUFnQyxJQUFBLENBQUssS0FBTCxDQUFoQyxFQWhCSTtJQUFBLENBQU4sQ0FBQTs7QUFBQSx3QkFrQkEsSUFBQSxHQUFNLFNBQUEsR0FBQSxDQWxCTixDQUFBOztxQkFBQTs7TUFERixDQUFBOztBQUFBLEVBc0JBLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBdEJsQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/fixtures/sample.coffee
