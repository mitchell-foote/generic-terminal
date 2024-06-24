/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react';
import { ConsolePicker, LoadingHelper, TerminalInputHelper, Types } from 'react-terminal-game-builder';
import { ReactorManagementShieldTakedownState, ReactorManagementTopLevelConfiguration, ShieldMonitorStatus } from '../types';

enum ReactorManagementTakedownGamePoint {
    MAIN,
    NO_TERMINAL,
    ARCHIVES
}

const NO_LEVER_FOUND = "NO LEVER FOUND"

export type ReactorManagementTakedownGameState = {
    currentGamePoint: ReactorManagementTakedownGamePoint
}

interface ReactorManagementTakedownGameProps extends Types.GameComponentProps<ReactorManagementTopLevelConfiguration> {
    goBackToMain: () => void;
    gameState: ReactorManagementShieldTakedownState
    setGameState: (gameState: ReactorManagementShieldTakedownState, callback?: () => void) => void
}

export class ReactorManagementTakedownGame extends React.Component<ReactorManagementTakedownGameProps, ReactorManagementTakedownGameState> {
    state: ReactorManagementTakedownGameState = {
        currentGamePoint: ReactorManagementTakedownGamePoint.NO_TERMINAL
    }
    componentDidMount(): void {
        if (!this.props.overallState.shield_takedown || !this.props.overallState.shield_takedown.canShieldTakedown || this.props.gameState.success) {
            this.props.clearLines(() => {
                this.props.addLine(["Reactor shield unable to be accessed", "Returning to main menu."], () => {
                    this.props.goBackToMain();
                })
                return;
            })

        }
        else {
            this.props.clearLines(() => {
                this.props.addLine(["Shield Generator Access v3.0"], () => {
                    this.props.writeText({ message: "Access terminal initiating, loading shield profile... Find the correct placement of the levers below to cause a shield breakdown." }, () => {
                        this.props.writeText({ message: "Type 'help' to gain access to command list." }, () => {
                            this.goToCommandLine();
                        })
                    })
                })
            })

        }
    }
    turnOffCommandLine = (callback?: () => void) => {
        this.setState({ currentGamePoint: ReactorManagementTakedownGamePoint.NO_TERMINAL }, callback)
    }

    goToCommandLine = (callback?: () => void) => {
        this.setState({ currentGamePoint: ReactorManagementTakedownGamePoint.MAIN }, callback);
    }

    getCurrentShieldValue = () => {
        let shieldValue = ShieldMonitorStatus.NORMAL;
        let level = 0;
        if (this.props.gameState.success) {
            return ShieldMonitorStatus.NO_SHIELD;
        }
        if (this.props.gameState.lever_1 === this.props.overallState.shield_takedown?.correctPositions.lever_1) {
            level++;
        }
        if (this.props.gameState.lever_2 === this.props.overallState.shield_takedown?.correctPositions.lever_2) {
            level++;
        }
        if (this.props.gameState.lever_3 === this.props.overallState.shield_takedown?.correctPositions.lever_3) {
            level++;
        }
        if (this.props.gameState.lever_4 === this.props.overallState.shield_takedown?.correctPositions.lever_4) {
            level++
        }
        if (this.props.gameState.lever_5 === this.props.overallState.shield_takedown?.correctPositions.lever_5) {
            level++
        }
        if (level === 5) {
            shieldValue = ShieldMonitorStatus.CRITICAL_ISSUES
        }
        if (level === 4) {
            shieldValue = ShieldMonitorStatus.DANGEROUS_ISSUES
        }
        else if (level === 3) {
            shieldValue = ShieldMonitorStatus.MODERATE_ISSUES
        }
        else if (level === 2) {
            shieldValue = ShieldMonitorStatus.MILD_ISSUES
        }
        else if (level === 1) {
            shieldValue = ShieldMonitorStatus.MILD_ISSUES
        }
        return shieldValue;
    }

