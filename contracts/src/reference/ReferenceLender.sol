// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {AdvanceTypes} from "../AdvanceTypes.sol";
import {IAdvance} from "../interfaces/IAdvance.sol";

/// @title ReferenceLender
/// @notice Thin consumer showing how an independent lender can use an Advance score.
contract ReferenceLender {
    error InvalidScoreSession(bytes32 sessionId);

    struct Quote {
        uint16 annualRateBps;
        uint16 collateralBps;
        uint256 maxPrincipal;
    }

    IAdvance public immutable ADVANCE;
    string public lenderName;

    event ScoreRequested(bytes32 indexed grantId, bytes32 indexed sessionId);
    event QuoteProduced(
        bytes32 indexed sessionId,
        address indexed wallet,
        uint16 score,
        uint16 annualRateBps,
        uint16 collateralBps,
        uint256 maxPrincipal
    );

    constructor(IAdvance advance, string memory name) {
        ADVANCE = advance;
        lenderName = name;
    }

    function requestBorrowerScore(bytes32 grantId) external returns (bytes32 sessionId) {
        sessionId = ADVANCE.requestScore(grantId, 1 hours);
        emit ScoreRequested(grantId, sessionId);
    }

    function quote(bytes32 sessionId) external returns (Quote memory terms) {
        if (!ADVANCE.isScoreValid(sessionId, address(this))) revert InvalidScoreSession(sessionId);
        AdvanceTypes.ScoreSession memory session = ADVANCE.getScoreSession(sessionId);

        if (session.score >= 750) {
            terms = Quote({annualRateBps: 600, collateralBps: 11_000, maxPrincipal: 25_000e6});
        } else if (session.score >= 600) {
            terms = Quote({annualRateBps: 900, collateralBps: 12_500, maxPrincipal: 10_000e6});
        } else {
            terms = Quote({annualRateBps: 1_400, collateralBps: 15_000, maxPrincipal: 2_500e6});
        }

        emit QuoteProduced(
            sessionId,
            session.wallet,
            session.score,
            terms.annualRateBps,
            terms.collateralBps,
            terms.maxPrincipal
        );
    }
}

