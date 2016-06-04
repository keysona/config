(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      control: null,
      canvas: null,
      getHue: function() {
        if ((this.control && this.control.selection) && this.element) {
          return this.control.selection.y / this.element.getHeight() * 360;
        } else {
          return 0;
        }
      },
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
            _el.classList.add("" + _classPrefix + "-hue");
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
        Body.element.add(this.element.el, 2);
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
            var Hue, _context, _elementHeight, _elementWidth, _gradient, _hex, _hexes, _i, _j, _len, _step;
            Hue = _this;
            _elementWidth = _this.element.getWidth();
            _elementHeight = _this.element.getHeight();
            _hexes = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00'];
            _this.canvas = {
              el: (function() {
                var _el;
                _el = document.createElement('canvas');
                _el.width = _elementWidth;
                _el.height = _elementHeight;
                _el.classList.add("" + Hue.element.el.className + "-canvas");
                return _el;
              })(),
              context: null,
              getContext: function() {
                return this.context || (this.context = this.el.getContext('2d'));
              },
              getColorAtPosition: function(y) {
                return colorPicker.SmartColor.HSVArray([y / Hue.element.getHeight() * 360, 100, 100]);
              }
            };
            _context = _this.canvas.getContext();
            _step = 1 / (_hexes.length - 1);
            _gradient = _context.createLinearGradient(0, 0, 1, _elementHeight);
            for (_i = _j = 0, _len = _hexes.length; _j < _len; _i = ++_j) {
              _hex = _hexes[_i];
              _gradient.addColorStop(_step * _i, _hex);
            }
            _context.fillStyle = _gradient;
            _context.fillRect(0, 0, _elementWidth, _elementHeight);
            return _this.element.add(_this.canvas.el);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, hasChild;
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
            Hue = _this;
            _this.control = {
              el: (function() {
                var _el;
                _el = document.createElement('div');
                _el.classList.add("" + Hue.element.el.className + "-control");
                return _el;
              })(),
              isGrabbing: false,
              selection: {
                y: 0,
                color: null
              },
              setSelection: function(e, y, offset) {
                var _height, _position, _rect, _width, _y;
                if (y == null) {
                  y = null;
                }
                if (offset == null) {
                  offset = null;
                }
                if (!(Hue.canvas && (_rect = Hue.element.getRect()))) {
                  return;
                }
                _width = Hue.element.getWidth();
                _height = Hue.element.getHeight();
                if (e) {
                  _y = e.pageY - _rect.top;
                } else if (typeof y === 'number') {
                  _y = y;
                } else if (typeof offset === 'number') {
                  _y = this.selection.y + offset;
                } else {
                  _y = this.selection.y;
                }
                _y = this.selection.y = Math.max(0, Math.min(_height, _y));
                this.selection.color = Hue.canvas.getColorAtPosition(_y);
                _position = {
                  y: Math.max(3, Math.min(_height - 6, _y))
                };
                requestAnimationFrame((function(_this) {
                  return function() {
                    return _this.el.style.top = "" + _position.y + "px";
                  };
                })(this));
                return Hue.emitSelectionChanged();
              },
              refreshSelection: function() {
                return this.setSelection();
              }
            };
            _this.control.refreshSelection();
            colorPicker.onInputColor(function(smartColor) {
              var _hue;
              _hue = smartColor.toHSVArray()[0];
              return _this.control.setSelection(null, (_this.element.getHeight() / 360) * _hue);
            });
            Hue.onSelectionChanged(function() {
              return Hue.emitColorChanged();
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
            colorPicker.onMouseDown(function(e, isOnPicker) {
              if (!(isOnPicker && hasChild(Hue.element.el, e.target))) {
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
            colorPicker.onMouseWheel(function(e, isOnPicker) {
              if (!(isOnPicker && hasChild(Hue.element.el, e.target))) {
                return;
              }
              e.preventDefault();
              return _this.control.setSelection(null, null, e.wheelDeltaY * .33);
            });
            return _this.element.add(_this.control.el);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9IdWUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBS0k7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsV0FBRCxHQUFBO1dBQ2I7QUFBQSxNQUFBLE9BQUEsRUFBUyxDQUFDLE9BQUEsQ0FBUSxvQkFBUixDQUFELENBQUEsQ0FBQSxDQUFUO0FBQUEsTUFFQSxPQUFBLEVBQVMsSUFGVDtBQUFBLE1BR0EsT0FBQSxFQUFTLElBSFQ7QUFBQSxNQUlBLE1BQUEsRUFBUSxJQUpSO0FBQUEsTUFTQSxNQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ0osUUFBQSxJQUFHLENBQUMsSUFBQyxDQUFBLE9BQUQsSUFBYSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQXZCLENBQUEsSUFBc0MsSUFBQyxDQUFBLE9BQTFDO0FBQ0ksaUJBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBbkIsR0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUEsQ0FBdkIsR0FBOEMsR0FBckQsQ0FESjtTQUFBLE1BQUE7QUFFSyxpQkFBTyxDQUFQLENBRkw7U0FESTtNQUFBLENBVFI7QUFBQSxNQWtCQSxvQkFBQSxFQUFzQixTQUFBLEdBQUE7ZUFDbEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsa0JBQWQsRUFBa0MsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUEzQyxFQURrQjtNQUFBLENBbEJ0QjtBQUFBLE1Bb0JBLGtCQUFBLEVBQW9CLFNBQUMsUUFBRCxHQUFBO2VBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLFFBQWhDLEVBRGdCO01BQUEsQ0FwQnBCO0FBQUEsTUF3QkEsZ0JBQUEsRUFBa0IsU0FB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

//# sourceURL=/home/key/.atom/packages/color-picker/lib/extensions/Hue.coffee
