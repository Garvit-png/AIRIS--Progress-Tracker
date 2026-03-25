import React from 'react';
import { FileUp, FileText, Image as ImageIcon, Clock, CheckCircle2, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion'; // Added missing import

export default function ProofSection({ 
    proofs, 
    isToday, 
    isSaving, 
    lastSaved, 
    fileInputRef, 
    handleFileUpload 
}) {
    return (
        <div className="flex flex-col gap-4 bg-white/5 border border-pink-500/10 rounded-2xl p-5 overflow-hidden relative">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold tracking-tight text-white/90">Verifiable Proof</h3>
                    <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                            {isSaving ? (
                                <motion.div
                                    key="saving"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <div className="w-1 h-1 rounded-full bg-pink-400 animate-pulse" />
                                    <span className="text-[9px] font-mono text-pink-400 uppercase tracking-tighter">Synchronizing...</span>
                                </motion.div>
                            ) : lastSaved ? (
                                <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <CheckCircle2 size={10} className="text-green-500" />
                                    <span className="text-[9px] font-mono text-green-500 uppercase tracking-tighter">Saved to Archive</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                    className="text-[9px] font-mono uppercase tracking-tighter"
                                >
                                    System Ready
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {isToday && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase transition-all ${isSaving
                            ? 'bg-pink-500/5 border-pink-500/10 text-pink-400/40'
                            : 'bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20'
                            }`}
                    >
                        {isSaving ? (
                            <div className="w-3 h-3 border-b border-pink-400 rounded-full animate-spin" />
                        ) : (
                            <FileUp size={14} />
                        )}
                        {isSaving ? 'Saving' : 'Upload'}
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {proofs.map((proof) => (
                    <div key={proof.id} className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-pink-500/10 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5 text-white/95">
                                    {proof.type.includes('image') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                </div>
                                <div>
                                    <p className="text-xs truncate max-w-[150px]">{proof.name}</p>
                                    <div className="flex items-center gap-1.5 opacity-70">
                                        <Clock size={10} />
                                        <span className="text-[10px] font-mono">{format(new Date(proof.timestamp), 'HH:mm')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={proof.url}
                                    download={proof.name}
                                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <FileUp size={14} className="rotate-180" />
                                </a>
                            </div>
                        </div>
                        {/* Micro Preview for images */}
                        {proof.type.includes('image') && (
                            <div className="mt-1 h-32 w-full rounded-lg overflow-hidden border border-pink-500/20 bg-black/20">
                                <img src={proof.url} alt={proof.name} className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>
                ))}
                {proofs.length === 0 && (
                    <div 
                        onClick={() => isToday && fileInputRef.current?.click()}
                        className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all ${
                            isToday 
                            ? 'border-pink-500/10 bg-pink-500/[0.02] cursor-pointer hover:border-pink-500/40 hover:bg-pink-500/[0.05] group/upload' 
                            : 'border-white/5 bg-white/5 opacity-50'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform ${isToday ? 'bg-pink-500/10 group-hover/upload:scale-110' : 'bg-white/5'}`}>
                            <FileCheck size={24} className={isToday ? 'text-pink-500' : 'text-white/20'} />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-2">No evidence recorded</p>
                        {isToday && (
                            <p className="text-[9px] font-mono text-pink-500/40 uppercase tracking-widest">Click to upload verification</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
