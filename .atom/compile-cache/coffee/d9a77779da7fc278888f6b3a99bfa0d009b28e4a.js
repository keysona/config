(function() {
  var Disposable, ElementBuilder, Point, Range, WhiteSpaceRegExp, bufferPositionForScreenPositionWithoutClip, clipScreenPositionForBufferPosition, countChar, cursorIsAtEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionForScope, eachCursor, eachSelection, findIndex, fs, getAncestors, getBufferRangeForRowRange, getBufferRows, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndPositionForPattern, getEolBufferPositionForRow, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterColumForBufferRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getKeystrokeForEvent, getLastVisibleScreenRow, getNewTextRangeFromCheckpoint, getParent, getScopesForTokenizedLine, getStartPositionForPattern, getTextAtCursor, getTextFromPointToEOL, getTextInScreenRange, getTextToPoint, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getView, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordRegExpForPointWithCursor, haveSomeSelection, highlightRanges, include, isAllWhiteSpace, isEndsWithNewLineForBufferRow, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, keystrokeToCharCode, logGoalColumnForSelection, markerOptions, mergeIntersectingRanges, moveCursor, moveCursorDown, moveCursorDownBuffer, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, moveCursorUpBuffer, normalizePatchChanges, pointIsAtEndOfLine, pointIsAtVimEndOfFile, pointIsBetweenWordAndNonWord, pointIsSurroundedByWhitespace, poliyFillsToTextBufferHistory, registerElement, reportCursor, reportSelection, saveEditorState, scanForScopeStart, screenPositionForBufferPositionWithoutClip, semver, settings, shouldPreventWrapLine, smartScrollToBufferPosition, sortComparable, sortRanges, sortRangesByEndPosition, withTrackingCursorPositionChange, withVisibleBufferRange, _, _ref;

  fs = require('fs-plus');

  semver = require('semver');

  settings = require('./settings');

  _ref = require('atom'), Disposable = _ref.Disposable, Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  getParent = function(obj) {
    var _ref1;
    return (_ref1 = obj.__super__) != null ? _ref1.constructor : void 0;
  };

  getAncestors = function(obj) {
    var ancestors, current;
    ancestors = [];
    ancestors.push((current = obj));
    while (current = getParent(current)) {
      ancestors.push(current);
    }
    return ancestors;
  };

  getKeyBindingForCommand = function(command, _arg) {
    var keymap, keymapPath, keymaps, keystrokes, packageName, results, selector, _i, _len;
    packageName = _arg.packageName;
    results = null;
    keymaps = atom.keymaps.getKeyBindings();
    if (packageName != null) {
      keymapPath = atom.packages.getActivePackage(packageName).getKeymapPaths().pop();
      keymaps = keymaps.filter(function(_arg1) {
        var source;
        source = _arg1.source;
        return source === keymapPath;
      });
    }
    for (_i = 0, _len = keymaps.length; _i < _len; _i++) {
      keymap = keymaps[_i];
      if (!(keymap.command === command)) {
        continue;
      }
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/shift-/, '');
      (results != null ? results : results = []).push({
        keystrokes: keystrokes,
        selector: selector
      });
    }
    return results;
  };

  include = function(klass, module) {
    var key, value, _results;
    _results = [];
    for (key in module) {
      value = module[key];
      _results.push(klass.prototype[key] = value);
    }
    return _results;
  };

  debug = function(message) {
    var filePath;
    if (!settings.get('debug')) {
      return;
    }
    message += "\n";
    switch (settings.get('debugOutput')) {
      case 'console':
        return console.log(message);
      case 'file':
        filePath = fs.normalize(settings.get('debugOutputFilePath'));
        if (fs.existsSync(filePath)) {
          return fs.appendFileSync(filePath, message);
        }
    }
  };

  getView = function(model) {
    return atom.views.getView(model);
  };

  saveEditorState = function(editor) {
    var editorElement, foldStartRows, scrollTop;
    editorElement = getView(editor);
    scrollTop = editorElement.getScrollTop();
    foldStartRows = editor.displayBuffer.findFoldMarkers({}).map(function(m) {
      return editor.displayBuffer.foldForMarker(m).getStartRow();
    });
    return function() {
      var row, _i, _len, _ref1;
      _ref1 = foldStartRows.reverse();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (!editor.isFoldedAtBufferRow(row)) {
          editor.foldBufferRow(row);
        }
      }
      return editorElement.setScrollTop(scrollTop);
    };
  };

  getKeystrokeForEvent = function(event) {
    var keyboardEvent, _ref1;
    keyboardEvent = (_ref1 = event.originalEvent.originalEvent) != null ? _ref1 : event.originalEvent;
    return atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent);
  };

  keystrokeToCharCode = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    "delete": 127
  };

  getCharacterForEvent = function(event) {
    var charCode, keystroke;
    keystroke = getKeystrokeForEvent(event);
    if (charCode = keystrokeToCharCode[keystroke]) {
      return String.fromCharCode(charCode);
    } else {
      return keystroke;
    }
  };

  isLinewiseRange = function(_arg) {
    var end, start, _ref1;
    start = _arg.start, end = _arg.end;
    return (start.row !== end.row) && ((start.column === (_ref1 = end.column) && _ref1 === 0));
  };

  isEndsWithNewLineForBufferRow = function(editor, row) {
    var end, start, _ref1;
    _ref1 = editor.bufferRangeForBufferRow(row, {
      includeNewline: true
    }), start = _ref1.start, end = _ref1.end;
    return end.isGreaterThan(start) && end.column === 0;
  };

  haveSomeSelection = function(editor) {
    return editor.getSelections().some(function(selection) {
      return !selection.isEmpty();
    });
  };

  sortRanges = function(ranges) {
    return ranges.sort(function(a, b) {
      return a.compare(b);
    });
  };

  sortRangesByEndPosition = function(ranges, fn) {
    return ranges.sort(function(a, b) {
      return a.end.compare(b.end);
    });
  };

  getIndex = function(index, list) {
    var length;
    length = list.length;
    if (length === 0) {
      return -1;
    } else {
      index = index % length;
      if (index >= 0) {
        return index;
      } else {
        return length + index;
      }
    }
  };

  withVisibleBufferRange = function(editor, fn) {
    var disposable, range;
    if (range = getVisibleBufferRange(editor)) {
      return fn(range);
    } else {
      return disposable = getView(editor).onDidAttach(function() {
        disposable.dispose();
        range = getVisibleBufferRange(editor);
        return fn(range);
      });
    }
  };

  getVisibleBufferRange = function(editor) {
    var endRow, startRow, _ref1;
    _ref1 = getView(editor).getVisibleRowRange(), startRow = _ref1[0], endRow = _ref1[1];
    if (!((startRow != null) && (endRow != null))) {
      return null;
    }
    startRow = editor.bufferRowForScreenRow(startRow);
    endRow = editor.bufferRowForScreenRow(endRow);
    return new Range([startRow, 0], [endRow, Infinity]);
  };

  getVisibleEditors = function() {
    var editor, pane, _i, _len, _ref1, _results;
    _ref1 = atom.workspace.getPanes();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      pane = _ref1[_i];
      if (editor = pane.getActiveEditor()) {
        _results.push(editor);
      }
    }
    return _results;
  };

  eachSelection = function(editor, fn) {
    var selection, _i, _len, _ref1, _results;
    _ref1 = editor.getSelections();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      selection = _ref1[_i];
      _results.push(fn(selection));
    }
    return _results;
  };

  eachCursor = function(editor, fn) {
    var cursor, _i, _len, _ref1, _results;
    _ref1 = editor.getCursors();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      cursor = _ref1[_i];
      _results.push(fn(cursor));
    }
    return _results;
  };

  bufferPositionForScreenPositionWithoutClip = function(editor, screenPosition) {
    var bufferColumn, bufferRow, column, row, _ref1;
    _ref1 = Point.fromObject(screenPosition), row = _ref1.row, column = _ref1.column;
    bufferRow = editor.bufferRowForScreenRow(row);
    bufferColumn = editor.displayBuffer.tokenizedLineForScreenRow(row).bufferColumnForScreenColumn(column);
    return new Point(bufferRow, bufferColumn);
  };

  screenPositionForBufferPositionWithoutClip = function(editor, bufferPosition) {
    var column, row, screenColumn, screenRow, _ref1;
    _ref1 = Point.fromObject(bufferPosition), row = _ref1.row, column = _ref1.column;
    screenRow = editor.screenRowForBufferRow(row);
    screenColumn = editor.displayBuffer.tokenizedLineForScreenRow(row).screenColumnForBufferColumn(column);
    return new Point(screenRow, screenColumn);
  };

  poliyFillsToTextBufferHistory = function(history) {
    var History, Patch;
    Patch = null;
    History = history.constructor;
    return History.prototype.getChangesSinceCheckpoint = function(checkpointId) {
      var checkpointIndex, entry, i, patchesSinceCheckpoint, _i, _ref1;
      checkpointIndex = null;
      patchesSinceCheckpoint = [];
      _ref1 = this.undoStack;
      for (i = _i = _ref1.length - 1; _i >= 0; i = _i += -1) {
        entry = _ref1[i];
        if (checkpointIndex != null) {
          break;
        }
        switch (entry.constructor.name) {
          case 'Checkpoint':
            if (entry.id === checkpointId) {
              checkpointIndex = i;
            }
            break;
          case 'Transaction':
            if (Patch == null) {
              Patch = entry.patch.constructor;
            }
            patchesSinceCheckpoint.unshift(entry.patch);
            break;
          case 'Patch':
            if (Patch == null) {
              Patch = entry.constructor;
            }
            patchesSinceCheckpoint.unshift(entry);
            break;
          default:
            throw new Error("Unexpected undo stack entry type: " + entry.constructor.name);
        }
      }
      if (checkpointIndex != null) {
        return Patch != null ? Patch.compose(patchesSinceCheckpoint) : void 0;
      } else {
        return null;
      }
    };
  };

  normalizePatchChanges = function(changes) {
    return changes.map(function(change) {
      return {
        start: Point.fromObject(change.newStart),
        oldExtent: Point.fromObject(change.oldExtent),
        newExtent: Point.fromObject(change.newExtent),
        newText: change.newText
      };
    });
  };

  getNewTextRangeFromCheckpoint = function(editor, checkpoint) {
    var change, history, patch, range;
    history = editor.getBuffer().history;
    range = null;
    if (patch = history.getChangesSinceCheckpoint(checkpoint)) {
      if (change = normalizePatchChanges(patch.getChanges()).shift()) {
        range = new Range(change.start, change.start.traverse(change.newExtent));
      }
    }
    return range;
  };

  countChar = function(string, char) {
    return string.split(char).length - 1;
  };

  findIndex = function(list, fn) {
    var e, i, _i, _len;
    for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
      e = list[i];
      if (fn(e)) {
        return i;
      }
    }
    return null;
  };

  mergeIntersectingRanges = function(ranges) {
    var i, index, range, result, _i, _len;
    result = [];
    for (i = _i = 0, _len = ranges.length; _i < _len; i = ++_i) {
      range = ranges[i];
      if (index = findIndex(result, function(r) {
        return r.intersectsWith(range);
      })) {
        result[index] = result[index].union(range);
      } else {
        result.push(range);
      }
    }
    return result;
  };

  getEolBufferPositionForRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEolBufferPositionForRow(editor, point.row).isEqual(point);
  };

  getTextAtCursor = function(cursor) {
    var bufferRange, editor;
    editor = cursor.editor;
    bufferRange = editor.bufferRangeForScreenRange(cursor.getScreenRange());
    return editor.getTextInBufferRange(bufferRange);
  };

  getTextInScreenRange = function(editor, screenRange) {
    var bufferRange;
    bufferRange = editor.bufferRangeForScreenRange(screenRange);
    return editor.getTextInBufferRange(bufferRange);
  };

  cursorIsOnWhiteSpace = function(cursor) {
    return isAllWhiteSpace(getTextAtCursor(cursor));
  };

  getWordRegExpForPointWithCursor = function(cursor, point) {
    var options;
    options = {};
    if (pointIsBetweenWordAndNonWord(cursor.editor, point, cursor.getScopeDescriptor())) {
      options.includeNonWordCharacters = false;
    }
    return cursor.wordRegExp(options);
  };

  pointIsBetweenWordAndNonWord = function(editor, point, scope) {
    var after, before, column, nonWordCharacters, range, row, _ref1;
    point = Point.fromObject(point);
    row = point.row, column = point.column;
    if ((column === 0) || (pointIsAtEndOfLine(editor, point))) {
      return false;
    }
    range = [[row, column - 1], [row, column + 1]];
    _ref1 = editor.getTextInBufferRange(range), before = _ref1[0], after = _ref1[1];
    if (/\s/.test(before) || /\s/.test(after)) {
      return false;
    } else {
      nonWordCharacters = atom.config.get('editor.nonWordCharacters', {
        scope: scope
      }).split('');
      return _.contains(nonWordCharacters, before) !== _.contains(nonWordCharacters, after);
    }
  };

  pointIsSurroundedByWhitespace = function(editor, point) {
    var column, range, row, _ref1;
    _ref1 = Point.fromObject(point), row = _ref1.row, column = _ref1.column;
    range = [[row, column - 1], [row, column + 1]];
    return /^\s+$/.test(editor.getTextInBufferRange(range));
  };

  moveCursorToNextNonWhitespace = function(cursor) {
    var originalPoint;
    originalPoint = cursor.getBufferPosition();
    while (cursorIsOnWhiteSpace(cursor) && (!cursorIsAtVimEndOfFile(cursor))) {
      cursor.moveRight();
    }
    return !originalPoint.isEqual(cursor.getBufferPosition());
  };

  getBufferRows = function(editor, _arg) {
    var direction, includeStartRow, startRow, vimLastBufferRow, _i, _j, _results, _results1;
    startRow = _arg.startRow, direction = _arg.direction, includeStartRow = _arg.includeStartRow;
    switch (direction) {
      case 'previous':
        if (!includeStartRow) {
          if (startRow === 0) {
            return [];
          }
          if (startRow > 0) {
            startRow -= 1;
          }
        }
        return (function() {
          _results = [];
          for (var _i = startRow; startRow <= 0 ? _i <= 0 : _i >= 0; startRow <= 0 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
      case 'next':
        vimLastBufferRow = getVimLastBufferRow(editor);
        if (!includeStartRow) {
          if (startRow === vimLastBufferRow) {
            return [];
          }
          if (startRow < vimLastBufferRow) {
            startRow += 1;
          }
        }
        return (function() {
          _results1 = [];
          for (var _j = startRow; startRow <= vimLastBufferRow ? _j <= vimLastBufferRow : _j >= vimLastBufferRow; startRow <= vimLastBufferRow ? _j++ : _j--){ _results1.push(_j); }
          return _results1;
        }).apply(this);
    }
  };

  getVimEofBufferPosition = function(editor) {
    var eof;
    eof = editor.getEofBufferPosition();
    if ((eof.row === 0) || (eof.column > 0)) {
      return eof;
    } else {
      return getEolBufferPositionForRow(editor, eof.row - 1);
    }
  };

  getVimEofScreenPosition = function(editor) {
    return editor.screenPositionForBufferPosition(getVimEofBufferPosition(editor));
  };

  pointIsAtVimEndOfFile = function(editor, point) {
    return getVimEofBufferPosition(editor).isEqual(point);
  };

  cursorIsAtVimEndOfFile = function(cursor) {
    return pointIsAtVimEndOfFile(cursor.editor, cursor.getBufferPosition());
  };

  cursorIsAtEmptyRow = function(cursor) {
    return cursor.isAtBeginningOfLine() && cursor.isAtEndOfLine();
  };

  getVimLastBufferRow = function(editor) {
    return getVimEofBufferPosition(editor).row;
  };

  getVimLastScreenRow = function(editor) {
    return getVimEofScreenPosition(editor).row;
  };

  getFirstVisibleScreenRow = function(editor) {
    return getView(editor).getFirstVisibleScreenRow();
  };

  getLastVisibleScreenRow = function(editor) {
    return getView(editor).getLastVisibleScreenRow();
  };

  getFirstCharacterColumForBufferRow = function(editor, row) {
    var column, text;
    text = editor.lineTextForBufferRow(row);
    if ((column = text.search(/\S/)) >= 0) {
      return column;
    } else {
      return 0;
    }
  };

  getFirstCharacterPositionForBufferRow = function(editor, row) {
    var from;
    from = [row, 0];
    return getEndPositionForPattern(editor, from, /\s*/, {
      containedOnly: true
    }) || from;
  };

  getFirstCharacterBufferPositionForScreenRow = function(editor, screenRow) {
    var end, point, scanRange, start;
    start = editor.clipScreenPosition([screenRow, 0], {
      skipSoftWrapIndentation: true
    });
    end = [screenRow, Infinity];
    scanRange = editor.bufferRangeForScreenRange([start, end]);
    point = null;
    editor.scanInBufferRange(/\S/, scanRange, function(_arg) {
      var range, stop;
      range = _arg.range, stop = _arg.stop;
      point = range.start;
      return stop();
    });
    return point != null ? point : scanRange.start;
  };

  cursorIsAtFirstCharacter = function(cursor) {
    var column, editor, firstCharColumn;
    editor = cursor.editor;
    column = cursor.getBufferColumn();
    firstCharColumn = getFirstCharacterColumForBufferRow(editor, cursor.getBufferRow());
    return column === firstCharColumn;
  };

  moveCursor = function(cursor, _arg, fn) {
    var goalColumn, preserveGoalColumn;
    preserveGoalColumn = _arg.preserveGoalColumn;
    goalColumn = cursor.goalColumn;
    fn(cursor);
    if (preserveGoalColumn && goalColumn) {
      return cursor.goalColumn = goalColumn;
    }
  };

  shouldPreventWrapLine = function(cursor) {
    var column, row, tabLength, text, _ref1;
    _ref1 = cursor.getBufferPosition(), row = _ref1.row, column = _ref1.column;
    if (atom.config.get('editor.softTabs')) {
      tabLength = atom.config.get('editor.tabLength');
      if ((0 < column && column < tabLength)) {
        text = cursor.editor.getTextInBufferRange([[row, 0], [row, tabLength]]);
        return /^\s+$/.test(text);
      } else {
        return false;
      }
    }
  };

  moveCursorLeft = function(cursor, options) {
    var allowWrap, motion, needSpecialCareToPreventWrapLine;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap, needSpecialCareToPreventWrapLine = options.needSpecialCareToPreventWrapLine;
    delete options.allowWrap;
    if (needSpecialCareToPreventWrapLine) {
      if (shouldPreventWrapLine(cursor)) {
        return;
      }
    }
    if (!cursor.isAtBeginningOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveLeft();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorRight = function(cursor, options) {
    var allowWrap, motion;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap;
    delete options.allowWrap;
    if (!cursor.isAtEndOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveRight();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorUp = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (cursor.getScreenRow() !== 0) {
      motion = function(cursor) {
        return cursor.moveUp();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDown = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (getVimLastScreenRow(cursor.editor) !== cursor.getScreenRow()) {
      motion = function(cursor) {
        return cursor.moveDown();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (getVimLastBufferRow(cursor.editor) !== point.row) {
      return cursor.setBufferPosition(point.translate([+1, 0]));
    }
  };

  moveCursorUpBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (point.row !== 0) {
      return cursor.setBufferPosition(point.translate([-1, 0]));
    }
  };

  moveCursorToFirstCharacterAtRow = function(cursor, row) {
    cursor.setBufferPosition([row, 0]);
    return cursor.moveToFirstCharacterOfLine();
  };

  markerOptions = {
    ivalidate: 'never',
    persistent: false
  };

  highlightRanges = function(editor, ranges, options) {
    var marker, markers, timeout, _i, _len;
    if (!_.isArray(ranges)) {
      ranges = [ranges];
    }
    if (!ranges.length) {
      return null;
    }
    markers = ranges.map(function(range) {
      return editor.markBufferRange(range, markerOptions);
    });
    for (_i = 0, _len = markers.length; _i < _len; _i++) {
      marker = markers[_i];
      editor.decorateMarker(marker, {
        type: 'highlight',
        "class": options["class"]
      });
    }
    timeout = options.timeout;
    if (timeout != null) {
      setTimeout(function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
          marker = markers[_j];
          _results.push(marker.destroy());
        }
        return _results;
      }, timeout);
    }
    return markers;
  };

  getValidVimBufferRow = function(editor, row) {
    var vimLastBufferRow;
    vimLastBufferRow = getVimLastBufferRow(editor);
    switch (false) {
      case !(row < 0):
        return 0;
      case !(row > vimLastBufferRow):
        return vimLastBufferRow;
      default:
        return row;
    }
  };

  getValidVimScreenRow = function(editor, row) {
    var vimLastScreenRow;
    vimLastScreenRow = getVimLastScreenRow(editor);
    switch (false) {
      case !(row < 0):
        return 0;
      case !(row > vimLastScreenRow):
        return vimLastScreenRow;
      default:
        return row;
    }
  };

  clipScreenPositionForBufferPosition = function(editor, bufferPosition, options) {
    var screenPosition, translate;
    screenPosition = editor.screenPositionForBufferPosition(bufferPosition);
    translate = options.translate;
    delete options.translate;
    if (translate) {
      screenPosition = screenPosition.translate(translate);
    }
    return editor.clipScreenPosition(screenPosition, options);
  };

  getTextToPoint = function(editor, _arg, _arg1) {
    var column, exclusive, row;
    row = _arg.row, column = _arg.column;
    exclusive = (_arg1 != null ? _arg1 : {}).exclusive;
    if (exclusive == null) {
      exclusive = true;
    }
    if (exclusive) {
      return editor.lineTextForBufferRow(row).slice(0, column);
    } else {
      return editor.lineTextForBufferRow(row).slice(0, +column + 1 || 9e9);
    }
  };

  getTextFromPointToEOL = function(editor, _arg, _arg1) {
    var column, exclusive, row, start;
    row = _arg.row, column = _arg.column;
    exclusive = (_arg1 != null ? _arg1 : {}).exclusive;
    if (exclusive == null) {
      exclusive = false;
    }
    start = column;
    if (exclusive) {
      start += 1;
    }
    return editor.lineTextForBufferRow(row).slice(start);
  };

  getIndentLevelForBufferRow = function(editor, row) {
    var text;
    text = editor.lineTextForBufferRow(row);
    return editor.indentLevelForLine(text);
  };

  WhiteSpaceRegExp = /^\s*$/;

  isAllWhiteSpace = function(text) {
    return WhiteSpaceRegExp.test(text);
  };

  getCodeFoldRowRanges = function(editor) {
    var _i, _ref1, _results;
    return (function() {
      _results = [];
      for (var _i = 0, _ref1 = editor.getLastBufferRow(); 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 0 <= _ref1 ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    });
  };

  getCodeFoldRowRangesContainesForRow = function(editor, bufferRow, exclusive) {
    if (exclusive == null) {
      exclusive = false;
    }
    return getCodeFoldRowRanges(editor).filter(function(_arg) {
      var endRow, startRow;
      startRow = _arg[0], endRow = _arg[1];
      if (exclusive) {
        return (startRow < bufferRow && bufferRow <= endRow);
      } else {
        return (startRow <= bufferRow && bufferRow <= endRow);
      }
    });
  };

  getBufferRangeForRowRange = function(editor, rowRange) {
    var rangeEnd, rangeStart, _ref1;
    _ref1 = rowRange.map(function(row) {
      return editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    }), rangeStart = _ref1[0], rangeEnd = _ref1[1];
    return rangeStart.union(rangeEnd);
  };

  getTokenizedLineForRow = function(editor, row) {
    return editor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(row);
  };

  getScopesForTokenizedLine = function(line) {
    var tag, _i, _len, _ref1, _results;
    _ref1 = line.tags;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      tag = _ref1[_i];
      if (tag < 0 && (tag % 2 === -1)) {
        _results.push(atom.grammars.scopeForId(tag));
      }
    }
    return _results;
  };

  scanForScopeStart = function(editor, fromPoint, direction, fn) {
    var column, continueScan, isValidToken, position, result, results, row, scanRows, scope, stop, tag, tokenIterator, tokenizedLine, _i, _j, _k, _len, _len1, _len2, _ref1;
    fromPoint = Point.fromObject(fromPoint);
    scanRows = (function() {
      var _i, _j, _ref1, _ref2, _ref3, _results, _results1;
      switch (direction) {
        case 'forward':
          return (function() {
            _results = [];
            for (var _i = _ref1 = fromPoint.row, _ref2 = editor.getLastBufferRow(); _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; _ref1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        case 'backward':
          return (function() {
            _results1 = [];
            for (var _j = _ref3 = fromPoint.row; _ref3 <= 0 ? _j <= 0 : _j >= 0; _ref3 <= 0 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    })();
    continueScan = true;
    stop = function() {
      return continueScan = false;
    };
    isValidToken = (function() {
      switch (direction) {
        case 'forward':
          return function(_arg) {
            var position;
            position = _arg.position;
            return position.isGreaterThan(fromPoint);
          };
        case 'backward':
          return function(_arg) {
            var position;
            position = _arg.position;
            return position.isLessThan(fromPoint);
          };
      }
    })();
    for (_i = 0, _len = scanRows.length; _i < _len; _i++) {
      row = scanRows[_i];
      if (!(tokenizedLine = getTokenizedLineForRow(editor, row))) {
        continue;
      }
      column = 0;
      results = [];
      tokenIterator = tokenizedLine.getTokenIterator();
      _ref1 = tokenizedLine.tags;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        tag = _ref1[_j];
        tokenIterator.next();
        if (tag > 0) {
          column += (function() {
            switch (false) {
              case !tokenIterator.isHardTab():
                return 1;
              case !tokenIterator.isSoftWrapIndentation():
                return 0;
              default:
                return tag;
            }
          })();
        } else if (tag % 2 === -1) {
          scope = atom.grammars.scopeForId(tag);
          position = new Point(row, column);
          results.push({
            scope: scope,
            position: position,
            stop: stop
          });
        }
      }
      results = results.filter(isValidToken);
      if (direction === 'backward') {
        results.reverse();
      }
      for (_k = 0, _len2 = results.length; _k < _len2; _k++) {
        result = results[_k];
        fn(result);
        if (!continueScan) {
          return;
        }
      }
      if (!continueScan) {
        return;
      }
    }
  };

  detectScopeStartPositionForScope = function(editor, fromPoint, direction, scope) {
    var point;
    point = null;
    scanForScopeStart(editor, fromPoint, direction, function(info) {
      if (info.scope.search(scope) >= 0) {
        info.stop();
        return point = info.position;
      }
    });
    return point;
  };

  isIncludeFunctionScopeForRow = function(editor, row) {
    var tokenizedLine;
    if (tokenizedLine = getTokenizedLineForRow(editor, row)) {
      return getScopesForTokenizedLine(tokenizedLine).some(function(scope) {
        return isFunctionScope(editor, scope);
      });
    } else {
      return false;
    }
  };

  isFunctionScope = function(editor, scope) {
    var scopeName;
    scopeName = editor.getGrammar().scopeName;
    switch (scopeName) {
      case 'source.go':
        return /^entity\.name\.function/.test(scope);
      default:
        return /^meta\.function\./.test(scope);
    }
  };

  getStartPositionForPattern = function(editor, from, pattern, options) {
    var containedOnly, point, scanRange, _ref1;
    if (options == null) {
      options = {};
    }
    from = Point.fromObject(from);
    containedOnly = (_ref1 = options.containedOnly) != null ? _ref1 : false;
    scanRange = [[from.row, 0], from];
    point = null;
    editor.backwardsScanInBufferRange(pattern, scanRange, function(_arg) {
      var matchText, range, stop;
      range = _arg.range, matchText = _arg.matchText, stop = _arg.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if ((!containedOnly) || range.end.isGreaterThanOrEqual(from)) {
        point = range.start;
        return stop();
      }
    });
    return point;
  };

  getEndPositionForPattern = function(editor, from, pattern, options) {
    var containedOnly, point, scanRange, _ref1;
    if (options == null) {
      options = {};
    }
    from = Point.fromObject(from);
    containedOnly = (_ref1 = options.containedOnly) != null ? _ref1 : false;
    scanRange = [from, [from.row, Infinity]];
    point = null;
    editor.scanInBufferRange(pattern, scanRange, function(_arg) {
      var matchText, range, stop;
      range = _arg.range, matchText = _arg.matchText, stop = _arg.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if ((!containedOnly) || range.start.isLessThanOrEqual(from)) {
        point = range.end;
        return stop();
      }
    });
    return point;
  };

  sortComparable = function(collection) {
    return collection.sort(function(a, b) {
      return a.compare(b);
    });
  };

  smartScrollToBufferPosition = function(editor, point) {
    var center, editorAreaHeight, editorElement, onePageDown, onePageUp, target;
    editorElement = getView(editor);
    editorAreaHeight = editor.getLineHeightInPixels() * (editor.getRowsPerPage() - 1);
    onePageUp = editorElement.getScrollTop() - editorAreaHeight;
    onePageDown = editorElement.getScrollBottom() + editorAreaHeight;
    target = editorElement.pixelPositionForBufferPosition(point).top;
    center = (onePageDown < target) || (target < onePageUp);
    return editor.scrollToBufferPosition(point, {
      center: center
    });
  };

  logGoalColumnForSelection = function(subject, selection) {
    return console.log("" + subject + ": goalColumn = ", selection.cursor.goalColumn);
  };

  reportSelection = function(subject, selection) {
    return console.log(subject, selection.getBufferRange().toString());
  };

  reportCursor = function(subject, cursor) {
    return console.log(subject, cursor.getBufferPosition().toString());
  };

  withTrackingCursorPositionChange = function(cursor, fn) {
    var cursorAfter, cursorBefore;
    cursorBefore = cursor.getBufferPosition();
    fn();
    cursorAfter = cursor.getBufferPosition();
    if (!cursorBefore.isEqual(cursorAfter)) {
      return console.log("Changed: " + (cursorBefore.toString()) + " -> " + (cursorAfter.toString()));
    }
  };

  registerElement = function(name, options) {
    var Element, element;
    element = document.createElement(name);
    if (element.constructor === HTMLElement) {
      Element = document.registerElement(name, options);
    } else {
      Element = element.constructor;
      if (options.prototype != null) {
        Element.prototype = options.prototype;
      }
    }
    return Element;
  };

  ElementBuilder = {
    includeInto: function(target) {
      var name, value, _results;
      _results = [];
      for (name in this) {
        value = this[name];
        if (name !== "includeInto") {
          _results.push(target.prototype[name] = value.bind(this));
        }
      }
      return _results;
    },
    div: function(params) {
      return this.createElement('div', params);
    },
    span: function(params) {
      return this.createElement('span', params);
    },
    atomTextEditor: function(params) {
      return this.createElement('atom-text-editor', params);
    },
    createElement: function(element, _arg) {
      var attribute, classList, id, name, textContent, value, _ref1, _ref2;
      classList = _arg.classList, textContent = _arg.textContent, id = _arg.id, attribute = _arg.attribute;
      element = document.createElement(element);
      if (id != null) {
        element.id = id;
      }
      if (classList != null) {
        (_ref1 = element.classList).add.apply(_ref1, classList);
      }
      if (textContent != null) {
        element.textContent = textContent;
      }
      _ref2 = attribute != null ? attribute : {};
      for (name in _ref2) {
        value = _ref2[name];
        element.setAttribute(name, value);
      }
      return element;
    }
  };

  module.exports = {
    getParent: getParent,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    getView: getView,
    saveEditorState: saveEditorState,
    getKeystrokeForEvent: getKeystrokeForEvent,
    getCharacterForEvent: getCharacterForEvent,
    isLinewiseRange: isLinewiseRange,
    isEndsWithNewLineForBufferRow: isEndsWithNewLineForBufferRow,
    haveSomeSelection: haveSomeSelection,
    sortRanges: sortRanges,
    sortRangesByEndPosition: sortRangesByEndPosition,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    withVisibleBufferRange: withVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
    eachSelection: eachSelection,
    eachCursor: eachCursor,
    bufferPositionForScreenPositionWithoutClip: bufferPositionForScreenPositionWithoutClip,
    screenPositionForBufferPositionWithoutClip: screenPositionForBufferPositionWithoutClip,
    getNewTextRangeFromCheckpoint: getNewTextRangeFromCheckpoint,
    findIndex: findIndex,
    mergeIntersectingRanges: mergeIntersectingRanges,
    pointIsAtEndOfLine: pointIsAtEndOfLine,
    pointIsAtVimEndOfFile: pointIsAtVimEndOfFile,
    cursorIsAtVimEndOfFile: cursorIsAtVimEndOfFile,
    getVimEofBufferPosition: getVimEofBufferPosition,
    getVimEofScreenPosition: getVimEofScreenPosition,
    getVimLastBufferRow: getVimLastBufferRow,
    getVimLastScreenRow: getVimLastScreenRow,
    moveCursorLeft: moveCursorLeft,
    moveCursorRight: moveCursorRight,
    moveCursorUp: moveCursorUp,
    moveCursorDown: moveCursorDown,
    getEolBufferPositionForRow: getEolBufferPositionForRow,
    getFirstVisibleScreenRow: getFirstVisibleScreenRow,
    getLastVisibleScreenRow: getLastVisibleScreenRow,
    highlightRanges: highlightRanges,
    getValidVimBufferRow: getValidVimBufferRow,
    getValidVimScreenRow: getValidVimScreenRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    countChar: countChar,
    clipScreenPositionForBufferPosition: clipScreenPositionForBufferPosition,
    getTextToPoint: getTextToPoint,
    getTextFromPointToEOL: getTextFromPointToEOL,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    isAllWhiteSpace: isAllWhiteSpace,
    getTextAtCursor: getTextAtCursor,
    getTextInScreenRange: getTextInScreenRange,
    cursorIsOnWhiteSpace: cursorIsOnWhiteSpace,
    getWordRegExpForPointWithCursor: getWordRegExpForPointWithCursor,
    pointIsBetweenWordAndNonWord: pointIsBetweenWordAndNonWord,
    pointIsSurroundedByWhitespace: pointIsSurroundedByWhitespace,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    cursorIsAtEmptyRow: cursorIsAtEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    getFirstCharacterColumForBufferRow: getFirstCharacterColumForBufferRow,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    getFirstCharacterBufferPositionForScreenRow: getFirstCharacterBufferPositionForScreenRow,
    cursorIsAtFirstCharacter: cursorIsAtFirstCharacter,
    isFunctionScope: isFunctionScope,
    getStartPositionForPattern: getStartPositionForPattern,
    getEndPositionForPattern: getEndPositionForPattern,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    getTokenizedLineForRow: getTokenizedLineForRow,
    getScopesForTokenizedLine: getScopesForTokenizedLine,
    scanForScopeStart: scanForScopeStart,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
    ElementBuilder: ElementBuilder,
    registerElement: registerElement,
    sortComparable: sortComparable,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    moveCursorDownBuffer: moveCursorDownBuffer,
    moveCursorUpBuffer: moveCursorUpBuffer,
    poliyFillsToTextBufferHistory: poliyFillsToTextBufferHistory,
    reportSelection: reportSelection,
    reportCursor: reportCursor,
    withTrackingCursorPositionChange: withTrackingCursorPositionChange,
    logGoalColumnForSelection: logGoalColumnForSelection
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2aUVBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFJQSxPQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxhQUFBLEtBQWIsRUFBb0IsYUFBQSxLQUpwQixDQUFBOztBQUFBLEVBS0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUxKLENBQUE7O0FBQUEsRUFPQSxTQUFBLEdBQVksU0FBQyxHQUFELEdBQUE7QUFDVixRQUFBLEtBQUE7a0RBQWEsQ0FBRSxxQkFETDtFQUFBLENBUFosQ0FBQTs7QUFBQSxFQVVBLFlBQUEsR0FBZSxTQUFDLEdBQUQsR0FBQTtBQUNiLFFBQUEsa0JBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxFQUFaLENBQUE7QUFBQSxJQUNBLFNBQVMsQ0FBQyxJQUFWLENBQWUsQ0FBQyxPQUFBLEdBQVEsR0FBVCxDQUFmLENBREEsQ0FBQTtBQUVBLFdBQU0sT0FBQSxHQUFVLFNBQUEsQ0FBVSxPQUFWLENBQWhCLEdBQUE7QUFDRSxNQUFBLFNBQVMsQ0FBQyxJQUFWLENBQWUsT0FBZixDQUFBLENBREY7SUFBQSxDQUZBO1dBSUEsVUFMYTtFQUFBLENBVmYsQ0FBQTs7QUFBQSxFQWlCQSx1QkFBQSxHQUEwQixTQUFDLE9BQUQsRUFBVSxJQUFWLEdBQUE7QUFDeEIsUUFBQSxpRkFBQTtBQUFBLElBRG1DLGNBQUQs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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/utils.coffee
