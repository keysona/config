(function() {
  var TextData, dispatch, getView, getVimState, globalState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData, getView = _ref.getView;

  settings = require('../lib/settings');

  globalState = require('../lib/global-state');

  describe("Range Marker", function() {
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
    return describe("MarkRange operator", function() {
      var ensureRangeMarker, textForMarker;
      textForMarker = function(marker) {
        return editor.getTextInBufferRange(marker.getBufferRange());
      };
      ensureRangeMarker = function(options) {
        var markers, text;
        markers = vimState.getRangeMarkers();
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
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g m': 'vim-mode-plus:mark-range'
          }
        });
        set({
          text: "ooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n",
          cursor: [0, 0]
        });
        return expect(vimState.hasRangeMarkers()).toBe(false);
      });
      describe("basic behavior", function() {
        it("MarkRange add range marker", function() {
          keystroke('gmiw');
          ensureRangeMarker({
            length: 1,
            text: ['ooo']
          });
          keystroke('j.');
          return ensureRangeMarker({
            length: 2,
            text: ['ooo', 'xxx']
          });
        });
        return it("marked range can use as target of operator by `i r`", function() {
          keystroke('gmiwj.2jgmip');
          ensureRangeMarker({
            length: 3,
            text: ['ooo', 'xxx', "ooo xxx ooo\nxxx ooo xxx\n"]
          });
          return ensure('gUir', {
            text: "OOO xxx ooo\nXXX ooo xxx\n\nOOO XXX OOO\nXXX OOO XXX\n\nooo xxx ooo\nxxx ooo xxx\n"
          });
        });
      });
      describe("select-all-in-range-marker", function() {
        return it("select all instance of cursor word only within marked range", function() {
          var paragraphText;
          keystroke('gmip}}j.');
          paragraphText = "ooo xxx ooo\nxxx ooo xxx\n";
          ensureRangeMarker({
            length: 2,
            text: [paragraphText, paragraphText]
          });
          dispatch(editorElement, 'vim-mode-plus:select-all-in-range-marker');
          expect(editor.getSelections()).toHaveLength(6);
          keystroke('c');
          editor.insertText('!!!');
          return ensure('gUir', {
            text: "!!! xxx !!!\nxxx !!! xxx\n\nooo xxx ooo\nxxx ooo xxx\n\n!!! xxx !!!\nxxx !!! xxx\n"
          });
        });
      });
      describe("clearRangeMarkers command", function() {
        return it("clear rangeMarkers", function() {
          keystroke('gmiw');
          ensureRangeMarker({
            length: 1,
            text: ['ooo']
          });
          dispatch(editorElement, 'vim-mode-plus:clear-range-marker');
          return expect(vimState.hasRangeMarkers()).toBe(false);
        });
      });
      return describe("clearRangeMarkerOnResetNormalMode", function() {
        describe("default setting", function() {
          return it("it won't clear rangeMarker", function() {
            keystroke('gmiw');
            ensureRangeMarker({
              length: 1,
              text: ['ooo']
            });
            dispatch(editorElement, 'vim-mode-plus:reset-normal-mode');
            return ensureRangeMarker({
              length: 1,
              text: ['ooo']
            });
          });
        });
        return describe("when enabled", function() {
          return it("it clear rangeMarker on reset-normal-mode", function() {
            settings.set('clearRangeMarkerOnResetNormalMode', true);
            keystroke('gmiw');
            ensureRangeMarker({
              length: 1,
              text: ['ooo']
            });
            dispatch(editorElement, 'vim-mode-plus:reset-normal-mode');
            return expect(vimState.hasRangeMarkers()).toBe(false);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9yYW5nZS1tYXJrZXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUVBQUE7O0FBQUEsRUFBQSxPQUE2QyxPQUFBLENBQVEsZUFBUixDQUE3QyxFQUFDLG1CQUFBLFdBQUQsRUFBYyxnQkFBQSxRQUFkLEVBQXdCLGdCQUFBLFFBQXhCLEVBQWtDLGVBQUEsT0FBbEMsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQUZkLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSw4REFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFdBQUEsR0FBRCxFQUFNLGNBQUEsTUFBTixFQUFjLGlCQUFBLFNBQWQsRUFBMkIsS0FIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFEUTtJQUFBLENBQVYsQ0FSQSxDQUFBO1dBV0EsUUFBQSxDQUFTLG9CQUFULEVBQStC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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/range-marker-spec.coffee
