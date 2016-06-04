(function() {
  var Point, Range, SpecError, TextData, VimEditor, dispatch, dispatchKeyboardEvent, dispatchTextEvent, getView, getVimState, inspect, isPoint, isRange, keydown, mockPlatform, packageName, supportedModeClass, swrap, toArray, toArrayOfPoint, toArrayOfRange, unmockPlatform, _, _keystroke, _ref,
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  inspect = require('util').inspect;

  swrap = require('../lib/selection-wrapper');

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  packageName = 'vim-mode-plus';

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

  mockPlatform = function(editorElement, platform) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    return wrapper.appendChild(editorElement);
  };

  unmockPlatform = function(editorElement) {
    return editorElement.parentNode.removeChild(editorElement);
  };

  dispatchKeyboardEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    e = document.createEvent('KeyboardEvent');
    e.initKeyboardEvent.apply(e, eventArgs);
    if (e.keyCode === 0) {
      Object.defineProperty(e, 'keyCode', {
        get: function() {
          return void 0;
        }
      });
    }
    return target.dispatchEvent(e);
  };

  dispatchTextEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    e = document.createEvent('TextEvent');
    e.initTextEvent.apply(e, eventArgs);
    return target.dispatchEvent(e);
  };

  keydown = function(key, _arg) {
    var alt, canceled, ctrl, element, eventArgs, meta, raw, shift, _ref1;
    _ref1 = _arg != null ? _arg : {}, element = _ref1.element, ctrl = _ref1.ctrl, shift = _ref1.shift, alt = _ref1.alt, meta = _ref1.meta, raw = _ref1.raw;
    if (!(key === 'escape' || (raw != null))) {
      key = "U+" + (key.charCodeAt(0).toString(16));
    }
    if (element == null) {
      element = document.activeElement;
    }
    eventArgs = [false, true, null, key, 0, ctrl, alt, shift, meta];
    canceled = !dispatchKeyboardEvent.apply(null, [element, 'keydown'].concat(__slice.call(eventArgs)));
    dispatchKeyboardEvent.apply(null, [element, 'keypress'].concat(__slice.call(eventArgs)));
    if (!canceled) {
      if (dispatchTextEvent.apply(null, [element, 'textInput'].concat(__slice.call(eventArgs)))) {
        element.value += key;
      }
    }
    return dispatchKeyboardEvent.apply(null, [element, 'keyup'].concat(__slice.call(eventArgs)));
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
      return atom.packages.activatePackage(packageName);
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
      var editorElement, main, pack, vimState;
      pack = atom.packages.getActivePackage(packageName);
      main = pack.mainModule;
      vimState = main.getEditorState(editor);
      editorElement = vimState.editorElement;
      editorElement.addEventListener('keydown', function(e) {
        return atom.keymaps.handleKeyboardEvent(e);
      });
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
      var c, chars, editor, editorElement, element, finished, k, mocked, _i, _j, _len, _len1, _ref1, _ref2;
      if (options == null) {
        options = {};
      }
      element = options.element;
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
      if (element == null) {
        element = this.editorElement;
      }
      mocked = null;
      if (!_.isArray(keys)) {
        keys = [keys];
      }
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        k = keys[_i];
        if (_.isString(k)) {
          _keystroke(k, {
            element: element
          });
        } else {
          switch (false) {
            case k.platform == null:
              mockPlatform(element, k.platform);
              mocked = true;
              break;
            case k.char == null:
              chars = (_ref1 = k.char) === '' || _ref1 === 'escape' ? toArray(k.char) : k.char.split('');
              for (_j = 0, _len1 = chars.length; _j < _len1; _j++) {
                c = chars[_j];
                this.vimState.input.editor.insertText(c);
              }
              break;
            case k.search == null:
              _ref2 = this.vimState.searchInput, editor = _ref2.editor, editorElement = _ref2.editorElement;
              editor.insertText(k.search);
              atom.commands.dispatch(editorElement, 'core:confirm');
              break;
            case k.ctrl == null:
              _keystroke(k.ctrl, {
                ctrl: true,
                element: element
              });
              break;
            case k.cmd == null:
              _keystroke(k.cmd, {
                meta: true,
                element: element
              });
              break;
            case k.raw == null:
              _keystroke(k.raw, {
                raw: true,
                element: element
              });
          }
        }
      }
      if (mocked) {
        return unmockPlatform(element);
      }
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zcGVjLWhlbHBlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOFJBQUE7SUFBQTtzRkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBRFIsQ0FBQTs7QUFBQSxFQUVDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUZELENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDBCQUFSLENBSFIsQ0FBQTs7QUFBQSxFQUtBLGtCQUFBLEdBQXFCLENBQ25CLGFBRG1CLEVBRW5CLGFBRm1CLEVBR25CLGFBSG1CLEVBSW5CLFNBSm1CLEVBS25CLFVBTG1CLEVBTW5CLFdBTm1CLEVBT25CLGVBUG1CLENBTHJCLENBQUE7O0FBQUEsRUFlQSxXQUFBLEdBQWMsZUFmZCxDQUFBOztBQUFBLEVBZ0JNO0FBQ1MsSUFBQSxtQkFBRSxPQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxVQUFBLE9BQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxXQUFSLENBRFc7SUFBQSxDQUFiOztxQkFBQTs7TUFqQkYsQ0FBQTs7QUFBQSxFQXNCQSxPQUFBLEdBQVUsU0FBQyxLQUFELEdBQUE7V0FDUixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsS0FBbkIsRUFEUTtFQUFBLENBdEJWLENBQUE7O0FBQUEsRUF5QkEsUUFBQSxHQUFXLFNBQUMsTUFBRCxFQUFTLE9BQVQsR0FBQTtXQUNULElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixNQUF2QixFQUEr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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/spec-helper.coffee
