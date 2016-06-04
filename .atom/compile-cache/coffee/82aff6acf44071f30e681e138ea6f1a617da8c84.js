(function() {
  var ColorMarker, CompositeDisposable, fill;

  CompositeDisposable = require('atom').CompositeDisposable;

  fill = require('./utils').fill;

  module.exports = ColorMarker = (function() {
    function ColorMarker(_arg) {
      this.marker = _arg.marker, this.color = _arg.color, this.text = _arg.text, this.invalid = _arg.invalid, this.colorBuffer = _arg.colorBuffer;
      this.id = this.marker.id;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.marker.onDidDestroy((function(_this) {
        return function() {
          return _this.markerWasDestroyed();
        };
      })(this)));
      this.subscriptions.add(this.marker.onDidChange((function(_this) {
        return function() {
          if (_this.marker.isValid()) {
            _this.invalidateScreenRangeCache();
            return _this.checkMarkerScope();
          } else {
            return _this.destroy();
          }
        };
      })(this)));
      this.checkMarkerScope();
    }

    ColorMarker.prototype.destroy = function() {
      if (this.destroyed) {
        return;
      }
      return this.marker.destroy();
    };

    ColorMarker.prototype.markerWasDestroyed = function() {
      var _ref;
      if (this.destroyed) {
        return;
      }
      this.subscriptions.dispose();
      _ref = {}, this.marker = _ref.marker, this.color = _ref.color, this.text = _ref.text, this.colorBuffer = _ref.colorBuffer;
      return this.destroyed = true;
    };

    ColorMarker.prototype.match = function(properties) {
      var bool;
      if (this.destroyed) {
        return false;
      }
      bool = true;
      if (properties.bufferRange != null) {
        bool && (bool = this.marker.getBufferRange().isEqual(properties.bufferRange));
      }
      if (properties.color != null) {
        bool && (bool = properties.color.isEqual(this.color));
      }
      if (properties.match != null) {
        bool && (bool = properties.match === this.text);
      }
      if (properties.text != null) {
        bool && (bool = properties.text === this.text);
      }
      return bool;
    };

    ColorMarker.prototype.serialize = function() {
      var out;
      if (this.destroyed) {
        return;
      }
      out = {
        markerId: String(this.marker.id),
        bufferRange: this.marker.getBufferRange().serialize(),
        color: this.color.serialize(),
        text: this.text,
        variables: this.color.variables
      };
      if (!this.color.isValid()) {
        out.invalid = true;
      }
      return out;
    };

    ColorMarker.prototype.checkMarkerScope = function(forceEvaluation) {
      var e, range, scope, scopeChain, _ref;
      if (forceEvaluation == null) {
        forceEvaluation = false;
      }
      if (this.destroyed || (this.colorBuffer == null)) {
        return;
      }
      range = this.marker.getBufferRange();
      try {
        scope = this.colorBuffer.editor.scopeDescriptorForBufferPosition != null ? this.colorBuffer.editor.scopeDescriptorForBufferPosition(range.start) : this.colorBuffer.editor.displayBuffer.scopeDescriptorForBufferPosition(range.start);
        scopeChain = scope.getScopeChain();
        if (!scopeChain || (!forceEvaluation && scopeChain === this.lastScopeChain)) {
          return;
        }
        this.ignored = ((_ref = this.colorBuffer.ignoredScopes) != null ? _ref : []).some(function(scopeRegExp) {
          return scopeChain.match(scopeRegExp);
        });
        return this.lastScopeChain = scopeChain;
      } catch (_error) {
        e = _error;
        return console.error(e);
      }
    };

    ColorMarker.prototype.isIgnored = function() {
      return this.ignored;
    };

    ColorMarker.prototype.getBufferRange = function() {
      return this.marker.getBufferRange();
    };

    ColorMarker.prototype.getScreenRange = function() {
      var _ref;
      return this.screenRangeCache != null ? this.screenRangeCache : this.screenRangeCache = (_ref = this.marker) != null ? _ref.getScreenRange() : void 0;
    };

    ColorMarker.prototype.invalidateScreenRangeCache = function() {
      return this.screenRangeCache = null;
    };

    ColorMarker.prototype.convertContentToHex = function() {
      var hex;
      hex = '#' + fill(this.color.hex, 6);
      return this.colorBuffer.editor.getBuffer().setTextInRange(this.marker.getBufferRange(), hex);
    };

    ColorMarker.prototype.convertContentToRGB = function() {
      var rgba;
      rgba = "rgb(" + (Math.round(this.color.red)) + ", " + (Math.round(this.color.green)) + ", " + (Math.round(this.color.blue)) + ")";
      return this.colorBuffer.editor.getBuffer().setTextInRange(this.marker.getBufferRange(), rgba);
    };

    ColorMarker.prototype.convertContentToRGBA = function() {
      var rgba;
      rgba = "rgba(" + (Math.round(this.color.red)) + ", " + (Math.round(this.color.green)) + ", " + (Math.round(this.color.blue)) + ", " + this.color.alpha + ")";
      return this.colorBuffer.editor.getBuffer().setTextInRange(this.marker.getBufferRange(), rgba);
    };

    ColorMarker.prototype.convertContentToHSL = function() {
      var hsl;
      hsl = "hsl(" + (Math.round(this.color.hue)) + ", " + (Math.round(this.color.saturation)) + "%, " + (Math.round(this.color.lightness)) + "%)";
      return this.colorBuffer.editor.getBuffer().setTextInRange(this.marker.getBufferRange(), hsl);
    };

    ColorMarker.prototype.convertContentToHSLA = function() {
      var hsla;
      hsla = "hsla(" + (Math.round(this.color.hue)) + ", " + (Math.round(this.color.saturation)) + "%, " + (Math.round(this.color.lightness)) + "%, " + this.color.alpha + ")";
      return this.colorBuffer.editor.getBuffer().setTextInRange(this.marker.getBufferRange(), hsla);
    };

    return ColorMarker;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1tYXJrZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNDQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQyxPQUFRLE9BQUEsQ0FBUSxTQUFSLEVBQVIsSUFERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEscUJBQUMsSUFBRCxHQUFBO0FBQ1gsTUFEYSxJQUFDLENBQUEsY0FBQSxRQUFRLElBQUMsQ0FBQSxhQUFBLE9BQU8sSUFBQyxDQUFBLFlBQUEsTUFBTSxJQUFDLENBQUEsZUFBQSxTQUFTLElBQUMsQ0FBQSxtQkFBQSxXQUNoRCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsRUFBRCxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBZCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRGpCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsa0JBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckIsQ0FBbkIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDckMsVUFBQSxJQUFHLEtBQUMsQ0FBQSxN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

//# sourceURL=/home/key/.atom/packages/pigments/lib/color-marker.coffee
