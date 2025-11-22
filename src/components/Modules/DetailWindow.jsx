import React from 'react';

const DetailWindow = ({ node }) => {
    if (!node) return <div className="text-os-text-meta">Select a node to view details.</div>;

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-4 pb-4 border-b border-os-glass-border">
                <div className="w-16 h-16 rounded-full bg-os-glass-bg border border-os-glass-border flex items-center justify-center text-3xl text-os-cyan">
                    {node.glyph}
                </div>
                <div>
                    <h2 className="text-xl font-light tracking-wide text-os-text-primary">{node.title}</h2>
                    <div className="text-xs text-os-text-meta uppercase tracking-widest mt-1">{node.type} // ID: {node.id}</div>
                </div>
            </div>

            {/* Stats / Properties */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-os-glass-bg border border-os-glass-border">
                    <div className="text-xs text-os-text-meta uppercase">Status</div>
                    <div className="text-os-cyan mt-1">Active</div>
                </div>
                <div className="p-3 rounded-lg bg-os-glass-bg border border-os-glass-border">
                    <div className="text-xs text-os-text-meta uppercase">Connections</div>
                    <div className="text-os-text-primary mt-1">3 Links</div>
                </div>
            </div>

            {/* Description */}
            <div className="text-os-text-secondary leading-relaxed text-sm">
                <p>
                    This node represents a core component of the system. It serves as a central hub for data processing and signal routing.
                    <br /><br />
                    Interaction with this node allows for configuration of the underlying subsystem parameters.
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
                <button className="flex-1 py-2 rounded-lg bg-os-cyan-dim border border-os-cyan/30 text-os-cyan hover:bg-os-cyan/20 transition-colors text-sm uppercase tracking-wider">
                    Inspect
                </button>
                <button className="flex-1 py-2 rounded-lg bg-os-glass-bg border border-os-glass-border text-os-text-secondary hover:text-os-text-primary transition-colors text-sm uppercase tracking-wider">
                    Log
                </button>
            </div>
        </div>
    );
};

export default DetailWindow;
