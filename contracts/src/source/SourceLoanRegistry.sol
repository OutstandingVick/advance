// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title SourceLoanRegistry
/// @notice Minimal source-chain fixture that emits credit events Advance can prove through Attestcoin.
/// @dev This contract models multiple facilities. It is a demo data source, not a lending protocol.
contract SourceLoanRegistry {
    enum CreditEventType {
        LoanOpened,
        PaymentRecorded,
        DefaultRecorded
    }

    struct Facility {
        address lender;
        address borrower;
        uint256 principal;
        uint256 repaid;
        bool defaulted;
    }

    error FacilityAlreadyExists(bytes32 facilityId);
    error FacilityNotFound(bytes32 facilityId);
    error NotFacilityLender(address caller);
    error InvalidAddress();
    error InvalidAmount();
    error FacilityDefaulted(bytes32 facilityId);

    event CreditEvent(
        address indexed wallet, bytes32 indexed facilityId, CreditEventType eventType, uint256 amount, uint64 occurredAt
    );

    mapping(bytes32 => Facility) public facilities;

    function openLoan(bytes32 facilityId, address borrower, uint256 principal) external {
        if (borrower == address(0)) revert InvalidAddress();
        if (principal == 0) revert InvalidAmount();
        if (facilities[facilityId].lender != address(0)) revert FacilityAlreadyExists(facilityId);

        facilities[facilityId] =
            Facility({lender: msg.sender, borrower: borrower, principal: principal, repaid: 0, defaulted: false});

        emit CreditEvent(borrower, facilityId, CreditEventType.LoanOpened, principal, uint64(block.timestamp));
    }

    function recordPayment(bytes32 facilityId, uint256 amount) external {
        Facility storage facility = _facilityForLender(facilityId);
        if (amount == 0) revert InvalidAmount();
        if (facility.defaulted) revert FacilityDefaulted(facilityId);

        facility.repaid += amount;
        emit CreditEvent(
            facility.borrower, facilityId, CreditEventType.PaymentRecorded, amount, uint64(block.timestamp)
        );
    }

    function recordDefault(bytes32 facilityId, uint256 outstandingAmount) external {
        Facility storage facility = _facilityForLender(facilityId);
        if (outstandingAmount == 0) revert InvalidAmount();
        if (facility.defaulted) revert FacilityDefaulted(facilityId);

        facility.defaulted = true;
        emit CreditEvent(
            facility.borrower, facilityId, CreditEventType.DefaultRecorded, outstandingAmount, uint64(block.timestamp)
        );
    }

    function _facilityForLender(bytes32 facilityId) private view returns (Facility storage facility) {
        facility = facilities[facilityId];
        if (facility.lender == address(0)) revert FacilityNotFound(facilityId);
        if (facility.lender != msg.sender) revert NotFacilityLender(msg.sender);
    }
}

