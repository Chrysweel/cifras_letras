import React from 'react';

const GameView = ({
    currentNumbers, target, selectedIds, selectedOp, setSelectedOp,
    history, gameState, timer, result, solution,
    handleNumberClick, confirmOperation, undo, resetToHome, displaySolution,
    currentOpResult, onRestart
}) => (
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
                <button key={num.id} className={`number-card ${selectedIds.includes(num.id) ? 'selected' : ''}`}
                    onClick={() => handleNumberClick(num.id)} disabled={gameState === 'won'}>
                    {num.value}
                </button>
            ))}
        </div>

        <div className="operation-panel">
            <div className="op-buttons">
                {['+', '-', '*', '/'].map(op => (
                    <button key={op} className={`op-btn ${selectedOp === op ? 'active' : ''}`}
                        onClick={() => setSelectedOp(op)} disabled={gameState === 'won'}>{op}
                    </button>
                ))}
            </div>

            <div className="preview-area">
                {selectedIds.length === 2 && selectedOp && (
                    <div className="preview-text">
                        {currentOpResult !== null ? (
                            <>Resultado: <span className="highlight">{currentOpResult}</span></>
                        ) : <span className="error">Operación no válida</span>}
                    </div>
                )}
                <div className="controls">
                    <button className="btn-primary" onClick={confirmOperation} disabled={currentOpResult === null || gameState === 'won'}>
                        Confirmar
                    </button>
                    <button className="btn-secondary" onClick={undo} disabled={history.length === 0}>
                        Deshacer
                    </button>
                    {gameState !== 'playing' && (
                        <button className="btn-primary" onClick={onRestart}>Reiniciar</button>
                    )}
                </div>
            </div>
        </div>

        <div className="history-panel">
            <h3>Historial</h3>
            <ul>
                {history.map((step, i) => <li key={i}>{step.operation}</li>)}
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

export default GameView;
