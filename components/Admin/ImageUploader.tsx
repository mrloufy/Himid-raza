
import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, X, Scissors, AlertCircle, Loader2, Info, Trash2 } from 'lucide-react';
import Button from '../UI/Button';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  label?: string;
  aspect?: number;
}

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dtr3yvjac/upload';
const UPLOAD_PRESET = 'Hamid_Raza';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  mimeType: string = 'image/jpeg'
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const outputType = (mimeType === 'image/png' || mimeType === 'image/webp') ? mimeType : 'image/jpeg';
  const quality = outputType === 'image/jpeg' ? 0.7 : 0.8;

  const MAX_HEIGHT = 1200; 
  if (canvas.height > MAX_HEIGHT) {
    const scale = MAX_HEIGHT / canvas.height;
    const newHeight = MAX_HEIGHT;
    const newWidth = canvas.width * scale;
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;
    const resizedCtx = resizedCanvas.getContext('2d');
    if (resizedCtx) {
      resizedCtx.clearRect(0, 0, newWidth, newHeight);
      resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
      return resizedCanvas.toDataURL(outputType, quality);
    }
  }

  return canvas.toDataURL(outputType, quality);
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImage, onImageChange, label = "Image", aspect = 2/3 }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Max 10MB allowed.");
        return;
      }
      setError(null);
      setMimeType(file.type);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Remove this image?")) {
      onImageChange("");
    }
  };

  const showCroppedImage = async () => {
    if (imageSrc && croppedAreaPixels) {
      setIsProcessing(true);
      setError(null);
      try {
        const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels, mimeType);
        if (croppedBase64) {
          // Upload to Cloudinary
          const formData = new FormData();
          formData.append('file', croppedBase64);
          formData.append('upload_preset', UPLOAD_PRESET);

          const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Cloudinary upload failed');
          }

          const data = await response.json();
          onImageChange(data.secure_url);
          setIsCropping(false);
          setImageSrc(null);
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to process and upload image.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const ratioLabel = aspect === 2/3 ? "2:3 (Vertical)" : "1:1 (Square)";

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <span className="text-[9px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded uppercase">Ratio: {ratioLabel}</span>
      </div>
      
      <div className="flex flex-col gap-3">
        <div 
          className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center group hover:border-primary-300 transition-colors"
          style={{ aspectRatio: aspect }}
        >
          {currentImage ? (
            <>
              <img src={currentImage} className="w-full h-full object-cover opacity-90 group-hover:opacity-40 transition-opacity" alt="Preview" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                 <div className="bg-white dark:bg-gray-900 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Upload className="text-primary-500" size={24}/>
                 </div>
              </div>
              <button 
                type="button"
                onClick={handleClearImage}
                className="absolute bottom-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto"
                title="Remove Image"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Upload size={32} className="opacity-50"/>
              <div className="text-center px-4">
                <span className="text-[10px] font-black uppercase tracking-wider block">Upload & Attach to Cloudinary</span>
                <span className="text-[9px] font-bold text-gray-500">Auto-stored on Cloudinary</span>
              </div>
            </div>
          )}
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={onFileChange} title="Change Image" />
        </div>
        
        {error && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10}/> {error}</p>}
        
        {!currentImage && !error && (
            <p className="text-[9px] text-gray-400 flex items-center gap-1 italic"><Info size={10}/> Media will be hosted securely on Cloudinary.</p>
        )}
      </div>

      {isCropping && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-md">
           <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
              <div className="p-8 flex justify-between items-center border-b dark:border-gray-800">
                 <div>
                    <h3 className="font-bold flex items-center gap-2 dark:text-white text-xl">
                      <Scissors size={20} className="text-primary-500"/> Finalize Asset
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Images are uploaded directly to Cloudinary Media Library.</p>
                 </div>
                 <button type="button" onClick={() => { setIsCropping(false); setImageSrc(null); }} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" disabled={isProcessing}><X size={24}/></button>
              </div>
              <div className="relative h-[400px] md:h-[500px] w-full bg-[#0a0a0a]">
                 <Cropper 
                    image={imageSrc || ''} 
                    crop={crop} 
                    zoom={zoom} 
                    aspect={aspect} 
                    onCropChange={setCrop} 
                    onZoomChange={setZoom} 
                    onCropComplete={(_, p) => setCroppedAreaPixels(p)} 
                    style={{
                        containerStyle: { background: '#0a0a0a' },
                        cropAreaStyle: { border: '2px solid #FD6F00' }
                    }}
                 />
              </div>
              <div className="p-8 space-y-8">
                 <div className="flex items-center gap-6">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest w-16">Zoom</label>
                    <input 
                      type="range" 
                      min={1} 
                      max={4} 
                      step={0.1} 
                      value={zoom} 
                      onChange={e => setZoom(Number(e.target.value))} 
                      className="flex-1 accent-primary-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                      disabled={isProcessing}
                    />
                 </div>
                 <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => { setIsCropping(false); setImageSrc(null); }} className="flex-1 py-5 rounded-2xl font-bold" disabled={isProcessing}>Cancel</Button>
                    <Button type="button" onClick={showCroppedImage} className="flex-[2] py-5 rounded-2xl font-bold shadow-glow" disabled={isProcessing}>
                        {isProcessing ? <><Loader2 size={20} className="animate-spin mr-2"/> Uploading to Cloudinary...</> : 'Upload to Cloudinary'}
                    </Button>
                 </div>
                 {error && <p className="text-xs text-red-500 text-center font-bold">{error}</p>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
