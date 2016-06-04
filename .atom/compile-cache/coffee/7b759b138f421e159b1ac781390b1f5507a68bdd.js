(function() {
  var Base, CompositeDisposable, Disposable, Emitter, ModeManager, Range, moveCursorLeft, settings, swrap, _, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  moveCursorLeft = require('./utils').moveCursorLeft;

  settings = require('./settings');

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    ModeManager.prototype.submode = null;

    ModeManager.prototype.vimState = null;

    ModeManager.prototype.editor = null;

    ModeManager.prototype.editorElement = null;

    ModeManager.prototype.emitter = null;

    ModeManager.prototype.deactivator = null;

    ModeManager.prototype.replacedCharsBySelection = null;

    ModeManager.prototype.previousSelectionProperties = null;

    ModeManager.prototype.previousVisualModeSubmode = null;

    function ModeManager(vimState) {
      var _ref1;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editor = _ref1.editor, this.editorElement = _ref1.editorElement;
      this.emitter = new Emitter;
    }

    ModeManager.prototype.isMode = function(mode, submodes) {
      var _ref1;
      if (submodes != null) {
        return (this.mode === mode) && (_ref1 = this.submode, __indexOf.call([].concat(submodes), _ref1) >= 0);
      } else {
        return this.mode === mode;
      }
    };

    ModeManager.prototype.onWillActivateMode = function(fn) {
      return this.emitter.on('will-activate-mode', fn);
    };

    ModeManager.prototype.onDidActivateMode = function(fn) {
      return this.emitter.on('did-activate-mode', fn);
    };

    ModeManager.prototype.onWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.preemptWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.onDidDeactivateMode = function(fn) {
      return this.emitter.on('did-deactivate-mode', fn);
    };

    ModeManager.prototype.activate = function(mode, submode) {
      var _ref1, _ref2;
      if (submode == null) {
        submode = null;
      }
      this.emitter.emit('will-activate-mode', {
        mode: mode,
        submode: submode
      });
      if ((mode === 'visual') && (submode === this.submode)) {
        _ref1 = ['normal', null], mode = _ref1[0], submode = _ref1[1];
      }
      if (mode !== this.mode) {
        this.deactivate();
      }
      this.deactivator = (function() {
        switch (mode) {
          case 'normal':
            return this.activateNormalMode();
          case 'insert':
            return this.activateInsertMode(submode);
          case 'visual':
            return this.activateVisualMode(submode);
        }
      }).call(this);
      this.editorElement.classList.remove("" + this.mode + "-mode");
      this.editorElement.classList.remove(this.submode);
      _ref2 = [mode, submode], this.mode = _ref2[0], this.submode = _ref2[1];
      this.editorElement.classList.add("" + this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
      }
      this.vimState.statusBarManager.update(this.mode, this.submode);
      this.vimState.updateCursorsVisibility();
      return this.emitter.emit('did-activate-mode', {
        mode: this.mode,
        submode: this.submode
      });
    };

    ModeManager.prototype.deactivate = function() {
      var _ref1;
      this.emitter.emit('will-deactivate-mode', {
        mode: this.mode,
        submode: this.submode
      });
      if ((_ref1 = this.deactivator) != null) {
        _ref1.dispose();
      }
      return this.emitter.emit('did-deactivate-mode', {
        mode: this.mode,
        submode: this.submode
      });
    };

    ModeManager.prototype.activateNormalMode = function() {
      var _ref1;
      this.vimState.reset();
      if ((_ref1 = this.editorElement.component) != null) {
        _ref1.setInputEnabled(false);
      }
      return new Disposable;
    };

    ModeManager.prototype.activateInsertMode = function(submode) {
      var replaceModeDeactivator;
      if (submode == null) {
        submode = null;
      }
      this.editorElement.component.setInputEnabled(true);
      if (submode === 'replace') {
        replaceModeDeactivator = this.activateReplaceMode();
      }
      return new Disposable((function(_this) {
        return function() {
          var cursor, _i, _len, _ref1, _results;
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          _ref1 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            cursor = _ref1[_i];
            _results.push(moveCursorLeft(cursor, {
              needSpecialCareToPreventWrapLine: true
            }));
          }
          return _results;
        };
      })(this));
    };

    ModeManager.prototype.activateReplaceMode = function() {
      var subs;
      this.replacedCharsBySelection = {};
      subs = new CompositeDisposable;
      subs.add(this.editor.onWillInsertText((function(_this) {
        return function(_arg) {
          var cancel, text;
          text = _arg.text, cancel = _arg.cancel;
          cancel();
          return _this.editor.getSelections().forEach(function(selection) {
            var char, _base, _i, _len, _name, _ref1, _ref2, _results;
            _ref2 = (_ref1 = text.split('')) != null ? _ref1 : [];
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              char = _ref2[_i];
              if ((char !== "\n") && (!selection.cursor.isAtEndOfLine())) {
                selection.selectRight();
              }
              if ((_base = _this.replacedCharsBySelection)[_name = selection.id] == null) {
                _base[_name] = [];
              }
              _results.push(_this.replacedCharsBySelection[selection.id].push(swrap(selection).replace(char)));
            }
            return _results;
          });
        };
      })(this)));
      subs.add(new Disposable((function(_this) {
        return function() {
          return _this.replacedCharsBySelection = null;
        };
      })(this)));
      return subs;
    };

    ModeManager.prototype.getReplacedCharForSelection = function(selection) {
      var _ref1;
      return (_ref1 = this.replacedCharsBySelection[selection.id]) != null ? _ref1.pop() : void 0;
    };

    ModeManager.prototype.activateVisualMode = function(submode) {
      if (this.submode != null) {
        this.selectCharacterwise();
      } else if (this.editor.getLastSelection().isEmpty()) {
        this.editor.selectRight();
      }
      this.vimState.updateSelectionProperties({
        force: false
      });
      switch (submode) {
        case 'linewise':
          this.vimState.selectLinewise();
          break;
        case 'blockwise':
          if (!swrap(this.editor.getLastSelection()).isLinewise()) {
            this.vimState.selectBlockwise();
          }
      }
      return new Disposable((function(_this) {
        return function() {
          var selection, _i, _len, _ref1, _results;
          _this.normalizeSelections({
            preservePreviousSelection: true
          });
          _ref1 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            selection = _ref1[_i];
            _results.push(selection.clear({
              autoscroll: false
            }));
          }
          return _results;
        };
      })(this));
    };

    ModeManager.prototype.preservePreviousSelection = function(selection) {
      var properties;
      properties = (typeof selection.isBlockwise === "function" ? selection.isBlockwise() : void 0) ? selection.getCharacterwiseProperties() : swrap(selection).detectCharacterwiseProperties();
      this.previousSelectionProperties = properties;
      return this.previousVisualModeSubmode = this.submode;
    };

    ModeManager.prototype.getPreviousSelectionInfo = function() {
      var properties, submode;
      properties = this.previousSelectionProperties;
      submode = this.previousVisualModeSubmode;
      return {
        properties: properties,
        submode: submode
      };
    };

    ModeManager.prototype.selectCharacterwise = function() {
      var bs, selection, _i, _j, _len, _len1, _ref1, _ref2, _results;
      switch (this.submode) {
        case 'linewise':
          _ref1 = this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            selection = _ref1[_i];
            if (!selection.isEmpty()) {
              _results.push(swrap(selection).restoreCharacterwise({
                preserveGoalColumn: true
              }));
            }
          }
          return _results;
          break;
        case 'blockwise':
          _ref2 = this.vimState.getBlockwiseSelections();
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            bs = _ref2[_j];
            bs.restoreCharacterwise();
          }
          return this.vimState.clearBlockwiseSelections();
      }
    };

    ModeManager.prototype.normalizeSelections = function(_arg) {
      var preservePreviousSelection, range, selection, selections, _i, _len, _results;
      preservePreviousSelection = (_arg != null ? _arg : {}).preservePreviousSelection;
      if (preservePreviousSelection) {
        range = this.editor.getLastSelection().getBufferRange();
        this.vimState.mark.setRange('<', '>', range);
      }
      this.selectCharacterwise();
      swrap.resetProperties(this.editor);
      if (preservePreviousSelection && !this.editor.getLastSelection().isEmpty()) {
        this.preservePreviousSelection(this.editor.getLastSelection());
      }
      selections = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        if (swrap(selection).isForwarding()) {
          _results.push(selection.modifySelection(function() {
            return moveCursorLeft(selection.cursor, {
              allowWrap: true,
              preserveGoalColumn: true
            });
          }));
        }
      }
      return _results;
    };

    return ModeManager;

  })();

  module.exports = ModeManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vZGUtbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEdBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxlQUFBLE9BQUQsRUFBVSxhQUFBLEtBQVYsRUFBaUIsMkJBQUEsbUJBQWpCLEVBQXNDLGtCQUFBLFVBRHRDLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUhSLENBQUE7O0FBQUEsRUFJQyxpQkFBa0IsT0FBQSxDQUFRLFNBQVIsRUFBbEIsY0FKRCxDQUFBOztBQUFBLEVBS0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBTFgsQ0FBQTs7QUFBQSxFQU9NO0FBQ0osMEJBQUEsSUFBQSxHQUFNLFFBQU4sQ0FBQTs7QUFBQSwwQkFDQSxPQUFBLEdBQVMsSUFEVCxDQUFBOztBQUFBLDBCQUdBLFFBQUEsR0FBVSxJQUhWLENBQUE7O0FBQUEsMEJBSUEsTUFBQSxHQUFRLElBSlIsQ0FBQTs7QUFBQSwwQkFLQSxhQUFBLEdBQWUsSUFMZixDQUFBOztBQUFBLDBCQU9BLE9BQUEsR0FBUyxJQVBULENBQUE7O0FBQUEsMEJBUUEsV0FBQSxHQUFhLElBUmIsQ0FBQTs7QUFBQSwwQkFVQSx3QkFBQSxHQUEwQixJQVYxQixDQUFBOztBQUFBLDBCQVdBLDJCQUFBLEdBQTZCLElBWDdCLENBQUE7O0FBQUEsMEJBWUEseUJBQUEsR0FBMkIsSUFaM0IsQ0FBQTs7QUFjYSxJQUFBLHFCQUFFLFFBQUYsR0FBQTtBQUNYLFVBQUEsS0FBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQSxRQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsZUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHNCQUFBLGFBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FEWCxDQURXO0lBQUEsQ0FkYjs7QUFBQSwwQkFrQkEsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLFFBQVAsR0FBQTtBQUNOLFVBQUEsS0FBQTtBQUFBLE1BQUEsSUFBRyxnQkFBSDtlQUNFLENBQUMsSUFBQyxDQUFBLElBQUQsS0FBUyxJQUFWLENBQUEsSUFBb0IsU0FBQyxJQUFDLENBQUEsT0FBRCxFQUFBLGVBQVksRUFBRSxDQUFDLE1BQUgsQ0FBVSxRQUFWLENBQVosRUFBQSxLQUFBLE1BQUQsRUFEdEI7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLElBQUQsS0FBUyxLQUhYO09BRE07SUFBQSxDQWxCUixDQUFBOztBQUFBLDBCQXdCQSxrQkFBQSxHQUFvQixTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG9CQUFaLEVBQWtDLEVBQWxDLEVBQVI7SUFBQSxDQXhCcEIsQ0FBQTs7QUFBQSwwQkF5QkEsaUJBQUEsR0FBbUIsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxtQkFBWixFQUFpQyxFQUFqQyxFQUFSO0lBQUEsQ0F6Qm5CLENBQUE7O0FBQUEsMEJBMEJBLG9CQUFBLEdBQXNCLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksc0JBQVosRUFBb0MsRUFBcEMsRUFBUjtJQUFBLENBMUJ0QixDQUFBOztBQUFBLDBCQTJCQSx5QkFBQSxHQUEyQixTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLHNCQUFaLEVBQW9DLEVBQXBDLEVBQVI7SUFBQSxDQTNCM0IsQ0FBQTs7QUFBQSwwQkE0QkEsbUJBQUEsR0FBcUIsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxxQkFBWixFQUFtQyxFQUFuQyxFQUFSO0lBQUEsQ0E1QnJCLENBQUE7O0FBQUEsMEJBaUNBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxPQUFQLEdBQUE7QUFDUixVQUFBLFlBQUE7O1FBRGUsVUFBUTtPQUN2QjtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsb0JBQWQsRUFBb0M7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sU0FBQSxPQUFQO09BQXBDLENBQUEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxDQUFDLElBQUEsS0FBUSxRQUFULENBQUEsSUFBdUIsQ0FBQyxPQUFBLEtBQVcsSUFBQyxDQUFBLE9BQWIsQ0FBMUI7QUFDRSxRQUFBLFFBQWtCLENBQUMsUUFBRCxFQUFXLElBQVgsQ0FBbEIsRUFBQyxlQUFELEVBQU8sa0JBQVAsQ0FERjtPQUZBO0FBS0EsTUFBQSxJQUFrQixJQUFBLEtBQVUsSUFBQyxDQUFBLElBQTdCO0FBQUEsUUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTtPQUxBO0FBQUEsTUFPQSxJQUFDLENBQUEsV0FBRDtBQUFlLGdCQUFPLElBQVA7QUFBQSxlQUNSLFFBRFE7bUJBQ00sSUFBQyxDQUFBLGtCQUFELENBQUEsRUFETjtBQUFBLGVBRVIsUUFGUTttQkFFTSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsT0FBcEIsRUFGTjtBQUFBLGVBR1IsUUFIUTttQkFHTSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsT0FBcEIsRUFITjtBQUFBO21CQVBmLENBQUE7QUFBQSxNQVlBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLEVBQUEsR0FBRyxJQUFDLENBQUEsSUFBSixHQUFTLE9BQXpDLENBWkEsQ0FBQTtBQUFBLE1BYUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsSUFBQyxDQUFBLE9BQWpDLENBYkEsQ0FBQTtBQUFBLE1BZUEsUUFBb0IsQ0FBQyxJQUFELEVBQU8sT0FBUCxDQUFwQixFQUFDLElBQUMsQ0FBQSxlQUFGLEVBQVEsSUFBQyxDQUFBLGtCQWZULENBQUE7QUFBQSxNQWlCQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixFQUFBLEdBQUcsSUFBQyxDQUFBLElBQUosR0FBUyxPQUF0QyxDQWpCQSxDQUFBO0FBa0JBLE1BQUEsSUFBMEMsb0JBQTFDO0FBQUEsUUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixJQUFDLENBQUEsT0FBOUIsQ0FBQSxDQUFBO09BbEJBO0FBQUEsTUFvQkEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUEzQixDQUFrQyxJQUFDLENBQUEsSUFBbkMsRUFBeUMsSUFBQyxDQUFBLE9BQTFDLENBcEJBLENBQUE7QUFBQSxNQXFCQSxJQUFDLENBQUEsUUFBUSxDQUFDLHVCQUFWLENBQUEsQ0FyQkEsQ0FBQTthQXNCQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxtQkFBZCxFQUFtQztBQUFBLFFBQUUsTUFBRCxJQUFDLENBQUEsSUFBRjtBQUFBLFFBQVMsU0FBRCxJQUFDLENBQUEsT0FBVDtPQUFuQyxFQXZCUTtJQUFBLENBakNWLENBQUE7O0FBQUEsMEJBMERBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixVQUFBLEtBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHNCQUFkLEVBQXNDO0FBQUEsUUFBRSxNQUFELElBQUMsQ0FBQSxJQUFGO0FBQUEsUUFBUyxTQUFELElBQUMsQ0FBQSxPQUFUO09BQXRDLENBQUEsQ0FBQTs7YUFDWSxDQUFFLE9BQWQsQ0FBQTtPQURBO2FBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMscUJBQWQsRUFBcUM7QUFBQSxRQUFFLE1BQUQsSUFBQyxDQUFBLElBQUY7QUFBQSxRQUFTLFNBQUQsSUFBQyxDQUFBLE9BQVQ7T0FBckMsRUFIVTtJQUFBLENBMURaLENBQUE7O0FBQUEsMEJBaUVBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixVQUFBLEtBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFBLENBQUEsQ0FBQTs7YUFFd0IsQ0FBRSxlQUExQixDQUEwQyxLQUExQztPQUZBO2FBR0EsR0FBQSxDQUFBLFdBSmtCO0lBQUEsQ0FqRXBCLENBQUE7O0FBQUEsMEJBeUVBLGtCQUFBLEdBQW9CLFNBQUMsT0FBRCxHQUFBO0FBQ2xCLFVBQUEsc0JBQUE7O1FBRG1CLFVBQVE7T0FDM0I7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLGVBQXpCLENBQXlDLElBQXpDLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBbUQsT0FBQSxLQUFXLFNBQTlEO0FBQUEsUUFBQSxzQkFBQSxHQUF5QixJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUF6QixDQUFBO09BREE7YUFHSSxJQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2IsY0FBQSxpQ0FBQTs7WUFBQSxzQkFBc0IsQ0FBRSxPQUF4QixDQUFBO1dBQUE7QUFBQSxVQUNBLHNCQUFBLEdBQXlCLElBRHpCLENBQUE7QUFHQTtBQUFBO2VBQUEsNENBQUE7K0JBQUE7QUFDRSwwQkFBQSxjQUFBLENBQWUsTUFBZixFQUF1QjtBQUFBLGNBQUMsZ0NBQUEsRUFBa0MsSUFBbkM7YUFBdkIsRUFBQSxDQURGO0FBQUE7MEJBSmE7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBSmM7SUFBQSxDQXpFcEIsQ0FBQTs7QUFBQSwwQkFvRkEsbUJBQUEsR0FBcUIsU0FBQSxHQUFBO0FBQ25CLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLHdCQUFELEdBQTRCLEVBQTVCLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxHQUFBLENBQUEsbUJBRFAsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUNoQyxjQUFBLFlBQUE7QUFBQSxVQURrQyxZQUFBLE1BQU0sY0FBQSxNQUN4QyxDQUFBO0FBQUEsVUFBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0MsU0FBQyxTQUFELEdBQUE7QUFDOUIsZ0JBQUEsb0RBQUE7QUFBQTtBQUFBO2lCQUFBLDRDQUFBOytCQUFBO0FBQ0UsY0FBQSxJQUFHLENBQUMsSUFBQSxLQUFVLElBQVgsQ0FBQSxJQUFxQixDQUFDLENBQUEsU0FBYSxDQUFDLE1BQU0sQ0FBQyxhQUFqQixDQUFBLENBQUwsQ0FBeEI7QUFDRSxnQkFBQSxTQUFTLENBQUMsV0FBVixDQUFBLENBQUEsQ0FERjtlQUFBOzsrQkFFMkM7ZUFGM0M7QUFBQSw0QkFHQSxLQUFDLENBQUEsd0JBQXlCLENBQUEsU0FBUyxDQUFDLEVBQVYsQ0FBYSxDQUFDLElBQXhDLENBQTZDLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsT0FBakIsQ0FBeUIsSUFBekIsQ0FBN0MsRUFIQSxDQURGO0FBQUE7NEJBRDhCO1VBQUEsQ0FBaEMsRUFGZ0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQUFULENBRkEsQ0FBQTtBQUFBLE1BV0EsSUFBSSxDQUFDLEdBQUwsQ0FBYSxJQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUN0QixLQUFDLENBQUEsd0JBQUQsR0FBNEIsS0FETjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBYixDQVhBLENBQUE7YUFhQSxLQWRtQjtJQUFBLENBcEZyQixDQUFBOztBQUFBLDBCQW9HQSwyQkFBQSxHQUE2QixTQUFDLFNBQUQsR0FBQTtBQUMzQixVQUFBLEtBQUE7a0ZBQXVDLENBQUUsR0FBekMsQ0FBQSxXQUQyQjtJQUFBLENBcEc3QixDQUFBOztBQUFBLDBCQTBHQSxrQkFBQSxHQUFvQixTQUFDLE9BQUQsR0FBQTtBQUNsQixNQUFBLElBQUcsb0JBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FERjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBMEIsQ0FBQyxPQUEzQixDQUFBLENBQUg7QUFDSCxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBLENBQUEsQ0FERztPQUZMO0FBQUEsTUFLQSxJQUFDLENBQUEsUUFBUSxDQUFDLHlCQUFWLENBQW9DO0FBQUEsUUFBQSxLQUFBLEVBQU8sS0FBUDtPQUFwQyxDQUxBLENBQUE7QUFPQSxjQUFPLE9BQVA7QUFBQSxhQUNPLFVBRFA7QUFFSSxVQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBVixDQUFBLENBQUEsQ0FGSjtBQUNPO0FBRFAsYUFHTyxXQUhQO0FBSUksVUFBQSxJQUFBLENBQUEsS0FBbUMsQ0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBTixDQUFpQyxDQUFDLFVBQWxDLENBQUEsQ0FBbkM7QUFBQSxZQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUFBLENBQUEsQ0FBQTtXQUpKO0FBQUEsT0FQQTthQWFJLElBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDYixjQUFBLG9DQUFBO0FBQUEsVUFBQSxLQUFDLENBQUEsbUJBQUQsQ0FBcUI7QUFBQSxZQUFBLHlCQUFBLEVBQTJCLElBQTNCO1dBQXJCLENBQUEsQ0FBQTtBQUNBO0FBQUE7ZUFBQSw0Q0FBQTtrQ0FBQTtBQUFBLDBCQUFBLFNBQVMsQ0FBQyxLQUFWLENBQWdCO0FBQUEsY0FBQSxVQUFBLEVBQVksS0FBWjthQUFoQixFQUFBLENBQUE7QUFBQTswQkFGYTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFkYztJQUFBLENBMUdwQixDQUFBOztBQUFBLDBCQTRIQSx5QkFBQSxHQUEyQixTQUFDLFNBQUQsR0FBQTtBQUN6QixVQUFBLFVBQUE7QUFBQSxNQUFBLFVBQUEsa0RBQWdCLFNBQVMsQ0FBQyx1QkFBYixHQUNYLFNBQVMsQ0FBQywwQkFBVixDQUFBLENBRFcsR0FHWCxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLDZCQUFqQixDQUFBLENBSEYsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLDJCQUFELEdBQStCLFVBSi9CLENBQUE7YUFLQSxJQUFDLENBQUEseUJBQUQsR0FBNkIsSUFBQyxDQUFBLFFBTkw7SUFBQSxDQTVIM0IsQ0FBQTs7QUFBQSwwQkFvSUEsd0JBQUEsR0FBMEIsU0FBQSxHQUFBO0FBQ3hCLFVBQUEsbUJBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsMkJBQWQsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFVLElBQUMsQ0FBQSx5QkFEWCxDQUFBO2FBRUE7QUFBQSxRQUFDLFlBQUEsVUFBRDtBQUFBLFFBQWEsU0FBQSxPQUFiO1FBSHdCO0lBQUEsQ0FwSTFCLENBQUE7O0FBQUEsMEJBeUlBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUNuQixVQUFBLDBEQUFBO0FBQUEsY0FBTyxJQUFDLENBQUEsT0FBUjtBQUFBLGFBQ08sVUFEUDtBQUVJO0FBQUE7ZUFBQSw0Q0FBQTtrQ0FBQTtnQkFBOEMsQ0FBQSxTQUFhLENBQUMsT0FBVixDQUFBO0FBQ2hELDRCQUFBLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsb0JBQWpCLENBQXNDO0FBQUEsZ0JBQUEsa0JBQUEsRUFBb0IsSUFBcEI7ZUFBdEMsRUFBQTthQURGO0FBQUE7MEJBRko7QUFDTztBQURQLGFBSU8sV0FKUDtBQUtJO0FBQUEsZUFBQSw4Q0FBQTsyQkFBQTtBQUNFLFlBQUEsRUFBRSxDQUFDLG9CQUFILENBQUEsQ0FBQSxDQURGO0FBQUEsV0FBQTtpQkFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLHdCQUFWLENBQUEsRUFQSjtBQUFBLE9BRG1CO0lBQUEsQ0F6SXJCLENBQUE7O0FBQUEsMEJBbUpBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxHQUFBO0FBQ25CLFVBQUEsMkVBQUE7QUFBQSxNQURxQiw0Q0FBRCxPQUE0QixJQUEzQix5QkFDckIsQ0FBQTtBQUFBLE1BQUEsSUFBRyx5QkFBSDtBQUNFLFFBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUEwQixDQUFDLGNBQTNCLENBQUEsQ0FBUixDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFmLENBQXdCLEdBQXhCLEVBQTZCLEdBQTdCLEVBQWtDLEtBQWxDLENBREEsQ0FERjtPQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUhBLENBQUE7QUFBQSxNQUlBLEtBQUssQ0FBQyxlQUFOLENBQXNCLElBQUMsQ0FBQSxNQUF2QixDQUpBLENBQUE7QUFLQSxNQUFBLElBQUcseUJBQUEsSUFBOEIsQ0FBQSxJQUFLLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBMEIsQ0FBQyxPQUEzQixDQUFBLENBQXJDO0FBQ0UsUUFBQSxJQUFDLENBQUEseUJBQUQsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQTNCLENBQUEsQ0FERjtPQUxBO0FBQUEsTUFVQSxVQUFBLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FWYixDQUFBO0FBV0E7V0FBQSxpREFBQTttQ0FBQTtZQUFpQyxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLFlBQWpCLENBQUE7QUFDL0Isd0JBQUEsU0FBUyxDQUFDLGVBQVYsQ0FBMEIsU0FBQSxHQUFBO21CQUV4QixjQUFBLENBQWUsU0FBUyxDQUFDLE1BQXpCLEVBQWlDO0FBQUEsY0FBQyxTQUFBLEVBQVcsSUFBWjtBQUFBLGNBQWtCLGtCQUFBLEVBQW9CLElBQXRDO2FBQWpDLEVBRndCO1VBQUEsQ0FBMUIsRUFBQTtTQURGO0FBQUE7c0JBWm1CO0lBQUEsQ0FuSnJCLENBQUE7O3VCQUFBOztNQVJGLENBQUE7O0FBQUEsRUE0S0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0E1S2pCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/mode-manager.coffee
