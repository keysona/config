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
      "default": true
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
    startInInsertModeScopes: {
      order: 4,
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'Start in insert-mode whan editorElement matches scope'
    },
    wrapLeftRightMotion: {
      order: 5,
      type: 'boolean',
      "default": false
    },
    numberRegex: {
      order: 6,
      type: 'string',
      "default": '-?[0-9]+',
      description: 'Used to find number in ctrl-a/ctrl-x. To ignore "-"(minus) char in string like "identifier-1" use "(?:\\B-)?[0-9]+"'
    },
    clearHighlightSearchOnResetNormalMode: {
      order: 7,
      type: 'boolean',
      "default": false,
      description: 'Clear highlightSearch on `escape` in normal-mode'
    },
    clearRangeMarkerOnResetNormalMode: {
      order: 8,
      type: 'boolean',
      "default": false,
      description: 'Clear rangeMarker on `escape` in normal-mode'
    },
    charactersToAddSpaceOnSurround: {
      order: 9,
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'Comma separated list of character, which add additional space inside when surround.'
    },
    showCursorInVisualMode: {
      order: 10,
      type: 'boolean',
      "default": true
    },
    ignoreCaseForSearch: {
      order: 11,
      type: 'boolean',
      "default": false,
      description: 'For `/` and `?`'
    },
    useSmartcaseForSearch: {
      order: 12,
      type: 'boolean',
      "default": false,
      description: 'For `/` and `?`. Override `ignoreCaseForSearch`'
    },
    ignoreCaseForSearchCurrentWord: {
      order: 13,
      type: 'boolean',
      "default": false,
      description: 'For `*` and `#`.'
    },
    useSmartcaseForSearchCurrentWord: {
      order: 14,
      type: 'boolean',
      "default": false,
      description: 'For `*` and `#`. Override `ignoreCaseForSearchCurrentWord`'
    },
    highlightSearch: {
      order: 15,
      type: 'boolean',
      "default": false
    },
    highlightSearchExcludeScopes: {
      order: 16,
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'Suppress highlightSearch when any of these classes are present in the editor'
    },
    incrementalSearch: {
      order: 17,
      type: 'boolean',
      "default": false
    },
    stayOnTransformString: {
      order: 18,
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after TransformString e.g Toggle, Surround"
    },
    stayOnYank: {
      order: 19,
      type: 'boolean',
      "default": false,
      description: "Don't move cursor after Yank"
    },
    flashOnUndoRedo: {
      order: 20,
      type: 'boolean',
      "default": true
    },
    flashOnUndoRedoDuration: {
      order: 21,
      type: 'integer',
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperate: {
      order: 22,
      type: 'boolean',
      "default": true
    },
    flashOnOperateDuration: {
      order: 23,
      type: 'integer',
      "default": 100,
      description: "Duration(msec) for flash"
    },
    flashOnOperateBlacklist: {
      order: 24,
      type: 'array',
      items: {
        type: 'string'
      },
      "default": [],
      description: 'comma separated list of operator class name to disable flash e.g. "Yank, AutoIndent"'
    },
    flashOnSearch: {
      order: 25,
      type: 'boolean',
      "default": true
    },
    flashOnSearchDuration: {
      order: 26,
      type: 'integer',
      "default": 300,
      description: "Duration(msec) for search flash"
    },
    flashScreenOnSearchHasNoMatch: {
      order: 27,
      type: 'boolean',
      "default": true
    },
    showHoverOnOperate: {
      order: 28,
      type: 'boolean',
      "default": false,
      description: "Show count, register and optional icon on hover overlay"
    },
    showHoverOnOperateIcon: {
      order: 29,
      type: 'string',
      "default": 'icon',
      "enum": ['none', 'icon', 'emoji']
    },
    showHoverSearchCounter: {
      order: 30,
      type: 'boolean',
      "default": false
    },
    showHoverSearchCounterDuration: {
      order: 31,
      type: 'integer',
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    hideTabBarOnMaximizePane: {
      order: 32,
      type: 'boolean',
      "default": true
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
