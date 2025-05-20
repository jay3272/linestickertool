// components/HistoryControls.js
import React from 'react';

export default function HistoryControls({ onUndo, onRedo, canUndo, canRedo }) {
  return (
    <div className="history-controls flex gap-2 mt-3">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`px-3 py-1 rounded ${canUndo ? 'bg-gray-300' : 'bg-gray-100 text-gray-400'}`}
      >
        ⬅ 復原
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`px-3 py-1 rounded ${canRedo ? 'bg-gray-300' : 'bg-gray-100 text-gray-400'}`}
      >
        重做 ➡
      </button>
    </div>
  );
}
