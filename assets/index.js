let video = document.createElement('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

function drawLine(begin, end, color) {
    ctx.beginPath();
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function getStream(mode = false) {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: mode ? 'user' : 'environment',
        }
    })
        .then((stream) => {
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();
            requestAnimationFrame(tick);
        });
}

let timer = 0;

function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA && timer == 0) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        if (code) {
            drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
            drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
            drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
            drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
            console.log(code.data);
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: "passing", id: code.data }),
            };
            fetch('/api', options)
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                });
            // 3seconds delay
            timer = 1;
            setTimeout(() => {
                timer = 0;
            }, 3000);
        }
    }
    requestAnimationFrame(tick);
}

// select camera
let cameraSwitch = document.getElementById("cameraSwitch");
cameraSwitch.addEventListener("change", () => {
    getStream(cameraSwitch.value);
});

getStream();


