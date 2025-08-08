export interface User {
  id: string;
  email: string;
  walletAddress: string;
  smartWalletAddress?: string;
  createdAt: string;
  csrfToken: string;
}

export interface GameTarget {
  id: string;
  x: number;
  y: number;
  active: boolean;
  size: number; // Size in pixels (width and height)
}

export interface GameState {
  timeLeft: number;
  score: number;
  targets: GameTarget[];
  isPlaying: boolean;
  isGameOver: boolean;
}

export interface SessionStats {
  hits: number;
  misses: number;
  totalGains: number;
}

export interface Transaction {
  id: string;
  transactionHash: string | null;
  amount: string;
  status: 'QUEUED' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  confirmedAt: string | null;
}

export interface WalletBalance {
  chainId: number;
  decimals: number;
  displayValue: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  value: string;
}

export interface ContractReadCall {
  contractAddress: string;
  method: string;
  params?: any[];
  value?: string;
}

export interface ContractWriteCall {
  contractAddress: string;
  method: string;
  params?: any[];
  value?: string;
}

export interface TransactionRequest {
  chainId: number;
  from: string;
  transactions: Array<{
    type: 'contract-call' | 'native-transfer' | 'encoded';
    contractAddress?: string;
    method?: string;
    params?: any[];
    value?: string;
    to?: string;
    data?: string;
  }>;
} 