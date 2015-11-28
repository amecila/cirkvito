$(document).ready(function() {
    var ctx = $('#canvas').get(0).getContext('2d');

    function draw_buttons() {
      // uhh
    }

    function draw_and_gate(width, height){
      //to-do: figure out how to get the start coordinates
      var start_x = 50;
      var start_y = 50;
      ctx.beginPath();

      //draw the circle part of the and gate
      ctx.arc(start_x, start_y, height/2, -0.5 * Math.PI, 0.5 * Math.PI);
      ctx.stroke();

      //draw the rectangle part of the and gate
      ctx.moveTo(start_x, start_y + height/2)
      ctx.lineTo(start_x - width/2, start_y + height/2);
      ctx.lineTo(start_x - width/2, start_y - height/2);
      ctx.lineTo(start_x, start_y - height/2);
      ctx.stroke();
    }

    function draw_or_gate(width, height){
      var start_x = 40;
      var start_y = 80;
      ctx.beginPath();
      ctx.moveTo(start_x, start_y);
      ctx.quadraticCurveTo(start_x + 150, start_y + 20, start_x, start_y + 50);
      //ctx.quadraticCurveTo(200, 70, 50, 100);
      ctx.quadraticCurveTo(start_x + 50, start_y + 20, start_x, start_y);
      ctx.stroke();
    }

    draw_and_gate(30, 30);
    draw_or_gate(30, 30);

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
