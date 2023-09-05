'use strict';

const registerAttribute = require('./register-attribute');

const langTranslations = ['name_int', 'name_de', 'name_en'];
const langRegex = /^name:(.*)$/;

/**
 * Mutates a layer stats object to register stats
 * about an object of attributes (and returns the mutated object).
 *
 * @return {Object} stats
 * @param {Object} layerStats
 * @param {Object} options
 *   @param {Set} [options.attributes]
 *   @param {boolean} [options.ignoreTranslations]
 *   @param {boolean} [options.addLanguages]
 * @param {Object} attributes - The attributes to register, as an object
 *   of `name: value`
 * @return {Object} The mutated layerStats.
 */
module.exports = function(stats, layerStats, options, attributes) {
  const specifiedAttributes = options.attributes;

  Object.keys(attributes).forEach((name) => {
    const value = attributes[name];

    if (options.addLanguages) {
      const lang = langRegex.exec(name);
      if (lang) stats.languages.add(lang[1]);
    }

    if (specifiedAttributes && !specifiedAttributes.has(name)) return;
    else if (
      !specifiedAttributes && options.ignoreTranslations &&
      (langTranslations.includes(name) || langRegex.test(name))
    ) return;

    registerAttribute(layerStats, options, name, value);
  });

  return layerStats;
};
