(function() {
  var extractRange, fs, path, tokenizedLineForRow,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  tokenizedLineForRow = function(textEditor, lineNumber) {
    return textEditor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(lineNumber);
  };

  fs = require('fs');

  path = require('path');

  extractRange = function(_arg) {
    var code, colNumber, foundDecorator, foundImport, lineNumber, message, offset, screenLine, symbol, textEditor, token, tokenizedLine, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    code = _arg.code, message = _arg.message, lineNumber = _arg.lineNumber, colNumber = _arg.colNumber, textEditor = _arg.textEditor;
    switch (code) {
      case 'C901':
        symbol = /'(?:[^.]+\.)?([^']+)'/.exec(message)[1];
        while (true) {
          offset = 0;
          tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
          if (tokenizedLine === void 0) {
            break;
          }
          foundDecorator = false;
          _ref = tokenizedLine.tokens;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            token = _ref[_i];
            if (__indexOf.call(token.scopes, 'meta.function.python') >= 0) {
              if (token.value === symbol) {
                return [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
              }
            }
            if (__indexOf.call(token.scopes, 'meta.function.decorator.python') >= 0) {
              foundDecorator = true;
            }
            offset += token.bufferDelta;
          }
          if (!foundDecorator) {
            break;
          }
          lineNumber += 1;
        }
        break;
      case 'E125':
      case 'E127':
      case 'E128':
      case 'E131':
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref1 = tokenizedLine.tokens;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          token = _ref1[_j];
          if (!token.firstNonWhitespaceIndex) {
            return [[lineNumber, 0], [lineNumber, offset]];
          }
          if (token.firstNonWhitespaceIndex !== token.bufferDelta) {
            return [[lineNumber, 0], [lineNumber, offset + token.firstNonWhitespaceIndex]];
          }
          offset += token.bufferDelta;
        }
        break;
      case 'E262':
      case 'E265':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 1]];
      case 'F401':
        symbol = /'([^']+)'/.exec(message)[1];
        foundImport = false;
        while (true) {
          offset = 0;
          tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
          if (tokenizedLine === void 0) {
            break;
          }
          _ref2 = tokenizedLine.tokens;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            token = _ref2[_k];
            if (foundImport && token.value === symbol) {
              return [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
            }
            if (token.value === 'import' && __indexOf.call(token.scopes, 'keyword.control.import.python') >= 0) {
              foundImport = true;
            }
            offset += token.bufferDelta;
          }
          lineNumber += 1;
        }
        break;
      case 'F821':
      case 'F841':
        symbol = /'([^']+)'/.exec(message)[1];
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref3 = tokenizedLine.tokens;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          token = _ref3[_l];
          if (token.value === symbol && offset >= colNumber - 1) {
            return [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
          }
          offset += token.bufferDelta;
        }
        break;
      case 'H101':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 3]];
      case 'H201':
        return [[lineNumber, colNumber - 7], [lineNumber, colNumber]];
      case 'H231':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 5]];
      case 'H233':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 4]];
      case 'H236':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 12]];
      case 'H238':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 4]];
      case 'H501':
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref4 = tokenizedLine.tokens;
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          token = _ref4[_m];
          if (__indexOf.call(token.scopes, 'meta.function-call.python') >= 0) {
            if (token.value === 'locals') {
              return [[lineNumber, offset], [lineNumber, offset + token.bufferDelta]];
            }
          }
          offset += token.bufferDelta;
        }
        break;
      case 'W291':
        screenLine = tokenizedLineForRow(textEditor, lineNumber);
        if (screenLine === void 0) {
          break;
        }
        return [[lineNumber, colNumber - 1], [lineNumber, screenLine.length]];
    }
    return [[lineNumber, colNumber - 1], [lineNumber, colNumber]];
  };

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        "default": 'flake8',
        description: 'Semicolon separated list of paths to a binary (e.g. /usr/local/bin/flake8). ' + 'Use `$PROJECT` or `$PROJECT_NAME` substitutions for project specific paths ' + 'e.g. `$PROJECT/.venv/bin/flake8;/usr/bin/flake8`'
      },
      projectConfigFile: {
        type: 'string',
        "default": '',
        description: 'flake config file relative path from project (e.g. tox.ini or .flake8rc)'
      },
      maxLineLength: {
        type: 'integer',
        "default": 0
      },
      ignoreErrorCodes: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      maxComplexity: {
        description: 'McCabe complexity threshold (`-1` to disable)',
        type: 'integer',
        "default": -1
      },
      hangClosing: {
        type: 'boolean',
        "default": false
      },
      selectErrors: {
        description: 'input "E, W" to include all errors/warnings',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      pep8ErrorsToWarnings: {
        description: 'Convert PEP8 "E" messages to linter warnings',
        type: 'boolean',
        "default": false
      },
      flakeErrors: {
        description: 'Convert Flake "F" messages to linter errors',
        type: 'boolean',
        "default": false
      }
    },
    activate: function() {
      return require('atom-package-deps').install();
    },
    getProjDir: function(file) {
      return atom.project.relativizePath(file)[0];
    },
    getProjName: function(projDir) {
      return path.basename(projDir);
    },
    applySubstitutions: function(execPath, projDir) {
      var p, projectName, _i, _len, _ref;
      projectName = this.getProjName(projDir);
      execPath = execPath.replace(/\$PROJECT_NAME/i, projectName);
      execPath = execPath.replace(/\$PROJECT/i, projDir);
      _ref = execPath.split(';');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (fs.existsSync(p)) {
          return p;
        }
      }
      return execPath;
    },
    provideLinter: function() {
      var helpers, provider;
      helpers = require('atom-linter');
      return provider = {
        name: 'Flake8',
        grammarScopes: ['source.python', 'source.python.django'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var cwd, execPath, filePath, fileText, flakeerr, ignoreErrorCodes, maxComplexity, maxLineLength, parameters, pep8warn, projDir, projectConfigFile, selectErrors;
            filePath = textEditor.getPath();
            fileText = textEditor.getText();
            parameters = [];
            if (maxLineLength = atom.config.get('linter-flake8.maxLineLength')) {
              parameters.push('--max-line-length', maxLineLength);
            }
            if ((ignoreErrorCodes = atom.config.get('linter-flake8.ignoreErrorCodes')).length) {
              parameters.push('--ignore', ignoreErrorCodes.join(','));
            }
            if (maxComplexity = atom.config.get('linter-flake8.maxComplexity')) {
              parameters.push('--max-complexity', maxComplexity);
            }
            if (atom.config.get('linter-flake8.hangClosing')) {
              parameters.push('--hang-closing');
            }
            if ((selectErrors = atom.config.get('linter-flake8.selectErrors')).length) {
              parameters.push('--select', selectErrors.join(','));
            }
            if ((projectConfigFile = atom.config.get('linter-flake8.projectConfigFile'))) {
              parameters.push('--config', path.join(atom.project.getPaths()[0], projectConfigFile));
            }
            parameters.push('-');
            fs = require('fs-plus');
            pep8warn = atom.config.get('linter-flake8.pep8ErrorsToWarnings');
            flakeerr = atom.config.get('linter-flake8.flakeErrors');
            projDir = _this.getProjDir(filePath) || path.dirname(filePath);
            execPath = fs.normalize(_this.applySubstitutions(atom.config.get('linter-flake8.executablePath'), projDir));
            cwd = path.dirname(textEditor.getPath());
            return helpers.exec(execPath, parameters, {
              stdin: fileText,
              cwd: cwd,
              stream: 'both'
            }).then(function(result) {
              var col, line, match, regex, toReturn;
              if (result.stderr && result.stderr.length && atom.inDevMode()) {
                console.log('flake8 stderr: ' + result.stderr);
              }
              toReturn = [];
              regex = /(\d+):(\d+):\s(([A-Z])\d{2,3})\s+(.*)/g;
              while ((match = regex.exec(result.stdout)) !== null) {
                line = parseInt(match[1]) || 0;
                col = parseInt(match[2]) || 0;
                toReturn.push({
                  type: match[4] === 'E' && !pep8warn || match[4] === 'F' && flakeerr ? 'Error' : 'Warning',
                  text: match[3] + ' — ' + match[5],
                  filePath: filePath,
                  range: extractRange({
                    code: match[3],
                    message: match[5],
                    lineNumber: line - 1,
                    colNumber: col,
                    textEditor: textEditor
                  })
                });
              }
              return toReturn;
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1mbGFrZTgvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxtQkFBQSxHQUFzQixTQUFDLFVBQUQsRUFBYSxVQUFiLEdBQUE7V0FDcEIsVUFBVSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsbUJBQXpDLENBQTZELFVBQTdELEVBRG9CO0VBQUEsQ0FBdEIsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBTUEsWUFBQSxHQUFlLFNBQUMsSUFBRCxHQUFBO0FBQ2IsUUFBQSx1TkFBQTtBQUFBLElBRGUsWUFBQSxNQUFNLGVBQUEsU0FBUyxrQkFBQSxZQUFZLGlCQUFBLFdBQVcsa0JBQUEsVUFDckQsQ0FBQTtBQUFBLFlBQU8sSUFBUDtBQUFBLFdBQ08sTUFEUDtBQUlJLFFBQUEsTUFBQSxHQUFTLHVCQUF1QixDQUFDLElBQXhCLENBQTZCLE9BQTdCLENBQXNDLENBQUEsQ0FBQSxDQUEvQyxDQUFBO0FBQ0EsZUFBTSxJQUFOLEdBQUE7QUFDRSxVQUFBLE1BQUEsR0FBUyxDQUFULENBQUE7QUFBQSxVQUNBLGFBQUEsR0FBZ0IsbUJBQUEsQ0FBb0IsVUFBcEIsRUFBZ0MsVUFBaEMsQ0FEaEIsQ0FBQTtBQUVBLFVBQUEsSUFBRyxhQUFBLEtBQWlCLE1BQXBCO0FBQ0Usa0JBREY7V0FGQTtBQUFBLFVBSUEsY0FBQSxHQUFpQixLQUpqQixDQUFBO0FBS0E7QUFBQSxlQUFBLDJDQUFBOzZCQUFBO0FBQ0UsWUFBQSxJQUFHLGVBQTBCLEtBQUssQ0FBQyxNQUFoQyxFQUFB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

//# sourceURL=/home/key/.atom/packages/linter-flake8/lib/main.coffee
