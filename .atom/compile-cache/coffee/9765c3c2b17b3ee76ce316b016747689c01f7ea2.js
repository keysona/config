(function() {
  module.exports = {
    query: function(el) {
      return document.querySelector(el);
    },
    queryAll: function(el) {
      return document.querySelectorAll(el);
    },
    addClass: function(el, className) {
      return this.toggleClass('add', el, className);
    },
    removeClass: function(el, className) {
      return this.toggleClass('remove', el, className);
    },
    toggleClass: function(action, el, className) {
      var i, _results;
      if (el !== null) {
        i = 0;
        _results = [];
        while (i < el.length) {
          el[i].classList[action](className);
          _results.push(i++);
        }
        return _results;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3NldGktc3ludGF4L2xpYi9kb20uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLEtBQUEsRUFBTyxTQUFDLEVBQUQsR0FBQTthQUNMLFFBQVEsQ0FBQyxhQUFULENBQXVCLEVBQXZCLEVBREs7SUFBQSxDQUFQO0FBQUEsSUFHQSxRQUFBLEVBQVUsU0FBQyxFQUFELEdBQUE7YUFDUixRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsRUFBMUIsRUFEUTtJQUFBLENBSFY7QUFBQSxJQU1BLFFBQUEsRUFBVSxTQUFDLEVBQUQsRUFBSyxTQUFMLEdBQUE7YUFDUixJQUFDLENBQUEsV0FBRCxDQUFhLEtBQWIsRUFBb0IsRUFBcEIsRUFBd0IsU0FBeEIsRUFEUTtJQUFBLENBTlY7QUFBQSxJQVNBLFdBQUEsRUFBYSxTQUFDLEVBQUQsRUFBSyxTQUFMLEdBQUE7YUFDWCxJQUFDLENBQUEsV0FBRCxDQUFhLFFBQWIsRUFBdUIsRUFBdkIsRUFBMkIsU0FBM0IsRUFEVztJQUFBLENBVGI7QUFBQSxJQVlBLFdBQUEsRUFBYSxTQUFDLE1BQUQsRUFBUyxFQUFULEVBQWEsU0FBYixHQUFBO0FBQ1gsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFHLEVBQUEsS0FBTSxJQUFUO0FBQ0UsUUFBQSxDQUFBLEdBQUksQ0FBSixDQUFBO0FBQ0E7ZUFBTSxDQUFBLEdBQUksRUFBRSxDQUFDLE1BQWIsR0FBQTtBQUNFLFVBQUEsRUFBRyxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQVUsQ0FBQSxNQUFBLENBQWhCLENBQXdCLFNBQXhCLENBQUEsQ0FBQTtBQUFBLHdCQUNBLENBQUEsR0FEQSxDQURGO1FBQUEsQ0FBQTt3QkFGRjtPQURXO0lBQUEsQ0FaYjtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/seti-syntax/lib/dom.coffee
