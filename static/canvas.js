var canvasWidth             = 128;
var canvasHeight            = 128;
var canvasStrokeStyle       = "black";
var canvasLineJoin          = "round";
var canvasLineWidth         = 5;
var canvasBackgroundColor   = "white";
var canvasId                = "canvas";


var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

var canvasBox = document.getElementById('canvas_box');
var canvas    = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.setAttribute("style","border:1px solid #000000;");
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas);
}

ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

$("#canvas").mousedown(function(e) {
    //var mouseX = e.pageX - this.offsetLeft;
    //var mouseY = e.pageY - this.offsetTop;

    $('.alert').hide();
    clearImage();
    var rect = canvas.getBoundingClientRect();
    var mouseX =  (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    var mouseY =  (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  
    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
  });

  canvas.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    clearImage();
  
    var rect  = canvas.getBoundingClientRect();
    var touch = e.touches[0];
  
    var mouseX =  (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    var mouseY =  (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  
    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
  
  }, false);


  $("#canvas").mousemove(function(e) {
    if(drawing) {
      var rect = canvas.getBoundingClientRect();
    var mouseX =  (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    var mouseY =  (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  
      addUserGesture(mouseX, mouseY, true);
      drawOnCanvas();
    }
  });

  canvas.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
      }
    if(drawing) {
      var rect = canvas.getBoundingClientRect();
      var touch = e.touches[0];
  
      var mouseX = touch.clientX - rect.left;
      var mouseY = touch.clientY - rect.top;
  
      addUserGesture(mouseX, mouseY, true);
      drawOnCanvas();
    }
  }, false);
  
  $("#canvas").mouseup(function(e) {
    drawing = false;
  });

  canvas.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
      }
    drawing = false;
  }, false);

  $("#canvas").mouseleave(function(e) {
    drawing = false;
  });

  canvas.addEventListener("touchleave", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
      }
    drawing = false;
  }, false);

  function addUserGesture(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickD.push(dragging);
  }

  function drawOnCanvas() {
    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    ctx.strokeStyle = canvasStrokeStyle;
    ctx.lineJoin    = canvasLineJoin;
    ctx.lineWidth   = canvasLineWidth;
  
    for (var i = 0; i < clickX.length; i++) {
      ctx.beginPath();
      if(clickD[i] && i) {
        ctx.moveTo(clickX[i-1], clickY[i-1]);
      } else {
        ctx.moveTo(clickX[i]-1, clickY[i]);
      }
      ctx.lineTo(clickX[i], clickY[i]);
      ctx.closePath();
      ctx.stroke();
    }
  }

  function clearCanvas(id) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    clickX = new Array();
    clickY = new Array();
    clickD = new Array();
    //$("#selected-image1").empty();
    $(".canvas").hide();
    
    $("#predictions-list1").empty();
    //$('#selected-image').empty();
    //$(".select").hide();
    //$('#image-selector').empty();
    //$('#image-selector').val('');
  }
  function clearImage(){
    $('#image-selector').empty();
    $('#image-selector').val('');
    $('#selected-image').empty();
    $("#predictions-list").empty();
    $(".select").hide();
  }
  