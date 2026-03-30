const Transaction = require('../models/Transactions');
const User = require('../models/User');
const { calculateSpaveMath } = require('../services/budget.service');

exports.createTransaction = async (req, res) => {
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.id; // Assuming auth.middleware provides this

        // 1. Fetch the User to get their current budget and alert status
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Run the Spave Logic (Savings, Alerts, and Safe-to-Spend)
        const { savings, alert, newTotalSpent } = calculateSpaveMath(
            amount, 
            user.monthly_budget, 
            user.current_monthly_spend,
            user.alerts_triggered
        );

        // 3. Create the Transaction Record
        const transaction = await Transaction.create({
            user: userId,
            amount,
            description,
            category,
            savings_deducted: savings // Tracking the 7.5% sweep for this specific spend
        });

        // 4. Update User Profile with new totals and Alert Flags
        const updateData = {
            current_monthly_spend: newTotalSpent,
            total_savings: user.total_savings + savings
        };

        // If a new alert tier was reached, add it to the alerts_triggered array
        if (alert) {
            updateData.$push = { alerts_triggered: alert };
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true }
        );

        // 5. Send Response
        res.status(201).json({
            message: "Transaction processed successfully",
            transaction,
            savings_sweep: savings,
            alert_triggered: alert || "No new alerts", // Tells frontend if it should show a popup
            remaining_budget: updatedUser.monthly_budget - updatedUser.current_monthly_spend
        });

    } catch (error) {
        console.error("Transaction Error:", error);
        res.status(500).json({ message: "Server error processing transaction" });
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions" });
    }
};
