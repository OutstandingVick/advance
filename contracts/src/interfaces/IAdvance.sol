// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {AdvanceTypes} from "../AdvanceTypes.sol";

interface IAdvance {
    function createGrant(address consumer, uint8 eventMask, uint64 expiresAt) external returns (bytes32 grantId);
    function revokeGrant(bytes32 grantId) external;
    function requestScore(bytes32 grantId, uint64 validitySeconds) external returns (bytes32 sessionId);
    function isScoreValid(bytes32 sessionId, address consumer) external view returns (bool);
    function computeScore(address wallet) external view returns (uint16);
    function getGrant(bytes32 grantId) external view returns (AdvanceTypes.Grant memory);
    function getProfile(address wallet) external view returns (AdvanceTypes.Profile memory);
    function getScoreSession(bytes32 sessionId) external view returns (AdvanceTypes.ScoreSession memory);
}

