(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      color: null,
      emitOutputFormat: function(format) {
        return this.Emitter.emit('outputFormat', format);
      },
      onOutputFormat: function(callback) {
        return this.Emitter.on('outputFormat', callback);
      },
      activate: function() {
        var hasChild, _isClicking;
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = colorPicker.element.el.className;
            _el = document.createElement('div');
            _el.classList.add("" + _classPrefix + "-color");
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
          height: function() {
            return this.el.offsetHeight;
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          },
          previousColor: null,
          setColor: function(smartColor) {
            var _color;
            _color = smartColor.toRGBA();
            if (this.previousColor && this.previousColor === _color) {
              return;
            }
            this.el.style.backgroundColor = _color;
            return this.previousColor = _color;
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
            if (!_isClicking) {
              return;
            }
            colorPicker.replace(_this.color);
            return colorPicker.element.close();
          };
        })(this));
        colorPicker.onKeyDown((function(_this) {
          return function(e) {
            if (e.which !== 13) {
              return;
            }
            e.stopPropagation();
            return colorPicker.replace(_this.color);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Alpha;
            Alpha = colorPicker.getExtension('Alpha');
            Alpha.onColorChanged(function(smartColor) {
              _this.element.setColor((function() {
                if (smartColor) {
                  return smartColor;
                } else {
                  return colorPicker.SmartColor.HEX('#f00');
                }
              })());
            });
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Alpha, Format, Return, setColor, _currentColor, _formatFormat, _inputColor, _text;
            Alpha = colorPicker.getExtension('Alpha');
            Return = colorPicker.getExtension('Return');
            Format = colorPicker.getExtension('Format');
            _text = document.createElement('p');
            _text.classList.add("" + _this.element.el.className + "-text");
            colorPicker.onBeforeOpen(function() {
              return _this.color = null;
            });
            _inputColor = null;
            colorPicker.onInputColor(function(smartColor, wasFound) {
              return _inputColor = wasFound ? smartColor : null;
            });
            _formatFormat = null;
            Format.onFormatChanged(function(format) {
              return _formatFormat = format;
            });
            colorPicker.onInputColor(function() {
              return _formatFormat = null;
            });
            setColor = function(smartColor) {
              var _format, _function, _outputColor, _preferredFormat;
              _preferredFormat = atom.config.get('color-picker.preferredFormat');
              _format = _formatFormat || (_inputColor != null ? _inputColor.format : void 0) || _preferredFormat || 'RGB';
              _function = smartColor.getAlpha() < 1 ? smartColor["to" + _format + "A"] || smartColor["to" + _format] : smartColor["to" + _format];
              _outputColor = (function() {
                if (_inputColor && (_inputColor.format === _format || _inputColor.format === ("" + _format + "A"))) {
                  if (smartColor.equals(_inputColor)) {
                    return _inputColor.value;
                  }
                }
                return _function.call(smartColor);
              })();
              if (_outputColor === _this.color) {
                return;
              }
              if (_inputColor && atom.config.get('color-picker.automaticReplace')) {
                colorPicker.replace(_outputColor);
              }
              _this.color = _outputColor;
              _text.innerText = _outputColor;
              return _this.emitOutputFormat(_format);
            };
            _currentColor = null;
            Alpha.onColorChanged(function(smartColor) {
              setColor(_currentColor = (function() {
                if (smartColor) {
                  return smartColor;
                } else {
                  return colorPicker.SmartColor.HEX('#f00');
                }
              })());
            });
            Format.onFormatChanged(function() {
              return setColor(_currentColor);
            });
            Return.onVisibility(function(visibility) {
              if (visibility) {
                return _this.element.addClass('is--returnVisible');
              } else {
                return _this.element.removeClass('is--returnVisible');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9Db2xvci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFLSTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxXQUFELEdBQUE7V0FDYjtBQUFBLE1BQUEsT0FBQSxFQUFTLENBQUMsT0FBQSxDQUFRLG9CQUFSLENBQUQsQ0FBQSxDQUFBLENBQVQ7QUFBQSxNQUVBLE9BQUEsRUFBUyxJQUZUO0FBQUEsTUFHQSxLQUFBLEVBQU8sSUFIUDtBQUFBLE1BU0EsZ0JBQUEsRUFBa0IsU0FBQyxNQUFELEdBQUE7ZUFDZCxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxjQUFkLEVBQThCLE1BQTlCLEVBRGM7TUFBQSxDQVRsQjtBQUFBLE1BV0EsY0FBQSxFQUFnQixTQUFDLFFBQUQsR0FBQTtlQUNaLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGNBQVosRUFBNEIsUUFBNUIsRUFEWTtNQUFBLENBWGhCO0FBQUEsTUFpQkEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNOLFlBQUEscUJBQUE7QUFBQSxRQUFBLElBQUMsQ0FBQSxPQUFELEdBQ0k7QUFBQSxVQUFBLEVBQUEsRUFBTyxDQUFBLFNBQUEsR0FBQTtBQUNILGdCQUFBLGlCQUFBO0FBQUEsWUFBQSxZQUFBLEdBQWUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBdEMsQ0FBQTtBQUFBLFlBQ0EsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBRE4sQ0FBQTtBQUFBLFlBRUEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQWtCLEVBQUEsR0FBckMsWUFBcUMsR0FBa0IsUUFBcEMsQ0FGQSxDQUFBO0FBSUEsbUJBQU8sR0FBUCxDQUxHO1VB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

//# sourceURL=/home/key/.atom/packages/color-picker/lib/extensions/Color.coffee
