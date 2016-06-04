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

var _decoratorsInclude = require('./decorators/include');

var _decoratorsInclude2 = _interopRequireDefault(_decoratorsInclude);

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

var _mixinsDomStylesReader = require('./mixins/dom-styles-reader');

var _mixinsDomStylesReader2 = _interopRequireDefault(_mixinsDomStylesReader);

var _mixinsCanvasDrawer = require('./mixins/canvas-drawer');

var _mixinsCanvasDrawer2 = _interopRequireDefault(_mixinsCanvasDrawer);

var _minimapQuickSettingsElement = require('./minimap-quick-settings-element');

var _minimapQuickSettingsElement2 = _interopRequireDefault(_minimapQuickSettingsElement);

'use babel';

var SPEC_MODE = atom.inSpecMode();

/**
 * Public: The MinimapElement is the view meant to render a {@link Minimap}
 * instance in the DOM.
 *
 * You can retrieve the MinimapElement associated to a Minimap
 * using the `atom.views.getView` method.
 *
 * Note that most interactions with the Minimap package is done through the
 * Minimap model so you should never have to access MinimapElement
 * instances.
 *
 * @example
 * let minimapElement = atom.views.getView(minimap)
 */

var MinimapElement = (function () {
  function MinimapElement() {
    _classCallCheck(this, _MinimapElement);
  }

  _createClass(MinimapElement, [{
    key: 'createdCallback',

    //    ##     ##  #######   #######  ##    ##  ######
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ## ##     ## ##     ## ##  ##   ##
    //    ######### ##     ## ##     ## #####     ######
    //    ##     ## ##     ## ##     ## ##  ##         ##
    //    ##     ## ##     ## ##     ## ##   ##  ##    ##
    //    ##     ##  #######   #######  ##    ##  ######

    /**
     * DOM callback invoked when a new MinimapElement is created.
     *
     * @access private
     */
    value: function createdCallback() {
      var _this = this;

      // Core properties

      /**
       * @access private
       */
      this.minimap = undefined;
      /**
       * @access private
       */
      this.editorElement = undefined;
      /**
       * @access private
       */
      this.width = undefined;
      /**
       * @access private
       */
      this.height = undefined;

      // Subscriptions

      /**
       * @access private
       */
      this.subscriptions = new _atom.CompositeDisposable();
      /**
       * @access private
       */
      this.visibleAreaSubscription = undefined;
      /**
       * @access private
       */
      this.quickSettingsSubscription = undefined;
      /**
       * @access private
       */
      this.dragSubscription = undefined;
      /**
       * @access private
       */
      this.openQuickSettingSubscription = undefined;

      // Configs

      /**
      * @access private
      */
      this.displayMinimapOnLeft = false;
      /**
      * @access private
      */
      this.minimapScrollIndicator = undefined;
      /**
      * @access private
      */
      this.displayMinimapOnLeft = undefined;
      /**
      * @access private
      */
      this.displayPluginsControls = undefined;
      /**
      * @access private
      */
      this.textOpacity = undefined;
      /**
      * @access private
      */
      this.displayCodeHighlights = undefined;
      /**
      * @access private
      */
      this.adjustToSoftWrap = undefined;
      /**
      * @access private
      */
      this.useHardwareAcceleration = undefined;
      /**
      * @access private
      */
      this.absoluteMode = undefined;

      // Elements

      /**
       * @access private
       */
      this.shadowRoot = undefined;
      /**
       * @access private
       */
      this.visibleArea = undefined;
      /**
       * @access private
       */
      this.controls = undefined;
      /**
       * @access private
       */
      this.scrollIndicator = undefined;
      /**
       * @access private
       */
      this.openQuickSettings = undefined;
      /**
       * @access private
       */
      this.quickSettingsElement = undefined;

      // States

      /**
      * @access private
      */
      this.attached = undefined;
      /**
      * @access private
      */
      this.attachedToTextEditor = undefined;
      /**
      * @access private
      */
      this.standAlone = undefined;
      /**
       * @access private
       */
      this.wasVisible = undefined;

      // Other

      /**
       * @access private
       */
      this.offscreenFirstRow = undefined;
      /**
       * @access private
       */
      this.offscreenLastRow = undefined;
      /**
       * @access private
       */
      this.frameRequested = undefined;
      /**
       * @access private
       */
      this.flexBasis = undefined;

      this.initializeContent();

      return this.observeConfig({
        'minimap.displayMinimapOnLeft': function minimapDisplayMinimapOnLeft(displayMinimapOnLeft) {
          _this.displayMinimapOnLeft = displayMinimapOnLeft;

          _this.updateMinimapFlexPosition();
        },

        'minimap.minimapScrollIndicator': function minimapMinimapScrollIndicator(minimapScrollIndicator) {
          _this.minimapScrollIndicator = minimapScrollIndicator;

          if (_this.minimapScrollIndicator && !(_this.scrollIndicator != null) && !_this.standAlone) {
            _this.initializeScrollIndicator();
          } else if (_this.scrollIndicator != null) {
            _this.disposeScrollIndicator();
          }

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.displayPluginsControls': function minimapDisplayPluginsControls(displayPluginsControls) {
          _this.displayPluginsControls = displayPluginsControls;

          if (_this.displayPluginsControls && !(_this.openQuickSettings != null) && !_this.standAlone) {
            _this.initializeOpenQuickSettings();
          } else if (_this.openQuickSettings != null) {
            _this.disposeOpenQuickSettings();
          }
        },

        'minimap.textOpacity': function minimapTextOpacity(textOpacity) {
          _this.textOpacity = textOpacity;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.displayCodeHighlights': function minimapDisplayCodeHighlights(displayCodeHighlights) {
          _this.displayCodeHighlights = displayCodeHighlights;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'minimap.smoothScrolling': function minimapSmoothScrolling(smoothScrolling) {
          _this.smoothScrolling = smoothScrolling;

          if (_this.attached) {
            if (!_this.smoothScrolling) {
              _this.backLayer.canvas.style.cssText = '';
              _this.tokensLayer.canvas.style.cssText = '';
              _this.frontLayer.canvas.style.cssText = '';
            } else {
              _this.requestUpdate();
            }
          }
        },

        'minimap.adjustMinimapWidthToSoftWrap': function minimapAdjustMinimapWidthToSoftWrap(adjustToSoftWrap) {
          _this.adjustToSoftWrap = adjustToSoftWrap;

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.adjustMinimapWidthOnlyIfSmaller': function minimapAdjustMinimapWidthOnlyIfSmaller(adjustOnlyIfSmaller) {
          _this.adjustOnlyIfSmaller = adjustOnlyIfSmaller;

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.useHardwareAcceleration': function minimapUseHardwareAcceleration(useHardwareAcceleration) {
          _this.useHardwareAcceleration = useHardwareAcceleration;

          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'minimap.absoluteMode': function minimapAbsoluteMode(absoluteMode) {
          _this.absoluteMode = absoluteMode;

          _this.classList.toggle('absolute', _this.absoluteMode);
        },

        'minimap.adjustAbsoluteModeHeight': function minimapAdjustAbsoluteModeHeight(adjustAbsoluteModeHeight) {
          _this.adjustAbsoluteModeHeight = adjustAbsoluteModeHeight;

          _this.classList.toggle('adjust-absolute-height', _this.adjustAbsoluteModeHeight);

          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'minimap.ignoreWhitespacesInTokens': function minimapIgnoreWhitespacesInTokens(ignoreWhitespacesInTokens) {
          _this.ignoreWhitespacesInTokens = ignoreWhitespacesInTokens;

          if (_this.attached) {
            _this.requestForcedUpdate();
          }
        },

        'editor.preferredLineLength': function editorPreferredLineLength() {
          if (_this.attached) {
            _this.measureHeightAndWidth();
          }
        },

        'editor.softWrap': function editorSoftWrap() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        },

        'editor.softWrapAtPreferredLineLength': function editorSoftWrapAtPreferredLineLength() {
          if (_this.attached) {
            _this.requestUpdate();
          }
        }
      });
    }

    /**
     * DOM callback invoked when a new MinimapElement is attached to the DOM.
     *
     * @access private
     */
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      var _this2 = this;

      this.subscriptions.add(atom.views.pollDocument(function () {
        _this2.pollDOM();
      }));
      this.measureHeightAndWidth();
      this.updateMinimapFlexPosition();
      this.attached = true;
      this.attachedToTextEditor = this.parentNode === this.getTextEditorElementRoot();

      if (this.attachedToTextEditor) {
        this.getTextEditorElement().setAttribute('with-minimap', '');
      }

      /*
        We use `atom.styles.onDidAddStyleElement` instead of
        `atom.themes.onDidChangeActiveThemes`.
        Why? Currently, The style element will be removed first, and then re-added
        and the `change` event has not be triggered in the process.
      */
      this.subscriptions.add(atom.styles.onDidAddStyleElement(function () {
        _this2.invalidateDOMStylesCache();
        _this2.requestForcedUpdate();
      }));

      this.subscriptions.add(this.subscribeToMediaQuery());
    }

    /**
     * DOM callback invoked when a new MinimapElement is detached from the DOM.
     *
     * @access private
     */
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      this.getTextEditorElement().removeAttribute('with-minimap');
      this.attached = false;
    }

    //       ###    ######## ########    ###     ######  ##     ##
    //      ## ##      ##       ##      ## ##   ##    ## ##     ##
    //     ##   ##     ##       ##     ##   ##  ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##       #########
    //    #########    ##       ##    ######### ##       ##     ##
    //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
    //    ##     ##    ##       ##    ##     ##  ######  ##     ##

    /**
     * Returns whether the MinimapElement is currently visible on screen or not.
     *
     * The visibility of the minimap is defined by testing the size of the offset
     * width and height of the element.
     *
     * @return {boolean} whether the MinimapElement is currently visible or not
     */
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this.offsetWidth > 0 || this.offsetHeight > 0;
    }

    /**
     * Attaches the MinimapElement to the DOM.
     *
     * The position at which the element is attached is defined by the
     * `displayMinimapOnLeft` setting.
     *
     * @param  {HTMLElement} [parent] the DOM node where attaching the minimap
     *                                element
     */
  }, {
    key: 'attach',
    value: function attach(parent) {
      if (this.attached) {
        return;
      }
      (parent || this.getTextEditorElementRoot()).appendChild(this);
    }

    /**
     * Detaches the MinimapElement from the DOM.
     */
  }, {
    key: 'detach',
    value: function detach() {
      if (!this.attached || this.parentNode == null) {
        return;
      }
      this.parentNode.removeChild(this);
    }

    /**
     * Toggles the minimap left/right position based on the value of the
     * `displayMinimapOnLeft` setting.
     *
     * @access private
     */
  }, {
    key: 'updateMinimapFlexPosition',
    value: function updateMinimapFlexPosition() {
      this.classList.toggle('left', this.displayMinimapOnLeft);
    }

    /**
     * Destroys this MinimapElement
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.subscriptions.dispose();
      this.detach();
      this.minimap = null;
    }

    //     ######   #######  ##    ## ######## ######## ##    ## ########
    //    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
    //    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
    //    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
    //    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
    //    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
    //     ######   #######  ##    ##    ##    ######## ##    ##    ##

    /**
     * Creates the content of the MinimapElement and attaches the mouse control
     * event listeners.
     *
     * @access private
     */
  }, {
    key: 'initializeContent',
    value: function initializeContent() {
      var _this3 = this;

      this.initializeCanvas();

      this.shadowRoot = this.createShadowRoot();
      this.attachCanvases(this.shadowRoot);

      this.createVisibleArea();
      this.createControls();

      this.subscriptions.add(this.subscribeTo(this, {
        'mousewheel': function mousewheel(e) {
          if (!_this3.standAlone) {
            _this3.relayMousewheelEvent(e);
          }
        }
      }));

      this.subscriptions.add(this.subscribeTo(this.getFrontCanvas(), {
        'mousedown': function mousedown(e) {
          _this3.canvasPressed(_this3.extractMouseEventData(e));
        },
        'touchstart': function touchstart(e) {
          _this3.canvasPressed(_this3.extractTouchEventData(e));
        }
      }));
    }

    /**
     * Initializes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'createVisibleArea',
    value: function createVisibleArea() {
      var _this4 = this;

      if (this.visibleArea) {
        return;
      }

      this.visibleArea = document.createElement('div');
      this.visibleArea.classList.add('minimap-visible-area');
      this.shadowRoot.appendChild(this.visibleArea);
      this.visibleAreaSubscription = this.subscribeTo(this.visibleArea, {
        'mousedown': function mousedown(e) {
          _this4.startDrag(_this4.extractMouseEventData(e));
        },
        'touchstart': function touchstart(e) {
          _this4.startDrag(_this4.extractTouchEventData(e));
        }
      });

      this.subscriptions.add(this.visibleAreaSubscription);
    }

    /**
     * Removes the visible area div.
     *
     * @access private
     */
  }, {
    key: 'removeVisibleArea',
    value: function removeVisibleArea() {
      if (!this.visibleArea) {
        return;
      }

      this.subscriptions.remove(this.visibleAreaSubscription);
      this.visibleAreaSubscription.dispose();
      this.shadowRoot.removeChild(this.visibleArea);
      delete this.visibleArea;
    }

    /**
     * Creates the controls container div.
     *
     * @access private
     */
  }, {
    key: 'createControls',
    value: function createControls() {
      if (this.controls || this.standAlone) {
        return;
      }

      this.controls = document.createElement('div');
      this.controls.classList.add('minimap-controls');
      this.shadowRoot.appendChild(this.controls);
    }

    /**
     * Removes the controls container div.
     *
     * @access private
     */
  }, {
    key: 'removeControls',
    value: function removeControls() {
      if (!this.controls) {
        return;
      }

      this.shadowRoot.removeChild(this.controls);
      delete this.controls;
    }

    /**
     * Initializes the scroll indicator div when the `minimapScrollIndicator`
     * settings is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeScrollIndicator',
    value: function initializeScrollIndicator() {
      if (this.scrollIndicator || this.standAlone) {
        return;
      }

      this.scrollIndicator = document.createElement('div');
      this.scrollIndicator.classList.add('minimap-scroll-indicator');
      this.controls.appendChild(this.scrollIndicator);
    }

    /**
     * Disposes the scroll indicator div when the `minimapScrollIndicator`
     * settings is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeScrollIndicator',
    value: function disposeScrollIndicator() {
      if (!this.scrollIndicator) {
        return;
      }

      this.controls.removeChild(this.scrollIndicator);
      delete this.scrollIndicator;
    }

    /**
     * Initializes the quick settings openener div when the
     * `displayPluginsControls` setting is enabled.
     *
     * @access private
     */
  }, {
    key: 'initializeOpenQuickSettings',
    value: function initializeOpenQuickSettings() {
      var _this5 = this;

      if (this.openQuickSettings || this.standAlone) {
        return;
      }

      this.openQuickSettings = document.createElement('div');
      this.openQuickSettings.classList.add('open-minimap-quick-settings');
      this.controls.appendChild(this.openQuickSettings);

      this.openQuickSettingSubscription = this.subscribeTo(this.openQuickSettings, {
        'mousedown': function mousedown(e) {
          e.preventDefault();
          e.stopPropagation();

          if (_this5.quickSettingsElement != null) {
            _this5.quickSettingsElement.destroy();
            _this5.quickSettingsSubscription.dispose();
          } else {
            _this5.quickSettingsElement = new _minimapQuickSettingsElement2['default']();
            _this5.quickSettingsElement.setModel(_this5);
            _this5.quickSettingsSubscription = _this5.quickSettingsElement.onDidDestroy(function () {
              _this5.quickSettingsElement = null;
            });

            var _getFrontCanvas$getBoundingClientRect = _this5.getFrontCanvas().getBoundingClientRect();

            var _top = _getFrontCanvas$getBoundingClientRect.top;
            var left = _getFrontCanvas$getBoundingClientRect.left;
            var right = _getFrontCanvas$getBoundingClientRect.right;

            _this5.quickSettingsElement.style.top = _top + 'px';
            _this5.quickSettingsElement.attach();

            if (_this5.displayMinimapOnLeft) {
              _this5.quickSettingsElement.style.left = right + 'px';
            } else {
              _this5.quickSettingsElement.style.left = left - _this5.quickSettingsElement.clientWidth + 'px';
            }
          }
        }
      });
    }

    /**
     * Disposes the quick settings openener div when the `displayPluginsControls`
     * setting is disabled.
     *
     * @access private
     */
  }, {
    key: 'disposeOpenQuickSettings',
    value: function disposeOpenQuickSettings() {
      if (!this.openQuickSettings) {
        return;
      }

      this.controls.removeChild(this.openQuickSettings);
      this.openQuickSettingSubscription.dispose();
      delete this.openQuickSettings;
    }

    /**
     * Returns the target `TextEditor` of the Minimap.
     *
     * @return {TextEditor} the minimap's text editor
     */
  }, {
    key: 'getTextEditor',
    value: function getTextEditor() {
      return this.minimap.getTextEditor();
    }

    /**
     * Returns the `TextEditorElement` for the Minimap's `TextEditor`.
     *
     * @return {TextEditorElement} the minimap's text editor element
     */
  }, {
    key: 'getTextEditorElement',
    value: function getTextEditorElement() {
      if (this.editorElement) {
        return this.editorElement;
      }

      this.editorElement = atom.views.getView(this.getTextEditor());
      return this.editorElement;
    }

    /**
     * Returns the root of the `TextEditorElement` content.
     *
     * This method is mostly used to ensure compatibility with the `shadowDom`
     * setting.
     *
     * @return {HTMLElement} the root of the `TextEditorElement` content
     */
  }, {
    key: 'getTextEditorElementRoot',
    value: function getTextEditorElementRoot() {
      var editorElement = this.getTextEditorElement();

      if (editorElement.shadowRoot) {
        return editorElement.shadowRoot;
      } else {
        return editorElement;
      }
    }

    /**
     * Returns the root where to inject the dummy node used to read DOM styles.
     *
     * @param  {boolean} shadowRoot whether to use the text editor shadow DOM
     *                              or not
     * @return {HTMLElement} the root node where appending the dummy node
     * @access private
     */
  }, {
    key: 'getDummyDOMRoot',
    value: function getDummyDOMRoot(shadowRoot) {
      if (shadowRoot) {
        return this.getTextEditorElementRoot();
      } else {
        return this.getTextEditorElement();
      }
    }

    //    ##     ##  #######  ########  ######## ##
    //    ###   ### ##     ## ##     ## ##       ##
    //    #### #### ##     ## ##     ## ##       ##
    //    ## ### ## ##     ## ##     ## ######   ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ## ##     ## ##     ## ##       ##
    //    ##     ##  #######  ########  ######## ########

    /**
     * Returns the Minimap for which this MinimapElement was created.
     *
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'getModel',
    value: function getModel() {
      return this.minimap;
    }

    /**
     * Defines the Minimap model for this MinimapElement instance.
     *
     * @param  {Minimap} minimap the Minimap model for this instance.
     * @return {Minimap} this element's Minimap
     */
  }, {
    key: 'setModel',
    value: function setModel(minimap) {
      var _this6 = this;

      this.minimap = minimap;
      this.subscriptions.add(this.minimap.onDidChangeScrollTop(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidChangeScrollLeft(function () {
        _this6.requestUpdate();
      }));
      this.subscriptions.add(this.minimap.onDidDestroy(function () {
        _this6.destroy();
      }));
      this.subscriptions.add(this.minimap.onDidChangeConfig(function () {
        if (_this6.attached) {
          return _this6.requestForcedUpdate();
        }
      }));

      this.subscriptions.add(this.minimap.onDidChangeStandAlone(function () {
        _this6.setStandAlone(_this6.minimap.isStandAlone());
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChange(function (change) {
        _this6.pendingChanges.push(change);
        _this6.requestUpdate();
      }));

      this.subscriptions.add(this.minimap.onDidChangeDecorationRange(function (change) {
        var type = change.type;

        if (type === 'line' || type === 'highlight-under' || type === 'background-custom') {
          _this6.pendingBackDecorationChanges.push(change);
        } else {
          _this6.pendingFrontDecorationChanges.push(change);
        }
        _this6.requestUpdate();
      }));

      this.subscriptions.add(_main2['default'].onDidChangePluginOrder(function () {
        _this6.requestForcedUpdate();
      }));

      this.setStandAlone(this.minimap.isStandAlone());

      if (this.width != null && this.height != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      return this.minimap;
    }

    /**
     * Sets the stand-alone mode for this MinimapElement.
     *
     * @param {boolean} standAlone the new mode for this MinimapElement
     */
  }, {
    key: 'setStandAlone',
    value: function setStandAlone(standAlone) {
      this.standAlone = standAlone;

      if (this.standAlone) {
        this.setAttribute('stand-alone', true);
        this.disposeScrollIndicator();
        this.disposeOpenQuickSettings();
        this.removeControls();
        this.removeVisibleArea();
      } else {
        this.removeAttribute('stand-alone');
        this.createVisibleArea();
        this.createControls();
        if (this.minimapScrollIndicator) {
          this.initializeScrollIndicator();
        }
        if (this.displayPluginsControls) {
          this.initializeOpenQuickSettings();
        }
      }
    }

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    /**
     * Requests an update to be performed on the next frame.
     */
  }, {
    key: 'requestUpdate',
    value: function requestUpdate() {
      var _this7 = this;

      if (this.frameRequested) {
        return;
      }

      this.frameRequested = true;
      requestAnimationFrame(function () {
        _this7.update();
        _this7.frameRequested = false;
      });
    }

    /**
     * Requests an update to be performed on the next frame that will completely
     * redraw the minimap.
     */
  }, {
    key: 'requestForcedUpdate',
    value: function requestForcedUpdate() {
      this.offscreenFirstRow = null;
      this.offscreenLastRow = null;
      this.requestUpdate();
    }

    /**
     * Performs the actual MinimapElement update.
     *
     * @access private
     */
  }, {
    key: 'update',
    value: function update() {
      if (!(this.attached && this.isVisible() && this.minimap)) {
        return;
      }
      var minimap = this.minimap;
      minimap.enableCache();
      var canvas = this.getFrontCanvas();

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var visibleAreaLeft = minimap.getTextEditorScaledScrollLeft();
      var visibleAreaTop = minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop();
      var visibleWidth = Math.min(canvas.width / devicePixelRatio, this.width);

      if (this.adjustToSoftWrap && this.flexBasis) {
        this.style.flexBasis = this.flexBasis + 'px';
        this.style.width = this.flexBasis + 'px';
      } else {
        this.style.flexBasis = null;
        this.style.width = null;
      }

      if (SPEC_MODE) {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          top: visibleAreaTop + 'px',
          'border-left-width': visibleAreaLeft + 'px'
        });
      } else {
        this.applyStyles(this.visibleArea, {
          width: visibleWidth + 'px',
          height: minimap.getTextEditorScaledHeight() + 'px',
          transform: this.makeTranslate(0, visibleAreaTop),
          'border-left-width': visibleAreaLeft + 'px'
        });
      }

      this.applyStyles(this.controls, { width: visibleWidth + 'px' });

      var canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop();

      if (this.smoothScrolling) {
        if (SPEC_MODE) {
          this.applyStyles(this.backLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.tokensLayer.canvas, { top: canvasTop + 'px' });
          this.applyStyles(this.frontLayer.canvas, { top: canvasTop + 'px' });
        } else {
          var canvasTransform = this.makeTranslate(0, canvasTop);
          if (devicePixelRatio !== 1) {
            canvasTransform += ' ' + this.makeScale(1 / devicePixelRatio);
          }
          this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
          this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
        }
      } else {
        var canvasTransform = this.makeScale(1 / devicePixelRatio);
        this.applyStyles(this.backLayer.canvas, { transform: canvasTransform });
        this.applyStyles(this.tokensLayer.canvas, { transform: canvasTransform });
        this.applyStyles(this.frontLayer.canvas, { transform: canvasTransform });
      }

      if (this.minimapScrollIndicator && minimap.canScroll() && !this.scrollIndicator) {
        this.initializeScrollIndicator();
      }

      if (this.scrollIndicator != null) {
        var minimapScreenHeight = minimap.getScreenHeight();
        var indicatorHeight = minimapScreenHeight * (minimapScreenHeight / minimap.getHeight());
        var indicatorScroll = (minimapScreenHeight - indicatorHeight) * minimap.getScrollRatio();

        if (SPEC_MODE) {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            top: indicatorScroll + 'px'
          });
        } else {
          this.applyStyles(this.scrollIndicator, {
            height: indicatorHeight + 'px',
            transform: this.makeTranslate(0, indicatorScroll)
          });
        }

        if (!minimap.canScroll()) {
          this.disposeScrollIndicator();
        }
      }

      if (this.absoluteMode && this.adjustAbsoluteModeHeight) {
        this.updateCanvasesSize();
      }

      this.updateCanvas();
      minimap.clearCache();
    }

    /**
     * Defines whether to render the code highlights or not.
     *
     * @param {Boolean} displayCodeHighlights whether to render the code
     *                                        highlights or not
     */
  }, {
    key: 'setDisplayCodeHighlights',
    value: function setDisplayCodeHighlights(displayCodeHighlights) {
      this.displayCodeHighlights = displayCodeHighlights;
      if (this.attached) {
        this.requestForcedUpdate();
      }
    }

    /**
     * Polling callback used to detect visibility and size changes.
     *
     * @access private
     */
  }, {
    key: 'pollDOM',
    value: function pollDOM() {
      var visibilityChanged = this.checkForVisibilityChange();
      if (this.isVisible()) {
        if (!this.wasVisible) {
          this.requestForcedUpdate();
        }

        this.measureHeightAndWidth(visibilityChanged, false);
      }
    }

    /**
     * A method that checks for visibility changes in the MinimapElement.
     * The method returns `true` when the visibility changed from visible to
     * hidden or from hidden to visible.
     *
     * @return {boolean} whether the visibility changed or not since the last call
     * @access private
     */
  }, {
    key: 'checkForVisibilityChange',
    value: function checkForVisibilityChange() {
      if (this.isVisible()) {
        if (this.wasVisible) {
          return false;
        } else {
          this.wasVisible = true;
          return this.wasVisible;
        }
      } else {
        if (this.wasVisible) {
          this.wasVisible = false;
          return true;
        } else {
          this.wasVisible = false;
          return this.wasVisible;
        }
      }
    }

    /**
     * A method used to measure the size of the MinimapElement and update internal
     * components based on the new size.
     *
     * @param  {boolean} visibilityChanged did the visibility changed since last
     *                                     measurement
     * @param  {[type]} [forceUpdate=true] forces the update even when no changes
     *                                     were detected
     * @access private
     */
  }, {
    key: 'measureHeightAndWidth',
    value: function measureHeightAndWidth(visibilityChanged) {
      var forceUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (!this.minimap) {
        return;
      }

      var wasResized = this.width !== this.clientWidth || this.height !== this.clientHeight;

      this.height = this.clientHeight;
      this.width = this.clientWidth;
      var canvasWidth = this.width;

      if (this.minimap != null) {
        this.minimap.setScreenHeightAndWidth(this.height, this.width);
      }

      if (wasResized || visibilityChanged || forceUpdate) {
        this.requestForcedUpdate();
      }

      if (!this.isVisible()) {
        return;
      }

      if (wasResized || forceUpdate) {
        if (this.adjustToSoftWrap) {
          var lineLength = atom.config.get('editor.preferredLineLength');
          var softWrap = atom.config.get('editor.softWrap');
          var softWrapAtPreferredLineLength = atom.config.get('editor.softWrapAtPreferredLineLength');
          var width = lineLength * this.minimap.getCharWidth();

          if (softWrap && softWrapAtPreferredLineLength && lineLength && (width <= this.width || !this.adjustOnlyIfSmaller)) {
            this.flexBasis = width;
            canvasWidth = width;
          } else {
            delete this.flexBasis;
          }
        } else {
          delete this.flexBasis;
        }

        this.updateCanvasesSize(canvasWidth);
      }
    }
  }, {
    key: 'updateCanvasesSize',
    value: function updateCanvasesSize() {
      var canvasWidth = arguments.length <= 0 || arguments[0] === undefined ? this.getFrontCanvas().width : arguments[0];

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var maxCanvasHeight = this.height + this.minimap.getLineHeight();
      var newHeight = this.absoluteMode && this.adjustAbsoluteModeHeight ? Math.min(this.minimap.getHeight(), maxCanvasHeight) : maxCanvasHeight;
      var canvas = this.getFrontCanvas();
      if (canvasWidth !== canvas.width || newHeight !== canvas.height) {
        this.setCanvasesSize(canvasWidth * devicePixelRatio, newHeight * devicePixelRatio);
        if (this.absoluteMode && this.adjustAbsoluteModeHeight) {
          this.offscreenFirstRow = null;
          this.offscreenLastRow = null;
        }
      }
    }

    //    ######## ##     ## ######## ##    ## ########  ######
    //    ##       ##     ## ##       ###   ##    ##    ##    ##
    //    ##       ##     ## ##       ####  ##    ##    ##
    //    ######   ##     ## ######   ## ## ##    ##     ######
    //    ##        ##   ##  ##       ##  ####    ##          ##
    //    ##         ## ##   ##       ##   ###    ##    ##    ##
    //    ########    ###    ######## ##    ##    ##     ######

    /**
     * Helper method to register config observers.
     *
     * @param  {Object} configs={} an object mapping the config name to observe
     *                             with the function to call back when a change
     *                             occurs
     * @access private
     */
  }, {
    key: 'observeConfig',
    value: function observeConfig() {
      var configs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      for (var config in configs) {
        this.subscriptions.add(atom.config.observe(config, configs[config]));
      }
    }

    /**
     * Callback triggered when the mouse is pressed on the MinimapElement canvas.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @access private
     */
  }, {
    key: 'canvasPressed',
    value: function canvasPressed(_ref) {
      var y = _ref.y;
      var isLeftMouse = _ref.isLeftMouse;
      var isMiddleMouse = _ref.isMiddleMouse;

      if (this.minimap.isStandAlone()) {
        return;
      }
      if (isLeftMouse) {
        this.canvasLeftMousePressed(y);
      } else if (isMiddleMouse) {
        this.canvasMiddleMousePressed(y);

        var _visibleArea$getBoundingClientRect = this.visibleArea.getBoundingClientRect();

        var _top2 = _visibleArea$getBoundingClientRect.top;
        var height = _visibleArea$getBoundingClientRect.height;

        this.startDrag({ y: _top2 + height / 2, isLeftMouse: false, isMiddleMouse: true });
      }
    }

    /**
     * Callback triggered when the mouse left button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @param  {HTMLElement} e.target the source of the event
     * @access private
     */
  }, {
    key: 'canvasLeftMousePressed',
    value: function canvasLeftMousePressed(y) {
      var _this8 = this;

      var deltaY = y - this.getBoundingClientRect().top;
      var row = Math.floor(deltaY / this.minimap.getLineHeight()) + this.minimap.getFirstVisibleScreenRow();

      var textEditor = this.minimap.getTextEditor();
      var textEditorElement = this.getTextEditorElement();

      var scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2;
      var textEditorScrollTop = textEditorElement.pixelPositionForScreenPosition([row, 0]).top - this.minimap.getTextEditorHeight() / 2;

      if (atom.config.get('minimap.scrollAnimation')) {
        var duration = atom.config.get('minimap.scrollAnimationDuration');
        var independentScroll = this.minimap.scrollIndependentlyOnMouseWheel();

        var from = this.minimap.getTextEditorScrollTop();
        var to = textEditorScrollTop;
        var step = undefined;

        if (independentScroll) {
          (function () {
            var minimapFrom = _this8.minimap.getScrollTop();
            var minimapTo = Math.min(1, scrollTop / (_this8.minimap.getTextEditorMaxScrollTop() || 1)) * _this8.minimap.getMaxScrollTop();

            step = function (now, t) {
              _this8.minimap.setTextEditorScrollTop(now, true);
              _this8.minimap.setScrollTop(minimapFrom + (minimapTo - minimapFrom) * t);
            };
            _this8.animate({ from: from, to: to, duration: duration, step: step });
          })();
        } else {
          step = function (now) {
            return _this8.minimap.setTextEditorScrollTop(now);
          };
          this.animate({ from: from, to: to, duration: duration, step: step });
        }
      } else {
        this.minimap.setTextEditorScrollTop(textEditorScrollTop);
      }
    }

    /**
     * Callback triggered when the mouse middle button is pressed on the
     * MinimapElement canvas.
     *
     * @param  {MouseEvent} e the mouse event object
     * @param  {number} e.pageY the mouse y position in page
     * @access private
     */
  }, {
    key: 'canvasMiddleMousePressed',
    value: function canvasMiddleMousePressed(y) {
      var _getBoundingClientRect = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect.top;

      var deltaY = y - offsetTop - this.minimap.getTextEditorScaledHeight() / 2;

      var ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * A method that relays the `mousewheel` events received by the MinimapElement
     * to the `TextEditorElement`.
     *
     * @param  {MouseEvent} e the mouse event object
     * @access private
     */
  }, {
    key: 'relayMousewheelEvent',
    value: function relayMousewheelEvent(e) {
      if (this.minimap.scrollIndependentlyOnMouseWheel()) {
        this.minimap.onMouseWheel(e);
      } else {
        this.getTextEditorElement().component.onMouseWheel(e);
      }
    }

    /**
     * A method that extracts data from a `MouseEvent` which can then be used to
     * process clicks and drags of the minimap.
     *
     * Used together with `extractTouchEventData` to provide a unified interface
     * for `MouseEvent`s and `TouchEvent`s.
     *
     * @param  {MouseEvent} mouseEvent the mouse event object
     * @access private
     */
  }, {
    key: 'extractMouseEventData',
    value: function extractMouseEventData(mouseEvent) {
      return {
        x: mouseEvent.pageX,
        y: mouseEvent.pageY,
        isLeftMouse: mouseEvent.which === 1,
        isMiddleMouse: mouseEvent.which === 2
      };
    }

    /**
     * A method that extracts data from a `TouchEvent` which can then be used to
     * process clicks and drags of the minimap.
     *
     * Used together with `extractMouseEventData` to provide a unified interface
     * for `MouseEvent`s and `TouchEvent`s.
     *
     * @param  {TouchEvent} touchEvent the touch event object
     * @access private
     */
  }, {
    key: 'extractTouchEventData',
    value: function extractTouchEventData(touchEvent) {
      // Use the first touch on the target area. Other touches will be ignored in
      // case of multi-touch.
      var touch = touchEvent.changedTouches[0];

      return {
        x: touch.pageX,
        y: touch.pageY,
        isLeftMouse: true, // Touch is treated like a left mouse button click
        isMiddleMouse: false
      };
    }

    /**
     * Subscribes to a media query for device pixel ratio changes and forces
     * a repaint when it occurs.
     *
     * @return {Disposable} a disposable to remove the media query listener
     * @access private
     */
  }, {
    key: 'subscribeToMediaQuery',
    value: function subscribeToMediaQuery() {
      var _this9 = this;

      var query = 'screen and (-webkit-min-device-pixel-ratio: 1.5)';
      var mediaQuery = window.matchMedia(query);
      var mediaListener = function mediaListener(e) {
        _this9.requestForcedUpdate();
      };
      mediaQuery.addListener(mediaListener);

      return new _atom.Disposable(function () {
        mediaQuery.removeListener(mediaListener);
      });
    }

    //    ########    ####    ########
    //    ##     ##  ##  ##   ##     ##
    //    ##     ##   ####    ##     ##
    //    ##     ##  ####     ##     ##
    //    ##     ## ##  ## ## ##     ##
    //    ##     ## ##   ##   ##     ##
    //    ########   ####  ## ########

    /**
     * A method triggered when the mouse is pressed over the visible area that
     * starts the dragging gesture.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @access private
     */
  }, {
    key: 'startDrag',
    value: function startDrag(_ref2) {
      var _this10 = this;

      var y = _ref2.y;
      var isLeftMouse = _ref2.isLeftMouse;
      var isMiddleMouse = _ref2.isMiddleMouse;

      if (!this.minimap) {
        return;
      }
      if (!isLeftMouse && !isMiddleMouse) {
        return;
      }

      var _visibleArea$getBoundingClientRect2 = this.visibleArea.getBoundingClientRect();

      var top = _visibleArea$getBoundingClientRect2.top;

      var _getBoundingClientRect2 = this.getBoundingClientRect();

      var offsetTop = _getBoundingClientRect2.top;

      var dragOffset = y - top;

      var initial = { dragOffset: dragOffset, offsetTop: offsetTop };

      var mousemoveHandler = function mousemoveHandler(e) {
        return _this10.drag(_this10.extractMouseEventData(e), initial);
      };
      var mouseupHandler = function mouseupHandler(e) {
        return _this10.endDrag();
      };

      var touchmoveHandler = function touchmoveHandler(e) {
        return _this10.drag(_this10.extractTouchEventData(e), initial);
      };
      var touchendHandler = function touchendHandler(e) {
        return _this10.endDrag();
      };

      document.body.addEventListener('mousemove', mousemoveHandler);
      document.body.addEventListener('mouseup', mouseupHandler);
      document.body.addEventListener('mouseleave', mouseupHandler);

      document.body.addEventListener('touchmove', touchmoveHandler);
      document.body.addEventListener('touchend', touchendHandler);
      document.body.addEventListener('touchcancel', touchendHandler);

      this.dragSubscription = new _atom.Disposable(function () {
        document.body.removeEventListener('mousemove', mousemoveHandler);
        document.body.removeEventListener('mouseup', mouseupHandler);
        document.body.removeEventListener('mouseleave', mouseupHandler);

        document.body.removeEventListener('touchmove', touchmoveHandler);
        document.body.removeEventListener('touchend', touchendHandler);
        document.body.removeEventListener('touchcancel', touchendHandler);
      });
    }

    /**
     * The method called during the drag gesture.
     *
     * @param  {number} y the vertical coordinate of the event
     * @param  {boolean} isLeftMouse was the left mouse button pressed?
     * @param  {boolean} isMiddleMouse was the middle mouse button pressed?
     * @param  {number} initial.dragOffset the mouse offset within the visible
     *                                     area
     * @param  {number} initial.offsetTop the MinimapElement offset at the moment
     *                                    of the drag start
     * @access private
     */
  }, {
    key: 'drag',
    value: function drag(_ref3, initial) {
      var y = _ref3.y;
      var isLeftMouse = _ref3.isLeftMouse;
      var isMiddleMouse = _ref3.isMiddleMouse;

      if (!this.minimap) {
        return;
      }
      if (!isLeftMouse && !isMiddleMouse) {
        return;
      }
      var deltaY = y - initial.offsetTop - initial.dragOffset;

      var ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight());

      this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop());
    }

    /**
     * The method that ends the drag gesture.
     *
     * @access private
     */
  }, {
    key: 'endDrag',
    value: function endDrag() {
      if (!this.minimap) {
        return;
      }
      this.dragSubscription.dispose();
    }

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    /**
     * Applies the passed-in styles properties to the specified element
     *
     * @param  {HTMLElement} element the element onto which apply the styles
     * @param  {Object} styles the styles to apply
     * @access private
     */
  }, {
    key: 'applyStyles',
    value: function applyStyles(element, styles) {
      if (!element) {
        return;
      }

      var cssText = '';
      for (var property in styles) {
        cssText += property + ': ' + styles[property] + '; ';
      }

      element.style.cssText = cssText;
    }

    /**
     * Returns a string with a CSS translation tranform value.
     *
     * @param  {number} [x = 0] the x offset of the translation
     * @param  {number} [y = 0] the y offset of the translation
     * @return {string} the CSS translation string
     * @access private
     */
  }, {
    key: 'makeTranslate',
    value: function makeTranslate() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      if (this.useHardwareAcceleration) {
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      } else {
        return 'translate(' + x + 'px, ' + y + 'px)';
      }
    }

    /**
     * Returns a string with a CSS scaling tranform value.
     *
     * @param  {number} [x = 0] the x scaling factor
     * @param  {number} [y = 0] the y scaling factor
     * @return {string} the CSS scaling string
     * @access private
     */
  }, {
    key: 'makeScale',
    value: function makeScale() {
      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var y = arguments.length <= 1 || arguments[1] === undefined ? x : arguments[1];
      return (function () {
        if (this.useHardwareAcceleration) {
          return 'scale3d(' + x + ', ' + y + ', 1)';
        } else {
          return 'scale(' + x + ', ' + y + ')';
        }
      }).apply(this, arguments);
    }

    /**
     * A method that return the current time as a Date.
     *
     * That method exist so that we can mock it in tests.
     *
     * @return {Date} the current time as Date
     * @access private
     */
  }, {
    key: 'getTime',
    value: function getTime() {
      return new Date();
    }

    /**
     * A method that mimic the jQuery `animate` method and used to animate the
     * scroll when clicking on the MinimapElement canvas.
     *
     * @param  {Object} param the animation data object
     * @param  {[type]} param.from the start value
     * @param  {[type]} param.to the end value
     * @param  {[type]} param.duration the animation duration
     * @param  {[type]} param.step the easing function for the animation
     * @access private
     */
  }, {
    key: 'animate',
    value: function animate(_ref4) {
      var _this11 = this;

      var from = _ref4.from;
      var to = _ref4.to;
      var duration = _ref4.duration;
      var step = _ref4.step;

      var start = this.getTime();
      var progress = undefined;

      var swing = function swing(progress) {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      };

      var update = function update() {
        if (!_this11.minimap) {
          return;
        }

        var passed = _this11.getTime() - start;
        if (duration === 0) {
          progress = 1;
        } else {
          progress = passed / duration;
        }
        if (progress > 1) {
          progress = 1;
        }
        var delta = swing(progress);
        var value = from + (to - from) * delta;
        step(value, delta);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      update();
    }
  }], [{
    key: 'registerViewProvider',

    /**
     * The method that registers the MinimapElement factory in the
     * `atom.views` registry with the Minimap model.
     */
    value: function registerViewProvider(Minimap) {
      atom.views.addViewProvider(Minimap, function (model) {
        var element = new MinimapElement();
        element.setModel(model);
        return element;
      });
    }
  }]);

  var _MinimapElement = MinimapElement;
  MinimapElement = (0, _decoratorsInclude2['default'])(_mixinsDomStylesReader2['default'], _mixinsCanvasDrawer2['default'], _atomUtils.EventsDelegation, _atomUtils.AncestorsMethods)(MinimapElement) || MinimapElement;
  MinimapElement = (0, _decoratorsElement2['default'])('atom-text-editor-minimap')(MinimapElement) || MinimapElement;
  return MinimapElement;
})();

