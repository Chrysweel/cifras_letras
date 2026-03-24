import { useState, useEffect, useCallback, useMemo } from 'react';
import { generateNumbers, generateTarget, solve, isValidCifrasNumber, validateTarget } from '../logic/mathEngine';

export const useCifrasGame = () => {
    const [appState, setAppState] = useState('mode-selection');
    const [initialNumbers, setInitialNumbers] = useState([]);
    const [currentNumbers, setCurrentNumbers] = useState([]);
    const [target, setTarget] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedOp, setSelectedOp] = useState(null);
    const [history, setHistory] = useState([]);
    const [gameState, setGameState] = useState('idle');
    const [timer, setTimer] = useState(30);
    const [result, setResult] = useState(null);
    const [solution, setSolution] = useState(null);

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
        initializeGame(generateNumbers(), generateTarget());
    };

    useEffect(() => {
        if (gameState === 'playing' && timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [gameState, timer]);

    const handleNumberClick = (id) => {
        if (gameState !== 'playing') return;
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : (prev.length < 2 ? [...prev, id] : prev)
        );
    };

    const currentOpResult = useMemo(() => {
        if (selectedIds.length !== 2 || !selectedOp) return null;
        const n1 = currentNumbers.find(n => n.id === selectedIds[0]).value;
        const n2 = currentNumbers.find(n => n.id === selectedIds[1]).value;

        switch (selectedOp) {
            case '+': return n1 + n2;
            case '-': return Math.abs(n1 - n2);
            case '*': return n1 * n2;
            case '/':
                if (n2 !== 0 && n1 % n2 === 0) return n1 / n2;
                if (n1 !== 0 && n2 % n1 === 0) return n2 / n1;
                return null;
            default: return null;
        }
    }, [selectedIds, selectedOp, currentNumbers]);

    const confirmOperation = () => {
        const res = currentOpResult;
        if (res === null) return;

        const n1 = currentNumbers.find(n => n.id === selectedIds[0]).value;
        const n2 = currentNumbers.find(n => n.id === selectedIds[1]).value;
        const resId = `res-${Date.now()}`;

        setHistory(prev => [...prev, {
            prevNumbers: [...currentNumbers],
            operation: `${n1} ${selectedOp} ${n2} = ${res}`,
            resultId: resId
        }]);

        setCurrentNumbers(prev => [...prev.filter(n => !selectedIds.includes(n.id)), { id: resId, value: res }]);
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
        setHistory(prev => prev.slice(0, -1));
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

    const displaySolution = () => setSolution(solve(initialNumbers, target));
    const closeSolution = () => setSolution(null);

    return {
        appState, setAppState,
        currentNumbers, target,
        selectedIds, selectedOp, setSelectedOp,
        history, gameState, timer, result, solution,
        startRandomGame, initializeGame, handleNumberClick,
        confirmOperation, undo, resetToHome, displaySolution, closeSolution,
        currentOpResult
    };
};
