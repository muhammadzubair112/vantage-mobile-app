require('dotenv').config();

const requiredVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRE'
];

console.log('Checking environment variables...\n');

const missingVars = [];
const configuredVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    configuredVars.push(varName);
  }
});

console.log('Configured variables:', configuredVars.join(', '));
console.log('Missing variables:', missingVars.join(', '));

if (missingVars.length > 0) {
  console.error('\nError: Missing required environment variables');
  process.exit(1);
} else {
  console.log('\nAll required environment variables are configured');
  process.exit(0);
} 