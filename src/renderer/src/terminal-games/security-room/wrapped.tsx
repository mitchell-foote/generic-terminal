import React from 'react';
import { GameWrapper } from 'react-terminal-game-builder';
import { MatrixRainV12 } from '@renderer/helpers/Matrix';
import MainStorySecurityTerminal, { FullSecurityState } from '.';
import { AdminDefaultState } from './defaultState';
import { GameMode, SystemStatus } from './types';
import PrisonBlockView from './screens/prison-block-view';
import '../reactor-management/reactor-management.css';

export type SecurityRoomConfig = {
    id: string
    allowedLogins?: Record<string, string>
    mode?: GameMode
}

const DEFAULT_LOGINS: Record<string, string> = {
    'comms': 'acc3ss',
    'admin': 'ov3rs33r',
    'cell-control': 'fr33dom'
}

const generateInitialState = (config: SecurityRoomConfig): FullSecurityState => ({
    login: { username: '', password: '' },
    ...AdminDefaultState,
    commsLogs: [],
    doors: {},
    allowedLogins: config.allowedLogins ?? DEFAULT_LOGINS,
    mode: config.mode ?? 'multi'
})

export class SecurityRoomWrapped extends React.Component<SecurityRoomConfig, FullSecurityState> {
    state: FullSecurityState;
    constructor(props: SecurityRoomConfig) {
        super(props);
        this.state = generateInitialState(props);
    }

    isShutdown = () => this.state.fullSystemStatus === SystemStatus.Offline

    renderShutdownPanel = () => (
        <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '1.5rem', padding: '2rem', color: '#ff1d3e'
        }}>
            <div style={{ fontSize: 'xx-large', letterSpacing: '0.2rem', fontWeight: 'bold' }}>
                SYSTEM OFFLINE
            </div>
            <div style={{ width: '100%', border: '1px solid #ff1d3e' }} />
            <div style={{ fontSize: 'large', letterSpacing: '0.1rem', textAlign: 'center', fontWeight: 'bold' }}>
                ⚠ CONTAINMENT BREACH
            </div>
            <div style={{ fontSize: 'small', textAlign: 'center', lineHeight: '1.8' }}>
                All detainees have escaped Block Alpha.<br />
                Checkpoint compromised.
            </div>
            <div style={{ width: '100%', border: '1px solid #ff1d3e' }} />
            <div style={{ fontSize: 'small', opacity: 0.5, textAlign: 'center' }}>
                Security station has been shut down.<br />
                Contact station command to restore access.
            </div>
        </div>
    )

    renderSidePanel = () => {
        if (this.isShutdown()) return this.renderShutdownPanel()
        return (
            <PrisonBlockView
                doors={this.state.doors}
                shutdownPhase={this.state.shutdownPhase}
                mode={this.state.mode}
            />
        )
    }

    render(): React.ReactNode {
        return (
            <div className={`terminal-grid-parent${this.isShutdown() ? ' all-red' : ''}`}>
                <div className="matrix">
                    <MatrixRainV12 useYellow={false} useRed={this.isShutdown()} />
                </div>
                <div className="terminal">
                    <GameWrapper
                        overallState={this.state}
                        onUpdateExternalState={(state, callback) => {
                            const newState = { ...this.state, ...state };
                            this.setState(newState, callback);
                        }}
                        startingComponent={MainStorySecurityTerminal}
                    />
                </div>
                <div style={{ overflow: 'hidden' }} className="image">
                    {this.renderSidePanel()}
                </div>
            </div>
        );
    }
}
