(function() {
  var TabsToSpaces,
    __modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

  TabsToSpaces = (function() {
    function TabsToSpaces() {}

    TabsToSpaces.prototype.allWhitespace = /[ \t]+/g;

    TabsToSpaces.prototype.leadingWhitespace = /^[ \t]+/g;

    TabsToSpaces.prototype.tabify = function(editor) {
      this.editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      return this.replaceWhitespaceWithTabs(this.editor);
    };

    TabsToSpaces.prototype.untabify = function(editor) {
      this.editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      return this.replaceWhitespaceWithSpaces(this.editor);
    };

    TabsToSpaces.prototype.untabifyAll = function(editor) {
      this.editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      return this.replaceAllWhitespaceWithSpaces(this.editor);
    };

    TabsToSpaces.prototype.countSpaces = function(text) {
      var ch, count, tabLength, _i, _len;
      count = 0;
      tabLength = this.editor.getTabLength();
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        ch = text[_i];
        switch (ch) {
          case ' ':
            count += 1;
            break;
          case '\t':
            count += tabLength;
        }
      }
      return count;
    };

    TabsToSpaces.prototype.multiplyText = function(text, count) {
      return Array(count + 1).join(text);
    };

    TabsToSpaces.prototype.replaceAllWhitespaceWithSpaces = function(editor) {
      return editor.transact((function(_this) {
        return function() {
          return editor.scan(_this.allWhitespace, function(_arg) {
            var count, match, replace;
            match = _arg.match, replace = _arg.replace;
            count = _this.countSpaces(match[0]);
            return replace("" + (_this.multiplyText(' ', count)));
          });
        };
      })(this));
    };

    TabsToSpaces.prototype.replaceWhitespaceWithSpaces = function(editor) {
      return editor.transact((function(_this) {
        return function() {
          return editor.scan(_this.leadingWhitespace, function(_arg) {
            var count, match, replace;
            match = _arg.match, replace = _arg.replace;
            count = _this.countSpaces(match[0]);
            return replace("" + (_this.multiplyText(' ', count)));
          });
        };
      })(this));
    };

    TabsToSpaces.prototype.replaceWhitespaceWithTabs = function(editor) {
      return editor.transact((function(_this) {
        return function() {
          return editor.scan(_this.leadingWhitespace, function(_arg) {
            var count, match, replace, spaces, tabs;
            match = _arg.match, replace = _arg.replace;
            count = _this.countSpaces(match[0]);
            tabs = Math.floor(count / _this.editor.getTabLength());
            spaces = __modulo(count, _this.editor.getTabLength());
            return replace("" + (_this.multiplyText('\t', tabs)) + (_this.multiplyText(' ', spaces)));
          });
        };
      })(this));
    };

    return TabsToSpaces;

  })();

  module.exports = new TabsToSpaces;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3RhYnMtdG8tc3BhY2VzL2xpYi90YWJzLXRvLXNwYWNlcy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsWUFBQTtJQUFBLDZEQUFBOztBQUFBLEVBQU07OEJBRUo7O0FBQUEsMkJBQUEsYUFBQSxHQUFlLFNBQWYsQ0FBQTs7QUFBQSwyQkFHQSxpQkFBQSxHQUFtQixVQUhuQixDQUFBOztBQUFBLDJCQVFBLE1BQUEsR0FBUSxTQUFFLE1BQUYsR0FBQTtBQUNOLE1BRE8sSUFBQyxDQUFBLDBCQUFBLFNBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQ2YsQ0FBQTtBQUFBLE1BQUEsSUFBYyxtQkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO2FBQ0EsSUFBQyxDQUFBLHlCQUFELENBQTJCLElBQUMsQ0FBQSxNQUE1QixFQUZNO0lBQUEsQ0FSUixDQUFBOztBQUFBLDJCQWVBLFFBQUEsR0FBVSxTQUFFLE1BQUYsR0FBQTtBQUNSLE1BRFMsSUFBQyxDQUFBLDBCQUFBLFNBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQ2pCLENBQUE7QUFBQSxNQUFBLElBQWMsbUJBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSwyQkFBRCxDQUE2QixJQUFDLENBQUEsTUFBOUIsRUFGUTtJQUFBLENBZlYsQ0FBQTs7QUFBQSwyQkFzQkEsV0FBQSxHQUFhLFNBQUUsTUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsMEJBQUEsU0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FDcEIsQ0FBQTtBQUFBLE1BQUEsSUFBYyxtQkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO2FBQ0EsSUFBQyxDQUFBLDhCQUFELENBQWdDLElBQUMs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

//# sourceURL=/home/key/.atom/packages/tabs-to-spaces/lib/tabs-to-spaces.coffee
