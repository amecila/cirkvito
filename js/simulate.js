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
        var node = circuits.nodes[i];
        if (node.type === 'switch') {
            propagate(0, node.id);
        }
    }
}

function propagate(time, nodeId) {
    while (time >= agenda.length) {
        agenda.push([]);
    }
    for (var i = 0; i < circuit.gates.length; i++) {
        if (circuits.gates[i].ins.indexOf(nodeId) > -1) {
            if (agenda[time].indexOf(i) === -1) {
                agenda[time].push(i);
                for (var j = 0; j < circuit.gates[i].outs.length; j++) {
                    propagate(time + 1, j);
                }
            }
        }
    }
}

function apply(gateIndex) {
    var gate = circuit.gates[gateIndex];
    switch (gate.type) {
    case 'AND':
        setValue(gate.outs[0], getValue(gate.ins[0]) && getValue(gate.ins[1]));
        break;
    case 'OR':
        setValue(gate.outs[0], getValue(gate.ins[0]) || getValue(gate.ins[1]));
        break;
    case 'NOT':
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

function setValue(nodeId, value) {
    for (var i = 0; i < circuit.nodes.length; i++) {
        if (circuit.nodes[i].id == nodeId) {
            circuit.nodes[i].value = value;
            break;
        }
    }
}
