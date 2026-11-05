const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  if (config.nodeEnv !== 'test') {
    console.error('[Error Middleware]:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `A record with this ${field} already exists.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res
      .status(400)
      .json({ success: false, message: 'File size exceeds maximum 10MB limit.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid authentication token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res
      .status(401)
      .json({ success: false, message: 'Authentication token has expired.' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error. Please try again later.',
  });
};

module.exports = errorHandler;

