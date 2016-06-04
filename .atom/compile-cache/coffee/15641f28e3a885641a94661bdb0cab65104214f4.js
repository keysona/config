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
          var fixAfterLoading, onSave, openedFile, workspace;
          workspace = atom.views.getView(atom.workspace);
          openedFile = editor.getPath();
          fixAfterLoading = function() {
            var onDone;
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
          };
          if (!openedFile) {
            return onSave = editor.onDidSave(function(file) {
              var fixIcon, onTerminate, tab;
              tab = workspace != null ? workspace.querySelector(".tab-bar > .active.tab > .title") : void 0;
              fixIcon = function() {
                var path;
                if (!(tab != null ? tab.dataset.path : void 0)) {
                  path = file.path;
                  tab.dataset.path = path;
                  tab.dataset.name = basename(path);
                  return fixAfterLoading();
                }
              };
              if (tab) {
                fixIcon();
              } else {
                onTerminate = editor.onDidTerminatePendingState(function() {
                  setTimeout((function() {
                    tab = workspace != null ? workspace.querySelector(".tab-bar > .active.tab > .title") : void 0;
                    return fixIcon();
                  }), 10);
                  return onTerminate.dispose();
                });
              }
              return onSave.dispose();
            });
          } else {
            return fixAfterLoading();
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
