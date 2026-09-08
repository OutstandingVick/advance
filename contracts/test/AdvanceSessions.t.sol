// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";
import {AdvanceTypes} from "../src/AdvanceTypes.sol";
import {IAdvance} from "../src/interfaces/IAdvance.sol";
import {ReferenceLender} from "../src/reference/ReferenceLender.sol";

contract AdvanceSessionsTest is AdvanceTestBase {
    ReferenceLender internal lenderA;
    ReferenceLender internal lenderB;

    function setUp() public override {
        super.setUp();
        lenderA = new ReferenceLender(IAdvance(address(advance)), "Lender A");
        lenderB = new ReferenceLender(IAdvance(address(advance)), "Lender B");
    }

    function testAuthorizedConsumerReceivesValidSession() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        bytes32 sessionId = advance.requestScore(grantId, 1 hours);

        assertTrue(advance.isScoreValid(sessionId, CONSUMER_A));
        assertEq(advance.getScoreSession(sessionId).score, 500);
    }

    function testRejectsUnauthorizedScoreRequester() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(CONSUMER_B);
        vm.expectRevert(abi.encodeWithSelector(AdvanceRegistry.UnauthorizedConsumer.selector, CONSUMER_B));
        advance.requestScore(grantId, 1 hours);
    }

    function testRejectsInvalidSessionDuration() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        vm.expectRevert(AdvanceRegistry.InvalidScoreValidity.selector);
        advance.requestScore(grantId, 1 minutes);
    }

    function testExpiredSessionBecomesInvalid() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        bytes32 sessionId = advance.requestScore(grantId, 5 minutes);
        vm.warp(block.timestamp + 5 minutes + 1);
        assertFalse(advance.isScoreValid(sessionId, CONSUMER_A));
    }

    function testRevocationInvalidatesExistingSession() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        bytes32 sessionId = advance.requestScore(grantId, 1 hours);
        vm.prank(WALLET);
        advance.revokeGrant(grantId);
        assertFalse(advance.isScoreValid(sessionId, CONSUMER_A));
    }

    function testProfileUpdateInvalidatesExistingSession() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        bytes32 sessionId = advance.requestScore(grantId, 1 hours);

        bytes memory transaction = _encodedCreditEvent(
            SOURCE_CONTRACT,
            WALLET,
            AdvanceTypes.CreditEventType.PaymentRecorded,
            500e6,
            uint64(block.timestamp),
            1,
            1
        );
        _submit(201, AdvanceTypes.CreditEventType.PaymentRecorded, transaction);
        assertFalse(advance.isScoreValid(sessionId, CONSUMER_A));
    }

    function testTwoLendersShareProfileButRevokeIndependently() public {
        vm.startPrank(WALLET);
        bytes32 grantA = advance.createGrant(address(lenderA), 0x07, uint64(block.timestamp + 2 days));
        bytes32 grantB = advance.createGrant(address(lenderB), 0x07, uint64(block.timestamp + 2 days));
        vm.stopPrank();

        bytes32 sessionA = lenderA.requestBorrowerScore(grantA);
        bytes32 sessionB = lenderB.requestBorrowerScore(grantB);
        ReferenceLender.Quote memory quoteA = lenderA.quote(sessionA);
        ReferenceLender.Quote memory quoteB = lenderB.quote(sessionB);
        assertEq(quoteA.annualRateBps, quoteB.annualRateBps);

        vm.prank(WALLET);
        advance.revokeGrant(grantA);
        vm.expectRevert(abi.encodeWithSelector(ReferenceLender.InvalidScoreSession.selector, sessionA));
        lenderA.quote(sessionA);
        lenderB.quote(sessionB);
        assertTrue(advance.isScoreValid(sessionB, address(lenderB)));
    }
}

