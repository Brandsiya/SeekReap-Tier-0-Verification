// CommonJS wrapper for state machine
const stateMachineModule = require('./src-engagement-state-machine.ts');

// Extract what we need for testing
const EngagementState = stateMachineModule.EngagementState || stateMachineModule.default?.EngagementState;
const EngagementStateMachine = stateMachineModule.EngagementStateMachine || stateMachineModule.default?.EngagementStateMachine;
const createEngagement = stateMachineModule.createEngagement || stateMachineModule.default?.createEngagement;
const transitionEngagement = stateMachineModule.transitionEngagement || stateMachineModule.default?.transitionEngagement;
const checkAndHandleExpiry = stateMachineModule.checkAndHandleExpiry || stateMachineModule.default?.checkAndHandleExpiry;
const validateEngagement = stateMachineModule.validateEngagement || stateMachineModule.default?.validateEngagement;
const isActiveState = stateMachineModule.isActiveState || stateMachineModule.default?.isActiveState;

if (!EngagementState || !EngagementStateMachine) {
  throw new Error('Failed to load state machine module');
}

module.exports = {
  EngagementState,
  EngagementStateMachine,
  createEngagement,
  transitionEngagement,
  checkAndHandleExpiry,
  validateEngagement,
  isActiveState
};