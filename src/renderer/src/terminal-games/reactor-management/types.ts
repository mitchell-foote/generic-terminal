export type ReactorManagementTopLevelConfiguration = {
  id: string
  reactor_name: string
  system_name: string
  overload?: ReactorManagementOverloadConfiguration
  reset?: ReactorManagementResetConfiguration
  shield_takedown?: ReactorManagementShieldTakedownConfiguration
  overloadGameState: ReactorManagementOverloadState
  resetGameState: ReactorManagementResetState
  shieldTakedownGameState: ReactorManagementShieldTakedownState
}

export type ReactorManagementOverloadConfiguration = {
  canOverload: boolean
  troubledVent: string
}

export type ReactorManagementResetConfiguration = {
  canReset: boolean
  troubledInjector: string
}

export type ReactorManagementShieldTakedownConfiguration = {
  canShieldTakedown: boolean
  correctPositions: {
    lever_1: 'up' | 'down' | 'middle'
    lever_2: 'up' | 'down' | 'middle'
    lever_3: 'up' | 'down' | 'middle'
    lever_4: 'up' | 'down' | 'middle'
    lever_5: 'up' | 'down' | 'middle'
  },
  startingPositions: {
    lever_1: 'up' | 'down' | 'middle'
    lever_2: 'up' | 'down' | 'middle'
    lever_3: 'up' | 'down' | 'middle'
    lever_4: 'up' | 'down' | 'middle'
    lever_5: 'up' | 'down' | 'middle'
  }
  logs: {
    title: string
    description: string
    text: string
  }[]
}

export type ReactorManagementOverloadState = {
  overloadFinalFlush: boolean,
  overloadEmergencyOverride: boolean,
  overloadFirstFlush: boolean,
  overloadVentsOpen: boolean,
}

export type ReactorManagementResetState = {
  restartFlush: boolean,
  restartPrime: boolean,
  restartEmergencyOverride: boolean,
  restartFinalRestart: boolean,
  restartFirstRestart: boolean,
}

export type ReactorManagementShieldTakedownState = {
  lever_1: 'up' | 'down' | 'middle'
  lever_2: 'up' | 'down' | 'middle'
  lever_3: 'up' | 'down' | 'middle'
  lever_4: 'up' | 'down' | 'middle'
  lever_5: 'up' | 'down' | 'middle'
  success: boolean
}

export enum ShieldMonitorStatus {
  NORMAL,
  MILD_ISSUES,
  MODERATE_ISSUES,
  DANGEROUS_ISSUES,
  CRITICAL_ISSUES,
  SHIELDS_FAILING,
  NO_SHIELD

}
