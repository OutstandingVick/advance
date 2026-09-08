// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {
    INativeQueryVerifier,
    NativeQueryVerifierLib
} from "@gluwa/asc-contracts/contracts/write-ability/common/INativeQueryVerifier.sol";

/// @notice Attestcoin V2 verification adapter with source-chain binding and replay protection.
abstract contract AttestcoinVerifierAdapter {
    error WrongSourceChain(uint64 supplied, uint64 expected);
    error EvidenceAlreadyConsumed(bytes32 evidenceId);
    error ProofVerificationFailed();

    INativeQueryVerifier public immutable VERIFIER;
    uint64 public immutable SOURCE_CHAIN_KEY;

    mapping(bytes32 => bool) public consumedEvidence;

    constructor(uint64 sourceChainKey) {
        VERIFIER = NativeQueryVerifierLib.getVerifier();
        SOURCE_CHAIN_KEY = sourceChainKey;
    }

    function submitAttestedEvent(
        uint8 action,
        uint64 chainKey,
        uint64 blockHeight,
        bytes calldata encodedTransaction,
        bytes32 merkleRoot,
        INativeQueryVerifier.MerkleProofEntry[] calldata siblings,
        bytes32 lowerEndpointDigest,
        bytes32[] calldata continuityRoots
    ) external returns (bytes32 evidenceId) {
        if (chainKey != SOURCE_CHAIN_KEY) {
            revert WrongSourceChain(chainKey, SOURCE_CHAIN_KEY);
        }

        INativeQueryVerifier.MerkleProof memory merkleProof =
            INativeQueryVerifier.MerkleProof({root: merkleRoot, siblings: siblings});
        uint256 transactionIndex = VERIFIER.calculateTxIndex(merkleProof);
        evidenceId = keccak256(abi.encode(chainKey, blockHeight, transactionIndex));
        if (consumedEvidence[evidenceId]) revert EvidenceAlreadyConsumed(evidenceId);

        INativeQueryVerifier.ContinuityProof memory continuityProof =
            INativeQueryVerifier.ContinuityProof({lowerEndpointDigest: lowerEndpointDigest, roots: continuityRoots});

        bool verified = VERIFIER.verifyAndEmit(chainKey, blockHeight, encodedTransaction, merkleProof, continuityProof);
        if (!verified) revert ProofVerificationFailed();

        consumedEvidence[evidenceId] = true;
        _processVerifiedEvent(action, evidenceId, encodedTransaction);
    }

    function _processVerifiedEvent(uint8 action, bytes32 evidenceId, bytes memory encodedTransaction) internal virtual;
}

