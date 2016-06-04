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
            ensure('2x', {
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
            return ensure('3x', {
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
            ensure('2x', {
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
            ensure('3x', {
              text: 'a0123\n\nxyz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'bc\n'
                }
              }
            });
            return ensure('7x', {
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
          return ensure('dd', {
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
          return ensure('dd', {
            text: "12345\nabcde\n",
            cursor: [1, 0]
          });
        });
        return it("leaves the cursor on the first nonblank character", function() {
          set({
            text: '12345\n  abcde\n',
            cursor: [0, 4]
          });
          return ensure('dd', {
            text: "  abcde\n",
            cursor: [0, 2]
          });
        });
      });
      describe("undo behavior", function() {
        beforeEach(function() {
          return set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [1, 1]
          });
        });
        it("undoes both lines", function() {
          return ensure('d2du', {
            text: "12345\nabcde\nABCDE\nQWERT",
            selectedText: ''
          });
        });
        return describe("with multiple cursors", function() {
          beforeEach(function() {
            return set({
              cursor: [[1, 1], [0, 0]]
            });
          });
          return it("is undone as one operation", function() {
            return ensure('dlu', {
              text: "12345\nabcde\nABCDE\nQWERT",
              selectedText: ['', '']
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
          return ensure('dw', {
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
          ensure('dw', {
            text: 'abefg',
            cursor: [0, 2]
          });
          set({
            text: 'one two three four',
            cursor: [0, 0]
          });
          return ensure('d3w', {
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
          return ensure('iw', {
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
            return ensure('dj', {
              text: 'ABCDE\n'
            });
          });
        });
        describe("on the middle of second line", function() {
          return it("deletes the last two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('dj', {
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
            return ensure('dj', {
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
            return ensure('dk', {
              text: '12345\n'
            });
          });
        });
        describe("on the beginning of the file", function() {
          return xit("deletes nothing", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('dk', {
              text: originalText
            });
          });
        });
        describe("when on the middle of second line", function() {
          return it("deletes the first two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('dk', {
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
            return ensure('dk', {
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
            return ensure('dk', {
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
            return ensure('dG', {
              text: '12345\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('dG', {
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
            return ensure('d2G', {
              text: '12345\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d2G', {
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
              'yydt', {
                char: ')'
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
          return ensure('de', {
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
            'dt', {
              char: 'd'
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
          return keystroke('Vjy');
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
          return keystroke('yy');
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
          keystroke('yy');
          return expect(atom.clipboard.read()).toBe('012 345\n');
        });
      });
      describe("when followed with a repeated y", function() {
        beforeEach(function() {
          return keystroke('y2y');
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
              char: 'a'
            }, 'yy'
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
              char: 'A'
            }, 'yy'
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
          return keystroke('ye');
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
            'yt', {
              char: 'x'
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
          return ensure('yiw', {
            cursorBuffer: [0, 4]
          });
        });
      });
      describe("with a left motion", function() {
        beforeEach(function() {
          return keystroke('yh');
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
          return keystroke('yj');
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
            return ensure('yGP', {
              text: '12345\nabcde\nABCDE\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('yGP', {
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
            return ensure('y2GP', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('y2GP', {
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
          return ensure('y^', {
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
          ensure("yip", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([0, 1, 2])
              }
            }
          });
          ensure("jyy", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: text.getLines([2])
              }
            }
          });
          return ensure("k.", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
        });
        it("don't move cursor after yank from visual-linewise", function() {
          ensure("Vy", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          return ensure("Vjy", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: text.getLines([1, 2])
              }
            }
          });
        });
        return it("don't move cursor after yank from visual-characterwise", function() {
          ensure("vlly", {
            cursorBuffer: [1, 4],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("vhhy", {
            cursorBuffer: [1, 2],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("vjy", {
            cursorBuffer: [2, 2],
            register: {
              '"': {
                text: "234567\n2_2"
              }
            }
          });
          return ensure("v2ky", {
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
          return ensure('yyp', {
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
          return ensure('yyp', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!"
          });
        });
        return it("copies the entire line and pastes it respecting count and new lines", function() {
          return ensure('yy2p', {
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
                char: 'a'
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
            return ensure('d$k$p', {
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
            return ensure('vp', {
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
          return keystroke('2p');
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
            return ensure('vp', {
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
            return ensure('vp', {
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
            return ensure('Vp', {
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
            return ensure('Vp', {
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
            return ensure('Vgp', {
              text: "111\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("paste and select: [selection:charwise, register:linewise]", function() {
            return ensure('vgP', {
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
            return ensure('Vgp', {
              text: "111\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("paste and select: [selection:charwise, register:charwise]", function() {
            return ensure('vgP', {
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
            return ensure('gp', {
              text: "111\n222\nAAA\n333\n",
              selectedText: "AAA\n",
              mode: ['visual', 'linewise']
            });
          });
          return it("putBefore and select", function() {
            return ensure('gP', {
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
            return ensure('gp', {
              text: "111\n2AAA22\n333\n",
              selectedText: "AAA",
              mode: ['visual', 'characterwise']
            });
          });
          return it("putAfter and select", function() {
            return ensure('gP', {
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
          return keystroke('2J');
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
        return ensure('2dd.', {
          text: ""
        });
      });
      return it("composes with motions", function() {
        return ensure('dd2.', {
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
            char: 'x'
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
        keystroke('vr');
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
          '2r', {
            char: 'x'
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
            char: 'x'
          }
        ], {
          text: '12\n34\n\n'
        });
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        return ensure([
          '3r', {
            char: 'x'
          }
        ], {
          text: '12\n34\n\n'
        });
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          return keystroke('ve');
        });
        it("replaces the entire selection with the given character", function() {
          return ensure([
            'r', {
              char: 'x'
            }
          ], {
            text: 'xx\nxx\n\n'
          });
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          return ensure([
            'r', {
              char: 'x'
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
          return ensure([
            {
              ctrl: 'v'
            }, 'l3j'
          ], {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['11', '22', '33', '44']
          });
        });
        return it("replaces each selection and put cursor on start of top selection", function() {
          return ensure([
            'r', {
              char: 'x'
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
        keystroke('ma');
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
        ensure([
          {
            raw: 'backspace'
          }
        ], {
          text: "12fooa45\n67890"
        });
        editor.insertText("c");
        ensure({
          text: "12fooac5\n67890"
        });
        ensure([
          {
            raw: 'backspace'
          }, {
            raw: 'backspace'
          }
        ], {
          text: "12foo345\n67890",
          selectedText: ''
        });
        return ensure([
          {
            raw: 'backspace'
          }
        ], {
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
        keystroke([
          {
            raw: 'backspace'
          }
        ]);
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
          ensure({
            raw: 'backspace'
          }, {
            text: "0a\nb\n34\n56789",
            cursor: [2, 0]
          });
          ensure({
            raw: 'backspace'
          }, {
            text: "0a\nb34\n56789",
            cursor: [1, 1]
          });
          ensure({
            raw: 'backspace'
          }, {
            text: "0a\n234\n56789",
            cursor: [1, 0]
          });
          ensure({
            raw: 'backspace'
          }, {
            text: "0a234\n56789",
            cursor: [0, 2]
          });
          ensure({
            raw: 'backspace'
          }, {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          ensure({
            raw: 'backspace'
          }, {
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
          return ensure('j.', {
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
          return ensure('j.', {
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
