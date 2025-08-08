# thirdweb API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.0.0`

thirdweb API provides a unified interface for Web3 development. Build scalable blockchain applications with easy-to-use endpoints for wallet management, transaction processing, signatures, and smart contract interactions. Powered by thirdweb's infrastructure.

## Servers

- **URL:** `https://api.thirdweb.com`
  - **Description:** thirdweb API server

## Operations

### List Contracts

- **Method:** `GET`
- **Path:** `/v1/contracts`
- **Tags:** Contracts

Retrieves a list of all smart contracts imported by the authenticated client on the thirdweb dashboard. This endpoint provides access to contracts that have been added to your dashboard for management and interaction. Results include contract metadata, deployment information, and import timestamps.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

**Note**: For detailed contract metadata including compilation information, ABI, and source code, use the dedicated metadata endpoint: `GET /v1/contracts/{chainId}/{address}/metadata`.

#### Responses

##### Status: 200 Successfully retrieved list of contracts

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`contracts` (required)**

    `array` — Array of contracts imported by the client.

    **Items:**

    - **`address` (required)**

      `string` — The contract address.

    - **`chainId` (required)**

      `string` — The chain ID where the contract is deployed.

    - **`importedAt` (required)**

      `string` — The date when the contract was imported to the dashboard.

    - **`deployedAt`**

      `string` — The date when the contract was deployed.

    - **`id`**

      `string` — The contract ID.

    - **`name`**

      `string` — The contract name, if available.

    - **`symbol`**

      `string` — The contract symbol, if available.

    - **`type`**

      `string` — The contract type (e.g., ERC20, ERC721, etc.).

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

**Example:**

```
{
  "result": {
    "contracts": [
      {
        "address": "",
        "chainId": "",
        "deployedAt": "",
        "id": "",
        "importedAt": "",
        "name": "",
        "symbol": "",
        "type": ""
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    }
  }
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 429 Rate limit exceeded

##### Status: 500 Internal server error

### Deploy Contract

- **Method:** `POST`
- **Path:** `/v1/contracts`
- **Tags:** Contracts

Deploy a new smart contract to a blockchain network using raw bytecode. This endpoint allows you to deploy contracts by providing the contract bytecode, ABI, constructor parameters, and optional salt for deterministic deployment.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`abi` (required)**

  `array` — The contract ABI array.

  **Items:**

- **`bytecode` (required)**

  `string` — The contract bytecode as a hex string.

- **`chainId` (required)**

  `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

- **`from` (required)**

  `string` — The wallet address or ENS name that will deploy the contract.

- **`constructorParams`**

  `object` — Object containing constructor parameters for the contract deployment (e.g., { param1: 'value1', param2: 123 }).

- **`salt`**

  `string` — Optional salt value for deterministic contract deployment.

**Example:**

```
{
  "chainId": 1,
  "from": "0x1234567890123456789012345678901234567890",
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "defaultAdmin",
          "type": "address"
        }
      ]
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [
        {
          "type": "string"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "constructorParams": {
    "defaultAdmin": "0x1234567890123456789012345678901234567890"
  }
}
```

#### Responses

##### Status: 200 Contract deployed successfully

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`address` (required)**

    `string` — The deployed contract address.

  - **`chainId` (required)**

    `number` — The chain ID where the contract was deployed.

  - **`transactionId`**

    `string` — The unique identifier for the transaction that deployed the contract. Will not be returned if the contract was already deployed at the predicted address.

**Example:**

```
{
  "result": {
    "address": "",
    "chainId": 1,
    "transactionId": ""
  }
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 429 Rate limit exceeded

##### Status: 500 Internal server error

### Read Contract Methods

- **Method:** `POST`
- **Path:** `/v1/contracts/read`
- **Tags:** Contracts

Executes multiple read-only contract method calls in a single batch request. This endpoint allows efficient batch reading from multiple contracts on the same chain, significantly reducing the number of HTTP requests needed. Each call specifies the contract address, method signature, and optional parameters. Results are returned in the same order as the input calls, with individual success/failure status for each operation.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

- **`calls` (required)**

  `array` — Array of contract method calls to execute. Each call specifies a contract address, method signature, and optional parameters.

  **Items:**

  - **`contractAddress` (required)**

    `string` — The smart contract address or ENS name.

  - **`method` (required)**

    `string` — The contract function signature to call (e.g., 'function approve(address spender, uint256 amount)' or \`function balanceOf(address)\`). Must start with 'function' followed by the function name and parameters as defined in the contract ABI.

  - **`params`**

    `array` — Array of parameters to pass to the contract method, in the correct order and format.

    **Items:**

  - **`value`**

    `string` — Amount of native token to send with the transaction in wei. Required for payable methods.

- **`chainId` (required)**

  `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

**Example:**

```
{
  "calls": [
    {
      "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "method": "function name() view returns (string)"
    },
    {
      "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "method": "function totalSupply() returns (uint256)"
    },
    {
      "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "method": "function balanceOf(address) returns (uint256)",
      "params": [
        "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6"
      ]
    }
  ],
  "chainId": 8453
}
```

#### Responses

##### Status: 200 Contract read operations completed successfully. Returns an array of results corresponding to each input call, including both successful and failed operations.

###### Content-Type: application/json

- **`result` (required)**

  `array` — Array of results corresponding to each contract read call. Results are returned in the same order as the input calls.

  **Items:**

  - **`success` (required)**

    `boolean` — Indicates whether the contract read operation was successful.

  - **`data`**

    `object` — The result of the contract read operation. The type and format depend on the method's return value as defined in the contract ABI.

  - **`error`**

    `string` — Error message if the contract read operation failed.

**Example:**

```
{
  "result": [
    {
      "data": null,
      "error": "",
      "success": true
    }
  ]
}
```

##### Status: 400 Invalid request parameters. This occurs when the chainId is not supported, contract addresses are invalid, function signatures are malformed, or the calls array is empty.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 500 Internal server error. This may occur due to engine connectivity issues, RPC node unavailability, or unexpected server errors.

### Get Contract Transactions

- **Method:** `GET`
- **Path:** `/v1/contracts/{chainId}/{address}/transactions`
- **Tags:** Contracts

Retrieves transactions for a specific smart contract address on a specific blockchain network. This endpoint provides comprehensive transaction data including block information, gas details, transaction status, and function calls. Results can be filtered, paginated, and sorted to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Contract transactions retrieved successfully. Returns transaction data with metadata including pagination information. Includes decoded function calls when ABI is available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`data` (required)**

    `array` — Array of contract transactions.

    **Items:**

    - **`blockHash` (required)**

      `string` — The hash of the block containing this transaction.

    - **`blockNumber` (required)**

      `number` — The block number containing this transaction.

    - **`blockTimestamp` (required)**

      `number` — The timestamp of the block (Unix timestamp).

    - **`chainId` (required)**

      `string` — The chain ID where the transaction occurred.

    - **`data` (required)**

      `string` — The transaction input data.

    - **`fromAddress` (required)**

      `string` — The address that initiated the transaction.

    - **`functionSelector` (required)**

      `string` — The function selector (first 4 bytes of the transaction data).

    - **`gas` (required)**

      `number` — The gas limit for the transaction.

    - **`gasPrice` (required)**

      `string` — The gas price used for the transaction (in wei as string).

    - **`hash` (required)**

      `string` — The transaction hash.

    - **`nonce` (required)**

      `number` — The transaction nonce.

    - **`status` (required)**

      `number` — The transaction status (1 for success, 0 for failure).

    - **`toAddress` (required)**

      `string` — The address that received the transaction.

    - **`transactionIndex` (required)**

      `number` — The index of the transaction within the block.

    - **`value` (required)**

      `string` — The value transferred in the transaction (in wei as string).

    - **`contractAddress`**

      `string` — Contract address created if this was a contract creation transaction.

    - **`cumulativeGasUsed`**

      `number` — Total gas used by all transactions in this block up to and including this one.

    - **`decoded`**

      `object` — Decoded transaction data (included when ABI is available).

      - **`inputs` (required)**

        `object` — Object containing decoded function parameters.

      - **`name` (required)**

        `string` — The function name.

      - **`signature` (required)**

        `string` — The function signature.

    - **`effectiveGasPrice`**

      `string` — The effective gas price paid (in wei as string).

    - **`gasUsed`**

      `number` — The amount of gas used by the transaction.

    - **`maxFeePerGas`**

      `string` — Maximum fee per gas (EIP-1559).

    - **`maxPriorityFeePerGas`**

      `string` — Maximum priority fee per gas (EIP-1559).

    - **`transactionType`**

      `number` — The transaction type (0=legacy, 1=EIP-2930, 2=EIP-1559).

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

**Example:**

