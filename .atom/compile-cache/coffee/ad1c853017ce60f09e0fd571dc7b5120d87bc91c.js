(function() {
  var Settings;

  Settings = (function() {
    function Settings(scope, config) {
      this.scope = scope;
      this.config = config;
    }

    Settings.prototype.get = function(param) {
      if (param === 'defaultRegister') {
        if (this.get('useClipboardAsDefaultRegister')) {
          return '*';
        } else {
          return '"';
        }
      } else {
        return atom.config.get("" + this.scope + "." + param);
      }
    };

    Settings.prototype.set = function(param, value) {
      return atom.config.set("" + this.scope + "." + param, value);
    };

    Settings.prototype.toggle = function(param) {
      return this.set(param, !this.get(param));
    };

    Settings.prototype.observe = function(param, fn) {
      return atom.config.observe("" + this.scope + "." + param, fn);
    };

    return Settings;

  })();

  module.exports = new Settings('vim-mode-plus', {
    setCursorToStartOfChangeOnUndoRedo: {
      order: 1,
      type: 'boolean',
      "default": false
    },
    useClipboardAsDefaultRegister: {
      order: 2,
      type: 'boolean',
      "default": false
    },
    startInInsertMode: {
      order: 3,
      type: 'boolean',
      "default": false
    },
    wrapLeftRightMotion: {
      order: 4,
      type: 'boolean',
      "default": false
    },
    numberRegex: {
      order: 5,
      type: 'string',
      "default": '-?[0-9]+',
      description: 'Used to find number in ctrl-a/ctrl-x. To ignore "-"(minus) char in string like "identifier-1" use "(?:\\B-)?[0-9]+"'
    },
    charactersToAddSpaceOnSurround: {
      order: 6,
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'Comma separated list of character, which add additional space inside when surround.'
    },
    showCursorInVisualMode: {
      order: 7,
      type: 'boolean',
      "default": true
    },
    ignoreCaseForSearch: {
      order: 10,
      type: 'boolean',
      "default": false,
      description: 'For `/` and `?`'
    },
    useSmartcaseForSearch: {
      order: 11,
      type: 'boolean',
      "default": false,
      description: 'For `/` and `?`. Override `ignoreCaseForSearch`'
    },
    ignoreCaseForSearchCurrentWord: {
      order: 12,
      type: 'boolean',
      "default": false,
      description: 'For `*` and `#`.'
    },
    useSmartcaseForSearchCurrentWord: {
      order: 13,
      type: 'boolean',
      "default": false,
      description: 'For `*` and `#`. Override `ignoreCaseForSearchCurrentWord`'
    },
    highlightSearch: {
      order: 14,
      type: 'boolean',
      "default": false
    },
    incrementalSearch: {
      order: 15,
      type: 'boolean',
      "default": false
    },
    stayOnTransformString: {
      order: 16,
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after TransformString e.g Toggle, Surround"
    },
    stayOnYank: {
      order: 17,
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after Yank"
    },
    flashOnUndoRedo: {
      order: 18,
      type: 'boolean',
      "default": false
    },
    flashOnUndoRedoDuration: {
      order: 19,
      type: 'integer',
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperate: {
      order: 20,
      type: 'boolean',
      "default": true
    },
    flashOnOperateDuration: {
      order: 21,
      type: 'integer',
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperateBlacklist: {
      order: 22,
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'comma separated list of operator class name to disable flash e.g. "Yank, AutoIndent"'
    },
    flashOnSearch: {
      order: 23,
      type: 'boolean',
      "default": true
    },
    flashOnSearchDuration: {
      order: 24,
      type: 'integer',
      "default": 300,
      description: "Duration(msec) for search flash"
    },
    flashScreenOnSearchHasNoMatch: {
      order: 25,
      type: 'boolean',
      "default": true
    },
    showHoverOnOperate: {
      order: 26,
      type: 'boolean',
      "default": false,
      description: "Show count, register and optional icon on hover overlay"
    },
    showHoverOnOperateIcon: {
      order: 27,
      type: 'string',
      "default": 'icon',
      "enum": ['none', 'icon', 'emoji']
    },
    showHoverSearchCounter: {
      order: 28,
      type: 'boolean',
      "default": false
    },
    showHoverSearchCounterDuration: {
      order: 29,
      type: 'integer',
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    throwErrorOnNonEmptySelectionInNormalMode: {
      order: 100,
      type: 'boolean',
      "default": false,
      description: "[Dev use] Throw error when non-empty selection was remained in normal-mode at the timing of operation finished"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NldHRpbmdzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQU07QUFDUyxJQUFBLGtCQUFFLEtBQUYsRUFBVSxNQUFWLEdBQUE7QUFBbUIsTUFBbEIsSUFBQyxDQUFBLFFBQUEsS0FBaUIsQ0FBQTtBQUFBLE1BQVYsSUFBQyxDQUFBLFNBQUEsTUFBUyxDQUFuQjtJQUFBLENBQWI7O0FBQUEsdUJBRUEsR0FBQSxHQUFLLFNBQUMsS0FBRCxHQUFBO0FBQ0gsTUFBQSxJQUFHLEtBQUEsS0FBUyxpQkFBWjtBQUNFLFFBQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxDQUFLLCtCQUFMLENBQUg7aUJBQThDLElBQTlDO1NBQUEsTUFBQTtpQkFBdUQsSUFBdkQ7U0FERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsRUFBQSxHQUFHLElBQUMsQ0FBQSxLQUFKLEdBQVUsR0FBVixHQUFhLEtBQTdCLEVBSEY7T0FERztJQUFBLENBRkwsQ0FBQTs7QUFBQSx1QkFRQSxHQUFBLEdBQUssU0FBQyxLQUFELEVBQVEsS0FBUixHQUFBO2FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLEVBQUEsR0FBRyxJQUFDLENBQUEsS0FBSixHQUFVLEdBQVYsR0FBYSxLQUE3QixFQUFzQyxLQUF0QyxFQURHO0lBQUEsQ0FSTCxDQUFBOztBQUFBLHVCQVdBLE1BQUEsR0FBUSxTQUFDLEtBQUQsR0FBQTthQUNOLElBQUMsQ0FBQSxHQUFELENBQUssS0FBTCxFQUFZLENBQUEsSUFBSyxDQUFBLEdBQUQsQ0FBSyxLQUFMLENBQWhCLEVBRE07SUFBQSxDQVhSLENBQUE7O0FBQUEsdUJBY0EsT0FBQSxHQUFT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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/settings.coffee
