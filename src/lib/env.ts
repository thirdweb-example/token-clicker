export const env = {
  THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY!,
  TREASURY_WALLET_ADDRESS: process.env.TREASURY_WALLET_ADDRESS!,
  TOKEN_CONTRACT_ADDRESS: process.env.TOKEN_CONTRACT_ADDRESS!,
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '8453'),
  THIRDWEB_API_BASE_URL: process.env.THIRDWEB_API_BASE_URL || 'https://api.thirdweb-dev.com',
}

// Only validate server-side environment variables when running on server
if (typeof window === 'undefined') {
  // Validate required environment variables
  const requiredEnvVars = [
    'THIRDWEB_SECRET_KEY',
    'TREASURY_WALLET_ADDRESS',
    'TOKEN_CONTRACT_ADDRESS',
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
} 