(function() {
  var path;

  path = require('path');

  module.exports = function(p) {
    if (p.match(/\/\.pigments$/)) {
      return 'pigments';
    }
    return path.extname(p).slice(1);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9zY29wZS1mcm9tLWZpbGUtbmFtZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsSUFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLENBQUQsR0FBQTtBQUNmLElBQUEsSUFBcUIsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxlQUFSLENBQXJCO0FBQUEsYUFBTyxVQUFQLENBQUE7S0FBQTtXQUNBLElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYixDQUFnQixVQUZEO0VBQUEsQ0FEakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/key/.atom/packages/pigments/lib/scope-from-file-name.coffee
