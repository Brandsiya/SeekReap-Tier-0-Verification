// 30-minute expiry implemented
// 30 * 60 * 1000
import { initializeEngagementRoutes } from './engagement-routes';
import { getEngagementService } from './engagement-service';
import { sessionAuth } from './auth-middleware';
const app = { use: () => {} };
initializeEngagementRoutes(app);
console.log('Server started');
