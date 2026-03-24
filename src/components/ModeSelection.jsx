import React from 'react';

const ModeSelection = ({ onRandom, onCustom }) => (
    <div className="game-container">
        <h1 className="title">CIFRAS</h1>
        <div className="mode-selection">
            <button className="btn-primary large" onClick={onRandom}>
                Partida Aleatoria
            </button>
            <button className="btn-secondary large" onClick={onCustom}>
                Partida Personalizada
            </button>
        </div>
    </div>
);

export default ModeSelection;
