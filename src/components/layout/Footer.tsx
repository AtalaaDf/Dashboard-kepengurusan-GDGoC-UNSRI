import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-auto flex flex-col items-center justify-center gap-4">
      <img
        src="/logoGDG.png"
        alt="GDG on Campus Universitas Sriwijaya"
        className="h-7 w-auto object-contain"
      />
      <div className="flex items-center gap-1 w-24">
        <span className="h-1 flex-1 bg-[#4285f4] rounded-full" />
        <span className="h-1 flex-1 bg-[#ea4335] rounded-full" />
        <span className="h-1 flex-1 bg-[#f9ab00] rounded-full" />
        <span className="h-1 flex-1 bg-[#34a853] rounded-full" />
      </div>
      <p className="text-xs text-[#1e1e1e]/60 text-center">
        &copy; {currentYear} Google Developer Group on Campus - Universitas Sriwijaya
      </p>
    </footer>
  );
};

