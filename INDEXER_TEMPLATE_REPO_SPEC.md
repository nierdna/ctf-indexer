# 📋 INDEXER TEMPLATE REPOSITORY - SPECIFICATION

> **Template Name**: `indexer-template`  
> **Purpose**: GitHub template repository để developers nhanh chóng tạo indexer cho bất kỳ EVM contract nào  
> **Core Package**: `@lynx-core/indexer`  
> **Time to Deploy**: 5-10 minutes

---

## 🎯 OVERVIEW

Template repository này cho phép developers:
1. Click "Use this template" trên GitHub
2. Customize 1-2 files (config + ABI)
3. Deploy indexer cho contract của họ

**No code required** - chỉ cần config!

---

## 🏗️ REPOSITORY STRUCTURE

```
indexer-template/
├── src/
│   └── index.ts                    # Entry point (minimal - 10 lines)
├── config/
│   └── config.yaml                 # Main configuration (TEMPLATE)
├── abi/
│   └── YourContract.json           # Contract ABI (PLACEHOLDER)
├── docker/
│   ├── Dockerfile                  # Container image
│   └── docker-compose.yml          # Local development
├── .env.example                    # Environment variables template
├── .gitignore
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── README.md                       # Comprehensive setup guide
├── CUSTOMIZATION_GUIDE.md          # Step-by-step guide
└── LICENSE
```

---

## 📝 FILE CONTENTS

### `package.json`

```json
{
  "name": "my-indexer",
  "version": "1.0.0",
  "description": "Blockchain event indexer powered by @lynx-core/indexer",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "docker:build": "docker build -t my-indexer -f docker/Dockerfile .",
    "docker:up": "docker-compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker-compose -f docker/docker-compose.yml down",
    "docker:logs": "docker-compose -f docker/docker-compose.yml logs -f indexer",
    "test": "echo \"Add your tests here\" && exit 0"
  },
  "keywords": [
    "blockchain",
    "indexer",
    "ethereum",
    "events"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@lynx-core/indexer": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### `src/index.ts`

```typescript
/**
 * 🚀 Indexer Entry Point
 * 
 * This file initializes and starts your indexer.
 * In most cases, you DON'T need to modify this file.
 * 
 * Customization is done via:
 * - config/config.yaml (configuration)
 * - abi/YourContract.json (contract ABI)
 */

