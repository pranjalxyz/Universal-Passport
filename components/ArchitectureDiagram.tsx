import React from 'react';
import { ShieldCheck, Fingerprint, Lock, Server, UserCheck, ArrowRight, Activity } from 'lucide-react';

const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold text-white mb-6">Hardened Passport Architecture</h2>
        
        <div className="relative flex-1 bg-slate-900 rounded-xl border border-slate-700 p-8 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-stretch h-full">
                
                {/* External Entity: Trusted Issuer */}
                <div className="lg:w-48 flex flex-col gap-4">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-purple-500/30 shadow-xl text-center flex flex-col items-center">
                        <UserCheck className="text-purple-400 mb-2" size={32} />
                        <div className="text-xs font-bold text-white uppercase tracking-tighter">Trusted Issuer</div>
                        <div className="text-[10px] text-slate-400 mt-1">Government/Authority</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-slate-600">
                        <div className="w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent"></div>
                        <div className="text-[9px] font-mono uppercase mt-2">Signs Data</div>
                    </div>
                </div>

                {/* Layer 1: Client / Witness */}
                <div className="flex-1 border border-indigo-500/30 bg-indigo-900/10 rounded-xl p-4 flex flex-col">
                    <div className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-4 text-center">User Device (Midnight SDK)</div>
                    
                    <div className="flex-1 flex flex-col justify-center gap-3">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg flex items-center gap-3">
                            <Lock size={16} className="text-indigo-400" />
                            <div>
                                <div className="text-xs font-bold text-white">Secure Witness</div>
                                <div className="text-[10px] text-slate-400">Private Age + Signature</div>
                            </div>
                        </div>
                        <div className="flex justify-center"><ArrowRight size={14} className="text-slate-600 rotate-90" /></div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg flex items-center gap-3">
                            <Fingerprint size={16} className="text-pink-400" />
                            <div>
                                <div className="text-xs font-bold text-white">Nullifier Generator</div>
                                <div className="text-[10px] text-slate-400">Prevents Double Registration</div>
                            </div>
                        </div>
                        <div className="flex justify-center"><ArrowRight size={14} className="text-slate-600 rotate-90" /></div>
                        <div className="bg-indigo-900/40 p-3 rounded-lg border border-indigo-500 shadow-lg flex items-center gap-3">
                            <ShieldCheck size={16} className="text-indigo-300" />
                            <div>
                                <div className="text-xs font-bold text-white">ZK-VM Prover</div>
                                <div className="text-[10px] text-indigo-200">Produces 1.2kb Proof</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Network Bridge */}
                <div className="hidden lg:flex flex-col justify-center items-center">
                     <div className="w-12 h-0.5 bg-indigo-500/50"></div>
                     <div className="text-[9px] text-indigo-400 mt-2 font-mono">BROADCAST</div>
                </div>

                {/* Layer 2: Midnight Network */}
                <div className="flex-1 border border-emerald-500/30 bg-emerald-900/10 rounded-xl p-4 flex flex-col">
                    <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-4 text-center">Midnight Ledger</div>
                    
                    <div className="flex-1 flex flex-col justify-center gap-3">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg flex items-center gap-3 relative">
                            <Server size={16} className="text-purple-400" />
                            <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-purple-500/20 text-[8px] text-purple-300 rounded-bl font-bold">VERIFIER</div>
                            <div>
                                <div className="text-xs font-bold text-white">Consensus Verification</div>
                                <div className="text-[10px] text-slate-400">Root of Trust Check</div>
                            </div>
                        </div>
                        <div className="flex justify-center"><ArrowRight size={14} className="text-slate-600 rotate-90" /></div>
                        <div className="bg-emerald-900/40 p-3 rounded-lg border border-emerald-500 shadow-lg">
                            <div className="text-xs font-bold text-white flex items-center gap-2 mb-2">
                                <Activity size={12} /> State Transitions
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/30 p-1.5 rounded text-[8px] font-mono border border-emerald-500/20">
                                    <div className="text-emerald-400 mb-1">Nullifiers</div>
                                    ID_Hash: USED
                                </div>
                                <div className="bg-black/30 p-1.5 rounded text-[8px] font-mono border border-emerald-500/20">
                                    <div className="text-emerald-400 mb-1">Registry</div>
                                    UserA: VERIFIED
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex gap-3">
                <ShieldCheck size={24} className="text-purple-400 shrink-0" />
                <div>
                    <h4 className="font-bold text-white text-sm mb-1">Root of Trust</h4>
                    <p className="text-[11px] text-slate-400">Signatures from recognized issuers ensure document authenticity without revealing content.</p>
                </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex gap-3">
                <Fingerprint size={24} className="text-pink-400 shrink-0" />
                <div>
                    <h4 className="font-bold text-white text-sm mb-1">Anti-Sybil Nullifiers</h4>
                    <p className="text-[11px] text-slate-400">Deterministic hashes ensure one physical identity can only link to one blockchain address.</p>
                </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex gap-3">
                <Activity size={24} className="text-emerald-400 shrink-0" />
                <div>
                    <h4 className="font-bold text-white text-sm mb-1">State Optimization</h4>
                    <p className="text-[11px] text-slate-400">Early-exit checks on the ledger reduce DUST consumption for already-verified users.</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ArchitectureDiagram;