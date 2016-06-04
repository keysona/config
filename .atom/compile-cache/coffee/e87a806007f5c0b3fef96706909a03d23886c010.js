(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = function() {
    var DEFINITIONS, VARIABLE_PATTERN, VARIABLE_TYPES, path;
    path = require('path');
    VARIABLE_PATTERN = '\\{{ VARIABLE }}[\\s]*\\:[\\s]*([^\\;\\n]+)[\\;|\\n]';
    VARIABLE_TYPES = [
      {
        type: 'sass',
        extensions: ['.scss', '.sass'],
        regExp: /([\$])([\w0-9-_]+)/i
      }, {
        type: 'less',
        extensions: ['.less'],
        regExp: /([\@])([\w0-9-_]+)/i
      }, {
        type: 'stylus',
        extensions: ['.stylus', '.styl'],
        regExp: /([\$])([\w0-9-_]+)/i
      }
    ];
    DEFINITIONS = {};
    return {
      find: function(string, pathName) {
        var SmartVariable, extensions, regExp, type, _fn, _i, _j, _len, _len1, _match, _matches, _ref, _ref1, _variables;
        SmartVariable = this;
        _variables = [];
        for (_i = 0, _len = VARIABLE_TYPES.length; _i < _len; _i++) {
          _ref = VARIABLE_TYPES[_i], type = _ref.type, extensions = _ref.extensions, regExp = _ref.regExp;
          _matches = string.match(new RegExp(regExp.source, 'ig'));
          if (!_matches) {
            continue;
          }
          if (pathName) {
            if (_ref1 = path.extname(pathName), __indexOf.call(extensions, _ref1) < 0) {
              continue;
            }
          }
          _fn = function(type, extensions, _match) {
            var _index;
            if ((_index = string.indexOf(_match)) === -1) {
              return;
            }
            _variables.push({
              match: _match,
              type: type,
              extensions: extensions,
              start: _index,
              end: _index + _match.length,
              getDefinition: function() {
                return SmartVariable.getDefinition(this);
              },
              isVariable: true
            });
            return string = string.replace(_match, (new Array(_match.length + 1)).join(' '));
          };
          for (_j = 0, _len1 = _matches.length; _j < _len1; _j++) {
            _match = _matches[_j];
            _fn(type, extensions, _match);
          }
        }
        return _variables;
      },
      getDefinition: function(variable, initial) {
        var extensions, match, type, _definition, _options, _pointer, _regExp, _results;
        match = variable.match, type = variable.type, extensions = variable.extensions;
        _regExp = new RegExp(VARIABLE_PATTERN.replace('{{ VARIABLE }}', match));
        if (_definition = DEFINITIONS[match]) {
          if (initial == null) {
            initial = _definition;
          }
          _pointer = _definition.pointer;
          return atom.project.bufferForPath(_pointer.filePath).then((function(_this) {
            return function(buffer) {
              var _found, _match, _text;
              _text = buffer.getTextInRange(_pointer.range);
              _match = _text.match(_regExp);
              if (!_match) {
                DEFINITIONS[match] = null;
                return _this.getDefinition(variable, initial);
              }
              _definition.value = _match[1];
              _found = (_this.find(_match[1], _pointer.filePath))[0];
              if (_found && _found.isVariable) {
                return _this.getDefinition(_found, initial);
              }
              return {
                value: _definition.value,
                variable: _definition.variable,
                type: _definition.type,
                pointer: initial.pointer
              };
            };
          })(this))["catch"]((function(_this) {
            return function(error) {
              return console.error(error);
            };
          })(this));
        }
        _options = {
          paths: (function() {
            var _extension, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = extensions.length; _i < _len; _i++) {
              _extension = extensions[_i];
              _results.push("**/*" + _extension);
            }
            return _results;
          })()
        };
        _results = [];
        return atom.workspace.scan(_regExp, _options, function(result) {
          return _results.push(result);
        }).then((function(_this) {
          return function() {
            var i, pathFragment, result, _bestMatch, _bestMatchHits, _i, _j, _len, _len1, _match, _pathFragments, _targetFragments, _targetPath, _thisMatchHits;
            _targetPath = atom.workspace.getActivePaneItem().getPath();
            _targetFragments = _targetPath.split(path.sep);
            _bestMatch = null;
            _bestMatchHits = 0;
            for (_i = 0, _len = _results.length; _i < _len; _i++) {
              result = _results[_i];
              _thisMatchHits = 0;
              _pathFragments = result.filePath.split(path.sep);
              for (i = _j = 0, _len1 = _pathFragments.length; _j < _len1; i = ++_j) {
                pathFragment = _pathFragments[i];
                if (pathFragment === _targetFragments[i]) {
                  _thisMatchHits++;
                }
              }
              if (_thisMatchHits > _bestMatchHits) {
                _bestMatch = result;
                _bestMatchHits = _thisMatchHits;
              }
            }
            if (!(_bestMatch && (_match = _bestMatch.matches[0]))) {
              return;
            }
            DEFINITIONS[match] = {
              value: null,
              variable: match,
              type: type,
              pointer: {
                filePath: _bestMatch.filePath,
                range: _match.range
              }
            };
            if (initial == null) {
              initial = DEFINITIONS[match];
            }
            return _this.getDefinition(variable, initial);
          };
        })(this))["catch"]((function(_this) {
          return function(error) {
            return console.error(error);
          };
        })(this));
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvbW9kdWxlcy9TbWFydFZhcmlhYmxlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUlJO0FBQUEsTUFBQSxxSkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FBQTtBQUNiLFFBQUEsbURBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7QUFBQSxJQUtBLGdCQUFBLEdBQW1CLHNEQUxuQixDQUFBO0FBQUEsSUFPQSxjQUFBLEdBQWlCO01BR2I7QUFBQSxRQUNJLElBQUEsRUFBTSxNQURWO0FBQUEsUUFFSSxVQUFBLEVBQVksQ0FBQyxPQUFELEVBQVUsT0FBVixDQUZoQjtBQUFBLFFBR0ksTUFBQSxFQUFRLHFCQUhaO09BSGEsRUFXYjtBQUFBLFFBQ0ksSUFBQSxFQUFNLE1BRFY7QUFBQSxRQUVJLFVBQUEsRUFBWSxDQUFDLE9BQUQsQ0FGaEI7QUFBQSxRQUdJLE1BQUEsRUFBUSxxQkFIWjtPQVhhLEVBbUJiO0FBQUEsUUFDSSxJQUFBLEVBQU0sUUFEVjtBQUFBLFFBRUksVUFBQSxFQUFZLENBQUMsU0FBRCxFQUFZLE9BQVosQ0FGaEI7QUFBQSxRQUdJLE1BQUEsRUFBUSxxQkFIWjtPQW5CYTtLQVBqQixDQUFBO0FBQUEsSUFvQ0EsV0FBQSxHQUFjLEVBcENkLENBQUE7QUF5Q0EsV0FBTztBQUFBLE1BT0gsSUFBQSxFQUFNLFNBQUMsTUFBRCxFQUFTLFFBQVQsR0FBQTtBQUNGLFlBQUEsNEdBQUE7QUFBQSxRQUFBLGFBQUEsR0FBZ0IsSUFBaEIsQ0FBQTtBQUFBLFFBQ0EsVUFBQSxHQUFhLEVBRGIsQ0FBQTtBQUdBLGFBQUEscURBQUEsR0FBQTtBQUNJLHFDQURDLFlBQUEsTUFBTSxrQkFBQSxZQUFZ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

//# sourceURL=/home/key/.atom/packages/color-picker/lib/modules/SmartVariable.coffee
