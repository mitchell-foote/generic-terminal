/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react';
import { ReactorManagementOverloadConfiguration, ReactorManagementResetConfiguration, ReactorManagementShieldTakedownConfiguration, ReactorManagementTopLevelConfiguration, ShieldMonitorStatus } from './types';
import { GameWrapper } from 'react-terminal-game-builder';
import { ReactorManagementGame } from '.';
import "./reactor-management.css"
import { MatrixRainV12 } from '@renderer/helpers/Matrix';
import ShieldAsciiArt from './ascii-screens/shield';
import ResetAsciiArt from './ascii-screens/reset';
import OverloadAsciiArt from './ascii-screens/overload';
import ShieldWall from './ascii-screens/shield-wall';
import { Timer } from './timer';
import { getCurrentShieldValue } from './ascii-screens/helpers';

export const generateStartingState = () => {
    const overloadData: ReactorManagementOverloadConfiguration = {
        canOverload: true,
        troubledVent: "vent_alpha"
    }
    const resetData: ReactorManagementResetConfiguration = {
        canReset: true,
        troubledInjector: "injector_beta"
    }

    const shieldTakedownData: ReactorManagementShieldTakedownConfiguration = {
        canShieldTakedown: true,
        correctPositions: {
            lever_1: 'up',
            lever_2: 'down',
            lever_3: 'up',
            lever_4: 'middle',
            lever_5: 'middle'
        },
        startingPositions: {
            lever_1: 'middle',
            lever_2: 'middle',
            lever_3: 'down',
            lever_4: "down",
            lever_5: "up"
        },
        logs: [
            {
                title: "File-14235",
                description: "Log-Lever Control Issue",
                text: "We've noticed a lot of issues with lever_1 in the Up position. Watch out for that."
            },
            {
                title: "File-24456",
                description: "Log-234-113-456-7",
                text: "Man, I forgot my lunch today, maybe i'll just go out and grab some. And by grab some, I mean swipe through the fridge until I find something I like."
            },
            {
                title: "File-1101011",
                description: "Training Report 221",
                text: "We've noticed that there was an issue with the shield system when lever_4 and lever_5 were in the same position. I can't remember which position they were in, but they were the same. Keep that in mind."
            },
            {
                title: "File-8833400",
                description: "Eng-Report-756",
                text: "If you want to shield system to have no fluctuations, make sure lever_3 is either DOWN or MIDDLE."
            },
            {
                title: "Corrupted-File-5",
                description: "01001010 00110101",
                text: "The s░ie░░░ will f░░l if the l░vers are ░░ ░O░░░ ░░ ░ID░LE, an░ ░░░░░░"
            }
        ]
    }

    const basicOverload: ReactorManagementStartingConfigurationProps = {
        id: "basicoverload",
        reactor_name: "Reactor",
        system_name: "Arc Control",
        overload: overloadData,
    }
    const basicReset: ReactorManagementStartingConfigurationProps = {
        id: "basicreset",
        reactor_name: "Reactor",
        system_name: "Arc Control",
        reset: resetData,
    }
    const basicShieldTakedown: ReactorManagementStartingConfigurationProps = {
        id: "basicshieldtakedown",
        reactor_name: "Reactor",
        system_name: "Arc Control",
        shield_takedown: shieldTakedownData,
    }
    return [basicOverload, basicReset, basicShieldTakedown]

}

const generateBasicState = (shield_takedown?: ReactorManagementShieldTakedownConfiguration) => {
    return {
        overloadGameState: {
            overloadFinalFlush: false,
            overloadEmergencyOverride: false,
            overloadFirstFlush: false,
            overloadVentsOpen: false,
        },
        resetGameState: {
            restartFlush: false,
            restartPrime: false,
            restartEmergencyOverride: false,
            restartFinalRestart: false,
            restartFirstRestart: false,
        },
        shieldTakedownGameState: {
            lever_1: shield_takedown?.startingPositions.lever_1 || 'middle',
            lever_2: shield_takedown?.startingPositions.lever_2 || 'middle',
            lever_3: shield_takedown?.startingPositions.lever_3 || 'middle',
            lever_4: shield_takedown?.startingPositions.lever_4 || 'middle',
            lever_5: shield_takedown?.startingPositions.lever_5 || 'middle',
            success: false
        }
    }
}


