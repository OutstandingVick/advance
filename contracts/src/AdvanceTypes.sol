// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library AdvanceTypes {
    enum CreditEventType {
        LoanOpened,
        PaymentRecorded,
        DefaultRecorded
    }

    struct Grant {
        address wallet;
        address consumer;
        uint64 sourceChainKey;
        address sourceContract;
        uint8 eventMask;
        uint64 expiresAt;
        bool revoked;
    }

    struct Profile {
        uint32 loansOpened;
        uint32 paymentsRecorded;
        uint32 defaultsRecorded;
        uint64 lastActivityAt;
        uint64 version;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 totalDefaulted;
    }

    struct ScoreSession {
        bytes32 grantId;
        address wallet;
        address consumer;
        uint16 score;
        uint64 profileVersion;
        uint64 issuedAt;
        uint64 expiresAt;
    }
}

