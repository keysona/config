(function() {
  var TextData, dispatch, getVimState, globalState, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  globalState = require('../lib/global-state');

  describe("TextObject", function() {
    var editor, editorElement, ensure, getCheckFunctionFor, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    getCheckFunctionFor = function(textObject) {
      return function(initialPoint, keystroke, options) {
        set({
          cursor: initialPoint
        });
        return ensure(keystroke + textObject, options);
      };
    };
    beforeEach(function() {
      return getVimState(function(state, vimEditor) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("TextObject", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(state, vimEditor) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      return describe("when TextObject is excuted directly", function() {
        return it("select that TextObject", function() {
          set({
            cursor: [8, 7]
          });
          dispatch(editorElement, 'vim-mode-plus:inner-word');
          return ensure({
            selectedText: 'QuickSort'
          });
        });
      });
    });
    describe("Word", function() {
      describe("inner-word", function() {
        beforeEach(function() {
          return set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('diw', {
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
        it("selects inside the current word in visual mode", function() {
          return ensure('viw', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
        it("works with multiple cursors", function() {
          set({
            addCursor: [0, 1]
          });
          return ensure('viw', {
            selectedBufferRange: [[[0, 6], [0, 11]], [[0, 0], [0, 5]]]
          });
        });
        describe("cursor is on next to NonWordCharacter", function() {
          beforeEach(function() {
            return set({
              text: "abc(def)",
              cursor: [0, 4]
            });
          });
          it("change inside word", function() {
            return ensure('ciw', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('diw', {
              text: "abc()",
              mode: "normal"
            });
          });
        });
        return describe("cursor's next char is NonWordCharacter", function() {
          beforeEach(function() {
            return set({
              text: "abc(def)",
              cursor: [0, 6]
            });
          });
          it("change inside word", function() {
            return ensure('ciw', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('diw', {
              text: "abc()",
              mode: "normal"
            });
          });
        });
      });
      return describe("a-word", function() {
        beforeEach(function() {
          return set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators from the start of the current word to the start of the next word in operator-pending mode", function() {
          return ensure('daw', {
            text: "12345 ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "abcde "
              }
            }
          });
        });
        it("selects from the start of the current word to the start of the next word in visual mode", function() {
          return ensure('vaw', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        it("doesn't span newlines", function() {
          set({
            text: "12345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('vaw', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
        return it("doesn't span special characters", function() {
          set({
            text: "1(345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('vaw', {
            selectedBufferRange: [[0, 2], [0, 5]]
          });
        });
      });
    });
    describe("WholeWord", function() {
      describe("inner-whole-word", function() {
        beforeEach(function() {
          return set({
            text: "12(45 ab'de ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current whole word in operator-pending mode", function() {
          return ensure('diW', {
            text: "12(45  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "ab'de"
              }
            }
          });
        });
        return it("selects inside the current whole word in visual mode", function() {
          return ensure('viW', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
      });
      return describe("a-whole-word", function() {
        beforeEach(function() {
          return set({
            text: "12(45 ab'de ABCDE",
            cursor: [0, 9]
          });
        });
        it("applies operators from the start of the current whole word to the start of the next whole word in operator-pending mode", function() {
          return ensure('daW', {
            text: "12(45 ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: "ab'de "
              }
            },
            mode: 'normal'
          });
        });
        it("selects from the start of the current whole word to the start of the next whole word in visual mode", function() {
          return ensure('vaW', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        return it("doesn't span newlines", function() {
          set({
            text: "12(45\nab'de ABCDE",
            cursor: [0, 4]
          });
          return ensure('vaW', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
      });
    });
    describe("AnyPair", function() {
      var complexText, simpleText, _ref2;
      _ref2 = {}, simpleText = _ref2.simpleText, complexText = _ref2.complexText;
      beforeEach(function() {
        simpleText = ".... \"abc\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ....";
        complexText = "[4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e\n]";
        return set({
          text: simpleText,
          cursor: [0, 7]
        });
      });
      describe("inner-any-pair", function() {
        it("applies operators any inner-pair and repeatable", function() {
          ensure('dis', {
            text: ".... \"\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j.j.j.j.j.j.j.', {
            text: ".... \"\" ....\n.... '' ....\n.... `` ....\n.... {} ....\n.... <> ....\n.... [] ....\n.... () ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('is', {
            selectedText: "1s-1e"
          });
          ensure('is', {
            selectedText: "2s(1s-1e)2e"
          });
          ensure('is', {
            selectedText: "3s\n----\"2s(1s-1e)2e\"\n---3e"
          });
          return ensure('is', {
            selectedText: "4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e"
          });
        });
      });
      return describe("a-any-pair", function() {
        it("applies operators any a-pair and repeatable", function() {
          ensure('das', {
            text: "....  ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j.j.j.j.j.j.j.', {
            text: "....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('as', {
            selectedText: "(1s-1e)"
          });
          ensure('as', {
            selectedText: "\"2s(1s-1e)2e\""
          });
          ensure('as', {
            selectedText: "{3s\n----\"2s(1s-1e)2e\"\n---3e}"
          });
          return ensure('as', {
            selectedText: "[4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e\n]"
          });
        });
      });
    });
    describe("AnyQuote", function() {
      beforeEach(function() {
        return set({
          text: "--\"abc\" `def`  'efg'--",
          cursor: [0, 0]
        });
      });
      describe("inner-any-quote", function() {
        it("applies operators any inner-pair and repeatable", function() {
          ensure('diq', {
            text: "--\"\" `def`  'efg'--"
          });
          ensure('.', {
            text: "--\"\" ``  'efg'--"
          });
          return ensure('.', {
            text: "--\"\" ``  ''--"
          });
        });
        return it("can select next quote", function() {
          keystroke('v');
          ensure('iq', {
            selectedText: 'abc'
          });
          ensure('iq', {
            selectedText: 'def'
          });
          return ensure('iq', {
            selectedText: 'efg'
          });
        });
      });
      return describe("a-any-quote", function() {
        it("applies operators any a-quote and repeatable", function() {
          ensure('daq', {
            text: "-- `def`  'efg'--"
          });
          ensure('.', {
            text: "--   'efg'--"
          });
          ensure('.', {
            text: "--   --"
          });
          return ensure('.');
        });
        return it("can select next quote", function() {
          keystroke('v');
          ensure('aq', {
            selectedText: '"abc"'
          });
          ensure('aq', {
            selectedText: '`def`'
          });
          return ensure('aq', {
            selectedText: "'efg'"
          });
        });
      });
    });
    describe("DoubleQuote", function() {
      describe("inner-double-quote", function() {
        beforeEach(function() {
          return set({
            text: '" something in here and in "here" " and over here',
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure('di"', {
            text: '""here" " and over here',
            cursor: [0, 1]
          });
        });
        it("skip non-string area and operate forwarding string whithin line", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('di"', {
            text: '" something in here and in "here"" and over here',
            cursor: [0, 33]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure('di"', {
            text: '" something in here and in "here" " and over here',
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i"');
          text = '-"+"-';
          textFinal = '-""-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-double-quote", function() {
        var originalText;
        originalText = '" something in here and in "here" "';
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [0, 9]
          });
        });
        it("applies operators around the current double quotes in operator-pending mode", function() {
          return ensure('da"', {
            text: 'here" "',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("skip non-string area and operate forwarding string whithin line", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('da"', {
            text: '" something in here and in "here',
            cursor: [0, 31],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a"');
          text = '-"+"-';
          textFinal = '--';
          selectedText = '"+"';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("SingleQuote", function() {
      describe("inner-single-quote", function() {
        beforeEach(function() {
          return set({
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 9]
          });
        });
        describe("don't treat literal backslash(double backslash) as escape char", function() {
          beforeEach(function() {
            return set({
              text: "'some-key-here\\\\': 'here-is-the-val'"
            });
          });
          it("case-1", function() {
            set({
              cursor: [0, 2]
            });
            return ensure("di'", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 19]
            });
            return ensure("di'", {
              text: "'some-key-here\\\\': ''",
              cursor: [0, 20]
            });
          });
        });
        describe("treat backslash(single backslash) as escape char", function() {
          beforeEach(function() {
            return set({
              text: "'some-key-here\\'': 'here-is-the-val'"
            });
          });
          it("case-1", function() {
            set({
              cursor: [0, 2]
            });
            return ensure("di'", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 17]
            });
            return ensure("di'", {
              text: "'some-key-here\\'': ''",
              cursor: [0, 20]
            });
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure("di'", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 26]
          });
          return ensure("di'", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure("di'", {
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("i'");
          text = "-'+'-";
          textFinal = "-''-";
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-single-quote", function() {
        var originalText;
        originalText = "' something in here and in 'here' '";
        beforeEach(function() {
          return set({
            text: originalText,
            cursor: [0, 9]
          });
        });
        it("applies operators around the current single quotes in operator-pending mode", function() {
          return ensure("da'", {
            text: "here' '",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure("da'", {
            text: "' something in here and in 'here",
            cursor: [0, 31],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a'");
          text = "-'+'-";
          textFinal = "--";
          selectedText = "'+'";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("BackTick", function() {
      var originalText;
      originalText = "this is `sample` text.";
      beforeEach(function() {
        return set({
          text: originalText,
          cursor: [0, 9]
        });
      });
      describe("inner-back-tick", function() {
        it("applies operators inner-area", function() {
          return ensure("di`", {
            text: "this is `` text.",
            cursor: [0, 9]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("di`", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i`');
          text = '-`+`-';
          textFinal = '-``-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-back-tick", function() {
        it("applies operators inner-area", function() {
          return ensure("da`", {
            text: "this is  text.",
            cursor: [0, 8]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("da`", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a`");
          text = "-`+`-";
          textFinal = "--";
          selectedText = "`+`";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("CurlyBracket", function() {
      describe("inner-curly-bracket", function() {
        beforeEach(function() {
          return set({
            text: "{ something in here and in {here} }",
            cursor: [0, 9]
          });
        });
        it("applies operators to inner-area in operator-pending mode", function() {
          return ensure('di{', {
            text: "{}",
            cursor: [0, 1]
          });
        });
        it("applies operators to inner-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('di{', {
            text: "{ something in here and in {} }",
            cursor: [0, 28]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i{');
          text = '-{+}-';
          textFinal = '-{}-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-curly-bracket", function() {
        beforeEach(function() {
          return set({
            text: "{ something in here and in {here} }",
            cursor: [0, 9]
          });
        });
        it("applies operators to a-area in operator-pending mode", function() {
          return ensure('da{', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators to a-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('da{', {
            text: "{ something in here and in  }",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a{");
          text = "-{+}-";
          textFinal = "--";
          selectedText = "{+}";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("AngleBracket", function() {
      describe("inner-angle-bracket", function() {
        beforeEach(function() {
          return set({
            text: "< something in here and in <here> >",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('di<', {
            text: "<>",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('di<', {
            text: "< something in here and in <> >",
            cursor: [0, 28]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i<');
          text = '-<+>-';
          textFinal = '-<>-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-angle-bracket", function() {
        beforeEach(function() {
          return set({
            text: "< something in here and in <here> >",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode", function() {
          return ensure('da<', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('da<', {
            text: "< something in here and in  >",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a<");
          text = "-<+>-";
          textFinal = "--";
          selectedText = "<+>";
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("AllowForwarding family", function() {
      beforeEach(function() {
        atom.keymaps.add("text", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            'i }': 'vim-mode-plus:inner-curly-bracket-allow-forwarding',
            'i >': 'vim-mode-plus:inner-angle-bracket-allow-forwarding',
            'i ]': 'vim-mode-plus:inner-square-bracket-allow-forwarding',
            'i )': 'vim-mode-plus:inner-parenthesis-allow-forwarding',
            'a }': 'vim-mode-plus:a-curly-bracket-allow-forwarding',
            'a >': 'vim-mode-plus:a-angle-bracket-allow-forwarding',
            'a ]': 'vim-mode-plus:a-square-bracket-allow-forwarding',
            'a )': 'vim-mode-plus:a-parenthesis-allow-forwarding'
          }
        });
        return set({
          text: "__{000}__\n__<111>__\n__[222]__\n__(333)__"
        });
      });
      describe("inner", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure(['escape', 'vi}'], {
            selectedText: "000"
          });
          set({
            cursor: [1, 0]
          });
          ensure(['escape', 'vi>'], {
            selectedText: "111"
          });
          set({
            cursor: [2, 0]
          });
          ensure(['escape', 'vi]'], {
            selectedText: "222"
          });
          set({
            cursor: [3, 0]
          });
          return ensure(['escape', 'vi)'], {
            selectedText: "333"
          });
        });
      });
      describe("a", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure(['escape', 'va}'], {
            selectedText: "{000}"
          });
          set({
            cursor: [1, 0]
          });
          ensure(['escape', 'va>'], {
            selectedText: "<111>"
          });
          set({
            cursor: [2, 0]
          });
          ensure(['escape', 'va]'], {
            selectedText: "[222]"
          });
          set({
            cursor: [3, 0]
          });
          return ensure(['escape', 'va)'], {
            selectedText: "(333)"
          });
        });
      });
      return describe("multi line text", function() {
        var textOneA, textOneInner, _ref2;
        _ref2 = [], textOneInner = _ref2[0], textOneA = _ref2[1];
        beforeEach(function() {
          set({
            text: "000\n000{11\n111{22}\n111\n111}"
          });
          textOneInner = "11\n111{22}\n111\n111";
          return textOneA = "{11\n111{22}\n111\n111}";
        });
        describe("forwarding inner", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("vi}", {
              selectedText: textOneInner
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("vi}", {
              selectedText: "22"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("vi}", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("vi}", {
              selectedText: textOneInner
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("vi}", {
              selectedText: textOneInner
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("vi}", {
              selectedText: textOneInner
            });
          });
        });
        return describe("forwarding a", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("va}", {
              selectedText: textOneA
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("va}", {
              selectedText: "{22}"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("va}", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("va}", {
              selectedText: textOneA
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("va}", {
              selectedText: textOneA
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("va}", {
              selectedText: textOneA
            });
          });
        });
      });
    });
    describe("AnyPairAllowForwarding", function() {
      beforeEach(function() {
        atom.keymaps.add("text", {
          'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
            ";": 'vim-mode-plus:inner-any-pair-allow-forwarding',
            ":": 'vim-mode-plus:a-any-pair-allow-forwarding'
          }
        });
        return set({
          text: "00\n00[11\n11\"222\"11{333}11(\n444()444\n)\n111]00{555}"
        });
      });
      describe("inner", function() {
        return it("select forwarding range within enclosed range(if exists)", function() {
          set({
            cursor: [2, 0]
          });
          keystroke('v');
          ensure(';', {
            selectedText: "222"
          });
          ensure(';', {
            selectedText: "333"
          });
          ensure(';', {
            selectedText: "444()444\n"
          });
          return ensure(';', {
            selectedText: "",
            selectedBufferRange: [[3, 4], [3, 4]]
          });
        });
      });
      return describe("a", function() {
        return it("select forwarding range within enclosed range(if exists)", function() {
          set({
            cursor: [2, 0]
          });
          keystroke('v');
          ensure(':', {
            selectedText: '"222"'
          });
          ensure(':', {
            selectedText: "{333}"
          });
          ensure(':', {
            selectedText: "(\n444()444\n)"
          });
          return ensure(':', {
            selectedText: "[11\n11\"222\"11{333}11(\n444()444\n)\n111]"
          });
        });
      });
    });
    describe("Tag", function() {
      var ensureSelectedText;
      ensureSelectedText = [][0];
      ensureSelectedText = function(start, keystroke, selectedText) {
        set({
          cursor: start
        });
        return ensure(keystroke, {
          selectedText: selectedText
        });
      };
      describe("inner-tag", function() {
        describe("pricisely select inner", function() {
          var check, deletedText, innerABC, selectedText, text;
          check = getCheckFunctionFor('it');
          text = "<abc>  <title>TITLE</title> </abc>";
          deletedText = "<abc>  <title></title> </abc>";
          selectedText = "TITLE";
          innerABC = "  <title>TITLE</title> ";
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("[1] forwarding", function() {
            return check([0, 5], 'v', {
              selectedText: selectedText
            });
          });
          it("[2] openTag leftmost", function() {
            return check([0, 7], 'v', {
              selectedText: selectedText
            });
          });
          it("[3] openTag rightmost", function() {
            return check([0, 13], 'v', {
              selectedText: selectedText
            });
          });
          it("[4] Inner text", function() {
            return check([0, 16], 'v', {
              selectedText: selectedText
            });
          });
          it("[5] closeTag leftmost", function() {
            return check([0, 19], 'v', {
              selectedText: selectedText
            });
          });
          it("[6] closeTag rightmost", function() {
            return check([0, 26], 'v', {
              selectedText: selectedText
            });
          });
          it("[7] right of closeTag", function() {
            return check([0, 27], 'v', {
              selectedText: innerABC
            });
          });
          it("[8] forwarding", function() {
            return check([0, 5], 'd', {
              text: deletedText
            });
          });
          it("[9] openTag leftmost", function() {
            return check([0, 7], 'd', {
              text: deletedText
            });
          });
          it("[10] openTag rightmost", function() {
            return check([0, 13], 'd', {
              text: deletedText
            });
          });
          it("[11] Inner text", function() {
            return check([0, 16], 'd', {
              text: deletedText
            });
          });
          it("[12] closeTag leftmost", function() {
            return check([0, 19], 'd', {
              text: deletedText
            });
          });
          it("[13] closeTag rightmost", function() {
            return check([0, 26], 'd', {
              text: deletedText
            });
          });
          return it("[14] right of closeTag", function() {
            return check([0, 27], 'd', {
              text: "<abc></abc>"
            });
          });
        });
        return describe("expansion and deletion", function() {
          beforeEach(function() {
            var htmlLikeText;
            htmlLikeText = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n</html>\n";
            return set({
              text: htmlLikeText
            });
          });
          it("can expand selection when repeated", function() {
            set({
              cursor: [9, 0]
            });
            ensure('vit', {
              selectedText: "\n________<p><a>\n______"
            });
            ensure('it', {
              selectedText: "\n______<div>\n________<p><a>\n______</div>\n____"
            });
            ensure('it', {
              selectedText: "\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__"
            });
            ensure('it', {
              selectedText: "\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n"
            });
            return ensure('it', {
              selectedText: "\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n"
            });
          });
          return it('delete inner-tag and repatable', function() {
            set({
              cursor: [9, 0]
            });
            ensure("dit", {
              text: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div></div>\n____</div>\n__</div>\n</body>\n</html>\n"
            });
            ensure("3.", {
              text: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body></body>\n</html>\n"
            });
            return ensure(".", {
              text: "<!DOCTYPE html>\n<html lang=\"en\"></html>\n"
            });
          });
        });
      });
      return describe("a-tag", function() {
        return describe("pricisely select a", function() {
          var aABC, check, deletedText, selectedText, text;
          check = getCheckFunctionFor('at');
          text = "<abc>  <title>TITLE</title> </abc>";
          deletedText = "<abc>   </abc>";
          selectedText = "<title>TITLE</title>";
          aABC = "<abc>  <title>TITLE</title> </abc>";
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("[1] forwarding", function() {
            return check([0, 5], 'v', {
              selectedText: selectedText
            });
          });
          it("[2] openTag leftmost", function() {
            return check([0, 7], 'v', {
              selectedText: selectedText
            });
          });
          it("[3] openTag rightmost", function() {
            return check([0, 13], 'v', {
              selectedText: selectedText
            });
          });
          it("[4] Inner text", function() {
            return check([0, 16], 'v', {
              selectedText: selectedText
            });
          });
          it("[5] closeTag leftmost", function() {
            return check([0, 19], 'v', {
              selectedText: selectedText
            });
          });
          it("[6] closeTag rightmost", function() {
            return check([0, 26], 'v', {
              selectedText: selectedText
            });
          });
          it("[7] right of closeTag", function() {
            return check([0, 27], 'v', {
              selectedText: aABC
            });
          });
          it("[8] forwarding", function() {
            return check([0, 5], 'd', {
              text: deletedText
            });
          });
          it("[9] openTag leftmost", function() {
            return check([0, 7], 'd', {
              text: deletedText
            });
          });
          it("[10] openTag rightmost", function() {
            return check([0, 13], 'd', {
              text: deletedText
            });
          });
          it("[11] Inner text", function() {
            return check([0, 16], 'd', {
              text: deletedText
            });
          });
          it("[12] closeTag leftmost", function() {
            return check([0, 19], 'd', {
              text: deletedText
            });
          });
          it("[13] closeTag rightmost", function() {
            return check([0, 26], 'd', {
              text: deletedText
            });
          });
          return it("[14] right of closeTag", function() {
            return check([0, 27], 'd', {
              text: ""
            });
          });
        });
      });
    });
    describe("SquareBracket", function() {
      describe("inner-square-bracket", function() {
        beforeEach(function() {
          return set({
            text: "[ something in here and in [here] ]",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('di[', {
            text: "[]",
            cursor: [0, 1]
          });
        });
        return it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('di[', {
            text: "[ something in here and in [] ]",
            cursor: [0, 28]
          });
        });
      });
      return describe("a-square-bracket", function() {
        beforeEach(function() {
          return set({
            text: "[ something in here and in [here] ]",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current square brackets in operator-pending mode", function() {
          return ensure('da[', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current square brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('da[', {
            text: "[ something in here and in  ]",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i[');
          text = '-[+]-';
          textFinal = '-[]-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a[');
          text = '-[+]-';
          textFinal = '--';
          selectedText = '[+]';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("Parenthesis", function() {
      describe("inner-parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "( something in here and in (here) )",
            cursor: [0, 9]
          });
        });
        it("applies operators inside the current word in operator-pending mode", function() {
          return ensure('di(', {
            text: "()",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('di(', {
            text: "( something in here and in () )",
            cursor: [0, 28]
          });
        });
        it("select inner () by skipping nesting pair", function() {
          set({
            text: 'expect(editor.getScrollTop())',
            cursor: [0, 7]
          });
          return ensure('vi(', {
            selectedText: 'editor.getScrollTop()'
          });
        });
        it("skip escaped pair case-1", function() {
          set({
            text: 'expect(editor.g\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('vi(', {
            selectedText: 'editor.g\\(etScrollTp()'
          });
        });
        it("dont skip literal backslash", function() {
          set({
            text: 'expect(editor.g\\\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('vi(', {
            selectedText: 'etScrollTp()'
          });
        });
        it("skip escaped pair case-2", function() {
          set({
            text: 'expect(editor.getSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('vi(', {
            selectedText: 'editor.getSc\\)rollTp()'
          });
        });
        it("skip escaped pair case-3", function() {
          set({
            text: 'expect(editor.ge\\(tSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('vi(', {
            selectedText: 'editor.ge\\(tSc\\)rollTp()'
          });
        });
        it("works with multiple cursors", function() {
          set({
            text: "( a b ) cde ( f g h ) ijk",
            cursor: [[0, 2], [0, 18]]
          });
          return ensure('vi(', {
            selectedBufferRange: [[[0, 1], [0, 6]], [[0, 13], [0, 20]]]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i(');
          text = '-(+)-';
          textFinal = '-()-';
          selectedText = '+';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 2]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
      return describe("a-parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "( something in here and in (here) )",
            cursor: [0, 9]
          });
        });
        it("applies operators around the current parentheses in operator-pending mode", function() {
          return ensure('da(', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current parentheses in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('da(', {
            text: "( something in here and in  )",
            cursor: [0, 27]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a(');
          text = '-(+)-';
          textFinal = '--';
          selectedText = '(+)';
          open = [0, 1];
          close = [0, 3];
          beforeEach(function() {
            return set({
              text: text
            });
          });
          it("case-1 normal", function() {
            return check(open, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-2 normal", function() {
            return check(close, 'd', {
              text: textFinal,
              cursor: [0, 1]
            });
          });
          it("case-3 visual", function() {
            return check(open, 'v', {
              selectedText: selectedText
            });
          });
          return it("case-4 visual", function() {
            return check(close, 'v', {
              selectedText: selectedText
            });
          });
        });
      });
    });
    describe("Paragraph", function() {
      describe("inner-paragraph", function() {
        beforeEach(function() {
          return set({
            text: "\nParagraph-1\nParagraph-1\nParagraph-1\n\n",
            cursor: [2, 2]
          });
        });
        it("applies operators inside the current paragraph in operator-pending mode", function() {
          return ensure('yip', {
            text: "\nParagraph-1\nParagraph-1\nParagraph-1\n\n",
            cursor: [1, 0],
            register: {
              '"': {
                text: "Paragraph-1\nParagraph-1\nParagraph-1\n"
              }
            }
          });
        });
        return it("selects inside the current paragraph in visual mode", function() {
          return ensure('vip', {
            selectedScreenRange: [[1, 0], [4, 0]]
          });
        });
      });
      return describe("a-paragraph", function() {
        beforeEach(function() {
          return set({
            text: "text\n\nParagraph-1\nParagraph-1\nParagraph-1\n\nmoretext",
            cursor: [3, 2]
          });
        });
        it("applies operators around the current paragraph in operator-pending mode", function() {
          return ensure('yap', {
            text: "text\n\nParagraph-1\nParagraph-1\nParagraph-1\n\nmoretext",
            cursor: [2, 0],
            register: {
              '"': {
                text: "Paragraph-1\nParagraph-1\nParagraph-1\n\n"
              }
            }
          });
        });
        return it("selects around the current paragraph in visual mode", function() {
          return ensure('vap', {
            selectedScreenRange: [[2, 0], [6, 0]]
          });
        });
      });
    });
    describe('Comment', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-comment', function() {
        it('select inside comment block', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('vi/', {
            selectedText: '# This\n# is\n# Comment\n',
            selectedBufferRange: [[0, 0], [3, 0]]
          });
        });
        it('select one line comment', function() {
          set({
            cursor: [4, 0]
          });
          return ensure('vi/', {
            selectedText: '# One line comment\n',
            selectedBufferRange: [[4, 0], [5, 0]]
          });
        });
        return it('not select non-comment line', function() {
          set({
            cursor: [6, 0]
          });
          return ensure('vi/', {
            selectedText: '# Comment\n# border\n',
            selectedBufferRange: [[6, 0], [8, 0]]
          });
        });
      });
      return describe('a-comment', function() {
        return it('include blank line when selecting comment', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('va/', {
            selectedText: "# This\n# is\n# Comment\n\n# One line comment\n\n# Comment\n# border\n",
            selectedBufferRange: [[0, 0], [8, 0]]
          });
        });
      });
    });
    describe('Indentation', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(vimState, vim) {
          editor = vimState.editor, editorElement = vimState.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-indentation', function() {
        return it('select lines with deeper indent-level', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('vii', {
            selectedBufferRange: [[12, 0], [15, 0]]
          });
        });
      });
      return describe('a-indentation', function() {
        return it('wont stop on blank line when selecting indent', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('vai', {
            selectedBufferRange: [[10, 0], [27, 0]]
          });
        });
      });
    });
    describe('Fold', function() {
      var rangeForRows;
      rangeForRows = function(startRow, endRow) {
        return [[startRow, 0], [endRow + 1, 0]];
      };
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return getVimState('sample.coffee', function(vimState, vim) {
          editor = vimState.editor, editorElement = vimState.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe('inner-fold', function() {
        it("select inner range of fold", function() {
          set({
            cursor: [13, 0]
          });
          return ensure('viz', {
            selectedBufferRange: rangeForRows(10, 25)
          });
        });
        it("select inner range of fold", function() {
          set({
            cursor: [19, 0]
          });
          return ensure('viz', {
            selectedBufferRange: rangeForRows(19, 23)
          });
        });
        it("can expand selection", function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('iz', {
            selectedBufferRange: rangeForRows(23, 23)
          });
          ensure('iz', {
            selectedBufferRange: rangeForRows(19, 23)
          });
          ensure('iz', {
            selectedBufferRange: rangeForRows(10, 25)
          });
          return ensure('iz', {
            selectedBufferRange: rangeForRows(9, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select outer fold(skip)', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('viz', {
              selectedBufferRange: rangeForRows(19, 23)
            });
          });
        });
        describe("when endRow of selection exceeds fold endRow", function() {
          return it("doesn't matter, select fold based on startRow of selection", function() {
            set({
              cursor: [20, 0]
            });
            ensure('VG', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('iz', {
              selectedBufferRange: rangeForRows(19, 23)
            });
          });
        });
        return describe("when indent level of fold startRow and endRow is same", function() {
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-javascript');
            });
            return getVimState('sample.js', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage('language-javascript');
          });
          return it("doesn't select fold endRow", function() {
            set({
              cursor: [5, 0]
            });
            ensure('viz', {
              selectedBufferRange: rangeForRows(5, 6)
            });
            return ensure('az', {
              selectedBufferRange: rangeForRows(4, 7)
            });
          });
        });
      });
      return describe('a-fold', function() {
        it('select fold row range', function() {
          set({
            cursor: [13, 0]
          });
          return ensure('vaz', {
            selectedBufferRange: rangeForRows(9, 25)
          });
        });
        it('select fold row range', function() {
          set({
            cursor: [19, 0]
          });
          return ensure('vaz', {
            selectedBufferRange: rangeForRows(18, 23)
          });
        });
        it('can expand selection', function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('az', {
            selectedBufferRange: rangeForRows(22, 23)
          });
          ensure('az', {
            selectedBufferRange: rangeForRows(18, 23)
          });
          ensure('az', {
            selectedBufferRange: rangeForRows(9, 25)
          });
          return ensure('az', {
            selectedBufferRange: rangeForRows(8, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select outer fold(skip)', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('vaz', {
              selectedBufferRange: rangeForRows(18, 23)
            });
          });
        });
        return describe("when endRow of selection exceeds fold endRow", function() {
          return it("doesn't matter, select fold based on startRow of selection", function() {
            set({
              cursor: [20, 0]
            });
            ensure('VG', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('az', {
              selectedBufferRange: rangeForRows(18, 23)
            });
          });
        });
      });
    });
    describe('Function', function() {
      describe('coffee', function() {
        var pack, scope;
        pack = 'language-coffee-script';
        scope = 'source.coffee';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "# Commment\n\nhello = ->\n  a = 1\n  b = 2\n  c = 3\n\n# Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for coffee', function() {
          return it('select except start row', function() {
            return ensure('vif', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for coffee', function() {
          return it('select function', function() {
            return ensure('vaf', {
              selectedBufferRange: [[2, 0], [6, 0]]
            });
          });
        });
      });
      describe('ruby', function() {
        var pack, scope;
        pack = 'language-ruby';
        scope = 'source.ruby';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "# Commment\n\ndef hello\n  a = 1\n  b = 2\n  c = 3\nend\n\n# Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for ruby', function() {
          return it('select except start row', function() {
            return ensure('vif', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for ruby', function() {
          return it('select function', function() {
            return ensure('vaf', {
              selectedBufferRange: [[2, 0], [7, 0]]
            });
          });
        });
      });
      return describe('go', function() {
        var pack, scope;
        pack = 'language-go';
        scope = 'source.go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          set({
            text: "// Commment\n\nfunc main() {\n  a := 1\n  b := 2\n  c := 3\n}\n\n// Commment",
            cursor: [3, 0]
          });
          return runs(function() {
            var grammar;
            grammar = atom.grammars.grammarForScopeName(scope);
            return editor.setGrammar(grammar);
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        describe('inner-function for go', function() {
          return it('select except start row', function() {
            return ensure('vif', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for go', function() {
          return it('select function', function() {
            return ensure('vaf', {
              selectedBufferRange: [[2, 0], [7, 0]]
            });
          });
        });
      });
    });
    describe('CurrentLine', function() {
      beforeEach(function() {
        return set({
          text: "This is\n  multi line\ntext"
        });
      });
      describe('inner-current-line', function() {
        it('select current line without including last newline', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('vil', {
            selectedText: 'This is'
          });
        });
        return it('also skip leading white space', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('vil', {
            selectedText: 'multi line'
          });
        });
      });
      return describe('a-current-line', function() {
        it('select current line without including last newline as like `vil`', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('val', {
            selectedText: 'This is'
          });
        });
        return it('wont skip leading white space not like `vil`', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('val', {
            selectedText: '  multi line'
          });
        });
      });
    });
    describe('Entire', function() {
      var text;
      text = "This is\n  multi line\ntext";
      beforeEach(function() {
        return set({
          text: text,
          cursor: [0, 0]
        });
      });
      describe('inner-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('vie', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('jjvie', {
            selectedText: text
          });
        });
      });
      return describe('a-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('vae', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('jjvae', {
            selectedText: text
          });
        });
      });
    });
    return describe('SearchMatchForward, SearchBackwards', function() {
      var text;
      text = "0 xxx\n1 abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n";
      beforeEach(function() {
        set({
          text: text,
          cursor: [0, 0]
        });
        ensure([
          '/', {
            search: 'abc'
          }
        ], {
          cursor: [1, 2],
          mode: 'normal'
        });
        return expect(globalState.lastSearchPattern).toEqual(/abc/g);
      });
      describe('gn from normal mode', function() {
        return it('select ranges matches to last search pattern and extend selection', function() {
          ensure('gn', {
            cursor: [1, 5],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: false,
            selectedText: 'abc'
          });
          ensure('gn', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc"
          });
          ensure('gn', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('gn', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      describe('gN from normal mode', function() {
        beforeEach(function() {
          return set({
            cursor: [4, 3]
          });
        });
        return it('select ranges matches to last search pattern and extend selection', function() {
          ensure('gN', {
            cursor: [4, 2],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: true,
            selectedText: 'abc'
          });
          ensure('gN', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc\n4 abc"
          });
          ensure('gN', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('gN', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      return describe('as operator target', function() {
        it('delete next occurence of last search pattern', function() {
          ensure('dgn', {
            cursor: [1, 2],
            mode: 'normal',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          ensure('.', {
            cursor: [3, 5],
            mode: 'normal',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n".replace('_', ' ')
          });
          return ensure('.', {
            cursor: [4, 1],
            mode: 'normal',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 \n".replace('_', ' ')
          });
        });
        return it('change next occurence of last search pattern', function() {
          ensure('cgn', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          keystroke('escape');
          set({
            cursor: [4, 0]
          });
          return ensure('cgN', {
            cursor: [3, 6],
            mode: 'insert',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n".replace('_', ' ')
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy90ZXh0LW9iamVjdC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrREFBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IsZ0JBQUEsUUFBeEIsQ0FBQTs7QUFBQSxFQUNBLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FEZCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFFBQUEsbUZBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsbUJBQUEsR0FBc0IsU0FBQyxVQUFELEdBQUE7YUFDcEIsU0FBQyxZQUFELEVBQWUsU0FBZixFQUEwQixPQUExQixHQUFBO0FBQ0UsUUFBQSxHQUFBLENBQUk7QUFBQSxVQUFBLE1BQUEsRUFBUSxZQUFSO1NBQUosQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLFNBQUEsR0FBWSxVQUFuQixFQUErQixPQUEvQixFQUZGO01BQUEsRUFEb0I7SUFBQSxDQUZ0QixDQUFBO0FBQUEsSUFPQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLFNBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLGdCQUFBLEdBQUQsRUFBTSxtQkFBQSxNQUFOLEVBQWMsc0JBQUEsU0FBZCxF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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/text-object-spec.coffee
