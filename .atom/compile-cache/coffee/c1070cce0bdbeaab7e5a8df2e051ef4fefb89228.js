(function() {
  describe('Pretty JSON', function() {
    var PrettyJSON;
    PrettyJSON = [][0];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-json');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-gfm');
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('pretty-json').then(function(pack) {
          return PrettyJSON = pack.mainModule;
        });
      });
    });
    describe('when prettifying large data file', function() {
      return it('does not crash', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('large.json').then(function(editor) {
            return PrettyJSON.prettify(editor, false);
          });
        });
      });
    });
    describe('when prettifying large integers', function() {
      return it('does not truncate integers', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('bigint.json').then(function(editor) {
            PrettyJSON.prettify(editor, false);
            return expect(editor.getText()).toBe("{\n  \"bigint\": 6926665213734576388,\n  \"float\": 1.23456e-10\n}");
          });
        });
      });
    });
    describe('when no text is selected', function() {
      return it('does not change anything', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('valid.md').then(function(editor) {
            PrettyJSON.prettify(editor, false);
            return expect(editor.getText()).toBe("Start\n{ \"c\": \"d\", \"a\": \"b\" }\nEnd\n");
          });
        });
      });
    });
    describe('when a valid json text is selected', function() {
      return it('formats it correctly', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('valid.md').then(function(editor) {
            editor.setSelectedBufferRange([[1, 0], [1, 22]]);
            PrettyJSON.prettify(editor, false);
            return expect(editor.getText()).toBe("Start\n{\n  \"c\": \"d\",\n  \"a\": \"b\"\n}\nEnd\n");
          });
        });
      });
    });
    describe('when an invalid json text is selected', function() {
      return it('does not change anything', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('invalid.md').then(function(editor) {
            editor.setSelectedBufferRange([[1, 0], [1, 2]]);
            PrettyJSON.prettify(editor, false);
            return expect(editor.getText()).toBe("Start\n{]\nEnd\n");
          });
        });
      });
    });
    describe('JSON file with invalid JSON', function() {
      return it('does not change anything', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('invalid.json').then(function(editor) {
            PrettyJSON.prettify(editor, false);
            return expect(editor.getText()).toBe("{ \"c\": \"d\", \"a\": \"b\", }\n");
          });
        });
      });
    });
    describe('JSON file with valid JSON', function() {
      return it('formats the whole file correctly', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('valid.json').then(function(editor) {
            PrettyJSON.prettify(editor, false);
            return expect(editor.getText()).toBe("{\n  \"c\": \"d\",\n  \"a\": \"b\"\n}");
          });
        });
      });
    });
    describe('Sort and prettify JSON file with invalid JSON', function() {
      return it('does not change anything', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('invalid.json').then(function(editor) {
            PrettyJSON.prettify(editor, true);
            return expect(editor.getText()).toBe("{ \"c\": \"d\", \"a\": \"b\", }\n");
          });
        });
      });
    });
    describe('Sort and prettify JSON file with valid JSON', function() {
      return it('formats the whole file correctly', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('valid.json').then(function(editor) {
            PrettyJSON.prettify(editor, true);
            return expect(editor.getText()).toBe("{\n  \"a\": \"b\",\n  \"c\": \"d\"\n}");
          });
        });
      });
    });
    describe('Minify JSON file with invalid JSON', function() {
      return it('does not change anything', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('invalid.json').then(function(editor) {
            PrettyJSON.minify(editor, false);
            return expect(editor.getText()).toBe("{ \"c\": \"d\", \"a\": \"b\", }\n");
          });
        });
      });
    });
    describe('Minify JSON file with valid JSON', function() {
      return it('formats the whole file correctly', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('valid.json').then(function(editor) {
            PrettyJSON.minify(editor, false);
            return expect(editor.getText()).toBe("{\"c\":\"d\",\"a\":\"b\"}");
          });
        });
      });
    });
    describe('Minify selected JSON', function() {
      return it('Minifies JSON data', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('valid.md').then(function(editor) {
            editor.setSelectedBufferRange([[1, 0], [1, 22]]);
            PrettyJSON.minify(editor, false);
            return expect(editor.getText()).toBe("Start\n{\"c\":\"d\",\"a\":\"b\" }\nEnd\n");
          });
        });
      });
    });
    describe('JSON file with valid JavaScript Object Literal', function() {
      return it('jsonifies file correctly', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('object.json').then(function(editor) {
            PrettyJSON.jsonify(editor, false);
            return expect(editor.getText()).toBe("{\n  \"c\": 3,\n  \"a\": 1\n}");
          });
        });
      });
    });
    return describe('JSON file with valid JavaScript Object Literal', function() {
      return it('jsonifies and sorts file correctly', function() {
        return waitsForPromise(function() {
          return atom.workspace.open('object.json').then(function(editor) {
            PrettyJSON.jsonify(editor, true);
            return expect(editor.getText()).toBe("{\n  \"a\": 1,\n  \"c\": 3\n}");
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3ByZXR0eS1qc29uL3NwZWMvaW5kZXgtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsVUFBQTtBQUFBLElBQUMsYUFBYyxLQUFmLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGVBQTlCLEVBQUg7TUFBQSxDQUFoQixDQUFBLENBQUE7QUFBQSxNQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGNBQTlCLEVBQUg7TUFBQSxDQUFoQixDQURBLENBQUE7YUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixhQUE5QixDQUE0QyxDQUFDLElBQTdDLENBQWtELFNBQUMsSUFBRCxHQUFBO2lCQUNoRCxVQUFBLEdBQWEsSUFBSSxDQUFDLFdBRDhCO1FBQUEsQ0FBbEQsRUFEYztNQUFBLENBQWhCLEVBSFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBU0EsUUFBQSxDQUFTLGtDQUFULEVBQTZDLFNBQUEsR0FBQTthQUMzQyxFQUFBLENBQUcsZ0JBQUgsRUFBcUIsU0FBQSxHQUFBO2VBQ25CLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixZQUFwQixDQUNFLENBQUMsSUFESCxDQUNRLFNBQUMsTUFBRCxHQUFBO21CQUNKLFVBQVUsQ0FBQyxRQUFYLENBQW9CLE1BQXBCLEVBQTRCLEtB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

//# sourceURL=/home/key/.atom/packages/pretty-json/spec/index-spec.coffee
