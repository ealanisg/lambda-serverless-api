module.exports = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
