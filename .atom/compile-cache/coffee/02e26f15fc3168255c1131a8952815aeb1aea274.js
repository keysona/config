(function() {
  var Color, Palette;

  require('./helpers/matchers');

  Color = require('../lib/color');

  Palette = require('../lib/palette');

  describe('Palette', function() {
    var colors, createVar, palette, _ref;
    _ref = [], palette = _ref[0], colors = _ref[1];
    createVar = function(name, color, path, line) {
      return {
        name: name,
        color: color,
        path: path,
        line: line
      };
    };
    beforeEach(function() {
      colors = [createVar('red', new Color('#ff0000'), 'file.styl', 0), createVar('green', new Color('#00ff00'), 'file.styl', 1), createVar('blue', new Color('#0000ff'), 'file.styl', 2), createVar('redCopy', new Color('#ff0000'), 'file.styl', 3), createVar('red', new Color('#ff0000'), 'file2.styl', 0)];
      return palette = new Palette(colors);
    });
    describe('::getColorsCount', function() {
      return it('returns the number of colors in the palette', function() {
        return expect(palette.getColorsCount()).toEqual(5);
      });
    });
    describe('::getColorsNames', function() {
      return it('returns the names of the colors in the palette', function() {
        return expect(palette.getColorsNames()).toEqual(['red', 'green', 'blue', 'redCopy', 'red']);
      });
    });
    describe('::sortedByName', function() {
      return it('returns the colors and names sorted by name', function() {
        return expect(palette.sortedByName()).toEqual([colors[2], colors[1], colors[0], colors[4], colors[3]]);
      });
    });
    return describe('::sortedByColor', function() {
      return it('returns the colors and names sorted by colors', function() {
        return expect(palette.sortedByColor()).toEqual([colors[0], colors[3], colors[4], colors[1], colors[2]]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvcGFsZXR0ZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxjQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFRLG9CQUFSLENBQUEsQ0FBQTs7QUFBQSxFQUVBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQUZSLENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGdCQUFSLENBSFYsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUEsR0FBQTtBQUNsQixRQUFBLGdDQUFBO0FBQUEsSUFBQSxPQUFvQixFQUFwQixFQUFDLGlCQUFELEVBQVUsZ0JBQVYsQ0FBQTtBQUFBLElBRUEsU0FBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxJQUFkLEVBQW9CLElBQXBCLEdBQUE7YUFDVjtBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxPQUFBLEtBQVA7QUFBQSxRQUFjLE1BQUEsSUFBZDtBQUFBLFFBQW9CLE1BQUEsSUFBcEI7UUFEVTtJQUFBLENBRlosQ0FBQTtBQUFBLElBS0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsTUFBQSxHQUFTLENBQ1AsU0FBQSxDQUFVLEtBQVYsRUFBcUIsSUFBQSxLQUFBLENBQU0sU0FBTixDQUFyQixFQUF1QyxXQUF2QyxFQUFvRCxDQUFwRCxDQURPLEVBRVAsU0FBQSxDQUFVLE9BQVYsRUFBdUIsSUFBQSxLQUFBLENBQU0sU0FBTixDQUF2QixFQUF5QyxXQUF6QyxFQUFzRCxDQUF0RCxDQUZPLEVBR1AsU0FBQSxDQUFVLE1BQVYsRUFBc0IsSUFBQSxLQUFBLENBQU0sU0FBTixDQUF0QixFQUF3QyxXQUF4QyxFQUFxRCxDQUFyRCxDQUhPLEVBSVAsU0FBQSxDQUFVLFNBQVYsRUFBeUIsSUFBQSxLQUFBLENBQU0sU0FBTixDQUF6QixFQUEyQyxXQUEzQyxFQUF3RCxDQUF4RCxDQUpPLEVBS1AsU0FBQSxDQUFVLEtBQVYsRUFBcUIsSUFBQSxLQUFBLENBQU0sU0FBTixDQUFyQixFQUF1QyxZQUF2QyxFQUFxRCxDQUFyRCxDQUxPLENBQVQsQ0FBQTthQU9BLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FBUSxNQUFSLEVBUkw7SUFBQSxDQUFYLENBTEEsQ0FBQTtBQUFBLElBZUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTthQUMzQixFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQSxHQUFBO2VBQ2hELE1BQUEsQ0FBTyxPQUFPLENBQUMsY0FBUixDQUFBLENBQVAsQ0FBZ0MsQ0FBQyxPQUFqQyxDQUF5QyxDQUF6QyxFQURnRDtNQUFBLENBQWxELEVBRDJCO0lBQUEsQ0FBN0IsQ0FmQSxDQUFBO0FBQUEsSUFtQkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTthQUMzQixFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO2VBQ25ELE1BQUEsQ0FBTyxPQUFPLENBQUMsY0FBUixDQUFBLENBQVAsQ0FBZ0MsQ0FBQyxPQUFqQyxDQUF5QyxDQUN2QyxLQUR1QyxFQUV2QyxPQUZ1QyxFQUd2QyxNQUh1QyxFQUl2QyxTQUp1QyxFQUt2QyxLQUx1QyxDQUF6QyxFQURtRDtNQUFBLENBQXJELEVBRDJCO0lBQUEsQ0FBN0IsQ0FuQkEsQ0FBQTtBQUFBLElBNkJBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7YUFDekIsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUEsR0FBQTtlQUNoRCxNQUFBLENBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBQSxDQUFQLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsQ0FDckMsTUFBTyxDQUFBLENBQUEsQ0FEOEIsRUFFckMsTUFBTyxDQUFBLENBQUEsQ0FGOEIsRUFHckMsTUFBTyxDQUFBLENBQUEsQ0FIOEIsRUFJckMsTUFBTyxDQUFBLENBQUEsQ0FKOEIsRUFLckMsTUFBTyxDQUFBLENBQUEsQ0FMOEIsQ0FBdkMsRUFEZ0Q7TUFBQSxDQUFsRCxFQUR5QjtJQUFBLENBQTNCLENBN0JBLENBQUE7V0F1Q0EsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTthQUMxQixFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO2VBQ2xELE1BQUEsQ0FBTyxPQUFPLENBQUMsYUFBUixDQUFBLENBQVAsQ0FBK0IsQ0FBQyxPQUFoQyxDQUF3QyxDQUN0QyxNQUFPLENBQUEsQ0FBQSxDQUQrQixFQUV0QyxNQUFPLENBQUEsQ0FBQSxDQUYrQixFQUd0QyxNQUFPLENBQUEsQ0FBQSxDQUgrQixFQUl0QyxNQUFPLENBQUEsQ0FBQSxDQUorQixFQUt0QyxNQUFPLENBQUEsQ0FBQSxDQUwrQixDQUF4QyxFQURrRDtNQUFBLENBQXBELEVBRDBCO0lBQUEsQ0FBNUIsRUF4Q2tCO0VBQUEsQ0FBcEIsQ0FMQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/pigments/spec/palette-spec.coffee
