(function() {
  var Hover, HoverElement, emoji, emojiFolder, registerElement, settings, swrap,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  emoji = require('emoji-images');

  emojiFolder = 'atom://vim-mode-plus/node_modules/emoji-images/pngs';

  registerElement = require('./utils').registerElement;

  settings = require('./settings');

  swrap = require('./selection-wrapper');

  Hover = (function() {
    Hover.prototype.lineHeight = null;

    Hover.prototype.point = null;

    function Hover(vimState, param) {
      var _ref;
      this.vimState = vimState;
      this.param = param;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.text = [];
      this.view = atom.views.getView(this);
    }

    Hover.prototype.setPoint = function() {
      var _ref;
      switch (false) {
        case !this.vimState.isMode('visual', 'linewise'):
          return swrap(this.editor.getLastSelection()).getCharacterwiseHeadPosition();
        case !this.vimState.isMode('visual', 'blockwise'):
          return (_ref = this.vimState.getLastBlockwiseSelection()) != null ? _ref.getHeadSelection().getHeadBufferPosition() : void 0;
        default:
          return this.editor.getCursorBufferPosition();
      }
    };

    Hover.prototype.add = function(text, point) {
      this.text.push(text);
      return this.view.show(point != null ? point : this.setPoint());
    };

    Hover.prototype.replaceLastSection = function(text, point) {
      this.text.pop();
      return this.add(text, point);
    };

    Hover.prototype.withTimeout = function(point, options) {
      var text, timeout, _ref;
      this.reset();
      text = options.text, timeout = options.timeout;
      if (options.classList.length) {
        (_ref = this.view.classList).add.apply(_ref, options.classList);
      }
      this.add(text, point);
      if (timeout != null) {
        return this.timeoutID = setTimeout((function(_this) {
          return function() {
            return _this.reset();
          };
        })(this), timeout);
      }
    };

    Hover.prototype.getText = function(lineHeight) {
      if (!this.text.length) {
        return null;
      }
      return this.text.map(function(text) {
        text = String(text);
        if (settings.get('showHoverOnOperateIcon') === 'emoji') {
          return emoji(String(text), emojiFolder, lineHeight);
        } else {
          return text.replace(/:(.*?):/g, function(s, m) {
            return "<span class='icon icon-" + m + "'></span>";
          });
        }
      }).join('');
    };

    Hover.prototype.reset = function() {
      var _ref;
      this.text = [];
      clearTimeout(this.timeoutID);
      this.view.reset();
      return _ref = {}, this.timeoutID = _ref.timeoutID, this.point = _ref.point, _ref;
    };

    Hover.prototype.isVisible = function() {
      return this.view.isVisible();
    };

    Hover.prototype.destroy = function() {
      var _ref;
      _ref = {}, this.param = _ref.param, this.vimState = _ref.vimState;
      return this.view.destroy();
    };

    return Hover;

  })();

  HoverElement = (function(_super) {
    __extends(HoverElement, _super);

    function HoverElement() {
      return HoverElement.__super__.constructor.apply(this, arguments);
    }

    HoverElement.prototype.createdCallback = function() {
      this.className = 'vim-mode-plus-hover';
      return this;
    };

    HoverElement.prototype.initialize = function(model) {
      this.model = model;
      return this;
    };

    HoverElement.prototype.isVisible = function() {
      return this.marker != null;
    };

    HoverElement.prototype.show = function(point) {
      var editor, text;
      editor = this.model.vimState.editor;
      if (!this.marker) {
        this.marker = this.createOverlay(point != null ? point : editor.getCursorBufferPosition());
        this.lineHeight = editor.getLineHeightInPixels();
        this.setIconSize(this.lineHeight);
      }
      this.style.marginTop = (this.lineHeight * -2.2) + 'px';
      if (text = this.model.getText(this.lineHeight)) {
        return this.innerHTML = text;
      }
    };

    HoverElement.prototype.createOverlay = function(point) {
      var decoration, editor, marker;
      editor = this.model.vimState.editor;
      marker = editor.markBufferPosition(point, {
        invalidate: "never",
        persistent: false
      });
      decoration = editor.decorateMarker(marker, {
        type: 'overlay',
        item: this
      });
      return marker;
    };

    HoverElement.prototype.setIconSize = function(size) {
      var selector, style, _ref;
      if ((_ref = this.styleElement) != null) {
        _ref.remove();
      }
      this.styleElement = document.createElement('style');
      document.head.appendChild(this.styleElement);
      selector = '.vim-mode-plus-hover .icon::before';
      size = "" + (size * 0.8) + "px";
      style = "font-size: " + size + "; width: " + size + "; hegith: " + size + ";";
      return this.styleElement.sheet.addRule(selector, style);
    };

    HoverElement.prototype.reset = function() {
      var _ref, _ref1, _ref2;
      this.className = 'vim-mode-plus-hover';
      this.textContent = '';
      if ((_ref = this.marker) != null) {
        _ref.destroy();
      }
      if ((_ref1 = this.styleElement) != null) {
        _ref1.remove();
      }
      return _ref2 = {}, this.marker = _ref2.marker, this.lineHeight = _ref2.lineHeight, _ref2;
    };

    HoverElement.prototype.destroy = function() {
      var _ref, _ref1;
      if ((_ref = this.marker) != null) {
        _ref.destroy();
      }
      _ref1 = {}, this.model = _ref1.model, this.lineHeight = _ref1.lineHeight;
      return this.remove();
    };

    return HoverElement;

  })(HTMLElement);

  HoverElement = registerElement("vim-mode-plus-hover", {
    prototype: HoverElement.prototype
  });

  module.exports = {
    Hover: Hover,
    HoverElement: HoverElement
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2hvdmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5RUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxjQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxxREFGZCxDQUFBOztBQUFBLEVBR0Msa0JBQW1CLE9BQUEsQ0FBUSxTQUFSLEVBQW5CLGVBSEQsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBTFIsQ0FBQTs7QUFBQSxFQU9NO0FBQ0osb0JBQUEsVUFBQSxHQUFZLElBQVosQ0FBQTs7QUFBQSxvQkFDQSxLQUFBLEdBQU8sSUFEUCxDQUFBOztBQUdhLElBQUEsZUFBRSxRQUFGLEVBQWEsS0FBYixHQUFBO0FBQ1gsVUFBQSxJQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFBQSxNQUR1QixJQUFDLENBQUEsUUFBQSxLQUN4QixDQUFBO0FBQUEsTUFBQSxPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBLGFBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxFQURSLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQW5CLENBRlIsQ0FEVztJQUFBLENBSGI7O0FBQUEsb0JBUUEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsSUFBQTtBQUFBLGNBQUEsS0FBQTtBQUFBLGNBQ08s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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/hover.coffee