export type ReactorManagementStartingConfigurationProps = {
    id: string
    reactor_name: string
    system_name: string
    overload?: ReactorManagementOverloadConfiguration
    reset?: ReactorManagementResetConfiguration
    shield_takedown?: ReactorManagementShieldTakedownConfiguration
}

const DEFAULT_TIMER = 60 * 10;

export class ReactorManagementWrapped extends React.Component<ReactorManagementStartingConfigurationProps, ReactorManagementTopLevelConfiguration> {
    state: ReactorManagementTopLevelConfiguration;
    constructor(props: ReactorManagementStartingConfigurationProps) {
        super(props);
        this.state = {
            id: props.id,
            reactor_name: props.reactor_name,
            system_name: props.system_name,
            overload: props.overload,
            reset: props.reset,
            shield_takedown: props.shield_takedown,
            ...generateBasicState(props.shield_takedown),
        }
    }
    isOverloadGame = () => {
        return this.state.overload !== undefined
    }
    isResetGame = () => {
        return this.state.reset !== undefined
    }
    isShieldTakedownGame = () => {
        return this.state.shield_takedown !== undefined
    }

    generateOverloadHeaderTxt = () => {
        let txt = `Warning! ${this.state.system_name} ${this.state.reactor_name} overload detected!`;
        if (this.state.overloadGameState.overloadFinalFlush) {
            txt = `Reactor has been stabilized`
        }
        return <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            {txt}
        </div>

    }
    generateResetHeaderTxt = () => {
        let txt = `Warning! ${this.state.system_name} ${this.state.reactor_name} is offline!`;
        if (this.state.resetGameState.restartFinalRestart) {
            txt = `Reactor has been stabilized`
        }
        return <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            {txt}
        </div>
    }
    generateShieldTakedownHeaderTxt = () => {
        let text = `${this.state.system_name} ${this.state.reactor_name} is operating normally.`
        if (this.state.shield_takedown) {
            const shieldStatus = getCurrentShieldValue(this.state.shieldTakedownGameState, this.state.shield_takedown);
            if (this.state.shieldTakedownGameState.success) {
                text = `Warning! ${this.state.system_name} ${this.state.reactor_name} shield system is offline!`
            }
            if (shieldStatus === ShieldMonitorStatus.MODERATE_ISSUES || shieldStatus === ShieldMonitorStatus.DANGEROUS_ISSUES) {
                text = `${this.state.system_name} ${this.state.reactor_name} shield system is experiencing moderate errors.`
            }
            if (shieldStatus === ShieldMonitorStatus.CRITICAL_ISSUES) {
                text = `${this.state.system_name} ${this.state.reactor_name} shield system is experiencing critical errors. Do not engage the shield pulse.`
            }
        }

        return <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            {text}
        </div>
    }

    generateOverloadBody = () => {
        if (this.state.overloadGameState.overloadFinalFlush) {
            return <ShieldAsciiArt />
        }
        return <OverloadAsciiArt />
    }
    generateResetBody = () => {
        if (this.state.resetGameState.restartFinalRestart) {
            return <ShieldAsciiArt />
        }
        return <ResetAsciiArt />
    }
    generateShieldTakedownBody = () => {
        return <React.Fragment>
            <ShieldAsciiArt />
            {this.state.shield_takedown &&
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                    <ShieldWall shield_takedown_state={this.state.shieldTakedownGameState} shield_takedown={this.state.shield_takedown} />
                </div>}
        </React.Fragment>
    }

