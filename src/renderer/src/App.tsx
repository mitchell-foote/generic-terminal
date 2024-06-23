import { Route, Routes, HashRouter, useNavigate } from 'react-router-dom'
import * as Games from "./terminal-games";
import { GameConfig, GameSignature } from './terminal-games/types';
import { useState } from 'react';
import { Home } from './Home';

function App(): JSX.Element {
  const [selectedGameConfig, setSelectedGameConfig] = useState<{ config: GameConfig, signature: GameSignature }>()
  const handleGameExecution = (gameConfig: GameConfig, gameSignature: GameSignature): void => {
    setSelectedGameConfig({ config: gameConfig, signature: gameSignature });
    document.getElementById(gameSignature.id)?.click();
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home executeGame={handleGameExecution}></Home>} />
          {Object.values(Games).map((game) => (
            <Route key={game.id} path={game.baseUrl}
              element={
                <GameElementHolder game={selectedGameConfig?.signature}
                  gameConfig={selectedGameConfig?.config}
                  activate={selectedGameConfig?.signature.baseUrl === game.baseUrl} />} />
          ))}
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App


const GameElementHolder = (props: { game?: GameSignature, gameConfig?: GameConfig, activate: boolean }): JSX.Element => {
  const navigate = useNavigate();
  if (props.game && props.gameConfig && props.activate) {
    return <>{props.game.renderGame(props.gameConfig)}</>
  }
  else {
    return <div><button onClick={() => navigate("/")}>Back to home</button></div>
  }
}
