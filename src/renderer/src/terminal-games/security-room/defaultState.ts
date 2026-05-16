import { AdminSecurityState } from './screens/admin';
import { GameMode, LogsType, SystemStatus } from './types';

const CELL_IDS: Record<GameMode, string[]> = {
    single: ['cell_1'],
    multi: ['cell_1', 'cell_2', 'cell_3', 'cell_4', 'cell_5']
}

export const getCellIds = (mode: GameMode): string[] => CELL_IDS[mode]

export const getCellBlockDefaultState = (mode: GameMode): Record<string, SystemStatus> => {
    const cells = getCellIds(mode).reduce<Record<string, SystemStatus>>((acc, id) => {
        acc[id] = SystemStatus.Online
        return acc
    }, {})
    return {
        ...cells,
        checkpoint: SystemStatus.Online,
        docking_bay: SystemStatus.Online,
        armory: SystemStatus.Online,
        guard_station: SystemStatus.Offline
    }
}

export const CommsLogs: LogsType[] = [
    {
        title: "Intercepted Station Bulletin #91",
        description: "General Crew Distribution",
        text: "Three detainees have been transferred to Block Alpha. Cells 1, 2, and 3 are occupied. Checkpoint and docking bay have been sealed. Block access codes have NOT been changed — contact security admin for current credentials."
    },
    {
        title: "INTERCEPTED — Security Admin Memo",
        description: "From: Commander Rel  |  To: Security Division  |  CLASSIFIED",
        text: "Temporary admin credentials following system reset:\n\n  Account:  admin\n  Code:     ov3rs33r\n\nBlock emergency override (do not distribute):\n\n  Override code:  fr33dom\n\nDo not share. Rotate after next shift cycle."
    },
    {
        title: "Personal Message — Recovered Cache",
        description: "From: Officer Tanas  |  Unencrypted",
        text: "Be sure you don't mess up the execution of Losgui or the emperor will be furious. Apparently it's a family matter."
    }
]

export const CellBlockLogs: LogsType[] = [
    {
        title: "Inspection Log — Block Alpha",
        description: "Security Officer Report",
        text: "All three cells occupied. Detainees have been uncooperative but contained. Checkpoint and docking bay remain sealed per Commander Rel's standing order. No releases authorised until formal processing is complete."
    },
    {
        title: "Medical Note",
        description: "Station Medic Voss",
        text: "One of the detainees in cell 2 has a minor injury from the initial apprehension. Non-critical. Requested treatment has been denied by Commander Rel pending interrogation. Note filed for the record."
    },
    {
        title: "Armory Notice",
        description: "Security Division — Standing Order",
        text: "The armory door MUST remain locked at all times. It is not part of any release protocol. Under no circumstances should the armory be unlocked without direct authorization from Commander Rel. This is a standing order."
    }
]

export const AdminDefaultState: AdminSecurityState = {
    fullSystemStatus: SystemStatus.Online,
    shutdownPhase: 0
}
