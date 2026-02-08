# NeuroSynth AI: CT to MRI Cross-Modality Reconstruction

NeuroSynth AI is a high-performance medical imaging platform that leverages Deep Learning to reconstruct synthetic MRI scans from CT scans and provide real-time diagnostic classification for lung cancer detection.

## Key Features
- **Cross-Modality Synthesis**: Generates T2-weighted synthetic MRI from axial CT inputs.
- **Deep Diagnosis**: Identifies Adenocarcinoma, Large Cell Carcinoma, and Squamous Cell Carcinoma using ResNet18.
- **Comparison Suite**: Side-by-side and Overlap (slider) modes for radiology review.
- **Real-time Engine**: Fast, local processing with hardware acceleration simulation.

## Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide-React
- **Backend**: Python, Flask, PyTorch, Torchvision
- **Processing**: HTML5 Canvas, NumPy, Pillow

## Installation
1. Install Python dependencies: `pip install torch torchvision flask flask-cors numpy Pillow`
2. Install JS dependencies: `npm install`
3. Start backend: `python server.py`
4. Start frontend: `npm run dev`




































































































































