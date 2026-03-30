const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  income: { 
    type: Number, 
    default: 0 
  },
  monthly_budget: { 
    type: Number, 
    default: 0 
  },
  // Tracks how much has been spent this month to trigger the 75%/90% alerts
  current_monthly_spend: { 
    type: Number, 
    default: 0 
  },
  // The 7.5% "Savings Pocket" mentioned in the PRD
  total_savings: { 
    type: Number, 
    default: 0 
  },
  // Prevents duplicate notifications (e.g., stops sending the 75% alert every time they spend)
  alerts_triggered: { 
    type: [String], 
    enum: ['75_percent', '90_percent'],
    default: [] 
  },
  // Useful for resetting the budget/spending at the start of a new month
  last_reset: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
