// components/CropSizeOptions.js
import React from 'react';

const options = [
  { label: '自由裁剪', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
];

export default function CropSizeOptions({ selected, onChange }) {
  return (
    <div className="crop-size-options space-x-2 p-2">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`px-3 py-1 rounded ${
            selected === opt.value ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
