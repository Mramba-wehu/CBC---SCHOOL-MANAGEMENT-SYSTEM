const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'A record with this value already exists.', field: err.meta?.target });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found.' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ success: false, message: 'Related record not found.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token.' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired.' });

  // Validation errors
  if (err.name === 'ValidationError') return res.status(400).json({ success: false, message: err.message });

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File too large.' });

  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal server error.' });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
};

module.exports = { errorHandler, notFound };
