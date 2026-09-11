// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {AdvanceTypes} from "../AdvanceTypes.sol";
import {IAdvance} from "../interfaces/IAdvance.sol";

/// @notice Minimal third-party integration. It contains no lender-specific logic.
contract AdvanceScoreConsumer {
    error InvalidScoreSession(bytes32 sessionId);

    IAdvance public immutable ADVANCE;
    uint64 public constant SESSION_LIFETIME = 1 hours;

    constructor(IAdvance advance) {
        ADVANCE = advance;
    }

    /// @dev The wallet must first create a grant whose consumer is this contract.
    function requestScore(bytes32 grantId) external returns (bytes32 sessionId) {
        return ADVANCE.requestScore(grantId, SESSION_LIFETIME);
    }

    /// @dev Never trust a stored score without rechecking session validity.
    function currentScore(bytes32 sessionId) external view returns (uint16 score) {
        if (!ADVANCE.isScoreValid(sessionId, address(this))) revert InvalidScoreSession(sessionId);
        AdvanceTypes.ScoreSession memory session = ADVANCE.getScoreSession(sessionId);
        return session.score;
    }
}