```
{
  "result": {
    "data": [
      {
        "blockHash": "",
        "blockNumber": 1,
        "blockTimestamp": 1,
        "chainId": "",
        "contractAddress": "",
        "cumulativeGasUsed": 1,
        "data": "",
        "decoded": {
          "inputs": {
            "ANY_ADDITIONAL_PROPERTY": "anything"
          },
          "name": "",
          "signature": ""
        },
        "effectiveGasPrice": "",
        "fromAddress": "",
        "functionSelector": "",
        "gas": 1,
        "gasPrice": "",
        "gasUsed": 1,
        "hash": "",
        "maxFeePerGas": "",
        "maxPriorityFeePerGas": "",
        "nonce": 1,
        "status": 1,
        "toAddress": "",
        "transactionIndex": 1,
        "transactionType": 1,
        "value": ""
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    }
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the contract address or chainId format is invalid, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 404 Contract not found or no transactions available for the specified contract address on the given blockchain network.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Get Contract Events

- **Method:** `GET`
- **Path:** `/v1/contracts/{chainId}/{address}/events`
- **Tags:** Contracts

Retrieves events emitted by a specific smart contract address on a specific blockchain network. This endpoint provides comprehensive event data including block information, transaction details, event topics, and optional ABI decoding. Results can be filtered, paginated, and sorted to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Contract events retrieved successfully. Returns event data with metadata including pagination information. Includes decoded event parameters when ABI is available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`events` (required)**

    `array` — Array of contract events.

    **Items:**

    - **`address` (required)**

      `string` — The contract address that emitted the event.

    - **`blockHash` (required)**

      `string` — The hash of the block containing this event.

    - **`blockNumber` (required)**

      `number` — The block number where the event was emitted.

    - **`blockTimestamp` (required)**

      `number` — The timestamp of the block (Unix timestamp).

    - **`chainId` (required)**

      `string` — The chain ID where the event occurred.

    - **`data` (required)**

      `string` — The non-indexed event data as a hex string.

    - **`logIndex` (required)**

      `number` — The index of the log within the transaction.

    - **`topics` (required)**

      `array` — Array of indexed event topics (including event signature).

      **Items:**

      `string`

    - **`transactionHash` (required)**

      `string` — The hash of the transaction containing this event.

    - **`transactionIndex` (required)**

      `number` — The index of the transaction within the block.

    - **`decoded`**

      `object` — Decoded event data (included when ABI is available).

      - **`name` (required)**

        `string` — The event name.

      - **`params` (required)**

        `object` — Object containing decoded parameters.

      - **`signature` (required)**

        `string` — The event signature.

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

**Example:**

```
{
  "result": {
    "events": [
      {
        "address": "",
        "blockHash": "",
        "blockNumber": 1,
        "blockTimestamp": 1,
        "chainId": "",
        "data": "",
        "decoded": {
          "name": "",
          "params": {
            "ANY_ADDITIONAL_PROPERTY": "anything"
          },
          "signature": ""
        },
        "logIndex": 1,
        "topics": [
          ""
        ],
        "transactionHash": "",
        "transactionIndex": 1
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    }
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the contract address or chainId format is invalid, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 404 Contract not found or no events available for the specified contract address on the given blockchain network.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Write Contract Methods

- **Method:** `POST`
- **Path:** `/v1/contracts/write`
- **Tags:** Contracts

Executes write operations (transactions) on smart contracts. This is a convenience endpoint that simplifies contract interaction by accepting method signatures and parameters directly, without requiring manual transaction encoding. All calls are executed against the same contract address and chain, making it ideal for batch operations.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`calls` (required)**

  `array` — Array of contract method calls to execute. Each call specifies a contract address, method signature, and optional parameters.

  **Items:**

  - **`contractAddress` (required)**

    `string` — The smart contract address or ENS name.

  - **`method` (required)**

    `string` — The contract function signature to call (e.g., 'function approve(address spender, uint256 amount)' or \`function balanceOf(address)\`). Must start with 'function' followed by the function name and parameters as defined in the contract ABI.

  - **`params`**

    `array` — Array of parameters to pass to the contract method, in the correct order and format.

    **Items:**

  - **`value`**

    `string` — Amount of native token to send with the transaction in wei. Required for payable methods.

- **`chainId` (required)**

  `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

- **`from` (required)**

  `string` — The wallet address or ENS name that will send the transaction.

**Example:**

```
{
  "calls": [
    {
      "contractAddress": "0xe352Cf5f74e3ACfd2d59EcCee6373d2Aa996086e",
      "method": "function approve(address spender, uint256 amount)",
      "params": [
        "0x4fA9230f4E8978462cE7Bf8e6b5a2588da5F4264",
        1000000000
      ]
    }
  ],
  "chainId": 84532,
  "from": "0x1234567890123456789012345678901234567890"
}
```

#### Responses

##### Status: 200 Contract write operations submitted successfully. Returns transaction IDs for tracking and monitoring.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionIds` (required)**

    `array` — Array of unique identifiers for the submitted transactions. Use these to track transaction status.

    **Items:**

    `string`

**Example:**

```
{
  "result": {
    "transactionIds": [
      ""
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when contract parameters are malformed, method signatures are invalid, insufficient balance, or unsupported contract methods.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 404 Contract not found. The specified contract address does not exist on the given blockchain network or is not accessible.

##### Status: 500 Internal server error. This may occur due to blockchain connectivity issues, gas estimation failures, contract execution errors, or unexpected server errors.

### Get Contract Metadata

- **Method:** `GET`
- **Path:** `/v1/contracts/{chainId}/{address}/metadata`
- **Tags:** Contracts

Retrieves detailed metadata for a specific smart contract from the thirdweb contract metadata service. This includes compilation information, ABI, documentation, and other contract-related metadata. Note: Source code is excluded from the response to keep it lightweight and suitable for programmatic access.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

**Metadata Source**: The metadata is fetched from the thirdweb contract metadata service and includes detailed Solidity compilation information, contract ABI, and developer documentation.

#### Responses

##### Status: 200 Successfully retrieved contract metadata

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`compiler`**

    `object` — Compiler information including version.

    - **`version` (required)**

      `string` — Solidity compiler version used to compile the contract.

  - **`language`**

    `string` — Programming language of the contract (e.g., 'Solidity').

  - **`output`**

    `object` — Compilation output including ABI and documentation.

    - **`abi`**

      `array` — Contract ABI (Application Binary Interface) as an array of function/event/error definitions.

      **Items:**

    - **`devdoc`**

      `object` — Developer documentation extracted from contract comments.

    - **`userdoc`**

      `object` — User documentation extracted from contract comments.

  - **`settings`**

    `object` — Compilation settings including optimization and target configuration.

    - **`compilationTarget`**

      `object` — Compilation target mapping source file names to contract names.

    - **`evmVersion`**

      `string` — EVM version target for compilation.

    - **`libraries`**

      `object` — Library addresses for linking.

    - **`metadata`**

      `object` — Metadata settings for compilation.

      - **`bytecodeHash`**

        `string` — Hash method used for bytecode metadata.

    - **`optimizer`**

      `object` — Optimizer settings used during compilation.

      - **`enabled`**

        `boolean` — Whether optimizer is enabled.

      - **`runs`**

        `number` — Number of optimizer runs.

    - **`remappings`**

      `array` — Import remappings used during compilation.

      **Items:**

      `string`

  - **`version`**

    `number` — Metadata format version.

**Example:**

```
{
  "result": {
    "compiler": {
      "version": ""
    },
    "language": "",
    "output": {
      "abi": [],
      "devdoc": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      },
      "userdoc": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      }
    },
    "settings": {
      "compilationTarget": {
        "ANY_ADDITIONAL_PROPERTY": ""
      },
      "evmVersion": "",
      "libraries": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      },
      "metadata": {
        "bytecodeHash": ""
      },
      "optimizer": {
        "enabled": true,
        "runs": 1
      },
      "remappings": [
        ""
      ]
    },
    "version": 1
  }
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 404 Contract metadata not found

##### Status: 429 Rate limit exceeded

##### Status: 500 Internal server error

### Get Contract ABI Signatures

- **Method:** `GET`
- **Path:** `/v1/contracts/{chainId}/{address}/signatures`
- **Tags:** Contracts

Retrieves human-readable ABI signatures for a specific smart contract. This endpoint fetches the contract metadata from the thirdweb service, extracts the ABI, and converts it into an array of human-readable function and event signatures that can be used directly with contract interaction methods.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

**Usage**: The returned signatures can be used directly in contract read/write operations or event filtering. Each signature follows the standard Solidity format and includes function parameters, return types, state mutability, and event indexing information.

#### Responses

##### Status: 200 Successfully retrieved contract signatures

###### Content-Type: application/json

- **`result` (required)**

  `array` — Array of human-readable ABI signatures including functions and events. Each signature is formatted as a string that can be used directly in contract read/write operations or event filtering.

  **Items:**

  `string`

**Example:**

```
{
  "result": [
    ""
  ]
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 404 Contract metadata not found or ABI is not available

##### Status: 429 Rate limit exceeded

##### Status: 500 Internal server error

### Get Wallet Native Balance

- **Method:** `GET`
- **Path:** `/v1/wallets/{address}/balance`
- **Tags:** Wallets

Get native token balance for a wallet address across multiple blockchain networks. This endpoint retrieves native token balances (ETH, MATIC, BNB, etc.) for a given wallet address on multiple chains simultaneously, making it efficient for cross-chain native balance checking.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Wallet native balances retrieved successfully. Returns detailed native token balance information for each chain including token metadata and formatted values.

###### Content-Type: application/json

- **`result` (required)**

  `array`

  **Items:**

  - **`chainId` (required)**

    `number` — The blockchain network ID

  - **`decimals` (required)**

    `number` — Number of decimal places for the token

  - **`displayValue` (required)**

    `string` — Human-readable balance formatted with appropriate decimal places

  - **`name` (required)**

    `string` — The token name (e.g., 'Ether', 'USD Coin')

  - **`symbol` (required)**

    `string` — The token symbol (e.g., 'ETH', 'USDC')

  - **`tokenAddress` (required)**

    `string` — The token contract address. Returns zero address (0x0...0) for native tokens.

  - **`value` (required)**

    `string` — Raw balance value as string in smallest unit (wei for ETH, etc.)

**Example:**

```
{
  "result": [
    {
      "chainId": 1,
      "decimals": 1,
      "displayValue": "",
      "name": "",
      "symbol": "",
      "tokenAddress": "",
      "value": ""
    }
  ]
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId array is empty or exceeds the maximum limit of 50, or chain IDs are invalid.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 500 Internal server error. This may occur due to blockchain connectivity issues, RPC service unavailability, or unexpected server errors.

### Get Wallet Transactions

- **Method:** `GET`
- **Path:** `/v1/wallets/{address}/transactions`
- **Tags:** Wallets

Retrieves transactions for a specific wallet address across one or more blockchain networks. This endpoint provides comprehensive transaction data including both incoming and outgoing transactions, with block information, gas details, transaction status, and function calls. Results can be filtered, paginated, and sorted to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Wallet transactions retrieved successfully. Returns transaction data with metadata including pagination information and chain details. Includes decoded function calls when ABI is available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

  - **`transactions` (required)**

    `array` — Array of wallet transactions.

    **Items:**

    - **`blockHash` (required)**

      `string` — The hash of the block containing this transaction.

    - **`blockNumber` (required)**

      `number` — The block number containing this transaction.

    - **`blockTimestamp` (required)**

      `number` — The timestamp of the block (Unix timestamp).

    - **`chainId` (required)**

      `string` — The chain ID where the transaction occurred.

    - **`data` (required)**

      `string` — The transaction input data.

    - **`fromAddress` (required)**

      `string` — The address that initiated the transaction.

    - **`functionSelector` (required)**

      `string` — The function selector (first 4 bytes of the transaction data).

    - **`gas` (required)**

      `number` — The gas limit for the transaction.

    - **`gasPrice` (required)**

      `string` — The gas price used for the transaction (in wei as string).

    - **`hash` (required)**

      `string` — The transaction hash.

    - **`nonce` (required)**

      `number` — The transaction nonce.

    - **`status` (required)**

      `number` — The transaction status (1 for success, 0 for failure).

    - **`toAddress` (required)**

      `string` — The address that received the transaction.

    - **`transactionIndex` (required)**

      `number` — The index of the transaction within the block.

    - **`value` (required)**

      `string` — The value transferred in the transaction (in wei as string).

    - **`contractAddress`**

      `string` — Contract address created if this was a contract creation transaction.

    - **`cumulativeGasUsed`**

      `number` — Total gas used by all transactions in this block up to and including this one.

    - **`decoded`**

      `object` — Decoded transaction data (included when ABI is available).

      - **`inputs` (required)**

        `object` — Object containing decoded function parameters.

      - **`name` (required)**

        `string` — The function name.

      - **`signature` (required)**

        `string` — The function signature.

    - **`effectiveGasPrice`**

      `string` — The effective gas price paid (in wei as string).

    - **`gasUsed`**

      `number` — The amount of gas used by the transaction.

    - **`maxFeePerGas`**

      `string` — Maximum fee per gas (EIP-1559).

    - **`maxPriorityFeePerGas`**

      `string` — Maximum priority fee per gas (EIP-1559).

    - **`transactionType`**

      `number` — The transaction type (0=legacy, 1=EIP-2930, 2=EIP-1559).

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    },
    "transactions": [
      {
        "blockHash": "",
        "blockNumber": 1,
        "blockTimestamp": 1,
        "chainId": "",
        "contractAddress": "",
        "cumulativeGasUsed": 1,
        "data": "",
        "decoded": {
          "inputs": {
            "ANY_ADDITIONAL_PROPERTY": "anything"
          },
          "name": "",
          "signature": ""
        },
        "effectiveGasPrice": "",
        "fromAddress": "",
        "functionSelector": "",
        "gas": 1,
        "gasPrice": "",
        "gasUsed": 1,
        "hash": "",
        "maxFeePerGas": "",
        "maxPriorityFeePerGas": "",
        "nonce": 1,
        "status": 1,
        "toAddress": "",
        "transactionIndex": 1,
        "transactionType": 1,
        "value": ""
      }
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId array is empty or exceeds the maximum limit of 50, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 404 Wallet not found or no transactions available for the specified wallet address on the given blockchain networks.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Get Wallet Tokens

- **Method:** `GET`
- **Path:** `/v1/wallets/{address}/tokens`
- **Tags:** Wallets

Retrieves token balances for a specific wallet address across one or more blockchain networks. This endpoint provides comprehensive token data including ERC-20 tokens with their balances, metadata, and price information. Results can be filtered by chain and paginated to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Wallet tokens retrieved successfully. Returns token data with metadata including pagination information and chain details. Includes token balances, metadata, and price information when available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

  - **`tokens` (required)**

    `array` — Array of wallet tokens.

    **Items:**

    - **`balance` (required)**

      `string` — The token balance as a string

    - **`chain_id` (required)**

      `number` — The chain ID of the token

    - **`token_address` (required)**

      `string` — The contract address of the token

    - **`decimals`**

      `number` — The number of decimal places

    - **`name`**

      `string` — The token name

    - **`price_data`**

      `object` — Price data for the token

      - **`circulating_supply`**

        `number` — The circulating supply of the token

      - **`market_cap_usd`**

        `number` — The market cap of the token in USD

      - **`percent_change_24h`**

        `number` — The percentage change of the token in the last 24 hours

      - **`price_timestamp`**

        `string` — The timestamp of the latest price update

      - **`price_usd`**

        `number` — The price of the token in USD

      - **`total_supply`**

        `number` — The total supply of the token

      - **`volume_24h_usd`**

        `number` — The volume of the token in USD

    - **`symbol`**

      `string` — The token symbol

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    },
    "tokens": [
      {
        "balance": "",
        "chain_id": 1,
        "decimals": 1,
        "name": "",
        "price_data": {
          "circulating_supply": 1,
          "market_cap_usd": 1,
          "percent_change_24h": 1,
          "price_timestamp": "",
          "price_usd": 1,
          "total_supply": 1,
          "volume_24h_usd": 1
        },
        "symbol": "",
        "token_address": ""
      }
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId array is empty or exceeds the maximum limit of 50, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 404 Wallet not found or no tokens available for the specified wallet address on the given blockchain networks.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Get Wallet NFTs

- **Method:** `GET`
- **Path:** `/v1/wallets/{address}/nfts`
- **Tags:** Wallets

Retrieves NFTs for a specific wallet address across one or more blockchain networks. This endpoint provides comprehensive NFT data including metadata, attributes, and collection information. Results can be filtered by chain and paginated to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Wallet NFTs retrieved successfully. Returns NFT data with metadata including pagination information and chain details. Includes NFT metadata, attributes, and collection information when available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`nfts` (required)**

    `array` — Array of wallet NFTs.

    **Items:**

    - **`chain_id` (required)**

      `number` — The chain ID of the NFT

    - **`token_address` (required)**

      `string` — The contract address of the NFT collection

    - **`token_id` (required)**

      `string` — The token ID of the NFT

    - **`animation_url`**

      `string` — The animation URL of the NFT

    - **`attributes`**

      `array` — The attributes/traits of the NFT

      **Items:**

      - **`display_type`**

        `string` — The display type

      - **`trait_type`**

        `string` — The trait type

      - **`value`**

        `object` — The trait value

    - **`collection`**

      `object` — Collection information

      - **`description`**

        `string` — The collection description

      - **`external_url`**

        `string` — The collection external URL

      - **`image`**

        `string` — The collection image URL

      - **`name`**

        `string` — The collection name

    - **`description`**

      `string` — The description of the NFT

    - **`external_url`**

      `string` — The external URL of the NFT

    - **`image_url`**

      `string` — The image URL of the NFT

    - **`metadata`**

      `object` — Additional metadata for the NFT

    - **`name`**

      `string` — The name of the NFT

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

**Example:**

```
{
  "result": {
    "nfts": [
      {
        "animation_url": "",
        "attributes": [
          {
            "display_type": "",
            "trait_type": "",
            "value": ""
          }
        ],
        "chain_id": 1,
        "collection": {
          "description": "",
          "external_url": "",
          "image": "",
          "name": ""
        },
        "description": "",
        "external_url": "",
        "image_url": "",
        "metadata": {
          "ANY_ADDITIONAL_PROPERTY": "anything"
        },
        "name": "",
        "token_address": "",
        "token_id": ""
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    }
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId array is empty or exceeds the maximum limit of 50, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 404 Wallet not found or no NFTs available for the specified wallet address on the given blockchain networks.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Send Tokens or NFTs

- **Method:** `POST`
- **Path:** `/v1/wallets/send`
- **Tags:** Wallets

Send tokens to multiple recipients in a single transaction batch. Supports native tokens (ETH, MATIC, etc.), ERC20 tokens, ERC721 NFTs, and ERC1155 tokens. The token type is automatically determined based on the provided parameters and ERC165 interface detection:

- **Native Token**: No `tokenAddress` provided

- **ERC20**: `tokenAddress` provided, no `tokenId`

- **ERC721/ERC1155**: `tokenAddress` and `tokenId` provided. Auto detects contract type:

  - ERC721: quantity must be '1'
  - ERC1155: any quantity allowed (including '1')

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier where the transfer will be executed.

- **`from` (required)**

  `string` — The wallet address or ENS name that will send the tokens.

- **`recipients` (required)**

  `array` — Array of recipients and quantities. Maximum 100 recipients per request.

  **Items:**

  - **`address` (required)**

    `string` — The recipient wallet address or ENS name

  - **`quantity` (required)**

    `string` — The amount to send. For native tokens and ERC20: amount in wei/smallest unit. For ERC721: should be '1'. For ERC1155: the number of tokens to transfer.

- **`tokenAddress`**

  `string` — The token contract address. Omit for native token (ETH, MATIC, etc.) transfers.

- **`tokenId`**

  `string` — The token ID for NFT transfers (ERC721/ERC1155). Required for NFT transfers.

**Example:**

```
{
  "from": "0x1234567890123456789012345678901234567890",
  "chainId": 1,
  "recipients": [
    {
      "address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "quantity": "1000000000000000000"
    },
    {
      "address": "0x1111111111111111111111111111111111111111",
      "quantity": "500000000000000000"
    }
  ]
}
```

#### Responses

##### Status: 200 Tokens sent successfully. Returns transaction IDs for tracking and monitoring.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionIds` (required)**

    `array` — Array of transaction IDs for the submitted transfers. One ID per recipient.

    **Items:**

    `string`

**Example:**

```
{
  "result": {
    "transactionIds": [
      ""
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when token parameters are malformed, insufficient balance, invalid contract data, or unsupported token type.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 500 Internal server error. This may occur due to blockchain connectivity issues, gas estimation failures, contract execution errors, or unexpected server errors.

### Sign Message

- **Method:** `POST`
- **Path:** `/v1/wallets/sign-message`
- **Tags:** Wallets

Signs an arbitrary message using the specified wallet. This endpoint supports both text and hexadecimal message formats. The signing is performed using thirdweb Engine with smart account support for gasless transactions.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier where the signing will occur. Common values include: 1 (Ethereum), 137 (Polygon), 56 (BSC).

- **`from` (required)**

  `string` — The wallet address or ENS name that will sign the message.

- **`message` (required)**

  `string` — The message to be signed. Can be plain text or hexadecimal format (starting with 0x). The format is automatically detected.

**Example:**

```
{
  "from": "0x1234567890123456789012345678901234567890",
  "chainId": 1,
  "message": "Hello, world!"
}
```

#### Responses

##### Status: 200 Message signed successfully. Returns the cryptographic signature that can be used for verification.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`signature` (required)**

    `string` — The cryptographic signature in hexadecimal format. This can be used for verification and authentication purposes.

**Example:**

```
{
  "result": {
    "signature": ""
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId is not supported, or the message format is incorrect.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 500 Internal server error. This may occur due to wallet connectivity issues, signing service unavailability, or unexpected server errors.

### Sign Typed Data

- **Method:** `POST`
- **Path:** `/v1/wallets/sign-typed-data`
- **Tags:** Wallets

Signs structured data according to the EIP-712 standard using the specified wallet. This is commonly used for secure message signing in DeFi protocols, NFT marketplaces, and other dApps that require structured data verification. The typed data includes domain separation and type definitions for enhanced security.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier for EIP-712 domain separation.

- **`domain` (required)**

  `object` — EIP-712 domain separator containing contract and chain information for signature verification.

  - **`chainId`**

    `string` — Chain ID as string for domain separation

  - **`name`**

    `string` — The domain name (e.g., token name)

  - **`salt`**

    `string` — Optional salt for additional entropy

  - **`verifyingContract`**

    `string` — The contract address that will verify this signature

  - **`version`**

    `string` — Domain version for signature compatibility

- **`from` (required)**

  `string` — The wallet address or ENS name that will sign the typed data.

- **`message` (required)**

  `object` — The structured data to be signed, matching the defined types schema.

- **`primaryType` (required)**

  `string` — The primary type name from the types object that defines the main structure being signed.

- **`types` (required)**

  `object` — Type definitions for the structured data, following EIP-712 specifications.

**Example:**

```
{
  "from": "0x1234567890123456789012345678901234567890",
  "chainId": 1,
  "domain": {
    "name": "MyDomain",
    "version": "1",
    "chainId": "1",
    "verifyingContract": "0x1234567890123456789012345678901234567890"
  },
  "message": {
    "name": "foo"
  },
  "primaryType": "MyType",
  "types": {
    "MyType": [
      {
        "name": "name",
        "type": "string"
      }
    ]
  }
}
```

#### Responses

##### Status: 200 Typed data signed successfully. Returns the EIP-712 compliant signature that can be used for on-chain verification.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`signature` (required)**

    `string` — The cryptographic signature in hexadecimal format. This can be used for verification and authentication purposes.

**Example:**

```
{
  "result": {
    "signature": ""
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the typed data structure is malformed, domain parameters are incorrect, or wallet address format is invalid.

##### Status: 401 Authentication required. The request must include valid \`x-wallet-access-token\` headers for accessing the wallet, as well as a x-client-id (frontend) or x-secret-key (backend) for project authentication.

##### Status: 500 Internal server error. This may occur due to wallet connectivity issues, signing service unavailability, or unexpected server errors.

### Create Server Wallet

- **Method:** `POST`
- **Path:** `/v1/wallets/server`
- **Tags:** Wallets

Creates a server wallet from a unique identifier. If the wallet already exists, it will return the existing wallet.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`identifier` (required)**

  `string` — Unique identifier for wallet creation or retrieval. Can be user ID, email, or any unique string. The same identifier will always return the same wallet.

**Example:**

```
{
  "identifier": "treasury-wallet-123"
}
```

#### Responses

##### Status: 200 Server wallet created or connected successfully. Returns wallet addresses for subsequent operations.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`address` (required)**

    `string` — The EOA (Externally Owned Account) address of the wallet. This is the traditional wallet address.

  - **`profiles` (required)**

    `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

    **Items:**

    **Any of:**

    - **`email` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`hd` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`locale` (required)**

      `string`

    - **`picture` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"google"`

    - **`familyName`**

      `string`

    - **`givenName`**

      `string`

    - **`name`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"facebook"`

    * **`email`**

      `string`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`name`**

      `string`

    * **`picture`**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`isPrivateEmail` (required)**

      `boolean`

    - **`type` (required)**

      `string`, possible values: `"apple"`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"github"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string | null`

    * **`name`**

      `string | null`

    - **`avatar` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"discord"`

    - **`username` (required)**

      `string`

    - **`email`**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`name` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"coinbase"`

    * **`avatar`**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"x"`

    - **`username` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`metadata` (required)**

      `object`

      - **`avatar` (required)**

        `object`

        - **`large`**

          `string`

        - **`medium`**

          `string`

        - **`small`**

          `string`

      - **`personaname`**

        `string`

      - **`profileurl`**

        `string`

      - **`realname`**

        `string`

    * **`type` (required)**

      `string`, possible values: `"steam"`

    * **`avatar`**

      `string`

    * **`username`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"telegram"`

    - **`firstName`**

      `string`

    - **`lastName`**

      `string`

    - **`picture`**

      `string`

    - **`username`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"twitch"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string`

    * **`description`**

      `string`

    * **`email`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"line"`

    - **`avatar`**

      `string`

    - **`username`**

      `string`

    * **`fid` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"farcaster"`

    * **`walletAddress`**

      `string`

    - **`algorithm` (required)**

      `string`

    - **`credentialId` (required)**

      `string`

    - **`publicKey` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"passkey"`

    * **`email` (required)**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"email"`

    - **`id` (required)**

      `string`

    - **`pregeneratedIdentifier` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"pre_generation"`

    * **`id` (required)**

      `string`

    * **`phone` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"phone"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"siwe"`

    - **`walletAddress` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"guest"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"backend"`

    * **`identifier` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"server"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"custom_jwt"`

    - **`authProviderId`**

      `string`

    - **`email`**

      `string`

    - **`phone`**

      `string`

    - **`walletAddress`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"custom_auth_endpoint"`

    * **`authProviderId`**

      `string`

    * **`email`**

      `string`

    * **`phone`**

      `string`

    * **`walletAddress`**

      `string`

  - **`createdAt`**

    `string` — The date and time the wallet was created

  - **`smartWalletAddress`**

    `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced account features.

**Example:**

```
{
  "result": {
    "address": "",
    "createdAt": "",
    "profiles": [
      {
        "email": "",
        "emailVerified": true,
        "familyName": "",
        "givenName": "",
        "hd": "",
        "id": "",
        "locale": "",
        "name": "",
        "picture": "",
        "type": "google"
      }
    ],
    "smartWalletAddress": ""
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the identifier format is invalid or required parameters are missing.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header.

##### Status: 500 Internal server error. This may occur due to wallet service unavailability, smart account deployment issues, or unexpected server errors.

### List Server Wallets

- **Method:** `GET`
- **Path:** `/v1/wallets/server`
- **Tags:** Wallets

Get all server wallet details with pagination for your project.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Responses

##### Status: 200 Returns a list of server wallet addresses, smart wallet addresses, and auth details.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object` — Pagination information

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

  - **`wallets` (required)**

    `array` — Array of server wallets

    **Items:**

    - **`address` (required)**

      `string` — The EOA (Externally Owned Account) address of the wallet. This is the traditional wallet address.

    - **`profiles` (required)**

      `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

      **Items:**

      **Any of:**

      - **`email` (required)**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`hd` (required)**

        `string`

      - **`id` (required)**

        `string`

      - **`locale` (required)**

        `string`

      - **`picture` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"google"`

      - **`familyName`**

        `string`

      - **`givenName`**

        `string`

      - **`name`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"facebook"`

      * **`email`**

        `string`

      * **`firstName`**

        `string`

      * **`lastName`**

        `string`

      * **`name`**

        `string`

      * **`picture`**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`id` (required)**

        `string`

      - **`isPrivateEmail` (required)**

        `boolean`

      - **`type` (required)**

        `string`, possible values: `"apple"`

      - **`email`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"github"`

      * **`username` (required)**

        `string`

      * **`avatar`**

        `string | null`

      * **`name`**

        `string | null`

      - **`avatar` (required)**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"discord"`

      - **`username` (required)**

        `string`

      - **`email`**

        `string`, format: `email`

      * **`id` (required)**

        `string`

      * **`name` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"coinbase"`

      * **`avatar`**

        `string`

      - **`id` (required)**

        `string`

      - **`name` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"x"`

      - **`username` (required)**

        `string`

      * **`id` (required)**

        `string`

      * **`metadata` (required)**

        `object`

        - **`avatar` (required)**

          `object`

          - **`large`**

            `string`

          - **`medium`**

            `string`

          - **`small`**

            `string`

        - **`personaname`**

          `string`

        - **`profileurl`**

          `string`

        - **`realname`**

          `string`

      * **`type` (required)**

        `string`, possible values: `"steam"`

      * **`avatar`**

        `string`

      * **`username`**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"telegram"`

      - **`firstName`**

        `string`

      - **`lastName`**

        `string`

      - **`picture`**

        `string`

      - **`username`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"twitch"`

      * **`username` (required)**

        `string`

      * **`avatar`**

        `string`

      * **`description`**

        `string`

      * **`email`**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"line"`

      - **`avatar`**

        `string`

      - **`username`**

        `string`

      * **`fid` (required)**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"farcaster"`

      * **`walletAddress`**

        `string`

      - **`algorithm` (required)**

        `string`

      - **`credentialId` (required)**

        `string`

      - **`publicKey` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"passkey"`

      * **`email` (required)**

        `string`, format: `email`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"email"`

      - **`id` (required)**

        `string`

      - **`pregeneratedIdentifier` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"pre_generation"`

      * **`id` (required)**

        `string`

      * **`phone` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"phone"`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"siwe"`

      - **`walletAddress` (required)**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"guest"`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"backend"`

      * **`identifier` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"server"`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"custom_jwt"`

      - **`authProviderId`**

        `string`

      - **`email`**

        `string`

      - **`phone`**

        `string`

      - **`walletAddress`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"custom_auth_endpoint"`

      * **`authProviderId`**

        `string`

      * **`email`**

        `string`

      * **`phone`**

        `string`

      * **`walletAddress`**

        `string`

    - **`createdAt`**

      `string` — The date and time the wallet was created

    - **`smartWalletAddress`**

      `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced account features.

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    },
    "wallets": [
      {
        "address": "",
        "createdAt": "",
        "profiles": [
          {
            "email": "",
            "emailVerified": true,
            "familyName": "",
            "givenName": "",
            "hd": "",
            "id": "",
            "locale": "",
            "name": "",
            "picture": "",
            "type": "google"
          }
        ],
        "smartWalletAddress": ""
      }
    ]
  }
}
```

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 500 Internal server error. This may occur due to service unavailability or unexpected server errors.

### List User Wallets

- **Method:** `GET`
- **Path:** `/v1/wallets/user`
- **Tags:** Wallets

Get all user wallet details with filtering and pagination for your project.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Responses

##### Status: 200 Returns a list of user wallet addresses, smart wallet addresses, and auth details.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object` — Pagination information

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

  - **`wallets` (required)**

    `array` — Array of user wallets

    **Items:**

    - **`address` (required)**

      `string` — The EOA (Externally Owned Account) address of the wallet. This is the traditional wallet address.

    - **`profiles` (required)**

      `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

      **Items:**

      **Any of:**

      - **`email` (required)**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`hd` (required)**

        `string`

      - **`id` (required)**

        `string`

      - **`locale` (required)**

        `string`

      - **`picture` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"google"`

      - **`familyName`**

        `string`

      - **`givenName`**

        `string`

      - **`name`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"facebook"`

      * **`email`**

        `string`

      * **`firstName`**

        `string`

      * **`lastName`**

        `string`

      * **`name`**

        `string`

      * **`picture`**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`id` (required)**

        `string`

      - **`isPrivateEmail` (required)**

        `boolean`

      - **`type` (required)**

        `string`, possible values: `"apple"`

      - **`email`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"github"`

      * **`username` (required)**

        `string`

      * **`avatar`**

        `string | null`

      * **`name`**

        `string | null`

      - **`avatar` (required)**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"discord"`

      - **`username` (required)**

        `string`

      - **`email`**

        `string`, format: `email`

      * **`id` (required)**

        `string`

      * **`name` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"coinbase"`

      * **`avatar`**

        `string`

      - **`id` (required)**

        `string`

      - **`name` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"x"`

      - **`username` (required)**

        `string`

      * **`id` (required)**

        `string`

      * **`metadata` (required)**

        `object`

        - **`avatar` (required)**

          `object`

          - **`large`**

            `string`

          - **`medium`**

            `string`

          - **`small`**

            `string`

        - **`personaname`**

          `string`

        - **`profileurl`**

          `string`

        - **`realname`**

          `string`

      * **`type` (required)**

        `string`, possible values: `"steam"`

      * **`avatar`**

        `string`

      * **`username`**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"telegram"`

      - **`firstName`**

        `string`

      - **`lastName`**

        `string`

      - **`picture`**

        `string`

      - **`username`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"twitch"`

      * **`username` (required)**

        `string`

      * **`avatar`**

        `string`

      * **`description`**

        `string`

      * **`email`**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"line"`

      - **`avatar`**

        `string`

      - **`username`**

        `string`

      * **`fid` (required)**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"farcaster"`

      * **`walletAddress`**

        `string`

      - **`algorithm` (required)**

        `string`

      - **`credentialId` (required)**

        `string`

      - **`publicKey` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"passkey"`

      * **`email` (required)**

        `string`, format: `email`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"email"`

      - **`id` (required)**

        `string`

      - **`pregeneratedIdentifier` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"pre_generation"`

      * **`id` (required)**

        `string`

      * **`phone` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"phone"`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"siwe"`

      - **`walletAddress` (required)**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"guest"`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"backend"`

      * **`identifier` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"server"`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"custom_jwt"`

      - **`authProviderId`**

        `string`

      - **`email`**

        `string`

      - **`phone`**

        `string`

      - **`walletAddress`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"custom_auth_endpoint"`

      * **`authProviderId`**

        `string`

      * **`email`**

        `string`

      * **`phone`**

        `string`

      * **`walletAddress`**

        `string`

    - **`createdAt`**

      `string` — The date and time the wallet was created

    - **`smartWalletAddress`**

      `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced account features.

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    },
    "wallets": [
      {
        "address": "",
        "createdAt": "",
        "profiles": [
          {
            "email": "",
            "emailVerified": true,
            "familyName": "",
            "givenName": "",
            "hd": "",
            "id": "",
            "locale": "",
            "name": "",
            "picture": "",
            "type": "google"
          }
        ],
        "smartWalletAddress": ""
      }
    ]
  }
}
```

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 500 Internal server error. This may occur due to service unavailability or unexpected server errors.

### Get User Details

- **Method:** `GET`
- **Path:** `/v1/wallets/user/me`
- **Tags:** Wallets

Retrieves detailed user information for the authenticated user. This endpoint fetches user data including authentication details and linked accounts using the bearer token.

**Authentication**: This endpoint requires user authentication using the `Authorization: Bearer <jwt>` header.

#### Responses

##### Status: 200 User details retrieved successfully. Returns comprehensive user information including authentication details and linked accounts.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`address` (required)**

    `string` — The EOA (Externally Owned Account) address of the wallet. This is the traditional wallet address.

  - **`profiles` (required)**

    `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

    **Items:**

    **Any of:**

    - **`email` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`hd` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`locale` (required)**

      `string`

    - **`picture` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"google"`

    - **`familyName`**

      `string`

    - **`givenName`**

      `string`

    - **`name`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"facebook"`

    * **`email`**

      `string`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`name`**

      `string`

    * **`picture`**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`isPrivateEmail` (required)**

      `boolean`

    - **`type` (required)**

      `string`, possible values: `"apple"`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"github"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string | null`

    * **`name`**

      `string | null`

    - **`avatar` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"discord"`

    - **`username` (required)**

      `string`

    - **`email`**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`name` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"coinbase"`

    * **`avatar`**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"x"`

    - **`username` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`metadata` (required)**

      `object`

      - **`avatar` (required)**

        `object`

        - **`large`**

          `string`

        - **`medium`**

          `string`

        - **`small`**

          `string`

      - **`personaname`**

        `string`

      - **`profileurl`**

        `string`

      - **`realname`**

        `string`

    * **`type` (required)**

      `string`, possible values: `"steam"`

    * **`avatar`**

      `string`

    * **`username`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"telegram"`

    - **`firstName`**

      `string`

    - **`lastName`**

      `string`

    - **`picture`**

      `string`

    - **`username`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"twitch"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string`

    * **`description`**

      `string`

    * **`email`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"line"`

    - **`avatar`**

      `string`

    - **`username`**

      `string`

    * **`fid` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"farcaster"`

    * **`walletAddress`**

      `string`

    - **`algorithm` (required)**

      `string`

    - **`credentialId` (required)**

      `string`

    - **`publicKey` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"passkey"`

    * **`email` (required)**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"email"`

    - **`id` (required)**

      `string`

    - **`pregeneratedIdentifier` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"pre_generation"`

    * **`id` (required)**

      `string`

    * **`phone` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"phone"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"siwe"`

    - **`walletAddress` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"guest"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"backend"`

    * **`identifier` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"server"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"custom_jwt"`

    - **`authProviderId`**

      `string`

    - **`email`**

      `string`

    - **`phone`**

      `string`

    - **`walletAddress`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"custom_auth_endpoint"`

    * **`authProviderId`**

      `string`

    * **`email`**

      `string`

    * **`phone`**

      `string`

    * **`walletAddress`**

      `string`

  - **`createdAt`**

    `string` — The date and time the wallet was created

  - **`smartWalletAddress`**

    `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced account features.

