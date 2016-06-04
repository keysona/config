(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Scrolling", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref;
    _ref = [], set = _ref[0], ensure = _ref[1], keystroke = _ref[2], editor = _ref[3], editorElement = _ref[4], vimState = _ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke;
        return jasmine.attachToDOM(editorElement);
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("scrolling keybindings", function() {
      beforeEach(function() {
        set({
          cursor: [1, 2],
          text: "100\n200\n300\n400\n500\n600\n700\n800\n900\n1000"
        });
        editorElement.setHeight(editorElement.getHeight() * 4 / 10);
        return expect(editor.getVisibleRowRange()).toEqual([0, 4]);
      });
      return describe("the ctrl-e and ctrl-y keybindings", function() {
        return it("moves the screen up and down by one and keeps cursor onscreen", function() {
          ensure('ctrl-e', {
            cursor: [2, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(5);
          ensure('2 ctrl-e', {
            cursor: [4, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(3);
          expect(editor.getLastVisibleScreenRow()).toBe(7);
          ensure('2 ctrl-y', {
            cursor: [2, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          return expect(editor.getLastVisibleScreenRow()).toBe(5);
        });
      });
    });
    describe("scroll cursor keybindings", function() {
      beforeEach(function() {
        var _i, _results;
        editor.setText((function() {
          _results = [];
          for (_i = 1; _i <= 200; _i++){ _results.push(_i); }
          return _results;
        }).apply(this).join("\n"));
        editorElement.style.lineHeight = "20px";
        editorElement.component.sampleFontStyling();
        editorElement.setHeight(20 * 10);
        spyOn(editor, 'moveToFirstCharacterOfLine');
        spyOn(editorElement, 'setScrollTop');
        spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(90);
        spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(110);
        return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
          top: 1000,
          left: 0
        });
      });
      describe("the z<CR> keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z enter');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zt keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and leave cursor in the same column", function() {
          keystroke('z t');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z. keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z .');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zz keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and leave cursor in the same column", function() {
          keystroke('z z');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z- keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z -');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      return describe("the zb keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and leave cursor in the same column", function() {
          keystroke('z b');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
    });
    return describe("horizontal scroll cursor keybindings", function() {
      beforeEach(function() {
        var i, text, _i;
        editorElement.setWidth(600);
        editorElement.setHeight(600);
        editorElement.style.lineHeight = "10px";
        editorElement.style.font = "16px monospace";
        atom.views.performDocumentPoll();
        text = "";
        for (i = _i = 100; _i <= 199; i = ++_i) {
          text += "" + i + " ";
        }
        editor.setText(text);
        return editor.setCursorBufferPosition([0, 0]);
      });
      describe("the zs keybinding", function() {
        var startPosition, zsPos;
        zsPos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          keystroke('z s');
          return editorElement.getScrollLeft();
        };
        startPosition = NaN;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        xit("does nothing near the start of the line", function() {
          var pos1;
          pos1 = zsPos(1);
          return expect(pos1).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the left edge of the editor", function() {
          var pos10, pos11;
          pos10 = zsPos(10);
          expect(pos10).toBeGreaterThan(startPosition);
          pos11 = zsPos(11);
          return expect(pos11 - pos10).toEqual(10);
        });
        it("does nothing near the end of the line", function() {
          var pos340, pos390, posEnd;
          posEnd = zsPos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos390 = zsPos(390);
          expect(pos390).toEqual(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 390]);
          pos340 = zsPos(340);
          return expect(pos340).toEqual(posEnd);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zsPos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zsPos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
      return describe("the ze keybinding", function() {
        var startPosition, zePos;
        zePos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          keystroke('z e');
          return editorElement.getScrollLeft();
        };
        startPosition = NaN;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        it("does nothing near the start of the line", function() {
          var pos1, pos40;
          pos1 = zePos(1);
          expect(pos1).toEqual(startPosition);
          pos40 = zePos(40);
          return expect(pos40).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the right edge of the editor", function() {
          var pos109, pos110;
          pos110 = zePos(110);
          expect(pos110).toBeGreaterThan(startPosition);
          pos109 = zePos(109);
          return expect(pos110 - pos109).toEqual(9);
        });
        it("does nothing when very near the end of the line", function() {
          var pos380, pos382, pos397, posEnd;
          posEnd = zePos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos397 = zePos(397);
          expect(pos397).toBeLessThan(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 397]);
          pos380 = zePos(380);
          expect(pos380).toBeLessThan(posEnd);
          pos382 = zePos(382);
          return expect(pos382 - pos380).toEqual(19);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zePos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zePos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zY3JvbGwtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsV0FBQTs7QUFBQSxFQUFDLGNBQWUsT0FBQSxDQUFRLGVBQVIsRUFBZixXQUFELENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsUUFBQSw2REFBQTtBQUFBLElBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtBQUFBLFFBRUMsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FGZCxDQUFBO2VBR0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEIsRUFKVTtNQUFBLENBQVosRUFEUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFTQSxTQUFBLENBQVUsU0FBQSxHQUFBO2FBQ1IsUUFBUSxDQUFDLGVBQVQsQ0FBQSxFQURRO0lBQUEsQ0FBVixDQVRBLENBQUE7QUFBQSxJQVlBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxHQUFBLENBQ0U7QUFBQSxVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7QUFBQSxVQUNBLElBQUEsRUFB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/scroll-spec.coffee