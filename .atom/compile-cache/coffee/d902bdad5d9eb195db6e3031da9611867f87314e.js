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
      var _ref2;
      this.editor.destroy();
      this.panel.destroy();
      _ref2 = {}, this.editor = _ref2.editor, this.panel = _ref2.panel, this.editorElement = _ref2.editorElement, this.vimState = _ref2.vimState;
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
      var _ref2;
      if ((_ref2 = this.commandSubscriptions) != null) {
        _ref2.dispose();
      }
      this.finished = true;
      this.emitter.emit('did-unfocus');
      atom.workspace.getActivePane().activate();
      this.editor.setText('');
      return this.panel.hide();
    };

    Input.prototype.isVisible = function() {
      return this.panel.isVisible();
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
