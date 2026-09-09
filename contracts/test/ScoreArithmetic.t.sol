// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {AdvanceTypes} from "../src/AdvanceTypes.sol";

contract ScoreArithmeticTest is AdvanceTestBase {
    function _profile(uint256 borrowed, uint256 repaid) internal {
        _submit(301, AdvanceTypes.CreditEventType.LoanOpened, _encodedCreditEvent(
            SOURCE_CONTRACT, WALLET, AdvanceTypes.CreditEventType.LoanOpened, borrowed, 1, 1, 1));
        _submit(302, AdvanceTypes.CreditEventType.PaymentRecorded, _encodedCreditEvent(
            SOURCE_CONTRACT, WALLET, AdvanceTypes.CreditEventType.PaymentRecorded, repaid, 2, 1, 1));
    }
    function testHugeRepaymentDoesNotDisableScoring() public {
        _profile(1, type(uint256).max);
        assertEq(advance.computeScore(WALLET), 635);
        bytes32 grant = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        bytes32 session = advance.requestScore(grant, 1 hours);
        assertTrue(advance.isScoreValid(session, CONSUMER_A));
    }
    function testHugeSubUnitRatioUsesFullPrecision() public {
        _profile(type(uint256).max, type(uint256).max - 1);
        assertEq(advance.computeScore(WALLET), 634);
    }
    function testFuzzScoreRatioIsBounded(uint256 borrowed, uint256 repaid) public {
        borrowed = bound(borrowed, 1, type(uint256).max);
        _profile(borrowed, repaid);
        uint16 score = advance.computeScore(WALLET);
        assertGe(score, 535); assertLe(score, 635);
        if (repaid >= borrowed) assertEq(score, 635);
        if (repaid <= type(uint256).max / 100) {
            uint256 ratio = repaid * 100 / borrowed;
            assertEq(score, 535 + (ratio > 100 ? 100 : ratio));
        }
    }
}
