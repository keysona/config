(function() {
  var ColorParser, ColorScanner, countLines, getRegistry;

  countLines = require('./utils').countLines;

  getRegistry = require('./color-expressions').getRegistry;

  ColorParser = require('./color-parser');

  module.exports = ColorScanner = (function() {
    function ColorScanner(_arg) {
      this.context = (_arg != null ? _arg : {}).context;
      this.parser = this.context.parser;
      this.registry = this.context.registry;
    }

    ColorScanner.prototype.getRegExp = function() {
      return this.regexp = new RegExp(this.registry.getRegExp(), 'g');
    };

    ColorScanner.prototype.getRegExpForScope = function(scope) {
      return this.regexp = new RegExp(this.registry.getRegExpForScope(scope), 'g');
    };

    ColorScanner.prototype.search = function(text, scope, start) {
      var color, index, lastIndex, match, matchText;
      if (start == null) {
        start = 0;
      }
      this.regexp = this.getRegExpForScope(scope);
      this.regexp.lastIndex = start;
      if (match = this.regexp.exec(text)) {
        matchText = match[0];
        lastIndex = this.regexp.lastIndex;
        color = this.parser.parse(matchText, scope);
        if ((index = matchText.indexOf(color.colorExpression)) > 0) {
          lastIndex += -matchText.length + index + color.colorExpression.length;
          matchText = color.colorExpression;
        }
        return {
          color: color,
          match: matchText,
          lastIndex: lastIndex,
          range: [lastIndex - matchText.length, lastIndex],
          line: countLines(text.slice(0, +(lastIndex - matchText.length) + 1 || 9e9)) - 1
        };
      }
    };

    return ColorScanner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1zY2FubmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrREFBQTs7QUFBQSxFQUFDLGFBQWMsT0FBQSxDQUFRLFNBQVIsRUFBZCxVQUFELENBQUE7O0FBQUEsRUFDQyxjQUFlLE9BQUEsQ0FBUSxxQkFBUixFQUFmLFdBREQsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FGZCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0JBQUMsSUFBRCxHQUFBO0FBQ1gsTUFEYSxJQUFDLENBQUEsMEJBQUYsT0FBVyxJQUFULE9BQ2QsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQW5CLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQURyQixDQURXO0lBQUEsQ0FBYjs7QUFBQSwyQkFJQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQ1QsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBQSxDQUFQLEVBQThCLEdBQTlCLEVBREw7SUFBQSxDQUpYLENBQUE7O0FBQUEsMkJBT0EsaUJBQUEsR0FBbUIsU0FBQyxLQUFELEdBQUE7YUFDakIsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFWLENBQTRCLEtBQTVCLENBQVAsRUFBMkMsR0FBM0MsRUFERztJQUFBLENBUG5CLENBQUE7O0FBQUEsMkJBVUEsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxLQUFkLEdBQUE7QUFDTixVQUFBLHlDQUFBOztRQURvQixRQUFNO09BQzFCO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixLQUFuQixDQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixHQUFvQixLQURwQixDQUFBO0FBR0EsTUFBQSxJQUFHLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQVg7QUFDRSxRQUFDLFlBQWEsUUFBZCxDQUFBO0FBQUEsUUFDQyxZQUFhLElBQUMsQ0FBQSxPQUFkLFNBREQsQ0FBQTtBQUFBLFFBR0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLFNBQWQsRUFBeUIsS0FBekIsQ0FIUixDQUFBO0FBS0EsUUFBQSxJQUFHLENBQUMsS0FBQSxHQUFRLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEtBQUssQ0FBQyxlQUF4QixDQUFULENBQUEsR0FBcUQsQ0FBeEQ7QUFDRSxVQUFBLFNBQUEsSUFBYSxDQUFBLFNBQVUsQ0FBQyxNQUFYLEdBQW9CLEtBQXBCLEdBQTRCLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBL0QsQ0FBQTtBQUFBLFVBQ0EsU0FBQSxHQUFZLEtBQUssQ0FBQyxlQURsQixDQURGO1NBTEE7ZUFTQTtBQUFBLFVBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxVQUNBLEtBQUEsRUFBTyxTQURQO0FBQUEsVUFFQSxTQUFBLEVBQVcsU0FGWDtBQUFBLFVBR0EsS0FBQSxFQUFPLENBQ0wsU0FBQSxHQUFZLFNBQVMsQ0FBQyxNQURqQixFQUVMLFNBRkssQ0FIUDtBQUFBLFVBT0EsSUFBQSxFQUFNLFVBQUEsQ0FBVyxJQUFLLHFEQUFoQixDQUFBLEdBQW9ELENBUDFEO1VBVkY7T0FKTTtJQUFBLENBVlIsQ0FBQTs7d0JBQUE7O01BTkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/key/.atom/packages/pigments/lib/color-scanner.coffee
