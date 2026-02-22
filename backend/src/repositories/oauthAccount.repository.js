const { OAuthAccount, User } = require("../models");

const findByProviderUserId = (provider, providerUserId) => {
  return OAuthAccount.findOne({
    where: { provider, provider_user_id: providerUserId },
    include: [{ model: User, as: "user" }],
  });
};

const create = (data) => OAuthAccount.create(data);

const updateById = (id, data) => OAuthAccount.update(data, { where: { id } });


const upsertByProviderUser = async (data) => {
  const existing = await OAuthAccount.findOne({
    where: {
      provider: data.provider,
      provider_user_id: data.provider_user_id,
    },
  });

  if (existing) {
    await existing.update(data);
    return { row: existing, created: false };
  }

  const row = await OAuthAccount.create(data);
  return { row, created: true };
};

module.exports = {
  findByProviderUserId,
  upsertByProviderUser,
  create,
  updateById,
};
