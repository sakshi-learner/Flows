const { Plan } = require('../models');

exports.create = (data) => {
  return Plan.create(data);
};

exports.updateById = (id, data) => {
  return Plan.update(data, { where: { id } });
  
};

exports.deleteById = (id) => {
  return Plan.destroy({ where: { id } });
};

exports.findActivePlans = () => {
  return Plan.findAll({ where: { isActive: true } });
};

exports.findById = (id) => {
  return Plan.findByPk(id);
};
