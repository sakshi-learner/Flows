const { Flow } = require("../models");

class FlowRepository {

  async findById(id) {
    try {
      // Sirf ID ke base par flow dhoondein
      return await Flow.findByPk(id);
      // Agar aap Mongoose use kar rahe hain toh: return await Flow.findById(id);
    } catch (error) {
      console.error("Error in FlowRepo findById:", error);
      throw error;
    }
  }
  getByUser(userId) {
    return Flow.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });
  }

  findByIdAndUser(id, userId) {
    return Flow.findOne({ where: { id, user_id: userId } });
  }

  // ✅ Default flow (priority)
  findDefaultForUser(userId) {
    return Flow.findOne({
      where: { user_id: userId, is_default: true },
      order: [["updatedAt", "DESC"]],
    });
  }

  // ✅ Fallback: first active
  findFirstActiveForUser(userId) {
    return Flow.findOne({
      where: { user_id: userId, is_active: true },
      order: [["updatedAt", "DESC"]],
    });
  }

  create(data) {
    return Flow.create(data);
  }

  update(id, data) {
    return Flow.update(data, { where: { id }, returning: true });
  }

  async setDefault(flowId, userId) {
    await Flow.update({ is_default: false }, { where: { user_id: userId } });

    return Flow.update(
      { is_default: true, is_active: true },
      { where: { id: flowId, user_id: userId } }
    );
  }
}

module.exports = new FlowRepository();