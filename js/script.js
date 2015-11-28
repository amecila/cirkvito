$(document).ready(function() {
    var ctx = $('#canvas').get(0).getContext('2d');

    function draw() {
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(500, 500);
        ctx.stroke();
    }

    draw();
});
