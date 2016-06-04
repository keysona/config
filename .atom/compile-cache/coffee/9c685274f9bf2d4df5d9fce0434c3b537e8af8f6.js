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
      if (this.options.hide != null) {
        if (!this.mounted) {
          this.vimState.editorElement.parentNode.parentNode.appendChild(this);
          this.mounted = true;
        }
      } else {
        if (this.panel == null) {
          this.panel = atom.workspace.addBottomPanel({
            item: this,
            visible: false
          });
        }
        this.panel.show();
      }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2lucHV0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2TEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQyxlQUFBLE9BQUQsRUFBVSxrQkFBQSxVQUFWLEVBQXNCLDJCQUFBLG1CQUF0QixDQUFBOztBQUFBLEVBQ0EsUUFBMEQsT0FBQSxDQUFRLFNBQVIsQ0FBMUQsRUFBQyx3QkFBQSxlQUFELEVBQWtCLDZCQUFBLG9CQUFsQixFQUF3Qyx1QkFBQSxjQUR4QyxDQUFBOztBQUFBLEVBRUEsWUFBQSxHQUFlLGVBRmYsQ0FBQTs7QUFBQSxFQU1NO0FBQ0osNEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBYyxDQUFDLFdBQWYsQ0FBMkIsS0FBM0IsQ0FBQSxDQUFBOztBQUFBLG9CQUNBLEtBQUEsR0FBTyxFQUFBLEdBQUcsWUFBSCxHQUFnQixRQUR2QixDQUFBOztBQUFBLG9CQUdBLFdBQUEsR0FBYSxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUIsRUFBUjtJQUFBLENBSGIsQ0FBQTs7QUFBQSxvQkFJQSxZQUFBLEdBQWMsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCLEVBQVI7SUFBQSxDQUpkLENBQUE7O0FBQUEsb0JBS0EsV0FBQSxHQUFhLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQixFQUFSO0lBQUEsQ0FMYixDQUFBOztBQUFBLG9CQU1BLFlBQUEsR0FB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/input.coffee