**Example:**

```
{
  "result": {
    "address": "",
    "createdAt": "",
    "profiles": [
      {
        "email": "",
        "emailVerified": true,
        "familyName": "",
        "givenName": "",
        "hd": "",
        "id": "",
        "locale": "",
        "name": "",
        "picture": "",
        "type": "google"
      }
    ],
    "smartWalletAddress": ""
  }
}
```

##### Status: 401 Authentication required. The request must include a valid \`Authorization: Bearer \<jwt>\` header for user authentication.

##### Status: 404 User not found. The authenticated user does not exist or is not associated with any wallet in the system.

##### Status: 500 Internal server error. This may occur due to service unavailability, network connectivity issues, or unexpected server errors.

### Send Login Code

- **Method:** `POST`
- **Path:** `/v1/wallets/user/code`
- **Tags:** Login

Send email or phone code for creating or accessing a user wallet.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

**One of:**

- **`email` (required)**

  `string`, format: `email` — The email address to send the OTP code to

- **`type` (required)**

  `string`, possible values: `"email"` — Send code to email address

* **`phone` (required)**

  `string` — The phone number to send the OTP code to

* **`type` (required)**

  `string`, possible values: `"phone"` — Send code to phone number

**Example:**

```
{
  "type": "email",
  "email": "test@test.com"
}
```

