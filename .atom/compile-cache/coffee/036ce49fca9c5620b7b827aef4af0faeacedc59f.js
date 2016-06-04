(function() {
  var PrettyJSON, formatter,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  formatter = {};

  formatter.space = function() {
    var editorSettings;
    editorSettings = atom.config.get('editor');
    if (editorSettings.softTabs != null) {
      return Array(editorSettings.tabLength + 1).join(' ');
    } else {
      return '\t';
    }
  };

  formatter.stringify = function(obj, sorted) {
    var JSONbig, space, stringify;
    JSONbig = require('json-bigint');
    stringify = require('json-stable-stringify');
    space = formatter.space();
    if (sorted) {
      return stringify(obj, {
        space: space
      });
    } else {
      return JSONbig.stringify(obj, null, space);
    }
  };

  formatter.parseAndValidate = function(text) {
    var JSONbig;
    JSONbig = require('json-bigint');
    return JSONbig.parse(text);
  };

  formatter.pretty = function(text, sorted) {
    var error, parsed, space;
    try {
      space = formatter.space();
      parsed = formatter.parseAndValidate(text);
      return formatter.stringify(parsed, sorted);
    } catch (_error) {
      error = _error;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: parse issue: " + error);
      }
      return text;
    }
  };

  formatter.minify = function(text) {
    var error, uglify;
    try {
      uglify = require('jsonminify');
      formatter.parseAndValidate(text);
      return uglify(text);
    } catch (_error) {
      error = _error;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: parse issue: " + error);
      }
      return text;
    }
  };

  formatter.jsonify = function(text, sorted) {
    var error, vm;
    try {
      vm = require('vm');
      vm.runInThisContext("newObject = " + text + ";");
    } catch (_error) {
      error = _error;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: eval issue: " + error);
      }
      text;
    }
    try {
      return formatter.stringify(newObject, sorted);
    } catch (_error) {
      error = _error;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: parse issue: " + error);
      }
      return text;
    }
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
        return editor.setText(formatter.pretty(editor.getText(), sorted));
      } else {
        return editor.replaceSelectedText({}, function(text) {
          return formatter.pretty(text, sorted);
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
        return editor.setText(formatter.jsonify(editor.getText(), sorted));
      } else {
        return editor.replaceSelectedText({}, function(text) {
          return formatter.jsonify(text);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ByZXR0eS1qc29uL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTs7QUFBQSxFQUVBLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLGNBQUE7QUFBQSxJQUFBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLFFBQWhCLENBQWpCLENBQUE7QUFDQSxJQUFBLElBQUcsK0JBQUg7QUFDRSxhQUFPLEtBQUEsQ0FBTSxjQUFjLENBQUMsU0FBZixHQUEyQixDQUFqQyxDQUFtQyxDQUFDLElBQXBDLENBQXlDLEdBQXpDLENBQVAsQ0FERjtLQUFBLE1BQUE7QUFHRSxhQUFPLElBQVAsQ0FIRjtLQUZnQjtFQUFBLENBRmxCLENBQUE7O0FBQUEsRUFTQSxTQUFTLENBQUMsU0FBVixHQUFzQixTQUFDLEdBQUQsRUFBTSxNQUFOLEdBQUE7QUFFcEIsUUFBQSx5QkFBQTtBQUFBLElBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSLENBQVYsQ0FBQTtBQUFBLElBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSx1QkFBUixDQURaLENBQUE7QUFBQSxJQUdBLEtBQUEsR0FBUSxTQUFTLENBQUMsS0FBVixDQUFBLENBSFIsQ0FBQTtBQUlBLElBQUEsSUFBRyxNQUFIO0FBQ0UsYUFBTyxTQUFBLENBQVUsR0FBVixFQUNMO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtPQURLLENBQVAsQ0FERjtLQUFBLE1BQUE7QUFJRSxhQUFPLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEdBQWxCLEVBQXVCLElBQXZCLEVBQTZCLEtBQTdCLENBQVAsQ0FKRjtLQU5vQjtF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

//# sourceURL=/home/key/.atom/packages/pretty-json/index.coffee
