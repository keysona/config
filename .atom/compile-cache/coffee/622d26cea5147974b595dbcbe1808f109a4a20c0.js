(function() {
  var TextData, getVimState, settings, _, _ref;

  _ = require('underscore-plus');

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, TextData = _ref.TextData;

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
            return keystroke({
              ctrl: 'c'
            });
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
          return ensure([
            {
              ctrl: 'v'
            }
          ], {
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
          ensure('dr', {
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
        return ensure([
          {
            platform: 'platform-darwin'
          }, {
            ctrl: 'c'
          }
        ], {
          mode: 'normal'
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
            return ensure(['R', 'escape'], {
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
            return ensure(['R', 'escape'], {
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
        return ensure(['R', 'escape'], {
          mode: 'normal'
        });
      });
      return it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return ensure([
          {
            platform: 'platform-darwin'
          }, 'R', {
            ctrl: 'c'
          }
        ], {
          mode: 'normal'
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
        ensure('hh', {
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
          return ensure('Vd', {
            text: "\nabcdef"
          });
        });
      });
      describe("returning to normal-mode", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef"
          });
          return ensure(['V', 'escape'], {
            selectedText: ''
          });
        });
      });
      describe("the o keybinding", function() {
        it("reversed each selection", function() {
          set({
            addCursor: [0, Infinity]
          });
          ensure('iw', {
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
          keystroke('ee');
          set({
            addCursor: [0, Infinity]
          });
          ensure('hh', {
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
              ensure({
                ctrl: 'v'
              }, {
                mode: ['visual', 'blockwise']
              });
              return ensure({
                ctrl: 'v'
              }, {
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
            ensure({
              ctrl: 'v'
            }, {
              mode: ['visual', 'blockwise']
            });
            return ensure('v', {
              mode: ['visual', 'characterwise']
            });
          });
          return it("recover original range when shift from linewise to characterwise", function() {
            ensure('viw', {
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
          return ensure(['v', 'escape'], {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
        return it("[CHANGED from vim-mode] can not select new line in characterwise visual mode", function() {
          ensure('vll', {
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
          ensure('vj', {
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
          ensure('Vj', {
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
          ensure({
            ctrl: 'v'
          }, {
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
        keystroke('mt');
        set({
          cursor: [2, 2]
        });
        return ensure('`t', {
          cursor: [1, 1]
        });
      });
      it("real (tracking) marking functionality", function() {
        set({
          cursor: [2, 2]
        });
        keystroke('mq');
        set({
          cursor: [1, 2]
        });
        return ensure(['o', 'escape', '`q'], {
          cursor: [3, 2]
        });
      });
      return it("real (tracking) marking functionality", function() {
        set({
          cursor: [2, 2]
        });
        keystroke('mq');
        set({
          cursor: [1, 2]
        });
        return ensure(['dd', 'escape', '`q'], {
          cursor: [1, 2]
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy92aW0tc3RhdGUtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0NBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLE9BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBRGQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FGWCxDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFM7SUFBQSxDQUFYLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixNQUFBLEVBQUEsQ0FBRyxx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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/vim-state-spec.coffee
