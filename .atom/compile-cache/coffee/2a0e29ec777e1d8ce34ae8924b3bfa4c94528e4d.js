(function() {
  var TextData, dispatch, getVimState, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

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
    return describe('Entire', function() {
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
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy90ZXh0LW9iamVjdC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxQ0FBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IsZ0JBQUEsUUFBeEIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUNyQixRQUFBLG1GQUFBO0FBQUEsSUFBQSxRQUE0RCxFQUE1RCxFQUFDLGNBQUQsRUFBTSxpQkFBTixFQUFjLG9CQUFkLEVBQXlCLGlCQUF6QixFQUFpQyx3QkFBakMsRUFBZ0QsbUJBQWhELENBQUE7QUFBQSxJQUVBLG1CQUFBLEdBQXNCLFNBQUMsVUFBRCxHQUFBO2FBQ3BCLFNBQUMsWUFBRCxFQUFlLFNBQWYsRUFBMEIsT0FBMUIsR0FBQTtBQUNFLFFBQUEsR0FBQSxDQUFJO0FBQUEsVUFBQSxNQUFBLEVBQVEsWUFBUjtTQUFKLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxTQUFBLEdBQVksVUFBbkIsRUFBK0IsT0FBL0IsRUFGRjtNQUFBLEVBRG9CO0lBQUEsQ0FGdEIsQ0FBQTtBQUFBLElBT0EsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxTQUFSLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxLQUFYLENBQUE7QUFBQSxRQUNDLGtCQUFBLE1BQUQsRUFBUyx5QkFBQSxhQURULENBQUE7ZUFFQyxnQkFBQSxHQUFELEVBQU0sbUJBQUEsTUFBTixFQUFjLHNCQUFBLFNBQWQsRUFBMkIsVUFIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBUEEsQ0FBQTtBQUFBLElBYUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FiQSxDQUFBO0FBQUEsSUFnQkEsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixFQURjO1FBQUEsQ0FBaEIsQ0FBQSxDQUFBO2VBRUEsV0FBQSxDQUFZLGVBQVosRUFBNkIsU0FBQyxLQUFELEVBQVEsU0FBUixHQUFBO0FBQzNCLFVBQUMsZUFBQSxNQUFELEVBQVMsc0JBQUEsYUFBVCxDQUFBO2lCQUNDLGdCQUFBLEdBQUQsRUFBTSxtQkFBQSxNQUFOLEVBQWMsc0JBQUEsU0FBZCxFQUEyQixVQUZBO1FBQUEsQ0FBN0IsRUFIUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFNQSxTQUFBLENBQVUsU0FBQSxHQUFBO2VBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBZCxDQUFnQyx3QkFBaEMsRUFEUTtNQUFBLENBQVYsQ0FOQSxDQUFBO2FBU0EsUUFBQSxDQUFTLHFDQUFULEVBQWdELFNBQUEsR0FBQTtlQUM5QyxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxRQUFBLENBQVMsYUFBVCxFQUF3QiwwQkFBeEIsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTztBQUFBLFlBQUEsWUFBQSxFQUFjLFdBQWQ7V0FBUCxFQUgyQjtRQUFBLENBQTdCLEVBRDhDO01BQUEsQ0FBaEQsRUFWcUI7SUFBQSxDQUF2QixDQWhCQSxDQUFBO0FBQUEsSUFnQ0EsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBLEdBQUE7QUFDckIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLG1CQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFLQSxFQUFBLENBQUcsb0VBQUgsRUFBeUUsU0FBQSxHQUFBO2lCQUN2RSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQVUsY0FBVjtBQUFBLFlBQ0EsTUFBQSxFQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEVjtBQUFBLFlBRUEsUUFBQSxFQUFVO0FBQUEsY0FBQSxHQUFBLEVBQUs7QUFBQSxnQkFBQSxJQUFBLEVBQU0sT0FBTjtlQUFMO2FBRlY7QUFBQSxZQUdBLElBQUEsRUFBTSxRQUhOO1dBREYsRUFEdUU7UUFBQSxDQUF6RSxDQUxBLENBQUE7QUFBQSxRQVlBLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBLEdBQUE7aUJBQ25ELE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFULENBQXJCO1dBREYsRUFEbUQ7UUFBQSxDQUFyRCxDQVpBLENBQUE7QUFBQSxRQWdCQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxTQUFBLEVBQVcsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFYO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLENBQ25CLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFULENBRG1CLEVBRW5CLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBRm1CLENBQXJCO1dBREYsRUFGZ0M7UUFBQSxDQUFsQyxDQWhCQSxDQUFBO0FBQUEsUUF3QkEsUUFBQSxDQUFTLHVDQUFULEVBQWtELFNBQUEsR0FBQTtBQUNoRCxVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sVUFBTjtBQUFBLGNBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjthQURGLEVBRFM7VUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFVBS0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTttQkFDdkIsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxjQUFlLElBQUEsRUFBTSxRQUFyQjthQUFkLEVBRHVCO1VBQUEsQ0FBekIsQ0FMQSxDQUFBO2lCQVFBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBLEdBQUE7bUJBQ3ZCLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLElBQUEsRUFBTSxPQUFOO0FBQUEsY0FBZSxJQUFBLEVBQU0sUUFBckI7YUFBZCxFQUR1QjtVQUFBLENBQXpCLEVBVGdEO1FBQUEsQ0FBbEQsQ0F4QkEsQ0FBQTtlQW9DQSxRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQSxHQUFBO0FBQ2pELFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTttQkFDVCxHQUFBLENBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSxVQUFOO0FBQUEsY0FDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO2FBREYsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsVUFLQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQSxHQUFBO21CQUN2QixNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLGNBQWUsSUFBQSxFQUFNLFFBQXJCO2FBQWQsRUFEdUI7VUFBQSxDQUF6QixDQUxBLENBQUE7aUJBUUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTttQkFDdkIsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxjQUFlLElBQUEsRUFBTSxRQUFyQjthQUFkLEVBRHVCO1VBQUEsQ0FBekIsRUFUaUQ7UUFBQSxDQUFuRCxFQXJDcUI7TUFBQSxDQUF2QixDQUFBLENBQUE7YUFpREEsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxtQkFBTjtBQUFBLFlBQTJCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQW5DO1dBQUosRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxFQUFBLENBQUcsNkdBQUgsRUFBa0gsU0FBQSxHQUFBO2lCQUNoSCxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sYUFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtBQUFBLFlBRUEsUUFBQSxFQUFVO0FBQUEsY0FBQSxHQUFBLEVBQUs7QUFBQSxnQkFBQSxJQUFBLEVBQU0sUUFBTjtlQUFMO2FBRlY7V0FERixFQURnSDtRQUFBLENBQWxILENBSEEsQ0FBQTtBQUFBLFFBU0EsRUFBQSxDQUFHLHlGQUFILEVBQThGLFNBQUEsR0FBQTtpQkFDNUYsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVQsQ0FBckI7V0FBZCxFQUQ0RjtRQUFBLENBQTlGLENBVEEsQ0FBQTtBQUFBLFFBWUEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUEsR0FBQTtBQUMxQixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLG9CQUFOO0FBQUEsWUFBNEIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBcEM7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBckI7V0FBZCxFQUYwQjtRQUFBLENBQTVCLENBWkEsQ0FBQTtlQWdCQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQSxHQUFBO0FBQ3BDLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxJQUFBLEVBQU0sb0JBQU47QUFBQSxZQUE0QixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFwQztXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUFyQjtXQUFkLEVBRm9DO1FBQUEsQ0FBdEMsRUFqQmlCO01BQUEsQ0FBbkIsRUFsRGU7SUFBQSxDQUFqQixDQWhDQSxDQUFBO0FBQUEsSUF1R0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO0FBQ3BCLE1BQUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUFJO0FBQUEsWUFBQSxJQUFBLEVBQU0sbUJBQU47QUFBQSxZQUEyQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFuQztXQUFKLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBR0EsRUFBQSxDQUFHLDBFQUFILEVBQStFLFNBQUEsR0FBQTtpQkFDN0UsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsSUFBQSxFQUFNLGNBQU47QUFBQSxZQUFzQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5QjtBQUFBLFlBQXNDLFFBQUEsRUFBVTtBQUFBLGNBQUEsR0FBQSxFQUFLO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLE9BQU47ZUFBTDthQUFoRDtXQUFkLEVBRDZFO1FBQUEsQ0FBL0UsQ0FIQSxDQUFBO2VBTUEsRUFBQSxDQUFHLHNEQUFILEVBQTJELFNBQUEsR0FBQTtpQkFDekQsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVQsQ0FBckI7V0FBZCxFQUR5RDtRQUFBLENBQTNELEVBUDJCO01BQUEsQ0FBN0IsQ0FBQSxDQUFBO2FBU0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxtQkFBTjtBQUFBLFlBQTJCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQW5DO1dBQUosRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxFQUFBLENBQUcseUhBQUgsRUFBOEgsU0FBQSxHQUFBO2lCQUM1SCxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sYUFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtBQUFBLFlBRUEsUUFBQSxFQUFVO0FBQUEsY0FBQSxHQUFBLEVBQUs7QUFBQSxnQkFBQSxJQUFBLEVBQU0sUUFBTjtlQUFMO2FBRlY7QUFBQSxZQUdBLElBQUEsRUFBTSxRQUhOO1dBREYsRUFENEg7UUFBQSxDQUE5SCxDQUhBLENBQUE7QUFBQSxRQVVBLEVBQUEsQ0FBRyxxR0FBSCxFQUEwRyxTQUFBLEdBQUE7aUJBQ3hHLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFULENBQXJCO1dBQWQsRUFEd0c7UUFBQSxDQUExRyxDQVZBLENBQUE7ZUFhQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxJQUFBLEVBQU0sb0JBQU47QUFBQSxZQUE0QixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFwQztXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUFyQjtXQUFkLEVBRjBCO1FBQUEsQ0FBNUIsRUFkdUI7TUFBQSxDQUF6QixFQVZvQjtJQUFBLENBQXRCLENBdkdBLENBQUE7QUFBQSxJQW1JQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsVUFBQSw4QkFBQTtBQUFBLE1BQUEsUUFBNEIsRUFBNUIsRUFBQyxtQkFBQSxVQUFELEVBQWEsb0JBQUEsV0FBYixDQUFBO0FBQUEsTUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxVQUFBLEdBQWEseUhBQWIsQ0FBQTtBQUFBLFFBU0EsV0FBQSxHQUFjLCtDQVRkLENBQUE7ZUFnQkEsR0FBQSxDQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sVUFBTjtBQUFBLFVBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtTQURGLEVBakJTO01BQUEsQ0FBWCxDQURBLENBQUE7QUFBQSxNQXFCQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFFBQUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtBQUNwRCxVQUFBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxzSEFBTjtXQURGLENBQUEsQ0FBQTtpQkFVQSxNQUFBLENBQU8sZ0JBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLG9HQUFOO1dBREYsRUFYb0Q7UUFBQSxDQUF0RCxDQUFBLENBQUE7ZUFxQkEsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUEsR0FBQTtBQUN6QixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLFdBQU47QUFBQSxZQUFtQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEzQjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxDQUFVLEdBQVYsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsWUFBQSxZQUFBLEVBQWMsT0FBZDtXQUFiLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsWUFBQSxFQUFjLGFBQWQ7V0FBYixDQUhBLENBQUE7QUFBQSxVQUlBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxZQUFBLFlBQUEsRUFBYyxnQ0FBZDtXQUFiLENBSkEsQ0FBQTtpQkFLQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsWUFBQSxZQUFBLEVBQWMsMkNBQWQ7V0FBYixFQU55QjtRQUFBLENBQTNCLEVBdEJ5QjtNQUFBLENBQTNCLENBckJBLENBQUE7YUFrREEsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFFBQUEsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUEsR0FBQTtBQUNoRCxVQUFBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxrSEFBTjtXQURGLENBQUEsQ0FBQTtpQkFVQSxNQUFBLENBQU8sZ0JBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLG9GQUFOO1dBREYsRUFYZ0Q7UUFBQSxDQUFsRCxDQUFBLENBQUE7ZUFxQkEsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUEsR0FBQTtBQUN6QixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLFdBQU47QUFBQSxZQUFtQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEzQjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxDQUFVLEdBQVYsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsWUFBQSxZQUFBLEVBQWMsU0FBZDtXQUFiLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsWUFBQSxFQUFjLGlCQUFkO1dBQWIsQ0FIQSxDQUFBO0FBQUEsVUFJQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsWUFBQSxZQUFBLEVBQWMsa0NBQWQ7V0FBYixDQUpBLENBQUE7aUJBS0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsWUFBQSxFQUFjLCtDQUFkO1dBQWIsRUFOeUI7UUFBQSxDQUEzQixFQXRCcUI7TUFBQSxDQUF2QixFQW5Ea0I7SUFBQSxDQUFwQixDQW5JQSxDQUFBO0FBQUEsSUFvTkEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEdBQUEsQ0FDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLDBCQUFOO0FBQUEsVUFHQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUhSO1NBREYsRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFNQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtBQUNwRCxVQUFBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLElBQUEsRUFBTSx1QkFBTjtXQUFkLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsSUFBQSxFQUFNLG9CQUFOO1dBQVosQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLElBQUEsRUFBTSxpQkFBTjtXQUFaLEVBSG9EO1FBQUEsQ0FBdEQsQ0FBQSxDQUFBO2VBSUEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUEsR0FBQTtBQUMxQixVQUFBLFNBQUEsQ0FBVSxHQUFWLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsWUFBQSxFQUFjLEtBQWQ7V0FBYixDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxZQUFBLFlBQUEsRUFBYyxLQUFkO1dBQWIsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxZQUFBLFlBQUEsRUFBYyxLQUFkO1dBQWIsRUFKMEI7UUFBQSxDQUE1QixFQUwwQjtNQUFBLENBQTVCLENBTkEsQ0FBQTthQWdCQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQSxHQUFBO0FBQ2pELFVBQUEsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsSUFBQSxFQUFNLG1CQUFOO1dBQWQsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO0FBQUEsWUFBQSxJQUFBLEVBQU0sY0FBTjtXQUFkLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLEdBQVAsRUFBYztBQUFBLFlBQUEsSUFBQSxFQUFNLFNBQU47V0FBZCxDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLEdBQVAsRUFKaUQ7UUFBQSxDQUFuRCxDQUFBLENBQUE7ZUFLQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsU0FBQSxDQUFVLEdBQVYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsWUFBQSxZQUFBLEVBQWMsT0FBZDtXQUFiLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsWUFBQSxFQUFjLE9BQWQ7V0FBYixDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsWUFBQSxFQUFjLE9BQWQ7V0FBYixFQUowQjtRQUFBLENBQTVCLEVBTnNCO01BQUEsQ0FBeEIsRUFqQm1CO0lBQUEsQ0FBckIsQ0FwTkEsQ0FBQTtBQUFBLElBaVBBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixNQUFBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLG1EQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFLQSxFQUFBLENBQUcsc0VBQUgsRUFBMkUsU0FBQSxHQUFBO2lCQUN6RSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0seUJBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERixFQUR5RTtRQUFBLENBQTNFLENBTEEsQ0FBQTtBQUFBLFFBVUEsRUFBQSxDQUFHLGlFQUFILEVBQXNFLFNBQUEsR0FBQTtBQUNwRSxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sa0RBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBRFI7V0FERixFQUZvRTtRQUFBLENBQXRFLENBVkEsQ0FBQTtBQUFBLFFBZ0JBLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLG1EQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQURSO1dBREYsRUFGc0Q7UUFBQSxDQUF4RCxDQWhCQSxDQUFBO2VBcUJBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsY0FBQSxpREFBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLG1CQUFBLENBQW9CLElBQXBCLENBQVIsQ0FBQTtBQUFBLFVBQ0EsSUFBQSxHQUFPLE9BRFAsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUFZLE1BRlosQ0FBQTtBQUFBLFVBR0EsWUFBQSxHQUFlLEdBSGYsQ0FBQTtBQUFBLFVBSUEsSUFBQSxHQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FKUCxDQUFBO0FBQUEsVUFLQSxLQUFBLEdBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUxSLENBQUE7QUFBQSxVQU1BLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUFJO0FBQUEsY0FBQyxNQUFBLElBQUQ7YUFBSixFQURTO1VBQUEsQ0FBWCxDQU5BLENBQUE7QUFBQSxVQVFBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUI7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBUkEsQ0FBQTtBQUFBLFVBU0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxjQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjthQUFsQixFQUFIO1VBQUEsQ0FBcEIsQ0FUQSxDQUFBO0FBQUEsVUFVQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBVkEsQ0FBQTtpQkFXQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBQWtCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBbEIsRUFBSDtVQUFBLENBQXBCLEVBWnFDO1FBQUEsQ0FBdkMsRUF0QjZCO01BQUEsQ0FBL0IsQ0FBQSxDQUFBO2FBbUNBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsWUFBQSxZQUFBO0FBQUEsUUFBQSxZQUFBLEdBQWUscUNBQWYsQ0FBQTtBQUFBLFFBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxZQUFOO0FBQUEsWUFBb0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBNUI7V0FBSixFQURTO1FBQUEsQ0FBWCxDQURBLENBQUE7QUFBQSxRQUlBLEVBQUEsQ0FBRyw2RUFBSCxFQUFrRixTQUFBLEdBQUE7aUJBQ2hGLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO0FBQUEsWUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGLEVBRGdGO1FBQUEsQ0FBbEYsQ0FKQSxDQUFBO0FBQUEsUUFXQSxFQUFBLENBQUcsaUVBQUgsRUFBc0UsU0FBQSxHQUFBO0FBQ3BFLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxrQ0FBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FEUjtBQUFBLFlBRUEsSUFBQSxFQUFNLFFBRk47V0FERixFQUZvRTtRQUFBLENBQXRFLENBWEEsQ0FBQTtlQWlCQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLGNBQUEsaURBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxtQkFBQSxDQUFvQixJQUFwQixDQUFSLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxPQURQLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBWSxJQUZaLENBQUE7QUFBQSxVQUdBLFlBQUEsR0FBZSxLQUhmLENBQUE7QUFBQSxVQUlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLENBSlAsQ0FBQTtBQUFBLFVBS0EsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FMUixDQUFBO0FBQUEsVUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FBSTtBQUFBLGNBQUMsTUFBQSxJQUFEO2FBQUosRUFEUztVQUFBLENBQVgsQ0FOQSxDQUFBO0FBQUEsVUFRQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVJBLENBQUE7QUFBQSxVQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBbEIsRUFBSDtVQUFBLENBQXBCLENBVEEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVZBLENBQUE7aUJBV0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixFQVpxQztRQUFBLENBQXZDLEVBbEJ5QjtNQUFBLENBQTNCLEVBcENzQjtJQUFBLENBQXhCLENBalBBLENBQUE7QUFBQSxJQW9UQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsTUFBQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxtREFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtXQURGLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBS0EsUUFBQSxDQUFTLGdFQUFULEVBQTJFLFNBQUEsR0FBQTtBQUN6RSxVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sd0NBQU47YUFERixFQURTO1VBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxVQUdBLEVBQUEsQ0FBRyxRQUFILEVBQWEsU0FBQSxHQUFBO0FBQ1gsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLHVCQUFOO0FBQUEsY0FDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO2FBREYsRUFGVztVQUFBLENBQWIsQ0FIQSxDQUFBO2lCQVNBLEVBQUEsQ0FBRyxRQUFILEVBQWEsU0FBQSxHQUFBO0FBQ1gsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLHlCQUFOO0FBQUEsY0FDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQURSO2FBREYsRUFGVztVQUFBLENBQWIsRUFWeUU7UUFBQSxDQUEzRSxDQUxBLENBQUE7QUFBQSxRQXFCQSxRQUFBLENBQVMsa0RBQVQsRUFBNkQsU0FBQSxHQUFBO0FBQzNELFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTttQkFDVCxHQUFBLENBQ0U7QUFBQSxjQUFBLElBQUEsRUFBTSx1Q0FBTjthQURGLEVBRFM7VUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFVBSUEsRUFBQSxDQUFHLFFBQUgsRUFBYSxTQUFBLEdBQUE7QUFDWCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sdUJBQU47QUFBQSxjQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7YUFERixFQUZXO1VBQUEsQ0FBYixDQUpBLENBQUE7aUJBU0EsRUFBQSxDQUFHLFFBQUgsRUFBYSxTQUFBLEdBQUE7QUFDWCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sd0JBQU47QUFBQSxjQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBRFI7YUFERixFQUZXO1VBQUEsQ0FBYixFQVYyRDtRQUFBLENBQTdELENBckJBLENBQUE7QUFBQSxRQXFDQSxFQUFBLENBQUcsc0VBQUgsRUFBMkUsU0FBQSxHQUFBO2lCQUN6RSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0seUJBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERixFQUR5RTtRQUFBLENBQTNFLENBckNBLENBQUE7QUFBQSxRQWlEQSxFQUFBLENBQUcsd0ZBQUgsRUFBNkYsU0FBQSxHQUFBO0FBQzNGLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSx5QkFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtXQURGLEVBRjJGO1FBQUEsQ0FBN0YsQ0FqREEsQ0FBQTtBQUFBLFFBdURBLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLG1EQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQURSO1dBREYsRUFGc0Q7UUFBQSxDQUF4RCxDQXZEQSxDQUFBO2VBNERBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsY0FBQSxpREFBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLG1CQUFBLENBQW9CLElBQXBCLENBQVIsQ0FBQTtBQUFBLFVBQ0EsSUFBQSxHQUFPLE9BRFAsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUFZLE1BRlosQ0FBQTtBQUFBLFVBR0EsWUFBQSxHQUFlLEdBSGYsQ0FBQTtBQUFBLFVBSUEsSUFBQSxHQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FKUCxDQUFBO0FBQUEsVUFLQSxLQUFBLEdBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUxSLENBQUE7QUFBQSxVQU1BLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUFJO0FBQUEsY0FBQyxNQUFBLElBQUQ7YUFBSixFQURTO1VBQUEsQ0FBWCxDQU5BLENBQUE7QUFBQSxVQVFBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUI7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBUkEsQ0FBQTtBQUFBLFVBU0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxjQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjthQUFsQixFQUFIO1VBQUEsQ0FBcEIsQ0FUQSxDQUFBO0FBQUEsVUFVQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBVkEsQ0FBQTtpQkFXQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBQWtCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBbEIsRUFBSDtVQUFBLENBQXBCLEVBWnFDO1FBQUEsQ0FBdkMsRUE3RDZCO01BQUEsQ0FBL0IsQ0FBQSxDQUFBO2FBMEVBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsWUFBQSxZQUFBO0FBQUEsUUFBQSxZQUFBLEdBQWUscUNBQWYsQ0FBQTtBQUFBLFFBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxZQUFOO0FBQUEsWUFBb0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBNUI7V0FBSixFQURTO1FBQUEsQ0FBWCxDQURBLENBQUE7QUFBQSxRQUlBLEVBQUEsQ0FBRyw2RUFBSCxFQUFrRixTQUFBLEdBQUE7aUJBQ2hGLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO0FBQUEsWUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGLEVBRGdGO1FBQUEsQ0FBbEYsQ0FKQSxDQUFBO0FBQUEsUUFVQSxFQUFBLENBQUcsd0ZBQUgsRUFBNkYsU0FBQSxHQUFBO0FBQzNGLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxrQ0FBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FEUjtBQUFBLFlBRUEsSUFBQSxFQUFNLFFBRk47V0FERixFQUYyRjtRQUFBLENBQTdGLENBVkEsQ0FBQTtlQWdCQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLGNBQUEsaURBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxtQkFBQSxDQUFvQixJQUFwQixDQUFSLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxPQURQLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBWSxJQUZaLENBQUE7QUFBQSxVQUdBLFlBQUEsR0FBZSxLQUhmLENBQUE7QUFBQSxVQUlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLENBSlAsQ0FBQTtBQUFBLFVBS0EsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FMUixDQUFBO0FBQUEsVUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FBSTtBQUFBLGNBQUMsTUFBQSxJQUFEO2FBQUosRUFEUztVQUFBLENBQVgsQ0FOQSxDQUFBO0FBQUEsVUFRQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVJBLENBQUE7QUFBQSxVQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBbEIsRUFBSDtVQUFBLENBQXBCLENBVEEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVZBLENBQUE7aUJBV0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixFQVpxQztRQUFBLENBQXZDLEVBakJ5QjtNQUFBLENBQTNCLEVBM0VzQjtJQUFBLENBQXhCLENBcFRBLENBQUE7QUFBQSxJQTZaQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsVUFBQSxZQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsd0JBQWYsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLFlBQU47QUFBQSxVQUFvQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE1QjtTQUFKLEVBRFM7TUFBQSxDQUFYLENBREEsQ0FBQTtBQUFBLE1BSUEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7aUJBQ2pDLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLElBQUEsRUFBTSxrQkFBTjtBQUFBLFlBQTBCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWxDO1dBQWQsRUFEaUM7UUFBQSxDQUFuQyxDQUFBLENBQUE7QUFBQSxRQUdBLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBLEdBQUE7QUFDbkQsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsSUFBQSxFQUFNLFlBQU47QUFBQSxZQUFvQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUE1QjtXQUFkLEVBRm1EO1FBQUEsQ0FBckQsQ0FIQSxDQUFBO2VBTUEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxjQUFBLGlEQUFBO0FBQUEsVUFBQSxLQUFBLEdBQVEsbUJBQUEsQ0FBb0IsSUFBcEIsQ0FBUixDQUFBO0FBQUEsVUFDQSxJQUFBLEdBQU8sT0FEUCxDQUFBO0FBQUEsVUFFQSxTQUFBLEdBQVksTUFGWixDQUFBO0FBQUEsVUFHQSxZQUFBLEdBQWUsR0FIZixDQUFBO0FBQUEsVUFJQSxJQUFBLEdBQU8sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUpQLENBQUE7QUFBQSxVQUtBLEtBQUEsR0FBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBTFIsQ0FBQTtBQUFBLFVBTUEsVUFBQSxDQUFXLFNBQUEsR0FBQTttQkFDVCxHQUFBLENBQUk7QUFBQSxjQUFDLE1BQUEsSUFBRDthQUFKLEVBRFM7VUFBQSxDQUFYLENBTkEsQ0FBQTtBQUFBLFVBUUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxjQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjthQUFqQixFQUFIO1VBQUEsQ0FBcEIsQ0FSQSxDQUFBO0FBQUEsVUFTQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBQWtCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixDQVRBLENBQUE7QUFBQSxVQVVBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUI7QUFBQSxjQUFDLGNBQUEsWUFBRDthQUFqQixFQUFIO1VBQUEsQ0FBcEIsQ0FWQSxDQUFBO2lCQVdBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFDLGNBQUEsWUFBRDthQUFsQixFQUFIO1VBQUEsQ0FBcEIsRUFacUM7UUFBQSxDQUF2QyxFQVAwQjtNQUFBLENBQTVCLENBSkEsQ0FBQTthQXdCQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQSxHQUFBO2lCQUNqQyxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxJQUFBLEVBQU0sZ0JBQU47QUFBQSxZQUF3QixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFoQztXQUFkLEVBRGlDO1FBQUEsQ0FBbkMsQ0FBQSxDQUFBO0FBQUEsUUFHQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLElBQUEsRUFBTSxZQUFOO0FBQUEsWUFBb0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBNUI7V0FBZCxFQUZtRDtRQUFBLENBQXJELENBSEEsQ0FBQTtlQU1BLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsY0FBQSxpREFBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLG1CQUFBLENBQW9CLElBQXBCLENBQVIsQ0FBQTtBQUFBLFVBQ0EsSUFBQSxHQUFPLE9BRFAsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUFZLElBRlosQ0FBQTtBQUFBLFVBR0EsWUFBQSxHQUFlLEtBSGYsQ0FBQTtBQUFBLFVBSUEsSUFBQSxHQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FKUCxDQUFBO0FBQUEsVUFLQSxLQUFBLEdBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUxSLENBQUE7QUFBQSxVQU1BLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUFJO0FBQUEsY0FBQyxNQUFBLElBQUQ7YUFBSixFQURTO1VBQUEsQ0FBWCxDQU5BLENBQUE7QUFBQSxVQVFBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUI7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBUkEsQ0FBQTtBQUFBLFVBU0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxjQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjthQUFsQixFQUFIO1VBQUEsQ0FBcEIsQ0FUQSxDQUFBO0FBQUEsVUFVQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBVkEsQ0FBQTtpQkFXQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBQWtCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBbEIsRUFBSDtVQUFBLENBQXBCLEVBWnFDO1FBQUEsQ0FBdkMsRUFQc0I7TUFBQSxDQUF4QixFQXpCbUI7SUFBQSxDQUFyQixDQTdaQSxDQUFBO0FBQUEsSUEwY0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtBQUM5QixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0scUNBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUtBLEVBQUEsQ0FBRywwREFBSCxFQUErRCxTQUFBLEdBQUE7aUJBQzdELE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsRUFENkQ7UUFBQSxDQUEvRCxDQUxBLENBQUE7QUFBQSxRQVVBLEVBQUEsQ0FBRyx3RUFBSCxFQUE2RSxTQUFBLEdBQUE7QUFDM0UsVUFBQSxHQUFBLENBQ0U7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FERixDQUFBLENBQUE7aUJBRUEsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLGlDQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQURSO1dBREYsRUFIMkU7UUFBQSxDQUE3RSxDQVZBLENBQUE7ZUFpQkEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxjQUFBLGlEQUFBO0FBQUEsVUFBQSxLQUFBLEdBQVEsbUJBQUEsQ0FBb0IsSUFBcEIsQ0FBUixDQUFBO0FBQUEsVUFDQSxJQUFBLEdBQU8sT0FEUCxDQUFBO0FBQUEsVUFFQSxTQUFBLEdBQVksTUFGWixDQUFBO0FBQUEsVUFHQSxZQUFBLEdBQWUsR0FIZixDQUFBO0FBQUEsVUFJQSxJQUFBLEdBQU8sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUpQLENBQUE7QUFBQSxVQUtBLEtBQUEsR0FBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBTFIsQ0FBQTtBQUFBLFVBTUEsVUFBQSxDQUFXLFNBQUEsR0FBQTttQkFDVCxHQUFBLENBQUk7QUFBQSxjQUFDLE1BQUEsSUFBRDthQUFKLEVBRFM7VUFBQSxDQUFYLENBTkEsQ0FBQTtBQUFBLFVBUUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxjQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjthQUFqQixFQUFIO1VBQUEsQ0FBcEIsQ0FSQSxDQUFBO0FBQUEsVUFTQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBQWtCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixDQVRBLENBQUE7QUFBQSxVQVVBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUI7QUFBQSxjQUFDLGNBQUEsWUFBRDthQUFqQixFQUFIO1VBQUEsQ0FBcEIsQ0FWQSxDQUFBO2lCQVdBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFDLGNBQUEsWUFBRDthQUFsQixFQUFIO1VBQUEsQ0FBcEIsRUFacUM7UUFBQSxDQUF2QyxFQWxCOEI7TUFBQSxDQUFoQyxDQUFBLENBQUE7YUErQkEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0scUNBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUtBLEVBQUEsQ0FBRyxzREFBSCxFQUEyRCxTQUFBLEdBQUE7aUJBQ3pELE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxFQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO0FBQUEsWUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGLEVBRHlEO1FBQUEsQ0FBM0QsQ0FMQSxDQUFBO0FBQUEsUUFXQSxFQUFBLENBQUcsb0VBQUgsRUFBeUUsU0FBQSxHQUFBO0FBQ3ZFLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSwrQkFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FEUjtBQUFBLFlBRUEsSUFBQSxFQUFNLFFBRk47V0FERixFQUZ1RTtRQUFBLENBQXpFLENBWEEsQ0FBQTtlQWlCQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLGNBQUEsaURBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxtQkFBQSxDQUFvQixJQUFwQixDQUFSLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxPQURQLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBWSxJQUZaLENBQUE7QUFBQSxVQUdBLFlBQUEsR0FBZSxLQUhmLENBQUE7QUFBQSxVQUlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLENBSlAsQ0FBQTtBQUFBLFVBS0EsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FMUixDQUFBO0FBQUEsVUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FBSTtBQUFBLGNBQUMsTUFBQSxJQUFEO2FBQUosRUFEUztVQUFBLENBQVgsQ0FOQSxDQUFBO0FBQUEsVUFRQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVJBLENBQUE7QUFBQSxVQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBbEIsRUFBSDtVQUFBLENBQXBCLENBVEEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVZBLENBQUE7aUJBV0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixFQVpxQztRQUFBLENBQXZDLEVBbEIwQjtNQUFBLENBQTVCLEVBaEN1QjtJQUFBLENBQXpCLENBMWNBLENBQUE7QUFBQSxJQXlnQkEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtBQUM5QixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0scUNBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUtBLEVBQUEsQ0FBRyxvRUFBSCxFQUF5RSxTQUFBLEdBQUE7aUJBQ3ZFLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsRUFEdUU7UUFBQSxDQUF6RSxDQUxBLENBQUE7QUFBQSxRQVVBLEVBQUEsQ0FBRyxrRkFBSCxFQUF1RixTQUFBLEdBQUE7QUFDckYsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLGlDQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQURSO1dBREYsRUFGcUY7UUFBQSxDQUF2RixDQVZBLENBQUE7ZUFlQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLGNBQUEsaURBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxtQkFBQSxDQUFvQixJQUFwQixDQUFSLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxPQURQLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBWSxNQUZaLENBQUE7QUFBQSxVQUdBLFlBQUEsR0FBZSxHQUhmLENBQUE7QUFBQSxVQUlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLENBSlAsQ0FBQTtBQUFBLFVBS0EsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FMUixDQUFBO0FBQUEsVUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FBSTtBQUFBLGNBQUMsTUFBQSxJQUFEO2FBQUosRUFEUztVQUFBLENBQVgsQ0FOQSxDQUFBO0FBQUEsVUFRQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVJBLENBQUE7QUFBQSxVQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBbEIsRUFBSDtVQUFBLENBQXBCLENBVEEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVZBLENBQUE7aUJBV0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixFQVpxQztRQUFBLENBQXZDLEVBaEI4QjtNQUFBLENBQWhDLENBQUEsQ0FBQTthQTZCQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxxQ0FBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtXQURGLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBS0EsRUFBQSxDQUFHLDhFQUFILEVBQW1GLFNBQUEsR0FBQTtpQkFDakYsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLEVBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7QUFBQSxZQUVBLElBQUEsRUFBTSxRQUZOO1dBREYsRUFEaUY7UUFBQSxDQUFuRixDQUxBLENBQUE7QUFBQSxRQVdBLEVBQUEsQ0FBRyw0RkFBSCxFQUFpRyxTQUFBLEdBQUE7QUFDL0YsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLCtCQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQURSO0FBQUEsWUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGLEVBRitGO1FBQUEsQ0FBakcsQ0FYQSxDQUFBO2VBaUJBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsY0FBQSxpREFBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLG1CQUFBLENBQW9CLElBQXBCLENBQVIsQ0FBQTtBQUFBLFVBQ0EsSUFBQSxHQUFPLE9BRFAsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUFZLElBRlosQ0FBQTtBQUFBLFVBR0EsWUFBQSxHQUFlLEtBSGYsQ0FBQTtBQUFBLFVBSUEsSUFBQSxHQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FKUCxDQUFBO0FBQUEsVUFLQSxLQUFBLEdBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUxSLENBQUE7QUFBQSxVQU1BLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUFJO0FBQUEsY0FBQyxNQUFBLElBQUQ7YUFBSixFQURTO1VBQUEsQ0FBWCxDQU5BLENBQUE7QUFBQSxVQVFBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUI7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBUkEsQ0FBQTtBQUFBLFVBU0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxjQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjthQUFsQixFQUFIO1VBQUEsQ0FBcEIsQ0FUQSxDQUFBO0FBQUEsVUFVQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBVkEsQ0FBQTtpQkFXQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBQWtCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBbEIsRUFBSDtVQUFBLENBQXBCLEVBWnFDO1FBQUEsQ0FBdkMsRUFsQjBCO01BQUEsQ0FBNUIsRUE5QnVCO0lBQUEsQ0FBekIsQ0F6Z0JBLENBQUE7QUFBQSxJQXVrQkEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBYixDQUFpQixNQUFqQixFQUNFO0FBQUEsVUFBQSxrR0FBQSxFQUNFO0FBQUEsWUFBQSxLQUFBLEVBQVEsb0RBQVI7QUFBQSxZQUNBLEtBQUEsRUFBUSxvREFEUjtBQUFBLFlBRUEsS0FBQSxFQUFRLHFEQUZSO0FBQUEsWUFHQSxLQUFBLEVBQVEsa0RBSFI7QUFBQSxZQUtBLEtBQUEsRUFBUSxnREFMUjtBQUFBLFlBTUEsS0FBQSxFQUFRLGdEQU5SO0FBQUEsWUFPQSxLQUFBLEVBQVEsaURBUFI7QUFBQSxZQVFBLEtBQUEsRUFBUSw4Q0FSUjtXQURGO1NBREYsQ0FBQSxDQUFBO2VBWUEsR0FBQSxDQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sNENBQU47U0FERixFQWJTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQW9CQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7ZUFDaEIsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQW9CLE1BQUEsQ0FBTyxDQUFDLFFBQUQsRUFBVyxLQUFYLENBQVAsRUFBMEI7QUFBQSxZQUFBLFlBQUEsRUFBYyxLQUFkO1dBQTFCLENBQXBCLENBQUE7QUFBQSxVQUNBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBREEsQ0FBQTtBQUFBLFVBQ29CLE1BQUEsQ0FBTyxDQUFDLFFBQUQsRUFBVyxLQUFYLENBQVAsRUFBMEI7QUFBQSxZQUFBLFlBQUEsRUFBYyxLQUFkO1dBQTFCLENBRHBCLENBQUE7QUFBQSxVQUVBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBRkEsQ0FBQTtBQUFBLFVBRW9CLE1BQUEsQ0FBTyxDQUFDLFFBQUQsRUFBVyxLQUFYLENBQVAsRUFBMEI7QUFBQSxZQUFBLFlBQUEsRUFBYyxLQUFkO1dBQTFCLENBRnBCLENBQUE7QUFBQSxVQUdBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBSEEsQ0FBQTtpQkFHb0IsTUFBQSxDQUFPLENBQUMsUUFBRCxFQUFXLEtBQVgsQ0FBUCxFQUEwQjtBQUFBLFlBQUEsWUFBQSxFQUFjLEtBQWQ7V0FBMUIsRUFKUTtRQUFBLENBQTlCLEVBRGdCO01BQUEsQ0FBbEIsQ0FwQkEsQ0FBQTtBQUFBLE1BMEJBLFFBQUEsQ0FBUyxHQUFULEVBQWMsU0FBQSxHQUFBO2VBQ1osRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQW9CLE1BQUEsQ0FBTyxDQUFDLFFBQUQsRUFBVyxLQUFYLENBQVAsRUFBMEI7QUFBQSxZQUFBLFlBQUEsRUFBYyxPQUFkO1dBQTFCLENBQXBCLENBQUE7QUFBQSxVQUNBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBREEsQ0FBQTtBQUFBLFVBQ29CLE1BQUEsQ0FBTyxDQUFDLFFBQUQsRUFBVyxLQUFYLENBQVAsRUFBMEI7QUFBQSxZQUFBLFlBQUEsRUFBYyxPQUFkO1dBQTFCLENBRHBCLENBQUE7QUFBQSxVQUVBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBRkEsQ0FBQTtBQUFBLFVBRW9CLE1BQUEsQ0FBTyxDQUFDLFFBQUQsRUFBVyxLQUFYLENBQVAsRUFBMEI7QUFBQSxZQUFBLFlBQUEsRUFBYyxPQUFkO1dBQTFCLENBRnBCLENBQUE7QUFBQSxVQUdBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBSEEsQ0FBQTtpQkFHb0IsTUFBQSxDQUFPLENBQUMsUUFBRCxFQUFXLEtBQVgsQ0FBUCxFQUEwQjtBQUFBLFlBQUEsWUFBQSxFQUFjLE9BQWQ7V0FBMUIsRUFKUTtRQUFBLENBQTlCLEVBRFk7TUFBQSxDQUFkLENBMUJBLENBQUE7YUFnQ0EsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixZQUFBLDZCQUFBO0FBQUEsUUFBQSxRQUEyQixFQUEzQixFQUFDLHVCQUFELEVBQWUsbUJBQWYsQ0FBQTtBQUFBLFFBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0saUNBQU47V0FERixDQUFBLENBQUE7QUFBQSxVQVFBLFlBQUEsR0FBZSx1QkFSZixDQUFBO2lCQWNBLFFBQUEsR0FBVywwQkFmRjtRQUFBLENBQVgsQ0FEQSxDQUFBO0FBQUEsUUFzQkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixVQUFBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQW9CLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLFlBQUEsRUFBYyxZQUFkO2FBQWQsRUFEUTtVQUFBLENBQTlCLENBQUEsQ0FBQTtBQUFBLFVBRUEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTtBQUM1QixZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFBb0IsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsWUFBQSxFQUFjLElBQWQ7YUFBZCxFQURRO1VBQUEsQ0FBOUIsQ0FGQSxDQUFBO0FBQUEsVUFJQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUFvQixNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxZQUFBLEVBQWMsR0FBZDtBQUFBLGNBQW1CLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTNCO2FBQWQsRUFEK0I7VUFBQSxDQUFyRCxDQUpBLENBQUE7QUFBQSxVQU1BLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQW9CLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLFlBQUEsRUFBYyxZQUFkO2FBQWQsRUFEa0M7VUFBQSxDQUF4RCxDQU5BLENBQUE7QUFBQSxVQVFBLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQW9CLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLFlBQUEsRUFBYyxZQUFkO2FBQWQsRUFEa0M7VUFBQSxDQUF4RCxDQVJBLENBQUE7aUJBVUEsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUEsR0FBQTtBQUN0RCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFBb0IsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsWUFBQSxFQUFjLFlBQWQ7YUFBZCxFQURrQztVQUFBLENBQXhELEVBWDJCO1FBQUEsQ0FBN0IsQ0F0QkEsQ0FBQTtlQW1DQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsVUFBQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUFvQixNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxZQUFBLEVBQWMsUUFBZDthQUFkLEVBRFE7VUFBQSxDQUE5QixDQUFBLENBQUE7QUFBQSxVQUVBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQW9CLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLFlBQUEsRUFBYyxNQUFkO2FBQWQsRUFEUTtVQUFBLENBQTlCLENBRkEsQ0FBQTtBQUFBLFVBSUEsRUFBQSxDQUFHLGdEQUFILEVBQXFELFNBQUEsR0FBQTtBQUNuRCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKLENBQUEsQ0FBQTttQkFBb0IsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsWUFBQSxFQUFjLEdBQWQ7QUFBQSxjQUFtQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEzQjthQUFkLEVBRCtCO1VBQUEsQ0FBckQsQ0FKQSxDQUFBO0FBQUEsVUFNQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQSxHQUFBO0FBQ3RELFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUFvQixNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxZQUFBLEVBQWMsUUFBZDthQUFkLEVBRGtDO1VBQUEsQ0FBeEQsQ0FOQSxDQUFBO0FBQUEsVUFRQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQSxHQUFBO0FBQ3RELFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUFvQixNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxZQUFBLEVBQWMsUUFBZDthQUFkLEVBRGtDO1VBQUEsQ0FBeEQsQ0FSQSxDQUFBO2lCQVVBLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQW9CLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLFlBQUEsRUFBYyxRQUFkO2FBQWQsRUFEa0M7VUFBQSxDQUF4RCxFQVh1QjtRQUFBLENBQXpCLEVBcEMwQjtNQUFBLENBQTVCLEVBakNpQztJQUFBLENBQW5DLENBdmtCQSxDQUFBO0FBQUEsSUEwcEJBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsTUFBakIsRUFDRTtBQUFBLFVBQUEsa0dBQUEsRUFDRTtBQUFBLFlBQUEsR0FBQSxFQUFLLCtDQUFMO0FBQUEsWUFDQSxHQUFBLEVBQUssMkNBREw7V0FERjtTQURGLENBQUEsQ0FBQTtlQUtBLEdBQUEsQ0FBSTtBQUFBLFVBQUEsSUFBQSxFQUFNLDBEQUFOO1NBQUosRUFOUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFjQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7ZUFDaEIsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUEsR0FBQTtBQUM3RCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxDQUFVLEdBQVYsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsS0FBZDtXQUFaLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLEtBQWQ7V0FBWixDQUhBLENBQUE7QUFBQSxVQUlBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxZQUFkO1dBQVosQ0FKQSxDQUFBO2lCQUtBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxFQUFkO0FBQUEsWUFBa0IsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBdkM7V0FBWixFQU42RDtRQUFBLENBQS9ELEVBRGdCO01BQUEsQ0FBbEIsQ0FkQSxDQUFBO2FBc0JBLFFBQUEsQ0FBUyxHQUFULEVBQWMsU0FBQSxHQUFBO2VBQ1osRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUEsR0FBQTtBQUM3RCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxDQUFVLEdBQVYsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsT0FBZDtXQUFaLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtBQUFBLFlBQUEsWUFBQSxFQUFjLE9BQWQ7V0FBWixDQUhBLENBQUE7QUFBQSxVQUlBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7QUFBQSxZQUFBLFlBQUEsRUFBYyxnQkFBZDtXQUFaLENBSkEsQ0FBQTtpQkFLQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsWUFBQSxZQUFBLEVBQWMsNkNBQWQ7V0FBWixFQU42RDtRQUFBLENBQS9ELEVBRFk7TUFBQSxDQUFkLEVBdkJpQztJQUFBLENBQW5DLENBMXBCQSxDQUFBO0FBQUEsSUFnc0JBLFFBQUEsQ0FBUyxLQUFULEVBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsa0JBQUE7QUFBQSxNQUFDLHFCQUFzQixLQUF2QixDQUFBO0FBQUEsTUFDQSxrQkFBQSxHQUFxQixTQUFDLEtBQUQsRUFBUSxTQUFSLEVBQW1CLFlBQW5CLEdBQUE7QUFDbkIsUUFBQSxHQUFBLENBQUk7QUFBQSxVQUFBLE1BQUEsRUFBUSxLQUFSO1NBQUosQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLFNBQVAsRUFBa0I7QUFBQSxVQUFDLGNBQUEsWUFBRDtTQUFsQixFQUZtQjtNQUFBLENBRHJCLENBQUE7QUFBQSxNQUtBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUNwQixRQUFBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsY0FBQSxnREFBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLG1CQUFBLENBQW9CLElBQXBCLENBQVIsQ0FBQTtBQUFBLFVBQ0EsSUFBQSxHQUFPLG9DQURQLENBQUE7QUFBQSxVQUVBLFdBQUEsR0FBYywrQkFGZCxDQUFBO0FBQUEsVUFHQSxZQUFBLEdBQWUsT0FIZixDQUFBO0FBQUEsVUFJQSxRQUFBLEdBQVcseUJBSlgsQ0FBQTtBQUFBLFVBS0EsVUFBQSxDQUFXLFNBQUEsR0FBQTttQkFDVCxHQUFBLENBQUk7QUFBQSxjQUFDLE1BQUEsSUFBRDthQUFKLEVBRFM7VUFBQSxDQUFYLENBTEEsQ0FBQTtBQUFBLFVBUUEsRUFBQSxDQUFHLGdCQUFILEVBQXFCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFOLEVBQWMsR0FBZCxFQUFtQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQW5CLEVBQUg7VUFBQSxDQUFyQixDQVJBLENBQUE7QUFBQSxVQVNBLEVBQUEsQ0FBRyxzQkFBSCxFQUEyQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBTixFQUFjLEdBQWQsRUFBbUI7QUFBQSxjQUFDLGNBQUEsWUFBRDthQUFuQixFQUFIO1VBQUEsQ0FBM0IsQ0FUQSxDQUFBO0FBQUEsVUFVQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQU4sRUFBZSxHQUFmLEVBQW9CO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBcEIsRUFBSDtVQUFBLENBQTVCLENBVkEsQ0FBQTtBQUFBLFVBV0EsRUFBQSxDQUFHLGdCQUFILEVBQXFCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksRUFBSixDQUFOLEVBQWUsR0FBZixFQUFvQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQXBCLEVBQUg7VUFBQSxDQUFyQixDQVhBLENBQUE7QUFBQSxVQVlBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBTixFQUFlLEdBQWYsRUFBb0I7QUFBQSxjQUFDLGNBQUEsWUFBRDthQUFwQixFQUFIO1VBQUEsQ0FBNUIsQ0FaQSxDQUFBO0FBQUEsVUFhQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQU4sRUFBZSxHQUFmLEVBQW9CO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBcEIsRUFBSDtVQUFBLENBQTdCLENBYkEsQ0FBQTtBQUFBLFVBY0EsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksRUFBSixDQUFOLEVBQWUsR0FBZixFQUFvQjtBQUFBLGNBQUMsWUFBQSxFQUFjLFFBQWY7YUFBcEIsRUFBSDtVQUFBLENBQTVCLENBZEEsQ0FBQTtBQUFBLFVBaUJBLEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBTixFQUFjLEdBQWQsRUFBbUI7QUFBQSxjQUFDLElBQUEsRUFBTSxXQUFQO2FBQW5CLEVBQUg7VUFBQSxDQUFyQixDQWpCQSxDQUFBO0FBQUEsVUFrQkEsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFOLEVBQWMsR0FBZCxFQUFtQjtBQUFBLGNBQUMsSUFBQSxFQUFNLFdBQVA7YUFBbkIsRUFBSDtVQUFBLENBQTNCLENBbEJBLENBQUE7QUFBQSxVQW1CQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQU4sRUFBZSxHQUFmLEVBQW9CO0FBQUEsY0FBQyxJQUFBLEVBQU0sV0FBUDthQUFwQixFQUFIO1VBQUEsQ0FBN0IsQ0FuQkEsQ0FBQTtBQUFBLFVBb0JBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBTixFQUFlLEdBQWYsRUFBb0I7QUFBQSxjQUFDLElBQUEsRUFBTSxXQUFQO2FBQXBCLEVBQUg7VUFBQSxDQUF0QixDQXBCQSxDQUFBO0FBQUEsVUFxQkEsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksRUFBSixDQUFOLEVBQWUsR0FBZixFQUFvQjtBQUFBLGNBQUMsSUFBQSxFQUFNLFdBQVA7YUFBcEIsRUFBSDtVQUFBLENBQTdCLENBckJBLENBQUE7QUFBQSxVQXNCQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQU4sRUFBZSxHQUFmLEVBQW9CO0FBQUEsY0FBQyxJQUFBLEVBQU0sV0FBUDthQUFwQixFQUFIO1VBQUEsQ0FBOUIsQ0F0QkEsQ0FBQTtpQkF1QkEsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksRUFBSixDQUFOLEVBQWUsR0FBZixFQUFvQjtBQUFBLGNBQUMsSUFBQSxFQUFNLGFBQVA7YUFBcEIsRUFBSDtVQUFBLENBQTdCLEVBeEJpQztRQUFBLENBQW5DLENBQUEsQ0FBQTtlQTBCQSxRQUFBLENBQVMsd0JBQVQsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGdCQUFBLFlBQUE7QUFBQSxZQUFBLFlBQUEsR0FBZSxnT0FBZixDQUFBO21CQWtCQSxHQUFBLENBQUk7QUFBQSxjQUFBLElBQUEsRUFBTSxZQUFOO2FBQUosRUFuQlM7VUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFVBb0JBLEVBQUEsQ0FBRyxvQ0FBSCxFQUF5QyxTQUFBLEdBQUE7QUFDdkMsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7QUFBQSxZQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLFlBQUEsRUFBYywwQkFBZDthQUFkLENBREEsQ0FBQTtBQUFBLFlBS0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLGNBQUEsWUFBQSxFQUFjLG1EQUFkO2FBQWIsQ0FMQSxDQUFBO0FBQUEsWUFXQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsY0FBQSxZQUFBLEVBQWMsd0VBQWQ7YUFBYixDQVhBLENBQUE7QUFBQSxZQW1CQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsY0FBQSxZQUFBLEVBQWMseUZBQWQ7YUFBYixDQW5CQSxDQUFBO21CQTRCQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsY0FBQSxZQUFBLEVBQWMsb0xBQWQ7YUFBYixFQTdCdUM7VUFBQSxDQUF6QyxDQXBCQSxDQUFBO2lCQWdFQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUosQ0FBQSxDQUFBO0FBQUEsWUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxJQUFBLEVBQU0sd01BQU47YUFBZCxDQURBLENBQUE7QUFBQSxZQWlCQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsY0FBQSxJQUFBLEVBQU0seUlBQU47YUFBYixDQWpCQSxDQUFBO21CQTJCQSxNQUFBLENBQU8sR0FBUCxFQUFZO0FBQUEsY0FBQSxJQUFBLEVBQU0sOENBQU47YUFBWixFQTVCbUM7VUFBQSxDQUFyQyxFQWpFaUM7UUFBQSxDQUFuQyxFQTNCb0I7TUFBQSxDQUF0QixDQUxBLENBQUE7YUFrSUEsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQSxHQUFBO2VBQ2hCLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsY0FBQSw0Q0FBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLG1CQUFBLENBQW9CLElBQXBCLENBQVIsQ0FBQTtBQUFBLFVBQ0EsSUFBQSxHQUFPLG9DQURQLENBQUE7QUFBQSxVQUVBLFdBQUEsR0FBYyxnQkFGZCxDQUFBO0FBQUEsVUFHQSxZQUFBLEdBQWUsc0JBSGYsQ0FBQTtBQUFBLFVBSUEsSUFBQSxHQUFPLG9DQUpQLENBQUE7QUFBQSxVQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUFJO0FBQUEsY0FBQyxNQUFBLElBQUQ7YUFBSixFQURTO1VBQUEsQ0FBWCxDQUxBLENBQUE7QUFBQSxVQVFBLEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBTixFQUFjLEdBQWQsRUFBbUI7QUFBQSxjQUFDLGNBQUEsWUFBRDthQUFuQixFQUFIO1VBQUEsQ0FBckIsQ0FSQSxDQUFBO0FBQUEsVUFTQSxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQU4sRUFBYyxHQUFkLEVBQW1CO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBbkIsRUFBSDtVQUFBLENBQTNCLENBVEEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksRUFBSixDQUFOLEVBQWUsR0FBZixFQUFvQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQXBCLEVBQUg7VUFBQSxDQUE1QixDQVZBLENBQUE7QUFBQSxVQVdBLEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBTixFQUFlLEdBQWYsRUFBb0I7QUFBQSxjQUFDLGNBQUEsWUFBRDthQUFwQixFQUFIO1VBQUEsQ0FBckIsQ0FYQSxDQUFBO0FBQUEsVUFZQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQU4sRUFBZSxHQUFmLEVBQW9CO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBcEIsRUFBSDtVQUFBLENBQTVCLENBWkEsQ0FBQTtBQUFBLFVBYUEsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksRUFBSixDQUFOLEVBQWUsR0FBZixFQUFvQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQXBCLEVBQUg7VUFBQSxDQUE3QixDQWJBLENBQUE7QUFBQSxVQWNBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBTixFQUFlLEdBQWYsRUFBb0I7QUFBQSxjQUFDLFlBQUEsRUFBYyxJQUFmO2FBQXBCLEVBQUg7VUFBQSxDQUE1QixDQWRBLENBQUE7QUFBQSxVQWlCQSxFQUFBLENBQUcsZ0JBQUgsRUFBcUIsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQU4sRUFBYyxHQUFkLEVBQW1CO0FBQUEsY0FBQyxJQUFBLEVBQU0sV0FBUDthQUFuQixFQUFIO1VBQUEsQ0FBckIsQ0FqQkEsQ0FBQTtBQUFBLFVBa0JBLEVBQUEsQ0FBRyxzQkFBSCxFQUEyQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBTixFQUFjLEdBQWQsRUFBbUI7QUFBQSxjQUFDLElBQUEsRUFBTSxXQUFQO2FBQW5CLEVBQUg7VUFBQSxDQUEzQixDQWxCQSxDQUFBO0FBQUEsVUFtQkEsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksRUFBSixDQUFOLEVBQWUsR0FBZixFQUFvQjtBQUFBLGNBQUMsSUFBQSxFQUFNLFdBQVA7YUFBcEIsRUFBSDtVQUFBLENBQTdCLENBbkJBLENBQUE7QUFBQSxVQW9CQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQU4sRUFBZSxHQUFmLEVBQW9CO0FBQUEsY0FBQyxJQUFBLEVBQU0sV0FBUDthQUFwQixFQUFIO1VBQUEsQ0FBdEIsQ0FwQkEsQ0FBQTtBQUFBLFVBcUJBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBTixFQUFlLEdBQWYsRUFBb0I7QUFBQSxjQUFDLElBQUEsRUFBTSxXQUFQO2FBQXBCLEVBQUg7VUFBQSxDQUE3QixDQXJCQSxDQUFBO0FBQUEsVUFzQkEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksRUFBSixDQUFOLEVBQWUsR0FBZixFQUFvQjtBQUFBLGNBQUMsSUFBQSxFQUFNLFdBQVA7YUFBcEIsRUFBSDtVQUFBLENBQTlCLENBdEJBLENBQUE7aUJBdUJBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBTixFQUFlLEdBQWYsRUFBb0I7QUFBQSxjQUFDLElBQUEsRUFBTSxFQUFQO2FBQXBCLEVBQUg7VUFBQSxDQUE3QixFQXhCNkI7UUFBQSxDQUEvQixFQURnQjtNQUFBLENBQWxCLEVBbkljO0lBQUEsQ0FBaEIsQ0Foc0JBLENBQUE7QUFBQSxJQTgxQkEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLE1BQUEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtBQUMvQixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0scUNBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUtBLEVBQUEsQ0FBRyxvRUFBSCxFQUF5RSxTQUFBLEdBQUE7aUJBQ3ZFLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsRUFEdUU7UUFBQSxDQUF6RSxDQUxBLENBQUE7ZUFVQSxFQUFBLENBQUcsa0ZBQUgsRUFBdUYsU0FBQSxHQUFBO0FBQ3JGLFVBQUEsR0FBQSxDQUNFO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBREYsQ0FBQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxpQ0FBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FEUjtXQURGLEVBSHFGO1FBQUEsQ0FBdkYsRUFYK0I7TUFBQSxDQUFqQyxDQUFBLENBQUE7YUFpQkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0scUNBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxRQUtBLEVBQUEsQ0FBRywrRUFBSCxFQUFvRixTQUFBLEdBQUE7aUJBQ2xGLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxFQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO0FBQUEsWUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGLEVBRGtGO1FBQUEsQ0FBcEYsQ0FMQSxDQUFBO0FBQUEsUUFXQSxFQUFBLENBQUcsNkZBQUgsRUFBa0csU0FBQSxHQUFBO0FBQ2hHLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSwrQkFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FEUjtBQUFBLFlBRUEsSUFBQSxFQUFNLFFBRk47V0FERixFQUZnRztRQUFBLENBQWxHLENBWEEsQ0FBQTtBQUFBLFFBaUJBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsY0FBQSxpREFBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLG1CQUFBLENBQW9CLElBQXBCLENBQVIsQ0FBQTtBQUFBLFVBQ0EsSUFBQSxHQUFPLE9BRFAsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUFZLE1BRlosQ0FBQTtBQUFBLFVBR0EsWUFBQSxHQUFlLEdBSGYsQ0FBQTtBQUFBLFVBSUEsSUFBQSxHQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FKUCxDQUFBO0FBQUEsVUFLQSxLQUFBLEdBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUxSLENBQUE7QUFBQSxVQU1BLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQ1QsR0FBQSxDQUFJO0FBQUEsY0FBQyxNQUFBLElBQUQ7YUFBSixFQURTO1VBQUEsQ0FBWCxDQU5BLENBQUE7QUFBQSxVQVFBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sSUFBTixFQUFZLEdBQVosRUFBaUI7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBUkEsQ0FBQTtBQUFBLFVBU0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxjQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjthQUFsQixFQUFIO1VBQUEsQ0FBcEIsQ0FUQSxDQUFBO0FBQUEsVUFVQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBakIsRUFBSDtVQUFBLENBQXBCLENBVkEsQ0FBQTtpQkFXQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBQWtCO0FBQUEsY0FBQyxjQUFBLFlBQUQ7YUFBbEIsRUFBSDtVQUFBLENBQXBCLEVBWnFDO1FBQUEsQ0FBdkMsQ0FqQkEsQ0FBQTtlQThCQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLGNBQUEsaURBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxtQkFBQSxDQUFvQixJQUFwQixDQUFSLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxPQURQLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBWSxJQUZaLENBQUE7QUFBQSxVQUdBLFlBQUEsR0FBZSxLQUhmLENBQUE7QUFBQSxVQUlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLENBSlAsQ0FBQTtBQUFBLFVBS0EsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FMUixDQUFBO0FBQUEsVUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FBSTtBQUFBLGNBQUMsTUFBQSxJQUFEO2FBQUosRUFEUztVQUFBLENBQVgsQ0FOQSxDQUFBO0FBQUEsVUFRQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVJBLENBQUE7QUFBQSxVQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBbEIsRUFBSDtVQUFBLENBQXBCLENBVEEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVZBLENBQUE7aUJBV0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixFQVpxQztRQUFBLENBQXZDLEVBL0IyQjtNQUFBLENBQTdCLEVBbEJ3QjtJQUFBLENBQTFCLENBOTFCQSxDQUFBO0FBQUEsSUE0NUJBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixNQUFBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLHFDQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFLQSxFQUFBLENBQUcsb0VBQUgsRUFBeUUsU0FBQSxHQUFBO2lCQUN2RSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtXQURGLEVBRHVFO1FBQUEsQ0FBekUsQ0FMQSxDQUFBO0FBQUEsUUFVQSxFQUFBLENBQUcsa0ZBQUgsRUFBdUYsU0FBQSxHQUFBO0FBQ3JGLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSxpQ0FBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FEUjtXQURGLEVBRnFGO1FBQUEsQ0FBdkYsQ0FWQSxDQUFBO0FBQUEsUUFnQkEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUEsR0FBQTtBQUM3QyxVQUFBLEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLCtCQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsQ0FBQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLFlBQUEsRUFBYyx1QkFBZDtXQUFkLEVBSjZDO1FBQUEsQ0FBL0MsQ0FoQkEsQ0FBQTtBQUFBLFFBc0JBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7QUFDN0IsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxpQ0FBTjtBQUFBLFlBQXlDLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQWpEO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLFlBQUEsRUFBYyx5QkFBZDtXQUFkLEVBRjZCO1FBQUEsQ0FBL0IsQ0F0QkEsQ0FBQTtBQUFBLFFBMEJBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLElBQUEsRUFBTSxtQ0FBTjtBQUFBLFlBQTJDLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQW5EO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLFlBQUEsRUFBYyxjQUFkO1dBQWQsRUFGZ0M7UUFBQSxDQUFsQyxDQTFCQSxDQUFBO0FBQUEsUUE4QkEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtBQUM3QixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLGlDQUFOO0FBQUEsWUFBeUMsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakQ7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsWUFBQSxFQUFjLHlCQUFkO1dBQWQsRUFGNkI7UUFBQSxDQUEvQixDQTlCQSxDQUFBO0FBQUEsUUFrQ0EsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtBQUM3QixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsSUFBQSxFQUFNLG9DQUFOO0FBQUEsWUFBNEMsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBcEQ7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsWUFBQSxFQUFjLDRCQUFkO1dBQWQsRUFGNkI7UUFBQSxDQUEvQixDQWxDQSxDQUFBO0FBQUEsUUFzQ0EsRUFBQSxDQUFHLDZCQUFILEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxVQUFBLEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLDJCQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVQsQ0FEUjtXQURGLENBQUEsQ0FBQTtpQkFHQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxtQkFBQSxFQUFxQixDQUNuQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVixDQURtQixFQUVuQixDQUFDLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBRCxFQUFVLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBVixDQUZtQixDQUFyQjtXQURGLEVBSmdDO1FBQUEsQ0FBbEMsQ0F0Q0EsQ0FBQTtlQStDQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLGNBQUEsaURBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxtQkFBQSxDQUFvQixJQUFwQixDQUFSLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxPQURQLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBWSxNQUZaLENBQUE7QUFBQSxVQUdBLFlBQUEsR0FBZSxHQUhmLENBQUE7QUFBQSxVQUlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLENBSlAsQ0FBQTtBQUFBLFVBS0EsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FMUixDQUFBO0FBQUEsVUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FBSTtBQUFBLGNBQUMsTUFBQSxJQUFEO2FBQUosRUFEUztVQUFBLENBQVgsQ0FOQSxDQUFBO0FBQUEsVUFRQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVJBLENBQUE7QUFBQSxVQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBbEIsRUFBSDtVQUFBLENBQXBCLENBVEEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVZBLENBQUE7aUJBV0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixFQVpxQztRQUFBLENBQXZDLEVBaEQ0QjtNQUFBLENBQTlCLENBQUEsQ0FBQTthQThEQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLHFDQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFLQSxFQUFBLENBQUcsMkVBQUgsRUFBZ0YsU0FBQSxHQUFBO2lCQUM5RSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sRUFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtBQUFBLFlBRUEsSUFBQSxFQUFNLFFBRk47V0FERixFQUQ4RTtRQUFBLENBQWhGLENBTEEsQ0FBQTtBQUFBLFFBV0EsRUFBQSxDQUFHLHlGQUFILEVBQThGLFNBQUEsR0FBQTtBQUM1RixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sK0JBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBRFI7V0FERixFQUY0RjtRQUFBLENBQTlGLENBWEEsQ0FBQTtlQWdCQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO0FBQ3JDLGNBQUEsaURBQUE7QUFBQSxVQUFBLEtBQUEsR0FBUSxtQkFBQSxDQUFvQixJQUFwQixDQUFSLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxPQURQLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBWSxJQUZaLENBQUE7QUFBQSxVQUdBLFlBQUEsR0FBZSxLQUhmLENBQUE7QUFBQSxVQUlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLENBSlAsQ0FBQTtBQUFBLFVBS0EsS0FBQSxHQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FMUixDQUFBO0FBQUEsVUFNQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULEdBQUEsQ0FBSTtBQUFBLGNBQUMsTUFBQSxJQUFEO2FBQUosRUFEUztVQUFBLENBQVgsQ0FOQSxDQUFBO0FBQUEsVUFRQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBLEdBQUE7bUJBQUcsS0FBQSxDQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCO0FBQUEsY0FBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGNBQWlCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVJBLENBQUE7QUFBQSxVQVNBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUEsR0FBQTttQkFBRyxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFBa0I7QUFBQSxjQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsY0FBaUIsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekI7YUFBbEIsRUFBSDtVQUFBLENBQXBCLENBVEEsQ0FBQTtBQUFBLFVBVUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxJQUFOLEVBQVksR0FBWixFQUFpQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWpCLEVBQUg7VUFBQSxDQUFwQixDQVZBLENBQUE7aUJBV0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO21CQUFHLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQUFrQjtBQUFBLGNBQUMsY0FBQSxZQUFEO2FBQWxCLEVBQUg7VUFBQSxDQUFwQixFQVpxQztRQUFBLENBQXZDLEVBakJ3QjtNQUFBLENBQTFCLEVBL0RzQjtJQUFBLENBQXhCLENBNTVCQSxDQUFBO0FBQUEsSUEwL0JBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUNwQixNQUFBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLDZDQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFLQSxFQUFBLENBQUcseUVBQUgsRUFBOEUsU0FBQSxHQUFBO2lCQUM1RSxNQUFBLENBQU8sS0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sNkNBQU47QUFBQSxZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7QUFBQSxZQUVBLFFBQUEsRUFBVTtBQUFBLGNBQUEsR0FBQSxFQUFLO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLHlDQUFOO2VBQUw7YUFGVjtXQURGLEVBRDRFO1FBQUEsQ0FBOUUsQ0FMQSxDQUFBO2VBV0EsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUEsR0FBQTtpQkFDeEQsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBckI7V0FERixFQUR3RDtRQUFBLENBQTFELEVBWjBCO01BQUEsQ0FBNUIsQ0FBQSxDQUFBO2FBZUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxHQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSwyREFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtXQURGLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBS0EsRUFBQSxDQUFHLHlFQUFILEVBQThFLFNBQUEsR0FBQTtpQkFDNUUsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLDJEQUFOO0FBQUEsWUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO0FBQUEsWUFFQSxRQUFBLEVBQVU7QUFBQSxjQUFBLEdBQUEsRUFBSztBQUFBLGdCQUFBLElBQUEsRUFBTSwyQ0FBTjtlQUFMO2FBRlY7V0FERixFQUQ0RTtRQUFBLENBQTlFLENBTEEsQ0FBQTtlQVdBLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBLEdBQUE7aUJBQ3hELE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBQXJCO1dBREYsRUFEd0Q7UUFBQSxDQUExRCxFQVpzQjtNQUFBLENBQXhCLEVBaEJvQjtJQUFBLENBQXRCLENBMS9CQSxDQUFBO0FBQUEsSUEwaENBLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUEsR0FBQTtBQUNsQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qix3QkFBOUIsRUFEYztRQUFBLENBQWhCLENBQUEsQ0FBQTtlQUVBLFdBQUEsQ0FBWSxlQUFaLEVBQTZCLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUMzQixVQUFDLGVBQUEsTUFBRCxFQUFTLHNCQUFBLGFBQVQsQ0FBQTtpQkFDQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBRkE7UUFBQSxDQUE3QixFQUhTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQU1BLFNBQUEsQ0FBVSxTQUFBLEdBQUE7ZUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQWdDLHdCQUFoQyxFQURRO01BQUEsQ0FBVixDQU5BLENBQUE7QUFBQSxNQVNBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsWUFBQSxFQUFjLDJCQUFkO0FBQUEsWUFDQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQURyQjtXQURGLEVBRmdDO1FBQUEsQ0FBbEMsQ0FBQSxDQUFBO0FBQUEsUUFNQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLFlBQUEsRUFBYyxzQkFBZDtBQUFBLFlBQ0EsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FEckI7V0FERixFQUY0QjtRQUFBLENBQTlCLENBTkEsQ0FBQTtlQVlBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsWUFBQSxFQUFjLHVCQUFkO0FBQUEsWUFDQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQURyQjtXQURGLEVBRmdDO1FBQUEsQ0FBbEMsRUFid0I7TUFBQSxDQUExQixDQVRBLENBQUE7YUEyQkEsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO2VBQ3BCLEVBQUEsQ0FBRywyQ0FBSCxFQUFnRCxTQUFBLEdBQUE7QUFDOUMsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtBQUFBLFlBQUEsWUFBQSxFQUFjLHdFQUFkO0FBQUEsWUFVQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQVZyQjtXQURGLEVBRjhDO1FBQUEsQ0FBaEQsRUFEb0I7TUFBQSxDQUF0QixFQTVCa0I7SUFBQSxDQUFwQixDQTFoQ0EsQ0FBQTtBQUFBLElBc2tDQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCLEVBRGM7UUFBQSxDQUFoQixDQUFBLENBQUE7ZUFFQSxXQUFBLENBQVksZUFBWixFQUE2QixTQUFDLFFBQUQsRUFBVyxHQUFYLEdBQUE7QUFDM0IsVUFBQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFBVCxDQUFBO2lCQUNDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFGQTtRQUFBLENBQTdCLEVBSFM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BTUEsU0FBQSxDQUFVLFNBQUEsR0FBQTtlQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWQsQ0FBZ0Msd0JBQWhDLEVBRFE7TUFBQSxDQUFWLENBTkEsQ0FBQTtBQUFBLE1BU0EsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUEsR0FBQTtlQUM1QixFQUFBLENBQUcsdUNBQUgsRUFBNEMsU0FBQSxHQUFBO0FBQzFDLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFELEVBQVUsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFWLENBQXJCO1dBREYsRUFGMEM7UUFBQSxDQUE1QyxFQUQ0QjtNQUFBLENBQTlCLENBVEEsQ0FBQTthQWNBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtlQUN4QixFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFELEVBQVUsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFWLENBQXJCO1dBREYsRUFGa0Q7UUFBQSxDQUFwRCxFQUR3QjtNQUFBLENBQTFCLEVBZnNCO0lBQUEsQ0FBeEIsQ0F0a0NBLENBQUE7QUFBQSxJQTJsQ0EsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSxZQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsU0FBQyxRQUFELEVBQVcsTUFBWCxHQUFBO2VBQ2IsQ0FBQyxDQUFDLFFBQUQsRUFBVyxDQUFYLENBQUQsRUFBZ0IsQ0FBQyxNQUFBLEdBQVMsQ0FBVixFQUFhLENBQWIsQ0FBaEIsRUFEYTtNQUFBLENBQWYsQ0FBQTtBQUFBLE1BR0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixFQURjO1FBQUEsQ0FBaEIsQ0FBQSxDQUFBO2VBRUEsV0FBQSxDQUFZLGVBQVosRUFBNkIsU0FBQyxRQUFELEVBQVcsR0FBWCxHQUFBO0FBQzNCLFVBQUMsa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBQVQsQ0FBQTtpQkFDQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBRkE7UUFBQSxDQUE3QixFQUhTO01BQUEsQ0FBWCxDQUhBLENBQUE7QUFBQSxNQVNBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7ZUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQWdDLHdCQUFoQyxFQURRO01BQUEsQ0FBVixDQVRBLENBQUE7QUFBQSxNQVlBLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUNyQixRQUFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsbUJBQUEsRUFBcUIsWUFBQSxDQUFhLEVBQWIsRUFBaUIsRUFBakIsQ0FBckI7V0FBZCxFQUYrQjtRQUFBLENBQWpDLENBQUEsQ0FBQTtBQUFBLFFBSUEsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUEsR0FBQTtBQUMvQixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxtQkFBQSxFQUFxQixZQUFBLENBQWEsRUFBYixFQUFpQixFQUFqQixDQUFyQjtXQUFkLEVBRitCO1FBQUEsQ0FBakMsQ0FKQSxDQUFBO0FBQUEsUUFRQSxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFSO1dBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxTQUFBLENBQVUsR0FBVixDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxFQUFiLEVBQWlCLEVBQWpCLENBQXJCO1dBQWIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsWUFBQSxtQkFBQSxFQUFxQixZQUFBLENBQWEsRUFBYixFQUFpQixFQUFqQixDQUFyQjtXQUFiLENBSEEsQ0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsbUJBQUEsRUFBcUIsWUFBQSxDQUFhLEVBQWIsRUFBaUIsRUFBakIsQ0FBckI7V0FBYixDQUpBLENBQUE7aUJBS0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsbUJBQUEsRUFBcUIsWUFBQSxDQUFhLENBQWIsRUFBZ0IsRUFBaEIsQ0FBckI7V0FBYixFQU55QjtRQUFBLENBQTNCLENBUkEsQ0FBQTtBQUFBLFFBZ0JBLFFBQUEsQ0FBUyxnREFBVCxFQUEyRCxTQUFBLEdBQUE7aUJBQ3pELEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVI7YUFBSixDQUFBLENBQUE7bUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsbUJBQUEsRUFBcUIsWUFBQSxDQUFhLEVBQWIsRUFBaUIsRUFBakIsQ0FBckI7YUFBZCxFQUY0QjtVQUFBLENBQTlCLEVBRHlEO1FBQUEsQ0FBM0QsQ0FoQkEsQ0FBQTtBQUFBLFFBcUJBLFFBQUEsQ0FBUyw4Q0FBVCxFQUF5RCxTQUFBLEdBQUE7aUJBQ3ZELEVBQUEsQ0FBRyw0REFBSCxFQUFpRSxTQUFBLEdBQUE7QUFDL0QsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVI7YUFBSixDQUFBLENBQUE7QUFBQSxZQUNBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxjQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxFQUFiLEVBQWlCLEVBQWpCLENBQXJCO2FBQWIsQ0FEQSxDQUFBO21CQUVBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxjQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxFQUFiLEVBQWlCLEVBQWpCLENBQXJCO2FBQWIsRUFIK0Q7VUFBQSxDQUFqRSxFQUR1RDtRQUFBLENBQXpELENBckJBLENBQUE7ZUEyQkEsUUFBQSxDQUFTLHVEQUFULEVBQWtFLFNBQUEsR0FBQTtBQUNoRSxVQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxZQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO3FCQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixxQkFBOUIsRUFEYztZQUFBLENBQWhCLENBQUEsQ0FBQTttQkFFQSxXQUFBLENBQVksV0FBWixFQUF5QixTQUFDLEtBQUQsRUFBUSxTQUFSLEdBQUE7QUFDdkIsY0FBQyxlQUFBLE1BQUQsRUFBUyxzQkFBQSxhQUFULENBQUE7cUJBQ0MsZ0JBQUEsR0FBRCxFQUFNLG1CQUFBLE1BQU4sRUFBYyxzQkFBQSxTQUFkLEVBQTJCLFVBRko7WUFBQSxDQUF6QixFQUhTO1VBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxVQU1BLFNBQUEsQ0FBVSxTQUFBLEdBQUE7bUJBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBZCxDQUFnQyxxQkFBaEMsRUFEUTtVQUFBLENBQVYsQ0FOQSxDQUFBO2lCQVNBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsWUFBQSxHQUFBLENBQUk7QUFBQSxjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSixDQUFBLENBQUE7QUFBQSxZQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxDQUFiLEVBQWdCLENBQWhCLENBQXJCO2FBQWQsQ0FEQSxDQUFBO21CQUVBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxjQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxDQUFiLEVBQWdCLENBQWhCLENBQXJCO2FBQWIsRUFIK0I7VUFBQSxDQUFqQyxFQVZnRTtRQUFBLENBQWxFLEVBNUJxQjtNQUFBLENBQXZCLENBWkEsQ0FBQTthQXVEQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsUUFBQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsR0FBQSxDQUFJO0FBQUEsWUFBQSxNQUFBLEVBQVEsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFSO1dBQUosQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxDQUFiLEVBQWdCLEVBQWhCLENBQXJCO1dBQWQsRUFGMEI7UUFBQSxDQUE1QixDQUFBLENBQUE7QUFBQSxRQUlBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsVUFBQSxHQUFBLENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVI7V0FBSixDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsbUJBQUEsRUFBcUIsWUFBQSxDQUFhLEVBQWIsRUFBaUIsRUFBakIsQ0FBckI7V0FBZCxFQUYwQjtRQUFBLENBQTVCLENBSkEsQ0FBQTtBQUFBLFFBUUEsRUFBQSxDQUFHLHNCQUFILEVBQTJCLFNBQUEsR0FBQTtBQUN6QixVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtXQUFKLENBQUEsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxDQUFVLEdBQVYsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sSUFBUCxFQUFhO0FBQUEsWUFBQSxtQkFBQSxFQUFxQixZQUFBLENBQWEsRUFBYixFQUFpQixFQUFqQixDQUFyQjtXQUFiLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLFlBQUEsbUJBQUEsRUFBcUIsWUFBQSxDQUFhLEVBQWIsRUFBaUIsRUFBakIsQ0FBckI7V0FBYixDQUhBLENBQUE7QUFBQSxVQUlBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxDQUFiLEVBQWdCLEVBQWhCLENBQXJCO1dBQWIsQ0FKQSxDQUFBO2lCQUtBLE1BQUEsQ0FBTyxJQUFQLEVBQWE7QUFBQSxZQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxDQUFiLEVBQWdCLEVBQWhCLENBQXJCO1dBQWIsRUFOeUI7UUFBQSxDQUEzQixDQVJBLENBQUE7QUFBQSxRQWdCQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO2lCQUN6RCxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFlBQUEsR0FBQSxDQUFJO0FBQUEsY0FBQSxNQUFBLEVBQVEsQ0FBQyxFQUFELEVBQUssQ0FBTCxDQUFSO2FBQUosQ0FBQSxDQUFBO21CQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLG1CQUFBLEVBQXFCLFlBQUEsQ0FBYSxFQUFiLEVBQWlCLEVBQWpCLENBQXJCO2FBQWQsRUFGNEI7VUFBQSxDQUE5QixFQUR5RDtRQUFBLENBQTNELENBaEJBLENBQUE7ZUFxQkEsUUFBQSxDQUFTLDhDQUFULEVBQXlELFNBQUEsR0FBQTtpQkFDdkQsRUFBQSxDQUFHLDREQUFILEVBQWlFLFNBQUEsR0FBQTtBQUMvRCxZQUFBLEdBQUEsQ0FBSTtBQUFBLGNBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjthQUFKLENBQUEsQ0FBQTtBQUFBLFlBQ0EsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLGNBQUEsbUJBQUEsRUFBcUIsWUFBQSxDQUFhLEVBQWIsRUFBaUIsRUFBakIsQ0FBckI7YUFBYixDQURBLENBQUE7bUJBRUEsTUFBQSxDQUFPLElBQVAsRUFBYTtBQUFBLGNBQUEsbUJBQUEsRUFBcUIsWUFBQSxDQUFhLEVBQWIsRUFBaUIsRUFBakIsQ0FBckI7YUFBYixFQUgrRDtVQUFBLENBQWpFLEVBRHVEO1FBQUEsQ0FBekQsRUF0QmlCO01BQUEsQ0FBbkIsRUF4RGU7SUFBQSxDQUFqQixDQTNsQ0EsQ0FBQTtBQUFBLElBZ3JDQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsTUFBQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsWUFBQSxXQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sd0JBQVAsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLGVBRFIsQ0FBQTtBQUFBLFFBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7bUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLElBQTlCLEVBRGM7VUFBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxVQUdBLEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLG1FQUFOO0FBQUEsWUFVQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQVZSO1dBREYsQ0FIQSxDQUFBO2lCQWdCQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsZ0JBQUEsT0FBQTtBQUFBLFlBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsS0FBbEMsQ0FBVixDQUFBO21CQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE9BQWxCLEVBRkc7VUFBQSxDQUFMLEVBakJTO1FBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxRQXNCQSxTQUFBLENBQVUsU0FBQSxHQUFBO2lCQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWQsQ0FBZ0MsSUFBaEMsRUFEUTtRQUFBLENBQVYsQ0F0QkEsQ0FBQTtBQUFBLFFBeUJBLFFBQUEsQ0FBUywyQkFBVCxFQUFzQyxTQUFBLEdBQUE7aUJBQ3BDLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7bUJBQzVCLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBQXJCO2FBQWQsRUFENEI7VUFBQSxDQUE5QixFQURvQztRQUFBLENBQXRDLENBekJBLENBQUE7ZUE2QkEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtpQkFDaEMsRUFBQSxDQUFHLGlCQUFILEVBQXNCLFNBQUEsR0FBQTttQkFDcEIsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBckI7YUFBZCxFQURvQjtVQUFBLENBQXRCLEVBRGdDO1FBQUEsQ0FBbEMsRUE5QmlCO01BQUEsQ0FBbkIsQ0FBQSxDQUFBO0FBQUEsTUFrQ0EsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsWUFBQSxXQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sZUFBUCxDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsYUFEUixDQUFBO0FBQUEsUUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTttQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsSUFBOUIsRUFEYztVQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLFVBRUEsR0FBQSxDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sdUVBQU47QUFBQSxZQVdBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBWFI7V0FERixDQUZBLENBQUE7aUJBZUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGdCQUFBLE9BQUE7QUFBQSxZQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLEtBQWxDLENBQVYsQ0FBQTttQkFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixPQUFsQixFQUZHO1VBQUEsQ0FBTCxFQWhCUztRQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsUUFxQkEsU0FBQSxDQUFVLFNBQUEsR0FBQTtpQkFDUixJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQWdDLElBQWhDLEVBRFE7UUFBQSxDQUFWLENBckJBLENBQUE7QUFBQSxRQXdCQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO2lCQUNsQyxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO21CQUM1QixNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUFyQjthQUFkLEVBRDRCO1VBQUEsQ0FBOUIsRUFEa0M7UUFBQSxDQUFwQyxDQXhCQSxDQUFBO2VBMkJBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7aUJBQzlCLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBLEdBQUE7bUJBQ3BCLE1BQUEsQ0FBTyxLQUFQLEVBQWM7QUFBQSxjQUFBLG1CQUFBLEVBQXFCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBQXJCO2FBQWQsRUFEb0I7VUFBQSxDQUF0QixFQUQ4QjtRQUFBLENBQWhDLEVBNUJlO01BQUEsQ0FBakIsQ0FsQ0EsQ0FBQTthQWtFQSxRQUFBLENBQVMsSUFBVCxFQUFlLFNBQUEsR0FBQTtBQUNiLFlBQUEsV0FBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLGFBQVAsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLFdBRFIsQ0FBQTtBQUFBLFFBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7bUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLElBQTlCLEVBRGM7VUFBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxVQUVBLEdBQUEsQ0FDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLDhFQUFOO0FBQUEsWUFXQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQVhSO1dBREYsQ0FGQSxDQUFBO2lCQWVBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxnQkFBQSxPQUFBO0FBQUEsWUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyxLQUFsQyxDQUFWLENBQUE7bUJBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsT0FBbEIsRUFGRztVQUFBLENBQUwsRUFoQlM7UUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLFFBcUJBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7aUJBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBZCxDQUFnQyxJQUFoQyxFQURRO1FBQUEsQ0FBVixDQXJCQSxDQUFBO0FBQUEsUUF3QkEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtpQkFDaEMsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUEsR0FBQTttQkFDNUIsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLGNBQUEsbUJBQUEsRUFBcUIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBckI7YUFBZCxFQUQ0QjtVQUFBLENBQTlCLEVBRGdDO1FBQUEsQ0FBbEMsQ0F4QkEsQ0FBQTtlQTRCQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO2lCQUM1QixFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQSxHQUFBO21CQUNwQixNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsY0FBQSxtQkFBQSxFQUFxQixDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQUFyQjthQUFkLEVBRG9CO1VBQUEsQ0FBdEIsRUFENEI7UUFBQSxDQUE5QixFQTdCYTtNQUFBLENBQWYsRUFuRW1CO0lBQUEsQ0FBckIsQ0FockNBLENBQUE7QUFBQSxJQW94Q0EsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEdBQUEsQ0FDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLDZCQUFOO1NBREYsRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFRQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFFBQUEsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUEsR0FBQTtBQUN2RCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxZQUFBLEVBQWMsU0FBZDtXQUFkLEVBRnVEO1FBQUEsQ0FBekQsQ0FBQSxDQUFBO2VBR0EsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxZQUFBLEVBQWMsWUFBZDtXQUFkLEVBRmtDO1FBQUEsQ0FBcEMsRUFKNkI7TUFBQSxDQUEvQixDQVJBLENBQUE7YUFlQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFFBQUEsRUFBQSxDQUFHLGtFQUFILEVBQXVFLFNBQUEsR0FBQTtBQUNyRSxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxZQUFBLEVBQWMsU0FBZDtXQUFkLEVBRnFFO1FBQUEsQ0FBdkUsQ0FBQSxDQUFBO2VBR0EsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtBQUNqRCxVQUFBLEdBQUEsQ0FBSTtBQUFBLFlBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxZQUFBLEVBQWMsY0FBZDtXQUFkLEVBRmlEO1FBQUEsQ0FBbkQsRUFKeUI7TUFBQSxDQUEzQixFQWhCc0I7SUFBQSxDQUF4QixDQXB4Q0EsQ0FBQTtXQTR5Q0EsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLDZCQUFQLENBQUE7QUFBQSxNQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxHQUFBLENBQUk7QUFBQSxVQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsVUFBWSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFwQjtTQUFKLEVBRFM7TUFBQSxDQUFYLENBTEEsQ0FBQTtBQUFBLE1BT0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO2VBQ3ZCLEVBQUEsQ0FBRyxzQkFBSCxFQUEyQixTQUFBLEdBQUE7QUFDekIsVUFBQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtBQUFBLFlBQUEsWUFBQSxFQUFjLEVBQWQ7V0FBakIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO0FBQUEsWUFBQSxZQUFBLEVBQWMsSUFBZDtXQUFkLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxZQUFBLFlBQUEsRUFBYyxFQUFkO1dBQWpCLENBRkEsQ0FBQTtpQkFHQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtBQUFBLFlBQUEsWUFBQSxFQUFjLElBQWQ7V0FBaEIsRUFKeUI7UUFBQSxDQUEzQixFQUR1QjtNQUFBLENBQXpCLENBUEEsQ0FBQTthQWFBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtlQUNuQixFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFVBQUEsTUFBQSxDQUFPLFFBQVAsRUFBaUI7QUFBQSxZQUFBLFlBQUEsRUFBYyxFQUFkO1dBQWpCLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztBQUFBLFlBQUEsWUFBQSxFQUFjLElBQWQ7V0FBZCxDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO0FBQUEsWUFBQSxZQUFBLEVBQWMsRUFBZDtXQUFqQixDQUZBLENBQUE7aUJBR0EsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7QUFBQSxZQUFBLFlBQUEsRUFBYyxJQUFkO1dBQWhCLEVBSnlCO1FBQUEsQ0FBM0IsRUFEbUI7TUFBQSxDQUFyQixFQWRpQjtJQUFBLENBQW5CLEVBN3lDcUI7RUFBQSxDQUF2QixDQUZBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/text-object-spec.coffee
