from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

# Device configuration
device = torch.device("cpu")

# Model setup
class_names = [
    'Adenocarcinoma', 
    'Large Cell Carcinoma', 
    'Normal', 
    'Squamous Cell Carcinoma'
]

def load_model():
    model = models.resnet18()
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 4)
    try:
        checkpoint = torch.load('diagnostic_model.pth', map_location=device)
        model.load_state_dict(checkpoint['model_state_dict'])
        print("Diagnostic model loaded successfully.")
    except Exception as e:
        print(f"Model not found or error loading: {e}. Using untrained model (random).")
    model.eval()
    return model

model = load_model()

# Transforms
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def simulate_mri(image):
    """Semi-realistic CT to MRI simulation on the server side"""
    img_array = np.array(image.convert('L')) # Grayscale
    
    # Simple T2 simulation logic
    # CT Bone (High intensity) -> MRI Bone (Low intensity)
    # CT Tissue (Mid intensity) -> MRI Tissue (Varies/High)
    mri_array = 255 - img_array # Invert for basic bone-dark effect
    mri_array = np.clip(mri_array * 1.2, 0, 255).astype(np.uint8)
    
    # Add slight blue tint
    mri_img = Image.fromarray(mri_array).convert('RGB')
    data = np.array(mri_img)
    data[:,:,2] = np.clip(data[:,:,2] * 1.1, 0, 255) # Blue channel boost
    return Image.fromarray(data)

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    img_bytes = file.read()
    image = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    
    # 1. Classification
    input_tensor = preprocess(image)
    input_batch = input_tensor.unsqueeze(0)
    
    with torch.no_grad():
        output = model(input_batch)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        conf, index = torch.max(probabilities, 0)
    
    diagnosis = class_names[index]
    confidence = float(conf) * 100

    # 2. MRI Synthesis
    mri_image = simulate_mri(image)
    
    # Convert back to base64
    buffered = io.BytesIO()
    mri_image.save(buffered, format="JPEG")
    mri_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    return jsonify({
        'diagnosis': diagnosis,
        'confidence': f"{confidence:.1f}%",
        'mri_image': f"data:image/jpeg;base64,{mri_base64}"
    })

if __name__ == '__main__':
    app.run(port=5000, debug=False)
