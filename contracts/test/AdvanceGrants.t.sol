// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {AdvanceRegistry} from "../src/AdvanceRegistry.sol";
import {AdvanceTypes} from "../src/AdvanceTypes.sol";

contract AdvanceGrantsTest is AdvanceTestBase {
    function testWalletCreatesConsumerScopedGrant() public {
        bytes32 grantId = _grant(CONSUMER_A);
        AdvanceTypes.Grant memory grant = advance.getGrant(grantId);

        assertEq(grant.wallet, WALLET);
        assertEq(grant.consumer, CONSUMER_A);
        assertEq(grant.sourceChainKey, SOURCE_CHAIN_KEY);
        assertEq(grant.sourceContract, SOURCE_CONTRACT);
        assertEq(grant.eventMask, advance.ALL_EVENT_TYPES());
        assertFalse(grant.revoked);
    }

    function testRejectsExpiredGrantAtCreation() public {
        vm.prank(WALLET);
        vm.expectRevert(AdvanceRegistry.InvalidExpiry.selector);
        advance.createGrant(CONSUMER_A, advance.ALL_EVENT_TYPES(), uint64(block.timestamp));
    }

    function testRejectsSelectiveHistoryDisclosure() public {
        vm.prank(WALLET);
        vm.expectRevert(AdvanceRegistry.InvalidEventMask.selector);
        advance.createGrant(CONSUMER_A, 0x02, uint64(block.timestamp + 1 days));
    }

    function testNonOwnerCannotRevokeGrant() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(CONSUMER_A);
        vm.expectRevert(abi.encodeWithSelector(AdvanceRegistry.NotGrantOwner.selector, CONSUMER_A));
        advance.revokeGrant(grantId);
    }

    function testWalletRevokesGrant() public {
        bytes32 grantId = _grant(CONSUMER_A);
        vm.prank(WALLET);
        advance.revokeGrant(grantId);
        assertTrue(advance.getGrant(grantId).revoked);
    }
}

