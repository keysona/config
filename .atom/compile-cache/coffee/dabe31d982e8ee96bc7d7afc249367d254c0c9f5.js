(function() {
  var Hover, HoverElement, emoji, emojiFolder, registerElement, settings, swrap,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  emoji = require('emoji-images');

  emojiFolder = 'atom://vim-mode-plus/node_modules/emoji-images/pngs';

  registerElement = require('./utils').registerElement;

  settings = require('./settings');

  swrap = require('./selection-wrapper');

  Hover = (function(_super) {
    __extends(Hover, _super);

    function Hover() {
      return Hover.__super__.constructor.apply(this, arguments);
    }

    Hover.prototype.createdCallback = function() {
      this.className = 'vim-mode-plus-hover';
      this.text = [];
      return this;
    };

    Hover.prototype.initialize = function(vimState) {
      var _ref;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      return this;
    };

    Hover.prototype.getPoint = function() {
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
      if (point == null) {
        point = this.getPoint();
      }
      this.text.push(text);
      return this.show(point);
    };

    Hover.prototype.replaceLastSection = function(text) {
      this.text.pop();
      return this.add(text);
    };

    Hover.prototype.convertText = function(text, lineHeight) {
      text = String(text);
      if (settings.get('showHoverOnOperateIcon') === 'emoji') {
        return emoji(text, emojiFolder, lineHeight);
      } else {
        return text.replace(/:(.*?):/g, function(s, m) {
          return "<span class='icon icon-" + m + "'></span>";
        });
      }
    };

    Hover.prototype.show = function(point) {
      if (this.marker == null) {
        this.marker = this.createOverlay(point);
        this.lineHeight = this.editor.getLineHeightInPixels();
        this.setIconSize(this.lineHeight);
        this.style.marginTop = (this.lineHeight * -2.2) + 'px';
      }
      if (this.text.length) {
        return this.innerHTML = this.text.map((function(_this) {
          return function(text) {
            return _this.convertText(text, _this.lineHeight);
          };
        })(this)).join('');
      }
    };

    Hover.prototype.withTimeout = function(point, options) {
      var _ref;
      this.reset();
      if (options.classList.length) {
        (_ref = this.classList).add.apply(_ref, options.classList);
      }
      this.add(options.text, point);
      if (options.timeout != null) {
        return this.timeoutID = setTimeout((function(_this) {
          return function() {
            return _this.reset();
          };
        })(this), options.timeout);
      }
    };

    Hover.prototype.createOverlay = function(point) {
      var decoration, marker;
      marker = this.editor.markBufferPosition(point);
      decoration = this.editor.decorateMarker(marker, {
        type: 'overlay',
        item: this
      });
      return marker;
    };

    Hover.prototype.setIconSize = function(size) {
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

    Hover.prototype.isVisible = function() {
      return this.marker != null;
    };

    Hover.prototype.reset = function() {
      var _ref, _ref1, _ref2;
      this.text = [];
      clearTimeout(this.timeoutID);
      this.className = 'vim-mode-plus-hover';
      this.textContent = '';
      if ((_ref = this.marker) != null) {
        _ref.destroy();
      }
      if ((_ref1 = this.styleElement) != null) {
        _ref1.remove();
      }
      return _ref2 = {}, this.marker = _ref2.marker, this.lineHeight = _ref2.lineHeight, this.timeoutID = _ref2.timeoutID, this.styleElement = _ref2.styleElement, _ref2;
    };

    Hover.prototype.destroy = function() {
      var _ref;
      this.reset();
      _ref = {}, this.vimState = _ref.vimState, this.lineHeight = _ref.lineHeight;
      return this.remove();
    };

    return Hover;

  })(HTMLElement);

  HoverElement = registerElement("vim-mode-plus-hover", {
    prototype: Hover.prototype
  });

  module.exports = {
    HoverElement: HoverElement
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2hvdmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5RUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxjQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxxREFGZCxDQUFBOztBQUFBLEVBR0Msa0JBQW1CLE9BQUEsQ0FBUSxTQUFSLEVBQW5CLGVBSEQsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBTFIsQ0FBQTs7QUFBQSxFQU9NO0FBQ0osNEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLG9CQUFBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLHFCQUFiLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFEUixDQUFBO2FBRUEsS0FIZTtJQUFBLENBQWpCLENBQUE7O0FBQUEsb0JBS0EsVUFBQSxHQUFZLFNBQUUsUUFBRixHQUFBO0FBQ1YsVUFBQSxJQUFBO0FBQUEsTUFEVyxJQUFDLENBQUEsV0FBQSxRQUNaLENBQUE7QUFBQSxNQUFBLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUEsYUFBWCxDQUFBO2FBQ0EsS0FGVTtJQUFBLENBTFosQ0FBQTs7QUFBQSxvQkFTQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSxJQUFBO0FBQUEsY0FBQSxLQUFBO0FBQUEsY0FDTyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsUUFBakIs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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/hover.coffee
