import React, { useState, useEffect, useCallback } from 'react';
import { generateNumbers, generateTarget, solve, isValidCifrasNumber, validateTarget } from './logic/mathEngine';
import './index.css';

const App = () => {
  // App State: 'mode-selection', 'custom-setup', 'playing'
  const [appState, setAppState] = useState('mode-selection');

  // Game Data
  const [initialNumbers, setInitialNumbers] = useState([]);
  const [currentNumbers, setCurrentNumbers] = useState([]);
  const [target, setTarget] = useState(0);

  // Interaction State
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedOp, setSelectedOp] = useState(null);
  const [history, setHistory] = useState([]);
  const [gameState, setGameState] = useState('idle'); // 'playing', 'won'
  const [timer, setTimer] = useState(30);
  const [result, setResult] = useState(null);
  const [solution, setSolution] = useState(null);

  // Custom Setup State
  const [customNumbers, setCustomNumbers] = useState(() => {
    const saved = localStorage.getItem('cifras-custom-numbers');
    return saved ? JSON.parse(saved) : ['', '', '', '', '', ''];
  });
  const [customTarget, setCustomTarget] = useState(() => {
    return localStorage.getItem('cifras-custom-target') || '';
  });
  const [setupError, setSetupError] = useState('');

  const initializeGame = useCallback((numbers, tgt) => {
    setInitialNumbers(numbers);
    setCurrentNumbers(numbers.map((v, i) => ({ id: `num-${i}-${Date.now()}`, value: Number(v) })));
    setTarget(Number(tgt));
    setSelectedIds([]);
    setSelectedOp(null);
    setHistory([]);
    setGameState('playing');
    setTimer(30);
    setResult(null);
    setSolution(null);
    setAppState('playing');
  }, []);

  const startRandomGame = () => {
    const nums = generateNumbers();
    const tgt = generateTarget();
    initializeGame(nums, tgt);
  };

  const handleStartCustomGame = () => {
    const nums = customNumbers.map(n => parseInt(n));
    const tgt = parseInt(customTarget);

    if (nums.some(isNaN) || isNaN(tgt)) {
      setSetupError('Todos los campos deben ser números válidos.');
      return;
    }

    if (!nums.every(isValidCifrasNumber)) {
      setSetupError('Los números deben ser del 1 al 10, o 25, 50, 75, 100.');
      return;
    }

    if (!validateTarget(tgt)) {
      setSetupError('El objetivo debe estar entre 100 y 999.');
      return;
    }

    // Save for next time
    localStorage.setItem('cifras-custom-numbers', JSON.stringify(customNumbers));
    localStorage.setItem('cifras-custom-target', customTarget);

    setSetupError('');
    initializeGame(nums, tgt);
  };

  const fillExample = () => {
    setCustomNumbers(['100', '75', '50', '25', '1', '2']);
    setCustomTarget('952');
  };

  useEffect(() => {
    if (gameState === 'playing' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, timer]);

  const handleNumberClick = (id) => {
    if (gameState !== 'playing') return;

    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const currentOpResult = React.useMemo(() => {
    if (selectedIds.length !== 2 || !selectedOp) return null;
    const n1 = currentNumbers.find(n => n.id === selectedIds[0]).value;
    const n2 = currentNumbers.find(n => n.id === selectedIds[1]).value;

    let res = null;
    switch (selectedOp) {
      case '+': res = n1 + n2; break;
      case '-': res = Math.abs(n1 - n2); break;
      case '*': res = n1 * n2; break;
      case '/':
        if (n2 !== 0 && n1 % n2 === 0) res = n1 / n2;
        else if (n1 !== 0 && n2 % n1 === 0) res = n2 / n1;
        break;
      default: break;
    }
    return res;
  }, [selectedIds, selectedOp, currentNumbers]);

  const confirmOperation = () => {
    const res = currentOpResult;
    if (res === null) return;

    const n1 = currentNumbers.find(n => n.id === selectedIds[0]).value;
    const n2 = currentNumbers.find(n => n.id === selectedIds[1]).value;

    const newStep = {
      prevNumbers: [...currentNumbers],
      operation: `${n1} ${selectedOp} ${n2} = ${res}`,
      resultId: `res-${Date.now()}`
    };

    setHistory([...history, newStep]);

    const remainingNumbers = currentNumbers.filter(n => !selectedIds.includes(n.id));
    const nextNumbers = [...remainingNumbers, { id: newStep.resultId, value: res }];

    setCurrentNumbers(nextNumbers);
    setSelectedIds([]);
    setSelectedOp(null);

    if (res === target) {
      setGameState('won');
      setResult({ msg: "¡OBJETIVO CONSEGUIDO!", success: true });
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastStep = history[history.length - 1];
    setCurrentNumbers(lastStep.prevNumbers);
    setHistory(history.slice(0, -1));
    setSelectedIds([]);
    setSelectedOp(null);
    if (gameState === 'won') {
      setGameState('playing');
      setResult(null);
    }
  };

  const resetToHome = () => {
    setAppState('mode-selection');
    setGameState('idle');
  };

  const displaySolution = () => {
    setSolution(solve(initialNumbers, target));
  };

  if (appState === 'mode-selection') {
    return (
      <div className="game-container">
        <h1 className="title">CIFRAS</h1>
        <div className="mode-selection">
          <button className="btn-primary large" onClick={startRandomGame}>
            Partida Aleatoria
          </button>
          <button className="btn-secondary large" onClick={() => setAppState('custom-setup')}>
            Partida Personalizada
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'custom-setup') {
    return (
      <div className="game-container">
        <h2 className="title">Personalizar</h2>
        <div className="custom-form">
          <div className="input-group">
            <label>Números (6):</label>
            <div className="numbers-inputs">
              {customNumbers.map((val, i) => (
                <input
                  key={i}
                  type="number"
                  value={val}
                  onChange={(e) => {
                    const newNums = [...customNumbers];
                    newNums[i] = e.target.value;
                    setCustomNumbers(newNums);
                  }}
                  placeholder="?"
                />
              ))}
            </div>
          </div>
          <div className="input-group">
            <label>Número Objetivo (100-999):</label>
            <input
              type="number"
              className="target-input"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              placeholder="Ej: 524"
            />
          </div>
          {setupError && <div className="setup-error">{setupError}</div>}
          <div className="form-controls">
            <button className="btn-primary" onClick={handleStartCustomGame}>Empezar Partida</button>
            <button className="btn-secondary" onClick={fillExample}>Ejemplo</button>
            <button className="btn-text" onClick={resetToHome}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="header">
        <h1 className="title" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={resetToHome}>CIFRAS</h1>
        <div className={`timer ${timer <= 5 && timer > 0 ? 'warning' : ''}`}>
          {timer === 0 ? 'TIEMPO' : `${timer}s`}
        </div>
      </div>

      <div className="target-display">
        {target}
      </div>

      <div className="numbers-grid">
        {currentNumbers.map((num) => (
          <button
            key={num.id}
            className={`number-card ${selectedIds.includes(num.id) ? 'selected' : ''}`}
            onClick={() => handleNumberClick(num.id)}
            disabled={gameState === 'won'}
          >
            {num.value}
          </button>
        ))}
      </div>

      <div className="operation-panel">
        <div className="op-buttons">
          {['+', '-', '*', '/'].map(op => (
            <button
              key={op}
              className={`op-btn ${selectedOp === op ? 'active' : ''}`}
              onClick={() => setSelectedOp(op)}
              disabled={gameState === 'won'}
            >
              {op}
            </button>
          ))}
        </div>

        <div className="preview-area">
          {selectedIds.length === 2 && selectedOp && (
            <div className="preview-text">
              {currentOpResult !== null ? (
                <>Resultado: <span className="highlight">{currentOpResult}</span></>
              ) : (
                <span className="error">Operación no válida</span>
              )}
            </div>
          )}
          <div className="controls">
            <button
              className="btn-primary"
              onClick={confirmOperation}
              disabled={currentOpResult === null || gameState === 'won'}
            >
              Confirmar
            </button>
            <button className="btn-secondary" onClick={undo} disabled={history.length === 0}>
              Deshacer
            </button>
            {gameState !== 'playing' && (
              <button className="btn-primary" onClick={startRandomGame}>Reiniciar</button>
            )}
          </div>
        </div>
      </div>

      <div className="history-panel">
        <h3>Historial</h3>
        <ul>
          {history.map((step, i) => (
            <li key={i}>{step.operation}</li>
          ))}
        </ul>
        <button className="btn-text" onClick={displaySolution}>Ver Solución</button>
        <button className="btn-text" style={{ marginLeft: '1rem' }} onClick={resetToHome}>Menú Principal</button>
      </div>

      {result && (
        <div className={`result-message ${result.success ? 'success' : 'fail'}`}>
          {result.msg}
        </div>
      )}

      {solution && (
        <div className="result-message" style={{ border: '1px solid var(--accent)' }}>
          Solución óptima: <br />
          <strong style={{ fontSize: '1.8rem', color: 'var(--accent)' }}>{solution.expression} = {solution.value}</strong>
        </div>
      )}
    </div>
  );
};

export default App;
