const { success } = require('../utils/response');

const getDashboards = async (req, res) => {
  return success(res, [], 'Stub for dashboard');
};

module.exports = { getDashboards };
