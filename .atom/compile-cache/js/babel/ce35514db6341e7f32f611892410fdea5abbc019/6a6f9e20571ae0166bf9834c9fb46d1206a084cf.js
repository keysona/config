Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

var _main = require('../main');

var _main2 = _interopRequireDefault(_main);

var _canvasLayer = require('../canvas-layer');

var _canvasLayer2 = _interopRequireDefault(_canvasLayer);

/**
 * The `CanvasDrawer` mixin is responsible for the rendering of a `Minimap`
 * in a `canvas` element.
 *
 * This mixin is injected in the `MinimapElement` prototype, so all these
 * methods  are available on any `MinimapElement` instance.
 */
'use babel';

var CanvasDrawer = (function (_Mixin) {
  _inherits(CanvasDrawer, _Mixin);

  function CanvasDrawer() {
    _classCallCheck(this, CanvasDrawer);

    _get(Object.getPrototypeOf(CanvasDrawer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CanvasDrawer, [{
    key: 'initializeCanvas',

    /**
     * Initializes the canvas elements needed to perform the `Minimap` rendering.
     */
    value: function initializeCanvas() {
      /**
      * The main canvas layer where lines are rendered.
      * @type {CanvasLayer}
      */
      this.tokensLayer = new _canvasLayer2['default']();
      /**
      * The canvas layer for decorations below the text.
      * @type {CanvasLayer}
      */
      this.backLayer = new _canvasLayer2['default']();
      /**
      * The canvas layer for decorations above the text.
      * @type {CanvasLayer}
      */
      this.frontLayer = new _canvasLayer2['default']();

      if (!this.pendingChanges) {
        /**
         * Stores the changes from the text editor.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingChanges = [];
      }

      if (!this.pendingBackDecorationChanges) {
        /**
         * Stores the changes from the minimap back decorations.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingBackDecorationChanges = [];
      }

      if (!this.pendingFrontDecorationChanges) {
        /**
         * Stores the changes from the minimap front decorations.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingFrontDecorationChanges = [];
      }
    }

    /**
     * Returns the uppermost canvas in the MinimapElement.
     *
     * @return {HTMLCanvasElement} the html canvas element
     */
  }, {
    key: 'getFrontCanvas',
    value: function getFrontCanvas() {
      return this.frontLayer.canvas;
    }

    /**
     * Attaches the canvases into the specified container.
     *
     * @param  {HTMLElement} parent the canvases' container
     * @access private
     */
  }, {
    key: 'attachCanvases',
    value: function attachCanvases(parent) {
      this.backLayer.attach(parent);
      this.tokensLayer.attach(parent);
      this.frontLayer.attach(parent);
    }

    /**
     * Changes the size of all the canvas layers at once.
     *
     * @param {number} width the new width for the three canvases
     * @param {number} height the new height for the three canvases
     * @access private
     */
  }, {
    key: 'setCanvasesSize',
    value: function setCanvasesSize(width, height) {
      this.backLayer.setSize(width, height);
      this.tokensLayer.setSize(width, height);
      this.frontLayer.setSize(width, height);
    }

    /**
     * Performs an update of the rendered `Minimap` based on the changes
     * registered in the instance.
     */
  }, {
    key: 'updateCanvas',
    value: function updateCanvas() {
      var firstRow = this.minimap.getFirstVisibleScreenRow();
      var lastRow = this.minimap.getLastVisibleScreenRow();

      this.updateTokensLayer(firstRow, lastRow);
      this.updateBackDecorationsLayer(firstRow, lastRow);
      this.updateFrontDecorationsLayer(firstRow, lastRow);

      this.pendingChanges = [];
      this.pendingBackDecorationChanges = [];
      this.pendingFrontDecorationChanges = [];

      /**
       * The first row in the last render of the offscreen canvas.
       * @type {number}
       * @access private
       */
      this.offscreenFirstRow = firstRow;
      /**
       * The last row in the last render of the offscreen canvas.
       * @type {number}
       * @access private
       */
      this.offscreenLastRow = lastRow;
    }

    /**
     * Performs an update of the tokens layer using the pending changes array.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateTokensLayer',
    value: function updateTokensLayer(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingChanges);

      this.redrawRangesOnLayer(this.tokensLayer, intactRanges, firstRow, lastRow, this.drawLines);
    }

    /**
     * Performs an update of the back decorations layer using the pending back
     * decorations changes arrays.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateBackDecorationsLayer',
    value: function updateBackDecorationsLayer(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingBackDecorationChanges);

      this.redrawRangesOnLayer(this.backLayer, intactRanges, firstRow, lastRow, this.drawBackDecorationsForLines);
    }

    /**
     * Performs an update of the front decorations layer using the pending front
     * decorations changes arrays.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateFrontDecorationsLayer',
    value: function updateFrontDecorationsLayer(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingFrontDecorationChanges);

      this.redrawRangesOnLayer(this.frontLayer, intactRanges, firstRow, lastRow, this.drawFrontDecorationsForLines);
    }

    //     ######   #######  ##        #######  ########   ######
    //    ##    ## ##     ## ##       ##     ## ##     ## ##    ##
    //    ##       ##     ## ##       ##     ## ##     ## ##
    //    ##       ##     ## ##       ##     ## ########   ######
    //    ##       ##     ## ##       ##     ## ##   ##         ##
    //    ##    ## ##     ## ##       ##     ## ##    ##  ##    ##
    //     ######   #######  ########  #######  ##     ##  ######

    /**
     * Returns the opacity value to use when rendering the `Minimap` text.
     *
     * @return {Number} the text opacity value
     */
  }, {
    key: 'getTextOpacity',
    value: function getTextOpacity() {
      return this.textOpacity;
    }

    /**
     * Returns the default text color for an editor content.
     *
     * The color value is directly read from the `TextEditorView` computed styles.
     *
     * @return {string} a CSS color
     */
  }, {
    key: 'getDefaultColor',
    value: function getDefaultColor() {
      var color = this.retrieveStyleFromDom(['.editor'], 'color', false, true);
      return this.transparentize(color, this.getTextOpacity());
    }

    /**
     * Returns the text color for the passed-in `token` object.
     *
     * The color value is read from the DOM by creating a node structure that
     * match the token `scope` property.
     *
     * @param  {Object} token a `TextEditor` token
     * @return {string} the CSS color for the provided token
     */
  }, {
    key: 'getTokenColor',
    value: function getTokenColor(token) {
      var scopes = token.scopeDescriptor || token.scopes;
      var color = this.retrieveStyleFromDom(scopes, 'color');

      return this.transparentize(color, this.getTextOpacity());
    }

    /**
     * Returns the background color for the passed-in `decoration` object.
     *
     * The color value is read from the DOM by creating a node structure that
     * match the decoration `scope` property unless the decoration provides
     * its own `color` property.
     *
     * @param  {Decoration} decoration the decoration to get the color for
     * @return {string} the CSS color for the provided decoration
     */
  }, {
    key: 'getDecorationColor',
    value: function getDecorationColor(decoration) {
      var properties = decoration.getProperties();
      if (properties.color) {
        return properties.color;
      }

      if (properties.scope) {
        var scopeString = properties.scope.split(/\s+/);
        return this.retrieveStyleFromDom(scopeString, 'background-color', false);
      } else {
        return this.getDefaultColor();
      }
    }

    /**
     * Converts a `rgb(...)` color into a `rgba(...)` color with the specified
     * opacity.
     *
     * @param  {string} color the CSS RGB color to transparentize
     * @param  {number} [opacity=1] the opacity amount
     * @return {string} the transparentized CSS color
     * @access private
     */
  }, {
    key: 'transparentize',
    value: function transparentize(color) {
      var opacity = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      return color.replace('rgb(', 'rgba(').replace(')', ', ' + opacity + ')');
    }

    //    ########  ########     ###    ##      ##
    //    ##     ## ##     ##   ## ##   ##  ##  ##
    //    ##     ## ##     ##  ##   ##  ##  ##  ##
    //    ##     ## ########  ##     ## ##  ##  ##
    //    ##     ## ##   ##   ######### ##  ##  ##
    //    ##     ## ##    ##  ##     ## ##  ##  ##
    //    ########  ##     ## ##     ##  ###  ###

    /**
     * Routine used to render changes in specific ranges for one layer.
     *
     * @param  {CanvasLayer} layer the layer to redraw
     * @param  {Array<Object>} intactRanges an array of the ranges to leave intact
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @param  {Function} method the render method to use for the lines drawing
     * @access private
     */
  }, {
    key: 'redrawRangesOnLayer',
    value: function redrawRangesOnLayer(layer, intactRanges, firstRow, lastRow, method) {
      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;

      layer.clearCanvas();

      if (intactRanges.length === 0) {
        method.call(this, firstRow, lastRow, 0);
      } else {
        for (var j = 0, len = intactRanges.length; j < len; j++) {
          var intact = intactRanges[j];

          layer.copyPartFromOffscreen(intact.offscreenRow * lineHeight, (intact.start - firstRow) * lineHeight, (intact.end - intact.start) * lineHeight);
        }
        this.drawLinesForRanges(method, intactRanges, firstRow, lastRow);
      }

      layer.resetOffscreenSize();
      layer.copyToOffscreen();
    }

    /**
     * Renders the lines between the intact ranges when an update has pending
     * changes.
     *
     * @param  {Function} method the render method to use for the lines drawing
     * @param  {Array<Object>} intactRanges the intact ranges in the minimap
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @access private
     */
  }, {
    key: 'drawLinesForRanges',
    value: function drawLinesForRanges(method, ranges, firstRow, lastRow) {
      var currentRow = firstRow;
      for (var i = 0, len = ranges.length; i < len; i++) {
        var range = ranges[i];

        method.call(this, currentRow, range.start, currentRow - firstRow);

        currentRow = range.end;
      }
      if (currentRow <= lastRow) {
        method.call(this, currentRow, lastRow, currentRow - firstRow);
      }
    }

    /**
     * Draws back decorations on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawBackDecorationsForLines',
    value: function drawBackDecorationsForLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow);

      var _tokensLayer$getSize = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize.width;
      var canvasHeight = _tokensLayer$getSize.height;

      var renderData = {
        context: this.backLayer.context,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        lineHeight: lineHeight,
        charWidth: charWidth,
        charHeight: charHeight,
        orders: _main2['default'].getPluginsOrder()
      };

      for (var screenRow = firstRow; screenRow <= lastRow; screenRow++) {
        renderData.row = offsetRow + (screenRow - firstRow);
        renderData.yRow = renderData.row * lineHeight;
        renderData.screenRow = screenRow;

        this.drawDecorations(screenRow, decorations, renderData, {
          'line': this.drawLineDecoration,
          'highlight-under': this.drawHighlightDecoration,
          'background-custom': this.drawCustomDecoration
        });
      }

      this.backLayer.context.fill();
    }

    /**
     * Draws front decorations on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawFrontDecorationsForLines',
    value: function drawFrontDecorationsForLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow);

      var _tokensLayer$getSize2 = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize2.width;
      var canvasHeight = _tokensLayer$getSize2.height;

      var renderData = {
        context: this.frontLayer.context,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        lineHeight: lineHeight,
        charWidth: charWidth,
        charHeight: charHeight,
        orders: _main2['default'].getPluginsOrder()
      };

      for (var screenRow = firstRow; screenRow <= lastRow; screenRow++) {
        renderData.row = offsetRow + (screenRow - firstRow);
        renderData.yRow = renderData.row * lineHeight;
        renderData.screenRow = screenRow;

        this.drawDecorations(screenRow, decorations, renderData, {
          'gutter': this.drawGutterDecoration,
          'highlight-over': this.drawHighlightDecoration,
          'highlight-outline': this.drawHighlightOutlineDecoration,
          'foreground-custom': this.drawCustomDecoration
        });
      }

      renderData.context.fill();
    }

    /**
     * Returns an array of tokens by line.
     *
     * @param  {number} startRow The start row
     * @param  {number} endRow The end row
     * @return {Array<Array>} An array of tokens by line
     * @access private
     */
  }, {
    key: 'tokenLinesForScreenRows',
    value: function tokenLinesForScreenRows(startRow, endRow) {
      var _this = this;

      var editor = this.getTextEditor();
      var tokenLines = [];
      if (typeof editor.tokenizedLinesForScreenRows === 'function') {
        for (var tokenizedLine of editor.tokenizedLinesForScreenRows(startRow, endRow)) {
          if (tokenizedLine) {
            (function () {
              var invisibleRegExp = _this.getInvisibleRegExpForLine(tokenizedLine);
              tokenLines.push(tokenizedLine.tokens.map(function (token) {
                return {
                  value: token.value.replace(invisibleRegExp, ' '),
                  scopes: token.scopes.slice()
                };
              }));
            })();
          } else {
            return {
              value: '',
              scopes: []
            };
          }
        }
      } else {
        var displayLayer = editor.displayLayer;
        var invisibleRegExp = this.getInvisibleRegExp();
        var screenLines = displayLayer.getScreenLines(startRow, endRow);
        for (var _ref2 of screenLines) {
          var lineText = _ref2.lineText;
          var tagCodes = _ref2.tagCodes;

          var tokens = [];
          var scopes = [];
          var textIndex = 0;
          // console.log(lineText, invisibleRegExp, lineText.replace(invisibleRegExp, ' '))
          for (var tagCode of tagCodes) {
            if (displayLayer.isOpenTagCode(tagCode)) {
              scopes.push(displayLayer.tagForCode(tagCode));
            } else if (displayLayer.isCloseTagCode(tagCode)) {
              scopes.pop();
            } else {
              tokens.push({
                value: lineText.substr(textIndex, tagCode).replace(invisibleRegExp, ' '),
                scopes: scopes.slice()
              });
              textIndex += tagCode;
            }
          }

          tokenLines.push(tokens);
        }
      }
      return tokenLines;
    }

    /**
     * Draws lines on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawLines',
    value: function drawLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var displayCodeHighlights = this.displayCodeHighlights;
      var context = this.tokensLayer.context;

      var _tokensLayer$getSize3 = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize3.width;

      if (typeof this.tokenLinesForScreenRows != 'function') {
        console.error('tokenLinesForScreenRows should be a function but it was ' + typeof this.tokenLinesForScreenRows, this.tokenLinesForScreenRows);

        return;
      }

      var screenRowsTokens = this.tokenLinesForScreenRows(firstRow, lastRow);

      var y = offsetRow * lineHeight;
      for (var i = 0; i < screenRowsTokens.length; i++) {
        var tokens = screenRowsTokens[i];
        var x = 0;
        context.clearRect(x, y, canvasWidth, lineHeight);
        for (var j = 0; j < tokens.length; j++) {
          var token = tokens[j];
          if (/^\s+$/.test(token.value)) {
            x += token.value.length * charWidth;
          } else {
            var color = displayCodeHighlights ? this.getTokenColor(token) : this.getDefaultColor();
            x = this.drawToken(context, token.value, color, x, y, charWidth, charHeight);
          }
          if (x > canvasWidth) {
            break;
          }
        }

        y += lineHeight;
      }

      context.fill();
    }

    /**
     * Returns the regexp to replace invisibles substitution characters
     * in editor lines.
     *
     * @return {RegExp} the regular expression to match invisible characters
     * @access private
     */
  }, {
    key: 'getInvisibleRegExp',
    value: function getInvisibleRegExp() {
      var invisibles = this.getTextEditor().getInvisibles();
      var regexp = [];
      if (invisibles.cr != null) {
        regexp.push(invisibles.cr);
      }
      if (invisibles.eol != null) {
        regexp.push(invisibles.eol);
      }
      if (invisibles.space != null) {
        regexp.push(invisibles.space);
      }
      if (invisibles.tab != null) {
        regexp.push(invisibles.tab);
      }

      return RegExp(regexp.filter(function (s) {
        return typeof s === 'string';
      }).map(_underscorePlus2['default'].escapeRegExp).join('|'), 'g');
    }

    /**
     * Returns the regexp to replace invisibles substitution characters
     * in editor lines.
     *
     * @param  {Object} line the tokenized line
     * @return {RegExp} the regular expression to match invisible characters
     * @deprecated Is used only to support Atom version before display layer API
     * @access private
     */
  }, {
    key: 'getInvisibleRegExpForLine',
    value: function getInvisibleRegExpForLine(line) {
      if (line != null && line.invisibles != null) {
        var invisibles = [];
        if (line.invisibles.cr != null) {
          invisibles.push(line.invisibles.cr);
        }
        if (line.invisibles.eol != null) {
          invisibles.push(line.invisibles.eol);
        }
        if (line.invisibles.space != null) {
          invisibles.push(line.invisibles.space);
        }
        if (line.invisibles.tab != null) {
          invisibles.push(line.invisibles.tab);
        }

        return RegExp(invisibles.filter(function (s) {
          return typeof s === 'string';
        }).map(_underscorePlus2['default'].escapeRegExp).join('|'), 'g');
      }
    }

    /**
     * Draws a single token on the given context.
     *
     * @param  {CanvasRenderingContext2D} context the target canvas context
     * @param  {string} text the token's text content
     * @param  {string} color the token's CSS color
     * @param  {number} x the x position of the token in the line
     * @param  {number} y the y position of the line in the minimap
     * @param  {number} charWidth the width of a character in the minimap
     * @param  {number} charHeight the height of a character in the minimap
     * @return {number} the x position at the end of the token
     * @access private
     */
  }, {
    key: 'drawToken',
    value: function drawToken(context, text, color, x, y, charWidth, charHeight) {
      context.fillStyle = color;

      if (this.ignoreWhitespacesInTokens) {
        var _length = text.length * charWidth;
        context.fillRect(x, y, _length, charHeight);

        return x + _length;
      } else {
        var chars = 0;
        for (var j = 0, len = text.length; j < len; j++) {
          var char = text[j];
          if (/\s/.test(char)) {
            if (chars > 0) {
              context.fillRect(x - chars * charWidth, y, chars * charWidth, charHeight);
            }
            chars = 0;
          } else {
            chars++;
          }
          x += charWidth;
        }
        if (chars > 0) {
          context.fillRect(x - chars * charWidth, y, chars * charWidth, charHeight);
        }
        return x;
      }
    }

    /**
     * Draws the specified decorations for the current `screenRow`.
     *
     * The `decorations` object contains all the decorations grouped by type and
     * then rows.
     *
     * @param  {number} screenRow the screen row index for which
     *                            render decorations
     * @param  {Object} decorations the object containing all the decorations
     * @param  {Object} renderData the object containing the render data
     * @param  {Object} types an object with the type to render as key and the
     *                        render method as value
     * @access private
     */
  }, {
    key: 'drawDecorations',
    value: function drawDecorations(screenRow, decorations, renderData, types) {
      var decorationsToRender = [];

      renderData.context.clearRect(0, renderData.yRow, renderData.canvasWidth, renderData.lineHeight);

      for (var i in types) {
        decorationsToRender = decorationsToRender.concat(decorations[i] != null ? decorations[i][screenRow] || [] : []);
      }

      decorationsToRender.sort(function (a, b) {
        return (renderData.orders[a.properties.plugin] || 0) - (renderData.orders[b.properties.plugin] || 0);
      });

      if (decorationsToRender != null ? decorationsToRender.length : void 0) {
        for (var i = 0, len = decorationsToRender.length; i < len; i++) {
          types[decorationsToRender[i].properties.type].call(this, decorationsToRender[i], renderData);
        }
      }
    }

    /**
     * Draws a line decoration.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawLineDecoration',
    value: function drawLineDecoration(decoration, data) {
      data.context.fillStyle = this.getDecorationColor(decoration);
      data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight);
    }

    /**
     * Draws a gutter decoration.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawGutterDecoration',
    value: function drawGutterDecoration(decoration, data) {
      data.context.fillStyle = this.getDecorationColor(decoration);
      data.context.fillRect(0, data.yRow, 1, data.lineHeight);
    }

    /**
     * Draws a highlight decoration.
     *
     * It renders only the part of the highlight corresponding to the specified
     * row.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawHighlightDecoration',
    value: function drawHighlightDecoration(decoration, data) {
      var range = decoration.getMarker().getScreenRange();
      var rowSpan = range.end.row - range.start.row;

      data.context.fillStyle = this.getDecorationColor(decoration);

      if (rowSpan === 0) {
        var colSpan = range.end.column - range.start.column;
        data.context.fillRect(range.start.column * data.charWidth, data.yRow, colSpan * data.charWidth, data.lineHeight);
      } else if (data.screenRow === range.start.row) {
        var x = range.start.column * data.charWidth;
        data.context.fillRect(x, data.yRow, data.canvasWidth - x, data.lineHeight);
      } else if (data.screenRow === range.end.row) {
        data.context.fillRect(0, data.yRow, range.end.column * data.charWidth, data.lineHeight);
      } else {
        data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight);
      }
    }

    /**
     * Draws a highlight outline decoration.
     *
     * It renders only the part of the highlight corresponding to the specified
     * row.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawHighlightOutlineDecoration',
    value: function drawHighlightOutlineDecoration(decoration, data) {
      var bottomWidth = undefined,
          colSpan = undefined,
          width = undefined,
          xBottomStart = undefined,
          xEnd = undefined,
          xStart = undefined;
      var lineHeight = data.lineHeight;
      var charWidth = data.charWidth;
      var canvasWidth = data.canvasWidth;
      var screenRow = data.screenRow;

      var range = decoration.getMarker().getScreenRange();
      var rowSpan = range.end.row - range.start.row;
      var yStart = data.yRow;
      var yEnd = yStart + lineHeight;

      data.context.fillStyle = this.getDecorationColor(decoration);

      if (rowSpan === 0) {
        colSpan = range.end.column - range.start.column;
        width = colSpan * charWidth;
        xStart = range.start.column * charWidth;
        xEnd = xStart + width;

        data.context.fillRect(xStart, yStart, width, 1);
        data.context.fillRect(xStart, yEnd, width, 1);
        data.context.fillRect(xStart, yStart, 1, lineHeight);
        data.context.fillRect(xEnd, yStart, 1, lineHeight);
      } else if (rowSpan === 1) {
        xStart = range.start.column * data.charWidth;
        xEnd = range.end.column * data.charWidth;

        if (screenRow === range.start.row) {
          width = data.canvasWidth - xStart;
          xBottomStart = Math.max(xStart, xEnd);
          bottomWidth = data.canvasWidth - xBottomStart;

          data.context.fillRect(xStart, yStart, width, 1);
          data.context.fillRect(xBottomStart, yEnd, bottomWidth, 1);
          data.context.fillRect(xStart, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else {
          width = canvasWidth - xStart;
          bottomWidth = canvasWidth - xEnd;

          data.context.fillRect(0, yStart, xStart, 1);
          data.context.fillRect(0, yEnd, xEnd, 1);
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(xEnd, yStart, 1, lineHeight);
        }
      } else {
        xStart = range.start.column * charWidth;
        xEnd = range.end.column * charWidth;
        if (screenRow === range.start.row) {
          width = canvasWidth - xStart;

          data.context.fillRect(xStart, yStart, width, 1);
          data.context.fillRect(xStart, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else if (screenRow === range.end.row) {
          width = canvasWidth - xStart;

          data.context.fillRect(0, yEnd, xEnd, 1);
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(xEnd, yStart, 1, lineHeight);
        } else {
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
          if (screenRow === range.start.row + 1) {
            data.context.fillRect(0, yStart, xStart, 1);
          }
          if (screenRow === range.end.row - 1) {
            data.context.fillRect(xEnd, yEnd, canvasWidth - xEnd, 1);
          }
        }
      }
    }

    /**
     * Draws a custom decoration.
     *
     * It renders only the part of the highlight corresponding to the specified
     * row.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawCustomDecoration',
    value: function drawCustomDecoration(decoration, data) {
      var renderRoutine = decoration.getProperties().render;

      if (renderRoutine) {
        data.color = this.getDecorationColor(decoration);
        renderRoutine(decoration, data);
      }
    }

    //    ########     ###    ##    ##  ######   ########  ######
    //    ##     ##   ## ##   ###   ## ##    ##  ##       ##    ##
    //    ##     ##  ##   ##  ####  ## ##        ##       ##
    //    ########  ##     ## ## ## ## ##   #### ######    ######
    //    ##   ##   ######### ##  #### ##    ##  ##             ##
    //    ##    ##  ##     ## ##   ### ##    ##  ##       ##    ##
    //    ##     ## ##     ## ##    ##  ######   ########  ######

    /**
     * Computes the ranges that are not affected by the current pending changes.
     *
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @return {Array<Object>} the intact ranges in the rendered region
     * @access private
     */
  }, {
    key: 'computeIntactRanges',
    value: function computeIntactRanges(firstRow, lastRow, changes) {
      if (this.offscreenFirstRow == null && this.offscreenLastRow == null) {
        return [];
      }

      // At first, the whole range is considered intact
      var intactRanges = [{
        start: this.offscreenFirstRow,
        end: this.offscreenLastRow,
        offscreenRow: 0
      }];

      for (var i = 0, len = changes.length; i < len; i++) {
        var change = changes[i];
        var newIntactRanges = [];

        for (var j = 0, intactLen = intactRanges.length; j < intactLen; j++) {
          var range = intactRanges[j];

          if (change.end < range.start && change.screenDelta !== 0) {
            // The change is above of the range and lines are either
            // added or removed
            newIntactRanges.push({
              start: range.start + change.screenDelta,
              end: range.end + change.screenDelta,
              offscreenRow: range.offscreenRow
            });
          } else if (change.end < range.start || change.start > range.end) {
            // The change is outside the range but didn't add
            // or remove lines
            newIntactRanges.push(range);
          } else {
            // The change is within the range, there's one intact range
            // from the range start to the change start
            if (change.start > range.start) {
              newIntactRanges.push({
                start: range.start,
                end: change.start - 1,
                offscreenRow: range.offscreenRow
              });
            }
            if (change.end < range.end) {
              // The change ends within the range
              if (change.bufferDelta !== 0) {
                // Lines are added or removed, the intact range starts in the
                // next line after the change end plus the screen delta
                newIntactRanges.push({
                  start: change.end + change.screenDelta + 1,
                  end: range.end + change.screenDelta,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              } else if (change.screenDelta !== 0) {
                // Lines are added or removed in the display buffer, the intact
                // range starts in the next line after the change end plus the
                // screen delta
                newIntactRanges.push({
                  start: change.end + change.screenDelta + 1,
                  end: range.end + change.screenDelta,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              } else {
                // No lines are added, the intact range starts on the line after
                // the change end
                newIntactRanges.push({
                  start: change.end + 1,
                  end: range.end,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              }
            }
          }
        }
        intactRanges = newIntactRanges;
      }

      return this.truncateIntactRanges(intactRanges, firstRow, lastRow);
    }

    /**
     * Truncates the intact ranges so that they doesn't expand past the visible
     * area of the minimap.
     *
     * @param  {Array<Object>} intactRanges the initial array of ranges
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @return {Array<Object>} the array of truncated ranges
     * @access private
     */
  }, {
    key: 'truncateIntactRanges',
    value: function truncateIntactRanges(intactRanges, firstRow, lastRow) {
      var i = 0;
      while (i < intactRanges.length) {
        var range = intactRanges[i];

        if (range.start < firstRow) {
          range.offscreenRow += firstRow - range.start;
          range.start = firstRow;
        }

        if (range.end > lastRow) {
          range.end = lastRow;
        }

        if (range.start >= range.end) {
          intactRanges.splice(i--, 1);
        }

        i++;
      }

      return intactRanges.sort(function (a, b) {
        return a.offscreenRow - b.offscreenRow;
      });
    }
  }]);

  return CanvasDrawer;
})(_mixto2['default']);

exports['default'] = CanvasDrawer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvY2FudmFzLWRyYXdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs4QkFFYyxpQkFBaUI7Ozs7cUJBQ2IsT0FBTzs7OztvQkFDUixTQUFTOzs7OzJCQUNGLGlCQUFpQjs7Ozs7Ozs7Ozs7QUFMekMsV0FBVyxDQUFBOztJQWNVLFlBQVk7WUFBWixZQUFZOztXQUFaLFlBQVk7MEJBQVosWUFBWTs7K0JBQVosWUFBWTs7O2VBQVosWUFBWTs7Ozs7O1dBSWQsNEJBQUc7Ozs7O0FBS2xCLFVBQUksQ0FBQyxXQUFXLEdBQUcsOEJBQWlCLENBQUE7Ozs7O0FBS3BDLFVBQUksQ0FBQyxTQUFTLEdBQUcsOEJBQWlCLENBQUE7Ozs7O0FBS2xDLFVBQUksQ0FBQyxVQUFVLEdBQUcsOEJBQWlCLENBQUE7O0FBRW5DLFVBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFOzs7Ozs7QUFNeEIsWUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUE7T0FDekI7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsRUFBRTs7Ozs7O0FBTXRDLFlBQUksQ0FBQyw0QkFBNEIsR0FBRyxFQUFFLENBQUE7T0FDdkM7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRTs7Ozs7O0FBTXZDLFlBQUksQ0FBQyw2QkFBNkIsR0FBRyxFQUFFLENBQUE7T0FDeEM7S0FDRjs7Ozs7Ozs7O1dBT2MsMEJBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFBO0tBQUU7Ozs7Ozs7Ozs7V0FRcEMsd0JBQUMsTUFBTSxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzdCLFVBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQy9CLFVBQUksQ0FBQyxVQUFVLENB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QUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxFQUFFO0FBQUUsZUFBSyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUE7U0FBRTs7QUFFaEQsWUFBSSxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUU7QUFBRSxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUFFOztBQUU3RCxTQUFDLEVBQUUsQ0FBQTtPQUNKOztBQUVELGFBQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDakMsZUFBTyxDQUFDLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUE7T0FDdkMsQ0FBQyxDQUFBO0tBQ0g7OztTQXQ0QmtCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6Ii9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvY2FudmFzLWRyYXdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcbmltcG9ydCBNaXhpbiBmcm9tICdtaXh0bydcbmltcG9ydCBNYWluIGZyb20gJy4uL21haW4nXG5pbXBvcnQgQ2FudmFzTGF5ZXIgZnJvbSAnLi4vY2FudmFzLWxheWVyJ1xuXG4vKipcbiAqIFRoZSBgQ2FudmFzRHJhd2VyYCBtaXhpbiBpcyByZXNwb25zaWJsZSBmb3IgdGhlIHJlbmRlcmluZyBvZiBhIGBNaW5pbWFwYFxuICogaW4gYSBgY2FudmFzYCBlbGVtZW50LlxuICpcbiAqIFRoaXMgbWl4aW4gaXMgaW5qZWN0ZWQgaW4gdGhlIGBNaW5pbWFwRWxlbWVudGAgcHJvdG90eXBlLCBzbyBhbGwgdGhlc2VcbiAqIG1ldGhvZHMgIGFyZSBhdmFpbGFibGUgb24gYW55IGBNaW5pbWFwRWxlbWVudGAgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbnZhc0RyYXdlciBleHRlbmRzIE1peGluIHtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBjYW52YXMgZWxlbWVudHMgbmVlZGVkIHRvIHBlcmZvcm0gdGhlIGBNaW5pbWFwYCByZW5kZXJpbmcuXG4gICAqL1xuICBpbml0aWFsaXplQ2FudmFzICgpIHtcbiAgICAvKipcbiAgICAqIFRoZSBtYWluIGNhbnZhcyBsYXllciB3aGVyZSBsaW5lcyBhcmUgcmVuZGVyZWQuXG4gICAgKiBAdHlwZSB7Q2FudmFzTGF5ZXJ9XG4gICAgKi9cbiAgICB0aGlzLnRva2Vuc0xheWVyID0gbmV3IENhbnZhc0xheWVyKClcbiAgICAvKipcbiAgICAqIFRoZSBjYW52YXMgbGF5ZXIgZm9yIGRlY29yYXRpb25zIGJlbG93IHRoZSB0ZXh0LlxuICAgICogQHR5cGUge0NhbnZhc0xheWVyfVxuICAgICovXG4gICAgdGhpcy5iYWNrTGF5ZXIgPSBuZXcgQ2FudmFzTGF5ZXIoKVxuICAgIC8qKlxuICAgICogVGhlIGNhbnZhcyBsYXllciBmb3IgZGVjb3JhdGlvbnMgYWJvdmUgdGhlIHRleHQuXG4gICAgKiBAdHlwZSB7Q2FudmFzTGF5ZXJ9XG4gICAgKi9cbiAgICB0aGlzLmZyb250TGF5ZXIgPSBuZXcgQ2FudmFzTGF5ZXIoKVxuXG4gICAgaWYgKCF0aGlzLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICAvKipcbiAgICAgICAqIFN0b3JlcyB0aGUgY2hhbmdlcyBmcm9tIHRoZSB0ZXh0IGVkaXRvci5cbiAgICAgICAqIEB0eXBlIHtBcnJheTxPYmplY3Q+fVxuICAgICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICAgKi9cbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBbXVxuICAgIH1cblxuICAgIGlmICghdGhpcy5wZW5kaW5nQmFja0RlY29yYXRpb25DaGFuZ2VzKSB7XG4gICAgICAvKipcbiAgICAgICAqIFN0b3JlcyB0aGUgY2hhbmdlcyBmcm9tIHRoZSBtaW5pbWFwIGJhY2sgZGVjb3JhdGlvbnMuXG4gICAgICAgKiBAdHlwZSB7QXJyYXk8T2JqZWN0Pn1cbiAgICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAgICovXG4gICAgICB0aGlzLnBlbmRpbmdCYWNrRGVjb3JhdGlvbkNoYW5nZXMgPSBbXVxuICAgIH1cblxuICAgIGlmICghdGhpcy5wZW5kaW5nRnJvbnREZWNvcmF0aW9uQ2hhbmdlcykge1xuICAgICAgLyoqXG4gICAgICAgKiBTdG9yZXMgdGhlIGNoYW5nZXMgZnJvbSB0aGUgbWluaW1hcCBmcm9udCBkZWNvcmF0aW9ucy5cbiAgICAgICAqIEB0eXBlIHtBcnJheTxPYmplY3Q+fVxuICAgICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICAgKi9cbiAgICAgIHRoaXMucGVuZGluZ0Zyb250RGVjb3JhdGlvbkNoYW5nZXMgPSBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB1cHBlcm1vc3QgY2FudmFzIGluIHRoZSBNaW5pbWFwRWxlbWVudC5cbiAgICpcbiAgICogQHJldHVybiB7SFRNTENhbnZhc0VsZW1lbnR9IHRoZSBodG1sIGNhbnZhcyBlbGVtZW50XG4gICAqL1xuICBnZXRGcm9udENhbnZhcyAoKSB7IHJldHVybiB0aGlzLmZyb250TGF5ZXIuY2FudmFzIH1cblxuICAvKipcbiAgICogQXR0YWNoZXMgdGhlIGNhbnZhc2VzIGludG8gdGhlIHNwZWNpZmllZCBjb250YWluZXIuXG4gICAqXG4gICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBwYXJlbnQgdGhlIGNhbnZhc2VzJyBjb250YWluZXJcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBhdHRhY2hDYW52YXNlcyAocGFyZW50KSB7XG4gICAgdGhpcy5iYWNrTGF5ZXIuYXR0YWNoKHBhcmVudClcbiAgICB0aGlzLnRva2Vuc0xheWVyLmF0dGFjaChwYXJlbnQpXG4gICAgdGhpcy5mcm9udExheWVyLmF0dGFjaChwYXJlbnQpXG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgc2l6ZSBvZiBhbGwgdGhlIGNhbnZhcyBsYXllcnMgYXQgb25jZS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIHRoZSBuZXcgd2lkdGggZm9yIHRoZSB0aHJlZSBjYW52YXNlc1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IHRoZSBuZXcgaGVpZ2h0IGZvciB0aGUgdGhyZWUgY2FudmFzZXNcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBzZXRDYW52YXNlc1NpemUgKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLmJhY2tMYXllci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpXG4gICAgdGhpcy50b2tlbnNMYXllci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpXG4gICAgdGhpcy5mcm9udExheWVyLnNldFNpemUod2lkdGgsIGhlaWdodClcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhbiB1cGRhdGUgb2YgdGhlIHJlbmRlcmVkIGBNaW5pbWFwYCBiYXNlZCBvbiB0aGUgY2hhbmdlc1xuICAgKiByZWdpc3RlcmVkIGluIHRoZSBpbnN0YW5jZS5cbiAgICovXG4gIHVwZGF0ZUNhbnZhcyAoKSB7XG4gICAgY29uc3QgZmlyc3RSb3cgPSB0aGlzLm1pbmltYXAuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBjb25zdCBsYXN0Um93ID0gdGhpcy5taW5pbWFwLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuICAgIHRoaXMudXBkYXRlVG9rZW5zTGF5ZXIoZmlyc3RSb3csIGxhc3RSb3cpXG4gICAgdGhpcy51cGRhdGVCYWNrRGVjb3JhdGlvbnNMYXllcihmaXJzdFJvdywgbGFzdFJvdylcbiAgICB0aGlzLnVwZGF0ZUZyb250RGVjb3JhdGlvbnNMYXllcihmaXJzdFJvdywgbGFzdFJvdylcblxuICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBbXVxuICAgIHRoaXMucGVuZGluZ0JhY2tEZWNvcmF0aW9uQ2hhbmdlcyA9IFtdXG4gICAgdGhpcy5wZW5kaW5nRnJvbnREZWNvcmF0aW9uQ2hhbmdlcyA9IFtdXG5cbiAgICAvKipcbiAgICAgKiBUaGUgZmlyc3Qgcm93IGluIHRoZSBsYXN0IHJlbmRlciBvZiB0aGUgb2Zmc2NyZWVuIGNhbnZhcy5cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPSBmaXJzdFJvd1xuICAgIC8qKlxuICAgICAqIFRoZSBsYXN0IHJvdyBpbiB0aGUgbGFzdCByZW5kZXIgb2YgdGhlIG9mZnNjcmVlbiBjYW52YXMuXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkxhc3RSb3cgPSBsYXN0Um93XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYW4gdXBkYXRlIG9mIHRoZSB0b2tlbnMgbGF5ZXIgdXNpbmcgdGhlIHBlbmRpbmcgY2hhbmdlcyBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IG9mIHRoZSByYW5nZSB0byB1cGRhdGVcbiAgICogQHBhcmFtICB7bnVtYmVyfSBsYXN0Um93IGxhc3RSb3cgdGhlIGxhc3Qgcm93IG9mIHRoZSByYW5nZSB0byB1cGRhdGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVUb2tlbnNMYXllciAoZmlyc3RSb3csIGxhc3RSb3cpIHtcbiAgICBjb25zdCBpbnRhY3RSYW5nZXMgPSB0aGlzLmNvbXB1dGVJbnRhY3RSYW5nZXMoZmlyc3RSb3csIGxhc3RSb3csIHRoaXMucGVuZGluZ0NoYW5nZXMpXG5cbiAgICB0aGlzLnJlZHJhd1Jhbmdlc09uTGF5ZXIodGhpcy50b2tlbnNMYXllciwgaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdywgdGhpcy5kcmF3TGluZXMpXG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYW4gdXBkYXRlIG9mIHRoZSBiYWNrIGRlY29yYXRpb25zIGxheWVyIHVzaW5nIHRoZSBwZW5kaW5nIGJhY2tcbiAgICogZGVjb3JhdGlvbnMgY2hhbmdlcyBhcnJheXMuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyBsYXN0Um93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlQmFja0RlY29yYXRpb25zTGF5ZXIgKGZpcnN0Um93LCBsYXN0Um93KSB7XG4gICAgY29uc3QgaW50YWN0UmFuZ2VzID0gdGhpcy5jb21wdXRlSW50YWN0UmFuZ2VzKGZpcnN0Um93LCBsYXN0Um93LCB0aGlzLnBlbmRpbmdCYWNrRGVjb3JhdGlvbkNoYW5nZXMpXG5cbiAgICB0aGlzLnJlZHJhd1Jhbmdlc09uTGF5ZXIodGhpcy5iYWNrTGF5ZXIsIGludGFjdFJhbmdlcywgZmlyc3RSb3csIGxhc3RSb3csIHRoaXMuZHJhd0JhY2tEZWNvcmF0aW9uc0ZvckxpbmVzKVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGFuIHVwZGF0ZSBvZiB0aGUgZnJvbnQgZGVjb3JhdGlvbnMgbGF5ZXIgdXNpbmcgdGhlIHBlbmRpbmcgZnJvbnRcbiAgICogZGVjb3JhdGlvbnMgY2hhbmdlcyBhcnJheXMuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyBsYXN0Um93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlRnJvbnREZWNvcmF0aW9uc0xheWVyIChmaXJzdFJvdywgbGFzdFJvdykge1xuICAgIGNvbnN0IGludGFjdFJhbmdlcyA9IHRoaXMuY29tcHV0ZUludGFjdFJhbmdlcyhmaXJzdFJvdywgbGFzdFJvdywgdGhpcy5wZW5kaW5nRnJvbnREZWNvcmF0aW9uQ2hhbmdlcylcblxuICAgIHRoaXMucmVkcmF3UmFuZ2VzT25MYXllcih0aGlzLmZyb250TGF5ZXIsIGludGFjdFJhbmdlcywgZmlyc3RSb3csIGxhc3RSb3csIHRoaXMuZHJhd0Zyb250RGVjb3JhdGlvbnNGb3JMaW5lcylcbiAgfVxuXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAgICAgIyMjIyMjIyAgIyMjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgIyMgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjICAjIyAgICAjI1xuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyMgICMjICAgICAjIyAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG9wYWNpdHkgdmFsdWUgdG8gdXNlIHdoZW4gcmVuZGVyaW5nIHRoZSBgTWluaW1hcGAgdGV4dC5cbiAgICpcbiAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgdGV4dCBvcGFjaXR5IHZhbHVlXG4gICAqL1xuICBnZXRUZXh0T3BhY2l0eSAoKSB7IHJldHVybiB0aGlzLnRleHRPcGFjaXR5IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGVmYXVsdCB0ZXh0IGNvbG9yIGZvciBhbiBlZGl0b3IgY29udGVudC5cbiAgICpcbiAgICogVGhlIGNvbG9yIHZhbHVlIGlzIGRpcmVjdGx5IHJlYWQgZnJvbSB0aGUgYFRleHRFZGl0b3JWaWV3YCBjb21wdXRlZCBzdHlsZXMuXG4gICAqXG4gICAqIEByZXR1cm4ge3N0cmluZ30gYSBDU1MgY29sb3JcbiAgICovXG4gIGdldERlZmF1bHRDb2xvciAoKSB7XG4gICAgY29uc3QgY29sb3IgPSB0aGlzLnJldHJpZXZlU3R5bGVGcm9tRG9tKFsnLmVkaXRvciddLCAnY29sb3InLCBmYWxzZSwgdHJ1ZSlcbiAgICByZXR1cm4gdGhpcy50cmFuc3BhcmVudGl6ZShjb2xvciwgdGhpcy5nZXRUZXh0T3BhY2l0eSgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRleHQgY29sb3IgZm9yIHRoZSBwYXNzZWQtaW4gYHRva2VuYCBvYmplY3QuXG4gICAqXG4gICAqIFRoZSBjb2xvciB2YWx1ZSBpcyByZWFkIGZyb20gdGhlIERPTSBieSBjcmVhdGluZyBhIG5vZGUgc3RydWN0dXJlIHRoYXRcbiAgICogbWF0Y2ggdGhlIHRva2VuIGBzY29wZWAgcHJvcGVydHkuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gdG9rZW4gYSBgVGV4dEVkaXRvcmAgdG9rZW5cbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgQ1NTIGNvbG9yIGZvciB0aGUgcHJvdmlkZWQgdG9rZW5cbiAgICovXG4gIGdldFRva2VuQ29sb3IgKHRva2VuKSB7XG4gICAgY29uc3Qgc2NvcGVzID0gdG9rZW4uc2NvcGVEZXNjcmlwdG9yIHx8IHRva2VuLnNjb3Blc1xuICAgIGNvbnN0IGNvbG9yID0gdGhpcy5yZXRyaWV2ZVN0eWxlRnJvbURvbShzY29wZXMsICdjb2xvcicpXG5cbiAgICByZXR1cm4gdGhpcy50cmFuc3BhcmVudGl6ZShjb2xvciwgdGhpcy5nZXRUZXh0T3BhY2l0eSgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJhY2tncm91bmQgY29sb3IgZm9yIHRoZSBwYXNzZWQtaW4gYGRlY29yYXRpb25gIG9iamVjdC5cbiAgICpcbiAgICogVGhlIGNvbG9yIHZhbHVlIGlzIHJlYWQgZnJvbSB0aGUgRE9NIGJ5IGNyZWF0aW5nIGEgbm9kZSBzdHJ1Y3R1cmUgdGhhdFxuICAgKiBtYXRjaCB0aGUgZGVjb3JhdGlvbiBgc2NvcGVgIHByb3BlcnR5IHVubGVzcyB0aGUgZGVjb3JhdGlvbiBwcm92aWRlc1xuICAgKiBpdHMgb3duIGBjb2xvcmAgcHJvcGVydHkuXG4gICAqXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gdG8gZ2V0IHRoZSBjb2xvciBmb3JcbiAgICogQHJldHVybiB7c3RyaW5nfSB0aGUgQ1NTIGNvbG9yIGZvciB0aGUgcHJvdmlkZWQgZGVjb3JhdGlvblxuICAgKi9cbiAgZ2V0RGVjb3JhdGlvbkNvbG9yIChkZWNvcmF0aW9uKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IGRlY29yYXRpb24uZ2V0UHJvcGVydGllcygpXG4gICAgaWYgKHByb3BlcnRpZXMuY29sb3IpIHsgcmV0dXJuIHByb3BlcnRpZXMuY29sb3IgfVxuXG4gICAgaWYgKHByb3BlcnRpZXMuc2NvcGUpIHtcbiAgICAgIGNvbnN0IHNjb3BlU3RyaW5nID0gcHJvcGVydGllcy5zY29wZS5zcGxpdCgvXFxzKy8pXG4gICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZVN0eWxlRnJvbURvbShzY29wZVN0cmluZywgJ2JhY2tncm91bmQtY29sb3InLCBmYWxzZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVmYXVsdENvbG9yKClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBgcmdiKC4uLilgIGNvbG9yIGludG8gYSBgcmdiYSguLi4pYCBjb2xvciB3aXRoIHRoZSBzcGVjaWZpZWRcbiAgICogb3BhY2l0eS5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBjb2xvciB0aGUgQ1NTIFJHQiBjb2xvciB0byB0cmFuc3BhcmVudGl6ZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFtvcGFjaXR5PTFdIHRoZSBvcGFjaXR5IGFtb3VudFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSB0cmFuc3BhcmVudGl6ZWQgQ1NTIGNvbG9yXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdHJhbnNwYXJlbnRpemUgKGNvbG9yLCBvcGFjaXR5ID0gMSkge1xuICAgIHJldHVybiBjb2xvci5yZXBsYWNlKCdyZ2IoJywgJ3JnYmEoJykucmVwbGFjZSgnKScsIGAsICR7b3BhY2l0eX0pYClcbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgICAgIyMjICAgICMjICAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgIyMgICMjICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgICMjICAjIyAgIyMgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMgICAgICMjICMjICAjIyAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgIyMgICAjIyMjIyMjIyMgIyMgICMjICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgIyMgICMjXG4gIC8vICAgICMjIyMjIyMjICAjIyAgICAgIyMgIyMgICAgICMjICAjIyMgICMjI1xuXG4gIC8qKlxuICAgKiBSb3V0aW5lIHVzZWQgdG8gcmVuZGVyIGNoYW5nZXMgaW4gc3BlY2lmaWMgcmFuZ2VzIGZvciBvbmUgbGF5ZXIuXG4gICAqXG4gICAqIEBwYXJhbSAge0NhbnZhc0xheWVyfSBsYXllciB0aGUgbGF5ZXIgdG8gcmVkcmF3XG4gICAqIEBwYXJhbSAge0FycmF5PE9iamVjdD59IGludGFjdFJhbmdlcyBhbiBhcnJheSBvZiB0aGUgcmFuZ2VzIHRvIGxlYXZlIGludGFjdFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZpcnN0Um93IGZpcnN0Um93IHRoZSBmaXJzdCByb3cgb2YgdGhlIHJhbmdlIHRvIHVwZGF0ZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgbGFzdFJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJhbmdlIHRvIHVwZGF0ZVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gbWV0aG9kIHRoZSByZW5kZXIgbWV0aG9kIHRvIHVzZSBmb3IgdGhlIGxpbmVzIGRyYXdpbmdcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICByZWRyYXdSYW5nZXNPbkxheWVyIChsYXllciwgaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdywgbWV0aG9kKSB7XG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cblxuICAgIGxheWVyLmNsZWFyQ2FudmFzKClcblxuICAgIGlmIChpbnRhY3RSYW5nZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBtZXRob2QuY2FsbCh0aGlzLCBmaXJzdFJvdywgbGFzdFJvdywgMClcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaiA9IDAsIGxlbiA9IGludGFjdFJhbmdlcy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBjb25zdCBpbnRhY3QgPSBpbnRhY3RSYW5nZXNbal1cblxuICAgICAgICBsYXllci5jb3B5UGFydEZyb21PZmZzY3JlZW4oXG4gICAgICAgICAgaW50YWN0Lm9mZnNjcmVlblJvdyAqIGxpbmVIZWlnaHQsXG4gICAgICAgICAgKGludGFjdC5zdGFydCAtIGZpcnN0Um93KSAqIGxpbmVIZWlnaHQsXG4gICAgICAgICAgKGludGFjdC5lbmQgLSBpbnRhY3Quc3RhcnQpICogbGluZUhlaWdodFxuICAgICAgICApXG4gICAgICB9XG4gICAgICB0aGlzLmRyYXdMaW5lc0ZvclJhbmdlcyhtZXRob2QsIGludGFjdFJhbmdlcywgZmlyc3RSb3csIGxhc3RSb3cpXG4gICAgfVxuXG4gICAgbGF5ZXIucmVzZXRPZmZzY3JlZW5TaXplKClcbiAgICBsYXllci5jb3B5VG9PZmZzY3JlZW4oKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhlIGxpbmVzIGJldHdlZW4gdGhlIGludGFjdCByYW5nZXMgd2hlbiBhbiB1cGRhdGUgaGFzIHBlbmRpbmdcbiAgICogY2hhbmdlcy5cbiAgICpcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IG1ldGhvZCB0aGUgcmVuZGVyIG1ldGhvZCB0byB1c2UgZm9yIHRoZSBsaW5lcyBkcmF3aW5nXG4gICAqIEBwYXJhbSAge0FycmF5PE9iamVjdD59IGludGFjdFJhbmdlcyB0aGUgaW50YWN0IHJhbmdlcyBpbiB0aGUgbWluaW1hcFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZpcnN0Um93IHRoZSBmaXJzdCByb3cgb2YgdGhlIHJlbmRlcmVkIHJlZ2lvblxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgdGhlIGxhc3Qgcm93IG9mIHRoZSByZW5kZXJlZCByZWdpb25cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmF3TGluZXNGb3JSYW5nZXMgKG1ldGhvZCwgcmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdykge1xuICAgIGxldCBjdXJyZW50Um93ID0gZmlyc3RSb3dcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcmFuZ2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHJhbmdlc1tpXVxuXG4gICAgICBtZXRob2QuY2FsbCh0aGlzLCBjdXJyZW50Um93LCByYW5nZS5zdGFydCwgY3VycmVudFJvdyAtIGZpcnN0Um93KVxuXG4gICAgICBjdXJyZW50Um93ID0gcmFuZ2UuZW5kXG4gICAgfVxuICAgIGlmIChjdXJyZW50Um93IDw9IGxhc3RSb3cpIHtcbiAgICAgIG1ldGhvZC5jYWxsKHRoaXMsIGN1cnJlbnRSb3csIGxhc3RSb3csIGN1cnJlbnRSb3cgLSBmaXJzdFJvdylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgYmFjayBkZWNvcmF0aW9ucyBvbiB0aGUgY29ycmVzcG9uZGluZyBsYXllci5cbiAgICpcbiAgICogVGhlIGxpbmVzIHJhbmdlIHRvIGRyYXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBgZmlyc3RSb3dgIGFuZCBgbGFzdFJvd2BcbiAgICogcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgdGhlIGxhc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG9mZnNldFJvdyB0aGUgcmVsYXRpdmUgb2Zmc2V0IHRvIGFwcGx5IHRvIHJvd3Mgd2hlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJpbmcgdGhlbVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdCYWNrRGVjb3JhdGlvbnNGb3JMaW5lcyAoZmlyc3RSb3csIGxhc3RSb3csIG9mZnNldFJvdykge1xuICAgIGlmIChmaXJzdFJvdyA+IGxhc3RSb3cpIHsgcmV0dXJuIH1cblxuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgY29uc3QgbGluZUhlaWdodCA9IHRoaXMubWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgY2hhckhlaWdodCA9IHRoaXMubWluaW1hcC5nZXRDaGFySGVpZ2h0KCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgY2hhcldpZHRoID0gdGhpcy5taW5pbWFwLmdldENoYXJXaWR0aCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGNvbnN0IGRlY29yYXRpb25zID0gdGhpcy5taW5pbWFwLmRlY29yYXRpb25zQnlUeXBlVGhlblJvd3MoZmlyc3RSb3csIGxhc3RSb3cpXG4gICAgY29uc3Qge3dpZHRoOiBjYW52YXNXaWR0aCwgaGVpZ2h0OiBjYW52YXNIZWlnaHR9ID0gdGhpcy50b2tlbnNMYXllci5nZXRTaXplKClcbiAgICBjb25zdCByZW5kZXJEYXRhID0ge1xuICAgICAgY29udGV4dDogdGhpcy5iYWNrTGF5ZXIuY29udGV4dCxcbiAgICAgIGNhbnZhc1dpZHRoOiBjYW52YXNXaWR0aCxcbiAgICAgIGNhbnZhc0hlaWdodDogY2FudmFzSGVpZ2h0LFxuICAgICAgbGluZUhlaWdodDogbGluZUhlaWdodCxcbiAgICAgIGNoYXJXaWR0aDogY2hhcldpZHRoLFxuICAgICAgY2hhckhlaWdodDogY2hhckhlaWdodCxcbiAgICAgIG9yZGVyczogTWFpbi5nZXRQbHVnaW5zT3JkZXIoKVxuICAgIH1cblxuICAgIGZvciAobGV0IHNjcmVlblJvdyA9IGZpcnN0Um93OyBzY3JlZW5Sb3cgPD0gbGFzdFJvdzsgc2NyZWVuUm93KyspIHtcbiAgICAgIHJlbmRlckRhdGEucm93ID0gb2Zmc2V0Um93ICsgKHNjcmVlblJvdyAtIGZpcnN0Um93KVxuICAgICAgcmVuZGVyRGF0YS55Um93ID0gcmVuZGVyRGF0YS5yb3cgKiBsaW5lSGVpZ2h0XG4gICAgICByZW5kZXJEYXRhLnNjcmVlblJvdyA9IHNjcmVlblJvd1xuXG4gICAgICB0aGlzLmRyYXdEZWNvcmF0aW9ucyhzY3JlZW5Sb3csIGRlY29yYXRpb25zLCByZW5kZXJEYXRhLCB7XG4gICAgICAgICdsaW5lJzogdGhpcy5kcmF3TGluZURlY29yYXRpb24sXG4gICAgICAgICdoaWdobGlnaHQtdW5kZXInOiB0aGlzLmRyYXdIaWdobGlnaHREZWNvcmF0aW9uLFxuICAgICAgICAnYmFja2dyb3VuZC1jdXN0b20nOiB0aGlzLmRyYXdDdXN0b21EZWNvcmF0aW9uXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuYmFja0xheWVyLmNvbnRleHQuZmlsbCgpXG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgZnJvbnQgZGVjb3JhdGlvbnMgb24gdGhlIGNvcnJlc3BvbmRpbmcgbGF5ZXIuXG4gICAqXG4gICAqIFRoZSBsaW5lcyByYW5nZSB0byBkcmF3IGlzIHNwZWNpZmllZCBieSB0aGUgYGZpcnN0Um93YCBhbmQgYGxhc3RSb3dgXG4gICAqIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyB0byByZW5kZXJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBsYXN0Um93IHRoZSBsYXN0IHJvdyB0byByZW5kZXJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBvZmZzZXRSb3cgdGhlIHJlbGF0aXZlIG9mZnNldCB0byBhcHBseSB0byByb3dzIHdoZW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyaW5nIHRoZW1cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmF3RnJvbnREZWNvcmF0aW9uc0ZvckxpbmVzIChmaXJzdFJvdywgbGFzdFJvdywgb2Zmc2V0Um93KSB7XG4gICAgaWYgKGZpcnN0Um93ID4gbGFzdFJvdykgeyByZXR1cm4gfVxuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBjaGFySGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldENoYXJIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBjaGFyV2lkdGggPSB0aGlzLm1pbmltYXAuZ2V0Q2hhcldpZHRoKCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgZGVjb3JhdGlvbnMgPSB0aGlzLm1pbmltYXAuZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93cyhmaXJzdFJvdywgbGFzdFJvdylcbiAgICBjb25zdCB7d2lkdGg6IGNhbnZhc1dpZHRoLCBoZWlnaHQ6IGNhbnZhc0hlaWdodH0gPSB0aGlzLnRva2Vuc0xheWVyLmdldFNpemUoKVxuICAgIGNvbnN0IHJlbmRlckRhdGEgPSB7XG4gICAgICBjb250ZXh0OiB0aGlzLmZyb250TGF5ZXIuY29udGV4dCxcbiAgICAgIGNhbnZhc1dpZHRoOiBjYW52YXNXaWR0aCxcbiAgICAgIGNhbnZhc0hlaWdodDogY2FudmFzSGVpZ2h0LFxuICAgICAgbGluZUhlaWdodDogbGluZUhlaWdodCxcbiAgICAgIGNoYXJXaWR0aDogY2hhcldpZHRoLFxuICAgICAgY2hhckhlaWdodDogY2hhckhlaWdodCxcbiAgICAgIG9yZGVyczogTWFpbi5nZXRQbHVnaW5zT3JkZXIoKVxuICAgIH1cblxuICAgIGZvciAobGV0IHNjcmVlblJvdyA9IGZpcnN0Um93OyBzY3JlZW5Sb3cgPD0gbGFzdFJvdzsgc2NyZWVuUm93KyspIHtcbiAgICAgIHJlbmRlckRhdGEucm93ID0gb2Zmc2V0Um93ICsgKHNjcmVlblJvdyAtIGZpcnN0Um93KVxuICAgICAgcmVuZGVyRGF0YS55Um93ID0gcmVuZGVyRGF0YS5yb3cgKiBsaW5lSGVpZ2h0XG4gICAgICByZW5kZXJEYXRhLnNjcmVlblJvdyA9IHNjcmVlblJvd1xuXG4gICAgICB0aGlzLmRyYXdEZWNvcmF0aW9ucyhzY3JlZW5Sb3csIGRlY29yYXRpb25zLCByZW5kZXJEYXRhLCB7XG4gICAgICAgICdndXR0ZXInOiB0aGlzLmRyYXdHdXR0ZXJEZWNvcmF0aW9uLFxuICAgICAgICAnaGlnaGxpZ2h0LW92ZXInOiB0aGlzLmRyYXdIaWdobGlnaHREZWNvcmF0aW9uLFxuICAgICAgICAnaGlnaGxpZ2h0LW91dGxpbmUnOiB0aGlzLmRyYXdIaWdobGlnaHRPdXRsaW5lRGVjb3JhdGlvbixcbiAgICAgICAgJ2ZvcmVncm91bmQtY3VzdG9tJzogdGhpcy5kcmF3Q3VzdG9tRGVjb3JhdGlvblxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZW5kZXJEYXRhLmNvbnRleHQuZmlsbCgpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiB0b2tlbnMgYnkgbGluZS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBzdGFydFJvdyBUaGUgc3RhcnQgcm93XG4gICAqIEBwYXJhbSAge251bWJlcn0gZW5kUm93IFRoZSBlbmQgcm93XG4gICAqIEByZXR1cm4ge0FycmF5PEFycmF5Pn0gQW4gYXJyYXkgb2YgdG9rZW5zIGJ5IGxpbmVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB0b2tlbkxpbmVzRm9yU2NyZWVuUm93cyAoc3RhcnRSb3csIGVuZFJvdykge1xuICAgIGNvbnN0IGVkaXRvciA9IHRoaXMuZ2V0VGV4dEVkaXRvcigpXG4gICAgbGV0IHRva2VuTGluZXMgPSBbXVxuICAgIGlmICh0eXBlb2YgZWRpdG9yLnRva2VuaXplZExpbmVzRm9yU2NyZWVuUm93cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm9yIChsZXQgdG9rZW5pemVkTGluZSBvZiBlZGl0b3IudG9rZW5pemVkTGluZXNGb3JTY3JlZW5Sb3dzKHN0YXJ0Um93LCBlbmRSb3cpKSB7XG4gICAgICAgIGlmICh0b2tlbml6ZWRMaW5lKSB7XG4gICAgICAgICAgY29uc3QgaW52aXNpYmxlUmVnRXhwID0gdGhpcy5nZXRJbnZpc2libGVSZWdFeHBGb3JMaW5lKHRva2VuaXplZExpbmUpXG4gICAgICAgICAgdG9rZW5MaW5lcy5wdXNoKHRva2VuaXplZExpbmUudG9rZW5zLm1hcCgodG9rZW4pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHZhbHVlOiB0b2tlbi52YWx1ZS5yZXBsYWNlKGludmlzaWJsZVJlZ0V4cCwgJyAnKSxcbiAgICAgICAgICAgICAgc2NvcGVzOiB0b2tlbi5zY29wZXMuc2xpY2UoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICBzY29wZXM6IFtdXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRpc3BsYXlMYXllciA9IGVkaXRvci5kaXNwbGF5TGF5ZXJcbiAgICAgIGNvbnN0IGludmlzaWJsZVJlZ0V4cCA9IHRoaXMuZ2V0SW52aXNpYmxlUmVnRXhwKClcbiAgICAgIGNvbnN0IHNjcmVlbkxpbmVzID0gZGlzcGxheUxheWVyLmdldFNjcmVlbkxpbmVzKHN0YXJ0Um93LCBlbmRSb3cpXG4gICAgICBmb3IgKGxldCB7bGluZVRleHQsIHRhZ0NvZGVzfSBvZiBzY3JlZW5MaW5lcykge1xuICAgICAgICBsZXQgdG9rZW5zID0gW11cbiAgICAgICAgbGV0IHNjb3BlcyA9IFtdXG4gICAgICAgIGxldCB0ZXh0SW5kZXggPSAwXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxpbmVUZXh0LCBpbnZpc2libGVSZWdFeHAsIGxpbmVUZXh0LnJlcGxhY2UoaW52aXNpYmxlUmVnRXhwLCAnICcpKVxuICAgICAgICBmb3IgKGxldCB0YWdDb2RlIG9mIHRhZ0NvZGVzKSB7XG4gICAgICAgICAgaWYgKGRpc3BsYXlMYXllci5pc09wZW5UYWdDb2RlKHRhZ0NvZGUpKSB7XG4gICAgICAgICAgICBzY29wZXMucHVzaChkaXNwbGF5TGF5ZXIudGFnRm9yQ29kZSh0YWdDb2RlKSlcbiAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BsYXlMYXllci5pc0Nsb3NlVGFnQ29kZSh0YWdDb2RlKSkge1xuICAgICAgICAgICAgc2NvcGVzLnBvcCgpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgICAgICAgdmFsdWU6IGxpbmVUZXh0LnN1YnN0cih0ZXh0SW5kZXgsIHRhZ0NvZGUpLnJlcGxhY2UoaW52aXNpYmxlUmVnRXhwLCAnICcpLFxuICAgICAgICAgICAgICBzY29wZXM6IHNjb3Blcy5zbGljZSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdGV4dEluZGV4ICs9IHRhZ0NvZGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0b2tlbkxpbmVzLnB1c2godG9rZW5zKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG9rZW5MaW5lc1xuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIGxpbmVzIG9uIHRoZSBjb3JyZXNwb25kaW5nIGxheWVyLlxuICAgKlxuICAgKiBUaGUgbGluZXMgcmFuZ2UgdG8gZHJhdyBpcyBzcGVjaWZpZWQgYnkgdGhlIGBmaXJzdFJvd2AgYW5kIGBsYXN0Um93YFxuICAgKiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZpcnN0Um93IHRoZSBmaXJzdCByb3cgdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyB0aGUgbGFzdCByb3cgdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge251bWJlcn0gb2Zmc2V0Um93IHRoZSByZWxhdGl2ZSBvZmZzZXQgdG8gYXBwbHkgdG8gcm93cyB3aGVuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcmluZyB0aGVtXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0xpbmVzIChmaXJzdFJvdywgbGFzdFJvdywgb2Zmc2V0Um93KSB7XG4gICAgaWYgKGZpcnN0Um93ID4gbGFzdFJvdykgeyByZXR1cm4gfVxuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBjaGFySGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldENoYXJIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBjaGFyV2lkdGggPSB0aGlzLm1pbmltYXAuZ2V0Q2hhcldpZHRoKCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgZGlzcGxheUNvZGVIaWdobGlnaHRzID0gdGhpcy5kaXNwbGF5Q29kZUhpZ2hsaWdodHNcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy50b2tlbnNMYXllci5jb250ZXh0XG4gICAgY29uc3Qge3dpZHRoOiBjYW52YXNXaWR0aH0gPSB0aGlzLnRva2Vuc0xheWVyLmdldFNpemUoKVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLnRva2VuTGluZXNGb3JTY3JlZW5Sb3dzICE9ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYHRva2VuTGluZXNGb3JTY3JlZW5Sb3dzIHNob3VsZCBiZSBhIGZ1bmN0aW9uIGJ1dCBpdCB3YXMgJHt0eXBlb2YgdGhpcy50b2tlbkxpbmVzRm9yU2NyZWVuUm93c31gLCB0aGlzLnRva2VuTGluZXNGb3JTY3JlZW5Sb3dzKVxuXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzY3JlZW5Sb3dzVG9rZW5zID0gdGhpcy50b2tlbkxpbmVzRm9yU2NyZWVuUm93cyhmaXJzdFJvdywgbGFzdFJvdylcblxuICAgIGxldCB5ID0gb2Zmc2V0Um93ICogbGluZUhlaWdodFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NyZWVuUm93c1Rva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHRva2VucyA9IHNjcmVlblJvd3NUb2tlbnNbaV1cbiAgICAgIGxldCB4ID0gMFxuICAgICAgY29udGV4dC5jbGVhclJlY3QoeCwgeSwgY2FudmFzV2lkdGgsIGxpbmVIZWlnaHQpXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRva2Vucy5sZW5ndGg7IGorKykge1xuICAgICAgICBsZXQgdG9rZW4gPSB0b2tlbnNbal1cbiAgICAgICAgaWYgKC9eXFxzKyQvLnRlc3QodG9rZW4udmFsdWUpKSB7XG4gICAgICAgICAgeCArPSB0b2tlbi52YWx1ZS5sZW5ndGggKiBjaGFyV2lkdGhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjb2xvciA9IGRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA/IHRoaXMuZ2V0VG9rZW5Db2xvcih0b2tlbikgOiB0aGlzLmdldERlZmF1bHRDb2xvcigpXG4gICAgICAgICAgeCA9IHRoaXMuZHJhd1Rva2VuKGNvbnRleHQsIHRva2VuLnZhbHVlLCBjb2xvciwgeCwgeSwgY2hhcldpZHRoLCBjaGFySGVpZ2h0KVxuICAgICAgICB9XG4gICAgICAgIGlmICh4ID4gY2FudmFzV2lkdGgpIHsgYnJlYWsgfVxuICAgICAgfVxuXG4gICAgICB5ICs9IGxpbmVIZWlnaHRcbiAgICB9XG5cbiAgICBjb250ZXh0LmZpbGwoKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlZ2V4cCB0byByZXBsYWNlIGludmlzaWJsZXMgc3Vic3RpdHV0aW9uIGNoYXJhY3RlcnNcbiAgICogaW4gZWRpdG9yIGxpbmVzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtSZWdFeHB9IHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2ggaW52aXNpYmxlIGNoYXJhY3RlcnNcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBnZXRJbnZpc2libGVSZWdFeHAgKCkge1xuICAgIGxldCBpbnZpc2libGVzID0gdGhpcy5nZXRUZXh0RWRpdG9yKCkuZ2V0SW52aXNpYmxlcygpXG4gICAgbGV0IHJlZ2V4cCA9IFtdXG4gICAgaWYgKGludmlzaWJsZXMuY3IgIT0gbnVsbCkgeyByZWdleHAucHVzaChpbnZpc2libGVzLmNyKSB9XG4gICAgaWYgKGludmlzaWJsZXMuZW9sICE9IG51bGwpIHsgcmVnZXhwLnB1c2goaW52aXNpYmxlcy5lb2wpIH1cbiAgICBpZiAoaW52aXNpYmxlcy5zcGFjZSAhPSBudWxsKSB7IHJlZ2V4cC5wdXNoKGludmlzaWJsZXMuc3BhY2UpIH1cbiAgICBpZiAoaW52aXNpYmxlcy50YWIgIT0gbnVsbCkgeyByZWdleHAucHVzaChpbnZpc2libGVzLnRhYikgfVxuXG4gICAgcmV0dXJuIFJlZ0V4cChyZWdleHAuZmlsdGVyKChzKSA9PiB7XG4gICAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnXG4gICAgfSkubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKCd8JyksICdnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWdleHAgdG8gcmVwbGFjZSBpbnZpc2libGVzIHN1YnN0aXR1dGlvbiBjaGFyYWN0ZXJzXG4gICAqIGluIGVkaXRvciBsaW5lcy5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSBsaW5lIHRoZSB0b2tlbml6ZWQgbGluZVxuICAgKiBAcmV0dXJuIHtSZWdFeHB9IHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2ggaW52aXNpYmxlIGNoYXJhY3RlcnNcbiAgICogQGRlcHJlY2F0ZWQgSXMgdXNlZCBvbmx5IHRvIHN1cHBvcnQgQXRvbSB2ZXJzaW9uIGJlZm9yZSBkaXNwbGF5IGxheWVyIEFQSVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGdldEludmlzaWJsZVJlZ0V4cEZvckxpbmUgKGxpbmUpIHtcbiAgICBpZiAoKGxpbmUgIT0gbnVsbCkgJiYgKGxpbmUuaW52aXNpYmxlcyAhPSBudWxsKSkge1xuICAgICAgY29uc3QgaW52aXNpYmxlcyA9IFtdXG4gICAgICBpZiAobGluZS5pbnZpc2libGVzLmNyICE9IG51bGwpIHsgaW52aXNpYmxlcy5wdXNoKGxpbmUuaW52aXNpYmxlcy5jcikgfVxuICAgICAgaWYgKGxpbmUuaW52aXNpYmxlcy5lb2wgIT0gbnVsbCkgeyBpbnZpc2libGVzLnB1c2gobGluZS5pbnZpc2libGVzLmVvbCkgfVxuICAgICAgaWYgKGxpbmUuaW52aXNpYmxlcy5zcGFjZSAhPSBudWxsKSB7IGludmlzaWJsZXMucHVzaChsaW5lLmludmlzaWJsZXMuc3BhY2UpIH1cbiAgICAgIGlmIChsaW5lLmludmlzaWJsZXMudGFiICE9IG51bGwpIHsgaW52aXNpYmxlcy5wdXNoKGxpbmUuaW52aXNpYmxlcy50YWIpIH1cblxuICAgICAgcmV0dXJuIFJlZ0V4cChpbnZpc2libGVzLmZpbHRlcigocykgPT4ge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnXG4gICAgICB9KS5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKSwgJ2cnKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIHNpbmdsZSB0b2tlbiBvbiB0aGUgZ2l2ZW4gY29udGV4dC5cbiAgICpcbiAgICogQHBhcmFtICB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0IHRoZSB0YXJnZXQgY2FudmFzIGNvbnRleHRcbiAgICogQHBhcmFtICB7c3RyaW5nfSB0ZXh0IHRoZSB0b2tlbidzIHRleHQgY29udGVudFxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNvbG9yIHRoZSB0b2tlbidzIENTUyBjb2xvclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHggdGhlIHggcG9zaXRpb24gb2YgdGhlIHRva2VuIGluIHRoZSBsaW5lXG4gICAqIEBwYXJhbSAge251bWJlcn0geSB0aGUgeSBwb3NpdGlvbiBvZiB0aGUgbGluZSBpbiB0aGUgbWluaW1hcFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGNoYXJXaWR0aCB0aGUgd2lkdGggb2YgYSBjaGFyYWN0ZXIgaW4gdGhlIG1pbmltYXBcbiAgICogQHBhcmFtICB7bnVtYmVyfSBjaGFySGVpZ2h0IHRoZSBoZWlnaHQgb2YgYSBjaGFyYWN0ZXIgaW4gdGhlIG1pbmltYXBcbiAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgeCBwb3NpdGlvbiBhdCB0aGUgZW5kIG9mIHRoZSB0b2tlblxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdUb2tlbiAoY29udGV4dCwgdGV4dCwgY29sb3IsIHgsIHksIGNoYXJXaWR0aCwgY2hhckhlaWdodCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3JcblxuICAgIGlmICh0aGlzLmlnbm9yZVdoaXRlc3BhY2VzSW5Ub2tlbnMpIHtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRleHQubGVuZ3RoICogY2hhcldpZHRoXG4gICAgICBjb250ZXh0LmZpbGxSZWN0KHgsIHksIGxlbmd0aCwgY2hhckhlaWdodClcblxuICAgICAgcmV0dXJuIHggKyBsZW5ndGhcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGNoYXJzID0gMFxuICAgICAgZm9yIChsZXQgaiA9IDAsIGxlbiA9IHRleHQubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgY29uc3QgY2hhciA9IHRleHRbal1cbiAgICAgICAgaWYgKC9cXHMvLnRlc3QoY2hhcikpIHtcbiAgICAgICAgICBpZiAoY2hhcnMgPiAwKSB7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KHggLSAoY2hhcnMgKiBjaGFyV2lkdGgpLCB5LCBjaGFycyAqIGNoYXJXaWR0aCwgY2hhckhlaWdodClcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hhcnMgPSAwXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hhcnMrK1xuICAgICAgICB9XG4gICAgICAgIHggKz0gY2hhcldpZHRoXG4gICAgICB9XG4gICAgICBpZiAoY2hhcnMgPiAwKSB7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoeCAtIChjaGFycyAqIGNoYXJXaWR0aCksIHksIGNoYXJzICogY2hhcldpZHRoLCBjaGFySGVpZ2h0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHhcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgdGhlIHNwZWNpZmllZCBkZWNvcmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgYHNjcmVlblJvd2AuXG4gICAqXG4gICAqIFRoZSBgZGVjb3JhdGlvbnNgIG9iamVjdCBjb250YWlucyBhbGwgdGhlIGRlY29yYXRpb25zIGdyb3VwZWQgYnkgdHlwZSBhbmRcbiAgICogdGhlbiByb3dzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHNjcmVlblJvdyB0aGUgc2NyZWVuIHJvdyBpbmRleCBmb3Igd2hpY2hcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyIGRlY29yYXRpb25zXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGVjb3JhdGlvbnMgdGhlIG9iamVjdCBjb250YWluaW5nIGFsbCB0aGUgZGVjb3JhdGlvbnNcbiAgICogQHBhcmFtICB7T2JqZWN0fSByZW5kZXJEYXRhIHRoZSBvYmplY3QgY29udGFpbmluZyB0aGUgcmVuZGVyIGRhdGFcbiAgICogQHBhcmFtICB7T2JqZWN0fSB0eXBlcyBhbiBvYmplY3Qgd2l0aCB0aGUgdHlwZSB0byByZW5kZXIgYXMga2V5IGFuZCB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICByZW5kZXIgbWV0aG9kIGFzIHZhbHVlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0RlY29yYXRpb25zIChzY3JlZW5Sb3csIGRlY29yYXRpb25zLCByZW5kZXJEYXRhLCB0eXBlcykge1xuICAgIGxldCBkZWNvcmF0aW9uc1RvUmVuZGVyID0gW11cblxuICAgIHJlbmRlckRhdGEuY29udGV4dC5jbGVhclJlY3QoXG4gICAgICAwLCByZW5kZXJEYXRhLnlSb3csXG4gICAgICByZW5kZXJEYXRhLmNhbnZhc1dpZHRoLCByZW5kZXJEYXRhLmxpbmVIZWlnaHRcbiAgICApXG5cbiAgICBmb3IgKGxldCBpIGluIHR5cGVzKSB7XG4gICAgICBkZWNvcmF0aW9uc1RvUmVuZGVyID0gZGVjb3JhdGlvbnNUb1JlbmRlci5jb25jYXQoXG4gICAgICAgIGRlY29yYXRpb25zW2ldICE9IG51bGwgPyBkZWNvcmF0aW9uc1tpXVtzY3JlZW5Sb3ddIHx8IFtdIDogW11cbiAgICAgIClcbiAgICB9XG5cbiAgICBkZWNvcmF0aW9uc1RvUmVuZGVyLnNvcnQoKGEsIGIpID0+XG4gICAgICAocmVuZGVyRGF0YS5vcmRlcnNbYS5wcm9wZXJ0aWVzLnBsdWdpbl0gfHwgMCkgLSAocmVuZGVyRGF0YS5vcmRlcnNbYi5wcm9wZXJ0aWVzLnBsdWdpbl0gfHwgMClcbiAgICApXG5cbiAgICBpZiAoZGVjb3JhdGlvbnNUb1JlbmRlciAhPSBudWxsID8gZGVjb3JhdGlvbnNUb1JlbmRlci5sZW5ndGggOiB2b2lkIDApIHtcbiAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBkZWNvcmF0aW9uc1RvUmVuZGVyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHR5cGVzW2RlY29yYXRpb25zVG9SZW5kZXJbaV0ucHJvcGVydGllcy50eXBlXS5jYWxsKHRoaXMsIGRlY29yYXRpb25zVG9SZW5kZXJbaV0sIHJlbmRlckRhdGEpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIGEgbGluZSBkZWNvcmF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gIHtEZWNvcmF0aW9ufSBkZWNvcmF0aW9uIHRoZSBkZWNvcmF0aW9uIHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgdGhlIGRhdGEgbmVlZCB0byBwZXJmb3JtIHRoZSByZW5kZXJcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmF3TGluZURlY29yYXRpb24gKGRlY29yYXRpb24sIGRhdGEpIHtcbiAgICBkYXRhLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5nZXREZWNvcmF0aW9uQ29sb3IoZGVjb3JhdGlvbilcbiAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgZGF0YS55Um93LCBkYXRhLmNhbnZhc1dpZHRoLCBkYXRhLmxpbmVIZWlnaHQpXG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgYSBndXR0ZXIgZGVjb3JhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtICB7RGVjb3JhdGlvbn0gZGVjb3JhdGlvbiB0aGUgZGVjb3JhdGlvbiB0byByZW5kZXJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIHRoZSBkYXRhIG5lZWQgdG8gcGVyZm9ybSB0aGUgcmVuZGVyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0d1dHRlckRlY29yYXRpb24gKGRlY29yYXRpb24sIGRhdGEpIHtcbiAgICBkYXRhLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5nZXREZWNvcmF0aW9uQ29sb3IoZGVjb3JhdGlvbilcbiAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgZGF0YS55Um93LCAxLCBkYXRhLmxpbmVIZWlnaHQpXG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgYSBoaWdobGlnaHQgZGVjb3JhdGlvbi5cbiAgICpcbiAgICogSXQgcmVuZGVycyBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBoaWdobGlnaHQgY29ycmVzcG9uZGluZyB0byB0aGUgc3BlY2lmaWVkXG4gICAqIHJvdy5cbiAgICpcbiAgICogQHBhcmFtICB7RGVjb3JhdGlvbn0gZGVjb3JhdGlvbiB0aGUgZGVjb3JhdGlvbiB0byByZW5kZXJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIHRoZSBkYXRhIG5lZWQgdG8gcGVyZm9ybSB0aGUgcmVuZGVyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0hpZ2hsaWdodERlY29yYXRpb24gKGRlY29yYXRpb24sIGRhdGEpIHtcbiAgICBjb25zdCByYW5nZSA9IGRlY29yYXRpb24uZ2V0TWFya2VyKCkuZ2V0U2NyZWVuUmFuZ2UoKVxuICAgIGNvbnN0IHJvd1NwYW4gPSByYW5nZS5lbmQucm93IC0gcmFuZ2Uuc3RhcnQucm93XG5cbiAgICBkYXRhLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5nZXREZWNvcmF0aW9uQ29sb3IoZGVjb3JhdGlvbilcblxuICAgIGlmIChyb3dTcGFuID09PSAwKSB7XG4gICAgICBjb25zdCBjb2xTcGFuID0gcmFuZ2UuZW5kLmNvbHVtbiAtIHJhbmdlLnN0YXJ0LmNvbHVtblxuICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHJhbmdlLnN0YXJ0LmNvbHVtbiAqIGRhdGEuY2hhcldpZHRoLCBkYXRhLnlSb3csIGNvbFNwYW4gKiBkYXRhLmNoYXJXaWR0aCwgZGF0YS5saW5lSGVpZ2h0KVxuICAgIH0gZWxzZSBpZiAoZGF0YS5zY3JlZW5Sb3cgPT09IHJhbmdlLnN0YXJ0LnJvdykge1xuICAgICAgY29uc3QgeCA9IHJhbmdlLnN0YXJ0LmNvbHVtbiAqIGRhdGEuY2hhcldpZHRoXG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeCwgZGF0YS55Um93LCBkYXRhLmNhbnZhc1dpZHRoIC0geCwgZGF0YS5saW5lSGVpZ2h0KVxuICAgIH0gZWxzZSBpZiAoZGF0YS5zY3JlZW5Sb3cgPT09IHJhbmdlLmVuZC5yb3cpIHtcbiAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCgwLCBkYXRhLnlSb3csIHJhbmdlLmVuZC5jb2x1bW4gKiBkYXRhLmNoYXJXaWR0aCwgZGF0YS5saW5lSGVpZ2h0KVxuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgZGF0YS55Um93LCBkYXRhLmNhbnZhc1dpZHRoLCBkYXRhLmxpbmVIZWlnaHQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIGEgaGlnaGxpZ2h0IG91dGxpbmUgZGVjb3JhdGlvbi5cbiAgICpcbiAgICogSXQgcmVuZGVycyBvbmx5IHRoZSBwYXJ0IG9mIHRoZSBoaWdobGlnaHQgY29ycmVzcG9uZGluZyB0byB0aGUgc3BlY2lmaWVkXG4gICAqIHJvdy5cbiAgICpcbiAgICogQHBhcmFtICB7RGVjb3JhdGlvbn0gZGVjb3JhdGlvbiB0aGUgZGVjb3JhdGlvbiB0byByZW5kZXJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIHRoZSBkYXRhIG5lZWQgdG8gcGVyZm9ybSB0aGUgcmVuZGVyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uIChkZWNvcmF0aW9uLCBkYXRhKSB7XG4gICAgbGV0IGJvdHRvbVdpZHRoLCBjb2xTcGFuLCB3aWR0aCwgeEJvdHRvbVN0YXJ0LCB4RW5kLCB4U3RhcnRcbiAgICBjb25zdCB7bGluZUhlaWdodCwgY2hhcldpZHRoLCBjYW52YXNXaWR0aCwgc2NyZWVuUm93fSA9IGRhdGFcbiAgICBjb25zdCByYW5nZSA9IGRlY29yYXRpb24uZ2V0TWFya2VyKCkuZ2V0U2NyZWVuUmFuZ2UoKVxuICAgIGNvbnN0IHJvd1NwYW4gPSByYW5nZS5lbmQucm93IC0gcmFuZ2Uuc3RhcnQucm93XG4gICAgY29uc3QgeVN0YXJ0ID0gZGF0YS55Um93XG4gICAgY29uc3QgeUVuZCA9IHlTdGFydCArIGxpbmVIZWlnaHRcblxuICAgIGRhdGEuY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLmdldERlY29yYXRpb25Db2xvcihkZWNvcmF0aW9uKVxuXG4gICAgaWYgKHJvd1NwYW4gPT09IDApIHtcbiAgICAgIGNvbFNwYW4gPSByYW5nZS5lbmQuY29sdW1uIC0gcmFuZ2Uuc3RhcnQuY29sdW1uXG4gICAgICB3aWR0aCA9IGNvbFNwYW4gKiBjaGFyV2lkdGhcbiAgICAgIHhTdGFydCA9IHJhbmdlLnN0YXJ0LmNvbHVtbiAqIGNoYXJXaWR0aFxuICAgICAgeEVuZCA9IHhTdGFydCArIHdpZHRoXG5cbiAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgd2lkdGgsIDEpXG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeFN0YXJ0LCB5RW5kLCB3aWR0aCwgMSlcbiAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgMSwgbGluZUhlaWdodClcbiAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4RW5kLCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgfSBlbHNlIGlmIChyb3dTcGFuID09PSAxKSB7XG4gICAgICB4U3RhcnQgPSByYW5nZS5zdGFydC5jb2x1bW4gKiBkYXRhLmNoYXJXaWR0aFxuICAgICAgeEVuZCA9IHJhbmdlLmVuZC5jb2x1bW4gKiBkYXRhLmNoYXJXaWR0aFxuXG4gICAgICBpZiAoc2NyZWVuUm93ID09PSByYW5nZS5zdGFydC5yb3cpIHtcbiAgICAgICAgd2lkdGggPSBkYXRhLmNhbnZhc1dpZHRoIC0geFN0YXJ0XG4gICAgICAgIHhCb3R0b21TdGFydCA9IE1hdGgubWF4KHhTdGFydCwgeEVuZClcbiAgICAgICAgYm90dG9tV2lkdGggPSBkYXRhLmNhbnZhc1dpZHRoIC0geEJvdHRvbVN0YXJ0XG5cbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHhTdGFydCwgeVN0YXJ0LCB3aWR0aCwgMSlcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHhCb3R0b21TdGFydCwgeUVuZCwgYm90dG9tV2lkdGgsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgMSwgbGluZUhlaWdodClcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KGNhbnZhc1dpZHRoIC0gMSwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2lkdGggPSBjYW52YXNXaWR0aCAtIHhTdGFydFxuICAgICAgICBib3R0b21XaWR0aCA9IGNhbnZhc1dpZHRoIC0geEVuZFxuXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCgwLCB5U3RhcnQsIHhTdGFydCwgMSlcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIHlFbmQsIHhFbmQsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCgwLCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4RW5kLCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHhTdGFydCA9IHJhbmdlLnN0YXJ0LmNvbHVtbiAqIGNoYXJXaWR0aFxuICAgICAgeEVuZCA9IHJhbmdlLmVuZC5jb2x1bW4gKiBjaGFyV2lkdGhcbiAgICAgIGlmIChzY3JlZW5Sb3cgPT09IHJhbmdlLnN0YXJ0LnJvdykge1xuICAgICAgICB3aWR0aCA9IGNhbnZhc1dpZHRoIC0geFN0YXJ0XG5cbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHhTdGFydCwgeVN0YXJ0LCB3aWR0aCwgMSlcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHhTdGFydCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoY2FudmFzV2lkdGggLSAxLCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICB9IGVsc2UgaWYgKHNjcmVlblJvdyA9PT0gcmFuZ2UuZW5kLnJvdykge1xuICAgICAgICB3aWR0aCA9IGNhbnZhc1dpZHRoIC0geFN0YXJ0XG5cbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIHlFbmQsIHhFbmQsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCgwLCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4RW5kLCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoY2FudmFzV2lkdGggLSAxLCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICAgIGlmIChzY3JlZW5Sb3cgPT09IHJhbmdlLnN0YXJ0LnJvdyArIDEpIHtcbiAgICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgeVN0YXJ0LCB4U3RhcnQsIDEpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjcmVlblJvdyA9PT0gcmFuZ2UuZW5kLnJvdyAtIDEpIHtcbiAgICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeEVuZCwgeUVuZCwgY2FudmFzV2lkdGggLSB4RW5kLCAxKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIGEgY3VzdG9tIGRlY29yYXRpb24uXG4gICAqXG4gICAqIEl0IHJlbmRlcnMgb25seSB0aGUgcGFydCBvZiB0aGUgaGlnaGxpZ2h0IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNwZWNpZmllZFxuICAgKiByb3cuXG4gICAqXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSB0aGUgZGF0YSBuZWVkIHRvIHBlcmZvcm0gdGhlIHJlbmRlclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdDdXN0b21EZWNvcmF0aW9uIChkZWNvcmF0aW9uLCBkYXRhKSB7XG4gICAgY29uc3QgcmVuZGVyUm91dGluZSA9IGRlY29yYXRpb24uZ2V0UHJvcGVydGllcygpLnJlbmRlclxuXG4gICAgaWYgKHJlbmRlclJvdXRpbmUpIHtcbiAgICAgIGRhdGEuY29sb3IgPSB0aGlzLmdldERlY29yYXRpb25Db2xvcihkZWNvcmF0aW9uKVxuICAgICAgcmVuZGVyUm91dGluZShkZWNvcmF0aW9uLCBkYXRhKVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICAgICAjIyMgICAgIyMgICAgIyMgICMjIyMjIyAgICMjIyMjIyMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICAgIyMgIyMgICAjIyMgICAjIyAjIyAgICAjIyAgIyMgICAgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyAgICMjICAjIyMjICAjIyAjIyAgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICMjICAgICAjIyAjIyAjIyAjIyAjIyAgICMjIyMgIyMjIyMjICAgICMjIyMjI1xuICAvLyAgICAjIyAgICMjICAgIyMjIyMjIyMjICMjICAjIyMjICMjICAgICMjICAjIyAgICAgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAjIyAgIyMgICAgICMjICMjICAgIyMjICMjICAgICMjICAjIyAgICAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICMjICAjIyMjIyMgICAjIyMjIyMjIyAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSByYW5nZXMgdGhhdCBhcmUgbm90IGFmZmVjdGVkIGJ5IHRoZSBjdXJyZW50IHBlbmRpbmcgY2hhbmdlcy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IG9mIHRoZSByZW5kZXJlZCByZWdpb25cbiAgICogQHBhcmFtICB7bnVtYmVyfSBsYXN0Um93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmVuZGVyZWQgcmVnaW9uXG4gICAqIEByZXR1cm4ge0FycmF5PE9iamVjdD59IHRoZSBpbnRhY3QgcmFuZ2VzIGluIHRoZSByZW5kZXJlZCByZWdpb25cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjb21wdXRlSW50YWN0UmFuZ2VzIChmaXJzdFJvdywgbGFzdFJvdywgY2hhbmdlcykge1xuICAgIGlmICgodGhpcy5vZmZzY3JlZW5GaXJzdFJvdyA9PSBudWxsKSAmJiAodGhpcy5vZmZzY3JlZW5MYXN0Um93ID09IG51bGwpKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG5cbiAgICAvLyBBdCBmaXJzdCwgdGhlIHdob2xlIHJhbmdlIGlzIGNvbnNpZGVyZWQgaW50YWN0XG4gICAgbGV0IGludGFjdFJhbmdlcyA9IFtcbiAgICAgIHtcbiAgICAgICAgc3RhcnQ6IHRoaXMub2Zmc2NyZWVuRmlyc3RSb3csXG4gICAgICAgIGVuZDogdGhpcy5vZmZzY3JlZW5MYXN0Um93LFxuICAgICAgICBvZmZzY3JlZW5Sb3c6IDBcbiAgICAgIH1cbiAgICBdXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gY2hhbmdlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgY2hhbmdlID0gY2hhbmdlc1tpXVxuICAgICAgY29uc3QgbmV3SW50YWN0UmFuZ2VzID0gW11cblxuICAgICAgZm9yIChsZXQgaiA9IDAsIGludGFjdExlbiA9IGludGFjdFJhbmdlcy5sZW5ndGg7IGogPCBpbnRhY3RMZW47IGorKykge1xuICAgICAgICBjb25zdCByYW5nZSA9IGludGFjdFJhbmdlc1tqXVxuXG4gICAgICAgIGlmIChjaGFuZ2UuZW5kIDwgcmFuZ2Uuc3RhcnQgJiYgY2hhbmdlLnNjcmVlbkRlbHRhICE9PSAwKSB7XG4gICAgICAgICAgLy8gVGhlIGNoYW5nZSBpcyBhYm92ZSBvZiB0aGUgcmFuZ2UgYW5kIGxpbmVzIGFyZSBlaXRoZXJcbiAgICAgICAgICAvLyBhZGRlZCBvciByZW1vdmVkXG4gICAgICAgICAgbmV3SW50YWN0UmFuZ2VzLnB1c2goe1xuICAgICAgICAgICAgc3RhcnQ6IHJhbmdlLnN0YXJ0ICsgY2hhbmdlLnNjcmVlbkRlbHRhLFxuICAgICAgICAgICAgZW5kOiByYW5nZS5lbmQgKyBjaGFuZ2Uuc2NyZWVuRGVsdGEsXG4gICAgICAgICAgICBvZmZzY3JlZW5Sb3c6IHJhbmdlLm9mZnNjcmVlblJvd1xuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAoY2hhbmdlLmVuZCA8IHJhbmdlLnN0YXJ0IHx8IGNoYW5nZS5zdGFydCA+IHJhbmdlLmVuZCkge1xuICAgICAgICAgIC8vIFRoZSBjaGFuZ2UgaXMgb3V0c2lkZSB0aGUgcmFuZ2UgYnV0IGRpZG4ndCBhZGRcbiAgICAgICAgICAvLyBvciByZW1vdmUgbGluZXNcbiAgICAgICAgICBuZXdJbnRhY3RSYW5nZXMucHVzaChyYW5nZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUaGUgY2hhbmdlIGlzIHdpdGhpbiB0aGUgcmFuZ2UsIHRoZXJlJ3Mgb25lIGludGFjdCByYW5nZVxuICAgICAgICAgIC8vIGZyb20gdGhlIHJhbmdlIHN0YXJ0IHRvIHRoZSBjaGFuZ2Ugc3RhcnRcbiAgICAgICAgICBpZiAoY2hhbmdlLnN0YXJ0ID4gcmFuZ2Uuc3RhcnQpIHtcbiAgICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgc3RhcnQ6IHJhbmdlLnN0YXJ0LFxuICAgICAgICAgICAgICBlbmQ6IGNoYW5nZS5zdGFydCAtIDEsXG4gICAgICAgICAgICAgIG9mZnNjcmVlblJvdzogcmFuZ2Uub2Zmc2NyZWVuUm93XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hhbmdlLmVuZCA8IHJhbmdlLmVuZCkge1xuICAgICAgICAgICAgLy8gVGhlIGNoYW5nZSBlbmRzIHdpdGhpbiB0aGUgcmFuZ2VcbiAgICAgICAgICAgIGlmIChjaGFuZ2UuYnVmZmVyRGVsdGEgIT09IDApIHtcbiAgICAgICAgICAgICAgLy8gTGluZXMgYXJlIGFkZGVkIG9yIHJlbW92ZWQsIHRoZSBpbnRhY3QgcmFuZ2Ugc3RhcnRzIGluIHRoZVxuICAgICAgICAgICAgICAvLyBuZXh0IGxpbmUgYWZ0ZXIgdGhlIGNoYW5nZSBlbmQgcGx1cyB0aGUgc2NyZWVuIGRlbHRhXG4gICAgICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzdGFydDogY2hhbmdlLmVuZCArIGNoYW5nZS5zY3JlZW5EZWx0YSArIDEsXG4gICAgICAgICAgICAgICAgZW5kOiByYW5nZS5lbmQgKyBjaGFuZ2Uuc2NyZWVuRGVsdGEsXG4gICAgICAgICAgICAgICAgb2Zmc2NyZWVuUm93OiByYW5nZS5vZmZzY3JlZW5Sb3cgKyBjaGFuZ2UuZW5kICsgMSAtIHJhbmdlLnN0YXJ0XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYW5nZS5zY3JlZW5EZWx0YSAhPT0gMCkge1xuICAgICAgICAgICAgICAvLyBMaW5lcyBhcmUgYWRkZWQgb3IgcmVtb3ZlZCBpbiB0aGUgZGlzcGxheSBidWZmZXIsIHRoZSBpbnRhY3RcbiAgICAgICAgICAgICAgLy8gcmFuZ2Ugc3RhcnRzIGluIHRoZSBuZXh0IGxpbmUgYWZ0ZXIgdGhlIGNoYW5nZSBlbmQgcGx1cyB0aGVcbiAgICAgICAgICAgICAgLy8gc2NyZWVuIGRlbHRhXG4gICAgICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzdGFydDogY2hhbmdlLmVuZCArIGNoYW5nZS5zY3JlZW5EZWx0YSArIDEsXG4gICAgICAgICAgICAgICAgZW5kOiByYW5nZS5lbmQgKyBjaGFuZ2Uuc2NyZWVuRGVsdGEsXG4gICAgICAgICAgICAgICAgb2Zmc2NyZWVuUm93OiByYW5nZS5vZmZzY3JlZW5Sb3cgKyBjaGFuZ2UuZW5kICsgMSAtIHJhbmdlLnN0YXJ0XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBObyBsaW5lcyBhcmUgYWRkZWQsIHRoZSBpbnRhY3QgcmFuZ2Ugc3RhcnRzIG9uIHRoZSBsaW5lIGFmdGVyXG4gICAgICAgICAgICAgIC8vIHRoZSBjaGFuZ2UgZW5kXG4gICAgICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzdGFydDogY2hhbmdlLmVuZCArIDEsXG4gICAgICAgICAgICAgICAgZW5kOiByYW5nZS5lbmQsXG4gICAgICAgICAgICAgICAgb2Zmc2NyZWVuUm93OiByYW5nZS5vZmZzY3JlZW5Sb3cgKyBjaGFuZ2UuZW5kICsgMSAtIHJhbmdlLnN0YXJ0XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpbnRhY3RSYW5nZXMgPSBuZXdJbnRhY3RSYW5nZXNcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50cnVuY2F0ZUludGFjdFJhbmdlcyhpbnRhY3RSYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93KVxuICB9XG5cbiAgLyoqXG4gICAqIFRydW5jYXRlcyB0aGUgaW50YWN0IHJhbmdlcyBzbyB0aGF0IHRoZXkgZG9lc24ndCBleHBhbmQgcGFzdCB0aGUgdmlzaWJsZVxuICAgKiBhcmVhIG9mIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBAcGFyYW0gIHtBcnJheTxPYmplY3Q+fSBpbnRhY3RSYW5nZXMgdGhlIGluaXRpYWwgYXJyYXkgb2YgcmFuZ2VzXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmVuZGVyZWQgcmVnaW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJlbmRlcmVkIHJlZ2lvblxuICAgKiBAcmV0dXJuIHtBcnJheTxPYmplY3Q+fSB0aGUgYXJyYXkgb2YgdHJ1bmNhdGVkIHJhbmdlc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHRydW5jYXRlSW50YWN0UmFuZ2VzIChpbnRhY3RSYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93KSB7XG4gICAgbGV0IGkgPSAwXG4gICAgd2hpbGUgKGkgPCBpbnRhY3RSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCByYW5nZSA9IGludGFjdFJhbmdlc1tpXVxuXG4gICAgICBpZiAocmFuZ2Uuc3RhcnQgPCBmaXJzdFJvdykge1xuICAgICAgICByYW5nZS5vZmZzY3JlZW5Sb3cgKz0gZmlyc3RSb3cgLSByYW5nZS5zdGFydFxuICAgICAgICByYW5nZS5zdGFydCA9IGZpcnN0Um93XG4gICAgICB9XG5cbiAgICAgIGlmIChyYW5nZS5lbmQgPiBsYXN0Um93KSB7IHJhbmdlLmVuZCA9IGxhc3RSb3cgfVxuXG4gICAgICBpZiAocmFuZ2Uuc3RhcnQgPj0gcmFuZ2UuZW5kKSB7IGludGFjdFJhbmdlcy5zcGxpY2UoaS0tLCAxKSB9XG5cbiAgICAgIGkrK1xuICAgIH1cblxuICAgIHJldHVybiBpbnRhY3RSYW5nZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGEub2Zmc2NyZWVuUm93IC0gYi5vZmZzY3JlZW5Sb3dcbiAgICB9KVxuICB9XG59XG4iXX0=
//# sourceURL=/home/key/.atom/packages/minimap/lib/mixins/canvas-drawer.js
