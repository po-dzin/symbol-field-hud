import React from 'react';
import { useGraphStore } from '../../store/graphStore';

const RadialMenu = ({ nodeId, position, onClose }) => {
    const { cloneNode, deleteNode, nodes } = useGraphStore();
    const node = nodes.find(n => n.id === nodeId);
    const isCore = node?.entity.type === 'core';

    const handleClone = () => {
        cloneNode(nodeId);
        console.log('📋 Node cloned');
        onClose();
    };

    const handleConvert = () => {
        // Future: Show conversion menu
        console.log('🔄 Convert (not implemented yet)');
        onClose();
    };

    const handleDelete = () => {
        if (isCore) {
            console.warn('⚠️ Cannot delete Core node');
            return;
        }
        deleteNode(nodeId);
        onClose();
    };

    // Radial menu positions (relative to node center)
    const buttonRadius = 60;
    const buttons = [
        {
            label: 'Clone',
            angle: -90, // ↑ Top
            icon: '📋',
            action: handleClone,
            disabled: isCore // Cannot clone Core
        },
        {
            label: 'Convert',
            angle: 0, // → Right
            icon: '🔄',
            action: handleConvert,
            disabled: isCore // Cannot convert Core
        },
        {
            label: 'Delete',
            angle: 90, // ↓ Bottom
            icon: '🗑',
            action: handleDelete,
            disabled: isCore
        }
    ];

    return (
        <>
            {/* Backdrop to catch clicks outside */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
                style={{ background: 'transparent' }}
            />

            {/* Radial Menu */}
            <div
                className="absolute z-50"
                style={{
                    left: position.x,
                    top: position.y,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                {/* Center indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/30 rounded-full" />
                </div>

                {/* Radial buttons */}
                {buttons.map((btn, idx) => {
                    const angleRad = (btn.angle * Math.PI) / 180;
                    const x = Math.cos(angleRad) * buttonRadius;
                    const y = Math.sin(angleRad) * buttonRadius;

                    return (
                        <button
                            key={idx}
                            onClick={btn.action}
                            disabled={btn.disabled}
                            className={`
                                absolute flex items-center justify-center
                                w-12 h-12 rounded-full
                                backdrop-blur-md border
                                transition-all duration-200
                                ${btn.disabled
                                    ? 'bg-black/50 border-white/10 cursor-not-allowed opacity-30'
                                    : 'bg-white/10 border-white/30 hover:bg-white/20 hover:scale-110 hover:border-white/50'
                                }
                            `}
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                            }}
                            title={btn.label}
                        >
                            <span className="text-xl">{btn.icon}</span>
                        </button>
                    );
                })}

                {/* Connection lines */}
                <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        width: buttonRadius * 2 + 48,
                        height: buttonRadius * 2 + 48,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {buttons.map((btn, idx) => {
                        const angleRad = (btn.angle * Math.PI) / 180;
                        const x = Math.cos(angleRad) * buttonRadius;
                        const y = Math.sin(angleRad) * buttonRadius;
                        const centerX = buttonRadius + 24;
                        const centerY = buttonRadius + 24;

                        return (
                            <line
                                key={idx}
                                x1={centerX}
                                y1={centerY}
                                x2={centerX + x}
                                y2={centerY + y}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                                strokeDasharray="2,2"
                            />
                        );
                    })}
                </svg>
            </div>
        </>
    );
};

export default RadialMenu;
