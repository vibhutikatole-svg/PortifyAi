const { Portfolio } = require('../models/Portfolio');

/**
 * Convert string to URL-safe slug
 */
const toSlug = (text) => {
  return (text || 'portfolio')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
    .substring(0, 50); // Keep max 50 chars
};

/**
 * Generate a unique slug in the database
 */
const generateUniqueSlug = async (baseName, excludeId = null) => {
  const baseSlug = toSlug(baseName) || 'my-portfolio';
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug: candidate };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await Portfolio.findOne(query).select('_id');
    if (!existing) {
      return candidate;
    }
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
};

module.exports = { toSlug, generateUniqueSlug };

