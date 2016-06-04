(function() {
  var HighlightSelected, Point, Range, path, _ref;

  path = require('path');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  HighlightSelected = require('../lib/highlight-selected');

  describe("HighlightSelected", function() {
    var activationPromise, editor, editorElement, hasMinimap, hasStatusBar, highlightSelected, minimap, minimapHS, minimapModule, statusBar, workspaceElement, _ref1;
    _ref1 = [], activationPromise = _ref1[0], workspaceElement = _ref1[1], minimap = _ref1[2], statusBar = _ref1[3], editor = _ref1[4], editorElement = _ref1[5], highlightSelected = _ref1[6], minimapHS = _ref1[7], minimapModule = _ref1[8];
    hasMinimap = atom.packages.getAvailablePackageNames().indexOf('minimap') !== -1 && atom.packages.getAvailablePackageNames().indexOf('minimap-highlight-selected') !== -1;
    hasStatusBar = atom.packages.getAvailablePackageNames().indexOf('status-bar') !== -1;
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return atom.project.setPaths([path.join(__dirname, 'fixtures')]);
    });
    afterEach(function() {
      highlightSelected.deactivate();
      if (minimapHS != null) {
        minimapHS.deactivate();
      }
      return minimapModule != null ? minimapModule.deactivate() : void 0;
    });
    describe("when opening a coffee file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('status-bar').then(function(pack) {
            return statusBar = workspaceElement.querySelector("status-bar");
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('highlight-selected').then(function(_arg) {
            var mainModule;
            mainModule = _arg.mainModule;
            return highlightSelected = mainModule;
          });
        });
        if (hasMinimap) {
          waitsForPromise(function() {
            return atom.packages.activatePackage('minimap').then(function(_arg) {
              var mainModule;
              mainModule = _arg.mainModule;
              return minimapModule = mainModule;
            });
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('minimap-highlight-selected').then(function(_arg) {
              var mainModule;
              mainModule = _arg.mainModule;
              return minimapHS = mainModule;
            });
          });
        }
        waitsForPromise(function() {
          return atom.workspace.open('sample.coffee').then(function(editor) {
            return editor;
          }, function(error) {
            throw error.stack;
          });
        });
        return runs(function() {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      describe("updates debounce when config is changed", function() {
        beforeEach(function() {
          spyOn(highlightSelected.areaView, 'debouncedHandleSelection');
          return atom.config.set('highlight-selected.timeout', 20000);
        });
        return it('calls createDebouce', function() {
          return expect(highlightSelected.areaView.debouncedHandleSelection).toHaveBeenCalled();
        });
      });
      describe("when a whole word is selected", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 2), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        it("adds the decoration to all words", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
        });
        it("creates the highlight selected status bar element", function() {
          expect(workspaceElement.querySelector('status-bar')).toExist();
          return expect(workspaceElement.querySelector('.highlight-selected-status')).toExist();
        });
        it("updates the status bar with highlights number", function() {
          var content;
          content = workspaceElement.querySelector('.highlight-selected-status').innerHTML;
          return expect(content).toBe('Highlighted: 4');
        });
        return describe("when the status bar is disabled", function() {
          beforeEach(function() {
            return atom.config.set('highlight-selected.showInStatusBar', false);
          });
          return it("highlight isn't attached", function() {
            expect(workspaceElement.querySelector('status-bar')).toExist();
            return expect(workspaceElement.querySelector('.highlight-selected-status')).not.toExist();
          });
        });
      });
      describe("when hide highlight on selected word is enabled", function() {
        beforeEach(function() {
          return atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true);
        });
        describe("when a single line is selected", function() {
          beforeEach(function() {
            var range;
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the decoration only no selected words", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
          });
        });
        return describe("when multi lines are selected", function() {
          beforeEach(function() {
            var range1, range2;
            range1 = new Range(new Point(8, 2), new Point(8, 8));
            range2 = new Range(new Point(9, 2), new Point(9, 8));
            editor.setSelectedBufferRanges([range1, range2]);
            return advanceClock(20000);
          });
          return it("adds the decoration only no selected words", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
          });
        });
      });
      describe("leading whitespace doesn't get used", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 0), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("doesn't add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
        });
      });
      describe("will highlight non whole words", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', false);
          range = new Range(new Point(10, 13), new Point(10, 17));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });
      describe("will not highlight non whole words", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(10, 13), new Point(10, 17));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
      describe("will not highlight less than minimum length", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.minimumLength', 7);
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("doesn't add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
        });
      });
      describe("will not highlight words in different case", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
      describe("will highlight words in different case", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.ignoreCase', true);
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(5);
        });
        describe("adds background to selected", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-selected.highlightBackground', true);
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the background to all highlights", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected.background .region')).toHaveLength(4);
          });
        });
        return describe("adds light theme to selected", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-selected.lightTheme', true);
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the background to all highlights", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected.light-theme .region')).toHaveLength(4);
          });
        });
      });
      if (hasMinimap) {
        return describe("minimap highlight selected still works", function() {
          beforeEach(function() {
            var range;
            editor = atom.workspace.getActiveTextEditor();
            minimap = minimapModule.minimapForEditor(editor);
            spyOn(minimap, 'decorateMarker').andCallThrough();
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it('adds a decoration for the selection in the minimap', function() {
            return expect(minimap.decorateMarker).toHaveBeenCalled();
          });
        });
      }
    });
    return describe("when opening a php file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('highlight-selected').then(function(_arg) {
            var mainModule;
            mainModule = _arg.mainModule;
            return highlightSelected = mainModule;
          });
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.php').then(function(editor) {
            return editor;
          }, function(error) {
            throw error.stack;
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-php');
        });
        return runs(function() {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      describe("being able to highlight variables with '$'", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(1, 2), new Point(1, 7));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("finds 3 regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });
      return describe("being able to highlight variables when not selecting '$'", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(1, 3), new Point(1, 7));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("finds 4 regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2hpZ2hsaWdodC1zZWxlY3RlZC9zcGVjL2hpZ2hsaWdodC1zZWxlY3RlZC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQ0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLDJCQUFSLENBRnBCLENBQUE7O0FBQUEsRUFNQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFFBQUEsNEpBQUE7QUFBQSxJQUFBLFFBQ3VFLEVBRHZFLEVBQUMsNEJBQUQsRUFBb0IsMkJBQXBCLEVBQXNDLGtCQUF0QyxFQUErQyxvQkFBL0MsRUFDQyxpQkFERCxFQUNTLHdCQURULEVBQ3dCLDRCQUR4QixFQUMyQyxvQkFEM0MsRUFDc0Qsd0JBRHRELENBQUE7QUFBQSxJQUdBLFVBQUEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFkLENBQUEsQ0FDWCxDQUFDLE9BRFUsQ0FDRixTQURFLENBQUEsS0FDYyxDQUFBLENBRGQsSUFDcUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBZCxDQUFBLENBQ2hDLENBQUMsT0FEK0IsQ0FDdkIsNEJBRHVCLENBQUEsS0FDWSxDQUFBLENBTDlDLENBQUE7QUFBQSxJQU9BLFlBQUEsR0FBZSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFkLENBQUEsQ0FDYixDQUFDLE9BRFksQ0FDSixZQURJLENBQUEsS0FDZSxDQUFBLENBUjlCLENBQUE7QUFBQSxJQVVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFD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

//# sourceURL=/home/key/.atom/packages/highlight-selected/spec/highlight-selected-spec.coffee
