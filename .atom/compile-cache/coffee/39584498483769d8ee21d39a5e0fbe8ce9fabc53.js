(function() {
  var Base, excludeProperties, extractBetween, formatKeymaps, formatReport, genTableOfContent, generateIntrospectionReport, getAncestors, getCommandFromClass, getKeyBindingForCommand, getParent, inspectFunction, inspectInstance, inspectObject, packageName, report, sortByAncesstor, util, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  _ = require('underscore-plus');

  Base = require('./base');

  _ref = require('./utils'), getParent = _ref.getParent, getAncestors = _ref.getAncestors, getKeyBindingForCommand = _ref.getKeyBindingForCommand;

  packageName = 'vim-mode-plus';

  extractBetween = function(str, s1, s2) {
    return str.substring(str.indexOf(s1) + 1, str.lastIndexOf(s2));
  };

  inspectFunction = function(fn, name) {
    var args, argumentsSignature, defaultConstructor, fnArgs, fnBody, fnString, line, m, superAsIs, superBase, superSignature, superWithModify, _i, _len;
    superBase = _.escapeRegExp("" + fn.name + ".__super__." + name);
    superAsIs = superBase + _.escapeRegExp(".apply(this, arguments);");
    defaultConstructor = '^return ' + superAsIs;
    superWithModify = superBase + '\\.call\\((.*)\\)';
    fnString = fn.toString();
    fnBody = extractBetween(fnString, '{', '}').split("\n").map(function(e) {
      return e.trim();
    });
    fnArgs = fnString.split("\n")[0].match(/\((.*)\)/)[1].split(/,\s*/g);
    fnArgs = fnArgs.map(function(arg) {
      var iVarAssign;
      iVarAssign = '^' + _.escapeRegExp("this." + arg + " = " + arg + ";") + '$';
      if (_.detect(fnBody, function(line) {
        return line.match(iVarAssign);
      })) {
        return '@' + arg;
      } else {
        return arg;
      }
    });
    argumentsSignature = '(' + fnArgs.join(', ') + ')';
    superSignature = null;
    for (_i = 0, _len = fnBody.length; _i < _len; _i++) {
      line = fnBody[_i];
      if (name === 'constructor' && line.match(defaultConstructor)) {
        superSignature = 'default';
      } else if (line.match(superAsIs)) {
        superSignature = 'super';
      } else if (m = line.match(superWithModify)) {
        args = m[1].replace(/this,?\s*/, '');
        args = args.replace(/this\./g, '@');
        superSignature = "super(" + args + ")";
      }
      if (superSignature) {
        break;
      }
    }
    return {
      argumentsSignature: argumentsSignature,
      superSignature: superSignature
    };
  };

  excludeProperties = ['__super__'];

  inspectObject = function(obj, options, prototype) {
    var ancesstors, argumentsSignature, excludeList, isOverridden, prefix, prop, results, s, superSignature, value, _ref1, _ref2;
    if (options == null) {
      options = {};
    }
    if (prototype == null) {
      prototype = false;
    }
    excludeList = excludeProperties.concat((_ref1 = options.excludeProperties) != null ? _ref1 : []);
    if (options.depth == null) {
      options.depth = 1;
    }
    prefix = '@';
    if (prototype) {
      obj = obj.prototype;
      prefix = '::';
    }
    ancesstors = getAncestors(obj.constructor);
    ancesstors.shift();
    results = [];
    for (prop in obj) {
      if (!__hasProp.call(obj, prop)) continue;
      value = obj[prop];
      if (!(__indexOf.call(excludeList, prop) < 0)) {
        continue;
      }
      s = "- " + prefix + prop;
      if (value instanceof options.recursiveInspect) {
        s += ":\n" + (inspectInstance(value, options));
      } else if (_.isFunction(value)) {
        _ref2 = inspectFunction(value, prop), argumentsSignature = _ref2.argumentsSignature, superSignature = _ref2.superSignature;
        if ((prop === 'constructor') && (superSignature === 'default')) {
          continue;
        }
        s += "`" + argumentsSignature + "`";
        if (superSignature != null) {
          s += ": `" + superSignature + "`";
        }
      } else {
        s += ": ```" + (util.inspect(value, options)) + "```";
      }
      isOverridden = _.detect(ancesstors, function(ancestor) {
        return ancestor.prototype.hasOwnProperty(prop);
      });
      if (isOverridden) {
        s += ": **Overridden**";
      }
      results.push(s);
    }
    if (!results.length) {
      return null;
    }
    return results.join('\n');
  };

  report = function(obj, options) {
    var name;
    if (options == null) {
      options = {};
    }
    name = obj.name;
    return {
      name: name,
      ancesstorsNames: _.pluck(getAncestors(obj), 'name'),
      command: getCommandFromClass(obj),
      instance: inspectObject(obj, options),
      prototype: inspectObject(obj, options, true)
    };
  };

  sortByAncesstor = function(list) {
    var compare, mapped;
    mapped = list.map(function(obj, i) {
      return {
        index: i,
        value: obj.ancesstorsNames.slice().reverse()
      };
    });
    compare = function(v1, v2) {
      var a, b;
      a = v1.value[0];
      b = v2.value[0];
      switch (false) {
        case !((a === void 0) && (b === void 0)):
          return 0;
        case a !== void 0:
          return -1;
        case b !== void 0:
          return 1;
        case !(a < b):
          return -1;
        case !(a > b):
          return 1;
        default:
          a = {
            index: v1.index,
            value: v1.value.slice(1)
          };
          b = {
            index: v2.index,
            value: v2.value.slice(1)
          };
          return compare(a, b);
      }
    };
    return mapped.sort(compare).map(function(e) {
      return list[e.index];
    });
  };

  genTableOfContent = function(obj) {
    var ancesstorsNames, indent, indentLevel, link, name, s;
    name = obj.name, ancesstorsNames = obj.ancesstorsNames;
    indentLevel = ancesstorsNames.length - 1;
    indent = _.multiplyString('  ', indentLevel);
    link = ancesstorsNames.slice(0, 2).join('--').toLowerCase();
    s = "" + indent + "- [" + name + "](#" + link + ")";
    if (obj.virtual != null) {
      s += ' *Not exported*';
    }
    return s;
  };

  generateIntrospectionReport = function(klasses, options) {
    var ancesstors, body, command, content, date, header, instance, keymaps, klass, pack, prototype, result, results, s, toc, version, _i, _len;
    pack = atom.packages.getActivePackage(packageName);
    version = pack.metadata.version;
    results = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = klasses.length; _i < _len; _i++) {
        klass = klasses[_i];
        _results.push(report(klass, options));
      }
      return _results;
    })();
    results = sortByAncesstor(results);
    toc = results.map(function(e) {
      return genTableOfContent(e);
    }).join('\n');
    body = [];
    for (_i = 0, _len = results.length; _i < _len; _i++) {
      result = results[_i];
      ancesstors = result.ancesstorsNames.slice(0, 2);
      header = "#" + (_.multiplyString('#', ancesstors.length)) + " " + (ancesstors.join(" < "));
      s = [];
      s.push(header);
      command = result.command, instance = result.instance, prototype = result.prototype;
      if (command != null) {
        s.push("- command: `" + command + "`");
        keymaps = getKeyBindingForCommand(command, {
          packageName: 'vim-mode-plus'
        });
        if (keymaps != null) {
          s.push(formatKeymaps(keymaps));
        }
      }
      if (instance != null) {
        s.push(instance);
      }
      if (prototype != null) {
        s.push(prototype);
      }
      body.push(s.join("\n"));
    }
    date = new Date().toISOString();
    content = ["" + packageName + " version: " + version + "  \n*generated at " + date + "*", toc, body.join("\n\n")].join("\n\n");
    return atom.workspace.open().then(function(editor) {
      editor.setText(content);
      return editor.setGrammar(atom.grammars.grammarForScopeName('source.gfm'));
    });
  };

  formatKeymaps = function(keymaps) {
    var keymap, keystrokes, s, selector, _i, _len;
    s = [];
    s.push('  - keymaps');
    for (_i = 0, _len = keymaps.length; _i < _len; _i++) {
      keymap = keymaps[_i];
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/(`|_)/g, '\\$1');
      s.push("    - `" + selector + "`: <kbd>" + keystrokes + "</kbd>");
    }
    return s.join("\n");
  };

  formatReport = function(report) {
    var ancesstorsNames, instance, prototype, s;
    instance = report.instance, prototype = report.prototype, ancesstorsNames = report.ancesstorsNames;
    s = [];
    s.push("# " + (ancesstorsNames.join(" < ")));
    if (instance != null) {
      s.push(instance);
    }
    if (prototype != null) {
      s.push(prototype);
    }
    return s.join("\n");
  };

  inspectInstance = function(obj, options) {
    var indent, rep, _ref1;
    if (options == null) {
      options = {};
    }
    indent = _.multiplyString(' ', (_ref1 = options.indent) != null ? _ref1 : 0);
    rep = report(obj.constructor, options);
    return ["## " + obj + ": " + (rep.ancesstorsNames.slice(0, 2).join(" < ")), inspectObject(obj, options), formatReport(rep)].filter(function(e) {
      return e;
    }).join('\n').split('\n').map(function(e) {
      return indent + e;
    }).join('\n');
  };

  getCommandFromClass = function(klass) {
    if (klass.isCommand()) {
      return klass.getCommandName();
    } else {
      return null;
    }
  };

  module.exports = {
    generateIntrospectionReport: generateIntrospectionReport,
    inspectInstance: inspectInstance
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2ludHJvc3BlY3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlTQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsT0FBcUQsT0FBQSxDQUFRLFNBQVIsQ0FBckQsRUFBQyxpQkFBQSxTQUFELEVBQVksb0JBQUEsWUFBWixFQUEwQiwrQkFBQSx1QkFIMUIsQ0FBQTs7QUFBQSxFQUtBLFdBQUEsR0FBYyxlQUxkLENBQUE7O0FBQUEsRUFPQSxjQUFBLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEVBQU4sRUFBVSxFQUFWLEdBQUE7V0FDZixHQUFHLENBQUMsU0FBSixDQUFjLEdBQUcsQ0FBQyxPQUFKLENBQVksRUFBWixDQUFBLEdBQWdCLENBQTlCLEVBQWlDLEdBQUcsQ0FBQyxXQUFKLENBQWdCLEVBQWhCLENBQWpDLEVBRGU7RUFBQSxDQVBqQixDQUFBOztBQUFBLEVBVUEsZUFBQSxHQUFrQixTQUFDLEVBQUQsRUFBSyxJQUFMLEdBQUE7QUFhaEIsUUFBQSxnSkFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLENBQUMsQ0FBQyxZQUFGLENBQWUsRUFBQSxHQUFHLEVBQUUsQ0FBQyxJQUFOLEdBQVcsYUFBWCxHQUF3QixJQUF2QyxDQUFaLENBQUE7QUFBQSxJQUNBLFNBQUEsR0FBWSxTQUFBLEdBQVksQ0FBQyxDQUFDLFlBQUYsQ0FBZSwwQkFBZixDQUR4QixDQUFBO0FBQUEsSUFFQSxrQkFBQSxHQUFx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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/introspection.coffee
