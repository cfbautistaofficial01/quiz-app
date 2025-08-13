// src/App.js
import React, { useState, useEffect } from 'react';
import CastleGame from './CastleGame';
import QuizDay2 from './QuizDay2';
import ResultsViewer from './ResultsViewer';
import ConnectTheDots from './ConnectTheDots'; // Import the new activity
import { db, auth } from './firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { seedDatabase } from './seed';

// This is the component for the Day 1 Quiz activity
const QuizDay1 = () => {
  // ... code for QuizDay1 remains exactly the same
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [step, setStep] = useState('identify');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [justification, setJustification] = useState('');
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const initializeQuiz = async () => {
      await signInAnonymously(auth);
      onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
      await seedDatabase(db);
      const scenariosCollection = collection(db, 'scenarios');
      const scenarioSnapshot = await getDocs(scenariosCollection);
      const scenarioList = scenarioSnapshot.docs.map(doc => doc.data());
      setScenarios(scenarioList);
      setLoading(false);
    };
    initializeQuiz().catch(console.error);
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) setIsNameSet(true);
  };

  const handleThreatSelect = (option) => {
    setSelectedThreat(option);
    setStep('justify');
  };

  const handleJustificationSubmit = (e) => {
    e.preventDefault();
    const currentScenario = scenarios[currentQuestion];
    let roundScore = 0;
    if (selectedThreat === currentScenario.answer) roundScore = 1;

    const newSubmission = {
        question: currentScenario.scenario,
        selectedAnswer: selectedThreat,
        correctAnswer: currentScenario.answer,
        justification: justification,
        isCorrect: selectedThreat === currentScenario.answer
    };
    setSubmissions([...submissions, newSubmission]);
    
    setScore(score + roundScore);
    setFeedback(currentScenario.explanation);
    setStep('feedback');
  };

  const handleNext = async () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < scenarios.length) {
      setCurrentQuestion(nextQuestion);
      resetStep();
    } else {
      if (user) {
        await addDoc(collection(db, "scores_day1"), {
          uid: user.uid,
          name: userName,
          score: score,
          total: scenarios.length,
          timestamp: new Date(),
          submissions: submissions
        });
      }
      setShowResults(true);
    }
  };

  const resetStep = () => {
    setStep('identify');
    setSelectedThreat(null);
    setJustification('');
    setFeedback('');
  };
  
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    resetStep();
    setShowResults(false);
    setSubmissions([]);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-lg">Loading Quiz...</p></div>;
  if (!loading && scenarios.length === 0) return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-red-500">Error: Could not load quiz scenarios.</p></div>;

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Day 1 Activity</h1>
          <p className="text-gray-600 mb-6">Please enter your name to begin.</p>
          <form onSubmit={handleNameSubmit}>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your Name" className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-teal-500" />
            <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">Start Quiz</button>
          </form>
        </div>
      </div>
    );
  }
  
  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Quiz Complete, {userName}!</h1>
        <p className="text-2xl mb-8">You scored {score} out of {scenarios.length}</p>
        <button onClick={restartQuiz} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">Try Again</button>
      </div>
    );
  }

  const currentScenario = scenarios[currentQuestion];

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-xl font-semibold text-gray-500 mb-2">Scenario {currentQuestion + 1} of {scenarios.length}</h2>
        <p className="text-2xl text-gray-800 mb-6 min-h-[100px]">{currentScenario.scenario}</p>
        
        {step === 'identify' && (
          <div>
            <h3 className="font-bold text-lg mb-3">Step 1: Identify the Threat Type</h3>
            <div className="space-y-4">
              {currentScenario.options.map((option, index) => (
                <button key={index} onClick={() => handleThreatSelect(option)} className="w-full text-left p-4 rounded-lg border-2 bg-gray-50 hover:bg-teal-50 border-gray-200 transition-all">
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'justify' && (
          <div>
            <h3 className="font-bold text-lg mb-3">Step 2: Justify Your Answer</h3>
            <p className="text-gray-600 mb-3">You selected <span className="font-bold text-teal-600">{selectedThreat}</span>. In one sentence, why do you think this is the case?</p>
            <form onSubmit={handleJustificationSubmit}>
              <textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="e.g., Because the email address looks suspicious..." className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-teal-500" rows="3"></textarea>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">Submit Justification</button>
            </form>
          </div>
        )}

        {step === 'feedback' && (
          <div>
            <div className={`p-4 rounded-lg mb-6 ${selectedThreat === currentScenario.answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <h3 className="font-bold mb-2">Analysis Results:</h3>
              <p className="mb-2">You chose: <span className="font-semibold">{selectedThreat}</span>. The correct answer was: <span className="font-semibold">{currentScenario.answer}</span>.</p>
              <p><span className="font-bold">Explanation:</span> {feedback}</p>
            </div>
            <button onClick={handleNext} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">
              {currentQuestion + 1 < scenarios.length ? 'Next Scenario' : 'Finish & See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// Main App component that acts as a router
function App() {
    const [currentView, setCurrentView] = useState('menu');

    const renderView = () => {
        switch (currentView) {
            case 'quiz_day1': return <QuizDay1 />;
            case 'quiz_day2': return <QuizDay2 />;
            case 'game': return <CastleGame />;
            case 'connect_dots': return <ConnectTheDots />; // New case for the new activity
            case 'results': return <ResultsViewer />;
            default:
                return (
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">Class Activities</h1>
                        <p className="text-gray-600 mb-8">Please choose an activity to begin.</p>
                        <div className="space-y-4">
                            <button onClick={() => setCurrentView('quiz_day1')} className="w-full max-w-xs bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">Day 1: Threat or Not? Quiz</button>
                            <button onClick={() => setCurrentView('game')} className="w-full max-w-xs bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">Day 2: Secure the Castle</button>
                            <button onClick={() => setCurrentView('connect_dots')} className="w-full max-w-xs bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">Day 2: Connect the Dots</button>
                            <button onClick={() => setCurrentView('quiz_day2')} className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">Day 2: Triage & Assess Quiz</button>
                        </div>
                        <div className="mt-8 border-t pt-6">
                             <button onClick={() => setCurrentView('results')} className="w-full max-w-xs bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">
                                View Student Results
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
            {currentView !== 'menu' && (
                 <button onClick={() => setCurrentView('menu')} className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">&larr; Back to Menu</button>
            )}
            {renderView()}
        </div>
    );
}

export default App;
