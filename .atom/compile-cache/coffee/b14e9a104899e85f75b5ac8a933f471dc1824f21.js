(function() {
  module.exports = function(colorPicker) {
    return {
      element: null,
      activate: function() {
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = colorPicker.element.el.className;
            _el = document.createElement('div');
            _el.classList.add("" + _classPrefix + "-body");
            return _el;
          })(),
          height: function() {
            return this.el.offsetHeight;
          },
          add: function(element, weight) {
            if (weight) {
              if (weight > this.el.children.length) {
                this.el.appendChild(element);
              } else {
                this.el.insertBefore(element, this.el.children[weight]);
              }
            } else {
              this.el.appendChild(element);
            }
            return this;
          }
        };
        colorPicker.element.add(this.element.el);
        setTimeout((function(_this) {
          return function() {
            var _newHeight;
            _newHeight = colorPicker.element.height() + _this.element.height();
            return colorPicker.element.setHeight(_newHeight);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9Cb2R5LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUtJO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLFdBQUQsR0FBQTtXQUNiO0FBQUEsTUFBQSxPQUFBLEVBQVMsSUFBVDtBQUFBLE1BS0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNOLFFBQUEsSUFBQyxDQUFBLE9BQUQsR0FDSTtBQUFBLFVBQUEsRUFBQSxFQUFPLENBQUEsU0FBQSxHQUFBO0FBQ0gsZ0JBQUEsaUJBQUE7QUFBQSxZQUFBLFlBQUEsR0FBZSxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUF0QyxDQUFBO0FBQUEsWUFDQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FETixDQUFBO0FBQUEsWUFFQSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsRUFBQSxHQUFyQyxZQUFxQyxHQUFrQixPQUFwQyxDQUZBLENBQUE7QUFJQSxtQkFBTyxHQUFQLENBTEc7VUFBQSxDQUFBLENBQUgsQ0FBQSxDQUFKO0FBQUEsVUFPQSxNQUFBLEVBQVEsU0FBQSxHQUFBO21CQUFHLElBQUMsQ0FBQSxFQUFFLENBQUMsYUFBUDtVQUFBLENBUFI7QUFBQSxVQVVBLEdBQUEsRUFBSyxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDRCxZQUFBLElBQUcsTUFBSDtBQUNJLGNBQUEsSUFBRyxNQUFBLEdBQVMsSUFBQyxDQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBekI7QUFDSSxnQkFBQSxJQUFDLENBQUEsRUFBRSxDQUFDLFdBQUosQ0FBZ0IsT0FBaEIsQ0FBQSxDQURKO2VBQUEsTUFBQTtBQUVLLGdCQUFBLElBQUMsQ0FBQSxFQUFFLENBQUMsWUFBSixDQUFpQixPQUFqQixFQUEwQixJQUFDLENBQUEsRUFBRSxDQUFDLFFBQVMsQ0FBQSxNQUFBLENBQXZDLENBQUEsQ0FGTDtlQURKO2FBQUEsTUFBQTtBQUlLLGNBQUEsSUFBQyxDQUFBLEVBQUUsQ0FBQyxXQUFKLENBQWdCLE9BQWhCLENBQUEsQ0FKTDthQUFBO0FBTUEsbUJBQU8sSUFBUCxDQVBDO1VBQUEsQ0FWTDtTQURKLENBQUE7QUFBQSxRQW1CQSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQXBCLENBQXdCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBakMsQ0FuQkEsQ0FBQTtBQUFBLFFBdUJBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUNQLGdCQUFBLFVBQUE7QUFBQSxZQUFBLFVBQUEsR0FBYSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQXBCLENBQUEsQ0FBQSxHQUErQixLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxDQUE1QyxDQUFBO21CQUNBLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBcEIsQ0FBOEIsVUFBOUIsRUFGTztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0F2QkEsQ0FBQTtBQTJCQSxlQUFPLElBQVAsQ0E1Qk07TUFBQSxDQUxWO01BRGE7RUFBQSxDQUFqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/color-picker/lib/extensions/Body.coffee