exports['default'] = MinimapElement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLWVsZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFOEMsTUFBTTs7eUJBQ0gsWUFBWTs7b0JBQzVDLFFBQVE7Ozs7aUNBQ0wsc0JBQXNCOzs7O2lDQUN0QixzQkFBc0I7Ozs7cUNBQ2QsNEJBQTRCOzs7O2tDQUMvQix3QkFBd0I7Ozs7MkNBQ1Qsa0NBQWtDOzs7O0FBVDFFLFdBQVcsQ0FBQTs7QUFXWCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBa0JkLGNBQWM7V0FBZCxjQUFjOzs7O2VBQWQsY0FBYzs7Ozs7Ozs7Ozs7Ozs7OztXQTJCakIsMkJBQUc7Ozs7Ozs7O0FBTWpCLFVBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXhCLFVBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFBOzs7O0FBSTlCLFVBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFBOzs7O0FBSXRCLFVBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFBOzs7Ozs7O0FBT3ZCLFVBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7Ozs7QUFJOUMsVUFBSSxDQUFDLHVCQUF1QixHQUFHLFNBQVMsQ0FBQTs7OztBQUl4QyxVQUFJLENBQUMseUJBQXlCLEdBQUcsU0FBUyxDQUFBOzs7O0FBSTFDLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUE7Ozs7QUFJakMsVUFBSSxDQUFDLDRCQUE0QixHQUFHLFNBQVMsQ0FBQTs7Ozs7OztBQU83QyxVQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFBOzs7O0FBSWpDLFVBQUksQ0FBQyxzQkFBc0IsR0FBRyxTQUFTLENBQUE7Ozs7QUFJdkMsVUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQTs7OztBQUlyQyxVQUFJLENBQUMsc0JBQXNCLEdB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QUMsT0FBTyxFQUFFO0FBQ3BDLFVBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxVQUFVLEtBQUssRUFBRTtBQUNuRCxZQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFBO0FBQ2xDLGVBQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDdkIsZUFBTyxPQUFPLENBQUE7T0FDZixDQUFDLENBQUE7S0FDSDs7O3dCQVprQixjQUFjO0FBQWQsZ0JBQWMsR0FEbEMsa0tBQTBFLENBQ3RELGNBQWMsS0FBZCxjQUFjO0FBQWQsZ0JBQWMsR0FGbEMsb0NBQVEsMEJBQTBCLENBQUMsQ0FFZixjQUFjLEtBQWQsY0FBYztTQUFkLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLWVsZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nXG5pbXBvcnQge0V2ZW50c0RlbGVnYXRpb24sIEFuY2VzdG9yc01ldGhvZHN9IGZyb20gJ2F0b20tdXRpbHMnXG5pbXBvcnQgTWFpbiBmcm9tICcuL21haW4nXG5pbXBvcnQgaW5jbHVkZSBmcm9tICcuL2RlY29yYXRvcnMvaW5jbHVkZSdcbmltcG9ydCBlbGVtZW50IGZyb20gJy4vZGVjb3JhdG9ycy9lbGVtZW50J1xuaW1wb3J0IERPTVN0eWxlc1JlYWRlciBmcm9tICcuL21peGlucy9kb20tc3R5bGVzLXJlYWRlcidcbmltcG9ydCBDYW52YXNEcmF3ZXIgZnJvbSAnLi9taXhpbnMvY2FudmFzLWRyYXdlcidcbmltcG9ydCBNaW5pbWFwUXVpY2tTZXR0aW5nc0VsZW1lbnQgZnJvbSAnLi9taW5pbWFwLXF1aWNrLXNldHRpbmdzLWVsZW1lbnQnXG5cbmNvbnN0IFNQRUNfTU9ERSA9IGF0b20uaW5TcGVjTW9kZSgpXG5cbi8qKlxuICogUHVibGljOiBUaGUgTWluaW1hcEVsZW1lbnQgaXMgdGhlIHZpZXcgbWVhbnQgdG8gcmVuZGVyIGEge0BsaW5rIE1pbmltYXB9XG4gKiBpbnN0YW5jZSBpbiB0aGUgRE9NLlxuICpcbiAqIFlvdSBjYW4gcmV0cmlldmUgdGhlIE1pbmltYXBFbGVtZW50IGFzc29jaWF0ZWQgdG8gYSBNaW5pbWFwXG4gKiB1c2luZyB0aGUgYGF0b20udmlld3MuZ2V0Vmlld2AgbWV0aG9kLlxuICpcbiAqIE5vdGUgdGhhdCBtb3N0IGludGVyYWN0aW9ucyB3aXRoIHRoZSBNaW5pbWFwIHBhY2thZ2UgaXMgZG9uZSB0aHJvdWdoIHRoZVxuICogTWluaW1hcCBtb2RlbCBzbyB5b3Ugc2hvdWxkIG5ldmVyIGhhdmUgdG8gYWNjZXNzIE1pbmltYXBFbGVtZW50XG4gKiBpbnN0YW5jZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGxldCBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuICovXG5AZWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJylcbkBpbmNsdWRlKERPTVN0eWxlc1JlYWRlciwgQ2FudmFzRHJhd2VyLCBFdmVudHNEZWxlZ2F0aW9uLCBBbmNlc3RvcnNNZXRob2RzKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW1hcEVsZW1lbnQge1xuXG4gIC8qKlxuICAgKiBUaGUgbWV0aG9kIHRoYXQgcmVnaXN0ZXJzIHRoZSBNaW5pbWFwRWxlbWVudCBmYWN0b3J5IGluIHRoZVxuICAgKiBgYXRvbS52aWV3c2AgcmVnaXN0cnkgd2l0aCB0aGUgTWluaW1hcCBtb2RlbC5cbiAgICovXG4gIHN0YXRpYyByZWdpc3RlclZpZXdQcm92aWRlciAoTWluaW1hcCkge1xuICAgIGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyKE1pbmltYXAsIGZ1bmN0aW9uIChtb2RlbCkge1xuICAgICAgbGV0IGVsZW1lbnQgPSBuZXcgTWluaW1hcEVsZW1lbnQoKVxuICAgICAgZWxlbWVudC5zZXRNb2RlbChtb2RlbClcbiAgICAgIHJldHVybiBlbGVtZW50XG4gICAgfSlcbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAjIyAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICMjICAgIyNcbiAgLy8gICAgIyMjIyMjIyMjICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMgICAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgIyMgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVkQ2FsbGJhY2sgKCkge1xuICAgIC8vIENvcmUgcHJvcGVydGllc1xuXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5taW5pbWFwID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5lZGl0b3JFbGVtZW50ID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy53aWR0aCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuaGVpZ2h0ID0gdW5kZWZpbmVkXG5cbiAgICAvLyBTdWJzY3JpcHRpb25zXG5cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy52aXNpYmxlQXJlYVN1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMucXVpY2tTZXR0aW5nc1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxuXG4gICAgLy8gQ29uZmlnc1xuXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQgPSBmYWxzZVxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5kaXNwbGF5TWluaW1hcE9uTGVmdCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy50ZXh0T3BhY2l0eSA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmFkanVzdFRvU29mdFdyYXAgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbiA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmFic29sdXRlTW9kZSA9IHVuZGVmaW5lZFxuXG4gICAgLy8gRWxlbWVudHNcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuc2hhZG93Um9vdCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMudmlzaWJsZUFyZWEgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmNvbnRyb2xzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdzID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCA9IHVuZGVmaW5lZFxuXG4gICAgLy8gU3RhdGVzXG5cbiAgICAvKipcbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5hdHRhY2hlZCA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgKi9cbiAgICB0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAqL1xuICAgIHRoaXMuc3RhbmRBbG9uZSA9IHVuZGVmaW5lZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMud2FzVmlzaWJsZSA9IHVuZGVmaW5lZFxuXG4gICAgLy8gT3RoZXJcblxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkxhc3RSb3cgPSB1bmRlZmluZWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmZyYW1lUmVxdWVzdGVkID0gdW5kZWZpbmVkXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5mbGV4QmFzaXMgPSB1bmRlZmluZWRcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUNvbnRlbnQoKVxuXG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2ZUNvbmZpZyh7XG4gICAgICAnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCc6IChkaXNwbGF5TWluaW1hcE9uTGVmdCkgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0ID0gZGlzcGxheU1pbmltYXBPbkxlZnRcblxuICAgICAgICB0aGlzLnVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24oKVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcic6IChtaW5pbWFwU2Nyb2xsSW5kaWNhdG9yKSA9PiB7XG4gICAgICAgIHRoaXMubWluaW1hcFNjcm9sbEluZGljYXRvciA9IG1pbmltYXBTY3JvbGxJbmRpY2F0b3JcblxuICAgICAgICBpZiAodGhpcy5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yICYmICEodGhpcy5zY3JvbGxJbmRpY2F0b3IgIT0gbnVsbCkgJiYgIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnOiAoZGlzcGxheVBsdWdpbnNDb250cm9scykgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgPSBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzXG5cbiAgICAgICAgaWYgKHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scyAmJiAhKHRoaXMub3BlblF1aWNrU2V0dGluZ3MgIT0gbnVsbCkgJiYgIXRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMuZGlzcG9zZU9wZW5RdWlja1NldHRpbmdzKClcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAudGV4dE9wYWNpdHknOiAodGV4dE9wYWNpdHkpID0+IHtcbiAgICAgICAgdGhpcy50ZXh0T3BhY2l0eSA9IHRleHRPcGFjaXR5XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzJzogKGRpc3BsYXlDb2RlSGlnaGxpZ2h0cykgPT4ge1xuICAgICAgICB0aGlzLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IGRpc3BsYXlDb2RlSGlnaGxpZ2h0c1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLnNtb290aFNjcm9sbGluZyc6IChzbW9vdGhTY3JvbGxpbmcpID0+IHtcbiAgICAgICAgdGhpcy5zbW9vdGhTY3JvbGxpbmcgPSBzbW9vdGhTY3JvbGxpbmdcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkge1xuICAgICAgICAgIGlmICghdGhpcy5zbW9vdGhTY3JvbGxpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuYmFja0xheWVyLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJydcbiAgICAgICAgICAgIHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLnN0eWxlLmNzc1RleHQgPSAnJ1xuICAgICAgICAgICAgdGhpcy5mcm9udExheWVyLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJydcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnOiAoYWRqdXN0VG9Tb2Z0V3JhcCkgPT4ge1xuICAgICAgICB0aGlzLmFkanVzdFRvU29mdFdyYXAgPSBhZGp1c3RUb1NvZnRXcmFwXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKSB9XG4gICAgICB9LFxuXG4gICAgICAnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhPbmx5SWZTbWFsbGVyJzogKGFkanVzdE9ubHlJZlNtYWxsZXIpID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RPbmx5SWZTbWFsbGVyID0gYWRqdXN0T25seUlmU21hbGxlclxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMubWVhc3VyZUhlaWdodEFuZFdpZHRoKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAudXNlSGFyZHdhcmVBY2NlbGVyYXRpb24nOiAodXNlSGFyZHdhcmVBY2NlbGVyYXRpb24pID0+IHtcbiAgICAgICAgdGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbiA9IHVzZUhhcmR3YXJlQWNjZWxlcmF0aW9uXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0VXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ21pbmltYXAuYWJzb2x1dGVNb2RlJzogKGFic29sdXRlTW9kZSkgPT4ge1xuICAgICAgICB0aGlzLmFic29sdXRlTW9kZSA9IGFic29sdXRlTW9kZVxuXG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWJzb2x1dGUnLCB0aGlzLmFic29sdXRlTW9kZSlcbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCc6IChhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQpID0+IHtcbiAgICAgICAgdGhpcy5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQgPSBhZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHRcblxuICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FkanVzdC1hYnNvbHV0ZS1oZWlnaHQnLCB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodClcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdtaW5pbWFwLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMnOiAoaWdub3JlV2hpdGVzcGFjZXNJblRva2VucykgPT4ge1xuICAgICAgICB0aGlzLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMgPSBpZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zXG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICAgICAgfSxcblxuICAgICAgJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZCkgeyB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXAnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH0sXG5cbiAgICAgICdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7IHRoaXMucmVxdWVzdFVwZGF0ZSgpIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIERPTSBjYWxsYmFjayBpbnZva2VkIHdoZW4gYSBuZXcgTWluaW1hcEVsZW1lbnQgaXMgYXR0YWNoZWQgdG8gdGhlIERPTS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhdHRhY2hlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20udmlld3MucG9sbERvY3VtZW50KCgpID0+IHsgdGhpcy5wb2xsRE9NKCkgfSkpXG4gICAgdGhpcy5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuICAgIHRoaXMudXBkYXRlTWluaW1hcEZsZXhQb3NpdGlvbigpXG4gICAgdGhpcy5hdHRhY2hlZCA9IHRydWVcbiAgICB0aGlzLmF0dGFjaGVkVG9UZXh0RWRpdG9yID0gdGhpcy5wYXJlbnROb2RlID09PSB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50Um9vdCgpXG5cbiAgICBpZiAodGhpcy5hdHRhY2hlZFRvVGV4dEVkaXRvcikge1xuICAgICAgdGhpcy5nZXRUZXh0RWRpdG9yRWxlbWVudCgpLnNldEF0dHJpYnV0ZSgnd2l0aC1taW5pbWFwJywgJycpXG4gICAgfVxuXG4gICAgLypcbiAgICAgIFdlIHVzZSBgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnRgIGluc3RlYWQgb2ZcbiAgICAgIGBhdG9tLnRoZW1lcy5vbkRpZENoYW5nZUFjdGl2ZVRoZW1lc2AuXG4gICAgICBXaHk/IEN1cnJlbnRseSwgVGhlIHN0eWxlIGVsZW1lbnQgd2lsbCBiZSByZW1vdmVkIGZpcnN0LCBhbmQgdGhlbiByZS1hZGRlZFxuICAgICAgYW5kIHRoZSBgY2hhbmdlYCBldmVudCBoYXMgbm90IGJlIHRyaWdnZXJlZCBpbiB0aGUgcHJvY2Vzcy5cbiAgICAqL1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUoKVxuICAgICAgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdWJzY3JpYmVUb01lZGlhUXVlcnkoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBET00gY2FsbGJhY2sgaW52b2tlZCB3aGVuIGEgbmV3IE1pbmltYXBFbGVtZW50IGlzIGRldGFjaGVkIGZyb20gdGhlIERPTS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkZXRhY2hlZENhbGxiYWNrICgpIHtcbiAgICB0aGlzLmdldFRleHRFZGl0b3JFbGVtZW50KCkucmVtb3ZlQXR0cmlidXRlKCd3aXRoLW1pbmltYXAnKVxuICAgIHRoaXMuYXR0YWNoZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gICAgICAgIyMjICAgICMjIyMjIyMjICMjIyMjIyMjICAgICMjIyAgICAgIyMjIyMjICAjIyAgICAgIyNcbiAgLy8gICAgICAjIyAjIyAgICAgICMjICAgICAgICMjICAgICAgIyMgIyMgICAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgICMjICAgIyMgICAgICMjICAgICAgICMjICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjIyMjIyNcbiAgLy8gICAgIyMjIyMjIyMjICAgICMjICAgICAgICMjICAgICMjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAjIyAjIyAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAjIyAgIyMjIyMjICAjIyAgICAgIyNcblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBNaW5pbWFwRWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBvbiBzY3JlZW4gb3Igbm90LlxuICAgKlxuICAgKiBUaGUgdmlzaWJpbGl0eSBvZiB0aGUgbWluaW1hcCBpcyBkZWZpbmVkIGJ5IHRlc3RpbmcgdGhlIHNpemUgb2YgdGhlIG9mZnNldFxuICAgKiB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBlbGVtZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHRoZSBNaW5pbWFwRWxlbWVudCBpcyBjdXJyZW50bHkgdmlzaWJsZSBvciBub3RcbiAgICovXG4gIGlzVmlzaWJsZSAoKSB7IHJldHVybiB0aGlzLm9mZnNldFdpZHRoID4gMCB8fCB0aGlzLm9mZnNldEhlaWdodCA+IDAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgTWluaW1hcEVsZW1lbnQgdG8gdGhlIERPTS5cbiAgICpcbiAgICogVGhlIHBvc2l0aW9uIGF0IHdoaWNoIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIGlzIGRlZmluZWQgYnkgdGhlXG4gICAqIGBkaXNwbGF5TWluaW1hcE9uTGVmdGAgc2V0dGluZy5cbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IFtwYXJlbnRdIHRoZSBET00gbm9kZSB3aGVyZSBhdHRhY2hpbmcgdGhlIG1pbmltYXBcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRcbiAgICovXG4gIGF0dGFjaCAocGFyZW50KSB7XG4gICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgcmV0dXJuIH1cbiAgICAocGFyZW50IHx8IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KCkpLmFwcGVuZENoaWxkKHRoaXMpXG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgdGhlIE1pbmltYXBFbGVtZW50IGZyb20gdGhlIERPTS5cbiAgICovXG4gIGRldGFjaCAoKSB7XG4gICAgaWYgKCF0aGlzLmF0dGFjaGVkIHx8IHRoaXMucGFyZW50Tm9kZSA9PSBudWxsKSB7IHJldHVybiB9XG4gICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpXG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgbWluaW1hcCBsZWZ0L3JpZ2h0IHBvc2l0aW9uIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGVcbiAgICogYGRpc3BsYXlNaW5pbWFwT25MZWZ0YCBzZXR0aW5nLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZU1pbmltYXBGbGV4UG9zaXRpb24gKCkge1xuICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnbGVmdCcsIHRoaXMuZGlzcGxheU1pbmltYXBPbkxlZnQpXG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhpcyBNaW5pbWFwRWxlbWVudFxuICAgKi9cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuZGV0YWNoKClcbiAgICB0aGlzLm1pbmltYXAgPSBudWxsXG4gIH1cblxuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMgICAgIyMgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjIyAgICMjICAgICMjICAgICMjICAgICAgICMjIyAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAgICAjIyAgICAjIyAgICAgICAjIyMjICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgIyMgIyMgICAgIyMgICAgIyMjIyMjICAgIyMgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICAgICMjICAgICMjICAgICAgICMjICAjIyMjICAgICMjXG4gIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICMjIyAgICAjIyAgICAjIyAgICAgICAjIyAgICMjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgIyMgICAgIyNcblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgY29udGVudCBvZiB0aGUgTWluaW1hcEVsZW1lbnQgYW5kIGF0dGFjaGVzIHRoZSBtb3VzZSBjb250cm9sXG4gICAqIGV2ZW50IGxpc3RlbmVycy5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplQ29udGVudCAoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplQ2FudmFzKClcblxuICAgIHRoaXMuc2hhZG93Um9vdCA9IHRoaXMuY3JlYXRlU2hhZG93Um9vdCgpXG4gICAgdGhpcy5hdHRhY2hDYW52YXNlcyh0aGlzLnNoYWRvd1Jvb3QpXG5cbiAgICB0aGlzLmNyZWF0ZVZpc2libGVBcmVhKClcbiAgICB0aGlzLmNyZWF0ZUNvbnRyb2xzKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5zdWJzY3JpYmVUbyh0aGlzLCB7XG4gICAgICAnbW91c2V3aGVlbCc6IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGFuZEFsb25lKSB7XG4gICAgICAgICAgdGhpcy5yZWxheU1vdXNld2hlZWxFdmVudChlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuc3Vic2NyaWJlVG8odGhpcy5nZXRGcm9udENhbnZhcygpLCB7XG4gICAgICAnbW91c2Vkb3duJzogKGUpID0+IHsgdGhpcy5jYW52YXNQcmVzc2VkKHRoaXMuZXh0cmFjdE1vdXNlRXZlbnREYXRhKGUpKSB9LFxuICAgICAgJ3RvdWNoc3RhcnQnOiAoZSkgPT4geyB0aGlzLmNhbnZhc1ByZXNzZWQodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSkpIH1cbiAgICB9KSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdmlzaWJsZSBhcmVhIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjcmVhdGVWaXNpYmxlQXJlYSAoKSB7XG4gICAgaWYgKHRoaXMudmlzaWJsZUFyZWEpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMudmlzaWJsZUFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMudmlzaWJsZUFyZWEuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC12aXNpYmxlLWFyZWEnKVxuICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLnZpc2libGVBcmVhKVxuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZVRvKHRoaXMudmlzaWJsZUFyZWEsIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4geyB0aGlzLnN0YXJ0RHJhZyh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSkgfSxcbiAgICAgICd0b3VjaHN0YXJ0JzogKGUpID0+IHsgdGhpcy5zdGFydERyYWcodGhpcy5leHRyYWN0VG91Y2hFdmVudERhdGEoZSkpIH1cbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHZpc2libGUgYXJlYSBkaXYuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlVmlzaWJsZUFyZWEgKCkge1xuICAgIGlmICghdGhpcy52aXNpYmxlQXJlYSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZSh0aGlzLnZpc2libGVBcmVhU3Vic2NyaXB0aW9uKVxuICAgIHRoaXMudmlzaWJsZUFyZWFTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgdGhpcy5zaGFkb3dSb290LnJlbW92ZUNoaWxkKHRoaXMudmlzaWJsZUFyZWEpXG4gICAgZGVsZXRlIHRoaXMudmlzaWJsZUFyZWFcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBjb250cm9scyBjb250YWluZXIgZGl2LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZUNvbnRyb2xzICgpIHtcbiAgICBpZiAodGhpcy5jb250cm9scyB8fCB0aGlzLnN0YW5kQWxvbmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuY29udHJvbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuY29udHJvbHMuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC1jb250cm9scycpXG4gICAgdGhpcy5zaGFkb3dSb290LmFwcGVuZENoaWxkKHRoaXMuY29udHJvbHMpXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgY29udHJvbHMgY29udGFpbmVyIGRpdi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZW1vdmVDb250cm9scyAoKSB7XG4gICAgaWYgKCF0aGlzLmNvbnRyb2xzKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnNoYWRvd1Jvb3QucmVtb3ZlQ2hpbGQodGhpcy5jb250cm9scylcbiAgICBkZWxldGUgdGhpcy5jb250cm9sc1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGRpdiB3aGVuIHRoZSBgbWluaW1hcFNjcm9sbEluZGljYXRvcmBcbiAgICogc2V0dGluZ3MgaXMgZW5hYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yICgpIHtcbiAgICBpZiAodGhpcy5zY3JvbGxJbmRpY2F0b3IgfHwgdGhpcy5zdGFuZEFsb25lKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLnNjcm9sbEluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5zY3JvbGxJbmRpY2F0b3IuY2xhc3NMaXN0LmFkZCgnbWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJylcbiAgICB0aGlzLmNvbnRyb2xzLmFwcGVuZENoaWxkKHRoaXMuc2Nyb2xsSW5kaWNhdG9yKVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGRpdiB3aGVuIHRoZSBgbWluaW1hcFNjcm9sbEluZGljYXRvcmBcbiAgICogc2V0dGluZ3MgaXMgZGlzYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZGlzcG9zZVNjcm9sbEluZGljYXRvciAoKSB7XG4gICAgaWYgKCF0aGlzLnNjcm9sbEluZGljYXRvcikgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scy5yZW1vdmVDaGlsZCh0aGlzLnNjcm9sbEluZGljYXRvcilcbiAgICBkZWxldGUgdGhpcy5zY3JvbGxJbmRpY2F0b3JcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgcXVpY2sgc2V0dGluZ3Mgb3BlbmVuZXIgZGl2IHdoZW4gdGhlXG4gICAqIGBkaXNwbGF5UGx1Z2luc0NvbnRyb2xzYCBzZXR0aW5nIGlzIGVuYWJsZWQuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZU9wZW5RdWlja1NldHRpbmdzICgpIHtcbiAgICBpZiAodGhpcy5vcGVuUXVpY2tTZXR0aW5ncyB8fCB0aGlzLnN0YW5kQWxvbmUpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ3MuY2xhc3NMaXN0LmFkZCgnb3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICB0aGlzLmNvbnRyb2xzLmFwcGVuZENoaWxkKHRoaXMub3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICB0aGlzLm9wZW5RdWlja1NldHRpbmdTdWJzY3JpcHRpb24gPSB0aGlzLnN1YnNjcmliZVRvKHRoaXMub3BlblF1aWNrU2V0dGluZ3MsIHtcbiAgICAgICdtb3VzZWRvd24nOiAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICAgIGlmICgodGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCAhPSBudWxsKSkge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQgPSBuZXcgTWluaW1hcFF1aWNrU2V0dGluZ3NFbGVtZW50KClcbiAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnNldE1vZGVsKHRoaXMpXG4gICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzU3Vic2NyaXB0aW9uID0gdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5xdWlja1NldHRpbmdzRWxlbWVudCA9IG51bGxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnQsIHJpZ2h0fSA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuc3R5bGUudG9wID0gdG9wICsgJ3B4J1xuICAgICAgICAgIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuYXR0YWNoKClcblxuICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXlNaW5pbWFwT25MZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAocmlnaHQpICsgJ3B4J1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnF1aWNrU2V0dGluZ3NFbGVtZW50LnN0eWxlLmxlZnQgPSAobGVmdCAtIHRoaXMucXVpY2tTZXR0aW5nc0VsZW1lbnQuY2xpZW50V2lkdGgpICsgJ3B4J1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIHF1aWNrIHNldHRpbmdzIG9wZW5lbmVyIGRpdiB3aGVuIHRoZSBgZGlzcGxheVBsdWdpbnNDb250cm9sc2BcbiAgICogc2V0dGluZyBpcyBkaXNhYmxlZC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkaXNwb3NlT3BlblF1aWNrU2V0dGluZ3MgKCkge1xuICAgIGlmICghdGhpcy5vcGVuUXVpY2tTZXR0aW5ncykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5jb250cm9scy5yZW1vdmVDaGlsZCh0aGlzLm9wZW5RdWlja1NldHRpbmdzKVxuICAgIHRoaXMub3BlblF1aWNrU2V0dGluZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBkZWxldGUgdGhpcy5vcGVuUXVpY2tTZXR0aW5nc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRhcmdldCBgVGV4dEVkaXRvcmAgb2YgdGhlIE1pbmltYXAuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHRFZGl0b3J9IHRoZSBtaW5pbWFwJ3MgdGV4dCBlZGl0b3JcbiAgICovXG4gIGdldFRleHRFZGl0b3IgKCkgeyByZXR1cm4gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3IoKSB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgZm9yIHRoZSBNaW5pbWFwJ3MgYFRleHRFZGl0b3JgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0RWRpdG9yRWxlbWVudH0gdGhlIG1pbmltYXAncyB0ZXh0IGVkaXRvciBlbGVtZW50XG4gICAqL1xuICBnZXRUZXh0RWRpdG9yRWxlbWVudCAoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yRWxlbWVudCkgeyByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50IH1cblxuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmdldFRleHRFZGl0b3IoKSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3JFbGVtZW50XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCBvZiB0aGUgYFRleHRFZGl0b3JFbGVtZW50YCBjb250ZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtb3N0bHkgdXNlZCB0byBlbnN1cmUgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBgc2hhZG93RG9tYFxuICAgKiBzZXR0aW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgb2YgdGhlIGBUZXh0RWRpdG9yRWxlbWVudGAgY29udGVudFxuICAgKi9cbiAgZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290ICgpIHtcbiAgICBsZXQgZWRpdG9yRWxlbWVudCA9IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuXG4gICAgaWYgKGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZWRpdG9yRWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByb290IHdoZXJlIHRvIGluamVjdCB0aGUgZHVtbXkgbm9kZSB1c2VkIHRvIHJlYWQgRE9NIHN0eWxlcy5cbiAgICpcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gc2hhZG93Um9vdCB3aGV0aGVyIHRvIHVzZSB0aGUgdGV4dCBlZGl0b3Igc2hhZG93IERPTVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIG5vdFxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gdGhlIHJvb3Qgbm9kZSB3aGVyZSBhcHBlbmRpbmcgdGhlIGR1bW15IG5vZGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBnZXREdW1teURPTVJvb3QgKHNoYWRvd1Jvb3QpIHtcbiAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnRSb290KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjXG4gIC8vICAgICMjIyAgICMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjIyMgIyMjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICMjIyAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjIyAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE1pbmltYXAgZm9yIHdoaWNoIHRoaXMgTWluaW1hcEVsZW1lbnQgd2FzIGNyZWF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIGdldE1vZGVsICgpIHsgcmV0dXJuIHRoaXMubWluaW1hcCB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgTWluaW1hcEVsZW1lbnQgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSAge01pbmltYXB9IG1pbmltYXAgdGhlIE1pbmltYXAgbW9kZWwgZm9yIHRoaXMgaW5zdGFuY2UuXG4gICAqIEByZXR1cm4ge01pbmltYXB9IHRoaXMgZWxlbWVudCdzIE1pbmltYXBcbiAgICovXG4gIHNldE1vZGVsIChtaW5pbWFwKSB7XG4gICAgdGhpcy5taW5pbWFwID0gbWluaW1hcFxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KCgpID0+IHtcbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGVzdHJveSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VDb25maWcoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgcmV0dXJuIHRoaXMucmVxdWVzdEZvcmNlZFVwZGF0ZSgpIH1cbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlU3RhbmRBbG9uZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YW5kQWxvbmUodGhpcy5taW5pbWFwLmlzU3RhbmRBbG9uZSgpKVxuICAgICAgdGhpcy5yZXF1ZXN0VXBkYXRlKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5taW5pbWFwLm9uRGlkQ2hhbmdlKChjaGFuZ2UpID0+IHtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm1pbmltYXAub25EaWRDaGFuZ2VEZWNvcmF0aW9uUmFuZ2UoKGNoYW5nZSkgPT4ge1xuICAgICAgY29uc3Qge3R5cGV9ID0gY2hhbmdlXG4gICAgICBpZiAodHlwZSA9PT0gJ2xpbmUnIHx8IHR5cGUgPT09ICdoaWdobGlnaHQtdW5kZXInIHx8IHR5cGUgPT09ICdiYWNrZ3JvdW5kLWN1c3RvbScpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nQmFja0RlY29yYXRpb25DaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nRnJvbnREZWNvcmF0aW9uQ2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKE1haW4ub25EaWRDaGFuZ2VQbHVnaW5PcmRlcigoKSA9PiB7XG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zZXRTdGFuZEFsb25lKHRoaXMubWluaW1hcC5pc1N0YW5kQWxvbmUoKSlcblxuICAgIGlmICh0aGlzLndpZHRoICE9IG51bGwgJiYgdGhpcy5oZWlnaHQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5taW5pbWFwLnNldFNjcmVlbkhlaWdodEFuZFdpZHRoKHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm1pbmltYXBcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdGFuZC1hbG9uZSBtb2RlIGZvciB0aGlzIE1pbmltYXBFbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YW5kQWxvbmUgdGhlIG5ldyBtb2RlIGZvciB0aGlzIE1pbmltYXBFbGVtZW50XG4gICAqL1xuICBzZXRTdGFuZEFsb25lIChzdGFuZEFsb25lKSB7XG4gICAgdGhpcy5zdGFuZEFsb25lID0gc3RhbmRBbG9uZVxuXG4gICAgaWYgKHRoaXMuc3RhbmRBbG9uZSkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3N0YW5kLWFsb25lJywgdHJ1ZSlcbiAgICAgIHRoaXMuZGlzcG9zZVNjcm9sbEluZGljYXRvcigpXG4gICAgICB0aGlzLmRpc3Bvc2VPcGVuUXVpY2tTZXR0aW5ncygpXG4gICAgICB0aGlzLnJlbW92ZUNvbnRyb2xzKClcbiAgICAgIHRoaXMucmVtb3ZlVmlzaWJsZUFyZWEoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3RhbmQtYWxvbmUnKVxuICAgICAgdGhpcy5jcmVhdGVWaXNpYmxlQXJlYSgpXG4gICAgICB0aGlzLmNyZWF0ZUNvbnRyb2xzKClcbiAgICAgIGlmICh0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IpIHsgdGhpcy5pbml0aWFsaXplU2Nyb2xsSW5kaWNhdG9yKCkgfVxuICAgICAgaWYgKHRoaXMuZGlzcGxheVBsdWdpbnNDb250cm9scykgeyB0aGlzLmluaXRpYWxpemVPcGVuUXVpY2tTZXR0aW5ncygpIH1cbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgICAjIyAjIyAgICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgICMjICAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAgIyMgICAgICMjICMjIyMjIyMjIyAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIGFuIHVwZGF0ZSB0byBiZSBwZXJmb3JtZWQgb24gdGhlIG5leHQgZnJhbWUuXG4gICAqL1xuICByZXF1ZXN0VXBkYXRlICgpIHtcbiAgICBpZiAodGhpcy5mcmFtZVJlcXVlc3RlZCkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IHRydWVcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgdGhpcy5mcmFtZVJlcXVlc3RlZCA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyBhbiB1cGRhdGUgdG8gYmUgcGVyZm9ybWVkIG9uIHRoZSBuZXh0IGZyYW1lIHRoYXQgd2lsbCBjb21wbGV0ZWx5XG4gICAqIHJlZHJhdyB0aGUgbWluaW1hcC5cbiAgICovXG4gIHJlcXVlc3RGb3JjZWRVcGRhdGUgKCkge1xuICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSBudWxsXG4gICAgdGhpcy5vZmZzY3JlZW5MYXN0Um93ID0gbnVsbFxuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpXG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGFjdHVhbCBNaW5pbWFwRWxlbWVudCB1cGRhdGUuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlICgpIHtcbiAgICBpZiAoISh0aGlzLmF0dGFjaGVkICYmIHRoaXMuaXNWaXNpYmxlKCkgJiYgdGhpcy5taW5pbWFwKSkgeyByZXR1cm4gfVxuICAgIGNvbnN0IG1pbmltYXAgPSB0aGlzLm1pbmltYXBcbiAgICBtaW5pbWFwLmVuYWJsZUNhY2hlKClcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLmdldEZyb250Q2FudmFzKClcblxuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgY29uc3QgdmlzaWJsZUFyZWFMZWZ0ID0gbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsTGVmdCgpXG4gICAgY29uc3QgdmlzaWJsZUFyZWFUb3AgPSBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKClcbiAgICBjb25zdCB2aXNpYmxlV2lkdGggPSBNYXRoLm1pbihjYW52YXMud2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvLCB0aGlzLndpZHRoKVxuXG4gICAgaWYgKHRoaXMuYWRqdXN0VG9Tb2Z0V3JhcCAmJiB0aGlzLmZsZXhCYXNpcykge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSB0aGlzLmZsZXhCYXNpcyArICdweCdcbiAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB0aGlzLmZsZXhCYXNpcyArICdweCdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdHlsZS5mbGV4QmFzaXMgPSBudWxsXG4gICAgICB0aGlzLnN0eWxlLndpZHRoID0gbnVsbFxuICAgIH1cblxuICAgIGlmIChTUEVDX01PREUpIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy52aXNpYmxlQXJlYSwge1xuICAgICAgICB3aWR0aDogdmlzaWJsZVdpZHRoICsgJ3B4JyxcbiAgICAgICAgaGVpZ2h0OiBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSArICdweCcsXG4gICAgICAgIHRvcDogdmlzaWJsZUFyZWFUb3AgKyAncHgnLFxuICAgICAgICAnYm9yZGVyLWxlZnQtd2lkdGgnOiB2aXNpYmxlQXJlYUxlZnQgKyAncHgnXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudmlzaWJsZUFyZWEsIHtcbiAgICAgICAgd2lkdGg6IHZpc2libGVXaWR0aCArICdweCcsXG4gICAgICAgIGhlaWdodDogbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkgKyAncHgnLFxuICAgICAgICB0cmFuc2Zvcm06IHRoaXMubWFrZVRyYW5zbGF0ZSgwLCB2aXNpYmxlQXJlYVRvcCksXG4gICAgICAgICdib3JkZXItbGVmdC13aWR0aCc6IHZpc2libGVBcmVhTGVmdCArICdweCdcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmNvbnRyb2xzLCB7d2lkdGg6IHZpc2libGVXaWR0aCArICdweCd9KVxuXG4gICAgbGV0IGNhbnZhc1RvcCA9IG1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkgKiBtaW5pbWFwLmdldExpbmVIZWlnaHQoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKClcblxuICAgIGlmICh0aGlzLnNtb290aFNjcm9sbGluZykge1xuICAgICAgaWYgKFNQRUNfTU9ERSkge1xuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuYmFja0xheWVyLmNhbnZhcywge3RvcDogY2FudmFzVG9wICsgJ3B4J30pXG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy50b2tlbnNMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0b3A6IGNhbnZhc1RvcCArICdweCd9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNhbnZhc1RyYW5zZm9ybSA9IHRoaXMubWFrZVRyYW5zbGF0ZSgwLCBjYW52YXNUb3ApXG4gICAgICAgIGlmIChkZXZpY2VQaXhlbFJhdGlvICE9PSAxKSB7XG4gICAgICAgICAgY2FudmFzVHJhbnNmb3JtICs9ICcgJyArIHRoaXMubWFrZVNjYWxlKDEgLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5iYWNrTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZnJvbnRMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNhbnZhc1RyYW5zZm9ybSA9IHRoaXMubWFrZVNjYWxlKDEgLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmJhY2tMYXllci5jYW52YXMsIHt0cmFuc2Zvcm06IGNhbnZhc1RyYW5zZm9ybX0pXG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHRoaXMudG9rZW5zTGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmZyb250TGF5ZXIuY2FudmFzLCB7dHJhbnNmb3JtOiBjYW52YXNUcmFuc2Zvcm19KVxuICAgIH1cblxuICAgIGlmICh0aGlzLm1pbmltYXBTY3JvbGxJbmRpY2F0b3IgJiYgbWluaW1hcC5jYW5TY3JvbGwoKSAmJiAhdGhpcy5zY3JvbGxJbmRpY2F0b3IpIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjcm9sbEluZGljYXRvcigpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsSW5kaWNhdG9yICE9IG51bGwpIHtcbiAgICAgIGxldCBtaW5pbWFwU2NyZWVuSGVpZ2h0ID0gbWluaW1hcC5nZXRTY3JlZW5IZWlnaHQoKVxuICAgICAgbGV0IGluZGljYXRvckhlaWdodCA9IG1pbmltYXBTY3JlZW5IZWlnaHQgKiAobWluaW1hcFNjcmVlbkhlaWdodCAvIG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICBsZXQgaW5kaWNhdG9yU2Nyb2xsID0gKG1pbmltYXBTY3JlZW5IZWlnaHQgLSBpbmRpY2F0b3JIZWlnaHQpICogbWluaW1hcC5nZXRTY3JvbGxSYXRpbygpXG5cbiAgICAgIGlmIChTUEVDX01PREUpIHtcbiAgICAgICAgdGhpcy5hcHBseVN0eWxlcyh0aGlzLnNjcm9sbEluZGljYXRvciwge1xuICAgICAgICAgIGhlaWdodDogaW5kaWNhdG9ySGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICB0b3A6IGluZGljYXRvclNjcm9sbCArICdweCdcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwbHlTdHlsZXModGhpcy5zY3JvbGxJbmRpY2F0b3IsIHtcbiAgICAgICAgICBoZWlnaHQ6IGluZGljYXRvckhlaWdodCArICdweCcsXG4gICAgICAgICAgdHJhbnNmb3JtOiB0aGlzLm1ha2VUcmFuc2xhdGUoMCwgaW5kaWNhdG9yU2Nyb2xsKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAoIW1pbmltYXAuY2FuU2Nyb2xsKCkpIHsgdGhpcy5kaXNwb3NlU2Nyb2xsSW5kaWNhdG9yKCkgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmFic29sdXRlTW9kZSAmJiB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCkgeyB0aGlzLnVwZGF0ZUNhbnZhc2VzU2l6ZSgpIH1cblxuICAgIHRoaXMudXBkYXRlQ2FudmFzKClcbiAgICBtaW5pbWFwLmNsZWFyQ2FjaGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgd2hldGhlciB0byByZW5kZXIgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvciBub3QuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZGlzcGxheUNvZGVIaWdobGlnaHRzIHdoZXRoZXIgdG8gcmVuZGVyIHRoZSBjb2RlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodHMgb3Igbm90XG4gICAqL1xuICBzZXREaXNwbGF5Q29kZUhpZ2hsaWdodHMgKGRpc3BsYXlDb2RlSGlnaGxpZ2h0cykge1xuICAgIHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzID0gZGlzcGxheUNvZGVIaWdobGlnaHRzXG4gICAgaWYgKHRoaXMuYXR0YWNoZWQpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBvbGxpbmcgY2FsbGJhY2sgdXNlZCB0byBkZXRlY3QgdmlzaWJpbGl0eSBhbmQgc2l6ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHBvbGxET00gKCkge1xuICAgIGxldCB2aXNpYmlsaXR5Q2hhbmdlZCA9IHRoaXMuY2hlY2tGb3JWaXNpYmlsaXR5Q2hhbmdlKClcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgaWYgKCF0aGlzLndhc1Zpc2libGUpIHsgdGhpcy5yZXF1ZXN0Rm9yY2VkVXBkYXRlKCkgfVxuXG4gICAgICB0aGlzLm1lYXN1cmVIZWlnaHRBbmRXaWR0aCh2aXNpYmlsaXR5Q2hhbmdlZCwgZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgY2hlY2tzIGZvciB2aXNpYmlsaXR5IGNoYW5nZXMgaW4gdGhlIE1pbmltYXBFbGVtZW50LlxuICAgKiBUaGUgbWV0aG9kIHJldHVybnMgYHRydWVgIHdoZW4gdGhlIHZpc2liaWxpdHkgY2hhbmdlZCBmcm9tIHZpc2libGUgdG9cbiAgICogaGlkZGVuIG9yIGZyb20gaGlkZGVuIHRvIHZpc2libGUuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIHZpc2liaWxpdHkgY2hhbmdlZCBvciBub3Qgc2luY2UgdGhlIGxhc3QgY2FsbFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNoZWNrRm9yVmlzaWJpbGl0eUNoYW5nZSAoKSB7XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIGlmICh0aGlzLndhc1Zpc2libGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSB0cnVlXG4gICAgICAgIHJldHVybiB0aGlzLndhc1Zpc2libGVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMud2FzVmlzaWJsZSkge1xuICAgICAgICB0aGlzLndhc1Zpc2libGUgPSBmYWxzZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YXNWaXNpYmxlID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzVmlzaWJsZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB1c2VkIHRvIG1lYXN1cmUgdGhlIHNpemUgb2YgdGhlIE1pbmltYXBFbGVtZW50IGFuZCB1cGRhdGUgaW50ZXJuYWxcbiAgICogY29tcG9uZW50cyBiYXNlZCBvbiB0aGUgbmV3IHNpemUuXG4gICAqXG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IHZpc2liaWxpdHlDaGFuZ2VkIGRpZCB0aGUgdmlzaWJpbGl0eSBjaGFuZ2VkIHNpbmNlIGxhc3RcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnRcbiAgICogQHBhcmFtICB7W3R5cGVdfSBbZm9yY2VVcGRhdGU9dHJ1ZV0gZm9yY2VzIHRoZSB1cGRhdGUgZXZlbiB3aGVuIG5vIGNoYW5nZXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VyZSBkZXRlY3RlZFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIG1lYXN1cmVIZWlnaHRBbmRXaWR0aCAodmlzaWJpbGl0eUNoYW5nZWQsIGZvcmNlVXBkYXRlID0gdHJ1ZSkge1xuICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG5cbiAgICBsZXQgd2FzUmVzaXplZCA9IHRoaXMud2lkdGggIT09IHRoaXMuY2xpZW50V2lkdGggfHwgdGhpcy5oZWlnaHQgIT09IHRoaXMuY2xpZW50SGVpZ2h0XG5cbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2xpZW50SGVpZ2h0XG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY2xpZW50V2lkdGhcbiAgICBsZXQgY2FudmFzV2lkdGggPSB0aGlzLndpZHRoXG5cbiAgICBpZiAoKHRoaXMubWluaW1hcCAhPSBudWxsKSkge1xuICAgICAgdGhpcy5taW5pbWFwLnNldFNjcmVlbkhlaWdodEFuZFdpZHRoKHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKVxuICAgIH1cblxuICAgIGlmICh3YXNSZXNpemVkIHx8IHZpc2liaWxpdHlDaGFuZ2VkIHx8IGZvcmNlVXBkYXRlKSB7XG4gICAgICB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKVxuICAgIH1cblxuICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkgeyByZXR1cm4gfVxuXG4gICAgaWYgKHdhc1Jlc2l6ZWQgfHwgZm9yY2VVcGRhdGUpIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdFRvU29mdFdyYXApIHtcbiAgICAgICAgbGV0IGxpbmVMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJylcbiAgICAgICAgbGV0IHNvZnRXcmFwID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFdyYXAnKVxuICAgICAgICBsZXQgc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcpXG4gICAgICAgIGxldCB3aWR0aCA9IGxpbmVMZW5ndGggKiB0aGlzLm1pbmltYXAuZ2V0Q2hhcldpZHRoKClcblxuICAgICAgICBpZiAoc29mdFdyYXAgJiYgc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGggJiYgbGluZUxlbmd0aCAmJiAod2lkdGggPD0gdGhpcy53aWR0aCB8fCAhdGhpcy5hZGp1c3RPbmx5SWZTbWFsbGVyKSkge1xuICAgICAgICAgIHRoaXMuZmxleEJhc2lzID0gd2lkdGhcbiAgICAgICAgICBjYW52YXNXaWR0aCA9IHdpZHRoXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuZmxleEJhc2lzXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmZsZXhCYXNpc1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVwZGF0ZUNhbnZhc2VzU2l6ZShjYW52YXNXaWR0aClcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDYW52YXNlc1NpemUgKGNhbnZhc1dpZHRoID0gdGhpcy5nZXRGcm9udENhbnZhcygpLndpZHRoKSB7XG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCBtYXhDYW52YXNIZWlnaHQgPSB0aGlzLmhlaWdodCArIHRoaXMubWluaW1hcC5nZXRMaW5lSGVpZ2h0KClcbiAgICBjb25zdCBuZXdIZWlnaHQgPSB0aGlzLmFic29sdXRlTW9kZSAmJiB0aGlzLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCA/IE1hdGgubWluKHRoaXMubWluaW1hcC5nZXRIZWlnaHQoKSwgbWF4Q2FudmFzSGVpZ2h0KSA6IG1heENhbnZhc0hlaWdodFxuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuZ2V0RnJvbnRDYW52YXMoKVxuICAgIGlmIChjYW52YXNXaWR0aCAhPT0gY2FudmFzLndpZHRoIHx8IG5ld0hlaWdodCAhPT0gY2FudmFzLmhlaWdodCkge1xuICAgICAgdGhpcy5zZXRDYW52YXNlc1NpemUoXG4gICAgICAgIGNhbnZhc1dpZHRoICogZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgICAgbmV3SGVpZ2h0ICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgICAgKVxuICAgICAgaWYgKHRoaXMuYWJzb2x1dGVNb2RlICYmIHRoaXMuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0KSB7XG4gICAgICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSBudWxsXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyMjIyMjIyAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICAgIyMgIyMjIyMjIyMgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMjICAgIyMgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjIyMgICMjICAgICMjICAgICMjXG4gIC8vICAgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMgICAjIyAjIyAjIyAgICAjIyAgICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgIyMjIyAgICAjIyAgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAgICAgICMjICMjICAgIyMgICAgICAgIyMgICAjIyMgICAgIyMgICAgIyMgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICAgIyMjICAgICMjIyMjIyMjICMjICAgICMjICAgICMjICAgICAjIyMjIyNcblxuICAvKipcbiAgICogSGVscGVyIG1ldGhvZCB0byByZWdpc3RlciBjb25maWcgb2JzZXJ2ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGNvbmZpZ3M9e30gYW4gb2JqZWN0IG1hcHBpbmcgdGhlIGNvbmZpZyBuYW1lIHRvIG9ic2VydmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggdGhlIGZ1bmN0aW9uIHRvIGNhbGwgYmFjayB3aGVuIGEgY2hhbmdlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvY2N1cnNcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBvYnNlcnZlQ29uZmlnIChjb25maWdzID0ge30pIHtcbiAgICBmb3IgKGxldCBjb25maWcgaW4gY29uZmlncykge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKGNvbmZpZywgY29uZmlnc1tjb25maWddKSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIGlzIHByZXNzZWQgb24gdGhlIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY2FudmFzUHJlc3NlZCAoe3ksIGlzTGVmdE1vdXNlLCBpc01pZGRsZU1vdXNlfSkge1xuICAgIGlmICh0aGlzLm1pbmltYXAuaXNTdGFuZEFsb25lKCkpIHsgcmV0dXJuIH1cbiAgICBpZiAoaXNMZWZ0TW91c2UpIHtcbiAgICAgIHRoaXMuY2FudmFzTGVmdE1vdXNlUHJlc3NlZCh5KVxuICAgIH0gZWxzZSBpZiAoaXNNaWRkbGVNb3VzZSkge1xuICAgICAgdGhpcy5jYW52YXNNaWRkbGVNb3VzZVByZXNzZWQoeSlcbiAgICAgIGxldCB7dG9wLCBoZWlnaHR9ID0gdGhpcy52aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgdGhpcy5zdGFydERyYWcoe3k6IHRvcCArIGhlaWdodCAvIDIsIGlzTGVmdE1vdXNlOiBmYWxzZSwgaXNNaWRkbGVNb3VzZTogdHJ1ZX0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBsZWZ0IGJ1dHRvbiBpcyBwcmVzc2VkIG9uIHRoZVxuICAgKiBNaW5pbWFwRWxlbWVudCBjYW52YXMuXG4gICAqXG4gICAqIEBwYXJhbSAge01vdXNlRXZlbnR9IGUgdGhlIG1vdXNlIGV2ZW50IG9iamVjdFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGUucGFnZVkgdGhlIG1vdXNlIHkgcG9zaXRpb24gaW4gcGFnZVxuICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZS50YXJnZXQgdGhlIHNvdXJjZSBvZiB0aGUgZXZlbnRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjYW52YXNMZWZ0TW91c2VQcmVzc2VkICh5KSB7XG4gICAgY29uc3QgZGVsdGFZID0geSAtIHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihkZWx0YVkgLyB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpKSArIHRoaXMubWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yKClcbiAgICBjb25zdCB0ZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKVxuXG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gcm93ICogdGV4dEVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9ySGVpZ2h0KCkgLyAyXG4gICAgY29uc3QgdGV4dEVkaXRvclNjcm9sbFRvcCA9IHRleHRFZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbcm93LCAwXSkudG9wIC0gdGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JIZWlnaHQoKSAvIDJcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJykpIHtcbiAgICAgIGNvbnN0IGR1cmF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbkR1cmF0aW9uJylcbiAgICAgIGNvbnN0IGluZGVwZW5kZW50U2Nyb2xsID0gdGhpcy5taW5pbWFwLnNjcm9sbEluZGVwZW5kZW50bHlPbk1vdXNlV2hlZWwoKVxuXG4gICAgICBsZXQgZnJvbSA9IHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKClcbiAgICAgIGxldCB0byA9IHRleHRFZGl0b3JTY3JvbGxUb3BcbiAgICAgIGxldCBzdGVwXG5cbiAgICAgIGlmIChpbmRlcGVuZGVudFNjcm9sbCkge1xuICAgICAgICBjb25zdCBtaW5pbWFwRnJvbSA9IHRoaXMubWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuICAgICAgICBjb25zdCBtaW5pbWFwVG8gPSBNYXRoLm1pbigxLCBzY3JvbGxUb3AgLyAodGhpcy5taW5pbWFwLmdldFRleHRFZGl0b3JNYXhTY3JvbGxUb3AoKSB8fCAxKSkgKiB0aGlzLm1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKClcblxuICAgICAgICBzdGVwID0gKG5vdywgdCkgPT4ge1xuICAgICAgICAgIHRoaXMubWluaW1hcC5zZXRUZXh0RWRpdG9yU2Nyb2xsVG9wKG5vdywgdHJ1ZSlcbiAgICAgICAgICB0aGlzLm1pbmltYXAuc2V0U2Nyb2xsVG9wKG1pbmltYXBGcm9tICsgKG1pbmltYXBUbyAtIG1pbmltYXBGcm9tKSAqIHQpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlKHtmcm9tOiBmcm9tLCB0bzogdG8sIGR1cmF0aW9uOiBkdXJhdGlvbiwgc3RlcDogc3RlcH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGVwID0gKG5vdykgPT4gdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3Aobm93KVxuICAgICAgICB0aGlzLmFuaW1hdGUoe2Zyb206IGZyb20sIHRvOiB0bywgZHVyYXRpb246IGR1cmF0aW9uLCBzdGVwOiBzdGVwfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5taW5pbWFwLnNldFRleHRFZGl0b3JTY3JvbGxUb3AodGV4dEVkaXRvclNjcm9sbFRvcClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgdHJpZ2dlcmVkIHdoZW4gdGhlIG1vdXNlIG1pZGRsZSBidXR0b24gaXMgcHJlc3NlZCBvbiB0aGVcbiAgICogTWluaW1hcEVsZW1lbnQgY2FudmFzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQHBhcmFtICB7bnVtYmVyfSBlLnBhZ2VZIHRoZSBtb3VzZSB5IHBvc2l0aW9uIGluIHBhZ2VcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjYW52YXNNaWRkbGVNb3VzZVByZXNzZWQgKHkpIHtcbiAgICBsZXQge3RvcDogb2Zmc2V0VG9wfSA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBsZXQgZGVsdGFZID0geSAtIG9mZnNldFRvcCAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkgLyAyXG5cbiAgICBsZXQgcmF0aW8gPSBkZWx0YVkgLyAodGhpcy5taW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpXG5cbiAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChyYXRpbyAqIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKCkpXG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCByZWxheXMgdGhlIGBtb3VzZXdoZWVsYCBldmVudHMgcmVjZWl2ZWQgYnkgdGhlIE1pbmltYXBFbGVtZW50XG4gICAqIHRvIHRoZSBgVGV4dEVkaXRvckVsZW1lbnRgLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBlIHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZWxheU1vdXNld2hlZWxFdmVudCAoZSkge1xuICAgIGlmICh0aGlzLm1pbmltYXAuc2Nyb2xsSW5kZXBlbmRlbnRseU9uTW91c2VXaGVlbCgpKSB7XG4gICAgICB0aGlzLm1pbmltYXAub25Nb3VzZVdoZWVsKGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5jb21wb25lbnQub25Nb3VzZVdoZWVsKGUpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgZXh0cmFjdHMgZGF0YSBmcm9tIGEgYE1vdXNlRXZlbnRgIHdoaWNoIGNhbiB0aGVuIGJlIHVzZWQgdG9cbiAgICogcHJvY2VzcyBjbGlja3MgYW5kIGRyYWdzIG9mIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBVc2VkIHRvZ2V0aGVyIHdpdGggYGV4dHJhY3RUb3VjaEV2ZW50RGF0YWAgdG8gcHJvdmlkZSBhIHVuaWZpZWQgaW50ZXJmYWNlXG4gICAqIGZvciBgTW91c2VFdmVudGBzIGFuZCBgVG91Y2hFdmVudGBzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNb3VzZUV2ZW50fSBtb3VzZUV2ZW50IHRoZSBtb3VzZSBldmVudCBvYmplY3RcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBleHRyYWN0TW91c2VFdmVudERhdGEgKG1vdXNlRXZlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogbW91c2VFdmVudC5wYWdlWCxcbiAgICAgIHk6IG1vdXNlRXZlbnQucGFnZVksXG4gICAgICBpc0xlZnRNb3VzZTogbW91c2VFdmVudC53aGljaCA9PT0gMSxcbiAgICAgIGlzTWlkZGxlTW91c2U6IG1vdXNlRXZlbnQud2hpY2ggPT09IDJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBleHRyYWN0cyBkYXRhIGZyb20gYSBgVG91Y2hFdmVudGAgd2hpY2ggY2FuIHRoZW4gYmUgdXNlZCB0b1xuICAgKiBwcm9jZXNzIGNsaWNrcyBhbmQgZHJhZ3Mgb2YgdGhlIG1pbmltYXAuXG4gICAqXG4gICAqIFVzZWQgdG9nZXRoZXIgd2l0aCBgZXh0cmFjdE1vdXNlRXZlbnREYXRhYCB0byBwcm92aWRlIGEgdW5pZmllZCBpbnRlcmZhY2VcbiAgICogZm9yIGBNb3VzZUV2ZW50YHMgYW5kIGBUb3VjaEV2ZW50YHMuXG4gICAqXG4gICAqIEBwYXJhbSAge1RvdWNoRXZlbnR9IHRvdWNoRXZlbnQgdGhlIHRvdWNoIGV2ZW50IG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGV4dHJhY3RUb3VjaEV2ZW50RGF0YSAodG91Y2hFdmVudCkge1xuICAgIC8vIFVzZSB0aGUgZmlyc3QgdG91Y2ggb24gdGhlIHRhcmdldCBhcmVhLiBPdGhlciB0b3VjaGVzIHdpbGwgYmUgaWdub3JlZCBpblxuICAgIC8vIGNhc2Ugb2YgbXVsdGktdG91Y2guXG4gICAgbGV0IHRvdWNoID0gdG91Y2hFdmVudC5jaGFuZ2VkVG91Y2hlc1swXVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRvdWNoLnBhZ2VYLFxuICAgICAgeTogdG91Y2gucGFnZVksXG4gICAgICBpc0xlZnRNb3VzZTogdHJ1ZSwgLy8gVG91Y2ggaXMgdHJlYXRlZCBsaWtlIGEgbGVmdCBtb3VzZSBidXR0b24gY2xpY2tcbiAgICAgIGlzTWlkZGxlTW91c2U6IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZXMgdG8gYSBtZWRpYSBxdWVyeSBmb3IgZGV2aWNlIHBpeGVsIHJhdGlvIGNoYW5nZXMgYW5kIGZvcmNlc1xuICAgKiBhIHJlcGFpbnQgd2hlbiBpdCBvY2N1cnMuXG4gICAqXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byByZW1vdmUgdGhlIG1lZGlhIHF1ZXJ5IGxpc3RlbmVyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgc3Vic2NyaWJlVG9NZWRpYVF1ZXJ5ICgpIHtcbiAgICBjb25zdCBxdWVyeSA9ICdzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDEuNSknXG4gICAgY29uc3QgbWVkaWFRdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KVxuICAgIGNvbnN0IG1lZGlhTGlzdGVuZXIgPSAoZSkgPT4geyB0aGlzLnJlcXVlc3RGb3JjZWRVcGRhdGUoKSB9XG4gICAgbWVkaWFRdWVyeS5hZGRMaXN0ZW5lcihtZWRpYUxpc3RlbmVyKVxuXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIG1lZGlhUXVlcnkucmVtb3ZlTGlzdGVuZXIobWVkaWFMaXN0ZW5lcilcbiAgICB9KVxuICB9XG5cbiAgLy8gICAgIyMjIyMjIyMgICAgIyMjIyAgICAjIyMjIyMjI1xuICAvLyAgICAjIyAgICAgIyMgICMjICAjIyAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAjIyMjICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICMjIyMgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICMjICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAjIyAgICMjICAgICAjI1xuICAvLyAgICAjIyMjIyMjIyAgICMjIyMgICMjICMjIyMjIyMjXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRyaWdnZXJlZCB3aGVuIHRoZSBtb3VzZSBpcyBwcmVzc2VkIG92ZXIgdGhlIHZpc2libGUgYXJlYSB0aGF0XG4gICAqIHN0YXJ0cyB0aGUgZHJhZ2dpbmcgZ2VzdHVyZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnREcmFnICh7eSwgaXNMZWZ0TW91c2UsIGlzTWlkZGxlTW91c2V9KSB7XG4gICAgaWYgKCF0aGlzLm1pbmltYXApIHsgcmV0dXJuIH1cbiAgICBpZiAoIWlzTGVmdE1vdXNlICYmICFpc01pZGRsZU1vdXNlKSB7IHJldHVybiB9XG5cbiAgICBsZXQge3RvcH0gPSB0aGlzLnZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGV0IHt0b3A6IG9mZnNldFRvcH0gPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICBsZXQgZHJhZ09mZnNldCA9IHkgLSB0b3BcblxuICAgIGxldCBpbml0aWFsID0ge2RyYWdPZmZzZXQsIG9mZnNldFRvcH1cblxuICAgIGxldCBtb3VzZW1vdmVIYW5kbGVyID0gKGUpID0+IHRoaXMuZHJhZyh0aGlzLmV4dHJhY3RNb3VzZUV2ZW50RGF0YShlKSwgaW5pdGlhbClcbiAgICBsZXQgbW91c2V1cEhhbmRsZXIgPSAoZSkgPT4gdGhpcy5lbmREcmFnKClcblxuICAgIGxldCB0b3VjaG1vdmVIYW5kbGVyID0gKGUpID0+IHRoaXMuZHJhZyh0aGlzLmV4dHJhY3RUb3VjaEV2ZW50RGF0YShlKSwgaW5pdGlhbClcbiAgICBsZXQgdG91Y2hlbmRIYW5kbGVyID0gKGUpID0+IHRoaXMuZW5kRHJhZygpXG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlbW92ZUhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2V1cEhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgbW91c2V1cEhhbmRsZXIpXG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRvdWNobW92ZUhhbmRsZXIpXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRvdWNoZW5kSGFuZGxlcilcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdG91Y2hlbmRIYW5kbGVyKVxuXG4gICAgdGhpcy5kcmFnU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24gKCkge1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZW1vdmVIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2V1cEhhbmRsZXIpXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBtb3VzZXVwSGFuZGxlcilcblxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0b3VjaG1vdmVIYW5kbGVyKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRvdWNoZW5kSGFuZGxlcilcbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0b3VjaGVuZEhhbmRsZXIpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWV0aG9kIGNhbGxlZCBkdXJpbmcgdGhlIGRyYWcgZ2VzdHVyZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSB5IHRoZSB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0gIHtib29sZWFufSBpc0xlZnRNb3VzZSB3YXMgdGhlIGxlZnQgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge2Jvb2xlYW59IGlzTWlkZGxlTW91c2Ugd2FzIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uIHByZXNzZWQ/XG4gICAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbC5kcmFnT2Zmc2V0IHRoZSBtb3VzZSBvZmZzZXQgd2l0aGluIHRoZSB2aXNpYmxlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWFcbiAgICogQHBhcmFtICB7bnVtYmVyfSBpbml0aWFsLm9mZnNldFRvcCB0aGUgTWluaW1hcEVsZW1lbnQgb2Zmc2V0IGF0IHRoZSBtb21lbnRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiB0aGUgZHJhZyBzdGFydFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYWcgKHt5LCBpc0xlZnRNb3VzZSwgaXNNaWRkbGVNb3VzZX0sIGluaXRpYWwpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIGlmICghaXNMZWZ0TW91c2UgJiYgIWlzTWlkZGxlTW91c2UpIHsgcmV0dXJuIH1cbiAgICBsZXQgZGVsdGFZID0geSAtIGluaXRpYWwub2Zmc2V0VG9wIC0gaW5pdGlhbC5kcmFnT2Zmc2V0XG5cbiAgICBsZXQgcmF0aW8gPSBkZWx0YVkgLyAodGhpcy5taW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSAtIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpXG5cbiAgICB0aGlzLm1pbmltYXAuc2V0VGV4dEVkaXRvclNjcm9sbFRvcChyYXRpbyAqIHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKCkpXG4gIH1cblxuICAvKipcbiAgICogVGhlIG1ldGhvZCB0aGF0IGVuZHMgdGhlIGRyYWcgZ2VzdHVyZS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBlbmREcmFnICgpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIHRoaXMuZHJhZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgfVxuXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMgICAgICAgICMjIyMjIyAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAgICAgICAjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIHBhc3NlZC1pbiBzdHlsZXMgcHJvcGVydGllcyB0byB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhlIGVsZW1lbnQgb250byB3aGljaCBhcHBseSB0aGUgc3R5bGVzXG4gICAqIEBwYXJhbSAge09iamVjdH0gc3R5bGVzIHRoZSBzdHlsZXMgdG8gYXBwbHlcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhcHBseVN0eWxlcyAoZWxlbWVudCwgc3R5bGVzKSB7XG4gICAgaWYgKCFlbGVtZW50KSB7IHJldHVybiB9XG5cbiAgICBsZXQgY3NzVGV4dCA9ICcnXG4gICAgZm9yIChsZXQgcHJvcGVydHkgaW4gc3R5bGVzKSB7XG4gICAgICBjc3NUZXh0ICs9IGAke3Byb3BlcnR5fTogJHtzdHlsZXNbcHJvcGVydHldfTsgYFxuICAgIH1cblxuICAgIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHdpdGggYSBDU1MgdHJhbnNsYXRpb24gdHJhbmZvcm0gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3ggPSAwXSB0aGUgeCBvZmZzZXQgb2YgdGhlIHRyYW5zbGF0aW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3kgPSAwXSB0aGUgeSBvZmZzZXQgb2YgdGhlIHRyYW5zbGF0aW9uXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyB0cmFuc2xhdGlvbiBzdHJpbmdcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBtYWtlVHJhbnNsYXRlICh4ID0gMCwgeSA9IDApIHtcbiAgICBpZiAodGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgcmV0dXJuIGB0cmFuc2xhdGUzZCgke3h9cHgsICR7eX1weCwgMClgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7eH1weCwgJHt5fXB4KWBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyB3aXRoIGEgQ1NTIHNjYWxpbmcgdHJhbmZvcm0gdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3ggPSAwXSB0aGUgeCBzY2FsaW5nIGZhY3RvclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFt5ID0gMF0gdGhlIHkgc2NhbGluZyBmYWN0b3JcbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgQ1NTIHNjYWxpbmcgc3RyaW5nXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgbWFrZVNjYWxlICh4ID0gMCwgeSA9IHgpIHtcbiAgICBpZiAodGhpcy51c2VIYXJkd2FyZUFjY2VsZXJhdGlvbikge1xuICAgICAgcmV0dXJuIGBzY2FsZTNkKCR7eH0sICR7eX0sIDEpYFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYHNjYWxlKCR7eH0sICR7eX0pYFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IHJldHVybiB0aGUgY3VycmVudCB0aW1lIGFzIGEgRGF0ZS5cbiAgICpcbiAgICogVGhhdCBtZXRob2QgZXhpc3Qgc28gdGhhdCB3ZSBjYW4gbW9jayBpdCBpbiB0ZXN0cy5cbiAgICpcbiAgICogQHJldHVybiB7RGF0ZX0gdGhlIGN1cnJlbnQgdGltZSBhcyBEYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0VGltZSAoKSB7IHJldHVybiBuZXcgRGF0ZSgpIH1cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBtaW1pYyB0aGUgalF1ZXJ5IGBhbmltYXRlYCBtZXRob2QgYW5kIHVzZWQgdG8gYW5pbWF0ZSB0aGVcbiAgICogc2Nyb2xsIHdoZW4gY2xpY2tpbmcgb24gdGhlIE1pbmltYXBFbGVtZW50IGNhbnZhcy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBwYXJhbSB0aGUgYW5pbWF0aW9uIGRhdGEgb2JqZWN0XG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uZnJvbSB0aGUgc3RhcnQgdmFsdWVcbiAgICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbS50byB0aGUgZW5kIHZhbHVlXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0uZHVyYXRpb24gdGhlIGFuaW1hdGlvbiBkdXJhdGlvblxuICAgKiBAcGFyYW0gIHtbdHlwZV19IHBhcmFtLnN0ZXAgdGhlIGVhc2luZyBmdW5jdGlvbiBmb3IgdGhlIGFuaW1hdGlvblxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGFuaW1hdGUgKHtmcm9tLCB0bywgZHVyYXRpb24sIHN0ZXB9KSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmdldFRpbWUoKVxuICAgIGxldCBwcm9ncmVzc1xuXG4gICAgY29uc3Qgc3dpbmcgPSBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgIHJldHVybiAwLjUgLSBNYXRoLmNvcyhwcm9ncmVzcyAqIE1hdGguUEkpIC8gMlxuICAgIH1cblxuICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5taW5pbWFwKSB7IHJldHVybiB9XG5cbiAgICAgIGNvbnN0IHBhc3NlZCA9IHRoaXMuZ2V0VGltZSgpIC0gc3RhcnRcbiAgICAgIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgICAgICBwcm9ncmVzcyA9IDFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2dyZXNzID0gcGFzc2VkIC8gZHVyYXRpb25cbiAgICAgIH1cbiAgICAgIGlmIChwcm9ncmVzcyA+IDEpIHsgcHJvZ3Jlc3MgPSAxIH1cbiAgICAgIGNvbnN0IGRlbHRhID0gc3dpbmcocHJvZ3Jlc3MpXG4gICAgICBjb25zdCB2YWx1ZSA9IGZyb20gKyAodG8gLSBmcm9tKSAqIGRlbHRhXG4gICAgICBzdGVwKHZhbHVlLCBkZWx0YSlcblxuICAgICAgaWYgKHByb2dyZXNzIDwgMSkgeyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKSB9XG4gICAgfVxuXG4gICAgdXBkYXRlKClcbiAgfVxufVxuIl19
//# sourceURL=/home/key/.atom/packages/minimap/lib/minimap-element.js
