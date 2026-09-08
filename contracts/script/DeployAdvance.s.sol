// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";
import {IAdvance} from "../src/interfaces/IAdvance.sol";
import {ReferenceLender} from "../src/reference/ReferenceLender.sol";

contract DeployAdvance is Script {
    function run() external returns (AdvanceRegistry registry, ReferenceLender lenderA, ReferenceLender lenderB) {
        uint256 deployerKey = vm.envUint("CREDITCOIN_PRIVATE_KEY");
        uint64 sourceChainKey = uint64(vm.envUint("SOURCE_CHAIN_KEY"));
        address sourceRegistry = vm.envAddress("SOURCE_REGISTRY_ADDRESS");

        vm.startBroadcast(deployerKey);
        registry = new AdvanceRegistry(sourceChainKey, sourceRegistry);
        lenderA = new ReferenceLender(IAdvance(address(registry)), "Northstar Credit");
        lenderB = new ReferenceLender(IAdvance(address(registry)), "Harbor Lending");
        vm.stopBroadcast();
    }
}

