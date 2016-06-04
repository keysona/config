(function() {
  var ColorExpression, Emitter, ExpressionsRegistry, vm,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('atom').Emitter;

  ColorExpression = require('./color-expression');

  vm = require('vm');

  module.exports = ExpressionsRegistry = (function() {
    ExpressionsRegistry.deserialize = function(serializedData, expressionsType) {
      var data, handle, name, registry, _ref;
      registry = new ExpressionsRegistry(expressionsType);
      _ref = serializedData.expressions;
      for (name in _ref) {
        data = _ref[name];
        handle = vm.runInNewContext(data.handle.replace('function', "handle = function"), {
          console: console,
          require: require
        });
        registry.createExpression(name, data.regexpString, data.priority, data.scopes, handle);
      }
      registry.regexpStrings['none'] = serializedData.regexpString;
      return registry;
    };

    function ExpressionsRegistry(expressionsType) {
      this.expressionsType = expressionsType;
      this.colorExpressions = {};
      this.emitter = new Emitter;
      this.regexpStrings = {};
    }

    ExpressionsRegistry.prototype.dispose = function() {
      return this.emitter.dispose();
    };

    ExpressionsRegistry.prototype.onDidAddExpression = function(callback) {
      return this.emitter.on('did-add-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidRemoveExpression = function(callback) {
      return this.emitter.on('did-remove-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidUpdateExpressions = function(callback) {
      return this.emitter.on('did-update-expressions', callback);
    };

    ExpressionsRegistry.prototype.getExpressions = function() {
      var e, k;
      return ((function() {
        var _ref, _results;
        _ref = this.colorExpressions;
        _results = [];
        for (k in _ref) {
          e = _ref[k];
          _results.push(e);
        }
        return _results;
      }).call(this)).sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

    ExpressionsRegistry.prototype.getExpressionsForScope = function(scope) {
      var expressions;
      expressions = this.getExpressions();
      if (scope === '*') {
        return expressions;
      }
      return expressions.filter(function(e) {
        return __indexOf.call(e.scopes, '*') >= 0 || __indexOf.call(e.scopes, scope) >= 0;
      });
    };

    ExpressionsRegistry.prototype.getExpression = function(name) {
      return this.colorExpressions[name];
    };

    ExpressionsRegistry.prototype.getRegExp = function() {
      var _base;
      return (_base = this.regexpStrings)['none'] != null ? _base['none'] : _base['none'] = this.getExpressions().map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.getRegExpForScope = function(scope) {
      var _base;
      return (_base = this.regexpStrings)[scope] != null ? _base[scope] : _base[scope] = this.getExpressionsForScope(scope).map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.createExpression = function(name, regexpString, priority, scopes, handle) {
      var newExpression;
      if (priority == null) {
        priority = 0;
      }
      if (scopes == null) {
        scopes = ['*'];
      }
      if (typeof priority === 'function') {
        handle = priority;
        scopes = ['*'];
        priority = 0;
      } else if (typeof priority === 'object') {
        if (typeof scopes === 'function') {
          handle = scopes;
        }
        scopes = priority;
        priority = 0;
      }
      if (!(scopes.length === 1 && scopes[0] === '*')) {
        scopes.push('pigments');
      }
      newExpression = new this.expressionsType({
        name: name,
        regexpString: regexpString,
        scopes: scopes,
        priority: priority,
        handle: handle
      });
      return this.addExpression(newExpression);
    };

    ExpressionsRegistry.prototype.addExpression = function(expression, batch) {
      if (batch == null) {
        batch = false;
      }
      this.regexpStrings = {};
      this.colorExpressions[expression.name] = expression;
      if (!batch) {
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
        this.emitter.emit('did-update-expressions', {
          name: expression.name,
          registry: this
        });
      }
      return expression;
    };

    ExpressionsRegistry.prototype.createExpressions = function(expressions) {
      return this.addExpressions(expressions.map((function(_this) {
        return function(e) {
          var expression, handle, name, priority, regexpString, scopes;
          name = e.name, regexpString = e.regexpString, handle = e.handle, priority = e.priority, scopes = e.scopes;
          if (priority == null) {
            priority = 0;
          }
          expression = new _this.expressionsType({
            name: name,
            regexpString: regexpString,
            scopes: scopes,
            handle: handle
          });
          expression.priority = priority;
          return expression;
        };
      })(this)));
    };

    ExpressionsRegistry.prototype.addExpressions = function(expressions) {
      var expression, _i, _len;
      for (_i = 0, _len = expressions.length; _i < _len; _i++) {
        expression = expressions[_i];
        this.addExpression(expression, true);
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
      }
      return this.emitter.emit('did-update-expressions', {
        registry: this
      });
    };

    ExpressionsRegistry.prototype.removeExpression = function(name) {
      delete this.colorExpressions[name];
      this.regexpStrings = {};
      this.emitter.emit('did-remove-expression', {
        name: name,
        registry: this
      });
      return this.emitter.emit('did-update-expressions', {
        name: name,
        registry: this
      });
    };

    ExpressionsRegistry.prototype.serialize = function() {
      var expression, key, out, _ref, _ref1;
      out = {
        regexpString: this.getRegExp(),
        expressions: {}
      };
      _ref = this.colorExpressions;
      for (key in _ref) {
        expression = _ref[key];
        out.expressions[key] = {
          name: expression.name,
          regexpString: expression.regexpString,
          priority: expression.priority,
          scopes: expression.scopes,
          handle: (_ref1 = expression.handle) != null ? _ref1.toString() : void 0
        };
      }
      return out;
    };

    return ExpressionsRegistry;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9leHByZXNzaW9ucy1yZWdpc3RyeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaURBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUFELENBQUE7O0FBQUEsRUFDQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQkFBUixDQURsQixDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixJQUFBLG1CQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsY0FBRCxFQUFpQixlQUFqQixHQUFBO0FBQ1osVUFBQSxrQ0FBQTtBQUFBLE1BQUEsUUFBQSxHQUFlLElBQUEsbUJBQUEsQ0FBb0IsZUFBcEIsQ0FBZixDQUFBO0FBRUE7QUFBQSxXQUFBLFlBQUE7MEJBQUE7QUFDRSxRQUFBLE1BQUEsR0FBUyxFQUFFLENBQUMsZUFBSCxDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsVUFBcEIsRUFBZ0MsbUJBQWhDLENBQW5CLEVBQXlFO0FBQUEsVUFBQyxTQUFBLE9BQUQ7QUFBQSxVQUFVLFNBQUEsT0FBVjtTQUF6RSxDQUFULENBQUE7QUFBQSxRQUNBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixJQUExQixFQUFnQyxJQUFJLENBQUMsWUFBckMsRUFBbUQsSUFBSSxDQUFDLFFBQXhELEVBQWtFLElBQUksQ0FBQyxNQUF2RSxFQUErRSxNQUEvRSxDQURBLENBREY7QUFBQSxPQUZBO0FBQUEsTUFNQSxRQUFRLENBQUMsYUFBYyxDQUFBLE1BQUEsQ0FBdkIsR0FBaUMsY0FBYyxDQUFDLFlBTmhELENBQUE7YUFRQSxT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

//# sourceURL=/home/key/.atom/packages/pigments/lib/expressions-registry.coffee
