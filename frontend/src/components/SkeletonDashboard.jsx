import React from 'react'
import { motion } from 'framer-motion'

const SkeletonDashboard = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white/20 select-none">
            {/* Sidebar Skeleton */}
            <div className="w-[240px] border-r border-white/10 p-6 space-y-8 hidden md:block">
                <div className="h-8 w-32 bg-pink-500/10 rounded-lg animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 w-full bg-white/12 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                {/* Header Skeleton */}
                <header className="h-[48px] border-b border-white/10 px-6 flex items-center justify-between bg-white/[0.02]">
                    <div className="h-3 w-32 bg-white/15 rounded animate-pulse" />
                    <div className="h-6 w-24 bg-pink-500/10 rounded-md animate-pulse" />
                </header>

                <div className="flex-1 p-6 space-y-6 overflow-hidden">
                    {/* Top Row */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="w-full h-16 bg-white/12 border border-white/5 rounded-xl animate-pulse" />
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                        {/* Calendar Area */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                            <div className="h-[300px] bg-white/12 border border-pink-500/5 rounded-3xl animate-pulse" />
                        </div>

                        {/* Detail Area */}
                        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                            <div className="h-32 bg-white/12 border border-white/5 rounded-3xl animate-pulse" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-40 bg-white/12 border border-white/5 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SkeletonDashboard
