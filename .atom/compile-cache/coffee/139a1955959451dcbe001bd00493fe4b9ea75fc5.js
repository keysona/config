(function() {
  var ColorExpression, ExpressionsRegistry, SVGColors, colorRegexp, colors, comma, elmAngle, float, floatOrPercent, hexadecimal, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, registry, strip, variables, _ref;

  _ref = require('./regexes'), int = _ref.int, float = _ref.float, percent = _ref.percent, optionalPercent = _ref.optionalPercent, intOrPercent = _ref.intOrPercent, floatOrPercent = _ref.floatOrPercent, comma = _ref.comma, notQuote = _ref.notQuote, hexadecimal = _ref.hexadecimal, ps = _ref.ps, pe = _ref.pe, variables = _ref.variables, namePrefixes = _ref.namePrefixes;

  strip = require('./utils').strip;

  ExpressionsRegistry = require('./expressions-registry');

  ColorExpression = require('./color-expression');

  SVGColors = require('./svg-colors');

  module.exports = registry = new ExpressionsRegistry(ColorExpression);

  registry.createExpression('pigments:css_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w])", 1, ['css', 'less', 'styl', 'stylus', 'sass', 'scss'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexRGBA = hexa;
  });

  registry.createExpression('pigments:argb_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w])", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:css_hexa_6', "#(" + hexadecimal + "{6})(?![\\d\\w])", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_hexa_4', "(?:" + namePrefixes + ")#(" + hexadecimal + "{4})(?![\\d\\w])", ['*'], function(match, expression, context) {
    var colorAsInt, hexa, _;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 12 & 0xf) * 17;
    this.green = (colorAsInt >> 8 & 0xf) * 17;
    this.blue = (colorAsInt >> 4 & 0xf) * 17;
    return this.alpha = ((colorAsInt & 0xf) * 17) / 255;
  });

  registry.createExpression('pigments:css_hexa_3', "(?:" + namePrefixes + ")#(" + hexadecimal + "{3})(?![\\d\\w])", ['*'], function(match, expression, context) {
    var colorAsInt, hexa, _;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 8 & 0xf) * 17;
    this.green = (colorAsInt >> 4 & 0xf) * 17;
    return this.blue = (colorAsInt & 0xf) * 17;
  });

  registry.createExpression('pigments:int_hexa_8', "0x(" + hexadecimal + "{8})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:int_hexa_6', "0x(" + hexadecimal + "{6})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_rgb', strip("rgb" + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_rgba', strip("rgba" + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:stylus_rgba', strip("rgba" + ps + "\\s* (" + notQuote + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], a = match[2];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:css_hsl', strip("hsl" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var h, hsl, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_hsla', strip("hsla" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, hsl, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hsv', strip("(?:hsv|hsb)" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var h, hsv, s, v, _;
    _ = match[0], h = match[1], s = match[2], v = match[3];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hsva', strip("(?:hsva|hsba)" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, hsv, s, v, _;
    _ = match[0], h = match[1], s = match[2], v = match[3], a = match[4];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:vec4', strip("vec4" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    return this.rgba = [context.readFloat(h) * 255, context.readFloat(s) * 255, context.readFloat(l) * 255, context.readFloat(a)];
  });

  registry.createExpression('pigments:hwb', strip("hwb" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), ['*'], function(match, expression, context) {
    var a, b, h, w, _;
    _ = match[0], h = match[1], w = match[2], b = match[3], a = match[4];
    this.hwb = [context.readInt(h), context.readFloat(w), context.readFloat(b)];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  registry.createExpression('pigments:cmyk', strip("cmyk" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var c, k, m, y, _;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    return this.cmyk = [context.readFloat(c), context.readFloat(m), context.readFloat(y), context.readFloat(k)];
  });

  registry.createExpression('pigments:gray', strip("gray" + ps + "\\s* (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), 1, ['*'], function(match, expression, context) {
    var a, p, _;
    _ = match[0], p = match[1], a = match[2];
    p = context.readFloat(p) / 100 * 255;
    this.rgb = [p, p, p];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  colors = Object.keys(SVGColors.allCases);

  colorRegexp = "(?:" + namePrefixes + ")(" + (colors.join('|')) + ")\\b(?![ \\t]*[-\\.:=\\(])";

  registry.createExpression('pigments:named_colors', colorRegexp, ['css', 'less', 'styl', 'stylus', 'sass', 'scss'], function(match, expression, context) {
    var name, _;
    _ = match[0], name = match[1];
    this.colorExpression = this.name = name;
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:darken', strip("darken" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [h, s, context.clampInt(l - amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:lighten', strip("lighten" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [h, s, context.clampInt(l + amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:fade', strip("(?:fade|alpha)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = amount;
  });

  registry.createExpression('pigments:transparentize', strip("(?:transparentize|fadeout|fade-out|fade_out)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha - amount);
  });

  registry.createExpression('pigments:opacify', strip("(?:opacify|fadein|fade-in|fade_in)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha + amount);
  });

  registry.createExpression('pigments:stylus_component_functions', strip("(red|green|blue)" + ps + " (" + notQuote + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, channel, subexpr, _;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    return this[channel] = amount;
  });

  registry.createExpression('pigments:transparentify', strip("transparentify" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var alpha, bestAlpha, bottom, expr, processChannel, top, _, _ref1;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), top = _ref1[0], bottom = _ref1[1], alpha = _ref1[2];
    top = context.readColor(top);
    bottom = context.readColor(bottom);
    alpha = context.readFloatOrPercent(alpha);
    if (context.isInvalid(top)) {
      return this.invalid = true;
    }
    if ((bottom != null) && context.isInvalid(bottom)) {
      return this.invalid = true;
    }
    if (bottom == null) {
      bottom = new context.Color(255, 255, 255, 1);
    }
    if (isNaN(alpha)) {
      alpha = void 0;
    }
    bestAlpha = ['red', 'green', 'blue'].map(function(channel) {
      var res;
      res = (top[channel] - bottom[channel]) / ((0 < top[channel] - bottom[channel] ? 255 : 0) - bottom[channel]);
      return res;
    }).sort(function(a, b) {
      return a < b;
    })[0];
    processChannel = function(channel) {
      if (bestAlpha === 0) {
        return bottom[channel];
      } else {
        return bottom[channel] + (top[channel] - bottom[channel]) / bestAlpha;
      }
    };
    if (alpha != null) {
      bestAlpha = alpha;
    }
    bestAlpha = Math.max(Math.min(bestAlpha, 1), 0);
    this.red = processChannel('red');
    this.green = processChannel('green');
    this.blue = processChannel('blue');
    return this.alpha = Math.round(bestAlpha * 100) / 100;
  });

  registry.createExpression('pigments:hue', strip("hue" + ps + " (" + notQuote + ") " + comma + " (" + int + "deg|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [amount % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:stylus_sl_component_functions', strip("(saturation|lightness)" + ps + " (" + notQuote + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, channel, subexpr, _;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    baseColor[channel] = amount;
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:adjust-hue', strip("adjust-hue" + ps + " (" + notQuote + ") " + comma + " (-?" + int + "deg|" + variables + "|-?" + optionalPercent + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [(h + amount) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:mix', "mix" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var amount, baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1], amount = _ref1[2];
    if (amount != null) {
      amount = context.readFloatOrPercent(amount);
    } else {
      amount = 0.5;
    }
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = context.mixColors(baseColor1, baseColor2, amount), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:stylus_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var amount, baseColor, subexpr, white, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:stylus_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var amount, baseColor, black, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:sass_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass', 'scss'], function(match, expression, context) {
    var amount, baseColor, subexpr, white, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(baseColor, white, amount).rgba;
  });

  registry.createExpression('pigments:sass_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass', 'scss'], function(match, expression, context) {
    var amount, baseColor, black, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(baseColor, black, amount).rgba;
  });

  registry.createExpression('pigments:desaturate', "desaturate" + ps + "(" + notQuote + ")" + comma + "(" + floatOrPercent + "|" + variables + ")" + pe, ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [h, context.clampInt(s - amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:saturate', strip("saturate" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [h, context.clampInt(s + amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:grayscale', "gr(?:a|e)yscale" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [h, 0, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:invert', "invert" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var b, baseColor, g, r, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.rgb, r = _ref1[0], g = _ref1[1], b = _ref1[2];
    this.rgb = [255 - r, 255 - g, 255 - b];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:complement', "complement" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:spin', strip("spin" + ps + " (" + notQuote + ") " + comma + " (-?(" + int + ")(deg)?|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var angle, baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1], angle = match[2];
    baseColor = context.readColor(subexpr);
    angle = context.readInt(angle);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [(360 + h + angle) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:contrast_n_arguments', strip("contrast" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var base, baseColor, dark, expr, light, res, threshold, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), base = _ref1[0], dark = _ref1[1], light = _ref1[2], threshold = _ref1[3];
    baseColor = context.readColor(base);
    dark = context.readColor(dark);
    light = context.readColor(light);
    if (threshold != null) {
      threshold = context.readPercent(threshold);
    }
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (dark != null ? dark.invalid : void 0) {
      return this.invalid = true;
    }
    if (light != null ? light.invalid : void 0) {
      return this.invalid = true;
    }
    res = context.contrast(baseColor, dark, light);
    if (context.isInvalid(res)) {
      return this.invalid = true;
    }
    return _ref2 = context.contrast(baseColor, dark, light, threshold), this.rgb = _ref2.rgb, _ref2;
  });

  registry.createExpression('pigments:contrast_1_argument', strip("contrast" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var baseColor, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    return _ref1 = context.contrast(baseColor), this.rgb = _ref1.rgb, _ref1;
  });

  registry.createExpression('pigments:css_color_function', "(?:" + namePrefixes + ")(color" + ps + "(" + notQuote + ")" + pe + ")", ['*'], function(match, expression, context) {
    var cssColor, e, expr, k, rgba, v, _, _ref1;
    try {
      _ = match[0], expr = match[1];
      _ref1 = context.vars;
      for (k in _ref1) {
        v = _ref1[k];
        expr = expr.replace(RegExp("" + (k.replace(/\(/g, '\\(').replace(/\)/g, '\\)')), "g"), v.value);
      }
      cssColor = require('css-color-function');
      rgba = cssColor.convert(expr);
      this.rgba = context.readColor(rgba).rgba;
      return this.colorExpression = expr;
    } catch (_error) {
      e = _error;
      return this.invalid = true;
    }
  });

  registry.createExpression('pigments:sass_adjust_color', "adjust-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var baseColor, param, params, res, subexpr, subject, _, _i, _len;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        return baseColor[name] += context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_scale_color', "scale-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var MAX_PER_COMPONENT, baseColor, param, params, res, subexpr, subject, _, _i, _len;
    MAX_PER_COMPONENT = {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1,
      hue: 360,
      saturation: 100,
      lightness: 100
    };
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        var dif, result;
        value = context.readFloat(value) / 100;
        result = value > 0 ? (dif = MAX_PER_COMPONENT[name] - baseColor[name], result = baseColor[name] + dif * value) : result = baseColor[name] * (1 + value);
        return baseColor[name] = result;
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_change_color', "change-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var baseColor, param, params, res, subexpr, subject, _, _i, _len;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        return baseColor[name] = context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:stylus_blend', strip("blend" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return this.rgba = [baseColor1.red * baseColor1.alpha + baseColor2.red * (1 - baseColor1.alpha), baseColor1.green * baseColor1.alpha + baseColor2.green * (1 - baseColor1.alpha), baseColor1.blue * baseColor1.alpha + baseColor2.blue * (1 - baseColor1.alpha), baseColor1.alpha + baseColor2.alpha - baseColor1.alpha * baseColor2.alpha];
  });

  registry.createExpression('pigments:lua_rgba', strip("(?:" + namePrefixes + ")Color" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['lua'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readInt(a) / 255;
  });

  registry.createExpression('pigments:multiply', strip("multiply" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.MULTIPLY), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:screen', strip("screen" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.SCREEN), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:overlay', strip("overlay" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.OVERLAY), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:softlight', strip("softlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.SOFT_LIGHT), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:hardlight', strip("hardlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.HARD_LIGHT), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:difference', strip("difference" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.DIFFERENCE), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:exclusion', strip("exclusion" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.EXCLUSION), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:average', strip("average" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.AVERAGE), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:negation', strip("negation" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref1, _ref2;
    _ = match[0], expr = match[1];
    _ref1 = context.split(expr), color1 = _ref1[0], color2 = _ref1[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref2 = baseColor1.blend(baseColor2, context.BlendModes.NEGATION), this.rgba = _ref2.rgba, _ref2;
  });

  registry.createExpression('pigments:elm_rgba', strip("rgba\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_rgb', strip("rgb\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    return this.blue = context.readInt(b);
  });

  elmAngle = "(?:" + float + "|\\(degrees\\s+(?:" + int + "|" + variables + ")\\))";

  registry.createExpression('pigments:elm_hsl', strip("hsl\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var elmDegreesRegexp, h, hsl, l, m, s, _;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:elm_hsla', strip("hsla\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var a, elmDegreesRegexp, h, hsl, l, m, s, _;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_grayscale', "gr(?:a|e)yscale\\s+(" + float + "|" + variables + ")", ['elm'], function(match, expression, context) {
    var amount, _;
    _ = match[0], amount = match[1];
    amount = Math.floor(255 - context.readFloat(amount) * 255);
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:elm_complement', strip("complement\\s+(" + notQuote + ")"), ['elm'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref1;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref1 = baseColor.hsl, h = _ref1[0], s = _ref1[1], l = _ref1[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:latex_gray', strip("\\[gray\\]\\{(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var amount, _;
    _ = match[0], amount = match[1];
    amount = context.readFloat(amount) * 255;
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:latex_html', strip("\\[HTML\\]\\{(" + hexadecimal + "{6})\\}"), ['tex'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:latex_rgb', strip("\\[rgb\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = Math.floor(context.readFloat(r) * 255);
    g = Math.floor(context.readFloat(g) * 255);
    b = Math.floor(context.readFloat(b) * 255);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_RGB', strip("\\[RGB\\]\\{(" + int + ")" + comma + "(" + int + ")" + comma + "(" + int + ")\\}"), ['tex'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = context.readInt(r);
    g = context.readInt(g);
    b = context.readInt(b);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_cmyk', strip("\\[cmyk\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var c, k, m, y, _;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    c = context.readFloat(c);
    m = context.readFloat(m);
    y = context.readFloat(y);
    k = context.readFloat(k);
    return this.cmyk = [c, m, y, k];
  });

  registry.createExpression('pigments:latex_predefined', strip('\\{(black|blue|brown|cyan|darkgray|gray|green|lightgray|lime|magenta|olive|orange|pink|purple|red|teal|violet|white|yellow)\\}'), ['tex'], function(match, expression, context) {
    var name, _;
    _ = match[0], name = match[1];
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_mix', strip('\\{([^!\\n\\}]+[!][^\\}\\n]+)\\}'), ['tex'], function(match, expression, context) {
    var expr, mix, nextColor, op, triplet, _;
    _ = match[0], expr = match[1];
    op = expr.split('!');
    mix = function(_arg) {
      var a, b, colorA, colorB, p;
      a = _arg[0], p = _arg[1], b = _arg[2];
      colorA = a instanceof context.Color ? a : context.readColor("{" + a + "}");
      colorB = b instanceof context.Color ? b : context.readColor("{" + b + "}");
      percent = context.readInt(p);
      return context.mixColors(colorA, colorB, percent / 100);
    };
    if (op.length === 2) {
      op.push(new context.Color(255, 255, 255));
    }
    nextColor = null;
    while (op.length > 0) {
      triplet = op.splice(0, 3);
      nextColor = mix(triplet);
      if (op.length > 0) {
        op.unshift(nextColor);
      }
    }
    return this.rgb = nextColor.rgb;
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1leHByZXNzaW9ucy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd09BQUE7O0FBQUEsRUFBQSxPQWNJLE9BQUEsQ0FBUSxXQUFSLENBZEosRUFDRSxXQUFBLEdBREYsRUFFRSxhQUFBLEtBRkYsRUFHRSxlQUFBLE9BSEYsRUFJRSx1QkFBQSxlQUpGLEVBS0Usb0JBQUEsWUFMRixFQU1FLHNCQUFBLGNBTkYsRUFPRSxhQUFBLEtBUEYsRUFRRSxnQkFBQSxRQVJGLEVBU0UsbUJBQUEsV0FURixFQVVFLFVBQUEsRUFWRixFQVdFLFVBQUEsRUFYRixFQVlFLGlCQUFBLFNBWkYsRUFhRSxvQkFBQSxZQWJGLENBQUE7O0FBQUEsRUFnQkMsUUFBUyxPQUFBLENBQVEsU0FBUixFQUFULEtBaEJELENBQUE7O0FBQUEsRUFrQkEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHdCQUFSLENBbEJ0QixDQUFBOztBQUFBLEVBbUJBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBbkJsQixDQUFBOztBQUFBLEVBb0JBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQXBCWixDQUFBOztBQUFBLEVBc0JBLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsUUFBQSxHQUFlLElBQUEsbUJBQUEsQ0FBb0IsZUFBcEIsQ0F2QmYsQ0FBQTs7QUFBQSxFQWtDQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIscUJBQTFCLEVBQWtELElBQUEsR0FBSSxXQUFKLEdBQWdCLGtCQUFsRSxFQUFxRixDQUFyRixFQUF3RixDQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLE1BQWhCLEVBQXdCLFFBQXhCLEVBQWtDLE1BQWxDLEVBQTBDLE1BQTFDLENBQXhGLEVBQTJJLFNBQUMsS0FBRCxFQUFRLFVB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

//# sourceURL=/home/key/.atom/packages/pigments/lib/color-expressions.coffee
