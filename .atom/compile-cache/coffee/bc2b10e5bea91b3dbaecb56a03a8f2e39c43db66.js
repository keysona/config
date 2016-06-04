(function() {
  var $, $$, SelectList, SelectListView, fuzzaldrin, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom-space-pen-views'), SelectListView = _ref.SelectListView, $ = _ref.$, $$ = _ref.$$;

  fuzzaldrin = require('fuzzaldrin');

  SelectList = (function(_super) {
    __extends(SelectList, _super);

    function SelectList() {
      return SelectList.__super__.constructor.apply(this, arguments);
    }

    SelectList.prototype.initialize = function() {
      SelectList.__super__.initialize.apply(this, arguments);
      return this.addClass('vim-mode-plus-select-list');
    };

    SelectList.prototype.getFilterKey = function() {
      return 'displayName';
    };

    SelectList.prototype.cancelled = function() {
      this.vimState.emitter.emit('did-cancel-select-list');
      return this.hide();
    };

    SelectList.prototype.show = function(vimState, options) {
      var _ref1;
      this.vimState = vimState;
      if (options.maxItems != null) {
        this.setMaxItems(options.maxItems);
      }
      _ref1 = this.vimState, this.editorElement = _ref1.editorElement, this.editor = _ref1.editor;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setItems(options.items);
      return this.focusFilterEditor();
    };

    SelectList.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    SelectList.prototype.viewForItem = function(_arg) {
      var displayName, filterQuery, matches, name;
      name = _arg.name, displayName = _arg.displayName;
      filterQuery = this.getFilterQuery();
      matches = fuzzaldrin.match(displayName, filterQuery);
      return $$(function() {
        var highlighter;
        highlighter = (function(_this) {
          return function(command, matches, offsetIndex) {
            var lastIndex, matchIndex, matchedChars, unmatched, _i, _len;
            lastIndex = 0;
            matchedChars = [];
            for (_i = 0, _len = matches.length; _i < _len; _i++) {
              matchIndex = matches[_i];
              matchIndex -= offsetIndex;
              if (matchIndex < 0) {
                continue;
              }
              unmatched = command.substring(lastIndex, matchIndex);
              if (unmatched) {
                if (matchedChars.length) {
                  _this.span(matchedChars.join(''), {
                    "class": 'character-match'
                  });
                }
                matchedChars = [];
                _this.text(unmatched);
              }
              matchedChars.push(command[matchIndex]);
              lastIndex = matchIndex + 1;
            }
            if (matchedChars.length) {
              _this.span(matchedChars.join(''), {
                "class": 'character-match'
              });
            }
            return _this.text(command.substring(lastIndex));
          };
        })(this);
        return this.li({
          "class": 'event',
          'data-event-name': name
        }, (function(_this) {
          return function() {
            return _this.span({
              title: displayName
            }, function() {
              return highlighter(displayName, matches, 0);
            });
          };
        })(this));
      });
    };

    SelectList.prototype.confirmed = function(item) {
      this.vimState.emitter.emit('did-confirm-select-list', item);
      return this.cancel();
    };

    return SelectList;

  })(SelectListView);

  module.exports = new SelectList;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdC1saXN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzREFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUEwQixPQUFBLENBQVEsc0JBQVIsQ0FBMUIsRUFBQyxzQkFBQSxjQUFELEVBQWlCLFNBQUEsQ0FBakIsRUFBb0IsVUFBQSxFQURwQixDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUlNO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHlCQUFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLDRDQUFBLFNBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSwyQkFBVixFQUZVO0lBQUEsQ0FBWixDQUFBOztBQUFBLHlCQUlBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixjQURZO0lBQUEsQ0FKZCxDQUFBOztBQUFBLHlCQU9BLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQWxCLENBQXVCLHdCQUF2QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBRlM7SUFBQSxDQVBYLENBQUE7O0FBQUEseUJBV0EsSUFBQSxHQUFNLFNBQUUsUUFBRixFQUFZLE9BQVosR0FBQTtBQUNKLFVBQUEsS0FBQTtBQUFBLE1BREssSUFBQyxDQUFBLFdBQUEsUUFDTixDQUFBO0FBQUEsTUFBQSxJQUFHLHdCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLE9BQU8sQ0FBQyxR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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/select-list.coffee
