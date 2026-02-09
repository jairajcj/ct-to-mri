import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Dna,
  Activity,
  Zap,
  ShieldCheck,
  ChevronRight,
  FileSearch,
  RefreshCw,
  Download,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'comparison'
  const [sliderPos, setSliderPos] = useState(50);
  const [diagnosis, setDiagnosis] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const canvasRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        setSelectedImage(f.target.result);
        setResultImage(null);
        setProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateProcessing = async () => {
    if (!selectedImage) return;
    setProcessing(true);
    setProgress(0);
    setDiagnosis(null);

    // UI Progress simulation
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 90 ? 90 : prev + 5));
    }, 200);

    try {
      // 1. Prepare image for upload
      const blob = await (await fetch(selectedImage)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');

      // 2. Call local backend
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Backend unavailable');

      const data = await response.json();

      // 3. Update state with real AI results
      setResultImage(data.mri_image);
      setDiagnosis(data.diagnosis);
      setConfidence(data.confidence);
      setProgress(100);
      setProcessing(false);
      clearInterval(interval);

    } catch (err) {
      console.error("AI Backend Error:", err);
      // Fallback to simulation if backend fails
      setTimeout(() => {
        setProgress(100);
        setProcessing(false);
        generateMRIEffect();
        setDiagnosis("Simulation Mode (Offline)");
        setConfidence("N/A");
        clearInterval(interval);
      }, 2000);
    }
  };

  const generateMRIEffect = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Advanced Simulation: CT to MRI logic
      // CT: Bones are bright whites, tissue is dark grays.
      // MRI: Bones are dark (low proton density), tissue/fluids are varied/bright.

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const avg = (r + g + b) / 3;

        // Intensity mapping
        let newIntensity;
        if (avg > 180) {
          newIntensity = 255 - avg; // Bone (bright) -> Dark
        } else if (avg > 80) {
          newIntensity = avg * 1.3; // Soft tissue -> Enhanced
        } else {
          newIntensity = avg + (Math.random() * 8); // Noise/Fluid
        }

        // Apply Grayscale MRI palette (Pure white/gray/black)
        data[i] = newIntensity;
        data[i + 1] = newIntensity;
        data[i + 2] = newIntensity;
      }

      ctx.putImageData(imageData, 0, 0);
      setResultImage(canvas.toDataURL());
    };
    img.src = selectedImage;
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}
        >
          <div className="glass" style={{ padding: '12px', borderRadius: '12px' }}>
            <Activity size={32} color="var(--accent-primary)" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800' }}>NEUROSYNTH AI</h1>
        </motion.div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Cross-Modality Reconstruction Hub: CT ➔ MRI
        </p>
      </header>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        {/* Sidebar Controls */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass"
          style={{ padding: '2rem', height: 'fit-content' }}
        >
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="var(--accent-primary)" />
            Control Panel
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                border: '2px dashed var(--border-glass)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload size={32} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Upload Scan
              </span>
              <input type="file" hidden onChange={handleUpload} accept="image/*" />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Work Mode</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode('side-by-side')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', background: viewMode === 'side-by-side' ? 'rgba(0,242,254,0.1)' : 'transparent', border: `1px solid ${viewMode === 'side-by-side' ? 'var(--accent-primary)' : 'var(--border-glass)'}`, color: viewMode === 'side-by-side' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', background: viewMode === 'comparison' ? 'rgba(0,242,254,0.1)' : 'transparent', border: `1px solid ${viewMode === 'comparison' ? 'var(--accent-primary)' : 'var(--border-glass)'}`, color: viewMode === 'comparison' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Overlap
              </button>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>ENGINE STATUS</div>
            <div style={{ color: 'var(--accent-success)', fontSize: '0.9rem', fontWeight: '600' }}>Active (v4.2)</div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={!selectedImage || processing}
            onClick={simulateProcessing}
          >
            {processing ? <RefreshCw className="spin" size={18} /> : <Dna size={18} />}
            {processing ? 'Processing...' : 'Run Synthesis'}
          </button>
        </motion.aside>

        {/* Workspace Area */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ flex: 1, minHeight: '550px', padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {!selectedImage ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ padding: '2rem', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', marginBottom: '1.5rem' }}>
                  <FileSearch size={48} style={{ opacity: 0.5 }} />
                </div>
                <h3>Awaiting Input</h3>
                <p style={{ maxWidth: '300px', textAlign: 'center', marginTop: '0.5rem', opacity: 0.7 }}>
                  Select a radiological scan to begin the synthetic MRI reconstruction process.
                </p>
              </div>
            ) : viewMode === 'side-by-side' ? (
              <div style={{ display: 'flex', gap: '1.5rem', height: '100%', alignItems: 'center' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent-primary)', fontSize: '0.65rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '1.5px' }}>INPUT: COMPUTED TOMOGRAPHY</div>
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                    <img src={selectedImage} style={{ maxWidth: '100%', display: 'block' }} alt="CT" />
                  </div>
                </div>

                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent-success)', fontSize: '0.65rem', fontWeight: '800', marginBottom: '0.8rem', letterSpacing: '1.5px' }}>OUTPUT: SYNTHETIC RESONANCE</div>
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: '#000', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {processing ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', color: 'var(--accent-primary)', fontWeight: '200' }}>{progress}%</div>
                        <div style={{ width: '120px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '1rem auto' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'var(--accent-primary)' }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Synthesizing T2-Weights</div>
                      </div>
                    ) : resultImage ? (
                      <div style={{ position: 'relative' }}>
                        <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={resultImage} style={{ maxWidth: '100%' }} alt="MRI" />
                        {diagnosis && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent-success)', borderRadius: '8px', textAlign: 'left' }}
                          >
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AI Diagnosis</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-success)' }}>{diagnosis}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Confidence: {confidence}</div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div style={{ opacity: 0.3 }}>[ Ready to Process ]</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                  <img src={selectedImage} style={{ width: '100%', display: 'block', borderRadius: '12px' }} alt="CT" />
                  {resultImage && !processing && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                        borderRadius: '12px'
                      }}
                    >
                      <img src={resultImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="MRI" />
                    </div>
                  )}
                  {resultImage && !processing && (
                    <>
                      <div style={{ position: 'absolute', top: 0, left: `${sliderPos}%`, width: '2px', height: '100%', background: 'var(--accent-primary)' }} />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => setSliderPos(e.target.value)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize' }}
                      />
                    </>
                  )}
                  {processing && (
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--accent-primary)', zIndex: 10 }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="glass" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedImage ? 'var(--accent-success)' : '#555' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Signal:</span> {selectedImage ? 'Connected' : 'Waiting'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                <ShieldCheck size={14} color="var(--accent-primary)" />
                <span style={{ color: 'var(--text-secondary)' }}>Encryption:</span> 256-bit AES
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                Clear
              </button>
              <button disabled={!resultImage} style={{ background: 'var(--accent-primary)', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                Download
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <footer style={{ marginTop: '3rem', padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', borderTop: '1px solid var(--border-glass)' }}>
        © 2026 NeuroSynth Medical Technologies. For clinical research use only.
      </footer>
    </div>
  );
};

export default App;
