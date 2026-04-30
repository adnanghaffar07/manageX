import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, Keyboard, UploadCloud } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import type { Document } from '../types';
import { signDocument } from '../api';

interface SignDocumentModalProps {
  document: Document;
  onClose: () => void;
  onSuccess: () => void;
}

export const SignDocumentModal: React.FC<SignDocumentModalProps> = ({ document, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draw state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Type state
  const [typedName, setTypedName] = useState('');

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Set up canvas for drawing
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSignatureDataUrl = (): string | null => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // Check if canvas is empty
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      if (!pixelBuffer.some(color => color !== 0)) return null; // Blank canvas
      return canvas.toDataURL('image/png');
    }

    if (activeTab === 'type') {
      if (!typedName.trim()) return null;
      const canvas = window.document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '60px "Caveat", cursive';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
      }
      return canvas.toDataURL('image/png');
    }

    if (activeTab === 'upload') {
      return uploadedImage;
    }

    return null;
  };

  const handleSign = async () => {
    const signatureDataUrl = getSignatureDataUrl();
    if (!signatureDataUrl) {
      setError('Please provide a signature.');
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      await signDocument(document, signatureDataUrl);
      onSuccess();
    } catch (err: any) {
      console.error('Signing failed:', err);
      setError(err.message || 'Failed to sign document.');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap');`}
      </style>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Sign Document</h2>
          <button onClick={onClose} className="header-icon-btn">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-muted mb-4">
          Signing <span className="font-medium text-foreground">{document.name}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded text-sm bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-lg">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'draw' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <PenTool size={16} /> Draw
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'type' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Keyboard size={16} /> Type
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <UploadCloud size={16} /> Upload
          </button>
        </div>

        <div className="mb-6">
          {activeTab === 'draw' && (
            <div>
              <div className="border border-border rounded-xl overflow-hidden bg-white shadow-inner relative">
                <canvas
                  ref={canvasRef}
                  width={450}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="touch-none w-full cursor-crosshair"
                />
                <button 
                  onClick={clearCanvas}
                  className="absolute bottom-2 right-2 text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground px-2 py-1 rounded"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {activeTab === 'type' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Type your name..."
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="form-input w-full"
                style={{ fontSize: '1.1rem', padding: '0.75rem' }}
              />
              <div className="border border-border rounded-xl h-[200px] bg-white flex items-center justify-center overflow-hidden">
                <span style={{ fontFamily: '"Caveat", cursive', fontSize: '60px', color: '#000' }}>
                  {typedName || <span className="text-muted/30">Your Signature</span>}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-border rounded-xl h-[200px] flex flex-col items-center justify-center p-6 relative bg-secondary/20">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded signature" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-3 text-primary shadow-sm">
                    <UploadCloud size={24} />
                  </div>
                  <p className="font-medium">Upload Signature Image</p>
                  <p className="text-xs text-muted mt-1">PNG, JPG with transparent background</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1" disabled={isSigning}>
            Cancel
          </Button>
          <Button onClick={handleSign} className="flex-1" isLoading={isSigning}>
            Sign Document
          </Button>
        </div>
      </div>
    </div>
  );
};
