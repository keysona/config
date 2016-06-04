(function() {
  var VariableParser, registry;

  VariableParser = require('../lib/variable-parser');

  registry = require('../lib/variable-expressions');

  describe('VariableParser', function() {
    var itParses, parser;
    parser = [][0];
    itParses = function(expression) {
      return {
        as: function(variables) {
          it("parses '" + expression + "' as variables " + (jasmine.pp(variables)), function() {
            var expected, name, range, results, value, _i, _len, _ref, _results;
            results = parser.parse(expression);
            expect(results.length).toEqual(Object.keys(variables).length);
            _results = [];
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              _ref = results[_i], name = _ref.name, value = _ref.value, range = _ref.range;
              expected = variables[name];
              if (expected.value != null) {
                _results.push(expect(value).toEqual(expected.value));
              } else if (expected.range != null) {
                _results.push(expect(range).toEqual(expected.range));
              } else {
                _results.push(expect(value).toEqual(expected));
              }
            }
            return _results;
          });
          return this;
        },
        asUndefined: function() {
          return it("does not parse '" + expression + "' as a variable expression", function() {
            var results;
            results = parser.parse(expression);
            return expect(results).toBeUndefined();
          });
        }
      };
    };
    beforeEach(function() {
      return parser = new VariableParser(registry);
    });
    itParses('color = white').as({
      'color': 'white'
    });
    itParses('non-color = 10px').as({
      'non-color': '10px'
    });
    itParses('$color: white').as({
      '$color': 'white'
    });
    itParses('$color  : white').as({
      '$color': 'white'
    });
    itParses('$some-color: white;').as({
      '$some-color': 'white',
      '$some_color': 'white'
    });
    itParses('$some_color  : white').as({
      '$some-color': 'white',
      '$some_color': 'white'
    });
    itParses('$non-color: 10px;').as({
      '$non-color': '10px',
      '$non_color': '10px'
    });
    itParses('$non_color: 10px').as({
      '$non-color': '10px',
      '$non_color': '10px'
    });
    itParses('@color: white;').as({
      '@color': 'white'
    });
    itParses('@non-color: 10px;').as({
      '@non-color': '10px'
    });
    itParses('@non--color: 10px;').as({
      '@non--color': '10px'
    });
    itParses('--color: white;').as({
      'var(--color)': 'white'
    });
    itParses('--non-color: 10px;').as({
      'var(--non-color)': '10px'
    });
    itParses('\n.error--large(@color: red) {\n  background-color: @color;\n}').asUndefined();
    return itParses("colors = {\n  red: rgb(255,0,0),\n  green: rgb(0,255,0),\n  blue: rgb(0,0,255)\n  value: 10px\n  light: {\n    base: lightgrey\n  }\n  dark: {\n    base: slategrey\n  }\n}").as({
      'colors.red': {
        value: 'rgb(255,0,0)',
        range: [[1, 2], [1, 14]]
      },
      'colors.green': {
        value: 'rgb(0,255,0)',
        range: [[2, 2], [2, 16]]
      },
      'colors.blue': {
        value: 'rgb(0,0,255)',
        range: [[3, 2], [3, 15]]
      },
      'colors.value': {
        value: '10px',
        range: [[4, 2], [4, 13]]
      },
      'colors.light.base': {
        value: 'lightgrey',
        range: [[9, 4], [9, 17]]
      },
      'colors.dark.base': {
        value: 'slategrey',
        range: [[12, 4], [12, 14]]
      }
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvdmFyaWFibGUtcGFyc2VyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsd0JBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsNkJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixRQUFBLGdCQUFBO0FBQUEsSUFBQyxTQUFVLEtBQVgsQ0FBQTtBQUFBLElBRUEsUUFBQSxHQUFXLFNBQUMsVUFBRCxHQUFBO2FBQ1Q7QUFBQSxRQUFBLEVBQUEsRUFBSSxTQUFDLFNBQUQsR0FBQTtBQUNGLFVBQUEsRUFBQSxDQUFJLFVBQUEsR0FBVSxVQUFWLEdBQXFCLGlCQUFyQixHQUFxQyxDQUFDLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxDQUFELENBQXpDLEVBQW1FLFNBQUEsR0FBQTtBQUNqRSxnQkFBQSwrREFBQTtBQUFBLFlBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxLQUFQLENBQWEsVUFBYixDQUFWLENBQUE7QUFBQSxZQUVBLE1BQUEsQ0FBTyxPQUFPLENBQUMsTUFBZixDQUFzQixDQUFDLE9BQXZCLENBQStCLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFzQixDQUFDLE1BQXRELENBRkEsQ0FBQTtBQUdBO2lCQUFBLDhDQUFBLEdBQUE7QUFDRSxrQ0FERyxZQUFBLE1BQU0sYUFBQSxPQUFPLGFBQUEsS0FDaEIsQ0FBQTtBQUFBLGNBQUEsUUFBQSxHQUFXLFNBQVUsQ0FBQSxJQUFBLENBQXJCLENBQUE7QUFDQSxjQUFBLElBQUcsc0JBQUg7OEJBQ0UsTUFBQSxDQUFPLEtB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

//# sourceURL=/home/key/.atom/packages/pigments/spec/variable-parser-spec.coffee
