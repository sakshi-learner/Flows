const planService = require('../services/plan.service');

exports.createPlan = async (req, res) => {
  try {
    const plan = await planService.createPlan(req.body, req.user.role);
    res.status(201).json(plan);
  } catch (err) {
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Only admin can create plans' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    await planService.updatePlan(req.params.id, req.body, req.user.role);
    res.json({ message: 'Plan updated' });
  } catch (err) {
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Only admin can update plans' });
    }
    if (err.message === 'PLAN_NOT_FOUND') {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    await planService.deletePlan(req.params.id, req.user.role);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Only admin can delete plans' });
    }
    if (err.message === 'PLAN_NOT_FOUND') {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getPlans = async (_req, res) => {
  try {
    const plans = await planService.getActivePlans();
    res.json(plans);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
