(function() {
  var ElementBuilder, StatusBarManager, modeToContent;

  ElementBuilder = require('./utils').ElementBuilder;

  modeToContent = {
    "normal": "Normal",
    'insert': "Insert",
    'insert.replace': "Replace",
    'visual': "Visual",
    "visual.characterwise": "Visual Char",
    "visual.linewise": "Visual Line",
    "visual.blockwise": "Visual Block"
  };

  module.exports = StatusBarManager = (function() {
    ElementBuilder.includeInto(StatusBarManager);

    StatusBarManager.prototype.prefix = 'status-bar-vim-mode-plus';

    function StatusBarManager() {
      this.container = this.div({
        id: "" + this.prefix + "-container",
        classList: ['inline-block']
      });
      this.container.appendChild(this.element = this.div({
        id: this.prefix
      }));
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(mode, submode) {
      var modeString;
      modeString = mode;
      if (submode != null) {
        modeString += "." + submode;
      }
      this.element.className = "" + this.prefix + "-" + mode;
      return this.element.textContent = modeToContent[modeString];
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3N0YXR1cy1iYXItbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0NBQUE7O0FBQUEsRUFBQyxpQkFBa0IsT0FBQSxDQUFRLFNBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBRUEsYUFBQSxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsUUFBVjtBQUFBLElBQ0EsUUFBQSxFQUFVLFFBRFY7QUFBQSxJQUVBLGdCQUFBLEVBQWtCLFNBRmxCO0FBQUEsSUFHQSxRQUFBLEVBQVUsUUFIVjtBQUFBLElBSUEsc0JBQUEsRUFBd0IsYUFKeEI7QUFBQSxJQUtBLGlCQUFBLEVBQW1CLGFBTG5CO0FBQUEsSUFNQSxrQkFBQSxFQUFvQixjQU5wQjtHQUhGLENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxjQUFjLENBQUMsV0FBZixDQUEyQixnQkFBM0IsQ0FBQSxDQUFBOztBQUFBLCtCQUNBLE1BQUEsR0FBUSwwQkFEUixDQUFBOztBQUdhLElBQUEsMEJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxFQUFBLEVBQUksRUFBQSxHQUFHLElBQUMsQ0FBQSxNQUFKLEdBQVcsWUFBZjtBQUFBLFFBQTRCLFNBQUEsRUFBVyxDQUFDLGNBQUQsQ0FBdkM7T0FBTCxDQUFiLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUF1QixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLEVBQUEsRUFBSSxJQUFDLENBQUEsTUFBTDtPQUFMLENBQWxDLENBREEsQ0FEVztJQUFBLENBSGI7O0FBQUEsK0JBT0EsVUFBQSxHQUFZLFNBQUUsU0FBRixHQUFBO0FBQWMsTUFBYixJQUFDLENBQUEsWUFBQSxTQUFZLENBQWQ7SUFBQSxDQVBaLENBQUE7O0FBQUEsK0JBU0EsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTtBQUNOLFVBQUEsVUFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLElBQWIsQ0FBQTtBQUNBLE1BQUEsSUFBK0IsZUFBL0I7QUFBQSxRQUFBLFVBQUEsSUFBYyxHQUFBLEdBQU0sT0FBcEIsQ0FBQTtPQURBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsRUFBQSxHQUFHLElBQUMsQ0FBQSxNQUFKLEdBQVcsR0FBWCxHQUFjLElBRm5DLENBQUE7YUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUIsYUFBYyxDQUFBLFVBQUEsRUFKL0I7SUFBQSxDQVRSLENBQUE7O0FBQUEsK0JBZUEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQVA7QUFBQSxRQUFrQixRQUFBLEVBQVUsRUFBNUI7T0FBeEIsRUFERjtJQUFBLENBZlIsQ0FBQTs7QUFBQSwrQkFrQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLEVBRE07SUFBQSxDQWxCUixDQUFBOzs0QkFBQTs7TUFiRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/status-bar-manager.coffee
