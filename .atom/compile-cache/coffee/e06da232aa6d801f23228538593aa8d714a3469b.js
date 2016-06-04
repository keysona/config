(function() {
  var Color, ColorExpression, createVariableRegExpString;

  Color = require('./color');

  createVariableRegExpString = require('./regexes').createVariableRegExpString;

  module.exports = ColorExpression = (function() {
    ColorExpression.colorExpressionForContext = function(context) {
      return this.colorExpressionForColorVariables(context.getColorVariables());
    };

    ColorExpression.colorExpressionRegexpForColorVariables = function(colorVariables) {
      return createVariableRegExpString(colorVariables);
    };

    ColorExpression.colorExpressionForColorVariables = function(colorVariables) {
      var paletteRegexpString;
      paletteRegexpString = this.colorExpressionRegexpForColorVariables(colorVariables);
      return new ColorExpression({
        name: 'pigments:variables',
        regexpString: paletteRegexpString,
        scopes: ['*'],
        priority: 1,
        handle: function(match, expression, context) {
          var baseColor, evaluated, name, _;
          _ = match[0], name = match[1];
          evaluated = context.readColorExpression(name);
          if (evaluated === name) {
            return this.invalid = true;
          }
          baseColor = context.readColor(evaluated);
          this.colorExpression = name;
          this.variables = baseColor != null ? baseColor.variables : void 0;
          if (context.isInvalid(baseColor)) {
            return this.invalid = true;
          }
          return this.rgba = baseColor.rgba;
        }
      });
    };

    function ColorExpression(_arg) {
      this.name = _arg.name, this.regexpString = _arg.regexpString, this.scopes = _arg.scopes, this.priority = _arg.priority, this.handle = _arg.handle;
      this.regexp = new RegExp("^" + this.regexpString + "$");
    }

    ColorExpression.prototype.match = function(expression) {
      return this.regexp.test(expression);
    };

    ColorExpression.prototype.parse = function(expression, context) {
      var color;
      if (!this.match(expression)) {
        return null;
      }
      color = new Color();
      color.colorExpression = expression;
      color.expressionHandler = this.name;
      this.handle.call(color, this.regexp.exec(expression), expression, context);
      return color;
    };

    ColorExpression.prototype.search = function(text, start) {
      var lastIndex, match, range, re, results, _ref;
      if (start == null) {
        start = 0;
      }
      results = void 0;
      re = new RegExp(this.regexpString, 'g');
      re.lastIndex = start;
      if (_ref = re.exec(text), match = _ref[0], _ref) {
        lastIndex = re.lastIndex;
        range = [lastIndex - match.length, lastIndex];
        results = {
          range: range,
          match: text.slice(range[0], range[1])
        };
      }
      return results;
    };

    return ColorExpression;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1leHByZXNzaW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrREFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUixDQUFSLENBQUE7O0FBQUEsRUFDQyw2QkFBOEIsT0FBQSxDQUFRLFdBQVIsRUFBOUIsMEJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLGVBQUMsQ0FBQSx5QkFBRCxHQUE0QixTQUFDLE9BQUQsR0FBQTthQUMxQixJQUFDLENBQUEsZ0NBQUQsQ0FBa0MsT0FBTyxDQUFDLGlCQUFSLENBQUEsQ0FBbEMsRUFEMEI7SUFBQSxDQUE1QixDQUFBOztBQUFBLElBR0EsZUFBQyxDQUFBLHNDQUFELEdBQXlDLFNBQUMsY0FBRCxHQUFBO2FBQ3ZDLDBCQUFBLENBQTJCLGNBQTNCLEVBRHVDO0lBQUEsQ0FIekMsQ0FBQTs7QUFBQSxJQU1BLGVBQUMsQ0FBQSxnQ0FBRCxHQUFtQyxTQUFDLGNBQUQsR0FBQTtBQUNqQyxVQUFBLG1CQUFBO0FBQUEsTUFBQSxtQkFBQSxHQUFzQixJQUFDLENBQUEsc0NBQUQsQ0FBd0MsY0FBeEMsQ0FBdEIsQ0FBQTthQUVJLElBQUEsZUFBQSxDQUNGO0FBQUEsUUFBQSxJQUFBLEVBQU0sb0JBQU47QUFBQSxRQUNBLFlBQUEsRUFBYyxtQkFEZDtBQUFBLFFBRUEsTUFBQSxFQUFRLENBQUMsR0FBRCxDQUZSO0FBQUEsUUFHQSxRQUFBLEVBQVUsQ0FIVjtBQUFBLFFBSUEsTUFBQSxFQUFRLFNBQUMsS0FBRCxFQUFRLFVBQVIsRUFBb0IsT0FBcEIsR0FBQTtBQUNOLGNBQUEsNkJBQUE7QUFBQSxVQUFDLFlBQUQsRUFBRyxlQUFILENBQUE7QUFB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

//# sourceURL=/home/key/.atom/packages/pigments/lib/color-expression.coffee
