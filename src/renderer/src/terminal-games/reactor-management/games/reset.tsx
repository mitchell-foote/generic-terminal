/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react';

import { ConsolePicker, LoadingHelper, TerminalInputHelper, Types } from 'react-terminal-game-builder';
import { ReactorManagementResetState, ReactorManagementTopLevelConfiguration } from '../types';
import { generateManual } from '../default-state';

enum ReactorManagementResetGamePoint {
    MAIN,
    NO_TERMINAL,
    MANUAL
}

export type ReactorManagementResetGameState = {
    currentGamePoint: ReactorManagementResetGamePoint
}

interface ReactorManagementResetGameProps extends Types.GameComponentProps<ReactorManagementTopLevelConfiguration> {
    goBackToMain: () => void;
    gameState: ReactorManagementResetState
    setGameState: (gameState: ReactorManagementResetState, callback?: () => void) => void
}

export class ReactorManagementResetGame extends React.Component<ReactorManagementResetGameProps, ReactorManagementResetGameState> {
    state: ReactorManagementResetGameState = {
        currentGamePoint: ReactorManagementResetGamePoint.NO_TERMINAL
    }
    componentDidMount(): void {
        if (!this.props.overallState.reset || !this.props.overallState.reset.canReset || this.props.gameState.restartFinalRestart) {
            this.props.clearLines(() => {
                this.props.addLine(["Reactor is currently online.", "Now returning to selection options."], () => {
                    setTimeout(() => {
                        this.props.goBackToMain();
                    }, 2000)
                })
            })
        }
        else {
            this.props.clearLines(() => {
                this.props.writeText({ color: 'red', message: `Warning, ${this.getReactorName()} is offline! Recommend typing 'manual' and following procedures for reactor reactivation.` }, () => {
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
        return this.props.overallState.reset?.troubledInjector || "injector_bravo"
    }

    goToCommandLine: (full?: boolean, callback?: () => void) => void = (full?: boolean, callback?: () => void) => {
        if (full) {
            this.props.writeText({ message: "Command line active. Type 'help' for a list of available commands" }, () => {
                this.setState({ currentGamePoint: ReactorManagementResetGamePoint.MAIN }, callback)

            })
        }
        else {
            this.setState({ currentGamePoint: ReactorManagementResetGamePoint.MAIN }, callback)
        }
    }

    removeCommandLine = (callback?: () => void) => {
        this.setState({ currentGamePoint: ReactorManagementResetGamePoint.NO_TERMINAL }, callback)
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
        this.props.addLine(['Unable to open vents: Reactor is offline'], () => this.goToCommandLine())
    }
    finishRestart = () => {
        const gameState = { ...this.props.gameState }
        this.props.clearLines(() => {
            this.props.writeText({ message: "Attempting to restart reactor..." }, () => {
                this.props.addLine([
                    <LoadingHelper
                        message='Building initial charge...'
                        startPercent={0}
                        endPercent={100}
                        showPercent={true}
                        transitionSpeed={100}
                        onFinish={() => {
                            this.props.addLine([
                                <LoadingHelper
                                    message='Setting prefire sequence...'
                                    startPercent={0}
                                    endPercent={100}
                                    showPercent={true}
                                    transitionSpeed={100}
                                    onFinish={() => {
                                        this.props.addLine([
                                            <LoadingHelper
                                                message='Initializing injectors...'
                                                startPercent={0}
                                                endPercent={100}
                                                showPercent={true}
                                                transitionSpeed={100}
                                                onFinish={() => {
                                                    this.props.addLine([
                                                        <LoadingHelper
                                                            message='Reactor Restart Process...'
                                                            startPercent={0}
                                                            endPercent={100}
                                                            showPercent={true}
                                                            color
                                                            transitionSpeed={500}
                                                            onFinish={() => {
                                                                this.props.writeText({ message: "Reactor restart complete!" }, () => {
                                                                    gameState.restartFinalRestart = true;
                                                                    this.props.setGameState(gameState, () => {
                                                                        this.props.addLine(["Reactor has been successfully restarted, now returning to main menu."], () => {
                                                                            setTimeout(() => {
                                                                                this.props.goBackToMain();
                                                                            }, 2000)
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
        if (this.props.gameState.restartFlush) {
            this.props.addLine(["Unable to flush reactor system: Reactor system has already been flushed"], () => this.goToCommandLine())
        }
        else {
            this.props.writeText({ message: "Attempting to flush reactor system" }, () => {
                this.props.addLine([
                    <LoadingHelper
                        message='Detecting latent energy'
                        startPercent={0}
                        endPercent={100}
                        onFinish={() => {
                            this.props.addLine([
                                <LoadingHelper
                                    message='Flushing energy'
                                    startPercent={0}
                                    endPercent={100}
                                    onFinish={() => {
                                        this.props.writeText({ message: `Flush process success!` }, () => {
                                            const gameState = { ...this.props.gameState };
                                            gameState.restartFlush = true;
                                            this.props.setGameState(gameState, () => {
                                                this.goToCommandLine()
                                            })
                                        })
                                    }}
                                />
                            ])

                        }}
                    />
                ])
            })
        }
    }

    doPrimeSystem = () => {
        if (this.props.gameState.restartFlush) {
            if (this.props.gameState.restartPrime) {
                this.props.addLine(["Unable to prime reactor: Reactor is already primed"], () => this.goToCommandLine())
            }
            else {
                this.props.writeText({ message: "Reactor priming sequence engaged..." }, () => {
                    this.props.addLine([
                        <LoadingHelper
                            startPercent={0}
                            endPercent={100}
                            showPercent
                            message='Running preflight checks...'
                            transitionSpeed={50}
                            onFinish={() => {
                                this.props.addLine([
                                    <LoadingHelper
                                        startPercent={0}
                                        endPercent={100}
                                        showPercent
                                        message='Executing mainline code...'
                                        transitionSpeed={50}
                                        onFinish={() => {
                                            this.props.addLine([
                                                <LoadingHelper
                                                    startPercent={0}
                                                    endPercent={100}
                                                    showPercent
                                                    message='Coils Ionizing...'
                                                    transitionSpeed={50}
                                                    onFinish={() => {
                                                        this.props.writeText({ message: "Reactor successfully primed" }, () => {
                                                            const gameState = { ...this.props.gameState };
                                                            gameState.restartPrime = true;
                                                            this.props.setGameState(gameState, () => this.goToCommandLine())
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
        }
        else {
            this.props.addLine(["Unable to prime reactor: Reactor has not been flushed"], () => this.goToCommandLine())
        }
    }

    doRestart = () => {
        if (this.props.gameState.restartPrime) {
            if (this.props.gameState.restartFirstRestart) {
                if (this.props.gameState.restartEmergencyOverride) { // Do Finish
                    this.finishRestart()
                }
                else { // Tell them they need to override
                    this.props.addLine([`Unable to restart reactor: Injector ${this.getTargetOverrideSystem()} has been jammed. Use the '> emergency_override ${this.getTargetOverrideSystem()}' command before attempting another restart.`], () => this.goToCommandLine());
                }
            }
            else { // Do the first restart
                this.props.writeText({ message: "Attempting to restart reactor..." }, () => {
                    this.props.addLine([
                        <LoadingHelper
                            message='Building initial charge...'
                            startPercent={0}
                            endPercent={100}
                            showPercent={true}
                            transitionSpeed={100}
                            onFinish={() => {
                                this.props.addLine([
                                    <LoadingHelper
                                        message='Setting pre-fire sequence...'
                                        startPercent={0}
                                        endPercent={100}
                                        showPercent={true}
                                        transitionSpeed={100}
                                        onFinish={() => {
                                            this.props.addLine([
                                                <LoadingHelper
                                                    message='Initializing injectors...'
                                                    startPercent={0}
                                                    endPercent={40}
                                                    showPercent={true}
                                                    transitionSpeed={100}
                                                    onFinish={() => {
                                                        this.props.updateScroll();
                                                        const gameState = { ...this.props.gameState };
                                                        gameState.restartFirstRestart = true;
                                                        this.props.setGameState(gameState, () => {
                                                            this.props.writeText({ color: "red", message: `Warning! Reactor restart aborted. ${this.getTargetOverrideSystem()} has jammed.  ` }, () => {
                                                                this.props.writeText({ color: 'red', message: `Recommend running '> emergency_override ${this.getTargetOverrideSystem()}'` }, () => {
                                                                    this.props.writeText({ color: 'red', message: `Unable to proceed with restart until this is done.` }, () => this.goToCommandLine())
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
                })
            }
        }
        else {
            this.props.addLine(["Unable to restart reactor: Reactor has not been primed"], () => this.goToCommandLine())
        }
    }

    doEmergencyOverride = (system: string) => {
        if (!system) {
            this.props.addLine(["Unable to do emergency override: System must be specified. Example: '> emergency_override " + this.getTargetOverrideSystem() + "'."], () => this.goToCommandLine())
        }
        else if (system.toLowerCase() === this.getTargetOverrideSystem().toLowerCase()) {
            if (this.props.gameState.restartEmergencyOverride) {
                this.props.addLine(["Unable to do emergency override: System has already been overridden"], () => this.goToCommandLine())
            }
            else {
                this.props.writeText({ message: `System ${system} has been overridden.` }, () => {
                    const gameState = { ...this.props.gameState };
                    gameState.restartEmergencyOverride = true;
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
                            this.goToCommandLine(true);
                        })
                        break;
                    }
                    case 'manual': {
                        this.props.clearLines(() => {
                            this.props.writeText({ message: "Opening ENG manual..." }, () => {
                                this.setState({ currentGamePoint: ReactorManagementResetGamePoint.MANUAL })
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
                                this.setState({ currentGamePoint: ReactorManagementResetGamePoint.MANUAL })
                            }, 1000)
                        })
                    })
                }
            }
        });
        return (
            <ConsolePicker
                onBackout={() => {
                    this.setState({ currentGamePoint: ReactorManagementResetGamePoint.NO_TERMINAL }, () => {
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
            {this.state.currentGamePoint === ReactorManagementResetGamePoint.MANUAL && this.generateManual()}
            {this.state.currentGamePoint === ReactorManagementResetGamePoint.MAIN && <TerminalInputHelper onSumbitCommand={this.handleCommandLine} />}
        </div>);
    }
}