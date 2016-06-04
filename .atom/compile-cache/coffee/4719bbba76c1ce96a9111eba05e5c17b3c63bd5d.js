(function() {
  var dispatch, getVimState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator TransformString", function() {
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
    describe('the ~ keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [[0, 0], [1, 0]]
        });
      });
      it('toggles the case and moves right', function() {
        ensure('~', {
          text: 'ABc\nxyZ',
          cursor: [[0, 1], [1, 1]]
        });
        ensure('~', {
          text: 'Abc\nxYZ',
          cursor: [[0, 2], [1, 2]]
        });
        return ensure('~', {
          text: 'AbC\nxYz',
          cursor: [[0, 2], [1, 2]]
        });
      });
      it('takes a count', function() {
        return ensure('4 ~', {
          text: 'AbC\nxYz',
          cursor: [[0, 2], [1, 2]]
        });
      });
      describe("in visual mode", function() {
        return it("toggles the case of the selected text", function() {
          set({
            cursorBuffer: [0, 0]
          });
          return ensure('V ~', {
            text: 'AbC\nXyZ'
          });
        });
      });
      return describe("with g and motion", function() {
        it("toggles the case of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 0]
          });
          return ensure('g ~ 2 l', {
            text: 'Abc\nXyZ',
            cursor: [0, 0]
          });
        });
        it("g~~ toggles the line of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 1]
          });
          return ensure('g ~ ~', {
            text: 'AbC\nXyZ',
            cursor: [0, 1]
          });
        });
        return it("g~g~ toggles the line of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 1]
          });
          return ensure('g ~ g ~', {
            text: 'AbC\nXyZ',
            cursor: [0, 1]
          });
        });
      });
    });
    describe('the U keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [0, 0]
        });
      });
      it("makes text uppercase with g and motion, and won't move cursor", function() {
        ensure('g U l', {
          text: 'ABc\nXyZ',
          cursor: [0, 0]
        });
        ensure('g U e', {
          text: 'ABC\nXyZ',
          cursor: [0, 0]
        });
        set({
          cursorBuffer: [1, 0]
        });
        return ensure('g U $', {
          text: 'ABC\nXYZ',
          cursor: [1, 0]
        });
      });
      it("makes the selected text uppercase in visual mode", function() {
        return ensure('V U', {
          text: 'ABC\nXyZ'
        });
      });
      it("gUU upcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('g U U', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gUgU upcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('g U g U', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe('the u keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursorBuffer: [0, 0]
        });
      });
      it("makes text lowercase with g and motion, and won't move cursor", function() {
        return ensure('g u $', {
          text: 'abc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes the selected text lowercase in visual mode", function() {
        return ensure('V u', {
          text: 'abc\nXyZ'
        });
      });
      it("guu downcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('g u u', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gugu downcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('g u g u', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe("the > keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("on the last line", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        return describe("when followed by a >", function() {
          return it("indents the current line", function() {
            return ensure('> >', {
              text: "12345\nabcde\n  ABCDE",
              cursor: [2, 2]
            });
          });
        });
      });
      describe("on the first line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("when followed by a >", function() {
          return it("indents the current line", function() {
            return ensure('> >', {
              text: "  12345\nabcde\nABCDE",
              cursor: [0, 2]
            });
          });
        });
        return describe("when followed by a repeating >", function() {
          beforeEach(function() {
            return keystroke('3 > >');
          });
          it("indents multiple lines at once", function() {
            return ensure({
              text: "  12345\n  abcde\n  ABCDE",
              cursor: [0, 2]
            });
          });
          return describe("undo behavior", function() {
            return it("outdents all three lines", function() {
              return ensure('u', {
                text: "12345\nabcde\nABCDE"
              });
            });
          });
        });
      });
      describe("in visual mode", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return keystroke('V >');
        });
        it("indents the current line and exits visual mode", function() {
          return ensure({
            mode: 'normal',
            text: "  12345\nabcde\nABCDE",
            selectedBufferRange: [[0, 2], [0, 2]]
          });
        });
        return it("allows repeating the operation", function() {
          return ensure('.', {
            text: "    12345\nabcde\nABCDE"
          });
        });
      });
      return describe("in visual mode and stayOnTransformString enabled", function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return set({
            cursor: [0, 0]
          });
        });
        it("indents the currrent selection and exits visual mode", function() {
          return ensure('v j >', {
            mode: 'normal',
            cursor: [1, 0],
            text: "  12345\n  abcde\nABCDE"
          });
        });
        it("when repeated, operate on same range when cursor was not moved", function() {
          ensure('v j >', {
            mode: 'normal',
            cursor: [1, 0],
            text: "  12345\n  abcde\nABCDE"
          });
          return ensure('.', {
            mode: 'normal',
            cursor: [1, 0],
            text: "    12345\n    abcde\nABCDE"
          });
        });
        return it("when repeated, operate on relative range from cursor position with same extent when cursor was moved", function() {
          ensure('v j >', {
            mode: 'normal',
            cursor: [1, 0],
            text: "  12345\n  abcde\nABCDE"
          });
          return ensure('l .', {
            mode: 'normal',
            cursor: [1, 2],
            text: "  12345\n    abcde\n  ABCDE"
          });
        });
      });
    });
    describe("the < keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  12345\n  abcde\nABCDE",
          cursor: [0, 0]
        });
      });
      describe("when followed by a <", function() {
        return it("indents the current line", function() {
          return ensure('< <', {
            text: "12345\n  abcde\nABCDE",
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by a repeating <", function() {
        beforeEach(function() {
          return keystroke('2 < <');
        });
        it("indents multiple lines at once", function() {
          return ensure({
            text: "12345\nabcde\nABCDE",
            cursor: [0, 0]
          });
        });
        return describe("undo behavior", function() {
          return it("indents both lines", function() {
            return ensure('u', {
              text: "  12345\n  abcde\nABCDE"
            });
          });
        });
      });
      return describe("in visual mode", function() {
        return it("indents the current line and exits visual mode", function() {
          return ensure('V <', {
            mode: 'normal',
            text: "12345\n  abcde\nABCDE",
            selectedBufferRange: [[0, 0], [0, 0]]
          });
        });
      });
    });
    describe("the = keybinding", function() {
      var oldGrammar;
      oldGrammar = [];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        oldGrammar = editor.getGrammar();
        return set({
          text: "foo\n  bar\n  baz",
          cursor: [1, 0]
        });
      });
      return describe("when used in a scope that supports auto-indent", function() {
        beforeEach(function() {
          var jsGrammar;
          jsGrammar = atom.grammars.grammarForScopeName('source.js');
          return editor.setGrammar(jsGrammar);
        });
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        describe("when followed by a =", function() {
          beforeEach(function() {
            return keystroke('= =');
          });
          return it("indents the current line", function() {
            return expect(editor.indentationForBufferRow(1)).toBe(0);
          });
        });
        return describe("when followed by a repeating =", function() {
          beforeEach(function() {
            return keystroke('2 = =');
          });
          it("autoindents multiple lines at once", function() {
            return ensure({
              text: "foo\nbar\nbaz",
              cursor: [1, 0]
            });
          });
          return describe("undo behavior", function() {
            return it("indents both lines", function() {
              return ensure('u', {
                text: "foo\n  bar\n  baz"
              });
            });
          });
        });
      });
    });
    describe('CamelCase', function() {
      beforeEach(function() {
        return set({
          text: 'vim-mode\natom-text-editor\n',
          cursorBuffer: [0, 0]
        });
      });
      it("CamelCase text and not move cursor", function() {
        ensure('g c $', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j g c $', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("CamelCase selected text", function() {
        return ensure('V j g c', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("gcgc CamelCase the line of text, won't move cursor", function() {
        return ensure('l g c g c', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('SnakeCase', function() {
      beforeEach(function() {
        set({
          text: 'vim-mode\natom-text-editor\n',
          cursorBuffer: [0, 0]
        });
        return atom.keymaps.add("g_", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g _': 'vim-mode-plus:snake-case'
          }
        });
      });
      it("SnakeCase text and not move cursor", function() {
        ensure('g _ $', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j g _ $', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [1, 0]
        });
      });
      it("SnakeCase selected text", function() {
        return ensure('V j g _', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [0, 0]
        });
      });
      return it("g_g_ SnakeCase the line of text, won't move cursor", function() {
        return ensure('l g _ g _', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('DashCase', function() {
      beforeEach(function() {
        return set({
          text: 'vimMode\natom_text_editor\n',
          cursorBuffer: [0, 0]
        });
      });
      it("DashCase text and not move cursor", function() {
        ensure('g - $', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 0]
        });
        return ensure('j g - $', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [1, 0]
        });
      });
      it("DashCase selected text", function() {
        return ensure('V j g -', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      return it("g-g- DashCase the line of text, won't move cursor", function() {
        return ensure('l g - g -', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('CompactSpaces', function() {
      beforeEach(function() {
        return set({
          cursorBuffer: [0, 0]
        });
      });
      return describe("basic behavior", function() {
        it("compats multiple space into one", function() {
          set({
            text: 'var0   =   0; var10   =   10',
            cursor: [0, 0]
          });
          return ensure('g space $', {
            text: 'var0 = 0; var10 = 10'
          });
        });
        it("don't apply compaction for leading and trailing space", function() {
          set({
            text: "___var0   =   0; var10   =   10___\n___var1   =   1; var11   =   11___\n___var2   =   2; var12   =   12___\n\n___var4   =   4; var14   =   14___".replace(/_/g, ' '),
            cursor: [0, 0]
          });
          return ensure('g space i p', {
            text: "___var0 = 0; var10 = 10___\n___var1 = 1; var11 = 11___\n___var2 = 2; var12 = 12___\n\n___var4   =   4; var14   =   14___".replace(/_/g, ' ')
          });
        });
        return it("but it compact spaces when target all text is spaces", function() {
          set({
            text: '01234    90',
            cursor: [0, 5]
          });
          return ensure('g space w', {
            text: '01234 90'
          });
        });
      });
    });
    describe('surround', function() {
      beforeEach(function() {
        return set({
          text: "apple\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
          cursorBuffer: [0, 0]
        });
      });
      describe('surround', function() {
        beforeEach(function() {
          return atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'y s': 'vim-mode-plus:surround'
            }
          }, 100);
        });
        it("surround text object with ( and repeatable", function() {
          ensure([
            'y s i w', {
              input: '('
            }
          ], {
            text: "(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround text object with { and repeatable", function() {
          ensure([
            'y s i w', {
              input: '{'
            }
          ], {
            text: "{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "{apple}\n{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround linewise", function() {
          ensure([
            'y s y s', {
              input: '{'
            }
          ], {
            text: "{\napple\n}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('3 j .', {
            text: "{\napple\n}\n{\npairs: [brackets]\n}\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          beforeEach(function() {
            return set({
              text: "apple\norange\nlemmon",
              cursorBuffer: [0, 0]
            });
          });
          return it("add additional space inside pair char when surround", function() {
            settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
            ensure([
              'y s i w', {
                input: '('
              }
            ], {
              text: "( apple )\norange\nlemmon"
            });
            keystroke('j');
            ensure([
              'y s i w', {
                input: '{'
              }
            ], {
              text: "( apple )\n{ orange }\nlemmon"
            });
            keystroke('j');
            return ensure([
              'y s i w', {
                input: '['
              }
            ], {
              text: "( apple )\n{ orange }\n[ lemmon ]"
            });
          });
        });
      });
      describe('map-surround', function() {
        beforeEach(function() {
          set({
            text: "\napple\npairs tomato\norange\nmilk\n",
            cursorBuffer: [1, 0]
          });
          return atom.keymaps.add("ms", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm s': 'vim-mode-plus:map-surround'
            },
            'atom-text-editor.vim-mode-plus.visual-mode': {
              'm s': 'vim-mode-plus:map-surround'
            }
          });
        });
        it("surround text for each word in target case-1", function() {
          return ensure([
            'm s i p', {
              input: '('
            }
          ], {
            text: "\n(apple)\n(pairs) (tomato)\n(orange)\n(milk)\n",
            cursor: [1, 0]
          });
        });
        it("surround text for each word in target case-2", function() {
          set({
            cursor: [2, 1]
          });
          return ensure([
            'm s i l', {
              input: '<'
            }
          ], {
            text: '\napple\n<pairs> <tomato>\norange\nmilk\n',
            cursor: [2, 0]
          });
        });
        return it("surround text for each word in visual selection", function() {
          return ensure([
            'v i p m s', {
              input: '"'
            }
          ], {
            text: '\n"apple"\n"pairs" "tomato"\n"orange"\n"milk"\n',
            cursor: [1, 0]
          });
        });
      });
      describe('delete surround', function() {
        beforeEach(function() {
          atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'd s': 'vim-mode-plus:delete-surround'
            }
          });
          return set({
            cursor: [1, 8]
          });
        });
        it("delete surrounded chars and repeatable", function() {
          ensure([
            'd s', {
              input: '['
            }
          ], {
            text: "apple\npairs: brackets\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j l .', {
            text: "apple\npairs: brackets\npairs: brackets\n( multi\n  line )"
          });
        });
        it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure([
            'd s', {
              input: '('
            }
          ], {
            text: "apple\npairs: [brackets]\npairs: [brackets]\n multi\n  line "
          });
        });
        it("delete surrounded chars and trim padding spaces", function() {
          set({
            text: "( apple )\n{  orange   }\n",
            cursor: [0, 0]
          });
          ensure([
            'd s', {
              input: '('
            }
          ], {
            text: "apple\n{  orange   }\n"
          });
          return ensure([
            'j d s', {
              input: '{'
            }
          ], {
            text: "apple\norange\n"
          });
        });
        return it("delete surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure([
            'd s', {
              input: '{'
            }
          ], {
            text: ["highlightRanges @editor, range, ", "  timeout: timeout", "  hello: world", ""].join("\n")
          });
        });
      });
      describe('change srurround', function() {
        beforeEach(function() {
          atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'c s': 'vim-mode-plus:change-surround'
            }
          });
          return set({
            text: "(apple)\n(grape)\n<lemmon>\n{orange}",
            cursorBuffer: [0, 1]
          });
        });
        it("change surrounded chars and repeatable", function() {
          ensure([
            'c s', {
              input: '(['
            }
          ], {
            text: "[apple]\n(grape)\n<lemmon>\n{orange}"
          });
          return ensure('j l .', {
            text: "[apple]\n[grape]\n<lemmon>\n{orange}"
          });
        });
        it("change surrounded chars", function() {
          ensure([
            'j j c s', {
              input: '<"'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n{orange}"
          });
          return ensure([
            'j l c s', {
              input: '{!'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n!orange!"
          });
        });
        return it("change surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure([
            'c s', {
              input: '{('
            }
          ], {
            text: "highlightRanges @editor, range, (\n  timeout: timeout\n  hello: world\n)"
          });
        });
      });
      describe('surround-word', function() {
        beforeEach(function() {
          return atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'y s w': 'vim-mode-plus:surround-word'
            }
          });
        });
        it("surround a word with ( and repeatable", function() {
          ensure([
            'y s w', {
              input: '('
            }
          ], {
            text: "(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return it("surround a word with { and repeatable", function() {
          ensure([
            'y s w', {
              input: '{'
            }
          ], {
            text: "{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "{apple}\n{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
      });
      describe('delete-surround-any-pair', function() {
        beforeEach(function() {
          set({
            text: "apple\n(pairs: [brackets])\n{pairs \"s\" [brackets]}\n( multi\n  line )",
            cursor: [1, 9]
          });
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'd s': 'vim-mode-plus:delete-surround-any-pair'
            }
          });
        });
        it("delete surrounded any pair found and repeatable", function() {
          ensure('d s', {
            text: 'apple\n(pairs: brackets)\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\npairs: brackets\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
        });
        it("delete surrounded any pair found with skip pair out of cursor and repeatable", function() {
          set({
            cursor: [2, 14]
          });
          ensure('d s', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" brackets}\n( multi\n  line )'
          });
          ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
        });
        return it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure('d s', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" [brackets]}\n multi\n  line '
          });
        });
      });
      describe('delete-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'd s': 'vim-mode-plus:delete-surround-any-pair-allow-forwarding'
            }
          });
        });
        return it("[1] single line", function() {
          set({
            cursor: [0, 0],
            text: "___(inner)\n___(inner)"
          });
          ensure('d s', {
            text: "___inner\n___(inner)",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "___inner\n___inner",
            cursor: [1, 0]
          });
        });
      });
      describe('change-surround-any-pair', function() {
        beforeEach(function() {
          set({
            text: "(apple)\n(grape)\n<lemmon>\n{orange}",
            cursor: [0, 1]
          });
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'c s': 'vim-mode-plus:change-surround-any-pair'
            }
          });
        });
        return it("change any surrounded pair found and repeatable", function() {
          ensure([
            'c s', {
              input: '<'
            }
          ], {
            text: "<apple>\n(grape)\n<lemmon>\n{orange}"
          });
          ensure('j .', {
            text: "<apple>\n<grape>\n<lemmon>\n{orange}"
          });
          return ensure('j j .', {
            text: "<apple>\n<grape>\n<lemmon>\n<orange>"
          });
        });
      });
      return describe('change-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'c s': 'vim-mode-plus:change-surround-any-pair-allow-forwarding'
            }
          });
        });
        return it("[1] single line", function() {
          set({
            cursor: [0, 0],
            text: "___(inner)\n___(inner)"
          });
          ensure([
            'c s', {
              input: '<'
            }
          ], {
            text: "___<inner>\n___(inner)",
            cursor: [0, 0]
          });
          return ensure('j .', {
            text: "___<inner>\n___<inner>",
            cursor: [1, 0]
          });
        });
      });
    });
    describe('ReplaceWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            '_': 'vim-mode-plus:replace-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (parenthesis)\nhere (parenthesis)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'character'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'character'
            }
          }
        });
      });
      it("replace selection with regisgter's content", function() {
        ensure('v i w', {
          selectedText: 'aaa'
        });
        return ensure('_', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register')
        });
      });
      it("replace text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_ i (', {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'default register')
        });
      });
      it("can repeat", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_ i ( j .', {
          mode: 'normal',
          text: originalText.replace(/parenthesis/g, 'default register')
        });
      });
      return it("can use specified register to replace with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure([
          '"', {
            input: 'a'
          }, '_ i ('
        ], {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'A register')
        });
      });
    });
    describe('SwapWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g p': 'vim-mode-plus:swap-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (111)\nhere (222)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'character'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'character'
            }
          }
        });
      });
      it("swap selection with regisgter's content", function() {
        ensure('v i w', {
          selectedText: 'aaa'
        });
        return ensure('g p', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register'),
          register: {
            '"': {
              text: 'aaa'
            }
          }
        });
      });
      it("swap text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('g p i (', {
          mode: 'normal',
          text: originalText.replace('111', 'default register'),
          register: {
            '"': {
              text: '111'
            }
          }
        });
      });
      it("can repeat", function() {
        var updatedText;
        set({
          cursor: [1, 6]
        });
        updatedText = "abc def 'aaa'\nhere (default register)\nhere (111)";
        return ensure('g p i ( j .', {
          mode: 'normal',
          text: updatedText,
          register: {
            '"': {
              text: '222'
            }
          }
        });
      });
      return it("can use specified register to swap with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure([
          '"', {
            input: 'a'
          }, 'g p i ('
        ], {
          mode: 'normal',
          text: originalText.replace('111', 'A register'),
          register: {
            'a': {
              text: '111'
            }
          }
        });
      });
    });
    return describe('ToggleLineComments', function() {
      var oldGrammar, originalText, _ref2;
      _ref2 = [], oldGrammar = _ref2[0], originalText = _ref2[1];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          var grammar;
          oldGrammar = editor.getGrammar();
          grammar = atom.grammars.grammarForScopeName('source.coffee');
          editor.setGrammar(grammar);
          originalText = "class Base\n  constructor: (args) ->\n    pivot = items.shift()\n    left = []\n    right = []\n\nconsole.log \"hello\"";
          return set({
            text: originalText
          });
        });
      });
      afterEach(function() {
        return editor.setGrammar(oldGrammar);
      });
      it('toggle comment for textobject for indent and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g / i i', {
          text: "class Base\n  constructor: (args) ->\n    # pivot = items.shift()\n    # left = []\n    # right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
      return it('toggle comment for textobject for paragraph and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g / i p', {
          text: "# class Base\n#   constructor: (args) ->\n#     pivot = items.shift()\n#     left = []\n#     right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLGVBQVIsQ0FBMUIsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsMEJBQVQsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQ0U7QUFBQSxV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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/operator-transform-string-spec.coffee
