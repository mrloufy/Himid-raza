import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { createClient } from '@supabase/supabase-js';
import { Upload, X, Scissors, AlertCircle, Loader2, Info, Trash2 } from 'lucide-react';
import Button from '../UI/Button';

const SUPABASE_URL = 'https://tdmivcbzekatmboyvtce.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbWl2Y2J6ZWthdG1ib3l2dGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjYzNzgsImV4cCI6MjA4NTkwMjM3OH0.lzqIaW6Dy3vru2b8uktVkCiKP7EOawrIvou9jmxA8KM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return canvas.toDataURL(mimeType, 0.9);
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImage, onImageChange, label = "Image", aspect }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setError(null);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, p: any) => {
    setCroppedAreaPixels(p);
  }, []);

  const handleClearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Remove this image?")) {
      onImageChange("");
    }
  };

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    setError(null);
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBase64) throw new Error("Failed to process crop.");
      const formData = new FormData();
      formData.append('file', croppedBase64);
      formData.append('upload_preset', UPLOAD_PRESET);
      const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }
      const data = await response.json();
      const secureUrl = data.secure_url;
      
      // PERSISTENCE: Save to Supabase projects table as per strict requirements
      // We only insert if this uploader is being used for a portfolio/project context
      if (label.toLowerCase().includes('book') || label.toLowerCase().includes('project')) {
        await supabase.from('projects').insert({
            image_url: secureUrl,
            title: label,
            created_at: new Date().toISOString()
        });
      }

      onImageChange(secureUrl);
      setIsCropping(false);
      setImageSrc(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to process and upload image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getRatioLabel = () => {
    if (!aspect) return "Original Proportions";
    if (Math.abs(aspect - 2/3) < 0.01) return "2:3 (Book Ratio)";
    if (Math.abs(aspect - 1) < 0.01) return "1:1 (Square)";
    return "Locked Ratio";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <span className="text-[9px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded uppercase">{getRatioLabel()}</span>
      </div>
      <div className="flex flex-col gap-3">
        <div 
          className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center group hover:border-primary-300 transition-colors"
          style={{ aspectRatio: aspect ? `${aspect}` : 'auto', minHeight: !currentImage ? '180px' : 'auto', width: '100%' }}
        >
          {currentImage ? (
            <>
              <img src={currentImage} className="w-full h-auto object-contain bg-white dark:bg-gray-900 shadow-inner" alt="Preview" style={{ maxHeight: '500px', display: 'block' }} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-black/10">
                 <div className="bg-white dark:bg-gray-900 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Upload className="text-primary-500" size={24}/>
                 </div>
              </div>
              <button type="button" onClick={handleClearImage} className="absolute bottom-4 right-4 p-2.5 bg-red-500 text-white rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto hover:bg-red-600 active:scale-95" title="Remove Image"><Trash2 size={18} /></button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400 py-12">
              <Upload size={40} className="opacity-30"/><div className="text-center px-4"><span className="text-[10px] font-black uppercase tracking-wider block mb-1">Upload New Asset</span><span className="text-[9px] font-bold text-gray-500">Auto-saves to Supabase</span></div>
            </div>
          )}
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={onFileChange} title="Upload Image" />
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10}/> {error}</p>}
      </div>
      {isCropping && (
        <div className="fixed inset-0 z-[400] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-xl">
           <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
              <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                 <div><h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white"><Scissors size={22} className="text-primary-500"/> Frame Your Image</h3><p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Manual Adjustment Required</p></div>
                 <button type="button" onClick={() => { setIsCropping(false); setImageSrc(null); }} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={28}/></button>
              </div>
              <div className="relative flex-1 min-h-[400px] md:min-h-[500px] w-full bg-[#0a0a0a]">
                 <Cropper image={imageSrc || ''} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} style={{ containerStyle: { background: '#0a0a0a' }, cropAreaStyle: { border: '2px solid #FD6F00', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)' } }} />
              </div>
              <div className="p-10 space-y-10">
                 <div className="flex items-center gap-8"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest w-16">Magnify</label><input type="range" min={1} max={4} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-primary-500 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
                 <div className="flex gap-6"><Button type="button" variant="outline" onClick={() => { setIsCropping(false); setImageSrc(null); }} className="flex-1 py-5 rounded-2xl font-bold text-lg">Discard</Button><Button type="button" onClick={handleUploadCroppedImage} className="flex-[2] py-5 rounded-2xl font-bold text-lg shadow-glow" disabled={isProcessing}>{isProcessing ? (<div className="flex items-center justify-center gap-3"><Loader2 size={24} className="animate-spin" /> <span>Uploading to Server...</span></div>) : 'Confirm & Upload'}</Button></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;