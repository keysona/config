(function() {
  var cubes, list, math, num, number, opposite, race, square,
    __slice = [].slice;

  number = 42;

  opposite = true;

  if (opposite) {
    number = -42;
  }

  square = function(x) {
    return x * x;
  };

  list = [1, 2, 3, 4, 5];

  math = {
    root: Math.sqrt,
    square: square,
    cube: function(x) {
      return x * square(x);
    }
  };

  race = function() {
    var runners, winner;
    winner = arguments[0], runners = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return print(winner, runners);
  };

  if (typeof elvis !== "undefined" && elvis !== null) {
    alert("I knew it!");
  }

  cubes = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      num = list[_i];
      _results.push(math.cube(num));
    }
    return _results;
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL3NldGktc3ludGF4L3NhbXBsZS1maWxlcy9Db2ZmZVNjcmlwdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsc0RBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLE1BQUEsR0FBVyxFQUFYLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsSUFEWCxDQUFBOztBQUlBLEVBQUEsSUFBZ0IsUUFBaEI7QUFBQSxJQUFBLE1BQUEsR0FBUyxDQUFBLEVBQVQsQ0FBQTtHQUpBOztBQUFBLEVBT0EsTUFBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO1dBQU8sQ0FBQSxHQUFJLEVBQVg7RUFBQSxDQVBULENBQUE7O0FBQUEsRUFVQSxJQUFBLEdBQU8sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixDQVZQLENBQUE7O0FBQUEsRUFhQSxJQUFBLEdBQ0U7QUFBQSxJQUFBLElBQUEsRUFBUSxJQUFJLENBQUMsSUFBYjtBQUFBLElBQ0EsTUFBQSxFQUFRLE1BRFI7QUFBQSxJQUVBLElBQUEsRUFBUSxTQUFDLENBQUQsR0FBQTthQUFPLENBQUEsR0FBSSxNQUFBLENBQU8sQ0FBUCxFQUFYO0lBQUEsQ0FGUjtHQWRGLENBQUE7O0FBQUEsRUFtQkEsSUFBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFFBQUEsZUFBQTtBQUFBLElBRE0sdUJBQVEsaUVBQ2QsQ0FBQTtXQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsT0FBZCxFQURLO0VBQUEsQ0FuQlAsQ0FBQTs7QUF1QkEsRUFBQSxJQUFzQiw4Q0FBdEI7QUFBQSxJQUFBLEtBQUEsQ0FBTSxZQUFOLENBQUEsQ0FBQTtHQXZCQTs7QUFBQSxFQTBCQSxLQUFBOztBQUFTO1NBQUEsMkNBQUE7cUJBQUE7QUFBQSxvQkFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBQSxDQUFBO0FBQUE7O01BMUJULENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/key/.atom/packages/seti-syntax/sample-files/CoffeScript.coffee
