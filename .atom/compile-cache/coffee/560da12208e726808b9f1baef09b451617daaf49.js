(function() {
  var getView, getVimState, packageName, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, getView = _ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, workspaceElement, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5], workspaceElement = _ref1[6];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    afterEach(function() {
      if (!vimState.destroyed) {
        return vimState.resetNormalMode();
      }
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("Normal");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("Insert");
        });
      });
      return it("doesn't register duplicate command listeners for editors", function() {
        var newPane, pane;
        set({
          text: '12345',
          cursorBuffer: [0, 0]
        });
        pane = atom.workspace.getActivePane();
        newPane = pane.splitRight();
        pane.removeItem(editor);
        newPane.addItem(editor);
        return ensure('l', {
          cursorBuffer: [0, 1]
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy92aW0tbW9kZS1wbHVzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUEsT0FBeUIsT0FBQSxDQUFRLGVBQVIsQ0FBekIsRUFBQyxtQkFBQSxXQUFELEVBQWMsZUFBQSxPQUFkLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsZUFGZCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFFBQUEsZ0ZBQUE7QUFBQSxJQUFBLFFBQThFLEVBQTlFLEVBQUMsY0FBRCxFQUFNLGlCQUFOLEVBQWMsb0JBQWQsRUFBeUIsaUJBQXpCLEVBQWlDLHdCQUFqQyxFQUFnRCxtQkFBaEQsRUFBMEQsMkJBQTFELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLFdBQUEsQ0FBWSxTQUFDLFNBQUQsRUFBWSxHQUFaLEdBQUE7QUFDVixRQUFBLFFBQUEsR0FBVyxTQUFYLENBQUE7QUFBQSxRQUNDLG1CQUFBLE1BQUQsRUFBUywwQkFBQSxhQURULENBQUE7ZUFFQyxVQUFBLEdBQUQsRUFBTSxhQUFBLE1BQU4sRUFBYyxnQkFBQSxTQUFkLEVBQTJCLElBSGpCO01BQUEsQ0FBWixDQUFBLENBQUE7QUFBQSxNQUtBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxJQUFJLENBQUMsU0FBYixDQUxuQixDQUFBO2FBT0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsWUFBOUIsRUFEYztNQUFBLENBQWhCLEVBUlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBYUEsU0FBQSxDQUFVLFNBQUEsR0FBQTtBQUNS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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/spec/vim-mode-plus-spec.coffee
