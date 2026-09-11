// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {Script} from "forge-std/Script.sol";
import {SourceLoanRegistry} from "../src/source/SourceLoanRegistry.sol";

/// @notice Fixture assertions only: no assets are lent or repaid by this script.
contract RecordSourceDemo is Script {
    function run() external {
        require(block.chainid == 11155111, "Sepolia only");
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        SourceLoanRegistry source = SourceLoanRegistry(vm.envAddress("SOURCE_REGISTRY_ADDRESS"));
        require(address(source).code.length > 0, "Source not deployed");
        bytes32 facility = keccak256(abi.encode("advance-testnet-demo-v1", deployer, address(source)));
        (address lender, address borrower,, uint256 repaid, bool defaulted) = source.facilities(facility);
        require(!defaulted, "Demo facility defaulted");
        require(lender == address(0) || (lender == deployer && borrower == deployer), "Wrong facility owner");
        vm.startBroadcast(deployer);
        // Separate broadcast transactions keep each proved receipt unambiguous.
        if (lender == address(0)) source.openLoan(facility, deployer, 1_000e6);
        if (repaid == 0) source.recordPayment(facility, 100e6);
        vm.stopBroadcast();
    }
}
