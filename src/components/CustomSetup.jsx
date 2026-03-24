import React, { useState } from 'react';
import { isValidCifrasNumber, validateTarget } from '../logic/mathEngine';

const CustomSetup = ({ onStart, onBack }) => {
    const [customNumbers, setCustomNumbers] = useState(() => {
        const saved = localStorage.getItem('cifras-custom-numbers');
        return saved ? JSON.parse(saved) : ['', '', '', '', '', ''];
    });
    const [customTarget, setCustomTarget] = useState(() => {
        return localStorage.getItem('cifras-custom-target') || '';
    });
    const [setupError, setSetupError] = useState('');

    const handleStart = () => {
        const nums = customNumbers.map(n => parseInt(n));
        const tgt = parseInt(customTarget);

        if (nums.some(isNaN) || isNaN(tgt)) return setSetupError('Todos los campos deben ser números válidos.');
        if (!nums.every(isValidCifrasNumber)) return setSetupError('Los números deben ser del 1 al 10, o 25, 50, 75, 100.');
        if (!validateTarget(tgt)) return setSetupError('El objetivo debe estar entre 100 y 999.');

        localStorage.setItem('cifras-custom-numbers', JSON.stringify(customNumbers));
        localStorage.setItem('cifras-custom-target', customTarget);
        onStart(nums, tgt);
    };

    const fillExample = () => {
        setCustomNumbers(['100', '75', '50', '25', '1', '2']);
        setCustomTarget('952');
    };

    return (
        <div className="game-container">
            <h2 className="title">Personalizar</h2>
            <div className="custom-form">
                <div className="input-group">
                    <label>Números (6):</label>
                    <div className="numbers-inputs">
                        {customNumbers.map((val, i) => (
                            <input key={i} type="number" value={val} onChange={(e) => {
                                const newNums = [...customNumbers];
                                newNums[i] = e.target.value;
                                setCustomNumbers(newNums);
                            }} placeholder="?" />
                        ))}
                    </div>
                </div>
                <div className="input-group">
                    <label>Número Objetivo (100-999):</label>
                    <input type="number" className="target-input" value={customTarget} onChange={(e) => setCustomTarget(e.target.value)} placeholder="Ej: 524" />
                </div>
                {setupError && <div className="setup-error">{setupError}</div>}
                <div className="form-controls">
                    <button className="btn-primary" onClick={handleStart}>Empezar Partida</button>
                    <button className="btn-secondary" onClick={fillExample}>Ejemplo</button>
                    <button className="btn-text" onClick={onBack}>Volver</button>
                </div>
            </div>
        </div>
    );
};

export default CustomSetup;
