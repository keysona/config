(function() {
  var MinimapAutohide;

  MinimapAutohide = require('../lib/minimap-autohide');

  describe("MinimapAutohide", function() {
    var editor, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], editor = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.workspace.open('sample.js');
      });
      runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        return editor.setText("This is the file content");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('minimap');
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('minimap-autohide');
      });
    });
    return describe("with an open editor that have a minimap", function() {
      return it("lives", function() {
        return expect('life').toBe('easy');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL21pbmltYXAtYXV0b2hpZGUvc3BlYy9taW5pbWFwLWF1dG9oaWRlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7O0FBQUEsRUFBQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSx5QkFBUixDQUFsQixDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLDhCQUFBO0FBQUEsSUFBQSxPQUE2QixFQUE3QixFQUFDLDBCQUFELEVBQW1CLGdCQUFuQixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQURBLENBQUE7QUFBQSxNQUdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFdBQXBCLEVBRGM7TUFBQSxDQUFoQixDQUhBLENBQUE7QUFBQSxNQU1BLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO2VBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSwwQkFBZixFQUZHO01BQUEsQ0FBTCxDQU5BLENBQUE7QUFBQSxNQVVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFNBQTlCLEVBRGM7TUFBQSxDQUFoQixDQVZBLENBQUE7YUFhQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixrQkFBOUIsRUFEYztNQUFBLENBQWhCLEVBZFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtXQW1CQSxRQUFBLENBQVMseUNBQVQsRUFBb0QsU0FBQSxHQUFBO2FBQ2xELEVBQUEsQ0FBRyxPQUFILEVBQVksU0FBQSxHQUFBO2VBQ1YsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsTUFBcEIsRUFEVTtNQUFBLENBQVosRUFEa0Q7SUFBQSxDQUFwRCxFQXBCMEI7RUFBQSxDQUE1QixDQVBBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/minimap-autohide/spec/minimap-autohide-spec.coffee
