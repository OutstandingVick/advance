// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {SourceLoanRegistry} from "../src/source/SourceLoanRegistry.sol";

contract DeploySource is Script {
    function run() external returns (SourceLoanRegistry registry) {
        uint256 deployerKey = vm.envUint("SOURCE_CHAIN_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        registry = new SourceLoanRegistry();
        vm.stopBroadcast();
    }
}

