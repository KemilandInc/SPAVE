const jwt = require('jsonwebtoken');

// Generate a token for the user that lasts 7 days
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};
