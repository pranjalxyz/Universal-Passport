import React from 'react';
import { Shield, Hexagon } from 'lucide-react';

const NavBar: React.FC = () => {
  return (
    <nav className="w-full border-b border-slate-700 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
               <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Midnight Passport</h1>
                <p className="text-xs text-indigo-300">Architecture Demo v1.0.0-rc1</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-slate-300">Testnet: Active</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                <Hexagon className="w-3 h-3 text-purple-400" />
                <span className="text-xs font-mono text-slate-300">DUST: 450.0</span>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;