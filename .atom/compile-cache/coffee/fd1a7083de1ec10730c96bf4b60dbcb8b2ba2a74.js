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
        editor.setText("1\n2\n3\n4\n5\n6\n7\n8\n9\n10");
        spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(2);
        spyOn(editorElement, 'getLastVisibleScreenRow').andReturn(8);
        spyOn(editor, 'getLineHeightInPixels').andReturn(10);
        spyOn(editorElement, 'getScrollTop').andReturn(100);
        spyOn(editorElement, 'setScrollTop');
        return spyOn(editor, 'setCursorScreenPosition');
      });
      describe("the ctrl-e keybinding", function() {
        beforeEach(function() {
          return spyOn(editor, 'getCursorScreenPosition').andReturn({
            row: 3,
            column: 0
          });
        });
        return it("moves the screen down by one and keeps cursor onscreen", function() {
          keystroke({
            ctrl: 'e'
          });
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(110);
          return expect(editor.setCursorScreenPosition).toHaveBeenCalledWith([4, 0]);
        });
      });
      return describe("the ctrl-y keybinding", function() {
        beforeEach(function() {
          return spyOn(editor, 'getCursorScreenPosition').andReturn({
            row: 6,
            column: 0
          });
        });
        return it("moves the screen up by one and keeps the cursor onscreen", function() {
          keystroke({
            ctrl: 'y'
          });
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(90);
          return expect(editor.setCursorScreenPosition).toHaveBeenCalledWith([5, 0]);
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
        var keydownCodeForEnter;
        keydownCodeForEnter = '\r';
        return it("moves the screen to position cursor at the top of the window and moves cursor to first non-blank in the line", function() {
          keystroke(['z', keydownCodeForEnter]);
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zt keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and leave cursor in the same column", function() {
          keystroke('zt');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z. keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z.');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zz keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and leave cursor in the same column", function() {
          keystroke('zz');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z- keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z-');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      return describe("the zb keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and leave cursor in the same column", function() {
          keystroke('zb');
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
          keystroke('zs');
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
          keystroke('ze');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9zY3JvbGwtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsV0FBQTs7QUFBQSxFQUFDLGNBQWUsT0FBQSxDQUFRLGVBQVIsRUFBZixXQUFELENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsUUFBQSw2REFBQTtBQUFBLElBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtBQUFBLFFBRUMsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FGZCxDQUFBO2VBR0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEIsRUFKVTtNQUFBLENBQVosRUFEUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFTQSxTQUFBLENBQVUsU0FBQSxHQUFBO2FBQ1IsUUFBUSxDQUFDLGVBQVQsQ0FBQSxFQURRO0lBQUEsQ0FBVixDQVRBLENBQUE7QUFBQSxJQVlBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLCtCQUFmLENBQUEsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxDQUFNLGFBQU4sRUFBcUIsMEJBQXJC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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/scroll-spec.coffee
