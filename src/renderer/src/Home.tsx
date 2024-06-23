/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect } from 'react';
import * as Games from "./terminal-games";
import { GameConfig, GameSignature } from './terminal-games/types';
import { Link } from 'react-router-dom';

type HomeProps = {
    executeGame: (gameConfig: GameConfig, game: GameSignature) => void;
}

export const Home: React.FC<HomeProps> = (props) => {
    const [selectedGameSignatureConfig, setSelectedGameSignatureConfig] = React.useState<GameSignature>();
    const [availableGameConfigs, setAvailableGameConfigs] = React.useState<GameConfig[]>();
    const links = Object.values(Games).map((game) => (
        <Link id={game.id} key={game.id} to={game.baseUrl}>{ }</Link>
    ))
    useEffect(() => {
        if (selectedGameSignatureConfig) {
            selectedGameSignatureConfig.loadGameVersions().then((gameConfigs) => {
                if (!gameConfigs || gameConfigs.length === 0) {
                    selectedGameSignatureConfig.noGameVersions().then((gameConfigs) => {
                        setAvailableGameConfigs(gameConfigs)
                    })
                }
                else {
                    setAvailableGameConfigs(gameConfigs)
                }
            })
        }
    }, [selectedGameSignatureConfig]);

    const selectGameSignature = (gameSignature: GameSignature) => {
        setAvailableGameConfigs([])
        setSelectedGameSignatureConfig(gameSignature);
    }
    if (!selectedGameSignatureConfig) {
        return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: "oldlace" }}>
            <h1>Welcome to the terminal games!</h1>
            <p>Choose a game to play</p>
            {Object.values(Games).map((game) => (
                <button key={game.id} onClick={() => selectGameSignature(game)}>{game.displayName}</button>
            ))}
            <div style={{ marginTop: '2rem' }}>Important key-combos</div>
            <div>
                <code>Command Or Control + Alt + K </code>
                <span>Toggles Kiosk Mode</span>
            </div>
            <div>
                <code>Command Or Control + Alt + I </code>
                <span>Opens Dev Tools</span>
            </div>
            <div>
                <code>Command Or Control + Alt + R </code>
                <span>Restarts the application</span>
            </div>
            <div>
                <code>Command Or Control + Alt + Q </code>
                <span>Close the App window</span>
            </div>

        </div>
    }
    else if (availableGameConfigs) {
        return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>Welcome to the terminal games!</h1>
            <h2>{selectedGameSignatureConfig.displayName}</h2>
            <p>Choose a game version to play</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {availableGameConfigs.map((gameConfig) => (
                    <button key={gameConfig.id} onClick={() => props.executeGame(gameConfig, selectedGameSignatureConfig)}>{gameConfig.displayName}</button>
                ))}
            </div>
            <button onClick={() => setSelectedGameSignatureConfig(undefined)}>Go back</button>
            {links}
        </div>
    }
    return <div>Loading...</div>
}