#### Responses

##### Status: 200 OTP sent successfully

###### Content-Type: application/json

- **`success` (required)**

  `boolean`

**Example:**

```
{
  "success": true
}
```

##### Status: 400 Invalid request parameters

##### Status: 500 Internal server error

### Login with Code

- **Method:** `POST`
- **Path:** `/v1/wallets/user/code/verify`
- **Tags:** Login

Verify email or phone code for creating or accessing a user wallet.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

**One of:**

- **`code` (required)**

  `string` — The 6-digit OTP code sent to the email address

- **`email` (required)**

  `string`, format: `email` — The email address to verify

- **`type` (required)**

  `string`, possible values: `"email"` — Verify code for email address

* **`code` (required)**

  `string` — The 6-digit OTP code sent to the phone number

* **`phone` (required)**

  `string` — The phone number to verify

* **`type` (required)**

  `string`, possible values: `"phone"` — Verify code for phone number

**Example:**

```
{
  "type": "email",
  "email": "test@test.com",
  "code": "123456"
}
```

#### Responses

##### Status: 200 OTP verified successfully

###### Content-Type: application/json

- **`isNewUser` (required)**

  `boolean`

- **`token` (required)**

  `string`

- **`type` (required)**

  `string`

- **`walletAddress` (required)**

  `string`

