// Constants
var leftMargin = 20;
var buttonWidth = 60;
var buttonHeight = 40;
var buttonSpacing = 20;
var smallMovement = 3;
var stepDelay = 500;

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
    var draggingWire = false;
    var setWireFrom = null;
    var startedOutput = true;

    // Keys
    var spaceDown = false;
    var shiftDown = false;

    // Button hover
    var leftIndex = -1;

    // Simulation
    var simulating = false;
    var intervalID = undefined;

    // Track IDs of switches and LEDs
    var idCounter = 0;

    var leftButtons = [
      {label: "GO", action: toggleSimulation},
      {label: "AND", action: newGate('and')},
      {label: "OR", action: newGate('or')},
      {label: "NOT", action: newGate('not')},
      {label: "SW", action: newNode('io')},
      {label: "LED", action: newNode('led')}
    ];

    function newGate(type) {
      return function() {
        circuit.gates.push({
          type: type,
          ins: [],
          outs: [],
          pos: [400 * 30 / f - px, 300 * 30 / f - py]
        })
      }
    }

    function newNode(type){
      return function() {
        circuit.nodes.push({
          id: idCounter++,
          type: type,
          pos: [400 - px, 300 - py],
          value: false
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

    // Helper function that finds the position of a node
    function nodePos(nodeID) {
      for (var i = 0; i < circuit.nodes.length; i++){
        if (circuit.nodes[i].id == nodeID) {
          return circuit.nodes[i].pos;
        }
      }
    }

    // draw lines (wires) between nodes)
    function draw_wires_between_nodes() {
      for (var i = 0; i < circuit.conns.length; i++) {
          p1 = nodePos(circuit.conns[i][0]);
          p2 = nodePos(circuit.conns[i][1]);

          ctx.beginPath();

          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        }
    }


    // Drawing Gates
    function draw_and_gate(gate) {
      var x0 = f / 30 * (px + gate.pos[0]);
      var y0 = f / 30 * (py + gate.pos[1]);

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

      var pos;
      if (gate.ins[0] !== undefined) {
        ctx.beginPath();
        pos = nodePos(gate.ins[0]);
        ctx.moveTo(x0 - 0.5 * f, y0 + f/3);
        ctx.lineTo(f / 30 * (px + pos[0]), f / 30 * (py + pos[1]));
        ctx.stroke();
      }
      if (gate.ins[1] !== undefined) {
        ctx.beginPath();
        pos = nodePos(gate.ins[1]);
        ctx.moveTo(x0 - 0.5 * f, y0 + f * 2/3);
        ctx.lineTo(f / 30 * (px + pos[0]), f / 30 * (py + pos[1]));
        ctx.stroke();
      }
      if (gate.outs[0] !== undefined) {
        ctx.beginPath();
        pos = nodePos(gate.outs[0]);
        ctx.moveTo(x0 + 2 * f, y0 + 0.5 * f);
        ctx.lineTo(f / 30 * (px + pos[0]), f / 30 * (py + pos[1]));
        ctx.stroke();
      }
    }

    function draw_or_gate(gate){
      var x0 = f / 30 * (px + gate.pos[0]);
      var y0 = f / 30 * (py + gate.pos[1]);

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

      var pos;
      if (gate.ins[0] !== undefined) {
        ctx.beginPath();
        pos = nodePos(gate.ins[0]);
        ctx.moveTo(x0 - 0.5 * f, y0 + f/3);
        ctx.lineTo(f / 30 * (px + pos[0]), f / 30 * (py + pos[1]));
        ctx.stroke();
      }
      if (gate.ins[1] !== undefined) {
        ctx.beginPath();
        pos = nodePos(gate.ins[1]);
        ctx.moveTo(x0 - 0.5 * f, y0 + f * 2/3);
        ctx.lineTo(f / 30 * (px + pos[0]), f / 30 * (py + pos[1]));
        ctx.stroke();
      }
      if (gate.outs[0] !== undefined) {
        ctx.beginPath();
        pos = nodePos(gate.outs[0]);
        ctx.moveTo(x0 + 2 * f, y0 + 0.5 * f);
        ctx.lineTo(f / 30 * (px + pos[0]), f / 30 * (py + pos[1]));
        ctx.stroke();
      }
    }

    function draw_not_gate(gate){
      var x0 = f / 30 * (px + gate.pos[0]);
      var y0 = f / 30 * (py + gate.pos[1]);

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
       ctx.moveTo(x0, y0 + f/2);
       ctx.lineTo(x0 - 0.5*f, y0 + f/2);
       ctx.moveTo(x0 + 1.5 * f, y0 + 0.5 * f)
       ctx.lineTo(x0 + 2 * f,y0 + 0.5 * f )
       ctx.stroke();


      // draw the connecting wires
      var pos;
      if (gate.ins[0] !== undefined) {
        ctx.beginPath();
        pos = nodePos(gate.ins[0]);
        ctx.moveTo(x0 - f / 2, y0 + f/2);
        ctx.lineTo(f / 30 * (px + pos[0]), f / 30 * (py + pos[1]));
        ctx.stroke();
      }
      if (gate.outs[0] !== undefined) {
        ctx.beginPath();
        pos = nodePos(gate.outs[0]);
        ctx.moveTo(x0 + 2 * f, y0 + 0.5 * f);
        ctx.lineTo(f / 30 * (px + pos[0]), f / 30 * (py + pos[1]));
        ctx.stroke();
      }

    }

    function draw_generic_gate(gate) {
      var x0 = f / 30 * (px + gate.pos[0]);
      var y0 = f / 30 * (py + gate.pos[1]);

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
      var x0 = f / 30 * (px + node.pos[0]);
      var y0 = f / 30 * (py + node.pos[1]);

      // draw the square
      ctx.strokeRect(x0 - f/2, y0 - f/2, f, f);
      if (node.value){
        ctx.fillStyle="#FF6600"; //orange for on
        ctx.fillRect(x0 - f/2, y0 - f/2, f, f);
      }
    }

    function draw_led(node){
      var x0 = f / 30 * (px + node.pos[0]);
      var y0 = f / 30 * (py + node.pos[1]);

      ctx.beginPath();

      ctx.moveTo(x0 + f/2, y0);
      ctx.arc(x0, y0, f/2, 0 * Math.PI, 2 * Math.PI);
      ctx.stroke();
      if (node.value){
        ctx.fillStyle="#00B8E6"; //blue for on
        ctx.fill();
      }
    }

    function draw_any_node(node) {
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
      var x0 = f / 30 * (px + node.pos[0]);
      var y0 = f / 30 * (py + node.pos[1]);

      ctx.fillStyle="#FF6600"; //orange
      ctx.fillRect(x0 - 0.3 * f, y0 - 0.3 * f, 0.6*f, 0.6*f);
      ctx.strokeRect(x0 - 0.3 * f, y0 - 0.3 * f, 0.6*f, 0.6*f);
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

      for (var i = 0; i < circuit.nodes.length; i++) {
        if (selectedObjs.indexOf(circuit.nodes[i]) > -1) {
          ctx.strokeStyle = "magenta";
        }
        draw_any_node(circuit.nodes[i]);
        ctx.strokeStyle = "black";
      }

      draw_wires_between_nodes();

      if (mouseDown && !spaceDown && !movingGroup) {
        if (draggingWire) {
          // ctx.strokeStyle = "black";
          ctx.beginPath();
          ctx.moveTo(mdx, mdy);
          ctx.lineTo(mx, my);
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(0, 1, 1, 0.2)";
          ctx.fillRect(mdx, mdy, mx - mdx, my - mdy);
        }
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

    function elementary(gate) {
      return gate.type == 'and' || gate.type == 'or' || gate.type == 'not';
    }

    function gateHeight(gate) {
      if (elementary(gate)) {
        return f;
      }
      var n = Math.max(gate.ins.length, gate.outs.length);
      return n * f;
    }

    function nodeSize(node) {
        if (node.type === undefined) {
          return 0.6 * f;
        } else {
          return 2 * f;
        }
    }

    function objectsUnderCursor() {
      objs = [];
      for (var i = 0; i < circuit.gates.length; i++) {
        var x0 = f / 30 * (px + circuit.gates[i].pos[0]);
        var y0 = f / 30 * (py + circuit.gates[i].pos[1]);
        if (mx >= x0 && my >= y0 && mx <= x0 + 1.5 * f && my <= y0 + gateHeight(circuit.gates[i])) {
          objs.push(circuit.gates[i]);
        }
      }
      for (var i = 0; i < circuit.nodes.length; i++) {
        var x0 = f / 30 * (px + circuit.nodes[i].pos[0]);
        var y0 = f / 30 * (px + circuit.nodes[i].pos[1]);
        var hs = nodeSize(circuit.nodes[i]) / 2;
        if (mx >= x0 - hs && my >= y0 - hs && mx <= x0 + hs && my <= y0 + hs) {
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
        var x0 = f / 30 * (px + circuit.gates[i].pos[0]);
        var y0 = f / 30 * (py + circuit.gates[i].pos[1]);
        if (x0 >= xa && y0 >= ya && x0 + 1.5 * f <= xb && y0 + gateHeight(circuit.gates[i]) <= yb) {
          objs.push(circuit.gates[i]);
        }
      }
      for (var i = 0; i < circuit.nodes.length; i++) {
        var x0 = f / 30 * (px + circuit.nodes[i].pos[0]);
        var y0 = f / 30 * (px + circuit.nodes[i].pos[1]);
        var hs = nodeSize(circuit.nodes[i]) / 2;
        if (x0 - hs >= xa && y0 - hs >= ya && x0 + hs <= xb && y0 + hs <= yb) {
          objs.push(circuit.nodes[i]);
        }
      }
      return objs;
    }

    function outLeadUnderCursorSetter() {
      for (var i = 0; i < circuit.gates.length; i++) {
        if (selectedObjs.indexOf(circuit.gates[i]) > -1) {
          continue;
        }
        var x0 = f / 30 * (px + circuit.gates[i].pos[0]);
        var y0 = f / 30 * (px + circuit.gates[i].pos[1]);
        var h = gateHeight(circuit.gates[i]);
        if (mx >= x0 - 0.5 * f && mx <= x0 && my >= y0 && my <= y0 + h) {
          var n = circuit.gates[i].ins.length;
          var j = Math.floor(n * (my - y0) / h);
          return function(id) {
            circuit.gates[i].ins[j] = id;
          };
        }
      }
      for (var i = 0; i < circuit.nodes.length; i++) {
        if (selectedObjs.indexOf(circuit.nodes[i]) > -1) {
          continue;
        }
        if (circuit.nodes[i].type === 'led') {
          continue;
        }
        var x0 = f / 30 * (px + circuit.nodes[i].pos[0]);
        var y0 = f / 30 * (px + circuit.nodes[i].pos[1]);
        var hs = nodeSize(circuit.nodes[i]) / 2;
        if (mx >= x0 - hs && my >= y0 - hs && mx <= x0 + hs && my <= y0 + hs) {
          return function(id) {
            circuit.conns.push([circuit.nodes[i].id, id]);
          }
        }
      }
      return null;
    }

    function inLeadUnderCursorSetter() {
      for (var i = 0; i < circuit.gates.length; i++) {
        if (selectedObjs.indexOf(circuit.gates[i]) > -1) {
          continue;
        }
        var x0 = f / 30 * (px + circuit.gates[i].pos[0]);
        var y0 = f / 30 * (px + circuit.gates[i].pos[1]);
        var h = gateHeight(circuit.gates[i]);
        if (mx >= x0 + 1.5 * f && mx <= x0 + 2 * f && my >= y0 && my <= y0 + h) {
          var n = circuit.gates[i].outs.length;
          var j = Math.floor(n * (my - y0) / h);
          return function(id) {
            circuit.gates[i].outs[j] = id;
          };
        }
      }
      for (var i = 0; i < circuit.nodes.length; i++) {
        if (selectedObjs.indexOf(circuit.nodes[i]) > -1) {
          continue;
        }
        if (circuit.nodes[i].type === 'switch') {
          continue;
        }
        var x0 = f / 30 * (px + circuit.nodes[i].pos[0]);
        var y0 = f / 30 * (px + circuit.nodes[i].pos[1]);
        var size = nodeSize(circuit.nodes[i]);
        if (mx >= x0 && my >= y0 && mx <= x0 + size && my <= y0 + size) {
          return function(id) {
            circuit.conns.push([circuit.nodes[i].id, id]);
          }
        }
      }
      return null;
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

    function step() {
      if (agenda.length === 0) {
        toggleSimulation();
      } else {
        for (var i = 0; i < agenda[0].length; i++) {
          apply(agenda[0][i]);
        }
        shift(agenda);
      }
    }

    function toggleSimulation() {
      simulating = !simulating;
      if (simulating) {
        leftButtons[0].label = "STOP";
        updateAgenda();
        intervalID = setInterval(step, stepDelay);
      } else {
        leftButtons[0].label = "GO";
        agenda = [];
        if (intervalID != undefined) {
          clearInterval(intervalID);
          intervalID = undefined;
        }
      }
      render();
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
        if (selectedObjs.length === 0) {
          setWireFrom = outLeadUnderCursorSetter();
          if (setWireFrom !== null) {
            movingGroup = false;
            draggingWire = true;
            startedOutput = true;
            render();
            return;
          }
          setWireFrom = inLeadUnderCursorSetter();
          if (setWireFrom !== null) {
            movingGroup = false;
            draggingWire = true;
            startedOutput = false;
            render();
            return;
          }
        }
        var oldLength = selectedObjs.length;
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
        if (oldLength != selectedObjs.length) {
          setWireFrom = outLeadUnderCursorSetter();
          if (setWireFrom !== null) {
            movingGroup = false;
            draggingWire = true;
            startedOutput = true;
            render();
            return;
          }
          setWireFrom = inLeadUnderCursorSetter();
          if (setWireFrom !== null) {
            movingGroup = false;
            draggingWire = true;
            startedOutput = false;
            render();
            return;
          }
        }
      }

      render();
    });

    $('#canvas').mousemove(function(e) {
      if (mouseDown) {
        if (spaceDown) {
          px += (30 / f) * (e.offsetX - mx);
          py += (30 / f) * (e.offsetY - my);
        } else if (movingGroup) {
          for (var i = 0; i < selectedObjs.length; i++) {
            selectedObjs[i].pos[0] += (30 / f) * (e.offsetX - mx);
            selectedObjs[i].pos[1] += (30 / f) * (e.offsetY - my);
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
          if (draggingWire) {
            var setDest = startedOutput ? inLeadUnderCursorSetter() : outLeadUnderCursorSetter();
            if (setDest != null) {
              var id = idCounter++;
              circuit.nodes.push({
                id: id,
                pos: [(mdx + mx)/2 * 30 / f - px, (mdy + my)/2 * 30 / f - py]
              });
              setWireFrom(id);
              setDest(id);
              setWireFrom = null;
            }
          } else {
            selectedObjs = objectsInMarquee();
          }
        }
      }
      mouseDown = false;
      movingGroup = false;
      draggingWire = false;
      render();
    });

    $(document).keydown(function(e) {
      if (e.which === 32) {
        e.preventDefault();
        spaceDown = true;
      } else if (e.which == 16) {
        shiftDown = true;
      } else if (e.which == 8) {
        for (var i = 0; i < circuit.nodes.length; i++){
          for (var j = 0; j < selectedObjs.length; j++){
            if (selectedObjs[j] == circuit.nodes[i]) {
              circuit.nodes.splice(i, 1);
            }
          }
        }
        for (var i = 0; i < circuit.gates.length; i++){
          for (var j = 0; j < selectedObjs.length; j++){
            if (selectedObjs[j] == circuit.gates[i]) {
              circuit.gates.splice(i, 1);
            }
          }
        }
        render();
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
});
