// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";
import {IAdvance} from "../src/interfaces/IAdvance.sol";
import {ReferenceLender} from "../src/reference/ReferenceLender.sol";

contract DeployAdvance is Script {
    function run() external returns (AdvanceRegistry registry, ReferenceLender lenderA, ReferenceLender lenderB) {
        require(block.chainid == 102031, "Creditcoin Testnet only");
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        require(deployer != address(0), "Missing deployer");
        uint256 configuredKey = vm.envUint("SOURCE_CHAIN_KEY");
        require(configuredKey == 1, "Sepolia source key only");
        uint64 sourceChainKey = uint64(configuredKey);
        address sourceRegistry = vm.envAddress("SOURCE_REGISTRY_ADDRESS");

        vm.startBroadcast(deployer);
        registry = new AdvanceRegistry(sourceChainKey, sourceRegistry);
        lenderA = new ReferenceLender(IAdvance(address(registry)), "Northstar Credit");
        lenderB = new ReferenceLender(IAdvance(address(registry)), "Harbor Lending");
        vm.stopBroadcast();
    }
}
