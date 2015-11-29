var circuit = {nodes: [], gates: [], conns: []};

// example:
// circuit = {
//  nodes: [{id: 42, pos: [0,0], selected: false, value: 0}, {id: 2, pos: [0,0]}, {id: 37, pos: [0,0]}],
//  gates: [{type: 'AND', ins: [42, 2], outs: [37], pos: [50,50]}],
//  ins: [{id:, type: 'switch', state: 0, conn: 42},
//        {id:, type: 'switch', state: 0, conn: 2}],
//  outs: [{id:, ntype: 'led', state: 0, conn: 37}],
//  conns: [[42, 6]]
// };

var agenda = [];

function updateAgenda() {
  for (var i = 0; i < circuit.nodes.length; i++) {
    var node = circuit.nodes[i];
    if (node.type === 'switch') {
      setValue(node.id, node.value);
      propagate(0, node.id);
    }
  }
}

function propagate(time, nodeId) {
  // alert("propagating update of " + nodeId + " at time t="+time);
  while (time >= agenda.length) {
    agenda.push([]);
  }
  var nodes = [nodeId];
  for (var i = 0; i < circuit.conns.length; i++) {
    var a = circuit.conns[i][0];
    var b = circuit.conns[i][1];
    if (nodes.indexOf(a) > -1 && nodes.indexOf(b) === -1) {
      nodes.push(b);
    }
    if (nodes.indexOf(b) > -1 && nodes.indexOf(a) === -1) {
      nodes.push(a);
    }
  }
  for (var i = 0; i < circuit.gates.length; i++) {
    var found = false;
    for (var j = 0; j < nodes.length; j++) {
      if (circuit.gates[i].ins.indexOf(nodes[j]) > -1) {
        found = true;
        break;
      }
    }
    if (found & agenda[time].indexOf(i) === -1) {
      agenda[time].push(i);
      for (var j = 0; j < circuit.gates[i].outs.length; j++) {
        propagate(time + 1, circuit.gates[i].outs[j]);
      }
    }
  }
}

function apply(gateIndex) {
  var gate = circuit.gates[gateIndex];
  switch (gate.type) {
    case 'and':
      setValue(gate.outs[0], getValue(gate.ins[0]) && getValue(gate.ins[1]));
      break;
    case 'or':
      setValue(gate.outs[0], getValue(gate.ins[0]) || getValue(gate.ins[1]));
      break;
    case 'not':
      setValue(gate.outs[0], !getValue(gate.ins[0]));
      break;
  }
}

function getValue(nodeId, value) {
  for (var i = 0; i < circuit.nodes.length; i++) {
    if (circuit.nodes[i].id == nodeId) {
      return circuit.nodes[i].value;
    }
  }
}

alreadySet = {};

function setValue(nodeId, value) {
  alreadySet = {};
  helper(nodeId, value);
}

function helper(nodeId, value) {
  for (var i = 0; i < circuit.nodes.length; i++) {
    if (circuit.nodes[i].id == nodeId) {
      circuit.nodes[i].value = value;
      alreadySet[nodeId] = true;
      break;
    }
  }
  for (var i = 0; i < circuit.conns.length; i++) {
    var a = circuit.conns[i][0];
    var b = circuit.conns[i][1];
    if (alreadySet[b] !== true && a == nodeId) {
      helper(b, value);
    } else if (alreadySet[a] !== true && b == nodeId) {
      helper(a, value);
    }
  }
}
