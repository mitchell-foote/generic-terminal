import * as React from 'react';
import { Types, ConsolePicker, TerminalInputHelper } from 'react-terminal-game-builder';
import { AdminDefaultState, getCellBlockDefaultState, CommsLogs } from './defaultState';
import AdminSecuritySystem, { AdminSecurityState } from './screens/admin';
import CommsTerminal, { CommsTerminalState } from './screens/comms';
import { GameMode, SystemStatus } from './types';

enum GameState {
    NotLoaded,
    Login,
    AwaitingPassword,
    LoggedInComms,
    LoggedInAdmin,
}

export interface FullSecurityState extends Types.LoginOverallState, AdminSecurityState, CommsTerminalState {
    allowedLogins: Record<string, string>
    doors: Record<string, SystemStatus>
    mode: GameMode
}

export interface SecurityRoomTerminalOverallState extends Types.GameComponentProps<FullSecurityState> {
}

interface MainStoryWrapperState {
    mainGameState: GameState
    pendingUsername?: string
}

class MainStorySecurityTerminal extends React.Component<SecurityRoomTerminalOverallState, MainStoryWrapperState> {
    state: MainStoryWrapperState = { mainGameState: GameState.NotLoaded }

    componentDidMount() {
        let overallState = { ...this.props.overallState }
        overallState = {
            ...overallState,
            ...AdminDefaultState,
            commsLogs: [...CommsLogs],
            doors: getCellBlockDefaultState(this.props.overallState.mode)
        }
        this.props.updateOverallState(overallState, () => {
            this.props.addLine(["Security Station Remote Access v1.0.0"], () => {
                this.setState({ mainGameState: GameState.Login })
            })
        })
    }

    moveToLoginScreen = () => {
        this.setState({ mainGameState: GameState.NotLoaded, pendingUsername: undefined }, () => {
            this.props.clearLines(() => {
                this.props.addLine(["Security Station Remote Access v1.0.0"], () => {
                    this.setState({ mainGameState: GameState.Login })
                })
            })
        })
    }

    handleAccountSelected = (username: string) => {
        this.setState({ mainGameState: GameState.NotLoaded, pendingUsername: username }, () => {
            this.props.addLine([`Account: ${username}`, "Enter access code:"], () => {
                this.setState({ mainGameState: GameState.AwaitingPassword })
            })
        })
    }

    handlePasswordSubmit = (_command: string, _args: string[], fullText: string) => {
        const username = this.state.pendingUsername!
        const password = fullText.replace('> ', '').trim()
        if (!password) return

        const expected = this.props.overallState.allowedLogins[username]

        if (password === expected) {
            const newState = { ...this.props.overallState }
            newState.login = { username, password }
            this.props.updateOverallState(newState, () => {
                this.moveToLoggedInScreen()
            })
        } else {
            this.props.addLine(["Access denied."], () => {
                this.setState({ mainGameState: GameState.Login, pendingUsername: undefined })
            })
        }
    }

    moveToLoggedInScreen = () => {
        switch (this.props.overallState.login.username) {
            case "comms": {
                this.setState({ mainGameState: GameState.LoggedInComms })
                break
            }
            case "admin": {
                this.setState({ mainGameState: GameState.LoggedInAdmin })
                break
            }
            default: {
                this.props.addLine(["Unknown account. Please try again."], () => {
                    this.moveToLoginScreen()
                })
            }
        }
    }

    handleLogout = () => {
        this.moveToLoginScreen()
    }

    render() {
        const loginOptions: Types.OptionChoice[] = [
            {
                name: 'comms',
                description: 'Interstellar communications array',
                action: () => { this.handleAccountSelected('comms') }
            },
            {
                name: 'admin',
                description: 'Security admin console',
                action: () => { this.handleAccountSelected('admin') }
            }
        ]

        return (
            <div>
                {this.state.mainGameState === GameState.Login && (
                    <ConsolePicker
                        options={loginOptions}
                        onBackout={() => {}}
                        scrollToBottom={this.props.updateScroll}
                    />
                )}
                {this.state.mainGameState === GameState.AwaitingPassword && (
                    <TerminalInputHelper onSumbitCommand={this.handlePasswordSubmit} />
                )}
                {this.state.mainGameState === GameState.LoggedInComms && (
                    <CommsTerminal {...this.props} onLogout={this.handleLogout} />
                )}
                {this.state.mainGameState === GameState.LoggedInAdmin && (
                    <AdminSecuritySystem {...this.props} onLogout={this.handleLogout} />
                )}
            </div>
        )
    }
}

export default MainStorySecurityTerminal
