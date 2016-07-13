var _ = require('lodash');

// The purpose of the sloppy sort is only to ensure some
// deterministic order in this module's JSON output.
// Because of async operations in some places (esp. tile-analyze),
// items in arrays (e.g. attributes, values) might not always
// appear in the same the same order, but should always
// have the same items.

function sloppySortComparator(first, second) {
  var isFirstObject = _.isPlainObject(first);
  var isSecondObject = _.isPlainObject(second);
  if (!isFirstObject && isSecondObject) return -1;
  if (isFirstObject && !isSecondObject) return 1;
  if (isFirstObject && isSecondObject) {
    if (first.attribute < second.attribute) return -1;
    if (first.attribute > second.attribute) return 1;
    return 0;
  }

  var isFirstNumber = _.isNumber(first);
  var isSecondNumber = _.isNumber(second);
  if (!isFirstNumber && isSecondNumber) return -1;
  if (isFirstNumber && !isSecondNumber) return 1;
  if (isFirstNumber && isSecondNumber) {
    if (first < second) return -1;
    if (first > second) return 1;
    return 0;
  }

  var isFirstNull = _.isNull(first);
  var isSecondNull = _.isNull(second);
  if (!isFirstNull && isSecondNull) return -1;
  if (isFirstNull && !isSecondNull) return 1;
  if (isFirstNull && isSecondNull) return 0;

  if (String(first) < String(second)) return -1;
  if (String(first) > String(second)) return 1;
  return 0;
}

function sloppySortArray(arr) {
  return arr.map(sloppySort).sort(sloppySortComparator);
}

function sloppySortObject(obj) {
  return _.mapValues(obj, sloppySort);
}

function sloppySort(item) {
  if (_.isPlainObject(item)) return sloppySortObject(item);
  if (_.isArray(item)) return sloppySortArray(item);
  return item;
}

module.exports = sloppySort;
