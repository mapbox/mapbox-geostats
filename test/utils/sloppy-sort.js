'use strict';

const isPlainObject = require('lodash.isplainobject');

// The purpose of the sloppy sort is only to ensure some
// deterministic order in this module's JSON output.
// Because of async operations in some places (esp. tile-analyze),
// items in arrays (e.g. attributes, values) might not always
// appear in the same the same order, but should always
// have the same items.

function sloppySortComparator(first, second) {
  const isFirstObject = isPlainObject(first);
  const isSecondObject = isPlainObject(second);
  if (!isFirstObject && isSecondObject) return -1;
  if (isFirstObject && !isSecondObject) return 1;
  if (isFirstObject && isSecondObject) {
    if (first.attribute < second.attribute) return -1;
    if (first.attribute > second.attribute) return 1;
    return 0;
  }

  const isFirstNumber = typeof first == 'number';
  const isSecondNumber = typeof second == 'number';
  if (!isFirstNumber && isSecondNumber) return -1;
  if (isFirstNumber && !isSecondNumber) return 1;
  if (isFirstNumber && isSecondNumber) {
    if (first < second) return -1;
    if (first > second) return 1;
    return 0;
  }

  const isFirstNull = first === null;
  const isSecondNull = second === null;
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
  const sortedObj = {};
  for (const key in obj) {
    sortedObj[key] = sloppySort(obj[key], sloppySort);
  }
  return sortedObj;
}

function sloppySort(item) {
  if (isPlainObject(item)) return sloppySortObject(item);
  if (Array.isArray(item)) return sloppySortArray(item);
  return item;
}

module.exports = sloppySort;
