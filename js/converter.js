var webcamJscii = new Jscii({
    container: document.getElementById('ascii-container-webrtc'),
    el: document.getElementById('jscii-element-webrtc'),
    webrtc: true,
    width: 77
});

document.getElementById('play-webrtc').addEventListener('click', function() { webcamJscii.play(); });
document.getElementById('pause-webrtc').addEventListener('click', function() { webcamJscii.pause(); });
