const Joi = require('joi');

const transactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  description: Joi.string().required(),
  category: Joi.string().default('General'),
  date: Joi.date().iso().max('now').default(Date.now)
});

module.exports = { transactionSchema };
