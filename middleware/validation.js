const Joi = require('joi');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        message: 'Validation error',
        errors: details
      });
    }

    req[property] = value;
    next();
  };
};

// Auth validation schemas
const registerSchema = Joi.object({
  name: Joi.string().max(100).allow('').optional(),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'any.required': 'Password is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'any.required': 'New password is required'
  })
});

const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

const resetPasswordWithTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'any.required': 'New password is required'
  })
});

// Bug validation schemas
const bugSchema = Joi.object({
  deviceId: Joi.string().required().messages({
    'any.required': 'Device ID is required'
  }),
  ScenarioID: Joi.string().max(200).allow('').optional(),
  Category: Joi.string().max(100).allow('').optional(),
  Description: Joi.string().max(2000).allow('').optional(),
  Status: Joi.string().max(50).allow('').optional(),
  Priority: Joi.string().max(50).allow('').optional(),
  Severity: Joi.string().max(50).allow('').optional(),
  PreCondition: Joi.string().max(1000).allow('').optional(),
  StepsToExecute: Joi.alternatives()
    .try(Joi.array().items(Joi.string().max(500)), Joi.string().max(5000))
    .optional(),
  ExpectedResult: Joi.string().max(1000).allow('').optional(),
  ActualResult: Joi.string().max(1000).allow('').optional(),
  Comments: Joi.string().max(2000).allow('').optional(),
  SuggestionToFix: Joi.string().max(2000).allow('').optional()
});

// New: update schema for PATCH (all optional; require at least one field)
const bugUpdateSchema = Joi.object({
  deviceId: Joi.string().optional(),
  ScenarioID: Joi.string().max(200).allow('').optional(),
  Category: Joi.string().max(100).allow('').optional(),
  Description: Joi.string().max(2000).allow('').optional(),
  Status: Joi.string().max(50).allow('').optional(),
  Priority: Joi.string().max(50).allow('').optional(),
  Severity: Joi.string().max(50).allow('').optional(),
  PreCondition: Joi.string().max(1000).allow('').optional(),
  StepsToExecute: Joi.alternatives()
    .try(Joi.array().items(Joi.string().max(500)), Joi.string().max(5000))
    .optional(),
  ExpectedResult: Joi.string().max(1000).allow('').optional(),
  ActualResult: Joi.string().max(1000).allow('').optional(),
  Comments: Joi.string().max(2000).allow('').optional(),
  SuggestionToFix: Joi.string().max(2000).allow('').optional()
}).min(1);
const querySchema = Joi.object({
  deviceId: Joi.string().required().messages({
    'any.required': 'Device ID is required'
  })
});

// Export validation middleware
module.exports = {
  validate,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  requestPasswordResetSchema,
  resetPasswordWithTokenSchema,
  bugSchema,
  bugUpdateSchema,
  querySchema
};
