// Constants
var leftMargin = 20;
var buttonWidth = 60;
var buttonHeight = 40;
var buttonSpacing = 20;
var smallMovement = 3;
var nodeSize = 5;

$(document).ready(function() {
    var ctx = $('#canvas').get(0).getContext('2d');
    ctx.textAlign = "center";

    // Scaling and panning
    var f = 30;
    var px = 0;
    var py = 0;

    // Mouse
    var mx = 0;
    var my = 0;
    var mdx = 0;
    var mdy = 0;
    var mouseDown = false;
    var selectedObjs = [];
    var movingGroup = false;

    // Keys
    var spaceDown = false;
    var shiftDown = false;

    // Button hover
    var leftIndex = -1;
 
    // Simulation
    var simulating = false;
    var intervalID = undefined;
    var 

    var leftButtons = [
      {label: "START", action: toggleSimulation},
      {label: "AND", action: newGate('and')},
      {label: "OR", action: newGate('or')},
      {label: "NOT", action: newGate('not')}
    ];

    function newGate(type) {
      return function() {
        circuit.gates.push({
          type: type,
          ins: [],
          outs: [],
          pos: [400 - px, 300 - py]
        })
      }
    }

    function draw_buttons() {
      ctx.font = "20px sans";
      var y = buttonSpacing;
      for (var i = 0; i < leftButtons.length; i++) {
        if (i === leftIndex) {
          ctx.fillStyle = "cyan";
          ctx.fillRect(leftMargin, y, buttonWidth, buttonHeight);
        }
        ctx.strokeRect(leftMargin, y, buttonWidth, buttonHeight);
        ctx.fillStyle = "black";
        ctx.fillText(leftButtons[i].label, leftMargin + buttonWidth / 2, y + 30);
        y += buttonHeight + buttonSpacing;
      }
    }

//Drawing Gates
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

      //draw the leads
      ctx.moveTo(x0, y0 + f/3);
      ctx.lineTo(x0 - 0.5*f, y0 + f/3);
      ctx.moveTo(x0, y0 + f * 2/3);
      ctx.lineTo(x0 - 0.5*f, y0 + f * 2/3);
      ctx.moveTo(x0 + 1.5 * f, y0 + 0.5 * f)
      ctx.lineTo(x0 + 2 * f,y0 + 0.5 * f )
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

      //draw the leads
      ctx.moveTo(x0 + 0.2 * f, y0 + f/3);
      ctx.lineTo(x0 - 0.5*f, y0 + f/3);
      ctx.moveTo(x0 + 0.2 * f, y0 + f * 2/3);
      ctx.lineTo(x0 - 0.5*f, y0 + f * 2/3);
      ctx.moveTo(x0 + 1.5 * f, y0 + 0.5 * f)
      ctx.lineTo(x0 + 2 * f,y0 + 0.5 * f )
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

      //draw the leads whee
      ctx.moveTo(x0, y0 + f/3);
      ctx.lineTo(x0 - 0.5*f, y0 + f/3);
      ctx.moveTo(x0, y0 + f * 2/3);
      ctx.lineTo(x0 - 0.5*f, y0 + f * 2/3);
      ctx.moveTo(x0 + 1.5 * f, y0 + 0.5 * f)
      ctx.lineTo(x0 + 2 * f,y0 + 0.5 * f )
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

//Drawing Nodes
    function draw_switch(node){
      var x0 = px + node.pos[0];
      var y0 = py + node.pos[1];

      ctx.fillStyle="#FF6600"; //orange
      ctx.fillRect(x0, y0, f, f);
      ctx.stroke();
    }

    function draw_led(node){
      var x0 = px + node.pos[0];
      var y0 = py + node.pos[1];

      ctx.fillStyle="#00B8E6"; //blue
      ctx.arc(x0, y0, f/2, 0 * Math.PI, 2 * Math.PI);
      ctx.fill();
    }

    function draw_io(){
      switch (node.type) {
        case 'io':
          draw_switch(node);
          break;
        case 'led':
          draw_led(node);
          break;
        default:
          draw_node(node);
          break;
      }
    }

    function draw_node(node) {
      var x0 = px + node.pos[0];
      var y0 = py + node.pos[1];

      ctx.fillStyle="#FF6600"; //orange
      ctx.fillRect(x0, y0, 0.3*f, 0.3*f);
    }

    function render() {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (var i = 0; i < circuit.gates.length; i++) {
        if (selectedObjs.indexOf(circuit.gates[i]) > -1) {
          ctx.strokeStyle = "magenta";
        }
        draw_gate(circuit.gates[i]);
        ctx.strokeStyle = "black";
      }

      if (mouseDown && !spaceDown && !movingGroup) {
        ctx.fillStyle = "rgba(0, 1, 1, 0.2)";
        ctx.fillRect(mdx, mdy, mx - mdx, my - mdy);
      }

      draw_buttons();
    }

    function checkLeftButtons() {
      if (mx >= leftMargin && mx <= leftMargin + buttonWidth) {
        if (my % (buttonSpacing + buttonHeight) >= buttonSpacing) {
          var i = Math.floor(my / (buttonSpacing + buttonHeight));
          if (i < leftButtons.length) {
            leftIndex = i;
            return;
          }
        }
      }
      leftIndex = -1;
    }

    function objectsUnderCursor() {
      objs = [];
      for (var i = 0; i < circuit.gates.length; i++) {
        var x0 = px + circuit.gates[i].pos[0];
        var y0 = py + circuit.gates[i].pos[1];
        if (mx >= x0 && my >= y0 && mx <= x0 + 1.5 * f && my <= y0 + f) {
          objs.push(circuit.gates[i]);
        }
      }
      for (var i = 0; i < circuit.nodes.length; i++) {
        var x0 = px + circuit.nodes[i].pos[0];
        var y0 = px + circuit.nodes[i].pos[1];
        var size;
        if (circuit.nodes[i].type == undefined) {
          size = 0.2 * f;
        } else {
          size = 2 * f;
        }
        if (mx >= x0 && my >= y0 && mx <= x0 + nodeSize && my <= y0 + nodeSize) {
          objs.push(circuit.nodes[i]);
        }
      }
      return objs;
    }

    function objectsInMarquee() {
      objs = [];
      var xa = Math.min(mx, mdx);
      var xb = Math.max(mx, mdx);
      var ya = Math.min(my, mdy);
      var yb = Math.max(my, mdy);
      for (var i = 0; i < circuit.gates.length; i++) {
        var x0 = px + circuit.gates[i].pos[0];
        var y0 = py + circuit.gates[i].pos[1];
        if (x0 >= xa && y0 >= ya && x0 + 1.5 * f <= xb && y0 + f <= yb) {
          objs.push(circuit.gates[i]);
        }
      }
      for (var i = 0; i < circuit.nodes.length; i++) {
        var x0 = px + circuit.nodes[i].pos[0];
        var y0 = px + circuit.nodes[i].pos[1];
        var size;
        if (circuit.nodes[i].type == undefined) {
          size = 0.2 * f;
        } else {
          size = 2 * f;
        }
        if (x0 >= xa && y0 >= ya && x0 + size <= xb && y0 + size <= yb) {
          objs.push(circuit.nodes[i]);
        }
      }
      return objs;
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

    function toggleSimulation() {
      simulating = !simulating;
      if (simulating) {
        leftButtons[0].label = "STOP";
        updateAgenda();
        setTimeout
      } else {
        leftButtons[0].label = "START";
        agenda = [];
      }
    }

    $('#canvas').mousedown(function(e) {
      mouseDown = true;
      mdx = e.offsetX;
      mdy = e.offsetY;

      if (leftIndex !== -1) {
        if (!simulating || leftIndex == 0) {
          leftButtons[leftIndex].action();
          render();
        }
        return;
      }

      if (simulating) {
        return;
      }

      if (!spaceDown) {
        var objs = objectsUnderCursor();
        if (objs.length > 0) {
          movingGroup = true;
          var existing = false
          for (var i = 0; i < objs.length; i++) {
            for (var j = 0; j < selectedObjs.length; j++) {
              if (objs[i] == selectedObjs[j]) {
                existing = true;
                break;
              }
            }
          }
          if (!existing) {
            if (shiftDown) {
              selectedObjs.push(objs[0]);
            } else {
              selectedObjs = [objs[0]];
            }
          }
        }
      }

      render();
    });

    $('#canvas').mousemove(function(e) {
      if (mouseDown) {
        if (spaceDown) {
          px += e.offsetX - mx;
          py += e.offsetY - my;
        } else if (movingGroup) {
          for (var i = 0; i < selectedObjs.length; i++) {
            selectedObjs[i].pos[0] += e.offsetX - mx;
            selectedObjs[i].pos[1] += e.offsetY - my;
          }
        }
      }

      mx = e.offsetX;
      my = e.offsetY;

      var old = leftIndex;
      checkLeftButtons();
      if (old !== leftIndex || mouseDown) {
        render();
      }
    });

    $('#canvas').mouseup(function(e) {
      if (leftIndex === -1) {
        if (Math.abs(mx - mdx) <= smallMovement && Math.abs(my - mdy) <= smallMovement) {
          var objs = objectsUnderCursor();
          if (objs.length > 0) {
            if (shiftDown) {
              selectedObjs.push(objs[0]);
            } else {
              selectedObjs = [objs[0]];
            }
          } else {
            selectedObjs = [];
          }
        } else if (!spaceDown && !movingGroup) {
          selectedObjs = objectsInMarquee();
        }
      }
      mouseDown = false;
      movingGroup = false;
      render();
    });

    $(document).keydown(function(e) {
      if (e.which === 32) {
        e.preventDefault();
        spaceDown = true;
      } else if (e.which == 16) {
        shiftDown = true;
      }
    });

    $(document).keyup(function(e) {
      if (e.which === 32) {
        e.preventDefault();
        spaceDown = false;
      } else if (e.which == 16) {
        shiftDown = false;
      }
    });

    render();


    draw_node({pos:[100, 100]});
    console.log("drew it")
});
