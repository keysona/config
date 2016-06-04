(function() {
  var CompositeDisposable;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  module.exports = {
    active: false,
    isActive: function() {
      return this.active;
    },
    activate: function(state) {
      return this.subscriptions = new CompositeDisposable;
    },
    consumeMinimapServiceV1: function(minimap) {
      this.minimap = minimap;
      return this.minimap.registerPlugin('minimap-autohide', this);
    },
    deactivate: function() {
      this.minimap.unregisterPlugin('minimap-autohide');
      return this.minimap = null;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      this.active = true;
      return this.minimapsSubscription = this.minimap.observeMinimaps((function(_this) {
        return function(minimap) {
          var editor, minimapElement;
          minimapElement = atom.views.getView(minimap);
          editor = minimap.getTextEditor();
          return _this.subscriptions.add(editor.onDidChangeScrollTop(function() {
            return _this.handleScroll(minimapElement);
          }));
        };
      })(this));
    },
    handleScroll: function(el) {
      el.classList.add('scrolling');
      if (el.timer) {
        clearTimeout(el.timer);
      }
      return el.timer = setTimeout((function() {
        return el.classList.remove('scrolling');
      }), 1500);
    },
    deactivatePlugin: function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.minimapsSubscription.dispose();
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL21pbmltYXAtYXV0b2hpZGUvbGliL21pbmltYXAtYXV0b2hpZGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsS0FBUjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxPQUFKO0lBQUEsQ0FGVjtBQUFBLElBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG9CQURUO0lBQUEsQ0FKVjtBQUFBLElBT0EsdUJBQUEsRUFBeUIsU0FBRSxPQUFGLEdBQUE7QUFDdkIsTUFEd0IsSUFBQyxDQUFBLFVBQUEsT0FDekIsQ0FBQTthQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixrQkFBeEIsRUFBNEMsSUFBNUMsRUFEdUI7SUFBQSxDQVB6QjtBQUFBLElBVUEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUEwQixrQkFBMUIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUZEO0lBQUEsQ0FWWjtBQUFBLElBY0EsY0FBQSxFQUFnQixTQUFBLEdBQUE7QUFDZCxNQUFBLElBQVUsSUFBQyxDQUFBLE1BQVg7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUZWLENBQUE7YUFJQSxJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFULENBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUMvQyxjQUFBLHNCQUFBO0FBQUEsVUFBQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixPQUFuQixDQUFqQixDQUFBO0FBQUEsVUFDQSxNQUFBLEdBQVEsT0FBTyxDQUFDLGFBQVIsQ0FBQSxDQURSLENBQUE7aUJBRUEsS0FBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixTQUFBLEdBQUE7bUJBQzdDLEtBQUMsQ0FBQSxZQUFELENBQWMsY0FBZCxFQUQ2QztVQUFBLENBQTVCLENBQW5CLEVBSCtDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsRUFMVjtJQUFBLENBZGhCO0FBQUEsSUF5QkEsWUFBQSxFQUFjLFNBQUMsRUFBRCxHQUFBO0FBQ1osTUFBQSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQWIsQ0FBaUIsV0FBakIsQ0FBQSxDQUFBO0FBRUEsTUFBQSxJQUFHLEVBQUUsQ0FBQyxLQUFOO0FBQ0UsUUFBQSxZQUFBLENBQWEsRUFBRSxDQUFDLEtBQWhCLENBQUEsQ0FERjtPQUZBO2FBS0EsRUFBRSxDQUFDLEtBQUgsR0FBVyxVQUFBLENBQVcsQ0FBRSxTQUFBLEdBQUE7ZUFDdEIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFiLENBQW9CLFdBQXBCLEVBRHNCO01BQUEsQ0FBRixDQUFYLEVBRVIsSUFGUSxFQU5DO0lBQUEsQ0F6QmQ7QUFBQSxJQW1DQSxnQkFBQSxFQUFrQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxJQUFBLENBQUEsSUFBZSxDQUFBLE1BQWY7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUZWLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxPQUF0QixDQUFBLENBSEEsQ0FBQTthQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBTGdCO0lBQUEsQ0FuQ2xCO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/key/.atom/packages/minimap-autohide/lib/minimap-autohide.coffee
