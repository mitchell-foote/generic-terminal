import * as React from 'react';
import { LoadingHelper, TerminalInputHelper, Types } from 'react-terminal-game-builder';
import { getCellIds } from '../defaultState';
import { GameMode, SystemStatus } from '../types';

export interface AdminSecurityState {
    fullSystemStatus: SystemStatus;
    shutdownPhase: number;
}

type AdminFullState = AdminSecurityState & {
    doors: Record<string, SystemStatus>;
    allowedLogins: Record<string, string>;
    mode: GameMode;
}

enum AdminGameState {
    NotLoaded,
    Loaded,
    AwaitingUnlockCode,
    Locked
}

interface AdminSecuritySystemProps extends Types.GameComponentProps<AdminFullState> {
    onLogout: Function;
}

interface AdminSecuritySystemState {
    currentState: AdminGameState
}

class AdminSecuritySystem extends React.Component<AdminSecuritySystemProps, AdminSecuritySystemState> {
    state: AdminSecuritySystemState = { currentState: AdminGameState.NotLoaded }

    componentDidMount() {
        this.props.clearLines(() => {
            this.props.writeText({ message: "Security Admin Console v2.3.4" }, () => {
                this.props.writeText({ message: "Type 'help' for available commands." }, () => {
                    this.goToCommandLine()
                })
            })
        })
    }

    goToCommandLine = () => {
        this.setState({ currentState: AdminGameState.Loaded })
    }

    handleCommandAction = (command: string, _args: string[], fullText: string) => {
        this.props.addLine([fullText], () => {
            switch (command.toLowerCase()) {
                case 'unlock': {
                    this.doUnlock()
                    break
                }
                case 'shutdown': {
                    this.doShutdown()
                    break
                }
                case 'clear': {
                    this.props.clearLines(() => { this.goToCommandLine() })
                    break
                }
                case 'help': {
                    this.doHelp()
                    break
                }
                case 'logout': {
                    this.props.onLogout()
                    break
                }
                default: {
                    this.props.addLine(['Command not recognized. Type "help" for a list of commands.'], () => {
                        this.goToCommandLine()
                    })
                }
            }
        })
    }

    handleUnlockCodeInput = (_command: string, _args: string[], fullText: string) => {
        this.props.addLine([fullText], () => {
            const code = fullText.replace('> ', '').trim()
            const expectedCode = this.props.overallState.allowedLogins['cell-control']
            if (!expectedCode) {
                this.props.addLine(["Override system unavailable."], () => { this.goToCommandLine() })
                return
            }
            if (code === expectedCode) {
                this.doPerformUnlock()
            } else {
                this.props.addLine(["Invalid override code. Access denied."], () => { this.goToCommandLine() })
            }
        })
    }

    doUnlock = () => {
        const doors = this.props.overallState.doors
        const cellIds = getCellIds(this.props.overallState.mode)
        const cellsAlreadyUnlocked = cellIds.every(id => doors[id] === SystemStatus.Offline)

        if (cellsAlreadyUnlocked) {
            this.props.addLine(["Cell block already released."], () => { this.goToCommandLine() })
            return
        }

        this.setState({ currentState: AdminGameState.NotLoaded }, () => {
            this.props.addLine(["Enter door override code:"], () => {
                this.setState({ currentState: AdminGameState.AwaitingUnlockCode })
            })
        })
    }

    doPerformUnlock = () => {
        this.setState({ currentState: AdminGameState.NotLoaded }, () => {
            this.props.writeText({ message: "Override code accepted. Initiating block release..." }, () => {
                this.props.addLine([
                    <LoadingHelper
                        startPercent={0}
                        endPercent={100}
                        message="Releasing cells"
                        color={true}
                        onFinish={() => {
                            const cellIds = getCellIds(this.props.overallState.mode)
                            const doorUpdates = cellIds.reduce<Record<string, SystemStatus>>((acc, id) => {
                                acc[id] = SystemStatus.Offline
                                return acc
                            }, {})
                            const newState = { ...this.props.overallState }
                            newState.doors = { ...newState.doors, ...doorUpdates }
                            this.props.updateOverallState(newState, () => {
                                const releaseLines = cellIds.map((_, i) => `Cell ${i + 1}: Released.`)
                                releaseLines.push("All cells unlocked. Type 'shutdown' to unlock checkpoint and shut down security systems.")
                                this.props.addLine(releaseLines, () => {
                                    this.goToCommandLine()
                                })
                            })
                        }}
                    />
                ])
            })
        })
    }

