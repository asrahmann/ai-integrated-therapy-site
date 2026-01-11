const Sentry = require("@sentry/node");
console.log("Sentry keys:", Object.keys(Sentry));
console.log("Sentry.metrics:", Sentry.metrics);
if (Sentry.metrics) {
    console.log("Sentry.metrics keys:", Object.keys(Sentry.metrics));
}
