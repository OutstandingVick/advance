// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {SourceLoanRegistry} from "../src/source/SourceLoanRegistry.sol";

contract DeploySource is Script {
    function run() external returns (SourceLoanRegistry registry) {
        require(block.chainid == 11155111, "Sepolia only");
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        require(deployer != address(0), "Missing deployer");
        vm.startBroadcast(deployer);
        registry = new SourceLoanRegistry();
        vm.stopBroadcast();
    }
}
