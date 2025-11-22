import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { useWindowStore } from '../../store/windowStore';
import { useStateStore, TONES } from '../../store/stateStore';
import { clsx } from 'clsx';

const WindowFrame = ({
    id,
    title,
    glyph,
    children,
    initialPosition,
    position,
    isMinimized,
    isStatic,
    style
}) => {
    const { focusWindow, minimizeWindow, closeWindow, setWindowPosition } = useWindowStore();
    const { toneId } = useStateStore();
    const currentTone = TONES.find(t => t.id === toneId) || TONES[0];
    const nodeRef = useRef(null);

    // Use provided position, or initial, or default
    const activePosition = position || initialPosition || { x: 0, y: 0 };

    const handleStart = (e, data) => {
        focusWindow(id);
    };

    const handleStop = (e, data) => {
        setWindowPosition(id, { x: data.x, y: data.y });
    };

    const content = (
        <div
            ref={nodeRef}
            className={clsx(
                "window-frame absolute flex flex-col bg-os-glass-bg/90 backdrop-blur-2xl rounded-lg overflow-hidden transition-all duration-200 ease-in-out",
                isMinimized ? "w-0 h-0 opacity-0 pointer-events-none" : "w-[500px] h-[400px]"
            )}
            style={{
                zIndex: 100, // Default base
                left: activePosition.x + 24,
                top: activePosition.y + 24,
                '--glow-color': `${currentTone.color}60`,
                borderColor: `${currentTone.color}60`,
                backgroundColor: `${currentTone.color}02`,
                animation: 'pulse-glow-soft 4s infinite ease-in-out',
                borderWidth: '1px',
                borderStyle: 'solid',
                boxShadow: `0 0 20px ${currentTone.color}40, 0 4px 12px rgba(0,0,0,0.3)`,
                ...style
            }}
            onClick={() => focusWindow(id)}
        >
            {/* Header / Handle */}
            <div className="window-handle h-10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing border-b border-os-glass-border/50 select-none">
                <div className="flex items-center gap-2">
                    <span className="text-os-cyan">{glyph}</span>
                    <span className="text-xs font-medium tracking-wider text-os-text-primary">{title}</span>
                </div>

                {/* Controls */}
                {!isStatic && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
                            className="w-3 h-3 rounded-full bg-os-amber opacity-50 hover:opacity-100 transition-opacity"
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
                            className="w-3 h-3 rounded-full bg-red-500 opacity-50 hover:opacity-100 transition-opacity"
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="flex-1 overflow-auto custom-scrollbar relative p-6">
                    {children}
                </div>
            )}
        </div>
    );

    if (isStatic) {
        return content;
    }

    return (
        <Draggable
            handle=".window-handle" // Changed handle to .window-handle
            nodeRef={nodeRef}
            defaultPosition={initialPosition}
            position={position || initialPosition}
            onStart={handleStart}
            onStop={handleStop}
            onMouseDown={() => focusWindow(id)}
        >
            {content}
        </Draggable>
    );
};

export default WindowFrame;
