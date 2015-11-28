$(document).ready(function() {
    var ctx = $('#canvas').get(0).getContext('2d');
    var f = 30;


    function draw_buttons() {
      //draw 6 rectangular buttons
      var start_x = 20 //20px of space between button and border
    //  var start_y =
    // var space = 20// spacing between rows: height = 30px and soace between buttons is 10px
    //  for (i = 0; i < 5; i ++)
    //    ctx.rect(start_x, start_y + space, 40, 100)

    //  }
    }

    function draw_and_gate(gate) {
      var x0 = gate.pos[0];
      var y0 = gate.pos[1];

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
      var x0 = gate.pos[0];
      var y0 = gate.pos[1];

      ctx.beginPath();

      //front part
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 + 3 * f, y0 + 0.5 * f, x0, y0 + f);

      //back part
      ctx.quadraticCurveTo(x0 + 0.5*f, y0 + 0.5 * f, x0, y0);
      ctx.stroke();
    }

    function draw_not_gate(gate){
      var x0 = gate.pos[0];
      var y0 = gate.pos[1];

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

    draw_and_gate({pos: [30, 30]});
    draw_or_gate({pos: [30, 70]});
    draw_not_gate({pos: [30, 110]});

    function render() {
      // redraw everything!!!
      // using the circuit global
    }

    function simulate() {
        updateAgenda();
        for (var i = 0; i < agenda.length; i++) {
            render();
            var tasks = agenda[i];
            for (var j = 0; j < tasks.length; j++) {
              tasks[j]();
            }
        }
    }

    draw_buttons();
});
