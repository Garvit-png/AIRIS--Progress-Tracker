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
                    <h3 className="text-sm font-bold tracking-tight">Verifiable proof</h3>
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
                                    <span className="text-[9px] font-mono text-pink-400 capitalize tracking-tighter">Synchronizing...</span>
                                </motion.div>
                            ) : lastSaved ? (
                                <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <CheckCircle2 size={10} className="text-green-500" />
                                    <span className="text-[9px] font-mono text-green-500 capitalize tracking-tighter">Saved to archive</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                >
                                    <span className="text-[9px] font-mono opacity-40 capitalize tracking-tighter">System ready</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {isToday && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${isSaving
                            ? 'bg-pink-500/5 border-white/5 text-pink-500/20'
                            : 'bg-[#FF2D78] hover:bg-[#FF2D78]/90 text-white shadow-[0_4px_12px_rgba(255,45,120,0.2)]'
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
                        className={`
                            flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all group
                            ${isToday ? 'border-pink-500/10 bg-pink-500/[0.02] cursor-pointer hover:border-[#FF2D78]/30 hover:bg-[#FF2D78]/[0.05] hover:shadow-[0_0_30px_rgba(255,45,120,0.1)]' : 'border-white/5 bg-white/[0.02]'}
                        `}
                    >
                        <div className="w-12 h-12 rounded-full bg-pink-500/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileCheck size={20} className="text-pink-500/40" />
                        </div>
                        <p className="text-[11px] text-white/40 mb-1 font-medium">No evidence recorded</p>
                        {isToday && <p className="text-[9px] text-white/20 uppercase tracking-widest">Click to upload findings</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