    generateOverloadFooter = () => {
        if (this.state.overloadGameState.overloadFinalFlush) {
            return <div style={{ display: 'flex', padding: '2rem' }}>
                <span>Reactor has been stabilized</span>
            </div>
        }
        return <div style={{ display: 'flex', gap: '0.5rem', padding: '2rem' }}>
            <span>Reactor will be destroyed in:</span>
            <Timer initialTime={DEFAULT_TIMER} stop={this.state.overloadGameState.overloadFinalFlush} />
        </div>
    }
    generateResetFooter = () => {
        if (this.state.resetGameState.restartFinalRestart) {
            return <div style={{ display: 'flex', padding: '2rem' }}>
                <span>Reactor has been restarted</span>
            </div>
        }
        return <div style={{ display: 'flex', gap: '0.5rem', padding: '2rem' }}>
            <span>Life support will fail in:</span>
            <Timer initialTime={DEFAULT_TIMER} stop={this.state.resetGameState.restartFinalRestart} />
        </div>
    }
    generateShieldTakedownFooter = () => {
        if (this.state.shieldTakedownGameState.success) {
            return <div style={{ display: 'flex', padding: '2rem', flexDirection: 'column' }}>
                <span>Shield system has been disabled</span>
            </div>
        }
        return <div style={{ display: 'flex', width: '100%', padding: '2rem', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span>Lever 1</span>
                <span>{this.state.shieldTakedownGameState.lever_1.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span>Lever 2</span>
                <span>{this.state.shieldTakedownGameState.lever_2.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span>Lever 3</span>
                <span>{this.state.shieldTakedownGameState.lever_3.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span>Lever 4</span>
                <span>{this.state.shieldTakedownGameState.lever_4.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span>Lever 5</span>
                <span>{this.state.shieldTakedownGameState.lever_5.toUpperCase()}</span>
            </div>
        </div>
    }
    generateTextColorClassName = () => {
        if (this.isOverloadGame()) {
            if (this.state.overloadGameState.overloadFinalFlush) {
                return ''
            }
            else {
                return 'all-red'
            }

        }
        if (this.isResetGame()) {
            if (this.state.resetGameState.restartFinalRestart) {
                return ''
            }
            else {
                return 'all-red'
            }
        }
        if (this.isShieldTakedownGame()) {
            if (this.state.shield_takedown) {
                const shieldValue = getCurrentShieldValue(this.state.shieldTakedownGameState, this.state.shield_takedown);
                if (this.state.shieldTakedownGameState.success || shieldValue === ShieldMonitorStatus.CRITICAL_ISSUES) {
                    return 'all-red'
                }
                else if (shieldValue === ShieldMonitorStatus.NORMAL || shieldValue === ShieldMonitorStatus.MILD_ISSUES) {
                    return ''
                }
                else {
                    return 'all-yellow'
                }
            }

        }
        return ''
    }

    render(): React.ReactNode {
        return <div className={`terminal-grid-parent ${this.generateTextColorClassName()}`}>
            <div
                className={`matrix`}
            >
                <MatrixRainV12
                    useYellow={this.generateTextColorClassName() === 'all-yellow'}
                    useRed={this.generateTextColorClassName() === 'all-red'}
                />
            </div>
            <div className="terminal">
                <GameWrapper
                    overallState={this.state}
                    onUpdateExternalState={(state, callback) => {
                        const newState = { ...this.state, ...state }
                        this.setState(newState, callback)
                    }}
                    startingComponent={ReactorManagementGame}
                />
            </div>
            <div style={{ overflow: "hidden" }} className='image'>
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 'x-large', flexDirection: 'column' }}>
                        {this.isOverloadGame() && this.generateOverloadHeaderTxt()}
                        {this.isResetGame() && this.generateResetHeaderTxt()}
                        {this.isShieldTakedownGame() && this.generateShieldTakedownHeaderTxt()}
                        <div style={{ width: '100%', border: '1px solid' }} />

                    </div>
                    <div style={{ width: '100%', overflow: 'hidden', flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {this.isOverloadGame() && this.generateOverloadBody()}
                        {this.isResetGame() && this.generateResetBody()}
                        {this.isShieldTakedownGame() && this.generateShieldTakedownBody()}

                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 'x-large', flexDirection: 'column' }}>
                        <div style={{ width: '100%', border: '1px solid' }} />
                        {this.isOverloadGame() && this.generateOverloadFooter()}
                        {this.isResetGame() && this.generateResetFooter()}
                        {this.isShieldTakedownGame() && this.generateShieldTakedownFooter()}
                    </div>
                </div>
            </div>
        </div>
    }
}