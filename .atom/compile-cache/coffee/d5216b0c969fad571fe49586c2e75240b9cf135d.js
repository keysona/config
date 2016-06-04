(function() {
  var CompositeDisposable, Disposable, ElementBuilder, Emitter, Input, InputElement, SearchInput, SearchInputElement, getCharacterForEvent, packageScope, registerElement, searchScope, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('./utils'), registerElement = _ref1.registerElement, getCharacterForEvent = _ref1.getCharacterForEvent, ElementBuilder = _ref1.ElementBuilder;

  packageScope = 'vim-mode-plus';

  Input = (function(_super) {
    __extends(Input, _super);

    function Input() {
      return Input.__super__.constructor.apply(this, arguments);
    }

    ElementBuilder.includeInto(Input);

    Input.prototype.klass = "" + packageScope + "-input";

    Input.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    Input.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    Input.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    Input.prototype.onDidUnfocus = function(fn) {
      return this.emitter.on('did-unfocus', fn);
    };

    Input.prototype.onDidCommand = function(fn) {
      return this.emitter.on('did-command', fn);
    };

    Input.prototype.createdCallback = function() {
      this.className = this.klass;
      this.buildElements();
      this.editor = this.editorElement.getModel();
      this.editor.setMini(true);
      this.emitter = new Emitter;
      this.editor.onDidChange((function(_this) {
        return function() {
          var charsMax, text, _ref2;
          if (_this.finished) {
            return;
          }
          text = _this.editor.getText();
          _this.emitter.emit('did-change', text);
          if ((charsMax = (_ref2 = _this.options) != null ? _ref2.charsMax : void 0) && text.length >= _this.options.charsMax) {
            return _this.confirm();
          }
        };
      })(this));
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
      return this;
    };

    Input.prototype.buildElements = function() {
      return this.appendChild(this.editorElement = this.atomTextEditor({
        classList: ['editor', this.klass],
        attribute: {
          mini: ''
        }
      }));
    };

    Input.prototype.initialize = function(vimState) {
      this.vimState = vimState;
      this.vimState.onDidFailToSetTarget((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      return this;
    };

    Input.prototype.destroy = function() {
      var _ref2, _ref3;
      this.editor.destroy();
      if ((_ref2 = this.panel) != null) {
        _ref2.destroy();
      }
      _ref3 = {}, this.editor = _ref3.editor, this.panel = _ref3.panel, this.editorElement = _ref3.editorElement, this.vimState = _ref3.vimState;
      return this.remove();
    };

    Input.prototype.handleEvents = function() {
      return atom.commands.add(this.editorElement, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'blur': (function(_this) {
          return function() {
            if (!_this.finished) {
              return _this.cancel();
            }
          };
        })(this),
        'vim-mode-plus:input-cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
    };

    Input.prototype.focus = function(options) {
      var disposable;
      this.options = options != null ? options : {};
      this.finished = false;
      this.panel.show();
      this.editorElement.focus();
      this.commandSubscriptions = this.handleEvents();
      return disposable = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          disposable.dispose();
          if (!_this.finished) {
            return _this.cancel();
          }
        };
      })(this));
    };

    Input.prototype.unfocus = function() {
      var _ref2, _ref3;
      if ((_ref2 = this.commandSubscriptions) != null) {
        _ref2.dispose();
      }
      this.finished = true;
      this.emitter.emit('did-unfocus');
      atom.workspace.getActivePane().activate();
      this.editor.setText('');
      return (_ref3 = this.panel) != null ? _ref3.hide() : void 0;
    };

    Input.prototype.isVisible = function() {
      var _ref2;
      return (_ref2 = this.panel) != null ? _ref2.isVisible() : void 0;
    };

    Input.prototype.cancel = function() {
      this.emitter.emit('did-cancel');
      return this.unfocus();
    };

    Input.prototype.confirm = function() {
      this.emitter.emit('did-confirm', this.editor.getText());
      return this.unfocus();
    };

    return Input;

  })(HTMLElement);

  searchScope = "vim-mode-plus-search";

  SearchInput = (function(_super) {
    __extends(SearchInput, _super);

    function SearchInput() {
      return SearchInput.__super__.constructor.apply(this, arguments);
    }

    SearchInput.prototype.klass = "" + searchScope + "-container";

    SearchInput.prototype.buildElements = function() {
      this.appendChild(this.optionsContainer = this.div({
        classList: ['options-container']
      })).appendChild(this.regexSearchStatus = this.span({
        classList: ['inline-block-tight', 'btn', 'btn-primary'],
        textContent: '.*'
      }));
      return this.appendChild(this.editorContainer = this.div({
        classList: ['editor-container']
      })).appendChild(this.editorElement = this.atomTextEditor({
        classList: ['editor', searchScope],
        attribute: {
          mini: ''
        }
      }));
    };

    SearchInput.prototype.initialize = function(vimState) {
      this.vimState = vimState;
      SearchInput.__super__.initialize.apply(this, arguments);
      this.options = {};
      this.searchHistory = this.vimState.searchHistory;
      atom.commands.add(this.editorElement, {
        "vim-mode-plus:search-confirm": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "vim-mode-plus:search-cancel": (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        "vim-mode-plus:search-visit-next": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', 'visit-next');
          };
        })(this),
        "vim-mode-plus:search-visit-prev": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', 'visit-prev');
          };
        })(this),
        "vim-mode-plus:search-insert-wild-pattern": (function(_this) {
          return function() {
            return _this.editor.insertText('.*?');
          };
        })(this),
        "vim-mode-plus:search-activate-literal-mode": (function(_this) {
          return function() {
            return _this.activateLiteralMode();
          };
        })(this),
        "vim-mode-plus:search-set-cursor-word": (function(_this) {
          return function() {
            return _this.setCursorWord();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.editor.setText(_this.searchHistory.get('prev'));
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.editor.setText(_this.searchHistory.get('next'));
          };
        })(this)
      });
      return this;
    };

    SearchInput.prototype.setCursorWord = function() {
      return this.editor.setText(this.vimState.editor.getWordUnderCursor());
    };

    SearchInput.prototype.activateLiteralMode = function() {
      var _ref2;
      if (this.editorElement.classList.contains('literal-mode')) {
        return (_ref2 = this.literalModeDeactivator) != null ? _ref2.dispose() : void 0;
      } else {
        this.literalModeDeactivator = new CompositeDisposable();
        this.editorElement.classList.add('literal-mode');
        this.literalModeDeactivator.add(new Disposable((function(_this) {
          return function() {
            _this.editorElement.classList.remove('literal-mode');
            return _this.literalModeDeactivator = null;
          };
        })(this)));
        return this.literalModeDeactivator.add(this.editor.onDidChange((function(_this) {
          return function() {
            return _this.literalModeDeactivator.dispose();
          };
        })(this)));
      }
    };

    SearchInput.prototype.updateOptionSettings = function(_arg) {
      var useRegexp;
      useRegexp = (_arg != null ? _arg : {}).useRegexp;
      return this.regexSearchStatus.classList.toggle('btn-primary', useRegexp);
    };

    SearchInput.prototype.focus = function(_arg) {
      var backwards;
      backwards = _arg.backwards;
      if (backwards) {
        this.editorElement.classList.add('backwards');
      }
      return SearchInput.__super__.focus.call(this, {});
    };

    SearchInput.prototype.unfocus = function() {
      this.editorElement.classList.remove('backwards');
      this.regexSearchStatus.classList.add('btn-primary');
      return SearchInput.__super__.unfocus.apply(this, arguments);
    };

    return SearchInput;

  })(Input);

  InputElement = registerElement('vim-mode-plus-input', {
    prototype: Input.prototype
  });

  SearchInputElement = registerElement('vim-mode-plus-search-input', {
    prototype: SearchInput.prototype
  });

  module.exports = {
    InputElement: InputElement,
    SearchInputElement: SearchInputElement
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2lucHV0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2TEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQyxlQUFBLE9BQUQsRUFBVSxrQkFBQSxVQUFWLEVBQXNCLDJCQUFBLG1CQUF0QixDQUFBOztBQUFBLEVBQ0EsUUFBMEQsT0FBQSxDQUFRLFNBQVIsQ0FBMUQsRUFBQyx3QkFBQSxlQUFELEVBQWtCLDZCQUFBLG9CQUFsQixFQUF3Qyx1QkFBQSxjQUR4QyxDQUFBOztBQUFBLEVBRUEsWUFBQSxHQUFlLGVBRmYsQ0FBQTs7QUFBQSxFQU1NO0FBQ0osNEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBYyxDQUFDLFdBQWYsQ0FBMkIsS0FBM0IsQ0FBQSxDQUFBOztBQUFBLG9CQUNBLEtBQUEsR0FBTyxFQUFBLEdBQUcsWUFBSCxHQUFnQixRQUR2QixDQUFBOztBQUFBLG9CQUdBLFdBQUEsR0FBYSxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUIsRUFBUjtJQUFBLENBSGIsQ0FBQTs7QUFBQSxvQkFJQSxZQUFBLEdBQWMsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCLEVBQVI7SUFBQSxDQUpkLENBQUE7O0FBQUEsb0JBS0EsV0FBQSxHQUFhLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQixFQUFSO0lBQUEsQ0FMYixDQUFBOztBQUFBLG9CQU1BLFlBQUEsR0FBYyxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0IsRUFBUjtJQUFBLENBTmQsQ0FBQTs7QUFBQSxvQkFPQSxZQUFBLEdBQWMsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCLEVBQVI7SUFBQSxDQVBkLENBQUE7O0FBQUEsb0JBU0EsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDZixNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLEtBQWQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQUEsQ0FGVixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FIQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUxYLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2xCLGNBQUEscUJBQUE7QUFBQSxVQUFBLElBQVUsS0FBQyxDQUFBLFFBQVg7QUFBQSxrQkFBQSxDQUFBO1dBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxLQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQURQLENBQUE7QUFBQSxVQUVBLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsRUFBNEIsSUFBNUIsQ0FGQSxDQUFBO0FBR0EsVUFBQSxJQUFHLENBQUMsUUFBQSwwQ0FBbUIsQ0FBRSxpQkFBdEIsQ0FBQSxJQUFvQyxJQUFJLENBQUMsTUFBTCxJQUFlLEtBQUMsQ0FBQSxPQUFPLENBQUMsUUFBL0Q7bUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQURGO1dBSmtCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FQQSxDQUFBO0FBQUEsTUFhQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxRQUFZLE9BQUEsRUFBUyxLQUFyQjtPQUE5QixDQWJULENBQUE7YUFjQSxLQWZlO0lBQUEsQ0FUakIsQ0FBQTs7QUFBQSxvQkEwQkEsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUNiLElBQUMsQ0FBQSxXQUFELENBQ0UsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLGNBQUQsQ0FDZjtBQUFBLFFBQUEsU0FBQSxFQUFXLENBQUMsUUFBRCxFQUFXLElBQUMsQ0FBQSxLQUFaLENBQVg7QUFBQSxRQUNBLFNBQUEsRUFBVztBQUFBLFVBQUMsSUFBQSxFQUFNLEVBQVA7U0FEWDtPQURlLENBRG5CLEVBRGE7SUFBQSxDQTFCZixDQUFBOztBQUFBLG9CQWlDQSxVQUFBLEdBQVksU0FBRSxRQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxXQUFBLFFBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxvQkFBVixDQUErQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUM3QixLQUFDLENBQUEsTUFBRCxDQUFBLEVBRDZCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0IsQ0FBQSxDQUFBO2FBRUEsS0FIVTtJQUFBLENBakNaLENBQUE7O0FBQUEsb0JBc0NBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLFlBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBQUEsQ0FBQTs7YUFDTSxDQUFFLE9BQVIsQ0FBQTtPQURBO0FBQUEsTUFFQSxRQUErQyxFQUEvQyxFQUFDLElBQUMsQ0FBQSxlQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsY0FBQSxLQUFYLEVBQWtCLElBQUMsQ0FBQSxzQkFBQSxhQUFuQixFQUFrQyxJQUFDLENBQUEsaUJBQUEsUUFGbkMsQ0FBQTthQUdBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFKTztJQUFBLENBdENULENBQUE7O0FBQUEsb0JBNENBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLGFBQW5CLEVBQ0U7QUFBQSxRQUFBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7QUFBQSxRQUNBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURmO0FBQUEsUUFFQSxNQUFBLEVBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFBRyxZQUFBLElBQUEsQ0FBQSxLQUFrQixDQUFBLFFBQWxCO3FCQUFBLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBQTthQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGUjtBQUFBLFFBR0EsNEJBQUEsRUFBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIOUI7T0FERixFQURZO0lBQUEsQ0E1Q2QsQ0FBQTs7QUFBQSxvQkFtREEsS0FBQSxHQUFPLFNBQUUsT0FBRixHQUFBO0FBQ0wsVUFBQSxVQUFBO0FBQUEsTUFETSxJQUFDLENBQUEsNEJBQUEsVUFBUSxFQUNmLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBWixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFBLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FIeEIsQ0FBQTthQU1BLFVBQUEsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUFmLENBQXlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEQsVUFBQSxVQUFVLENBQUMsT0FBWCxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsSUFBQSxDQUFBLEtBQWtCLENBQUEsUUFBbEI7bUJBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFBO1dBRm9EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekMsRUFQUjtJQUFBLENBbkRQLENBQUE7O0FBQUEsb0JBOERBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLFlBQUE7O2FBQXFCLENBQUUsT0FBdkIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBRFosQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsYUFBZCxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQThCLENBQUMsUUFBL0IsQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixFQUFoQixDQUpBLENBQUE7aURBS00sQ0FBRSxJQUFSLENBQUEsV0FOTztJQUFBLENBOURULENBQUE7O0FBQUEsb0JBc0VBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLEtBQUE7aURBQU0sQ0FBRSxTQUFSLENBQUEsV0FEUztJQUFBLENBdEVYLENBQUE7O0FBQUEsb0JBeUVBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQUZNO0lBQUEsQ0F6RVIsQ0FBQTs7QUFBQSxvQkE2RUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsYUFBZCxFQUE2QixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxDQUE3QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLEVBRk87SUFBQSxDQTdFVCxDQUFBOztpQkFBQTs7S0FEa0IsWUFOcEIsQ0FBQTs7QUFBQSxFQTBGQSxXQUFBLEdBQWMsc0JBMUZkLENBQUE7O0FBQUEsRUEyRk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMEJBQUEsS0FBQSxHQUFPLEVBQUEsR0FBRyxXQUFILEdBQWUsWUFBdEIsQ0FBQTs7QUFBQSwwQkFFQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUNFLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsR0FBRCxDQUNsQjtBQUFBLFFBQUEsU0FBQSxFQUFXLENBQUMsbUJBQUQsQ0FBWDtPQURrQixDQUR0QixDQUdDLENBQUMsV0FIRixDQUlFLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFDLENBQUEsSUFBRCxDQUNuQjtBQUFBLFFBQUEsU0FBQSxFQUFXLENBQUMsb0JBQUQsRUFBdUIsS0FBdkIsRUFBOEIsYUFBOUIsQ0FBWDtBQUFBLFFBQ0EsV0FBQSxFQUFhLElBRGI7T0FEbUIsQ0FKdkIsQ0FBQSxDQUFBO2FBU0EsSUFBQyxDQUFBLFdBQUQsQ0FDRSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsR0FBRCxDQUNqQjtBQUFBLFFBQUEsU0FBQSxFQUFXLENBQUMsa0JBQUQsQ0FBWDtPQURpQixDQURyQixDQUdDLENBQUMsV0FIRixDQUlFLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxjQUFELENBQ2Y7QUFBQSxRQUFBLFNBQUEsRUFBVyxDQUFDLFFBQUQsRUFBVyxXQUFYLENBQVg7QUFBQSxRQUNBLFNBQUEsRUFBVztBQUFBLFVBQUMsSUFBQSxFQUFNLEVBQVA7U0FEWDtPQURlLENBSm5CLEVBVmE7SUFBQSxDQUZmLENBQUE7O0FBQUEsMEJBcUJBLFVBQUEsR0FBWSxTQUFFLFFBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLFdBQUEsUUFDWixDQUFBO0FBQUEsTUFBQSw2Q0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQURYLENBQUE7QUFBQSxNQUVDLElBQUMsQ0FBQSxnQkFBaUIsSUFBQyxDQUFBLFNBQWxCLGFBRkYsQ0FBQTtBQUFBLE1BSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxhQUFuQixFQUNFO0FBQUEsUUFBQSw4QkFBQSxFQUFnQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQztBQUFBLFFBQ0EsNkJBQUEsRUFBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEL0I7QUFBQSxRQUVBLGlDQUFBLEVBQW1DLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGFBQWQsRUFBNkIsWUFBN0IsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRm5DO0FBQUEsUUFHQSxpQ0FBQSxFQUFtQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkLEVBQTZCLFlBQTdCLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhuQztBQUFBLFFBSUEsMENBQUEsRUFBNEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLEtBQW5CLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUo1QztBQUFBLFFBS0EsNENBQUEsRUFBOEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLG1CQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTDlDO0FBQUEsUUFNQSxzQ0FBQSxFQUF3QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU54QztBQUFBLFFBT0EsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsS0FBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLE1BQW5CLENBQWhCLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVBoQjtBQUFBLFFBUUEsZ0JBQUEsRUFBa0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWdCLEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixNQUFuQixDQUFoQixFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSbEI7T0FERixDQUpBLENBQUE7YUFlQSxLQWhCVTtJQUFBLENBckJaLENBQUE7O0FBQUEsMEJBdUNBLGFBQUEsR0FBZSxTQUFBLEdBQUE7YUFDYixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFNLENBQUMsa0JBQWpCLENBQUEsQ0FBaEIsRUFEYTtJQUFBLENBdkNmLENBQUE7O0FBQUEsMEJBMENBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUNuQixVQUFBLEtBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBekIsQ0FBa0MsY0FBbEMsQ0FBSDtvRUFDeUIsQ0FBRSxPQUF6QixDQUFBLFdBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxJQUFDLENBQUEsc0JBQUQsR0FBOEIsSUFBQSxtQkFBQSxDQUFBLENBQTlCLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLGNBQTdCLENBREEsQ0FBQTtBQUFBLFFBR0EsSUFBQyxDQUFBLHNCQUFzQixDQUFDLEdBQXhCLENBQWdDLElBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ3pDLFlBQUEsS0FBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsY0FBaEMsQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxzQkFBRCxHQUEwQixLQUZlO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxDQUFoQyxDQUhBLENBQUE7ZUFPQSxJQUFDLENBQUEsc0JBQXNCLENBQUMsR0FBeEIsQ0FBNEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUM5QyxLQUFDLENBQUEsc0JBQXNCLENBQUMsT0FBeEIsQ0FBQSxFQUQ4QztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBQTVCLEVBVkY7T0FEbUI7SUFBQSxDQTFDckIsQ0FBQTs7QUFBQSwwQkF3REEsb0JBQUEsR0FBc0IsU0FBQyxJQUFELEdBQUE7QUFDcEIsVUFBQSxTQUFBO0FBQUEsTUFEc0IsNEJBQUQsT0FBWSxJQUFYLFNBQ3RCLENBQUE7YUFBQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsU0FBUyxDQUFDLE1BQTdCLENBQW9DLGFBQXBDLEVBQW1ELFNBQW5ELEVBRG9CO0lBQUEsQ0F4RHRCLENBQUE7O0FBQUEsMEJBMkRBLEtBQUEsR0FBTyxTQUFDLElBQUQsR0FBQTtBQUNMLFVBQUEsU0FBQTtBQUFBLE1BRE8sWUFBRCxLQUFDLFNBQ1AsQ0FBQTtBQUFBLE1BQUEsSUFBNkMsU0FBN0M7QUFBQSxRQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLFdBQTdCLENBQUEsQ0FBQTtPQUFBO2FBQ0EsdUNBQU0sRUFBTixFQUZLO0lBQUEsQ0EzRFAsQ0FBQTs7QUFBQSwwQkErREEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsV0FBaEMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEdBQTdCLENBQWlDLGFBQWpDLENBREEsQ0FBQTthQUVBLDBDQUFBLFNBQUEsRUFITztJQUFBLENBL0RULENBQUE7O3VCQUFBOztLQUR3QixNQTNGMUIsQ0FBQTs7QUFBQSxFQWdLQSxZQUFBLEdBQWUsZUFBQSxDQUFnQixxQkFBaEIsRUFDYjtBQUFBLElBQUEsU0FBQSxFQUFXLEtBQUssQ0FBQyxTQUFqQjtHQURhLENBaEtmLENBQUE7O0FBQUEsRUFtS0Esa0JBQUEsR0FBcUIsZUFBQSxDQUFnQiw0QkFBaEIsRUFDbkI7QUFBQSxJQUFBLFNBQUEsRUFBVyxXQUFXLENBQUMsU0FBdkI7R0FEbUIsQ0FuS3JCLENBQUE7O0FBQUEsRUFzS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUNmLGNBQUEsWUFEZTtBQUFBLElBQ0Qsb0JBQUEsa0JBREM7R0F0S2pCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/input.coffee
