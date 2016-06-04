(function() {
  var ActivatePowerMode, CompositeDisposable, configSchema, random, throttle;

  throttle = require("lodash.throttle");

  random = require("lodash.random");

  CompositeDisposable = require("atom").CompositeDisposable;

  configSchema = require("./config-schema");

  module.exports = ActivatePowerMode = {
    config: configSchema,
    subscriptions: null,
    active: false,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add("atom-workspace", {
        "activate-power-mode:toggle": (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      this.activeItemSubscription = atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function() {
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      if (this.getConfig("autoToggle")) {
        return this.toggle();
      }
    },
    deactivate: function() {
      var _ref, _ref1, _ref2, _ref3;
      if ((_ref = this.editorChangeSubscription) != null) {
        _ref.dispose();
      }
      if ((_ref1 = this.activeItemSubscription) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      this.subscriptions = null;
      this.active = false;
      if ((_ref3 = this.canvas) != null) {
        _ref3.parentNode.removeChild(this.canvas);
      }
      return this.canvas = null;
    },
    getConfig: function(config) {
      return atom.config.get("activate-power-mode." + config);
    },
    subscribeToActiveTextEditor: function() {
      var _ref;
      this.throttledShake = throttle(this.shake.bind(this), 100, {
        trailing: false
      });
      this.throttledSpawnParticles = throttle(this.spawnParticles.bind(this), 25, {
        trailing: false
      });
      this.editor = atom.workspace.getActiveTextEditor();
      if (!this.editor) {
        return;
      }
      this.editorElement = atom.views.getView(this.editor);
      this.editorElement.classList.add("power-mode");
      if ((_ref = this.editorChangeSubscription) != null) {
        _ref.dispose();
      }
      this.editorChangeSubscription = this.editor.getBuffer().onDidChange(this.onChange.bind(this));
      if (!this.canvas) {
        this.setupCanvas();
      }
      this.editorElement.parentNode.appendChild(this.canvas);
      return this.canvas.style.display = "block";
    },
    setupCanvas: function() {
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
      return this.canvas.classList.add("power-mode-canvas");
    },
    calculateCursorOffset: function() {
      var editorRect, scrollViewRect;
      editorRect = this.editorElement.getBoundingClientRect();
      scrollViewRect = this.editorElement.shadowRoot.querySelector(".scroll-view").getBoundingClientRect();
      return {
        top: scrollViewRect.top - editorRect.top + this.editor.getLineHeightInPixels() / 2,
        left: scrollViewRect.left - editorRect.left
      };
    },
    onChange: function(e) {
      var range, spawnParticles;
      if (!this.active) {
        return;
      }
      spawnParticles = true;
      if (e.newText) {
        spawnParticles = e.newText !== "\n";
        range = e.newRange.end;
      } else {
        range = e.newRange.start;
      }
      if (spawnParticles && this.getConfig("particles.enabled")) {
        this.throttledSpawnParticles(range);
      }
      if (this.getConfig("screenShake.enabled")) {
        return this.throttledShake();
      }
    },
    shake: function() {
      var max, min, x, y;
      min = this.getConfig("screenShake.minIntensity");
      max = this.getConfig("screenShake.maxIntensity");
      x = this.shakeIntensity(min, max);
      y = this.shakeIntensity(min, max);
      this.editorElement.style.top = "" + y + "px";
      this.editorElement.style.left = "" + x + "px";
      return setTimeout((function(_this) {
        return function() {
          _this.editorElement.style.top = "";
          return _this.editorElement.style.left = "";
        };
      })(this), 75);
    },
    shakeIntensity: function(min, max) {
      var direction;
      direction = Math.random() > 0.5 ? -1 : 1;
      return random(min, max, true) * direction;
    },
    spawnParticles: function(range) {
      var color, cursorOffset, left, numParticles, screenPosition, top, _ref, _results;
      screenPosition = this.editor.screenPositionForBufferPosition(range);
      cursorOffset = this.calculateCursorOffset();
      _ref = this.editorElement.pixelPositionForScreenPosition(screenPosition), left = _ref.left, top = _ref.top;
      left += cursorOffset.left - this.editorElement.getScrollLeft();
      top += cursorOffset.top - this.editorElement.getScrollTop();
      color = this.getColorAtPosition(left, top);
      numParticles = random(this.getConfig("particles.spawnCount.min"), this.getConfig("particles.spawnCount.max"));
      _results = [];
      while (numParticles--) {
        this.particles[this.particlePointer] = this.createParticle(left, top, color);
        _results.push(this.particlePointer = (this.particlePointer + 1) % this.getConfig("particles.totalCount.max"));
      }
      return _results;
    },
    getColorAtPosition: function(left, top) {
      var el, offset;
      offset = this.editorElement.getBoundingClientRect();
      el = atom.views.getView(this.editor).shadowRoot.elementFromPoint(left + offset.left, top + offset.top);
      if (el) {
        return getComputedStyle(el).color;
      } else {
        return "rgb(255, 255, 255)";
      }
    },
    createParticle: function(x, y, color) {
      return {
        x: x,
        y: y,
        alpha: 1,
        color: color,
        velocity: {
          x: -1 + Math.random() * 2,
          y: -3.5 + Math.random() * 2
        }
      };
    },
    drawParticles: function() {
      var gco, particle, size, _i, _len, _ref;
      if (this.active) {
        requestAnimationFrame(this.drawParticles.bind(this));
      }
      if (!this.canvas) {
        return;
      }
      this.canvas.width = this.editorElement.offsetWidth;
      this.canvas.height = this.editorElement.offsetHeight;
      gco = this.context.globalCompositeOperation;
      this.context.globalCompositeOperation = "lighter";
      _ref = this.particles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        particle = _ref[_i];
        if (particle.alpha <= 0.1) {
          continue;
        }
        particle.velocity.y += 0.075;
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.alpha *= 0.96;
        this.context.fillStyle = "rgba(" + particle.color.slice(4, -1) + ", " + particle.alpha + ")";
        size = random(this.getConfig("particles.size.min"), this.getConfig("particles.size.max"), true);
        this.context.fillRect(Math.round(particle.x - size / 2), Math.round(particle.y - size / 2), size, size);
      }
      return this.context.globalCompositeOperation = gco;
    },
    toggle: function() {
      this.active = !this.active;
      this.particlePointer = 0;
      this.particles = [];
      return requestAnimationFrame(this.drawParticles.bind(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL2FjdGl2YXRlLXBvd2VyLW1vZGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNFQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVIsQ0FEVCxDQUFBOztBQUFBLEVBR0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUhELENBQUE7O0FBQUEsRUFLQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBTGYsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGlCQUFBLEdBQ2Y7QUFBQSxJQUFBLE1BQUEsRUFBUSxZQUFSO0FBQUEsSUFDQSxhQUFBLEVBQWUsSUFEZjtBQUFBLElBRUEsTUFBQSxFQUFRLEtBRlI7QUFBQSxJQUlBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNqQjtBQUFBLFFBQUEsNEJBQUEsRUFBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7T0FEaUIsQ0FBbkIsQ0FEQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFBSSxDQUFDLFNBQVMsQ0FBQywrQkFBZixDQUEr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

//# sourceURL=/home/key/.atom/packages/activate-power-mode/lib/activate-power-mode.coffee
