(function() {
  var PrettyJSON, formatter,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  formatter = {};

  formatter.space = function(scope) {
    var softTabs, tabLength;
    softTabs = [
      atom.config.get('editor.softTabs', {
        scope: scope
      })
    ];
    tabLength = Number([
      atom.config.get('editor.tabLength', {
        scope: scope
      })
    ]);
    if (softTabs != null) {
      return Array(tabLength + 1).join(' ');
    } else {
      return '\t';
    }
  };

  formatter.stringify = function(obj, scope, sorted) {
    var JSONbig, space, stringify;
    JSONbig = require('json-bigint');
    stringify = require('json-stable-stringify');
    space = formatter.space(scope);
    if (sorted) {
      return stringify(obj, {
        space: space
      });
    } else {
      return JSONbig.stringify(obj, null, space);
    }
  };

  formatter.parseAndValidate = function(text) {
    var JSONbig, error;
    JSONbig = require('json-bigint');
    try {
      return JSONbig.parse(text);
    } catch (_error) {
      error = _error;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: " + error.name + ": " + error.message + " at character " + error.at + " near \"" + error.text + "\"");
      }
      throw error;
    }
  };

  formatter.pretty = function(text, scope, sorted) {
    var error, parsed;
    try {
      parsed = formatter.parseAndValidate(text);
    } catch (_error) {
      error = _error;
      return text;
    }
    return formatter.stringify(parsed, scope, sorted);
  };

  formatter.minify = function(text) {
    var error, uglify;
    try {
      formatter.parseAndValidate(text);
    } catch (_error) {
      error = _error;
      return text;
    }
    uglify = require('jsonminify');
    return uglify(text);
  };

  formatter.jsonify = function(text, scope, sorted) {
    var error, vm;
    vm = require('vm');
    try {
      vm.runInThisContext("newObject = " + text + ";");
    } catch (_error) {
      error = _error;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("" + packageName + ": eval issue: " + error);
      }
      return text;
    }
    return formatter.stringify(newObject, scope, sorted);
  };

  formatter.doEntireFile = function(editor) {
    var grammars, _ref, _ref1;
    grammars = (_ref = atom.config.get('pretty-json.grammars')) != null ? _ref : [];
    return _ref1 = editor.getGrammar().scopeName, __indexOf.call(grammars, _ref1) >= 0;
  };

  PrettyJSON = {
    config: {
      notifyOnParseError: {
        type: 'boolean',
        "default": true
      },
      grammars: {
        type: 'array',
        "default": ['source.json', 'text.plain.null-grammar']
      }
    },
    prettify: function(editor, sorted) {
      if (formatter.doEntireFile(editor)) {
        return editor.setText(formatter.pretty(editor.getText(), editor.getRootScopeDescriptor(), sorted));
      } else {
        return editor.replaceSelectedText({}, function(text) {
          return formatter.pretty(text, ['source.json'], sorted);
        });
      }
    },
    minify: function(editor) {
      if (formatter.doEntireFile(editor)) {
        return editor.setText(formatter.minify(editor.getText()));
      } else {
        return editor.replaceSelectedText({}, function(text) {
          return formatter.minify(text);
        });
      }
    },
    jsonify: function(editor, sorted) {
      if (formatter.doEntireFile(editor)) {
        return editor.setText(formatter.jsonify(editor.getText(), editor.getRootScopeDescriptor(), sorted));
      } else {
        return editor.replaceSelectedText({}, function(text) {
          return formatter.jsonify(text['source.json'], sorted);
        });
      }
    },
    activate: function() {
      return atom.commands.add('atom-workspace', {
        'pretty-json:prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.prettify(editor, false);
          };
        })(this),
        'pretty-json:minify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.minify(editor);
          };
        })(this),
        'pretty-json:sort-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.prettify(editor, true);
          };
        })(this),
        'pretty-json:jsonify-literal-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.jsonify(editor, false);
          };
        })(this),
        'pretty-json:jsonify-literal-and-sort-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.jsonify(editor, true);
          };
        })(this)
      });
    }
  };

  module.exports = PrettyJSON;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ByZXR0eS1qc29uL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTs7QUFBQSxFQUVBLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLFNBQUMsS0FBRCxHQUFBO0FBQ2hCLFFBQUEsbUJBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVztNQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQkFBaEIsRUFBbUM7QUFBQSxRQUFBLEtBQUEsRUFBTyxLQUFQO09BQW5DLENBQUQ7S0FBWCxDQUFBO0FBQUEsSUFDQSxTQUFBLEdBQVksTUFBQSxDQUFPO01BQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQztBQUFBLFFBQUEsS0FBQSxFQUFPLEtBQVA7T0FBcEMsQ0FBRDtLQUFQLENBRFosQ0FBQTtBQUVBLElBQUEsSUFBRyxnQkFBSDtBQUNFLGFBQU8sS0FBQSxDQUFNLFNBQUEsR0FBWSxDQUFsQixDQUFvQixDQUFDLElBQXJCLENBQTBCLEdBQTFCLENBQVAsQ0FERjtLQUFBLE1BQUE7QUFHRSxhQUFPLElBQVAsQ0FIRjtLQUhnQjtFQUFBLENBRmxCLENBQUE7O0FBQUEsRUFVQSxTQUFTLENBQUMsU0FBVixHQUFzQixTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsTUFBYixHQUFBO0FBRXBCLFFBQUEseUJBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsYUFBUixDQUFWLENBQUE7QUFBQSxJQUNBLFNBQUEsR0FBWSxPQUFBLENBQVEsdUJBQVIsQ0FEWixDQUFBO0FBQUEsSUFHQSxLQUFBLEdBQVEsU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsS0FBaEIs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

//# sourceURL=/home/key/.atom/packages/pretty-json/index.coffee