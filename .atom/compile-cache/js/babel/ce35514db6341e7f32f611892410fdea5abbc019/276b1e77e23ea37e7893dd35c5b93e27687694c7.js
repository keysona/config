var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _libMain = require('../lib/main');

var _libMain2 = _interopRequireDefault(_libMain);

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

var _libMinimapElement = require('../lib/minimap-element');

var _libMinimapElement2 = _interopRequireDefault(_libMinimapElement);

var _helpersWorkspace = require('./helpers/workspace');

var _helpersEvents = require('./helpers/events');

'use babel';

function realOffsetTop(o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetTop + transform.m42
  return o.offsetTop;
}

function realOffsetLeft(o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetLeft + transform.m41
  return o.offsetLeft;
}

function sleep(duration) {
  var t = new Date();
  waitsFor(duration + 'ms', function () {
    return new Date() - t > duration;
  });
}

function createPlugin() {
  var plugin = {
    active: false,
    activatePlugin: function activatePlugin() {
      this.active = true;
    },
    deactivatePlugin: function deactivatePlugin() {
      this.active = false;
    },
    isActive: function isActive() {
      return this.active;
    }
  };
  return plugin;
}

describe('MinimapElement', function () {
  var _ref = [];
  var editor = _ref[0];
  var minimap = _ref[1];
  var largeSample = _ref[2];
  var mediumSample = _ref[3];
  var smallSample = _ref[4];
  var jasmineContent = _ref[5];
  var editorElement = _ref[6];
  var minimapElement = _ref[7];
  var dir = _ref[8];

  beforeEach(function () {
    // Comment after body below to leave the created text editor and minimap
    // on DOM after the test run.
    jasmineContent = document.body.querySelector('#jasmine-content');

    atom.config.set('minimap.charHeight', 4);
    atom.config.set('minimap.charWidth', 2);
    atom.config.set('minimap.interline', 1);
    atom.config.set('minimap.textOpacity', 1);
    atom.config.set('minimap.smoothScrolling', true);
    atom.config.set('minimap.adjustMinimapWidthOnlyIfSmaller', true);
    atom.config.set('minimap.plugins', {});

    _libMinimapElement2['default'].registerViewProvider(_libMinimap2['default']);

    editor = atom.workspace.buildTextEditor({});
    editorElement = atom.views.getView(editor);
    jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);
    editorElement.setHeight(50);

    minimap = new _libMinimap2['default']({ textEditor: editor });
    dir = atom.project.getDirectories()[0];

    largeSample = _fsPlus2['default'].readFileSync(dir.resolve('large-file.coffee')).toString();
    mediumSample = _fsPlus2['default'].readFileSync(dir.resolve('two-hundred.txt')).toString();
    smallSample = _fsPlus2['default'].readFileSync(dir.resolve('sample.coffee')).toString();

    editor.setText(largeSample);

    minimapElement = atom.views.getView(minimap);
  });

  it('has been registered in the view registry', function () {
    expect(minimapElement).toExist();
  });

  it('has stored the minimap as its model', function () {
    expect(minimapElement.getModel()).toBe(minimap);
  });

  it('has a canvas in a shadow DOM', function () {
    expect(minimapElement.shadowRoot.querySelector('canvas')).toExist();
  });

  it('has a div representing the visible area', function () {
    expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
  });

  //       ###    ######## ########    ###     ######  ##     ##
  //      ## ##      ##       ##      ## ##   ##    ## ##     ##
  //     ##   ##     ##       ##     ##   ##  ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##       #########
  //    #########    ##       ##    ######### ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  //    ##     ##    ##       ##    ##     ##  ######  ##     ##

  describe('when attached to the text editor element', function () {
    var _ref2 = [];
    var noAnimationFrame = _ref2[0];
    var nextAnimationFrame = _ref2[1];
    var requestAnimationFrameSafe = _ref2[2];
    var canvas = _ref2[3];
    var visibleArea = _ref2[4];

    beforeEach(function () {
      noAnimationFrame = function () {
        throw new Error('No animation frame requested');
      };
      nextAnimationFrame = noAnimationFrame;

      requestAnimationFrameSafe = window.requestAnimationFrame;
      spyOn(window, 'requestAnimationFrame').andCallFake(function (fn) {
        nextAnimationFrame = function () {
          nextAnimationFrame = noAnimationFrame;
          fn();
        };
      });
    });

    beforeEach(function () {
      canvas = minimapElement.shadowRoot.querySelector('canvas');
      editorElement.setWidth(200);
      editorElement.setHeight(50);

      editorElement.setScrollTop(1000);
      editorElement.setScrollLeft(200);
      minimapElement.attach();
    });

    afterEach(function () {
      minimap.destroy();
      window.requestAnimationFrame = requestAnimationFrameSafe;
    });

    it('adds a with-minimap attribute on the text editor element', function () {
      expect(editorElement.hasAttribute('with-minimap')).toBeTruthy();
    });

    it('takes the height of the editor', function () {
      expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight);

      expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 10, 0);
    });

    it('knows when attached to a text editor', function () {
      expect(minimapElement.attachedToTextEditor).toBeTruthy();
    });

    it('resizes the canvas to fit the minimap', function () {
      expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
      expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
    });

    it('requests an update', function () {
      expect(minimapElement.frameRequested).toBeTruthy();
    });

    describe('when detached', function () {
      it('removes the attribute from the editor', function () {
        minimapElement.detach();

        expect(editorElement.hasAttribute('with-minimap')).toBeFalsy();
      });
    });

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    describe('with css filters', function () {
      describe('when a hue-rotate filter is applied to a rgb color', function () {
        var _ref3 = [];
        var additionnalStyleNode = _ref3[0];

        beforeEach(function () {
          minimapElement.invalidateDOMStylesCache();

          additionnalStyleNode = document.createElement('style');
          additionnalStyleNode.textContent = '\n            ' + _helpersWorkspace.stylesheet + '\n\n            .editor {\n              color: red;\n              -webkit-filter: hue-rotate(180deg);\n            }\n          ';

          jasmineContent.appendChild(additionnalStyleNode);
        });

        it('computes the new color by applying the hue rotation', function () {
          waitsFor('new animation frame', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual('rgb(0, ' + 0x6d + ', ' + 0x6d + ')');
          });
        });
      });

      describe('when a hue-rotate filter is applied to a rgba color', function () {
        var _ref4 = [];
        var additionnalStyleNode = _ref4[0];

        beforeEach(function () {
          minimapElement.invalidateDOMStylesCache();

          additionnalStyleNode = document.createElement('style');
          additionnalStyleNode.textContent = '\n            ' + _helpersWorkspace.stylesheet + '\n\n            .editor {\n              color: rgba(255, 0, 0, 0);\n              -webkit-filter: hue-rotate(180deg);\n            }\n          ';

          jasmineContent.appendChild(additionnalStyleNode);
        });

        it('computes the new color by applying the hue rotation', function () {
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual('rgba(0, ' + 0x6d + ', ' + 0x6d + ', 0)');
          });
        });
      });
    });

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    describe('when the update is performed', function () {
      beforeEach(function () {
        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          visibleArea = minimapElement.shadowRoot.querySelector('.minimap-visible-area');
        });
      });

      it('sets the visible area width and height', function () {
        expect(visibleArea.offsetWidth).toEqual(minimapElement.clientWidth);
        expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorScaledHeight(), 0);
      });

      it('sets the visible visible area offset', function () {
        expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);
        expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0);
      });

      it('offsets the canvas when the scroll does not match line height', function () {
        editorElement.setScrollTop(1004);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(realOffsetTop(canvas)).toBeCloseTo(-2, -1);
        });
      });

      it('does not fail to update render the invisible char when modified', function () {
        atom.config.set('editor.showInvisibles', true);
        atom.config.set('editor.invisibles', { cr: '*' });

        expect(function () {
          nextAnimationFrame();
        }).not.toThrow();
      });

      it('renders the decorations based on the order settings', function () {
        atom.config.set('minimap.displayPluginsControls', true);

        var pluginFoo = createPlugin();
        var pluginBar = createPlugin();

        _libMain2['default'].registerPlugin('foo', pluginFoo);
        _libMain2['default'].registerPlugin('bar', pluginBar);

        atom.config.set('minimap.plugins.fooDecorationsZIndex', 1);

        var calls = [];
        spyOn(minimapElement, 'drawLineDecoration').andCallFake(function (d) {
          calls.push(d.getProperties().plugin);
        });
        spyOn(minimapElement, 'drawHighlightDecoration').andCallFake(function (d) {
          calls.push(d.getProperties().plugin);
        });

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'line', color: '#0000FF', plugin: 'bar' });
        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'highlight-under', color: '#0000FF', plugin: 'foo' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(calls).toEqual(['bar', 'foo']);

          atom.config.set('minimap.plugins.fooDecorationsZIndex', -1);

          calls.length = 0;
        });

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });

        runs(function () {
          nextAnimationFrame();

          expect(calls).toEqual(['foo', 'bar']);

          _libMain2['default'].unregisterPlugin('foo');
          _libMain2['default'].unregisterPlugin('bar');
        });
      });

      it('renders the visible line decorations', function () {
        spyOn(minimapElement, 'drawLineDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'line', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), { type: 'line', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), { type: 'line', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawLineDecoration).toHaveBeenCalled();
          expect(minimapElement.drawLineDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible gutter decorations', function () {
        spyOn(minimapElement, 'drawGutterDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'gutter', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), { type: 'gutter', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), { type: 'gutter', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawGutterDecoration).toHaveBeenCalled();
          expect(minimapElement.drawGutterDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible highlight decorations', function () {
        spyOn(minimapElement, 'drawHighlightDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 4]]), { type: 'highlight-under', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[2, 20], [2, 30]]), { type: 'highlight-over', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), { type: 'highlight-under', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawHighlightDecoration).toHaveBeenCalled();
          expect(minimapElement.drawHighlightDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible outline decorations', function () {
        spyOn(minimapElement, 'drawHighlightOutlineDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), { type: 'highlight-outline', color: '#0000ff' });
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), { type: 'highlight-outline', color: '#0000ff' });
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), { type: 'highlight-outline', color: '#0000ff' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawHighlightOutlineDecoration).toHaveBeenCalled();
          expect(minimapElement.drawHighlightOutlineDecoration.calls.length).toEqual(4);
        });
      });

      it('renders the visible custom foreground decorations', function () {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough();

        var renderRoutine = jasmine.createSpy('renderRoutine');

        var properties = {
          type: 'foreground-custom',
          render: renderRoutine
        };

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties);

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled();
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4);

          expect(renderRoutine).toHaveBeenCalled();
          expect(renderRoutine.calls.length).toEqual(4);
        });
      });

      it('renders the visible custom background decorations', function () {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough();

        var renderRoutine = jasmine.createSpy('renderRoutine');

        var properties = {
          type: 'background-custom',
          render: renderRoutine
        };

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties);

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled();
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4);

          expect(renderRoutine).toHaveBeenCalled();
          expect(renderRoutine.calls.length).toEqual(4);
        });
      });

      describe('when the editor is scrolled', function () {
        beforeEach(function () {
          editorElement.setScrollTop(2000);
          editorElement.setScrollLeft(50);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('updates the visible area', function () {
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);

          expect(parseFloat(visibleArea.style.borderLeftWidth)).toEqual(Math.floor(minimap.getTextEditorScaledScrollLeft()));
        });
      });

      describe('when the editor is resized to a greater size', function () {
        beforeEach(function () {
          editorElement.style.width = '800px';
          editorElement.style.height = '500px';

          minimapElement.measureHeightAndWidth();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('detects the resize and adjust itself', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, 0);
          expect(minimapElement.offsetHeight).toEqual(editorElement.offsetHeight);

          expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
          expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
        });
      });

      describe('when the editor visible content is changed', function () {
        beforeEach(function () {
          editorElement.setScrollLeft(0);
          editorElement.setScrollTop(1400);
          editor.setSelectedBufferRange([[101, 0], [102, 20]]);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            spyOn(minimapElement, 'drawLines').andCallThrough();
            editor.insertText('foo');
          });
        });

        it('rerenders the part that have changed', function () {
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            expect(minimapElement.drawLines).toHaveBeenCalled();

            var _minimapElement$drawLines$argsForCall$0 = _slicedToArray(minimapElement.drawLines.argsForCall[0], 2);

            var firstLine = _minimapElement$drawLines$argsForCall$0[0];
            var lastLine = _minimapElement$drawLines$argsForCall$0[1];

            expect(firstLine).toEqual(100);
            expect(lastLine === 102 || lastLine === 111).toBeTruthy();
          });
        });
      });

      describe('when the editor visibility change', function () {
        it('does not modify the size of the canvas', function () {
          var canvasWidth = minimapElement.getFrontCanvas().width;
          var canvasHeight = minimapElement.getFrontCanvas().height;
          editorElement.style.display = 'none';

          minimapElement.measureHeightAndWidth();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            expect(minimapElement.getFrontCanvas().width).toEqual(canvasWidth);
            expect(minimapElement.getFrontCanvas().height).toEqual(canvasHeight);
          });
        });

        describe('from hidden to visible', function () {
          beforeEach(function () {
            editorElement.style.display = 'none';
            minimapElement.checkForVisibilityChange();
            spyOn(minimapElement, 'requestForcedUpdate');
            editorElement.style.display = '';
            minimapElement.pollDOM();
          });

          it('requests an update of the whole minimap', function () {
            expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
          });
        });
      });
    });

    //     ######   ######  ########   #######  ##       ##
    //    ##    ## ##    ## ##     ## ##     ## ##       ##
    //    ##       ##       ##     ## ##     ## ##       ##
    //     ######  ##       ########  ##     ## ##       ##
    //          ## ##       ##   ##   ##     ## ##       ##
    //    ##    ## ##    ## ##    ##  ##     ## ##       ##
    //     ######   ######  ##     ##  #######  ######## ########

    describe('mouse scroll controls', function () {
      beforeEach(function () {
        editorElement.setWidth(400);
        editorElement.setHeight(400);
        editorElement.setScrollTop(0);
        editorElement.setScrollLeft(0);

        nextAnimationFrame();

        minimapElement.measureHeightAndWidth();

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      describe('using the mouse scrollwheel over the minimap', function () {
        it('relays the events to the editor view', function () {
          spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function () {});

          (0, _helpersEvents.mousewheel)(minimapElement, 0, 15);

          expect(editorElement.component.presenter.setScrollTop).toHaveBeenCalled();
        });

        describe('when the independentMinimapScroll setting is true', function () {
          var previousScrollTop = undefined;

          beforeEach(function () {
            atom.config.set('minimap.independentMinimapScroll', true);
            atom.config.set('minimap.scrollSensitivity', 0.5);

            spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function () {});

            previousScrollTop = minimap.getScrollTop();

            (0, _helpersEvents.mousewheel)(minimapElement, 0, -15);
          });

          it('does not relay the events to the editor', function () {
            expect(editorElement.component.presenter.setScrollTop).not.toHaveBeenCalled();
          });

          it('scrolls the minimap instead', function () {
            expect(minimap.getScrollTop()).not.toEqual(previousScrollTop);
          });

          it('clamp the minimap scroll into the legit bounds', function () {
            (0, _helpersEvents.mousewheel)(minimapElement, 0, -100000);

            expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());

            (0, _helpersEvents.mousewheel)(minimapElement, 0, 100000);

            expect(minimap.getScrollTop()).toEqual(0);
          });
        });
      });

      describe('middle clicking the minimap', function () {
        var _ref5 = [];
        var canvas = _ref5[0];
        var visibleArea = _ref5[1];
        var originalLeft = _ref5[2];
        var maxScroll = _ref5[3];

        beforeEach(function () {
          canvas = minimapElement.getFrontCanvas();
          visibleArea = minimapElement.visibleArea;
          originalLeft = visibleArea.getBoundingClientRect().left;
          maxScroll = minimap.getTextEditorMaxScrollTop();
        });

        it('scrolls to the top using the middle mouse button', function () {
          (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: 0, btn: 1 });
          expect(editorElement.getScrollTop()).toEqual(0);
        });

        describe('scrolling to the middle using the middle mouse button', function () {
          var canvasMidY = undefined;

          beforeEach(function () {
            var editorMidY = editorElement.getHeight() / 2.0;

            var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

            var top = _canvas$getBoundingClientRect.top;
            var height = _canvas$getBoundingClientRect.height;

            canvasMidY = top + height / 2.0;
            var actualMidY = Math.min(canvasMidY, editorMidY);
            (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: actualMidY, btn: 1 });
          });

          it('scrolls the editor to the middle', function () {
            var middleScrollTop = Math.round(maxScroll / 2.0);
            expect(editorElement.getScrollTop()).toEqual(middleScrollTop);
          });

          it('updates the visible area to be centered', function () {
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();

              var _visibleArea$getBoundingClientRect = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect.top;
              var height = _visibleArea$getBoundingClientRect.height;

              var visibleCenterY = top + height / 2;
              expect(visibleCenterY).toBeCloseTo(200, 0);
            });
          });
        });

        describe('scrolling the editor to an arbitrary location', function () {
          var _ref6 = [];
          var scrollTo = _ref6[0];
          var scrollRatio = _ref6[1];

          beforeEach(function () {
            scrollTo = 101; // pixels
            scrollRatio = (scrollTo - minimap.getTextEditorScaledHeight() / 2) / (minimap.getVisibleHeight() - minimap.getTextEditorScaledHeight());
            scrollRatio = Math.max(0, scrollRatio);
            scrollRatio = Math.min(1, scrollRatio);

            (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: scrollTo, btn: 1 });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('scrolls the editor to an arbitrary location', function () {
            var expectedScroll = maxScroll * scrollRatio;
            expect(editorElement.getScrollTop()).toBeCloseTo(expectedScroll, 0);
          });

          describe('dragging the visible area with middle mouse button ' + 'after scrolling to the arbitrary location', function () {
            var _ref7 = [];
            var originalTop = _ref7[0];

            beforeEach(function () {
              originalTop = visibleArea.getBoundingClientRect().top;
              (0, _helpersEvents.mousemove)(visibleArea, { x: originalLeft + 1, y: scrollTo + 40, btn: 1 });

              waitsFor('a new animation frame request', function () {
                return nextAnimationFrame !== noAnimationFrame;
              });
              runs(function () {
                nextAnimationFrame();
              });
            });

            afterEach(function () {
              minimapElement.endDrag();
            });

            it('scrolls the editor so that the visible area was moved down ' + 'by 40 pixels from the arbitrary location', function () {
              var _visibleArea$getBoundingClientRect2 = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect2.top;

              expect(top).toBeCloseTo(originalTop + 40, -1);
            });
          });
        });
      });

      describe('pressing the mouse on the minimap canvas (without scroll animation)', function () {
        var canvas = undefined;

        beforeEach(function () {
          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', false);

          canvas = minimapElement.getFrontCanvas();
        });

        it('scrolls the editor to the line below the mouse', function () {
          (0, _helpersEvents.mousedown)(canvas);
          expect(editorElement.getScrollTop()).toBeCloseTo(480);
        });

        describe('when independentMinimapScroll setting is enabled', function () {
          beforeEach(function () {
            minimap.setScrollTop(1000);
            atom.config.set('minimap.independentMinimapScroll', true);
          });

          it('scrolls the editor to the line below the mouse', function () {
            (0, _helpersEvents.mousedown)(canvas);
            expect(editorElement.getScrollTop()).toBeCloseTo(480);
          });
        });
      });

      describe('pressing the mouse on the minimap canvas (with scroll animation)', function () {
        var canvas = undefined;

        beforeEach(function () {
          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', true);
          atom.config.set('minimap.scrollAnimationDuration', 300);

          canvas = minimapElement.getFrontCanvas();
        });

        it('scrolls the editor gradually to the line below the mouse', function () {
          (0, _helpersEvents.mousedown)(canvas);
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          // wait until all animations run out
          waitsFor(function () {
            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
            return editorElement.getScrollTop() >= 480;
          });
        });

        it('stops the animation if the text editor is destroyed', function () {
          (0, _helpersEvents.mousedown)(canvas);
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });

          runs(function () {
            editor.destroy();

            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();

            expect(nextAnimationFrame === noAnimationFrame);
          });
        });

        describe('when independentMinimapScroll setting is enabled', function () {
          beforeEach(function () {
            minimap.setScrollTop(1000);
            atom.config.set('minimap.independentMinimapScroll', true);
          });

          it('scrolls the editor gradually to the line below the mouse', function () {
            (0, _helpersEvents.mousedown)(canvas);
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            // wait until all animations run out
            waitsFor(function () {
              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
              return editorElement.getScrollTop() >= 480;
            });
          });

          it('stops the animation if the text editor is destroyed', function () {
            (0, _helpersEvents.mousedown)(canvas);
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });

            runs(function () {
              editor.destroy();

              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();

              expect(nextAnimationFrame === noAnimationFrame);
            });
          });
        });
      });

      describe('dragging the visible area', function () {
        var _ref8 = [];
        var visibleArea = _ref8[0];
        var originalTop = _ref8[1];

        beforeEach(function () {
          visibleArea = minimapElement.visibleArea;
          var o = visibleArea.getBoundingClientRect();
          var left = o.left;
          originalTop = o.top;

          (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: originalTop + 10 });
          (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: originalTop + 50 });

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        afterEach(function () {
          minimapElement.endDrag();
        });

        it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
          var _visibleArea$getBoundingClientRect3 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect3.top;

          expect(top).toBeCloseTo(originalTop + 40, -1);
        });

        it('stops the drag gesture when the mouse is released outside the minimap', function () {
          var _visibleArea$getBoundingClientRect4 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect4.top;
          var left = _visibleArea$getBoundingClientRect4.left;

          (0, _helpersEvents.mouseup)(jasmineContent, { x: left - 10, y: top + 80 });

          spyOn(minimapElement, 'drag');
          (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });

          expect(minimapElement.drag).not.toHaveBeenCalled();
        });
      });

      describe('dragging the visible area using touch events', function () {
        var _ref9 = [];
        var visibleArea = _ref9[0];
        var originalTop = _ref9[1];

        beforeEach(function () {
          visibleArea = minimapElement.visibleArea;
          var o = visibleArea.getBoundingClientRect();
          var left = o.left;
          originalTop = o.top;

          (0, _helpersEvents.touchstart)(visibleArea, { x: left + 10, y: originalTop + 10 });
          (0, _helpersEvents.touchmove)(visibleArea, { x: left + 10, y: originalTop + 50 });

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        afterEach(function () {
          minimapElement.endDrag();
        });

        it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
          var _visibleArea$getBoundingClientRect5 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect5.top;

          expect(top).toBeCloseTo(originalTop + 40, -1);
        });

        it('stops the drag gesture when the mouse is released outside the minimap', function () {
          var _visibleArea$getBoundingClientRect6 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect6.top;
          var left = _visibleArea$getBoundingClientRect6.left;

          (0, _helpersEvents.mouseup)(jasmineContent, { x: left - 10, y: top + 80 });

          spyOn(minimapElement, 'drag');
          (0, _helpersEvents.touchmove)(visibleArea, { x: left + 10, y: top + 50 });

          expect(minimapElement.drag).not.toHaveBeenCalled();
        });
      });

      describe('when the minimap cannot scroll', function () {
        var _ref10 = [];
        var visibleArea = _ref10[0];
        var originalTop = _ref10[1];

        beforeEach(function () {
          var sample = _fsPlus2['default'].readFileSync(dir.resolve('seventy.txt')).toString();
          editor.setText(sample);
          editorElement.setScrollTop(0);
        });

        describe('dragging the visible area', function () {
          beforeEach(function () {
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();

              visibleArea = minimapElement.visibleArea;

              var _visibleArea$getBoundingClientRect7 = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect7.top;
              var left = _visibleArea$getBoundingClientRect7.left;

              originalTop = top;

              (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: top + 10 });
              (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });
            });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          afterEach(function () {
            minimapElement.endDrag();
          });

          it('scrolls based on a ratio adjusted to the minimap height', function () {
            var _visibleArea$getBoundingClientRect8 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect8.top;

            expect(top).toBeCloseTo(originalTop + 40, -1);
          });
        });
      });

      describe('when scroll past end is enabled', function () {
        beforeEach(function () {
          atom.config.set('editor.scrollPastEnd', true);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        describe('dragging the visible area', function () {
          var _ref11 = [];
          var originalTop = _ref11[0];
          var visibleArea = _ref11[1];

          beforeEach(function () {
            visibleArea = minimapElement.visibleArea;

            var _visibleArea$getBoundingClientRect9 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect9.top;
            var left = _visibleArea$getBoundingClientRect9.left;

            originalTop = top;

            (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: top + 10 });
            (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          afterEach(function () {
            minimapElement.endDrag();
          });

          it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
            var _visibleArea$getBoundingClientRect10 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect10.top;

            expect(top).toBeCloseTo(originalTop + 40, -1);
          });
        });
      });
    });

    //     ######  ########    ###    ##    ## ########
    //    ##    ##    ##      ## ##   ###   ## ##     ##
    //    ##          ##     ##   ##  ####  ## ##     ##
    //     ######     ##    ##     ## ## ## ## ##     ##
    //          ##    ##    ######### ##  #### ##     ##
    //    ##    ##    ##    ##     ## ##   ### ##     ##
    //     ######     ##    ##     ## ##    ## ########
    //
    //       ###    ##        #######  ##    ## ########
    //      ## ##   ##       ##     ## ###   ## ##
    //     ##   ##  ##       ##     ## ####  ## ##
    //    ##     ## ##       ##     ## ## ## ## ######
    //    ######### ##       ##     ## ##  #### ##
    //    ##     ## ##       ##     ## ##   ### ##
    //    ##     ## ########  #######  ##    ## ########

    describe('when the model is a stand-alone minimap', function () {
      beforeEach(function () {
        minimap.setStandAlone(true);
      });

      it('has a stand-alone attribute', function () {
        expect(minimapElement.hasAttribute('stand-alone')).toBeTruthy();
      });

      it('sets the minimap size when measured', function () {
        minimapElement.measureHeightAndWidth();

        expect(minimap.width).toEqual(minimapElement.clientWidth);
        expect(minimap.height).toEqual(minimapElement.clientHeight);
      });

      it('removes the controls div', function () {
        expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toBeNull();
      });

      it('removes the visible area', function () {
        expect(minimapElement.visibleArea).toBeUndefined();
      });

      it('removes the quick settings button', function () {
        atom.config.set('minimap.displayPluginsControls', true);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          expect(minimapElement.openQuickSettings).toBeUndefined();
        });
      });

      it('removes the scroll indicator', function () {
        editor.setText(mediumSample);
        editorElement.setScrollTop(50);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
          atom.config.set('minimap.minimapScrollIndicator', true);
        });

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toBeNull();
        });
      });

      describe('pressing the mouse on the minimap canvas', function () {
        beforeEach(function () {
          jasmineContent.appendChild(minimapElement);

          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', false);

          canvas = minimapElement.getFrontCanvas();
          (0, _helpersEvents.mousedown)(canvas);
        });

        it('does not scroll the editor to the line below the mouse', function () {
          expect(editorElement.getScrollTop()).toEqual(1000);
        });
      });

      describe('and is changed to be a classical minimap again', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', true);
          atom.config.set('minimap.minimapScrollIndicator', true);

          minimap.setStandAlone(false);
        });

        it('recreates the destroyed elements', function () {
          expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
        });
      });
    });

    //    ########  ########  ######  ######## ########   #######  ##    ##
    //    ##     ## ##       ##    ##    ##    ##     ## ##     ##  ##  ##
    //    ##     ## ##       ##          ##    ##     ## ##     ##   ####
    //    ##     ## ######    ######     ##    ########  ##     ##    ##
    //    ##     ## ##             ##    ##    ##   ##   ##     ##    ##
    //    ##     ## ##       ##    ##    ##    ##    ##  ##     ##    ##
    //    ########  ########  ######     ##    ##     ##  #######     ##

    describe('when the model is destroyed', function () {
      beforeEach(function () {
        minimap.destroy();
      });

      it('detaches itself from its parent', function () {
        expect(minimapElement.parentNode).toBeNull();
      });

      it('stops the DOM polling interval', function () {
        spyOn(minimapElement, 'pollDOM');

        sleep(200);

        runs(function () {
          expect(minimapElement.pollDOM).not.toHaveBeenCalled();
        });
      });
    });

    //     ######   #######  ##    ## ######## ####  ######
    //    ##    ## ##     ## ###   ## ##        ##  ##    ##
    //    ##       ##     ## ####  ## ##        ##  ##
    //    ##       ##     ## ## ## ## ######    ##  ##   ####
    //    ##       ##     ## ##  #### ##        ##  ##    ##
    //    ##    ## ##     ## ##   ### ##        ##  ##    ##
    //     ######   #######  ##    ## ##       ####  ######

    describe('when the atom styles are changed', function () {
      beforeEach(function () {
        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          spyOn(minimapElement, 'invalidateDOMStylesCache').andCallThrough();

          var styleNode = document.createElement('style');
          styleNode.textContent = 'body{ color: #233 }';
          atom.styles.emitter.emit('did-add-style-element', styleNode);
        });

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
      });

      it('forces a refresh with cache invalidation', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        expect(minimapElement.invalidateDOMStylesCache).toHaveBeenCalled();
      });
    });

    describe('when minimap.textOpacity is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.textOpacity', 0.3);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.displayCodeHighlights is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.displayCodeHighlights', true);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.charWidth is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.charWidth', 1);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.charHeight is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.charHeight', 1);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.interline is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.interline', 2);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.displayMinimapOnLeft setting is true', function () {
      it('moves the attached minimap to the left', function () {
        atom.config.set('minimap.displayMinimapOnLeft', true);
        expect(minimapElement.classList.contains('left')).toBeTruthy();
      });

      describe('when the minimap is not attached yet', function () {
        beforeEach(function () {
          editor = atom.workspace.buildTextEditor({});
          editorElement = atom.views.getView(editor);
          editorElement.setHeight(50);
          editor.setLineHeightInPixels(10);

          minimap = new _libMinimap2['default']({ textEditor: editor });
          minimapElement = atom.views.getView(minimap);

          jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);

          atom.config.set('minimap.displayMinimapOnLeft', true);
          minimapElement.attach();
        });

        it('moves the attached minimap to the left', function () {
          expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
      });
    });

    describe('when minimap.adjustMinimapWidthToSoftWrap is true', function () {
      beforeEach(function () {
        atom.config.set('editor.softWrap', true);
        atom.config.set('editor.softWrapAtPreferredLineLength', true);
        atom.config.set('editor.preferredLineLength', 2);

        atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('adjusts the width of the minimap canvas', function () {
        expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4);
      });

      it('offsets the minimap by the difference', function () {
        expect(realOffsetLeft(minimapElement)).toBeCloseTo(editorElement.clientWidth - 4, -1);
        expect(minimapElement.clientWidth).toEqual(4);
      });

      describe('the dom polling routine', function () {
        it('does not change the value', function () {
          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4);
          });
        });
      });

      describe('when the editor is resized', function () {
        beforeEach(function () {
          atom.config.set('editor.preferredLineLength', 6);
          editorElement.style.width = '100px';
          editorElement.style.height = '100px';

          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('makes the minimap smaller than soft wrap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(12, -1);
          expect(minimapElement.style.marginRight).toEqual('');
        });
      });

      describe('and when minimap.minimapScrollIndicator setting is true', function () {
        beforeEach(function () {
          editor.setText(mediumSample);
          editorElement.setScrollTop(50);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
            atom.config.set('minimap.minimapScrollIndicator', true);
          });

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('offsets the scroll indicator by the difference', function () {
          var indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
          expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1);
        });
      });

      describe('and when minimap.displayPluginsControls setting is true', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', true);
        });

        it('offsets the scroll indicator by the difference', function () {
          var openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          expect(realOffsetLeft(openQuickSettings)).not.toBeCloseTo(2, -1);
        });
      });

      describe('and then disabled', function () {
        beforeEach(function () {
          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the width of the minimap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
          expect(minimapElement.style.width).toEqual('');
        });
      });

      describe('and when preferredLineLength >= 16384', function () {
        beforeEach(function () {
          atom.config.set('editor.preferredLineLength', 16384);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the width of the minimap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
          expect(minimapElement.style.width).toEqual('');
        });
      });

      describe('when adjustMinimapWidthOnlyIfSmaller is disabled', function () {
        describe('and when preferredLineLength >= 16384', function () {
          beforeEach(function () {
            atom.config.set('minimap.adjustMinimapWidthOnlyIfSmaller', false);
            atom.config.set('editor.preferredLineLength', 16384);

            waitsFor('minimap frame requested', function () {
              return minimapElement.frameRequested;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('adjusts the width of the minimap', function () {
            expect(minimapElement.offsetWidth).toBeCloseTo(16384 * 2);
            expect(minimapElement.style.width).toEqual(16384 * 2 + 'px');
          });
        });
      });
    });

    describe('when minimap.minimapScrollIndicator setting is true', function () {
      beforeEach(function () {
        editor.setText(mediumSample);
        editorElement.setScrollTop(50);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });

        atom.config.set('minimap.minimapScrollIndicator', true);
      });

      it('adds a scroll indicator in the element', function () {
        expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
      });

      describe('and then deactivated', function () {
        it('removes the scroll indicator from the element', function () {
          atom.config.set('minimap.minimapScrollIndicator', false);
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
        });
      });

      describe('on update', function () {
        beforeEach(function () {
          editorElement.style.height = '500px';

          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the size and position of the indicator', function () {
          var indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');

          var height = editorElement.getHeight() * (editorElement.getHeight() / minimap.getHeight());
          var scroll = (editorElement.getHeight() - height) * minimap.getTextEditorScrollRatio();

          expect(indicator.offsetHeight).toBeCloseTo(height, 0);
          expect(realOffsetTop(indicator)).toBeCloseTo(scroll, 0);
        });
      });

      describe('when the minimap cannot scroll', function () {
        beforeEach(function () {
          editor.setText(smallSample);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('removes the scroll indicator', function () {
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
        });

        describe('and then can scroll again', function () {
          beforeEach(function () {
            editor.setText(largeSample);

            waitsFor('minimap frame requested', function () {
              return minimapElement.frameRequested;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('attaches the scroll indicator', function () {
            waitsFor('minimap scroll indicator', function () {
              return minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
            });
          });
        });
      });
    });

    describe('when minimap.absoluteMode setting is true', function () {
      beforeEach(function () {
        atom.config.set('minimap.absoluteMode', true);
      });

      it('adds a absolute class to the minimap element', function () {
        expect(minimapElement.classList.contains('absolute')).toBeTruthy();
      });

      describe('when minimap.displayMinimapOnLeft setting is true', function () {
        it('also adds a left class to the minimap element', function () {
          atom.config.set('minimap.displayMinimapOnLeft', true);
          expect(minimapElement.classList.contains('absolute')).toBeTruthy();
          expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
      });

      describe('when minimap.adjustAbsoluteModeHeight setting is true', function () {
        beforeEach(function () {
          atom.config.set('minimap.adjustAbsoluteModeHeight', true);
        });
        describe('when the content of the minimap is smaller that the editor height', function () {
          beforeEach(function () {
            editor.setText(smallSample);
            editorElement.setHeight(400);
            minimapElement.measureHeightAndWidth();

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });

            runs(function () {
              return nextAnimationFrame();
            });
          });
          it('adjusts the canvas height to the minimap height', function () {
            expect(minimapElement.shadowRoot.querySelector('canvas').offsetHeight).toEqual(minimap.getHeight());
          });

          describe('when the content is modified', function () {
            beforeEach(function () {
              editor.insertText('foo\n\nbar\n');

              waitsFor('a new animation frame request', function () {
                return nextAnimationFrame !== noAnimationFrame;
              });

              runs(function () {
                return nextAnimationFrame();
              });
            });

            it('adjusts the canvas height to the new minimap height', function () {
              expect(minimapElement.shadowRoot.querySelector('canvas').offsetHeight).toEqual(minimap.getHeight());
            });
          });
        });
      });
    });

    describe('when the smoothScrolling setting is disabled', function () {
      beforeEach(function () {
        atom.config.set('minimap.smoothScrolling', false);
      });
      it('does not offset the canvas when the scroll does not match line height', function () {
        editorElement.setScrollTop(1004);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(realOffsetTop(canvas)).toEqual(0);
        });
      });
    });

    //     #######  ##     ## ####  ######  ##    ##
    //    ##     ## ##     ##  ##  ##    ## ##   ##
    //    ##     ## ##     ##  ##  ##       ##  ##
    //    ##     ## ##     ##  ##  ##       #####
    //    ##  ## ## ##     ##  ##  ##       ##  ##
    //    ##    ##  ##     ##  ##  ##    ## ##   ##
    //     ##### ##  #######  ####  ######  ##    ##
    //
    //     ######  ######## ######## ######## #### ##    ##  ######    ######
    //    ##    ## ##          ##       ##     ##  ###   ## ##    ##  ##    ##
    //    ##       ##          ##       ##     ##  ####  ## ##        ##
    //     ######  ######      ##       ##     ##  ## ## ## ##   ####  ######
    //          ## ##          ##       ##     ##  ##  #### ##    ##        ##
    //    ##    ## ##          ##       ##     ##  ##   ### ##    ##  ##    ##
    //     ######  ########    ##       ##    #### ##    ##  ######    ######

    describe('when minimap.displayPluginsControls setting is true', function () {
      var _ref12 = [];
      var openQuickSettings = _ref12[0];
      var quickSettingsElement = _ref12[1];
      var workspaceElement = _ref12[2];

      beforeEach(function () {
        atom.config.set('minimap.displayPluginsControls', true);
      });

      it('has a div to open the quick settings', function () {
        expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
      });

      describe('clicking on the div', function () {
        beforeEach(function () {
          workspaceElement = atom.views.getView(atom.workspace);
          jasmineContent.appendChild(workspaceElement);

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          (0, _helpersEvents.mousedown)(openQuickSettings);

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
        });

        afterEach(function () {
          minimapElement.quickSettingsElement.destroy();
        });

        it('opens the quick settings view', function () {
          expect(quickSettingsElement).toExist();
        });

        it('positions the quick settings view next to the minimap', function () {
          var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();
          var settingsBounds = quickSettingsElement.getBoundingClientRect();

          expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
          expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.left - settingsBounds.width, 0);
        });
      });

      describe('when the displayMinimapOnLeft setting is enabled', function () {
        describe('clicking on the div', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);

            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            (0, _helpersEvents.mousedown)(openQuickSettings);

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });

          afterEach(function () {
            minimapElement.quickSettingsElement.destroy();
          });

          it('positions the quick settings view next to the minimap', function () {
            var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();

            expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
            expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
          });
        });
      });

      describe('when the adjustMinimapWidthToSoftWrap setting is enabled', function () {
        var _ref13 = [];
        var controls = _ref13[0];

        beforeEach(function () {
          atom.config.set('editor.softWrap', true);
          atom.config.set('editor.softWrapAtPreferredLineLength', true);
          atom.config.set('editor.preferredLineLength', 2);

          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);
          nextAnimationFrame();

          controls = minimapElement.shadowRoot.querySelector('.minimap-controls');
          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');

          editorElement.style.width = '1024px';

          atom.views.performDocumentPoll();
          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the size of the control div to fit in the minimap', function () {
          expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio);
        });

        it('positions the controls div over the canvas', function () {
          var controlsRect = controls.getBoundingClientRect();
          var canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect();
          expect(controlsRect.left).toEqual(canvasRect.left);
          expect(controlsRect.right).toEqual(canvasRect.right);
        });

        describe('when the displayMinimapOnLeft setting is enabled', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);
          });

          it('adjusts the size of the control div to fit in the minimap', function () {
            expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio);
          });

          it('positions the controls div over the canvas', function () {
            var controlsRect = controls.getBoundingClientRect();
            var canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect();
            expect(controlsRect.left).toEqual(canvasRect.left);
            expect(controlsRect.right).toEqual(canvasRect.right);
          });

          describe('clicking on the div', function () {
            beforeEach(function () {
              workspaceElement = atom.views.getView(atom.workspace);
              jasmineContent.appendChild(workspaceElement);

              openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
              (0, _helpersEvents.mousedown)(openQuickSettings);

              quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
            });

            afterEach(function () {
              minimapElement.quickSettingsElement.destroy();
            });

            it('positions the quick settings view next to the minimap', function () {
              var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();

              expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
              expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
            });
          });
        });
      });

      describe('when the quick settings view is open', function () {
        beforeEach(function () {
          workspaceElement = atom.views.getView(atom.workspace);
          jasmineContent.appendChild(workspaceElement);

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          (0, _helpersEvents.mousedown)(openQuickSettings);

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
        });

        it('sets the on right button active', function () {
          expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
        });

        describe('clicking on the code highlight item', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('li.code-highlights');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the code highlights on the minimap element', function () {
            expect(minimapElement.displayCodeHighlights).toBeTruthy();
          });

          it('requests an update', function () {
            expect(minimapElement.frameRequested).toBeTruthy();
          });
        });

        describe('clicking on the absolute mode item', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('li.absolute-mode');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the absolute-mode setting', function () {
            expect(atom.config.get('minimap.absoluteMode')).toBeTruthy();
            expect(minimapElement.absoluteMode).toBeTruthy();
          });
        });

        describe('clicking on the on left button', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('.btn:first-child');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
          });
        });

        describe('core:move-left', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-left');
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
          });
        });

        describe('core:move-right when the minimap is on the right', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);
            atom.commands.dispatch(quickSettingsElement, 'core:move-right');
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeFalsy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
          });
        });

        describe('clicking on the open settings button again', function () {
          beforeEach(function () {
            (0, _helpersEvents.mousedown)(openQuickSettings);
          });

          it('closes the quick settings view', function () {
            expect(workspaceElement.querySelector('minimap-quick-settings')).not.toExist();
          });

          it('removes the view from the element', function () {
            expect(minimapElement.quickSettingsElement).toBeNull();
          });
        });

        describe('when an external event destroys the view', function () {
          beforeEach(function () {
            minimapElement.quickSettingsElement.destroy();
          });

          it('removes the view reference from the element', function () {
            expect(minimapElement.quickSettingsElement).toBeNull();
          });
        });
      });

      describe('then disabling it', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', false);
        });

        it('removes the div', function () {
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).not.toExist();
        });
      });

      describe('with plugins registered in the package', function () {
        var _ref14 = [];
        var minimapPackage = _ref14[0];
        var pluginA = _ref14[1];
        var pluginB = _ref14[2];

        beforeEach(function () {
          waitsForPromise(function () {
            return atom.packages.activatePackage('minimap').then(function (pkg) {
              minimapPackage = pkg.mainModule;
            });
          });

          runs(function () {
            var Plugin = (function () {
              function Plugin() {
                _classCallCheck(this, Plugin);

                this.active = false;
              }

              _createClass(Plugin, [{
                key: 'activatePlugin',
                value: function activatePlugin() {
                  this.active = true;
                }
              }, {
                key: 'deactivatePlugin',
                value: function deactivatePlugin() {
                  this.active = false;
                }
              }, {
                key: 'isActive',
                value: function isActive() {
                  return this.active;
                }
              }]);

              return Plugin;
            })();

            pluginA = new Plugin();
            pluginB = new Plugin();

            minimapPackage.registerPlugin('dummyA', pluginA);
            minimapPackage.registerPlugin('dummyB', pluginB);

            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            (0, _helpersEvents.mousedown)(openQuickSettings);

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });
        });

        it('creates one list item for each registered plugin', function () {
          expect(quickSettingsElement.querySelectorAll('li').length).toEqual(6);
        });

        it('selects the first item of the list', function () {
          expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
        });

        describe('core:confirm', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:confirm');
          });

          it('disable the plugin of the selected item', function () {
            expect(pluginA.isActive()).toBeFalsy();
          });

          describe('triggered a second time', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('enable the plugin of the selected item', function () {
              expect(pluginA.isActive()).toBeTruthy();
            });
          });

          describe('on the code highlight item', function () {
            var _ref15 = [];
            var initial = _ref15[0];

            beforeEach(function () {
              initial = minimapElement.displayCodeHighlights;
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(minimapElement.displayCodeHighlights).toEqual(!initial);
            });
          });

          describe('on the absolute mode item', function () {
            var _ref16 = [];
            var initial = _ref16[0];

            beforeEach(function () {
              initial = atom.config.get('minimap.absoluteMode');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(atom.config.get('minimap.absoluteMode')).toEqual(!initial);
            });
          });

          describe('on the adjust absolute mode height item', function () {
            var _ref17 = [];
            var initial = _ref17[0];

            beforeEach(function () {
              initial = atom.config.get('minimap.adjustAbsoluteModeHeight');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(atom.config.get('minimap.adjustAbsoluteModeHeight')).toEqual(!initial);
            });
          });
        });

        describe('core:move-down', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-down');
          });

          it('selects the second item', function () {
            expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
          });

          describe('reaching a separator', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });

            it('moves past the separator', function () {
              expect(quickSettingsElement.querySelector('li.code-highlights.selected')).toExist();
            });
          });

          describe('then core:move-up', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });

            it('selects again the first item of the list', function () {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
            });
          });
        });

        describe('core:move-up', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-up');
          });

          it('selects the last item', function () {
            expect(quickSettingsElement.querySelector('li.selected:last-child')).toExist();
          });

          describe('reaching a separator', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });

            it('moves past the separator', function () {
              expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
            });
          });

          describe('then core:move-down', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });

            it('selects again the first item of the list', function () {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
            });
          });
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1lbGVtZW50LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7c0JBRWUsU0FBUzs7Ozt1QkFDUCxhQUFhOzs7OzBCQUNWLGdCQUFnQjs7OztpQ0FDVCx3QkFBd0I7Ozs7Z0NBQzFCLHFCQUFxQjs7NkJBQ2lDLGtCQUFrQjs7QUFQakcsV0FBVyxDQUFBOztBQVNYLFNBQVMsYUFBYSxDQUFFLENBQUMsRUFBRTs7O0FBR3pCLFNBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQTtDQUNuQjs7QUFFRCxTQUFTLGNBQWMsQ0FBRSxDQUFDLEVBQUU7OztBQUcxQixTQUFPLENBQUMsQ0FBQyxVQUFVLENBQUE7Q0FDcEI7O0FBRUQsU0FBUyxLQUFLLENBQUUsUUFBUSxFQUFFO0FBQ3hCLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUE7QUFDcEIsVUFBUSxDQUFJLFFBQVEsU0FBTSxZQUFNO0FBQUUsV0FBTyxJQUFJLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUE7R0FBRSxDQUFDLENBQUE7Q0FDdEU7O0FBRUQsU0FBUyxZQUFZLEdBQUk7QUFDdkIsTUFBTSxNQUFNLEdBQUc7QUFDYixVQUFNLEVBQUUsS0FBSztBQUNiLGtCQUFjLEVBQUMsMEJBQUc7QUFBRSxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtLQUFFO0FBQ3hDLG9CQUFnQixFQUFDLDRCQUFHO0FBQUUsVUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7S0FBRTtBQUMzQyxZQUFRLEVBQUMsb0JBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7S0FBRTtHQUNuQyxDQUFBO0FBQ0QsU0FBTyxNQUFNLENBQUE7Q0FDZDs7QUFFRCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBTTthQUNxRixFQUFFO01BQWpILE1BQU07TUFBRSxPQUFPO01BQUUsV0FBVztNQUFF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RUFBRSxZQUFNO0FBQ3BDLHNCQUFVLENBQUMsWUFBTTtBQUNmLGtCQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO2FBQy9ELENBQUMsQ0FBQTs7QUFFRixjQUFFLENBQUMsMENBQTBDLEVBQUUsWUFBTTtBQUNuRCxvQkFBTSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7YUFDaEYsQ0FBQyxDQUFBO1dBQ0gsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1lbGVtZW50LXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cydcbmltcG9ydCBNYWluIGZyb20gJy4uL2xpYi9tYWluJ1xuaW1wb3J0IE1pbmltYXAgZnJvbSAnLi4vbGliL21pbmltYXAnXG5pbXBvcnQgTWluaW1hcEVsZW1lbnQgZnJvbSAnLi4vbGliL21pbmltYXAtZWxlbWVudCdcbmltcG9ydCB7c3R5bGVzaGVldH0gZnJvbSAnLi9oZWxwZXJzL3dvcmtzcGFjZSdcbmltcG9ydCB7bW91c2Vtb3ZlLCBtb3VzZWRvd24sIG1vdXNldXAsIG1vdXNld2hlZWwsIHRvdWNoc3RhcnQsIHRvdWNobW92ZX0gZnJvbSAnLi9oZWxwZXJzL2V2ZW50cydcblxuZnVuY3Rpb24gcmVhbE9mZnNldFRvcCAobykge1xuICAvLyB0cmFuc2Zvcm0gPSBuZXcgV2ViS2l0Q1NTTWF0cml4IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG8pLnRyYW5zZm9ybVxuICAvLyBvLm9mZnNldFRvcCArIHRyYW5zZm9ybS5tNDJcbiAgcmV0dXJuIG8ub2Zmc2V0VG9wXG59XG5cbmZ1bmN0aW9uIHJlYWxPZmZzZXRMZWZ0IChvKSB7XG4gIC8vIHRyYW5zZm9ybSA9IG5ldyBXZWJLaXRDU1NNYXRyaXggd2luZG93LmdldENvbXB1dGVkU3R5bGUobykudHJhbnNmb3JtXG4gIC8vIG8ub2Zmc2V0TGVmdCArIHRyYW5zZm9ybS5tNDFcbiAgcmV0dXJuIG8ub2Zmc2V0TGVmdFxufVxuXG5mdW5jdGlvbiBzbGVlcCAoZHVyYXRpb24pIHtcbiAgY29uc3QgdCA9IG5ldyBEYXRlKClcbiAgd2FpdHNGb3IoYCR7ZHVyYXRpb259bXNgLCAoKSA9PiB7IHJldHVybiBuZXcgRGF0ZSgpIC0gdCA+IGR1cmF0aW9uIH0pXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBsdWdpbiAoKSB7XG4gIGNvbnN0IHBsdWdpbiA9IHtcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfSxcbiAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gIH1cbiAgcmV0dXJuIHBsdWdpblxufVxuXG5kZXNjcmliZSgnTWluaW1hcEVsZW1lbnQnLCAoKSA9PiB7XG4gIGxldCBbZWRpdG9yLCBtaW5pbWFwLCBsYXJnZVNhbXBsZSwgbWVkaXVtU2FtcGxlLCBzbWFsbFNhbXBsZSwgamFzbWluZUNvbnRlbnQsIGVkaXRvckVsZW1lbnQsIG1pbmltYXBFbGVtZW50LCBkaXJdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAvLyBDb21tZW50IGFmdGVyIGJvZHkgYmVsb3cgdG8gbGVhdmUgdGhlIGNyZWF0ZWQgdGV4dCBlZGl0b3IgYW5kIG1pbmltYXBcbiAgICAvLyBvbiBET00gYWZ0ZXIgdGhlIHRlc3QgcnVuLlxuICAgIGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcblxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFySGVpZ2h0JywgNClcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhcldpZHRoJywgMilcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW50ZXJsaW5lJywgMSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAudGV4dE9wYWNpdHknLCAxKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zbW9vdGhTY3JvbGxpbmcnLCB0cnVlKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhPbmx5SWZTbWFsbGVyJywgdHJ1ZSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucycsIHt9KVxuXG4gICAgTWluaW1hcEVsZW1lbnQucmVnaXN0ZXJWaWV3UHJvdmlkZXIoTWluaW1hcClcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7fSlcbiAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICBqYXNtaW5lQ29udGVudC5pbnNlcnRCZWZvcmUoZWRpdG9yRWxlbWVudCwgamFzbWluZUNvbnRlbnQuZmlyc3RDaGlsZClcbiAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg1MClcblxuICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcjogZWRpdG9yfSlcbiAgICBkaXIgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXVxuXG4gICAgbGFyZ2VTYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ2xhcmdlLWZpbGUuY29mZmVlJykpLnRvU3RyaW5nKClcbiAgICBtZWRpdW1TYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ3R3by1odW5kcmVkLnR4dCcpKS50b1N0cmluZygpXG4gICAgc21hbGxTYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ3NhbXBsZS5jb2ZmZWUnKSkudG9TdHJpbmcoKVxuXG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuICB9KVxuXG4gIGl0KCdoYXMgYmVlbiByZWdpc3RlcmVkIGluIHRoZSB2aWV3IHJlZ2lzdHJ5JywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudCkudG9FeGlzdCgpXG4gIH0pXG5cbiAgaXQoJ2hhcyBzdG9yZWQgdGhlIG1pbmltYXAgYXMgaXRzIG1vZGVsJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRNb2RlbCgpKS50b0JlKG1pbmltYXApXG4gIH0pXG5cbiAgaXQoJ2hhcyBhIGNhbnZhcyBpbiBhIHNoYWRvdyBET00nLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignY2FudmFzJykpLnRvRXhpc3QoKVxuICB9KVxuXG4gIGl0KCdoYXMgYSBkaXYgcmVwcmVzZW50aW5nIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtdmlzaWJsZS1hcmVhJykpLnRvRXhpc3QoKVxuICB9KVxuXG4gIC8vICAgICAgICMjIyAgICAjIyMjIyMjIyAjIyMjIyMjIyAgICAjIyMgICAgICMjIyMjIyAgIyMgICAgICMjXG4gIC8vICAgICAgIyMgIyMgICAgICAjIyAgICAgICAjIyAgICAgICMjICMjICAgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICAjIyAgICMjICAgICAjIyAgICAgICAjIyAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMjIyMjIyMjXG4gIC8vICAgICMjIyMjIyMjIyAgICAjIyAgICAgICAjIyAgICAjIyMjIyMjIyMgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgICMjIyMjIyAgIyMgICAgICMjXG5cbiAgZGVzY3JpYmUoJ3doZW4gYXR0YWNoZWQgdG8gdGhlIHRleHQgZWRpdG9yIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgbGV0IFtub0FuaW1hdGlvbkZyYW1lLCBuZXh0QW5pbWF0aW9uRnJhbWUsIHJlcXVlc3RBbmltYXRpb25GcmFtZVNhZmUsIGNhbnZhcywgdmlzaWJsZUFyZWFdID0gW11cblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgbm9BbmltYXRpb25GcmFtZSA9ICgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdGVkJylcbiAgICAgIH1cbiAgICAgIG5leHRBbmltYXRpb25GcmFtZSA9IG5vQW5pbWF0aW9uRnJhbWVcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lU2FmZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgIHNweU9uKHdpbmRvdywgJ3JlcXVlc3RBbmltYXRpb25GcmFtZScpLmFuZENhbGxGYWtlKChmbikgPT4ge1xuICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lID0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIGZuKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDIwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDUwKVxuXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDIwMClcbiAgICAgIG1pbmltYXBFbGVtZW50LmF0dGFjaCgpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICBtaW5pbWFwLmRlc3Ryb3koKVxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZVNhZmVcbiAgICB9KVxuXG4gICAgaXQoJ2FkZHMgYSB3aXRoLW1pbmltYXAgYXR0cmlidXRlIG9uIHRoZSB0ZXh0IGVkaXRvciBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuaGFzQXR0cmlidXRlKCd3aXRoLW1pbmltYXAnKSkudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIGl0KCd0YWtlcyB0aGUgaGVpZ2h0IG9mIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0SGVpZ2h0KS50b0VxdWFsKGVkaXRvckVsZW1lbnQuY2xpZW50SGVpZ2h0KVxuXG4gICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQuY2xpZW50V2lkdGggLyAxMCwgMClcbiAgICB9KVxuXG4gICAgaXQoJ2tub3dzIHdoZW4gYXR0YWNoZWQgdG8gYSB0ZXh0IGVkaXRvcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5hdHRhY2hlZFRvVGV4dEVkaXRvcikudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIGl0KCdyZXNpemVzIHRoZSBjYW52YXMgdG8gZml0IHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRIZWlnaHQgKyBtaW5pbWFwLmdldExpbmVIZWlnaHQoKSwgMClcbiAgICAgIGV4cGVjdChjYW52YXMub2Zmc2V0V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCwgMClcbiAgICB9KVxuXG4gICAgaXQoJ3JlcXVlc3RzIGFuIHVwZGF0ZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCkudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIGRldGFjaGVkJywgKCkgPT4ge1xuICAgICAgaXQoJ3JlbW92ZXMgdGhlIGF0dHJpYnV0ZSBmcm9tIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICAgIG1pbmltYXBFbGVtZW50LmRldGFjaCgpXG5cbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuaGFzQXR0cmlidXRlKCd3aXRoLW1pbmltYXAnKSkudG9CZUZhbHN5KClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgICMjIyMjIyAgICMjIyMjI1xuICAgIC8vICAgICMjICAgICAgICAgICAgICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2l0aCBjc3MgZmlsdGVycycsICgpID0+IHtcbiAgICAgIGRlc2NyaWJlKCd3aGVuIGEgaHVlLXJvdGF0ZSBmaWx0ZXIgaXMgYXBwbGllZCB0byBhIHJnYiBjb2xvcicsICgpID0+IHtcbiAgICAgICAgbGV0IFthZGRpdGlvbm5hbFN0eWxlTm9kZV0gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUoKVxuXG4gICAgICAgICAgYWRkaXRpb25uYWxTdHlsZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgICAgYWRkaXRpb25uYWxTdHlsZU5vZGUudGV4dENvbnRlbnQgPSBgXG4gICAgICAgICAgICAke3N0eWxlc2hlZXR9XG5cbiAgICAgICAgICAgIC5lZGl0b3Ige1xuICAgICAgICAgICAgICBjb2xvcjogcmVkO1xuICAgICAgICAgICAgICAtd2Via2l0LWZpbHRlcjogaHVlLXJvdGF0ZSgxODBkZWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGBcblxuICAgICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKGFkZGl0aW9ubmFsU3R5bGVOb2RlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdjb21wdXRlcyB0aGUgbmV3IGNvbG9yIGJ5IGFwcGx5aW5nIHRoZSBodWUgcm90YXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgd2FpdHNGb3IoJ25ldyBhbmltYXRpb24gZnJhbWUnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmV0cmlldmVTdHlsZUZyb21Eb20oWycuZWRpdG9yJ10sICdjb2xvcicpKS50b0VxdWFsKGByZ2IoMCwgJHsweDZkfSwgJHsweDZkfSlgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBhIGh1ZS1yb3RhdGUgZmlsdGVyIGlzIGFwcGxpZWQgdG8gYSByZ2JhIGNvbG9yJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2FkZGl0aW9ubmFsU3R5bGVOb2RlXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuaW52YWxpZGF0ZURPTVN0eWxlc0NhY2hlKClcblxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlLnRleHRDb250ZW50ID0gYFxuICAgICAgICAgICAgJHtzdHlsZXNoZWV0fVxuXG4gICAgICAgICAgICAuZWRpdG9yIHtcbiAgICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAwLCAwLCAwKTtcbiAgICAgICAgICAgICAgLXdlYmtpdC1maWx0ZXI6IGh1ZS1yb3RhdGUoMTgwZGVnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBgXG5cbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZChhZGRpdGlvbm5hbFN0eWxlTm9kZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnY29tcHV0ZXMgdGhlIG5ldyBjb2xvciBieSBhcHBseWluZyB0aGUgaHVlIHJvdGF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXRyaWV2ZVN0eWxlRnJvbURvbShbJy5lZGl0b3InXSwgJ2NvbG9yJykpLnRvRXF1YWwoYHJnYmEoMCwgJHsweDZkfSwgJHsweDZkfSwgMClgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICAgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gICAgLy8gICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgdXBkYXRlIGlzIHBlcmZvcm1lZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC12aXNpYmxlLWFyZWEnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIHZpc2libGUgYXJlYSB3aWR0aCBhbmQgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QodmlzaWJsZUFyZWEub2Zmc2V0V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuY2xpZW50V2lkdGgpXG4gICAgICAgIGV4cGVjdCh2aXNpYmxlQXJlYS5vZmZzZXRIZWlnaHQpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpLCAwKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIHZpc2libGUgdmlzaWJsZSBhcmVhIG9mZnNldCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AodmlzaWJsZUFyZWEpKS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCksIDApXG4gICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdCh2aXNpYmxlQXJlYSkpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKSwgMClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdvZmZzZXRzIHRoZSBjYW52YXMgd2hlbiB0aGUgc2Nyb2xsIGRvZXMgbm90IG1hdGNoIGxpbmUgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDA0KVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChjYW52YXMpKS50b0JlQ2xvc2VUbygtMiwgLTEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZG9lcyBub3QgZmFpbCB0byB1cGRhdGUgcmVuZGVyIHRoZSBpbnZpc2libGUgY2hhciB3aGVuIG1vZGlmaWVkJywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLmludmlzaWJsZXMnLCB7Y3I6ICcqJ30pXG5cbiAgICAgICAgZXhwZWN0KCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSkubm90LnRvVGhyb3coKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIGRlY29yYXRpb25zIGJhc2VkIG9uIHRoZSBvcmRlciBzZXR0aW5ncycsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCB0cnVlKVxuXG4gICAgICAgIGNvbnN0IHBsdWdpbkZvbyA9IGNyZWF0ZVBsdWdpbigpXG4gICAgICAgIGNvbnN0IHBsdWdpbkJhciA9IGNyZWF0ZVBsdWdpbigpXG5cbiAgICAgICAgTWFpbi5yZWdpc3RlclBsdWdpbignZm9vJywgcGx1Z2luRm9vKVxuICAgICAgICBNYWluLnJlZ2lzdGVyUGx1Z2luKCdiYXInLCBwbHVnaW5CYXIpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZm9vRGVjb3JhdGlvbnNaSW5kZXgnLCAxKVxuXG4gICAgICAgIGNvbnN0IGNhbGxzID0gW11cbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3TGluZURlY29yYXRpb24nKS5hbmRDYWxsRmFrZSgoZCkgPT4ge1xuICAgICAgICAgIGNhbGxzLnB1c2goZC5nZXRQcm9wZXJ0aWVzKCkucGx1Z2luKVxuICAgICAgICB9KVxuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdIaWdobGlnaHREZWNvcmF0aW9uJykuYW5kQ2FsbEZha2UoKGQpID0+IHtcbiAgICAgICAgICBjYWxscy5wdXNoKGQuZ2V0UHJvcGVydGllcygpLnBsdWdpbilcbiAgICAgICAgfSlcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnLCBwbHVnaW46ICdiYXInfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgMF0sIFsxLCAxMF1dKSwge3R5cGU6ICdoaWdobGlnaHQtdW5kZXInLCBjb2xvcjogJyMwMDAwRkYnLCBwbHVnaW46ICdmb28nfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QoY2FsbHMpLnRvRXF1YWwoWydiYXInLCAnZm9vJ10pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucy5mb29EZWNvcmF0aW9uc1pJbmRleCcsIC0xKVxuXG4gICAgICAgICAgY2FsbHMubGVuZ3RoID0gMFxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChjYWxscykudG9FcXVhbChbJ2ZvbycsICdiYXInXSlcblxuICAgICAgICAgIE1haW4udW5yZWdpc3RlclBsdWdpbignZm9vJylcbiAgICAgICAgICBNYWluLnVucmVnaXN0ZXJQbHVnaW4oJ2JhcicpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBsaW5lIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdMaW5lRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAsIDBdLCBbMTAsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAwXSwgWzEwMCwgMTBdXSksIHt0eXBlOiAnbGluZScsIGNvbG9yOiAnIzAwMDBGRid9KVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZURlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBndXR0ZXIgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0d1dHRlckRlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgMF0sIFsxLCAxMF1dKSwge3R5cGU6ICdndXR0ZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAsIDBdLCBbMTAsIDEwXV0pLCB7dHlwZTogJ2d1dHRlcicsIGNvbG9yOiAnIzAwMDBGRid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMDAsIDBdLCBbMTAwLCAxMF1dKSwge3R5cGU6ICdndXR0ZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0d1dHRlckRlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3R3V0dGVyRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGhpZ2hsaWdodCBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3SGlnaGxpZ2h0RGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDRdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LXVuZGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzIsIDIwXSwgWzIsIDMwXV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdmVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LXVuZGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdIaWdobGlnaHREZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodERlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBvdXRsaW5lIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdIaWdobGlnaHRPdXRsaW5lRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCA0XSwgWzMsIDZdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LW91dGxpbmUnLCBjb2xvcjogJyMwMDAwZmYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbNiwgMF0sIFs2LCA3XV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdXRsaW5lJywgY29sb3I6ICcjMDAwMGZmJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LW91dGxpbmUnLCBjb2xvcjogJyMwMDAwZmYnfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uLmNhbGxzLmxlbmd0aCkudG9FcXVhbCg0KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIHZpc2libGUgY3VzdG9tIGZvcmVncm91bmQgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0N1c3RvbURlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgY29uc3QgcmVuZGVyUm91dGluZSA9IGphc21pbmUuY3JlYXRlU3B5KCdyZW5kZXJSb3V0aW5lJylcblxuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0ge1xuICAgICAgICAgIHR5cGU6ICdmb3JlZ3JvdW5kLWN1c3RvbScsXG4gICAgICAgICAgcmVuZGVyOiByZW5kZXJSb3V0aW5lXG4gICAgICAgIH1cblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCA0XSwgWzMsIDZdXSksIHByb3BlcnRpZXMpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzYsIDBdLCBbNiwgN11dKSwgcHJvcGVydGllcylcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAzXSwgWzEwMCwgNV1dKSwgcHJvcGVydGllcylcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0N1c3RvbURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3Q3VzdG9tRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICAgIGV4cGVjdChyZW5kZXJSb3V0aW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QocmVuZGVyUm91dGluZS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGN1c3RvbSBiYWNrZ3JvdW5kIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdDdXN0b21EZWNvcmF0aW9uJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIGNvbnN0IHJlbmRlclJvdXRpbmUgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVuZGVyUm91dGluZScpXG5cbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHtcbiAgICAgICAgICB0eXBlOiAnYmFja2dyb3VuZC1jdXN0b20nLFxuICAgICAgICAgIHJlbmRlcjogcmVuZGVyUm91dGluZVxuICAgICAgICB9XG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgNF0sIFszLCA2XV0pLCBwcm9wZXJ0aWVzKVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1s2LCAwXSwgWzYsIDddXSksIHByb3BlcnRpZXMpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHByb3BlcnRpZXMpXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdDdXN0b21EZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0N1c3RvbURlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgICBleHBlY3QocmVuZGVyUm91dGluZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KHJlbmRlclJvdXRpbmUuY2FsbHMubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZWRpdG9yIGlzIHNjcm9sbGVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgyMDAwKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCg1MClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCd1cGRhdGVzIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AodmlzaWJsZUFyZWEpKS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCksIDApXG5cbiAgICAgICAgICBleHBlY3QocGFyc2VGbG9hdCh2aXNpYmxlQXJlYS5zdHlsZS5ib3JkZXJMZWZ0V2lkdGgpKVxuICAgICAgICAgIC50b0VxdWFsKE1hdGguZmxvb3IobWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsTGVmdCgpKSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBlZGl0b3IgaXMgcmVzaXplZCB0byBhIGdyZWF0ZXIgc2l6ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS53aWR0aCA9ICc4MDBweCdcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmhlaWdodCA9ICc1MDBweCdcblxuICAgICAgICAgIG1pbmltYXBFbGVtZW50Lm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZGV0ZWN0cyB0aGUgcmVzaXplIGFuZCBhZGp1c3QgaXRzZWxmJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oZWRpdG9yRWxlbWVudC5vZmZzZXRXaWR0aCAvIDEwLCAwKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRIZWlnaHQpLnRvRXF1YWwoZWRpdG9yRWxlbWVudC5vZmZzZXRIZWlnaHQpXG5cbiAgICAgICAgICBleHBlY3QoY2FudmFzLm9mZnNldFdpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbykudG9CZUNsb3NlVG8obWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgsIDApXG4gICAgICAgICAgZXhwZWN0KGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRIZWlnaHQgKyBtaW5pbWFwLmdldExpbmVIZWlnaHQoKSwgMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBlZGl0b3IgdmlzaWJsZSBjb250ZW50IGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgwKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDE0MDApXG4gICAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1sxMDEsIDBdLCBbMTAyLCAyMF1dKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdMaW5lcycpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmb28nKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3JlcmVuZGVycyB0aGUgcGFydCB0aGF0IGhhdmUgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZXMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICAgICAgICBjb25zdCBbZmlyc3RMaW5lLCBsYXN0TGluZV0gPSBtaW5pbWFwRWxlbWVudC5kcmF3TGluZXMuYXJnc0ZvckNhbGxbMF1cbiAgICAgICAgICAgIGV4cGVjdChmaXJzdExpbmUpLnRvRXF1YWwoMTAwKVxuICAgICAgICAgICAgZXhwZWN0KGxhc3RMaW5lID09PSAxMDIgfHwgbGFzdExpbmUgPT09IDExMSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBlZGl0b3IgdmlzaWJpbGl0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdkb2VzIG5vdCBtb2RpZnkgdGhlIHNpemUgb2YgdGhlIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgICBsZXQgY2FudmFzV2lkdGggPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLndpZHRoXG4gICAgICAgICAgbGV0IGNhbnZhc0hlaWdodCA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuaGVpZ2h0XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG5cbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS53aWR0aCkudG9FcXVhbChjYW52YXNXaWR0aClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmhlaWdodCkudG9FcXVhbChjYW52YXNIZWlnaHQpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnZnJvbSBoaWRkZW4gdG8gdmlzaWJsZScsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQuY2hlY2tGb3JWaXNpYmlsaXR5Q2hhbmdlKClcbiAgICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQucG9sbERPTSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZXF1ZXN0cyBhbiB1cGRhdGUgb2YgdGhlIHdob2xlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICMjIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICMjICAgICAgICMjIyMjIyMjICAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAgICAgICAjIyAjIyAgICAgICAjIyAgICMjICAgIyMgICAgICMjICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgICAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICMjICAgICAjIyAgIyMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyNcblxuICAgIGRlc2NyaWJlKCdtb3VzZSBzY3JvbGwgY29udHJvbHMnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRXaWR0aCg0MDApXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDQwMClcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDApXG5cbiAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICBtaW5pbWFwRWxlbWVudC5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3VzaW5nIHRoZSBtb3VzZSBzY3JvbGx3aGVlbCBvdmVyIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICBpdCgncmVsYXlzIHRoZSBldmVudHMgdG8gdGhlIGVkaXRvciB2aWV3JywgKCkgPT4ge1xuICAgICAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnByZXNlbnRlciwgJ3NldFNjcm9sbFRvcCcpLmFuZENhbGxGYWtlKCgpID0+IHt9KVxuXG4gICAgICAgICAgbW91c2V3aGVlbChtaW5pbWFwRWxlbWVudCwgMCwgMTUpXG5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jb21wb25lbnQucHJlc2VudGVyLnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGluZGVwZW5kZW50TWluaW1hcFNjcm9sbCBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHByZXZpb3VzU2Nyb2xsVG9wXG5cbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbmRlcGVuZGVudE1pbmltYXBTY3JvbGwnLCB0cnVlKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNjcm9sbFNlbnNpdGl2aXR5JywgMC41KVxuXG4gICAgICAgICAgICBzcHlPbihlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5wcmVzZW50ZXIsICdzZXRTY3JvbGxUb3AnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgICAgcHJldmlvdXNTY3JvbGxUb3AgPSBtaW5pbWFwLmdldFNjcm9sbFRvcCgpXG5cbiAgICAgICAgICAgIG1vdXNld2hlZWwobWluaW1hcEVsZW1lbnQsIDAsIC0xNSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2RvZXMgbm90IHJlbGF5IHRoZSBldmVudHMgdG8gdGhlIGVkaXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5wcmVzZW50ZXIuc2V0U2Nyb2xsVG9wKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBtaW5pbWFwIGluc3RlYWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkubm90LnRvRXF1YWwocHJldmlvdXNTY3JvbGxUb3ApXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdjbGFtcCB0aGUgbWluaW1hcCBzY3JvbGwgaW50byB0aGUgbGVnaXQgYm91bmRzJywgKCkgPT4ge1xuICAgICAgICAgICAgbW91c2V3aGVlbChtaW5pbWFwRWxlbWVudCwgMCwgLTEwMDAwMClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwobWluaW1hcC5nZXRNYXhTY3JvbGxUb3AoKSlcblxuICAgICAgICAgICAgbW91c2V3aGVlbChtaW5pbWFwRWxlbWVudCwgMCwgMTAwMDAwKVxuXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgwKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnbWlkZGxlIGNsaWNraW5nIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2NhbnZhcywgdmlzaWJsZUFyZWEsIG9yaWdpbmFsTGVmdCwgbWF4U2Nyb2xsXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgY2FudmFzID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKVxuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWFcbiAgICAgICAgICBvcmlnaW5hbExlZnQgPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0XG4gICAgICAgICAgbWF4U2Nyb2xsID0gbWluaW1hcC5nZXRUZXh0RWRpdG9yTWF4U2Nyb2xsVG9wKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2Nyb2xscyB0byB0aGUgdG9wIHVzaW5nIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uJywgKCkgPT4ge1xuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMsIHt4OiBvcmlnaW5hbExlZnQgKyAxLCB5OiAwLCBidG46IDF9KVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKDApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3Njcm9sbGluZyB0byB0aGUgbWlkZGxlIHVzaW5nIHRoZSBtaWRkbGUgbW91c2UgYnV0dG9uJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBjYW52YXNNaWRZXG5cbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBlZGl0b3JNaWRZID0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIDIuMFxuICAgICAgICAgICAgbGV0IHt0b3AsIGhlaWdodH0gPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGNhbnZhc01pZFkgPSB0b3AgKyAoaGVpZ2h0IC8gMi4wKVxuICAgICAgICAgICAgbGV0IGFjdHVhbE1pZFkgPSBNYXRoLm1pbihjYW52YXNNaWRZLCBlZGl0b3JNaWRZKVxuICAgICAgICAgICAgbW91c2Vkb3duKGNhbnZhcywge3g6IG9yaWdpbmFsTGVmdCArIDEsIHk6IGFjdHVhbE1pZFksIGJ0bjogMX0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgdG8gdGhlIG1pZGRsZScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBtaWRkbGVTY3JvbGxUb3AgPSBNYXRoLnJvdW5kKChtYXhTY3JvbGwpIC8gMi4wKVxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwobWlkZGxlU2Nyb2xsVG9wKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndXBkYXRlcyB0aGUgdmlzaWJsZSBhcmVhIHRvIGJlIGNlbnRlcmVkJywgKCkgPT4ge1xuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICAgIGxldCB7dG9wLCBoZWlnaHR9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgICAgICBsZXQgdmlzaWJsZUNlbnRlclkgPSB0b3AgKyAoaGVpZ2h0IC8gMilcbiAgICAgICAgICAgICAgZXhwZWN0KHZpc2libGVDZW50ZXJZKS50b0JlQ2xvc2VUbygyMDAsIDApXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3Njcm9sbGluZyB0aGUgZWRpdG9yIHRvIGFuIGFyYml0cmFyeSBsb2NhdGlvbicsICgpID0+IHtcbiAgICAgICAgICBsZXQgW3Njcm9sbFRvLCBzY3JvbGxSYXRpb10gPSBbXVxuXG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBzY3JvbGxUbyA9IDEwMSAvLyBwaXhlbHNcbiAgICAgICAgICAgIHNjcm9sbFJhdGlvID0gKHNjcm9sbFRvIC0gbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkgLyAyKSAvIChtaW5pbWFwLmdldFZpc2libGVIZWlnaHQoKSAtIG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpKVxuICAgICAgICAgICAgc2Nyb2xsUmF0aW8gPSBNYXRoLm1heCgwLCBzY3JvbGxSYXRpbylcbiAgICAgICAgICAgIHNjcm9sbFJhdGlvID0gTWF0aC5taW4oMSwgc2Nyb2xsUmF0aW8pXG5cbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMsIHt4OiBvcmlnaW5hbExlZnQgKyAxLCB5OiBzY3JvbGxUbywgYnRuOiAxfSlcblxuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgdG8gYW4gYXJiaXRyYXJ5IGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGV4cGVjdGVkU2Nyb2xsID0gbWF4U2Nyb2xsICogc2Nyb2xsUmF0aW9cbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0JlQ2xvc2VUbyhleHBlY3RlZFNjcm9sbCwgMClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ2RyYWdnaW5nIHRoZSB2aXNpYmxlIGFyZWEgd2l0aCBtaWRkbGUgbW91c2UgYnV0dG9uICcgK1xuICAgICAgICAgICdhZnRlciBzY3JvbGxpbmcgdG8gdGhlIGFyYml0cmFyeSBsb2NhdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBbb3JpZ2luYWxUb3BdID0gW11cblxuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIG9yaWdpbmFsVG9wID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IG9yaWdpbmFsTGVmdCArIDEsIHk6IHNjcm9sbFRvICsgNDAsIGJ0bjogMX0pXG5cbiAgICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5lbmREcmFnKClcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3Igc28gdGhhdCB0aGUgdmlzaWJsZSBhcmVhIHdhcyBtb3ZlZCBkb3duICcgK1xuICAgICAgICAgICAgJ2J5IDQwIHBpeGVscyBmcm9tIHRoZSBhcmJpdHJhcnkgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGxldCB7dG9wfSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgIGV4cGVjdCh0b3ApLnRvQmVDbG9zZVRvKG9yaWdpbmFsVG9wICsgNDAsIC0xKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3ByZXNzaW5nIHRoZSBtb3VzZSBvbiB0aGUgbWluaW1hcCBjYW52YXMgKHdpdGhvdXQgc2Nyb2xsIGFuaW1hdGlvbiknLCAoKSA9PiB7XG4gICAgICAgIGxldCBjYW52YXNcblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBsZXQgdCA9IDBcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2dldFRpbWUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRcbiAgICAgICAgICAgIHQgKz0gMTAwXG4gICAgICAgICAgICByZXR1cm4gblxuICAgICAgICAgIH0pXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0VXBkYXRlJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJywgZmFsc2UpXG5cbiAgICAgICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciB0byB0aGUgbGluZSBiZWxvdyB0aGUgbW91c2UnLCAoKSA9PiB7XG4gICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9CZUNsb3NlVG8oNDgwKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIGluZGVwZW5kZW50TWluaW1hcFNjcm9sbCBzZXR0aW5nIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwLnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmluZGVwZW5kZW50TWluaW1hcFNjcm9sbCcsIHRydWUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0JlQ2xvc2VUbyg0ODApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdwcmVzc2luZyB0aGUgbW91c2Ugb24gdGhlIG1pbmltYXAgY2FudmFzICh3aXRoIHNjcm9sbCBhbmltYXRpb24pJywgKCkgPT4ge1xuICAgICAgICBsZXQgY2FudmFzXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbGV0IHQgPSAwXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdnZXRUaW1lJykuYW5kQ2FsbEZha2UoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG4gPSB0XG4gICAgICAgICAgICB0ICs9IDEwMFxuICAgICAgICAgICAgcmV0dXJuIG5cbiAgICAgICAgICB9KVxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdFVwZGF0ZScpLmFuZENhbGxGYWtlKCgpID0+IHt9KVxuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbicsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbkR1cmF0aW9uJywgMzAwKVxuXG4gICAgICAgICAgY2FudmFzID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgZ3JhZHVhbGx5IHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vIHdhaXQgdW50aWwgYWxsIGFuaW1hdGlvbnMgcnVuIG91dFxuICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSAmJiBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgPj0gNDgwXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc3RvcHMgdGhlIGFuaW1hdGlvbiBpZiB0aGUgdGV4dCBlZGl0b3IgaXMgZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGVkaXRvci5kZXN0cm95KClcblxuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lICYmIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgIGV4cGVjdChuZXh0QW5pbWF0aW9uRnJhbWUgPT09IG5vQW5pbWF0aW9uRnJhbWUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnd2hlbiBpbmRlcGVuZGVudE1pbmltYXBTY3JvbGwgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcC5zZXRTY3JvbGxUb3AoMTAwMClcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbmRlcGVuZGVudE1pbmltYXBTY3JvbGwnLCB0cnVlKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIGdyYWR1YWxseSB0byB0aGUgbGluZSBiZWxvdyB0aGUgbW91c2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy8gd2FpdCB1bnRpbCBhbGwgYW5pbWF0aW9ucyBydW4gb3V0XG4gICAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSAmJiBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgICAgICByZXR1cm4gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSA+PSA0ODBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzdG9wcyB0aGUgYW5pbWF0aW9uIGlmIHRoZSB0ZXh0IGVkaXRvciBpcyBkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuXG4gICAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSAmJiBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgICAgIGV4cGVjdChuZXh0QW5pbWF0aW9uRnJhbWUgPT09IG5vQW5pbWF0aW9uRnJhbWUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnZHJhZ2dpbmcgdGhlIHZpc2libGUgYXJlYScsICgpID0+IHtcbiAgICAgICAgbGV0IFt2aXNpYmxlQXJlYSwgb3JpZ2luYWxUb3BdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgbGV0IG8gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIGxldCBsZWZ0ID0gby5sZWZ0XG4gICAgICAgICAgb3JpZ2luYWxUb3AgPSBvLnRvcFxuXG4gICAgICAgICAgbW91c2Vkb3duKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiBvcmlnaW5hbFRvcCArIDEwfSlcbiAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IG9yaWdpbmFsVG9wICsgNTB9KVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5lbmREcmFnKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHNvIHRoYXQgdGhlIHZpc2libGUgYXJlYSB3YXMgbW92ZWQgZG93biBieSA0MCBwaXhlbHMnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHt0b3B9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBleHBlY3QodG9wKS50b0JlQ2xvc2VUbyhvcmlnaW5hbFRvcCArIDQwLCAtMSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc3RvcHMgdGhlIGRyYWcgZ2VzdHVyZSB3aGVuIHRoZSBtb3VzZSBpcyByZWxlYXNlZCBvdXRzaWRlIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgIGxldCB7dG9wLCBsZWZ0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbW91c2V1cChqYXNtaW5lQ29udGVudCwge3g6IGxlZnQgLSAxMCwgeTogdG9wICsgODB9KVxuXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmFnJylcbiAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IHRvcCArIDUwfSlcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmFnKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnZHJhZ2dpbmcgdGhlIHZpc2libGUgYXJlYSB1c2luZyB0b3VjaCBldmVudHMnLCAoKSA9PiB7XG4gICAgICAgIGxldCBbdmlzaWJsZUFyZWEsIG9yaWdpbmFsVG9wXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgdmlzaWJsZUFyZWEgPSBtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYVxuICAgICAgICAgIGxldCBvID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBsZXQgbGVmdCA9IG8ubGVmdFxuICAgICAgICAgIG9yaWdpbmFsVG9wID0gby50b3BcblxuICAgICAgICAgIHRvdWNoc3RhcnQodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IG9yaWdpbmFsVG9wICsgMTB9KVxuICAgICAgICAgIHRvdWNobW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogb3JpZ2luYWxUb3AgKyA1MH0pXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3Igc28gdGhhdCB0aGUgdmlzaWJsZSBhcmVhIHdhcyBtb3ZlZCBkb3duIGJ5IDQwIHBpeGVscycsICgpID0+IHtcbiAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIGV4cGVjdCh0b3ApLnRvQmVDbG9zZVRvKG9yaWdpbmFsVG9wICsgNDAsIC0xKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdG9wcyB0aGUgZHJhZyBnZXN0dXJlIHdoZW4gdGhlIG1vdXNlIGlzIHJlbGVhc2VkIG91dHNpZGUgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnR9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBtb3VzZXVwKGphc21pbmVDb250ZW50LCB7eDogbGVmdCAtIDEwLCB5OiB0b3AgKyA4MH0pXG5cbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYWcnKVxuICAgICAgICAgIHRvdWNobW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYWcpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBtaW5pbWFwIGNhbm5vdCBzY3JvbGwnLCAoKSA9PiB7XG4gICAgICAgIGxldCBbdmlzaWJsZUFyZWEsIG9yaWdpbmFsVG9wXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbGV0IHNhbXBsZSA9IGZzLnJlYWRGaWxlU3luYyhkaXIucmVzb2x2ZSgnc2V2ZW50eS50eHQnKSkudG9TdHJpbmcoKVxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KHNhbXBsZSlcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgICAgdmlzaWJsZUFyZWEgPSBtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYVxuICAgICAgICAgICAgICBsZXQge3RvcCwgbGVmdH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgICBvcmlnaW5hbFRvcCA9IHRvcFxuXG4gICAgICAgICAgICAgIG1vdXNlZG93bih2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgMTB9KVxuICAgICAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IHRvcCArIDUwfSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQuZW5kRHJhZygpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIGJhc2VkIG9uIGEgcmF0aW8gYWRqdXN0ZWQgdG8gdGhlIG1pbmltYXAgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHt0b3B9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGV4cGVjdCh0b3ApLnRvQmVDbG9zZVRvKG9yaWdpbmFsVG9wICsgNDAsIC0xKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBzY3JvbGwgcGFzdCBlbmQgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc2Nyb2xsUGFzdEVuZCcsIHRydWUpXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnZHJhZ2dpbmcgdGhlIHZpc2libGUgYXJlYScsICgpID0+IHtcbiAgICAgICAgICBsZXQgW29yaWdpbmFsVG9wLCB2aXNpYmxlQXJlYV0gPSBbXVxuXG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgICBsZXQge3RvcCwgbGVmdH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgb3JpZ2luYWxUb3AgPSB0b3BcblxuICAgICAgICAgICAgbW91c2Vkb3duKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyAxMH0pXG4gICAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IHRvcCArIDUwfSlcblxuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5lbmREcmFnKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBzbyB0aGF0IHRoZSB2aXNpYmxlIGFyZWEgd2FzIG1vdmVkIGRvd24gYnkgNDAgcGl4ZWxzJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHt0b3B9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGV4cGVjdCh0b3ApLnRvQmVDbG9zZVRvKG9yaWdpbmFsVG9wICsgNDAsIC0xKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjICAjIyMjIyMjIyAgICAjIyMgICAgIyMgICAgIyMgIyMjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAgICAjIyAgICAgICMjICMjICAgIyMjICAgIyMgIyMgICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgICAgIyMgICAgICMjICAgIyMgICMjIyMgICMjICMjICAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAjIyAjIyAjIyAjIyAgICAgIyNcbiAgICAvLyAgICAgICAgICAjIyAgICAjIyAgICAjIyMjIyMjIyMgIyMgICMjIyMgIyMgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgICMjICMjICAgIyMjICMjICAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAjIyAgICAjIyAjIyMjIyMjI1xuICAgIC8vXG4gICAgLy8gICAgICAgIyMjICAgICMjICAgICAgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjI1xuICAgIC8vICAgICAgIyMgIyMgICAjIyAgICAgICAjIyAgICAgIyMgIyMjICAgIyMgIyNcbiAgICAvLyAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAjIyMjIyNcbiAgICAvLyAgICAjIyMjIyMjIyMgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICMjIyAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyNcblxuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBtb2RlbCBpcyBhIHN0YW5kLWFsb25lIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbWluaW1hcC5zZXRTdGFuZEFsb25lKHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnaGFzIGEgc3RhbmQtYWxvbmUgYXR0cmlidXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuaGFzQXR0cmlidXRlKCdzdGFuZC1hbG9uZScpKS50b0JlVHJ1dGh5KClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzZXRzIHRoZSBtaW5pbWFwIHNpemUgd2hlbiBtZWFzdXJlZCcsICgpID0+IHtcbiAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICBleHBlY3QobWluaW1hcC53aWR0aCkudG9FcXVhbChtaW5pbWFwRWxlbWVudC5jbGllbnRXaWR0aClcbiAgICAgICAgZXhwZWN0KG1pbmltYXAuaGVpZ2h0KS50b0VxdWFsKG1pbmltYXBFbGVtZW50LmNsaWVudEhlaWdodClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBjb250cm9scyBkaXYnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLWNvbnRyb2xzJykpLnRvQmVOdWxsKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgcXVpY2sgc2V0dGluZ3MgYnV0dG9uJywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub3BlblF1aWNrU2V0dGluZ3MpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIHNjcm9sbCBpbmRpY2F0b3InLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KG1lZGl1bVNhbXBsZSlcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoNTApXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgdHJ1ZSlcbiAgICAgICAgfSlcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS50b0JlTnVsbCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgncHJlc3NpbmcgdGhlIG1vdXNlIG9uIHRoZSBtaW5pbWFwIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQobWluaW1hcEVsZW1lbnQpXG5cbiAgICAgICAgICBsZXQgdCA9IDBcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2dldFRpbWUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRcbiAgICAgICAgICAgIHQgKz0gMTAwXG4gICAgICAgICAgICByZXR1cm4gblxuICAgICAgICAgIH0pXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0VXBkYXRlJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJywgZmFsc2UpXG5cbiAgICAgICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpXG4gICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZG9lcyBub3Qgc2Nyb2xsIHRoZSBlZGl0b3IgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKDEwMDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIGlzIGNoYW5nZWQgdG8gYmUgYSBjbGFzc2ljYWwgbWluaW1hcCBhZ2FpbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCB0cnVlKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgdHJ1ZSlcblxuICAgICAgICAgIG1pbmltYXAuc2V0U3RhbmRBbG9uZShmYWxzZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVjcmVhdGVzIHRoZSBkZXN0cm95ZWQgZWxlbWVudHMnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtY29udHJvbHMnKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtdmlzaWJsZS1hcmVhJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpKS50b0V4aXN0KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICMjICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICAgIyMjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyMjIyMgICAgIyMjIyMjICAgICAjIyAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAgICAgICMjICAgICMjICAgICMjICAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjI1xuICAgIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjICAgICAjIyAgICAjIyAgICAgIyMgICMjIyMjIyMgICAgICMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgbW9kZWwgaXMgZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIG1pbmltYXAuZGVzdHJveSgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnZGV0YWNoZXMgaXRzZWxmIGZyb20gaXRzIHBhcmVudCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnBhcmVudE5vZGUpLnRvQmVOdWxsKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzdG9wcyB0aGUgRE9NIHBvbGxpbmcgaW50ZXJ2YWwnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncG9sbERPTScpXG5cbiAgICAgICAgc2xlZXAoMjAwKVxuXG4gICAgICAgIHJ1bnMoKCkgPT4geyBleHBlY3QobWluaW1hcEVsZW1lbnQucG9sbERPTSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKSB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMgICMjIyMjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyMgICAjIyAjIyAgICAgICAgIyMgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICMjICAgICAgICAjIyAgIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgIyMgIyMgIyMjIyMjICAgICMjICAjIyAgICMjIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgIyMgICAgICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICMjIyAjIyAgICAgICAgIyMgICMjICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICMjICMjICAgICAgICMjIyMgICMjIyMjI1xuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIGF0b20gc3R5bGVzIGFyZSBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnaW52YWxpZGF0ZURPTVN0eWxlc0NhY2hlJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgICAgbGV0IHN0eWxlTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICAgICAgICBzdHlsZU5vZGUudGV4dENvbnRlbnQgPSAnYm9keXsgY29sb3I6ICMyMzMgfSdcbiAgICAgICAgICBhdG9tLnN0eWxlcy5lbWl0dGVyLmVtaXQoJ2RpZC1hZGQtc3R5bGUtZWxlbWVudCcsIHN0eWxlTm9kZSlcbiAgICAgICAgfSlcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZm9yY2VzIGEgcmVmcmVzaCB3aXRoIGNhY2hlIGludmFsaWRhdGlvbicsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuaW52YWxpZGF0ZURPTVN0eWxlc0NhY2hlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAudGV4dE9wYWNpdHkgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC50ZXh0T3BhY2l0eScsIDAuMylcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlcXVlc3RzIGEgY29tcGxldGUgdXBkYXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cyBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlDb2RlSGlnaGxpZ2h0cycsIHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5jaGFyV2lkdGggaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFyV2lkdGgnLCAxKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuY2hhckhlaWdodCBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJIZWlnaHQnLCAxKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuaW50ZXJsaW5lIGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW50ZXJsaW5lJywgMilcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlcXVlc3RzIGEgY29tcGxldGUgdXBkYXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgIGl0KCdtb3ZlcyB0aGUgYXR0YWNoZWQgbWluaW1hcCB0byB0aGUgbGVmdCcsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbGVmdCcpKS50b0JlVHJ1dGh5KClcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBtaW5pbWFwIGlzIG5vdCBhdHRhY2hlZCB5ZXQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7fSlcbiAgICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg1MClcbiAgICAgICAgICBlZGl0b3Iuc2V0TGluZUhlaWdodEluUGl4ZWxzKDEwKVxuXG4gICAgICAgICAgbWluaW1hcCA9IG5ldyBNaW5pbWFwKHt0ZXh0RWRpdG9yOiBlZGl0b3J9KVxuICAgICAgICAgIG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG5cbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5pbnNlcnRCZWZvcmUoZWRpdG9yRWxlbWVudCwgamFzbWluZUNvbnRlbnQuZmlyc3RDaGlsZClcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuYXR0YWNoKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnbW92ZXMgdGhlIGF0dGFjaGVkIG1pbmltYXAgdG8gdGhlIGxlZnQnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbGVmdCcpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwJywgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnLCB0cnVlKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgMilcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCcsIHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdhZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgbWluaW1hcCBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLndpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbykudG9FcXVhbCg0KVxuICAgICAgfSlcblxuICAgICAgaXQoJ29mZnNldHMgdGhlIG1pbmltYXAgYnkgdGhlIGRpZmZlcmVuY2UnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdChtaW5pbWFwRWxlbWVudCkpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQuY2xpZW50V2lkdGggLSA0LCAtMSlcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsaWVudFdpZHRoKS50b0VxdWFsKDQpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgndGhlIGRvbSBwb2xsaW5nIHJvdXRpbmUnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdkb2VzIG5vdCBjaGFuZ2UgdGhlIHZhbHVlJywgKCkgPT4ge1xuICAgICAgICAgIGF0b20udmlld3MucGVyZm9ybURvY3VtZW50UG9sbCgpXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS53aWR0aCAvIGRldmljZVBpeGVsUmF0aW8pLnRvRXF1YWwoNClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciBpcyByZXNpemVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgNilcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMHB4J1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMHB4J1xuXG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdtYWtlcyB0aGUgbWluaW1hcCBzbWFsbGVyIHRoYW4gc29mdCB3cmFwJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oMTIsIC0xKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zdHlsZS5tYXJnaW5SaWdodCkudG9FcXVhbCgnJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgd2hlbiBtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3Igc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChtZWRpdW1TYW1wbGUpXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoNTApXG5cbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgdHJ1ZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnb2Zmc2V0cyB0aGUgc2Nyb2xsIGluZGljYXRvciBieSB0aGUgZGlmZmVyZW5jZScsICgpID0+IHtcbiAgICAgICAgICBsZXQgaW5kaWNhdG9yID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJylcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQoaW5kaWNhdG9yKSkudG9CZUNsb3NlVG8oMiwgLTEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHdoZW4gbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzIHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCB0cnVlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdvZmZzZXRzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGJ5IHRoZSBkaWZmZXJlbmNlJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KG9wZW5RdWlja1NldHRpbmdzKSkubm90LnRvQmVDbG9zZVRvKDIsIC0xKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCB0aGVuIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCcsIGZhbHNlKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnYWRqdXN0cyB0aGUgd2lkdGggb2YgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbyhlZGl0b3JFbGVtZW50Lm9mZnNldFdpZHRoIC8gMTAsIC0xKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zdHlsZS53aWR0aCkudG9FcXVhbCgnJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgd2hlbiBwcmVmZXJyZWRMaW5lTGVuZ3RoID49IDE2Mzg0JywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgMTYzODQpXG5cbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQub2Zmc2V0V2lkdGggLyAxMCwgLTEpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnN0eWxlLndpZHRoKS50b0VxdWFsKCcnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gYWRqdXN0TWluaW1hcFdpZHRoT25seUlmU21hbGxlciBpcyBkaXNhYmxlZCcsICgpID0+IHtcbiAgICAgICAgZGVzY3JpYmUoJ2FuZCB3aGVuIHByZWZlcnJlZExpbmVMZW5ndGggPj0gMTYzODQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoT25seUlmU21hbGxlcicsIGZhbHNlKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDE2Mzg0KVxuXG4gICAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnYWRqdXN0cyB0aGUgd2lkdGggb2YgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKDE2Mzg0ICogMilcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zdHlsZS53aWR0aCkudG9FcXVhbCgxNjM4NCAqIDIgKyAncHgnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3Igc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KG1lZGl1bVNhbXBsZSlcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoNTApXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcicsIHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnYWRkcyBhIHNjcm9sbCBpbmRpY2F0b3IgaW4gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkudG9FeGlzdCgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHRoZW4gZGVhY3RpdmF0ZWQnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdyZW1vdmVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGZyb20gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCBmYWxzZSlcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdvbiB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzUwMHB4J1xuXG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSBzaXplIGFuZCBwb3NpdGlvbiBvZiB0aGUgaW5kaWNhdG9yJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBpbmRpY2F0b3IgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKVxuXG4gICAgICAgICAgbGV0IGhlaWdodCA9IGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgKiAoZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICAgICAgbGV0IHNjcm9sbCA9IChlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC0gaGVpZ2h0KSAqIG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjcm9sbFJhdGlvKClcblxuICAgICAgICAgIGV4cGVjdChpbmRpY2F0b3Iub2Zmc2V0SGVpZ2h0KS50b0JlQ2xvc2VUbyhoZWlnaHQsIDApXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AoaW5kaWNhdG9yKSkudG9CZUNsb3NlVG8oc2Nyb2xsLCAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1pbmltYXAgY2Fubm90IHNjcm9sbCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG5cbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZW1vdmVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkubm90LnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdhbmQgdGhlbiBjYW4gc2Nyb2xsIGFnYWluJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdhdHRhY2hlcyB0aGUgc2Nyb2xsIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIHNjcm9sbCBpbmRpY2F0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5hYnNvbHV0ZU1vZGUgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hYnNvbHV0ZU1vZGUnLCB0cnVlKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2FkZHMgYSBhYnNvbHV0ZSBjbGFzcyB0byB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhYnNvbHV0ZScpKS50b0JlVHJ1dGh5KClcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICBpdCgnYWxzbyBhZGRzIGEgbGVmdCBjbGFzcyB0byB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnYWJzb2x1dGUnKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbGVmdCcpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0IHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdEFic29sdXRlTW9kZUhlaWdodCcsIHRydWUpXG4gICAgICAgIH0pXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb250ZW50IG9mIHRoZSBtaW5pbWFwIGlzIHNtYWxsZXIgdGhhdCB0aGUgZWRpdG9yIGhlaWdodCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGVkaXRvci5zZXRUZXh0KHNtYWxsU2FtcGxlKVxuICAgICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNDAwKVxuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBydW5zKCgpID0+IG5leHRBbmltYXRpb25GcmFtZSgpKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgaXQoJ2FkanVzdHMgdGhlIGNhbnZhcyBoZWlnaHQgdG8gdGhlIG1pbmltYXAgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignY2FudmFzJykub2Zmc2V0SGVpZ2h0KS50b0VxdWFsKG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBjb250ZW50IGlzIG1vZGlmaWVkJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmb29cXG5cXG5iYXJcXG4nKVxuXG4gICAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgcnVucygoKSA9PiBuZXh0QW5pbWF0aW9uRnJhbWUoKSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdhZGp1c3RzIHRoZSBjYW52YXMgaGVpZ2h0IHRvIHRoZSBuZXcgbWluaW1hcCBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpLm9mZnNldEhlaWdodCkudG9FcXVhbChtaW5pbWFwLmdldEhlaWdodCgpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIHNtb290aFNjcm9sbGluZyBzZXR0aW5nIGlzIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zbW9vdGhTY3JvbGxpbmcnLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgICBpdCgnZG9lcyBub3Qgb2Zmc2V0IHRoZSBjYW52YXMgd2hlbiB0aGUgc2Nyb2xsIGRvZXMgbm90IG1hdGNoIGxpbmUgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDA0KVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChjYW52YXMpKS50b0VxdWFsKDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMgICMjIyMjIyAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgIyMgICAgIyMgIyMgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjIyAgICAgICAjIyAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgIyMgICAgICAgIyMjIyNcbiAgICAvLyAgICAjIyAgIyMgIyMgIyMgICAgICMjICAjIyAgIyMgICAgICAgIyMgICMjXG4gICAgLy8gICAgIyMgICAgIyMgICMjICAgICAjIyAgIyMgICMjICAgICMjICMjICAgIyNcbiAgICAvLyAgICAgIyMjIyMgIyMgICMjIyMjIyMgICMjIyMgICMjIyMjIyAgIyMgICAgIyNcbiAgICAvL1xuICAgIC8vICAgICAjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICMjIyMgIyMgICAgIyMgICMjIyMjIyAgICAjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjIyAgICMjICMjICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjIyAgIyMgIyMgICAgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgIyMjIyMjICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAjIyAjIyAjIyAgICMjIyMgICMjIyMjI1xuICAgIC8vICAgICAgICAgICMjICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMgICMjIyMgIyMgICAgIyMgICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgICMjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAjIyMjIyMjIyAgICAjIyAgICAgICAjIyAgICAjIyMjICMjICAgICMjICAjIyMjIyMgICAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgbGV0IFtvcGVuUXVpY2tTZXR0aW5ncywgcXVpY2tTZXR0aW5nc0VsZW1lbnQsIHdvcmtzcGFjZUVsZW1lbnRdID0gW11cbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnaGFzIGEgZGl2IHRvIG9wZW4gdGhlIHF1aWNrIHNldHRpbmdzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJykpLnRvRXhpc3QoKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBkaXYnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgIH0pXG5cbiAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudC5kZXN0cm95KClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnb3BlbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50KS50b0V4aXN0KClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncG9zaXRpb25zIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IG5leHQgdG8gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IG1pbmltYXBCb3VuZHMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IHNldHRpbmdzQm91bmRzID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy50b3AsIDApXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy5sZWZ0IC0gc2V0dGluZ3NCb3VuZHMud2lkdGgsIDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGRpdicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG5cbiAgICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgncG9zaXRpb25zIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IG5leHQgdG8gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbWluaW1hcEJvdW5kcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnRvcCwgMClcbiAgICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdChxdWlja1NldHRpbmdzRWxlbWVudCkpLnRvQmVDbG9zZVRvKG1pbmltYXBCb3VuZHMucmlnaHQsIDApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBhZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgbGV0IFtjb250cm9sc10gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcCcsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnLCB0cnVlKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCAyKVxuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnLCB0cnVlKVxuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBjb250cm9scyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtY29udHJvbHMnKVxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcblxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAyNHB4J1xuXG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSBzaXplIG9mIHRoZSBjb250cm9sIGRpdiB0byBmaXQgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGNvbnRyb2xzLmNsaWVudFdpZHRoKS50b0VxdWFsKG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuY2xpZW50V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIGNvbnRyb2xzIGRpdiBvdmVyIHRoZSBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGNvbnRyb2xzUmVjdCA9IGNvbnRyb2xzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IGNhbnZhc1JlY3QgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgZXhwZWN0KGNvbnRyb2xzUmVjdC5sZWZ0KS50b0VxdWFsKGNhbnZhc1JlY3QubGVmdClcbiAgICAgICAgICBleHBlY3QoY29udHJvbHNSZWN0LnJpZ2h0KS50b0VxdWFsKGNhbnZhc1JlY3QucmlnaHQpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdhZGp1c3RzIHRoZSBzaXplIG9mIHRoZSBjb250cm9sIGRpdiB0byBmaXQgaW4gdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoY29udHJvbHMuY2xpZW50V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5jbGllbnRXaWR0aCAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIGNvbnRyb2xzIGRpdiBvdmVyIHRoZSBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29udHJvbHNSZWN0ID0gY29udHJvbHMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGxldCBjYW52YXNSZWN0ID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xzUmVjdC5sZWZ0KS50b0VxdWFsKGNhbnZhc1JlY3QubGVmdClcbiAgICAgICAgICAgIGV4cGVjdChjb250cm9sc1JlY3QucmlnaHQpLnRvRXF1YWwoY2FudmFzUmVjdC5yaWdodClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBkaXYnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudC5kZXN0cm95KClcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgbmV4dCB0byB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IG1pbmltYXBCb3VuZHMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnRvcCwgMClcbiAgICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy5yaWdodCwgMClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3IGlzIG9wZW4nLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICBxdWlja1NldHRpbmdzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3NldHMgdGhlIG9uIHJpZ2h0IGJ1dHRvbiBhY3RpdmUnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGNvZGUgaGlnaGxpZ2h0IGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLmNvZGUtaGlnaGxpZ2h0cycpXG4gICAgICAgICAgICBtb3VzZWRvd24oaXRlbSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRpc3BsYXlDb2RlSGlnaGxpZ2h0cykudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZXF1ZXN0cyBhbiB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWQpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBhYnNvbHV0ZSBtb2RlIGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLmFic29sdXRlLW1vZGUnKVxuICAgICAgICAgICAgbW91c2Vkb3duKGl0ZW0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBhYnNvbHV0ZS1tb2RlIHNldHRpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5hYnNvbHV0ZU1vZGUpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NsaWNraW5nIG9uIHRoZSBvbiBsZWZ0IGJ1dHRvbicsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bjpmaXJzdC1jaGlsZCcpXG4gICAgICAgICAgICBtb3VzZWRvd24oaXRlbSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2hhbmdlcyB0aGUgYnV0dG9ucyBhY3RpdmF0aW9uIHN0YXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOm1vdmUtbGVmdCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtbGVmdCcpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBkaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2NoYW5nZXMgdGhlIGJ1dHRvbnMgYWN0aXZhdGlvbiBzdGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmxhc3QtY2hpbGQnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY29yZTptb3ZlLXJpZ2h0IHdoZW4gdGhlIG1pbmltYXAgaXMgb24gdGhlIHJpZ2h0JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtcmlnaHQnKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnKSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2NoYW5nZXMgdGhlIGJ1dHRvbnMgYWN0aXZhdGlvbiBzdGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmxhc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIG9wZW4gc2V0dGluZ3MgYnV0dG9uIGFnYWluJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbW91c2Vkb3duKG9wZW5RdWlja1NldHRpbmdzKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2xvc2VzIHRoZSBxdWljayBzZXR0aW5ncyB2aWV3JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignbWluaW1hcC1xdWljay1zZXR0aW5ncycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQpLnRvQmVOdWxsKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIGFuIGV4dGVybmFsIGV2ZW50IGRlc3Ryb3lzIHRoZSB2aWV3JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdyZW1vdmVzIHRoZSB2aWV3IHJlZmVyZW5jZSBmcm9tIHRoZSBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50KS50b0JlTnVsbCgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd0aGVuIGRpc2FibGluZyBpdCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCBmYWxzZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVtb3ZlcyB0aGUgZGl2JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3dpdGggcGx1Z2lucyByZWdpc3RlcmVkIGluIHRoZSBwYWNrYWdlJywgKCkgPT4ge1xuICAgICAgICBsZXQgW21pbmltYXBQYWNrYWdlLCBwbHVnaW5BLCBwbHVnaW5CXSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ21pbmltYXAnKS50aGVuKChwa2cpID0+IHtcbiAgICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UgPSBwa2cubWFpbk1vZHVsZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBjbGFzcyBQbHVnaW4ge1xuICAgICAgICAgICAgICBhY3RpdmUgPSBmYWxzZVxuICAgICAgICAgICAgICBhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gdHJ1ZSB9XG4gICAgICAgICAgICAgIGRlYWN0aXZhdGVQbHVnaW4gKCkgeyB0aGlzLmFjdGl2ZSA9IGZhbHNlIH1cbiAgICAgICAgICAgICAgaXNBY3RpdmUgKCkgeyByZXR1cm4gdGhpcy5hY3RpdmUgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwbHVnaW5BID0gbmV3IFBsdWdpbigpXG4gICAgICAgICAgICBwbHVnaW5CID0gbmV3IFBsdWdpbigpXG5cbiAgICAgICAgICAgIG1pbmltYXBQYWNrYWdlLnJlZ2lzdGVyUGx1Z2luKCdkdW1teUEnLCBwbHVnaW5BKVxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15QicsIHBsdWdpbkIpXG5cbiAgICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgICBvcGVuUXVpY2tTZXR0aW5ncyA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpXG4gICAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG5cbiAgICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdjcmVhdGVzIG9uZSBsaXN0IGl0ZW0gZm9yIGVhY2ggcmVnaXN0ZXJlZCBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJykubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3NlbGVjdHMgdGhlIGZpcnN0IGl0ZW0gb2YgdGhlIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOmNvbmZpcm0nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2Rpc2FibGUgdGhlIHBsdWdpbiBvZiB0aGUgc2VsZWN0ZWQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChwbHVnaW5BLmlzQWN0aXZlKCkpLnRvQmVGYWxzeSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCd0cmlnZ2VyZWQgYSBzZWNvbmQgdGltZScsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdlbmFibGUgdGhlIHBsdWdpbiBvZiB0aGUgc2VsZWN0ZWQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHBsdWdpbkEuaXNBY3RpdmUoKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnb24gdGhlIGNvZGUgaGlnaGxpZ2h0IGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW2luaXRpYWxdID0gW11cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBpbml0aWFsID0gbWluaW1hcEVsZW1lbnQuZGlzcGxheUNvZGVIaWdobGlnaHRzXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZGlzcGxheUNvZGVIaWdobGlnaHRzKS50b0VxdWFsKCFpbml0aWFsKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ29uIHRoZSBhYnNvbHV0ZSBtb2RlIGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW2luaXRpYWxdID0gW11cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBpbml0aWFsID0gYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGNvZGUgaGlnaGxpZ2h0cyBvbiB0aGUgbWluaW1hcCBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScpKS50b0VxdWFsKCFpbml0aWFsKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ29uIHRoZSBhZGp1c3QgYWJzb2x1dGUgbW9kZSBoZWlnaHQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBbaW5pdGlhbF0gPSBbXVxuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGluaXRpYWwgPSBhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0JylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgY29kZSBoaWdobGlnaHRzIG9uIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0JykpLnRvRXF1YWwoIWluaXRpYWwpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NvcmU6bW92ZS1kb3duJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3NlbGVjdHMgdGhlIHNlY29uZCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLnNlbGVjdGVkOm50aC1jaGlsZCgyKScpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3JlYWNoaW5nIGEgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtZG93bicpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnbW92ZXMgcGFzdCB0aGUgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuY29kZS1oaWdobGlnaHRzLnNlbGVjdGVkJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3RoZW4gY29yZTptb3ZlLXVwJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3NlbGVjdHMgYWdhaW4gdGhlIGZpcnN0IGl0ZW0gb2YgdGhlIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY29yZTptb3ZlLXVwJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzZWxlY3RzIHRoZSBsYXN0IGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3JlYWNoaW5nIGEgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnbW92ZXMgcGFzdCB0aGUgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6bnRoLWNoaWxkKDIpJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3RoZW4gY29yZTptb3ZlLWRvd24nLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdzZWxlY3RzIGFnYWluIHRoZSBmaXJzdCBpdGVtIG9mIHRoZSBsaXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuIl19
//# sourceURL=/home/key/.atom/packages/minimap/spec/minimap-element-spec.js
