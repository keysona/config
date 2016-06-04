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
            _el.classList.add("" + _classPrefix + "-alpha");
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
        Body.element.add(this.element.el, 1);
        colorPicker.onOpen((function(_this) {
          return function() {
            return _this.element.updateRect();
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Alpha, Saturation, _elementHeight, _elementWidth;
            Alpha = _this;
            Saturation = colorPicker.getExtension('Saturation');
            _elementWidth = _this.element.getWidth();
            _elementHeight = _this.element.getHeight();
            _this.canvas = {
              el: (function() {
                var _el;
                _el = document.createElement('canvas');
                _el.width = _elementWidth;
                _el.height = _elementHeight;
                _el.classList.add("" + Alpha.element.el.className + "-canvas");
                return _el;
              })(),
              context: null,
              getContext: function() {
                return this.context || (this.context = this.el.getContext('2d'));
              },
              previousRender: null,
              render: function(smartColor) {
                var _context, _gradient, _rgb;
                _rgb = ((function() {
                  if (!smartColor) {
                    return colorPicker.SmartColor.HEX('#f00');
                  } else {
                    return smartColor;
                  }
                })()).toRGBArray().join(',');
                if (this.previousRender && this.previousRender === _rgb) {
                  return;
                }
                _context = this.getContext();
                _context.clearRect(0, 0, _elementWidth, _elementHeight);
                _gradient = _context.createLinearGradient(0, 0, 1, _elementHeight);
                _gradient.addColorStop(.01, "rgba(" + _rgb + ",1)");
                _gradient.addColorStop(.99, "rgba(" + _rgb + ",0)");
                _context.fillStyle = _gradient;
                _context.fillRect(0, 0, _elementWidth, _elementHeight);
                return this.previousRender = _rgb;
              }
            };
            Saturation.onColorChanged(function(smartColor) {
              return _this.canvas.render(smartColor);
            });
            _this.canvas.render();
            return _this.element.add(_this.canvas.el);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Alpha, Saturation, hasChild;
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
            Alpha = _this;
            Saturation = colorPicker.getExtension('Saturation');
            _this.control = {
              el: (function() {
                var _el;
                _el = document.createElement('div');
                _el.classList.add("" + Alpha.element.el.className + "-control");
                return _el;
              })(),
              isGrabbing: false,
              previousControlPosition: null,
              updateControlPosition: function(y) {
                var _joined;
                _joined = "," + y;
                if (this.previousControlPosition && this.previousControlPosition === _joined) {
                  return;
                }
                requestAnimationFrame((function(_this) {
                  return function() {
                    return _this.el.style.top = "" + y + "px";
                  };
                })(this));
                return this.previousControlPosition = _joined;
              },
              selection: {
                y: 0,
                color: null,
                alpha: null
              },
              setSelection: function(e, alpha, offset) {
                var _RGBAArray, _alpha, _height, _position, _rect, _smartColor, _width, _y;
                if (alpha == null) {
                  alpha = null;
                }
                if (offset == null) {
                  offset = null;
                }
                _rect = Alpha.element.getRect();
                _width = Alpha.element.getWidth();
                _height = Alpha.element.getHeight();
                if (e) {
                  _y = e.pageY - _rect.top;
                } else if (typeof alpha === 'number') {
                  _y = _height - (alpha * _height);
                } else if (typeof offset === 'number') {
                  _y = this.selection.y + offset;
                } else {
                  _y = this.selection.y;
                }
                _y = this.selection.y = Math.max(0, Math.min(_height, _y));
                _alpha = 1 - (_y / _height);
                this.selection.alpha = (Math.round(_alpha * 100)) / 100;
                if (_smartColor = this.selection.color) {
                  _RGBAArray = _smartColor.toRGBAArray();
                  _RGBAArray[3] = this.selection.alpha;
                  this.selection.color = colorPicker.SmartColor.RGBAArray(_RGBAArray);
                  Alpha.emitColorChanged();
                } else {
                  this.selection.color = colorPicker.SmartColor.RGBAArray([255, 0, 0, this.selection.alpha]);
                }
                _position = {
                  y: Math.max(3, Math.min(_height - 6, _y))
                };
                this.updateControlPosition(_position.y);
                return Alpha.emitSelectionChanged();
              },
              refreshSelection: function() {
                return this.setSelection();
              }
            };
            _this.control.refreshSelection();
            colorPicker.onInputColor(function(smartColor) {
              return _this.control.setSelection(null, smartColor.getAlpha());
            });
            colorPicker.onOpen(function() {
              return _this.control.isGrabbing = false;
            });
            colorPicker.onClose(function() {
              return _this.control.isGrabbing = false;
            });
            Saturation.onColorChanged(function(smartColor) {
              _this.control.selection.color = smartColor;
              return _this.control.refreshSelection();
            });
            colorPicker.onMouseDown(function(e, isOnPicker) {
              if (!(isOnPicker && hasChild(Alpha.element.el, e.target))) {
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
              if (!(isOnPicker && hasChild(Alpha.element.el, e.target))) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9BbHBoYS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFLSTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxXQUFELEdBQUE7V0FDYjtBQUFBLE1BQUEsT0FBQSxFQUFTLENBQUMsT0FBQSxDQUFRLG9CQUFSLENBQUQsQ0FBQSxDQUFBLENBQVQ7QUFBQSxNQUVBLE9BQUEsRUFBUyxJQUZUO0FBQUEsTUFHQSxPQUFBLEVBQVMsSUFIVDtBQUFBLE1BSUEsTUFBQSxFQUFRLElBSlI7QUFBQSxNQVVBLG9CQUFBLEVBQXNCLFNBQUEsR0FBQTtlQUNsQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxrQkFBZCxFQUFrQyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQTNDLEVBRGtCO01BQUEsQ0FWdEI7QUFBQSxNQVlBLGtCQUFBLEVBQW9CLFNBQUMsUUFBRCxHQUFBO2VBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLFFBQWhDLEVBRGdCO01BQUEsQ0FacEI7QUFBQSxNQWdCQSxnQkFBQSxFQUFrQixTQUFBLEdBQUE7ZUFDZCxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxjQUFkLEVBQThCLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQWpELEVBRGM7TUFBQSxDQWhCbEI7QUFBQSxNQWtCQSxjQUFBLEVBQWdCLFNBQUMsUUFBRCxHQUFBO2VBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksY0FBWixFQUE0QixRQUE1QixFQURZO01BQUEsQ0FsQmhCO0FBQUEsTUF3QkEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNOLFlBQUEsSUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFP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

//# sourceURL=/home/key/.atom/packages/color-picker/lib/extensions/Alpha.coffee
