export const eventBus = {
  emit: () => {},
  publish: (eventType: string, data: any) => {
    console.log(`Event published: ${eventType}`, data);
  },
  listeners: new Map<string, Array<() => void>>()
};
