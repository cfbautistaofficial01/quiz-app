// src/CastleGame.js
import React, { useState, useRef } from 'react';
// No longer need to import the image here

const CastleGame = () => {
  // State to hold the list of notes
  const [notes, setNotes] = useState([]);
  // State for the text of a new note
  const [newNoteText, setNewNoteText] = useState('');
  // Ref to the main game area to calculate positions
  const gameAreaRef = useRef(null);

  // Function to add a new note
  const handleAddNote = () => {
    if (newNoteText.trim() === '') return; // Don't add empty notes
    const newNote = {
      id: Date.now(), // Simple unique ID
      text: newNoteText,
      x: 50, // Initial X position
      y: 50, // Initial Y position
    };
    setNotes([...notes, newNote]);
    setNewNoteText(''); // Clear the input field
  };

  // When you start dragging a note, store its ID
  const handleDragStart = (e, noteId) => {
    e.dataTransfer.setData("noteId", noteId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  // When you drop a note, update its position
  const handleDrop = (e) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("noteId");
    const gameAreaBounds = gameAreaRef.current.getBoundingClientRect();

    // Calculate the new X and Y based on drop position relative to the game area
    const newX = e.clientX - gameAreaBounds.left;
    const newY = e.clientY - gameAreaBounds.top;

    // Update the state for the specific note that was moved
    setNotes(notes.map(note => 
      note.id === parseInt(noteId) ? { ...note, x: newX, y: newY } : note
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-2">Activity: Alarm the Castle!</h1>
      <p className="text-center text-gray-600 mb-4">Add notes to represent digital alarm systems. Drag them to where you think they belong on the castle diagram.</p>

      {/* Input Controls */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Type your alarm idea here..."
          className="flex-grow p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={handleAddNote}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Add Note
        </button>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative w-full aspect-video bg-cover bg-center rounded-lg border-2"
        style={{ backgroundImage: `url('${process.env.PUBLIC_URL}/images/castle.png')` }}
      >
        {/* Render all the notes */}
        {notes.map(note => (
          <div
            key={note.id}
            draggable
            onDragStart={(e) => handleDragStart(e, note.id)}
            className="absolute p-3 bg-yellow-200 border border-yellow-400 rounded-md shadow-lg cursor-grab"
            style={{ 
              left: `${note.x}px`, 
              top: `${note.y}px`,
              transform: 'translate(-50%, -50%)' // Center the note on the cursor
            }}
          >
            {note.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastleGame;
