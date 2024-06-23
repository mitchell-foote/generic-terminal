/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react';
import { ReactorManagementOverloadState, ReactorManagementResetState, ReactorManagementShieldTakedownState, ReactorManagementTopLevelConfiguration } from './types';
import { ConsolePicker, Types } from 'react-terminal-game-builder';
import { ReactorManagementOverloadGame } from './games/overload';
import { ReactorManagementResetGame } from './games/reset';
import { ReactorManagementTakedownGame } from './games/takedown';

enum ReactorManagementGameStateChoice {
    NONE,
    MAIN,
    OVERLOAD,
    RESTART,
    SHIELD_TAKEDOWN
}



export type ReactorManagementGameState = {
    gameStateChoice: ReactorManagementGameStateChoice
}

interface FullReactorGameProps extends Types.GameComponentProps<ReactorManagementTopLevelConfiguration> {

}

export class ReactorManagementGame extends React.Component<FullReactorGameProps, ReactorManagementGameState> {
    constructor(props: FullReactorGameProps) {
        super(props);
        this.state = {
            gameStateChoice: ReactorManagementGameStateChoice.NONE,
        }
    }
    componentDidMount(): void {
        this.props.writeText({ message: `${this.props.overallState.system_name} ${this.props.overallState.reactor_name} Management System` }, () => {
            this.props.writeText({ message: "Please select an option to continue" }, () => {
                this.setState({ gameStateChoice: ReactorManagementGameStateChoice.MAIN })
            })
        })
    }
    handleOverloadStateChange = (gameState: ReactorManagementOverloadState, callback?: () => void) => {
        this.props.updateOverallState({ ...this.props.overallState, overloadGameState: gameState }, callback)
    }
    handleResetStateChange = (gameState: ReactorManagementResetState, callback?: () => void) => {
        this.props.updateOverallState({ ...this.props.overallState, resetGameState: gameState }, callback)
    }
    handleShieldTakedownStateChange = (gameState: ReactorManagementShieldTakedownState, callback?: () => void) => {
        this.props.updateOverallState({ ...this.props.overallState, shieldTakedownGameState: gameState }, callback)
    }

    generateConsolePickerOptions = () => {
        const options = [
            {
                name: "Reactor Overload Management",
                description: "Instructions when reactor is overloading",
                action: () => {
                    this.setState({ gameStateChoice: ReactorManagementGameStateChoice.OVERLOAD })
                }
            },
            {
                name: "Reactor Startup Management",
                description: "Instructions to restart the reactor",
                action: () => {
                    this.setState({ gameStateChoice: ReactorManagementGameStateChoice.RESTART })
                }
            },
            {
                name: "Reactor shield management",
                description: "Instructions to take down the shields",
                action: () => {
                    this.setState({ gameStateChoice: ReactorManagementGameStateChoice.SHIELD_TAKEDOWN })
                }
            }
        ];
        return (
            <ConsolePicker
                options={options}
                scrollToBottom={this.props.updateScroll}
                onBackout={() => {
                    this.props.addLine(["Already at top level, unable to go back"])
                }}
            />
        )
    }

    render() {
        return <div>
            {this.state.gameStateChoice === ReactorManagementGameStateChoice.MAIN && this.generateConsolePickerOptions()}
            {this.state.gameStateChoice === ReactorManagementGameStateChoice.OVERLOAD &&
                <ReactorManagementOverloadGame
                    {...this.props}
                    goBackToMain={() => this.setState({ gameStateChoice: ReactorManagementGameStateChoice.MAIN })}
                    gameState={this.props.overallState.overloadGameState}
                    setGameState={this.handleOverloadStateChange}
                />
            }
            {this.state.gameStateChoice === ReactorManagementGameStateChoice.RESTART &&
                <ReactorManagementResetGame
                    {...this.props}
                    goBackToMain={() => this.setState({ gameStateChoice: ReactorManagementGameStateChoice.MAIN })}
                    gameState={this.props.overallState.resetGameState}
                    setGameState={this.handleResetStateChange}
                />
            }
            {this.state.gameStateChoice === ReactorManagementGameStateChoice.SHIELD_TAKEDOWN &&
                <ReactorManagementTakedownGame
                    {...this.props}
                    goBackToMain={() => this.setState({ gameStateChoice: ReactorManagementGameStateChoice.MAIN })}
                    gameState={this.props.overallState.shieldTakedownGameState}
                    setGameState={this.handleShieldTakedownStateChange}
                />
            }
        </div>
    }

}