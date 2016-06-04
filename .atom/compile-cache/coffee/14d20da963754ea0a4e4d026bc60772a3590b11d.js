(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Insert mode commands", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref;
    _ref = [], set = _ref[0], ensure = _ref[1], keystroke = _ref[2], editor = _ref[3], editorElement = _ref[4], vimState = _ref[5];
    beforeEach(function() {
      return getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    return describe("Copy from line above/below", function() {
      beforeEach(function() {
        set({
          text: "12345\n\nabcd\nefghi",
          cursorBuffer: [[1, 0], [3, 0]]
        });
        return keystroke('i');
      });
      describe("the ctrl-y command", function() {
        it("copies from the line above", function() {
          ensure({
            ctrl: 'y'
          }, {
            text: "12345\n1\nabcd\naefghi"
          });
          editor.insertText(' ');
          return ensure({
            ctrl: 'y'
          }, {
            text: "12345\n1 3\nabcd\na cefghi"
          });
        });
        it("does nothing if there's nothing above the cursor", function() {
          editor.insertText('fill');
          ensure({
            ctrl: 'y'
          }, {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
          return ensure({
            ctrl: 'y'
          }, {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
        });
        return it("does nothing on the first line", function() {
          set({
            cursorBuffer: [[0, 2], [3, 2]]
          });
          editor.insertText('a');
          ensure({
            text: "12a345\n\nabcd\nefaghi"
          });
          return ensure({
            ctrl: 'y'
          }, {
            text: "12a345\n\nabcd\nefadghi"
          });
        });
      });
      describe("the ctrl-e command", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-e': 'vim-mode-plus:copy-from-line-below'
            }
          });
        });
        it("copies from the line below", function() {
          ensure({
            ctrl: 'e'
          }, {
            text: "12345\na\nabcd\nefghi"
          });
          editor.insertText(' ');
          return ensure({
            ctrl: 'e'
          }, {
            text: "12345\na c\nabcd\n efghi"
          });
        });
        return it("does nothing if there's nothing below the cursor", function() {
          editor.insertText('foo');
          ensure({
            ctrl: 'e'
          }, {
            text: "12345\nfood\nabcd\nfooefghi"
          });
          return ensure({
            ctrl: 'e'
          }, {
            text: "12345\nfood\nabcd\nfooefghi"
          });
        });
      });
      return describe("InsertLastInserted", function() {
        var ensureInsertLastInserted;
        ensureInsertLastInserted = function(key, options) {
          var finalText, insert, text;
          insert = options.insert, text = options.text, finalText = options.finalText;
          keystroke(key);
          editor.insertText(insert);
          ensure("escape", {
            text: text
          });
          return ensure([
            "GI", {
              ctrl: 'a'
            }
          ], {
            text: finalText
          });
        };
        beforeEach(function() {
          var initialText;
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-a': 'vim-mode-plus:insert-last-inserted'
            }
          });
          initialText = "abc\ndef\n";
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
        it("case-i: single-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx',
            text: "xxxabc\ndef\n",
            finalText: "xxxabc\nxxxdef\n"
          });
        });
        it("case-o: single-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx',
            text: "abc\nxxx\ndef\n",
            finalText: "abc\nxxx\nxxxdef\n"
          });
        });
        it("case-O: single-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx',
            text: "xxx\nabc\ndef\n",
            finalText: "xxx\nabc\nxxxdef\n"
          });
        });
        it("case-i: multi-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\nabc\ndef\n",
            finalText: "xxx\nyyy\nabc\nxxx\nyyy\ndef\n"
          });
        });
        it("case-o: multi-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx\nyyy\n',
            text: "abc\nxxx\nyyy\n\ndef\n",
            finalText: "abc\nxxx\nyyy\n\nxxx\nyyy\ndef\n"
          });
        });
        return it("case-O: multi-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\n\nabc\ndef\n",
            finalText: "xxx\nyyy\n\nabc\nxxx\nyyy\ndef\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9pbnNlcnQtbW9kZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUMsY0FBZSxPQUFBLENBQVEsZUFBUixFQUFmLFdBQUQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSw2REFBQTtBQUFBLElBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsU0FBRCxFQUFZLEdBQVosR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLFNBQVgsQ0FBQTtBQUFBLFFBQ0MsbUJBQUEsTUFBRCxFQUFTLDBCQUFBLGFBRFQsQ0FBQTtlQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FSQSxDQUFBO1dBV0EsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEdBQUEsQ0FDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLHNCQUFOO0FBQUEsVUFNQSxZQUFBLEVBQWMsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxD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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/insert-mode-spec.coffee
