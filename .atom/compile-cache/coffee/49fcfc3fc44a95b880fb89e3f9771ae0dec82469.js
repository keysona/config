(function() {
  module.exports = {
    autoToggle: {
      title: "Auto Toggle",
      description: "Toggle on start.",
      type: "boolean",
      "default": true
    },
    screenShake: {
      type: "object",
      properties: {
        minIntensity: {
          title: "Screen Shake - Minimum Intensity",
          description: "The minimum (randomized) intensity of the shake.",
          type: "integer",
          "default": 1,
          minimum: 0,
          maximum: 100
        },
        maxIntensity: {
          title: "Screen Shake - Maximum Intensity",
          description: "The maximum (randomized) intensity of the shake.",
          type: "integer",
          "default": 3,
          minimum: 0,
          maximum: 100
        },
        enabled: {
          title: "Screen Shake - Enabled",
          description: "Turn the shaking on/off.",
          type: "boolean",
          "default": true
        }
      }
    },
    particles: {
      type: "object",
      properties: {
        enabled: {
          title: "Particles - Enabled",
          description: "Turn the particles on/off.",
          type: "boolean",
          "default": true
        },
        totalCount: {
          type: "object",
          properties: {
            max: {
              title: "Particles - Max Total",
              description: "The maximum total number of particles on the screen.",
              type: "integer",
              "default": 500,
              minimum: 0
            }
          }
        },
        spawnCount: {
          type: "object",
          properties: {
            min: {
              title: "Particles - Minimum Spawned",
              description: "The minimum (randomized) number of particles spawned on input.",
              type: "integer",
              "default": 5
            },
            max: {
              title: "Particles - Maximum Spawned",
              description: "The maximum (randomized) number of particles spawned on input.",
              type: "integer",
              "default": 15
            }
          }
        },
        size: {
          type: "object",
          properties: {
            min: {
              title: "Particles - Minimum Size",
              description: "The minimum (randomized) size of the particles.",
              type: "integer",
              "default": 2,
              minimum: 0
            },
            max: {
              title: "Particles - Maximum Size",
              description: "The maximum (randomized) size of the particles.",
              type: "integer",
              "default": 4,
              minimum: 0
            }
          }
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUva2V5Ly5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL2NvbmZpZy1zY2hlbWEuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFVBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLGFBQVA7QUFBQSxNQUNBLFdBQUEsRUFBYSxrQkFEYjtBQUFBLE1BRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxNQUdBLFNBQUEsRUFBUyxJQUhUO0tBREY7QUFBQSxJQU1BLFdBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxNQUNBLFVBQUEsRUFDRTtBQUFBLFFBQUEsWUFBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sa0NBQVA7QUFBQSxVQUNBLFdBQUEsRUFBYSxrREFEYjtBQUFBLFVBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxVQUdBLFNBQUEsRUFBUyxDQUhUO0FBQUEsVUFJQSxPQUFBLEVBQVMsQ0FKVDtBQUFBLFVBS0EsT0FBQSxFQUFTLEdBTFQ7U0FERjtBQUFBLFFBUUEsWUFBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sa0NBQVA7QUFBQSxVQUNBLFdBQUEsRUFBYSxrREFEYjtBQUFBLFVBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxVQUdBLFNBQUEsRUFBUyxDQUhUO0FBQUEsVUFJQSxPQUFBLEVBQVMsQ0FKVDtBQUFBLFVBS0EsT0FBQSxFQUFTLEdBTFQ7U0FURjtBQUFBLFFBZ0JBLE9BQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLHdCQUFQO0FBQUEsVUFDQSxXQUFBLEVBQWEsMEJBRGI7QUFBQSxVQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsVUFHQSxTQUFBLEVBQVMsSUFIVDtTQWpCRjtPQUZGO0tBUEY7QUFBQSxJQStCQSxTQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsTUFDQSxVQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLHFCQUFQO0FBQUEsVUFDQSxXQUFBLEVBQWEsNEJBRGI7QUFBQSxVQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsVUFHQSxTQUFBLEVBQVMsSUFIVDtTQURGO0FBQUEsUUFNQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsVUFDQSxVQUFBLEVBQ0U7QUFBQSxZQUFBLEdBQUEsRUFDRTtBQUFBLGNBQUEsS0FBQSxFQUFPLHVCQUFQO0FBQUEsY0FDQSxXQUFBLEVBQWEsc0RBRGI7QUFBQSxjQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsY0FHQSxTQUFBLEVBQVMsR0FIVDtBQUFBLGNBSUEsT0FBQSxFQUFTLENBSlQ7YUFERjtXQUZGO1NBUEY7QUFBQSxRQWdCQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsVUFDQSxVQUFBLEVBQ0U7QUFBQSxZQUFBLEdBQUEsRUFDRTtBQUFBLGNBQUEsS0FBQSxFQUFPLDZCQUFQO0FBQUEsY0FDQSxXQUFBLEVBQWEsZ0VBRGI7QUFBQSxjQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsY0FHQSxTQUFBLEVBQVMsQ0FIVDthQURGO0FBQUEsWUFNQSxHQUFBLEVBQ0U7QUFBQSxjQUFBLEtBQUEsRUFBTyw2QkFBUDtBQUFBLGNBQ0EsV0FBQSxFQUFhLGdFQURiO0FBQUEsY0FFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLGNBR0EsU0FBQSxFQUFTLEVBSFQ7YUFQRjtXQUZGO1NBakJGO0FBQUEsUUErQkEsSUFBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFVBQ0EsVUFBQSxFQUNFO0FBQUEsWUFBQSxHQUFBLEVBQ0U7QUFBQSxjQUFBLEtBQUEsRUFBTywwQkFBUDtBQUFBLGNBQ0EsV0FBQSxFQUFhLGlEQURiO0FBQUEsY0FFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLGNBR0EsU0FBQSxFQUFTLENBSFQ7QUFBQSxjQUlBLE9BQUEsRUFBUyxDQUpUO2FBREY7QUFBQSxZQU9BLEdBQUEsRUFDRTtBQUFBLGNBQUEsS0FBQSxFQUFPLDBCQUFQO0FBQUEsY0FDQSxXQUFBLEVBQWEsaURBRGI7QUFBQSxjQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsY0FHQSxTQUFBLEVBQVMsQ0FIVDtBQUFBLGNBSUEsT0FBQSxFQUFTLENBSlQ7YUFSRjtXQUZGO1NBaENGO09BRkY7S0FoQ0Y7R0FERixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/key/.atom/packages/activate-power-mode/lib/config-schema.coffee
