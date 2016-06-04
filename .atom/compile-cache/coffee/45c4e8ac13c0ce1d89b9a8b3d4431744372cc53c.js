(function() {
  var TextData, dispatch, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  settings = require('../lib/settings');

  describe("Operator general", function() {
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
    describe("cancelling operations", function() {
      return it("clear pending operation", function() {
        keystroke('/');
        expect(vimState.operationStack.isEmpty()).toBe(false);
        vimState.searchInput.cancel();
        expect(vimState.operationStack.isEmpty()).toBe(true);
        return expect(function() {
          return vimState.searchInput.cancel();
        }).not.toThrow();
      });
    });
    describe("the x keybinding", function() {
      describe("on a line with content", function() {
        describe("without vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [1, 4]
            });
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters with a count", function() {
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            return ensure('3 x', {
              text: 'a\n0123\n\nxyz',
              cursor: [0, 0],
              register: {
                '"': {
                  text: 'bc'
                }
              }
            });
          });
        });
        describe("with multiple cursors", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [[1, 4], [0, 1]]
            });
          });
          return it("is undone as one operation", function() {
            ensure('x', {
              text: "ac\n01235\n\nxyz"
            });
            return ensure('u', {
              text: 'abc\n012345\n\nxyz'
            });
          });
        });
        return describe("with vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            set({
              text: 'abc\n012345\n\nxyz',
              cursor: [1, 4]
            });
            return settings.set('wrapLeftRightMotion', true);
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters and newlines with a count", function() {
            settings.set('wrapLeftRightMotion', true);
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            ensure('3 x', {
              text: 'a0123\n\nxyz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'bc\n'
                }
              }
            });
            return ensure('7 x', {
              text: 'ayz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: '0123\n\nx'
                }
              }
            });
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        it("deletes nothing on an empty line when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('x', {
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        return it("deletes an empty line when vim-mode-plus.wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('x', {
            text: "abc\n012345\nxyz",
            cursor: [2, 0]
          });
        });
      });
    });
    describe("the X keybinding", function() {
      describe("on a line with content", function() {
        beforeEach(function() {
          return set({
            text: "ab\n012345",
            cursor: [1, 2]
          });
        });
        return it("deletes a character", function() {
          ensure('X', {
            text: 'ab\n02345',
            cursor: [1, 1],
            register: {
              '"': {
                text: '1'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: 'ab2345',
            cursor: [0, 2],
            register: {
              '"': {
                text: '\n'
              }
            }
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        it("deletes nothing when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('X', {
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        return it("deletes the newline when wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: "012345\nabcdef",
            cursor: [0, 5]
          });
        });
      });
    });
    describe("the d keybinding", function() {
      it("enters operator-pending mode", function() {
        return ensure('d', {
          mode: 'operator-pending'
        });
      });
      describe("when followed by a d", function() {
        it("deletes the current line and exits operator-pending mode", function() {
          set({
            text: "12345\nabcde\n\nABCDE",
            cursor: [1, 1]
          });
          return ensure('d d', {
            text: '12345\n\nABCDE',
            cursor: [1, 0],
            register: {
              '"': {
                text: 'abcde\n'
              }
            },
            mode: 'normal'
          });
        });
        it("deletes the last line and always make non-blank-line last line", function() {
          set({
            text: "12345\nabcde\nABCDE\n",
            cursor: [2, 1]
          });
          return ensure('d d', {
            text: "12345\nabcde\n",
            cursor: [1, 0]
          });
        });
        return it("leaves the cursor on the first nonblank character", function() {
          set({
            text: '12345\n  abcde\n',
            cursor: [0, 4]
          });
          return ensure('d d', {
            text: "  abcde\n",
            cursor: [0, 2]
          });
        });
      });
      describe("undo behavior", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE\nQWERT";
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [1, 1]
          });
        });
        it("undoes both lines", function() {
          return ensure('d 2 d u', {
            text: originalText,
            selectedText: ''
          });
        });
        return describe("with multiple cursors", function() {
          beforeEach(function() {
            return set({
              cursor: [[1, 1], [0, 0]]
            });
          });
          describe("setCursorToStartOfChangeOnUndoRedo is true(default)", function() {
            return it("is undone as one operation and clear cursors", function() {
              return ensure('d l u', {
                text: "12345\nabcde\nABCDE\nQWERT",
                selectedText: [''],
                numCursors: 1
              });
            });
          });
          return describe("setCursorToStartOfChangeOnUndoRedo is false", function() {
            beforeEach(function() {
              return settings.set('setCursorToStartOfChangeOnUndoRedo', false);
            });
            return it("is undone as one operation", function() {
              return ensure('d l u', {
                text: "12345\nabcde\nABCDE\nQWERT",
                selectedText: ['', ''],
                numCursors: 2
              });
            });
          });
        });
      });
      describe("when followed by a w", function() {
        it("deletes the next word until the end of the line and exits operator-pending mode", function() {
          set({
            text: 'abcd efg\nabc',
            cursor: [0, 5]
          });
          return ensure('d w', {
            text: "abcd \nabc",
            cursor: [0, 4],
            mode: 'normal'
          });
        });
        return it("deletes to the beginning of the next word", function() {
          set({
            text: 'abcd efg',
            cursor: [0, 2]
          });
          ensure('d w', {
            text: 'abefg',
            cursor: [0, 2]
          });
          set({
            text: 'one two three four',
            cursor: [0, 0]
          });
          return ensure('d 3 w', {
            text: 'four',
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by an iw", function() {
        return it("deletes the containing word", function() {
          set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
          ensure('d', {
            mode: 'operator-pending'
          });
          return ensure('i w', {
            text: "12345  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: 'abcde'
              }
            },
            mode: 'normal'
          });
        });
      });
      describe("when followed by a j", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE\n";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the file", function() {
          return it("deletes the next two lines", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d j', {
              text: 'ABCDE\n'
            });
          });
        });
        describe("on the middle of second line", function() {
          return it("deletes the last two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d j', {
              text: '12345\n'
            });
          });
        });
        return describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [1, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d j', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
      });
      describe("when followed by an k", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the end of the file", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [2, 4]
            });
            return ensure('d k', {
              text: '12345\n'
            });
          });
        });
        describe("on the beginning of the file", function() {
          return xit("deletes nothing", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d k', {
              text: originalText
            });
          });
        });
        describe("when on the middle of second line", function() {
          return it("deletes the first two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d k', {
              text: 'ABCDE'
            });
          });
        });
        describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [2, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d k', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
        return xdescribe("when it can't move", function() {
          var cursorOriginal, textOriginal;
          textOriginal = "a\nb\n";
          cursorOriginal = [0, 0];
          return it("deletes delete nothing", function() {
            set({
              text: textOriginal,
              cursor: cursorOriginal
            });
            return ensure('d k', {
              text: textOriginal,
              cursor: cursorOriginal
            });
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
      });
      describe("when followed by a t)", function() {
        return describe("with the entire line yanked before", function() {
          beforeEach(function() {
            return set({
              text: "test (xyz)",
              cursor: [0, 6]
            });
          });
          return it("deletes until the closing parenthesis", function() {
            return ensure([
              'y y d t', {
                input: ')'
              }
            ], {
              text: 'test ()',
              cursor: [0, 6]
            });
          });
        });
      });
      return describe("with multiple cursors", function() {
        it("deletes each selection", function() {
          set({
            text: "abcd\n1234\nABCD\n",
            cursorBuffer: [[0, 1], [1, 2], [2, 3]]
          });
          return ensure('d e', {
            text: "a\n12\nABC\n",
            cursorBuffer: [[0, 0], [1, 1], [2, 2]]
          });
        });
        return it("doesn't delete empty selections", function() {
          set({
            text: "abcd\nabc\nabd",
            cursorBuffer: [[0, 0], [1, 0], [2, 0]]
          });
          return ensure([
            'd t', {
              input: 'd'
            }
          ], {
            text: "d\nabc\nd",
            cursorBuffer: [[0, 0], [1, 0], [2, 0]]
          });
        });
      });
    });
    describe("the D keybinding", function() {
      beforeEach(function() {
        editor.getBuffer().setText("012\n");
        set({
          cursor: [0, 1]
        });
        return keystroke('D');
      });
      return it("deletes the contents until the end of the line", function() {
        return ensure({
          text: "0\n"
        });
      });
    });
    describe("the y keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012 345\nabc\n",
          cursor: [0, 4]
        });
      });
      describe("when selected lines in visual linewise mode", function() {
        beforeEach(function() {
          return keystroke('V j y');
        });
        it("is in linewise motion", function() {
          return ensure({
            register: {
              '"': {
                type: 'linewise'
              }
            }
          });
        });
        it("saves the lines to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("places the cursor at the beginning of the selection", function() {
          return ensure({
            cursorBuffer: [0, 0]
          });
        });
      });
      describe("when followed by a second y ", function() {
        beforeEach(function() {
          return keystroke('y y');
        });
        it("saves the line to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: "012 345\n"
              }
            }
          });
        });
        return it("leaves the cursor at the starting position", function() {
          return ensure({
            cursor: [0, 4]
          });
        });
      });
      describe("when useClipboardAsDefaultRegister enabled", function() {
        return it("writes to clipboard", function() {
          settings.set('useClipboardAsDefaultRegister', true);
          keystroke('y y');
          return expect(atom.clipboard.read()).toBe('012 345\n');
        });
      });
      describe("when followed with a repeated y", function() {
        beforeEach(function() {
          return keystroke('y 2 y');
        });
        it("copies n lines, starting from the current", function() {
          return ensure({
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("leaves the cursor at the starting position", function() {
          return ensure({
            cursor: [0, 4]
          });
        });
      });
      describe("with a register", function() {
        beforeEach(function() {
          return keystroke([
            '"', {
              input: 'a'
            }, 'y y'
          ]);
        });
        it("saves the line to the a register", function() {
          return ensure({
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
        });
        return it("appends the line to the A register", function() {
          return ensure([
            '"', {
              input: 'A'
            }, 'y y'
          ], {
            register: {
              a: {
                text: "012 345\n012 345\n"
              }
            }
          });
        });
      });
      describe("with a forward motion", function() {
        beforeEach(function() {
          return keystroke('y e');
        });
        it("saves the selected text to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: '345'
              }
            }
          });
        });
        it("leaves the cursor at the starting position", function() {
          return ensure({
            cursor: [0, 4]
          });
        });
        return it("does not yank when motion fails", function() {
          return ensure([
            'y t', {
              input: 'x'
            }
          ], {
            register: {
              '"': {
                text: '345'
              }
            }
          });
        });
      });
      describe("with a text object", function() {
        return it("moves the cursor to the beginning of the text object", function() {
          set({
            cursorBuffer: [0, 5]
          });
          return ensure('y i w', {
            cursorBuffer: [0, 4]
          });
        });
      });
      describe("with a left motion", function() {
        beforeEach(function() {
          return keystroke('y h');
        });
        it("saves the left letter to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: ' '
              }
            }
          });
        });
        return it("moves the cursor position to the left", function() {
          return ensure({
            cursor: [0, 3]
          });
        });
      });
      describe("with a down motion", function() {
        beforeEach(function() {
          return keystroke('y j');
        });
        it("saves both full lines to the default register", function() {
          return ensure({
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("leaves the cursor at the starting position", function() {
          return ensure({
            cursor: [0, 4]
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('y G P', {
              text: '12345\nabcde\nABCDE\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('y G P', {
              text: '12345\nabcde\nABCDE\nabcde\nABCDE'
            });
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        return it("moves each cursor and copies the last selection's text", function() {
          set({
            text: "  abcd\n  1234",
            cursorBuffer: [[0, 0], [1, 5]]
          });
          return ensure('y ^', {
            register: {
              '"': {
                text: '123'
              }
            },
            cursorBuffer: [[0, 0], [1, 2]]
          });
        });
      });
      return describe("stayOnYank setting", function() {
        var text;
        text = null;
        beforeEach(function() {
          settings.set('stayOnYank', true);
          text = new TextData("0_234567\n1_234567\n2_234567\n\n4_234567\n");
          return set({
            text: text.getRaw(),
            cursor: [1, 2]
          });
        });
        it("don't move cursor after yank from normal-mode", function() {
          ensure("y i p", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([0, 1, 2])
              }
            }
          });
          ensure("j y y", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: text.getLines([2])
              }
            }
          });
          return ensure("k .", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
        });
        it("don't move cursor after yank from visual-linewise", function() {
          ensure("V y", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          return ensure("V j y", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: text.getLines([1, 2])
              }
            }
          });
        });
        return it("don't move cursor after yank from visual-characterwise", function() {
          ensure("v l l y", {
            cursorBuffer: [1, 4],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v h h y", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v j y", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: "234567\n2_2"
              }
            }
          });
          return ensure("v 2 k y", {
            cursorBuffer: [0, 2],
            register: {
              '"': {
                text: "234567\n1_234567\n2_2"
              }
            }
          });
        });
      });
    });
    describe("the yy keybinding", function() {
      describe("on a single line file", function() {
        beforeEach(function() {
          return set({
            text: "exclamation!\n",
            cursor: [0, 0]
          });
        });
        return it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "exclamation!\n"
              }
            },
            text: "exclamation!\nexclamation!\n"
          });
        });
      });
      return describe("on a single line file with no newline", function() {
        beforeEach(function() {
          return set({
            text: "no newline!",
            cursor: [0, 0]
          });
        });
        it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!"
          });
        });
        return it("copies the entire line and pastes it respecting count and new lines", function() {
          return ensure('y y 2 p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!\nno newline!"
          });
        });
      });
    });
    describe("the Y keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012 345\nabc\n",
          cursor: [0, 4]
        });
      });
      return it("saves the line to the default register", function() {
        return ensure('Y', {
          cursor: [0, 4],
          register: {
            '"': {
              text: "012 345\n"
            }
          }
        });
      });
    });
    describe("the p keybinding", function() {
      describe("with character contents", function() {
        beforeEach(function() {
          set({
            text: "012\n",
            cursor: [0, 0]
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              'a': {
                text: 'a'
              }
            }
          });
          return atom.clipboard.write("clip");
        });
        describe("from the default register", function() {
          beforeEach(function() {
            return keystroke('p');
          });
          return it("inserts the contents", function() {
            return ensure({
              text: "034512\n",
              cursor: [0, 3]
            });
          });
        });
        describe("at the end of a line", function() {
          beforeEach(function() {
            set({
              cursor: [0, 2]
            });
            return keystroke('p');
          });
          return it("positions cursor correctly", function() {
            return ensure({
              text: "012345\n",
              cursor: [0, 5]
            });
          });
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            return ensure('p', {
              text: "0clip12\n"
            });
          });
        });
        describe("from a specified register", function() {
          beforeEach(function() {
            return keystroke([
              '"', {
                input: 'a'
              }, 'p'
            ]);
          });
          return it("inserts the contents of the 'a' register", function() {
            return ensure({
              text: "0a12\n",
              cursor: [0, 1]
            });
          });
        });
        return describe("at the end of a line", function() {
          return it("inserts before the current line's newline", function() {
            set({
              text: "abcde\none two three",
              cursor: [1, 4]
            });
            return ensure('d $ k $ p', {
              text: "abcdetwo three\none "
            });
          });
        });
      });
      describe("with linewise contents", function() {
        describe("on a single line", function() {
          beforeEach(function() {
            return set({
              text: '012',
              cursor: [0, 1],
              register: {
                '"': {
                  text: " 345\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register", function() {
            return ensure('p', {
              text: "012\n 345",
              cursor: [1, 1]
            });
          });
          return it("replaces the current selection and put cursor to the first char of line", function() {
            return ensure('v p', {
              text: "0\n 345\n2",
              cursor: [1, 1]
            });
          });
        });
        return describe("on multiple lines", function() {
          beforeEach(function() {
            return set({
              text: "012\n 345",
              register: {
                '"': {
                  text: " 456\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register at middle line", function() {
            set({
              cursor: [0, 1]
            });
            keystroke('p');
            return ensure({
              text: "012\n 456\n 345",
              cursor: [1, 1]
            });
          });
          return it("inserts the contents of the default register at end of line", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('p', {
              text: "012\n 345\n 456",
              cursor: [2, 1]
            });
          });
        });
      });
      describe("with multiple linewise contents", function() {
        beforeEach(function() {
          set({
            text: "012\nabc",
            cursor: [1, 0],
            register: {
              '"': {
                text: " 345\n 678\n",
                type: 'linewise'
              }
            }
          });
          return keystroke('p');
        });
        return it("inserts the contents of the default register", function() {
          return ensure({
            text: "012\nabc\n 345\n 678",
            cursor: [2, 1]
          });
        });
      });
      describe("pasting twice", function() {
        beforeEach(function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [1, 1],
            register: {
              '"': {
                text: '123'
              }
            }
          });
          return keystroke('2 p');
        });
        it("inserts the same line twice", function() {
          return ensure({
            text: "12345\nab123123cde\nABCDE\nQWERT"
          });
        });
        return describe("when undone", function() {
          return it("removes both lines", function() {
            return ensure('u', {
              text: "12345\nabcde\nABCDE\nQWERT"
            });
          });
        });
      });
      describe("support multiple cursors", function() {
        return it("paste text for each cursors", function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [[1, 0], [2, 0]],
            register: {
              '"': {
                text: 'ZZZ'
              }
            }
          });
          return ensure('p', {
            text: "12345\naZZZbcde\nAZZZBCDE\nQWERT",
            cursor: [[1, 3], [2, 3]]
          });
        });
      });
      return describe("with a selection", function() {
        beforeEach(function() {
          return set({
            text: '012\n',
            cursor: [0, 1]
          });
        });
        describe("with characterwise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('v p', {
              text: "03452\n",
              cursor: [0, 3]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('v p', {
              text: "0\n345\n2\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("with linewise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              text: "012\nabc",
              cursor: [0, 1]
            });
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('V p', {
              text: "345\nabc",
              cursor: [0, 0]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('V p', {
              text: "345\n",
              cursor: [0, 0]
            });
          });
        });
      });
    });
    describe("the P keybinding", function() {
      return describe("with character contents", function() {
        beforeEach(function() {
          set({
            text: "012\n",
            cursor: [0, 0]
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'a'
              }
            }
          });
          return keystroke('P');
        });
        return it("inserts the contents of the default register above", function() {
          return ensure({
            text: "345012\n",
            cursor: [0, 2]
          });
        });
      });
    });
    describe("PutAfterAndSelect and PutBeforeAndSelect", function() {
      beforeEach(function() {
        atom.keymaps.add("text", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g p': 'vim-mode-plus:put-after-and-select',
            'g P': 'vim-mode-plus:put-before-and-select'
          }
        });
        return set({
          text: "111\n222\n333\n",
          cursor: [1, 0]
        });
      });
      describe("in visual-mode", function() {
        describe("linewise register", function() {
          beforeEach(function() {
            return set({
              register: {
                '"': {
                  text: "AAA\n"
                }
              }
            });
          });
          it("paste and select: [selection:linewise]", function() {
            return ensure('V g p', {
              text: "111\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("paste and select: [selection:charwise, register:linewise]", function() {
            return ensure('v g P', {
              text: "111\n\nAAA\n22\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
        });
        return describe("characterwise register", function() {
          beforeEach(function() {
            return set({
              register: {
                '"': {
                  text: "AAA"
                }
              }
            });
          });
          it("paste and select: [selection:linewise, register:charwise]", function() {
            return ensure('V g p', {
              text: "111\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("paste and select: [selection:charwise, register:charwise]", function() {
            return ensure('v g P', {
              text: "111\nAAA22\n333\n",
              selectedText: "AAA",
              mode: ['visual', 'characterwise']
            });
          });
        });
      });
      return describe("in normal", function() {
        describe("linewise register", function() {
          beforeEach(function() {
            return set({
              register: {
                '"': {
                  text: "AAA\n"
                }
              }
            });
          });
          it("putAfter and select", function() {
            return ensure('g p', {
              text: "111\n222\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("putBefore and select", function() {
            return ensure('g P', {
              text: "111\nAAA\n222\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
        });
        return describe("characterwise register", function() {
          beforeEach(function() {
            return set({
              register: {
                '"': {
                  text: "AAA"
                }
              }
            });
          });
          it("putAfter and select", function() {
            return ensure('g p', {
              text: "111\n2AAA22\n333\n",
              selectedText: "AAA",
              mode: ['visual', 'characterwise']
            });
          });
          return it("putAfter and select", function() {
            return ensure('g P', {
              text: "111\nAAA222\n333\n",
              selectedText: "AAA",
              mode: ['visual', 'characterwise']
            });
          });
        });
      });
    });
    describe("the J keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012\n    456\n",
          cursor: [0, 1]
        });
      });
      describe("without repeating", function() {
        beforeEach(function() {
          return keystroke('J');
        });
        return it("joins the contents of the current line with the one below it", function() {
          return ensure({
            text: "012 456\n"
          });
        });
      });
      return describe("with repeating", function() {
        beforeEach(function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [1, 1]
          });
          return keystroke('2 J');
        });
        return describe("undo behavior", function() {
          beforeEach(function() {
            return keystroke('u');
          });
          return it("handles repeats", function() {
            return ensure({
              text: "12345\nabcde\nABCDE\nQWERT"
            });
          });
        });
      });
    });
    describe("the . keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n56\n78",
          cursor: [0, 0]
        });
      });
      it("repeats the last operation", function() {
        return ensure('2 d d .', {
          text: ""
        });
      });
      return it("composes with motions", function() {
        return ensure('d d 2 .', {
          text: "78"
        });
      });
    });
    describe("the r keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n\n",
          cursorBuffer: [[0, 0], [1, 0]]
        });
      });
      it("replaces a single character", function() {
        return ensure([
          'r', {
            input: 'x'
          }
        ], {
          text: 'x2\nx4\n\n'
        });
      });
      it("does nothing when cancelled", function() {
        ensure('r', {
          mode: 'operator-pending'
        });
        vimState.input.cancel();
        return ensure({
          text: '12\n34\n\n',
          mode: 'normal'
        });
      });
      it("remain visual-mode when cancelled", function() {
        keystroke('v r');
        vimState.input.cancel();
        return ensure({
          text: '12\n34\n\n',
          mode: ['visual', 'characterwise']
        });
      });
      it("replaces a single character with a line break", function() {
        var inputEditorElement;
        inputEditorElement = vimState.input.editorElement;
        keystroke('r');
        dispatch(inputEditorElement, 'core:confirm');
        return ensure({
          text: '\n2\n\n4\n\n',
          cursorBuffer: [[1, 0], [3, 0]]
        });
      });
      it("composes properly with motions", function() {
        return ensure([
          '2 r', {
            input: 'x'
          }
        ], {
          text: 'xx\nxx\n\n'
        });
      });
      it("does nothing on an empty line", function() {
        set({
          cursorBuffer: [2, 0]
        });
        return ensure([
          'r', {
            input: 'x'
          }
        ], {
          text: '12\n34\n\n'
        });
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        return ensure([
          '3 r', {
            input: 'x'
          }
        ], {
          text: '12\n34\n\n'
        });
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          return keystroke('v e');
        });
        it("replaces the entire selection with the given character", function() {
          return ensure([
            'r', {
              input: 'x'
            }
          ], {
            text: 'xx\nxx\n\n'
          });
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          return ensure([
            'r', {
              input: 'x'
            }
          ], {
            cursorBuffer: [[0, 0], [1, 0]]
          });
        });
      });
      return describe("when in visual-block mode", function() {
        var textOriginal, textReplaced;
        textOriginal = "0:2345\n1: o11o\n2: o22o\n3: o33o\n4: o44o\n";
        textReplaced = "0:2345\n1: oxxo\n2: oxxo\n3: oxxo\n4: oxxo\n";
        beforeEach(function() {
          set({
            text: textOriginal,
            cursor: [1, 4]
          });
          return ensure('ctrl-v l 3 j', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['11', '22', '33', '44']
          });
        });
        return it("replaces each selection and put cursor on start of top selection", function() {
          return ensure([
            'r', {
              input: 'x'
            }
          ], {
            mode: 'normal',
            text: textReplaced,
            cursor: [1, 4]
          });
        });
      });
    });
    describe('the m keybinding', function() {
      beforeEach(function() {
        return set({
          text: '12\n34\n56\n',
          cursorBuffer: [0, 1]
        });
      });
      return it('marks a position', function() {
        keystroke('m a');
        return expect(vimState.mark.get('a')).toEqual([0, 1]);
      });
    });
    return describe('the R keybinding', function() {
      beforeEach(function() {
        return set({
          text: "12345\n67890",
          cursorBuffer: [0, 2]
        });
      });
      it("enters replace mode and replaces characters", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("ab");
        return ensure('escape', {
          text: "12ab5\n67890",
          cursor: [0, 3],
          mode: 'normal'
        });
      });
      it("continues beyond end of line as insert", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("abcde");
        return ensure('escape', {
          text: '12abcde\n67890'
        });
      });
      it('treats backspace as undo', function() {
        editor.insertText("foo");
        keystroke('R');
        editor.insertText("a");
        editor.insertText("b");
        ensure({
          text: "12fooab5\n67890"
        });
        ensure('backspace', {
          text: "12fooa45\n67890"
        });
        editor.insertText("c");
        ensure({
          text: "12fooac5\n67890"
        });
        ensure('backspace backspace', {
          text: "12foo345\n67890",
          selectedText: ''
        });
        return ensure('backspace', {
          text: "12foo345\n67890",
          selectedText: ''
        });
      });
      it("can be repeated", function() {
        keystroke('R');
        editor.insertText("ab");
        keystroke('escape');
        set({
          cursorBuffer: [1, 2]
        });
        ensure('.', {
          text: "12ab5\n67ab0",
          cursor: [1, 3]
        });
        set({
          cursorBuffer: [0, 4]
        });
        return ensure('.', {
          text: "12abab\n67ab0",
          cursor: [0, 5]
        });
      });
      it("can be interrupted by arrow keys and behave as insert for repeat", function() {});
      it("repeats correctly when backspace was used in the text", function() {
        keystroke('R');
        editor.insertText("a");
        keystroke('backspace');
        editor.insertText("b");
        keystroke('escape');
        set({
          cursorBuffer: [1, 2]
        });
        ensure('.', {
          text: "12b45\n67b90",
          cursor: [1, 2]
        });
        set({
          cursorBuffer: [0, 4]
        });
        return ensure('.', {
          text: "12b4b\n67b90",
          cursor: [0, 4]
        });
      });
      it("doesn't replace a character if newline is entered", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("\n");
        return ensure('escape', {
          text: "12\n345\n67890"
        });
      });
      return describe("multiline situation", function() {
        var textOriginal;
        textOriginal = "01234\n56789";
        beforeEach(function() {
          return set({
            text: textOriginal,
            cursor: [0, 0]
          });
        });
        it("replace character unless input isnt new line(\\n)", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("a\nb\nc");
          return ensure({
            text: "a\nb\nc34\n56789",
            cursor: [2, 1]
          });
        });
        it("handle backspace", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          set({
            cursor: [0, 1]
          });
          editor.insertText("a\nb\nc");
          ensure({
            text: "0a\nb\nc4\n56789",
            cursor: [2, 1]
          });
          ensure('backspace', {
            text: "0a\nb\n34\n56789",
            cursor: [2, 0]
          });
          ensure('backspace', {
            text: "0a\nb34\n56789",
            cursor: [1, 1]
          });
          ensure('backspace', {
            text: "0a\n234\n56789",
            cursor: [1, 0]
          });
          ensure('backspace', {
            text: "0a234\n56789",
            cursor: [0, 2]
          });
          ensure('backspace', {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          ensure('backspace', {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          return ensure('escape', {
            text: "01234\n56789",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("repeate multiline text case-1", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\ndef");
          ensure({
            text: "abc\ndef\n56789",
            cursor: [1, 3]
          });
          ensure('escape', {
            cursor: [1, 2],
            mode: 'normal'
          });
          ensure('u', {
            text: textOriginal
          });
          ensure('.', {
            text: "abc\ndef\n56789",
            cursor: [1, 2],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\ndef\n56abc\ndef",
            cursor: [3, 2],
            mode: 'normal'
          });
        });
        return it("repeate multiline text case-2", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\nd");
          ensure({
            text: "abc\nd4\n56789",
            cursor: [1, 1]
          });
          ensure('escape', {
            cursor: [1, 0],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\nd4\nabc\nd9",
            cursor: [3, 0],
            mode: 'normal'
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9vcGVyYXRvci1nZW5lcmFsLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxFQUF3QixnQkFBQSxRQUF4QixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTthQUNoQyxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVC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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/operator-general-spec.coffee
