"use babel";

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom-space-pen-views');

var $ = _require.$;
var ScrollView = _require.ScrollView;

var _require2 = require('atom');

var Point = _require2.Point;

var fs = require('fs-plus');
var path = require('path');
var _ = require('underscore-plus');

var _require3 = require('atom');

var File = _require3.File;
var Disposable = _require3.Disposable;
var CompositeDisposable = _require3.CompositeDisposable;

var _require4 = require('loophole');

var Function = _require4.Function;

global.Function = Function;

global.PDFJS = { workerSrc: "temp", cMapUrl: "temp", cMapPacked: true };
require('./../node_modules/pdfjs-dist/build/pdf.js');
PDFJS.workerSrc = "file://" + path.resolve(__dirname, "../node_modules/pdfjs-dist/build/pdf.worker.js");
PDFJS.cMapUrl = "file://" + path.resolve(__dirname, "../node_modules/pdfjs-dist/cmaps") + "/";

var _require5 = require('child_process');

var exec = _require5.exec;
var execFile = _require5.execFile;

var PdfEditorView = (function (_ScrollView) {
  _inherits(PdfEditorView, _ScrollView);

  _createClass(PdfEditorView, null, [{
    key: 'content',
    value: function content() {
      var _this = this;

      this.div({ 'class': 'pdf-view', tabindex: -1 }, function () {
        _this.div({ outlet: 'container' });
      });
    }
  }]);

  function PdfEditorView(filePath) {
    var scale = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    var _this2 = this;

    var scrollTop = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var scrollLeft = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

    _classCallCheck(this, PdfEditorView);

    _get(Object.getPrototypeOf(PdfEditorView.prototype), 'constructor', this).call(this);

    this.currentScale = scale ? scale : 1.5;
    this.defaultScale = 1.5;
    this.scaleFactor = 10.0;
    this.fitToWidthOnOpen = !scale && atom.config.get('pdf-view.fitToWidthOnOpen');

    this.filePath = filePath;
    this.file = new File(this.filePath);
    this.scrollTopBeforeUpdate = scrollTop;
    this.scrollLeftBeforeUpdate = scrollLeft;
    this.canvases = [];

    this.updatePdf(closeOnError = true);

    this.currentPageNumber = 0;
    this.totalPageNumber = 0;
    this.centersBetweenPages = [];
    this.pageHeights = [];
    this.maxPageWidth = 0;
    this.updating = false;
    this.toScaleFactor = 1.0;

    var disposables = new CompositeDisposable();

    var needsUpdateCallback = _.debounce(function () {
      if (_this2.updating) {
        _this2.needsUpdate = true;
      } else {
        _this2.updatePdf();
      }
    }, 100);

    disposables.add(atom.config.onDidChange('pdf-view.reverseSyncBehaviour', needsUpdateCallback));
    disposables.add(this.file.onDidChange(needsUpdateCallback));

    var moveLeftCallback = function moveLeftCallback() {
      return _this2.scrollLeft(_this2.scrollLeft() - $(window).width() / 20);
    };
    var moveRightCallback = function moveRightCallback() {
      return _this2.scrollRight(_this2.scrollRight() + $(window).width() / 20);
    };
    var scrollCallback = function scrollCallback() {
      return _this2.onScroll();
    };
    var resizeHandler = function resizeHandler() {
      return _this2.setCurrentPageNumber();
    };

    var elem = this;

    atom.commands.add('.pdf-view', {
      'core:move-left': moveLeftCallback,
      'core:move-right': moveRightCallback
    });

    elem.on('scroll', scrollCallback);
    disposables.add(new Disposable(function () {
      return $(window).off('scroll', scrollCallback);
    }));

    $(window).on('resize', resizeHandler);
    disposables.add(new Disposable(function () {
      return $(window).off('resize', resizeHandler);
    }));

    atom.commands.add('atom-workspace', {
      'pdf-view:zoom-in': function pdfViewZoomIn() {
        if (atom.workspace.getActivePaneItem() === _this2) {
          _this2.zoomIn();
        }
      },
      'pdf-view:zoom-out': function pdfViewZoomOut() {
        if (atom.workspace.getActivePaneItem() === _this2) {
          _this2.zoomOut();
        }
      },
      'pdf-view:reset-zoom': function pdfViewResetZoom() {
        if (atom.workspace.getActivePaneItem() === _this2) {
          _this2.resetZoom();
        }
      }
    });

    this.dragging = null;

    this.onMouseMove = function (e) {
      if (_this2.dragging) {
        _this2.simpleClick = false;

        _this2.scrollTop(_this2.dragging.scrollTop - (e.screenY - _this2.dragging.y));
        _this2.scrollLeft(_this2.dragging.scrollLeft - (e.screenX - _this2.dragging.x));
        e.preventDefault();
      }
    };

    this.onMouseUp = function (e) {
      _this2.dragging = null;
      $(document).unbind('mousemove', _this2.onMouseMove);
      $(document).unbind('mouseup', _this2.onMouseUp);
      e.preventDefault();
    };

    this.on('mousedown', function (e) {
      _this2.simpleClick = true;
      atom.workspace.paneForItem(_this2).activate();
      _this2.dragging = { x: e.screenX, y: e.screenY, scrollTop: _this2.scrollTop(), scrollLeft: _this2.scrollLeft() };
      $(document).on('mousemove', _this2.onMouseMove);
      $(document).on('mouseup', _this2.onMouseUp);
      e.preventDefault();
    });

    this.on('mousewheel', function (e) {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.originalEvent.wheelDelta > 0) {
          _this2.zoomIn();
        } else if (e.originalEvent.wheelDelta < 0) {
          _this2.zoomOut();
        }
      }
    });
  }

  _createClass(PdfEditorView, [{
    key: 'reverseSync',
    value: function reverseSync(page, e) {
      var _this3 = this;

      if (this.simpleClick) {
        e.preventDefault();
        this.pdfDocument.getPage(page).then(function (pdfPage) {
          var viewport = pdfPage.getViewport(_this3.currentScale);

          var _viewport$convertToPdfPoint = viewport.convertToPdfPoint(e.offsetX, $(_this3.canvases[page - 1]).height() - e.offsetY);

          var _viewport$convertToPdfPoint2 = _slicedToArray(_viewport$convertToPdfPoint, 2);

          x = _viewport$convertToPdfPoint2[0];
          y = _viewport$convertToPdfPoint2[1];

          var callback = function callback(error, stdout, stderr) {
            if (!error) {
              stdout = stdout.replace(/\r\n/g, '\n');
              var attrs = {};
              for (var _line of stdout.split('\n')) {
                var m = _line.match(/^([a-zA-Z]*):(.*)$/);
                if (m) {
                  attrs[m[1]] = m[2];
                }
              }

              var file = attrs.Input;
              var line = attrs.Line;

              if (file && line) {
                var editor = null;
                var pathToOpen = path.normalize(attrs.Input);
                var lineToOpen = +attrs.Line;
                var done = false;
                for (var _editor of atom.workspace.getTextEditors()) {
                  if (_editor.getPath() === pathToOpen) {
                    var position = new Point(lineToOpen - 1, -1);
                    _editor.scrollToBufferPosition(position, { center: true });
                    _editor.setCursorBufferPosition(position);
                    _editor.moveToFirstCharacterOfLine();
                    var pane = atom.workspace.paneForItem(_editor);
                    pane.activateItem(_editor);
                    pane.activate();
                    done = true;
                    break;
                  }
                }

                if (!done) {
                  atom.workspace.open(pathToOpen, { initialLine: lineToOpen, initialColumn: 0 });
                }
              }
            }
          };

          var synctexPath = atom.config.get('pdf-view.syncTeXPath');
          var clickspec = [page, x, y, _this3.filePath].join(':');

          if (synctexPath) {
            execFile(synctexPath, ["edit", "-o", clickspec], callback);
          } else {
            var cmd = 'synctex edit -o "' + clickspec + '"';
            exec(cmd, callback);
          }
        });
      }
    }
  }, {
    key: 'forwardSync',
    value: function forwardSync(texPath, lineNumber) {
      var _this4 = this;

      var callback = function callback(error, stdout, stderr) {
        if (!error) {
          stdout = stdout.replace(/\r\n/g, '\n');
          var attrs = {};
          for (var line of stdout.split('\n')) {
            var m = line.match(/^([a-zA-Z]*):(.*)$/);
            if (m) {
              if (m[1] in attrs) {
                break;
              }

              attrs[m[1]] = m[2];
            }
          }

          var page = attrs.Page;
          _this4.scrollToPage(page);
        }
      };

      var synctexPath = atom.config.get('pdf-view.syncTeXPath');
      var inputspec = [lineNumber, 0, texPath].join(':');

      if (synctexPath) {
        execFile(synctexPath, ["view", "-i", inputspec, "-o", this.filePath], callback);
      } else {
        var cmd = 'synctex view -i "' + inputspec + '" -o "' + this.filePath + '"';
        exec(cmd, callback);
      }
    }
  }, {
    key: 'onScroll',
    value: function onScroll() {
      if (!this.updating) {
        this.scrollTopBeforeUpdate = this.scrollTop();
        this.scrollLeftBeforeUpdate = this.scrollLeft();
      }

      this.setCurrentPageNumber();
    }
  }, {
    key: 'setCurrentPageNumber',
    value: function setCurrentPageNumber() {
      if (!this.pdfDocument) {
        return;
      }

      var center = (this.scrollBottom() + this.scrollTop()) / 2.0;
      this.currentPageNumber = 1;

      if (this.centersBetweenPages.length === 0 && this.pageHeights.length === this.pdfDocument.numPages) for (var pdfPageNumber of _.range(1, this.pdfDocument.numPages + 1)) {
        this.centersBetweenPages.push(this.pageHeights.slice(0, pdfPageNumber).reduce(function (x, y) {
          return x + y;
        }, 0) + pdfPageNumber * 20 - 10);
      }

      for (var pdfPageNumber of _.range(2, this.pdfDocument.numPages + 1)) {
        if (center >= this.centersBetweenPages[pdfPageNumber - 2] && center < this.centersBetweenPages[pdfPageNumber - 1]) {
          this.currentPageNumber = pdfPageNumber;
        }
      }

      atom.views.getView(atom.workspace).dispatchEvent(new Event('pdf-view:current-page-update'));
    }
  }, {
    key: 'finishUpdate',
    value: function finishUpdate() {
      this.updating = false;
      if (this.needsUpdate) {
        this.updatePdf();
      }
      if (this.toScaleFactor != 1) {
        this.adjustSize(1);
      }
    }
  }, {
    key: 'updatePdf',
    value: function updatePdf() {
      var _this5 = this;

      var closeOnError = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this.needsUpdate = false;

      if (!fs.existsSync(this.filePath)) {
        return;
      }

      var pdfData = null;

      try {
        pdfData = new Uint8Array(fs.readFileSync(this.filePath));
      } catch (error) {
        if (error.code === 'ENOENT') {
          return;
        }
      }

      this.updating = true;

      var reverseSyncClicktype = null;
      switch (atom.config.get('pdf-view.reverseSyncBehaviour')) {
        case 'Click':
          reverseSyncClicktype = 'click';
          break;
        case 'Double click':
          reverseSyncClicktype = 'dblclick';
          break;
      }

      PDFJS.getDocument(pdfData).then(function (pdfDocument) {
        _this5.container.find("canvas").remove();
        _this5.canvases = [];
        _this5.pageHeights = [];

        _this5.pdfDocument = pdfDocument;
        _this5.totalPageNumber = _this5.pdfDocument.numPages;

        var _loop = function (pdfPageNumber) {
          var canvas = $("<canvas/>", { 'class': "page-container" }).appendTo(_this5.container)[0];
          _this5.canvases.push(canvas);
          _this5.pageHeights.push(0);
          if (reverseSyncClicktype) {
            $(canvas).on(reverseSyncClicktype, function (e) {
              return _this5.reverseSync(pdfPageNumber, e);
            });
          }
        };

        for (var pdfPageNumber of _.range(1, _this5.pdfDocument.numPages + 1)) {
          _loop(pdfPageNumber);
        }

        if (_this5.fitToWidthOnOpen) {
          Promise.all(_.range(1, _this5.pdfDocument.numPages + 1).map(function (pdfPageNumber) {
            return _this5.pdfDocument.getPage(pdfPageNumber).then(function (pdfPage) {
              return pdfPage.getViewport(1.0).width;
            });
          })).then(function (pdfPageWidths) {
            _this5.maxPageWidth = Math.max.apply(Math, _toConsumableArray(pdfPageWidths));
            _this5.renderPdf();
          });
        } else {
          _this5.renderPdf();
        }
      }, function () {
        if (closeOnError) {
          atom.notifications.addError(_this5.filePath + " is not a PDF file.");
          atom.workspace.paneForItem(_this5).destroyItem(_this5);
        } else {
          _this5.finishUpdate();
        }
      });
    }
  }, {
    key: 'renderPdf',
    value: function renderPdf() {
      var _this6 = this;

      var scrollAfterRender = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      this.centersBetweenPages = [];

      if (this.fitToWidthOnOpen) {
        this.currentScale = this[0].clientWidth / this.maxPageWidth;
        this.fitToWidthOnOpen = false;
      }

      Promise.all(_.range(1, this.pdfDocument.numPages + 1).map(function (pdfPageNumber) {
        var canvas = _this6.canvases[pdfPageNumber - 1];

        return _this6.pdfDocument.getPage(pdfPageNumber).then(function (pdfPage) {
          var viewport = pdfPage.getViewport(_this6.currentScale);
          var context = canvas.getContext('2d');

          var outputScale = window.devicePixelRatio;
          canvas.height = Math.floor(viewport.height) * outputScale;
          canvas.width = Math.floor(viewport.width) * outputScale;

          if (outputScale != 1) {
            context._scaleX = outputScale;
            context._scaleY = outputScale;
            context.scale(outputScale, outputScale);
            canvas.style.width = Math.floor(viewport.width) + 'px';
            canvas.style.height = Math.floor(viewport.height) + 'px';
          }

          _this6.pageHeights[pdfPageNumber - 1] = Math.floor(viewport.height);

          return pdfPage.render({ canvasContext: context, viewport: viewport });
        });
      })).then(function (renderTasks) {
        if (scrollAfterRender) {
          _this6.scrollTop(_this6.scrollTopBeforeUpdate);
          _this6.scrollLeft(_this6.scrollLeftBeforeUpdate);
          _this6.setCurrentPageNumber();
        }
        Promise.all(renderTasks).then(function () {
          return _this6.finishUpdate();
        });
      }, function () {
        return _this6.finishUpdate();
      });
    }
  }, {
    key: 'zoomOut',
    value: function zoomOut() {
      return this.adjustSize(100 / (100 + this.scaleFactor));
    }
  }, {
    key: 'zoomIn',
    value: function zoomIn() {
      return this.adjustSize((100 + this.scaleFactor) / 100);
    }
  }, {
    key: 'resetZoom',
    value: function resetZoom() {
      return this.adjustSize(this.defaultScale / this.currentScale);
    }
  }, {
    key: 'computeZoomedScrollTop',
    value: function computeZoomedScrollTop(oldScrollTop, oldPageHeights) {
      var pixelsToZoom = 0;
      var spacesToSkip = 0;
      var zoomedPixels = 0;

      for (var pdfPageNumber of _.range(0, this.pdfDocument.numPages)) {
        if (pixelsToZoom + spacesToSkip + oldPageHeights[pdfPageNumber] > oldScrollTop) {
          zoomFactorForPage = this.pageHeights[pdfPageNumber] / oldPageHeights[pdfPageNumber];
          var partOfPageAboveUpperBorder = oldScrollTop - (pixelsToZoom + spacesToSkip);
          zoomedPixels += Math.round(partOfPageAboveUpperBorder * zoomFactorForPage);
          pixelsToZoom += partOfPageAboveUpperBorder;
          break;
        } else {
          pixelsToZoom += oldPageHeights[pdfPageNumber];
          zoomedPixels += this.pageHeights[pdfPageNumber];
        }

        if (pixelsToZoom + spacesToSkip + 20 > oldScrollTop) {
          var partOfPaddingAboveUpperBorder = oldScrollTop - (pixelsToZoom + spacesToSkip);
          spacesToSkip += partOfPaddingAboveUpperBorder;
          break;
        } else {
          spacesToSkip += 20;
        }
      }

      return zoomedPixels + spacesToSkip;
    }
  }, {
    key: 'adjustSize',
    value: function adjustSize(factor) {
      var _this7 = this;

      if (!this.pdfDocument) {
        return;
      }

      factor = this.toScaleFactor * factor;

      if (this.updating) {
        this.toScaleFactor = factor;
        return;
      }

      this.updating = true;
      this.toScaleFactor = 1;

      var oldScrollTop = this.scrollTop();
      var oldPageHeights = this.pageHeights.slice(0);
      this.currentScale = this.currentScale * factor;
      this.renderPdf(false);

      process.nextTick(function () {
        var newScrollTop = _this7.computeZoomedScrollTop(oldScrollTop, oldPageHeights);
        _this7.scrollTop(newScrollTop);
      });

      process.nextTick(function () {
        var newScrollLeft = _this7.scrollLeft() * factor;
        _this7.scrollLeft(newScrollLeft);
      });
    }
  }, {
    key: 'getCurrentPageNumber',
    value: function getCurrentPageNumber() {
      return this.currentPageNumber;
    }
  }, {
    key: 'getTotalPageNumber',
    value: function getTotalPageNumber() {
      return this.totalPageNumber;
    }
  }, {
    key: 'scrollToPage',
    value: function scrollToPage(pdfPageNumber) {
      if (!this.pdfDocument || isNaN(pdfPageNumber)) {
        return;
      }

      pdfPageNumber = Math.min(pdfPageNumber, this.pdfDocument.numPages);
      pageScrollPosition = this.pageHeights.slice(0, pdfPageNumber - 1).reduce(function (x, y) {
        return x + y;
      }, 0) + (pdfPageNumber - 1) * 20;

      return this.scrollTop(pageScrollPosition);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        filePath: this.filePath,
        scale: this.currentScale,
        scrollTop: this.scrollTopBeforeUpdate,
        scrollLeft: this.scrollLeftBeforeUpdate,
        deserializer: 'PdfEditorDeserializer'
      };
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      if (this.filePath) {
        return path.basename(this.filePath);
      } else {
        return 'untitled';
      }
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      return this.filePath;
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      return this.filePath;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      return this.detach();
    }
  }, {
    key: 'onDidChangeTitle',
    value: function onDidChangeTitle() {
      return new Disposable(function () {
        return null;
      });
    }
  }, {
    key: 'onDidChangeModified',
    value: function onDidChangeModified() {
      return new Disposable(function () {
        return null;
      });
    }
  }]);

  return PdfEditorView;
})(ScrollView);