**Example:**

```
{
  "isNewUser": true,
  "token": "",
  "type": "",
  "walletAddress": ""
}
```

##### Status: 400 Invalid OTP or request parameters

##### Status: 500 Internal server error

### Login with Generic Auth

- **Method:** `POST`
- **Path:** `/v1/wallets/user/generic-auth`
- **Tags:** Login

Authenticate user with generic authentication methods. Supports OpenID Connect (OIDC) JWT tokens or custom authentication payloads. To use this endpoint, you must first configure your authentication details in your project dashboard settings.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

**One of:**

- **`jwt` (required)**

  `string`

- **`type` (required)**

  `string`, possible values: `"jwt"`

* **`payload` (required)**

  `string`

* **`type` (required)**

  `string`, possible values: `"auth-payload"`

**Example:**

```
{
  "type": "jwt",
  "jwt": "<oidc-compliant-jwt>"
}
```

#### Responses

##### Status: 200 Authentication verified successfully

###### Content-Type: application/json

- **`isNewUser` (required)**

  `boolean`

- **`token` (required)**

  `string`

- **`type` (required)**

  `string`

- **`walletAddress` (required)**

  `string`

**Example:**

```
{
  "isNewUser": true,
  "token": "",
  "type": "",
  "walletAddress": ""
}
```

