let croppedCanvas = new FileReader();
    let image = cv.imread(boundingBox());
    let gray = new cv.Mat();
    cv.cvtColor(image,gray, cv.COLOR_BGR2GRAY);
    cv.imshow('canvas_box',gray)
    let s = new cv.Scalar(255,255,255,255);
    cv.copyMakeBorder(gray, gray,8, 8, 8, 8, cv.BORDER_REPLICATE,s);
    let bin_image = new cv.Mat();
    cv.threshold(gray,bin_image,127,255,cv.THRESH_BINARY);
    let thresh = new cv.Mat();
    cv.threshold(bin_image,thresh, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(thresh,contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
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
    max_h = Math.ceil(max_h/10)*10
    letter_image_regions.sort(function(a,b){
        let y1 = Math.round(a.y/max_h);
        let y2 = Math.round(b.y/max_h);
        if(y2<y1)return 1;
        if(y2>y1)return -1;
        if(b.x<a.x) return 1;
        if(b.x>a.x) return -1;
        return 0;
      });
      letter_image_regions.forEach((letter_bounding_box)=>{
        let rect = letter_bounding_box;
        letter_image = bin_image.crop(rect.y  , rect.x ,rect.height, rect.width);
        
        cv2.copyMakeBorder(letter_image,letter_image, 10, 10, 10, 10, cv2.BORDER_CONSTANT,[255]);
        console.log("hi");
        console.log(letter_image);
        dta = croppedCanvas.readAsDataURL(letter_image);
        console.log(dta);
    });
    //console.log(croppedCanvas);