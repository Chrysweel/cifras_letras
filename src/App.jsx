import React, { useState, useEffect, useCallback } from 'react';
import { generateNumbers, generateTarget, evaluateExpression, solve } from './logic/mathEngine';
import './index.css';

const App = () => {
  const [numbers, setNumbers] = useState([]);
  const [target, setTarget] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, lost
  const [timer, setTimer] = useState(30);
  const [result, setResult] = useState(null);
  const [solution, setSolution] = useState(null);

  const startNewGame = useCallback(() => {
    const nums = generateNumbers();
    const tgt = generateTarget();
    setNumbers(nums);
    setTarget(tgt);
    setUserInput("");
    setGameState('playing');
    setTimer(30);
    setResult(null);
    setSolution(null);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && gameState === 'playing') {
      handleCheck();
    }
  }, [gameState, timer]);

  const getUsedIndices = useCallback((input, availableNums) => {
    const tokens = input.match(/\d+/g) || [];
    const usedIndices = [];
    const tempNums = [...availableNums];

    for (const token of tokens) {
      const num = parseInt(token);
      const index = tempNums.indexOf(num);
      if (index !== -1) {
        // We find the original index in the numbers array
        // Since we are splicing tempNums, we need a way to track original indices
        // Better way: map availableNums to objects with original index
        const originalIndex = availableNums.findIndex((n, idx) => n === num && !usedIndices.includes(idx));
        if (originalIndex !== -1) {
          usedIndices.push(originalIndex);
        } else {
          return null; // Used a number not available or exceeded count
        }
      } else {
        return null;
      }
    }
    return usedIndices;
  }, []);

  const handleCheck = () => {
    if (!userInput.trim()) {
      setGameState('lost');
      return;
    }

    const usedIndices = getUsedIndices(userInput, numbers);

    if (usedIndices === null) {
      setResult({ msg: "Has usado números no disponibles o repetidos.", error: true });
      setGameState('lost');
      return;
    }

    const value = evaluateExpression(userInput);
    if (value === null) {
      setResult({ msg: "Expresión no válida.", error: true });
      setGameState('lost');
    } else {
      const diff = Math.abs(target - value);
      if (diff === 0) {
        setResult({ msg: `¡Exacto! (${value})`, success: true });
        setGameState('won');
      } else {
        setResult({ msg: `Te has quedado a ${diff} (Resultado: ${value})`, success: false });
        setGameState('lost');
      }
    }
  };

  const showSolution = () => {
    const sol = solve(numbers, target);
    setSolution(sol);
  };

  if (gameState === 'idle') {
    return (
      <div className="game-container">
        <h1 className="title">CIFRAS</h1>
        <button className="btn-primary" onClick={startNewGame}>Nueva Partida</button>
      </div>
    );
  }

  // Calculate used indices for real-time feedback
  const currentUsedIndices = getUsedIndices(userInput, numbers) || [];

  return (
    <div className="game-container">
      <div className="header">
        <h1 className="title">CIFRAS</h1>
        <div className={`timer ${timer <= 5 ? 'warning' : ''}`}>
          {timer}s
        </div>
      </div>

      <div className="target-display">
        {target}
      </div>

      <div className="numbers-grid">
        {numbers.map((num, i) => {
          const isUsed = currentUsedIndices.includes(i);
          return (
            <div key={i} className={`number-card ${isUsed ? 'used' : ''}`}>
              {num}
            </div>
          );
        })}
      </div>

      <div className="input-area">
        <input
          type="text"
          className="math-input"
          placeholder="Ej: (10 + 5) * 50"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={gameState !== 'playing'}
          onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
          autoFocus
        />

        <div className="controls">
          {gameState === 'playing' ? (
            <button className="btn-primary" onClick={handleCheck}>Comprobar</button>
          ) : (
            <button className="btn-primary" onClick={startNewGame}>Otra vez</button>
          )}
          <button className="btn-secondary" onClick={showSolution}>Ver Solución</button>
        </div>
      </div>

      {result && (
        <div className={`result-message ${result.success ? 'success' : 'fail'}`}>
          {result.msg}
        </div>
      )}

      {solution && (
        <div className="result-message" style={{ border: '1px solid var(--cyan)' }}>
          Solución óptima: <br />
          <strong style={{ fontSize: '1.8rem', color: 'var(--cyan)' }}>{solution.expression} = {solution.value}</strong>
        </div>
      )}
    </div>
  );
};

export default App;
