(function() {
  var ATOM_VARIABLES, ColorBuffer, ColorContext, ColorMarkerElement, ColorProject, ColorSearch, CompositeDisposable, Emitter, Palette, PathsLoader, PathsScanner, Range, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, THEME_VARIABLES, VariablesCollection, compareArray, minimatch, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  minimatch = require('minimatch');

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range;

  _ref1 = require('./versions'), SERIALIZE_VERSION = _ref1.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref1.SERIALIZE_MARKERS_VERSION;

  THEME_VARIABLES = require('./uris').THEME_VARIABLES;

  ColorBuffer = require('./color-buffer');

  ColorContext = require('./color-context');

  ColorSearch = require('./color-search');

  Palette = require('./palette');

  PathsLoader = require('./paths-loader');

  PathsScanner = require('./paths-scanner');

  ColorMarkerElement = require('./color-marker-element');

  VariablesCollection = require('./variables-collection');

  ATOM_VARIABLES = ['text-color', 'text-color-subtle', 'text-color-highlight', 'text-color-selected', 'text-color-info', 'text-color-success', 'text-color-warning', 'text-color-error', 'background-color-info', 'background-color-success', 'background-color-warning', 'background-color-error', 'background-color-highlight', 'background-color-selected', 'app-background-color', 'base-background-color', 'base-border-color', 'pane-item-background-color', 'pane-item-border-color', 'input-background-color', 'input-border-color', 'tool-panel-background-color', 'tool-panel-border-color', 'inset-panel-background-color', 'inset-panel-border-color', 'panel-heading-background-color', 'panel-heading-border-color', 'overlay-background-color', 'overlay-border-color', 'button-background-color', 'button-background-color-hover', 'button-background-color-selected', 'button-border-color', 'tab-bar-background-color', 'tab-bar-border-color', 'tab-background-color', 'tab-background-color-active', 'tab-border-color', 'tree-view-background-color', 'tree-view-border-color', 'ui-site-color-1', 'ui-site-color-2', 'ui-site-color-3', 'ui-site-color-4', 'ui-site-color-5', 'syntax-text-color', 'syntax-cursor-color', 'syntax-selection-color', 'syntax-background-color', 'syntax-wrap-guide-color', 'syntax-indent-guide-color', 'syntax-invisible-character-color', 'syntax-result-marker-color', 'syntax-result-marker-color-selected', 'syntax-gutter-text-color', 'syntax-gutter-text-color-selected', 'syntax-gutter-background-color', 'syntax-gutter-background-color-selected', 'syntax-color-renamed', 'syntax-color-added', 'syntax-color-modified', 'syntax-color-removed'];

  compareArray = function(a, b) {
    var i, v, _i, _len;
    if ((a == null) || (b == null)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
      v = a[i];
      if (v !== b[i]) {
        return false;
      }
    }
    return true;
  };

  module.exports = ColorProject = (function() {
    ColorProject.deserialize = function(state) {
      var markersVersion;
      markersVersion = SERIALIZE_MARKERS_VERSION;
      if ((state != null ? state.version : void 0) !== SERIALIZE_VERSION) {
        state = {};
      }
      if ((state != null ? state.markersVersion : void 0) !== markersVersion) {
        delete state.variables;
        delete state.buffers;
      }
      if (!compareArray(state.globalSourceNames, atom.config.get('pigments.sourceNames')) || !compareArray(state.globalIgnoredNames, atom.config.get('pigments.ignoredNames'))) {
        delete state.variables;
        delete state.buffers;
        delete state.paths;
      }
      return new ColorProject(state);
    };

    function ColorProject(state) {
      var buffers, defaultScopes, includeThemes, svgColorExpression, timestamp, variables;
      if (state == null) {
        state = {};
      }
      includeThemes = state.includeThemes, this.ignoredNames = state.ignoredNames, this.sourceNames = state.sourceNames, this.ignoredScopes = state.ignoredScopes, this.paths = state.paths, this.searchNames = state.searchNames, this.ignoreGlobalSourceNames = state.ignoreGlobalSourceNames, this.ignoreGlobalIgnoredNames = state.ignoreGlobalIgnoredNames, this.ignoreGlobalIgnoredScopes = state.ignoreGlobalIgnoredScopes, this.ignoreGlobalSearchNames = state.ignoreGlobalSearchNames, this.ignoreGlobalSupportedFiletypes = state.ignoreGlobalSupportedFiletypes, this.supportedFiletypes = state.supportedFiletypes, variables = state.variables, timestamp = state.timestamp, buffers = state.buffers;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.colorBuffersByEditorId = {};
      this.bufferStates = buffers != null ? buffers : {};
      this.variableExpressionsRegistry = require('./variable-expressions');
      this.colorExpressionsRegistry = require('./color-expressions');
      if (variables != null) {
        this.variables = atom.deserializers.deserialize(variables);
      } else {
        this.variables = new VariablesCollection;
      }
      this.subscriptions.add(this.variables.onDidChange((function(_this) {
        return function(results) {
          return _this.emitVariablesChangeEvent(results);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sourceNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredNames', (function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredBufferNames', (function(_this) {
        return function(ignoredBufferNames) {
          _this.ignoredBufferNames = ignoredBufferNames;
          return _this.updateColorBuffers();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.ignoredScopes', (function(_this) {
        return function() {
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.supportedFiletypes', (function(_this) {
        return function() {
          _this.updateIgnoredFiletypes();
          return _this.emitter.emit('did-change-ignored-scopes', _this.getIgnoredScopes());
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', function(type) {
        if (type != null) {
          return ColorMarkerElement.setMarkerType(type);
        }
      }));
      this.subscriptions.add(atom.config.observe('pigments.ignoreVcsIgnoredPaths', (function(_this) {
        return function() {
          return _this.loadPathsAndVariables();
        };
      })(this)));
      svgColorExpression = this.colorExpressionsRegistry.getExpression('pigments:named_colors');
      defaultScopes = svgColorExpression.scopes.slice();
      this.subscriptions.add(atom.config.observe('pigments.extendedFiletypesForColorWords', (function(_this) {
        return function(scopes) {
          svgColorExpression.scopes = defaultScopes.concat(scopes);
          return _this.colorExpressionsRegistry.emitter.emit('did-update-expressions', {
            name: svgColorExpression.name,
            registry: _this.colorExpressionsRegistry
          });
        };
      })(this)));
      this.subscriptions.add(this.colorExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function(_arg) {
          var colorBuffer, id, name, _ref2, _results;
          name = _arg.name;
          if ((_this.paths == null) || name === 'pigments:variables') {
            return;
          }
          _this.variables.evaluateVariables(_this.variables.getVariables());
          _ref2 = _this.colorBuffersByEditorId;
          _results = [];
          for (id in _ref2) {
            colorBuffer = _ref2[id];
            _results.push(colorBuffer.update());
          }
          return _results;
        };
      })(this)));
      this.subscriptions.add(this.variableExpressionsRegistry.onDidUpdateExpressions((function(_this) {
        return function() {
          if (_this.paths == null) {
            return;
          }
          return _this.reloadVariablesForPaths(_this.getPaths());
        };
      })(this)));
      if (timestamp != null) {
        this.timestamp = new Date(Date.parse(timestamp));
      }
      if (includeThemes) {
        this.setIncludeThemes(includeThemes);
      }
      this.updateIgnoredFiletypes();
      if ((this.paths != null) && (this.variables.length != null)) {
        this.initialize();
      }
      this.initializeBuffers();
    }

    ColorProject.prototype.onDidInitialize = function(callback) {
      return this.emitter.on('did-initialize', callback);
    };

    ColorProject.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorProject.prototype.onDidUpdateVariables = function(callback) {
      return this.emitter.on('did-update-variables', callback);
    };

    ColorProject.prototype.onDidCreateColorBuffer = function(callback) {
      return this.emitter.on('did-create-color-buffer', callback);
    };

    ColorProject.prototype.onDidChangeIgnoredScopes = function(callback) {
      return this.emitter.on('did-change-ignored-scopes', callback);
    };

    ColorProject.prototype.onDidChangePaths = function(callback) {
      return this.emitter.on('did-change-paths', callback);
    };

    ColorProject.prototype.observeColorBuffers = function(callback) {
      var colorBuffer, id, _ref2;
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        colorBuffer = _ref2[id];
        callback(colorBuffer);
      }
      return this.onDidCreateColorBuffer(callback);
    };

    ColorProject.prototype.isInitialized = function() {
      return this.initialized;
    };

    ColorProject.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorProject.prototype.initialize = function() {
      if (this.isInitialized()) {
        return Promise.resolve(this.variables.getVariables());
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      return this.initializePromise = this.loadPathsAndVariables().then((function(_this) {
        return function() {
          var variables;
          _this.initialized = true;
          variables = _this.variables.getVariables();
          _this.emitter.emit('did-initialize', variables);
          return variables;
        };
      })(this));
    };

    ColorProject.prototype.destroy = function() {
      var buffer, id, _ref2;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      PathsScanner.terminateRunningTask();
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        buffer = _ref2[id];
        buffer.destroy();
      }
      this.colorBuffersByEditorId = null;
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.emitter.emit('did-destroy', this);
      return this.emitter.dispose();
    };

    ColorProject.prototype.loadPathsAndVariables = function() {
      var destroyed;
      destroyed = null;
      return this.loadPaths().then((function(_this) {
        return function(_arg) {
          var dirtied, path, removed, _i, _len;
          dirtied = _arg.dirtied, removed = _arg.removed;
          if (removed.length > 0) {
            _this.paths = _this.paths.filter(function(p) {
              return __indexOf.call(removed, p) < 0;
            });
            _this.deleteVariablesForPaths(removed);
          }
          if ((_this.paths != null) && dirtied.length > 0) {
            for (_i = 0, _len = dirtied.length; _i < _len; _i++) {
              path = dirtied[_i];
              if (__indexOf.call(_this.paths, path) < 0) {
                _this.paths.push(path);
              }
            }
            if (_this.variables.length) {
              return dirtied;
            } else {
              return _this.paths;
            }
          } else if (_this.paths == null) {
            return _this.paths = dirtied;
          } else if (!_this.variables.length) {
            return _this.paths;
          } else {
            return [];
          }
        };
      })(this)).then((function(_this) {
        return function(paths) {
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          if (results != null) {
            return _this.variables.updateCollection(results);
          }
        };
      })(this));
    };

    ColorProject.prototype.findAllColors = function() {
      var patterns;
      patterns = this.getSearchNames();
      return new ColorSearch({
        sourceNames: patterns,
        ignoredNames: this.getIgnoredNames(),
        context: this.getContext()
      });
    };

    ColorProject.prototype.setColorPickerAPI = function(colorPickerAPI) {
      this.colorPickerAPI = colorPickerAPI;
    };

    ColorProject.prototype.initializeBuffers = function() {
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var buffer, bufferElement;
          if (_this.isBufferIgnored(editor.getPath())) {
            return;
          }
          buffer = _this.colorBufferForEditor(editor);
          if (buffer != null) {
            bufferElement = atom.views.getView(buffer);
            return bufferElement.attach();
          }
        };
      })(this)));
    };

    ColorProject.prototype.hasColorBufferForEditor = function(editor) {
      if (this.destroyed || (editor == null)) {
        return false;
      }
      return this.colorBuffersByEditorId[editor.id] != null;
    };

    ColorProject.prototype.colorBufferForEditor = function(editor) {
      var buffer, state, subscription;
      if (this.destroyed) {
        return;
      }
      if (editor == null) {
        return;
      }
      if (this.colorBuffersByEditorId[editor.id] != null) {
        return this.colorBuffersByEditorId[editor.id];
      }
      if (this.bufferStates[editor.id] != null) {
        state = this.bufferStates[editor.id];
        state.editor = editor;
        state.project = this;
        delete this.bufferStates[editor.id];
      } else {
        state = {
          editor: editor,
          project: this
        };
      }
      this.colorBuffersByEditorId[editor.id] = buffer = new ColorBuffer(state);
      this.subscriptions.add(subscription = buffer.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptions.remove(subscription);
          subscription.dispose();
          return delete _this.colorBuffersByEditorId[editor.id];
        };
      })(this)));
      this.emitter.emit('did-create-color-buffer', buffer);
      return buffer;
    };

    ColorProject.prototype.colorBufferForPath = function(path) {
      var colorBuffer, id, _ref2;
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        colorBuffer = _ref2[id];
        if (colorBuffer.editor.getPath() === path) {
          return colorBuffer;
        }
      }
    };

    ColorProject.prototype.updateColorBuffers = function() {
      var buffer, bufferElement, e, editor, id, _i, _len, _ref2, _ref3, _results;
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        buffer = _ref2[id];
        if (this.isBufferIgnored(buffer.editor.getPath())) {
          buffer.destroy();
          delete this.colorBuffersByEditorId[id];
        }
      }
      try {
        if (this.colorBuffersByEditorId != null) {
          _ref3 = atom.workspace.getTextEditors();
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            editor = _ref3[_i];
            if (this.hasColorBufferForEditor(editor) || this.isBufferIgnored(editor.getPath())) {
              continue;
            }
            buffer = this.colorBufferForEditor(editor);
            if (buffer != null) {
              bufferElement = atom.views.getView(buffer);
              _results.push(bufferElement.attach());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      } catch (_error) {
        e = _error;
        return console.log(e);
      }
    };

    ColorProject.prototype.isBufferIgnored = function(path) {
      var source, sources, _i, _len, _ref2;
      path = atom.project.relativize(path);
      sources = (_ref2 = this.ignoredBufferNames) != null ? _ref2 : [];
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
      return false;
    };

    ColorProject.prototype.getPaths = function() {
      var _ref2;
      return (_ref2 = this.paths) != null ? _ref2.slice() : void 0;
    };

    ColorProject.prototype.appendPath = function(path) {
      if (path != null) {
        return this.paths.push(path);
      }
    };

    ColorProject.prototype.hasPath = function(path) {
      var _ref2;
      return __indexOf.call((_ref2 = this.paths) != null ? _ref2 : [], path) >= 0;
    };

    ColorProject.prototype.loadPaths = function(noKnownPaths) {
      if (noKnownPaths == null) {
        noKnownPaths = false;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var config, knownPaths, rootPaths, _ref2;
          rootPaths = _this.getRootPaths();
          knownPaths = noKnownPaths ? [] : (_ref2 = _this.paths) != null ? _ref2 : [];
          config = {
            knownPaths: knownPaths,
            timestamp: _this.timestamp,
            ignoredNames: _this.getIgnoredNames(),
            paths: rootPaths,
            traverseIntoSymlinkDirectories: atom.config.get('pigments.traverseIntoSymlinkDirectories'),
            sourceNames: _this.getSourceNames(),
            ignoreVcsIgnores: atom.config.get('pigments.ignoreVcsIgnoredPaths')
          };
          return PathsLoader.startTask(config, function(results) {
            var isDescendentOfRootPaths, p, _i, _len;
            for (_i = 0, _len = knownPaths.length; _i < _len; _i++) {
              p = knownPaths[_i];
              isDescendentOfRootPaths = rootPaths.some(function(root) {
                return p.indexOf(root) === 0;
              });
              if (!isDescendentOfRootPaths) {
                if (results.removed == null) {
                  results.removed = [];
                }
                results.removed.push(p);
              }
            }
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.updatePaths = function() {
      if (!this.initialized) {
        return Promise.resolve();
      }
      return this.loadPaths().then((function(_this) {
        return function(_arg) {
          var dirtied, p, removed, _i, _len;
          dirtied = _arg.dirtied, removed = _arg.removed;
          _this.deleteVariablesForPaths(removed);
          _this.paths = _this.paths.filter(function(p) {
            return __indexOf.call(removed, p) < 0;
          });
          for (_i = 0, _len = dirtied.length; _i < _len; _i++) {
            p = dirtied[_i];
            if (__indexOf.call(_this.paths, p) < 0) {
              _this.paths.push(p);
            }
          }
          _this.emitter.emit('did-change-paths', _this.getPaths());
          return _this.reloadVariablesForPaths(dirtied);
        };
      })(this));
    };

    ColorProject.prototype.isVariablesSourcePath = function(path) {
      var source, sources, _i, _len;
      if (!path) {
        return false;
      }
      path = atom.project.relativize(path);
      sources = this.getSourceNames();
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        source = sources[_i];
        if (minimatch(path, source, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.isIgnoredPath = function(path) {
      var ignore, ignoredNames, _i, _len;
      if (!path) {
        return false;
      }
      path = atom.project.relativize(path);
      ignoredNames = this.getIgnoredNames();
      for (_i = 0, _len = ignoredNames.length; _i < _len; _i++) {
        ignore = ignoredNames[_i];
        if (minimatch(path, ignore, {
          matchBase: true,
          dot: true
        })) {
          return true;
        }
      }
    };

    ColorProject.prototype.getPalette = function() {
      if (!this.isInitialized()) {
        return new Palette;
      }
      return new Palette(this.getColorVariables());
    };

    ColorProject.prototype.getContext = function() {
      return this.variables.getContext();
    };

    ColorProject.prototype.getVariables = function() {
      return this.variables.getVariables();
    };

    ColorProject.prototype.getVariableExpressionsRegistry = function() {
      return this.variableExpressionsRegistry;
    };

    ColorProject.prototype.getVariableById = function(id) {
      return this.variables.getVariableById(id);
    };

    ColorProject.prototype.getVariableByName = function(name) {
      return this.variables.getVariableByName(name);
    };

    ColorProject.prototype.getColorVariables = function() {
      return this.variables.getColorVariables();
    };

    ColorProject.prototype.getColorExpressionsRegistry = function() {
      return this.colorExpressionsRegistry;
    };

    ColorProject.prototype.showVariableInFile = function(variable) {
      return atom.workspace.open(variable.path).then(function(editor) {
        var buffer, bufferRange;
        buffer = editor.getBuffer();
        bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
        return editor.setSelectedBufferRange(bufferRange, {
          autoscroll: true
        });
      });
    };

    ColorProject.prototype.emitVariablesChangeEvent = function(results) {
      return this.emitter.emit('did-update-variables', results);
    };

    ColorProject.prototype.loadVariablesForPath = function(path) {
      return this.loadVariablesForPaths([path]);
    };

    ColorProject.prototype.loadVariablesForPaths = function(paths) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.scanPathsForVariables(paths, function(results) {
            return resolve(results);
          });
        };
      })(this));
    };

    ColorProject.prototype.getVariablesForPath = function(path) {
      return this.variables.getVariablesForPath(path);
    };

    ColorProject.prototype.getVariablesForPaths = function(paths) {
      return this.variables.getVariablesForPaths(paths);
    };

    ColorProject.prototype.deleteVariablesForPath = function(path) {
      return this.deleteVariablesForPaths([path]);
    };

    ColorProject.prototype.deleteVariablesForPaths = function(paths) {
      return this.variables.deleteVariablesForPaths(paths);
    };

    ColorProject.prototype.reloadVariablesForPath = function(path) {
      return this.reloadVariablesForPaths([path]);
    };

    ColorProject.prototype.reloadVariablesForPaths = function(paths) {
      var promise;
      promise = Promise.resolve();
      if (!this.isInitialized()) {
        promise = this.initialize();
      }
      return promise.then((function(_this) {
        return function() {
          if (paths.some(function(path) {
            return __indexOf.call(_this.paths, path) < 0;
          })) {
            return Promise.resolve([]);
          }
          return _this.loadVariablesForPaths(paths);
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.variables.updateCollection(results, paths);
        };
      })(this));
    };

    ColorProject.prototype.scanPathsForVariables = function(paths, callback) {
      var colorBuffer;
      if (paths.length === 1 && (colorBuffer = this.colorBufferForPath(paths[0]))) {
        return colorBuffer.scanBufferForVariables().then(function(results) {
          return callback(results);
        });
      } else {
        return PathsScanner.startTask(paths, this.variableExpressionsRegistry, function(results) {
          return callback(results);
        });
      }
    };

    ColorProject.prototype.loadThemesVariables = function() {
      var div, html, iterator, variables;
      iterator = 0;
      variables = [];
      html = '';
      ATOM_VARIABLES.forEach(function(v) {
        return html += "<div class='" + v + "'>" + v + "</div>";
      });
      div = document.createElement('div');
      div.className = 'pigments-sampler';
      div.innerHTML = html;
      document.body.appendChild(div);
      ATOM_VARIABLES.forEach(function(v, i) {
        var color, end, node, variable;
        node = div.children[i];
        color = getComputedStyle(node).color;
        end = iterator + v.length + color.length + 4;
        variable = {
          name: "@" + v,
          line: i,
          value: color,
          range: [iterator, end],
          path: THEME_VARIABLES
        };
        iterator = end;
        return variables.push(variable);
      });
      document.body.removeChild(div);
      return variables;
    };

    ColorProject.prototype.getRootPaths = function() {
      return atom.project.getPaths();
    };

    ColorProject.prototype.getSourceNames = function() {
      var names, _ref2, _ref3;
      names = ['.pigments'];
      names = names.concat((_ref2 = this.sourceNames) != null ? _ref2 : []);
      if (!this.ignoreGlobalSourceNames) {
        names = names.concat((_ref3 = atom.config.get('pigments.sourceNames')) != null ? _ref3 : []);
      }
      return names;
    };

    ColorProject.prototype.setSourceNames = function(sourceNames) {
      this.sourceNames = sourceNames != null ? sourceNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return;
      }
      return this.initialize().then((function(_this) {
        return function() {
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalSourceNames = function(ignoreGlobalSourceNames) {
      this.ignoreGlobalSourceNames = ignoreGlobalSourceNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getSearchNames = function() {
      var names, _ref2, _ref3, _ref4, _ref5;
      names = [];
      names = names.concat((_ref2 = this.sourceNames) != null ? _ref2 : []);
      names = names.concat((_ref3 = this.searchNames) != null ? _ref3 : []);
      if (!this.ignoreGlobalSearchNames) {
        names = names.concat((_ref4 = atom.config.get('pigments.sourceNames')) != null ? _ref4 : []);
        names = names.concat((_ref5 = atom.config.get('pigments.extendedSearchNames')) != null ? _ref5 : []);
      }
      return names;
    };

    ColorProject.prototype.setSearchNames = function(searchNames) {
      this.searchNames = searchNames != null ? searchNames : [];
    };

    ColorProject.prototype.setIgnoreGlobalSearchNames = function(ignoreGlobalSearchNames) {
      this.ignoreGlobalSearchNames = ignoreGlobalSearchNames;
    };

    ColorProject.prototype.getIgnoredNames = function() {
      var names, _ref2, _ref3, _ref4;
      names = (_ref2 = this.ignoredNames) != null ? _ref2 : [];
      if (!this.ignoreGlobalIgnoredNames) {
        names = names.concat((_ref3 = this.getGlobalIgnoredNames()) != null ? _ref3 : []);
        names = names.concat((_ref4 = atom.config.get('core.ignoredNames')) != null ? _ref4 : []);
      }
      return names;
    };

    ColorProject.prototype.getGlobalIgnoredNames = function() {
      var _ref2;
      return (_ref2 = atom.config.get('pigments.ignoredNames')) != null ? _ref2.map(function(p) {
        if (/\/\*$/.test(p)) {
          return p + '*';
        } else {
          return p;
        }
      }) : void 0;
    };

    ColorProject.prototype.setIgnoredNames = function(ignoredNames) {
      this.ignoredNames = ignoredNames != null ? ignoredNames : [];
      if ((this.initialized == null) && (this.initializePromise == null)) {
        return Promise.reject('Project is not initialized yet');
      }
      return this.initialize().then((function(_this) {
        return function() {
          var dirtied;
          dirtied = _this.paths.filter(function(p) {
            return _this.isIgnoredPath(p);
          });
          _this.deleteVariablesForPaths(dirtied);
          _this.paths = _this.paths.filter(function(p) {
            return !_this.isIgnoredPath(p);
          });
          return _this.loadPathsAndVariables(true);
        };
      })(this));
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredNames = function(ignoreGlobalIgnoredNames) {
      this.ignoreGlobalIgnoredNames = ignoreGlobalIgnoredNames;
      return this.updatePaths();
    };

    ColorProject.prototype.getIgnoredScopes = function() {
      var scopes, _ref2, _ref3;
      scopes = (_ref2 = this.ignoredScopes) != null ? _ref2 : [];
      if (!this.ignoreGlobalIgnoredScopes) {
        scopes = scopes.concat((_ref3 = atom.config.get('pigments.ignoredScopes')) != null ? _ref3 : []);
      }
      scopes = scopes.concat(this.ignoredFiletypes);
      return scopes;
    };

    ColorProject.prototype.setIgnoredScopes = function(ignoredScopes) {
      this.ignoredScopes = ignoredScopes != null ? ignoredScopes : [];
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setIgnoreGlobalIgnoredScopes = function(ignoreGlobalIgnoredScopes) {
      this.ignoreGlobalIgnoredScopes = ignoreGlobalIgnoredScopes;
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.setSupportedFiletypes = function(supportedFiletypes) {
      this.supportedFiletypes = supportedFiletypes != null ? supportedFiletypes : [];
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.updateIgnoredFiletypes = function() {
      return this.ignoredFiletypes = this.getIgnoredFiletypes();
    };

    ColorProject.prototype.getIgnoredFiletypes = function() {
      var filetypes, scopes, _ref2, _ref3;
      filetypes = (_ref2 = this.supportedFiletypes) != null ? _ref2 : [];
      if (!this.ignoreGlobalSupportedFiletypes) {
        filetypes = filetypes.concat((_ref3 = atom.config.get('pigments.supportedFiletypes')) != null ? _ref3 : []);
      }
      if (filetypes.length === 0) {
        filetypes = ['*'];
      }
      if (filetypes.some(function(type) {
        return type === '*';
      })) {
        return [];
      }
      scopes = filetypes.map(function(ext) {
        var _ref4;
        return (_ref4 = atom.grammars.selectGrammar("file." + ext)) != null ? _ref4.scopeName.replace(/\./g, '\\.') : void 0;
      }).filter(function(scope) {
        return scope != null;
      });
      return ["^(?!\\.(" + (scopes.join('|')) + "))"];
    };

    ColorProject.prototype.setIgnoreGlobalSupportedFiletypes = function(ignoreGlobalSupportedFiletypes) {
      this.ignoreGlobalSupportedFiletypes = ignoreGlobalSupportedFiletypes;
      this.updateIgnoredFiletypes();
      return this.emitter.emit('did-change-ignored-scopes', this.getIgnoredScopes());
    };

    ColorProject.prototype.themesIncluded = function() {
      return this.includeThemes;
    };

    ColorProject.prototype.setIncludeThemes = function(includeThemes) {
      if (includeThemes === this.includeThemes) {
        return Promise.resolve();
      }
      this.includeThemes = includeThemes;
      if (this.includeThemes) {
        this.themesSubscription = atom.themes.onDidChangeActiveThemes((function(_this) {
          return function() {
            var variables;
            if (!_this.includeThemes) {
              return;
            }
            variables = _this.loadThemesVariables();
            return _this.variables.updatePathCollection(THEME_VARIABLES, variables);
          };
        })(this));
        this.subscriptions.add(this.themesSubscription);
        return this.variables.addMany(this.loadThemesVariables());
      } else {
        this.subscriptions.remove(this.themesSubscription);
        this.variables.deleteVariablesForPaths([THEME_VARIABLES]);
        return this.themesSubscription.dispose();
      }
    };

    ColorProject.prototype.getTimestamp = function() {
      return new Date();
    };

    ColorProject.prototype.serialize = function() {
      var data;
      data = {
        deserializer: 'ColorProject',
        timestamp: this.getTimestamp(),
        version: SERIALIZE_VERSION,
        markersVersion: SERIALIZE_MARKERS_VERSION,
        globalSourceNames: atom.config.get('pigments.sourceNames'),
        globalIgnoredNames: atom.config.get('pigments.ignoredNames')
      };
      if (this.ignoreGlobalSourceNames != null) {
        data.ignoreGlobalSourceNames = this.ignoreGlobalSourceNames;
      }
      if (this.ignoreGlobalSearchNames != null) {
        data.ignoreGlobalSearchNames = this.ignoreGlobalSearchNames;
      }
      if (this.ignoreGlobalIgnoredNames != null) {
        data.ignoreGlobalIgnoredNames = this.ignoreGlobalIgnoredNames;
      }
      if (this.ignoreGlobalIgnoredScopes != null) {
        data.ignoreGlobalIgnoredScopes = this.ignoreGlobalIgnoredScopes;
      }
      if (this.includeThemes != null) {
        data.includeThemes = this.includeThemes;
      }
      if (this.ignoredScopes != null) {
        data.ignoredScopes = this.ignoredScopes;
      }
      if (this.ignoredNames != null) {
        data.ignoredNames = this.ignoredNames;
      }
      if (this.sourceNames != null) {
        data.sourceNames = this.sourceNames;
      }
      if (this.searchNames != null) {
        data.searchNames = this.searchNames;
      }
      data.buffers = this.serializeBuffers();
      if (this.isInitialized()) {
        data.paths = this.paths;
        data.variables = this.variables.serialize();
      }
      return data;
    };

    ColorProject.prototype.serializeBuffers = function() {
      var colorBuffer, id, out, _ref2;
      out = {};
      _ref2 = this.colorBuffersByEditorId;
      for (id in _ref2) {
        colorBuffer = _ref2[id];
        out[id] = colorBuffer.serialize();
      }
      return out;
    };

    return ColorProject;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1wcm9qZWN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyUkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosQ0FBQTs7QUFBQSxFQUNBLE9BQXdDLE9BQUEsQ0FBUSxNQUFSLENBQXhDLEVBQUMsZUFBQSxPQUFELEVBQVUsMkJBQUEsbUJBQVYsRUFBK0IsYUFBQSxLQUQvQixDQUFBOztBQUFBLEVBR0EsUUFBaUQsT0FBQSxDQUFRLFlBQVIsQ0FBakQsRUFBQywwQkFBQSxpQkFBRCxFQUFvQixrQ0FBQSx5QkFIcEIsQ0FBQTs7QUFBQSxFQUlDLGtCQUFtQixPQUFBLENBQVEsUUFBUixFQUFuQixlQUpELENBQUE7O0FBQUEsRUFLQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBTGQsQ0FBQTs7QUFBQSxFQU1BLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FOZixDQUFBOztBQUFBLEVBT0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQVBkLENBQUE7O0FBQUEsRUFRQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FSVixDQUFBOztBQUFBLEVBU0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQVRkLENBQUE7O0FBQUEsRUFVQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBVmYsQ0FBQTs7QUFBQSxFQVdBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx3QkFBUixDQVhyQixDQUFBOztBQUFBLEVBWUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHdCQUFSLENBWnRCLENBQUE7O0FBQUEsRUFjQSxjQUFBLEdBQWlCLENBQ2YsWUFEZSxFQUVmLG1CQUZlLEVBR2Ysc0JBSGUs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

//# sourceURL=/home/key/.atom/packages/pigments/lib/color-project.coffee
