// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";

contract GrantPropertiesTest is AdvanceTestBase {
    function testFuzzOnlyFullMaskIsAccepted(uint8 mask) public {
        vm.assume(mask != 7);
        vm.prank(WALLET);
        vm.expectRevert(AdvanceRegistry.InvalidEventMask.selector);
        advance.createGrant(CONSUMER_A, mask, uint64(block.timestamp + 1 days));
    }
    function testFuzzSessionNeverOutlivesGrant(uint64 duration, uint64 remaining) public {
        duration = uint64(bound(duration, 5 minutes, 1 days));
        remaining = uint64(bound(remaining, 1, 2 days));
        vm.prank(WALLET);
        bytes32 grant = advance.createGrant(CONSUMER_A, 7, uint64(block.timestamp + remaining));
        vm.prank(CONSUMER_A);
        bytes32 session = advance.requestScore(grant, duration);
        assertLe(advance.getScoreSession(session).expiresAt, block.timestamp + remaining);
        vm.warp(advance.getScoreSession(session).expiresAt);
        assertFalse(advance.isScoreValid(session, CONSUMER_A));
    }
}
