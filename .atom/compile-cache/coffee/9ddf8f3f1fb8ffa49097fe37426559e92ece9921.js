(function() {
  var SearchHistoryManager, globalState, settings, _;

  _ = require('underscore-plus');

  globalState = require('./global-state');

  settings = require('./settings');

  module.exports = SearchHistoryManager = (function() {
    SearchHistoryManager.prototype.idx = null;

    function SearchHistoryManager(vimState) {
      this.vimState = vimState;
      this.idx = -1;
    }

    SearchHistoryManager.prototype.get = function(direction) {
      var _ref;
      switch (direction) {
        case 'prev':
          if ((this.idx + 1) !== this.getSize()) {
            this.idx += 1;
          }
          break;
        case 'next':
          if (!(this.idx === -1)) {
            this.idx -= 1;
          }
      }
      return (_ref = globalState.searchHistory[this.idx]) != null ? _ref : '';
    };

    SearchHistoryManager.prototype.save = function(entry) {
      if (_.isEmpty(entry)) {
        return;
      }
      this.replaceEntries(_.uniq([entry].concat(this.getEntries())));
      if (this.getSize() > settings.get('historySize')) {
        return this.getEntries().splice(settings.get('historySize'));
      }
    };

    SearchHistoryManager.prototype.reset = function() {
      return this.idx = -1;
    };

    SearchHistoryManager.prototype.clear = function() {
      return this.replaceEntries([]);
    };

    SearchHistoryManager.prototype.getSize = function() {
      return this.getEntries().length;
    };

    SearchHistoryManager.prototype.getEntries = function() {
      return globalState.searchHistory;
    };

    SearchHistoryManager.prototype.replaceEntries = function(entries) {
      return globalState.searchHistory = entries;
    };

    SearchHistoryManager.prototype.destroy = function() {
      return this.idx = null;
    };

    return SearchHistoryManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlYXJjaC1oaXN0b3J5LW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osbUNBQUEsR0FBQSxHQUFLLElBQUwsQ0FBQTs7QUFFYSxJQUFBLDhCQUFFLFFBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsQ0FBUCxDQURXO0lBQUEsQ0FGYjs7QUFBQSxtQ0FLQSxHQUFBLEdBQUssU0FBQyxTQUFELEdBQUE7QUFDSCxVQUFBLElBQUE7QUFBQSxjQUFPLFNBQVA7QUFBQSxhQUNPLE1BRFA7QUFDbUIsVUFBQSxJQUFpQixDQUFDLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBUixDQUFBLEtBQWMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUEvQjtBQUFBLFlBQUEsSUFBQyxDQUFBLEdBQUQsSUFBUSxDQUFSLENBQUE7V0FEbkI7QUFDTztBQURQLGFBRU8sTUFGUDtBQUVtQixVQUFBLElBQUEsQ0FBQSxDQUFrQixJQUFDLENBQUEsR0FBRCxLQUFRLENBQUEsQ0FBVCxDQUFqQjtBQUFBLFlBQUEsSUFBQyxDQUFBLEdBQUQsSUFBUSxDQUFSLENBQUE7V0FGbkI7QUFBQSxPQUFBOzJFQUdrQyxHQUovQjtJQUFBLENBTEwsQ0FBQTs7QUFBQSxtQ0FXQSxJQUFBLEdBQU0sU0FBQyxLQUFELEdBQUE7QUFDSixNQUFBLElBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLENBQVY7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFDLEtBQUQsQ0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWYsQ0FBUCxDQUFoQixDQURBLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLEdBQWEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxhQUFiLENBQWhCO2VBQ0UsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFhLENBQUMsTUFBZCxDQUFxQixRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBckIsRUFERjtPQUhJO0lBQUEsQ0FYTixDQUFBOztBQUFBLG1DQWlCQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFBLEVBREY7SUFBQSxDQWpCUCxDQUFBOztBQUFBLG1DQW9CQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsRUFBaEIsRUFESztJQUFBLENBcEJQLENBQUE7O0FBQUEsbUNBdUJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsVUFBRCxDQUFBLENBQWEsQ0FBQyxPQURQO0lBQUEsQ0F2QlQsQ0FBQTs7QUFBQSxtQ0EwQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLFdBQVcsQ0FBQyxjQURGO0lBQUEsQ0ExQlosQ0FBQTs7QUFBQSxtQ0E2QkEsY0FBQSxHQUFnQixTQUFDLE9BQUQsR0FBQTthQUNkLFdBQVcsQ0FBQyxhQUFaLEdBQTRCLFFBRGQ7SUFBQSxDQTdCaEIsQ0FBQTs7QUFBQSxtQ0FnQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxHQUFELEdBQU8sS0FEQTtJQUFBLENBaENULENBQUE7O2dDQUFBOztNQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/search-history-manager.coffee
