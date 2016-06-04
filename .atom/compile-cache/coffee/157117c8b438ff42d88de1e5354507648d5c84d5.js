(function() {
  module.exports = function(colorPicker) {
    return {
      element: null,
      activate: function() {
        var _halfArrowWidth;
        _halfArrowWidth = null;
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = colorPicker.element.el.className;
            _el = document.createElement('div');
            _el.classList.add("" + _classPrefix + "-arrow");
            return _el;
          })(),
          addClass: function(className) {
            this.el.classList.add(className);
            return this;
          },
          removeClass: function(className) {
            this.el.classList.remove(className);
            return this;
          },
          hasClass: function(className) {
            return this.el.classList.contains(className);
          },
          width: function() {
            return this.el.offsetWidth;
          },
          height: function() {
            return this.el.offsetHeight;
          },
          setPosition: function(x) {
            this.el.style.left = "" + x + "px";
            return this;
          },
          previousColor: null,
          setColor: function(smartColor) {
            var _color;
            _color = (typeof smartColor.toRGBA === "function" ? smartColor.toRGBA() : void 0) || 'none';
            if (this.previousColor && this.previousColor === _color) {
              return;
            }
            this.el.style.borderTopColor = _color;
            this.el.style.borderBottomColor = _color;
            return this.previousColor = _color;
          }
        };
        colorPicker.element.add(this.element.el);
        setTimeout((function(_this) {
          return function() {
            return _halfArrowWidth = (_this.element.width() / 2) << 0;
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var _newHeight;
            _newHeight = colorPicker.element.height() + _this.element.height();
            return colorPicker.element.setHeight(_newHeight);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Alpha;
            Alpha = colorPicker.getExtension('Alpha');
            Alpha.onColorChanged(function(smartColor) {
              if (smartColor) {
                return _this.element.setColor(smartColor);
              } else {
                return colorPicker.SmartColor.HEX('#f00');
              }
            });
          };
        })(this));
        colorPicker.onInputVariable((function(_this) {
          return function() {
            return _this.element.setColor(colorPicker.SmartColor.RGBAArray([0, 0, 0, 0]));
          };
        })(this));
        colorPicker.onInputVariableColor((function(_this) {
          return function(smartColor) {
            if (!smartColor) {
              return;
            }
            return _this.element.setColor(smartColor);
          };
        })(this));
        colorPicker.onPositionChange((function(_this) {
          return function(position, colorPickerPosition) {
            return _this.element.setPosition(position.x - colorPickerPosition.x);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9BcnJvdy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFLSTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxXQUFELEdBQUE7V0FDYjtBQUFBLE1BQUEsT0FBQSxFQUFTLElBQVQ7QUFBQSxNQUtBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDTixZQUFBLGVBQUE7QUFBQSxRQUFBLGVBQUEsR0FBa0IsSUFBbEIsQ0FBQTtBQUFBLFFBSUEsSUFBQyxDQUFBLE9BQUQsR0FDSTtBQUFBLFVBQUEsRUFBQSxFQUFPLENBQUEsU0FBQSxHQUFBO0FBQ0gsZ0JBQUEsaUJBQUE7QUFBQSxZQUFBLFlBQUEsR0FBZSxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUF0QyxDQUFBO0FBQUEsWUFDQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FETixDQUFBO0FBQUEsWUFFQSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsRUFBQSxHQUFyQyxZQUFxQyxHQUFrQixRQUFwQyxDQUZBLENBQUE7QUFJQSxtQkFBTyxHQUFQLENBTEc7VUFBQSxDQUFBLENBQUgsQ0FBQSxDQUFKO0FBQUEsVUFPQSxRQUFBLEVBQVUsU0FBQyxTQUFELEdBQUE7QUFBZSxZQUFBLElBQUMsQ0FBQSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsU0FBbEIsQ0FBQSxDQUFBO0FBQTZCLG1CQUFPLElBQVAsQ0FBNUM7VUFBQSxDQVBWO0FBQUEsVUFRQSxXQUFBLEVBQWEsU0FBQyxTQUFELEdBQUE7QUFBZSxZQUFBLElBQUMsQ0FBQSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQWQsQ0FBcUIsU0FBckIsQ0FBQSxDQUFBO0FBQWdD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

//# sourceURL=/home/key/.atom/packages/color-picker/lib/extensions/Arrow.coffee
