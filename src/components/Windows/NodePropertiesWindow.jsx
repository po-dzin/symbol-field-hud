import React, { useState } from 'react';
import { useGraphStore } from '../../store/graphStore';
import { TONES } from '../../store/stateStore';

const NodePropertiesWindow = ({ node, onClose }) => {
    const { updateNodeComponent, addComponentToNode, removeComponentFromNode } = useGraphStore();
    const [showAddComponent, setShowAddComponent] = useState(false);

    const componentsList = [
        { id: 'glyph', name: 'Glyph', icon: '◉' },
        { id: 'tone', name: 'Tone', icon: '🎨' },
        { id: 'xp', name: 'XP', icon: '⚡' },
        { id: 'temporal', name: 'Temporal', icon: '⏰' },
        { id: 'process', name: 'Process', icon: '⚙️' },
        { id: 'ritual', name: 'Ritual', icon: '🔮' }
    ];

    const availableComponents = componentsList.filter(
        comp => !node.components[comp.id] || node.components[comp.id] === null
    );

    const activeComponents = componentsList.filter(
        comp => node.components[comp.id] && node.components[comp.id] !== null
    );

    const handleAddComponent = (componentType) => {
        addComponentToNode(node.id, componentType);
        setShowAddComponent(false);
    };

    const handleRemoveComponent = (componentType) => {
        if (window.confirm(`Remove ${componentType} component?`)) {
            removeComponentFromNode(node.id, componentType);
        }
    };

    const handleUpdateXP = (field, value) => {
        const currentXP = node.components.xp || {};
        updateNodeComponent(node.id, 'xp', {
            ...currentXP,
            [field]: parseInt(value) || 0
        });
    };

    const handleUpdateTone = (toneId) => {
        updateNodeComponent(node.id, 'tone', { id: toneId });
    };

    const handleUpdateGlyph = (glyphId) => {
        updateNodeComponent(node.id, 'glyph', { id: glyphId });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{node.components.glyph?.id ? getGlyphChar(node.components.glyph.id) : '○'}</span>
                    <div>
                        <h2 className="text-sm font-medium text-white">NODE PROPERTIES</h2>
                        <p className="text-xs text-os-text-meta">{node.entity.type}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Entity Info */}
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-xs font-medium text-os-text-secondary mb-2">ENTITY</h3>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-os-text-meta">Type:</span>
                            <span className="text-white">{node.entity.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-os-text-meta">ID:</span>
                            <span className="text-white font-mono text-[10px]">{node.id.slice(0, 8)}</span>
                        </div>
                    </div>
                </div>

                {/* Active Components */}
                {activeComponents.map(comp => (
                    <div key={comp.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span>{comp.icon}</span>
                                <h3 className="text-xs font-medium text-white">{comp.name.toUpperCase()}</h3>
                            </div>
                            <button
                                onClick={() => handleRemoveComponent(comp.id)}
                                className="text-[10px] text-os-text-meta hover:text-red-400 transition-colors"
                                title="Remove component"
                            >
                                [×]
                            </button>
                        </div>

                        {/* Component-specific editors */}
                        {comp.id === 'glyph' && (
                            <div className="space-y-2">
                                <label className="text-[10px] text-os-text-meta">Glyph</label>
                                <select
                                    value={node.components.glyph?.id || 'node'}
                                    onChange={(e) => handleUpdateGlyph(e.target.value)}
                                    className="w-full px-2 py-1 text-xs bg-black/30 border border-white/20 rounded text-white"
                                >
                                    <option value="core">◉ Core</option>
                                    <option value="node">⬡ Node</option>
                                    <option value="void">○ Void</option>
                                    <option value="source">∘ Source</option>
                                </select>
                            </div>
                        )}

                        {comp.id === 'tone' && (
                            <div className="space-y-2">
                                <label className="text-[10px] text-os-text-meta">Tone</label>
                                <select
                                    value={node.components.tone?.id || 'void'}
                                    onChange={(e) => handleUpdateTone(e.target.value)}
                                    className="w-full px-2 py-1 text-xs bg-black/30 border border-white/20 rounded text-white"
                                >
                                    <option value="void">Void</option>
                                    <option value="base">Base</option>
                                    {TONES.map(tone => (
                                        <option key={tone.id} value={tone.id}>{tone.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {comp.id === 'xp' && (
                            <div className="space-y-2">
                                {['hp', 'ep', 'mp', 'sp', 'np'].map(field => (
                                    <div key={field}>
                                        <label className="text-[10px] text-os-text-meta uppercase">{field}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={node.components.xp?.[field] || 0}
                                            onChange={(e) => handleUpdateXP(field, e.target.value)}
                                            className="w-full"
                                        />
                                        <div className="text-right text-[10px] text-white">{node.components.xp?.[field] || 0}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {comp.id === 'temporal' && (
                            <div className="space-y-2">
                                <label className="text-[10px] text-os-text-meta">Time Scale</label>
                                <select
                                    value={node.components.temporal?.scale || 'day'}
                                    onChange={(e) => updateNodeComponent(node.id, 'temporal', { scale: e.target.value })}
                                    className="w-full px-2 py-1 text-xs bg-black/30 border border-white/20 rounded text-white"
                                >
                                    <option value="day">Day</option>
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                    <option value="year">Year</option>
                                    <option value="3y">3 Years</option>
                                    <option value="7y">7 Years</option>
                                    <option value="12y">12 Years</option>
                                </select>
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Component */}
                <div className="relative">
                    <button
                        onClick={() => setShowAddComponent(!showAddComponent)}
                        className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-os-text-secondary hover:text-white transition-all"
                        disabled={availableComponents.length === 0}
                    >
                        {availableComponents.length > 0 ? '[ + Add Component ]' : '[ All Components Active ]'}
                    </button>

                    {showAddComponent && availableComponents.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-os-dark border border-white/20 rounded-lg overflow-hidden z-10">
                            {availableComponents.map(comp => (
                                <button
                                    key={comp.id}
                                    onClick={() => handleAddComponent(comp.id)}
                                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-left text-xs text-white"
                                >
                                    <span>{comp.icon}</span>
                                    <span>{comp.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper function
const getGlyphChar = (id) => {
    const map = {
        'source': '∘',
        'core': '◉',
        'node': '⬡',
        'void': '○'
    };
    return map[id] || '○';
};

export default NodePropertiesWindow;
