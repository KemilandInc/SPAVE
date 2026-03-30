// src/utils/budgetUtils.js

/**
 * Calculates 7.5% savings, checks budget thresholds (75%, 90%), 
 * and returns updated spending totals.
 */
exports.calculateSpaveMath = (amount, monthlyBudget, currentSpend, alertsTriggered = []) => {
    // 1. Calculate the 7.5% "Round-up" / Sweep
    const savings = amount * 0.075; 
    
    // 2. Calculate new total spent
    const newTotalSpent = currentSpend + amount;
    
    // 3. Determine if a new Alert Tier is reached (75% or 90%)
    let alert = null;
    const spendRatio = newTotalSpent / monthlyBudget;

    if (spendRatio >= 0.90 && !alertsTriggered.includes('90%')) {
        alert = '90%';
    } else if (spendRatio >= 0.75 && !alertsTriggered.includes('75%')) {
        alert = '75%';
    }

    return { 
        savings, 
        alert, 
        newTotalSpent 
    };
};
