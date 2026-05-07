const { success } = require('../utils/response');

const getAnnouncements = async (req, res) => {
  return success(res, [], 'Stub for announcement');
};

module.exports = { getAnnouncements };
