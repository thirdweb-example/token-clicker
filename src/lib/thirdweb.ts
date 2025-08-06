import { env } from "./env";
import {
  ContractReadCall,
  ContractWriteCall,
} from "./types";

const THIRDWEB_API_URL = env.THIRDWEB_API_BASE_URL;

async function makeThirdwebRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${THIRDWEB_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-secret-key": env.THIRDWEB_SECRET_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Thirdweb API error: ${response.status} ${response.statusText} ${error}`
    );
  }

  const data = await response.json();
  return data.result;
}

export async function createWallet(identifier: string) {
  const response = await makeThirdwebRequest("/v1/wallets", {
    method: "POST",
    body: JSON.stringify({ identifier }),
  });

  console.log("response", response);

  return response;
}

export async function getUserDetails(authToken: string) {
  const response = await makeThirdwebRequest("/v1/wallets/user/me", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${authToken}`,
    },
  });

  return response;
}

export async function readContract(calls: ContractReadCall[], chainId: number) {
  const response = await makeThirdwebRequest("/v1/contracts/read", {
    method: "POST",
    body: JSON.stringify({
      calls,
      chainId,
    }),
  });

  return response;
}

export async function writeContract(
  calls: ContractWriteCall[],
  chainId: number,
  from: string,
  authToken?: string
) {
  const response = await makeThirdwebRequest("/v1/contracts/write", {
    method: "POST",
    body: JSON.stringify({
      calls,
      chainId,
      from,
    }),
    headers: authToken ? {
      "Authorization": `Bearer ${authToken}`,
    } : {},
  });

  return response;
}

export async function getTransaction(transactionId: string) {
  const response = await makeThirdwebRequest(
    `/v1/transactions/${transactionId}`,
    {
      method: "GET",
    }
  );

  return response;
}

export async function listTransactions(page: number = 1, limit: number = 10) {
  const response = await makeThirdwebRequest(
    `/v1/transactions?page=${page}&limit=${limit}`,
    {
      method: "GET",
    }
  );

  return response;
}

export async function transferTokens(
  from: string,
  to: string,
  amount: string,
  tokenAddress: string,
  chainId: number,
  authToken?: string
) {
  const calls: ContractWriteCall[] = [
    {
      contractAddress: tokenAddress,
      method: "function transfer(address to, uint256 amount)",
      params: [to, amount],
    },
  ];

  return writeContract(calls, chainId, from, authToken);
}

export async function getTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  chainId: number
) {
  const calls: ContractReadCall[] = [
    {
      contractAddress: tokenAddress,
      method: "function balanceOf(address owner) view returns (uint256)",
      params: [walletAddress],
    },
  ];

  const result = await readContract(calls, chainId);
  return result[0];
}