    decodeLeverName = (lever: string) => {
        const brokenDownLeverText = lever.toLowerCase().replaceAll("_", "").replaceAll("lever", "").replaceAll(" ", "");
        switch (brokenDownLeverText) {
            case "1": {
                return "lever_1"
            }
            case "2": {
                return "lever_2"
            }
            case "3": {
                return "lever_3"
            }
            case "4": {
                return "lever_4"
            }
            case "5": {
                return "lever_5"
            }
            default: {
                return NO_LEVER_FOUND
            }
        }
    }

    doHelp = () => {
        this.props.addLine([
            "Here are the available commands:",
            "archives - Scans the archives for prominent data. Ex: '> archives'",
            "help - Shows the list of available commands. Ex: '> help'",
            "clear - Clears the terminal. Ex: '> clear'",
            "set_up - Sets the lever to the up position. Ex: '> set_up <lever name>'",
            "set_down - Sets the lever to the down position. Ex: '> set_down <lever name>'",
            "set_middle - Sets the lever to the down position. Ex:'> set_middle <lever name>'",
            "pulse - Sends an energy pulse through the shielding system. Ex: '> pulse'"
        ], () => {
            this.goToCommandLine()
        })
    }

    doArchives = () => {
        this.props.writeText({ message: "Searching archives for relevant information..." }, () => {
            this.props.addLine([
                <LoadingHelper
                    message=''
                    startPercent={0}
                    endPercent={100}
                    onFinish={() => {
                        this.setState({ currentGamePoint: ReactorManagementTakedownGamePoint.ARCHIVES })
                    }}
                />])
        })
    }

    doSuccess = () => {
        const gameState = { ...this.props.gameState, success: true };

        this.props.clearLines(() => {
            this.props.writeText({ message: "Danger: Pulse execution destabilizing shield grid!", color: "red" }, () => {
                this.props.setGameState(gameState, () => {
                    this.props.addLine([
                        "Shield Stability...",
                        <LoadingHelper
                            startPercent={100}
                            endPercent={0}
                            transitionSpeed={100}
                            showPercent={true}
                            message={""}
                            onFinish={() => {
                                this.props.clearLines(() => {
                                    this.props.writeText({ message: `Danger! ${this.props.overallState.reactor_name} shield has failed!`, color: 'red' }, () => {
                                        this.props.addLine(["Now returning to main menu."], () => {
                                            setTimeout(() => {

                                                this.props.goBackToMain();
                                            }, 2000)
                                        })
                                    })

                                })

                            }}
                            color={true} />
                    ])
                })
            })
        })

    }

    onSetMiddle = (lever: string) => {
        this.props.setGameState({ ...this.props.gameState, [lever]: 'middle' }, () => {
            this.props.addLine([`Setting ${lever} to middle position`], () => {
                this.goToCommandLine();
            })
        })
    }
    onSetDown = (lever: string) => {
        this.props.setGameState({ ...this.props.gameState, [lever]: 'down' }, () => {
            this.props.addLine([`Setting ${lever} to down position`], () => {
                this.goToCommandLine();
            })
        })
    }
    onSetUp = (lever: string) => {
        this.props.setGameState({ ...this.props.gameState, [lever]: 'up' }, () => {
            this.props.addLine([`Setting ${lever} to up position`], () => {
                this.goToCommandLine();
            })
        })
    }

    onSuccessCommand = () => {
        this.props.addLine(["Unable to run command: Shielding system is offline"], () => {
            this.goToCommandLine();
        })
    }

    onPulse = () => {
        if (this.getCurrentShieldValue() === ShieldMonitorStatus.CRITICAL_ISSUES) {
            this.doSuccess();
        }
        else {
            this.props.writeText({ message: "Executing shield pulse..." }, () => {
                this.props.addLine([
                    <LoadingHelper
                        startPercent={0}
                        endPercent={100}
                        showPercent={true}
                        message=''
                        transitionSpeed={25}
                        onFinish={() => {
                            this.props.writeText({ message: "Shield pulse success: System operational" }, () => {
                                this.goToCommandLine();
                            })
                        }}
                    />
                ])
            })
        }
    }

