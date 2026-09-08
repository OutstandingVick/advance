// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {INativeQueryVerifier} from "@gluwa/asc-contracts/contracts/write-ability/common/INativeQueryVerifier.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";
import {AdvanceTypes} from "../src/AdvanceTypes.sol";

contract MockNativeQueryVerifier {
    bool public shouldVerify = true;
    uint64 public transactionIndex;

    function setShouldVerify(bool value) external {
        shouldVerify = value;
    }

    function setTransactionIndex(uint64 value) external {
        transactionIndex = value;
    }

    function calculateTxIndex(INativeQueryVerifier.MerkleProof calldata) external view returns (uint64) {
        return transactionIndex;
    }

    function verifyAndEmit(
        uint64,
        uint64,
        bytes calldata,
        INativeQueryVerifier.MerkleProof calldata,
        INativeQueryVerifier.ContinuityProof calldata
    ) external view returns (bool) {
        return shouldVerify;
    }
}

abstract contract AdvanceTestBase is Test {
    struct LogTuple {
        address address_;
        bytes32[] topics;
        bytes data;
    }

    address internal constant VERIFIER = 0x0000000000000000000000000000000000000FD2;
    uint64 internal constant SOURCE_CHAIN_KEY = 1;
    address internal constant SOURCE_CONTRACT = address(0xA11CE);
    address internal constant WALLET = address(0xB0B);
    address internal constant CONSUMER_A = address(0xCAFE);
    address internal constant CONSUMER_B = address(0xBEEF);

    AdvanceRegistry internal advance;
    MockNativeQueryVerifier internal verifier;

    function setUp() public virtual {
        MockNativeQueryVerifier implementation = new MockNativeQueryVerifier();
        vm.etch(VERIFIER, address(implementation).code);
        verifier = MockNativeQueryVerifier(VERIFIER);
        verifier.setShouldVerify(true);
        advance = new AdvanceRegistry(SOURCE_CHAIN_KEY, SOURCE_CONTRACT);
    }

    function _grant(address consumer) internal returns (bytes32) {
        vm.prank(WALLET);
        return advance.createGrant(consumer, 0x07, uint64(block.timestamp + 2 days));
    }

    function _encodedCreditEvent(
        address emitter,
        address wallet,
        AdvanceTypes.CreditEventType eventType,
        uint256 amount,
        uint64 occurredAt,
        uint8 receiptStatus,
        uint256 matchingLogCount
    ) internal view returns (bytes memory) {
        LogTuple[] memory logs = new LogTuple[](matchingLogCount);
        for (uint256 i; i < matchingLogCount; ++i) {
            bytes32[] memory topics = new bytes32[](3);
            topics[0] = advance.CREDIT_EVENT_SIGNATURE();
            topics[1] = bytes32(uint256(uint160(wallet)));
            topics[2] = keccak256(abi.encode("facility", i));
            logs[i] = LogTuple({address_: emitter, topics: topics, data: abi.encode(eventType, amount, occurredAt)});
        }

        bytes[] memory chunks = new bytes[](3);
        chunks[0] = abi.encode(uint64(1), uint64(100_000), address(0xF00D), false, emitter, 0, bytes(""));
        chunks[1] = bytes("");
        chunks[2] = abi.encode(receiptStatus, uint64(50_000), logs, bytes(""));
        return abi.encode(uint8(2), chunks);
    }

    function _submit(uint64 height, AdvanceTypes.CreditEventType eventType, bytes memory encodedTransaction)
        internal
        returns (bytes32)
    {
        INativeQueryVerifier.MerkleProofEntry[] memory siblings = new INativeQueryVerifier.MerkleProofEntry[](0);
        return advance.submitAttestedEvent(
            uint8(eventType),
            SOURCE_CHAIN_KEY,
            height,
            encodedTransaction,
            keccak256(abi.encode(height)),
            siblings,
            bytes32(uint256(1)),
            new bytes32[](0)
        );
    }
}
