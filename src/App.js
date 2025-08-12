// src/App.js
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { seedDatabase } from './seed';

function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await signInAnonymously(auth).catch(console.error);
      onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
      await seedDatabase(db);
      const scenariosCollection = collection(db, 'scenarios');
      const scenarioSnapshot = await getDocs(scenariosCollection);
      const scenarioList = scenarioSnapshot.docs.map(doc => doc.data());
      setScenarios(scenarioList);
      setLoading(false);
    };
    initializeApp();
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) setIsNameSet(true);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    const currentScenario = scenarios[currentQuestion];
    if (option === currentScenario.answer) {
      setScore(score + 1);
      setFeedback(currentScenario.explanation || 'Correct!');
    } else {
      setFeedback(`Not quite. The correct answer is ${currentScenario.answer}. ${currentScenario.explanation || ''}`);
    }
  };

  const handleNext = async () => {
    if (currentQuestion + 1 < scenarios.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setFeedback('');
    } else {
      if (user) {
        await addDoc(collection(db, "scores"), {
          uid: user.uid,
          name: userName,
          score: score,
          total: scenarios.length,
          timestamp: new Date()
        });
      }
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setFeedback('');
    setShowResults(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-lg">Loading Quiz...</p></div>;

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
          <p className="text-gray-600 mb-6">Please enter your name to begin the quiz.</p>
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
        <div className="space-y-4 mb-6">
          {currentScenario.options.map((option, index) => (
            <button key={index} onClick={() => handleOptionSelect(option)} disabled={selectedOption !== null} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedOption === null ? 'bg-gray-50 hover:bg-teal-50 border-gray-200' : option === currentScenario.answer ? 'bg-green-100 border-green-500 text-green-800 font-bold' : option === selectedOption ? 'bg-red-100 border-red-500 text-red-800' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              {option}
            </button>
          ))}
        </div>
        {feedback && <div className={`p-4 rounded-lg mb-6 text-center ${scenarios[currentQuestion].answer === selectedOption ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{feedback}</div>}
        {selectedOption && <button onClick={handleNext} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">{currentQuestion + 1 < scenarios.length ? 'Next Scenario' : 'Finish & See Results'}</button>}
      </div>
    </div>
  );
}

export default App;