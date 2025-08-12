// src/CastleGame.js
import React from 'react';

const CastleGame = () => {
  const tools = [
    { id: 'firewall', name: 'Firewall', description: 'Controls incoming and outgoing network traffic at the main gate.' },
    { id: 'ids', name: 'IDS / IPS', description: 'Monitors network traffic for suspicious activity along the walls.' },
    { id: 'edr', name: 'EDR', description: 'Protects individual devices (endpoints) inside the towers.' },
  ];

  const dropZones = [
    { id: 'gate', name: 'Main Gate', accepts: 'firewall', top: '70%', left: '42%' },
    { id: 'walls', name: 'Castle Walls', accepts: 'ids', top: '50%', left: '15%' },
    { id: 'towers', name: 'Towers', accepts: 'edr', top: '25%', left: '70%' },
  ];

  const [droppedTools, setDroppedTools] = React.useState({});

  const handleDragStart = (e, toolId) => {
    e.dataTransfer.setData("toolId", toolId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    const toolId = e.dataTransfer.getData("toolId");
    if (zone.accepts === toolId) {
      setDroppedTools(prev => ({ ...prev, [toolId]: zone.id }));
    }
  };

  const isToolPlaced = (toolId) => !!droppedTools[toolId];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-2">Activity: Secure the Castle</h1>
      <p className="text-center text-gray-600 mb-6">Drag each security tool to its correct location on the castle diagram.</p>

      {/* Game Area */}
      <div className="relative w-full aspect-video bg-cover bg-center rounded-lg border-2" style={{ backgroundImage: `url('/castle.png')` }}>
        {dropZones.map(zone => (
          <div
            key={zone.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, zone)}
            className="absolute w-24 h-24 border-2 border-dashed border-yellow-400 rounded-full flex items-center justify-center text-center text-white bg-black bg-opacity-50"
            style={{ top: zone.top, left: zone.left, transform: 'translate(-50%, -50%)' }}
          >
            {zone.name}
          </div>
        ))}
        {Object.entries(droppedTools).map(([toolId, zoneId]) => {
            const tool = tools.find(t => t.id === toolId);
            const zone = dropZones.find(z => z.id === zoneId);
            return (
                 <div key={toolId} className="absolute p-2 bg-green-500 text-white rounded-lg shadow-xl" style={{ top: zone.top, left: zone.left, transform: 'translate(-50%, -50%)' }}>
                    <p className="font-bold text-sm">{tool.name}</p>
                </div>
            )
        })}
      </div>

      {/* Draggable Tools Area */}
      <div className="mt-6 flex justify-around p-4 bg-gray-100 rounded-lg">
        {tools.map(tool => (
          !isToolPlaced(tool.id) && (
            <div
              key={tool.id}
              id={tool.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tool.id)}
              className="p-4 bg-teal-500 text-white rounded-lg shadow-md cursor-grab w-1/4 text-center mx-2"
            >
              <p className="font-bold">{tool.name}</p>
              <p className="text-xs mt-1">{tool.description}</p>
            </div>
          )
        ))}
      </div>
      
      {Object.keys(droppedTools).length === tools.length && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg text-center">
            <h2 className="text-2xl font-bold">Castle Secured!</h2>
            <p>Great job! You've correctly placed all the security tools.</p>
        </div>
      )}
    </div>
  );
};

export default CastleGame;
