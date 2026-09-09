// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {AdvanceTypes} from "../src/AdvanceTypes.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";

contract EvidenceAtomicityTest is AdvanceTestBase {
    function testDecoderFailureDoesNotConsumeEvidence() public {
        bytes32 id = keccak256(abi.encode(SOURCE_CHAIN_KEY, uint64(401), uint256(0)));
        vm.expectRevert();
        _submit(401, AdvanceTypes.CreditEventType.PaymentRecorded, hex"0102");
        assertFalse(advance.consumedEvidence(id));
        assertEq(advance.getProfile(WALLET).version, 0);
        assertEq(_submit(401, AdvanceTypes.CreditEventType.PaymentRecorded, _payment(WALLET)), id);
    }
    function testActionMismatchDoesNotConsumeEvidence() public {
        bytes memory encoded = _payment(WALLET);
        vm.expectRevert(abi.encodeWithSelector(AdvanceRegistry.UnsupportedAction.selector, uint8(0)));
        _submit(402, AdvanceTypes.CreditEventType.LoanOpened, encoded);
        bytes32 id = keccak256(abi.encode(SOURCE_CHAIN_KEY, uint64(402), uint256(0)));
        assertFalse(advance.consumedEvidence(id));
        _submit(402, AdvanceTypes.CreditEventType.PaymentRecorded, encoded);
        assertEq(advance.getProfile(WALLET).paymentsRecorded, 1);
    }
    function testDistinctTransactionIndexesAreNotFalseReplays() public {
        _submit(403, AdvanceTypes.CreditEventType.PaymentRecorded, _payment(WALLET));
        verifier.setTransactionIndex(1);
        _submit(403, AdvanceTypes.CreditEventType.PaymentRecorded, _payment(WALLET));
        assertEq(advance.getProfile(WALLET).version, 2);
    }
    function _payment(address wallet) internal view returns(bytes memory) {
        return _encodedCreditEvent(SOURCE_CONTRACT, wallet,
            AdvanceTypes.CreditEventType.PaymentRecorded, 100, 1, 1, 1);
    }
}
