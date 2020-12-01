var canvasWidth = 150;
var canvasHeight = 150;
var canvasStrokeStyle = "black";
var canvasLineJoin = "round";
var canvasLineWidth = 12;
var canvasBackgroundColor = "white";
var canvasID = "canvas";

var canvasBox = document.getElementById('canvas_box');
var canvas = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id",canvasID);
canvas.setAttribute("style","border:1px solid #000000;");
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
console.log('donee')
if(typeof G_vmlCanvasManager !='undefined'){
    canvas = G_vmlCanvasManager.initElement(canvas);
}

document.addEventListener("load",()=>{
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    let painting = false;

    function startPosition(e){
        painting = true;
        draw(e);
    }

    function finishedPosition(){
        painting = false;
        ctx.beginPath();
    }

    function draw(e){
        if(!painting) return;
        ctx.canvasLineWidth =10;
        ctx.lineCap = "round";

        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
    }

    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", finishedPosition);
    canvas.addEventListener("mousemove", draw);
});