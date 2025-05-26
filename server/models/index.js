// MongoDB Models
const User = require('./User');
const Movie = require('./Movie');
const Subscription = require('./Subscription');
const Notification = require('./Notification');
const ContentReport = require('./ContentReport');
const SupportTicket = require('./SupportTicket');
const ModerationAction = require('./ModerationAction');

module.exports = {
  User,
  Movie,
  Subscription,
  Notification,
  ContentReport,
  SupportTicket,
  ModerationAction
};
