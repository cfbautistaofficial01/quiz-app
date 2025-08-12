// src/ResultsViewer.js
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const ResultsViewer = () => {
  const [day1Scores, setDay1Scores] = useState([]);
  const [day2Scores, setDay2Scores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null); // To track which row is open

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const day1Query = query(collection(db, "scores_day1"), orderBy("timestamp", "desc"));
        const day1Snapshot = await getDocs(day1Query);
        const day1List = day1Snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDay1Scores(day1List);

        const day2Query = query(collection(db, "scores_day2"), orderBy("timestamp", "desc"));
        const day2Snapshot = await getDocs(day2Query);
        const day2List = day2Snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDay2Scores(day2List);

      } catch (error) {
        console.error("Error fetching scores:", error);
      }
      setLoading(false);
    };

    fetchScores();
  }, []);

  const ScoreTable = ({ title, scores }) => (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Score
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Submitted On
              </th>
            </tr>
          </thead>
          <tbody>
            {scores.length > 0 ? (
              scores.map(score => (
                <React.Fragment key={score.id}>
                  <tr onClick={() => setExpandedRow(expandedRow === score.id ? null : score.id)} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{score.name}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{score.score} / {score.total}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">
                        {score.timestamp ? new Date(score.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                      </p>
                    </td>
                  </tr>
                  {expandedRow === score.id && (
                    <tr>
                      <td colSpan="3" className="p-4 bg-gray-50 border-l-4 border-teal-500">
                        <h4 className="font-bold text-md mb-2">Detailed Submissions:</h4>
                        {score.submissions && score.submissions.length > 0 ? (
                          <ul className="space-y-3">
                            {score.submissions.map((sub, index) => (
                              <li key={index} className="p-3 bg-white rounded shadow-sm border">
                                <p className="text-xs text-gray-500 truncate">Q: {sub.question}</p>
                                <p className="font-semibold">Selected: <span className={sub.isCorrect ? 'text-green-600' : 'text-red-600'}>{sub.selectedAnswer}</span></p>
                                <p className="text-sm text-gray-700 mt-1"><span className="font-semibold">Justification:</span> {sub.justification || "No justification provided."}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No detailed justifications were saved for this submission.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-10 text-gray-500">No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center p-10"><p className="text-lg">Loading Results...</p></div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-10">Student Submissions</h1>
      <ScoreTable title="Day 1: Threat or Not? Quiz" scores={day1Scores} />
      <ScoreTable title="Day 2: Triage & Assess Quiz" scores={day2Scores} />
    </div>
  );
};

export default ResultsViewer;
