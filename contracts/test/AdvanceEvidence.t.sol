// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {INativeQueryVerifier} from "@gluwa/asc-contracts/contracts/write-ability/common/INativeQueryVerifier.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";
import {AttestcoinVerifierAdapter} from "../src/AttestcoinVerifierAdapter.sol";
import {AdvanceTypes} from "../src/AdvanceTypes.sol";

contract AdvanceEvidenceTest is AdvanceTestBase {
    function testVerifiedPaymentUpdatesProfile() public {
        bytes memory transaction = _encodedCreditEvent(
            SOURCE_CONTRACT,
            WALLET,
            AdvanceTypes.CreditEventType.PaymentRecorded,
            1_000e6,
            uint64(block.timestamp),
            1,
            1
        );
        _submit(101, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);

        AdvanceTypes.Profile memory profile = advance.getProfile(WALLET);
        assertEq(profile.paymentsRecorded, 1);
        assertEq(profile.totalRepaid, 1_000e6);
        assertEq(profile.version, 1);
    }

    function testRejectsInvalidNativeProofWithoutUpdatingProfile() public {
        verifier.setShouldVerify(false);
        bytes memory transaction = _validPayment();
        vm.expectRevert(AttestcoinVerifierAdapter.ProofVerificationFailed.selector);
        _submit(102, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);
        assertEq(advance.getProfile(WALLET).version, 0);
    }

    function testRejectsWrongSourceChain() public {
        bytes memory transaction = _validPayment();
        INativeQueryVerifier.MerkleProofEntry[] memory siblings =
            new INativeQueryVerifier.MerkleProofEntry[](0);
        vm.expectRevert(
            abi.encodeWithSelector(
                AttestcoinVerifierAdapter.WrongSourceChain.selector,
                uint64(99),
                SOURCE_CHAIN_KEY
            )
        );
        advance.submitAttestedEvent(
            1,
            99,
            103,
            transaction,
            bytes32(uint256(1)),
            siblings,
            bytes32(uint256(1)),
            new bytes32[](0)
        );
    }

    function testRejectsWrongEmitter() public {
        bytes memory transaction = _encodedCreditEvent(
            address(0xBAD),
            WALLET,
            AdvanceTypes.CreditEventType.PaymentRecorded,
            1e6,
            uint64(block.timestamp),
            1,
            1
        );
        vm.expectRevert(
            abi.encodeWithSelector(AdvanceRegistry.WrongSourceContract.selector, address(0xBAD), SOURCE_CONTRACT)
        );
        _submit(104, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);
    }

    function testRejectsFailedSourceTransaction() public {
        bytes memory transaction = _encodedCreditEvent(
            SOURCE_CONTRACT,
            WALLET,
            AdvanceTypes.CreditEventType.PaymentRecorded,
            1e6,
            uint64(block.timestamp),
            0,
            1
        );
        vm.expectRevert(AdvanceRegistry.FailedSourceTransaction.selector);
        _submit(105, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);
    }

    function testRejectsMissingCreditEvent() public {
        bytes memory transaction = _encodedCreditEvent(
            SOURCE_CONTRACT,
            WALLET,
            AdvanceTypes.CreditEventType.PaymentRecorded,
            1e6,
            uint64(block.timestamp),
            1,
            0
        );
        vm.expectRevert(abi.encodeWithSelector(AdvanceRegistry.AmbiguousCreditEvent.selector, 0));
        _submit(106, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);
    }

    function testRejectsAmbiguousCreditEvents() public {
        bytes memory transaction = _encodedCreditEvent(
            SOURCE_CONTRACT,
            WALLET,
            AdvanceTypes.CreditEventType.PaymentRecorded,
            1e6,
            uint64(block.timestamp),
            1,
            2
        );
        vm.expectRevert(abi.encodeWithSelector(AdvanceRegistry.AmbiguousCreditEvent.selector, 2));
        _submit(107, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);
    }

    function testRejectsReplayedEvidence() public {
        bytes memory transaction = _validPayment();
        bytes32 evidenceId = _submit(108, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);
        vm.expectRevert(
            abi.encodeWithSelector(AttestcoinVerifierAdapter.EvidenceAlreadyConsumed.selector, evidenceId)
        );
        _submit(108, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);
    }

    function _validPayment() private view returns (bytes memory) {
        return _encodedCreditEvent(
            SOURCE_CONTRACT,
            WALLET,
            AdvanceTypes.CreditEventType.PaymentRecorded,
            1_000e6,
            uint64(block.timestamp),
            1,
            1
        );
    }
}
