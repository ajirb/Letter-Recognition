let charImage = [];
$('.select').hide();
//$('.canvas').hide();
$('.alert').hide();
$('.select2').hide();

$("#image-selector").change(function(){
    let reader = new FileReader();
    reader.onload = function(){
        let dataURL = reader.result;
        $('#selected-image').attr("src", dataURL);
        $('.select').show();
        $('.alert').hide();
        $("#predictions-list").empty();
    }
    let file = $("#image-selector").prop('files')[0];
    reader.readAsDataURL(file);
    clearCanvas();
});

var canvas = document.querySelector('#paint');
let model;
(async function(){
    model = await tf.loadLayersModel('./tfjs-models/CNN/model.json');
    if (model.err) { console.log('error');}
    else { console.log('fetched response');}
    $('.progress-bar').hide();
})();

function isCanvasBlank(canvas) {
    if(clickX.length||clickY.length||clickD.length)return 0;
    return 1;
}

//predict on image
$("#predict-button").click(async function(){
    if(document.getElementById("image-selector").files.length == 0){
        console.log("no files selected");
        $('.select').hide();
        return;
    }
    $('.alert').hide();
    $("#predictions-list").empty();
    $("#predictions-list1").empty();

    let image = $('#selected-image').get(0);
    let src = cv.imread(image);
    await predictImage(src);

    var values="";
    for(i=0;i<charImage.length;i++){
         values +=charImage[i]+" ";
    }
    charImage = [];
    
    $('#predictions-list').append(`<p><h5>From Image : ${values}</h5></p>`);
});
//predict on canvas
$("#predict-button").click(async function(){
    $("#predictions-list1").empty();
    $("#predictions-list").empty();
    if(isCanvasBlank(canvas)){
        if ((document.getElementById("image-selector").files.length == 0)){
        $('.alert').show();
        }
        console.log("no sketch selected");
        //$("#selected-image1").empty();
        //$(".canvas").hide();
        return;
    }
    
    $('.alert').hide();
    //$(".canvas").show();
    //$('#selected-image1').attr("src", canvas.toDataURL());
    
    let src = cv.imread(canvas);
    await predictImage(src);

    var values="";
    for(i=0;i<charImage.length;i++){
         values +=charImage[i]+" ";
    }
    charImage = [];
    $('#predictions-list1').append(`<p><h5>From Canvas : ${values}</h5></p>`);
});

function boundingBox() {
    var minX = Math.min.apply(Math, clickX) - 10;
    var maxX = Math.max.apply(Math, clickX) + 10;
    
    var minY = Math.min.apply(Math, clickY) - 10;
    var maxY = Math.max.apply(Math, clickY) + 10;
  
    var tempCanvas = document.createElement("canvas");
    tCtx = tempCanvas.getContext("2d");

    tempCanvas.width  = canvas.width;
    tempCanvas.height = canvas.height;

    tCtx.fillStyle = "white";
    tCtx.fillRect(0, 0, canvas.width, canvas.height);
  
    x = (canvas.width - maxX+minX)/2;
    y = (canvas.height - maxY+minY)/2;
  
    tCtx.drawImage(canvas, minX, minY, maxX - minX, maxY - minY, x,y, maxX - minX, maxY - minY);
  
    var imgBox = document.getElementById("canvas");
    imgBox.src = tempCanvas.toDataURL();
    //console.log(imgBox.src);
  
    return tempCanvas;
}

async function predictImage(img){
    let mat = img.clone();
    let s = new cv.Scalar(255,255,255,255);
    cv.copyMakeBorder(mat, mat,8, 8, 8, 8, cv.BORDER_CONSTANT,s);
    let gray = new cv.Mat();
    cv.cvtColor(mat,gray, cv.COLOR_BGR2GRAY);
    let bin_image = new cv.Mat();
    cv.threshold(gray,bin_image,127,255,cv.THRESH_BINARY);
    cv.threshold(bin_image,gray, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(gray,contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    let letter_image_regions = [];
    for(i=0;i<contours.size();i++){
          let rect = cv.boundingRect(contours.get(i));
          letter_image_regions.push(rect);
      }
    let max_h = 0;
    for(i=0;i<letter_image_regions.length;i++){
        let rect = letter_image_regions[i];
        if (rect.height>max_h)
            max_h=rect.height;
    }
    max_h = Math.ceil(max_h/10)*10;
    let min_h = Math.ceil(max_h/4);

    letter_image_regions.sort(function(a,b){
      let y1 = Math.round((a.y+a.height)/max_h)*max_h;
      let y2 = Math.round((b.height+b.y)/max_h)*max_h;
      if(y2<y1)return 1;
      if(y2>y1)return -1;
      if(b.x<a.x) return 1;
      if(b.x>a.x) return -1;
      return 0;
    });

    for(i=0;i<letter_image_regions.length;i++){
          let r = letter_image_regions[i];
          let letter_image = new cv.Mat();
          let rect = new cv.Rect(r.y  , r.x ,r.height, r.width);
          if (r.height<min_h) continue;
          letter_image = bin_image.roi(r);
          cv.cvtColor(letter_image,letter_image,cv.COLOR_GRAY2RGBA);
          cv.copyMakeBorder(letter_image,letter_image, 10, 10, 10, 10, cv.BORDER_CONSTANT,[255,255,255,255]);

          var v = " ";
          v = await prediction(getcanv(letter_image));
          if (typeof v == 'undefined')v = 'o';
          charImage.push(v);
          letter_image.delete();
          
    }
    
    bin_image.delete();
    gray.delete();
    mat.delete();
}
  
function getcanv(mat){
    var canvas = document.createElement('canvas');
    var img=new cv.Mat;
    var depth=mat.type()%8;
    var scale=depth<=cv.CV_8S?1:depth<=cv.CV_32S?1/256:255;
    var shift=depth===cv.CV_8S||depth===cv.CV_16S?128:0;
    mat.convertTo(img,cv.CV_8U,scale,shift);
    var imgData=new ImageData(new Uint8ClampedArray(img.data),img.cols,img.rows);
    var ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.width=128;
    canvas.height=128;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var dx = parseInt(canvas.width-img.cols)/2;
    var dy = parseInt(canvas.height - img.rows)/2;
    ctx.putImageData(imgData,dx,dy);
    img.delete()
    //console.log(canvas.toDataURL());
    return canvas;
  };

async function prediction(canv){
    let tensor = tf.browser.fromPixels(canv,3).
    resizeNearestNeighbor([200,200]).
    toFloat().
    expandDims();

    let predictions = await model.predict(tensor.div(255.0)).data();

    let top = Array.from(predictions)
    .map(function(p, i){
        return{
            probability: p,
            className: LABEL_CLASSES[i]
        };
    }).sort(function(a,b){
        return b.probability -a.probability;
    }).slice(0, 1);
    return top[0].className;
  }