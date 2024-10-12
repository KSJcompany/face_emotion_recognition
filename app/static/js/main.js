const videoElement = document.getElementById('videoElement');
const imageElement = document.getElementById('imageElement');
const captureButton = document.getElementById('captureButton');
const imageInput = document.getElementById('imageInput');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');

let isVideo = false;
let colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        videoElement.srcObject = stream;
        isVideo = true;
    })
    .catch(error => {
        console.error("카메라 접근 오류:", error);
    });

captureButton.addEventListener('click', () => {
    if (isVideo) {
        analyzeImage(videoElement);
    }
});

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                analyzeImage(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function analyzeImage(element) {
    resultCanvas.width = element.width;
    resultCanvas.height = element.height;
    ctx.drawImage(element, 0, 0, resultCanvas.width, resultCanvas.height);
    
    const imageData = resultCanvas.toDataURL('image/jpeg');
    
    fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
    })
    .then(response => response.json())
    .then(data => {
        drawResults(data);
    })
    .catch(error => {
        console.error('분석 오류:', error);
    });
}

function drawResults(results) {
    results.forEach((face, index) => {
        const [x, y, w, h] = face.bbox;
        const color = colors[index % colors.length];
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        
        const emotions = Object.entries(face.emotions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        ctx.fillStyle = color;
        ctx.font = '12px Arial';
        emotions.forEach((emotion, i) => {
            ctx.fillText(`${emotion[0]}: ${(emotion[1] * 100).toFixed(2)}%`, x, y + h + 14 + i * 14);
        });
    });
}

if (isVideo) {
    setInterval(() => {
        analyzeImage(videoElement);
    }, 1000);
}
