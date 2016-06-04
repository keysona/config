(function() {
  var TextData, getVimState, settings, withMockPlatform, _, _ref;

  _ = require('underscore-plus');

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, TextData = _ref.TextData, withMockPlatform = _ref.withMockPlatform;

  settings = require('../lib/settings');

  describe("VimState", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    beforeEach(function() {
      return vimState.resetNormalMode();
    });
    describe("initialization", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      return it("puts the editor in insert-mode if startInInsertMode is true", function() {
        settings.set('startInInsertMode', true);
        return getVimState(function(state, vim) {
          return vim.ensure({
            mode: 'insert'
          });
        });
      });
    });
    describe("::destroy", function() {
      it("re-enables text input on the editor", function() {
        expect(editorElement.component.isInputEnabled()).toBeFalsy();
        vimState.destroy();
        return expect(editorElement.component.isInputEnabled()).toBeTruthy();
      });
      it("removes the mode classes from the editor", function() {
        ensure({
          mode: 'normal'
        });
        vimState.destroy();
        return expect(editorElement.classList.contains("normal-mode")).toBeFalsy();
      });
      return it("is a noop when the editor is already destroyed", function() {
        editorElement.getModel().destroy();
        return vimState.destroy();
      });
    });
    describe("normal-mode", function() {
      describe("when entering an insertable character", function() {
        beforeEach(function() {
          return keystroke('\\');
        });
        return it("stops propagation", function() {
          return ensure({
            text: ''
          });
        });
      });
      describe("when entering an operator", function() {
        beforeEach(function() {
          return keystroke('d');
        });
        describe("with an operator that can't be composed", function() {
          beforeEach(function() {
            return keystroke('x');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        describe("the escape keybinding", function() {
          beforeEach(function() {
            return keystroke('escape');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        return describe("the ctrl-c keybinding", function() {
          beforeEach(function() {
            return keystroke('ctrl-c');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
      });
      describe("the escape keybinding", function() {
        return it("clears any extra cursors", function() {
          set({
            text: "one-two-three",
            addCursor: [0, 3]
          });
          ensure({
            numCursors: 2
          });
          return ensure('escape', {
            numCursors: 1
          });
        });
      });
      describe("the v keybinding", function() {
        beforeEach(function() {
          set({
            text: "abc",
            cursor: [0, 0]
          });
          return keystroke('v');
        });
        return it("puts the editor into visual characterwise mode", function() {
          return ensure({
            mode: ['visual', 'characterwise']
          });
        });
      });
      describe("the V keybinding", function() {
        beforeEach(function() {
          return set({
            text: "012345\nabcdef",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual linewise mode", function() {
          return ensure('V', {
            mode: ['visual', 'linewise']
          });
        });
        return it("selects the current line", function() {
          return ensure('V', {
            selectedText: '012345\n'
          });
        });
      });
      describe("the ctrl-v keybinding", function() {
        return it("puts the editor into visual blockwise mode", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('ctrl-v', {
            mode: ['visual', 'blockwise']
          });
        });
      });
      describe("selecting text", function() {
        beforeEach(function() {
          spyOn(_._, "now").andCallFake(function() {
            return window.now;
          });
          return set({
            text: "abc def",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual mode", function() {
          ensure({
            mode: 'normal'
          });
          advanceClock(200);
          atom.commands.dispatch(editorElement, "core:select-right");
          return ensure({
            mode: ['visual', 'characterwise'],
            selectedBufferRange: [[0, 0], [0, 1]]
          });
        });
        it("handles the editor being destroyed shortly after selecting text", function() {
          set({
            selectedBufferRange: [[0, 0], [0, 3]]
          });
          editor.destroy();
          vimState.destroy();
          return advanceClock(100);
        });
        return it('handles native selection such as core:select-all', function() {
          atom.commands.dispatch(editorElement, 'core:select-all');
          return ensure({
            selectedBufferRange: [[0, 0], [0, 7]]
          });
        });
      });
      describe("the i keybinding", function() {
        return it("puts the editor into insert mode", function() {
          return ensure('i', {
            mode: 'insert'
          });
        });
      });
      describe("the R keybinding", function() {
        return it("puts the editor into replace mode", function() {
          return ensure('R', {
            mode: ['insert', 'replace']
          });
        });
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
        });
        describe("on a line with content", function() {
          return it("[Changed] won't adjust cursor position if outer command place the cursor on end of line('\\n') character", function() {
            ensure({
              mode: 'normal'
            });
            atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
            return ensure({
              cursor: [0, 6]
            });
          });
        });
        return describe("on an empty line", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [1, 0]
            });
            return ensure({
              cursor: [1, 0]
            });
          });
        });
      });
      return describe('with character-input operations', function() {
        beforeEach(function() {
          return set({
            text: '012345\nabcdef'
          });
        });
        return it('properly clears the operations', function() {
          var target;
          ensure('d r', {
            mode: 'normal'
          });
          expect(vimState.operationStack.isEmpty()).toBe(true);
          target = vimState.input.editorElement;
          keystroke('d');
          atom.commands.dispatch(target, 'core:cancel');
          return ensure({
            text: '012345\nabcdef'
          });
        });
      });
    });
    describe("insert-mode", function() {
      beforeEach(function() {
        return keystroke('i');
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting insert mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [0, 6]
            });
            return ensure({
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return escape('escape', {
          mode: 'normal'
        });
      });
      return it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('ctrl-c', {
            mode: 'normal'
          });
        });
      });
    });
    describe("replace-mode", function() {
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting replace mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('R escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          beforeEach(function() {});
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('R escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            keystroke('R');
            set({
              cursor: [0, 6]
            });
            return ensure({
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('R escape', {
          mode: 'normal'
        });
      });
      return it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('R ctrl-c', {
            mode: 'normal'
          });
        });
      });
    });
    describe("visual-mode", function() {
      beforeEach(function() {
        set({
          text: "one two three",
          cursorBuffer: [0, 4]
        });
        return keystroke('v');
      });
      it("selects the character under the cursor", function() {
        return ensure({
          selectedBufferRange: [[0, 4], [0, 5]],
          selectedText: 't'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('escape', {
          cursorBuffer: [0, 4],
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed on selection is reversed", function() {
        ensure({
          selectedText: 't'
        });
        ensure('h h', {
          selectedText: 'e t',
          selectionIsReversed: true
        });
        return ensure('escape', {
          mode: 'normal',
          cursorBuffer: [0, 2]
        });
      });
      describe("motions", function() {
        it("transforms the selection", function() {
          return ensure('w', {
            selectedText: 'two t'
          });
        });
        return it("always leaves the initially selected character selected", function() {
          ensure('h', {
            selectedText: ' t'
          });
          ensure('l', {
            selectedText: 't'
          });
          return ensure('l', {
            selectedText: 'tw'
          });
        });
      });
      describe("operators", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('V d', {
            text: "\nabcdef"
          });
        });
      });
      describe("returning to normal-mode", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef"
          });
          return ensure('V escape', {
            selectedText: ''
          });
        });
      });
      describe("the o keybinding", function() {
        it("reversed each selection", function() {
          set({
            addCursor: [0, Infinity]
          });
          ensure('i w', {
            selectedBufferRange: [[[0, 4], [0, 7]], [[0, 8], [0, 13]]],
            cursorBuffer: [[0, 7], [0, 13]]
          });
          return ensure('o', {
            selectedBufferRange: [[[0, 4], [0, 7]], [[0, 8], [0, 13]]],
            cursorBuffer: [[0, 4], [0, 8]]
          });
        });
        return xit("harmonizes selection directions", function() {
          set({
            cursorBuffer: [0, 0]
          });
          keystroke('e e');
          set({
            addCursor: [0, Infinity]
          });
          ensure('h h', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursorBuffer: [[0, 5], [0, 11]]
          });
          return ensure('o', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursorBuffer: [[0, 5], [0, 13]]
          });
        });
      });
      describe("activate visualmode within visualmode", function() {
        var cursorPosition;
        cursorPosition = null;
        beforeEach(function() {
          cursorPosition = [0, 4];
          set({
            text: "line one\nline two\nline three\n",
            cursor: cursorPosition
          });
          return ensure('escape', {
            mode: 'normal'
          });
        });
        describe("activateVisualMode with same type puts the editor into normal mode", function() {
          describe("characterwise: vv", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('v', {
                mode: ['visual', 'characterwise']
              });
              return ensure('v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          describe("linewise: VV", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('V', {
                mode: ['visual', 'linewise']
              });
              return ensure('V', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          return describe("blockwise: ctrl-v twice", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('ctrl-v', {
                mode: ['visual', 'blockwise']
              });
              return ensure('ctrl-v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
        });
        describe("change submode within visualmode", function() {
          beforeEach(function() {
            return set({
              text: "line one\nline two\nline three\n",
              cursorBuffer: [[0, 5], [2, 5]]
            });
          });
          it("can change submode within visual mode", function() {
            ensure('v', {
              mode: ['visual', 'characterwise']
            });
            ensure('V', {
              mode: ['visual', 'linewise']
            });
            ensure('ctrl-v', {
              mode: ['visual', 'blockwise']
            });
            return ensure('v', {
              mode: ['visual', 'characterwise']
            });
          });
          return it("recover original range when shift from linewise to characterwise", function() {
            ensure('v i w', {
              selectedText: ['one', 'three']
            });
            ensure('V', {
              selectedText: ["line one\n", "line three\n"]
            });
            return ensure('v', {
              selectedText: ["one", "three"]
            });
          });
        });
        return describe("keep goalColum when submode change in visual-mode", function() {
          var text;
          text = null;
          beforeEach(function() {
            text = new TextData("0_34567890ABCDEF\n1_34567890\n2_34567\n3_34567890A\n4_34567890ABCDEF\n");
            return set({
              text: text.getRaw(),
              cursor: [0, 0]
            });
          });
          return it("keep goalColumn when shift linewise to characterwise", function() {
            ensure('V', {
              selectedText: text.getLines([0]),
              characterwiseHead: [0, 0],
              mode: ['visual', 'linewise']
            });
            ensure('$', {
              selectedText: text.getLines([0]),
              characterwiseHead: [0, 15],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1]),
              characterwiseHead: [1, 9],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2]),
              characterwiseHead: [2, 6],
              mode: ['visual', 'linewise']
            });
            ensure('v', {
              selectedText: text.getLines([0, 1, 2], {
                chomp: true
              }),
              characterwiseHead: [2, 6],
              mode: ['visual', 'characterwise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3], {
                chomp: true
              }),
              cursor: [3, 11],
              mode: ['visual', 'characterwise']
            });
            ensure('v', {
              cursor: [3, 10],
              mode: 'normal'
            });
            return ensure('j', {
              cursor: [4, 15],
              mode: 'normal'
            });
          });
        });
      });
      describe("deactivating visual mode", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "line one\nline two\nline three\n",
            cursor: [0, 7]
          });
        });
        it("can put cursor at in visual char mode", function() {
          return ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [0, 8]
          });
        });
        it("adjust cursor position 1 column left when deactivated", function() {
          return ensure('v escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
        return it("[CHANGED from vim-mode] can not select new line in characterwise visual mode", function() {
          ensure('v l l', {
            cursor: [0, 8]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
      });
      return describe("deactivating visual mode on blank line", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "0: abc\n\n2: abc",
            cursor: [1, 0]
          });
        });
        it("v case-1", function() {
          ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("v case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('v j', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0],
            selectedText: ": abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-1", function() {
          ensure('V', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('V j', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0],
            selectedText: "0: abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        return it("ctrl-v", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
      });
    });
    return describe("marks", function() {
      beforeEach(function() {
        return set({
          text: "text in line 1\ntext in line 2\ntext in line 3"
        });
      });
      it("basic marking functionality", function() {
        set({
          cursor: [1, 1]
        });
        keystroke('m t');
        set({
          cursor: [2, 2]
        });
        return ensure('` t', {
          cursor: [1, 1]
        });
      });
      it("real (tracking) marking functionality", function() {
        set({
          cursor: [2, 2]
        });
        keystroke('m q');
        set({
          cursor: [1, 2]
        });
        return ensure('o escape ` q', {
          cursor: [3, 2]
        });
      });
      return it("real (tracking) marking functionality", function() {
        set({
          cursor: [2, 2]
        });
        keystroke('m q');
        set({
          cursor: [1, 2]
        });
        return ensure('d d escape ` q', {
          cursor: [1, 2]
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy92aW0tc3RhdGUtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMERBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQTRDLE9BQUEsQ0FBUSxlQUFSLENBQTVDLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0Isd0JBQUEsZ0JBRHhCLENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLDhEQUFBO0FBQUEsSUFBQSxRQUE0RCxFQUE1RCxFQUFDLGNBQUQsRUFBTSxpQkFBTixFQUFjLG9CQUFkLEVBQXlCLGlCQUF6QixFQUFpQyx3QkFBakMsRUFBZ0QsbUJBQWhELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBQUEsUUFDQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFEVCxDQUFBO2VBRUMsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FBZCxFQUEyQixJQUhqQjtNQUFBLENBQVosRUFEUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFRQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsUUFBUSxDQUFDLGVBQVQsQ0FBQSxFQURTO0lBQUEsQ0FBWCxDQVJBLENBQUE7QUFBQSxJQVdBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFD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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/vim-state-spec.coffee
