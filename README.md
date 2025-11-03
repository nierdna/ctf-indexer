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

