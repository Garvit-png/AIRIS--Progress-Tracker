import React from 'react';

const Logo = ({ className = '', size = 'md' }) => {
    const dimensions = {
        sm: 'h-8',
        md: 'h-24',
        lg: 'h-32',
    };

    const currentHeight = dimensions[size] || dimensions.md;

    return (
        <div className={`flex flex-col items-center select-none ${className}`}>
            <img 
                src="/logo.png" 
                alt="AIRIS Logo" 
                className={`${currentHeight} w-auto object-contain mix-blend-screen`}
                draggable="false"
            />
        </div>
    );
};

export default Logo;
