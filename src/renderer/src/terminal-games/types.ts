export type GameConfig = {
    id: string;
    displayName: string;
    baseData: unknown
}

export type GameSignature = {
    id: string;
    displayName: string;
    description: string;
    baseUrl: string;
    loadGameVersions: () => Promise<GameConfig[]>
    noGameVersions: () => Promise<GameConfig[]>
    renderGame: (gameConfig: GameConfig) => React.ReactNode
}