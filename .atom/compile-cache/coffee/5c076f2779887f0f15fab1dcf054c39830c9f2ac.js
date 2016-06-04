(function() {
  var Dom;

  Dom = require('./dom');

  module.exports = {
    init: function(state) {
      var self;
      self = this;
      this.themeSet = false;
      if (self.isLoaded('seti-syntax')) {
        atom.config.onDidChange('seti-syntax.themeColor', function(value) {
          return self.setTheme(value.newValue, value.oldValue, true);
        });
        atom.config.onDidChange('seti-syntax.dynamicColor', function(value) {
          var newColor;
          if (value.newValue) {
            newColor = atom.config.get('seti-ui.themeColor');
            return self.setTheme(newColor, false, true);
          } else {
            if (atom.config.get('seti-syntax.themeColor')) {
              newColor = atom.config.get('seti-syntax.themeColor');
            } else {
              newColor = 'default';
            }
            return self.setTheme(newColor, false, true);
          }
        });
        if (self.isLoaded('seti-ui')) {
          if (atom.config.get('seti-syntax.dynamicColor') && !this.themeSet) {
            self.setTheme(atom.config.get('seti-ui.themeColor'), false, false);
          }
          atom.config.onDidChange('seti-ui.themeColor', function(value) {
            if (atom.config.get('seti-syntax.dynamicColor')) {
              return self.setTheme(value.newValue, value.oldValue, false);
            }
          });
          self.onDeactivate('seti-ui', function() {
            if (atom.config.get('seti-syntax.dynamicColor')) {
              return self.setTheme('default', false, false);
            }
          });
        }
        if ((atom.config.get('seti-syntax.themeColor')) && !this.themeSet) {
          return self.setTheme(atom.config.get('seti-syntax.themeColor'), false, false);
        } else if (!this.themeSet) {
          return self.setTheme('default', false, false);
        }
      }
    },
    isLoaded: function(which) {
      return atom.packages.isPackageLoaded(which);
    },
    onActivate: function(which, cb) {
      return atom.packages.onDidActivatePackage(function(pkg) {
        if (pkg.name === which) {
          return cb(pkg);
        }
      });
    },
    onDeactivate: function(which, cb) {
      return atom.packages.onDidDeactivatePackage(function(pkg) {
        if (pkg.name === which) {
          return cb(pkg);
        }
      });
    },
    "package": atom.packages.getLoadedPackage('seti-syntax'),
    packageInfo: function(which) {
      return atom.packages.getLoadedPackage(which);
    },
    refresh: function() {
      var self;
      self = this;
      self["package"].deactivate();
      return setImmediate(function() {
        return self["package"].activate();
      });
    },
    setTheme: function(theme, previous, reload) {
      var fs, pkg, self, themeData;
      self = this;
      fs = require('fs');
      pkg = this["package"];
      themeData = '@import "themes/' + theme.toLowerCase() + '";';
      this.themeSet = true;
      return fs.readFile(pkg.path + '/styles/user-theme.less', 'utf8', function(err, fileData) {
        if (fileData !== themeData) {
          return fs.writeFile(pkg.path + '/styles/user-theme.less', themeData, function(err) {
            if (!err) {
              return self.refresh();
            }
          });
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3NldGktc3ludGF4L2xpYi9zZXR0aW5ncy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsR0FBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUFOLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxJQUFBLEVBQU0sU0FBQyxLQUFELEdBQUE7QUFFSixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FEWixDQUFBO0FBSUEsTUFBQSxJQUFHLElBQUksQ0FBQyxRQUFMLENBQWMsYUFBZCxDQUFIO0FBR0UsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0Isd0JBQXhCLEVBQWtELFNBQUMsS0FBRCxHQUFBO2lCQUNoRCxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQUssQ0FBQyxRQUFwQixFQUE4QixLQUFLLENBQUMsUUFBcEMsRUFBOEMsSUFBOUMsRUFEZ0Q7UUFBQSxDQUFsRCxDQUFBLENBQUE7QUFBQSxRQUlBLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QiwwQkFBeEIsRUFBb0QsU0FBQyxLQUFELEdBQUE7QUFFbEQsY0FBQSxRQUFBO0FBQUEsVUFBQSxJQUFJLEtBQUssQ0FBQyxRQUFWO0FBQ0UsWUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixDQUFYLENBQUE7bUJBQ0EsSUFBSSxDQUFDLFFBQUwsQ0FBYyxRQUFkLEVBQXdCLEtBQXhCLEVBQStCLElBQS9CLEVBRkY7V0FBQSxNQUFBO0FBTUUsWUFBQSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3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

//# sourceURL=/home/key/.atom/packages/seti-syntax/lib/settings.coffee
