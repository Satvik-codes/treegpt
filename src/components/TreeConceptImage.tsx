import React from 'react';

function TreeConceptImage() {
  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto flex items-center justify-center">
      <img
        src="/tree.png"
        alt="Tree Concept"
        className="w-full h-full object-contain"
      />
      {/* Node labels — NO backdrop-blur or drop-shadow to avoid GPU freeze */}
      <div
        className="absolute transition-all duration-500 ease-in-out hover:scale-105"
        style={{ top: '80%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="font-mono text-[10px] text-[#c8913a] bg-[#0a0e08] px-2.5 py-1 rounded border border-[#c8913a]/30">
          PROBLEM
        </div>
      </div>
      <div
        className="absolute transition-all duration-500 ease-in-out hover:scale-105"
        style={{ top: '65%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="font-mono text-[9px] text-[#c8913a] bg-[#0a0e08] px-2 py-1 rounded border border-[#c8913a]/30">
          EXPLORE
        </div>
      </div>
      <div
        className="absolute transition-all duration-500 ease-in-out hover:scale-105"
        style={{ top: '48%', left: '30%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="font-mono text-[8px] text-[#e0d4bc] bg-[#0a0e08] px-2 py-1 rounded border border-[#c8913a]/20">
          APPROACH A
        </div>
      </div>
      <div
        className="absolute transition-all duration-500 ease-in-out hover:scale-105"
        style={{ top: '48%', left: '70%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="font-mono text-[8px] text-[#e0d4bc] bg-[#0a0e08] px-2 py-1 rounded border border-[#c8913a]/20">
          APPROACH B
        </div>
      </div>
      <div
        className="absolute transition-all duration-500 ease-in-out hover:scale-105"
        style={{ top: '30%', left: '25%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="font-mono text-[7.5px] text-[#b8b09a] bg-[#0a0e08] px-1.5 py-0.5 rounded border border-[#c8913a]/15">
          SOLUTION 1
        </div>
      </div>
      <div
        className="absolute transition-all duration-500 ease-in-out hover:scale-105"
        style={{ top: '22%', left: '80%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="font-mono text-[7.5px] text-[#8db57a] bg-[#0a0e08] px-1.5 py-0.5 rounded border border-[#6b8f5a]/30">
          ✓ SOLUTION
        </div>
      </div>
    </div>
  );
}

export default React.memo(TreeConceptImage);
