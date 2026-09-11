# Live testnet runbook

The release wallet is selected by its public address and Foundry account name.
No private key or password belongs in this repository, shell history, or `.env`.

```sh
export DEPLOYER_ADDRESS=0xb29E6cbdEB955AdC2246Aac7b703276ec045560F
export FOUNDRY_ACCOUNT=advance-testnet-v2
npm run live:funds
```

Simulate every script before adding `--broadcast`. Foundry asks for the encrypted
keystore password locally when the broadcast command runs.

```sh
forge script contracts/script/DeploySource.s.sol:DeploySource \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com --sender "$DEPLOYER_ADDRESS"

forge script contracts/script/DeploySource.s.sol:DeploySource \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com --sender "$DEPLOYER_ADDRESS" \
  --account "$FOUNDRY_ACCOUNT" --broadcast --slow
```

After the source address is verified from the canonical receipt, export
`SOURCE_REGISTRY_ADDRESS` and run `RecordSourceDemo` first without and then with
the same signing flags. The payment transaction hash becomes
`SOURCE_CHAIN_TX_HASH`.

Generate `.advance/proof.json` only after the payment block is attested:

```sh
mkdir -p .advance
npm run proof:prepare > .advance/proof.json
```

Deploy `DeployAdvance` on Creditcoin Testnet, verify all three deployment
receipts, export `ADVANCE_REGISTRY_ADDRESS`, then simulate and broadcast
`SubmitLiveProof`. Record only values read back from canonical RPC receipts in
`deployments/testnet.json`.

All scripts reject mainnet chain IDs. The source fixture records assertions for
the demo and never transfers an asset or claims a real-world repayment.
