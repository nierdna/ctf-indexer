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

    // Validate required environment variables
    if (!config.rpcUrl || config.rpcUrl.includes('${')) {
      throw new Error('RPC_URL environment variable is required. Set it in .env file.');
    }

    // Create indexer with ABI
    logger.info('🚀 Initializing indexer...');
    const indexer = new GenericIndexer({ ...config, abi });

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