    doShutdown = () => {
        const doors = this.props.overallState.doors
        const cellIds = getCellIds(this.props.overallState.mode)
        const cellsUnlocked = cellIds.every(id => doors[id] === SystemStatus.Offline)

        if (!cellsUnlocked) {
            this.props.addLine([
                "ERROR: Shutdown rejected. Containment breach not confirmed.",
                "Use 'unlock' to open the block before initiating shutdown."
            ], () => { this.goToCommandLine() })
            return
        }

        this.setState({ currentState: AdminGameState.NotLoaded }, () => {
            const state1 = { ...this.props.overallState, shutdownPhase: 1 }
            this.props.updateOverallState(state1, () => {
                this.props.writeText({ message: 'WARNING: Security station shutdown in progress!', color: 'red' }, () => {
                    this.props.addLine([
                        <LoadingHelper
                            startPercent={100}
                            endPercent={70}
                            color={true}
                            showPercent={true}
                            transitionSpeed={150}
                            message="Power levels"
                            onFinish={() => {
                                const state2 = {
                                    ...this.props.overallState,
                                    shutdownPhase: 2,
                                    doors: { ...this.props.overallState.doors, checkpoint: SystemStatus.Offline }
                                }
                                this.props.updateOverallState(state2, () => {
                                    this.props.addLine([
                                        <LoadingHelper
                                            startPercent={70}
                                            endPercent={40}
                                            color={true}
                                            showPercent={true}
                                            transitionSpeed={150}
                                            message="Power levels"
                                            onFinish={() => {
                                                const state3 = {
                                                    ...this.props.overallState,
                                                    shutdownPhase: 3,
                                                    doors: { ...this.props.overallState.doors, docking_bay: SystemStatus.Offline }
                                                }
                                                this.props.updateOverallState(state3, () => {
                                                    this.props.addLine([
                                                        <LoadingHelper
                                                            startPercent={40}
                                                            endPercent={0}
                                                            color={true}
                                                            showPercent={true}
                                                            transitionSpeed={150}
                                                            message="Power levels"
                                                            onFinish={() => {
                                                                this.setState({ currentState: AdminGameState.Locked }, () => {
                                                                    const finalState = { ...this.props.overallState }
                                                                    finalState.fullSystemStatus = SystemStatus.Offline
                                                                    this.props.updateOverallState(finalState, () => {
                                                                        this.props.clearLines(() => {
                                                                            this.props.writeText({ message: 'This terminal has been disabled.', color: 'red' })
                                                                        })
                                                                    })
                                                                })
                                                            }}
                                                        />
                                                    ])
                                                })
                                            }}
                                        />
                                    ])
                                })
                            }}
                        />
                    ])
                })
            })
        })
    }

    doHelp = () => {
        this.setState({ currentState: AdminGameState.NotLoaded }, () => {
            this.props.addLine([
                "Commands available:",
                <div>unlock   -- Open Block Alpha (requires override code)<br />{'Usage: "> unlock"'}</div>,
                <div>shutdown -- Initiate full security system shutdown<br />{'Usage: "> shutdown"'}</div>,
                <div>clear    -- Clear the console<br />{'Usage: "> clear"'}</div>,
                <div>help     -- Show this help screen<br />{'Usage: "> help"'}</div>,
                <div>logout   -- Log out of admin account<br />{'Usage: "> logout"'}</div>,
            ], () => {
                this.goToCommandLine()
            })
        })
    }

    render() {
        const showInput =
            this.state.currentState === AdminGameState.Loaded ||
            this.state.currentState === AdminGameState.AwaitingUnlockCode
        const handler =
            this.state.currentState === AdminGameState.AwaitingUnlockCode
                ? this.handleUnlockCodeInput
                : this.handleCommandAction

        return (
            <div>
                {showInput && <TerminalInputHelper onSumbitCommand={handler} />}
            </div>
        )
    }
}

export default AdminSecuritySystem
