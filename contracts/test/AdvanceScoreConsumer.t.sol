// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {IAdvance} from "../src/interfaces/IAdvance.sol";
import {AdvanceScoreConsumer} from "../src/examples/AdvanceScoreConsumer.sol";

contract AdvanceScoreConsumerTest is AdvanceTestBase {
    AdvanceScoreConsumer internal consumer;

    function setUp() public override {
        super.setUp();
        consumer = new AdvanceScoreConsumer(IAdvance(address(advance)));
    }

    function testConsumerRequestsAndReadsCurrentScore() public {
        bytes32 sessionId = consumer.requestScore(_grant(address(consumer)));
        assertEq(consumer.currentScore(sessionId), advance.computeScore(WALLET));
    }

    function testConsumerRejectsUnknownSession() public {
        bytes32 sessionId = keccak256("unknown");
        vm.expectRevert(abi.encodeWithSelector(AdvanceScoreConsumer.InvalidScoreSession.selector, sessionId));
        consumer.currentScore(sessionId);
    }

    function testConsumerRechecksRevocationBeforeReadingScore() public {
        bytes32 grantId = _grant(address(consumer));
        bytes32 sessionId = consumer.requestScore(grantId);
        vm.prank(WALLET);
        advance.revokeGrant(grantId);
        vm.expectRevert(abi.encodeWithSelector(AdvanceScoreConsumer.InvalidScoreSession.selector, sessionId));
        consumer.currentScore(sessionId);
    }
}
