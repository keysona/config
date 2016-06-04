(function() {
  var TabsToSpaces;

  TabsToSpaces = null;

  module.exports = {
    config: {
      onSave: {
        type: 'string',
        "default": 'none',
        "enum": ['none', 'tabify', 'untabify'],
        description: 'Setting this to anything other than `none` can **significantly** impact the time it takes to save large files.'
      }
    },
    activate: function() {
      this.commands = atom.commands.add('atom-workspace', {
        'tabs-to-spaces:tabify': (function(_this) {
          return function() {
            _this.loadModule();
            return TabsToSpaces.tabify();
          };
        })(this),
        'tabs-to-spaces:untabify': (function(_this) {
          return function() {
            _this.loadModule();
            return TabsToSpaces.untabify();
          };
        })(this),
        'tabs-to-spaces:untabify-all': (function(_this) {
          return function() {
            _this.loadModule();
            return TabsToSpaces.untabifyAll();
          };
        })(this)
      });
      return this.editorObserver = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.handleEvents(editor);
        };
      })(this));
    },
    deactivate: function() {
      this.commands.dispose();
      this.editorObserver.dispose();
      return TabsToSpaces = null;
    },
    handleEvents: function(editor) {
      return editor.getBuffer().onWillSave((function(_this) {
        return function() {
          if (editor.getPath() === atom.config.getUserConfigPath()) {
            return;
          }
          switch (atom.config.get('tabs-to-spaces.onSave', {
                scope: editor.getRootScopeDescriptor()
              })) {
            case 'untabify':
              _this.loadModule();
              return TabsToSpaces.untabify();
            case 'tabify':
              _this.loadModule();
              return TabsToSpaces.tabify();
          }
        };
      })(this));
    },
    loadModule: function() {
      return TabsToSpaces != null ? TabsToSpaces : TabsToSpaces = require('./tabs-to-spaces');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3RhYnMtdG8tc3BhY2VzL2xpYi9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsWUFBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxJQUFmLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLE1BQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxNQURUO0FBQUEsUUFFQSxNQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixVQUFuQixDQUZOO0FBQUEsUUFHQSxXQUFBLEVBQWEsZ0hBSGI7T0FERjtLQURGO0FBQUEsSUFRQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDVjtBQUFBLFFBQUEsdUJBQUEsRUFBeUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDdkIsWUFBQSxLQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTttQkFDQSxZQUFZLENBQUMsTUFBYixDQUFBLEVBRnVCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7QUFBQSxRQUlBLHlCQUFBLEVBQTJCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ3pCLFlBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7bUJBQ0EsWUFBWSxDQUFDLFFBQWIsQ0FBQSxFQUZ5QjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSjNCO0FBQUEsUUFRQSw2QkFBQSxFQUErQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUM3QixZQUFBLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO21CQUNBLFlBQVksQ0FBQyxXQUFiLENBQUEsRUFGNkI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVIvQjtPQURVLENBQVosQ0FBQTthQWFBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNsRCxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFEa0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQWRWO0lBQUEsQ0FSVjtBQUFBLElBMEJBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQWMsQ0FBQyxPQUFoQixDQUFBLENBREEsQ0FBQTthQUlBLFlBQUEsR0FBZSxLQUxMO0lBQUEsQ0ExQlo7QUFBQSxJQW9DQSxZQUFBLEVBQWMsU0FBQyxNQUFELEdBQUE7YUFDWixNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsVUFBbkIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUM1QixVQUFBLElBQVUsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEtBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQVosQ0FBQSxDQUE5QjtBQUFBLGtCQUFBLENBQUE7V0FBQTtBQUVBLGtCQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUM7QUFBQSxnQkFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLHNCQUFQLENBQUEsQ0FBUDtlQUF6QyxDQUFQO0FBQUEsaUJBQ08sVUFEUDtBQUVJLGNBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7cUJBQ0EsWUFBWSxDQUFDLFFBQWIsQ0FBQSxFQUhKO0FBQUEsaUJBSU8sUUFKUDtBQUtJLGNBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7cUJBQ0EsWUFBWSxDQUFDLE1BQWIsQ0FBQSxFQU5KO0FBQUEsV0FINEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixFQURZO0lBQUEsQ0FwQ2Q7QUFBQSxJQWlEQSxVQUFBLEVBQVksU0FBQSxHQUFBO29DQUNWLGVBQUEsZUFBZ0IsT0FBQSxDQUFRLGtCQUFSLEVBRE47SUFBQSxDQWpEWjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/tabs-to-spaces/lib/index.coffee
