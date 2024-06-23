/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react';

import { ConsolePicker, LoadingHelper, TerminalInputHelper, Types } from 'react-terminal-game-builder';
import { ReactorManagementOverloadState, ReactorManagementTopLevelConfiguration } from '../types';
import { generateManual } from '../default-state';

enum ReactorManagementOverloadGamePoint {
    MAIN,
    NO_TERMINAL,
    MANUAL
}

export type ReactorManagementOverloadGameState = {
    currentGamePoint: ReactorManagementOverloadGamePoint
}

interface ReactorManagementOverloadGameProps extends Types.GameComponentProps<ReactorManagementTopLevelConfiguration> {
    goBackToMain: () => void;
    gameState: ReactorManagementOverloadState
    setGameState: (gameState: ReactorManagementOverloadState, callback?: () => void) => void
}

export class ReactorManagementOverloadGame extends React.Component<ReactorManagementOverloadGameProps, ReactorManagementOverloadGameState> {
    state: ReactorManagementOverloadGameState = {
        currentGamePoint: ReactorManagementOverloadGamePoint.NO_TERMINAL
    }
    componentDidMount(): void {
        if (!this.props.overallState.overload || !this.props.overallState.overload.canOverload || this.props.gameState.overloadFinalFlush) {
            this.props.clearLines(() => {
                this.props.addLine(["Reactor is currently stable.", "Now returning to selection options."], () => {
                    setTimeout(() => {
                        this.props.goBackToMain();
                    }, 2000)
                })
            })
        }
        else {
            this.props.clearLines(() => {
                this.props.writeText({ color: 'red', message: `Warning, ${this.getReactorName()} is overloading! Recommend typing 'manual' and following procedures for reactor overload.` }, () => {
                    this.goToCommandLine(true);
                })
            })

        }
    }

    getReactorName = () => {
        return this.props.overallState.reactor_name || 'reactor'
    }

    getSystemName = () => {
        return this.props.overallState.system_name || "arc fault"
    }

    getTargetOverrideSystem = () => {
        return this.props.overallState.overload?.troubledVent || "vent_alpha"
    }

    goToCommandLine: (full?: boolean, callback?: () => void) => void = (full?: boolean, callback?: () => void) => {
        if (full) {
            this.props.writeText({ message: "Command line active. Type 'help' for a list of available commands" }, () => {
                this.setState({ currentGamePoint: ReactorManagementOverloadGamePoint.MAIN }, callback)

            })
        }
        else {
            this.setState({ currentGamePoint: ReactorManagementOverloadGamePoint.MAIN }, callback)
        }
    }

    removeCommandLine = (callback?: () => void) => {
        this.setState({ currentGamePoint: ReactorManagementOverloadGamePoint.NO_TERMINAL }, callback)
    }


    doHelp = () => {
        this.props.addLine([
            <div key="help">
                <div>
                    {`help - displays this screen`}
                </div>
                <div>
                    {"Usage: '> help'"}
                </div>
            </div>,
            <div key="clear">
                <div>
                    {`clear - clears the text of the terminal`}
                </div>
                <div>
                    {"Usage: '> clear'"}
                </div>
            </div>,
            <div key="manual">
                <div>
                    {`manual - opens the engineering manual for the ${this.getSystemName().toLowerCase()} ${this.getReactorName().toLowerCase()}`}
                </div>
                <div>
                    {"Usage: '> manual'"}
                </div>
            </div>,
            <div key="open_vents">
                <div>
                    {`open_vents - attempts to open all the ${this.getReactorName().toLowerCase()} vents`}
                </div>
                <div>
                    {"Usage: '> open_vents'"}
                </div>
            </div>,
            <div key="flush_system">
                <div>
                    {`flush_system - attempts to flush the ${this.getReactorName().toLowerCase()} system of extra or latent energy.`}
                </div>
                <div>
                    {"Usage: '> flush_system'"}
                </div>
            </div>,
            <div key="prime_system">
                <div>
                    {`prime_system - beings priming sequence for the ${this.getReactorName().toLowerCase()}, in preparation for a full restart.`}
                </div>
                <div>
                    {"Usage: '> prime_system'"}
                </div>
            </div>,
            <div key="restart">
                <div>
                    {`restart - Initiates the restart sequence for the ${this.getSystemName().toLowerCase()} ${this.getReactorName().toLowerCase()}`}
                </div>
                <div>
                    {"Usage: '> restart'"}
                </div>
            </div>,
            <div key="emergency">
                <div>
                    {`emergency_override - Activates the engineering override on a particular system.`}
                </div>
                <div>
                    {`Usage: '> emergency_override <system_name>' Example: '> emergency_override ${this.getTargetOverrideSystem()}'`}
                </div>
            </div>,
            <div key="back">
                <div>
                    {`back - Returns to the primary selection menu.`}
                </div>
                <div>
                    {`Usage: '> back'`}
                </div>
            </div>

        ], () => {
            this.goToCommandLine();
        })
    }

