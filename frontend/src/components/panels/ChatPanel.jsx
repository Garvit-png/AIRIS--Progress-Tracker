import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function ChatPanel() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm relative animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-6 p-12 text-center">
                <div className="w-24 h-24 rounded-[2.5rem] bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-2xl shadow-pink-500/10 mb-2 group transition-transform hover:scale-110 duration-500">
                    <MessageSquare size={40} className="text-pink-500 transition-colors group-hover:text-pink-400" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter sm:text-5xl">
                        baadmein dekhte hai
                    </h2>
                    <div className="flex items-center gap-3 justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-pink-500/80">Module Deferred</p>
                        </div>
                    </div>
                    <p className="text-[11px] text-white/30 uppercase tracking-widest max-w-[300px] leading-relaxed mx-auto italic">
                        Chat functionality has been suspended per administrative directive
                    </p>
                </div>
            </div>
        </div>
    );
}
