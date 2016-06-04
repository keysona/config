(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      color: null,
      emitFormatChanged: function(format) {
        return this.Emitter.emit('formatChanged', format);
      },
      onFormatChanged: function(callback) {
        return this.Emitter.on('formatChanged', callback);
      },
      activate: function() {
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = colorPicker.element.el.className;
            _el = document.createElement('div');
            _el.classList.add("" + _classPrefix + "-format");
            return _el;
          })(),
          add: function(element) {
            this.el.appendChild(element);
            return this;
          }
        };
        colorPicker.element.add(this.element.el);
        setTimeout((function(_this) {
          return function() {
            var Color, _activeButton, _buttons, _format, _i, _len, _ref, _results;
            Color = colorPicker.getExtension('Color');
            _buttons = [];
            _activeButton = null;
            colorPicker.onBeforeOpen(function() {
              var _button, _i, _len, _results;
              _results = [];
              for (_i = 0, _len = _buttons.length; _i < _len; _i++) {
                _button = _buttons[_i];
                _results.push(_button.deactivate());
              }
              return _results;
            });
            Color.onOutputFormat(function(format) {
              var _button, _i, _len, _results;
              _results = [];
              for (_i = 0, _len = _buttons.length; _i < _len; _i++) {
                _button = _buttons[_i];
                if (format === _button.format || format === ("" + _button.format + "A")) {
                  _button.activate();
                  _results.push(_activeButton = _button);
                } else {
                  _results.push(_button.deactivate());
                }
              }
              return _results;
            });
            _ref = ['RGB', 'HEX', 'HSL', 'HSV', 'VEC'];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              _format = _ref[_i];
              _results.push((function(_format) {
                var Format, hasChild, _button, _isClicking;
                Format = _this;
                _button = {
                  el: (function() {
                    var _el;
                    _el = document.createElement('button');
                    _el.classList.add("" + Format.element.el.className + "-button");
                    _el.innerHTML = _format;
                    return _el;
                  })(),
                  format: _format,
                  addClass: function(className) {
                    this.el.classList.add(className);
                    return this;
                  },
                  removeClass: function(className) {
                    this.el.classList.remove(className);
                    return this;
                  },
                  activate: function() {
                    return this.addClass('is--active');
                  },
                  deactivate: function() {
                    return this.removeClass('is--active');
                  }
                };
                _buttons.push(_button);
                if (!_activeButton) {
                  if (_format === atom.config.get('color-picker.preferredFormat')) {
                    _activeButton = _button;
                    _button.activate();
                  }
                }
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
                colorPicker.onMouseDown(function(e, isOnPicker) {
                  if (!(isOnPicker && hasChild(_button.el, e.target))) {
                    return;
                  }
                  e.preventDefault();
                  return _isClicking = true;
                });
                colorPicker.onMouseMove(function(e) {
                  return _isClicking = false;
                });
                colorPicker.onMouseUp(function(e) {
                  if (!_isClicking) {
                    return;
                  }
                  if (_activeButton) {
                    _activeButton.deactivate();
                  }
                  _button.activate();
                  _activeButton = _button;
                  return _this.emitFormatChanged(_format);
                });
                return _this.element.add(_button.el);
              })(_format));
            }
            return _results;
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9Gb3JtYXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBS0k7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsV0FBRCxHQUFBO1dBQ2I7QUFBQSxNQUFBLE9BQUEsRUFBUyxDQUFDLE9BQUEsQ0FBUSxvQkFBUixDQUFELENBQUEsQ0FBQSxDQUFUO0FBQUEsTUFFQSxPQUFBLEVBQVMsSUFGVDtBQUFBLE1BR0EsS0FBQSxFQUFPLElBSFA7QUFBQSxNQVNBLGlCQUFBLEVBQW1CLFNBQUMsTUFBRCxHQUFBO2VBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsZUFBZCxFQUErQixNQUEvQixFQURlO01BQUEsQ0FUbkI7QUFBQSxNQVdBLGVBQUEsRUFBaUIsU0FBQyxRQUFELEdBQUE7ZUFDYixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxlQUFaLEVBQTZCLFFBQTdCLEVBRGE7TUFBQSxDQVhqQjtBQUFBLE1BaUJBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDTixRQUFBLElBQUMsQ0FBQSxPQUFELEdBQ0k7QUFBQSxVQUFBLEVBQUEsRUFBTyxDQUFBLFNBQUEsR0FBQTtBQUNILGdCQUFBLGlCQUFBO0FBQUEsWUFBQSxZQUFBLEdBQWUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBdEMsQ0FBQTtBQUFBLFlBQ0EsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBRE4sQ0FBQTtBQUFBLFlBRUEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQWtCLEVBQUEsR0FBckMsWUFBcUMsR0FBa0IsU0FBcEMsQ0FGQSxDQUFBO0FBSUEsbUJBQU8sR0FBUCxDQUxHO1VBQUEsQ0FBQSxDQUFILENB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

//# sourceURL=/home/key/.atom/packages/color-picker/lib/extensions/Format.coffee
