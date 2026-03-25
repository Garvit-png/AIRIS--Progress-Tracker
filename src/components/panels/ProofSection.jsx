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
        <div className="flex flex-col gap-8 bg-white/5 border border-pink-500/10 rounded-[2.5rem] p-10 overflow-hidden relative min-h-[500px]">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white/90">Verifiable proof</h3>
                    <div className="flex items-center gap-2 h-5">
                        <AnimatePresence mode="wait">
                            {isSaving ? (
                                <motion.div
                                    key="saving"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                                    <span className="text-[10px] font-mono text-pink-400 capitalize tracking-tighter">Synchronizing...</span>
                                </motion.div>
                            ) : lastSaved ? (
                                <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    <span className="text-[10px] font-mono text-green-500 capitalize tracking-tighter font-bold">Saved to archive</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                >
                                    <span className="text-[10px] font-mono opacity-40 capitalize tracking-tighter font-bold">SECURE UPLOAD READY</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {isToday && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isSaving
                            ? 'bg-pink-500/5 border-white/5 text-pink-500/20'
                            : 'bg-[#FF2D78] hover:bg-[#FF2D78]/90 text-white shadow-[0_8px_25px_rgba(255,45,120,0.25)] hover:scale-105 active:scale-95'
                            }`}
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-b-2 border-pink-400 rounded-full animate-spin" />
                        ) : (
                            <FileUp size={18} />
                        )}
                        {isSaving ? 'Syncing' : 'Upload proof'}
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

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                {proofs.map((proof) => (
                    <div key={proof.id} className="flex flex-col gap-5 p-6 rounded-2xl bg-white/5 border border-pink-500/10 group hover:border-pink-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="p-3 rounded-xl bg-white/5 text-white/95 group-hover:bg-pink-500/10 group-hover:text-pink-500 transition-all">
                                    {proof.type.includes('image') ? <ImageIcon size={20} /> : <FileText size={20} />}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-bold text-white/90 truncate max-w-[200px] uppercase tracking-tight">{proof.name}</p>
                                    <div className="flex items-center gap-2 opacity-50">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-mono font-bold tracking-widest">{format(new Date(proof.timestamp), 'HH:mm:ss')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={proof.url}
                                    download={proof.name}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                                    title="Download"
                                >
                                    <FileUp size={18} className="rotate-180" />
                                </a>
                            </div>
                        </div>
                        {/* Micro Preview for images */}
                        {proof.type.includes('image') && (
                            <div className="mt-2 h-56 w-full rounded-2xl overflow-hidden border border-pink-500/10 bg-black/40 relative group-hover:border-pink-500/30 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <span className="text-[10px] font-mono font-bold text-white/60 tracking-widest uppercase">Visual Evidence Node</span>
                                </div>
                                <img src={proof.url} alt={proof.name} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all group-hover:scale-105 duration-700" />
                            </div>
                        )}
                    </div>
                ))}
                {proofs.length === 0 && (
                    <div 
                        onClick={() => isToday && fileInputRef.current?.click()}
                        className={`
                            flex-1 flex flex-col items-center justify-center p-12 rounded-[2.5rem] border-2 border-dashed transition-all group
                            ${isToday ? 'border-pink-500/10 bg-pink-500/[0.02] cursor-pointer hover:border-pink-500/30 hover:bg-pink-500/[0.05] hover:shadow-[0_0_40px_rgba(255,45,120,0.1)]' : 'border-white/5 bg-white/[0.02]'}
                        `}
                    >
                        <div className="w-16 h-16 rounded-full bg-pink-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileCheck size={28} className="text-pink-500/40" />
                        </div>
                        <p className="text-sm text-white/40 mb-2 font-medium italic">No evidence recorded</p>
                        {isToday && <p className="text-[10px] text-pink-500/30 font-black uppercase tracking-[0.2em]">Click to initiate upload</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
