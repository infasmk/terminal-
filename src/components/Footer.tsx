import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-6 bg-[#0a0c0b] border-t border-[#1e1e1e] flex items-center justify-between px-4 text-[9px] text-gray-600 font-mono select-none z-20 shrink-0">
      <div>LOC: 37.7749° N, 122.4194° W</div>
      <div className="flex space-x-6 hidden sm:flex">
        <span>THROUGHPUT: 4.2 MB/S</span>
        <span>ERRORS: 0</span>
        <span>DB_COMMIT: 78F1A</span>
      </div>
      <div className="text-green-900 font-bold">SYSTEMS NOMINAL</div>
    </footer>
  );
};
