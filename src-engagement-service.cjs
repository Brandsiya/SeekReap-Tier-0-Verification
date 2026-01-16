// CommonJS wrapper for service
try {
  // Try to import as ES module
  const serviceModule = require('./src-engagement-service.ts');
  module.exports = {
    engagementService: serviceModule.engagementService || serviceModule.default?.engagementService || serviceModule.default,
    EngagementError: serviceModule.EngagementError || serviceModule.default?.EngagementError
  };
} catch (error) {
  console.error('Failed to load service module:', error.message);
  // Fallback: export empty object
  module.exports = {
    engagementService: null,
    EngagementError: null
  };
}