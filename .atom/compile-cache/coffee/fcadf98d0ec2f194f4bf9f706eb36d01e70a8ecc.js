(function() {
  var REGISTERS, RegisterManager, globalState, settings,
    __slice = [].slice;

  globalState = require('./global-state');

  settings = require('./settings');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  RegisterManager = (function() {
    function RegisterManager(vimState) {
      var _ref;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.data = globalState.register;
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
    }

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.vimState.toggleClassList('with-register', this.hasName());
    };

    RegisterManager.prototype.destroy = function() {
      var _ref;
      this.subscriptionBySelection.forEach(function(disposable) {
        return disposable.dispose();
      });
      this.subscriptionBySelection.clear();
      this.clipboardBySelection.clear();
      return _ref = {}, this.subscriptionBySelection = _ref.subscriptionBySelection, this.clipboardBySelection = _ref.clipboardBySelection, _ref;
    };

    RegisterManager.prototype.isValidName = function(name) {
      return REGISTERS.test(name);
    };

    RegisterManager.prototype.getText = function(name, selection) {
      var _ref;
      return (_ref = this.get(name, selection).text) != null ? _ref : '';
    };

    RegisterManager.prototype.readClipboard = function(selection) {
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && this.clipboardBySelection.has(selection)) {
        return this.clipboardBySelection.get(selection);
      } else {
        return atom.clipboard.read();
      }
    };

    RegisterManager.prototype.writeClipboard = function(selection, text) {
      var disposable;
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && !this.clipboardBySelection.has(selection)) {
        disposable = selection.onDidDestroy((function(_this) {
          return function() {
            _this.subscriptionBySelection["delete"](selection);
            return _this.clipboardBySelection["delete"](selection);
          };
        })(this));
        this.subscriptionBySelection.set(selection, disposable);
      }
      if ((selection === null) || selection.isLastSelection()) {
        atom.clipboard.write(text);
      }
      if (selection != null) {
        return this.clipboardBySelection.set(selection, text);
      }
    };

    RegisterManager.prototype.get = function(name, selection) {
      var text, type, _ref, _ref1;
      if (name == null) {
        name = this.getName();
      }
      if (name === '"') {
        name = settings.get('defaultRegister');
      }
      switch (name) {
        case '*':
        case '+':
          text = this.readClipboard(selection);
          break;
        case '%':
          text = this.editor.getURI();
          break;
        case '_':
          text = '';
          break;
        default:
          _ref1 = (_ref = this.data[name.toLowerCase()]) != null ? _ref : {}, text = _ref1.text, type = _ref1.type;
      }
      if (type == null) {
        type = this.getCopyType(text != null ? text : '');
      }
      return {
        text: text,
        type: type
      };
    };

    RegisterManager.prototype.set = function() {
      var args, name, selection, value, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = [], name = _ref[0], value = _ref[1];
      switch (args.length) {
        case 1:
          value = args[0];
          break;
        case 2:
          name = args[0], value = args[1];
      }
      if (name == null) {
        name = this.getName();
      }
      if (!this.isValidName(name)) {
        return;
      }
      if (name === '"') {
        name = settings.get('defaultRegister');
      }
      if (value.type == null) {
        value.type = this.getCopyType(value.text);
      }
      selection = value.selection;
      delete value.selection;
      switch (name) {
        case '*':
        case '+':
          return this.writeClipboard(selection, value.text);
        case '_':
        case '%':
          return null;
        default:
          if (/^[A-Z]$/.test(name)) {
            return this.append(name.toLowerCase(), value);
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      if (!(register = this.data[name])) {
        this.data[name] = value;
        return;
      }
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.text += '\n';
          register.type = 'linewise';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.getName = function() {
      var _ref;
      return (_ref = this.name) != null ? _ref : settings.get('defaultRegister');
    };

    RegisterManager.prototype.hasName = function() {
      return this.name != null;
    };

    RegisterManager.prototype.setName = function() {
      this.vimState.hover.add('"');
      this.vimState.onDidConfirmInput((function(_this) {
        return function(name) {
          _this.name = name;
          _this.vimState.toggleClassList('with-register', _this.hasName());
          return _this.vimState.hover.add(_this.name);
        };
      })(this));
      this.vimState.onDidCancelInput((function(_this) {
        return function() {
          return _this.vimState.hover.reset();
        };
      })(this));
      return this.vimState.input.focus({
        charsMax: 1
      });
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'character';
      }
    };

    return RegisterManager;

  })();

  module.exports = RegisterManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3JlZ2lzdGVyLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBQWQsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksb0JBSFosQ0FBQTs7QUFBQSxFQW9CTTtBQUNTLElBQUEseUJBQUUsUUFBRixHQUFBO0FBQ1gsVUFBQSxJQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFBQSxNQUFBLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUEsYUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLFdBQVcsQ0FBQyxRQURwQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsdUJBQUQsR0FBMkIsR0FBQSxDQUFBLEdBRjNCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixHQUFBLENBQUEsR0FIeEIsQ0FEVztJQUFBLENBQWI7O0FBQUEsOEJBTUEsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFSLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBMEIsZUFBMUIsRUFBMkMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUEzQyxFQUZLO0lBQUEsQ0FOUCxDQUFBOztBQUFBLDhCQVVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7QUFBQSxNQUFBLElB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/register-manager.coffee
