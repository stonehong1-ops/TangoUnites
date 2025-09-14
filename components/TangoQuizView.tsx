import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI, Type } from '@google/genai';
import { User } from '../types';

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type QuizState = 'idle' | 'loading' | 'active' | 'finished' | 'error';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    difficulty: number; // 1 to 4
}

interface TangoQuizViewProps {
    onBack: () => void;
    currentUser: User | null;
    onUpdateUserPoints: (points: number) => void;
}

const TangoQuizView: React.FC<TangoQuizViewProps> = ({ onBack, currentUser, onUpdateUserPoints }) => {
    const { t } = useLanguage();
    const [state, setState] = useState<QuizState>('idle');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [pointsEarned, setPointsEarned] = useState(0);

    const generateQuiz = useCallback(async () => {
        setState('loading');
        try {
            const prompt = "Create 5 multiple-choice questions about Argentine Tango dance and music, with varying difficulty from easy to expert. Questions should be in Korean.";
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswerIndex: { type: Type.INTEGER },
                                difficulty: { type: Type.INTEGER, description: "Difficulty from 1 (easy) to 4 (expert)" }
                            },
                            required: ["question", "options", "correctAnswerIndex", "difficulty"]
                        }
                    }
                },
            });

            // FIX: Add type assertion to JSON.parse to fix 'unknown' type errors and improve type safety.
            const quizData = JSON.parse(response.text) as QuizQuestion[];
            if (Array.isArray(quizData) && quizData.length > 0) {
                setQuestions(quizData);
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setScore(0);
                setPointsEarned(0);
                setState('active');
            } else {
                 throw new Error("Invalid quiz data format");
            }
        } catch (error) {
            console.error("Error generating quiz:", error);
            setState('error');
        }
    }, []);

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex;

        if (isCorrect) {
            const points = (currentQuestion.difficulty || 1) * 5;
            setScore(s => s + 1);
            setPointsEarned(p => p + points);
        }
        setIsAnswered(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            // Quiz finished
            onUpdateUserPoints(pointsEarned);
            setState('finished');
        }
    };

    const handleTryAgain = () => {
        generateQuiz();
    };

    const currentQuestion = questions[currentQuestionIndex];
    
    const getButtonClass = (index: number) => {
        if (!isAnswered) {
            return selectedAnswer === index ? 'bg-blue-600 text-white ring-2 ring-blue-700' : 'bg-white hover:bg-gray-100';
        }
        // After answer is submitted
        if (index === currentQuestion.correctAnswerIndex) {
            return 'bg-green-500 text-white';
        }
        if (index === selectedAnswer) {
            return 'bg-red-500 text-white';
        }
        return 'bg-white opacity-60';
    };

    const renderContent = () => {
        switch (state) {
            case 'loading':
                return <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>;
            case 'error':
                return (
                     <div className="text-center">
                        <p className="text-red-600 mb-4">Failed to load quiz.</p>
                        <button onClick={handleTryAgain} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full">{t('tryAgain')}</button>
                    </div>
                );
            case 'finished':
                return (
                    <div className="text-center bg-white p-8 rounded-xl shadow-lg border w-full">
                        <h3 className="text-2xl font-bold text-gray-800">{t('finalScore')}</h3>
                        <p className="text-5xl font-bold my-4">{score} / {questions.length}</p>
                        <p className="text-lg font-semibold text-green-600">{t('youEarnedPoints').replace('{points}', pointsEarned.toString())}</p>
                        <p className="text-sm text-gray-500">{t('totalPoints')}: { currentUser?.points || 0 }</p>
                        <div className="mt-8 flex gap-4">
                            <button onClick={handleTryAgain} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full">{t('tryAgain')}</button>
                            <button onClick={onBack} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-full">{t('exitQuiz')}</button>
                        </div>
                    </div>
                );
            case 'active':
                return (
                    <div className="w-full">
                        <p className="text-center font-semibold text-gray-500 mb-2">{t('questionOf').replace('{current}', (currentQuestionIndex + 1).toString()).replace('{total}', questions.length.toString())}</p>
                        <div className="bg-white p-6 rounded-xl shadow-lg border">
                            <p className="text-lg font-bold text-gray-800 mb-6 min-h-[5rem]">{currentQuestion.question}</p>
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedAnswer(index)}
                                        disabled={isAnswered}
                                        className={`w-full text-left p-4 rounded-lg font-semibold text-gray-800 border transition-all duration-200 ${getButtonClass(index)}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            {isAnswered ? (
                                <div>
                                    {selectedAnswer === currentQuestion.correctAnswerIndex ? (
                                        <p className="text-green-600 font-bold text-xl">{t('correctAnswer')}</p>
                                    ) : (
                                        <p className="text-red-600 font-bold text-xl">{t('incorrectAnswer')}</p>
                                    )}
                                    <button onClick={handleNextQuestion} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105">
                                        {currentQuestionIndex === questions.length - 1 ? t('finalScore') : t('nextQuestion')}
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full disabled:bg-gray-300 transition-transform transform hover:scale-105">
                                    {t('submitAnswer')}
                                </button>
                            )}
                        </div>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800">{t('tangoQuiz')}</h3>
                        <p className="text-gray-600 mt-2 mb-8">{t('tangoQuizDescription')}</p>
                        <button onClick={generateQuiz} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg">
                            {t('startQuiz')}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="bg-gray-100 min-h-full flex flex-col">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 flex items-center sticky top-0 z-10 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 mx-auto pr-10">{t('tangoQuiz')}</h2>
            </header>
            <main className="p-4 flex-grow flex items-center justify-center">
                {renderContent()}
            </main>
        </div>
    );
};

export default TangoQuizView;
