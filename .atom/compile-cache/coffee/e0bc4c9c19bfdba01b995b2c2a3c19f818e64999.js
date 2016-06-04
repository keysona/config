(function() {
  var ExpressionsRegistry, PathScanner, VariableExpression, VariableScanner, async, fs;

  async = require('async');

  fs = require('fs');

  VariableScanner = require('../variable-scanner');

  VariableExpression = require('../variable-expression');

  ExpressionsRegistry = require('../expressions-registry');

  PathScanner = (function() {
    function PathScanner(path, registry) {
      this.path = path;
      this.scanner = new VariableScanner({
        registry: registry
      });
    }

    PathScanner.prototype.load = function(done) {
      var currentChunk, currentLine, currentOffset, lastIndex, line, readStream, results;
      currentChunk = '';
      currentLine = 0;
      currentOffset = 0;
      lastIndex = 0;
      line = 0;
      results = [];
      readStream = fs.createReadStream(this.path);
      readStream.on('data', (function(_this) {
        return function(chunk) {
          var index, lastLine, result, v, _i, _len;
          currentChunk += chunk.toString();
          index = lastIndex;
          while (result = _this.scanner.search(currentChunk, lastIndex)) {
            result.range[0] += index;
            result.range[1] += index;
            for (_i = 0, _len = result.length; _i < _len; _i++) {
              v = result[_i];
              v.path = _this.path;
              v.range[0] += index;
              v.range[1] += index;
              v.definitionRange = result.range;
              v.line += line;
              lastLine = v.line;
            }
            results = results.concat(result);
            lastIndex = result.lastIndex;
          }
          if (result != null) {
            currentChunk = currentChunk.slice(lastIndex);
            line = lastLine;
            return lastIndex = 0;
          }
        };
      })(this));
      return readStream.on('end', function() {
        emit('scan-paths:path-scanned', results);
        return done();
      });
    };

    return PathScanner;

  })();

  module.exports = function(_arg) {
    var paths, registry;
    paths = _arg[0], registry = _arg[1];
    registry = ExpressionsRegistry.deserialize(registry, VariableExpression);
    return async.each(paths, function(path, next) {
      return new PathScanner(path, registry).load(next);
    }, this.async());
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi90YXNrcy9zY2FuLXBhdGhzLWhhbmRsZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdGQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUixDQUZsQixDQUFBOztBQUFBLEVBR0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSLENBSHJCLENBQUE7O0FBQUEsRUFJQSxtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVIsQ0FKdEIsQ0FBQTs7QUFBQSxFQU1NO0FBQ1MsSUFBQSxxQkFBRSxJQUFGLEVBQVEsUUFBUixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsT0FBQSxJQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQWUsSUFBQSxlQUFBLENBQWdCO0FBQUEsUUFBQyxVQUFBLFFBQUQ7T0FBaEIsQ0FBZixDQURXO0lBQUEsQ0FBYjs7QUFBQSwwQkFHQSxJQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7QUFDSixVQUFBLDhFQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsRUFBZixDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWMsQ0FEZCxDQUFBO0FBQUEsTUFFQSxhQUFBLEdBQWdCLENBRmhCLENBQUE7QUFBQSxNQUdBLFNBQUEsR0FBWSxDQUhaLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxDQUpQLENBQUE7QUFBQSxNQUtBLE9BQUEsR0FBVSxFQUxWLENBQUE7QUFBQSxNQU9BLFVBQUEsR0FBYSxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsSUFBQyxDQUFB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

//# sourceURL=/home/key/.atom/packages/pigments/lib/tasks/scan-paths-handler.coffee
