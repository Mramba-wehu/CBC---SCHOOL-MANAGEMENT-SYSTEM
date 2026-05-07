const prisma = require('../config/database');
const { success, error } = require('../utils/response');

// GET school profile
const getSchoolProfile = async (req, res) => {
  try {
    const school = await prisma.school.findFirst();
    if (!school) return error(res, 'School profile not found.', 404);
    return success(res, school);
  } catch (err) {
    return error(res, err.message);
  }
};

// UPDATE school profile
const updateSchoolProfile = async (req, res) => {
  try {
    const school = await prisma.school.findFirst();
    const data = req.body;
    
    if (req.file) {
      data.logo = `uploads/photos/${req.file.filename}`;
    }

    let updated;
    if (!school) {
      updated = await prisma.school.create({ data });
    } else {
      updated = await prisma.school.update({
        where: { id: school.id },
        data,
      });
    }

    return success(res, updated, 'School profile updated');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getSchoolProfile, updateSchoolProfile };
