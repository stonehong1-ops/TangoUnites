import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FemaleIcon, MaleIcon, TicketIcon } from './icons';

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const MilongaRaffleView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLanguage();
    const [numTangueras, setNumTangueras] = useState('');
    const [numTangueros, setNumTangueros] = useState('');
    const [winningTanguera, setWinningTanguera] = useState<number | null>(null);
    const [winningTanguero, setWinningTanguero] = useState<number | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleRaffle = () => {
        const tangueras = parseInt(numTangueras, 10);
        const tangueros = parseInt(numTangueros, 10);
        if (isNaN(tangueras) || isNaN(tangueros) || tangueras <= 0 || tangueros <= 0) {
            alert(t('enterTotalNumber'));
            return;
        }

        setIsDrawing(true);
        setWinningTanguera(null);
        setWinningTanguero(null);

        const drawInterval = setInterval(() => {
            setWinningTanguera(Math.floor(Math.random() * tangueras) + 1);
            setWinningTanguero(Math.floor(Math.random() * tangueros) + 1);
        }, 100);

        setTimeout(() => {
            clearInterval(drawInterval);
            setIsDrawing(false);
        }, 3000);
    };

    return (
        <div className="bg-gray-100 min-h-full flex flex-col">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 flex items-center sticky top-0 z-10 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 mx-auto pr-10">{t('eventRaffle')}</h2>
            </header>

            <main className="p-4 flex-grow flex flex-col justify-center items-center">
                <div className="w-full max-w-sm">
                    {winningTanguera === null && !isDrawing && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-lg font-bold text-red-600 mb-1">
                                    <FemaleIcon /> {t('numTangueras')}
                                </label>
                                <input
                                    type="number"
                                    value={numTangueras}
                                    onChange={(e) => setNumTangueras(e.target.value)}
                                    placeholder="e.g., 50"
                                    className="w-full text-center text-xl p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-lg font-bold text-blue-600 mb-1">
                                    <MaleIcon /> {t('numTangueros')}
                                </label>
                                <input
                                    type="number"
                                    value={numTangueros}
                                    onChange={(e) => setNumTangueros(e.target.value)}
                                    placeholder="e.g., 50"
                                    className="w-full text-center text-xl p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button onClick={handleRaffle} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg text-lg transition-transform transform hover:scale-105">
                                {t('startRaffle')}
                            </button>
                        </div>
                    )}

                    {(isDrawing || winningTanguera !== null) && (
                        <div className="text-center">
                             <h3 className="text-3xl font-bold text-gray-800 mb-6">{isDrawing ? t('drawing') : t('raffleWinner')}</h3>
                            <div className="flex justify-center gap-4">
                                <div className="flex flex-col items-center">
                                    <h4 className="text-xl font-bold text-red-600 mb-2">{t('tangueraWinner')}</h4>
                                    <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center border-4 border-red-500">
                                        <span className="text-6xl font-black text-red-600">{winningTanguera}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h4 className="text-xl font-bold text-blue-600 mb-2">{t('tangueroWinner')}</h4>
                                    <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center border-4 border-blue-500">
                                        <span className="text-6xl font-black text-blue-600">{winningTanguero}</span>
                                    </div>
                                </div>
                            </div>
                            {!isDrawing && (
                                <button onClick={handleRaffle} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105">
                                    {t('drawAgain')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MilongaRaffleView;
