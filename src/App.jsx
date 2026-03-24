import React, { useState, useEffect, useCallback } from 'react';
import { generateNumbers, generateTarget, solve } from './logic/mathEngine';
import './index.css';

const App = () => {
  const [initialNumbers, setInitialNumbers] = useState([]); // Store original 6 for solver
  const [currentNumbers, setCurrentNumbers] = useState([]); // Array of { id, value }
  const [target, setTarget] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]); // IDs of selected cards
  const [selectedOp, setSelectedOp] = useState(null);
  const [history, setHistory] = useState([]);
  const [gameState, setGameState] = useState('idle'); // idle, playing, won
  const [timer, setTimer] = useState(30);
  const [result, setResult] = useState(null);
  const [solution, setSolution] = useState(null);

  const startNewGame = useCallback(() => {
    const nums = generateNumbers();
    const tgt = generateTarget();
    setInitialNumbers(nums);
    setCurrentNumbers(nums.map((v, i) => ({ id: `num-${i}-${Date.now()}`, value: v })));
    setTarget(tgt);
    setSelectedIds([]);
    setSelectedOp(null);
    setHistory([]);
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
      case '-': res = n1 - n2; break;
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

  const showSolution = () => {
    const sol = solve(initialNumbers, target);
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

  return (
    <div className="game-container">
      <div className="header">
        <h1 className="title">CIFRAS</h1>
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
              <button className="btn-primary" onClick={startNewGame}>Reiniciar</button>
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
        <button className="btn-text" onClick={showSolution}>Ver Solución</button>
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
