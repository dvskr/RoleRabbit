/**
 * Date Helper Utilities
 */

/**
 * Format date to ISO string
 */
function toISOString(date) {
  return new Date(date).toISOString();
}

/**
 * Get date N days ago
 */
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get start of day
 */
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check if date is today
 */
function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
}

/**
 * Check if date is this week
 */
function isThisWeek(date) {
  const today = new Date();
  const checkDate = new Date(date);
  const diffTime = today - checkDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays >= 0;
}

module.exports = {
  toISOString,
  daysAgo,
  startOfDay,
  endOfDay,
  isToday,
  isThisWeek
};
