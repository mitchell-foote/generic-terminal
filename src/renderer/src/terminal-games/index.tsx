import { ReactorManagementStartingConfigurationProps, ReactorManagementWrapped, generateStartingState } from './reactor-management/wrapped';
import { GameConfig, GameSignature } from './types';


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