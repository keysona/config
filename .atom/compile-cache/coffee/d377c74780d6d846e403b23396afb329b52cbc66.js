(function() {
  var Disposable, KeymapManager, Point, Range, SpecError, TextData, VimEditor, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, characterForKeyboardEvent, dispatch, getHiddenInputElementForEditor, getView, getVimState, inspect, isPoint, isRange, keydown, newKeydown, newKeystroke, normalizeKeystrokes, supportedModeClass, swrap, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform, _, _keystroke, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, Disposable = _ref.Disposable;

  inspect = require('util').inspect;

  swrap = require('../lib/selection-wrapper');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.config.resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  SpecError = (function() {
    function SpecError(message) {
      this.message = message;
      this.name = 'SpecError';
    }

    return SpecError;

  })();

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  withMockPlatform = function(target, platform, fn) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    wrapper.appendChild(target);
    fn();
    return target.parentNode.removeChild(target);
  };

  buildKeydownEvent = function(key, options) {
    return KeymapManager.buildKeydownEvent(key, options);
  };

  buildKeydownEventFromKeystroke = function(keystroke, target) {
    var key, modifier, options, part, parts, _i, _len;
    modifier = ['ctrl', 'alt', 'shift', 'cmd'];
    parts = keystroke === '-' ? ['-'] : keystroke.split('-');
    options = {
      target: target
    };
    key = null;
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      if (__indexOf.call(modifier, part) >= 0) {
        options[part] = true;
      } else {
        key = part;
      }
    }
    if (key === 'space') {
      key = ' ';
    }
    return buildKeydownEvent(key, options);
  };

  buildTextInputEvent = function(key) {
    var event, eventArgs;
    eventArgs = [true, true, window, key];
    event = document.createEvent('TextEvent');
    event.initTextEvent.apply(event, ["textInput"].concat(__slice.call(eventArgs)));
    return event;
  };

  getHiddenInputElementForEditor = function(editor) {
    var editorElement;
    editorElement = atom.views.getView(editor);
    return editorElement.component.hiddenInputComponent.getDomNode();
  };

  characterForKeyboardEvent = function(event) {
    var key;
    if (!(event.ctrlKey || event.altKey || event.metaKey)) {
      if (key = atom.keymaps.keystrokeForKeyboardEvent(event)) {
        if (key === 'space') {
          key = ' ';
        }
        if (key.startsWith('shift-')) {
          key = key[key.length - 1];
        }
        if (key.length === 1) {
          return key;
        }
      }
    }
  };

  newKeydown = function(key, target) {
    var event;
    if (target == null) {
      target = document.activeElement;
    }
    event = buildKeydownEventFromKeystroke(key, target);
    return atom.keymaps.handleKeyboardEvent(event);
  };

  newKeystroke = function(keystrokes, target) {
    var key, _i, _len, _ref1, _results;
    _ref1 = normalizeKeystrokes(keystrokes).split(/\s+/);
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      key = _ref1[_i];
      _results.push(newKeydown(key, target));
    }
    return _results;
  };

  keydown = function(key, options) {
    var event;
    event = buildKeydownEvent(key, options);
    return atom.keymaps.handleKeyboardEvent(event);
  };

  _keystroke = function(keys, event) {
    var key, _i, _len, _ref1, _results;
    if (keys === 'escape' || keys === 'backspace') {
      return keydown(keys, event);
    } else {
      _ref1 = keys.split('');
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        key = _ref1[_i];
        if (key.match(/[A-Z]/)) {
          event.shift = true;
        } else {
          delete event.shift;
        }
        _results.push(keydown(key, event));
      }
      return _results;
    }
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, _ref1;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _ref1 = [], editor = _ref1[0], file = _ref1[1], callback = _ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage('vim-mode-plus');
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var main, vimState;
      main = atom.packages.getActivePackage('vim-mode-plus').mainModule;
      vimState = main.getEditorState(editor);
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(rawData) {
      this.rawData = rawData;
      this.lines = this.rawData.split("\n");
    }

    TextData.prototype.getLines = function(lines, _arg) {
      var chomp, line, text;
      chomp = (_arg != null ? _arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          _results.push(this.lines[line]);
        }
        return _results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getRaw = function() {
      return this.rawData;
    };

    return TextData;

  })();

  VimEditor = (function() {
    var ensureOptionsOrdered, setOptionsOrdered;

    function VimEditor(vimState) {
      var _ref1;
      this.vimState = vimState;
      this.keystroke = __bind(this.keystroke, this);
      this.ensure = __bind(this.ensure, this);
      this.set = __bind(this.set, this);
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(__slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new SpecError("" + message + ": " + (inspect(invalidOptions)));
      }
    };

    setOptionsOrdered = ['text', 'grammar', 'cursor', 'cursorBuffer', 'addCursor', 'addCursorBuffer', 'register', 'selectedBufferRange'];

    VimEditor.prototype.set = function(options) {
      var method, name, _i, _len, _results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      _results = [];
      for (_i = 0, _len = setOptionsOrdered.length; _i < _len; _i++) {
        name = setOptionsOrdered[_i];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        _results.push(this[method](options[name]));
      }
      return _results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var point, _i, _len, _results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        _results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setCursorBuffer = function(points) {
      var point, _i, _len, _results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        _results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var point, _i, _len, _ref1, _results;
      _ref1 = toArrayOfPoint(points);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        point = _ref1[_i];
        _results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setAddCursorBuffer = function(points) {
      var point, _i, _len, _ref1, _results;
      _ref1 = toArrayOfPoint(points);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        point = _ref1[_i];
        _results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return _results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, value, _results;
      _results = [];
      for (name in register) {
        value = register[name];
        _results.push(this.vimState.register.set(name, value));
      }
      return _results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'selectedText', 'selectedTextOrdered', 'cursor', 'cursorBuffer', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'characterwiseHead', 'scrollTop', 'mode'];

    VimEditor.prototype.ensure = function() {
      var args, keystroke, method, name, options, _i, _len, _results;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          options = args[0];
          break;
        case 2:
          keystroke = args[0], options = args[1];
      }
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      if (!_.isEmpty(keystroke)) {
        this.keystroke(keystroke);
      }
      _results = [];
      for (_i = 0, _len = ensureOptionsOrdered.length; _i < _len; _i++) {
        name = ensureOptionsOrdered[_i];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        _results.push(this[method](options[name]));
      }
      return _results;
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          s = selections[_i];
          _results.push(s.getText());
        }
        return _results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorBuffer = function(points) {
      var actual;
      actual = this.editor.getCursorBufferPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var ensure, name, property, reg, selection, _results, _value;
      _results = [];
      for (name in register) {
        ensure = register[name];
        selection = ensure.selection;
        delete ensure.selection;
        reg = this.vimState.register.get(name, selection);
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            _results1.push(expect(reg[property]).toEqual(_value));
          }
          return _results1;
        })());
      }
      return _results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          s = selections[_i];
          _results.push(fn(s));
        }
        return _results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual;
      actual = this.editor.getLastSelection().isReversed();
      return expect(actual).toBe(reversed);
    };

    VimEditor.prototype.ensureCharacterwiseHead = function(points) {
      var actual, s;
      actual = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.editor.getSelections();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          s = _ref1[_i];
          _results.push(swrap(s).getCharacterwiseHeadPosition());
        }
        return _results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var m, shouldNotContainClasses, _i, _j, _len, _len1, _ref1, _results;
      mode = toArray(mode);
      expect((_ref1 = this.vimState).isMode.apply(_ref1, mode)).toBe(true);
      mode[0] = "" + mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (_i = 0, _len = mode.length; _i < _len; _i++) {
        m = mode[_i];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      _results = [];
      for (_j = 0, _len1 = shouldNotContainClasses.length; _j < _len1; _j++) {
        m = shouldNotContainClasses[_j];
        _results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return _results;
    };

    VimEditor.prototype.keystroke = function(keys, options) {
      var finished, k, target, _i, _len, _ref1, _results;
      if (options == null) {
        options = {};
      }
      if (options.waitsForFinish) {
        finished = false;
        this.vimState.onDidFinishOperation(function() {
          return finished = true;
        });
        delete options.waitsForFinish;
        this.keystroke(keys, options);
        waitsFor(function() {
          return finished;
        });
        return;
      }
      target = this.editorElement;
      _ref1 = toArray(keys);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        k = _ref1[_i];
        if (_.isString(k)) {
          _results.push(newKeystroke(k, target));
        } else {
          switch (false) {
            case k.input == null:
              _results.push(this.vimState.input.editor.insertText(k.input));
              break;
            case k.search == null:
              this.vimState.searchInput.editor.insertText(k.search);
              _results.push(atom.commands.dispatch(this.vimState.searchInput.editorElement, 'core:confirm'));
              break;
            default:
              _results.push(newKeystroke(k, target));
          }
        }
      }
      return _results;
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData,
    withMockPlatform: withMockPlatform
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zcGVjLWhlbHBlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd2FBQUE7SUFBQTs7c0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUFSLEVBQWUsa0JBQUEsVUFEZixDQUFBOztBQUFBLEVBRUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BRkQsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxPQUFBLENBQVEsMEJBQVIsQ0FIUixDQUFBOztBQUFBLEVBS0EsYUFBQSxHQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLFdBTDdCLENBQUE7O0FBQUEsRUFNQyxzQkFBdUIsT0FBQSxDQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWixHQUEyQix1Q0FBbkMsRUFBdkIsbUJBTkQsQ0FBQTs7QUFBQSxFQVFBLGtCQUFBLEdBQXFCLENBQ25CLGFBRG1CLEVBRW5CLGFBRm1CLEVBR25CLGFBSG1CLEVBSW5CLFNBSm1CLEVBS25CLFVBTG1CLEVBTW5CLFdBTm1CLEVBT25CLGVBUG1CLENBUnJCLENBQUE7O0FBQUEsRUFrQk07QUFDUyxJQUFBLG1CQUFFLE9BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFVBQUEsT0FDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLFdBQVIsQ0FEVztJQUFBLENBQWI7O3FCQUFBOztNQW5CRixDQUFBOztBQUFBLEVBd0JBLE9BQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTtXQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFt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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/spec-helper.coffee
