// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {Test} from "forge-std/Test.sol";
import {SourceLoanRegistry} from "../src/source/SourceLoanRegistry.sol";
contract SourceRegistryTest is Test {
    SourceLoanRegistry source;
    function setUp() public { source = new SourceLoanRegistry(); }
    function testOnlyFacilityLenderCanRecordPayment() public {
        source.openLoan(bytes32(uint256(1)), address(3), 100);
        vm.prank(address(4));
        vm.expectRevert(abi.encodeWithSelector(SourceLoanRegistry.NotFacilityLender.selector, address(4)));
        source.recordPayment(bytes32(uint256(1)), 50);
    }
    function testCannotRecordPaymentAfterDefault() public {
        bytes32 id = bytes32(uint256(1));
        source.openLoan(id, address(3), 100);
        source.recordDefault(id, 100);
        vm.expectRevert(abi.encodeWithSelector(SourceLoanRegistry.FacilityDefaulted.selector, id));
        source.recordPayment(id, 10);
    }
    function testFacilityCannotBeOverwritten() public {
        bytes32 id = bytes32(uint256(1));
        source.openLoan(id, address(3), 100);
        vm.expectRevert(abi.encodeWithSelector(SourceLoanRegistry.FacilityAlreadyExists.selector, id));
        source.openLoan(id, address(4), 500);
    }
    function testRejectsZeroBorrower() public {
        vm.expectRevert(SourceLoanRegistry.InvalidAddress.selector);
        source.openLoan(bytes32(uint256(2)), address(0), 100);
    }
    function testRejectsZeroPrincipal() public {
        vm.expectRevert(SourceLoanRegistry.InvalidAmount.selector);
        source.openLoan(bytes32(uint256(2)), address(3), 0);
    }
    function testNonLenderCannotRecordDefault() public {
        bytes32 id = bytes32(uint256(2));
        source.openLoan(id, address(3), 100);
        vm.prank(address(4));
        vm.expectRevert(abi.encodeWithSelector(SourceLoanRegistry.NotFacilityLender.selector, address(4)));
        source.recordDefault(id, 100);
    }
    function testCannotDefaultTwice() public {
        bytes32 id = bytes32(uint256(2));
        source.openLoan(id, address(3), 100);
        source.recordDefault(id, 100);
        vm.expectRevert(abi.encodeWithSelector(SourceLoanRegistry.FacilityDefaulted.selector, id));
        source.recordDefault(id, 100);
    }
}
