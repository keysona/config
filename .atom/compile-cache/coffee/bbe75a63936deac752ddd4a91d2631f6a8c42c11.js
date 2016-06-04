(function() {
  var decimal, float, int, namePrefixes, percent, variables;

  int = '\\d+';

  decimal = "\\." + int;

  float = "(?:" + int + decimal + "|" + int + "|" + decimal + ")";

  percent = "" + float + "%";

  variables = '(?:@[a-zA-Z0-9\\-_]+|\\$[a-zA-Z0-9\\-_]+|[a-zA-Z_][a-zA-Z0-9\\-_]*)';

  namePrefixes = '^| |\\t|:|=|,|\\n|\'|"|\\(|\\[|\\{|>';

  module.exports = {
    int: int,
    float: float,
    percent: percent,
    optionalPercent: "" + float + "%?",
    intOrPercent: "(?:" + percent + "|" + int + ")",
    floatOrPercent: "(?:" + percent + "|" + float + ")",
    comma: '\\s*,\\s*',
    notQuote: "[^\"'\\n\\r]+",
    hexadecimal: '[\\da-fA-F]',
    ps: '\\(\\s*',
    pe: '\\s*\\)',
    variables: variables,
    namePrefixes: namePrefixes,
    createVariableRegExpString: function(variables) {
      var v, variableNames, _i, _len;
      variableNames = [];
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        v = variables[_i];
        variableNames.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
      }
      variableNames = variableNames.join('|');
      return "(?:" + namePrefixes + ")(" + variableNames + ")(\\s+!default)?(?!_|-|\\w|\\d|[ \\t]*[\\.:=])";
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZWdleGVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxREFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxNQUFOLENBQUE7O0FBQUEsRUFDQSxPQUFBLEdBQVcsS0FBQSxHQUFLLEdBRGhCLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVMsS0FBQSxHQUFLLEdBQUwsR0FBVyxPQUFYLEdBQW1CLEdBQW5CLEdBQXNCLEdBQXRCLEdBQTBCLEdBQTFCLEdBQTZCLE9BQTdCLEdBQXFDLEdBRjlDLENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsRUFBQSxHQUFHLEtBQUgsR0FBUyxHQUhuQixDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFZLHFFQUpaLENBQUE7O0FBQUEsRUFLQSxZQUFBLEdBQWUsc0NBTGYsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLEdBQUEsRUFBSyxHQUFMO0FBQUEsSUFDQSxLQUFBLEVBQU8sS0FEUDtBQUFBLElBRUEsT0FBQSxFQUFTLE9BRlQ7QUFBQSxJQUdBLGVBQUEsRUFBaUIsRUFBQSxHQUFHLEtBQUgsR0FBUyxJQUgxQjtBQUFBLElBSUEsWUFBQSxFQUFlLEtBQUEsR0FBSyxPQUFMLEdBQWEsR0FBYixHQUFnQixHQUFoQixHQUFvQixHQUpuQztBQUFBLElBS0EsY0FBQSxFQUFpQixLQUFBLEdBQUssT0FBTCxHQUFhLEdBQWIsR0FBZ0IsS0FBaEIsR0FBc0IsR0FMdkM7QUFBQSxJQU1BLEtBQUEsRUFBTyxXQU5QO0FBQUEsSUFPQSxRQUFBLEVBQVUsZUFQVjtBQUFBLElBUUEsV0FBQSxFQUFhLGFBUmI7QUFBQSxJQVNBLEVBQUEsRUFBSSxTQVRKO0FBQUEsSUFVQSxFQUFBLEVBQUksU0FWSjtBQUFBLElBV0EsU0FBQSxFQUFXLFNBWFg7QUFBQSxJQVlBLFlBQUEsRUFBYyxZQVpkO0FBQUEsSUFhQSwwQkFBQSxFQUE0QixTQUFDLFNBQUQsR0FBQTtBQUMxQixVQUFBLDBCQUFBO0FBQUEsTUFBQSxhQUFBLEdBQWdCLEVBQWhCLENBQUE7QUFDQSxXQUFBLGdEQUFBOzBCQUFBO0FBQ0UsUUFBQSxhQUFhLENBQUMsSUFBZCxDQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQVAsQ0FBZSxvQ0FBZixFQUFxRCxNQUFyRCxDQUFuQixDQUFBLENBREY7QUFBQSxPQURBO0FBQUEsTUFHQSxhQUFBLEdBQWdCLGFBQWEsQ0FBQyxJQUFkLENBQW1CLEdBQW5CLENBSGhCLENBQUE7YUFLQyxLQUFBLEdBQUssWUFBTCxHQUFrQixJQUFsQixHQUFzQixhQUF0QixHQUFvQyxpREFOWDtJQUFBLENBYjVCO0dBUkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/key/.atom/packages/pigments/lib/regexes.coffee