    doOpenVents = () => {
        if (!this.props.gameState.overloadVentsOpen) {
            this.props.writeText({ message: "Attempting to open reactor vents..." }, () => {
                this.props.addLine([
                    <LoadingHelper
                        message=''
                        startPercent={0}
                        endPercent={100}
                        onFinish={() => {
                            const gameState = { ...this.props.gameState };
                            gameState.overloadVentsOpen = true;
                            this.props.writeText({ message: "Reactor vents have been opened" }, () => {
                                this.props.setGameState(gameState, () => {
                                    this.goToCommandLine()
                                })
                            })
                        }} />
                ])
            })
        }
        else {
            this.props.addLine(["Unable to open vents: Vents have already been opened"], () => this.goToCommandLine())
        }
    }
    finishOverload = () => {
        const gameState = { ...this.props.gameState }
        this.props.clearLines(() => {
            this.props.writeText({ message: "Attempting to flush reactor system..." }, () => {
                this.props.addLine([
                    <LoadingHelper
                        message='Preparing flush coolant...'
                        startPercent={0}
                        endPercent={100}
                        showPercent={true}
                        transitionSpeed={100}
                        onFinish={() => {
                            this.props.addLine([
                                <LoadingHelper
                                    startPercent={0}
                                    endPercent={100}
                                    transitionSpeed={100}
                                    message='Opening reactor primary vents...'
                                    onFinish={() => {
                                        this.props.addLine([
                                            <LoadingHelper
                                                startPercent={0}
                                                endPercent={100}
                                                transitionSpeed={100}
                                                message='Initiating vent flush...'
                                                onFinish={() => {
                                                    this.props.addLine([
                                                        <LoadingHelper
                                                            startPercent={0}
                                                            endPercent={100}
                                                            color={true}
                                                            transitionSpeed={500}
                                                            message='Activating overload countermeasures...'
                                                            onFinish={() => {
                                                                this.props.writeText({ message: `Flush process success! Systems are beginning to resolve...` }, () => {
                                                                    this.props.writeText({ message: `Reactor systems have returned to normal function` }, () => {
                                                                        gameState.overloadFinalFlush = true;
                                                                        this.props.setGameState(gameState, () => {
                                                                            this.props.writeText({ message: "Now returning to main menu." }, () => {
                                                                                setTimeout(() => {
                                                                                    this.props.goBackToMain();
                                                                                }, 2000)
                                                                            })
                                                                        })
                                                                    })

                                                                })
                                                            }}
                                                        />
                                                    ])
                                                }}
                                            />
                                        ])
                                    }}
                                />
                            ])

                        }}
                    />
                ])
            })
        })
    }

    doFlushSystem = () => {
        if (this.props.gameState.overloadVentsOpen) { // Step 1 Done
            if (!this.props.gameState.overloadFirstFlush) { // On Step 2
                this.props.writeText({ message: "Attempting to flush reactor system..." }, () => {
                    this.props.addLine([
                        <LoadingHelper
                            message='Preparing flush coolant...'
                            startPercent={0}
                            endPercent={100}
                            showPercent={true}
                            transitionSpeed={100}
                            onFinish={() => {
                                this.props.addLine([
                                    <LoadingHelper
                                        startPercent={0}
                                        endPercent={100}
                                        transitionSpeed={100}
                                        message='Opening reactor primary vents...'
                                        onFinish={() => {
                                            this.props.addLine([
                                                <LoadingHelper
                                                    startPercent={0}
                                                    endPercent={30}
                                                    transitionSpeed={100}
                                                    message='Initiating vent flush...'
                                                    onFinish={() => {
                                                        this.props.updateScroll();
                                                        this.props.writeText({ color: 'red', message: `Flush process aborted: ${this.getTargetOverrideSystem()} has been jammed. '> emergency_override ${this.getTargetOverrideSystem()}' required before attempting another flush` }, () => {
                                                            const overallState = { ...this.props.gameState }
                                                            overallState.overloadFirstFlush = true;
                                                            this.props.setGameState(overallState, () => {
                                                                this.goToCommandLine();
                                                            })
                                                        })
                                                    }}
                                                />
                                            ])
                                        }}
                                    />
                                ])

                            }}
                        />
                    ])
                })
            }
            else { // They've already flushed
                if (this.props.gameState.overloadEmergencyOverride) { // They've done the override
                    this.finishOverload();
                }
                else { // They haven't done the override
                    this.props.addLine([`Unable to flush reactor system: ${this.getTargetOverrideSystem()} is still jammed. Recommend running '> emergency_override ${this.getTargetOverrideSystem()}' before proceeding.`], () => this.goToCommandLine())
                }
            }
        }
        else { // Vents not open
            this.props.addLine(["Unable to flush reactor system: Reactor vents are not open."], () => this.goToCommandLine())
        }
    }

