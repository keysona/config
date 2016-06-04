(function() {
  var Color, ColorContext, ColorExpression, Emitter, VariablesCollection, nextId, registry,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('atom').Emitter;

  ColorContext = require('./color-context');

  ColorExpression = require('./color-expression');

  Color = require('./color');

  registry = require('./color-expressions');

  nextId = 0;

  module.exports = VariablesCollection = (function() {
    VariablesCollection.deserialize = function(state) {
      return new VariablesCollection(state);
    };

    Object.defineProperty(VariablesCollection.prototype, 'length', {
      get: function() {
        return this.variables.length;
      },
      enumerable: true
    });

    function VariablesCollection(state) {
      var v, _i, _len, _ref;
      this.emitter = new Emitter;
      this.variables = [];
      this.variableNames = [];
      this.colorVariables = [];
      this.variablesByPath = {};
      this.dependencyGraph = {};
      if ((state != null ? state.content : void 0) != null) {
        _ref = state.content;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          this.restoreVariable(v);
        }
      }
    }

    VariablesCollection.prototype.onDidChange = function(callback) {
      return this.emitter.on('did-change', callback);
    };

    VariablesCollection.prototype.getVariables = function() {
      return this.variables.slice();
    };

    VariablesCollection.prototype.getNonColorVariables = function() {
      return this.getVariables().filter(function(v) {
        return !v.isColor;
      });
    };

    VariablesCollection.prototype.getVariablesForPath = function(path) {
      var _ref;
      return (_ref = this.variablesByPath[path]) != null ? _ref : [];
    };

    VariablesCollection.prototype.getVariableByName = function(name) {
      return this.collectVariablesByName([name]).pop();
    };

    VariablesCollection.prototype.getVariableById = function(id) {
      var v, _i, _len, _ref;
      _ref = this.variables;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        if (v.id === id) {
          return v;
        }
      }
    };

    VariablesCollection.prototype.getVariablesForPaths = function(paths) {
      var p, res, _i, _len;
      res = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        p = paths[_i];
        if (p in this.variablesByPath) {
          res = res.concat(this.variablesByPath[p]);
        }
      }
      return res;
    };

    VariablesCollection.prototype.getColorVariables = function() {
      return this.colorVariables.slice();
    };

    VariablesCollection.prototype.find = function(properties) {
      var _ref;
      return (_ref = this.findAll(properties)) != null ? _ref[0] : void 0;
    };

    VariablesCollection.prototype.findAll = function(properties) {
      var keys;
      if (properties == null) {
        properties = {};
      }
      keys = Object.keys(properties);
      if (keys.length === 0) {
        return null;
      }
      return this.variables.filter(function(v) {
        return keys.every(function(k) {
          var a, b, _ref;
          if (((_ref = v[k]) != null ? _ref.isEqual : void 0) != null) {
            return v[k].isEqual(properties[k]);
          } else if (Array.isArray(b = properties[k])) {
            a = v[k];
            return a.length === b.length && a.every(function(value) {
              return __indexOf.call(b, value) >= 0;
            });
          } else {
            return v[k] === properties[k];
          }
        });
      });
    };

    VariablesCollection.prototype.updateCollection = function(collection, paths) {
      var created, destroyed, path, pathsCollection, pathsToDestroy, remainingPaths, results, updated, v, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      pathsCollection = {};
      remainingPaths = [];
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        v = collection[_i];
        if (pathsCollection[_name = v.path] == null) {
          pathsCollection[_name] = [];
        }
        pathsCollection[v.path].push(v);
        if (_ref = v.path, __indexOf.call(remainingPaths, _ref) < 0) {
          remainingPaths.push(v.path);
        }
      }
      results = {
        created: [],
        destroyed: [],
        updated: []
      };
      for (path in pathsCollection) {
        collection = pathsCollection[path];
        _ref1 = this.updatePathCollection(path, collection, true) || {}, created = _ref1.created, updated = _ref1.updated, destroyed = _ref1.destroyed;
        if (created != null) {
          results.created = results.created.concat(created);
        }
        if (updated != null) {
          results.updated = results.updated.concat(updated);
        }
        if (destroyed != null) {
          results.destroyed = results.destroyed.concat(destroyed);
        }
      }
      if (paths != null) {
        pathsToDestroy = collection.length === 0 ? paths : paths.filter(function(p) {
          return __indexOf.call(remainingPaths, p) < 0;
        });
        for (_j = 0, _len1 = pathsToDestroy.length; _j < _len1; _j++) {
          path = pathsToDestroy[_j];
          _ref2 = this.updatePathCollection(path, collection, true) || {}, created = _ref2.created, updated = _ref2.updated, destroyed = _ref2.destroyed;
          if (created != null) {
            results.created = results.created.concat(created);
          }
          if (updated != null) {
            results.updated = results.updated.concat(updated);
          }
          if (destroyed != null) {
            results.destroyed = results.destroyed.concat(destroyed);
          }
        }
      }
      results = this.updateDependencies(results);
      if (((_ref3 = results.created) != null ? _ref3.length : void 0) === 0) {
        delete results.created;
      }
      if (((_ref4 = results.updated) != null ? _ref4.length : void 0) === 0) {
        delete results.updated;
      }
      if (((_ref5 = results.destroyed) != null ? _ref5.length : void 0) === 0) {
        delete results.destroyed;
      }
      if (results.destroyed != null) {
        _ref6 = results.destroyed;
        for (_k = 0, _len2 = _ref6.length; _k < _len2; _k++) {
          v = _ref6[_k];
          this.deleteVariableReferences(v);
        }
      }
      return this.emitChangeEvent(results);
    };

    VariablesCollection.prototype.updatePathCollection = function(path, collection, batch) {
      var destroyed, pathCollection, results, status, v, _i, _j, _len, _len1;
      if (batch == null) {
        batch = false;
      }
      pathCollection = this.variablesByPath[path] || [];
      results = this.addMany(collection, true);
      destroyed = [];
      for (_i = 0, _len = pathCollection.length; _i < _len; _i++) {
        v = pathCollection[_i];
        status = this.getVariableStatusInCollection(v, collection)[0];
        if (status === 'created') {
          destroyed.push(this.remove(v, true));
        }
      }
      if (destroyed.length > 0) {
        results.destroyed = destroyed;
      }
      if (batch) {
        return results;
      } else {
        results = this.updateDependencies(results);
        for (_j = 0, _len1 = destroyed.length; _j < _len1; _j++) {
          v = destroyed[_j];
          this.deleteVariableReferences(v);
        }
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.add = function(variable, batch) {
      var previousVariable, status, _ref;
      if (batch == null) {
        batch = false;
      }
      _ref = this.getVariableStatus(variable), status = _ref[0], previousVariable = _ref[1];
      switch (status) {
        case 'moved':
          previousVariable.range = variable.range;
          previousVariable.bufferRange = variable.bufferRange;
          return void 0;
        case 'updated':
          return this.updateVariable(previousVariable, variable, batch);
        case 'created':
          return this.createVariable(variable, batch);
      }
    };

    VariablesCollection.prototype.addMany = function(variables, batch) {
      var res, results, status, v, variable, _i, _len;
      if (batch == null) {
        batch = false;
      }
      results = {};
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        res = this.add(variable, true);
        if (res != null) {
          status = res[0], v = res[1];
          if (results[status] == null) {
            results[status] = [];
          }
          results[status].push(v);
        }
      }
      if (batch) {
        return results;
      } else {
        return this.emitChangeEvent(this.updateDependencies(results));
      }
    };

    VariablesCollection.prototype.remove = function(variable, batch) {
      var results;
      if (batch == null) {
        batch = false;
      }
      variable = this.find(variable);
      if (variable == null) {
        return;
      }
      this.variables = this.variables.filter(function(v) {
        return v !== variable;
      });
      if (variable.isColor) {
        this.colorVariables = this.colorVariables.filter(function(v) {
          return v !== variable;
        });
      }
      if (batch) {
        return variable;
      } else {
        results = this.updateDependencies({
          destroyed: [variable]
        });
        this.deleteVariableReferences(variable);
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.removeMany = function(variables, batch) {
      var destroyed, results, v, variable, _i, _j, _len, _len1;
      if (batch == null) {
        batch = false;
      }
      destroyed = [];
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        destroyed.push(this.remove(variable, true));
      }
      results = {
        destroyed: destroyed
      };
      if (batch) {
        return results;
      } else {
        results = this.updateDependencies(results);
        for (_j = 0, _len1 = destroyed.length; _j < _len1; _j++) {
          v = destroyed[_j];
          if (v != null) {
            this.deleteVariableReferences(v);
          }
        }
        return this.emitChangeEvent(results);
      }
    };

    VariablesCollection.prototype.deleteVariablesForPaths = function(paths) {
      return this.removeMany(this.getVariablesForPaths(paths));
    };

    VariablesCollection.prototype.deleteVariableReferences = function(variable) {
      var a, dependencies;
      dependencies = this.getVariableDependencies(variable);
      a = this.variablesByPath[variable.path];
      a.splice(a.indexOf(variable), 1);
      a = this.variableNames;
      a.splice(a.indexOf(variable.name), 1);
      this.removeDependencies(variable.name, dependencies);
      return delete this.dependencyGraph[variable.name];
    };

    VariablesCollection.prototype.getContext = function() {
      return new ColorContext({
        variables: this.variables,
        colorVariables: this.colorVariables,
        registry: registry
      });
    };

    VariablesCollection.prototype.evaluateVariables = function(variables) {
      var isColor, updated, v, wasColor, _i, _len;
      updated = [];
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        v = variables[_i];
        wasColor = v.isColor;
        this.evaluateVariableColor(v, wasColor);
        isColor = v.isColor;
        if (isColor !== wasColor) {
          updated.push(v);
          if (isColor) {
            this.buildDependencyGraph(v);
          }
        }
      }
      if (updated.length > 0) {
        return this.emitChangeEvent(this.updateDependencies({
          updated: updated
        }));
      }
    };

    VariablesCollection.prototype.updateVariable = function(previousVariable, variable, batch) {
      var added, newDependencies, previousDependencies, removed, _ref;
      previousDependencies = this.getVariableDependencies(previousVariable);
      previousVariable.value = variable.value;
      previousVariable.range = variable.range;
      previousVariable.bufferRange = variable.bufferRange;
      this.evaluateVariableColor(previousVariable, previousVariable.isColor);
      newDependencies = this.getVariableDependencies(previousVariable);
      _ref = this.diffArrays(previousDependencies, newDependencies), removed = _ref.removed, added = _ref.added;
      this.removeDependencies(variable.name, removed);
      this.addDependencies(variable.name, added);
      if (batch) {
        return ['updated', previousVariable];
      } else {
        return this.emitChangeEvent(this.updateDependencies({
          updated: [previousVariable]
        }));
      }
    };

    VariablesCollection.prototype.restoreVariable = function(variable) {
      var _base, _name;
      this.variableNames.push(variable.name);
      this.variables.push(variable);
      variable.id = nextId++;
      if (variable.isColor) {
        variable.color = new Color(variable.color);
        variable.color.variables = variable.variables;
        this.colorVariables.push(variable);
        delete variable.variables;
      }
      if ((_base = this.variablesByPath)[_name = variable.path] == null) {
        _base[_name] = [];
      }
      this.variablesByPath[variable.path].push(variable);
      return this.buildDependencyGraph(variable);
    };

    VariablesCollection.prototype.createVariable = function(variable, batch) {
      var _base, _name;
      this.variableNames.push(variable.name);
      this.variables.push(variable);
      variable.id = nextId++;
      if ((_base = this.variablesByPath)[_name = variable.path] == null) {
        _base[_name] = [];
      }
      this.variablesByPath[variable.path].push(variable);
      this.evaluateVariableColor(variable);
      this.buildDependencyGraph(variable);
      if (batch) {
        return ['created', variable];
      } else {
        return this.emitChangeEvent(this.updateDependencies({
          created: [variable]
        }));
      }
    };

    VariablesCollection.prototype.evaluateVariableColor = function(variable, wasColor) {
      var color, context;
      if (wasColor == null) {
        wasColor = false;
      }
      context = this.getContext();
      color = context.readColor(variable.value, true);
      if (color != null) {
        if (wasColor && color.isEqual(variable.color)) {
          return false;
        }
        variable.color = color;
        variable.isColor = true;
        if (__indexOf.call(this.colorVariables, variable) < 0) {
          this.colorVariables.push(variable);
        }
        return true;
      } else if (wasColor) {
        delete variable.color;
        variable.isColor = false;
        this.colorVariables = this.colorVariables.filter(function(v) {
          return v !== variable;
        });
        return true;
      }
    };

    VariablesCollection.prototype.getVariableStatus = function(variable) {
      if (this.variablesByPath[variable.path] == null) {
        return ['created', variable];
      }
      return this.getVariableStatusInCollection(variable, this.variablesByPath[variable.path]);
    };

    VariablesCollection.prototype.getVariableStatusInCollection = function(variable, collection) {
      var status, v, _i, _len;
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        v = collection[_i];
        status = this.compareVariables(v, variable);
        switch (status) {
          case 'identical':
            return ['unchanged', v];
          case 'move':
            return ['moved', v];
          case 'update':
            return ['updated', v];
        }
      }
      return ['created', variable];
    };

    VariablesCollection.prototype.compareVariables = function(v1, v2) {
      var sameLine, sameName, sameRange, sameValue;
      sameName = v1.name === v2.name;
      sameValue = v1.value === v2.value;
      sameLine = v1.line === v2.line;
      sameRange = v1.range[0] === v2.range[0] && v1.range[1] === v2.range[1];
      if ((v1.bufferRange != null) && (v2.bufferRange != null)) {
        sameRange && (sameRange = v1.bufferRange.isEqual(v2.bufferRange));
      }
      if (sameName && sameValue) {
        if (sameRange) {
          return 'identical';
        } else {
          return 'move';
        }
      } else if (sameName) {
        if (sameRange || sameLine) {
          return 'update';
        } else {
          return 'different';
        }
      }
    };

    VariablesCollection.prototype.buildDependencyGraph = function(variable) {
      var a, dependencies, dependency, _base, _i, _len, _ref, _results;
      dependencies = this.getVariableDependencies(variable);
      _results = [];
      for (_i = 0, _len = dependencies.length; _i < _len; _i++) {
        dependency = dependencies[_i];
        a = (_base = this.dependencyGraph)[dependency] != null ? _base[dependency] : _base[dependency] = [];
        if (_ref = variable.name, __indexOf.call(a, _ref) < 0) {
          _results.push(a.push(variable.name));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VariablesCollection.prototype.getVariableDependencies = function(variable) {
      var dependencies, v, variables, _i, _len, _ref, _ref1, _ref2;
      dependencies = [];
      if (_ref = variable.value, __indexOf.call(this.variableNames, _ref) >= 0) {
        dependencies.push(variable.value);
      }
      if (((_ref1 = variable.color) != null ? (_ref2 = _ref1.variables) != null ? _ref2.length : void 0 : void 0) > 0) {
        variables = variable.color.variables;
        for (_i = 0, _len = variables.length; _i < _len; _i++) {
          v = variables[_i];
          if (__indexOf.call(dependencies, v) < 0) {
            dependencies.push(v);
          }
        }
      }
      return dependencies;
    };

    VariablesCollection.prototype.collectVariablesByName = function(names) {
      var v, variables, _i, _len, _ref, _ref1;
      variables = [];
      _ref = this.variables;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        if (_ref1 = v.name, __indexOf.call(names, _ref1) >= 0) {
          variables.push(v);
        }
      }
      return variables;
    };

    VariablesCollection.prototype.removeDependencies = function(from, to) {
      var dependencies, v, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = to.length; _i < _len; _i++) {
        v = to[_i];
        if (dependencies = this.dependencyGraph[v]) {
          dependencies.splice(dependencies.indexOf(from), 1);
          if (dependencies.length === 0) {
            _results.push(delete this.dependencyGraph[v]);
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VariablesCollection.prototype.addDependencies = function(from, to) {
      var v, _base, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = to.length; _i < _len; _i++) {
        v = to[_i];
        if ((_base = this.dependencyGraph)[v] == null) {
          _base[v] = [];
        }
        _results.push(this.dependencyGraph[v].push(from));
      }
      return _results;
    };

    VariablesCollection.prototype.updateDependencies = function(_arg) {
      var created, createdVariableNames, dependencies, destroyed, dirtyVariableNames, dirtyVariables, name, updated, variable, variables, _i, _j, _k, _len, _len1, _len2;
      created = _arg.created, updated = _arg.updated, destroyed = _arg.destroyed;
      this.updateColorVariablesExpression();
      variables = [];
      dirtyVariableNames = [];
      if (created != null) {
        variables = variables.concat(created);
        createdVariableNames = created.map(function(v) {
          return v.name;
        });
      } else {
        createdVariableNames = [];
      }
      if (updated != null) {
        variables = variables.concat(updated);
      }
      if (destroyed != null) {
        variables = variables.concat(destroyed);
      }
      variables = variables.filter(function(v) {
        return v != null;
      });
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        if (dependencies = this.dependencyGraph[variable.name]) {
          for (_j = 0, _len1 = dependencies.length; _j < _len1; _j++) {
            name = dependencies[_j];
            if (__indexOf.call(dirtyVariableNames, name) < 0 && __indexOf.call(createdVariableNames, name) < 0) {
              dirtyVariableNames.push(name);
            }
          }
        }
      }
      dirtyVariables = this.collectVariablesByName(dirtyVariableNames);
      for (_k = 0, _len2 = dirtyVariables.length; _k < _len2; _k++) {
        variable = dirtyVariables[_k];
        if (this.evaluateVariableColor(variable, variable.isColor)) {
          if (updated == null) {
            updated = [];
          }
          updated.push(variable);
        }
      }
      return {
        created: created,
        destroyed: destroyed,
        updated: updated
      };
    };

    VariablesCollection.prototype.emitChangeEvent = function(_arg) {
      var created, destroyed, updated;
      created = _arg.created, destroyed = _arg.destroyed, updated = _arg.updated;
      if ((created != null ? created.length : void 0) || (destroyed != null ? destroyed.length : void 0) || (updated != null ? updated.length : void 0)) {
        this.updateColorVariablesExpression();
        return this.emitter.emit('did-change', {
          created: created,
          destroyed: destroyed,
          updated: updated
        });
      }
    };

    VariablesCollection.prototype.updateColorVariablesExpression = function() {
      var colorVariables;
      colorVariables = this.getColorVariables();
      if (colorVariables.length > 0) {
        return registry.addExpression(ColorExpression.colorExpressionForColorVariables(colorVariables));
      } else {
        return registry.removeExpression('pigments:variables');
      }
    };

    VariablesCollection.prototype.diffArrays = function(a, b) {
      var added, removed, v, _i, _j, _len, _len1;
      removed = [];
      added = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        v = a[_i];
        if (__indexOf.call(b, v) < 0) {
          removed.push(v);
        }
      }
      for (_j = 0, _len1 = b.length; _j < _len1; _j++) {
        v = b[_j];
        if (__indexOf.call(a, v) < 0) {
          added.push(v);
        }
      }
      return {
        removed: removed,
        added: added
      };
    };

    VariablesCollection.prototype.serialize = function() {
      return {
        deserializer: 'VariablesCollection',
        content: this.variables.map(function(v) {
          var res;
          res = {
            name: v.name,
            value: v.value,
            path: v.path,
            range: v.range,
            line: v.line
          };
          if (v.isAlternate) {
            res.isAlternate = true;
          }
          if (v.noNamePrefix) {
            res.noNamePrefix = true;
          }
          if (v.isColor) {
            res.isColor = true;
            res.color = v.color.serialize();
            if (v.color.variables != null) {
              res.variables = v.color.variables;
            }
          }
          return res;
        })
      };
    };

    return VariablesCollection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi92YXJpYWJsZXMtY29sbGVjdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0ZBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVIsRUFBWCxPQUFELENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBRmxCLENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FIUixDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxxQkFBUixDQUpYLENBQUE7O0FBQUEsRUFNQSxNQUFBLEdBQVMsQ0FOVCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLElBQUEsbUJBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFBLG1CQUFBLENBQW9CLEtBQXBCLEVBRFE7SUFBQSxDQUFkLENBQUE7O0FBQUEsSUFHQSxNQUFNLENBQUMsY0FBUCxDQUFzQixtQkFBQyxDQUFBLFNBQXZCLEVBQWtDLFFBQWxDLEVBQTRDO0FBQUEsTUFDMUMsR0FBQSxFQUFLLFNBQUEsR0FBQTtlQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBZDtNQUFBLENBRHFDO0FBQUEsTUFFMUMsVUFBQSxFQUFZLElBRjhCO0tBQTVDLENBSEEsQ0FBQTs7QUFRYSxJQUFBLDZCQUFDLEtBQUQsR0FBQTtBQUNYLFVBQUEsaUJBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsR0FB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

//# sourceURL=/home/key/.atom/packages/pigments/lib/variables-collection.coffee
