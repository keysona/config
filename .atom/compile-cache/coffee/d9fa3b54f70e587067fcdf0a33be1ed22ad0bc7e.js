(function() {
  var DotRenderer;

  module.exports = DotRenderer = (function() {
    function DotRenderer() {}

    DotRenderer.prototype.render = function(colorMarker) {
      var charWidth, color, column, displayBuffer, index, lineHeight, markers, pixelPosition, range, screenLine, textEditor, textEditorElement;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (color == null) {
        return {};
      }
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      displayBuffer = colorMarker.marker.displayBuffer;
      charWidth = displayBuffer.getDefaultCharWidth();
      markers = colorMarker.colorBuffer.getMarkerLayer().findMarkers({
        type: 'pigments-color',
        intersectsScreenRowRange: [range.end.row, range.end.row]
      });
      index = markers.indexOf(colorMarker.marker);
      screenLine = displayBuffer.screenLines[range.end.row];
      if (screenLine == null) {
        return {};
      }
      lineHeight = textEditor.getLineHeightInPixels();
      column = (screenLine.getMaxScreenColumn() + 1) * charWidth;
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

    return DotRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZW5kZXJlcnMvZG90LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTs2QkFDSjs7QUFBQSwwQkFBQSxNQUFBLEdBQVEsU0FBQyxXQUFELEdBQUE7QUFDTixVQUFBLG9JQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsV0FBVyxDQUFDLGNBQVosQ0FBQSxDQUFSLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxXQUFXLENBQUMsS0FGcEIsQ0FBQTtBQUlBLE1BQUEsSUFBaUIsYUFBakI7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQUpBO0FBQUEsTUFNQSxVQUFBLEdBQWEsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQU5yQyxDQUFBO0FBQUEsTUFPQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsVUFBbkIsQ0FQcEIsQ0FBQTtBQUFBLE1BUUEsYUFBQSxHQUFnQixXQUFXLENBQUMsTUFBTSxDQUFDLGFBUm5DLENBQUE7QUFBQSxNQVNBLFNBQUEsR0FBWSxhQUFhLENBQUMsbUJBQWQsQ0FBQSxDQVRaLENBQUE7QUFBQSxNQVdBLE9BQUEsR0FBVSxXQUFXLENBQUMsV0FBVyxDQUFDLGNBQXhCLENBQUEsQ0FBd0MsQ0FBQyxXQUF6QyxDQUFxRDtBQUFBLFFBQzdELElBQUEsRUFBTSxnQkFEdUQ7QUFBQSxRQUU3RCx3QkFBQSxFQUEwQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBWCxFQUFnQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTFCLENBRm1DO09BQXJELENBWFYsQ0FBQTtBQUFBLE1BZ0JBLEtBQUEsR0FBUSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFXLENBQUMsTUFBNUIsQ0FoQlIsQ0FBQTtBQUFBLE1BaUJBLFVBQUEsR0FBYSxhQUFhLENBQUMsV0FBWSxDQUFBLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBVixDQWpCdkMsQ0FBQTtBQW1CQSxNQUFBLElBQWlCLGtCQUFqQjtBQUFBLGVBQU8sRUFBUCxDQUFBO09BbkJBO0FBQUEsTUFxQkEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxxQkFBWCxDQUFBLENBckJiLENBQUE7QUFBQSxNQXNCQSxNQUFBLEdBQVMsQ0FBQyxVQUFVLENBQUMsa0JBQVgsQ0FBQSxDQUFBLEdBQWtDLENBQW5DLENBQUEsR0FBd0MsU0F0QmpELENBQUE7QUFBQSxNQXVCQSxhQUFBLEdBQWdCLGlCQUFpQixDQUFDLDhCQUFsQixDQUFpRCxLQUFLLENBQUMsR0FBdkQsQ0F2QmhCLENBQUE7YUF5QkE7QUFBQSxRQUFBLE9BQUEsRUFBTyxLQUFQO0FBQUEsUUFDQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLGVBQUEsRUFBaUIsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFqQjtBQUFBLFVBQ0EsR0FBQSxFQUFLLENBQUMsYUFBYSxDQUFDLEdBQWQsR0FBb0IsVUFBQSxHQUFhLENBQWxDLENBQUEsR0FBdUMsSUFENUM7QUFBQSxVQUVBLElBQUEsRUFBTSxDQUFDLE1BQUEsR0FBUyxLQUFBLEdBQVEsRUFBbEIsQ0FBQSxHQUF3QixJQUY5QjtTQUZGO1FBMUJNO0lBQUEsQ0FBUixDQUFBOzt1QkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/pigments/lib/renderers/dot.coffee
