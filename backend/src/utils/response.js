const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const created = (res, data, message = 'Created successfully') => {
  return res.status(201).json({ success: true, message, data });
};

const paginated = (res, data, meta, message = 'Success') => {
  return res.status(200).json({ success: true, message, data, meta });
};

const error = (res, message = 'An error occurred', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { success, created, paginated, error };
