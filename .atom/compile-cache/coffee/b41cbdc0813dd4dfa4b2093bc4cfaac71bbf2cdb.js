(function() {
  var TextData, getVimState, swrap, _ref,
    __slice = [].slice;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, TextData = _ref.TextData;

  swrap = require('../lib/selection-wrapper');

  describe("Visual Blockwise", function() {
    var blockTexts, editor, editorElement, ensure, ensureBlockwiseSelection, keystroke, selectBlockwise, set, textAfterDeleted, textData, textInitial, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    textInitial = "01234567890123456789\n1-------------------\n2----A---------B----\n3----***********----\n4----+++++++++++----\n5----C---------D----\n6-------------------";
    textAfterDeleted = "01234567890123456789\n1-------------------\n2----\n3----\n4----\n5----\n6-------------------";
    blockTexts = ['56789012345', '-----------', 'A---------B', '***********', '+++++++++++', 'C---------D', '-----------'];
    textData = new TextData(textInitial);
    selectBlockwise = function() {
      set({
        cursor: [2, 5]
      });
      return ensure('v 3 j 1 0 l ctrl-v', {
        mode: ['visual', 'blockwise'],
        selectedBufferRange: [[[2, 5], [2, 16]], [[3, 5], [3, 16]], [[4, 5], [4, 16]], [[5, 5], [5, 16]]],
        selectedText: blockTexts.slice(2, 6)
      });
    };
    ensureBlockwiseSelection = function(o) {
      var bs, first, head, last, others, s, selections, tail, _i, _j, _k, _len, _len1, _results;
      selections = editor.getSelectionsOrderedByBufferPosition();
      if (selections.length === 1) {
        first = last = selections[0];
      } else {
        first = selections[0], others = 3 <= selections.length ? __slice.call(selections, 1, _i = selections.length - 1) : (_i = 1, []), last = selections[_i++];
      }
      head = (function() {
        switch (o.head) {
          case 'top':
            return first;
          case 'bottom':
            return last;
        }
      })();
      bs = vimState.getLastBlockwiseSelection();
      expect(bs.getHeadSelection()).toBe(head);
      tail = (function() {
        switch (o.tail) {
          case 'top':
            return first;
          case 'bottom':
            return last;
        }
      })();
      expect(bs.getTailSelection()).toBe(tail);
      for (_j = 0, _len = others.length; _j < _len; _j++) {
        s = others[_j];
        expect(bs.getHeadSelection()).not.toBe(s);
        expect(bs.getTailSelection()).not.toBe(s);
      }
      if (o.reversed != null) {
        _results = [];
        for (_k = 0, _len1 = selections.length; _k < _len1; _k++) {
          s = selections[_k];
          _results.push(expect(s.isReversed()).toBe(o.reversed));
        }
        return _results;
      }
    };
    beforeEach(function() {
      getVimState(function(state, vimEditor) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
      });
      return runs(function() {
        return set({
          text: textInitial
        });
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("j", function() {
      beforeEach(function() {
        set({
          cursor: [3, 5]
        });
        return ensure('v 1 0 l ctrl-v', {
          selectedText: blockTexts[3],
          mode: ['visual', 'blockwise']
        });
      });
      it("add selection to down direction", function() {
        ensure('j', {
          selectedText: blockTexts.slice(3, 5)
        });
        return ensure('j', {
          selectedText: blockTexts.slice(3, 6)
        });
      });
      it("delete selection when blocwise is reversed", function() {
        ensure('3 k', {
          selectedTextOrdered: blockTexts.slice(0, 4)
        });
        ensure('j', {
          selectedTextOrdered: blockTexts.slice(1, 4)
        });
        return ensure('2 j', {
          selectedTextOrdered: blockTexts[3]
        });
      });
      return it("keep tail row when reversed status changed", function() {
        ensure('j', {
          selectedText: blockTexts.slice(3, 5)
        });
        return ensure('2 k', {
          selectedTextOrdered: blockTexts.slice(2, 4)
        });
      });
    });
    describe("k", function() {
      beforeEach(function() {
        set({
          cursor: [3, 5]
        });
        return ensure('v 1 0 l ctrl-v', {
          selectedText: blockTexts[3],
          mode: ['visual', 'blockwise']
        });
      });
      it("add selection to up direction", function() {
        ensure('k', {
          selectedTextOrdered: blockTexts.slice(2, 4)
        });
        return ensure('k', {
          selectedTextOrdered: blockTexts.slice(1, 4)
        });
      });
      return it("delete selection when blocwise is reversed", function() {
        ensure('3 j', {
          selectedTextOrdered: blockTexts.slice(3, 7)
        });
        ensure('k', {
          selectedTextOrdered: blockTexts.slice(3, 6)
        });
        return ensure('2 k', {
          selectedTextOrdered: blockTexts[3]
        });
      });
    });
    describe("C", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("change-to-last-character-of-line for each selection", function() {
        ensure('C', {
          mode: 'insert',
          cursor: [[2, 5], [3, 5], [4, 5], [5, 5]],
          text: textAfterDeleted
        });
        editor.insertText("!!!");
        return ensure({
          mode: 'insert',
          cursor: [[2, 8], [3, 8], [4, 8], [5, 8]],
          text: "01234567890123456789\n1-------------------\n2----!!!\n3----!!!\n4----!!!\n5----!!!\n6-------------------"
        });
      });
    });
    describe("D", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("delete-to-last-character-of-line for each selection", function() {
        return ensure('D', {
          text: textAfterDeleted,
          cursor: [2, 4],
          mode: 'normal'
        });
      });
    });
    describe("I", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("enter insert mode with each cursors position set to start of selection", function() {
        keystroke('I');
        editor.insertText("!!!");
        return ensure({
          text: "01234567890123456789\n1-------------------\n2----!!!A---------B----\n3----!!!***********----\n4----!!!+++++++++++----\n5----!!!C---------D----\n6-------------------",
          cursor: [[2, 8], [3, 8], [4, 8], [5, 8]],
          mode: 'insert'
        });
      });
    });
    describe("A", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("enter insert mode with each cursors position set to end of selection", function() {
        keystroke('A');
        editor.insertText("!!!");
        return ensure({
          text: "01234567890123456789\n1-------------------\n2----A---------B!!!----\n3----***********!!!----\n4----+++++++++++!!!----\n5----C---------D!!!----\n6-------------------",
          cursor: [[2, 19], [3, 19], [4, 19], [5, 19]]
        });
      });
    });
    describe("o and O keybinding", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      describe('o', function() {
        return it("change blockwiseHead to opposite side and reverse selection", function() {
          keystroke('o');
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true
          });
          keystroke('o');
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
      });
      return describe('capital O', function() {
        return it("reverse each selection", function() {
          keystroke('O');
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: true
          });
          keystroke('O');
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
      });
    });
    describe("shift from characterwise to blockwise", function() {
      describe("when selection is not reversed", function() {
        beforeEach(function() {
          set({
            cursor: [2, 5]
          });
          return ensure('v', {
            selectedText: 'A',
            mode: ['visual', 'characterwise']
          });
        });
        it('case-1', function() {
          ensure('3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A', '*', '+', 'C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
        it('case-2', function() {
          ensure('h 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['-A', '-*', '-+', '-C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: true
          });
        });
        it('case-3', function() {
          ensure('2 h 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['--A', '--*', '--+', '--C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: true
          });
        });
        it('case-4', function() {
          ensure('l 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A-', '**', '++', 'C-']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
        return it('case-5', function() {
          ensure('2 l 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A--', '***', '+++', 'C--']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false
          });
        });
      });
      return describe("when selection is reversed", function() {
        beforeEach(function() {
          set({
            cursor: [5, 5]
          });
          return ensure('v', {
            selectedText: 'C',
            mode: ['visual', 'characterwise']
          });
        });
        it('case-1', function() {
          ensure('3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A', '*', '+', 'C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true
          });
        });
        it('case-2', function() {
          ensure('h 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['-A', '-*', '-+', '-C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true
          });
        });
        it('case-3', function() {
          ensure('2 h 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['--A', '--*', '--+', '--C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true
          });
        });
        it('case-4', function() {
          ensure('l 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A-', '**', '++', 'C-']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: false
          });
        });
        return it('case-5', function() {
          ensure('2 l 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A--', '***', '+++', 'C--']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: false
          });
        });
      });
    });
    describe("shift from blockwise to characterwise", function() {
      var ensureCharacterwiseWasRestored, preserveSelection;
      preserveSelection = function() {
        var cursor, mode, selectedBufferRange, selectedText;
        selectedText = editor.getSelectedText();
        selectedBufferRange = editor.getSelectedBufferRange();
        cursor = editor.getCursorBufferPosition();
        mode = [vimState.mode, vimState.submode];
        return {
          selectedText: selectedText,
          selectedBufferRange: selectedBufferRange,
          cursor: cursor,
          mode: mode
        };
      };
      ensureCharacterwiseWasRestored = function(keystroke) {
        var characterwiseState;
        ensure(keystroke, {
          mode: ['visual', 'characterwise']
        });
        characterwiseState = preserveSelection();
        ensure('ctrl-v', {
          mode: ['visual', 'blockwise']
        });
        return ensure('v', characterwiseState);
      };
      describe("when selection is not reversed", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 5]
          });
        });
        it('case-1', function() {
          return ensureCharacterwiseWasRestored('v');
        });
        it('case-2', function() {
          return ensureCharacterwiseWasRestored('v 3 j');
        });
        it('case-3', function() {
          return ensureCharacterwiseWasRestored('v h 3 j');
        });
        it('case-4', function() {
          return ensureCharacterwiseWasRestored('v 2 h 3 j');
        });
        it('case-5', function() {
          return ensureCharacterwiseWasRestored('v l 3 j');
        });
        return it('case-6', function() {
          return ensureCharacterwiseWasRestored('v 2 l 3 j');
        });
      });
      return describe("when selection is reversed", function() {
        beforeEach(function() {
          return set({
            cursor: [5, 5]
          });
        });
        it('case-1', function() {
          return ensureCharacterwiseWasRestored('v');
        });
        it('case-2', function() {
          return ensureCharacterwiseWasRestored('v 3 k');
        });
        it('case-3', function() {
          return ensureCharacterwiseWasRestored('v h 3 k');
        });
        it('case-4', function() {
          return ensureCharacterwiseWasRestored('v 2 h 3 k');
        });
        it('case-5', function() {
          return ensureCharacterwiseWasRestored('v l 3 k');
        });
        return it('case-6', function() {
          return ensureCharacterwiseWasRestored('v 2 l 3 k');
        });
      });
    });
    return describe("gv feature", function() {
      var ensureRestored, preserveSelection;
      preserveSelection = function() {
        var cursor, mode, s, selectedBufferRangeOrdered, selectedTextOrdered, selections;
        selections = editor.getSelectionsOrderedByBufferPosition();
        selectedTextOrdered = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = selections.length; _i < _len; _i++) {
            s = selections[_i];
            _results.push(s.getText());
          }
          return _results;
        })();
        selectedBufferRangeOrdered = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = selections.length; _i < _len; _i++) {
            s = selections[_i];
            _results.push(s.getBufferRange());
          }
          return _results;
        })();
        cursor = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = selections.length; _i < _len; _i++) {
            s = selections[_i];
            _results.push(s.getHeadScreenPosition());
          }
          return _results;
        })();
        mode = [vimState.mode, vimState.submode];
        return {
          selectedTextOrdered: selectedTextOrdered,
          selectedBufferRangeOrdered: selectedBufferRangeOrdered,
          cursor: cursor,
          mode: mode
        };
      };
      ensureRestored = function(keystroke, spec) {
        var preserved;
        ensure(keystroke, spec);
        preserved = preserveSelection();
        ensure('escape j j', {
          mode: 'normal',
          selectedText: ''
        });
        return ensure('g v', preserved);
      };
      describe("linewise selection", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("selection is not reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V j', {
              selectedText: textData.getLines([2, 3]),
              mode: ['visual', 'linewise']
            });
          });
        });
        return describe("selection is reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V k', {
              selectedText: textData.getLines([1, 2]),
              mode: ['visual', 'linewise']
            });
          });
        });
      });
      describe("characterwise selection", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("selection is not reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v j', {
              selectedText: "2----A---------B----\n3",
              mode: ['visual', 'characterwise']
            });
          });
        });
        return describe("selection is reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v k', {
              selectedText: "1-------------------\n2",
              mode: ['visual', 'characterwise']
            });
          });
        });
      });
      return describe("blockwise selection", function() {
        describe("selection is not reversed", function() {
          it('restore previous selection case-1', function() {
            set({
              cursor: [2, 5]
            });
            keystroke('ctrl-v 1 0 l');
            return ensureRestored('3 j', {
              selectedText: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
          return it('restore previous selection case-2', function() {
            set({
              cursor: [5, 5]
            });
            keystroke('ctrl-v 1 0 l');
            return ensureRestored('3 k', {
              selectedTextOrdered: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
        });
        return describe("selection is reversed", function() {
          it('restore previous selection case-1', function() {
            set({
              cursor: [2, 15]
            });
            keystroke('ctrl-v 1 0 h');
            return ensureRestored('3 j', {
              selectedText: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
          return it('restore previous selection case-2', function() {
            set({
              cursor: [5, 15]
            });
            keystroke('ctrl-v 1 0 h');
            return ensureRestored('3 k', {
              selectedTextOrdered: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy92aXN1YWwtYmxvY2t3aXNlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxPQUEwQixPQUFBLENBQVEsZUFBUixDQUExQixFQUFDLG1CQUFBLFdBQUQsRUFBYyxnQkFBQSxRQUFkLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDBCQUFSLENBRFIsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsUUFBQSw4SkFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFDQSxXQUFBLEdBQWMsMEpBRGQsQ0FBQTtBQUFBLElBV0EsZ0JBQUEsR0FBbUIsOEZBWG5CLENBQUE7QUFBQSxJQXFCQSxVQUFBLEdBQWEsQ0FDWCxhQURXLEVBRVgsYUFGVyxFQUdYLGFBSFcsRUFJWCxhQUpXLEVBS1gsYUFMVyxFQU1YLGFBTlcsRUFPWCxhQVBXLENBckJiLENBQUE7QUFBQSxJQThCQSxRQUFBLEdBQWUsSUFBQSxRQUFBLENBQVMsV0FBVCxDQTlCZixDQUFBO0FBQUEsSUFnQ0EsZUFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxHQUFBLENBQUk7QUFBQSxRQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7T0FBSixDQUFBLENBQUE7YUFDQSxNQUFBLENBQU8sb0JBQVAsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLFdBQVgsQ0FBTjtBQUFB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/visual-blockwise-spec.coffee
