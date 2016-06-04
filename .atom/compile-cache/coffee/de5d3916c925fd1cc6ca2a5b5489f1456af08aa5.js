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
        return ensure("" + keystroke + " " + textObject, options);
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
          return ensure('d i w', {
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
          return ensure('v i w', {
            selectedScreenRange: [[0, 6], [0, 11]]
          });
        });
        it("works with multiple cursors", function() {
          set({
            addCursor: [0, 1]
          });
          return ensure('v i w', {
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
            return ensure('c i w', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('d i w', {
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
            return ensure('c i w', {
              text: "abc()",
              mode: "insert"
            });
          });
          return it("delete inside word", function() {
            return ensure('d i w', {
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
          return ensure('d a w', {
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
          return ensure('v a w', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        it("doesn't span newlines", function() {
          set({
            text: "12345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('v a w', {
            selectedBufferRange: [[0, 0], [0, 5]]
          });
        });
        return it("doesn't span special characters", function() {
          set({
            text: "1(345\nabcde ABCDE",
            cursor: [0, 3]
          });
          return ensure('v a w', {
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
          return ensure('d i W', {
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
          return ensure('v i W', {
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
          return ensure('d a W', {
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
          return ensure('v a W', {
            selectedScreenRange: [[0, 6], [0, 12]]
          });
        });
        return it("doesn't span newlines", function() {
          set({
            text: "12(45\nab'de ABCDE",
            cursor: [0, 4]
          });
          return ensure('v a W', {
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
          ensure('d i s', {
            text: ".... \"\" ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j . j . j . j . j . j . j .', {
            text: ".... \"\" ....\n.... '' ....\n.... `` ....\n.... {} ....\n.... <> ....\n.... [] ....\n.... () ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('i s', {
            selectedText: "1s-1e"
          });
          ensure('i s', {
            selectedText: "2s(1s-1e)2e"
          });
          ensure('i s', {
            selectedText: "3s\n----\"2s(1s-1e)2e\"\n---3e"
          });
          return ensure('i s', {
            selectedText: "4s\n--{3s\n----\"2s(1s-1e)2e\"\n---3e}-4e"
          });
        });
      });
      return describe("a-any-pair", function() {
        it("applies operators any a-pair and repeatable", function() {
          ensure('d a s', {
            text: "....  ....\n.... 'abc' ....\n.... `abc` ....\n.... {abc} ....\n.... <abc> ....\n.... [abc] ....\n.... (abc) ...."
          });
          return ensure('j . j . j . j . j . j . j .', {
            text: "....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ....\n....  ...."
          });
        });
        return it("can expand selection", function() {
          set({
            text: complexText,
            cursor: [2, 8]
          });
          keystroke('v');
          ensure('a s', {
            selectedText: "(1s-1e)"
          });
          ensure('a s', {
            selectedText: "\"2s(1s-1e)2e\""
          });
          ensure('a s', {
            selectedText: "{3s\n----\"2s(1s-1e)2e\"\n---3e}"
          });
          return ensure('a s', {
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
          ensure('d i q', {
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
          ensure('i q', {
            selectedText: 'abc'
          });
          ensure('i q', {
            selectedText: 'def'
          });
          return ensure('i q', {
            selectedText: 'efg'
          });
        });
      });
      return describe("a-any-quote", function() {
        it("applies operators any a-quote and repeatable", function() {
          ensure('d a q', {
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
          ensure('a q', {
            selectedText: '"abc"'
          });
          ensure('a q', {
            selectedText: '`def`'
          });
          return ensure('a q', {
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
          return ensure('d i "', {
            text: '""here" " and over here',
            cursor: [0, 1]
          });
        });
        it("skip non-string area and operate forwarding string whithin line", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i "', {
            text: '" something in here and in "here"" and over here',
            cursor: [0, 33]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure('d i "', {
            text: '" something in here and in "here" " and over here',
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i "');
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
          return ensure('d a "', {
            text: 'here" "',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("skip non-string area and operate forwarding string whithin line", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a "', {
            text: '" something in here and in "here',
            cursor: [0, 31],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a "');
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
            return ensure("d i '", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 19]
            });
            return ensure("d i '", {
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
            return ensure("d i '", {
              text: "'': 'here-is-the-val'",
              cursor: [0, 1]
            });
          });
          return it("case-2", function() {
            set({
              cursor: [0, 17]
            });
            return ensure("d i '", {
              text: "'some-key-here\\'': ''",
              cursor: [0, 20]
            });
          });
        });
        it("applies operators inside the current string in operator-pending mode", function() {
          return ensure("d i '", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 26]
          });
          return ensure("d i '", {
            text: "''here' ' and over here",
            cursor: [0, 1]
          });
        });
        it("makes no change if past the last string on a line", function() {
          set({
            cursor: [0, 39]
          });
          return ensure("d i '", {
            text: "' something in here and in 'here' ' and over here",
            cursor: [0, 39]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("i '");
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
          return ensure("d a '", {
            text: "here' '",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators inside the next string in operator-pending mode (if not in a string)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure("d a '", {
            text: "' something in here and in 'here",
            cursor: [0, 31],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a '");
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
          return ensure("d i `", {
            text: "this is `` text.",
            cursor: [0, 9]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("d i `", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i `');
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
          return ensure("d a `", {
            text: "this is  text.",
            cursor: [0, 8]
          });
        });
        it("do nothing when pair range is not under cursor", function() {
          set({
            cursor: [0, 16]
          });
          return ensure("d a `", {
            text: originalText,
            cursor: [0, 16]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a `");
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
          return ensure('d i {', {
            text: "{}",
            cursor: [0, 1]
          });
        });
        it("applies operators to inner-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i {', {
            text: "{ something in here and in {} }",
            cursor: [0, 28]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i {');
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
          return ensure('d a {', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators to a-area in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a {', {
            text: "{ something in here and in  }",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a {");
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
          return ensure('d i <', {
            text: "<>",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i <', {
            text: "< something in here and in <> >",
            cursor: [0, 28]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i <');
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
          return ensure('d a <', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current angle brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a <', {
            text: "< something in here and in  >",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor("a <");
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
          ensure('escape v i }', {
            selectedText: "000"
          });
          set({
            cursor: [1, 0]
          });
          ensure('escape v i >', {
            selectedText: "111"
          });
          set({
            cursor: [2, 0]
          });
          ensure('escape v i ]', {
            selectedText: "222"
          });
          set({
            cursor: [3, 0]
          });
          return ensure('escape v i )', {
            selectedText: "333"
          });
        });
      });
      describe("a", function() {
        return it("select forwarding range", function() {
          set({
            cursor: [0, 0]
          });
          ensure('escape v a }', {
            selectedText: "{000}"
          });
          set({
            cursor: [1, 0]
          });
          ensure('escape v a >', {
            selectedText: "<111>"
          });
          set({
            cursor: [2, 0]
          });
          ensure('escape v a ]', {
            selectedText: "[222]"
          });
          set({
            cursor: [3, 0]
          });
          return ensure('escape v a )', {
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
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("v i }", {
              selectedText: "22"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("v i }", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("v i }", {
              selectedText: textOneInner
            });
          });
        });
        return describe("forwarding a", function() {
          it("select forwarding range", function() {
            set({
              cursor: [1, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          it("select forwarding range", function() {
            set({
              cursor: [2, 0]
            });
            return ensure("v a }", {
              selectedText: "{22}"
            });
          });
          it("[case-1] no forwarding open pair, fail to find", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("v a }", {
              selectedText: '0',
              cursor: [0, 1]
            });
          });
          it("[case-2] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [1, 4]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [3, 0]
            });
            return ensure("v a }", {
              selectedText: textOneA
            });
          });
          return it("[case-3] no forwarding open pair, select enclosed", function() {
            set({
              cursor: [4, 0]
            });
            return ensure("v a }", {
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
          check = getCheckFunctionFor('i t');
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
            ensure('v i t', {
              selectedText: "\n________<p><a>\n______"
            });
            ensure('i t', {
              selectedText: "\n______<div>\n________<p><a>\n______</div>\n____"
            });
            ensure('i t', {
              selectedText: "\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__"
            });
            ensure('i t', {
              selectedText: "\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n"
            });
            return ensure('i t', {
              selectedText: "\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div>\n________<p><a>\n______</div>\n____</div>\n__</div>\n</body>\n"
            });
          });
          return it('delete inner-tag and repatable', function() {
            set({
              cursor: [9, 0]
            });
            ensure("d i t", {
              text: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n__<meta charset=\"UTF-8\" />\n__<title>Document</title>\n</head>\n<body>\n__<div>\n____<div>\n______<div></div>\n____</div>\n__</div>\n</body>\n</html>\n"
            });
            ensure("3 .", {
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
          check = getCheckFunctionFor('a t');
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
          return ensure('d i [', {
            text: "[]",
            cursor: [0, 1]
          });
        });
        return it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i [', {
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
          return ensure('d a [', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current square brackets in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a [', {
            text: "[ something in here and in  ]",
            cursor: [0, 27],
            mode: 'normal'
          });
        });
        describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i [');
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
          check = getCheckFunctionFor('a [');
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
          return ensure('d i (', {
            text: "()",
            cursor: [0, 1]
          });
        });
        it("applies operators inside the current word in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d i (', {
            text: "( something in here and in () )",
            cursor: [0, 28]
          });
        });
        it("select inner () by skipping nesting pair", function() {
          set({
            text: 'expect(editor.getScrollTop())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.getScrollTop()'
          });
        });
        it("skip escaped pair case-1", function() {
          set({
            text: 'expect(editor.g\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('v i (', {
            selectedText: 'editor.g\\(etScrollTp()'
          });
        });
        it("dont skip literal backslash", function() {
          set({
            text: 'expect(editor.g\\\\(etScrollTp())',
            cursor: [0, 20]
          });
          return ensure('v i (', {
            selectedText: 'etScrollTp()'
          });
        });
        it("skip escaped pair case-2", function() {
          set({
            text: 'expect(editor.getSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.getSc\\)rollTp()'
          });
        });
        it("skip escaped pair case-3", function() {
          set({
            text: 'expect(editor.ge\\(tSc\\)rollTp())',
            cursor: [0, 7]
          });
          return ensure('v i (', {
            selectedText: 'editor.ge\\(tSc\\)rollTp()'
          });
        });
        it("works with multiple cursors", function() {
          set({
            text: "( a b ) cde ( f g h ) ijk",
            cursor: [[0, 2], [0, 18]]
          });
          return ensure('v i (', {
            selectedBufferRange: [[[0, 1], [0, 6]], [[0, 13], [0, 20]]]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('i (');
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
          return ensure('d a (', {
            text: '',
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("applies operators around the current parentheses in operator-pending mode (second test)", function() {
          set({
            cursor: [0, 29]
          });
          return ensure('d a (', {
            text: "( something in here and in  )",
            cursor: [0, 27]
          });
        });
        return describe("cursor is on the pair char", function() {
          var check, close, open, selectedText, text, textFinal;
          check = getCheckFunctionFor('a (');
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
          return ensure('y i p', {
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
          return ensure('v i p', {
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
          return ensure('y a p', {
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
          return ensure('v a p', {
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
          return ensure('v i /', {
            selectedText: '# This\n# is\n# Comment\n',
            selectedBufferRange: [[0, 0], [3, 0]]
          });
        });
        it('select one line comment', function() {
          set({
            cursor: [4, 0]
          });
          return ensure('v i /', {
            selectedText: '# One line comment\n',
            selectedBufferRange: [[4, 0], [5, 0]]
          });
        });
        return it('not select non-comment line', function() {
          set({
            cursor: [6, 0]
          });
          return ensure('v i /', {
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
          return ensure('v a /', {
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
          return ensure('v i i', {
            selectedBufferRange: [[12, 0], [15, 0]]
          });
        });
      });
      return describe('a-indentation', function() {
        return it('wont stop on blank line when selecting indent', function() {
          set({
            cursor: [12, 0]
          });
          return ensure('v a i', {
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
          return ensure('v i z', {
            selectedBufferRange: rangeForRows(10, 25)
          });
        });
        it("select inner range of fold", function() {
          set({
            cursor: [19, 0]
          });
          return ensure('v i z', {
            selectedBufferRange: rangeForRows(19, 23)
          });
        });
        it("can expand selection", function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('i z', {
            selectedBufferRange: rangeForRows(23, 23)
          });
          ensure('i z', {
            selectedBufferRange: rangeForRows(19, 23)
          });
          ensure('i z', {
            selectedBufferRange: rangeForRows(10, 25)
          });
          return ensure('i z', {
            selectedBufferRange: rangeForRows(9, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select outer fold(skip)', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('v i z', {
              selectedBufferRange: rangeForRows(19, 23)
            });
          });
        });
        describe("when endRow of selection exceeds fold endRow", function() {
          return it("doesn't matter, select fold based on startRow of selection", function() {
            set({
              cursor: [20, 0]
            });
            ensure('V G', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('i z', {
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
            ensure('v i z', {
              selectedBufferRange: rangeForRows(5, 6)
            });
            return ensure('a z', {
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
          return ensure('v a z', {
            selectedBufferRange: rangeForRows(9, 25)
          });
        });
        it('select fold row range', function() {
          set({
            cursor: [19, 0]
          });
          return ensure('v a z', {
            selectedBufferRange: rangeForRows(18, 23)
          });
        });
        it('can expand selection', function() {
          set({
            cursor: [23, 0]
          });
          keystroke('v');
          ensure('a z', {
            selectedBufferRange: rangeForRows(22, 23)
          });
          ensure('a z', {
            selectedBufferRange: rangeForRows(18, 23)
          });
          ensure('a z', {
            selectedBufferRange: rangeForRows(9, 25)
          });
          return ensure('a z', {
            selectedBufferRange: rangeForRows(8, 28)
          });
        });
        describe("when startRow of selection is on fold startRow", function() {
          return it('select outer fold(skip)', function() {
            set({
              cursor: [20, 7]
            });
            return ensure('v a z', {
              selectedBufferRange: rangeForRows(18, 23)
            });
          });
        });
        return describe("when endRow of selection exceeds fold endRow", function() {
          return it("doesn't matter, select fold based on startRow of selection", function() {
            set({
              cursor: [20, 0]
            });
            ensure('V G', {
              selectedBufferRange: rangeForRows(20, 30)
            });
            return ensure('a z', {
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
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for coffee', function() {
          return it('select function', function() {
            return ensure('v a f', {
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
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for ruby', function() {
          return it('select function', function() {
            return ensure('v a f', {
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
            return ensure('v i f', {
              selectedBufferRange: [[3, 0], [6, 0]]
            });
          });
        });
        return describe('a-function for go', function() {
          return it('select function', function() {
            return ensure('v a f', {
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
          return ensure('v i l', {
            selectedText: 'This is'
          });
        });
        return it('also skip leading white space', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v i l', {
            selectedText: 'multi line'
          });
        });
      });
      return describe('a-current-line', function() {
        it('select current line without including last newline as like `vil`', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('v a l', {
            selectedText: 'This is'
          });
        });
        return it('wont skip leading white space not like `vil`', function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v a l', {
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
          ensure('v i e', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('j j v i e', {
            selectedText: text
          });
        });
      });
      return describe('a-entire', function() {
        return it('select entire buffer', function() {
          ensure('escape', {
            selectedText: ''
          });
          ensure('v a e', {
            selectedText: text
          });
          ensure('escape', {
            selectedText: ''
          });
          return ensure('j j v a e', {
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
          ensure('g n', {
            cursor: [1, 5],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: false,
            selectedText: 'abc'
          });
          ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc"
          });
          ensure('g n', {
            selectionIsReversed: false,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('g n', {
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
          ensure('g N', {
            cursor: [4, 2],
            mode: ['visual', 'characterwise'],
            selectionIsReversed: true,
            selectedText: 'abc'
          });
          ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc\n4 abc"
          });
          ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
          return ensure('g N', {
            selectionIsReversed: true,
            mode: ['visual', 'characterwise'],
            selectedText: "abc xxx\n2   xxx yyy\n3 xxx abc\n4 abc"
          });
        });
      });
      return describe('as operator target', function() {
        it('delete next occurence of last search pattern', function() {
          ensure('d g n', {
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
          ensure('c g n', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx abc\n4 abc\n"
          });
          keystroke('escape');
          set({
            cursor: [4, 0]
          });
          return ensure('c g N', {
            cursor: [3, 6],
            mode: 'insert',
            text: "0 xxx\n1  xxx\n2   xxx yyy\n3 xxx_\n4 abc\n".replace('_', ' ')
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy90ZXh0LW9iamVjdC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrREFBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IsZ0JBQUEsUUFBeEIsQ0FBQTs7QUFBQSxFQUNBLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FEZCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFFBQUEsbUZBQUE7QUFBQSxJQUFBLFFBQTRELEVBQTVELEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsQ0FBQTtBQUFBLElBRUEsbUJBQUEsR0FBc0IsU0FBQyxVQUFELEdBQUE7YUFDcEIsU0FBQyxZQUFELEVBQWUsU0FBZixFQUEwQixPQUExQixHQUFBO0FBQ0UsUUFBQSxHQUFBLENBQUk7QUFBQSxVQUFBLE1BQUEsRUFBUSxZQUFSO1NBQUosQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLEVBQUEsR0FBRyxTQUFILEdBQWEsR0FBYixHQUFnQixVQUF2QixFQUFxQyxPQUFyQyxFQUZGO01BQUEsRUFEb0I7SUFBQSxDQUZ0QixDQUFBO0FBQUEsSUFPQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLFNBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLGdCQUFBLEdBQUQsRUFBTSxtQkFBQSxN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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/text-object-spec.coffee
