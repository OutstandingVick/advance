// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
contract ExpiryBoundaryTest is AdvanceTestBase {
    function testSessionExpiresAtExactBoundary() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        bytes32 sessionId = advance.requestScore(grantId, 300);
        vm.warp(advance.getScoreSession(sessionId).expiresAt);
        assertFalse(advance.isScoreValid(sessionId, CONSUMER_A));
    }
    function testSessionNeverOutlivesGrant() public {
        uint64 expiry = uint64(block.timestamp + 100);
        vm.prank(WALLET);
        bytes32 grantId = advance.createGrant(CONSUMER_A, 7, expiry);
        vm.prank(CONSUMER_A);
        bytes32 sessionId = advance.requestScore(grantId, 3600);
        assertEq(advance.getScoreSession(sessionId).expiresAt, expiry);
        vm.warp(expiry);
        assertFalse(advance.isScoreValid(sessionId, CONSUMER_A));
    }
}
