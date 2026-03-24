import React from 'react';
import { useCifrasGame } from './hooks/useCifrasGame';
import ModeSelection from './components/ModeSelection';
import CustomSetup from './components/CustomSetup';
import GameView from './components/GameView';
import './index.css';

const App = () => {
  const game = useCifrasGame();

  if (game.appState === 'mode-selection') {
    return (
      <ModeSelection
        onRandom={game.startRandomGame}
        onCustom={() => game.setAppState('custom-setup')}
      />
    );
  }

  if (game.appState === 'custom-setup') {
    return (
      <CustomSetup
        onStart={game.initializeGame}
        onBack={game.resetToHome}
      />
    );
  }

  return (
    <GameView
      {...game}
      onRestart={game.startRandomGame}
    />
  );
};

export default App;
