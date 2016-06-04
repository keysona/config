(function() {
  atom.packages.activatePackage('tree-view').then(function(tree) {
    var IS_ANCHORED_CLASSNAME, projectRoots, treeView, updateTreeViewHeaderPosition;
    IS_ANCHORED_CLASSNAME = 'is--anchored';
    treeView = tree.mainModule.treeView;
    projectRoots = treeView.roots;
    updateTreeViewHeaderPosition = function() {
      var project, projectClassList, projectHeaderHeight, projectHeight, projectOffsetY, yScrollPosition, _i, _len, _results;
      yScrollPosition = treeView.scroller[0].scrollTop;
      _results = [];
      for (_i = 0, _len = projectRoots.length; _i < _len; _i++) {
        project = projectRoots[_i];
        projectHeaderHeight = project.header.offsetHeight;
        projectClassList = project.classList;
        projectOffsetY = project.offsetTop;
        projectHeight = project.offsetHeight;
        if (yScrollPosition > projectOffsetY) {
          if (yScrollPosition > projectOffsetY + projectHeight - projectHeaderHeight) {
            project.header.style.top = 'auto';
            _results.push(projectClassList.add(IS_ANCHORED_CLASSNAME));
          } else {
            project.header.style.top = (yScrollPosition - projectOffsetY) + 'px';
            _results.push(projectClassList.remove(IS_ANCHORED_CLASSNAME));
          }
        } else {
          project.header.style.top = '0';
          _results.push(projectClassList.remove(IS_ANCHORED_CLASSNAME));
        }
      }
      return _results;
    };
    atom.project.onDidChangePaths(function() {
      projectRoots = treeView.roots;
      return updateTreeViewHeaderPosition();
    });
    atom.config.onDidChange('seti-ui', function() {
      return setTimeout(function() {
        return updateTreeViewHeaderPosition();
      });
    });
    treeView.scroller.on('scroll', updateTreeViewHeaderPosition);
    return setTimeout(function() {
      return updateTreeViewHeaderPosition();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3NldGktdWkvbGliL2hlYWRlcnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixXQUE5QixDQUEwQyxDQUFDLElBQTNDLENBQWdELFNBQUMsSUFBRCxHQUFBO0FBQzlDLFFBQUEsMkVBQUE7QUFBQSxJQUFBLHFCQUFBLEdBQXdCLGNBQXhCLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBRjNCLENBQUE7QUFBQSxJQUdBLFlBQUEsR0FBZSxRQUFRLENBQUMsS0FIeEIsQ0FBQTtBQUFBLElBS0EsNEJBQUEsR0FBK0IsU0FBQSxHQUFBO0FBQzdCLFVBQUEsa0hBQUE7QUFBQSxNQUFBLGVBQUEsR0FBa0IsUUFBUSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUF2QyxDQUFBO0FBRUE7V0FBQSxtREFBQTttQ0FBQTtBQUNFLFFBQUEsbUJBQUEsR0FBc0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFyQyxDQUFBO0FBQUEsUUFDQSxnQkFBQSxHQUFtQixPQUFPLENBQUMsU0FEM0IsQ0FBQTtBQUFBLFFBRUEsY0FBQSxHQUFpQixPQUFPLENBQUMsU0FGekIsQ0FBQTtBQUFBLFFBR0EsYUFBQSxHQUFnQixPQUFPLENBQUMsWUFIeEIsQ0FBQTtBQUtBLFFBQUEsSUFBRyxlQUFBLEdBQWtCLGNBQXJCO0FBQ0UsVUFBQSxJQUFHLGVBQUEsR0FBa0IsY0FBQSxHQUFpQixhQUFqQixHQUFpQyxtQkFBdEQ7QUFDRSxZQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXJCLEdBQTJCLE1BQTNCLENBQUE7QUFBQSwwQkFDQSxnQkFBZ0IsQ0FBQyxHQUFqQixDQUFxQixxQkFBckIsRUFEQSxDQURGO1dBQUEsTUFBQTtBQUlFLFlBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBckIsR0FBMkIsQ0FBQyxlQUFBLEdBQWtCLGNBQW5CLENBQUEsR0FBcUMsSUFBaEUsQ0FBQTtBQUFBLDBCQUNBLGdCQUFnQixDQUFDLE1BQWpCLENBQXdCLHFCQUF4QixFQURBLENBSkY7V0FERjtTQUFBLE1BQUE7QUFRRSxVQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXJCLEdBQTJCLEdBQTNCLENBQUE7QUFBQSx3QkFDQSxnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixxQkFBeEIsRUFEQSxDQVJGO1NBTkY7QUFBQTtzQkFINkI7SUFBQSxDQUwvQixDQUFBO0FBQUEsSUF5QkEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUE4QixTQUFBLEdBQUE7QUFDNUIsTUFBQSxZQUFBLEdBQWUsUUFBUSxDQUFDLEtBQXhCLENBQUE7YUFDQSw0QkFBQSxDQUFBLEVBRjRCO0lBQUEsQ0FBOUIsQ0F6QkEsQ0FBQTtBQUFBLElBNkJBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixTQUF4QixFQUFtQyxTQUFBLEdBQUE7YUFHakMsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUFHLDRCQUFBLENBQUEsRUFBSDtNQUFBLENBQVgsRUFIaUM7SUFBQSxDQUFuQyxDQTdCQSxDQUFBO0FBQUEsSUFpQ0EsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFsQixDQUFxQixRQUFyQixFQUErQiw0QkFBL0IsQ0FqQ0EsQ0FBQTtXQW1DQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsNEJBQUEsQ0FBQSxFQURTO0lBQUEsQ0FBWCxFQXBDOEM7RUFBQSxDQUFoRCxDQUFBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/seti-ui/lib/headers.coffee