##### Status: 400 Invalid authentication data or request parameters

##### Status: 500 Internal server error

### Login with OAuth

- **Method:** `GET`
- **Path:** `/v1/wallets/user/oauth/{provider}`
- **Tags:** Login

Initiate OAuth flow for a given provider (google, apple, github, etc). Open this URL in a browser to begin authentication. After authentication, the user will be redirected to the redirect URL with an authResult parameter containing the user's wallet address and auth token.

#### Responses

##### Status: 400 Invalid request parameters

##### Status: 500 Internal server error

### Generate Passkey Challenge

- **Method:** `GET`
- **Path:** `/v1/wallets/user/passkey`
- **Tags:** Login

Generate passkey challenge for creating or accessing a user wallet.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Passkey challenge generated successfully

###### Content-Type: application/json

- **`challenge` (required)**

  `string` — Passkey challenge string

- **`serverVerificationId` (required)**

  `string` — Server verification ID for the passkey challenge

- **`type` (required)**

  `object` — Authentication type for passkey - either sign-up for new users or sign-in for existing users

**Example:**

```
{
  "serverVerificationId": "<serverVerificationId>",
  "challenge": "<challenge>",
  "type": "sign-up"
}
```

##### Status: 400 Invalid request parameters

##### Status: 500 Internal server error

### Login with Passkey

- **Method:** `POST`
- **Path:** `/v1/wallets/user/passkey/verify`
- **Tags:** Login

Verify passkey challenge for creating or accessing a user wallet.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

- **`authenticatorData` (required)**

  `string` — Authenticator data from the passkey response

- **`clientData` (required)**

  `string` — Client data from the passkey response

- **`credentialId` (required)**

  `string` — Credential ID from the passkey response

- **`serverVerificationId` (required)**

  `string` — Server verification ID from the challenge

- **`type` (required)**

  `object` — Authentication type for passkey - either sign-up for new users or sign-in for existing users

- **`credential`**

  `object` — Credential data for passkey registration

  - **`algorithm` (required)**

    `object` — Algorithm used for the credential

  - **`publicKey` (required)**

    `string` — Public key for the credential

- **`origin`**

  `string` — Origin of the request

- **`rpId`**

  `string` — Relying Party ID

- **`signature`**

  `string` — Signature for passkey sign in

- **`username`**

  `string` — Username for passkey registration

**Example:**

```
{
  "type": "sign-up",
  "authenticatorData": "",
  "credentialId": "",
  "serverVerificationId": "",
  "clientData": "",
  "origin": "",
  "rpId": "",
  "signature": "",
  "username": "",
  "credential": {
    "publicKey": "",
    "algorithm": "RS256"
  }
}
```

#### Responses

##### Status: 200 Passkey verified successfully

###### Content-Type: application/json

- **`isNewUser` (required)**

  `boolean`

- **`token` (required)**

  `string`

- **`type` (required)**

  `string`

- **`walletAddress` (required)**

  `string`

**Example:**

```
{
  "isNewUser": true,
  "token": "",
  "type": "",
  "walletAddress": ""
}
```

##### Status: 400 Invalid passkey or request parameters

##### Status: 500 Internal server error

### Pre-generate User Wallet

- **Method:** `POST`
- **Path:** `/v1/wallets/user/pregenerate`
- **Tags:** Login

Pre-generate a wallet for a user based on their authentication strategy. This endpoint creates a wallet in advance that can be claimed later when the user authenticates.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`type` (required)**

  `string`, possible values: `"google", "apple", "facebook", "discord", "email", "phone", "custom_auth_endpoint", "custom_jwt", "siwe"`

- **`email`**

  `string`

- **`phone`**

  `string`

- **`userId`**

  `string`

- **`walletAddress`**

  `string`

**Example:**

```
{
  "type": "email",
  "email": "test@test.com"
}
```

#### Responses

