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

