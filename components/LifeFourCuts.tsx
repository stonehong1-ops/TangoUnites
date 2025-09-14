import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PhotoIcon } from './icons';
import { GoogleGenAI, Modality } from '@google/genai';

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const styles = [
    { key: 'stylePixar', prompt: "Reimagine this person as a 3D rendered character from a Pixar animation movie. Give them expressive features and a friendly look." },
    { key: 'styleOilPainting', prompt: "Transform this portrait into a classic oil painting in the style of Rembrandt. Emphasize chiaroscuro lighting and rich, textured brushstrokes." },
    { key: 'styleCyberpunk', prompt: "Recreate this person as a cyberpunk character in a futuristic city filled with neon lights. Add some cool cybernetic enhancements or futuristic clothing." },
    { key: 'styleWatercolor', prompt: "Redraw this portrait in a soft, emotional watercolor sketch style. Use gentle washes of color and delicate line work." },
];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LifeFourCuts: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<{ styleKey: string; url: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const [generatedCount, setGeneratedCount] = useState(0);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setGeneratedImages([]);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateImageForStyle = async (base64ImageData: string, prompt: string): Promise<string | null> => {
        try {
            const imagePart = {
                inlineData: {
                    data: base64ImageData.split(',')[1],
                    mimeType: base64ImageData.split(';')[0].split(':')[1],
                },
            };
            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [imagePart, textPart] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            return null;
        } catch (err) {
            console.error(`Failed to generate image for prompt: "${prompt}"`, err);
            return null;
        }
    };

    const handleGenerate = async () => {
        if (!selectedImage) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedCount(0);
        setProgressMessage('');

        for (const style of styles) {
            setProgressMessage(t('generatingStyle').replace('{style}', t(style.key)));
            const url = await generateImageForStyle(selectedImage, style.prompt);
            setGeneratedCount(prev => prev + 1);
            if (url) {
                setGeneratedImages(prev => [...prev, { styleKey: style.key, url }]);
            } else {
                setError(t('lifeFourCutsError'));
                setIsLoading(false);
                return;
            }
        }
        
        setIsLoading(false);
        setProgressMessage('');
    };
    
    const handleDownload = () => {
        if (generatedImages.length < 4) return;
    
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const cardWidth = 350;
        const cardHeight = 500;
        const padding = 15;
        const totalHeight = (cardHeight * 4) + (padding * 5);
        const totalWidth = cardWidth + (padding * 2);
    
        canvas.width = totalWidth;
        canvas.height = totalHeight;
    
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        let loadedImages = 0;
        generatedImages.forEach((imgData, index) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                ctx.drawImage(img, padding, padding * (index + 1) + cardHeight * index, cardWidth, cardHeight);
                loadedImages++;
                if (loadedImages === 4) {
                    const link = document.createElement('a');
                    link.download = 'life-4-cuts.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            };
            img.src = imgData.url;
        });
    };

    const handleReset = () => {
        setSelectedImage(null);
        setGeneratedImages([]);
        setError(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setGeneratedCount(0);
        setProgressMessage('');
    };

    return (
        <div className="bg-gray-100 min-h-full">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 flex justify-between items-center sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">{t('lifeFourCuts')}</h2>
                <div className="w-10"></div> {/* Spacer */}
            </header>
            
            <main className="p-4">
                {!selectedImage && (
                    <div className="text-center p-8 bg-white rounded-xl shadow-md border">
                        <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-700">{t('uploadForLifeFourCuts')}</h3>
                        <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105">
                            {t('uploadPhoto')}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>
                )}
                
                {selectedImage && !isLoading && generatedImages.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md border p-4 flex flex-col items-center">
                        <img src={selectedImage} alt="Uploaded" className="max-w-full max-h-64 rounded-lg mb-4" />
                        <div className="flex items-center gap-4">
                            <button onClick={handleReset} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full transition">
                                {t('cancel')}
                            </button>
                            {/* FIX: Updated translation key to `startAction` to resolve duplicate key error. */}
                            <button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105">
                                {t('startAction')}
                            </button>
                        </div>
                    </div>
                )}
                
                {isLoading && (
                    <div className="text-center p-8 bg-white rounded-xl shadow-md border">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                                <circle
                                    className="text-blue-600"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="45"
                                    cx="50"
                                    cy="50"
                                    style={{
                                        strokeDasharray: 2 * Math.PI * 45,
                                        strokeDashoffset: 2 * Math.PI * 45 * (1 - generatedCount / styles.length),
                                        transition: 'stroke-dashoffset 0.5s ease-in-out'
                                    }}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-blue-600">
                                {generatedCount}/{styles.length}
                            </span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-700">{t('generatingFourCuts')}</h3>
                        <p className="text-sm text-gray-500 mt-1 h-5">{progressMessage || '...'}</p>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative text-center" role="alert">
                        <span className="block sm:inline">{error}</span>
                        <button onClick={handleReset} className="mt-2 bg-red-200 text-red-800 font-bold py-1 px-4 rounded-full">{t('tryAgain')}</button>
                    </div>
                )}
                
                {generatedImages.length > 0 && !isLoading && (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {generatedImages.map(({ styleKey, url }) => (
                                <div key={styleKey} className="bg-white rounded-xl shadow-md border overflow-hidden">
                                    <img src={url} alt={styleKey} className="w-full h-auto aspect-square object-cover" />
                                    <p className="p-2 text-center text-sm font-semibold">{t(styleKey) || styleKey}</p>
                                </div>
                            ))}
                        </div>
                         <div className="flex items-center gap-4">
                            <button onClick={handleReset} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-full transition">
                                {t('startOver')}
                            </button>
                            <button onClick={handleDownload} disabled={generatedImages.length < 4} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-full transition-transform transform hover:scale-105 disabled:bg-gray-400">
                                {t('downloadImage')}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LifeFourCuts;