import { GenericIndexer, loadConfigFromFile, logger } from '@lynx-core/indexer';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  try {
    // Load configuration
    const configPath = process.env.CONFIG_PATH || path.join(__dirname, '../config/config.yaml');
    logger.info(`Loading config from: ${configPath}`);
    
    const config = loadConfigFromFile(configPath);

    // Load ABI
    const abiPath = process.env.ABI_PATH || path.join(__dirname, '../abi/YourContract.json');
    logger.info(`Loading ABI from: ${abiPath}`);
    
    if (!fs.existsSync(abiPath)) {
      throw new Error(`ABI file not found: ${abiPath}. Please add your contract ABI.`);
    }
    
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
    config.abi = abi;

    // Validate required environment variables
    if (!config.rpcUrl || config.rpcUrl.includes('${')) {
      throw new Error('RPC_URL environment variable is required. Set it in .env file.');
    }

    // Create indexer
    logger.info('🚀 Initializing indexer...');
    const indexer = new GenericIndexer(config);

    // Start indexer
    await indexer.start();
    
    logger.info('✅ Indexer is running');

  } catch (error) {
    const errorMessage = error instanceof Error ? (error.stack || error.message) : String(error);
    logger.error(`❌ Failed to start indexer: ${errorMessage}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start
main();
```

---

### `config/config.yaml`

```yaml
# ========================================
# 🔧 INDEXER CONFIGURATION
# ========================================
# This is a TEMPLATE file. Please customize for your contract.
# See CUSTOMIZATION_GUIDE.md for detailed instructions.

# ========================================
# SERVICE INFORMATION
# ========================================
serviceName: my-indexer
# Description: Unique name for your indexer service
# Example: exchange-indexer, nft-indexer, defi-indexer

contractName: YourContract
# Description: Name of the smart contract you're indexing
# Example: CTFExchange, UniswapV2Router, BoredApeYachtClub

contractAddress: "0x0000000000000000000000000000000000000000"
# Description: Deployed contract address (checksummed)
# ⚠️ REQUIRED: Replace with your actual contract address
# Example: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E"

# ========================================
# BLOCKCHAIN NETWORK
# ========================================
chainId: 1
# Description: EVM chain ID
# Examples:
#   1       = Ethereum Mainnet
#   5       = Goerli Testnet
#   137     = Polygon Mainnet
#   80001   = Polygon Mumbai
#   56      = BSC Mainnet
#   97      = BSC Testnet
#   42161   = Arbitrum One
#   10      = Optimism
#   8453    = Base Mainnet
#   84532   = Base Sepolia

network: mainnet
# Description: Network name (human-readable)
# Examples: mainnet, goerli, polygon, bsc, arbitrum, optimism, base-sepolia

startBlock: 0
# Description: Block number to start indexing from
# ⚠️ REQUIRED: Set to your contract deployment block
# Tip: Find on Etherscan (Contract > Contract Creation)
# Example: 18000000

# ========================================
# RPC CONFIGURATION
# ========================================
rpcUrl: ${RPC_URL}
# Description: WebSocket RPC endpoint (required for real-time events)
# ⚠️ REQUIRED: Set RPC_URL in .env file
# Examples:
#   - wss://mainnet.infura.io/ws/v3/YOUR_KEY
#   - wss://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
#   - wss://base-sepolia.g.alchemy.com/v2/YOUR_KEY

fallbackRpcUrls: []
# Description: Fallback RPC URLs (optional, for high availability)
# Example:
#   - wss://mainnet.infura.io/ws/v3/BACKUP_KEY
#   - wss://eth-mainnet.g.alchemy.com/v2/BACKUP_KEY

# ========================================
# EVENTS TO INDEX
# ========================================
events:
  - Transfer
  - Approval
# Description: List of event names from your contract ABI
# ⚠️ REQUIRED: Replace with actual events from your contract
# Examples:
#   DeFi: Swap, Mint, Burn, Deposit, Withdraw
#   NFT: Transfer, Approval, ApprovalForAll
#   Governance: ProposalCreated, VoteCast, ProposalExecuted
#   CTF: OrderFilled, OrdersMatched, TokenRegistered

# ========================================
# DATABASE CONFIGURATION (MongoDB)
# ========================================
database:
  uri: ${MONGODB_URI:-mongodb://mongo:27017}
  # Description: MongoDB connection string
  # Default: mongodb://mongo:27017 (for Docker)
  # Production: mongodb://username:password@host:27017
  
  dbName: my_indexer_db
  # Description: Database name (will be created if not exists)
  # ⚠️ RECOMMENDED: Change to match your service name
  # Example: exchange_indexer, nft_indexer
  
  collections:
    events: events
    # Description: Collection name for events
    syncStatus: sync_status
    # Description: Collection name for sync status
    priorityQueue: priority_transactions
    # Description: Collection name for priority transactions

# ========================================
# MESSAGE QUEUE / PUBLISHER (Optional)
# ========================================
publisher:
  type: rabbitmq
  # Description: Publisher type
  # Options: 'rabbitmq', 'webhook', 'none'
  # - rabbitmq: Publish to RabbitMQ exchange (for distributed systems)
  # - webhook: HTTP POST to external endpoint
  # - none: Skip publishing (database only)
  
  url: ${RABBITMQ_URL:-amqp://rabbitmq:5672}
  # Description: RabbitMQ connection URL (if type = rabbitmq)
  # Default: amqp://rabbitmq:5672 (for Docker)
  
  exchange: blockchain-events
  # Description: RabbitMQ exchange name
  
  retries: 3
  # Description: Number of retry attempts for failed publishes
  
  timeout: 5000
  # Description: Timeout in milliseconds for publish operations

# Alternative: Webhook publisher
# publisher:
#   type: webhook
#   url: https://your-api.com/events
#   retries: 3
#   timeout: 5000

# Alternative: No publisher (database only)
# publisher:
#   type: none

# ========================================
# FEATURE FLAGS
# ========================================
priorityLane: true
# Description: Enable priority lane for fast-track transactions
# - true: Enable POST /transactions/priority endpoint
# - false: Disable priority lane (use only real-time subscription)
# Use case: Critical transactions that need sub-second indexing

crawler: true
# Description: Enable background crawler for gap detection
# - true: Auto-detect and backfill missing events
# - false: Rely only on real-time subscription
# Recommended: true (for production reliability)

crawlerInterval: 60000
# Description: Crawler interval in milliseconds
# Examples:
#   30000  = 30 seconds (fast chains: Polygon, BSC)
#   60000  = 1 minute (Ethereum, Base)
#   120000 = 2 minutes (low-activity contracts)

# ========================================
# PERFORMANCE TUNING
# ========================================
polling:
  interval: 500
  # Description: Priority lane polling interval (ms)
  # Lower = faster indexing, higher RPC usage
  # Range: 200-1000ms
  
  batchSize: 5000
  # Description: Max blocks to query in single request
  # Adjust based on RPC provider limits
  # Range: 1000-10000

# ========================================
# MONITORING & METRICS
# ========================================
metrics:
  enabled: true
  # Description: Enable metrics endpoint
  # Exposes: GET /metrics
  
  port: 9090
  # Description: Metrics server port (if different from API)
  # Usually same as API port (3000)
```

---

### `.env.example`

```bash
# ========================================
# 🔐 ENVIRONMENT VARIABLES
# ========================================
# Copy this file to .env and fill in your values
# DO NOT commit .env to git!

# ========================================
# RPC ENDPOINT (REQUIRED)
# ========================================
# WebSocket RPC URL for blockchain connection
# Get free key from: Alchemy, Infura, QuickNode, or Ankr
RPC_URL=wss://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE

# Examples:
# Ethereum Mainnet (Alchemy):
# RPC_URL=wss://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Ethereum Mainnet (Infura):
# RPC_URL=wss://mainnet.infura.io/ws/v3/YOUR_KEY

# Base Sepolia (Alchemy):
# RPC_URL=wss://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Polygon Mainnet:
# RPC_URL=wss://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# ========================================
# DATABASE (MongoDB)
# ========================================
# Local development (Docker):
MONGODB_URI=mongodb://mongo:27017

# Production example:
# MONGODB_URI=mongodb://username:password@your-mongo-host:27017/your-db?authSource=admin

# MongoDB Atlas example:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-db

# ========================================
# MESSAGE QUEUE (Optional)
# ========================================
# RabbitMQ URL (if using publisher type: rabbitmq)
RABBITMQ_URL=amqp://rabbitmq:5672

# Production example:
# RABBITMQ_URL=amqp://username:password@your-rabbitmq-host:5672

# ========================================
# API SERVER
# ========================================
# Port for REST API endpoints
PORT=3000

# ========================================
# LOGGING
# ========================================
# Log level: trace, debug, info, warn, error, fatal
LOG_LEVEL=info

# ========================================
# OPTIONAL: Custom Paths
# ========================================
# Override default config/ABI paths if needed
# CONFIG_PATH=/custom/path/to/config.yaml
# ABI_PATH=/custom/path/to/abi.json
```

---

### `abi/YourContract.json`

```json
[
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  }
]
```

**Note**: This is a placeholder ERC20 ABI. Users will replace this with their actual contract ABI.

---

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### `docker/Dockerfile`

```dockerfile
# ========================================
# Multi-stage Dockerfile for Indexer
# ========================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy config and ABI
COPY config ./config
COPY abi ./abi

# Create non-root user
RUN addgroup -g 1001 -S indexer && \
    adduser -S indexer -u 1001

USER indexer

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose API port
EXPOSE 3000

# Start indexer
CMD ["node", "dist/index.js"]
```

---

### `docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  # ========================================
  # MongoDB Database
  # ========================================
  mongo:
    image: mongo:6
    container_name: indexer-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: my_indexer_db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # ========================================
  # RabbitMQ Message Queue (Optional)
  # ========================================
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: indexer-rabbitmq
    restart: unless-stopped
    ports:
      - "5672:5672"   # AMQP port
      - "15672:15672" # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 10s
      timeout: 5s
      retries: 5

  # ========================================
  # Indexer Service
  # ========================================
  indexer:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: my-indexer
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      mongo:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    environment:
      # RPC Configuration
      RPC_URL: ${RPC_URL}
      
      # Database
      MONGODB_URI: mongodb://mongo:27017
      
      # Message Queue
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
      
      # API
      PORT: 3000
      
      # Logging
      LOG_LEVEL: ${LOG_LEVEL:-info}
      
      # Node.js
      NODE_ENV: production
    volumes:
      # Mount config for easy updates without rebuild
      - ../config:/app/config:ro
      - ../abi:/app/abi:ro
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      start_period: 60s
      retries: 3

volumes:
  mongo_data:
    driver: local
  rabbitmq_data:
    driver: local

# ========================================
# Networks (optional)
# ========================================
networks:
  default:
    name: indexer-network
```

---

### `.gitignore`

```gitignore
# Dependencies
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock

# Build output
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pino-*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Docker
*.log
docker-compose.override.yml

# Temp files
tmp/
temp/
*.tmp
```

---

## 📖 README.md

```markdown
# My Indexer

> Blockchain event indexer powered by [@lynx-core/indexer](https://github.com/lynx-core/indexer)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Docker
- MongoDB (or use Docker Compose)
- RPC endpoint (Alchemy, Infura, QuickNode)

### Option 1: Docker (Recommended)

```bash
# 1. Clone/setup repository
git clone <your-repo>
cd my-indexer

# 2. Configure environment
cp .env.example .env
# Edit .env and set your RPC_URL

# 3. Customize config
# Edit config/config.yaml:
#   - contractAddress: your contract address
#   - startBlock: deployment block number
#   - events: list of events to index

# 4. Add your contract ABI
# Replace abi/YourContract.json with your actual ABI

# 5. Start services
docker-compose -f docker/docker-compose.yml up -d

# 6. Check logs
docker-compose -f docker/docker-compose.yml logs -f indexer

# 7. Verify health
curl http://localhost:3000/health
```

### Option 2: Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your settings

# 3. Customize config & ABI (same as Docker)

# 4. Start MongoDB & RabbitMQ
# (Use Docker Compose or local installation)

# 5. Run in development mode
pnpm dev

# Or build and run
pnpm build
pnpm start
```

## 📝 Customization

See [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md) for detailed instructions.

### Essential Changes

1. **config/config.yaml**
   - `contractAddress`: Your contract address
   - `startBlock`: Contract deployment block
   - `events`: Events to index
   - `serviceName`: Unique service name

2. **abi/YourContract.json**
   - Replace with your contract ABI

3. **.env**
   - `RPC_URL`: Your WebSocket RPC endpoint

That's it! No code changes needed.

## 🔌 API Endpoints

### Health Check
```bash
GET http://localhost:3000/health
```

### Query Events
```bash
GET http://localhost:3000/events?fromBlock=18000000&limit=100
```

### Priority Transaction (Fast-track)
```bash
POST http://localhost:3000/transactions/priority
Content-Type: application/json

{
  "txHash": "0xabc...",
  "context": { "priority": "high" }
}
```

### Metrics
```bash
GET http://localhost:3000/metrics
```

## 📊 Monitoring

### View Logs
```bash
# Docker
docker-compose -f docker/docker-compose.yml logs -f indexer

# Local
pnpm dev
```

### Access Services

- **Indexer API**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)

### Health Check
```bash
curl http://localhost:3000/health | jq
```

## 🛠️ Configuration

All configuration is in `config/config.yaml`. No code changes needed!

Key sections:
- **Service Info**: serviceName, contractName, contractAddress
- **Network**: chainId, network, startBlock
- **RPC**: rpcUrl, fallbackRpcUrls
- **Events**: List of events to index
- **Database**: MongoDB settings
- **Publisher**: RabbitMQ/Webhook/None
- **Features**: priorityLane, crawler
- **Performance**: polling interval, batch size

See comments in config.yaml for detailed explanations.

## 🐛 Troubleshooting

### Indexer not starting
1. Check RPC_URL is valid WebSocket endpoint
2. Verify MongoDB is running: `docker ps`
3. Check logs: `docker-compose logs indexer`

### No events being indexed
1. Verify contract address is correct
2. Check startBlock is before contract deployment
3. Verify events exist in contract ABI
4. Check RPC endpoint has archive access (if startBlock is old)

### High sync lag
1. Increase polling.batchSize in config
2. Use faster RPC endpoint
3. Check network connectivity
4. Reduce crawlerInterval

## 📚 Documentation

- **Core Package**: [@lynx-core/indexer docs](https://github.com/lynx-core/indexer)
- **Customization**: [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md)
- **API Reference**: See core package README

## 🤝 Support

- Open an issue: [GitHub Issues](https://github.com/your-repo/issues)
- Core package issues: [Lynx Indexer Issues](https://github.com/lynx-core/indexer/issues)

## 📄 License

MIT
```

---

## 📖 CUSTOMIZATION_GUIDE.md

```markdown
# 📝 Customization Guide

This guide walks you through customizing the indexer for your specific contract.

## ⏱️ Time Required: 5-10 minutes

---

## Step 1: Get Contract Information

### What you need:

1. **Contract Address**
   - Find on Etherscan/Basescan
   - Example: `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E`

2. **Deployment Block Number**
   - Go to contract on Etherscan
   - Click "Contract" tab → Find "Contract Creation"
   - Copy block number
   - Example: `18000000`

3. **Contract ABI**
   - On Etherscan, go to "Contract" tab
   - Scroll to "Contract ABI"
   - Click "Copy ABI to clipboard"

4. **Events to Index**
   - Review contract ABI
   - Note event names you want to index
   - Example: `Transfer`, `Approval`, `Swap`

---

## Step 2: Update Configuration

### 2.1 Edit `config/config.yaml`

```yaml
# Change these lines:

serviceName: my-exchange-indexer    # ← Your service name
contractName: CTFExchange           # ← Your contract name
contractAddress: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E"  # ← Your address

chainId: 84532                      # ← Your chain ID
network: base-sepolia               # ← Your network
startBlock: 17090039                # ← Deployment block

events:                             # ← Events to index
  - OrderFilled
  - OrdersMatched
  - OrderCancelled
  - TokenRegistered

database:
  dbName: exchange_indexer          # ← Database name (matches serviceName)
```

### 2.2 Chain IDs Reference

```yaml
1       # Ethereum Mainnet
5       # Goerli Testnet
11155111 # Sepolia Testnet
137     # Polygon Mainnet
80001   # Polygon Mumbai
56      # BSC Mainnet
97      # BSC Testnet
42161   # Arbitrum One
421613  # Arbitrum Goerli
10      # Optimism
420     # Optimism Goerli
8453    # Base Mainnet
84532   # Base Sepolia
```

---

## Step 3: Add Contract ABI

### 3.1 Replace `abi/YourContract.json`

1. Delete the placeholder file:
   ```bash
   rm abi/YourContract.json
   ```

2. Create new ABI file (use your contract name):
   ```bash
   touch abi/CTFExchange.json
   ```

3. Paste your ABI from Etherscan:
   ```bash
   # Open in editor
   nano abi/CTFExchange.json
   # or
   code abi/CTFExchange.json
   ```

4. Paste the ABI JSON and save

### 3.2 Verify ABI Format

Your ABI should look like:
```json
[
  {
    "anonymous": false,
    "inputs": [...],
    "name": "EventName",
    "type": "event"
  },
  ...
]
```

---

## Step 4: Setup Environment Variables

### 4.1 Create `.env` file

```bash
cp .env.example .env
```

### 4.2 Get RPC URL

**Free Options:**

1. **Alchemy** (Recommended)
   - Sign up: https://alchemy.com
   - Create app for your chain
   - Copy WebSocket URL
   - Format: `wss://base-sepolia.g.alchemy.com/v2/YOUR_KEY`

2. **Infura**
   - Sign up: https://infura.io
   - Create project
   - Copy WebSocket URL
   - Format: `wss://mainnet.infura.io/ws/v3/YOUR_KEY`

3. **QuickNode**
   - Sign up: https://quicknode.com
   - Create endpoint
   - Copy WebSocket URL

### 4.3 Update `.env`

```bash
# Edit .env file
RPC_URL=wss://base-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE

# Optional: Change log level
LOG_LEVEL=info
```

**⚠️ Important**: RPC_URL must be WebSocket (`wss://`), not HTTP!

---

## Step 5: Test Configuration

### 5.1 Validate Config

```bash
# Check syntax
cat config/config.yaml

# Verify ABI is valid JSON
cat abi/YourContract.json | jq . > /dev/null && echo "✅ Valid JSON"
```

### 5.2 Test RPC Connection

```bash
# Test WebSocket connection
wscat -c "wss://your-rpc-url"
# Should connect successfully
```

---

## Step 6: Deploy

### Option A: Docker (Recommended)

```bash
# Start services
docker-compose -f docker/docker-compose.yml up -d

# Check logs
docker-compose -f docker/docker-compose.yml logs -f indexer

# Verify health
curl http://localhost:3000/health
```

### Option B: Local

```bash
# Install dependencies
pnpm install

# Run development mode
pnpm dev

# Or build and run production
pnpm build
pnpm start
```

---

## Step 7: Verify Indexing

### 7.1 Check Health

```bash
curl http://localhost:3000/health | jq
```

Expected response:
```json
{
  "service": "my-exchange-indexer",
  "status": "healthy",
  "sync": {
    "lastBlock": 17090100,
    "currentBlock": 17090110,
    "lag": 10
  }
}
```

### 7.2 Query Events

```bash
# Get recent events
curl "http://localhost:3000/events?limit=10" | jq

# Get specific event type
curl "http://localhost:3000/events?eventName=Transfer&limit=10" | jq

# Get events in block range
curl "http://localhost:3000/events?fromBlock=17090000&toBlock=17091000" | jq
```

### 7.3 Check Database

```bash
# Connect to MongoDB
docker exec -it indexer-mongo mongosh

# Switch to your database
use exchange_indexer

# Count events
db.events.countDocuments()

# View sample events
db.events.find().limit(5)

# Check sync status
db.sync_status.findOne()
```

---

## Advanced Configuration

### Publisher Options

#### Disable Publisher (Database only)
```yaml
publisher:
  type: none
```

#### Webhook Publisher
```yaml
publisher:
  type: webhook
  url: https://your-api.com/events
  retries: 3
  timeout: 5000
```

#### RabbitMQ Publisher (Default)
```yaml
publisher:
  type: rabbitmq
  url: amqp://rabbitmq:5672
  exchange: blockchain-events
```

### Performance Tuning

#### Fast Chain (Polygon, BSC)
```yaml
crawlerInterval: 30000      # 30 seconds
polling:
  interval: 300             # 300ms
  batchSize: 10000
```

#### Slow Chain (Ethereum)
```yaml
crawlerInterval: 120000     # 2 minutes
polling:
  interval: 1000            # 1 second
  batchSize: 5000
```

#### High-Volume Contract
```yaml
polling:
  batchSize: 2000           # Smaller batches
crawlerInterval: 30000      # More frequent crawls
```

### Multiple Indexers

To run multiple indexers, duplicate the template for each contract:

```bash
# Exchange indexer
my-exchange-indexer/
  config/config.yaml        # Exchange config
  abi/CTFExchange.json

# NFT indexer
my-nft-indexer/
  config/config.yaml        # NFT config
  abi/NFTContract.json
```

Each runs independently with its own database.

---

## Troubleshooting

### "ABI file not found"
- Check file path: `abi/YourContract.json` exists
- Verify it's valid JSON

### "RPC_URL environment variable is required"
- Check `.env` file exists
- Verify `RPC_URL` is set
- Use `wss://` not `https://`

### "Chain ID mismatch"
- Verify `chainId` in config matches RPC endpoint
- Example: Base Sepolia = 84532

### "No events being indexed"
- Check `startBlock` is correct
- Verify events exist in ABI
- Ensure contract has emitted events
- Check RPC has archive access for old blocks

### High sync lag
- Use faster RPC provider
- Increase `polling.batchSize`
- Reduce `crawlerInterval`

---

## Next Steps

✅ Indexer is running!

Now you can:

1. **Monitor**: Check `/health` and `/metrics` endpoints
2. **Query**: Use `/events` API to fetch indexed data
3. **Integrate**: Connect your application to MongoDB or consume events from RabbitMQ
4. **Scale**: Deploy to production (Kubernetes, AWS, etc.)

---

## Need Help?

- 📖 Core package docs: [@lynx-core/indexer](https://github.com/lynx-core/indexer)
- 🐛 Report issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Community: [Discord](https://discord.gg/your-server)
```

---

## 🚀 GITHUB REPOSITORY SETUP

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `indexer-template`
3. Description: "Template repository for blockchain event indexers powered by @lynx-core/indexer"
4. Public/Private: Public (recommended for templates)
5. **✅ Check "Template repository"** (important!)
6. Click "Create repository"

### Step 2: Initialize Repository

```bash
# Clone or initialize
git clone <your-repo-url>
cd indexer-template

# Create structure
mkdir -p src config abi docker

# Add files (copy from specification above)
# ... add all files ...

# Git setup
git add .
git commit -m "Initial template setup"
git push origin main
```

### Step 3: Configure Template Settings

1. Go to repository Settings
2. Scroll to "Template repository"
3. Check "Template repository"
4. Save

### Step 4: Add Topics/Tags

Add these topics to your repository:
- `blockchain`
- `indexer`
- `ethereum`
- `template`
- `evm`
- `web3`
- `events`
- `mongodb`

---

## 📋 REPOSITORY README.md (For Template Repo)

```markdown
# 🚀 Blockchain Indexer Template

> Production-ready template for indexing EVM blockchain events. Powered by [@lynx-core/indexer](https://github.com/lynx-core/indexer)

[![Use this template](https://img.shields.io/badge/Use%20this%20template-2ea44f?style=for-the-badge)](https://github.com/lynx-core/indexer-template/generate)

## ⚡ Quick Start (5 minutes)

1. **Click "Use this template" above**
2. **Customize 3 files**:
   - `config/config.yaml` (contract info)
   - `abi/YourContract.json` (contract ABI)
   - `.env` (RPC endpoint)
3. **Deploy**: `docker-compose up -d`

✅ Done! Your indexer is running.

## 🌟 Features

- ✅ **Zero Code Required** - Configuration only
- ✅ **Real-time Events** - Sub-second latency
- ✅ **Auto Gap Detection** - Never miss events
- ✅ **Priority Lane** - Fast-track critical transactions
- ✅ **Production Ready** - Docker, monitoring, health checks
- ✅ **Type Safe** - Full TypeScript support

## 📦 What's Included

```
✓ Generic indexer powered by @lynx-core/indexer
✓ Docker Compose setup (MongoDB + RabbitMQ + Indexer)
✓ REST API for querying events
✓ Health monitoring & metrics
✓ Detailed customization guide
✓ Production-ready configuration
```

## 📖 Documentation

- **[Quick Start Guide](./README.md)** - Get started in 5 minutes
- **[Customization Guide](./CUSTOMIZATION_GUIDE.md)** - Detailed setup instructions
- **[Core Package Docs](https://github.com/lynx-core/indexer)** - Full feature documentation

## 🎯 Supported Use Cases

✅ DeFi Protocols (DEX, Lending, Staking)  
✅ NFT Collections & Marketplaces  
✅ Token Contracts (ERC20, ERC721, ERC1155)  
✅ DAOs & Governance  
✅ Gaming & Metaverse  
✅ Bridges & Cross-chain  
✅ Any EVM-compatible contract

## 🛠️ Tech Stack

- **Core**: [@lynx-core/indexer](https://github.com/lynx-core/indexer)
- **Runtime**: Node.js 20+ / TypeScript 5+
- **Database**: MongoDB 6+
- **Message Queue**: RabbitMQ 3+ (optional)
- **Deployment**: Docker / Kubernetes ready

## 📸 Screenshots

### Health Check
```json
{
  "service": "my-indexer",
  "status": "healthy",
  "sync": { "lastBlock": 18500000, "lag": 5 }
}
```

### Event Query
```json
{
  "events": [
    {
      "eventName": "Transfer",
      "args": { "from": "0x...", "to": "0x...", "value": "1000" },
      "blockNumber": 18500000,
      "timestamp": 1698768000
    }
  ]
}
```

## 🚀 Deploy to Production

### Docker
```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Kubernetes
See [deployment examples](./examples/kubernetes.yaml)

### Cloud Platforms
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

## 🤝 Contributing

Found a bug or have a suggestion? [Open an issue](https://github.com/lynx-core/indexer-template/issues)

## 📄 License

MIT

---

**Made with ❤️ by [Your Team]**
```

---

## ✅ TESTING CHECKLIST

Before publishing template:

- [ ] All files created with correct content
- [ ] package.json has correct dependencies
- [ ] Docker builds successfully: `docker build -f docker/Dockerfile .`
- [ ] Docker Compose starts: `docker-compose -f docker/docker-compose.yml up`
- [ ] Health endpoint works: `curl http://localhost:3000/health`
- [ ] Template repository setting enabled on GitHub
- [ ] README clear and comprehensive
- [ ] CUSTOMIZATION_GUIDE detailed and tested
- [ ] .env.example has all required variables
- [ ] .gitignore excludes sensitive files
- [ ] Example ABI is valid JSON
- [ ] TypeScript compiles without errors: `tsc --noEmit`

---

## 🎯 USER FLOW

### Developer Perspective

1. **Discovery**: Find template on GitHub
2. **Use Template**: Click button → Create new repo
3. **Clone**: `git clone my-indexer`
4. **Customize**:
   - Edit config.yaml (5 mins)
   - Add contract ABI (copy-paste)
   - Set RPC_URL in .env
5. **Deploy**: `docker-compose up -d` (1 min)
6. **Verify**: `curl localhost:3000/health`
7. **Use**: Query events via API

**Total Time**: 10 minutes from template to running indexer!

---

## 📊 SUCCESS METRICS

Template is successful if users can:
- ✅ Deploy indexer in <10 minutes
- ✅ No code changes required
- ✅ Clear error messages guide them
- ✅ Health check shows "healthy"
- ✅ Events are being indexed
- ✅ API returns expected data

---

**Generated**: 2025-11-02  
**Version**: 1.0.0  
**Status**: Ready for Implementation

