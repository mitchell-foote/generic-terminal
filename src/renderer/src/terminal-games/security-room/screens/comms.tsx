import * as React from 'react';
import { ConsolePicker, TerminalInputHelper, Types } from 'react-terminal-game-builder';
import { LogsType } from '../types';

export interface CommsTerminalState {
    commsLogs: LogsType[]
}

enum CommsGameState {
    Loaded,
    Unloaded,
    Logs
}

interface CommsProps extends Types.GameComponentProps<CommsTerminalState> {
    onLogout: Function
}

interface CommsComponentState {
    currentState: CommsGameState
}

class CommsTerminal extends React.Component<CommsProps, CommsComponentState> {
    state: CommsComponentState = { currentState: CommsGameState.Unloaded }

    componentDidMount() {
        this.props.clearLines(() => {
            this.props.writeText({ message: "Interstellar Communications Array v3.1.0" }, () => {
                this.props.writeText({ message: "Accessing intercepted message cache..." }, () => {
                    this.props.writeText({ message: "Type 'logs' to view messages. Type 'help' for commands." }, () => {
                        this.goToCommandLine()
                    })
                })
            })
        })
    }

    goToCommandLine = () => {
        this.setState({ currentState: CommsGameState.Loaded })
    }

    doLogs = () => {
        this.setState({ currentState: CommsGameState.Logs })
    }

    doHelp = () => {
        this.setState({ currentState: CommsGameState.Unloaded }, () => {
            this.props.addLine(['Commands available for use:',
                <div>logs -- Displays intercepted message cache<br />{'Usage: "> logs"'}</div>,
                <div>help -- Opens this screen<br />{'Usage: "> help"'}</div>,
                <div>clear -- Clears the console<br />{'Usage: "> clear"'}</div>,
                <div>logout -- Logs out of this account<br />{'Usage: "> logout"'}</div>,
            ], () => {
                this.goToCommandLine()
            })
        })
    }

    handleCommandAction = (command: string, _args: string[], fullText: string) => {
        this.props.addLine([fullText], () => {
            switch (command.toLowerCase()) {
                case 'logs': {
                    this.doLogs()
                    break
                }
                case 'help': {
                    this.doHelp()
                    break
                }
                case 'clear': {
                    this.props.clearLines(() => {
                        this.goToCommandLine()
                    })
                    break
                }
                case 'logout': {
                    this.props.onLogout()
                    break
                }
                default: {
                    this.props.addLine(['Unknown command. Type "help" to get a list of commands.'], () => {
                        this.goToCommandLine()
                    })
                }
            }
        })
    }

    generateLogsSection = () => {
        const logs = [...this.props.overallState.commsLogs]
        const mappedLogs: Types.OptionChoice[] = logs.map((each) => ({
            name: each.title,
            description: each.description,
            action: () => {
                this.setState({ currentState: CommsGameState.Unloaded }, () => {
                    this.props.addLine([
                        "--------------------",
                        `${each.title}`,
                        `${each.description}`,
                        "--------------------",
                        each.text,
                        "--------------------"
                    ], () => {
                        this.setState({ currentState: CommsGameState.Logs })
                    })
                })
            }
        }))
        return (
            <ConsolePicker
                options={mappedLogs}
                onBackout={this.goToCommandLine}
                scrollToBottom={this.props.updateScroll}
            />
        )
    }

    render() {
        return (
            <div>
                {this.state.currentState === CommsGameState.Loaded && (
                    <TerminalInputHelper onSumbitCommand={this.handleCommandAction} />
                )}
                {this.state.currentState === CommsGameState.Logs && this.generateLogsSection()}
            </div>
        )
    }
}

export default CommsTerminal
