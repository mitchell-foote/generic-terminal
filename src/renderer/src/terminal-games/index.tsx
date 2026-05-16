import { ReactorManagementStartingConfigurationProps, ReactorManagementWrapped, generateStartingState } from './reactor-management/wrapped';
import { SecurityRoomConfig, SecurityRoomWrapped } from './security-room/wrapped';
import { GameConfig, GameSignature } from './types';


export const SecurityRoom: GameSignature = {
    id: 'security-room',
    displayName: 'Security Room',
    description: 'A security station terminal with door control, docking control, tractor beam, and admin subsystems accessed via login',
    baseUrl: '/security-room',
    loadGameVersions: async () => {
        const fileStringArray = await window.api.loadConfigDirectory("security-room");
        if (fileStringArray.length === 0) {
            return [];
        }
        let files = fileStringArray.map((fileString) => {
            try {
                return JSON.parse(fileString);
            }
            catch {
                return {};
            }
        });
        files = files.filter((file) => file.id);
        return files;
    },
    noGameVersions: async () => {
        const defaultLogins = {
            'comms': 'acc3ss',
            'admin': '0v3rs33r',
            'cell-control': 'fr33dom'
        };
        const multiConfig: SecurityRoomConfig = { id: 'default', mode: 'multi', allowedLogins: defaultLogins };
        const singleConfig: SecurityRoomConfig = { id: 'single', mode: 'single', allowedLogins: defaultLogins };
        const multiGameData: GameConfig = { baseData: multiConfig, displayName: 'Default (5 prisoners)', id: 'default' };
        const singleGameData: GameConfig = { baseData: singleConfig, displayName: 'Single Prisoner', id: 'single' };
        await window.api.saveConfigFile("security-room/", "default.json", JSON.stringify(multiGameData));
        await window.api.saveConfigFile("security-room/", "single.json", JSON.stringify(singleGameData));
        return [multiGameData, singleGameData];
    },
    renderGame: (gameConfig: GameConfig) => {
        return <SecurityRoomWrapped {...gameConfig.baseData as SecurityRoomConfig} />;
    }
}

export const ReactorManagement: GameSignature = {
    id: 'reactor-management',
    displayName: 'Reactor management',
    description: "This game allows you to save an overload, restart a reactor, and turn off it's shield",
    baseUrl: '/reactor',
    loadGameVersions: async () => {
        const fileStringArray = await window.api.loadConfigDirectory("reactor");
        if (fileStringArray.length === 0) {
            return []
        }
        else {
            let files = fileStringArray.map((fileString) => {
                try {
                    return JSON.parse(fileString)
                }
                catch {
                    return {};
                }

            });
            files = files.filter((file) => file.id);
            return files;
        }
    },
    noGameVersions: async () => {
        const data = generateStartingState();
        const gameData = data.map((gameConfig) => {
            return { baseData: gameConfig, displayName: gameConfig.id, id: gameConfig.id }
        })
        const fileStrings = gameData.map((gameConfig) => JSON.stringify(gameConfig));
        data.forEach((gameConfig, index) => {
            window.api.saveConfigFile("reactor/", `${gameConfig.id}.json`, fileStrings[index])
        })
        return gameData;
    },
    renderGame: (gameConfig: GameConfig) => {
        return <ReactorManagementWrapped {...gameConfig.baseData as ReactorManagementStartingConfigurationProps} />
    }
}