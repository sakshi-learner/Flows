function renderTemplate(text = '', vars = {}) {
  for (const [key, value] of Object.entries(vars)) {
    text = text.split(`{{${key}}}`).join(String(value ?? ''));
  }
  return text;
}

module.exports = { renderTemplate };