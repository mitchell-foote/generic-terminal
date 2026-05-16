import * as React from 'react';

const StaticCamera: React.FC = () => (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
        <style>{`
            @keyframes staticFlicker {
                0%   { opacity: 0.85; }
                12%  { opacity: 0.35; }
                25%  { opacity: 0.9; }
                40%  { opacity: 0.2; }
                55%  { opacity: 0.75; }
                68%  { opacity: 0.5; }
                80%  { opacity: 0.88; }
                92%  { opacity: 0.3; }
                100% { opacity: 0.85; }
            }
            @keyframes staticFlickerB {
                0%   { opacity: 0.1; }
                20%  { opacity: 0.22; }
                45%  { opacity: 0.06; }
                70%  { opacity: 0.18; }
                100% { opacity: 0.1; }
            }
            .static-scanlines {
                position: absolute;
                inset: 0;
                background: repeating-linear-gradient(
                    0deg,
                    rgba(255, 255, 255, 0.05) 0px,
                    rgba(255, 255, 255, 0.05) 1px,
                    transparent 1px,
                    transparent 4px
                );
                animation: staticFlicker 0.12s steps(2) infinite;
                pointer-events: none;
            }
            .static-grain {
                position: absolute;
                inset: 0;
                background: repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    rgba(255, 255, 255, 0.02) 1px,
                    transparent 2px,
                    transparent 5px
                );
                animation: staticFlickerB 0.09s steps(3) infinite reverse;
                pointer-events: none;
            }
        `}</style>
        <div className="static-scanlines" />
        <div className="static-grain" />
        <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            zIndex: 1
        }}>
            <span style={{ fontSize: '1.1rem', letterSpacing: '0.25rem', color: 'rgba(180, 180, 180, 0.65)' }}>
                NO SIGNAL
            </span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12rem', color: 'rgba(140, 140, 140, 0.4)' }}>
                COMMAND DECK — FEED OFFLINE
            </span>
        </div>
    </div>
)

export default StaticCamera
