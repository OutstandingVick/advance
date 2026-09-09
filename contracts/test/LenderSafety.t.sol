// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {AdvanceTestBase} from "./AdvanceTestBase.t.sol";
import {AdvanceTypes} from "../src/AdvanceTypes.sol";
import {IAdvance} from "../src/interfaces/IAdvance.sol";
import {ReferenceLender} from "../src/reference/ReferenceLender.sol";

contract LenderSafetyTest is AdvanceTestBase {
    ReferenceLender a;
    ReferenceLender b;
    function setUp() public override {
        super.setUp();
        a = new ReferenceLender(IAdvance(address(advance)), "A");
        b = new ReferenceLender(IAdvance(address(advance)), "B");
    }
    function testOtherLenderCannotQuoteSession() public {
        bytes32 session = a.requestBorrowerScore(_grant(address(a)));
        vm.expectRevert(abi.encodeWithSelector(ReferenceLender.InvalidScoreSession.selector, session));
        b.quote(session);
    }
    function testUnknownSessionCannotQuote() public {
        vm.expectRevert(abi.encodeWithSelector(ReferenceLender.InvalidScoreSession.selector, bytes32(0)));
        a.quote(bytes32(0));
    }
    function testExactExpiryCannotQuote() public {
        bytes32 session = a.requestBorrowerScore(_grant(address(a)));
        vm.warp(advance.getScoreSession(session).expiresAt);
        vm.expectRevert(abi.encodeWithSelector(ReferenceLender.InvalidScoreSession.selector, session));
        a.quote(session);
    }
    function testDefaultInvalidatesOldQuote() public {
        bytes32 session = a.requestBorrowerScore(_grant(address(a)));
        _submit(601, AdvanceTypes.CreditEventType.DefaultRecorded,
            _encodedCreditEvent(SOURCE_CONTRACT, WALLET,
                AdvanceTypes.CreditEventType.DefaultRecorded, 10, 1, 1, 1));
        vm.expectRevert(abi.encodeWithSelector(ReferenceLender.InvalidScoreSession.selector, session));
        a.quote(session);
    }
}
