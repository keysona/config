(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      color: null,
      emitVisibility: function(visible) {
        if (visible == null) {
          visible = true;
        }
        return this.Emitter.emit('visible', visible);
      },
      onVisibility: function(callback) {
        return this.Emitter.on('visible', callback);
      },
      activate: function() {
        var View, hasChild, _isClicking;
        View = this;
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = colorPicker.element.el.className;
            _el = document.createElement('div');
            _el.classList.add("" + _classPrefix + "-return");
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
          hide: function() {
            this.removeClass('is--visible');
            return View.emitVisibility(false);
          },
          show: function() {
            this.addClass('is--visible');
            return View.emitVisibility(true);
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          },
          setColor: function(smartColor) {
            return this.el.style.backgroundColor = smartColor.toRGBA();
          }
        };
        colorPicker.element.add(this.element.el);
        hasChild = function(element, child) {
          var _parent;
          if (child && (_parent = child.parentNode)) {
            if (child === element) {
              return true;
            } else {
              return hasChild(element, _parent);
            }
          }
          return false;
        };
        _isClicking = false;
        colorPicker.onMouseDown((function(_this) {
          return function(e, isOnPicker) {
            if (!(isOnPicker && hasChild(_this.element.el, e.target))) {
              return;
            }
            e.preventDefault();
            return _isClicking = true;
          };
        })(this));
        colorPicker.onMouseMove(function(e) {
          return _isClicking = false;
        });
        colorPicker.onMouseUp((function(_this) {
          return function(e) {
            if (!(_isClicking && _this.color)) {
              return;
            }
            return colorPicker.emitInputColor(_this.color);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Alpha;
            Alpha = colorPicker.getExtension('Alpha');
            colorPicker.onBeforeOpen(function() {
              return _this.color = null;
            });
            colorPicker.onInputColor(function(smartColor, wasFound) {
              if (wasFound) {
                return _this.color = smartColor;
              }
            });
            Alpha.onColorChanged(function(smartColor) {
              if (!_this.color) {
                return _this.element.hide();
              }
              if (smartColor.equals(_this.color)) {
                return _this.element.hide();
              } else {
                return _this.element.show();
              }
            });
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            colorPicker.onInputColor(function(smartColor, wasFound) {
              if (wasFound) {
                return _this.element.setColor(smartColor);
              }
            });
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var setColor, _text;
            _text = document.createElement('p');
            _text.classList.add("" + _this.element.el.className + "-text");
            setColor = function(smartColor) {
              return _text.innerText = smartColor.value;
            };
            colorPicker.onInputColor(function(smartColor, wasFound) {
              if (wasFound) {
                return setColor(smartColor);
              }
            });
            return _this.element.add(_text);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9SZXR1cm4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBTUk7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsV0FBRCxHQUFBO1dBQ2I7QUFBQSxNQUFBLE9BQUEsRUFBUyxDQUFDLE9BQUEsQ0FBUSxvQkFBUixDQUFELENBQUEsQ0FBQSxDQUFUO0FBQUEsTUFFQSxPQUFBLEVBQVMsSUFGVDtBQUFBLE1BR0EsS0FBQSxFQUFPLElBSFA7QUFBQSxNQVNBLGNBQUEsRUFBZ0IsU0FBQyxPQUFELEdBQUE7O1VBQUMsVUFBUTtTQUNyQjtlQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFNBQWQsRUFBeUIsT0FBekIsRUFEWTtNQUFBLENBVGhCO0FBQUEsTUFXQSxZQUFBLEVBQWMsU0FBQyxRQUFELEdBQUE7ZUFDVixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxTQUFaLEVBQXVCLFFBQXZCLEVBRFU7TUFBQSxDQVhkO0FBQUEsTUFpQkEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNOLFlBQUEsMkJBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxRQUlBLElBQUMsQ0FBQSxPQUFELEdBQ0k7QUFBQSxVQUFBLEVBQUEsRUFBTyxDQUFBLFNBQUEsR0FBQTtBQUNILGdCQUFBLGlCQUFBO0FBQUEsWUFBQSxZQUFBLEdBQWUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBdEMsQ0FBQTtBQUFBLFlBQ0EsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBRE4sQ0FBQTtBQUFBLFlBRUEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQWtCLEVBQUEsR0FBckMsWUFBcUMsR0FBa0IsU0FBcEMsQ0FGQSxDQUFBO0FBSUEsbUJBQU8sR0FBUCxDQUxHO1VBQUEsQ0FBQSxDQUFILENBQUEsQ0FBSjtBQUFBLFVBT0EsUUFBQSxFQUFVLFNBQUMsU0FBRCxHQUFBO0FBQWUsWUFBQSxJQUFDLENBQUEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQWtCLFNBQWxCLENBQUEsQ0FBQTtBQUE2QixtQkFBTyxJQUFQLENBQTVDO1VBQUEsQ0FQVjtBQUFBLFVBUUEsV0FBQSxFQUFhLFNBQUMsU0FBRCxHQUFBO0FBQWUsWUFBQSxJQUFDLENBQUEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFkLENBQXFCLFNBQXJCLENBQUEsQ0FBQTtBQUFnQyxtQkFBTyxJQUFQLENBQS9DO1VBQUEsQ0FSYjtBQUFBLFVBU0EsUUFBQSxFQUFVLFNBQUMsU0FBRCxHQUFBO21CQUFlLElBQUMsQ0FBQSxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQWQsQ0FBdUIsU0FBdkIsRUFBZjtVQUFBLENBVFY7QUFBQSxVQVdBLElBQUEsRUFBTSxTQUFBLEdBQUE7QUFBRyxZQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsYUFBYixDQUFBLENBQUE7bUJBQTRCLElBQUksQ0FBQyxjQUFMLENBQW9CLEtBQXBCLEVBQS9CO1VBQUEsQ0FYTjtBQUFBLFVBWUEsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUFHLFlBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxhQUFWLENBQUEsQ0FBQTttQkFBeUIsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsSUFBcEIsRUFBNUI7VUFBQSxDQVpOO0FBQUEsVUFlQSxHQUFBLEVBQUssU0FBQyxPQUFELEdBQUE7QUFDRCxZQUFBLElBQUMsQ0FBQSxFQUFFLENBQUMsV0FBSixDQUFnQixPQUFoQixDQUFBLENBQUE7QUFDQSxtQkFBTyxJQUFQLENBRkM7VUFBQSxDQWZMO0FBQUEsVUFvQkEsUUFBQSxFQUFVLFNBQUMsVUFBRCxHQUFBO21CQUNOLElBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLGVBQVYsR0FBNEIsVUFBVSxDQUFDLE1BQVgsQ0FBQSxFQUR0QjtVQUFBLENBcEJWO1NBTEosQ0FBQTtBQUFBLFFBMkJBLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBcEIsQ0FBd0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFqQyxDQTNCQSxDQUFBO0FBQUEsUUErQkEsUUFBQSxHQUFXLFNBQUMsT0FBRCxFQUFVLEtBQVYsR0FBQTtBQUNQLGNBQUEsT0FBQTtBQUFBLFVBQUEsSUFBRyxLQUFBLElBQVUsQ0FBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLFVBQWhCLENBQWI7QUFDSSxZQUFBLElBQUcsS0FBQSxLQUFTLE9BQVo7QUFDSSxxQkFBTyxJQUFQLENBREo7YUFBQSxNQUFBO0FBRUsscUJBQU8sUUFBQSxDQUFTLE9BQVQsRUFBa0IsT0FBbEIsQ0FBUCxDQUZMO2FBREo7V0FBQTtBQUlBLGlCQUFPLEtBQVAsQ0FMTztRQUFBLENBL0JYLENBQUE7QUFBQSxRQXNDQSxXQUFBLEdBQWMsS0F0Q2QsQ0FBQTtBQUFBLFFBd0NBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxDQUFELEVBQUksVUFBSixHQUFBO0FBQ3BCLFlBQUEsSUFBQSxDQUFBLENBQWMsVUFBQSxJQUFlLFFBQUEsQ0FBUyxLQUFDLENBQUEsT0FBTyxDQUFDLEVBQWxCLEVBQXNCLENBQUMsQ0FBQyxNQUF4QixDQUE3QixDQUFBO0FBQUEsb0JBQUEsQ0FBQTthQUFBO0FBQUEsWUFDQSxDQUFDLENBQUMsY0FBRixDQUFBLENBREEsQ0FBQTttQkFFQSxXQUFBLEdBQWMsS0FITTtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBeENBLENBQUE7QUFBQSxRQTZDQSxXQUFXLENBQUMsV0FBWixDQUF3QixTQUFDLENBQUQsR0FBQTtpQkFDcEIsV0FBQSxHQUFjLE1BRE07UUFBQSxDQUF4QixDQTdDQSxDQUFBO0FBQUEsUUFnREEsV0FBVyxDQUFDLFNBQVosQ0FBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLENBQUQsR0FBQTtBQUNsQixZQUFBLElBQUEsQ0FBQSxDQUFjLFdBQUEsSUFBZ0IsS0FBQyxDQUFBLEtBQS9CLENBQUE7QUFBQSxvQkFBQSxDQUFBO2FBQUE7bUJBQ0EsV0FBVyxDQUFDLGNBQVosQ0FBMkIsS0FBQyxDQUFBLEtBQTVCLEVBRmtCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsQ0FoREEsQ0FBQTtBQUFBLFFBc0RBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUNQLGdCQUFBLEtBQUE7QUFBQSxZQUFBLEtBQUEsR0FBUSxXQUFXLENBQUMsWUFBWixDQUF5QixPQUF6QixDQUFSLENBQUE7QUFBQSxZQUdBLFdBQVcsQ0FBQyxZQUFaLENBQXlCLFNBQUEsR0FBQTtxQkFDckIsS0FBQyxDQUFBLEtBQUQsR0FBUyxLQURZO1lBQUEsQ0FBekIsQ0FIQSxDQUFBO0FBQUEsWUFPQSxXQUFXLENBQUMsWUFBWixDQUF5QixTQUFDLFVBQUQsRUFBYSxRQUFiLEdBQUE7QUFDckIsY0FBQSxJQUF1QixRQUF2Qjt1QkFBQSxLQUFDLENBQUEsS0FBRCxHQUFTLFdBQVQ7ZUFEcUI7WUFBQSxDQUF6QixDQVBBLENBQUE7QUFBQSxZQVdBLEtBQUssQ0FBQyxjQUFOLENBQXFCLFNBQUMsVUFBRCxHQUFBO0FBQ2pCLGNBQUEsSUFBQSxDQUFBLEtBQStCLENBQUEsS0FBL0I7QUFBQSx1QkFBTyxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQSxDQUFQLENBQUE7ZUFBQTtBQUVBLGNBQUEsSUFBRyxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFDLENBQUEsS0FBbkIsQ0FBSDt1QkFDSSxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQSxFQURKO2VBQUEsTUFBQTt1QkFFSyxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQSxFQUZMO2VBSGlCO1lBQUEsQ0FBckIsQ0FYQSxDQURPO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQXREQSxDQUFBO0FBQUEsUUE0RUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ1AsWUFBQSxXQUFXLENBQUMsWUFBWixDQUF5QixTQUFDLFVBQUQsRUFBYSxRQUFiLEdBQUE7QUFDckIsY0FBQSxJQUFnQyxRQUFoQzt1QkFBQSxLQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsQ0FBa0IsVUFBbEIsRUFBQTtlQURxQjtZQUFBLENBQXpCLENBQUEsQ0FETztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0E1RUEsQ0FBQTtBQUFBLFFBbUZBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUVQLGdCQUFBLGVBQUE7QUFBQSxZQUFBLEtBQUEsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUFSLENBQUE7QUFBQSxZQUNBLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IsRUFBQSxHQUFuQyxLQUFDLENBQUEsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUF1QixHQUEyQixPQUEvQyxDQURBLENBQUE7QUFBQSxZQUlBLFFBQUEsR0FBVyxTQUFDLFVBQUQsR0FBQTtxQkFDUCxLQUFLLENBQUMsU0FBTixHQUFrQixVQUFVLENBQUMsTUFEdEI7WUFBQSxDQUpYLENBQUE7QUFBQSxZQU9BLFdBQVcsQ0FBQyxZQUFaLENBQXlCLFNBQUMsVUFBRCxFQUFhLFFBQWIsR0FBQTtBQUNyQixjQUFBLElBQXVCLFFBQXZCO3VCQUFBLFFBQUEsQ0FBUyxVQUFULEVBQUE7ZUFEcUI7WUFBQSxDQUF6QixDQVBBLENBQUE7bUJBU0EsS0FBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsS0FBYixFQVhPO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQW5GQSxDQUFBO0FBK0ZBLGVBQU8sSUFBUCxDQWhHTTtNQUFBLENBakJWO01BRGE7RUFBQSxDQUFqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/color-picker/lib/extensions/Return.coffee
