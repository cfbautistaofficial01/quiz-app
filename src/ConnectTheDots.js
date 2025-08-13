// src/ConnectTheDots.js
import React, { useState, useEffect } from 'react';

const initialLogCards = [
  {
    id: 'log_a',
    order: 1,
    source: 'Email Security Gateway',
    timestamp: '1:15 PM',
    details: "Sender: attacker@evilcorp.com\nRecipient: employee@yourcompany.com\nSubject: Urgent: Unpaid Invoice",
    color: 'bg-blue-100',
    borderColor: 'border-blue-400'
  },
  {
    id: 'log_c',
    order: 2,
    source: 'EDR / Sysmon',
    timestamp: '1:16 PM',
    details: "Host: DESKTOP-EMP01\nParentProcess: outlook.exe\nProcess: powershell.exe",
    color: 'bg-red-100',
    borderColor: 'border-red-400'
  },
  {
    id: 'log_b',
    order: 3,
    source: 'Firewall',
    timestamp: '1:17 PM',
    details: "Src_IP: 192.168.1.55\nDst_IP: 123.123.123.123\nAction: Allowed",
    color: 'bg-green-100',
    borderColor: 'border-green-400'
  },
];

// Function to shuffle an array
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const ConnectTheDots = () => {
  const [logCards, setLogCards] = useState(shuffleArray(initialLogCards));
  const [solutionSlots, setSolutionSlots] = useState([null, null, null]);
  const [feedback, setFeedback] = useState('');

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData("cardId", cardId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const card = logCards.find(c => c.id === cardId);

    if (card && !solutionSlots[slotIndex]) {
      const newSlots = [...solutionSlots];
      newSlots[slotIndex] = card;
      setSolutionSlots(newSlots);
      setLogCards(logCards.filter(c => c.id !== cardId));
    }
  };

  const checkSolution = () => {
    if (solutionSlots.some(slot => slot === null)) return; // Don't check if not full

    const isCorrect = solutionSlots.every((slot, index) => slot.order === index + 1);
    if (isCorrect) {
      setFeedback("Correct! You've uncovered the full attack chain: Phishing Email -> Malicious Script -> Network Connection.");
    } else {
      setFeedback("Not quite right. The order of events is incorrect. Try resetting and analyzing the timestamps again.");
    }
  };
  
  // Check the solution whenever the slots are updated
  useEffect(() => {
    checkSolution();
  }, [solutionSlots]);

  const handleReset = () => {
    setLogCards(shuffleArray(initialLogCards));
    setSolutionSlots([null, null, null]);
    setFeedback('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-2">Activity: Connect the Dots</h1>
      <p className="text-center text-gray-600 mb-6">Drag the log cards into the correct order on the timeline to uncover the attack chain.</p>

      {/* Solution Timeline */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Attack Timeline</h2>
        <div className="grid grid-cols-3 gap-4">
          {solutionSlots.map((card, index) => (
            <div
              key={index}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`h-48 flex items-center justify-center rounded-lg border-2 border-dashed ${card ? 'border-transparent' : 'border-gray-400'}`}
            >
              {card ? (
                <div className={`w-full h-full p-3 rounded-lg shadow-md ${card.color} border ${card.borderColor}`}>
                  <p className="font-bold text-gray-800">{card.source}</p>
                  <p className="text-sm font-semibold text-gray-600">{card.timestamp}</p>
                  <pre className="text-xs text-gray-700 mt-2 whitespace-pre-wrap">{card.details}</pre>
                </div>
              ) : (
                <span className="text-gray-500">Drop Event #{index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Log Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-center">Available Log Entries</h2>
        <div className="flex justify-center gap-4 min-h-[12rem]">
          {logCards.map(card => (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => handleDragStart(e, card.id)}
              className={`w-1/3 p-3 rounded-lg shadow-md cursor-grab ${card.color} border ${card.borderColor}`}
            >
              <p className="font-bold text-gray-800">{card.source}</p>
              <p className="text-sm font-semibold text-gray-600">{card.timestamp}</p>
              <pre className="text-xs text-gray-700 mt-2 whitespace-pre-wrap">{card.details}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback and Reset */}
      {feedback && (
        <div className={`mt-6 p-4 rounded-lg text-center font-semibold ${feedback.startsWith('Correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {feedback}
        </div>
      )}
      <div className="text-center mt-6">
        <button onClick={handleReset} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          Reset Activity
        </button>
      </div>
    </div>
  );
};

export default ConnectTheDots;
