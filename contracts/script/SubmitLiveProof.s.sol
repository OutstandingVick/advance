// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {Script} from "forge-std/Script.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";
import {INativeQueryVerifier} from "@gluwa/asc-contracts/contracts/write-ability/common/INativeQueryVerifier.sol";

contract SubmitLiveProof is Script {
    function run() external returns (bytes32 evidenceId) {
        require(block.chainid == 102031, "Creditcoin Testnet only");
        string memory proof = vm.readFile(".advance/proof.json");
        uint256 key = vm.parseJsonUint(proof, ".chainKey");
        uint256 height = vm.parseJsonUint(proof, ".headerNumber");
        require(key == 1 && height <= type(uint64).max, "Invalid proof scope");
        AdvanceRegistry registry = AdvanceRegistry(vm.envAddress("ADVANCE_REGISTRY_ADDRESS"));
        require(address(registry).code.length > 0, "Registry not deployed");
        require(registry.SOURCE_CHAIN_KEY() == 1, "Wrong source key");
        require(registry.SOURCE_CONTRACT() == vm.envAddress("SOURCE_REGISTRY_ADDRESS"), "Wrong source");
        // JSON object tuple fields are alphabetical: hash, isLeft.
        INativeQueryVerifier.MerkleProofEntry[] memory siblings = abi.decode(
            vm.parseJson(proof, ".merkleProof.siblings"), (INativeQueryVerifier.MerkleProofEntry[])
        );
        bytes memory txBytes = vm.parseJsonBytes(proof, ".txBytes");
        bytes32 root = vm.parseJsonBytes32(proof, ".merkleProof.root");
        bytes32 lower = vm.parseJsonBytes32(proof, ".continuityProof.lowerEndpointDigest");
        bytes32[] memory roots = vm.parseJsonBytes32Array(proof, ".continuityProof.roots");
        vm.startBroadcast(vm.envAddress("DEPLOYER_ADDRESS"));
        evidenceId = registry.submitAttestedEvent(1, uint64(key), uint64(height), txBytes, root, siblings, lower, roots);
        vm.stopBroadcast();
    }
}
