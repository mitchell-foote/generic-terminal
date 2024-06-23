import React, { useEffect } from 'react'
import { ReactorManagementTopLevelConfiguration } from './types'

export const ReactorManagementLanding: React.FC<unknown> = () => {
    const [selectedVersion, setSelectedVersion] = React.useState<string>('')
    const [possibleVersions, setPossibleVersions] = React.useState<
        ReactorManagementTopLevelConfiguration[]
    >([]);
    const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
    useEffect(() => {
        window.api.loadConfigFile("reactor-management/", "config.json", {
            id: "basic",
            reactor_name: "Reactor",
            system_name: "System",
            overload: {
                canOverload: true,
                troubledVent: "vent_alpha"
            },
            reset: {
                canReset: true,
                troubledInjector: "injector_bravo"
            },
            shield_takedown: {
                canShieldTakedown: true,
                correctPositions: {
                    lever_1: "up",
                    lever_2: "down",
                    lever_3: "middle",
                    lever_4: "up",
                    lever_5: "down"
                },
                logs: [{
                    title: "Logs",
                    description: "This is the logs section",
                    text: "This is the logs text"
                }]
            }
        } as ReactorManagementTopLevelConfiguration).then((data) => {
            setPossibleVersions([JSON.parse(data)]);
        }).catch((e) => {
            console.error(e);
        });
    }, []);

    if (!isPlaying) {
        return (
            <div>
                <h1>Reactor Management</h1>
                <h2>Select a version to play</h2>
                <ul>
                    {possibleVersions.map((version, index) => {
                        return (
                            <li key={index}>
                                <button onClick={() => setSelectedVersion(version.reactor_name)}>{version.id}</button>
                            </li>
                        );
                    })}
                </ul>
                {selectedVersion !== '' ? <button onClick={() => setIsPlaying(true)}>Play</button> : null}
            </div>
        );
    }
    else {
        return <div />
    }
}
