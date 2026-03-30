const Transaction = require('../models/Transactions');
const User = require('../models/User');
// Import the logic from your utility file
const { calculateSpaveMath } = require('../utils/budgetUtils');

// 1. ADD TRANSACTION (Requirement #2, #4, #5)
exports.addTransaction = async (req, res) => {
    try {
        const { amount, description, category, date } = req.body;
        const userId = req.user.id; 

        // 1. Fetch User
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Run Spave Logic via the Utility (Savings & Alert Check)
        const { savings, alert, newTotalSpent } = calculateSpaveMath(
            amount, 
            user.monthly_budget, 
            user.current_monthly_spend,
            user.alerts_triggered
        );

        // 3. Create the Transaction record
        const newTransaction = await Transaction.create({
            user: userId,
            amount,
            description,
            category,
            date: date || Date.now(),
            savings_generated: savings
        });

        // 4. Update User Profile
        // We use $set for the spend and $inc for the savings to ensure accuracy
        const updateQuery = {
            $set: { current_monthly_spend: newTotalSpent },
            $inc: { total_savings: savings }
        };

        // If a new alert (75% or 90%) was triggered, add it to the user's history
        if (alert) {
            updateQuery.$addToSet = { alerts_triggered: alert };
        }

        await User.findByIdAndUpdate(userId, updateQuery);

        // 5. Response for the Frontend
        res.status(201).json({ 
            message: "Success", 
            data: newTransaction,
            savings_sweep: savings,
            notification: alert || "none" 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET DASHBOARD DATA (Requirement #3)
exports.getDashboardData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // --- FIXED DAYS LEFT LOGIC ---
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        // Get the last day of the current month
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        
        // Calculate remaining days (including today)
        // Example: If today is 30th and last day is 31st: (31 - 30) + 1 = 2 days.
        const daysLeft = (lastDayOfMonth - today.getDate()) + 1;
        
        const remaining = user.monthly_budget - user.current_monthly_spend;
        
        // Safe-to-Spend Logic (Balance divided by days remaining)
        const safeToSpend = remaining > 0 ? (remaining / daysLeft).toFixed(2) : 0;

        res.status(200).json({
            total_spent: user.current_monthly_spend,
            remaining_balance: remaining,
            savings_pocket: user.total_savings,
            safe_to_spend_today: safeToSpend,
            days_left: daysLeft,
            active_alerts: user.alerts_triggered 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. GET ALL TRANSACTIONS
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. DELETE TRANSACTION
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        // Reverse the financial impact on the User profile
        await User.findByIdAndUpdate(transaction.user, {
            $inc: { 
                current_monthly_spend: -transaction.amount,
                total_savings: -transaction.savings_generated 
            }
        });

        await Transaction.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
