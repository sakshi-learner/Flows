const planRepository = require('../repositories/plan.repository');
const redisClient = require('../../config/redis');

const ACTIVE_PLANS_KEY = 'ACTIVE_PLANS';

exports.createPlan = async (planData, userRole) => {
  if (userRole !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const plan = await planRepository.create(planData);

  // ❌ invalidate cache
  await redisClient.del(ACTIVE_PLANS_KEY);

  return plan;
};

exports.updatePlan = async (id, data, userRole) => {
  if (userRole !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const plan = await planRepository.findById(id);
  if (!plan) {
    throw new Error('PLAN_NOT_FOUND');
  }

  await planRepository.updateById(id, data);

  // ❌ invalidate cache
  await redisClient.del(ACTIVE_PLANS_KEY);
};

exports.deletePlan = async (id, userRole) => {
  if (userRole !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const plan = await planRepository.findById(id);
  if (!plan) {
    throw new Error('PLAN_NOT_FOUND');
  }

  await planRepository.deleteById(id);

  // ❌ invalidate cache
  await redisClient.del(ACTIVE_PLANS_KEY);
};

exports.getActivePlans = async () => {
  // 1️⃣ Check Redis
  const cachedPlans = await redisClient.get(ACTIVE_PLANS_KEY);

  if (cachedPlans) {
    console.log('⚡ Plans from Redis');
    return JSON.parse(cachedPlans);
  }

  // 2️⃣ Fetch from DB
  const plans = await planRepository.findActivePlans();

  // 3️⃣ Store in Redis (TTL = 60 sec)
  await redisClient.setEx(
    ACTIVE_PLANS_KEY,
    60,
    JSON.stringify(plans)
  );

  console.log('🐘 Plans from PostgreSQL');
  return plans;
};
