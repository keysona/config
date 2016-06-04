Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _atomUtils = require('atom-utils');

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

/**
 * @access private
 */
'use babel';

var MinimapQuickSettingsElement = (function () {
  function MinimapQuickSettingsElement() {
    _classCallCheck(this, _MinimapQuickSettingsElement);
  }

  _createClass(MinimapQuickSettingsElement, [{
    key: 'createdCallback',
    value: function createdCallback() {
      this.buildContent();
    }
  }, {
    key: 'setModel',
    value: function setModel(minimap) {
      var _this = this;

      this.selectedItem = null;
      this.minimap = minimap;
      this.emitter = new _atom.Emitter();
      this.subscriptions = new _atom.CompositeDisposable();
      this.plugins = {};
      this.itemsActions = new WeakMap();

      var subs = this.subscriptions;

      subs.add(_main2['default'].onDidAddPlugin(function (_ref) {
        var name = _ref.name;
        var plugin = _ref.plugin;

        return _this.addItemFor(name, plugin);
      }));
      subs.add(_main2['default'].onDidRemovePlugin(function (_ref2) {
        var name = _ref2.name;
        var plugin = _ref2.plugin;

        return _this.removeItemFor(name, plugin);
      }));
      subs.add(_main2['default'].onDidActivatePlugin(function (_ref3) {
        var name = _ref3.name;
        var plugin = _ref3.plugin;

        return _this.activateItem(name, plugin);
      }));
      subs.add(_main2['default'].onDidDeactivatePlugin(function (_ref4) {
        var name = _ref4.name;
        var plugin = _ref4.plugin;

        return _this.deactivateItem(name, plugin);
      }));

      subs.add(atom.commands.add('minimap-quick-settings', {
        'core:move-up': function coreMoveUp() {
          _this.selectPreviousItem();
        },
        'core:move-down': function coreMoveDown() {
          _this.selectNextItem();
        },
        'core:move-left': function coreMoveLeft() {
          atom.config.set('minimap.displayMinimapOnLeft', true);
        },
        'core:move-right': function coreMoveRight() {
          atom.config.set('minimap.displayMinimapOnLeft', false);
        },
        'core:cancel': function coreCancel() {
          _this.destroy();
        },
        'core:confirm': function coreConfirm() {
          _this.toggleSelectedItem();
        }
      }));

      this.codeHighlights.classList.toggle('active', this.minimap.displayCodeHighlights);

      subs.add(this.subscribeTo(this.codeHighlights, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.displayCodeHighlights', !_this.minimap.displayCodeHighlights);
        }
      }));

      this.itemsActions.set(this.codeHighlights, function () {
        atom.config.set('minimap.displayCodeHighlights', !_this.minimap.displayCodeHighlights);
      });

      subs.add(this.subscribeTo(this.absoluteMode, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'));
        }
      }));

      this.itemsActions.set(this.absoluteMode, function () {
        atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'));
      });

      subs.add(this.subscribeTo(this.hiddenInput, {
        'focusout': function focusout(e) {
          _this.destroy();
        }
      }));

      subs.add(this.subscribeTo(this.onLeftButton, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.displayMinimapOnLeft', true);
        }
      }));

      subs.add(this.subscribeTo(this.onRightButton, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          atom.config.set('minimap.displayMinimapOnLeft', false);
        }
      }));

      subs.add(atom.config.observe('minimap.displayCodeHighlights', function (bool) {
        _this.codeHighlights.classList.toggle('active', bool);
      }));

      subs.add(atom.config.observe('minimap.absoluteMode', function (bool) {
        _this.absoluteMode.classList.toggle('active', bool);
      }));

      subs.add(atom.config.observe('minimap.displayMinimapOnLeft', function (bool) {
        _this.onLeftButton.classList.toggle('selected', bool);
        _this.onRightButton.classList.toggle('selected', !bool);
      }));

      this.initList();
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'attach',
    value: function attach() {
      var workspaceElement = atom.views.getView(atom.workspace);
      workspaceElement.appendChild(this);
      this.hiddenInput.focus();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
      this.parentNode.removeChild(this);
    }
  }, {
    key: 'initList',
    value: function initList() {
      this.itemsDisposables = new WeakMap();
      for (var _name in _main2['default'].plugins) {
        this.addItemFor(_name, _main2['default'].plugins[_name]);
      }
    }
  }, {
    key: 'toggleSelectedItem',
    value: function toggleSelectedItem() {
      var fn = this.itemsActions.get(this.selectedItem);
      if (typeof fn === 'function') {
        fn();
      }
    }
  }, {
    key: 'selectNextItem',
    value: function selectNextItem() {
      this.selectedItem.classList.remove('selected');
      if (this.selectedItem.nextSibling != null) {
        this.selectedItem = this.selectedItem.nextSibling;
        if (this.selectedItem.matches('.separator')) {
          this.selectedItem = this.selectedItem.nextSibling;
        }
      } else {
        this.selectedItem = this.list.firstChild;
      }
      this.selectedItem.classList.add('selected');
    }
  }, {
    key: 'selectPreviousItem',
    value: function selectPreviousItem() {
      this.selectedItem.classList.remove('selected');
      if (this.selectedItem.previousSibling != null) {
        this.selectedItem = this.selectedItem.previousSibling;
        if (this.selectedItem.matches('.separator')) {
          this.selectedItem = this.selectedItem.previousSibling;
        }
      } else {
        this.selectedItem = this.list.lastChild;
      }
      this.selectedItem.classList.add('selected');
    }
  }, {
    key: 'addItemFor',
    value: function addItemFor(name, plugin) {
      var item = document.createElement('li');
      var action = function action() {
        _main2['default'].togglePluginActivation(name);
      };

      if (plugin.isActive()) {
        item.classList.add('active');
      }

      item.textContent = name;

      this.itemsActions.set(item, action);
      this.itemsDisposables.set(item, this.addDisposableEventListener(item, 'mousedown', function (e) {
        e.preventDefault();
        action();
      }));

      this.plugins[name] = item;
      this.list.insertBefore(item, this.separator);

      if (!(this.selectedItem != null)) {
        this.selectedItem = item;
        this.selectedItem.classList.add('selected');
      }
    }
  }, {
    key: 'removeItemFor',
    value: function removeItemFor(name, plugin) {
      try {
        this.list.removeChild(this.plugins[name]);
      } catch (error) {}

      delete this.plugins[name];
    }
  }, {
    key: 'activateItem',
    value: function activateItem(name, plugin) {
      this.plugins[name].classList.add('active');
    }
  }, {
    key: 'deactivateItem',
    value: function deactivateItem(name, plugin) {
      this.plugins[name].classList.remove('active');
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this2 = this;

      this.div({ 'class': 'select-list popover-list minimap-quick-settings' }, function () {
        _this2.input({ type: 'text', 'class': 'hidden-input', outlet: 'hiddenInput' });
        _this2.ol({ 'class': 'list-group mark-active', outlet: 'list' }, function () {
          _this2.li({ 'class': 'separator', outlet: 'separator' });
          _this2.li({ 'class': 'code-highlights', outlet: 'codeHighlights' }, 'code-highlights');
          _this2.li({ 'class': 'absolute-mode', outlet: 'absoluteMode' }, 'absolute-mode');
        });
        _this2.div({ 'class': 'btn-group' }, function () {
          _this2.button({ 'class': 'btn btn-default', outlet: 'onLeftButton' }, 'On Left');
          _this2.button({ 'class': 'btn btn-default', outlet: 'onRightButton' }, 'On Right');
        });
      });
    }
  }]);

  var _MinimapQuickSettingsElement = MinimapQuickSettingsElement;
  MinimapQuickSettingsElement = (0, _decoratorsInclude2['default'])(_atomUtils.EventsDelegation, _atomUtils.SpacePenDSL.Babel)(MinimapQuickSettingsElement) || MinimapQuickSettingsElement;
  MinimapQuickSettingsElement = (0, _decoratorsElement2['default'])('minimap-quick-settings')(MinimapQuickSettingsElement) || MinimapQuickSettingsElement;
  return MinimapQuickSettingsElement;
})();

exports['default'] = MinimapQuickSettingsElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLXF1aWNrLXNldHRpbmdzLWVsZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFMkMsTUFBTTs7eUJBQ0wsWUFBWTs7b0JBRXZDLFFBQVE7Ozs7aUNBQ0wsc0JBQXNCOzs7O2lDQUN0QixzQkFBc0I7Ozs7Ozs7QUFQMUMsV0FBVyxDQUFBOztJQWNVLDJCQUEyQjtXQUEzQiwyQkFBMkI7Ozs7ZUFBM0IsMkJBQTJCOztXQWlCOUIsMkJBQUc7QUFDakIsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO0tBQ3BCOzs7V0FFUSxrQkFBQyxPQUFPLEVBQUU7OztBQUNqQixVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUN4QixVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQUN0QixVQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsVUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxVQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQTtBQUNqQixVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUE7O0FBRWpDLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUE7O0FBRTdCLFVBQUksQ0FBQyxHQUFHLENBQUMsa0JBQUssY0FBYyxDQUFDLFVBQUMsSUFBYyxFQUFLO1lBQWxCLElBQUksR0FBTCxJQUFjLENBQWIsSUFBSTtZQUFFLE1BQU0sR0FBYixJQUFjLENBQVAsTUFBTTs7QUFDekMsZUFBTyxNQUFLLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDckMsQ0FBQyxDQUFDLENBQUE7QUFDSCxVQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFLLGlCQUFpQixDQUFDLFVBQUMsS0FBYyxFQUFLO1lBQWxCLElBQUksR0FBTCxLQUFjLENBQWIsSUFBSTtZQUFFLE1BQU0sR0FBYixLQUFjLENBQVAsTUFBTTs7QUFDNUMsZUFBTyxNQUFLLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDeEMsQ0FBQyxDQUFDLENBQUE7QUFDSCxVQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFLLG1CQUFtQixDQUFDLFVBQUMsS0FBYyxFQUFLO1lBQWxCLElBQUksR0FBTCxLQUFjLENBQWIsSUFBSTtZQUFFLE1BQU0sR0FBYixLQUFjLENBQVAsTUFBTTs7QUFDOUMsZUFBTyxNQUFLLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDdkMsQ0FBQyxDQUFDLENBQUE7QUFDSCxVQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFLLHFCQUFxQixDQUFDLFVBQUMsS0FBYyxFQUFLO1lBQWxCLElBQUksR0FBTCxLQUFjLENBQWIsSUFBSTtZQUFFLE1BQU0sR0FBYixLQUFjLENBQVAsTUFBTTs7QUFDaEQsZUFBTyxNQUFLLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDekMsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtBQUNuRCxzQkFBYyxFQUFFLHNCQUFNO0FBQ3BCLGdCQUFLLGtCQUFrQixFQUFFLENBQUE7U0FDMUI7QUFDRCx3QkFBZ0IsRUFBRSx3QkFBTTtBQUN0QixnQkFBSyxjQUFjLEVBQUUsQ0FBQTtTQUN0QjtBQUNELHdCQUFnQixFQUFFLHdCQUFNO0FBQ3RCLGNBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ3REO0FBQ0QseUJBQWlCLEVBQUUseUJBQU07QUFDdkIsY0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUUsS0FBSyxDQUFDLENBQUE7U0FDdkQ7QUFDRCxxQkFBYSxFQUFFLHNCQUFNO0FBQ25CLGdCQUFLLE9BQU8sRUFBRSxDQUFBO1NBQ2Y7QUFDRCxzQkFBYyxFQUFFLHVCQUFNO0FBQ3BCLGdCQUFLLGtCQUFrQixFQUFFLENBQUE7U0FDMUI7T0FDRixDQUFDLENBQUMsQ0FBQTs7QUFFSCxVQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQTs7QUFFbEYsVUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDN0MsbUJBQVcsRUFBRSxtQkFBQyxDQUFDLEVBQUs7QUFDbEIsV0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO0FBQ2xCLGNBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLENBQUMsTUFBSyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQTtTQUN0RjtPQUNGLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsWUFBTTtBQUMvQyxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxDQUFDLE1BQUssT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUE7T0FDdEYsQ0FBQyxDQUFBOztBQUVGLFVBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQzNDLG1CQUFXLEVBQUUsbUJBQUMsQ0FBQyxFQUFLO0FBQ2xCLFdBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtBQUNsQixjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQTtTQUNsRjtPQUNGLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsWUFBTTtBQUM3QyxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQTtPQUNsRixDQUFDLENBQUE7O0FBRUYsVUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDMUMsa0JBQVUsRUFBRSxrQkFBQyxDQUFDLEVBQUs7QUFBRSxnQkFBSyxPQUFPLEVBQUUsQ0FBQTtTQUFFO09BQ3RDLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQzNDLG1CQUFXLEVBQUUsbUJBQUMsQ0FBQyxFQUFLO0FBQ2xCLFdBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtBQUNsQixjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUN0RDtPQUNGLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQzVDLG1CQUFXLEVBQUUsbUJBQUMsQ0FBQyxFQUFLO0FBQ2xCLFdBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtBQUNsQixjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxLQUFLLENBQUMsQ0FBQTtTQUN2RDtPQUNGLENBQUMsQ0FBQyxDQUFBOztBQUVILFVBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDdEUsY0FBSyxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDckQsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxVQUFDLElBQUksRUFBSztBQUM3RCxjQUFLLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtPQUNuRCxDQUFDLENBQUMsQ0FBQTs7QUFFSCxVQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ3JFLGNBQUssWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3BELGNBQUssYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDdkQsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO0tBQ2hCOzs7V0FFWSxzQkFBQyxRQUFRLEVBQUU7QUFDdEIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEQ7OztXQUVNLGtCQUFHO0FBQ1IsVUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDekQsc0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2xDLFVBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDekI7OztXQUVPLG1CQUFHO0FBQ1QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUNsQzs7O1dBRVEsb0JBQUc7QUFDVixVQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUNyQyxXQUFLLElBQUksS0FBSSxJQUFJLGtCQUFLLE9BQU8sRUFBRTtBQUM3QixZQUFJLENBQUMsVUFBVSxDQUFDLEtBQUksRUFBRSxrQkFBSyxPQUFPLENBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQTtPQUMxQztLQUNGOzs7V0FFa0IsOEJBQUc7QUFDcEIsVUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ2pELFVBQUksT0FBTyxFQUFFLEtBQUssVUFBVSxFQUFFO0FBQUUsVUFBRSxFQUFFLENBQUE7T0FBRTtLQUN2Qzs7O1dBRWMsMEJBQUc7QUFDaEIsVUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQzlDLFVBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFHO0FBQzNDLFlBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUE7QUFDakQsWUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUMzQyxjQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFBO1NBQ2xEO09BQ0YsTUFBTTtBQUNMLFlBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUE7T0FDekM7QUFDRCxVQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7S0FDNUM7OztXQUVrQiw4QkFBRztBQUNwQixVQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDOUMsVUFBSyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUc7QUFDL0MsWUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQTtBQUNyRCxZQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQzNDLGNBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUE7U0FDdEQ7T0FDRixNQUFNO0FBQ0wsWUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQTtPQUN4QztBQUNELFVBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtLQUM1Qzs7O1dBRVUsb0JBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUN4QixVQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZDLFVBQUksTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFTO0FBQUUsMEJBQUssc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUE7T0FBRSxDQUFBOztBQUV4RCxVQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUFFLFlBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQUU7O0FBRXZELFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBOztBQUV2QixVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDbkMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDeEYsU0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO0FBQ2xCLGNBQU0sRUFBRSxDQUFBO09BQ1QsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDekIsVUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFNUMsVUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFBLEFBQUMsRUFBRTtBQUNoQyxZQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUN4QixZQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7T0FDNUM7S0FDRjs7O1dBRWEsdUJBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUMzQixVQUFJO0FBQ0YsWUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO09BQzFDLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRTs7QUFFbEIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzFCOzs7V0FFWSxzQkFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQzFCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMzQzs7O1dBRWMsd0JBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM1QixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDOUM7OztXQXBOYyxtQkFBRzs7O0FBQ2hCLFVBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxTQUFPLGlEQUFpRCxFQUFDLEVBQUUsWUFBTTtBQUN6RSxlQUFLLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBTyxjQUFjLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUE7QUFDeEUsZUFBSyxFQUFFLENBQUMsRUFBQyxTQUFPLHdCQUF3QixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsRUFBRSxZQUFNO0FBQy9ELGlCQUFLLEVBQUUsQ0FBQyxFQUFDLFNBQU8sV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUMsQ0FBQyxDQUFBO0FBQ2xELGlCQUFLLEVBQUUsQ0FBQyxFQUFDLFNBQU8saUJBQWlCLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtBQUNoRixpQkFBSyxFQUFFLENBQUMsRUFBQyxTQUFPLGVBQWUsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFDLEVBQUUsZUFBZSxDQUFDLENBQUE7U0FDM0UsQ0FBQyxDQUFBO0FBQ0YsZUFBSyxHQUFHLENBQUMsRUFBQyxTQUFPLFdBQVcsRUFBQyxFQUFFLFlBQU07QUFDbkMsaUJBQUssTUFBTSxDQUFDLEVBQUMsU0FBTyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDMUUsaUJBQUssTUFBTSxDQUFDLEVBQUMsU0FBTyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDLEVBQUUsVUFBVSxDQUFDLENBQUE7U0FDN0UsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0g7OztxQ0Fma0IsMkJBQTJCO0FBQTNCLDZCQUEyQixHQUQvQyxpRUFBMEIsdUJBQVksS0FBSyxDQUFDLENBQ3hCLDJCQUEyQixLQUEzQiwyQkFBMkI7QUFBM0IsNkJBQTJCLEdBRi9DLG9DQUFRLHdCQUF3QixDQUFDLENBRWIsMkJBQTJCLEtBQTNCLDJCQUEyQjtTQUEzQiwyQkFBMkI7OztxQkFBM0IsMkJBQTJCIiwiZmlsZSI6Ii9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLXF1aWNrLXNldHRpbmdzLWVsZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nXG5pbXBvcnQge0V2ZW50c0RlbGVnYXRpb24sIFNwYWNlUGVuRFNMfSBmcm9tICdhdG9tLXV0aWxzJ1xuXG5pbXBvcnQgTWFpbiBmcm9tICcuL21haW4nXG5pbXBvcnQgZWxlbWVudCBmcm9tICcuL2RlY29yYXRvcnMvZWxlbWVudCdcbmltcG9ydCBpbmNsdWRlIGZyb20gJy4vZGVjb3JhdG9ycy9pbmNsdWRlJ1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5AZWxlbWVudCgnbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG5AaW5jbHVkZShFdmVudHNEZWxlZ2F0aW9uLCBTcGFjZVBlbkRTTC5CYWJlbClcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pbmltYXBRdWlja1NldHRpbmdzRWxlbWVudCB7XG5cbiAgc3RhdGljIGNvbnRlbnQgKCkge1xuICAgIHRoaXMuZGl2KHtjbGFzczogJ3NlbGVjdC1saXN0IHBvcG92ZXItbGlzdCBtaW5pbWFwLXF1aWNrLXNldHRpbmdzJ30sICgpID0+IHtcbiAgICAgIHRoaXMuaW5wdXQoe3R5cGU6ICd0ZXh0JywgY2xhc3M6ICdoaWRkZW4taW5wdXQnLCBvdXRsZXQ6ICdoaWRkZW5JbnB1dCd9KVxuICAgICAgdGhpcy5vbCh7Y2xhc3M6ICdsaXN0LWdyb3VwIG1hcmstYWN0aXZlJywgb3V0bGV0OiAnbGlzdCd9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMubGkoe2NsYXNzOiAnc2VwYXJhdG9yJywgb3V0bGV0OiAnc2VwYXJhdG9yJ30pXG4gICAgICAgIHRoaXMubGkoe2NsYXNzOiAnY29kZS1oaWdobGlnaHRzJywgb3V0bGV0OiAnY29kZUhpZ2hsaWdodHMnfSwgJ2NvZGUtaGlnaGxpZ2h0cycpXG4gICAgICAgIHRoaXMubGkoe2NsYXNzOiAnYWJzb2x1dGUtbW9kZScsIG91dGxldDogJ2Fic29sdXRlTW9kZSd9LCAnYWJzb2x1dGUtbW9kZScpXG4gICAgICB9KVxuICAgICAgdGhpcy5kaXYoe2NsYXNzOiAnYnRuLWdyb3VwJ30sICgpID0+IHtcbiAgICAgICAgdGhpcy5idXR0b24oe2NsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0Jywgb3V0bGV0OiAnb25MZWZ0QnV0dG9uJ30sICdPbiBMZWZ0JylcbiAgICAgICAgdGhpcy5idXR0b24oe2NsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0Jywgb3V0bGV0OiAnb25SaWdodEJ1dHRvbid9LCAnT24gUmlnaHQnKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgY3JlYXRlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLmJ1aWxkQ29udGVudCgpXG4gIH1cblxuICBzZXRNb2RlbCAobWluaW1hcCkge1xuICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gbnVsbFxuICAgIHRoaXMubWluaW1hcCA9IG1pbmltYXBcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMucGx1Z2lucyA9IHt9XG4gICAgdGhpcy5pdGVtc0FjdGlvbnMgPSBuZXcgV2Vha01hcCgpXG5cbiAgICBsZXQgc3VicyA9IHRoaXMuc3Vic2NyaXB0aW9uc1xuXG4gICAgc3Vicy5hZGQoTWFpbi5vbkRpZEFkZFBsdWdpbigoe25hbWUsIHBsdWdpbn0pID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmFkZEl0ZW1Gb3IobmFtZSwgcGx1Z2luKVxuICAgIH0pKVxuICAgIHN1YnMuYWRkKE1haW4ub25EaWRSZW1vdmVQbHVnaW4oKHtuYW1lLCBwbHVnaW59KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW1vdmVJdGVtRm9yKG5hbWUsIHBsdWdpbilcbiAgICB9KSlcbiAgICBzdWJzLmFkZChNYWluLm9uRGlkQWN0aXZhdGVQbHVnaW4oKHtuYW1lLCBwbHVnaW59KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5hY3RpdmF0ZUl0ZW0obmFtZSwgcGx1Z2luKVxuICAgIH0pKVxuICAgIHN1YnMuYWRkKE1haW4ub25EaWREZWFjdGl2YXRlUGx1Z2luKCh7bmFtZSwgcGx1Z2lufSkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZGVhY3RpdmF0ZUl0ZW0obmFtZSwgcGx1Z2luKVxuICAgIH0pKVxuXG4gICAgc3Vicy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ21pbmltYXAtcXVpY2stc2V0dGluZ3MnLCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdFByZXZpb3VzSXRlbSgpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdE5leHRJdGVtKClcbiAgICAgIH0sXG4gICAgICAnY29yZTptb3ZlLWxlZnQnOiAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6bW92ZS1yaWdodCc6ICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgZmFsc2UpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4ge1xuICAgICAgICB0aGlzLmRlc3Ryb3koKVxuICAgICAgfSxcbiAgICAgICdjb3JlOmNvbmZpcm0nOiAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlU2VsZWN0ZWRJdGVtKClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRoaXMuY29kZUhpZ2hsaWdodHMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgdGhpcy5taW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cylcblxuICAgIHN1YnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcy5jb2RlSGlnaGxpZ2h0cywge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzJywgIXRoaXMubWluaW1hcC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLml0ZW1zQWN0aW9ucy5zZXQodGhpcy5jb2RlSGlnaGxpZ2h0cywgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cycsICF0aGlzLm1pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzKVxuICAgIH0pXG5cbiAgICBzdWJzLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMuYWJzb2x1dGVNb2RlLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hYnNvbHV0ZU1vZGUnLCAhYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgdGhpcy5pdGVtc0FjdGlvbnMuc2V0KHRoaXMuYWJzb2x1dGVNb2RlLCAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJywgIWF0b20uY29uZmlnLmdldCgnbWluaW1hcC5hYnNvbHV0ZU1vZGUnKSlcbiAgICB9KVxuXG4gICAgc3Vicy5hZGQodGhpcy5zdWJzY3JpYmVUbyh0aGlzLmhpZGRlbklucHV0LCB7XG4gICAgICAnZm9jdXNvdXQnOiAoZSkgPT4geyB0aGlzLmRlc3Ryb3koKSB9XG4gICAgfSkpXG5cbiAgICBzdWJzLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMub25MZWZ0QnV0dG9uLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBzdWJzLmFkZCh0aGlzLnN1YnNjcmliZVRvKHRoaXMub25SaWdodEJ1dHRvbiwge1xuICAgICAgJ21vdXNlZG93bic6IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCBmYWxzZSlcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHN1YnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ21pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzJywgKGJvb2wpID0+IHtcbiAgICAgIHRoaXMuY29kZUhpZ2hsaWdodHMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgYm9vbClcbiAgICB9KSlcblxuICAgIHN1YnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ21pbmltYXAuYWJzb2x1dGVNb2RlJywgKGJvb2wpID0+IHtcbiAgICAgIHRoaXMuYWJzb2x1dGVNb2RlLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGJvb2wpXG4gICAgfSkpXG5cbiAgICBzdWJzLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgKGJvb2wpID0+IHtcbiAgICAgIHRoaXMub25MZWZ0QnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdGVkJywgYm9vbClcbiAgICAgIHRoaXMub25SaWdodEJ1dHRvbi5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3RlZCcsICFib29sKVxuICAgIH0pKVxuXG4gICAgdGhpcy5pbml0TGlzdCgpXG4gIH1cblxuICBvbkRpZERlc3Ryb3kgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjaylcbiAgfVxuXG4gIGF0dGFjaCAoKSB7XG4gICAgbGV0IHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgd29ya3NwYWNlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzKVxuICAgIHRoaXMuaGlkZGVuSW5wdXQuZm9jdXMoKVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpXG4gIH1cblxuICBpbml0TGlzdCAoKSB7XG4gICAgdGhpcy5pdGVtc0Rpc3Bvc2FibGVzID0gbmV3IFdlYWtNYXAoKVxuICAgIGZvciAobGV0IG5hbWUgaW4gTWFpbi5wbHVnaW5zKSB7XG4gICAgICB0aGlzLmFkZEl0ZW1Gb3IobmFtZSwgTWFpbi5wbHVnaW5zW25hbWVdKVxuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZVNlbGVjdGVkSXRlbSAoKSB7XG4gICAgbGV0IGZuID0gdGhpcy5pdGVtc0FjdGlvbnMuZ2V0KHRoaXMuc2VsZWN0ZWRJdGVtKVxuICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHsgZm4oKSB9XG4gIH1cblxuICBzZWxlY3ROZXh0SXRlbSAoKSB7XG4gICAgdGhpcy5zZWxlY3RlZEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICAgIGlmICgodGhpcy5zZWxlY3RlZEl0ZW0ubmV4dFNpYmxpbmcgIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW0ubmV4dFNpYmxpbmdcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbS5tYXRjaGVzKCcuc2VwYXJhdG9yJykpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0gPSB0aGlzLnNlbGVjdGVkSXRlbS5uZXh0U2libGluZ1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IHRoaXMubGlzdC5maXJzdENoaWxkXG4gICAgfVxuICAgIHRoaXMuc2VsZWN0ZWRJdGVtLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgfVxuXG4gIHNlbGVjdFByZXZpb3VzSXRlbSAoKSB7XG4gICAgdGhpcy5zZWxlY3RlZEl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKVxuICAgIGlmICgodGhpcy5zZWxlY3RlZEl0ZW0ucHJldmlvdXNTaWJsaW5nICE9IG51bGwpKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IHRoaXMuc2VsZWN0ZWRJdGVtLnByZXZpb3VzU2libGluZ1xuICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJdGVtLm1hdGNoZXMoJy5zZXBhcmF0b3InKSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IHRoaXMuc2VsZWN0ZWRJdGVtLnByZXZpb3VzU2libGluZ1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IHRoaXMubGlzdC5sYXN0Q2hpbGRcbiAgICB9XG4gICAgdGhpcy5zZWxlY3RlZEl0ZW0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG5cbiAgYWRkSXRlbUZvciAobmFtZSwgcGx1Z2luKSB7XG4gICAgbGV0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgbGV0IGFjdGlvbiA9ICgpID0+IHsgTWFpbi50b2dnbGVQbHVnaW5BY3RpdmF0aW9uKG5hbWUpIH1cblxuICAgIGlmIChwbHVnaW4uaXNBY3RpdmUoKSkgeyBpdGVtLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpIH1cblxuICAgIGl0ZW0udGV4dENvbnRlbnQgPSBuYW1lXG5cbiAgICB0aGlzLml0ZW1zQWN0aW9ucy5zZXQoaXRlbSwgYWN0aW9uKVxuICAgIHRoaXMuaXRlbXNEaXNwb3NhYmxlcy5zZXQoaXRlbSwgdGhpcy5hZGREaXNwb3NhYmxlRXZlbnRMaXN0ZW5lcihpdGVtLCAnbW91c2Vkb3duJywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgYWN0aW9uKClcbiAgICB9KSlcblxuICAgIHRoaXMucGx1Z2luc1tuYW1lXSA9IGl0ZW1cbiAgICB0aGlzLmxpc3QuaW5zZXJ0QmVmb3JlKGl0ZW0sIHRoaXMuc2VwYXJhdG9yKVxuXG4gICAgaWYgKCEodGhpcy5zZWxlY3RlZEl0ZW0gIT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0gaXRlbVxuICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUl0ZW1Gb3IgKG5hbWUsIHBsdWdpbikge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmxpc3QucmVtb3ZlQ2hpbGQodGhpcy5wbHVnaW5zW25hbWVdKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuXG4gICAgZGVsZXRlIHRoaXMucGx1Z2luc1tuYW1lXVxuICB9XG5cbiAgYWN0aXZhdGVJdGVtIChuYW1lLCBwbHVnaW4pIHtcbiAgICB0aGlzLnBsdWdpbnNbbmFtZV0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcbiAgfVxuXG4gIGRlYWN0aXZhdGVJdGVtIChuYW1lLCBwbHVnaW4pIHtcbiAgICB0aGlzLnBsdWdpbnNbbmFtZV0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcbiAgfVxufVxuIl19
//# sourceURL=/home/key/.atom/packages/minimap/lib/minimap-quick-settings-element.js
