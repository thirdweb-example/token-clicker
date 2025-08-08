# Token Clicker Game

A fun Next.js web game that integrates with the thirdweb API to create a clicking game where players earn tokens for hitting targets.

## Features

- **User Authentication**: Enter a username to automatically create a wallet
- **Persistent Sessions**: Your account is remembered - no need to re-enter username on reload
- **Clicking Game**: Click on randomly spawning targets within a 10-second timer
- **Token Rewards**: Earn 0.01 tokens for each target hit
- **Real-time Transactions**: See transaction status updates in real-time
- **Balance Tracking**: View your current token balance with auto-refresh
- **Account Switching**: Easily switch between different user accounts
- **Responsive Design**: Built with Tailwind CSS and shadcn components

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui components
- **Blockchain Integration**: thirdweb API
- **Styling**: Tailwind CSS with custom game animations

## Setup Instructions

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Environment Configuration**

   - Copy `env.template` to `.env.local`:

   ```bash
   cp env.template .env.local
   ```

   - Fill in your environment variables in `.env.local`:

   ```env
   THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here
   TREASURY_WALLET_ADDRESS=0x...
   THIRDWEB_API_BASE_URL=https://api.thirdweb-dev.com
   ```

3. **Required Setup**

   - Get your thirdweb secret key from the [thirdweb dashboard](https://thirdweb.com/dashboard)
   - Deploy or have access to an ERC-20 token contract
   - Set up a treasury server wallet with sufficient token balance

4. **Run the Development Server**

   ```bash
   pnpm dev
   ```

5. **Open the Game**
   - Navigate to `http://localhost:3000`
   - Enter a username to create a wallet and start playing

## Environment Variables

| Variable                  | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `THIRDWEB_SECRET_KEY`     | Your thirdweb secret key for backend authentication |
| `TREASURY_WALLET_ADDRESS` | Wallet address that holds and distributes tokens    |
| `THIRDWEB_API_BASE_URL`   | thirdweb API base URL                               |

## Game Rules

1. **Login**: Enter a username to create your wallet (remembered for future visits)
2. **Start Game**: Click "Start Game" to begin a 10-second round
3. **Hit Targets**: Click on red targets that appear randomly
4. **Earn Tokens**: Each target hit earns 0.01 tokens
5. **Track Progress**: View your balance and transaction history
6. **Play Again**: Start new rounds to earn more tokens
7. **Switch Account**: Use "Switch Account" to log in with a different username

## Architecture

### API Routes

- `POST /api/user` - Create/login user with wallet
- `GET /api/balance` - Get user's token balance
- `POST /api/reward` - Send tokens to user (called on target hit)
- `GET /api/transaction/[id]` - Get transaction status
- `GET /api/transactions` - List recent transactions

### thirdweb Integration

All thirdweb API logic is contained in [`src/lib/thirdweb.ts`](src/lib/thirdweb.ts). This file handles wallet creation, token transfers, balance queries, and transaction management through the thirdweb SDK.

### Components

- `LoginForm` - User authentication
- `GameHeader` - User info and balance display
- `GameArena` - Main game area with target spawning
- `TransactionList` - Real-time transaction history

### State Management

- React hooks for local state management
- Real-time transaction polling for status updates
- Automatic balance refresh every 5 seconds (with throttling)

## Customization

### Game Settings

Edit the constants in `src/components/game/game-arena.tsx`:

```typescript
const GAME_DURATION = 10000; // 10 seconds
const TARGET_SPAWN_INTERVAL = 2000; // 2 seconds
const TARGET_LIFETIME = 3000; // 3 seconds
```

### Reward/Penalty Amounts

Reward and penalty amounts are specified in token units within their respective API routes and then converted to base units. Token address, decimals, and chain ID are now hardcoded in `src/lib/constants.ts`.

## Troubleshooting

1. **Wallet Creation Fails**: Check your thirdweb secret key
2. **No Tokens Received**: Ensure treasury wallet has sufficient balance
3. **Transaction Failures**: Verify token contract address and chain ID
4. **Balance Not Updating**: Check API connectivity and refresh manually

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Apache 2.0. This project is for educational purposes.
