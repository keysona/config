(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      control: null,
      canvas: null,
      emitSelectionChanged: function() {
        return this.Emitter.emit('selectionChanged', this.control.selection);
      },
      onSelectionChanged: function(callback) {
        return this.Emitter.on('selectionChanged', callback);
      },
      emitColorChanged: function() {
        return this.Emitter.emit('colorChanged', this.control.selection.color);
      },
      onColorChanged: function(callback) {
        return this.Emitter.on('colorChanged', callback);
      },
      activate: function() {
        var Body;
        Body = colorPicker.getExtension('Body');
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = Body.element.el.className;
            _el = document.createElement('div');
            _el.classList.add("" + _classPrefix + "-saturation");
            return _el;
          })(),
          width: 0,
          height: 0,
          getWidth: function() {
            return this.width || this.el.offsetWidth;
          },
          getHeight: function() {
            return this.height || this.el.offsetHeight;
          },
          rect: null,
          getRect: function() {
            return this.rect || this.updateRect();
          },
          updateRect: function() {
            return this.rect = this.el.getClientRects()[0];
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          }
        };
        Body.element.add(this.element.el, 0);
        colorPicker.onOpen((function(_this) {
          return function() {
            var _rect;
            if (!(_this.element.updateRect() && (_rect = _this.element.getRect()))) {
              return;
            }
            _this.width = _rect.width;
            return _this.height = _rect.height;
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, Saturation, _elementHeight, _elementWidth;
            Saturation = _this;
            Hue = colorPicker.getExtension('Hue');
            _elementWidth = _this.element.getWidth();
            _elementHeight = _this.element.getHeight();
            _this.canvas = {
              el: (function() {
                var _el;
                _el = document.createElement('canvas');
                _el.width = _elementWidth;
                _el.height = _elementHeight;
                _el.classList.add("" + Saturation.element.el.className + "-canvas");
                return _el;
              })(),
              context: null,
              getContext: function() {
                return this.context || (this.context = this.el.getContext('2d'));
              },
              getColorAtPosition: function(x, y) {
                return colorPicker.SmartColor.HSVArray([Hue.getHue(), x / Saturation.element.getWidth() * 100, 100 - (y / Saturation.element.getHeight() * 100)]);
              },
              previousRender: null,
              render: function(smartColor) {
                var _context, _gradient, _hslArray, _joined;
                _hslArray = ((function() {
                  if (!smartColor) {
                    return colorPicker.SmartColor.HEX('#f00');
                  } else {
                    return smartColor;
                  }
                })()).toHSLArray();
                _joined = _hslArray.join(',');
                if (this.previousRender && this.previousRender === _joined) {
                  return;
                }
                _context = this.getContext();
                _context.clearRect(0, 0, _elementWidth, _elementHeight);
                _gradient = _context.createLinearGradient(0, 0, _elementWidth, 1);
                _gradient.addColorStop(.01, 'hsl(0,100%,100%)');
                _gradient.addColorStop(.99, "hsl(" + _hslArray[0] + ",100%,50%)");
                _context.fillStyle = _gradient;
                _context.fillRect(0, 0, _elementWidth, _elementHeight);
                _gradient = _context.createLinearGradient(0, 0, 1, _elementHeight);
                _gradient.addColorStop(.01, 'rgba(0,0,0,0)');
                _gradient.addColorStop(.99, 'rgba(0,0,0,1)');
                _context.fillStyle = _gradient;
                _context.fillRect(0, 0, _elementWidth, _elementHeight);
                return this.previousRender = _joined;
              }
            };
            Hue.onColorChanged(function(smartColor) {
              return _this.canvas.render(smartColor);
            });
            _this.canvas.render();
            return _this.element.add(_this.canvas.el);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, Saturation, hasChild;
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
            Saturation = _this;
            Hue = colorPicker.getExtension('Hue');
            _this.control = {
              el: (function() {
                var _el;
                _el = document.createElement('div');
                _el.classList.add("" + Saturation.element.el.className + "-control");
                return _el;
              })(),
              isGrabbing: false,
              previousControlPosition: null,
              updateControlPosition: function(x, y) {
                var _joined;
                _joined = "" + x + "," + y;
                if (this.previousControlPosition && this.previousControlPosition === _joined) {
                  return;
                }
                requestAnimationFrame((function(_this) {
                  return function() {
                    _this.el.style.left = "" + x + "px";
                    return _this.el.style.top = "" + y + "px";
                  };
                })(this));
                return this.previousControlPosition = _joined;
              },
              selection: {
                x: null,
                y: 0,
                color: null
              },
              setSelection: function(e, saturation, key) {
                var _height, _position, _rect, _width, _x, _y;
                if (saturation == null) {
                  saturation = null;
                }
                if (key == null) {
                  key = null;
                }
                if (!(Saturation.canvas && (_rect = Saturation.element.getRect()))) {
                  return;
                }
                _width = Saturation.element.getWidth();
                _height = Saturation.element.getHeight();
                if (e) {
                  _x = e.pageX - _rect.left;
                  _y = e.pageY - _rect.top;
                } else if ((typeof saturation === 'number') && (typeof key === 'number')) {
                  _x = _width * saturation;
                  _y = _height * key;
                } else {
                  if (typeof this.selection.x !== 'number') {
                    this.selection.x = _width;
                  }
                  _x = this.selection.x;
                  _y = this.selection.y;
                }
                _x = this.selection.x = Math.max(0, Math.min(_width, Math.round(_x)));
                _y = this.selection.y = Math.max(0, Math.min(_height, Math.round(_y)));
                _position = {
                  x: Math.max(6, Math.min(_width - 7, _x)),
                  y: Math.max(6, Math.min(_height - 7, _y))
                };
                this.selection.color = Saturation.canvas.getColorAtPosition(_x, _y);
                this.updateControlPosition(_position.x, _position.y);
                return Saturation.emitSelectionChanged();
              },
              refreshSelection: function() {
                return this.setSelection();
              }
            };
            _this.control.refreshSelection();
            colorPicker.onInputColor(function(smartColor) {
              var h, s, v, _ref;
              _ref = smartColor.toHSVArray(), h = _ref[0], s = _ref[1], v = _ref[2];
              return _this.control.setSelection(null, s, 1 - v);
            });
            Saturation.onSelectionChanged(function() {
              return Saturation.emitColorChanged();
            });
            colorPicker.onOpen(function() {
              return _this.control.refreshSelection();
            });
            colorPicker.onOpen(function() {
              return _this.control.isGrabbing = false;
            });
            colorPicker.onClose(function() {
              return _this.control.isGrabbing = false;
            });
            Hue.onColorChanged(function() {
              return _this.control.refreshSelection();
            });
            colorPicker.onMouseDown(function(e, isOnPicker) {
              if (!(isOnPicker && hasChild(Saturation.element.el, e.target))) {
                return;
              }
              e.preventDefault();
              _this.control.isGrabbing = true;
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseMove(function(e) {
              if (!_this.control.isGrabbing) {
                return;
              }
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseUp(function(e) {
              if (!_this.control.isGrabbing) {
                return;
              }
              _this.control.isGrabbing = false;
              return _this.control.setSelection(e);
            });
            return _this.element.add(_this.control.el);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9TYXR1cmF0aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUtJO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLFdBQUQsR0FBQTtXQUNiO0FBQUEsTUFBQSxPQUFBLEVBQVMsQ0FBQyxPQUFBLENBQVEsb0JBQVIsQ0FBRCxDQUFBLENBQUEsQ0FBVDtBQUFBLE1BRUEsT0FBQSxFQUFTLElBRlQ7QUFBQSxNQUdBLE9BQUEsRUFBUyxJQUhUO0FBQUEsTUFJQSxNQUFBLEVBQVEsSUFKUjtBQUFBLE1BVUEsb0JBQUEsRUFBc0IsU0FBQSxHQUFBO2VBQ2xCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGtCQUFkLEVBQWtDLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBM0MsRUFEa0I7TUFBQSxDQVZ0QjtBQUFBLE1BWUEsa0JBQUEsRUFBb0IsU0FBQyxRQUFELEdBQUE7ZUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksa0JBQVosRUFBZ0MsUUFBaEMsRUFEZ0I7TUFBQSxDQVpwQjtBQUFBLE1BZ0JBLGdCQUFBLEVBQWtCLFNBQUEsR0FBQTtlQUNkLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGNBQWQsRUFBOEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBakQsRUFEYztNQUFBLENBaEJsQjtBQUFBLE1Ba0JBLGNBQUEsRUFBZ0IsU0FBQyxRQUFELEdBQUE7ZUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxjQUFaLEVBQTRCLFFBQTVCLEVBRFk7TUFBQSxDQWxCaEI7QUFBQSxNQXdCQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ04sWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFB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

//# sourceURL=/home/key/.atom/packages/color-picker/lib/extensions/Saturation.coffee