##### Status: 200 Successfully pre-generated a wallet for the user.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`address` (required)**

    `string` — The EOA (Externally Owned Account) address of the wallet. This is the traditional wallet address.

  - **`profiles` (required)**

    `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

    **Items:**

    **Any of:**

    - **`email` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`hd` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`locale` (required)**

      `string`

    - **`picture` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"google"`

    - **`familyName`**

      `string`

    - **`givenName`**

      `string`

    - **`name`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"facebook"`

    * **`email`**

      `string`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`name`**

      `string`

    * **`picture`**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`isPrivateEmail` (required)**

      `boolean`

    - **`type` (required)**

      `string`, possible values: `"apple"`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"github"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string | null`

    * **`name`**

      `string | null`

    - **`avatar` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"discord"`

    - **`username` (required)**

      `string`

    - **`email`**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`name` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"coinbase"`

    * **`avatar`**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"x"`

    - **`username` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`metadata` (required)**

      `object`

      - **`avatar` (required)**

        `object`

        - **`large`**

          `string`

        - **`medium`**

          `string`

        - **`small`**

          `string`

      - **`personaname`**

        `string`

      - **`profileurl`**

        `string`

      - **`realname`**

        `string`

    * **`type` (required)**

      `string`, possible values: `"steam"`

    * **`avatar`**

      `string`

    * **`username`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"telegram"`

    - **`firstName`**

      `string`

    - **`lastName`**

      `string`

    - **`picture`**

      `string`

    - **`username`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"twitch"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string`

    * **`description`**

      `string`

    * **`email`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"line"`

    - **`avatar`**

      `string`

    - **`username`**

      `string`

    * **`fid` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"farcaster"`

    * **`walletAddress`**

      `string`

    - **`algorithm` (required)**

      `string`

    - **`credentialId` (required)**

      `string`

    - **`publicKey` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"passkey"`

    * **`email` (required)**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"email"`

    - **`id` (required)**

      `string`

    - **`pregeneratedIdentifier` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"pre_generation"`

    * **`id` (required)**

      `string`

    * **`phone` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"phone"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"siwe"`

    - **`walletAddress` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"guest"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"backend"`

    * **`identifier` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"server"`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"custom_jwt"`

    - **`authProviderId`**

      `string`

    - **`email`**

      `string`

    - **`phone`**

      `string`

    - **`walletAddress`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"custom_auth_endpoint"`

    * **`authProviderId`**

      `string`

    * **`email`**

      `string`

    * **`phone`**

      `string`

    * **`walletAddress`**

      `string`

  - **`createdAt`**

    `string` — The date and time the wallet was created

  - **`smartWalletAddress`**

    `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced account features.

**Example:**

```
{
  "result": {
    "address": "",
    "createdAt": "",
    "profiles": [
      {
        "email": "",
        "emailVerified": true,
        "familyName": "",
        "givenName": "",
        "hd": "",
        "id": "",
        "locale": "",
        "name": "",
        "picture": "",
        "type": "google"
      }
    ],
    "smartWalletAddress": ""
  }
}
```

##### Status: 400 Invalid request. This may occur due to missing required fields based on the authentication strategy, invalid strategy, or malformed request data.

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 500 Internal server error. This may occur due to service unavailability or unexpected server errors.

### Generate SIWE Payload

- **Method:** `GET`
- **Path:** `/v1/wallets/user/siwe`
- **Tags:** Login

Generate SIWE payload for creating or accessing a user wallet.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 SIWE payload generated successfully

###### Content-Type: application/json

- **`address` (required)**

  `string` — The Ethereum address performing the signing

- **`domain` (required)**

  `string` — The domain requesting the signature

- **`expiration_time` (required)**

  `string` — The time when the signed authentication message is no longer valid

- **`invalid_before` (required)**

  `string` — The time when the signed authentication message will become valid

- **`issued_at` (required)**

  `string` — The time when the message was generated

- **`nonce` (required)**

  `string` — A randomized token used to prevent replay attacks

- **`statement` (required)**

  `string` — A human-readable ASCII assertion that the user will sign

- **`version` (required)**

  `string` — The current version of the SIWE Message

- **`chain_id`**

  `string` — The Chain ID to which the session is bound

- **`resources`**

  `array` — A list of information or references to information the user wishes to have resolved

  **Items:**

  `string`

- **`uri`**

  `string` — A URI referring to the resource that is the subject of the signing

**Example:**

```
{
  "domain": "",
  "address": "",
  "statement": "",
  "uri": "",
  "version": "",
  "chain_id": "",
  "nonce": "",
  "issued_at": "",
  "expiration_time": "",
  "invalid_before": "",
  "resources": [
    ""
  ]
}
```

##### Status: 400 Invalid request parameters

##### Status: 500 Internal server error

### Login with SIWE

- **Method:** `POST`
- **Path:** `/v1/wallets/user/siwe/verify`
- **Tags:** Login

Verify SIWE signature for creating or accessing a user wallet.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

- **`payload` (required)**

  `object` — SIWE (Sign-In with Ethereum) payload structure

  - **`address` (required)**

    `string` — The Ethereum address performing the signing

  - **`domain` (required)**

    `string` — The domain requesting the signature

  - **`expiration_time` (required)**

    `string` — The time when the signed authentication message is no longer valid

  - **`invalid_before` (required)**

    `string` — The time when the signed authentication message will become valid

  - **`issued_at` (required)**

    `string` — The time when the message was generated

  - **`nonce` (required)**

    `string` — A randomized token used to prevent replay attacks

  - **`statement` (required)**

    `string` — A human-readable ASCII assertion that the user will sign

  - **`version` (required)**

    `string` — The current version of the SIWE Message

  - **`chain_id`**

    `string` — The Chain ID to which the session is bound

  - **`resources`**

    `array` — A list of information or references to information the user wishes to have resolved

    **Items:**

    `string`

  - **`uri`**

    `string` — A URI referring to the resource that is the subject of the signing

- **`signature` (required)**

  `string` — The signature generated by signing the SIWE payload

**Example:**

```
{
  "signature": "<signature>",
  "payload": {
    "domain": "example.com",
    "address": "0x1234567890123456789012345678901234567890",
    "statement": "Sign in with Ethereum",
    "version": "1",
    "nonce": "1234567890",
    "issued_at": "2021-01-01T00:00:00Z",
    "expiration_time": "2021-01-01T00:00:00Z",
    "invalid_before": "2021-01-01T00:00:00Z",
    "uri": "https://example.com",
    "chain_id": "1",
    "resources": [
      "https://example.com"
    ]
  }
}
```

#### Responses

##### Status: 200 SIWE signature verified successfully

###### Content-Type: application/json

- **`isNewUser` (required)**

  `boolean`

- **`token` (required)**

  `string`

- **`type` (required)**

  `string`

- **`walletAddress` (required)**

  `string`

**Example:**

```
{
  "isNewUser": true,
  "token": "",
  "type": "",
  "walletAddress": ""
}
```

##### Status: 400 Invalid signature or request parameters

##### Status: 500 Internal server error

### List Transactions

- **Method:** `GET`
- **Path:** `/v1/transactions`
- **Tags:** Transactions

