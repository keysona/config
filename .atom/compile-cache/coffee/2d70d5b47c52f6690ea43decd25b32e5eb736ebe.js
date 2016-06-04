(function() {
  var Disposable, ElementBuilder, Point, Range, WhiteSpaceRegExp, bufferPositionForScreenPositionWithoutClip, clipScreenPositionForBufferPosition, countChar, cursorIsAtEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionForScope, eachCursor, eachSelection, findIndex, fs, getAncestors, getBufferRangeForRowRange, getBufferRows, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndPositionForPattern, getEolBufferPositionForRow, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterColumForBufferRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getKeystrokeForEvent, getLastVisibleScreenRow, getNewTextRangeFromCheckpoint, getParent, getScopesForTokenizedLine, getStartPositionForPattern, getTextAtCursor, getTextFromPointToEOL, getTextInScreenRange, getTextToPoint, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getView, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordRegExpForPointWithCursor, haveSomeSelection, highlightRanges, include, isAllWhiteSpace, isEndsWithNewLineForBufferRow, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, keystrokeToCharCode, logGoalColumnForSelection, markerOptions, mergeIntersectingRanges, moveCursor, moveCursorDown, moveCursorDownBuffer, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, moveCursorUpBuffer, normalizePatchChanges, pointIsAtEndOfLine, pointIsAtVimEndOfFile, pointIsBetweenWordAndNonWord, pointIsSurroundedByWhitespace, poliyFillsToTextBufferHistory, registerElement, reportCursor, reportSelection, saveEditorState, scanForScopeStart, screenPositionForBufferPositionWithoutClip, settings, shouldPreventWrapLine, smartScrollToBufferPosition, sortComparable, sortRanges, sortRangesByEndPosition, withTrackingCursorPositionChange, withVisibleBufferRange, _, _ref;

  fs = require('fs-plus');

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxaUVBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsa0JBQUEsVUFBRCxFQUFhLGFBQUEsS0FBYixFQUFvQixhQUFBLEtBSHBCLENBQUE7O0FBQUEsRUFJQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBWSxTQUFDLEdBQUQsR0FBQTtBQUNWLFFBQUEsS0FBQTtrREFBYSxDQUFFLHFCQURMO0VBQUEsQ0FOWixDQUFBOztBQUFBLEVBU0EsWUFBQSxHQUFlLFNBQUMsR0FBRCxHQUFBO0FBQ2IsUUFBQSxrQkFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUFBLElBQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxDQUFDLE9BQUEsR0FBUSxHQUFULENBQWYsQ0FEQSxDQUFBO0FBRUEsV0FBTSxPQUFBLEdBQVUsU0FBQSxDQUFVLE9BQVYsQ0FBaEIsR0FBQTtBQUNFLE1BQUEsU0FBUyxDQUFDLElBQVYsQ0FBZSxPQUFmLENBQUEsQ0FERjtJQUFBLENBRkE7V0FJQSxVQUxhO0VBQUEsQ0FUZixDQUFBOztBQUFBLEVBZ0JBLHVCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLElBQVYsR0FBQTtBQUN4QixRQUFBLGlGQUFBO0FBQUEsSUFEbUMsY0FBRCxLQUFDLFdBQ25DLENBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/utils.coffee
