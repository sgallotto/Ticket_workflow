function requireField(obj, field, context) {
  if (!obj[field]) {
    throw new Error(`Missing required field '${field}' in ${context}`);
  }
}

module.exports = { requireField };
