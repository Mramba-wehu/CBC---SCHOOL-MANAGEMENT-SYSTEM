const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// ADD improvement material (Admin/Teacher)
const addImprovementMaterial = async (req, res) => {
  try {
    const { title, description, resourceUrl, resourceType, learningOutcomeId } = req.body;
    
    const material = await prisma.improvementMaterial.create({
      data: {
        title,
        description,
        resourceUrl,
        resourceType,
        learningOutcomeId
      }
    });

    return created(res, material, 'Improvement material added');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET suggested materials for a student based on their weaknesses
const getSuggestedMaterials = async (req, res) => {
  try {
    const { studentId, termId } = req.query;
    
    // Find weaknesses for this student
    const analyses = await prisma.studentSubjectAnalysis.findMany({
      where: { studentId, termId },
      include: { subject: true }
    });

    // For each weakness description, we try to find related learning outcomes and their materials
    // In a real system, we'd have a more structured link. 
    // Here we'll just fetch all materials for the subjects they are weak in.
    
    const weakSubjects = analyses.filter(a => a.overallRating === 'BE' || a.overallRating === 'AE').map(a => a.subjectId);
    
    const materials = await prisma.improvementMaterial.findMany({
      where: {
        learningOutcome: {
          subStrand: {
            strand: {
              subjectId: { in: weakSubjects }
            }
          }
        }
      },
      include: { learningOutcome: { include: { subStrand: { include: { strand: { include: { subject: true } } } } } } }
    });

    return success(res, materials);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { addImprovementMaterial, getSuggestedMaterials };
