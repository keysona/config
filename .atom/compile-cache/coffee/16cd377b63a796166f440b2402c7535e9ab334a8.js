(function() {
  var Color, SVGColors, cmykToRGB, hexARGBToRGB, hexRGBAToRGB, hexToRGB, hslToRGB, hsvToHWB, hsvToRGB, hwbToHSV, hwbToRGB, rgbToCMYK, rgbToHSL, rgbToHSV, rgbToHWB, rgbToHex, rgbToHexARGB, rgbToHexRGBA, _ref;

  _ref = require('./color-conversions'), cmykToRGB = _ref.cmykToRGB, hexARGBToRGB = _ref.hexARGBToRGB, hexRGBAToRGB = _ref.hexRGBAToRGB, hexToRGB = _ref.hexToRGB, hslToRGB = _ref.hslToRGB, hsvToHWB = _ref.hsvToHWB, hsvToRGB = _ref.hsvToRGB, hwbToHSV = _ref.hwbToHSV, hwbToRGB = _ref.hwbToRGB, rgbToCMYK = _ref.rgbToCMYK, rgbToHex = _ref.rgbToHex, rgbToHexARGB = _ref.rgbToHexARGB, rgbToHexRGBA = _ref.rgbToHexRGBA, rgbToHSL = _ref.rgbToHSL, rgbToHSV = _ref.rgbToHSV, rgbToHWB = _ref.rgbToHWB;

  SVGColors = require('./svg-colors');

  module.exports = Color = (function() {
    Color.colorComponents = [['red', 0], ['green', 1], ['blue', 2], ['alpha', 3]];

    function Color(r, g, b, a) {
      var expr, i, k, v, _i, _len, _ref1;
      if (r == null) {
        r = 0;
      }
      if (g == null) {
        g = 0;
      }
      if (b == null) {
        b = 0;
      }
      if (a == null) {
        a = 1;
      }
      if (typeof r === 'object') {
        if (Array.isArray(r)) {
          for (i = _i = 0, _len = r.length; _i < _len; i = ++_i) {
            v = r[i];
            this[i] = v;
          }
        } else {
          for (k in r) {
            v = r[k];
            this[k] = v;
          }
        }
      } else if (typeof r === 'string') {
        if (r in SVGColors.allCases) {
          this.name = r;
          r = SVGColors.allCases[r];
        }
        expr = r.replace(/\#|0x/, '');
        if (expr.length === 6) {
          this.hex = expr;
          this.alpha = 1;
        } else {
          this.hexARGB = expr;
        }
      } else {
        _ref1 = [r, g, b, a], this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], this.alpha = _ref1[3];
      }
    }

    Color.colorComponents.forEach(function(_arg) {
      var component, index;
      component = _arg[0], index = _arg[1];
      return Object.defineProperty(Color.prototype, component, {
        enumerable: true,
        get: function() {
          return this[index];
        },
        set: function(component) {
          return this[index] = component;
        }
      });
    });

    Object.defineProperty(Color.prototype, 'rgb', {
      enumerable: true,
      get: function() {
        return [this.red, this.green, this.blue];
      },
      set: function(_arg) {
        this.red = _arg[0], this.green = _arg[1], this.blue = _arg[2];
      }
    });

    Object.defineProperty(Color.prototype, 'rgba', {
      enumerable: true,
      get: function() {
        return [this.red, this.green, this.blue, this.alpha];
      },
      set: function(_arg) {
        this.red = _arg[0], this.green = _arg[1], this.blue = _arg[2], this.alpha = _arg[3];
      }
    });

    Object.defineProperty(Color.prototype, 'argb', {
      enumerable: true,
      get: function() {
        return [this.alpha, this.red, this.green, this.blue];
      },
      set: function(_arg) {
        this.alpha = _arg[0], this.red = _arg[1], this.green = _arg[2], this.blue = _arg[3];
      }
    });

    Object.defineProperty(Color.prototype, 'hsv', {
      enumerable: true,
      get: function() {
        return rgbToHSV(this.red, this.green, this.blue);
      },
      set: function(hsv) {
        var _ref1;
        return _ref1 = hsvToRGB.apply(this.constructor, hsv), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'hsva', {
      enumerable: true,
      get: function() {
        return this.hsv.concat(this.alpha);
      },
      set: function(hsva) {
        var h, s, v, _ref1;
        h = hsva[0], s = hsva[1], v = hsva[2], this.alpha = hsva[3];
        return _ref1 = hsvToRGB.apply(this.constructor, [h, s, v]), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'hsl', {
      enumerable: true,
      get: function() {
        return rgbToHSL(this.red, this.green, this.blue);
      },
      set: function(hsl) {
        var _ref1;
        return _ref1 = hslToRGB.apply(this.constructor, hsl), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'hsla', {
      enumerable: true,
      get: function() {
        return this.hsl.concat(this.alpha);
      },
      set: function(hsl) {
        var h, l, s, _ref1;
        h = hsl[0], s = hsl[1], l = hsl[2], this.alpha = hsl[3];
        return _ref1 = hslToRGB.apply(this.constructor, [h, s, l]), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'hwb', {
      enumerable: true,
      get: function() {
        return rgbToHWB(this.red, this.green, this.blue);
      },
      set: function(hwb) {
        var _ref1;
        return _ref1 = hwbToRGB.apply(this.constructor, hwb), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'hwba', {
      enumerable: true,
      get: function() {
        return this.hwb.concat(this.alpha);
      },
      set: function(hwb) {
        var b, h, w, _ref1;
        h = hwb[0], w = hwb[1], b = hwb[2], this.alpha = hwb[3];
        return _ref1 = hwbToRGB.apply(this.constructor, [h, w, b]), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'hex', {
      enumerable: true,
      get: function() {
        return rgbToHex(this.red, this.green, this.blue);
      },
      set: function(hex) {
        var _ref1;
        return _ref1 = hexToRGB(hex), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'hexARGB', {
      enumerable: true,
      get: function() {
        return rgbToHexARGB(this.red, this.green, this.blue, this.alpha);
      },
      set: function(hex) {
        var _ref1;
        return _ref1 = hexARGBToRGB(hex), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], this.alpha = _ref1[3], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'hexRGBA', {
      enumerable: true,
      get: function() {
        return rgbToHexRGBA(this.red, this.green, this.blue, this.alpha);
      },
      set: function(hex) {
        var _ref1;
        return _ref1 = hexRGBAToRGB(hex), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], this.alpha = _ref1[3], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'cmyk', {
      enumerable: true,
      get: function() {
        return rgbToCMYK(this.red, this.green, this.blue, this.alpha);
      },
      set: function(cmyk) {
        var c, k, m, y, _ref1;
        c = cmyk[0], m = cmyk[1], y = cmyk[2], k = cmyk[3];
        return _ref1 = cmykToRGB(c, m, y, k), this.red = _ref1[0], this.green = _ref1[1], this.blue = _ref1[2], _ref1;
      }
    });

    Object.defineProperty(Color.prototype, 'length', {
      enumerable: true,
      get: function() {
        return 4;
      }
    });

    Object.defineProperty(Color.prototype, 'hue', {
      enumerable: true,
      get: function() {
        return this.hsl[0];
      },
      set: function(hue) {
        var hsl;
        hsl = this.hsl;
        hsl[0] = hue;
        return this.hsl = hsl;
      }
    });

    Object.defineProperty(Color.prototype, 'saturation', {
      enumerable: true,
      get: function() {
        return this.hsl[1];
      },
      set: function(saturation) {
        var hsl;
        hsl = this.hsl;
        hsl[1] = saturation;
        return this.hsl = hsl;
      }
    });

    Object.defineProperty(Color.prototype, 'lightness', {
      enumerable: true,
      get: function() {
        return this.hsl[2];
      },
      set: function(lightness) {
        var hsl;
        hsl = this.hsl;
        hsl[2] = lightness;
        return this.hsl = hsl;
      }
    });

    Object.defineProperty(Color.prototype, 'luma', {
      enumerable: true,
      get: function() {
        var b, g, r;
        r = this[0] / 255;
        g = this[1] / 255;
        b = this[2] / 255;
        r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
    });

    Color.prototype.isLiteral = function() {
      return (this.variables == null) || this.variables.length === 0;
    };

    Color.prototype.isValid = function() {
      return !this.invalid && (this.red != null) && (this.green != null) && (this.blue != null) && (this.alpha != null) && !isNaN(this.red) && !isNaN(this.green) && !isNaN(this.blue) && !isNaN(this.alpha);
    };

    Color.prototype.clone = function() {
      return new Color(this.red, this.green, this.blue, this.alpha);
    };

    Color.prototype.isEqual = function(color) {
      return color.red === this.red && color.green === this.green && color.blue === this.blue && color.alpha === this.alpha;
    };

    Color.prototype.interpolate = function(col, ratio, preserveAlpha) {
      var iratio;
      if (preserveAlpha == null) {
        preserveAlpha = true;
      }
      iratio = 1 - ratio;
      if (col == null) {
        return clone();
      }
      return new Color(Math.floor(this.red * iratio + col.red * ratio), Math.floor(this.green * iratio + col.green * ratio), Math.floor(this.blue * iratio + col.blue * ratio), Math.floor(preserveAlpha ? this.alpha : this.alpha * iratio + col.alpha * ratio));
    };

    Color.prototype.transparentize = function(alpha) {
      return new Color(this.red, this.green, this.blue, alpha);
    };

    Color.prototype.blend = function(color, method, preserveAlpha) {
      var a, b, g, r;
      if (preserveAlpha == null) {
        preserveAlpha = true;
      }
      r = method(this.red, color.red);
      g = method(this.green, color.green);
      b = method(this.blue, color.blue);
      a = preserveAlpha ? this.alpha : method(this.alpha, color.alpha);
      return new Color(r, g, b, a);
    };

    Color.prototype.toCSS = function() {
      var rnd;
      rnd = Math.round;
      if (this.alpha === 1) {
        return "rgb(" + (rnd(this.red)) + "," + (rnd(this.green)) + "," + (rnd(this.blue)) + ")";
      } else {
        return "rgba(" + (rnd(this.red)) + "," + (rnd(this.green)) + "," + (rnd(this.blue)) + "," + this.alpha + ")";
      }
    };

    Color.prototype.serialize = function() {
      return [this.red, this.green, this.blue, this.alpha];
    };

    return Color;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd01BQUE7O0FBQUEsRUFBQSxPQWlCSSxPQUFBLENBQVEscUJBQVIsQ0FqQkosRUFDRSxpQkFBQSxTQURGLEVBRUUsb0JBQUEsWUFGRixFQUdFLG9CQUFBLFlBSEYsRUFJRSxnQkFBQSxRQUpGLEVBS0UsZ0JBQUEsUUFMRixFQU1FLGdCQUFBLFFBTkYsRUFPRSxnQkFBQSxRQVBGLEVBUUUsZ0JBQUEsUUFSRixFQVNFLGdCQUFBLFFBVEYsRUFVRSxpQkFBQSxTQVZGLEVBV0UsZ0JBQUEsUUFYRixFQVlFLG9CQUFBLFlBWkYsRUFhRSxvQkFBQSxZQWJGLEVBY0UsZ0JBQUEsUUFkRixFQWVFLGdCQUFBLFFBZkYsRUFnQkUsZ0JBQUEsUUFoQkYsQ0FBQTs7QUFBQSxFQWtCQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FsQlosQ0FBQTs7QUFBQSxFQW9CQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosSUFBQSxLQUFDLENBQUEsZUFBRCxHQUFrQixDQUNoQixDQUFDLEtBQUQsRUFBVSxDQUFWLENBRGdCLEVBRWhCLENBQUMsT0FBRCxFQUFVLENBQVYsQ0FGZ0IsRUFHaEIsQ0FBQyxNQUFELEVBQVUsQ0FBVixDQUhnQixFQUloQixDQUFDLE9BQUQsRUFBVSxDQUFWLENBSmdCLENBQWxCLENBQUE7O0FBT2EsSUFBQSxlQUFDLENBQUQsRUFBSyxDQUFMLEVBQVMsQ0FBVCxFQUFhLENBQWIsR0FBQTtBQUNYLFVBQUEsOEJBQUE7O1FBRFksSUFBRTtPQUNkOztRQURnQixJQUFFO09BQ2xCOztRQURvQixJQUFFO09BQ3RCOztRQUR3QixJQUFFO09BQzFCO0FBQUEsTUFBQSxJQUFHLE1BQUEsQ0FBQSxD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

//# sourceURL=/home/key/.atom/packages/pigments/lib/color.coffee
