(function() {
  var dispatch, getVimState, inspect, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch;

  settings = require('../lib/settings');

  inspect = require('util').inspect;

  describe("Operator ActivateInsertMode family", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("the s keybinding", function() {
      beforeEach(function() {
        return set({
          text: '012345',
          cursor: [0, 1]
        });
      });
      it("deletes the character to the right and enters insert mode", function() {
        return ensure('s', {
          mode: 'insert',
          text: '02345',
          cursor: [0, 1],
          register: {
            '"': {
              text: '1'
            }
          }
        });
      });
      it("is repeatable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        set({
          cursor: [0, 2]
        });
        return ensure('.', {
          text: 'abab'
        });
      });
      it("is undoable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        return ensure('u', {
          text: '012345',
          selectedText: ''
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return keystroke('vls');
        });
        return it("deletes the selected characters and enters insert mode", function() {
          return ensure({
            mode: 'insert',
            text: '0345',
            cursor: [0, 1],
            register: {
              '"': {
                text: '12'
              }
            }
          });
        });
      });
    });
    describe("the S keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE",
          cursor: [1, 3]
        });
      });
      it("deletes the entire line and enters insert mode", function() {
        return ensure('S', {
          mode: 'insert',
          text: "12345\n\nABCDE",
          register: {
            '"': {
              text: 'abcde\n',
              type: 'linewise'
            }
          }
        });
      });
      it("is repeatable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        set({
          cursor: [2, 3]
        });
        return ensure('.', {
          text: '12345\nabc\nabc'
        });
      });
      it("is undoable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        return ensure('u', {
          text: "12345\nabcde\nABCDE",
          selectedText: ''
        });
      });
      it("works when the cursor's goal column is greater than its current column", function() {
        set({
          text: "\n12345",
          cursor: [1, Infinity]
        });
        return ensure('kS', {
          text: '\n12345'
        });
      });
      return xit("respects indentation", function() {});
    });
    describe("the c keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("when followed by a c", function() {
        describe("with autoindent", function() {
          beforeEach(function() {
            set({
              text: "12345\n  abcde\nABCDE\n"
            });
            set({
              cursor: [1, 1]
            });
            spyOn(editor, 'shouldAutoIndent').andReturn(true);
            spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
              return editor.indent();
            });
            return spyOn(editor.languageMode, 'suggestedIndentForLineAtBufferRow').andCallFake(function() {
              return 1;
            });
          });
          it("deletes the current line and enters insert mode", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('cc', {
              text: "12345\n  \nABCDE\n",
              cursor: [1, 2],
              mode: 'insert'
            });
          });
          it("is repeatable", function() {
            keystroke('cc');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            set({
              cursor: [2, 3]
            });
            return ensure('.', {
              text: "12345\n  abc\n  abc\n"
            });
          });
          return it("is undoable", function() {
            keystroke('cc');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            return ensure('u', {
              text: "12345\n  abcde\nABCDE\n",
              selectedText: ''
            });
          });
        });
        describe("when the cursor is on the last line", function() {
          return it("deletes the line's content and enters insert mode on the last line", function() {
            set({
              cursor: [2, 1]
            });
            return ensure('cc', {
              text: "12345\nabcde\n",
              cursor: [2, 0],
              mode: 'insert'
            });
          });
        });
        return describe("when the cursor is on the only line", function() {
          return it("deletes the line's content and enters insert mode", function() {
            set({
              text: "12345",
              cursor: [0, 2]
            });
            return ensure('cc', {
              text: "",
              cursor: [0, 0],
              mode: 'insert'
            });
          });
        });
      });
      describe("when followed by i w", function() {
        it("undo's and redo's completely", function() {
          set({
            cursor: [1, 1]
          });
          ensure('ciw', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          set({
            text: "12345\nfg\nABCDE"
          });
          ensure('escape', {
            text: "12345\nfg\nABCDE",
            mode: 'normal'
          });
          ensure('u', {
            text: "12345\nabcde\nABCDE"
          });
          return ensure([
            {
              ctrl: 'r'
            }
          ], {
            text: "12345\nfg\nABCDE"
          });
        });
        return it("repeatable", function() {
          set({
            cursor: [1, 1]
          });
          ensure('ciw', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          return ensure(['escape', 'j.'], {
            text: "12345\n\n",
            cursor: [2, 0],
            mode: 'normal'
          });
        });
      });
      describe("when followed by a w", function() {
        return it("changes the word", function() {
          set({
            text: "word1 word2 word3",
            cursorBuffer: [0, 7]
          });
          return ensure(['cw', 'escape'], {
            text: "word1 w word3"
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE\n";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure(['cG', 'escape'], {
              text: '12345\n\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure(['cG', 'escape'], {
              text: '12345\n\n'
            });
          });
        });
      });
      return describe("when followed by a goto line G", function() {
        beforeEach(function() {
          return set({
            text: "12345\nabcde\nABCDE"
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure(['c2G', 'escape'], {
              text: '12345\n\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 2]
            });
            return ensure(['c2G', 'escape'], {
              text: '12345\n\nABCDE'
            });
          });
        });
      });
    });
    describe("the C keybinding", function() {
      beforeEach(function() {
        set({
          text: "012\n",
          cursor: [0, 1]
        });
        return keystroke('C');
      });
      return it("deletes the contents until the end of the line and enters insert mode", function() {
        return ensure({
          text: "0\n",
          cursor: [0, 1],
          mode: 'insert'
        });
      });
    });
    describe("the O keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          text: "  abc\n  012\n",
          cursor: [1, 1]
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        keystroke('O');
        return ensure({
          text: "  abc\n  \n  012\n",
          cursor: [1, 2],
          mode: 'insert'
        });
      });
      it("is repeatable", function() {
        set({
          text: "  abc\n  012\n    4spaces\n",
          cursor: [1, 1]
        });
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  def\n  012\n    4spaces\n"
        });
        set({
          cursor: [1, 1]
        });
        ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    4spaces\n"
        });
        set({
          cursor: [4, 1]
        });
        return ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    def\n    4spaces\n"
        });
      });
      return it("is undoable", function() {
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  def\n  012\n"
        });
        return ensure('u', {
          text: "  abc\n  012\n"
        });
      });
    });
    describe("the o keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          text: "abc\n  012\n",
          cursor: [1, 2]
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        return ensure('o', {
          text: "abc\n  012\n  \n",
          mode: 'insert',
          cursor: [2, 2]
        });
      });
      xit("is repeatable", function() {
        set({
          text: "  abc\n  012\n    4spaces\n",
          cursor: [1, 1]
        });
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  012\n  def\n    4spaces\n"
        });
        ensure('.', {
          text: "  abc\n  012\n  def\n  def\n    4spaces\n"
        });
        set({
          cursor: [4, 1]
        });
        return ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    4spaces\n    def\n"
        });
      });
      return it("is undoable", function() {
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "abc\n  012\n  def\n"
        });
        return ensure('u', {
          text: "abc\n  012\n"
        });
      });
    });
    describe("the a keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012\n"
        });
      });
      describe("at the beginning of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return keystroke('a');
        });
        return it("switches to insert mode and shifts to the right", function() {
          return ensure({
            cursor: [0, 1],
            mode: 'insert'
          });
        });
      });
      return describe("at the end of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 3]
          });
          return keystroke('a');
        });
        return it("doesn't linewrap", function() {
          return ensure({
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the A keybinding", function() {
      beforeEach(function() {
        return set({
          text: "11\n22\n"
        });
      });
      return describe("at the beginning of a line", function() {
        it("switches to insert mode at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('A', {
            mode: 'insert',
            cursor: [0, 2]
          });
        });
        return it("repeats always as insert at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          keystroke('A');
          editor.insertText("abc");
          keystroke('escape');
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            text: "11abc\n22abc\n",
            mode: 'normal',
            cursor: [1, 4]
          });
        });
      });
    });
    describe("the I keybinding", function() {
      beforeEach(function() {
        return set({
          text: "11\n  22\n"
        });
      });
      return describe("at the end of a line", function() {
        it("switches to insert mode at the beginning of the line", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('I', {
            cursor: [0, 0],
            mode: 'insert'
          });
        });
        it("switches to insert mode after leading whitespace", function() {
          set({
            cursor: [1, 4]
          });
          return ensure('I', {
            cursor: [1, 2],
            mode: 'insert'
          });
        });
        return it("repeats always as insert at the first character of the line", function() {
          set({
            cursor: [0, 2]
          });
          keystroke('I');
          editor.insertText("abc");
          ensure('escape', {
            cursor: [0, 2]
          });
          set({
            cursor: [1, 4]
          });
          return ensure('.', {
            text: "abc11\n  abc22\n",
            cursor: [1, 4],
            mode: 'normal'
          });
        });
      });
    });
    describe("InsertAtPreviousFoldStart and Next", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'g [': 'vim-mode-plus:insert-at-previous-fold-start',
              'g ]': 'vim-mode-plus:insert-at-next-fold-start'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("when cursor is not at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [16, 0]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g[', {
            cursor: [9, 2],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g]', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
      });
      return describe("when cursor is at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [20, 6]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g[', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g]', {
            cursor: [22, 6],
            mode: 'insert'
          });
        });
      });
    });
    describe("the i keybinding", function() {
      beforeEach(function() {
        return set({
          text: '123\n4567',
          cursorBuffer: [[0, 0], [1, 0]]
        });
      });
      it("allows undoing an entire batch of typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        keystroke('i');
        editor.insertText("d");
        editor.insertText("e");
        editor.insertText("f");
        ensure('escape', {
          text: "abdefc123\nabdefc4567"
        });
        ensure('u', {
          text: "abc123\nabc4567"
        });
        return ensure('u', {
          text: "123\n4567"
        });
      });
      it("allows repeating typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        ensure('.', {
          text: "ababcc123\nababcc4567"
        });
        return ensure('.', {
          text: "abababccc123\nabababccc4567"
        });
      });
      return describe('with nonlinear input', function() {
        beforeEach(function() {
          return set({
            text: '',
            cursorBuffer: [0, 0]
          });
        });
        it('deals with auto-matched brackets', function() {
          keystroke('i');
          editor.insertText('()');
          editor.moveLeft();
          editor.insertText('a');
          editor.moveRight();
          editor.insertText('b\n');
          ensure('escape', {
            cursor: [1, 0]
          });
          return ensure('.', {
            text: '(a)b\n(a)b\n',
            cursor: [2, 0]
          });
        });
        return it('deals with autocomplete', function() {
          keystroke('i');
          editor.insertText('a');
          editor.insertText('d');
          editor.insertText('d');
          editor.setTextInBufferRange([[0, 0], [0, 3]], 'addFoo');
          ensure('escape', {
            cursor: [0, 5],
            text: 'addFoo'
          });
          return ensure('.', {
            text: 'addFoaddFooo',
            cursor: [0, 10]
          });
        });
      });
    });
    describe('the a keybinding', function() {
      beforeEach(function() {
        return set({
          text: '',
          cursorBuffer: [0, 0]
        });
      });
      it("can be undone in one go", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc"
        });
        return ensure('u', {
          text: ""
        });
      });
      return it("repeats correctly", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc",
          cursor: [0, 2]
        });
        return ensure('.', {
          text: "abcabc",
          cursor: [0, 5]
        });
      });
    });
    describe('preserve inserted text', function() {
      beforeEach(function() {
        return set({
          text: "\n\n",
          cursorBuffer: [0, 0]
        });
      });
      return describe("save inserted text to '.' register", function() {
        var ensureDotRegister;
        ensureDotRegister = function(key, _arg) {
          var text;
          text = _arg.text;
          keystroke(key);
          editor.insertText(text);
          return ensure("escape", {
            register: {
              '.': {
                text: text
              }
            }
          });
        };
        it("[case-i]", function() {
          return ensureDotRegister('i', {
            text: 'abc'
          });
        });
        it("[case-o]", function() {
          return ensureDotRegister('o', {
            text: 'abc'
          });
        });
        it("[case-c]", function() {
          return ensureDotRegister('c', {
            text: 'abc'
          });
        });
        it("[case-C]", function() {
          return ensureDotRegister('C', {
            text: 'abc'
          });
        });
        return it("[case-s]", function() {
          return ensureDotRegister('s', {
            text: 'abc'
          });
        });
      });
    });
    return describe('specify insertion count', function() {
      var ensureInsertionCount;
      ensureInsertionCount = function(key, _arg) {
        var cursor, insert, text;
        insert = _arg.insert, text = _arg.text, cursor = _arg.cursor;
        keystroke(key);
        editor.insertText(insert);
        return ensure("escape", {
          text: text,
          cursor: cursor
        });
      };
      beforeEach(function() {
        var initialText;
        initialText = "*\n*\n";
        set({
          text: "",
          cursor: [0, 0]
        });
        keystroke('i');
        editor.insertText(initialText);
        return ensure(["escape", 'gg'], {
          text: initialText,
          cursor: [0, 0]
        });
      });
      return describe("repeat insertion count times", function() {
        it("[case-i]", function() {
          return ensureInsertionCount('3i', {
            insert: '=',
            text: "===*\n*\n",
            cursor: [0, 2]
          });
        });
        it("[case-o]", function() {
          return ensureInsertionCount('3o', {
            insert: '=',
            text: "*\n=\n=\n=\n*\n",
            cursor: [3, 0]
          });
        });
        it("[case-O]", function() {
          return ensureInsertionCount('3O', {
            insert: '=',
            text: "=\n=\n=\n*\n*\n",
            cursor: [2, 0]
          });
        });
        return describe("children of Change operation won't repeate insertion count times", function() {
          beforeEach(function() {
            set({
              text: "",
              cursor: [0, 0]
            });
            keystroke('i');
            editor.insertText('*');
            return ensure(["escape", 'gg'], {
              text: '*',
              cursor: [0, 0]
            });
          });
          it("[case-c]", function() {
            return ensureInsertionCount('3cw', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-C]", function() {
            return ensureInsertionCount('3C', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-s]", function() {
            return ensureInsertionCount('3s', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          return it("[case-S]", function() {
            return ensureInsertionCount('3S', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9vcGVyYXRvci1hY3RpdmF0ZS1pbnNlcnQtbW9kZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTs7QUFBQSxFQUFBLE9BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BRkQsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBLEdBQUE7QUFDN0MsUUFBQSw4REFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FSQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/operator-activate-insert-mode-spec.coffee
