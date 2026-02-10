import React, { useState, useCallback } from 'react';
import { Lock, FileCheck, Server, ShieldCheck, User, Settings2, Info, Terminal, Fingerprint, Key } from 'lucide-react';
import { SimulationState, IdentityProfile } from '../types';
import { IDENTITY_PROFILES } from '../constants';

const Simulation: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    activeProfile: IDENTITY_PROFILES[0],
    minAge: 18,
    isProving: false,
    proofGenerated: false,
    isVerifying: false,
    isVerified: false,
    proofHash: null,
    logs: [],
    signatureVerified: false,
    nullifierComputed: false,
    isSybil: false
  });

  const addLog = useCallback((msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : '➜ ';
    setState(prev => ({ ...prev, logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${prefix}${msg}`] }));
  }, []);

  const handleProfileChange = (profile: IdentityProfile) => {
    setState(prev => ({ 
      ...prev, 
      activeProfile: profile, 
      proofGenerated: false, 
      isVerified: false, 
      proofHash: null,
      signatureVerified: false,
      nullifierComputed: false,
      isSybil: false,
      logs: [] 
    }));
    addLog(`Switched to identity profile: ${profile.name}`);
  };

  const handleGenerateProof = useCallback(() => {
    setState(prev => ({ 
        ...prev, 
        isProving: true, 
        logs: [], 
        proofGenerated: false, 
        isVerified: false, 
        proofHash: null,
        signatureVerified: false,
        nullifierComputed: false
    }));
    
    addLog("Initializing Local WitnessContext & PrivateState...");
    
    setTimeout(() => {
        const { age, expiryTimestamp, name } = state.activeProfile;
        const currentTime = Date.now();

        addLog(`Loading 'issuer_public_key' from Midnight Ledger...`);
        
        setTimeout(() => {
            addLog(`Executing witness 'get_passport_data()' from local vault...`);
            
            setTimeout(() => {
                addLog(`Executing witness 'check_issuer_signature()'...`);
                
                // Simulation logic for signature
                if (name === "Invalid Signature Test") {
                    addLog("Witness Error: Invalid Issuer Signature. Proof aborted.", "error");
                    setState(prev => ({ ...prev, isProving: false }));
                    return;
                }
                
                addLog("Signature valid. Data packet matches persistentHash.", "success");
                setState(prev => ({ ...prev, signatureVerified: true }));

                setTimeout(() => {
                    addLog("Step 3: Computing Nullifier (persistentHash)...");
                    const mockNullifier = "0x" + Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
                    addLog(`Nullifier derived: ${mockNullifier.slice(0, 12)}...`, "success");
                    setState(prev => ({ ...prev, nullifierComputed: true }));

                    setTimeout(() => {
                        addLog("Step 4: Running Circuit Assertions (Age & Expiry)...");
                        
                        if (age < state.minAge) {
                            addLog(`ASSERTION FAILED: Age ${age} < required ${state.minAge}`, "error");
                            setState(prev => ({ ...prev, isProving: false }));
                            return;
                        }
                        if (expiryTimestamp < currentTime) {
                            addLog("ASSERTION FAILED: Document expired.", "error");
                            setState(prev => ({ ...prev, isProving: false }));
                            return;
                        }

                        addLog("Assertions passed. Synthesizing ZK-SNARK...");
                        
                        setTimeout(() => {
                            const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
                            addLog(`Proof generated! Private inputs remained local.`, "success");
                            setState(prev => ({ 
                                ...prev, 
                                isProving: false, 
                                proofGenerated: true,
                                proofHash: mockHash
                            }));
                        }, 1500);
                    }, 800);
                }, 800);
            }, 800);
        }, 800);
    }, 600);
  }, [state.activeProfile, state.minAge, addLog]);

  const handleSubmitChain = useCallback(() => {
      if (!state.proofGenerated) return;
      setState(prev => ({ ...prev, isVerifying: true }));
      addLog("Transmitting Proof to Midnight Node Verifier...");
      
      setTimeout(() => {
          addLog("Running on-chain early-exit check: Is Address already verified?");
          setTimeout(() => {
              addLog("Network status: First-time registration detected.");
              addLog("Running on-chain Nullifier collision check...");
              
              setTimeout(() => {
                  addLog("Nullifier is unique. Processing verify(proof)...");
                  addLog("Deducting 15 DUST resource tokens...");
                  
                  setTimeout(() => {
                      addLog("Status: SUCCESS. Ledger updated: [Address -> Verified]", "success");
                      setState(prev => ({ ...prev, isVerifying: false, isVerified: true }));
                  }, 1200);
              }, 1000);
          }, 800);
      }, 800);
  }, [state.proofGenerated, addLog]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      <div className="lg:col-span-5 space-y-6">
        <section className="glass-panel p-6 rounded-xl border-t border-indigo-500/30">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lock size={16} /> 1. Private Credentials
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
                {IDENTITY_PROFILES.map(profile => (
                    <button
                        key={profile.id}
                        onClick={() => handleProfileChange(profile)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                            state.activeProfile.id === profile.id 
                            ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500' 
                            : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${state.activeProfile.id === profile.id ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                <User size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{profile.name}</div>
                                <div className="text-[10px] text-slate-400 uppercase font-mono">Age: {profile.age} • Exp: {profile.expiryDate}</div>
                            </div>
                        </div>
                        {state.activeProfile.id === profile.id && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>}
                    </button>
                ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3">
                <Info size={20} className="text-blue-400 shrink-0" />
                <p className="text-[11px] text-blue-200/80 leading-relaxed">
                    <strong>Hardened Note:</strong> These credentials include a 64-byte <strong>Issuer Signature</strong>. The circuit will verify this signature against the Government Public Key without revealing your identity.
                </p>
            </div>
        </section>

        <section className="glass-panel p-6 rounded-xl border-t border-purple-500/30">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings2 size={16} /> 2. Circuit Configuration
            </h3>
            
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
                        <span>Min Age Assertion (Public)</span>
                        <span className="text-indigo-400">{state.minAge} Years</span>
                    </div>
                    <input 
                        type="range" 
                        min="13" 
                        max="65" 
                        value={state.minAge}
                        onChange={(e) => setState({...state, minAge: parseInt(e.target.value), proofGenerated: false, isVerified: false})}
                        className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                        <Key size={14} className="text-slate-500" />
                        <span className="text-xs text-slate-300">Root of Trust:</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400">0xGovAuth_Root_v2</span>
                </div>
            </div>
        </section>

        <div className="flex gap-4">
            <button
                onClick={handleGenerateProof}
                disabled={state.isProving || state.isVerified}
                className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                    ${state.isProving 
                        ? 'bg-slate-800 text-slate-500 cursor-wait' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                    }`}
            >
                {state.isProving ? 'Generating Proof...' : 'Compute Hardened ZK'}
            </button>
            <button
                onClick={handleSubmitChain}
                disabled={!state.proofGenerated || state.isVerifying || state.isVerified}
                className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                    ${!state.proofGenerated || state.isVerifying
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                    }`}
            >
                {state.isVerifying ? 'Verifying...' : 'Submit to Ledger'}
            </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel rounded-xl flex-1 flex flex-col overflow-hidden border border-slate-700/50">
                <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <Terminal size={14} /> Local Witness Server Console
                    </h3>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                    </div>
                </div>

                <div className="flex-1 bg-[#0d1117] p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                    {state.logs.length === 0 && <div className="text-slate-600 italic">Circuit idle. Awaiting witness input...</div>}
                    {state.logs.map((log, i) => (
                        <div key={i} className={`mb-1.5 pb-1 border-b border-slate-900/30 ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {log}
                        </div>
                    ))}
                </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border-l-4 border-emerald-500/50 bg-slate-900/40">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all duration-500 ${state.isProving ? 'bg-indigo-500 text-white scale-110 shadow-[0_0_20px_#6366f1]' : 'bg-slate-800 text-slate-500'}`}>
                        <Lock size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Witness</span>
                  </div>

                  <div className={`h-1 flex-1 mx-2 rounded-full transition-all duration-1000 ${state.signatureVerified ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>

                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-500 ${state.signatureVerified ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <ShieldCheck size={20} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Trust</span>
                  </div>

                  <div className={`h-1 flex-1 mx-2 rounded-full transition-all duration-1000 ${state.nullifierComputed ? 'bg-purple-500' : 'bg-slate-800'}`}></div>

                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-500 ${state.nullifierComputed ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <Fingerprint size={20} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Anti-Sybil</span>
                  </div>

                  <div className={`h-1 flex-1 mx-2 rounded-full transition-all duration-1000 ${state.isVerified ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>

                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all duration-500 ${state.isVerified ? 'bg-emerald-500 text-white scale-110 shadow-[0_0_20px_#10b981]' : 'bg-slate-800 text-slate-500'}`}>
                        <Server size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Ledger</span>
                  </div>
              </div>

              {state.proofHash && (
                  <div className="p-4 bg-black/50 rounded-lg border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <FileCheck size={12} /> Succinct Proof Payload
                        </span>
                        <div className="px-2 py-0.5 rounded bg-indigo-500/20 text-[9px] text-indigo-300 border border-indigo-500/30">COMPRESSED R1CS</div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 break-all leading-relaxed bg-slate-900/50 p-2 rounded">
                        {state.proofHash}
                    </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Simulation;