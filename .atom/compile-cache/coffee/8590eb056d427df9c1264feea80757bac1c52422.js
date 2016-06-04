(function() {
  module.exports = {
    config: {
      pep8ExecutablePath: {
        type: 'string',
        "default": 'pep8'
      },
      maxLineLength: {
        type: 'integer',
        "default": 0
      },
      ignoreErrorCodes: {
        type: 'array',
        "default": [],
        description: 'For a list of code visit http://pep8.readthedocs.org/en/latest/intro.html#error-codes'
      },
      convertAllErrorsToWarnings: {
        type: 'boolean',
        "default": true
      }
    },
    activate: function() {
      return require('atom-package-deps').install();
    },
    provideLinter: function() {
      var helpers, provider;
      helpers = require('atom-linter');
      return provider = {
        name: 'pep8',
        grammarScopes: ['source.python'],
        scope: 'file',
        lintOnFly: true,
        lint: function(textEditor) {
          var filePath, ignoreCodes, maxLineLength, msgtype, parameters;
          filePath = textEditor.getPath();
          parameters = [];
          if (maxLineLength = atom.config.get('linter-pep8.maxLineLength')) {
            parameters.push("--max-line-length=" + maxLineLength);
          }
          if (ignoreCodes = atom.config.get('linter-pep8.ignoreErrorCodes')) {
            parameters.push("--ignore=" + (ignoreCodes.join(',')));
          }
          parameters.push('-');
          msgtype = atom.config.get('linter-pep8.convertAllErrorsToWarnings') ? 'Warning' : 'Error';
          return helpers.exec(atom.config.get('linter-pep8.pep8ExecutablePath'), parameters, {
            stdin: textEditor.getText()
          }).then(function(result) {
            var col, line, match, regex, toReturn;
            toReturn = [];
            regex = /stdin:(\d+):(\d+):(.*)/g;
            while ((match = regex.exec(result)) !== null) {
              line = parseInt(match[1]) || 0;
              col = parseInt(match[2]) || 0;
              toReturn.push({
                type: msgtype,
                text: match[3],
                filePath: filePath,
                range: [[line - 1, col - 1], [line - 1, col]]
              });
            }
            return toReturn;
          });
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1wZXA4L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsTUFEVDtPQURGO0FBQUEsTUFHQSxhQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsQ0FEVDtPQUpGO0FBQUEsTUFNQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx1RkFGYjtPQVBGO0FBQUEsTUFVQSwwQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7T0FYRjtLQURGO0FBQUEsSUFlQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsT0FBQSxDQUFRLG1CQUFSLENBQTRCLENBQUMsT0FBN0IsQ0FBQSxFQURRO0lBQUEsQ0FmVjtBQUFBLElBa0JBLGFBQUEsRUFBZSxTQUFBLEdBQUE7QUFDYixVQUFBLGlCQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGFBQVIsQ0FBVixDQUFBO2FBQ0EsUUFBQSxHQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sTUFBTjtBQUFBLFFBQ0EsYUFBQSxFQUFlLENBQUMsZUFBRCxDQURmO0FBQUEsUUFFQSxLQUFBLEVBQU8sTUFGUDtBQUFBLFFBR0EsU0FBQSxFQUFXLElBSFg7QUFBQSxRQUlBLElBQUEsRUFBTSxTQUFDLFVBQUQsR0FBQTtBQUNKLGNBQUEseURBQUE7QUFBQSxVQUFBLFFBQUEsR0FBVyxVQUFVLENBQUMsT0FBWCxDQUFBLENBQVgsQ0FBQTtBQUFBLFVBQ0EsVUFBQSxHQUFhLEVBRGIsQ0FBQTtBQUVBLFVBQUEsSUFBRyxhQUFBLEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQkFBaEIsQ0FBbkI7QUFDRSxZQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWlCLG9CQUFBLEdBQW9CLGFBQXJDLENBQUEsQ0FERjtXQUZBO0FBSUEsVUFBQSxJQUFHLFdBQUEsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCLENBQWpCO0FBQ0UsWUFBQSxVQUFVLENBQUMsSUFBWCxDQUFpQixXQUFBLEdBQVUsQ0FBQyxXQUFXLENBQUMsSUFBWixDQUFpQixHQUFqQixDQUFELENBQTNCLENBQUEsQ0FERjtXQUpBO0FBQUEsVUFNQSxVQUFVLENBQUMsSUFBWCxDQUFnQixHQUFoQixDQU5BLENBQUE7QUFBQSxVQU9BLE9BQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBQUgsR0FBa0UsU0FBbEUsR0FBaUYsT0FQM0YsQ0FBQTtBQVFBLGlCQUFPLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQUFiLEVBQWdFLFVBQWhFLEVBQTRFO0FBQUEsWUFBQyxLQUFBLEVBQU8sVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUFSO1dBQTVFLENBQTBHLENBQUMsSUFBM0csQ0FBZ0gsU0FBQyxNQUFELEdBQUE7QUFDckgsZ0JBQUEsaUNBQUE7QUFBQSxZQUFBLFFBQUEsR0FBVyxFQUFYLENBQUE7QUFBQSxZQUNBLEtBQUEsR0FBUSx5QkFEUixDQUFBO0FBRUEsbUJBQU0sQ0FBQyxLQUFBLEdBQVEsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLENBQVQsQ0FBQSxLQUFrQyxJQUF4QyxHQUFBO0FBQ0UsY0FBQSxJQUFBLEdBQU8sUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWYsQ0FBQSxJQUFzQixDQUE3QixDQUFBO0FBQUEsY0FDQSxHQUFBLEdBQU0sUUFBQSxDQUFTLEtBQU0sQ0FBQSxDQUFBLENBQWYsQ0FBQSxJQUFzQixDQUQ1QixDQUFBO0FBQUEsY0FFQSxRQUFRLENBQUMsSUFBVCxDQUFjO0FBQUEsZ0JBQ1osSUFBQSxFQUFNLE9BRE07QUFBQSxnQkFFWixJQUFBLEVBQU0sS0FBTSxDQUFBLENBQUEsQ0FGQTtBQUFBLGdCQUdaLFVBQUEsUUFIWTtBQUFBLGdCQUlaLEtBQUEsRUFBTyxDQUFDLENBQUMsSUFBQSxHQUFPLENBQVIsRUFBVyxHQUFBLEdBQU0sQ0FBakIsQ0FBRCxFQUFzQixDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsR0FBWCxDQUF0QixDQUpLO2VBQWQsQ0FGQSxDQURGO1lBQUEsQ0FGQTtBQVdBLG1CQUFPLFFBQVAsQ0FacUg7VUFBQSxDQUFoSCxDQUFQLENBVEk7UUFBQSxDQUpOO1FBSFc7SUFBQSxDQWxCZjtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/linter-pep8/lib/main.coffee
