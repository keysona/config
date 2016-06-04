(function() {
  var StatusBarView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = StatusBarView = (function() {
    function StatusBarView() {
      this.removeElement = __bind(this.removeElement, this);
      this.getElement = __bind(this.getElement, this);
      this.element = document.createElement('div');
      this.element.classList.add("highlight-selected-status", "inline-block");
    }

    StatusBarView.prototype.updateCount = function(count) {
      this.element.textContent = "Highlighted: " + count;
      if (count === 0) {
        return this.element.classList.add("highlight-selected-hidden");
      } else {
        return this.element.classList.remove("highlight-selected-hidden");
      }
    };

    StatusBarView.prototype.getElement = function() {
      return this.element;
    };

    StatusBarView.prototype.removeElement = function() {
      this.element.parentNode.removeChild(this.element);
      return this.element = null;
    };

    return StatusBarView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2hpZ2hsaWdodC1zZWxlY3RlZC9saWIvc3RhdHVzLWJhci12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxhQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSx1QkFBQSxHQUFBO0FBQ1gsMkRBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QiwyQkFBdkIsRUFBbUQsY0FBbkQsQ0FEQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSw0QkFJQSxXQUFBLEdBQWEsU0FBQyxLQUFELEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxHQUF1QixlQUFBLEdBQWtCLEtBQXpDLENBQUE7QUFDQSxNQUFBLElBQUcsS0FBQSxLQUFTLENBQVo7ZUFDRSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QiwyQkFBdkIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFuQixDQUEwQiwyQkFBMUIsRUFIRjtPQUZXO0lBQUEsQ0FKYixDQUFBOztBQUFBLDRCQVdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsUUFEUztJQUFBLENBWFosQ0FBQTs7QUFBQSw0QkFjQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFwQixDQUFnQyxJQUFDLENBQUEsT0FBakMsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQUZFO0lBQUEsQ0FkZixDQUFBOzt5QkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/highlight-selected/lib/status-bar-view.coffee
