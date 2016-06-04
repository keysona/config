(function() {
  var ColorProjectElement, CompositeDisposable, EventsDelegation, SpacePenDSL, capitalize, registerOrUpdateElement, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-utils'), SpacePenDSL = _ref.SpacePenDSL, EventsDelegation = _ref.EventsDelegation, registerOrUpdateElement = _ref.registerOrUpdateElement;

  capitalize = function(s) {
    return s.replace(/^./, function(m) {
      return m.toUpperCase();
    });
  };

  ColorProjectElement = (function(_super) {
    __extends(ColorProjectElement, _super);

    function ColorProjectElement() {
      return ColorProjectElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(ColorProjectElement);

    EventsDelegation.includeInto(ColorProjectElement);

    ColorProjectElement.content = function() {
      var arrayField, booleanField;
      arrayField = (function(_this) {
        return function(name, label, setting, description) {
          var settingName;
          settingName = "pigments." + name;
          return _this.div({
            "class": 'control-group array'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.label({
                "class": 'control-label'
              }, function() {
                return _this.span({
                  "class": 'setting-title'
                }, label);
              });
              return _this.div({
                "class": 'control-wrapper'
              }, function() {
                _this.tag('atom-text-editor', {
                  mini: true,
                  outlet: name,
                  type: 'array',
                  property: name
                });
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  _this.div(function() {
                    _this.raw("Global config: <code>" + (atom.config.get(setting != null ? setting : settingName).join(', ')) + "</code>");
                    if (description != null) {
                      return _this.p(function() {
                        return _this.raw(description);
                      });
                    }
                  });
                  return booleanField("ignoreGlobal" + (capitalize(name)), 'Ignore Global', null, true);
                });
              });
            });
          });
        };
      })(this);
      booleanField = (function(_this) {
        return function(name, label, description, nested) {
          return _this.div({
            "class": 'control-group boolean'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.input({
                type: 'checkbox',
                id: "pigments-" + name,
                outlet: name
              });
              _this.label({
                "class": 'control-label',
                "for": "pigments-" + name
              }, function() {
                return _this.span({
                  "class": (nested ? 'setting-description' : 'setting-title')
                }, label);
              });
              if (description != null) {
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  return _this.raw(description);
                });
              }
            });
          });
        };
      })(this);
      return this.section({
        "class": 'settings-view pane-item'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'settings-wrapper'
          }, function() {
            _this.div({
              "class": 'header'
            }, function() {
              _this.div({
                "class": 'logo'
              }, function() {
                return _this.img({
                  src: 'atom://pigments/resources/logo.svg',
                  width: 140,
                  height: 35
                });
              });
              return _this.p({
                "class": 'setting-description'
              }, "These settings apply on the current project only and are complementary\nto the package settings.");
            });
            return _this.div({
              "class": 'fields'
            }, function() {
              var themes;
              themes = atom.themes.getActiveThemeNames();
              arrayField('sourceNames', 'Source Names');
              arrayField('ignoredNames', 'Ignored Names');
              arrayField('supportedFiletypes', 'Supported Filetypes');
              arrayField('ignoredScopes', 'Ignored Scopes');
              arrayField('searchNames', 'Extended Search Names', 'pigments.extendedSearchNames');
              return booleanField('includeThemes', 'Include Atom Themes Stylesheets', "The variables from <code>" + themes[0] + "</code> and\n<code>" + themes[1] + "</code> themes will be automatically added to the\nproject palette.");
            });
          });
        };
      })(this));
    };

    ColorProjectElement.prototype.createdCallback = function() {
      return this.subscriptions = new CompositeDisposable;
    };

    ColorProjectElement.prototype.setModel = function(project) {
      this.project = project;
      return this.initializeBindings();
    };

    ColorProjectElement.prototype.initializeBindings = function() {
      var grammar;
      grammar = atom.grammars.grammarForScopeName('source.js.regexp');
      this.ignoredScopes.getModel().setGrammar(grammar);
      this.initializeTextEditor('sourceNames');
      this.initializeTextEditor('searchNames');
      this.initializeTextEditor('ignoredNames');
      this.initializeTextEditor('ignoredScopes');
      this.initializeTextEditor('supportedFiletypes');
      this.initializeCheckbox('includeThemes');
      this.initializeCheckbox('ignoreGlobalSourceNames');
      this.initializeCheckbox('ignoreGlobalIgnoredNames');
      this.initializeCheckbox('ignoreGlobalIgnoredScopes');
      this.initializeCheckbox('ignoreGlobalSearchNames');
      return this.initializeCheckbox('ignoreGlobalSupportedFiletypes');
    };

    ColorProjectElement.prototype.initializeTextEditor = function(name) {
      var capitalizedName, editor, _ref1;
      capitalizedName = capitalize(name);
      editor = this[name].getModel();
      editor.setText(((_ref1 = this.project[name]) != null ? _ref1 : []).join(', '));
      return this.subscriptions.add(editor.onDidStopChanging((function(_this) {
        return function() {
          var array;
          array = editor.getText().split(/\s*,\s*/g).filter(function(s) {
            return s.length > 0;
          });
          return _this.project["set" + capitalizedName](array);
        };
      })(this)));
    };

    ColorProjectElement.prototype.initializeCheckbox = function(name) {
      var capitalizedName, checkbox;
      capitalizedName = capitalize(name);
      checkbox = this[name];
      checkbox.checked = this.project[name];
      return this.subscriptions.add(this.subscribeTo(checkbox, {
        change: (function(_this) {
          return function() {
            return _this.project["set" + capitalizedName](checkbox.checked);
          };
        })(this)
      }));
    };

    ColorProjectElement.prototype.getTitle = function() {
      return 'Project Settings';
    };

    ColorProjectElement.prototype.getURI = function() {
      return 'pigments://settings';
    };

    ColorProjectElement.prototype.getIconName = function() {
      return "pigments";
    };

    ColorProjectElement.prototype.serialize = function() {
      return {
        deserializer: this.constructor.name
      };
    };

    return ColorProjectElement;

  })(HTMLElement);

  module.exports = ColorProjectElement = registerOrUpdateElement('pigments-color-project', ColorProjectElement.prototype);

  ColorProjectElement.deserialize = function(state) {
    var element;
    element = new ColorProjectElement;
    element.setModel(atom.packages.getActivePackage('pigments').mainModule.getProject());
    return element;
  };

  ColorProjectElement.registerViewProvider = function(modelClass) {
    return atom.views.addViewProvider(modelClass, function(model) {
      var element;
      element = new ColorProjectElement;
      element.setModel(model);
      return element;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1wcm9qZWN0LWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLE9BQTJELE9BQUEsQ0FBUSxZQUFSLENBQTNELEVBQUMsbUJBQUEsV0FBRCxFQUFjLHdCQUFBLGdCQUFkLEVBQWdDLCtCQUFBLHVCQURoQyxDQUFBOztBQUFBLEVBR0EsVUFBQSxHQUFhLFNBQUMsQ0FBRCxHQUFBO1dBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQyxDQUFDLFdBQUYsQ0FBQSxFQUFQO0lBQUEsQ0FBaEIsRUFBUDtFQUFBLENBSGIsQ0FBQTs7QUFBQSxFQUtNO0FBQ0osMENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBVyxDQUFDLFdBQVosQ0FBd0IsbUJBQXhCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLG1CQUE3QixDQURBLENBQUE7O0FBQUEsSUFHQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7QUFDUixVQUFBLHdCQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxPQUFkLEVBQXVCLFdBQXZCLEdBQUE7QUFDWCxjQUFBLFdBQUE7QUFBQSxVQUFBLFdBQUEsR0FBZSxXQUFBLEdBQVcsSUFBMUIsQ0FBQTtpQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8scUJBQVA7V0FBTCxF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

//# sourceURL=/home/key/.atom/packages/pigments/lib/color-project-element.coffee
