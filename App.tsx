import React, { useState } from 'react';
import { Layers, Terminal, Code2, Activity, Coins, MessageSquare } from 'lucide-react';
import NavBar from './components/NavBar';
import CodeViewer from './components/CodeViewer';
import Simulation from './components/Simulation';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import AIChat from './components/AIChat';
import { COMPACT_CODE, WITNESS_CODE, DEPLOYMENT_STEPS, TOKENOMICS_INFO } from './constants';
import { TabView } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>(TabView.SIMULATION);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100 overflow-hidden">
      <NavBar />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
            {/* Tab Navigation */}
            <div className="px-4 sm:px-8 py-6">
                <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-1">
                    <TabButton 
                        active={activeTab === TabView.SIMULATION} 
                        onClick={() => setActiveTab(TabView.SIMULATION)}
                        icon={<Activity size={16} />}
                        label="Live Simulation"
                    />
                    <TabButton 
                        active={activeTab === TabView.CONTRACT} 
                        onClick={() => setActiveTab(TabView.CONTRACT)}
                        icon={<Code2 size={16} />}
                        label="Smart Contract"
                    />
                    <TabButton 
                        active={activeTab === TabView.WITNESS} 
                        onClick={() => setActiveTab(TabView.WITNESS)}
                        icon={<Terminal size={16} />}
                        label="Witness Logic"
                    />
                    <TabButton 
                        active={activeTab === TabView.ARCHITECTURE} 
                        onClick={() => setActiveTab(TabView.ARCHITECTURE)}
                        icon={<Layers size={16} />}
                        label="Architecture"
                    />
                     <TabButton 
                        active={activeTab === TabView.TOKENOMICS} 
                        onClick={() => setActiveTab(TabView.TOKENOMICS)}
                        icon={<Coins size={16} />}
                        label="Tokenomics"
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto h-full">
                    
                    {activeTab === TabView.SIMULATION && <Simulation />}
                    
                    {activeTab === TabView.CONTRACT && (
                        <div className="h-full flex flex-col gap-4">
                            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-sm text-blue-200 mb-2">
                                <strong className="block mb-1 text-blue-100">Senior Architect Note:</strong>
                                This <code>.compact</code> file defines the circuit constraints. The <code>verifyIdentity</code> circuit is exported for the client to generate proofs against, while the <code>registerIdentity</code> function acts as the state transition on the ledger.
                            </div>
                            <CodeViewer code={COMPACT_CODE} language="compact" filename="passport.compact" />
                        </div>
                    )}

                    {activeTab === TabView.WITNESS && (
                         <div className="h-full flex flex-col gap-6">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Client-Side Witness Provider</h3>
                                <p className="text-slate-400 max-w-3xl">
                                    This code implements the <strong>Witness Provider</strong> pattern. It defines a <code>PrivateState</code> interface (the local vault) and maps the Compact circuit's witness functions to secure TypeScript logic. This ensures private data like the <code>secret_key</code> never leaves the user's execution context.
                                </p>
                            </div>
                            <CodeViewer code={WITNESS_CODE} language="typescript" filename="client/witness.ts" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {DEPLOYMENT_STEPS.map((step, idx) => (
                                    <div key={idx} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                        <h4 className="font-bold text-indigo-400 text-sm mb-2">{step.title}</h4>
                                        <code className="block bg-black/50 p-2 rounded text-xs font-mono text-green-400 mb-2">{step.cmd}</code>
                                        <p className="text-xs text-slate-500">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === TabView.ARCHITECTURE && <ArchitectureDiagram />}

                    {activeTab === TabView.TOKENOMICS && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-start">
                            <div className="bg-slate-900/50 p-8 rounded-2xl border border-indigo-500/30 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-indigo-900/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                    <span className="text-3xl font-bold text-indigo-400">N</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">NIGHT Token</h2>
                                <p className="text-indigo-200 text-sm uppercase tracking-widest mb-6">Utility & Governance</p>
                                <p className="text-slate-400 leading-relaxed">
                                    {TOKENOMICS_INFO.night}
                                </p>
                            </div>

                            <div className="bg-slate-900/50 p-8 rounded-2xl border border-purple-500/30 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-purple-900/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                    <span className="text-3xl font-bold text-purple-400">D</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">DUST Token</h2>
                                <p className="text-purple-200 text-sm uppercase tracking-widest mb-6">Resource & Gas</p>
                                <p className="text-slate-400 leading-relaxed">
                                    {TOKENOMICS_INFO.dust}
                                </p>
                            </div>
                            
                            <div className="md:col-span-2 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                <h3 className="font-bold text-white mb-3">Economic Flow in Passport Verification</h3>
                                <ul className="list-disc list-inside space-y-2 text-slate-400 text-sm">
                                    <li>User generates proof locally (No cost).</li>
                                    <li>User submits transaction to <code>registerIdentity</code>.</li>
                                    <li>Protocol calculates computational work of verification.</li>
                                    <li>User is charged <strong>~15 DUST</strong>.</li>
                                    <li>Validators accept DUST to include the transaction in the block.</li>
                                    <li>This decouples the volatile value of NIGHT from the predictable cost of usage (DUST).</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Floating Chat Toggle (Mobile) or Sidebar (Desktop) */}
        <div className={`fixed inset-y-0 right-0 transform ${showChat ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40 md:flex`}>
            <AIChat />
        </div>

        {/* Mobile Chat Toggle Button */}
        <button 
            onClick={() => setShowChat(!showChat)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-900/50 z-50 text-white"
        >
            <MessageSquare />
        </button>

      </main>
    </div>
  );
};

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all text-sm font-medium border-b-2
            ${active 
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/50' 
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
    >
        {icon}
        {label}
    </button>
);

export default App;