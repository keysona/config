(function() {
  var GlobalExState;

  GlobalExState = (function() {
    function GlobalExState() {}

    GlobalExState.prototype.commandHistory = [];

    GlobalExState.prototype.setVim = function(vim) {
      this.vim = vim;
    };

    return GlobalExState;

  })();

  module.exports = GlobalExState;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL2dsb2JhbC1leC1zdGF0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsYUFBQTs7QUFBQSxFQUFNOytCQUNKOztBQUFBLDRCQUFBLGNBQUEsR0FBZ0IsRUFBaEIsQ0FBQTs7QUFBQSw0QkFDQSxNQUFBLEdBQVEsU0FBRSxHQUFGLEdBQUE7QUFBUSxNQUFQLElBQUMsQ0FBQSxNQUFBLEdBQU0sQ0FBUjtJQUFBLENBRFIsQ0FBQTs7eUJBQUE7O01BREYsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGFBSmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/ex-mode/lib/global-ex-state.coffee
