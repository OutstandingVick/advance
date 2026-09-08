# Deployment Runbook

The destination is Creditcoin USC Testnet V2 (`chainId 102033`). The source
chain and `SOURCE_CHAIN_KEY` must be read from the live ChainInfo precompile;
the numeric chain key is not the source chain's EVM chain ID.

## Preconditions

1. Copy `.env.example` to `.env` and fill the required values.
2. Fund both deployer addresses from the relevant faucets.
3. Run the SDK chain-discovery script before selecting a source network.
4. Never commit `.env`, private keys, or signed raw transactions.

## Deploy the source fixture

```bash
source .env
forge script contracts/script/DeploySource.s.sol:DeploySource \
  --rpc-url "$SOURCE_CHAIN_RPC_URL" --broadcast
```

Set `SOURCE_REGISTRY_ADDRESS` to the deployed address.

## Deploy Advance and two consumers

```bash
source .env
forge script contracts/script/DeployAdvance.s.sol:DeployAdvance \
  --rpc-url "$CREDITCOIN_RPC_URL" --broadcast
```

Record every address and transaction hash in `deployments/testnet.json` as soon
as each transaction confirms.

