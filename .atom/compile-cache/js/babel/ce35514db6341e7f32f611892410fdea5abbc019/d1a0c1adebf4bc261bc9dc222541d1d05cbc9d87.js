'use babel';

/**
 * @access private
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LegacyAdater = (function () {
  function LegacyAdater(textEditor) {
    _classCallCheck(this, LegacyAdater);

    this.textEditor = textEditor;
  }

  _createClass(LegacyAdater, [{
    key: 'enableCache',
    value: function enableCache() {
      this.useCache = true;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this.useCache = false;
      delete this.heightCache;
      delete this.scrollTopCache;
      delete this.scrollLeftCache;
      delete this.maxScrollTopCache;
    }
  }, {
    key: 'onDidChangeScrollTop',
    value: function onDidChangeScrollTop(callback) {
      return this.textEditor.onDidChangeScrollTop(callback);
    }
  }, {
    key: 'onDidChangeScrollLeft',
    value: function onDidChangeScrollLeft(callback) {
      return this.textEditor.onDidChangeScrollLeft(callback);
    }
  }, {
    key: 'getHeight',
    value: function getHeight() {
      if (this.useCache) {
        if (!this.heightCache) {
          this.heightCache = this.textEditor.getHeight();
        }
        return this.heightCache;
      }
      return this.textEditor.getHeight();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      if (this.useCache) {
        if (!this.scrollTopCache) {
          this.scrollTopCache = this.textEditor.getScrollTop();
        }
        return this.scrollTopCache;
      }
      return this.textEditor.getScrollTop();
    }
  }, {
    key: 'setScrollTop',
    value: function setScrollTop(scrollTop) {
      return this.textEditor.setScrollTop(scrollTop);
    }
  }, {
    key: 'getScrollLeft',
    value: function getScrollLeft() {
      if (this.useCache) {
        if (!this.scrollLeftCache) {
          this.scrollLeftCache = this.textEditor.getScrollLeft();
        }
        return this.scrollLeftCache;
      }

      return this.textEditor.getScrollLeft();
    }
  }, {
    key: 'getMaxScrollTop',
    value: function getMaxScrollTop() {
      if (this.maxScrollTopCache != null && this.useCache) {
        return this.maxScrollTopCache;
      }
      var maxScrollTop = this.textEditor.getMaxScrollTop();
      var lineHeight = this.textEditor.getLineHeightInPixels();

      if (this.scrollPastEnd) {
        maxScrollTop -= this.getHeight() - 3 * lineHeight;
      }
      if (this.useCache) {
        this.maxScrollTopCache = maxScrollTop;
      }
      return maxScrollTop;
    }
  }]);

  return LegacyAdater;
})();

exports['default'] = LegacyAdater;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tleS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9hZGFwdGVycy9sZWdhY3ktYWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7Ozs7SUFLVSxZQUFZO0FBQ25CLFdBRE8sWUFBWSxDQUNsQixVQUFVLEVBQUU7MEJBRE4sWUFBWTs7QUFDSixRQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtHQUFFOztlQUR0QyxZQUFZOztXQUduQix1QkFBRztBQUFFLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0tBQUU7OztXQUU1QixzQkFBRztBQUNaLFVBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQTtBQUN2QixhQUFPLElBQUksQ0FBQyxjQUFjLENBQUE7QUFDMUIsYUFBTyxJQUFJLENBQUMsZUFBZSxDQUFBO0FBQzNCLGFBQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO0tBQzlCOzs7V0FFb0IsOEJBQUMsUUFBUSxFQUFFO0FBQzlCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUN0RDs7O1dBRXFCLCtCQUFDLFFBQVEsRUFBRTtBQUMvQixhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdkQ7OztXQUVTLHFCQUFHO0FBQ1gsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLGNBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtTQUMvQztBQUNELGVBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQTtPQUN4QjtBQUNELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtLQUNuQzs7O1dBRVksd0JBQUc7QUFDZCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDeEIsY0FBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFBO1NBQ3JEO0FBQ0QsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFBO09BQzNCO0FBQ0QsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFBO0tBQ3RDOzs7V0FFWSxzQkFBQyxTQUFTLEVBQUU7QUFDdkIsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUMvQzs7O1dBRWEseUJBQUc7QUFDZixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDekIsY0FBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFBO1NBQ3ZEO0FBQ0QsZUFBTyxJQUFJLENBQUMsZUFBZSxDQUFBO09BQzVCOztBQUVELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtLQUN2Qzs7O1dBRWUsMkJBQUc7QUFDakIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbkQsZUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7T0FDOUI7QUFDRCxVQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFBO0FBQ3BELFVBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQTs7QUFFeEQsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLG9CQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUE7T0FDbEQ7QUFDRCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFBRSxZQUFJLENBQUMsaUJBQWlCLEdBQUcsWUFBWSxDQUFBO09BQUU7QUFDNUQsYUFBTyxZQUFZLENBQUE7S0FDcEI7OztTQXBFa0IsWUFBWTs7O3FCQUFaLFlBQVkiLCJmaWxlIjoiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL2FkYXB0ZXJzL2xlZ2FjeS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVnYWN5QWRhdGVyIHtcbiAgY29uc3RydWN0b3IgKHRleHRFZGl0b3IpIHsgdGhpcy50ZXh0RWRpdG9yID0gdGV4dEVkaXRvciB9XG5cbiAgZW5hYmxlQ2FjaGUgKCkgeyB0aGlzLnVzZUNhY2hlID0gdHJ1ZSB9XG5cbiAgY2xlYXJDYWNoZSAoKSB7XG4gICAgdGhpcy51c2VDYWNoZSA9IGZhbHNlXG4gICAgZGVsZXRlIHRoaXMuaGVpZ2h0Q2FjaGVcbiAgICBkZWxldGUgdGhpcy5zY3JvbGxUb3BDYWNoZVxuICAgIGRlbGV0ZSB0aGlzLnNjcm9sbExlZnRDYWNoZVxuICAgIGRlbGV0ZSB0aGlzLm1heFNjcm9sbFRvcENhY2hlXG4gIH1cblxuICBvbkRpZENoYW5nZVNjcm9sbFRvcCAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKGNhbGxiYWNrKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VTY3JvbGxMZWZ0IChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3Iub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KGNhbGxiYWNrKVxuICB9XG5cbiAgZ2V0SGVpZ2h0ICgpIHtcbiAgICBpZiAodGhpcy51c2VDYWNoZSkge1xuICAgICAgaWYgKCF0aGlzLmhlaWdodENhY2hlKSB7XG4gICAgICAgIHRoaXMuaGVpZ2h0Q2FjaGUgPSB0aGlzLnRleHRFZGl0b3IuZ2V0SGVpZ2h0KClcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmhlaWdodENhY2hlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3IuZ2V0SGVpZ2h0KClcbiAgfVxuXG4gIGdldFNjcm9sbFRvcCAoKSB7XG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxUb3BDYWNoZSkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvcENhY2hlID0gdGhpcy50ZXh0RWRpdG9yLmdldFNjcm9sbFRvcCgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zY3JvbGxUb3BDYWNoZVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLmdldFNjcm9sbFRvcCgpXG4gIH1cblxuICBzZXRTY3JvbGxUb3AgKHNjcm9sbFRvcCkge1xuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3Iuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcClcbiAgfVxuXG4gIGdldFNjcm9sbExlZnQgKCkge1xuICAgIGlmICh0aGlzLnVzZUNhY2hlKSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsTGVmdENhY2hlKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsTGVmdENhY2hlID0gdGhpcy50ZXh0RWRpdG9yLmdldFNjcm9sbExlZnQoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsTGVmdENhY2hlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5nZXRTY3JvbGxMZWZ0KClcbiAgfVxuXG4gIGdldE1heFNjcm9sbFRvcCAoKSB7XG4gICAgaWYgKHRoaXMubWF4U2Nyb2xsVG9wQ2FjaGUgIT0gbnVsbCAmJiB0aGlzLnVzZUNhY2hlKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXhTY3JvbGxUb3BDYWNoZVxuICAgIH1cbiAgICB2YXIgbWF4U2Nyb2xsVG9wID0gdGhpcy50ZXh0RWRpdG9yLmdldE1heFNjcm9sbFRvcCgpXG4gICAgdmFyIGxpbmVIZWlnaHQgPSB0aGlzLnRleHRFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgIGlmICh0aGlzLnNjcm9sbFBhc3RFbmQpIHtcbiAgICAgIG1heFNjcm9sbFRvcCAtPSB0aGlzLmdldEhlaWdodCgpIC0gMyAqIGxpbmVIZWlnaHRcbiAgICB9XG4gICAgaWYgKHRoaXMudXNlQ2FjaGUpIHsgdGhpcy5tYXhTY3JvbGxUb3BDYWNoZSA9IG1heFNjcm9sbFRvcCB9XG4gICAgcmV0dXJuIG1heFNjcm9sbFRvcFxuICB9XG59XG4iXX0=
//# sourceURL=/home/key/.atom/packages/minimap/lib/adapters/legacy-adapter.js
