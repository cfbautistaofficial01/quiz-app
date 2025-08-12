// src/QuizDay2.js
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { seedDay2Database } from './seed_day2';

const QuizDay2 = () => {
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  
  const [step, setStep] = useState('identify');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const severityOptions = ["Low", "Medium", "High", "Critical"];

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    const initializeQuiz = async () => {
      await seedDay2Database(db);
      const scenariosCollection = collection(db, 'scenarios_day2');
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
    setStep('assess');
  };

  const handleSeveritySelect = (severity) => {
    const currentScenario = scenarios[currentQuestion];
    let explanationText = '';
    let roundScore = 0;

    if (selectedThreat === currentScenario.answer) {
      explanationText += `Threat ID: Correct! `;
      roundScore += 1;
    } else {
      explanationText += `Threat ID: Incorrect. The answer was ${currentScenario.answer}. `;
    }

    if (severity === currentScenario.severity) {
      explanationText += `Severity: Correct! `;
      roundScore += 1;
    } else {
      explanationText += `Severity: Incorrect. The correct severity was ${currentScenario.severity}.`;
    }
    
    setScore(score + roundScore);
    setFeedback(explanationText + ` | Full Explanation: ${currentScenario.explanation}`);
    setStep('feedback');
  };

  const handleNext = async () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < scenarios.length) {
      setCurrentQuestion(nextQuestion);
      resetStep();
    } else {
      if (user) {
        await addDoc(collection(db, "scores_day2"), {
          uid: user.uid,
          name: userName,
          score: score,
          total: scenarios.length * 2,
          timestamp: new Date()
        });
      }
      setShowResults(true);
    }
  };

  const resetStep = () => {
    setStep('identify');
    setSelectedThreat(null);
    setFeedback('');
  };
  
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    resetStep();
    setShowResults(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-lg">Loading Quiz...</p></div>;
  if (!loading && scenarios.length === 0) return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-red-500">Error: Could not load quiz scenarios.</p></div>;

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Day 2 Activity</h1>
          <p className="text-gray-600 mb-6">Please enter your name to begin.</p>
          <form onSubmit={handleNameSubmit}>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your Name" className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-teal-500" />
            <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">Start Activity</button>
          </form>
        </div>
      </div>
    );
  }
  
  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Activity Complete, {userName}!</h1>
        <p className="text-2xl mb-8">You scored {score} out of {scenarios.length * 2}</p>
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

        {step === 'assess' && (
          <div>
            <h3 className="font-bold text-lg mb-3">Step 2: Assess the Severity</h3>
            <div className="space-y-4">
              {severityOptions.map((option, index) => (
                <button key={index} onClick={() => handleSeveritySelect(option)} className="w-full text-left p-4 rounded-lg border-2 bg-gray-50 hover:bg-orange-50 border-gray-200 transition-all">
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'feedback' && (
          <div>
            <div className="p-4 rounded-lg mb-6 bg-blue-50 text-blue-800">
              <h3 className="font-bold mb-2">Analysis Results:</h3>
              <p>{feedback}</p>
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

export default QuizDay2;
