(function() {
  var getVimState, settings,
    __slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref;
    _ref = [], set = _ref[0], ensure = _ref[1], keystroke = _ref[2], editor = _ref[3], editorElement = _ref[4], vimState = _ref[5];
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
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          return set({
            text: "123456789abc",
            cursor: [0, 0]
          });
        });
        it("repeats N times", function() {
          return ensure('3x', {
            text: '456789abc'
          });
        });
        return it("repeats NN times", function() {
          return ensure('10x', {
            text: 'bc'
          });
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats N times", function() {
          return ensure('d2w', {
            text: 'three'
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats movements in visual mode", function() {
          return ensure('v2w', {
            cursor: [0, 9]
          });
        });
      });
    });
    return describe("Register", function() {
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
        return it("overwrites a value previously in the register", function() {
          set({
            register: {
              a: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          ensure({
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
        });
        it("appends to a value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'contentnew content'
              }
            }
          });
        });
        it("appends linewise to a linewise value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content\n',
                type: 'linewise'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
        return it("appends linewise to a character value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content\n',
                type: 'linewise'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'character'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the + register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'character'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the _ register", function() {
        describe("reading", function() {
          return it("is always the empty string", function() {
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '_': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '%': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
      });
      describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
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
                text: 'abc'
              }
            }
          });
          atom.clipboard.write("clip");
          set({
            text: "012\n",
            cursor: [0, 2]
          });
          return keystroke('i');
        });
        it("inserts contents of the unnamed register with \"", function() {
          return ensure([
            {
              ctrl: 'r'
            }, {
              char: '"'
            }
          ], {
            text: '013452\n'
          });
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard with \"", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            return ensure([
              {
                ctrl: 'r'
              }, {
                char: '"'
              }
            ], {
              text: '01clip2\n'
            });
          });
        });
        it("inserts contents of the 'a' register", function() {
          return ensure([
            {
              ctrl: 'r'
            }, {
              char: 'a'
            }
          ], {
            text: '01abc2\n'
          });
        });
        return it("is cancelled with the escape key", function() {
          return ensure([
            {
              ctrl: 'r'
            }, {
              char: 'escape'
            }
          ], {
            text: '012\n',
            mode: 'insert',
            cursor: [0, 2]
          });
        });
      });
      return describe("per selection clipboard", function() {
        var ensurePerSelectionRegister;
        ensurePerSelectionRegister = function() {
          var i, selection, texts, _i, _len, _ref1, _results;
          texts = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _ref1 = editor.getSelections();
          _results = [];
          for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
            selection = _ref1[i];
            _results.push(ensure({
              register: {
                '*': {
                  text: texts[i],
                  selection: selection
                }
              }
            }));
          }
          return _results;
        };
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          return set({
            text: "012:\nabc:\ndef:\n",
            cursor: [[0, 1], [1, 1], [2, 1]]
          });
        });
        describe("on selection destroye", function() {
          return it("remove corresponding subscriptin and clipboard entry", function() {
            var clipboardBySelection, selection, subscriptionBySelection, _i, _len, _ref1, _ref2;
            _ref1 = vimState.register, clipboardBySelection = _ref1.clipboardBySelection, subscriptionBySelection = _ref1.subscriptionBySelection;
            expect(clipboardBySelection.size).toBe(0);
            expect(subscriptionBySelection.size).toBe(0);
            keystroke("yiw");
            ensurePerSelectionRegister('012', 'abc', 'def');
            expect(clipboardBySelection.size).toBe(3);
            expect(subscriptionBySelection.size).toBe(3);
            _ref2 = editor.getSelections();
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              selection.destroy();
            }
            expect(clipboardBySelection.size).toBe(0);
            return expect(subscriptionBySelection.size).toBe(0);
          });
        });
        describe("Yank", function() {
          return it("save text to per selection register", function() {
            keystroke("yiw");
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
        });
        describe("Delete family", function() {
          it("d", function() {
            ensure("diw", {
              text: ":\n:\n:\n"
            });
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
          it("x", function() {
            ensure("x", {
              text: "02:\nac:\ndf:\n"
            });
            return ensurePerSelectionRegister('1', 'b', 'e');
          });
          it("X", function() {
            ensure("X", {
              text: "12:\nbc:\nef:\n"
            });
            return ensurePerSelectionRegister('0', 'a', 'd');
          });
          return it("D", function() {
            ensure("D", {
              text: "0\na\nd\n"
            });
            return ensurePerSelectionRegister('12:', 'bc:', 'ef:');
          });
        });
        describe("Put family", function() {
          it("p paste text from per selection register", function() {
            return ensure("yiw$p", {
              text: "012:012\nabc:abc\ndef:def\n"
            });
          });
          return it("P paste text from per selection register", function() {
            return ensure("yiw$P", {
              text: "012012:\nabcabc:\ndefdef:\n"
            });
          });
        });
        return describe("ctrl-r in insert mode", function() {
          return it("insert from per selection registe", function() {
            ensure("diw", {
              text: ":\n:\n:\n"
            });
            ensure('a', {
              mode: 'insert'
            });
            return ensure([
              {
                ctrl: 'r'
              }, {
                char: '"'
              }
            ], {
              text: ":012\n:abc\n:def\n"
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9wcmVmaXgtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFDLGNBQWUsT0FBQSxDQUFRLGVBQVIsRUFBZixXQUFELENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLDZEQUFBO0FBQUEsSUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Qsa0JBQWhELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBQUEsUUFDQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFEVCxDQUFBO2VBRUMsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FBZCxFQUEyQixJQUhqQjtNQUFBLENBQVosRUFEUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFRQSxTQUFBLENBQVUsU0FBQSxHQUFBO2FBQ1IsUUFBUSxDQUFDLGVBQVQsQ0FBQSxFQURRO0lBQUEsQ0FBVixDQVJBLENBQUE7QUFBQSxJQVdBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUEsR0FBQTtBQUNqQixNQUFBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FBSTtB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/prefix-spec.coffee
