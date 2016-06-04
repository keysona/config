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
        return ensure('4~', {
          text: 'AbC\nxYz',
          cursor: [[0, 2], [1, 2]]
        });
      });
      describe("in visual mode", function() {
        return it("toggles the case of the selected text", function() {
          set({
            cursorBuffer: [0, 0]
          });
          return ensure('V~', {
            text: 'AbC\nXyZ'
          });
        });
      });
      return describe("with g and motion", function() {
        it("toggles the case of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 0]
          });
          return ensure('g~2l', {
            text: 'Abc\nXyZ',
            cursor: [0, 0]
          });
        });
        it("g~~ toggles the line of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 1]
          });
          return ensure('g~~', {
            text: 'AbC\nXyZ',
            cursor: [0, 1]
          });
        });
        return it("g~g~ toggles the line of text, won't move cursor", function() {
          set({
            cursorBuffer: [0, 1]
          });
          return ensure('g~g~', {
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
        ensure('gUl', {
          text: 'ABc\nXyZ',
          cursor: [0, 0]
        });
        ensure('gUe', {
          text: 'ABC\nXyZ',
          cursor: [0, 0]
        });
        set({
          cursorBuffer: [1, 0]
        });
        return ensure('gU$', {
          text: 'ABC\nXYZ',
          cursor: [1, 0]
        });
      });
      it("makes the selected text uppercase in visual mode", function() {
        return ensure('VU', {
          text: 'ABC\nXyZ'
        });
      });
      it("gUU upcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('gUU', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gUgU upcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('gUgU', {
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
        return ensure('gu$', {
          text: 'abc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes the selected text lowercase in visual mode", function() {
        return ensure('Vu', {
          text: 'abc\nXyZ'
        });
      });
      it("guu downcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('guu', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gugu downcase the line of text, won't move cursor", function() {
        set({
          cursorBuffer: [0, 1]
        });
        return ensure('gugu', {
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
            return ensure('>>', {
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
            return ensure('>>', {
              text: "  12345\nabcde\nABCDE",
              cursor: [0, 2]
            });
          });
        });
        return describe("when followed by a repeating >", function() {
          beforeEach(function() {
            return keystroke('3>>');
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
          return keystroke('V>');
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
          return ensure('vj>', {
            mode: 'normal',
            cursor: [1, 0],
            text: "  12345\n  abcde\nABCDE"
          });
        });
        it("when repeated, operate on same range when cursor was not moved", function() {
          ensure('vj>', {
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
          ensure('vj>', {
            mode: 'normal',
            cursor: [1, 0],
            text: "  12345\n  abcde\nABCDE"
          });
          return ensure('l.', {
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
          return ensure('<<', {
            text: "12345\n  abcde\nABCDE",
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by a repeating <", function() {
        beforeEach(function() {
          return keystroke('2<<');
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
          return ensure('V<', {
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
            return keystroke('==');
          });
          return it("indents the current line", function() {
            return expect(editor.indentationForBufferRow(1)).toBe(0);
          });
        });
        return describe("when followed by a repeating =", function() {
          beforeEach(function() {
            return keystroke('2==');
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
        ensure('gc$', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('jgc$', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("CamelCase selected text", function() {
        return ensure('Vjgc', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("gcgc CamelCase the line of text, won't move cursor", function() {
        return ensure('lgcgc', {
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
        ensure('g_$', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('jg_$', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [1, 0]
        });
      });
      it("SnakeCase selected text", function() {
        return ensure('Vjg_', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [0, 0]
        });
      });
      return it("g_g_ SnakeCase the line of text, won't move cursor", function() {
        return ensure('lg_g_', {
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
        ensure('g-$', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 0]
        });
        return ensure('jg-$', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [1, 0]
        });
      });
      it("DashCase selected text", function() {
        return ensure('Vjg-', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      return it("g-g- DashCase the line of text, won't move cursor", function() {
        return ensure('lg-g-', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 1]
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
            'ysiw', {
              char: '('
            }
          ], {
            text: "(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround text object with { and repeatable", function() {
          ensure([
            'ysiw', {
              char: '{'
            }
          ], {
            text: "{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "{apple}\n{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround linewise", function() {
          ensure([
            'ysys', {
              char: '{'
            }
          ], {
            text: "{\napple\n}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('3j.', {
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
              'ysiw', {
                char: '('
              }
            ], {
              text: "( apple )\norange\nlemmon"
            });
            keystroke('j');
            ensure([
              'ysiw', {
                char: '{'
              }
            ], {
              text: "( apple )\n{ orange }\nlemmon"
            });
            keystroke('j');
            return ensure([
              'ysiw', {
                char: '['
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
            'msip', {
              char: '('
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
            'msil', {
              char: '<'
            }
          ], {
            text: '\napple\n<pairs> <tomato>\norange\nmilk\n',
            cursor: [2, 0]
          });
        });
        return it("surround text for each word in visual selection", function() {
          return ensure([
            'vipms', {
              char: '"'
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
            'ds', {
              char: '['
            }
          ], {
            text: "apple\npairs: brackets\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('jl.', {
            text: "apple\npairs: brackets\npairs: brackets\n( multi\n  line )"
          });
        });
        it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure([
            'ds', {
              char: '('
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
            'ds', {
              char: '('
            }
          ], {
            text: "apple\n{  orange   }\n"
          });
          return ensure([
            'jds', {
              char: '{'
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
            'ds', {
              char: '{'
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
            'cs', {
              char: '(['
            }
          ], {
            text: "[apple]\n(grape)\n<lemmon>\n{orange}"
          });
          return ensure('jl.', {
            text: "[apple]\n[grape]\n<lemmon>\n{orange}"
          });
        });
        it("change surrounded chars", function() {
          ensure([
            'jjcs', {
              char: '<"'
            }
          ], {
            text: "(apple)\n(grape)\n\"lemmon\"\n{orange}"
          });
          return ensure([
            'jlcs', {
              char: '{!'
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
            'cs', {
              char: '{('
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
            'ysw', {
              char: '('
            }
          ], {
            text: "(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j.', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return it("surround a word with { and repeatable", function() {
          ensure([
            'ysw', {
              char: '{'
            }
          ], {
            text: "{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )",
            cursor: [0, 0]
          });
          return ensure('j.', {
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
          ensure('ds', {
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
          ensure('ds', {
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
          return ensure('ds', {
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
          ensure('ds', {
            text: "___inner\n___(inner)",
            cursor: [0, 0]
          });
          return ensure('j.', {
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
            'cs', {
              char: '<'
            }
          ], {
            text: "<apple>\n(grape)\n<lemmon>\n{orange}"
          });
          ensure('j.', {
            text: "<apple>\n<grape>\n<lemmon>\n{orange}"
          });
          return ensure('jj.', {
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
            'cs', {
              char: '<'
            }
          ], {
            text: "___<inner>\n___(inner)",
            cursor: [0, 0]
          });
          return ensure('j.', {
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
        ensure('viw', {
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
        return ensure('_i(', {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'default register')
        });
      });
      it("can repeat", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_i(j.', {
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
            char: 'a'
          }, '_i('
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
        ensure('viw', {
          selectedText: 'aaa'
        });
        return ensure('gp', {
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
        return ensure('gpi(', {
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
        return ensure('gpi(j.', {
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
            char: 'a'
          }, 'gpi('
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
        ensure('g/ii', {
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
        ensure('g/ip', {
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
