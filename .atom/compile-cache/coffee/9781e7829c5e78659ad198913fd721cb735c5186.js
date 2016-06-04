(function() {
  var TextData, dispatch, getVimState, globalState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  settings = require('../lib/settings');

  globalState = require('../lib/global-state');

  describe("Motion Scroll", function() {
    var editor, editorElement, ensure, keystroke, set, text, vimState, _i, _ref1, _results;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    text = new TextData((function() {
      _results = [];
      for (_i = 0; _i < 80; _i++){ _results.push(_i); }
      return _results;
    }).apply(this).join("\n"));
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        set({
          text: text.getRaw()
        });
        editorElement.setHeight(20 * 10);
        editorElement.style.lineHeight = "10px";
        atom.views.performDocumentPoll();
        editorElement.setScrollTop(40 * 10);
        editor.setCursorBufferPosition([42, 0]);
        return jasmine.attachToDOM(editorElement);
      });
    });
    afterEach(function() {
      return vimState.resetNormalMode();
    });
    describe("the ctrl-u keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], {
            chomp: true
          })
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-b keybinding", function() {
      it("moves screen up one page", function() {
        return ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], {
            chomp: true
          })
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-d keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-d', {
          scrollTop: 500,
          cursor: [52, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52], {
            chomp: true
          }).slice(1, -1)
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52])
        });
      });
    });
    return describe("the ctrl-f keybinding", function() {
      it("moves screen down one page", function() {
        return ensure('ctrl-f', {
          scrollTop: 600,
          cursor: [62, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], {
            chomp: true
          }).slice(1, -1)
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62])
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tc2Nyb2xsLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDREQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxFQUF3QixnQkFBQSxRQUF4QixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLGtGQUFBO0FBQUEsSUFBQSxRQUE0RCxFQUE1RCxFQUFDLGNBQUQsRUFBTSxpQkFBTixFQUFjLG9CQUFkLEVBQXlCLGlCQUF6QixFQUFpQyx3QkFBakMsRUFBZ0QsbUJBQWhELENBQUE7QUFBQSxJQUNBLElBQUEsR0FBVyxJQUFBLFFBQUEsQ0FBUzs7OztrQkFBUSxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQVQsQ0FEWCxDQUFBO0FBQUEsSUFHQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBQUEsUUFDQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFEVCxDQUFBO2VBRUMsV0FBQSxHQUFELEVBQU0sY0FBQSxNQUFOLEVBQWMsaUJBQUEsU0FBZCxFQUEyQixLQUhqQjtNQUFBLENBQVosQ0FBQSxDQUFBO2FBS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsR0FBQSxDQUFJO0FBQUEsVUFB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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/motion-scroll-spec.coffee
