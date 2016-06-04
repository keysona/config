(function() {
  var basename;

  basename = require("path").basename;

  module.exports = {
    config: {
      coloured: {
        type: 'boolean',
        "default": true,
        description: 'Untick this for colourless icons'
      },
      forceShow: {
        type: 'boolean',
        "default": false,
        description: 'Force show icons - for themes that hide icons'
      },
      onChanges: {
        type: 'boolean',
        "default": false,
        description: 'Only colour icons when file is modified'
      },
      tabPaneIcon: {
        type: 'boolean',
        "default": true,
        description: 'Show file icons on tab pane'
      }
    },
    activate: function(state) {
      this.disableSetiIcons(true);
      atom.config.onDidChange('file-icons.coloured', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.colour(newValue);
        };
      })(this));
      this.colour(atom.config.get('file-icons.coloured'));
      this.observe(true);
      atom.config.onDidChange('file-icons.forceShow', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.forceShow(newValue);
        };
      })(this));
      this.forceShow(atom.config.get('file-icons.forceShow'));
      atom.config.onDidChange('file-icons.onChanges', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.onChanges(newValue);
        };
      })(this));
      this.onChanges(atom.config.get('file-icons.onChanges'));
      atom.config.onDidChange('file-icons.tabPaneIcon', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.tabPaneIcon(newValue);
        };
      })(this));
      return this.tabPaneIcon(atom.config.get('file-icons.tabPaneIcon'));
    },
    deactivate: function() {
      this.disableSetiIcons(false);
      this.forceShow(false);
      this.onChanges(false);
      this.colour(true);
      this.tabPaneIcon(false);
      return this.observe(false);
    },
    observe: function(enabled) {
      if (enabled) {
        return this.observer = atom.workspace.observeTextEditors(function(editor) {
          var onDone, onSave, openedFile, workspace;
          workspace = atom.views.getView(atom.workspace);
          openedFile = editor.getPath();
          if (!openedFile) {
            return onSave = editor.onDidSave(function(file) {
              var path, tab;
              tab = workspace != null ? workspace.querySelector(".tab-bar > .active.tab > .title") : void 0;
              if (!(tab != null ? tab.dataset.path : void 0)) {
                path = file.path;
                tab.dataset.path = path;
                tab.dataset.name = basename(path);
              }
              return onSave.dispose();
            });
          } else {
            return onDone = editor.onDidStopChanging(function() {
              var fileTabs, tabs;
              tabs = workspace != null ? workspace.querySelectorAll(".pane > .tab-bar > .tab") : void 0;
              fileTabs = [].filter.call(tabs, function(tab) {
                return (tab != null ? tab.item : void 0) === editor;
              });
              editor.onDidChangePath((function(_this) {
                return function(path) {
                  var tab, title, _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = fileTabs.length; _i < _len; _i++) {
                    tab = fileTabs[_i];
                    title = tab.itemTitle;
                    title.dataset.path = path;
                    _results.push(title.dataset.name = basename(path));
                  }
                  return _results;
                };
              })(this));
              return onDone.dispose();
            });
          }
        });
      } else if (this.observer != null) {
        return this.observer.dispose();
      }
    },
    serialize: function() {},
    colour: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-colourless', !enable);
    },
    forceShow: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-force-show-icons', enable);
    },
    onChanges: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-on-changes', enable);
    },
    tabPaneIcon: function(enable) {
      var body;
      body = document.querySelector('body');
      return body.classList.toggle('file-icons-tab-pane-icon', enable);
    },
    disableSetiIcons: function(disable) {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      return workspaceElement.classList.toggle('seti-ui-no-icons', disable);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2ZpbGUtaWNvbnMvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFFBQUE7O0FBQUEsRUFBQyxXQUFZLE9BQUEsQ0FBUSxNQUFSLEVBQVosUUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLGtDQUZiO09BREY7QUFBQSxNQUlBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsK0NBRmI7T0FMRjtBQUFBLE1BUUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx5Q0FGYjtPQVRGO0FBQUEsTUFZQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDZCQUZiO09BYkY7S0FERjtBQUFBLElBa0JBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGdCQUFELENBQWtCLElBQWxCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHFCQUF4QixFQUErQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDN0MsY0FBQSxrQkFBQTtBQUFBLFVBRCtDLGdCQUFBLFVBQVUs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

//# sourceURL=/home/key/.atom/packages/file-icons/index.coffee
