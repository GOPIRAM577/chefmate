import React, { useState } from 'react';

const PhotoUpload = ({ onUpload }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (selectedImage) {
      onUpload(selectedImage);
      // Optional: reset after upload
      // setSelectedImage(null);
      // setPreviewUrl(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">Auto-Scan Fridge</h2>
      <p className="text-sm text-slate-400 mb-6">Upload a photo of your fridge or pantry to automatically detect ingredients using AWS Rekognition.</p>
      
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-800/30 hover:bg-slate-700/30 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <svg className="w-8 h-8 mb-3 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-1 text-sm text-slate-400"><span className="font-semibold text-blue-400">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        {previewUrl && (
          <div className="w-full flex flex-col gap-3">
            <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-600">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              Analyze Photo
            </button>
          </div>
        )}

        {!previewUrl && (
          <div className="w-full">
            <button 
              disabled
              className="w-full px-4 py-2.5 bg-slate-700 text-slate-500 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Analyze Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
