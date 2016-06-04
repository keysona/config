(function() {
  var DotRenderer;

  module.exports = DotRenderer = (function() {
    function DotRenderer() {}

    DotRenderer.prototype.render = function(colorMarker) {
      var charWidth, color, column, index, lineHeight, markers, pixelPosition, range, screenLine, textEditor, textEditorElement;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (color == null) {
        return {};
      }
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      charWidth = textEditor.getDefaultCharWidth();
      markers = colorMarker.colorBuffer.getMarkerLayer().findMarkers({
        type: 'pigments-color',
        intersectsScreenRowRange: [range.end.row, range.end.row]
      });
      index = markers.indexOf(colorMarker.marker);
      screenLine = this.screenLineForScreenRow(textEditor, range.end.row);
      if (screenLine == null) {
        return {};
      }
      lineHeight = textEditor.getLineHeightInPixels();
      column = this.getLineLastColumn(screenLine) * charWidth;
      pixelPosition = textEditorElement.pixelPositionForScreenPosition(range.end);
      return {
        "class": 'dot',
        style: {
          backgroundColor: color.toCSS(),
          top: (pixelPosition.top + lineHeight / 2) + 'px',
          left: (column + index * 18) + 'px'
        }
      };
    };

    DotRenderer.prototype.getLineLastColumn = function(line) {
      if (line.lineText != null) {
        return line.lineText.length + 1;
      } else {
        return line.getMaxScreenColumn() + 1;
      }
    };

    DotRenderer.prototype.screenLineForScreenRow = function(textEditor, row) {
      if (textEditor.screenLineForScreenRow != null) {
        return textEditor.screenLineForScreenRow(row);
      } else {
        return textEditor.displayBuffer.screenLines[row];
      }
    };

    return DotRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvZG90LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTs2QkFDSjs7QUFBQSwwQkFBQSxNQUFBLEdBQVEsU0FBQyxXQUFELEdBQUE7QUFDTixVQUFBLHFIQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsV0FBVyxDQUFDLGNBQVosQ0FBQSxDQUFSLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxXQUFXLENBQUMsS0FGcEIsQ0FBQTtBQUlBLE1BQUEsSUFBaUIsYUFBakI7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQUpBO0FBQUEsTUFNQSxVQUFBLEdBQWEsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQU5yQyxDQUFBO0FBQUEsTUFPQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsVUFBbkIsQ0FQcEIsQ0FBQTtBQUFBLE1BUUEsU0FBQSxHQUFZLFVBQVUsQ0FBQyxtQkFBWCxDQUFBLENBUlosQ0FBQTtBQUFBLE1BVUEsT0FBQSxHQUFVLFdBQVcsQ0FBQyxXQUFXLENBQUMsY0FBeEIsQ0FBQSxDQUF3QyxDQUFDLFdBQXpDLENBQXFEO0FBQUEsUUFDN0QsSUFBQSxFQUFNLGdCQUR1RDtBQUFBLFFBRTdELHdCQUFBLEVBQTBCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFYLEVBQWdCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBMUIsQ0FGbUM7T0FBckQsQ0FWVixDQUFBO0FBQUEsTUFlQSxLQUFBLEdBQVEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBVyxDQUFDLE1BQTVCLENBZlIsQ0FBQTtBQUFBLE1BZ0JBLFVBQUEsR0FBYSxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsVUFBeEIsRUFBb0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUE5QyxDQWhCYixDQUFBO0FBa0JBLE1BQUEsSUFBaUIsa0JBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FsQkE7QUFBQSxNQW9CQSxVQUFBLEdBQWEsVUFBVSxDQUFDLHFCQUFYLENBQUEsQ0FwQmIsQ0FBQTtBQUFBLE1BcUJBLE1BQUEsR0FBUyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsVUFBbkIsQ0FBQSxHQUFpQyxTQXJCMUMsQ0FBQTtBQUFBLE1Bc0JBLGFBQUEsR0FBZ0IsaUJBQWlCLENBQUMsOEJBQWxCLENBQWlELEtBQUssQ0FBQyxHQUF2RCxDQXRCaEIsQ0FBQTthQXdCQTtBQUFBLFFBQUEsT0FBQSxFQUFPLEtBQVA7QUFBQSxRQUNBLEtBQUEsRUFDRTtBQUFBLFVBQUEsZUFBQSxFQUFpQixLQUFLLENBQUMsS0FBTixDQUFBLENBQWpCO0FBQUEsVUFDQSxHQUFBLEVBQUssQ0FBQyxhQUFhLENBQUMsR0FBZCxHQUFvQixVQUFBLEdBQWEsQ0FBbEMsQ0FBQSxHQUF1QyxJQUQ1QztBQUFBLFVBRUEsSUFBQSxFQUFNLENBQUMsTUFBQSxHQUFTLEtBQUEsR0FBUSxFQUFsQixDQUFBLEdBQXdCLElBRjlCO1NBRkY7UUF6Qk07SUFBQSxDQUFSLENBQUE7O0FBQUEsMEJBK0JBLGlCQUFBLEdBQW1CLFNBQUMsSUFBRCxHQUFBO0FBQ2pCLE1BQUEsSUFBRyxxQkFBSDtlQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBZCxHQUF1QixFQUR6QjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsa0JBQUwsQ0FBQSxDQUFBLEdBQTRCLEVBSDlCO09BRGlCO0lBQUEsQ0EvQm5CLENBQUE7O0FBQUEsMEJBcUNBLHNCQUFBLEdBQXdCLFNBQUMsVUFBRCxFQUFhLEdBQWIsR0FBQTtBQUN0QixNQUFBLElBQUcseUNBQUg7ZUFDRSxVQUFVLENBQUMsc0JBQVgsQ0FBa0MsR0FBbEMsRUFERjtPQUFBLE1BQUE7ZUFHRSxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVksQ0FBQSxHQUFBLEVBSHZDO09BRHNCO0lBQUEsQ0FyQ3hCLENBQUE7O3VCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/pigments/lib/renderers/dot.coffee
