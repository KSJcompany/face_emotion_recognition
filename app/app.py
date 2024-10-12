from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
from fer import FER
import base64

app = Flask(__name__)

emotion_detector = FER(mtcnn=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    image_data = request.json['image']
    image_data = base64.b64decode(image_data.split(',')[1])
    
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    result = emotion_detector.detect_emotions(img)
    
    processed_result = []
    for face in result:
        bbox = face['box']
        emotions = face['emotions']
        processed_result.append({
            'bbox': bbox,
            'emotions': emotions
        })
    
    return jsonify(processed_result)

if __name__ == '__main__':
    app.run(debug=True)