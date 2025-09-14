import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Added missing icon imports.
import { PhotoIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon } from './icons';
import { GoogleGenAI, Type } from '@google/genai';

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

interface AnalysisResult {
    man: {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
    };
    woman: {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
    };
    overall: {
        synergy: string;
        suggestions: string[];
    };
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AbrazoAnalysisView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setAnalysisResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const prompt = `Analyze the tango abrazo in this image. Provide a detailed report as a JSON object. The analysis should be constructive and encouraging, suitable for tango dancers looking to improve. The language of the response should be Korean.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { data: selectedImage.split(',')[1], mimeType: selectedImage.split(';')[0].split(':')[1] } },
                        { text: prompt }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            man: {
                                type: Type.OBJECT,
                                properties: {
                                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive points about the man's (leader's) posture and connection." },
                                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Areas for improvement for the man (leader)." },
                                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable suggestions for the man (leader)." }
                                },
                            },
                            woman: {
                                type: Type.OBJECT,
                                properties: {
                                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive points about the woman's (follower's) posture and connection." },
                                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Areas for improvement for the woman (follower)." },
                                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable suggestions for the woman (follower)." }
                                },
                            },
                            overall: {
                                type: Type.OBJECT,
                                properties: {
                                    synergy: { type: Type.STRING, description: "A summary of how the couple's embrace works together." },
                                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions for the couple to improve their connection." }
                                },
                            }
                        },
                    }
                },
            });

            // FIX: Add type assertion to JSON.parse to fix 'unknown' type errors and improve type safety.
            const result = JSON.parse(response.text) as AnalysisResult;
            setAnalysisResult(result);
        } catch (err) {
            console.error("Error analyzing abrazo:", err);
            setError(t('abrazoAnalysisError'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setSelectedImage(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const AnalysisSection: React.FC<{ title: string; items: string[]; icon: React.ReactNode; color: string; }> = ({ title, items, icon, color }) => {
        if (!items || items.length === 0) return null;
        return (
            <div>
                <h4 className={`text-lg font-bold mb-2 flex items-center gap-2 ${color}`}>{icon} {title}</h4>
                <ul className="list-none space-y-2 pl-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <span className={`mr-2 mt-1 w-1.5 h-1.5 rounded-full ${color.replace('text', 'bg')}`}></span>
                            <span className="text-gray-700">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-full">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 flex justify-between items-center sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">{t('abrazoAnalysis')}</h2>
                <div className="w-10"></div> {/* Spacer */}
            </header>
            
            <main className="p-4 space-y-4">
                {!selectedImage && (
                    <div className="text-center p-8 bg-white rounded-xl shadow-md border">
                        <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-700">{t('uploadForAbrazoAnalysis')}</h3>
                        <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105">
                            {t('uploadPhoto')}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>
                )}
                
                {selectedImage && (
                    <div className="bg-white rounded-xl shadow-md border p-4 flex flex-col items-center">
                        <div className="relative w-full max-w-sm">
                             <img src={selectedImage} alt="Uploaded for analysis" className="w-full h-auto rounded-lg mb-4" />
                             {isLoading && (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-lg">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 font-semibold text-gray-700">{t('analyzingAbrazo')}</p>
                                </div>
                             )}
                        </div>
                        
                        {!analysisResult && (
                            <div className="flex items-center gap-4">
                                <button onClick={handleReset} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full transition">
                                    {t('cancel')}
                                </button>
                                <button onClick={handleAnalyze} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105 disabled:bg-gray-400">
                                    {t('startAnalysis')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative text-center" role="alert">
                        <span className="block sm:inline">{error}</span>
                        <button onClick={handleReset} className="mt-2 bg-red-200 text-red-800 font-bold py-1 px-4 rounded-full">{t('tryAgain')}</button>
                    </div>
                )}
                
                {analysisResult && !isLoading && (
                     <div className="space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-md border">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{t('analysisReport')}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Man's Analysis */}
                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-2">{t('man')}</h3>
                                    <AnalysisSection title={t('strengths')} items={analysisResult.man.strengths} icon={<CheckCircleIcon />} color="text-green-600" />
                                    <AnalysisSection title={t('weaknesses')} items={analysisResult.man.weaknesses} icon={<XCircleIcon />} color="text-orange-600" />
                                    <AnalysisSection title={t('suggestions')} items={analysisResult.man.suggestions} icon={<LightBulbIcon />} color="text-blue-600" />
                                </div>
                                
                                {/* Woman's Analysis */}
                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-xl font-bold text-red-800 border-b-2 border-red-200 pb-2">{t('woman')}</h3>
                                    <AnalysisSection title={t('strengths')} items={analysisResult.woman.strengths} icon={<CheckCircleIcon />} color="text-green-600" />
                                    <AnalysisSection title={t('weaknesses')} items={analysisResult.woman.weaknesses} icon={<XCircleIcon />} color="text-orange-600" />
                                    <AnalysisSection title={t('suggestions')} items={analysisResult.woman.suggestions} icon={<LightBulbIcon />} color="text-blue-600" />
                                </div>
                            </div>
                            
                            {/* Overall Analysis */}
                             <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-xl font-bold text-purple-800 border-b-2 border-purple-200 pb-2">{t('overallSynergy')}</h3>
                                <p className="text-gray-700">{analysisResult.overall.synergy}</p>
                                <AnalysisSection title={t('suggestions')} items={analysisResult.overall.suggestions} icon={<LightBulbIcon />} color="text-blue-600" />
                            </div>
                        </div>

                        <button onClick={handleReset} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition-transform transform hover:scale-105">
                            {t('startOver')}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AbrazoAnalysisView;
