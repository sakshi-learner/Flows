const FlowService = require('../services/flow/flow.service');

class FlowController {
  async list(req, res) {
    const flows = await FlowService.getMyFlows(req.user.id);
    res.json(flows);
  }

  async get(req, res) {
    const flow = await FlowService.getFlow(req.params.id, req.user.id);
    if (!flow) return res.status(404).json({ message: 'Flow not found' });
    console.log("Flow with Buttons:", flow.definition);
    res.json(flow);
  }

  async create(req, res) {
    const flow = await FlowService.createFlow(req.user.id, req.body);
    res.status(201).json(flow);
  }

  async update(req, res) {
    await FlowService.updateFlow(req.params.id, req.user.id, req.body);
    res.json({ success: true });
  }

  async setDefault(req, res) {
    await FlowService.setDefault(req.params.id, req.user.id);
    res.json({ success: true });
  }
}

module.exports = new FlowController();
