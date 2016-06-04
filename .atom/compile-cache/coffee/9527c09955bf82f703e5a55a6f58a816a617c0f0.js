(function() {
  var TextData, dispatch, getView, getVimState, globalState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData, getView = _ref.getView;

  settings = require('../lib/settings');

  globalState = require('../lib/global-state');

  describe("Motion Search", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("the / keybinding", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = {
          activate: jasmine.createSpy("activate")
        };
        set({
          text: "abc\ndef\nabc\ndef\n",
          cursor: [0, 0]
        });
        spyOn(atom.workspace, 'getActivePane').andReturn(pane);
        vimState.searchHistory.clear();
        return globalState.currentSearch = null;
      });
      describe("as a motion", function() {
        it("moves the cursor to the specified search pattern", function() {
          ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
          return expect(pane.activate).toHaveBeenCalled();
        });
        it("loops back around", function() {
          set({
            cursor: [3, 0]
          });
          return ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
        });
        it("uses a valid regex as a regex", function() {
          ensure([
            '/', {
              search: '[abc]'
            }
          ], {
            cursor: [0, 1]
          });
          return ensure('n', {
            cursor: [0, 2]
          });
        });
        it("uses an invalid regex as a literal string", function() {
          set({
            text: "abc\n[abc]\n"
          });
          ensure([
            '/', {
              search: '[abc'
            }
          ], {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [1, 0]
          });
        });
        it("uses ? as a literal string", function() {
          set({
            text: "abc\n[a?c?\n"
          });
          ensure([
            '/', {
              search: '?'
            }
          ], {
            cursor: [1, 2]
          });
          return ensure('n', {
            cursor: [1, 4]
          });
        });
        it('works with selection in visual mode', function() {
          set({
            text: 'one two three'
          });
          ensure([
            'v/', {
              search: 'th'
            }
          ], {
            cursor: [0, 9]
          });
          return ensure('d', {
            text: 'hree'
          });
        });
        it('extends selection when repeating search in visual mode', function() {
          set({
            text: "line1\nline2\nline3"
          });
          ensure([
            'v/', {
              search: 'line'
            }
          ], {
            selectedBufferRange: [[0, 0], [1, 1]]
          });
          return ensure('n', {
            selectedBufferRange: [[0, 0], [2, 1]]
          });
        });
        it('searches to the correct column in visual linewise mode', function() {
          return ensure([
            'V/', {
              search: 'ef'
            }
          ], {
            selectedText: "abc\ndef\n",
            characterwiseHead: [1, 1],
            cursor: [2, 0],
            mode: ['visual', 'linewise']
          });
        });
        it('not extend linwise selection if search matches on same line', function() {
          set({
            text: "abc def\ndef\n"
          });
          return ensure([
            'V/', {
              search: 'ef'
            }
          ], {
            selectedText: "abc def\n"
          });
        });
        describe("case sensitivity", function() {
          beforeEach(function() {
            return set({
              text: "\nabc\nABC\n",
              cursor: [0, 0]
            });
          });
          it("works in case sensitive mode", function() {
            ensure([
              '/', {
                search: 'ABC'
              }
            ], {
              cursor: [2, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode", function() {
            ensure([
              '/', {
                search: '\\cAbC'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode wherever \\c is", function() {
            ensure([
              '/', {
                search: 'AbC\\c'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          describe("when ignoreCaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('ignoreCaseForSearch', true);
            });
            it("ignore case when search [case-1]", function() {
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when search [case-2]", function() {
              ensure([
                '/', {
                  search: 'ABC'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
          return describe("when useSmartcaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('useSmartcaseForSearch', true);
            });
            it("ignore case when searh term includes A-Z", function() {
              ensure([
                '/', {
                  search: 'ABC'
                }
              ], {
                cursor: [2, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', false);
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', true);
              ensure([
                '/', {
                  search: 'abc'
                }
              ], {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
        });
        describe("repeating", function() {
          return it("does nothing with no search history", function() {
            set({
              cursor: [0, 0]
            });
            ensure('n', {
              cursor: [0, 0]
            });
            set({
              cursor: [1, 1]
            });
            return ensure('n', {
              cursor: [1, 1]
            });
          });
        });
        describe("repeating with search history", function() {
          beforeEach(function() {
            return keystroke([
              '/', {
                search: 'def'
              }
            ]);
          });
          it("repeats previous search with /<enter>", function() {
            return ensure([
              '/', {
                search: ''
              }
            ], {
              cursor: [3, 0]
            });
          });
          it("repeats previous search with //", function() {
            return ensure([
              '/', {
                search: '/'
              }
            ], {
              cursor: [3, 0]
            });
          });
          describe("the n keybinding", function() {
            return it("repeats the last search", function() {
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe("the N keybinding", function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              ensure('N', {
                cursor: [3, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
        return describe("composing", function() {
          it("composes with operators", function() {
            return ensure([
              'd/', {
                search: 'def'
              }
            ], {
              text: "def\nabc\ndef\n"
            });
          });
          return it("repeats correctly with operators", function() {
            return ensure([
              'd/', {
                search: 'def'
              }, '.'
            ], {
              text: "def\n"
            });
          });
        });
      });
      describe("when reversed as ?", function() {
        it("moves the cursor backwards to the specified search pattern", function() {
          return ensure([
            '?', {
              search: 'def'
            }
          ], {
            cursor: [3, 0]
          });
        });
        it("accepts / as a literal search pattern", function() {
          set({
            text: "abc\nd/f\nabc\nd/f\n",
            cursor: [0, 0]
          });
          ensure([
            '?', {
              search: '/'
            }
          ], {
            cursor: [3, 1]
          });
          return ensure([
            '?', {
              search: '/'
            }
          ], {
            cursor: [1, 1]
          });
        });
        return describe("repeating", function() {
          beforeEach(function() {
            return keystroke([
              '?', {
                search: 'def'
              }
            ]);
          });
          it("repeats previous search as reversed with ?<enter>", function() {
            return ensure([
              '?', {
                search: ''
              }
            ], {
              cursor: [1, 0]
            });
          });
          it("repeats previous search as reversed with ??", function() {
            return ensure([
              '?', {
                search: '?'
              }
            ], {
              cursor: [1, 0]
            });
          });
          describe('the n keybinding', function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe('the N keybinding', function() {
            return it("repeats the last search forwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
      });
      describe("using search history", function() {
        var ensureInputEditor, inputEditor;
        inputEditor = null;
        ensureInputEditor = function(command, _arg) {
          var text;
          text = _arg.text;
          dispatch(inputEditor, command);
          return expect(inputEditor.getModel().getText()).toEqual(text);
        };
        beforeEach(function() {
          ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
          ensure([
            '/', {
              search: 'abc'
            }
          ], {
            cursor: [2, 0]
          });
          return inputEditor = vimState.searchInput.editorElement;
        });
        it("allows searching history in the search field", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          return ensureInputEditor('core:move-up', {
            text: 'def'
          });
        });
        return it("resets the search field to empty when scrolling back", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          ensureInputEditor('core:move-down', {
            text: 'abc'
          });
          return ensureInputEditor('core:move-down', {
            text: ''
          });
        });
      });
      return describe("highlightSearch", function() {
        var ensureHightlightSearch, textForMarker;
        textForMarker = function(marker) {
          return editor.getTextInBufferRange(marker.getBufferRange());
        };
        ensureHightlightSearch = function(options) {
          var markers, text;
          markers = vimState.getHighlightSearch();
          if (options.length != null) {
            expect(markers).toHaveLength(options.length);
          }
          if (options.text != null) {
            text = markers.map(function(marker) {
              return textForMarker(marker);
            });
            expect(text).toEqual(options.text);
          }
          if (options.mode != null) {
            return ensure({
              mode: options.mode
            });
          }
        };
        beforeEach(function() {
          jasmine.attachToDOM(getView(atom.workspace));
          settings.set('highlightSearch', true);
          expect(vimState.hasHighlightSearch()).toBe(false);
          return ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
        });
        describe("clearHighlightSearch command", function() {
          return it("clear highlightSearch marker", function() {
            ensureHightlightSearch({
              length: 2,
              text: ["def", "def"],
              mode: 'normal'
            });
            dispatch(editorElement, 'vim-mode-plus:clear-highlight-search');
            return expect(vimState.hasHighlightSearch()).toBe(false);
          });
        });
        return describe("clearHighlightSearchOnResetNormalMode", function() {
          describe("default setting", function() {
            return it("it won't clear highlightSearch", function() {
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              dispatch(editorElement, 'vim-mode-plus:reset-normal-mode');
              return ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
            });
          });
          return describe("when enabled", function() {
            return it("it clear highlightSearch on reset-normal-mode", function() {
              settings.set('clearHighlightSearchOnResetNormalMode', true);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              dispatch(editorElement, 'vim-mode-plus:reset-normal-mode');
              expect(vimState.hasHighlightSearch()).toBe(false);
              return ensure({
                mode: 'normal'
              });
            });
          });
        });
      });
    });
    describe("the * keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abd\n@def\nabd\ndef\n",
          cursorBuffer: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves cursor to next occurence of word under cursor", function() {
          return ensure('*', {
            cursorBuffer: [2, 0]
          });
        });
        it("repeats with the n key", function() {
          ensure('*', {
            cursorBuffer: [2, 0]
          });
          return ensure('n', {
            cursorBuffer: [0, 0]
          });
        });
        it("doesn't move cursor unless next occurence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursorBuffer: [0, 0]
          });
          return ensure('*', {
            cursorBuffer: [0, 0]
          });
        });
        describe("with words that contain 'non-word' characters", function() {
          it("moves cursor to next occurence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
          it("doesn't move cursor unless next match has exact word ending", function() {
            set({
              text: "abc\n@def\nabc\n@def1\n",
              cursorBuffer: [1, 1]
            });
            return ensure('*', {
              cursorBuffer: [1, 0]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\ndef\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 1]
            });
          });
        });
        describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
        describe("when cursor is not on a word", function() {
          return it("does a match with the next word", function() {
            set({
              text: "abc\na  @def\n abc\n @def",
              cursorBuffer: [1, 1]
            });
            return ensure('*', {
              cursorBuffer: [3, 1]
            });
          });
        });
        return describe("when cursor is at EOF", function() {
          return it("doesn't try to do any match", function() {
            set({
              text: "abc\n@def\nabc\n ",
              cursorBuffer: [3, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [0, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('*', {
            cursorBuffer: [3, 0]
          });
          return ensure('n', {
            cursorBuffer: [0, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('*', {
            cursorBuffer: [1, 0]
          });
          ensure('n', {
            cursorBuffer: [2, 0]
          });
          ensure('n', {
            cursorBuffer: [3, 0]
          });
          return ensure('n', {
            cursorBuffer: [4, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [1, 0]
            });
            ensure('*', {
              cursorBuffer: [4, 0]
            });
            return ensure('n', {
              cursorBuffer: [1, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('*', {
              cursorBuffer: [1, 0]
            });
            ensure('n', {
              cursorBuffer: [2, 0]
            });
            ensure('n', {
              cursorBuffer: [3, 0]
            });
            return ensure('n', {
              cursorBuffer: [4, 0]
            });
          });
        });
      });
    });
    describe("the hash keybinding", function() {
      describe("as a motion", function() {
        it("moves cursor to previous occurence of word under cursor", function() {
          set({
            text: "abc\n@def\nabc\ndef\n",
            cursorBuffer: [2, 1]
          });
          return ensure('#', {
            cursorBuffer: [0, 0]
          });
        });
        it("repeats with n", function() {
          set({
            text: "abc\n@def\nabc\ndef\nabc\n",
            cursorBuffer: [2, 1]
          });
          ensure('#', {
            cursorBuffer: [0, 0]
          });
          ensure('n', {
            cursorBuffer: [4, 0]
          });
          return ensure('n', {
            cursorBuffer: [2, 0]
          });
        });
        it("doesn't move cursor unless next occurence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursorBuffer: [0, 0]
          });
          return ensure('#', {
            cursorBuffer: [0, 0]
          });
        });
        describe("with words that containt 'non-word' characters", function() {
          it("moves cursor to next occurence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [3, 0]
            });
            return ensure('#', {
              cursorBuffer: [1, 0]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\n@def\nabc\ndef\n",
              cursorBuffer: [3, 0]
            });
            return ensure('#', {
              cursorBuffer: [1, 1]
            });
          });
        });
        return describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [4, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('#', {
            cursorBuffer: [1, 0]
          });
          return ensure('n', {
            cursorBuffer: [4, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('#', {
            cursorBuffer: [3, 0]
          });
          ensure('n', {
            cursorBuffer: [2, 0]
          });
          ensure('n', {
            cursorBuffer: [1, 0]
          });
          return ensure('n', {
            cursorBuffer: [0, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [4, 0]
            });
            ensure('#', {
              cursorBuffer: [1, 0]
            });
            return ensure('n', {
              cursorBuffer: [4, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('#', {
              cursorBuffer: [4, 0]
            });
            ensure('n', {
              cursorBuffer: [3, 0]
            });
            ensure('n', {
              cursorBuffer: [2, 0]
            });
            ensure('n', {
              cursorBuffer: [1, 0]
            });
            return ensure('n', {
              cursorBuffer: [0, 0]
            });
          });
        });
      });
    });
    return describe('the % motion', function() {
      describe("Parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "(___)"
          });
        });
        describe("as operator target", function() {
          beforeEach(function() {
            return set({
              text: "(_(_)_)"
            });
          });
          it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 2]
            });
            return ensure('d%', {
              text: "(__)"
            });
          });
          return it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 4]
            });
            return ensure('d%', {
              text: "(__)"
            });
          });
        });
        describe("cursor is at pair char", function() {
          it("cursor is at open pair, it move to closing pair", function() {
            set({
              cursor: [0, 0]
            });
            ensure('%', {
              cursor: [0, 4]
            });
            return ensure('%', {
              cursor: [0, 0]
            });
          });
          return it("cursor is at close pair, it move to open pair", function() {
            set({
              cursor: [0, 4]
            });
            ensure('%', {
              cursor: [0, 0]
            });
            return ensure('%', {
              cursor: [0, 4]
            });
          });
        });
        describe("cursor is enclosed by pair", function() {
          beforeEach(function() {
            return set({
              text: "(___)",
              cursor: [0, 2]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 0]
            });
          });
        });
        describe("cursor is bofore open pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)",
              cursor: [0, 0]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 6]
            });
          });
        });
        describe("cursor is after close pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)__",
              cursor: [0, 7]
            });
          });
          return it("fail to move", function() {
            return ensure('%', {
              cursor: [0, 7]
            });
          });
        });
        return describe("multi line", function() {
          beforeEach(function() {
            return set({
              text: "___\n___(__\n___\n___)"
            });
          });
          describe("when open and close pair is not at cursor line", function() {
            it("fail to move", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('%', {
                cursor: [0, 0]
              });
            });
            return it("fail to move", function() {
              set({
                cursor: [2, 0]
              });
              return ensure('%', {
                cursor: [2, 0]
              });
            });
          });
          describe("when open pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [1, 0]
              });
              return ensure('%', {
                cursor: [3, 3]
              });
            });
          });
          describe("when cursor position is greater than open pair", function() {
            return it("fail to move", function() {
              set({
                cursor: [1, 4]
              });
              return ensure('%', {
                cursor: [1, 4]
              });
            });
          });
          return describe("when close pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [3, 0]
              });
              return ensure('%', {
                cursor: [1, 3]
              });
            });
          });
        });
      });
      describe("CurlyBracket", function() {
        beforeEach(function() {
          return set({
            text: "{___}"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("SquareBracket", function() {
        beforeEach(function() {
          return set({
            text: "[___]"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      return describe("complex situation", function() {
        beforeEach(function() {
          return set({
            text: "(_____)__{__[___]__}\n_"
          });
        });
        it('move to closing pair which open pair come first', function() {
          set({
            cursor: [0, 7]
          });
          ensure('%', {
            cursor: [0, 19]
          });
          set({
            cursor: [0, 10]
          });
          return ensure('%', {
            cursor: [0, 16]
          });
        });
        return it('enclosing pair is prioritized over forwarding range', function() {
          set({
            cursor: [0, 2]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tc2VhcmNoLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFFQUFBOztBQUFBLEVBQUEsT0FBNkMsT0FBQSxDQUFRLGVBQVIsQ0FBN0MsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxFQUF3QixnQkFBQSxRQUF4QixFQUFrQyxlQUFBLE9BQWxDLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FGZCxDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFFBQUEsOERBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxXQUFBLEdBQUQsRUFBTSxjQUFBLE1BQU4sRUFBYyxpQkFBQSxTQUFkLEVBQTJCLEtBSGpCO01BQUEsQ0FBWixFQURTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsZUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxNQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLElBQUEsR0FBTztBQUFBLFVBQUMsUUFBQSxFQUFVLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFVBQWxCLENBQVg7U0FBUCxDQUFBO0FBQUEsUUFDQSxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxzQkFBTjtBQUFBLFVBTUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FOUjtTQURGLENBREEsQ0FBQTtBQUFBLFFBU0EsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLGVBQXRCLENBQXNDLENBQUMsU0FBdkMsQ0FBaUQsSUFBakQsQ0FUQSxDQUFBO0FBQUEsUUFZQSxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQXZCLENBQUEsQ0FaQSxDQUFBO2VBYUEsV0FBVyxDQUFDLGFBQVosR0FBNEIsS0FkbkI7TUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLE1Ba0JBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBLEdBQUE7QUFDckQsVUFBQSxNQUFBLENBQU87WUFBQyxHQUFELEVBQU07QUFBQSxjQUFBLE1BQUEsRUFBUSxLQUFSO2FBQU47V0FBUCxFQUNFO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBREYsQ0FBQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsUUFBWixDQUFxQixDQUFDLGdCQUF0QixDQUFBLEVBSHFEO1FBQUEsQ0FBdkQsQ0FBQSxDQUFBO0FBQUEsUUFLQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTztZQUFDLEdBQUQsRUFBTTtBQUFBLGNBQUEsTUFBQSxFQUFRLEtBQVI7YUFBTjtXQUFQLEVBQTZCO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQTdCLEVBRnNCO1FBQUEsQ0FBeEIsQ0FMQSxDQUFBO0FBQUEsUUFTQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQSxHQUFBO0FBRWxDLFVBQUEsTUFBQSxDQUFPO1lBQUMsR0FBRCxFQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsT0FBUjthQUFOO1dBQVAsRUFBK0I7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBL0IsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBWixFQUhrQztRQUFBLENBQXBDLENBVEEsQ0FBQTtBQUFBLFFBY0EsRUFBQSxDQUFHLDJDQUFILEVBQWdELFNBQUEsR0FBQTtBQUU5QyxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLGNBQU47V0FBSixDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTztZQUFDLEdBQUQsRUFBTTtBQUFBLGNBQUEsTUFBQSxFQUFRLE1BQVI7YUFBTjtXQUFQLEVBQThCO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQTlCLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQVosRUFKOEM7UUFBQSxDQUFoRCxDQWRBLENBQUE7QUFBQSxRQW9CQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxJQUFBLEVBQU0sY0FBTjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPO1lBQUMsR0FBRCxFQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsR0FBUjthQUFOO1dBQVAsRUFBMkI7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBM0IsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBWixFQUgrQjtRQUFBLENBQWpDLENBcEJBLENBQUE7QUFBQSxRQXlCQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxJQUFBLEVBQU0sZUFBTjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPO1lBQUMsSUFBRCxFQUFPO0FBQUEsY0FBQSxNQUFBLEVBQVEsSUFBUjthQUFQO1dBQVAsRUFBNkI7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBN0IsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLElBQUEsRUFBTSxNQUFOO1dBQVosRUFId0M7UUFBQSxDQUExQyxDQXpCQSxDQUFBO0FBQUEsUUE4QkEsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUEsR0FBQTtBQUMzRCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLHFCQUFOO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFNQSxNQUFBLENBQU87WUFBQyxJQUFELEVBQU87QUFBQSxjQUFDLE1BQUEsRUFBUSxNQUFUO2FBQVA7V0FBUCxFQUNFO0FBQUEsWUFBQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUFyQjtXQURGLENBTkEsQ0FBQTtpQkFRQSxNQUFBLENBQU8sR0FBUCxFQUNFO0FBQUEsWUFBQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUFyQjtXQURGLEVBVDJEO1FBQUEsQ0FBN0QsQ0E5QkEsQ0FBQTtBQUFBLFFBMENBLEVBQUEsQ0FBRyx3REFBSCxFQUE2RCxTQUFBLEdBQUE7aUJBQzNELE1BQUEsQ0FBTztZQUFDLElBQUQsRUFBTztBQUFBLGNBQUMsTUFBQSxFQUFRLElBQVQ7YUFBUDtXQUFQLEVBQ0U7QUFBQSxZQUFBLFlBQUEsRUFBYyxZQUFkO0FBQUEsWUFDQSxpQkFBQSxFQUFtQixDQUFDLENBQUQsRUFBSSxDQUFKLENBRG5CO0FBQUEsWUFFQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUZSO0FBQUEsWUFHQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsVUFBWCxDQUhOO1dBREYsRUFEMkQ7UUFBQSxDQUE3RCxDQTFDQSxDQUFBO0FBQUEsUUFpREEsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUEsR0FBQTtBQUVoRSxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLGdCQUFOO1dBQUosQ0FBQSxDQUFBO2lCQUlBLE1BQUEsQ0FBTztZQUFDLElBQUQsRUFBTztBQUFBLGNBQUMsTUFBQSxFQUFRLElBQVQ7YUFBUDtXQUFQLEVBQ0U7QUFBQSxZQUFBLFlBQUEsRUFBYyxXQUFkO1dBREYsRUFOZ0U7UUFBQSxDQUFsRSxDQWpEQSxDQUFBO0FBQUEsUUEwREEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sY0FBTjtBQUFBLGNBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjthQURGLEVBRFM7VUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFVBS0EsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxZQUFBLE1BQUEsQ0FBTztjQUFDLEdBQUQsRUFBTTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxLQUFSO2VBQU47YUFBUCxFQUE2QjtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUE3QixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFaLEVBRmlDO1VBQUEsQ0FBbkMsQ0FMQSxDQUFBO0FBQUEsVUFTQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFlBQUEsTUFBQSxDQUFPO2NBQUMsR0FBRCxFQUFNO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLFFBQVI7ZUFBTjthQUFQLEVBQWdDO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQWhDLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQVosRUFGbUM7VUFBQSxDQUFyQyxDQVRBLENBQUE7QUFBQSxVQWFBLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBLEdBQUE7QUFDbkQsWUFBQSxNQUFBLENBQU87Y0FBQyxHQUFELEVBQU07QUFBQSxnQkFBQSxNQUFBLEVBQVEsUUFBUjtlQUFOO2FBQVAsRUFBZ0M7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBaEMsQ0FBQSxDQUFBO21CQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBWixFQUZtRDtVQUFBLENBQXJELENBYkEsQ0FBQTtBQUFBLFVBaUJBLFFBQUEsQ0FBUyxxQ0FBVCxFQUFnRCxTQUFBLEdBQUE7QUFDOUMsWUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO3FCQUNULFFBQVEsQ0FBQyxHQUFULENBQWEscUJBQWIsRUFBb0MsSUFBcEMsRUFEUztZQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsWUFHQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLGNBQUEsTUFBQSxDQUFPO2dCQUFDLEdBQUQsRUFBTTtBQUFBLGtCQUFBLE1BQUEsRUFBUSxLQUFSO2lCQUFOO2VBQVAsRUFBNkI7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQTdCLENBQUEsQ0FBQTtxQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFaLEVBRnFDO1lBQUEsQ0FBdkMsQ0FIQSxDQUFBO21CQU9BLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsY0FBQSxNQUFBLENBQU87Z0JBQUMsR0FBRCxFQUFNO0FBQUEsa0JBQUEsTUFBQSxFQUFRLEtBQVI7aUJBQU47ZUFBUCxFQUE2QjtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBN0IsQ0FBQSxDQUFBO3FCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQVosRUFGcUM7WUFBQSxDQUF2QyxFQVI4QztVQUFBLENBQWhELENBakJBLENBQUE7aUJBNkJBLFFBQUEsQ0FBUyx1Q0FBVCxFQUFrRCxTQUFBLEdBQUE7QUFDaEQsWUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO3FCQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsdUJBQWIsRUFBc0MsSUFBdEMsRUFEUztZQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsWUFHQSxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQSxHQUFBO0FBQzdDLGNBQUEsTUFBQSxDQUFPO2dCQUFDLEdBQUQsRUFBTTtBQUFBLGtCQUFBLE1BQUEsRUFBUSxLQUFSO2lCQUFOO2VBQVAsRUFBNkI7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQTdCLENBQUEsQ0FBQTtxQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFaLEVBRjZDO1lBQUEsQ0FBL0MsQ0FIQSxDQUFBO0FBQUEsWUFPQSxFQUFBLENBQUcsa0ZBQUgsRUFBdUYsU0FBQSxHQUFBO0FBQ3JGLGNBQUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxxQkFBYixFQUFvQyxLQUFwQyxDQUFBLENBQUE7QUFBQSxjQUNBLE1BQUEsQ0FBTztnQkFBQyxHQUFELEVBQU07QUFBQSxrQkFBQSxNQUFBLEVBQVEsS0FBUjtpQkFBTjtlQUFQLEVBQTZCO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUE3QixDQURBLENBQUE7cUJBRUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBWixFQUhxRjtZQUFBLENBQXZGLENBUEEsQ0FBQTttQkFZQSxFQUFBLENBQUcsa0ZBQUgsRUFBdUYsU0FBQSxHQUFBO0FBQ3JGLGNBQUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxxQkFBYixFQUFvQyxJQUFwQyxDQUFBLENBQUE7QUFBQSxjQUNBLE1BQUEsQ0FBTztnQkFBQyxHQUFELEVBQU07QUFBQSxrQkFBQSxNQUFBLEVBQVEsS0FBUjtpQkFBTjtlQUFQLEVBQTZCO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUE3QixDQURBLENBQUE7cUJBRUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBWixFQUhxRjtZQUFBLENBQXZGLEVBYmdEO1VBQUEsQ0FBbEQsRUE5QjJCO1FBQUEsQ0FBN0IsQ0ExREEsQ0FBQTtBQUFBLFFBMEdBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtpQkFDcEIsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFaLENBREEsQ0FBQTtBQUFBLFlBRUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FGQSxDQUFBO21CQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBWixFQUp3QztVQUFBLENBQTFDLEVBRG9CO1FBQUEsQ0FBdEIsQ0ExR0EsQ0FBQTtBQUFBLFFBaUhBLFFBQUEsQ0FBUywrQkFBVCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULFNBQUEsQ0FBVTtjQUFDLEdBQUQsRUFBTTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxLQUFSO2VBQU47YUFBVixFQURTO1VBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxVQUdBLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBLEdBQUE7bUJBQzFDLE1BQUEsQ0FBTztjQUFDLEdBQUQsRUFBTTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxFQUFSO2VBQU47YUFBUCxFQUEwQjtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUExQixFQUQwQztVQUFBLENBQTVDLENBSEEsQ0FBQTtBQUFBLFVBTUEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTttQkFDcEMsTUFBQSxDQUFPO2NBQUMsR0FBRCxFQUFNO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLEdBQVI7ZUFBTjthQUFQLEVBQTJCO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQTNCLEVBRG9DO1VBQUEsQ0FBdEMsQ0FOQSxDQUFBO0FBQUEsVUFTQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO21CQUMzQixFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO3FCQUM1QixNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFaLEVBRDRCO1lBQUEsQ0FBOUIsRUFEMkI7VUFBQSxDQUE3QixDQVRBLENBQUE7aUJBYUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTttQkFDM0IsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxjQUFBLEdBQUEsQ0FBSTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBSixDQUFBLENBQUE7QUFBQSxjQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQVosQ0FEQSxDQUFBO3FCQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQVosRUFIc0M7WUFBQSxDQUF4QyxFQUQyQjtVQUFBLENBQTdCLEVBZHdDO1FBQUEsQ0FBMUMsQ0FqSEEsQ0FBQTtlQXFJQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsVUFBQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO21CQUM1QixNQUFBLENBQU87Y0FBQyxJQUFELEVBQU87QUFBQSxnQkFBQSxNQUFBLEVBQVEsS0FBUjtlQUFQO2FBQVAsRUFBOEI7QUFBQSxjQUFBLElBQUEsRUFBTSxpQkFBTjthQUE5QixFQUQ0QjtVQUFBLENBQTlCLENBQUEsQ0FBQTtpQkFHQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQSxHQUFBO21CQUNyQyxNQUFBLENBQU87Y0FBQyxJQUFELEVBQU87QUFBQSxnQkFBQSxNQUFBLEVBQVEsS0FBUjtlQUFQLEVBQXNCLEdBQXRCO2FBQVAsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLE9BQU47YUFERixFQURxQztVQUFBLENBQXZDLEVBSm9CO1FBQUEsQ0FBdEIsRUF0SXNCO01BQUEsQ0FBeEIsQ0FsQkEsQ0FBQTtBQUFBLE1BZ0tBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxFQUFBLENBQUcsNERBQUgsRUFBaUUsU0FBQSxHQUFBO2lCQUMvRCxNQUFBLENBQU87WUFBQyxHQUFELEVBQU07QUFBQSxjQUFBLE1BQUEsRUFBUSxLQUFSO2FBQU47V0FBUCxFQUE2QjtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUE3QixFQUQrRDtRQUFBLENBQWpFLENBQUEsQ0FBQTtBQUFBLFFBR0EsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxVQUFBLEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLHNCQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsQ0FBQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU87WUFBQyxHQUFELEVBQU07QUFBQSxjQUFBLE1BQUEsRUFBUSxHQUFSO2FBQU47V0FBUCxFQUEyQjtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUEzQixDQUhBLENBQUE7aUJBSUEsTUFBQSxDQUFPO1lBQUMsR0FBRCxFQUFNO0FBQUEsY0FBQSxNQUFBLEVBQVEsR0FBUjthQUFOO1dBQVAsRUFBMkI7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBM0IsRUFMMEM7UUFBQSxDQUE1QyxDQUhBLENBQUE7ZUFVQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULFNBQUEsQ0FBVTtjQUFDLEdBQUQsRUFBTTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxLQUFSO2VBQU47YUFBVixFQURTO1VBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxVQUdBLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7bUJBQ3RELE1BQUEsQ0FBTztjQUFDLEdBQUQsRUFBTTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxFQUFSO2VBQU47YUFBUCxFQUEwQjtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUExQixFQURzRDtVQUFBLENBQXhELENBSEEsQ0FBQTtBQUFBLFVBTUEsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUEsR0FBQTttQkFDaEQsTUFBQSxDQUFPO2NBQUMsR0FBRCxFQUFNO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLEdBQVI7ZUFBTjthQUFQLEVBQTJCO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQTNCLEVBRGdEO1VBQUEsQ0FBbEQsQ0FOQSxDQUFBO0FBQUEsVUFTQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO21CQUMzQixFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQSxHQUFBO0FBQ3RDLGNBQUEsR0FBQSxDQUFJO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFKLENBQUEsQ0FBQTtxQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFaLEVBRnNDO1lBQUEsQ0FBeEMsRUFEMkI7VUFBQSxDQUE3QixDQVRBLENBQUE7aUJBY0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTttQkFDM0IsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxjQUFBLEdBQUEsQ0FBSTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBSixDQUFBLENBQUE7cUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBWixFQUZxQztZQUFBLENBQXZDLEVBRDJCO1VBQUEsQ0FBN0IsRUFmb0I7UUFBQSxDQUF0QixFQVg2QjtNQUFBLENBQS9CLENBaEtBLENBQUE7QUFBQSxNQStMQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFlBQUEsOEJBQUE7QUFBQSxRQUFBLFdBQUEsR0FBYyxJQUFkLENBQUE7QUFBQSxRQUNBLGlCQUFBLEdBQW9CLFNBQUMsT0FBRCxFQUFVLElBQVYsR0FBQTtBQUNsQixjQUFBLElBQUE7QUFBQSxVQUQ2QixPQUFELEtBQUMsSUFDN0IsQ0FBQTtBQUFBLFVBQUEsUUFBQSxDQUFTLFdBQVQsRUFBc0IsT0FBdEIsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxXQUFXLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsT0FBdkIsQ0FBQSxDQUFQLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsSUFBakQsRUFGa0I7UUFBQSxDQURwQixDQUFBO0FBQUEsUUFLQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxNQUFBLENBQU87WUFBQyxHQUFELEVBQU07QUFBQSxjQUFBLE1BQUEsRUFBUSxLQUFSO2FBQU47V0FBUCxFQUE2QjtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUE3QixDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTztZQUFDLEdBQUQsRUFBTTtBQUFBLGNBQUEsTUFBQSxFQUFRLEtBQVI7YUFBTjtXQUFQLEVBQTZCO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQTdCLENBREEsQ0FBQTtpQkFFQSxXQUFBLEdBQWMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxjQUgxQjtRQUFBLENBQVgsQ0FMQSxDQUFBO0FBQUEsUUFVQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQSxHQUFBO0FBQ2pELFVBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxpQkFBQSxDQUFrQixjQUFsQixFQUFrQztBQUFBLFlBQUEsSUFBQSxFQUFNLEtBQU47V0FBbEMsQ0FEQSxDQUFBO0FBQUEsVUFFQSxpQkFBQSxDQUFrQixjQUFsQixFQUFrQztBQUFBLFlBQUEsSUFBQSxFQUFNLEtBQU47V0FBbEMsQ0FGQSxDQUFBO2lCQUdBLGlCQUFBLENBQWtCLGNBQWxCLEVBQWtDO0FBQUEsWUFBQSxJQUFBLEVBQU0sS0FBTjtXQUFsQyxFQUppRDtRQUFBLENBQW5ELENBVkEsQ0FBQTtlQWdCQSxFQUFBLENBQUcsc0RBQUgsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELFVBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxpQkFBQSxDQUFrQixjQUFsQixFQUFrQztBQUFBLFlBQUEsSUFBQSxFQUFNLEtBQU47V0FBbEMsQ0FEQSxDQUFBO0FBQUEsVUFFQSxpQkFBQSxDQUFrQixjQUFsQixFQUFrQztBQUFBLFlBQUEsSUFBQSxFQUFNLEtBQU47V0FBbEMsQ0FGQSxDQUFBO0FBQUEsVUFHQSxpQkFBQSxDQUFrQixnQkFBbEIsRUFBb0M7QUFBQSxZQUFBLElBQUEsRUFBTSxLQUFOO1dBQXBDLENBSEEsQ0FBQTtpQkFJQSxpQkFBQSxDQUFrQixnQkFBbEIsRUFBb0M7QUFBQSxZQUFBLElBQUEsRUFBTSxFQUFOO1dBQXBDLEVBTHlEO1FBQUEsQ0FBM0QsRUFqQitCO01BQUEsQ0FBakMsQ0EvTEEsQ0FBQTthQXVOQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFlBQUEscUNBQUE7QUFBQSxRQUFBLGFBQUEsR0FBZ0IsU0FBQyxNQUFELEdBQUE7aUJBQ2QsTUFBTSxDQUFDLG9CQUFQLENBQTRCLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBNUIsRUFEYztRQUFBLENBQWhCLENBQUE7QUFBQSxRQUdBLHNCQUFBLEdBQXlCLFNBQUMsT0FBRCxHQUFBO0FBQ3ZCLGNBQUEsYUFBQTtBQUFBLFVBQUEsT0FBQSxHQUFVLFFBQVEsQ0FBQyxrQkFBVCxDQUFBLENBQVYsQ0FBQTtBQUNBLFVBQUEsSUFBRyxzQkFBSDtBQUNFLFlBQUEsTUFBQSxDQUFPLE9BQVAsQ0FBZSxDQUFDLFlBQWhCLENBQTZCLE9BQU8sQ0FBQyxNQUFyQyxDQUFBLENBREY7V0FEQTtBQUlBLFVBQUEsSUFBRyxvQkFBSDtBQUNFLFlBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBQyxNQUFELEdBQUE7cUJBQVksYUFBQSxDQUFjLE1BQWQsRUFBWjtZQUFBLENBQVosQ0FBUCxDQUFBO0FBQUEsWUFDQSxNQUFBLENBQU8sSUFBUCxDQUFZLENBQUMsT0FBYixDQUFxQixPQUFPLENBQUMsSUFBN0IsQ0FEQSxDQURGO1dBSkE7QUFRQSxVQUFBLElBQUcsb0JBQUg7bUJBQ0UsTUFBQSxDQUFPO0FBQUEsY0FBQyxJQUFBLEVBQU0sT0FBTyxDQUFDLElBQWY7YUFBUCxFQURGO1dBVHVCO1FBQUEsQ0FIekIsQ0FBQTtBQUFBLFFBZUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsT0FBQSxDQUFRLElBQUksQ0FBQyxTQUFiLENBQXBCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxpQkFBYixFQUFnQyxJQUFoQyxDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxRQUFRLENBQUMsa0JBQVQsQ0FBQSxDQUFQLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsS0FBM0MsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTztZQUFDLEdBQUQsRUFBTTtBQUFBLGNBQUEsTUFBQSxFQUFRLEtBQVI7YUFBTjtXQUFQLEVBQTZCO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQTdCLEVBSlM7UUFBQSxDQUFYLENBZkEsQ0FBQTtBQUFBLFFBcUJBLFFBQUEsQ0FBUyw4QkFBVCxFQUF5QyxTQUFBLEdBQUE7aUJBQ3ZDLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsWUFBQSxzQkFBQSxDQUF1QjtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQVI7QUFBQSxjQUFXLElBQUEsRUFBTSxDQUFDLEtBQUQsRUFBUSxLQUFSLENBQWpCO0FBQUEsY0FBaUMsSUFBQSxFQUFNLFFBQXZDO2FBQXZCLENBQUEsQ0FBQTtBQUFBLFlBQ0EsUUFBQSxDQUFTLGFBQVQsRUFBd0Isc0NBQXhCLENBREEsQ0FBQTttQkFFQSxNQUFBLENBQU8sUUFBUSxDQUFDLGtCQUFULENBQUEsQ0FBUCxDQUFxQyxDQUFDLElBQXRDLENBQTJDLEtBQTNDLEVBSGlDO1VBQUEsQ0FBbkMsRUFEdUM7UUFBQSxDQUF6QyxDQXJCQSxDQUFBO2VBMkJBLFFBQUEsQ0FBUyx1Q0FBVCxFQUFrRCxTQUFBLEdBQUE7QUFDaEQsVUFBQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO21CQUMxQixFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLGNBQUEsc0JBQUEsQ0FBdUI7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBUjtBQUFBLGdCQUFXLElBQUEsRUFBTSxDQUFDLEtBQUQsRUFBUSxLQUFSLENBQWpCO0FBQUEsZ0JBQWlDLElBQUEsRUFBTSxRQUF2QztlQUF2QixDQUFBLENBQUE7QUFBQSxjQUNBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLGlDQUF4QixDQURBLENBQUE7cUJBRUEsc0JBQUEsQ0FBdUI7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBUjtBQUFBLGdCQUFXLElBQUEsRUFBTSxDQUFDLEtBQUQsRUFBUSxLQUFSLENBQWpCO0FBQUEsZ0JBQWlDLElBQUEsRUFBTSxRQUF2QztlQUF2QixFQUhtQztZQUFBLENBQXJDLEVBRDBCO1VBQUEsQ0FBNUIsQ0FBQSxDQUFBO2lCQU1BLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTttQkFDdkIsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtBQUNsRCxjQUFBLFFBQVEsQ0FBQyxHQUFULENBQWEsdUNBQWIsRUFBc0QsSUFBdEQsQ0FBQSxDQUFBO0FBQUEsY0FDQSxzQkFBQSxDQUF1QjtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFSO0FBQUEsZ0JBQVcsSUFBQSxFQUFNLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBakI7QUFBQSxnQkFBaUMsSUFBQSxFQUFNLFFBQXZDO2VBQXZCLENBREEsQ0FBQTtBQUFBLGNBRUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsaUNBQXhCLENBRkEsQ0FBQTtBQUFBLGNBR0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxrQkFBVCxDQUFBLENBQVAsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEyQyxLQUEzQyxDQUhBLENBQUE7cUJBSUEsTUFBQSxDQUFPO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLFFBQU47ZUFBUCxFQUxrRDtZQUFBLENBQXBELEVBRHVCO1VBQUEsQ0FBekIsRUFQZ0Q7UUFBQSxDQUFsRCxFQTVCMEI7TUFBQSxDQUE1QixFQXhOMkI7SUFBQSxDQUE3QixDQVhBLENBQUE7QUFBQSxJQThRQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEdBQUEsQ0FDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLHVCQUFOO0FBQUEsVUFDQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURkO1NBREYsRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFLQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQSxHQUFBO2lCQUN4RCxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO1dBQVosRUFEd0Q7UUFBQSxDQUExRCxDQUFBLENBQUE7QUFBQSxRQUdBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsVUFBQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO1dBQVosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7V0FBWixFQUYyQjtRQUFBLENBQTdCLENBSEEsQ0FBQTtBQUFBLFFBT0EsRUFBQSxDQUFHLGtGQUFILEVBQXVGLFNBQUEsR0FBQTtBQUNyRixVQUFBLEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLCtCQUFOO0FBQUEsWUFDQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURkO1dBREYsQ0FBQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7V0FBWixFQUpxRjtRQUFBLENBQXZGLENBUEEsQ0FBQTtBQUFBLFFBYUEsUUFBQSxDQUFTLCtDQUFULEVBQTBELFNBQUEsR0FBQTtBQUN4RCxVQUFBLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsWUFBQSxHQUFBLENBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSx3QkFBTjtBQUFBLGNBQ0EsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEZDthQURGLENBQUEsQ0FBQTttQkFHQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosRUFKd0Q7VUFBQSxDQUExRCxDQUFBLENBQUE7QUFBQSxVQU1BLEVBQUEsQ0FBRyw2REFBSCxFQUFrRSxTQUFBLEdBQUE7QUFDaEUsWUFBQSxHQUFBLENBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSx5QkFBTjtBQUFBLGNBQ0EsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEZDthQURGLENBQUEsQ0FBQTttQkFJQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosRUFMZ0U7VUFBQSxDQUFsRSxDQU5BLENBQUE7aUJBbUJBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBLEdBQUE7QUFDakQsWUFBQSxHQUFBLENBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSx1QkFBTjtBQUFBLGNBQ0EsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEZDthQURGLENBQUEsQ0FBQTttQkFHQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosRUFKaUQ7VUFBQSxDQUFuRCxFQXBCd0Q7UUFBQSxDQUExRCxDQWJBLENBQUE7QUFBQSxRQXVDQSxRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQSxHQUFBO2lCQUNqRCxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFlBQUEsR0FBQSxDQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sd0JBQU47QUFBQSxjQUNBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBRGQ7YUFERixDQUFBLENBQUE7bUJBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDthQUFaLEVBSm1DO1VBQUEsQ0FBckMsRUFEaUQ7UUFBQSxDQUFuRCxDQXZDQSxDQUFBO0FBQUEsUUE4Q0EsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUEsR0FBQTtpQkFDdkMsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtBQUNwQyxZQUFBLEdBQUEsQ0FDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLDJCQUFOO0FBQUEsY0FDQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURkO2FBREYsQ0FBQSxDQUFBO21CQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7YUFBWixFQUpvQztVQUFBLENBQXRDLEVBRHVDO1FBQUEsQ0FBekMsQ0E5Q0EsQ0FBQTtlQXFEQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO2lCQUNoQyxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLFlBQUEsR0FBQSxDQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sbUJBQU47QUFBQSxjQUNBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBRGQ7YUFERixDQUFBLENBQUE7bUJBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDthQUFaLEVBSmdDO1VBQUEsQ0FBbEMsRUFEZ0M7UUFBQSxDQUFsQyxFQXREc0I7TUFBQSxDQUF4QixDQUxBLENBQUE7YUFrRUEsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0seUJBQU47QUFBQSxZQU9BLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBUFI7V0FERixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQVdBLEVBQUEsQ0FBRyxrRkFBSCxFQUF1RixTQUFBLEdBQUE7QUFDckYsVUFBQSxNQUFBLENBQU8sUUFBUSxDQUFDLEdBQVQsQ0FBYSxnQ0FBYixDQUFQLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsS0FBNUQsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO1dBQVosQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7V0FBWixFQUhxRjtRQUFBLENBQXZGLENBWEEsQ0FBQTtBQUFBLFFBZ0JBLEVBQUEsQ0FBRyxzRUFBSCxFQUEyRSxTQUFBLEdBQUE7QUFDekUsVUFBQSxRQUFRLENBQUMsR0FBVCxDQUFhLGdDQUFiLEVBQStDLElBQS9DLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLENBSEEsQ0FBQTtpQkFJQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO1dBQVosRUFMeUU7UUFBQSxDQUEzRSxDQWhCQSxDQUFBO2VBdUJBLFFBQUEsQ0FBUyw2Q0FBVCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsa0NBQWIsRUFBaUQsSUFBakQsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsVUFHQSxFQUFBLENBQUcsd0VBQUgsRUFBNkUsU0FBQSxHQUFBO0FBQzNFLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO0FBQUEsWUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FEQSxDQUFBO21CQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7YUFBWixFQUgyRTtVQUFBLENBQTdFLENBSEEsQ0FBQTtpQkFRQSxFQUFBLENBQUcsOEVBQUgsRUFBbUYsU0FBQSxHQUFBO0FBQ2pGLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO0FBQUEsWUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FEQSxDQUFBO0FBQUEsWUFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FGQSxDQUFBO0FBQUEsWUFHQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FIQSxDQUFBO21CQUlBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7YUFBWixFQUxpRjtVQUFBLENBQW5GLEVBVHNEO1FBQUEsQ0FBeEQsRUF4QmtDO01BQUEsQ0FBcEMsRUFuRTJCO0lBQUEsQ0FBN0IsQ0E5UUEsQ0FBQTtBQUFBLElBeVhBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsTUFBQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQSxHQUFBO0FBQzVELFVBQUEsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sdUJBQU47QUFBQSxZQUNBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBRGQ7V0FERixDQUFBLENBQUE7aUJBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLEVBSjREO1FBQUEsQ0FBOUQsQ0FBQSxDQUFBO0FBQUEsUUFNQSxFQUFBLENBQUcsZ0JBQUgsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFVBQUEsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sNEJBQU47QUFBQSxZQUNBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBRGQ7V0FERixDQUFBLENBQUE7QUFBQSxVQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7V0FBWixDQUhBLENBQUE7QUFBQSxVQUlBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7V0FBWixDQUpBLENBQUE7aUJBS0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLEVBTm1CO1FBQUEsQ0FBckIsQ0FOQSxDQUFBO0FBQUEsUUFjQSxFQUFBLENBQUcsa0ZBQUgsRUFBdUYsU0FBQSxHQUFBO0FBQ3JGLFVBQUEsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sK0JBQU47QUFBQSxZQUNBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBRGQ7V0FERixDQUFBLENBQUE7aUJBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLEVBSnFGO1FBQUEsQ0FBdkYsQ0FkQSxDQUFBO0FBQUEsUUFvQkEsUUFBQSxDQUFTLGdEQUFULEVBQTJELFNBQUEsR0FBQTtBQUN6RCxVQUFBLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsWUFBQSxHQUFBLENBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSx3QkFBTjtBQUFBLGNBQ0EsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEZDthQURGLENBQUEsQ0FBQTttQkFHQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosRUFKd0Q7VUFBQSxDQUExRCxDQUFBLENBQUE7aUJBTUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtBQUNqRCxZQUFBLEdBQUEsQ0FDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLHVCQUFOO0FBQUEsY0FDQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURkO2FBREYsQ0FBQSxDQUFBO21CQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7YUFBWixFQUppRDtVQUFBLENBQW5ELEVBUHlEO1FBQUEsQ0FBM0QsQ0FwQkEsQ0FBQTtlQWlDQSxRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQSxHQUFBO2lCQUNqRCxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFlBQUEsR0FBQSxDQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sd0JBQU47QUFBQSxjQUNBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBRGQ7YUFERixDQUFBLENBQUE7bUJBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDthQUFaLEVBSm1DO1VBQUEsQ0FBckMsRUFEaUQ7UUFBQSxDQUFuRCxFQWxDc0I7TUFBQSxDQUF4QixDQUFBLENBQUE7YUF5Q0EsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0seUJBQU47QUFBQSxZQU9BLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBUFI7V0FERixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQVdBLEVBQUEsQ0FBRyxrRkFBSCxFQUF1RixTQUFBLEdBQUE7QUFDckYsVUFBQSxNQUFBLENBQU8sUUFBUSxDQUFDLEdBQVQsQ0FBYSxnQ0FBYixDQUFQLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsS0FBNUQsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO1dBQVosQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7V0FBWixFQUhxRjtRQUFBLENBQXZGLENBWEEsQ0FBQTtBQUFBLFFBZ0JBLEVBQUEsQ0FBRyxzRUFBSCxFQUEyRSxTQUFBLEdBQUE7QUFDekUsVUFBQSxRQUFRLENBQUMsR0FBVCxDQUFhLGdDQUFiLEVBQStDLElBQS9DLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZDtXQUFaLENBSEEsQ0FBQTtpQkFJQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO1dBQVosRUFMeUU7UUFBQSxDQUEzRSxDQWhCQSxDQUFBO2VBdUJBLFFBQUEsQ0FBUyw2Q0FBVCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsa0NBQWIsRUFBaUQsSUFBakQsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsVUFHQSxFQUFBLENBQUcsd0VBQUgsRUFBNkUsU0FBQSxHQUFBO0FBQzNFLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO0FBQUEsWUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FEQSxDQUFBO21CQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7YUFBWixFQUgyRTtVQUFBLENBQTdFLENBSEEsQ0FBQTtpQkFRQSxFQUFBLENBQUcsOEVBQUgsRUFBbUYsU0FBQSxHQUFBO0FBQ2pGLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO0FBQUEsWUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FEQSxDQUFBO0FBQUEsWUFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FGQSxDQUFBO0FBQUEsWUFHQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FIQSxDQUFBO0FBQUEsWUFJQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxZQUFBLEVBQWMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFkO2FBQVosQ0FKQSxDQUFBO21CQUtBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLFlBQUEsRUFBYyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWQ7YUFBWixFQU5pRjtVQUFBLENBQW5GLEVBVHNEO1FBQUEsQ0FBeEQsRUF4QmtDO01BQUEsQ0FBcEMsRUExQzhCO0lBQUEsQ0FBaEMsQ0F6WEEsQ0FBQTtXQTZjQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsTUFBQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLE9BQU47V0FBSixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUVBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FBSTtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47YUFBSixFQURTO1VBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxVQUVBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLGNBQUEsSUFBQSxFQUFNLE1BQU47YUFBYixFQUY0QztVQUFBLENBQTlDLENBRkEsQ0FBQTtpQkFLQSxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQSxHQUFBO0FBQzVDLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUNBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxjQUFBLElBQUEsRUFBTSxNQUFOO2FBQWIsRUFGNEM7VUFBQSxDQUE5QyxFQU42QjtRQUFBLENBQS9CLENBRkEsQ0FBQTtBQUFBLFFBV0EsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxVQUFBLEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBLEdBQUE7QUFDcEQsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7QUFBQSxZQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBWixDQURBLENBQUE7bUJBRUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFaLEVBSG9EO1VBQUEsQ0FBdEQsQ0FBQSxDQUFBO2lCQUlBLEVBQUEsQ0FBRywrQ0FBSCxFQUFvRCxTQUFBLEdBQUE7QUFDbEQsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7QUFBQSxZQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBWixDQURBLENBQUE7bUJBRUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFaLEVBSGtEO1VBQUEsQ0FBcEQsRUFMaUM7UUFBQSxDQUFuQyxDQVhBLENBQUE7QUFBQSxRQW9CQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTttQkFDVCxHQUFBLENBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsY0FDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO2FBREYsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO2lCQUlBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBLEdBQUE7bUJBQ3RCLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBWixFQURzQjtVQUFBLENBQXhCLEVBTHFDO1FBQUEsQ0FBdkMsQ0FwQkEsQ0FBQTtBQUFBLFFBMkJBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxjQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7YUFERixFQURTO1VBQUEsQ0FBWCxDQUFBLENBQUE7aUJBSUEsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUEsR0FBQTttQkFDdEIsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFaLEVBRHNCO1VBQUEsQ0FBeEIsRUFMcUM7UUFBQSxDQUF2QyxDQTNCQSxDQUFBO0FBQUEsUUFrQ0EsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sV0FBTjtBQUFBLGNBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjthQURGLEVBRFM7VUFBQSxDQUFYLENBQUEsQ0FBQTtpQkFJQSxFQUFBLENBQUcsY0FBSCxFQUFtQixTQUFBLEdBQUE7bUJBQ2pCLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBWixFQURpQjtVQUFBLENBQW5CLEVBTHFDO1FBQUEsQ0FBdkMsQ0FsQ0EsQ0FBQTtlQXlDQSxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBLEdBQUE7QUFDckIsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLHdCQUFOO2FBREYsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsVUFRQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELFlBQUEsRUFBQSxDQUFHLGNBQUgsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLGNBQUEsR0FBQSxDQUFJO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFKLENBQUEsQ0FBQTtxQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFaLEVBRmlCO1lBQUEsQ0FBbkIsQ0FBQSxDQUFBO21CQUdBLEVBQUEsQ0FBRyxjQUFILEVBQW1CLFNBQUEsR0FBQTtBQUNqQixjQUFBLEdBQUEsQ0FBSTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBSixDQUFBLENBQUE7cUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLGdCQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7ZUFBWixFQUZpQjtZQUFBLENBQW5CLEVBSnlEO1VBQUEsQ0FBM0QsQ0FSQSxDQUFBO0FBQUEsVUFlQSxRQUFBLENBQVMsb0RBQVQsRUFBK0QsU0FBQSxHQUFBO21CQUM3RCxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLGNBQUEsR0FBQSxDQUFJO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFKLENBQUEsQ0FBQTtxQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsZ0JBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtlQUFaLEVBRnlCO1lBQUEsQ0FBM0IsRUFENkQ7VUFBQSxDQUEvRCxDQWZBLENBQUE7QUFBQSxVQW1CQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO21CQUN6RCxFQUFBLENBQUcsY0FBSCxFQUFtQixTQUFBLEdBQUE7QUFDakIsY0FBQSxHQUFBLENBQUk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQUosQ0FBQSxDQUFBO3FCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQVosRUFGaUI7WUFBQSxDQUFuQixFQUR5RDtVQUFBLENBQTNELENBbkJBLENBQUE7aUJBdUJBLFFBQUEsQ0FBUyxxREFBVCxFQUFnRSxTQUFBLEdBQUE7bUJBQzlELEVBQUEsQ0FBRyxzQkFBSCxFQUEyQixTQUFBLEdBQUE7QUFDekIsY0FBQSxHQUFBLENBQUk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQUosQ0FBQSxDQUFBO3FCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxnQkFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2VBQVosRUFGeUI7WUFBQSxDQUEzQixFQUQ4RDtVQUFBLENBQWhFLEVBeEJxQjtRQUFBLENBQXZCLEVBMUNzQjtNQUFBLENBQXhCLENBQUEsQ0FBQTtBQUFBLE1BdUVBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUFJO0FBQUEsWUFBQSxJQUFBLEVBQU0sT0FBTjtXQUFKLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBRUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtBQUNwRCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFaLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQVosRUFIb0Q7UUFBQSxDQUF0RCxDQUZBLENBQUE7ZUFNQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQVosQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBWixFQUhrRDtRQUFBLENBQXBELEVBUHVCO01BQUEsQ0FBekIsQ0F2RUEsQ0FBQTtBQUFBLE1BbUZBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUFJO0FBQUEsWUFBQSxJQUFBLEVBQU0sT0FBTjtXQUFKLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBRUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtBQUNwRCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFaLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQVosRUFIb0Q7UUFBQSxDQUF0RCxDQUZBLENBQUE7ZUFNQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQVosQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBWixFQUhrRDtRQUFBLENBQXBELEVBUHdCO01BQUEsQ0FBMUIsQ0FuRkEsQ0FBQTthQStGQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSx5QkFBTjtXQURGLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBTUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtBQUNwRCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBUjtXQUFaLENBREEsQ0FBQTtBQUFBLFVBRUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBWixFQUpvRDtRQUFBLENBQXRELENBTkEsQ0FBQTtlQVdBLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFaLEVBRndEO1FBQUEsQ0FBMUQsRUFaNEI7TUFBQSxDQUE5QixFQWhHdUI7SUFBQSxDQUF6QixFQTljd0I7RUFBQSxDQUExQixDQUpBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/motion-search-spec.coffee
