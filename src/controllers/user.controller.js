const User = require('./models/User');

exports.getDashboard = async (req, res) => {
    try {
        // req.user.id comes from your JWT middleware
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        // 1. Calculate Days Left in Month (Requirement #3)
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysLeft = (lastDayOfMonth - today.getDate()) || 1; // Avoid division by zero

        // 2. Calculations for Frontend (Requirement #3)
        const remainingBalance = user.monthly_budget - user.total_spent;
        const safeToSpend = (remainingBalance / daysLeft).toFixed(2);

        // 3. Alerts Logic (Requirement #4)
        const usageRatio = user.total_spent / user.monthly_budget;
        let alertStatus = "STABLE";
        
        if (usageRatio >= 0.90) alertStatus = "CRITICAL_90";
        else if (usageRatio >= 0.75) alertStatus = "WARNING_75";

        res.status(200).json({
            total_spent: user.total_spent,
            remaining_balance: remainingBalance,
            savings_pocket: user.savings_pocket, // Requirement #5
            safe_to_spend_today: safeToSpend,
            alert_status: alertStatus,
            days_left: daysLeft
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