Retrieves a paginated list of transactions associated with the authenticated client. Results are sorted by creation date in descending order (most recent first). Supports filtering by wallet address and pagination controls.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Transactions retrieved successfully. Returns a paginated list of transactions with metadata including creation and confirmation timestamps.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

  - **`transactions` (required)**

    `array`

    **Items:**

    - **`batchIndex` (required)**

      `integer` — Index within transaction batch

    - **`cancelledAt` (required)**

      `string | null` — ISO timestamp when transaction was cancelled, if applicable

    - **`chainId` (required)**

      `string` — Blockchain network identifier as string

    - **`clientId` (required)**

      `string` — Client identifier that initiated the transaction

    - **`confirmedAt` (required)**

      `string | null` — ISO timestamp when transaction was confirmed on-chain

    - **`confirmedAtBlockNumber` (required)**

      `string | null` — Block number where transaction was confirmed

    - **`createdAt` (required)**

      `string` — ISO timestamp when transaction was created

    - **`errorMessage` (required)**

      `string | null` — Error message if transaction failed

    - **`from` (required)**

      `string | null` — Sender wallet address

    - **`id` (required)**

      `string` — Unique transaction identifier

    - **`status` (required)**

      `string | null` — Transaction status

    - **`transactionHash` (required)**

      `string | null` — On-chain transaction hash once confirmed

    - **`enrichedData`**

      `object` — Additional metadata and enriched transaction information

    - **`executionParams`**

      `object` — Parameters used for transaction execution

    - **`executionResult`**

      `object` — Result data from transaction execution

    - **`transactionParams`**

      `object` — Original transaction parameters and data

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    },
    "transactions": [
      {
        "batchIndex": 1,
        "cancelledAt": null,
        "chainId": "",
        "clientId": "",
        "confirmedAt": null,
        "confirmedAtBlockNumber": null,
        "createdAt": "",
        "enrichedData": null,
        "errorMessage": null,
        "executionParams": null,
        "executionResult": null,
        "from": null,
        "id": "",
        "transactionHash": null,
        "transactionParams": null,
        "status": null
      }
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when pagination parameters are out of range or wallet address format is invalid.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 500 Internal server error. This may occur due to engine connectivity issues, database unavailability, or unexpected server errors.

### Send Encoded Transactions

- **Method:** `POST`
- **Path:** `/v1/transactions`
- **Tags:** Transactions

Submits pre-encoded blockchain transactions with custom data payloads. This endpoint is for low-level transaction submission where you have already encoded the transaction data. For smart contract method calls, use /v1/contracts/write. For native token transfers, use /v1/wallets/send.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier where all transactions will be executed.

- **`from` (required)**

  `string` — The wallet address or ENS name that will send the transaction.

- **`transactions` (required)**

  `array` — Array of encoded blockchain transactions to execute. All transactions will use the same from address and chainId.

  **Items:**

  - **`data` (required)**

    `string` — Transaction data in hexadecimal format for contract interactions or custom payloads.

  - **`to` (required)**

    `string` — The target address or ENS name for the transaction.

  - **`value`**

    `string` — Amount of native token to send in wei (smallest unit). Use '0' or omit for non-value transactions.

**Example:**

```
{
  "chainId": 137,
  "from": "0x1234567890123456789012345678901234567890",
  "transactions": [
    {
      "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d43c67b8c8b3e9c6000000000000000000000000000000000000000000000000016345785d8a0000",
      "to": "0xA0b86a33E6411E3036C1C4c7E815D0a82e3F5fD6",
      "value": "0"
    }
  ]
}
```

#### Responses

##### Status: 200 Encoded transactions submitted successfully. Returns the transaction IDs for tracking and monitoring.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionIds` (required)**

    `array` — Array of unique identifiers for the submitted transactions. Use these to track transaction status.

    **Items:**

    `string`

**Example:**

```
{
  "result": {
    "transactionIds": [
      ""
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when transaction data is malformed, insufficient balance, or invalid encoded data.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 500 Internal server error. This may occur due to blockchain connectivity issues, gas estimation failures, or unexpected server errors.

### Get Transaction by ID

- **Method:** `GET`
- **Path:** `/v1/transactions/{transactionId}`
- **Tags:** Transactions

Retrieves detailed information about a specific transaction using its unique identifier. Returns comprehensive transaction data including execution status, blockchain details, and any associated metadata.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Transaction details retrieved successfully. Returns comprehensive transaction information including status, blockchain details, and execution metadata.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`batchIndex` (required)**

    `integer` — Index within transaction batch

  - **`cancelledAt` (required)**

    `string | null` — ISO timestamp when transaction was cancelled, if applicable

  - **`chainId` (required)**

    `string` — Blockchain network identifier as string

  - **`clientId` (required)**

    `string` — Client identifier that initiated the transaction

  - **`confirmedAt` (required)**

    `string | null` — ISO timestamp when transaction was confirmed on-chain

  - **`confirmedAtBlockNumber` (required)**

    `string | null` — Block number where transaction was confirmed

  - **`createdAt` (required)**

    `string` — ISO timestamp when transaction was created

  - **`errorMessage` (required)**

    `string | null` — Error message if transaction failed

  - **`from` (required)**

    `string | null` — Sender wallet address

  - **`id` (required)**

    `string` — Unique transaction identifier

  - **`status` (required)**

    `string | null` — Transaction status

  - **`transactionHash` (required)**

    `string | null` — On-chain transaction hash once confirmed

  - **`enrichedData`**

    `object` — Additional metadata and enriched transaction information

  - **`executionParams`**

    `object` — Parameters used for transaction execution

  - **`executionResult`**

    `object` — Result data from transaction execution

  - **`transactionParams`**

    `object` — Original transaction parameters and data

**Example:**

```
{
  "result": {
    "batchIndex": 1,
    "cancelledAt": null,
    "chainId": "",
    "clientId": "",
    "confirmedAt": null,
    "confirmedAtBlockNumber": null,
    "createdAt": "",
    "enrichedData": null,
    "errorMessage": null,
    "executionParams": null,
    "executionResult": null,
    "from": null,
    "id": "",
    "transactionHash": null,
    "transactionParams": null,
    "status": null
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the transaction ID format is invalid or malformed.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 404 Transaction not found. The specified transaction ID does not exist or is not associated with the authenticated client.

##### Status: 500 Internal server error. This may occur due to engine connectivity issues, database unavailability, or unexpected server errors.

### Swap Tokens

- **Method:** `POST`
- **Path:** `/v1/payments/swap`
- **Tags:** Payments

Swap one token for another using the optimal route available. You can specify a tokenIn amount (if exact='input') or tokenOut amount (if exact='output'), but not both. The corresponding output or input amount will be returned as the quote.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`from` (required)**

  `string` — The wallet address or ENS name that will execute the swap.

- **`tokenIn` (required)**

  `object`

  - **`address` (required)**

    `string` — The input token address to swap (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token)

  - **`chainId` (required)**

    `integer` — The blockchain network where the token is located

  - **`amount`**

    `string` — The amount of the input token to swap in wei.

  - **`maxAmount`**

    `string` — The maximum amount of the input token to swap in wei.

- **`tokenOut` (required)**

  `object`

  - **`address` (required)**

    `string` — The output token address to swap (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token)

  - **`chainId` (required)**

    `integer` — The blockchain network where the token is located

  - **`amount`**

    `string` — The amount of the output token to receive in wei.

  - **`minAmount`**

    `string` — The minimum amount of the output token to receive in wei.

- **`exact`**

  `string`, possible values: `"input", "output"`, default: `"input"` — Whether to swap the exact input or output amount

**Example:**

```
{
  "exact": "input",
  "tokenIn": {
    "address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "chainId": 42161,
    "amount": "100"
  },
  "tokenOut": {
    "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    "chainId": 42161,
    "minAmount": "80"
  },
  "from": "0xEfc38EF8C09535b25e364b6d1a7C406D3972f2A9"
}
```

#### Responses

##### Status: 200 Swap completed successfully. Returns the transaction used for the swap.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionIds` (required)**

    `array` — Payment transaction IDs that were executed

    **Items:**

    `string`

**Example:**

```
{
  "result": {
    "transactionIds": [
      ""
    ]
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 402 Payment required. Insufficient wallet balance to complete the purchase.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### Create Payment

- **Method:** `POST`
- **Path:** `/v1/payments`
- **Tags:** Payments

Create a payment to be executed. Users can complete the payment via hosted UI (link is returned), a transaction execution referencing the product ID, or embedded widgets with the product ID.

**Authentication**: This endpoint requires project authentication.

#### Request Body

##### Content-Type: application/json

- **`description` (required)**

  `string` — The description of the product

- **`name` (required)**

  `string` — The name of the product

- **`recipient` (required)**

  `string` — The wallet address or ENS name that will receive the payment for the product

- **`token` (required)**

  `object` — The token to purchase

  - **`address` (required)**

    `string` — The token address to purchase (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token)

  - **`amount` (required)**

    `string` — The amount of the token to purchase in wei.

  - **`chainId` (required)**

    `integer` — The blockchain network where the token is located

- **`imageUrl`**

  `string` — The URL of the product image

**Example:**

```
{
  "name": "Course",
  "description": "The complete javascript course",
  "imageUrl": "https://example.com/course.png",
  "token": {
    "address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "chainId": 42161,
    "amount": "100"
  },
  "recipient": "0xEfc38EF8C09535b25e364b6d1a7C406D3972f2A9"
}
```

#### Responses

##### Status: 200 Payment created successfully. Returns the ID and link to complete the payment.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`link` (required)**

    `string` — The link to purchase the product

  - **`productId` (required)**

    `string` — The product ID

**Example:**

```
{
  "result": {
    "productId": "",
    "link": ""
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 402 Payment required. Insufficient wallet balance to complete the purchase.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### Complete Payment

- **Method:** `POST`
- **Path:** `/v1/payments/{id}`
- **Tags:** Payments

Completes a payment using its default token and amount. If the user does not have sufficient funds in the product's default payment token a 402 status will be returned containing a link and raw quote for purchase fulfillment.

**Authentication**: This endpoint requires project authentication.

#### Request Body

##### Content-Type: application/json

- **`from` (required)**

  `string` — The wallet address or ENS name that will purchase the product.

**Example:**

```
{
  "from": "0xEfc38EF8C09535b25e364b6d1a7C406D3972f2A9"
}
```

#### Responses

##### Status: 200 Product purchased successfully. Returns the transaction used for the purchase.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionId` (required)**

    `string` — Transaction ID that was executed for your product purchase

**Example:**

```
{
  "result": {
    "transactionId": ""
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 402 Payment required. Insufficient wallet balance to complete the purchase.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### List Tokens

- **Method:** `GET`
- **Path:** `/v1/tokens`
- **Tags:** Tokens

Lists or search existing tokens based on the provided filters. Supports querying by chain ID, token address, symbol, and/or name.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Tokens returned successfully.

###### Content-Type: application/json

- **`pagination` (required)**

  `object`

  - **`hasMore`**

    `boolean` — Whether there are more items available

  - **`limit`**

    `number | null`, default: `20` — Number of items per page

  - **`page`**

    `number | null`, default: `1` — Current page number

  - **`totalCount`**

    `number` — Total number of items available

- **`tokens` (required)**

  `array`

  **Items:**

  - **`address` (required)**

    `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

  - **`chainId` (required)**

    `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

  - **`decimals` (required)**

    `number`

  - **`prices` (required)**

    `object` — Token price in different FIAT currencies.

  - **`symbol` (required)**

    `string`

  - **`iconUri`**

    `string`

**Example:**

```
{
  "pagination": {
    "hasMore": true,
    "limit": 20,
    "page": 1,
    "totalCount": 1
  },
  "tokens": [
    {
      "chainId": 1,
      "address": "",
      "decimals": 1,
      "symbol": "",
      "iconUri": "",
      "prices": {
        "USD": 1,
        "EUR": 0.84
      }
    }
  ]
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### Get Token Owners

- **Method:** `GET`
- **Path:** `/v1/tokens/{chainId}/{address}/owners`
- **Tags:** Tokens

Retrieves a paginated list of owners for a given ERC-20 token contract on a specific chain.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Token owners retrieved successfully. Returns owners with pagination information.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`owners` (required)**

    `array` — Array of token owners with amounts.

    **Items:**

    - **`address` (required)**

      `string` — Owner wallet address

    - **`amount` (required)**

      `string` — Token amount owned as a string

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number` — Total number of items available

**Example:**

```
{
  "result": {
    "owners": [
      {
        "address": "",
        "amount": ""
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": 1
    }
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or x-secret-key for backend usage.

##### Status: 404 Token not found or no owners available.

##### Status: 500 Internal server error.