    doPrimeSystem = () => {
        this.props.addLine(["Unable to prime reactor: Reactor is currently overloading"], () => this.goToCommandLine())
    }

    doRestart = () => {
        this.props.addLine(['Unable to restart reactor: Reactor is currently overloading'], () => this.goToCommandLine())
    }

    doEmergencyOverride = (system: string) => {
        if (!system) {
            this.props.addLine(["Unable to do emergency override: System must be specified. Example: '> emergency_override " + this.getTargetOverrideSystem() + "'."], () => this.goToCommandLine())
        }
        else if (system.toLowerCase() === this.getTargetOverrideSystem().toLowerCase()) {
            if (this.props.gameState.overloadEmergencyOverride) {
                this.props.addLine(["Unable to do emergency override: System has already been overridden"], () => this.goToCommandLine())
            }
            else {
                this.props.writeText({ message: `System ${system} has been overridden.` }, () => {
                    const gameState = { ...this.props.gameState };
                    gameState.overloadEmergencyOverride = true;
                    this.props.setGameState(gameState, () => { this.goToCommandLine() });
                })
            }
        }
        else {
            this.props.addLine([`Unable to do emergency override: System ${system} is not valid, or does not need override.`], () => this.goToCommandLine())
        }
    }

    handleCommandLine = (command: string, args: string[], fullText: string) => {
        this.removeCommandLine(() => {
            this.props.addLine([fullText], () => {
                switch (command.toLowerCase()) {
                    case 'help': {
                        this.doHelp();
                        break;
                    }
                    case 'clear': {
                        this.props.clearLines(() => {
                            this.goToCommandLine();
                        })
                        break;
                    }
                    case 'manual': {
                        this.props.clearLines(() => {
                            this.props.writeText({ message: "Opening ENG manual..." }, () => {
                                this.setState({ currentGamePoint: ReactorManagementOverloadGamePoint.MANUAL })
                            })
                        })

                        break;
                    }
                    case 'open_vents': {
                        this.doOpenVents();
                        break;
                    }
                    case 'flush_system': {
                        this.doFlushSystem();
                        break;
                    }
                    case 'prime_system': {
                        this.doPrimeSystem()
                        break;
                    }
                    case 'restart': {
                        this.doRestart();
                        break;
                    }
                    case 'emergency_override': {
                        this.doEmergencyOverride(args[0]);
                        break;
                    }
                    default: {
                        this.props.addLine(["Please enter a valid command, use the command 'help' if needed."], () => {
                            this.goToCommandLine();
                        })
                        break;
                    }
                }
            })
        })
    }

    generateManual = () => {
        const manuals = [...generateManual()];
        const mappedManuals: Types.OptionChoice[] = manuals.map((each) => {
            return {
                name: each.name,
                description: each.description,
                action: () => {
                    this.removeCommandLine(() => {
                        const stepArray = each.steps.map((each, index) => {
                            return `${index + 1}. ${each}`;
                        })
                        this.props.addLine(["------------------"].concat(stepArray).concat(["------------------"]), () => {
                            setTimeout(() => {
                                this.setState({ currentGamePoint: ReactorManagementOverloadGamePoint.MANUAL })
                            }, 1000)
                        })
                    })
                }
            }
        });
        return (
            <ConsolePicker
                onBackout={() => {
                    this.setState({ currentGamePoint: ReactorManagementOverloadGamePoint.NO_TERMINAL }, () => {
                        setTimeout(() => {
                            this.goToCommandLine();
                        }, 1000)
                    })
                }}
                scrollToBottom={this.props.updateScroll}
                options={mappedManuals}
            />
        )
    }


    render() {
        return (<div>
            {this.state.currentGamePoint === ReactorManagementOverloadGamePoint.MANUAL && this.generateManual()}
            {this.state.currentGamePoint === ReactorManagementOverloadGamePoint.MAIN && <TerminalInputHelper onSumbitCommand={this.handleCommandLine} />}
        </div>);
    }
}