    onSubmitCommand = (command: string, args: string[], fullText: string) => {
        this.turnOffCommandLine(() => {
            this.props.addLine([fullText], () => {
                switch (command.toLowerCase()) {
                    case "archives": {
                        this.doArchives();
                        break;
                    }
                    case "help": {
                        this.doHelp();
                        break;
                    }
                    case "clear": {
                        this.props.clearLines(() => {
                            this.goToCommandLine();
                        })
                        break;
                    }
                    case "set_up": {
                        if (this.props.gameState.success) {
                            this.onSuccessCommand();
                            break;
                        }
                        const leverText = args.join(" ");
                        const lever = this.decodeLeverName(leverText);
                        if (lever === NO_LEVER_FOUND) {
                            this.props.addLine(["Invalid lever name"], () => {
                                this.goToCommandLine();
                            })
                        }
                        else {
                            this.onSetUp(lever);
                        }
                        break;
                    }
                    case "set_down": {
                        if (this.props.gameState.success) {
                            this.onSuccessCommand();
                            break;
                        }
                        const leverText = args.join(" ");
                        const lever = this.decodeLeverName(leverText);
                        if (lever === NO_LEVER_FOUND) {
                            this.props.addLine(["Invalid lever name"], () => {
                                this.goToCommandLine();
                            })
                        }
                        else {
                            this.onSetDown(lever);
                        }
                        break;
                    }
                    case "set_middle": {
                        if (this.props.gameState.success) {
                            this.onSuccessCommand();
                            break;
                        }
                        const leverText = args.join(" ");
                        const lever = this.decodeLeverName(leverText);
                        if (lever === NO_LEVER_FOUND) {
                            this.props.addLine(["Invalid lever name"], () => {
                                this.goToCommandLine();
                            })
                        }
                        else {
                            this.onSetMiddle(lever);
                        }
                        break;
                    }
                    case "pulse": {
                        if (this.props.gameState.success) {
                            this.onSuccessCommand();
                            break;
                        }
                        this.onPulse();
                        break;
                    }
                    case "": {
                        this.goToCommandLine();
                        break;
                    }
                    default: {
                        this.props.addLine(["Please enter a valid command, use the command 'help' if needed."], () => {
                            this.goToCommandLine();
                        })
                    }
                }
            })
        })
    }
    generateArchivesSection = () => {
        const archives = this.props.overallState.shield_takedown ? [...this.props.overallState.shield_takedown.logs] : [];
        const mappedArchives: Types.OptionChoice[] = archives.map((each) => {
            return {
                name: each.title,
                description: each.description,
                action: () => {
                    this.setState({ currentGamePoint: ReactorManagementTakedownGamePoint.NO_TERMINAL }, () => {
                        this.props.addLine([
                            "--------------------",
                            `Name: ${each.title}`,
                            `Title: ${each.description}`,
                            each.text,
                            "--------------------",
                        ], () => {
                            setTimeout(() => {
                                this.setState({ currentGamePoint: ReactorManagementTakedownGamePoint.ARCHIVES })
                            }, 1000)
                        })
                    })

                }
            }
        });
        return (
            <ConsolePicker
                onBackout={() => {
                    this.setState({ currentGamePoint: ReactorManagementTakedownGamePoint.NO_TERMINAL }, () => {
                        setTimeout(() => {
                            this.goToCommandLine();
                        }, 1000)
                    })
                }}
                scrollToBottom={this.props.updateScroll}
                options={mappedArchives} />
        )

    }

    render() {
        return (
            <div>
                {this.state.currentGamePoint === ReactorManagementTakedownGamePoint.MAIN && <TerminalInputHelper onSumbitCommand={this.onSubmitCommand} />}
                {this.state.currentGamePoint === ReactorManagementTakedownGamePoint.ARCHIVES && this.generateArchivesSection()}

            </div>
        );
    }

}
