const { PaymentsService } = require('../dist/index.js');

const payments = new PaymentsService();
const providers = payments.getAvailableProviders();

if (!Array.isArray(providers) || providers.length === 0) {
  throw new Error('Consumer smoke failed: providers list is empty');
}

console.log('consumer-smoke-ok', providers.join(','));