exports['default'] = PdfEditorView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9wZGYtdmlldy9saWIvcGRmLWVkaXRvci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBRVUsT0FBTyxDQUFDLHNCQUFzQixDQUFDOztJQUFoRCxDQUFDLFlBQUQsQ0FBQztJQUFFLFVBQVUsWUFBVixVQUFVOztnQkFDSixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLGFBQUwsS0FBSzs7QUFDVixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDNUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztnQkFDVyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4RCxJQUFJLGFBQUosSUFBSTtJQUFFLFVBQVUsYUFBVixVQUFVO0lBQUUsbUJBQW1CLGFBQW5CLG1CQUFtQjs7Z0JBQ3pCLE9BQU8sQ0FBQyxVQUFVLENBQUM7O0lBQS9CLFFBQVEsYUFBUixRQUFROztBQUNiLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztBQUUzQixNQUFNLENBQUMsS0FBSyxHQUFHLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxJQUFJLEVBQUMsQ0FBQztBQUNwRSxPQUFPLENBQUMsMkNBQTJDLENBQUMsQ0FBQztBQUNyRCxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO0FBQ3hHLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGtDQUFrQyxDQUFDLEdBQUMsR0FBRyxDQUFDOztnQkFDckUsT0FBTyxDQUFD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QkFBVSxFQUFFLElBQUksQ0FBQyxzQkFBc0I7QUFDdkMsb0JBQVksRUFBRSx1QkFBdUI7T0FDdEMsQ0FBQztLQUNIOzs7V0FFTyxvQkFBRztBQUNULFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixlQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3JDLE1BQU07QUFDTCxlQUFPLFVBQVUsQ0FBQztPQUNuQjtLQUNGOzs7V0FFSyxrQkFBRztBQUNQLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0Qjs7O1dBRU0sbUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztXQUVNLG1CQUFHO0FBQ1IsYUFBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDdEI7OztXQUVlLDRCQUFHO0FBQ2pCLGFBQU8sSUFBSSxVQUFVLENBQUM7ZUFBTSxJQUFJO09BQUEsQ0FBQyxDQUFDO0tBQ25DOzs7V0FFa0IsK0JBQUc7QUFDcEIsYUFBTyxJQUFJLFVBQVUsQ0FBQztlQUFNLElBQUk7T0FBQSxDQUFDLENBQUM7S0FDbkM7OztTQTlla0IsYUFBYTtHQUFTLFVBQVU7O3FCQUFoQyxhQUFhIiwiZmlsZSI6Ii9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9wZGYtdmlldy9saWIvcGRmLWVkaXRvci12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcblxubGV0IHskLCBTY3JvbGxWaWV3fSA9IHJlcXVpcmUoJ2F0b20tc3BhY2UtcGVuLXZpZXdzJyk7XG5sZXQge1BvaW50fSA9IHJlcXVpcmUoJ2F0b20nKTtcbmxldCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbmxldCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xubGV0IF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlLXBsdXMnKTtcbmxldCB7RmlsZSwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5sZXQge0Z1bmN0aW9ufSA9IHJlcXVpcmUoJ2xvb3Bob2xlJyk7XG5nbG9iYWwuRnVuY3Rpb24gPSBGdW5jdGlvbjtcblxuZ2xvYmFsLlBERkpTID0ge3dvcmtlclNyYzogXCJ0ZW1wXCIsIGNNYXBVcmw6XCJ0ZW1wXCIsIGNNYXBQYWNrZWQ6dHJ1ZX07XG5yZXF1aXJlKCcuLy4uL25vZGVfbW9kdWxlcy9wZGZqcy1kaXN0L2J1aWxkL3BkZi5qcycpO1xuUERGSlMud29ya2VyU3JjID0gXCJmaWxlOi8vXCIgKyBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL25vZGVfbW9kdWxlcy9wZGZqcy1kaXN0L2J1aWxkL3BkZi53b3JrZXIuanNcIik7XG5QREZKUy5jTWFwVXJsID0gXCJmaWxlOi8vXCIgKyBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL25vZGVfbW9kdWxlcy9wZGZqcy1kaXN0L2NtYXBzXCIpK1wiL1wiO1xubGV0IHtleGVjLCBleGVjRmlsZX0gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBkZkVkaXRvclZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3IHtcbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgdGhpcy5kaXYoe2NsYXNzOiAncGRmLXZpZXcnLCB0YWJpbmRleDogLTF9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7b3V0bGV0OiAnY29udGFpbmVyJ30pO1xuICAgIH0pO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZmlsZVBhdGgsIHNjYWxlID0gbnVsbCwgc2Nyb2xsVG9wID0gMCwgc2Nyb2xsTGVmdCA9IDApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jdXJyZW50U2NhbGUgPSBzY2FsZSA/IHNjYWxlIDogMS41O1xuICAgIHRoaXMuZGVmYXVsdFNjYWxlID0gMS41O1xuICAgIHRoaXMuc2NhbGVGYWN0b3IgPSAxMC4wO1xuICAgIHRoaXMuZml0VG9XaWR0aE9uT3BlbiA9ICFzY2FsZSAmJiBhdG9tLmNvbmZpZy5nZXQoJ3BkZi12aWV3LmZpdFRvV2lkdGhPbk9wZW4nKVxuXG4gICAgdGhpcy5maWxlUGF0aCA9IGZpbGVQYXRoO1xuICAgIHRoaXMuZmlsZSA9IG5ldyBGaWxlKHRoaXMuZmlsZVBhdGgpO1xuICAgIHRoaXMuc2Nyb2xsVG9wQmVmb3JlVXBkYXRlID0gc2Nyb2xsVG9wO1xuICAgIHRoaXMuc2Nyb2xsTGVmdEJlZm9yZVVwZGF0ZSA9IHNjcm9sbExlZnQ7XG4gICAgdGhpcy5jYW52YXNlcyA9IFtdO1xuXG4gICAgdGhpcy51cGRhdGVQZGYoY2xvc2VPbkVycm9yID0gdHJ1ZSk7XG5cbiAgICB0aGlzLmN1cnJlbnRQYWdlTnVtYmVyID0gMDtcbiAgICB0aGlzLnRvdGFsUGFnZU51bWJlciA9IDA7XG4gICAgdGhpcy5jZW50ZXJzQmV0d2VlblBhZ2VzID0gW107XG4gICAgdGhpcy5wYWdlSGVpZ2h0cyA9IFtdO1xuICAgIHRoaXMubWF4UGFnZVdpZHRoID0gMDtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgdGhpcy50b1NjYWxlRmFjdG9yID0gMS4wO1xuXG4gICAgbGV0IGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIGxldCBuZWVkc1VwZGF0ZUNhbGxiYWNrID0gXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy51cGRhdGluZykge1xuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXBkYXRlUGRmKCk7XG4gICAgICB9XG4gICAgfSwgMTAwKTtcblxuICAgIGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgncGRmLXZpZXcucmV2ZXJzZVN5bmNCZWhhdmlvdXInLCBuZWVkc1VwZGF0ZUNhbGxiYWNrKSk7XG4gICAgZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShuZWVkc1VwZGF0ZUNhbGxiYWNrKSk7XG5cbiAgICBsZXQgbW92ZUxlZnRDYWxsYmFjayA9ICgoKSA9PiB0aGlzLnNjcm9sbExlZnQodGhpcy5zY3JvbGxMZWZ0KCkgLSAkKHdpbmRvdykud2lkdGgoKSAvIDIwKSk7XG4gICAgbGV0IG1vdmVSaWdodENhbGxiYWNrID0gKCgpID0+IHRoaXMuc2Nyb2xsUmlnaHQodGhpcy5zY3JvbGxSaWdodCgpICsgJCh3aW5kb3cpLndpZHRoKCkgLyAyMCkpO1xuICAgIGxldCBzY3JvbGxDYWxsYmFjayA9ICgoKSA9PiB0aGlzLm9uU2Nyb2xsKCkpO1xuICAgIGxldCByZXNpemVIYW5kbGVyID0gKCgpID0+IHRoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIoKSk7XG5cbiAgICBsZXQgZWxlbSA9IHRoaXM7XG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLnBkZi12aWV3Jywge1xuICAgICAgJ2NvcmU6bW92ZS1sZWZ0JzogbW92ZUxlZnRDYWxsYmFjayxcbiAgICAgICdjb3JlOm1vdmUtcmlnaHQnOiBtb3ZlUmlnaHRDYWxsYmFja1xuICAgIH0pO1xuXG4gICAgZWxlbS5vbignc2Nyb2xsJywgc2Nyb2xsQ2FsbGJhY2spO1xuICAgIGRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiAkKHdpbmRvdykub2ZmKCdzY3JvbGwnLCBzY3JvbGxDYWxsYmFjaykpKTtcblxuICAgICQod2luZG93KS5vbigncmVzaXplJywgcmVzaXplSGFuZGxlcik7XG4gICAgZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+ICQod2luZG93KS5vZmYoJ3Jlc2l6ZScsIHJlc2l6ZUhhbmRsZXIpKSk7XG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAncGRmLXZpZXc6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgaWYgKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPT09IHRoaXMpIHtcbiAgICAgICAgICB0aGlzLnpvb21JbigpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ3BkZi12aWV3Onpvb20tb3V0JzogKCkgPT4ge1xuICAgICAgICBpZiAoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSA9PT0gdGhpcykge1xuICAgICAgICAgIHRoaXMuem9vbU91dCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ3BkZi12aWV3OnJlc2V0LXpvb20nOiAoKSA9PiB7XG4gICAgICAgIGlmIChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpID09PSB0aGlzKSB7XG4gICAgICAgICAgdGhpcy5yZXNldFpvb20oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5kcmFnZ2luZyA9IG51bGw7XG5cbiAgICB0aGlzLm9uTW91c2VNb3ZlID0gKGUpID0+IHtcbiAgICAgIGlmICh0aGlzLmRyYWdnaW5nKSB7XG4gICAgICAgIHRoaXMuc2ltcGxlQ2xpY2sgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnNjcm9sbFRvcCh0aGlzLmRyYWdnaW5nLnNjcm9sbFRvcCAtIChlLnNjcmVlblkgLSB0aGlzLmRyYWdnaW5nLnkpKTtcbiAgICAgICAgdGhpcy5zY3JvbGxMZWZ0KHRoaXMuZHJhZ2dpbmcuc2Nyb2xsTGVmdCAtIChlLnNjcmVlblggLSB0aGlzLmRyYWdnaW5nLngpKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm9uTW91c2VVcCA9IChlKSA9PiB7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gbnVsbDtcbiAgICAgICQoZG9jdW1lbnQpLnVuYmluZCgnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSk7XG4gICAgICAkKGRvY3VtZW50KS51bmJpbmQoJ21vdXNldXAnLCB0aGlzLm9uTW91c2VVcCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfTtcblxuICAgIHRoaXMub24oJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICB0aGlzLnNpbXBsZUNsaWNrID0gdHJ1ZTtcbiAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpLmFjdGl2YXRlKCk7XG4gICAgICB0aGlzLmRyYWdnaW5nID0ge3g6IGUuc2NyZWVuWCwgeTogZS5zY3JlZW5ZLCBzY3JvbGxUb3A6IHRoaXMuc2Nyb2xsVG9wKCksIHNjcm9sbExlZnQ6IHRoaXMuc2Nyb2xsTGVmdCgpfTtcbiAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcbiAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignbW91c2V3aGVlbCcsIChlKSA9PiB7XG4gICAgICBpZiAoZS5jdHJsS2V5KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKGUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhID4gMCkge1xuICAgICAgICAgIHRoaXMuem9vbUluKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgPCAwKSB7XG4gICAgICAgICAgdGhpcy56b29tT3V0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldmVyc2VTeW5jKHBhZ2UsIGUpIHtcbiAgICBpZiAodGhpcy5zaW1wbGVDbGljaykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5wZGZEb2N1bWVudC5nZXRQYWdlKHBhZ2UpLnRoZW4oKHBkZlBhZ2UpID0+IHtcbiAgICAgICAgbGV0IHZpZXdwb3J0ID0gcGRmUGFnZS5nZXRWaWV3cG9ydCh0aGlzLmN1cnJlbnRTY2FsZSk7XG4gICAgICAgIFt4LHldID0gdmlld3BvcnQuY29udmVydFRvUGRmUG9pbnQoZS5vZmZzZXRYLCAkKHRoaXMuY2FudmFzZXNbcGFnZSAtIDFdKS5oZWlnaHQoKSAtIGUub2Zmc2V0WSk7XG5cbiAgICAgICAgbGV0IGNhbGxiYWNrID0gKChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICBzdGRvdXQgPSBzdGRvdXQucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKTtcbiAgICAgICAgICAgIGxldCBhdHRycyA9IHt9O1xuICAgICAgICAgICAgZm9yIChsZXQgbGluZSBvZiBzdGRvdXQuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgICAgICAgIGxldCBtID0gbGluZS5tYXRjaCgvXihbYS16QS1aXSopOiguKikkLylcbiAgICAgICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICAgICBhdHRyc1ttWzFdXSA9IG1bMl07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGZpbGUgPSBhdHRycy5JbnB1dDtcbiAgICAgICAgICAgIGxldCBsaW5lID0gYXR0cnMuTGluZTtcblxuICAgICAgICAgICAgaWYgKGZpbGUgJiYgbGluZSkge1xuICAgICAgICAgICAgICBsZXQgZWRpdG9yID0gbnVsbDtcbiAgICAgICAgICAgICAgbGV0IHBhdGhUb09wZW4gPSBwYXRoLm5vcm1hbGl6ZShhdHRycy5JbnB1dCk7XG4gICAgICAgICAgICAgIGxldCBsaW5lVG9PcGVuID0gK2F0dHJzLkxpbmU7XG4gICAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIGZvciAobGV0IGVkaXRvciBvZiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVkaXRvci5nZXRQYXRoKCkgPT09IHBhdGhUb09wZW4pIHtcbiAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IG5ldyBQb2ludChsaW5lVG9PcGVuLTEsIC0xKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHBvc2l0aW9uLCB7Y2VudGVyOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKCk7XG4gICAgICAgICAgICAgICAgICBsZXQgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcik7XG4gICAgICAgICAgICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpO1xuICAgICAgICAgICAgICAgICAgcGFuZS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIWRvbmUpIHtcbiAgICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGhUb09wZW4sIHtpbml0aWFsTGluZTogbGluZVRvT3BlbiwgaW5pdGlhbENvbHVtbjogMH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBzeW5jdGV4UGF0aCA9IGF0b20uY29uZmlnLmdldCgncGRmLXZpZXcuc3luY1RlWFBhdGgnKTtcbiAgICAgICAgbGV0IGNsaWNrc3BlYyA9IFtwYWdlLCB4LCB5LCB0aGlzLmZpbGVQYXRoXS5qb2luKCc6Jyk7XG5cbiAgICAgICAgaWYgKHN5bmN0ZXhQYXRoKSB7XG4gICAgICAgICAgZXhlY0ZpbGUoc3luY3RleFBhdGgsIFtcImVkaXRcIiwgXCItb1wiLCBjbGlja3NwZWNdLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGNtZCA9IGBzeW5jdGV4IGVkaXQgLW8gXCIke2NsaWNrc3BlY31cImA7XG4gICAgICAgICAgZXhlYyhjbWQsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZm9yd2FyZFN5bmModGV4UGF0aCwgbGluZU51bWJlcikge1xuICAgICAgbGV0IGNhbGxiYWNrID0gKChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgIHN0ZG91dCA9IHN0ZG91dC5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuICAgICAgICAgIGxldCBhdHRycyA9IHt9O1xuICAgICAgICAgIGZvciAobGV0IGxpbmUgb2Ygc3Rkb3V0LnNwbGl0KCdcXG4nKSkge1xuICAgICAgICAgICAgbGV0IG0gPSBsaW5lLm1hdGNoKC9eKFthLXpBLVpdKik6KC4qKSQvKVxuICAgICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICAgaWYgKG1bMV0gaW4gYXR0cnMpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGF0dHJzW21bMV1dID0gbVsyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgcGFnZSA9IGF0dHJzLlBhZ2U7XG4gICAgICAgICAgdGhpcy5zY3JvbGxUb1BhZ2UocGFnZSlcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGxldCBzeW5jdGV4UGF0aCA9IGF0b20uY29uZmlnLmdldCgncGRmLXZpZXcuc3luY1RlWFBhdGgnKTtcbiAgICAgIGxldCBpbnB1dHNwZWMgPSBbbGluZU51bWJlciwgMCwgdGV4UGF0aF0uam9pbignOicpO1xuXG4gICAgICBpZiAoc3luY3RleFBhdGgpIHtcbiAgICAgICAgZXhlY0ZpbGUoc3luY3RleFBhdGgsIFtcInZpZXdcIiwgXCItaVwiLCBpbnB1dHNwZWMsIFwiLW9cIiwgdGhpcy5maWxlUGF0aF0sIGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBjbWQgPSBgc3luY3RleCB2aWV3IC1pIFwiJHtpbnB1dHNwZWN9XCIgLW8gXCIke3RoaXMuZmlsZVBhdGh9XCJgO1xuICAgICAgICBleGVjKGNtZCwgY2FsbGJhY2spO1xuICAgICAgfVxuICB9XG5cblxuICBvblNjcm9sbCgpIHtcbiAgICBpZiAoIXRoaXMudXBkYXRpbmcpIHtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wQmVmb3JlVXBkYXRlID0gdGhpcy5zY3JvbGxUb3AoKTtcbiAgICAgIHRoaXMuc2Nyb2xsTGVmdEJlZm9yZVVwZGF0ZSA9IHRoaXMuc2Nyb2xsTGVmdCgpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIoKTtcbiAgfVxuXG4gIHNldEN1cnJlbnRQYWdlTnVtYmVyKCkge1xuICAgIGlmICghdGhpcy5wZGZEb2N1bWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBjZW50ZXIgPSAodGhpcy5zY3JvbGxCb3R0b20oKSArIHRoaXMuc2Nyb2xsVG9wKCkpLzIuMFxuICAgIHRoaXMuY3VycmVudFBhZ2VOdW1iZXIgPSAxXG5cbiAgICBpZiAodGhpcy5jZW50ZXJzQmV0d2VlblBhZ2VzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLnBhZ2VIZWlnaHRzLmxlbmd0aCA9PT0gdGhpcy5wZGZEb2N1bWVudC5udW1QYWdlcylcbiAgICAgIGZvciAobGV0IHBkZlBhZ2VOdW1iZXIgb2YgXy5yYW5nZSgxLCB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzKzEpKSB7XG4gICAgICAgIHRoaXMuY2VudGVyc0JldHdlZW5QYWdlcy5wdXNoKHRoaXMucGFnZUhlaWdodHMuc2xpY2UoMCwgcGRmUGFnZU51bWJlcikucmVkdWNlKCgoeCx5KSA9PiB4ICsgeSksIDApICsgcGRmUGFnZU51bWJlciAqIDIwIC0gMTApO1xuICAgICAgfVxuXG4gICAgZm9yIChsZXQgcGRmUGFnZU51bWJlciBvZiBfLnJhbmdlKDIsIHRoaXMucGRmRG9jdW1lbnQubnVtUGFnZXMrMSkpIHtcbiAgICAgIGlmIChjZW50ZXIgPj0gdGhpcy5jZW50ZXJzQmV0d2VlblBhZ2VzW3BkZlBhZ2VOdW1iZXItMl0gJiYgY2VudGVyIDwgdGhpcy5jZW50ZXJzQmV0d2VlblBhZ2VzW3BkZlBhZ2VOdW1iZXItMV0pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZU51bWJlciA9IHBkZlBhZ2VOdW1iZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgncGRmLXZpZXc6Y3VycmVudC1wYWdlLXVwZGF0ZScpKTtcbiAgfVxuXG4gIGZpbmlzaFVwZGF0ZSgpIHtcbiAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgaWYgKHRoaXMubmVlZHNVcGRhdGUpIHtcbiAgICAgIHRoaXMudXBkYXRlUGRmKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRvU2NhbGVGYWN0b3IgIT0gMSkge1xuICAgICAgdGhpcy5hZGp1c3RTaXplKDEpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVBkZihjbG9zZU9uRXJyb3IgPSBmYWxzZSkge1xuICAgIHRoaXMubmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwZGZEYXRhID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICBwZGZEYXRhID0gbmV3IFVpbnQ4QXJyYXkoZnMucmVhZEZpbGVTeW5jKHRoaXMuZmlsZVBhdGgpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcblxuICAgIGxldCByZXZlcnNlU3luY0NsaWNrdHlwZSA9IG51bGxcbiAgICBzd2l0Y2goYXRvbS5jb25maWcuZ2V0KCdwZGYtdmlldy5yZXZlcnNlU3luY0JlaGF2aW91cicpKSB7XG4gICAgICBjYXNlICdDbGljayc6XG4gICAgICAgIHJldmVyc2VTeW5jQ2xpY2t0eXBlID0gJ2NsaWNrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnRG91YmxlIGNsaWNrJzpcbiAgICAgICAgcmV2ZXJzZVN5bmNDbGlja3R5cGUgPSAnZGJsY2xpY2snXG4gICAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgUERGSlMuZ2V0RG9jdW1lbnQocGRmRGF0YSkudGhlbigocGRmRG9jdW1lbnQpID0+IHtcbiAgICAgIHRoaXMuY29udGFpbmVyLmZpbmQoXCJjYW52YXNcIikucmVtb3ZlKCk7XG4gICAgICB0aGlzLmNhbnZhc2VzID0gW107XG4gICAgICB0aGlzLnBhZ2VIZWlnaHRzID0gW107XG5cbiAgICAgIHRoaXMucGRmRG9jdW1lbnQgPSBwZGZEb2N1bWVudDtcbiAgICAgIHRoaXMudG90YWxQYWdlTnVtYmVyID0gdGhpcy5wZGZEb2N1bWVudC5udW1QYWdlcztcblxuICAgICAgZm9yIChsZXQgcGRmUGFnZU51bWJlciBvZiBfLnJhbmdlKDEsIHRoaXMucGRmRG9jdW1lbnQubnVtUGFnZXMrMSkpIHtcbiAgICAgICAgbGV0IGNhbnZhcyA9ICQoXCI8Y2FudmFzLz5cIiwge2NsYXNzOiBcInBhZ2UtY29udGFpbmVyXCJ9KS5hcHBlbmRUbyh0aGlzLmNvbnRhaW5lcilbMF07XG4gICAgICAgIHRoaXMuY2FudmFzZXMucHVzaChjYW52YXMpO1xuICAgICAgICB0aGlzLnBhZ2VIZWlnaHRzLnB1c2goMCk7XG4gICAgICAgIGlmIChyZXZlcnNlU3luY0NsaWNrdHlwZSkge1xuICAgICAgICAgICQoY2FudmFzKS5vbihyZXZlcnNlU3luY0NsaWNrdHlwZSwgKGUpID0+IHRoaXMucmV2ZXJzZVN5bmMocGRmUGFnZU51bWJlciwgZSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmZpdFRvV2lkdGhPbk9wZW4pIHtcbiAgICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgXy5yYW5nZSgxLCB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzICsgMSkubWFwKChwZGZQYWdlTnVtYmVyKSA9PlxuICAgICAgICAgICAgdGhpcy5wZGZEb2N1bWVudC5nZXRQYWdlKHBkZlBhZ2VOdW1iZXIpLnRoZW4oKHBkZlBhZ2UpID0+XG4gICAgICAgICAgICAgIHBkZlBhZ2UuZ2V0Vmlld3BvcnQoMS4wKS53aWR0aFxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKS50aGVuKChwZGZQYWdlV2lkdGhzKSA9PiB7XG4gICAgICAgICAgdGhpcy5tYXhQYWdlV2lkdGggPSBNYXRoLm1heCguLi5wZGZQYWdlV2lkdGhzKTtcbiAgICAgICAgICB0aGlzLnJlbmRlclBkZigpO1xuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW5kZXJQZGYoKTtcbiAgICAgIH1cbiAgICB9LCAoKSA9PiB7XG4gICAgICBpZiAoY2xvc2VPbkVycm9yKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcih0aGlzLmZpbGVQYXRoICsgXCIgaXMgbm90IGEgUERGIGZpbGUuXCIpO1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKS5kZXN0cm95SXRlbSh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZmluaXNoVXBkYXRlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZW5kZXJQZGYoc2Nyb2xsQWZ0ZXJSZW5kZXIgPSB0cnVlKSB7XG4gICAgdGhpcy5jZW50ZXJzQmV0d2VlblBhZ2VzID0gW107XG5cbiAgICBpZiAodGhpcy5maXRUb1dpZHRoT25PcGVuKSB7XG4gICAgICB0aGlzLmN1cnJlbnRTY2FsZSA9IHRoaXNbMF0uY2xpZW50V2lkdGggLyB0aGlzLm1heFBhZ2VXaWR0aDtcbiAgICAgIHRoaXMuZml0VG9XaWR0aE9uT3BlbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIFByb21pc2UuYWxsKFxuICAgICAgXy5yYW5nZSgxLCB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzICsgMSkubWFwKChwZGZQYWdlTnVtYmVyKSA9PiB7XG4gICAgICAgIGxldCBjYW52YXMgPSB0aGlzLmNhbnZhc2VzW3BkZlBhZ2VOdW1iZXIgLSAxXTtcblxuICAgICAgICByZXR1cm4gdGhpcy5wZGZEb2N1bWVudC5nZXRQYWdlKHBkZlBhZ2VOdW1iZXIpLnRoZW4oKHBkZlBhZ2UpID0+IHtcbiAgICAgICAgICBsZXQgdmlld3BvcnQgPSBwZGZQYWdlLmdldFZpZXdwb3J0KHRoaXMuY3VycmVudFNjYWxlKTtcbiAgICAgICAgICBsZXQgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgbGV0IG91dHB1dFNjYWxlID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICAgICAgY2FudmFzLmhlaWdodCA9IE1hdGguZmxvb3Iodmlld3BvcnQuaGVpZ2h0KSAqIG91dHB1dFNjYWxlO1xuICAgICAgICAgIGNhbnZhcy53aWR0aCA9IE1hdGguZmxvb3Iodmlld3BvcnQud2lkdGgpICogb3V0cHV0U2NhbGU7XG5cbiAgICAgICAgICBpZiAob3V0cHV0U2NhbGUgIT0gMSkge1xuICAgICAgICAgICAgY29udGV4dC5fc2NhbGVYID0gb3V0cHV0U2NhbGU7XG4gICAgICAgICAgICBjb250ZXh0Ll9zY2FsZVkgPSBvdXRwdXRTY2FsZTtcbiAgICAgICAgICAgIGNvbnRleHQuc2NhbGUob3V0cHV0U2NhbGUsIG91dHB1dFNjYWxlKTtcbiAgICAgICAgICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IE1hdGguZmxvb3Iodmlld3BvcnQud2lkdGgpICsgJ3B4JztcbiAgICAgICAgICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBNYXRoLmZsb29yKHZpZXdwb3J0LmhlaWdodCkgKyAncHgnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMucGFnZUhlaWdodHNbcGRmUGFnZU51bWJlciAtIDFdID0gTWF0aC5mbG9vcih2aWV3cG9ydC5oZWlnaHQpO1xuXG4gICAgICAgICAgcmV0dXJuIHBkZlBhZ2UucmVuZGVyKHtjYW52YXNDb250ZXh0OiBjb250ZXh0LCB2aWV3cG9ydDogdmlld3BvcnR9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICkudGhlbigocmVuZGVyVGFza3MpID0+IHtcbiAgICAgIGlmIChzY3JvbGxBZnRlclJlbmRlcikge1xuICAgICAgICB0aGlzLnNjcm9sbFRvcCh0aGlzLnNjcm9sbFRvcEJlZm9yZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMuc2Nyb2xsTGVmdCh0aGlzLnNjcm9sbExlZnRCZWZvcmVVcGRhdGUpO1xuICAgICAgICB0aGlzLnNldEN1cnJlbnRQYWdlTnVtYmVyKCk7XG4gICAgICB9XG4gICAgICBQcm9taXNlLmFsbChyZW5kZXJUYXNrcykudGhlbigoKSA9PiB0aGlzLmZpbmlzaFVwZGF0ZSgpKTtcbiAgICB9LCAoKSA9PiB0aGlzLmZpbmlzaFVwZGF0ZSgpKTtcbiAgfVxuXG4gIHpvb21PdXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRqdXN0U2l6ZSgxMDAgLyAoMTAwICsgdGhpcy5zY2FsZUZhY3RvcikpO1xuICB9XG5cbiAgem9vbUluKCkge1xuICAgIHJldHVybiB0aGlzLmFkanVzdFNpemUoKDEwMCArIHRoaXMuc2NhbGVGYWN0b3IpIC8gMTAwKTtcbiAgfVxuXG4gIHJlc2V0Wm9vbSgpIHtcbiAgICByZXR1cm4gdGhpcy5hZGp1c3RTaXplKHRoaXMuZGVmYXVsdFNjYWxlIC8gdGhpcy5jdXJyZW50U2NhbGUpO1xuICB9XG5cbiAgY29tcHV0ZVpvb21lZFNjcm9sbFRvcChvbGRTY3JvbGxUb3AsIG9sZFBhZ2VIZWlnaHRzKSB7XG4gICAgbGV0IHBpeGVsc1RvWm9vbSA9IDA7XG4gICAgbGV0IHNwYWNlc1RvU2tpcCA9IDA7XG4gICAgbGV0IHpvb21lZFBpeGVscyA9IDA7XG5cbiAgICBmb3IgKGxldCBwZGZQYWdlTnVtYmVyIG9mIF8ucmFuZ2UoMCwgdGhpcy5wZGZEb2N1bWVudC5udW1QYWdlcykpIHtcbiAgICAgIGlmIChwaXhlbHNUb1pvb20gKyBzcGFjZXNUb1NraXAgKyBvbGRQYWdlSGVpZ2h0c1twZGZQYWdlTnVtYmVyXSA+IG9sZFNjcm9sbFRvcCkge1xuICAgICAgICB6b29tRmFjdG9yRm9yUGFnZSA9IHRoaXMucGFnZUhlaWdodHNbcGRmUGFnZU51bWJlcl0gLyBvbGRQYWdlSGVpZ2h0c1twZGZQYWdlTnVtYmVyXTtcbiAgICAgICAgbGV0IHBhcnRPZlBhZ2VBYm92ZVVwcGVyQm9yZGVyID0gb2xkU2Nyb2xsVG9wIC0gKHBpeGVsc1RvWm9vbSArIHNwYWNlc1RvU2tpcCk7XG4gICAgICAgIHpvb21lZFBpeGVscyArPSBNYXRoLnJvdW5kKHBhcnRPZlBhZ2VBYm92ZVVwcGVyQm9yZGVyICogem9vbUZhY3RvckZvclBhZ2UpO1xuICAgICAgICBwaXhlbHNUb1pvb20gKz0gcGFydE9mUGFnZUFib3ZlVXBwZXJCb3JkZXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGl4ZWxzVG9ab29tICs9IG9sZFBhZ2VIZWlnaHRzW3BkZlBhZ2VOdW1iZXJdO1xuICAgICAgICB6b29tZWRQaXhlbHMgKz0gdGhpcy5wYWdlSGVpZ2h0c1twZGZQYWdlTnVtYmVyXTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBpeGVsc1RvWm9vbSArIHNwYWNlc1RvU2tpcCArIDIwID4gb2xkU2Nyb2xsVG9wKSB7XG4gICAgICAgIGxldCBwYXJ0T2ZQYWRkaW5nQWJvdmVVcHBlckJvcmRlciA9IG9sZFNjcm9sbFRvcCAtIChwaXhlbHNUb1pvb20gKyBzcGFjZXNUb1NraXApO1xuICAgICAgICBzcGFjZXNUb1NraXAgKz0gcGFydE9mUGFkZGluZ0Fib3ZlVXBwZXJCb3JkZXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3BhY2VzVG9Ta2lwICs9IDIwO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB6b29tZWRQaXhlbHMgKyBzcGFjZXNUb1NraXA7XG4gIH1cblxuICBhZGp1c3RTaXplKGZhY3Rvcikge1xuICAgIGlmICghdGhpcy5wZGZEb2N1bWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZhY3RvciA9IHRoaXMudG9TY2FsZUZhY3RvciAqIGZhY3RvcjtcblxuICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICB0aGlzLnRvU2NhbGVGYWN0b3IgPSBmYWN0b3I7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGluZyA9IHRydWU7XG4gICAgdGhpcy50b1NjYWxlRmFjdG9yID0gMTtcblxuICAgIGxldCBvbGRTY3JvbGxUb3AgPSB0aGlzLnNjcm9sbFRvcCgpO1xuICAgIGxldCBvbGRQYWdlSGVpZ2h0cyA9IHRoaXMucGFnZUhlaWdodHMuc2xpY2UoMCk7XG4gICAgdGhpcy5jdXJyZW50U2NhbGUgPSB0aGlzLmN1cnJlbnRTY2FsZSAqIGZhY3RvcjtcbiAgICB0aGlzLnJlbmRlclBkZihmYWxzZSk7XG5cbiAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHtcbiAgICAgIGxldCBuZXdTY3JvbGxUb3AgPSB0aGlzLmNvbXB1dGVab29tZWRTY3JvbGxUb3Aob2xkU2Nyb2xsVG9wLCBvbGRQYWdlSGVpZ2h0cyk7XG4gICAgICB0aGlzLnNjcm9sbFRvcChuZXdTY3JvbGxUb3ApO1xuICAgIH0pO1xuXG4gICAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB7XG4gICAgICBsZXQgbmV3U2Nyb2xsTGVmdCA9IHRoaXMuc2Nyb2xsTGVmdCgpICogZmFjdG9yO1xuICAgICAgdGhpcy5zY3JvbGxMZWZ0KG5ld1Njcm9sbExlZnQpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q3VycmVudFBhZ2VOdW1iZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFBhZ2VOdW1iZXI7XG4gIH1cblxuICBnZXRUb3RhbFBhZ2VOdW1iZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMudG90YWxQYWdlTnVtYmVyO1xuICB9XG5cbiAgc2Nyb2xsVG9QYWdlKHBkZlBhZ2VOdW1iZXIpIHtcbiAgICBpZiAoIXRoaXMucGRmRG9jdW1lbnQgfHwgaXNOYU4ocGRmUGFnZU51bWJlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBwZGZQYWdlTnVtYmVyID0gTWF0aC5taW4ocGRmUGFnZU51bWJlciwgdGhpcy5wZGZEb2N1bWVudC5udW1QYWdlcyk7XG4gICAgcGFnZVNjcm9sbFBvc2l0aW9uID0gKHRoaXMucGFnZUhlaWdodHMuc2xpY2UoMCwgKHBkZlBhZ2VOdW1iZXItMSkpLnJlZHVjZSgoKHgseSkgPT4geCt5KSwgMCkpICsgKHBkZlBhZ2VOdW1iZXIgLSAxKSAqIDIwXG5cbiAgICByZXR1cm4gdGhpcy5zY3JvbGxUb3AocGFnZVNjcm9sbFBvc2l0aW9uKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmlsZVBhdGg6IHRoaXMuZmlsZVBhdGgsXG4gICAgICBzY2FsZTogdGhpcy5jdXJyZW50U2NhbGUsXG4gICAgICBzY3JvbGxUb3A6IHRoaXMuc2Nyb2xsVG9wQmVmb3JlVXBkYXRlLFxuICAgICAgc2Nyb2xsTGVmdDogdGhpcy5zY3JvbGxMZWZ0QmVmb3JlVXBkYXRlLFxuICAgICAgZGVzZXJpYWxpemVyOiAnUGRmRWRpdG9yRGVzZXJpYWxpemVyJ1xuICAgIH07XG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICBpZiAodGhpcy5maWxlUGF0aCkge1xuICAgICAgcmV0dXJuIHBhdGguYmFzZW5hbWUodGhpcy5maWxlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAndW50aXRsZWQnO1xuICAgIH1cbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICByZXR1cm4gdGhpcy5maWxlUGF0aDtcbiAgfVxuXG4gIGdldFBhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZVBhdGg7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHJldHVybiB0aGlzLmRldGFjaCgpO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VUaXRsZSgpIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gbnVsbCk7XG4gIH1cblxuICBvbkRpZENoYW5nZU1vZGlmaWVkKCkge1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiBudWxsKTtcbiAgfVxufVxuIl19
//# sourceURL=/home/key/.atom/packages/pdf-view/lib/pdf-editor-view.js
