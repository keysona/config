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
        keystroke('3 s');
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
        keystroke('3 s');
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
          return keystroke('v l s');
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
        return ensure('k S', {
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
            return ensure('c c', {
              text: "12345\n  \nABCDE\n",
              cursor: [1, 2],
              mode: 'insert'
            });
          });
          it("is repeatable", function() {
            keystroke('c c');
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
            keystroke('c c');
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
            return ensure('c c', {
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
            return ensure('c c', {
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
          ensure('c i w', {
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
          return ensure('ctrl-r', {
            text: "12345\nfg\nABCDE"
          });
        });
        return it("repeatable", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          return ensure('escape j .', {
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
          return ensure('c w escape', {
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
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c G escape', {
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
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c 2 G escape', {
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
          return ensure('g [', {
            cursor: [9, 2],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
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
          return ensure('g [', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
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
        return ensure("escape g g", {
          text: initialText,
          cursor: [0, 0]
        });
      });
      return describe("repeat insertion count times", function() {
        it("[case-i]", function() {
          return ensureInsertionCount('3 i', {
            insert: '=',
            text: "===*\n*\n",
            cursor: [0, 2]
          });
        });
        it("[case-o]", function() {
          return ensureInsertionCount('3 o', {
            insert: '=',
            text: "*\n=\n=\n=\n*\n",
            cursor: [3, 0]
          });
        });
        it("[case-O]", function() {
          return ensureInsertionCount('3 O', {
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
            return ensure('escape g g', {
              text: '*',
              cursor: [0, 0]
            });
          });
          it("[case-c]", function() {
            return ensureInsertionCount('3 c w', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-C]", function() {
            return ensureInsertionCount('3 C', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-s]", function() {
            return ensureInsertionCount('3 s', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          return it("[case-S]", function() {
            return ensureInsertionCount('3 S', {
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
