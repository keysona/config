(function() {
  var RegionRenderer;

  module.exports = RegionRenderer = (function() {
    function RegionRenderer() {}

    RegionRenderer.prototype.includeTextInRegion = false;

    RegionRenderer.prototype.renderRegions = function(colorMarker) {
      var displayBuffer, range, regions, row, rowSpan, _i, _ref, _ref1;
      range = colorMarker.getScreenRange();
      if (range.isEmpty()) {
        return [];
      }
      rowSpan = range.end.row - range.start.row;
      regions = [];
      displayBuffer = colorMarker.marker.displayBuffer;
      if (rowSpan === 0) {
        regions.push(this.createRegion(range.start, range.end, colorMarker));
      } else {
        regions.push(this.createRegion(range.start, {
          row: range.start.row,
          column: Infinity
        }, colorMarker, displayBuffer.screenLines[range.start.row]));
        if (rowSpan > 1) {
          for (row = _i = _ref = range.start.row + 1, _ref1 = range.end.row; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
            regions.push(this.createRegion({
              row: row,
              column: 0
            }, {
              row: row,
              column: Infinity
            }, colorMarker, displayBuffer.screenLines[row]));
          }
        }
        regions.push(this.createRegion({
          row: range.end.row,
          column: 0
        }, range.end, colorMarker, displayBuffer.screenLines[range.end.row]));
      }
      return regions;
    };

    RegionRenderer.prototype.createRegion = function(start, end, colorMarker, screenLine) {
      var bufferRange, charWidth, clippedEnd, clippedStart, css, displayBuffer, endPosition, lineHeight, name, needAdjustment, region, startPosition, text, textEditor, textEditorElement, value, _ref, _ref1;
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      displayBuffer = colorMarker.marker.displayBuffer;
      if (textEditorElement.component == null) {
        return;
      }
      lineHeight = textEditor.getLineHeightInPixels();
      charWidth = textEditor.getDefaultCharWidth();
      clippedStart = {
        row: start.row,
        column: (_ref = screenLine != null ? screenLine.clipScreenColumn(start.column) : void 0) != null ? _ref : start.column
      };
      clippedEnd = {
        row: end.row,
        column: (_ref1 = screenLine != null ? screenLine.clipScreenColumn(end.column) : void 0) != null ? _ref1 : end.column
      };
      bufferRange = displayBuffer.bufferRangeForScreenRange({
        start: clippedStart,
        end: clippedEnd
      });
      needAdjustment = (screenLine != null ? screenLine.isSoftWrapped() : void 0) && end.column >= (screenLine != null ? screenLine.text.length : void 0) - (screenLine != null ? screenLine.softWrapIndentationDelta : void 0);
      if (needAdjustment) {
        bufferRange.end.column++;
      }
      startPosition = textEditorElement.pixelPositionForScreenPosition(clippedStart);
      endPosition = textEditorElement.pixelPositionForScreenPosition(clippedEnd);
      text = displayBuffer.buffer.getTextInRange(bufferRange);
      css = {};
      css.left = startPosition.left;
      css.top = startPosition.top;
      css.width = endPosition.left - startPosition.left;
      if (needAdjustment) {
        css.width += charWidth;
      }
      css.height = lineHeight;
      region = document.createElement('div');
      region.className = 'region';
      if (this.includeTextInRegion) {
        region.textContent = text;
      }
      if (startPosition.left === endPosition.left) {
        region.invalid = true;
      }
      for (name in css) {
        value = css[name];
        region.style[name] = value + 'px';
      }
      return region;
    };

    return RegionRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvcmVnaW9uLXJlbmRlcmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxjQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtnQ0FDSjs7QUFBQSw2QkFBQSxtQkFBQSxHQUFxQixLQUFyQixDQUFBOztBQUFBLDZCQUVBLGFBQUEsR0FBZSxTQUFDLFdBQUQsR0FBQTtBQUNiLFVBQUEsNERBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxXQUFXLENBQUMsY0FBWixDQUFBLENBQVIsQ0FBQTtBQUNBLE1BQUEsSUFBYSxLQUFLLENBQUMsT0FBTixDQUFBLENBQWI7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQURBO0FBQUEsTUFHQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFWLEdBQWdCLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FIdEMsQ0FBQTtBQUFBLE1BSUEsT0FBQSxHQUFVLEVBSlYsQ0FBQTtBQUFBLE1BTUEsYUFBQSxHQUFnQixXQUFXLENBQUMsTUFBTSxDQUFDLGFBTm5DLENBQUE7QUFRQSxNQUFBLElBQUcsT0FBQSxLQUFXLENBQWQ7QUFDRSxRQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxLQUFLLENBQUMsS0FBcEIsRUFBMkIsS0FBSyxDQUFDLEdBQWpDLEVBQXNDLFdBQXRDLENBQWIsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsWUFBRCxDQUNYLEtBQUssQ0FBQyxLQURLLEVBRVg7QUFBQSxVQUNFLEdBQUEsRUFBSyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBRG5CO0FBQUEsVUFFRSxNQUFBLEVBQVEsUUFGVjtTQUZXLEVBTVgsV0FOVyxFQU9YLGFBQWEsQ0FBQyxXQUFZLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFaLENBUGYsQ0FBYixDQUFBLENBQUE7QUFTQSxRQUFBLElBQUcsT0FBQSxHQUFVLENBQWI7QUFDRSxlQUFXLHdJQUFYLEdBQUE7QUFDRSxZQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FDWDtBQUFBLGNBQUMsS0FBQSxHQUFEO0FBQUEsY0FBTSxNQUFBLEVBQVEsQ0FBZDthQURXLEVBRVg7QUFBQSxjQUFDLEtBQUEsR0FBRDtBQUFBLGNBQU0sTUFBQSxFQUFRLFFBQWQ7YUFGVyxFQUdYLFdBSFcsRUFJWCxhQUFhLENBQUMsV0FBWSxDQUFBLEdBQUEsQ0FKZixDQUFiLENBQUEsQ0FERjtBQUFBLFdBREY7U0FUQTtBQUFBLFFBa0JBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FDWDtBQUFBLFVBQUMsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBaEI7QUFBQSxVQUFxQixNQUFBLEVBQVEsQ0FBN0I7U0FEVyxFQUVYLEtBQUssQ0FBQyxHQUZLLEVBR1gsV0FIVyxFQUlYLGFBQWEsQ0FBQyxXQUFZLENBQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFWLENBSmYsQ0FBYixDQWxCQSxDQUhGO09BUkE7YUFvQ0EsUUFyQ2E7SUFBQSxDQUZmLENBQUE7O0FBQUEsNkJBeUNBLFlBQUEsR0FBYyxTQUFDLEtBQUQsRUFBUSxHQUFSLEVBQWEsV0FBYixFQUEwQixVQUExQixHQUFBO0FBQ1osVUFBQSxtTUFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBckMsQ0FBQTtBQUFBLE1BQ0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFVBQW5CLENBRHBCLENBQUE7QUFBQSxNQUVBLGFBQUEsR0FBZ0IsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUZuQyxDQUFBO0FBSUEsTUFBQSxJQUFjLG1DQUFkO0FBQUEsY0FBQSxDQUFBO09BSkE7QUFBQSxNQU1BLFVBQUEsR0FBYSxVQUFVLENBQUMscUJBQVgsQ0FBQSxDQU5iLENBQUE7QUFBQSxNQU9BLFNBQUEsR0FBWSxVQUFVLENBQUMsbUJBQVgsQ0FBQSxDQVBaLENBQUE7QUFBQSxNQVNBLFlBQUEsR0FBZTtBQUFBLFFBQ2IsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQURFO0FBQUEsUUFFYixNQUFBLG9HQUFxRCxLQUFLLENBQUMsTUFGOUM7T0FUZixDQUFBO0FBQUEsTUFhQSxVQUFBLEdBQWE7QUFBQSxRQUNYLEdBQUEsRUFBSyxHQUFHLENBQUMsR0FERTtBQUFBLFFBRVgsTUFBQSxvR0FBbUQsR0FBRyxDQUFDLE1BRjVDO09BYmIsQ0FBQTtBQUFBLE1Ba0JBLFdBQUEsR0FBYyxhQUFhLENBQUMseUJBQWQsQ0FBd0M7QUFBQSxRQUNwRCxLQUFBLEVBQU8sWUFENkM7QUFBQSxRQUVwRCxHQUFBLEVBQUssVUFGK0M7T0FBeEMsQ0FsQmQsQ0FBQTtBQUFBLE1BdUJBLGNBQUEseUJBQWlCLFVBQVUsQ0FBRSxhQUFaLENBQUEsV0FBQSxJQUFnQyxHQUFHLENBQUMsTUFBSiwwQkFBYyxVQUFVLENBQUUsSUFBSSxDQUFDLGdCQUFqQix5QkFBMEIsVUFBVSxDQUFFLGtDQXZCckcsQ0FBQTtBQXlCQSxNQUFBLElBQTRCLGNBQTVCO0FBQUEsUUFBQSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQWhCLEVBQUEsQ0FBQTtPQXpCQTtBQUFBLE1BMkJBLGFBQUEsR0FBZ0IsaUJBQWlCLENBQUMsOEJBQWxCLENBQWlELFlBQWpELENBM0JoQixDQUFBO0FBQUEsTUE0QkEsV0FBQSxHQUFjLGlCQUFpQixDQUFDLDhCQUFsQixDQUFpRCxVQUFqRCxDQTVCZCxDQUFBO0FBQUEsTUE4QkEsSUFBQSxHQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUMsY0FBckIsQ0FBb0MsV0FBcEMsQ0E5QlAsQ0FBQTtBQUFBLE1BZ0NBLEdBQUEsR0FBTSxFQWhDTixDQUFBO0FBQUEsTUFpQ0EsR0FBRyxDQUFDLElBQUosR0FBVyxhQUFhLENBQUMsSUFqQ3pCLENBQUE7QUFBQSxNQWtDQSxHQUFHLENBQUMsR0FBSixHQUFVLGFBQWEsQ0FBQyxHQWxDeEIsQ0FBQTtBQUFBLE1BbUNBLEdBQUcsQ0FBQyxLQUFKLEdBQVksV0FBVyxDQUFDLElBQVosR0FBbUIsYUFBYSxDQUFDLElBbkM3QyxDQUFBO0FBb0NBLE1BQUEsSUFBMEIsY0FBMUI7QUFBQSxRQUFBLEdBQUcsQ0FBQyxLQUFKLElBQWEsU0FBYixDQUFBO09BcENBO0FBQUEsTUFxQ0EsR0FBRyxDQUFDLE1BQUosR0FBYSxVQXJDYixDQUFBO0FBQUEsTUF1Q0EsTUFBQSxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBdkNULENBQUE7QUFBQSxNQXdDQSxNQUFNLENBQUMsU0FBUCxHQUFtQixRQXhDbkIsQ0FBQTtBQXlDQSxNQUFBLElBQTZCLElBQUMsQ0FBQSxtQkFBOUI7QUFBQSxRQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLElBQXJCLENBQUE7T0F6Q0E7QUEwQ0EsTUFBQSxJQUF5QixhQUFhLENBQUMsSUFBZCxLQUFzQixXQUFXLENBQUMsSUFBM0Q7QUFBQSxRQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQWpCLENBQUE7T0ExQ0E7QUEyQ0EsV0FBQSxXQUFBOzBCQUFBO0FBQUEsUUFBQSxNQUFNLENBQUMsS0FBTSxDQUFBLElBQUEsQ0FBYixHQUFxQixLQUFBLEdBQVEsSUFBN0IsQ0FBQTtBQUFBLE9BM0NBO2FBNkNBLE9BOUNZO0lBQUEsQ0F6Q2QsQ0FBQTs7MEJBQUE7O01BRkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/key/.atom/packages/pigments/lib/renderers/region-renderer.coffee
