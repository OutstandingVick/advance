// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {AdvanceTypes} from "../src/AdvanceTypes.sol";

contract WalletAttributionTest is AdvanceTestBase {
    function testRelayerCannotTakeCreditForBorrowerEvent() public {
        address relayer = address(0x777);
        bytes memory encoded = _encodedCreditEvent(SOURCE_CONTRACT, WALLET,
            AdvanceTypes.CreditEventType.PaymentRecorded, 123, 1, 1, 1);
        vm.prank(relayer);
        _submit(501, AdvanceTypes.CreditEventType.PaymentRecorded, encoded);
        assertEq(advance.getProfile(WALLET).totalRepaid, 123);
        assertEq(advance.getProfile(relayer).version, 0);
    }
    function testOtherWalletEvidenceDoesNotInvalidateBorrowerSession() public {
        bytes32 grant = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        bytes32 session = advance.requestScore(grant, 1 hours);
        address other = address(0x888);
        _submit(502, AdvanceTypes.CreditEventType.DefaultRecorded,
            _encodedCreditEvent(SOURCE_CONTRACT, other,
                AdvanceTypes.CreditEventType.DefaultRecorded, 123, 1, 1, 1));
        assertTrue(advance.isScoreValid(session, CONSUMER_A));
        assertEq(advance.getProfile(WALLET).version, 0);
        assertEq(advance.getProfile(other).defaultsRecorded, 1);
    }
}
