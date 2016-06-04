(function() {
  var Disposable, ElementBuilder, Point, Range, WhiteSpaceRegExp, clipScreenPositionForBufferPosition, countChar, cursorIsAtEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionForScope, eachCursor, eachSelection, findIndex, fs, getAllFoldMarkers, getAncestors, getBufferRangeForRowRange, getBufferRows, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndPositionForPattern, getEolBufferPositionForRow, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterColumForBufferRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getKeystrokeForEvent, getLastVisibleScreenRow, getNewTextRangeFromCheckpoint, getParent, getScopesForTokenizedLine, getStartPositionForPattern, getTextAtCursor, getTextFromPointToEOL, getTextInScreenRange, getTextToPoint, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getView, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordRegExpForPointWithCursor, haveSomeSelection, highlightRanges, include, isAllWhiteSpace, isEndsWithNewLineForBufferRow, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, keystrokeToCharCode, logGoalColumnForSelection, matchScopes, mergeIntersectingRanges, moveCursor, moveCursorDown, moveCursorDownBuffer, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, moveCursorUpBuffer, normalizePatchChanges, pointIsAtEndOfLine, pointIsAtVimEndOfFile, pointIsBetweenWordAndNonWord, pointIsSurroundedByWhitespace, registerElement, reportCursor, reportSelection, saveEditorState, scanForScopeStart, settings, shouldPreventWrapLine, smartScrollToBufferPosition, sortComparable, sortRanges, sortRangesByEndPosition, withTrackingCursorPositionChange, withVisibleBufferRange, _, _ref;

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

  getAllFoldMarkers = function(editor) {
    var finder, _ref1;
    finder = (_ref1 = editor.displayLayer) != null ? _ref1 : editor.displayBuffer;
    return finder.findFoldMarkers({});
  };

  saveEditorState = function(editor) {
    var editorElement, foldStartRows, scrollTop;
    editorElement = getView(editor);
    scrollTop = editorElement.getScrollTop();
    foldStartRows = getAllFoldMarkers(editor).map(function(m) {
      return m.getStartPosition().row;
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

  highlightRanges = function(editor, ranges, options) {
    var decorateOptions, invalidate, marker, markers, range, timeout, _i, _len, _ref1;
    if (!_.isArray(ranges)) {
      ranges = [ranges];
    }
    if (!ranges.length) {
      return null;
    }
    invalidate = (_ref1 = options.invalidate) != null ? _ref1 : 'never';
    markers = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ranges.length; _i < _len; _i++) {
        range = ranges[_i];
        _results.push(editor.markBufferRange(range, {
          invalidate: invalidate
        }));
      }
      return _results;
    })();
    decorateOptions = {
      type: 'highlight',
      "class": options["class"]
    };
    for (_i = 0, _len = markers.length; _i < _len; _i++) {
      marker = markers[_i];
      editor.decorateMarker(marker, decorateOptions);
    }
    timeout = options.timeout;
    if (timeout != null) {
      setTimeout(function() {
        return _.invoke(markers, 'destroy');
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
    var tokenizedBuffer, _ref1;
    tokenizedBuffer = (_ref1 = editor.tokenizedBuffer) != null ? _ref1 : editor.displayBuffer.tokenizedBuffer;
    return tokenizedBuffer.tokenizedLineForRow(row);
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
        if (tag < 0) {
          scope = atom.grammars.scopeForId(tag);
          if ((tag % 2) === 0) {
            null;
          } else {
            position = new Point(row, column);
            results.push({
              scope: scope,
              position: position,
              stop: stop
            });
          }
        } else {
          if (tokenIterator.isHardTab != null) {
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
          } else {
            column += tag;
          }
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

  matchScopes = function(editorElement, scopes) {
    var className, classNames, classes, containsCount, _i, _j, _len, _len1;
    classes = scopes.map(function(scope) {
      return scope.split('.');
    });
    for (_i = 0, _len = classes.length; _i < _len; _i++) {
      classNames = classes[_i];
      containsCount = 0;
      for (_j = 0, _len1 = classNames.length; _j < _len1; _j++) {
        className = classNames[_j];
        if (editorElement.classList.contains(className)) {
          containsCount += 1;
        }
      }
      if (containsCount === classNames.length) {
        return true;
      }
    }
    return false;
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
    matchScopes: matchScopes,
    moveCursorDownBuffer: moveCursorDownBuffer,
    moveCursorUpBuffer: moveCursorUpBuffer,
    reportSelection: reportSelection,
    reportCursor: reportCursor,
    withTrackingCursorPositionChange: withTrackingCursorPositionChange,
    logGoalColumnForSelection: logGoalColumnForSelection
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrN0RBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLE9BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsa0JBQUEsVUFBRCxFQUFhLGFBQUEsS0FBYixFQUFvQixhQUFBLEtBSHBCLENBQUE7O0FBQUEsRUFJQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSkosQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBWSxTQUFDLEdBQUQsR0FBQTtBQUNWLFFBQUEsS0FBQTtrREFBYSxDQUFFLHFCQURMO0VBQUEsQ0FOWixDQUFBOztBQUFBLEVBU0EsWUFBQSxHQUFlLFNBQUMsR0FBRCxHQUFBO0FBQ2IsUUFBQSxrQkFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUFBLElBQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxDQUFDLE9BQUEsR0FBUSxHQUFULENBQWYsQ0FEQSxDQUFBO0FBRUEsV0FBTSxPQUFBLEdBQVUsU0FBQSxDQUFVLE9BQVYsQ0FBaEIsR0FBQTtBQUNFLE1BQUEsU0FBUyxDQUFDLElBQVYsQ0FBZSxPQUFmLENBQUEsQ0FERjtJQUFBLENBRkE7V0FJQSxVQUxhO0VBQUEsQ0FUZixDQUFBOztBQUFBLEVBZ0JBLHVCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLElBQVYsR0FBQTtBQUN4QixRQUFBLGlGQUFBO0FBQUEsSUFEbUMsY0FBRCxLQUFDLFdBQ25DLENBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7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

//# sourceURL=/home/key/.atom/packages/vim-mode-plus/lib/utils.coffee
