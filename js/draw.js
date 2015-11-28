$(document).ready(function() {
    var ctx = $('#canvas').get(0).getContext('2d');
    ctx.textAlign = "center";
    var f = 30;
    var px = 0;
    var py = 0;

    var leftButtons = {
      "AND": newGate('and'),
      "OR": newGate('or')
    };

    function newGate(type) {
      return function() {
        circuit.gates.push({
          type: type,
          ins: [],
          outs: [],
          pos: [400, 300]
        })
      }
    }

    function draw_buttons() {
      ctx.font = "20px sans";
      var x0 = 20;
      var width = 60;
      var y = 25;
      for (var label in leftButtons) {
        if (leftButtons.hasOwnProperty(label)) {
          ctx.strokeRect(x0, y, width, 40);
          ctx.fillText(label, x0 + width / 2, y + 30);
          y += 60;
        }
      }
    }

    function draw_and_gate(gate) {
      var x0 = px + gate.pos[0];
      var y0 = py + gate.pos[1];

      ctx.beginPath();

      //draw the circle part of the and gate
      ctx.arc(x0 + f, y0 + f/2, f/2, -0.5 * Math.PI, 0.5 * Math.PI);
      ctx.stroke();

      //draw the rectangle part of the and gate
      ctx.moveTo(x0 + f, y0 + f)
      ctx.lineTo(x0, y0 + f);
      ctx.lineTo(x0, y0);
      ctx.lineTo(x0 + f, y0);
      ctx.stroke();
    }

    function draw_or_gate(gate){
      var x0 = px + gate.pos[0];
      var y0 = py + gate.pos[1];

      ctx.beginPath();

      //front part
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 + 3 * f, y0 + 0.5 * f, x0, y0 + f);

      //back part
      ctx.quadraticCurveTo(x0 + 0.5*f, y0 + 0.5 * f, x0, y0);
      ctx.stroke();
    }

    function draw_not_gate(gate){
      var x0 = px + gate.pos[0];
      var y0 = py + gate.pos[1];

      ctx.beginPath();

      //triangle part
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 1.3 * f, y0 + 0.5 * f);
      ctx.lineTo(x0, y0 + f);
      ctx.closePath();

      //circle part
      var r = 0.1 * f;
      ctx.moveTo(x0 + 1.3 * f + 2 * r, y0 + 0.5 * f)
      ctx.arc(x0 + 1.3 * f + r, y0 + 0.5 * f, r, 0, Math.PI*2);
      ctx.stroke();
    }

    function draw_generic_gate(gate) {
      var x0 = px + gate.pos[0];
      var y0 = py + gate.pos[1];

      ctx.font = Math.round(0.5 * f) + "px sans";
      ctx.strokeRect(x0, y0, 1.5 * f, f);
      ctx.fillText(gate.type, x0 + 0.75 * f, y0 + 0.8 * f);
    }

    function draw_gate(gate) {
      switch (gate.type) {
        case 'and':
          draw_and_gate(gate);
          break;
        case 'or':
          draw_or_gate(gate);
          break;
        case 'not':
          draw_not_gate(gate);
          break;
        default:
          draw_generic_gate(gate);
          break;
      }
    }

    draw_and_gate({pos: [130, 30]});
    draw_or_gate({pos: [130, 70]});
    draw_not_gate({pos: [130, 110]});
    draw_generic_gate({type: 'xor', pos: [130, 150]});

    function render() {
      for (var i = 0; i < circuit.gates.length; i++) {
        draw_gate(circuit.gates[i]);
      }
    }

    function simulate() {
        updateAgenda();
        for (var i = 0; i < agenda.length; i++) {
            render();
            var tasks = agenda[i];
            for (var j = 0; j < tasks.length; j++) {
              apply(tasks[j]);
            }
        }
    }

    $('#canvas').mousedown(function(e) {
      //alert('bunnies');
    })

    $('#canvas').mouseup(function(e) {
      //alert('goodbye bunnies')
    })

    draw_buttons();
});
