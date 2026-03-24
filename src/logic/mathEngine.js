/**
 * Generates 6 numbers for the game.
 * Rules: 
 * - Numbers from 1 to 10.
 * - Special numbers: 25, 50, 75, 100.
 */
export const generateNumbers = () => {
  const available = [
    1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
    25, 50, 75, 100
  ];
  const numbers = [];
  const tempAvailable = [...available];

  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * tempAvailable.length);
    numbers.push(tempAvailable.splice(idx, 1)[0]);
  }
  return numbers.sort((a, b) => a - b);
};

/**
 * Generates a target number between 100 and 999.
 */
export const generateTarget = () => {
  return Math.floor(Math.random() * 900) + 100;
};

/**
 * Evaluates a mathematical expression string.
 * Uses a safe evaluation method (no eval() if possible, or simple regex/parser).
 * For this version, we'll use a simple recursive parser or validate input carefully.
 */
export const evaluateExpression = (expr) => {
  try {
    // Sanitize and only allow numbers and +-*/()
    if (/[^0-9+\-*/().\s]/.test(expr)) return null;

    // Using Function constructor as a safer alternative to eval in this context,
    // though still needs caution. For a game, it's usually acceptable if sanitized.
    const result = new Function(`return ${expr}`)();

    if (Number.isInteger(result) && result > 0) {
      return result;
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Advanced solver for the Cifras game.
 * Uses a recursive approach to find the exact target or the closest result.
 */
export const solve = (numbers, target) => {
  let closestResult = { value: 0, expression: "" };

  const find = (currentNumbers) => {
    for (let i = 0; i < currentNumbers.length; i++) {
      const n = currentNumbers[i];
      if (Math.abs(target - n.val) < Math.abs(target - closestResult.value)) {
        closestResult = { value: n.val, expression: n.expr };
      }
      if (n.val === target) return true;
    }

    if (currentNumbers.length === 1) return false;

    for (let i = 0; i < currentNumbers.length; i++) {
      for (let j = i + 1; j < currentNumbers.length; j++) {
        const nextBatch = currentNumbers.filter((_, idx) => idx !== i && idx !== j);
        const a = currentNumbers[i];
        const b = currentNumbers[j];

        const ops = [
          { val: a.val + b.val, expr: `(${a.expr} + ${b.expr})` },
          { val: a.val - b.val, expr: `(${a.expr} - ${b.expr})` },
          { val: b.val - a.val, expr: `(${b.expr} - ${a.expr})` },
          { val: a.val * b.val, expr: `(${a.expr} * ${b.expr})` },
        ];

        if (b.val !== 0 && a.val % b.val === 0) {
          ops.push({ val: a.val / b.val, expr: `(${a.expr} / ${b.expr})` });
        }
        if (a.val !== 0 && b.val % a.val === 0) {
          ops.push({ val: b.val / a.val, expr: `(${b.expr} / ${a.expr})` });
        }

        for (const op of ops) {
          if (op.val > 0) {
            if (find([...nextBatch, op])) return true;
          }
        }
      }
    }
    return false;
  };

  const initial = numbers.map(n => ({ val: n, expr: n.toString() }));
  find(initial);
  return closestResult;
};

/**
 * Validates if a number is allowed in the Cifras pool.
 */
export const isValidCifrasNumber = (n) => {
  const allowed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
  return allowed.includes(n);
};

/**
 * Validates if the target is within the standard range.
 */
export const validateTarget = (n) => {
  return n >= 100 && n <= 999;
};
