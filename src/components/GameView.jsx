import React from 'react';

const GameView = ({
    currentNumbers, target, selectedIds, selectedOp, setSelectedOp,
    history, gameState, timer, result, solution,
    handleNumberClick, confirmOperation, undo, resetToHome, displaySolution, closeSolution,
    currentOpResult, onRestart
}) => (
    <div className="game-container">
        <div className="header">
            <h1 className="title" onClick={resetToHome} style={{ cursor: 'pointer' }}>CIFRAS</h1>
            <div className="top-bar">
                <div className={`timer ${timer <= 5 && timer > 0 ? 'warning' : ''}`}>
                    {timer === 0 ? 'TIEMPO' : `${timer}s`}
                </div>
                <div className="target-display">
                    {target}
                </div>
            </div>
        </div>

        <div className="numbers-grid">
            {currentNumbers.map((num) => (
                <button key={num.id} className={`number-card ${selectedIds.includes(num.id) ? 'selected' : ''}`}
                    onClick={() => handleNumberClick(num.id)} disabled={gameState === 'won' || !!solution}>
                    {num.value}
                </button>
            ))}
        </div>

        <div className="operation-panel">
            <div className="op-buttons">
                {['+', '-', '*', '/'].map(op => (
                    <button key={op} className={`op-btn ${selectedOp === op ? 'active' : ''}`}
                        onClick={() => setSelectedOp(op)} disabled={gameState === 'won' || !!solution}>{op}
                    </button>
                ))}
            </div>

            <div className="preview-area">
                {selectedIds.length === 2 && selectedOp && (
                    <div className="preview-text">
                        {currentOpResult !== null ? (
                            <>Res: <span className="highlight">{currentOpResult}</span></>
                        ) : <span className="error">Inválido</span>}
                    </div>
                )}
                <div className="controls">
                    <button className="btn-primary" onClick={confirmOperation} disabled={currentOpResult === null || gameState === 'won' || !!solution}>
                        Ok
                    </button>
                    <button className="btn-secondary" onClick={undo} disabled={history.length === 0 || !!solution}>
                        Undo
                    </button>
                    {gameState !== 'playing' && (
                        <button className="btn-primary" onClick={onRestart}>Reset</button>
                    )}
                </div>
            </div>
        </div>

        <div className="history-panel">
            <h3>{solution ? 'Solución Propuesta' : 'Historial'}</h3>
            <ul>
                {(solution ? solution.steps : history).map((step, i) => (
                    <li key={i} style={solution ? { color: 'var(--accent)', fontWeight: '600' } : {}}>
                        {solution ? step : step.operation}
                    </li>
                ))}
            </ul>
            <div className="history-footer">
                {!solution ? (
                    <button className="btn-text" onClick={displaySolution}>Ver Solución</button>
                ) : (
                    <button className="btn-text" onClick={closeSolution}>Cerrar Solución (X)</button>
                )}
                <button className="btn-text" onClick={resetToHome}>Menú</button>
            </div>
        </div>

        {result && (
            <div className={`result-message ${result.success ? 'success' : 'fail'}`} style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', zIndex: 10 }}>
                {result.msg}
            </div>
        )}
    </div>
);

export default GameView;
