const content = $('#mainContent'),
      video   = $('#video')[0]; 

//CHECK IF BROWSER HAS GET-USER-MEDIA API

function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
};


//HANDLE WEBCAM ERROR
var webcamError = (err) => {
    alert('Webcam error!', err);
};

//STREAM THE VIDEO WEBCAM
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video: true})
    .then( (stream) => {
        video.srcObject = stream;
        initialize();
    }, webcamError);
} 
else {
    alert("Browser not supported!")
};



//SET AUDIO CONTEXT
var AudioContext = (
    window.AudioContext ||
    window.webkitAudioContext ||
    null
);

//DECLARE VARIABLES

    var timeOut, lastImageData,
	    canvasPrimary = $("#canvas-primary")[0],
	    canvasSecondary = $("#canvas-secondary")[0];

	var contextPrimary = canvasPrimary.getContext('2d'),
	    contextSecondary = canvasSecondary.getContext('2d');

	var soundContext,
	    bufferLoader,
        notes = []; 
        
        // mirror video
	contextPrimary.translate(canvasPrimary.width, 0);
	contextPrimary.scale(-1, 1);


    var c = 5;


    function initialize(){
        if(!AudioContext){
            alert('Audio not supported by this browser!')
        }else{
            $('.introduction').fadeOut();
			$('.allow').fadeOut();
			$('.loading').delay(300).fadeIn();
            setTimeout(loadSounds, 1000);
        }
    }

    //LOAD SOUNDS

    function loadSounds() {
		soundContext = new AudioContext();
		bufferLoader = new BufferLoader(soundContext,
			[
				'sounds/note1.mp3',
				'sounds/note2.mp3',
				'sounds/note3.mp3',
				'sounds/note4.mp3',
				'sounds/note5.mp3',
				'sounds/note6.mp3',
				'sounds/note7.mp3',
				'sounds/note8.mp3'
			],
			finishedLoading
		);
		bufferLoader.load();
    }
    
    //LOAD NOTES BY PUSHING THEM INTO AN ARRAY

    function finishedLoading(bufferList) {
		for (var i=0; i<8; i++) {
			var source = soundContext.createBufferSource();
			source.buffer = bufferList[i];
			source.connect(soundContext.destination);
			var note = {
				note: source,
				ready: true,
				visual: $("#note" + i)
			};
			notes.push(note);
		}
		start();
    }
    

    //PLAY SOUNDS
    function playSound(obj) {
		if (!obj.ready) return;
		var source = soundContext.createBufferSource();
		source.buffer = obj.note.buffer;
		source.connect(soundContext.destination);
		source.start(0);
		obj.ready = false;
		// throttle the note
		setTimeout(setNoteReady, 400, obj);
	}

	function setNoteReady(obj) {
		obj.ready = true;
    }
    
    //STARTING OUR APP
    function start() {
		//$("#footer .instructions").show();
		$('.loading').fadeOut();
		$('body').addClass('black-background');
		$(".instructions").delay(600).fadeIn();
		$(canvasPrimary).delay(600).fadeIn();
		$(canvasSecondary).delay(600).fadeIn();
		$("#piano").delay(600).fadeIn();
		$(".motion-cam").delay(600).fadeIn(); 
		update();
    }
    
    window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
    })();
    
    //UPDATE VIDEO

    function update() {
		drawVideo();
		blend();
		checkAreas();
		requestAnimFrame(update);
//		timeOut = setTimeout(update, 1000/60);
	}

	function drawVideo() {
		contextPrimary.drawImage(video, 0, 0, video.width, video.height);
	}


    //BLEND CANVAS

    function blend() {
		var width = canvasPrimary.width;
		var height = canvasPrimary.height;
		// get webcam image data
		var sourceData = contextPrimary.getImageData(0, 0, width, height);
		// create an image if the previous image doesn’t exist
		if (!lastImageData) lastImageData = contextPrimary.getImageData(0, 0, width, height);
		// create a ImageData instance to receive the blended result
		var blendedData = contextPrimary.createImageData(width, height);
		// blend the 2 images
		differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
		// draw the result in a canvas
		contextSecondary.putImageData(blendedData, 0, 0);
		// store the current webcam image
		lastImageData = sourceData;
    }
    
    //build the blend mode difference

//helper function to ensure that the result of the substraction is always positive
function fastAbs(value) {
	return Math.abs(value)
}

function threshold(value) {
    return (value > 0x15) ? 0xFF : 0;
}

//blend mode diff
function difference(target, data1, data2) {
    // blend mode difference
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        target[4*i] = data1[4*i] == 0 ? 0 : fastAbs(data1[4*i] - data2[4*i]);
        target[4*i+1] = data1[4*i+1] == 0 ? 0 : fastAbs(data1[4*i+1] - data2[4*i+1]);
        target[4*i+2] = data1[4*i+2] == 0 ? 0 : fastAbs(data1[4*i+2] - data2[4*i+2]);
        target[4*i+3] = 0xFF;
        ++i;
    }
}

function differenceAccuracy(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;
    while (i < (data1.length * 0.25)) {
        var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
        var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
        var diff = threshold(fastAbs(average1 - average2));
        target[4*i] = diff;
        target[4*i+1] = diff;
        target[4*i+2] = diff;
        target[4*i+3] = 0xFF;
        ++i;
    }
}



function checkAreas() {
    // loop over the note areas
    for (var r=0; r<8; ++r) {
        var blendedData = contextSecondary.getImageData(1/8*r*video.width, 0, video.width/8, 100);
        var i = 0;
        var average = 0;
        // loop over the pixels
        while (i < (blendedData.data.length * 0.25)) {
            // make an average between the color channel
            average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
            ++i;
        }
        // calculate an average between of the color values of the note area
        average = Math.round(average / (blendedData.data.length * 0.25));
        if (average > 10) {
            // over a small limit, consider that a movement is detected
            // play a note and show a visual feedback to the user
            playSound(notes[r]);
            // notes[r].visual.show();
            // notes[r].visual.fadeOut();
            if(!notes[r].visual.is(':animated')) {
                notes[r].visual.css({opacity:1});
                notes[r].visual.animate({opacity:0}, 700);
            }

        }
    }
}
