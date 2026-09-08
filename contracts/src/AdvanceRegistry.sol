// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ASCBase} from "@gluwa/asc-contracts/contracts/readability/ASCBase.sol";
import {AdvanceTypes} from "./AdvanceTypes.sol";
import {IAdvance} from "./interfaces/IAdvance.sol";

/// @title AdvanceRegistry
/// @notice Permissioned, reusable credit signals backed by Attestcoin-verified source events.
contract AdvanceRegistry is ASCBase, IAdvance {
    error InvalidAddress();
    error InvalidExpiry();
    error InvalidEventMask();
    error GrantNotFound(bytes32 grantId);
    error NotGrantOwner(address caller);
    error UnsupportedAction(uint8 action);

    event GrantCreated(
        bytes32 indexed grantId,
        address indexed wallet,
        address indexed consumer,
        uint8 eventMask,
        uint64 expiresAt
    );
    event GrantRevoked(bytes32 indexed grantId, address indexed wallet, address indexed consumer);

    uint8 public constant ALL_EVENT_TYPES = 0x07;

    uint64 public immutable SOURCE_CHAIN_KEY;
    address public immutable SOURCE_CONTRACT;

    uint256 private nextGrantNonce;
    mapping(bytes32 => AdvanceTypes.Grant) private grants;
    mapping(address => AdvanceTypes.Profile) private profiles;
    mapping(bytes32 => AdvanceTypes.ScoreSession) private scoreSessions;

    constructor(uint64 sourceChainKey, address sourceContract) {
        if (sourceContract == address(0)) revert InvalidAddress();
        SOURCE_CHAIN_KEY = sourceChainKey;
        SOURCE_CONTRACT = sourceContract;
    }

    function createGrant(address consumer, uint8 eventMask, uint64 expiresAt)
        external
        returns (bytes32 grantId)
    {
        if (consumer == address(0)) revert InvalidAddress();
        if (expiresAt <= block.timestamp) revert InvalidExpiry();
        if (eventMask == 0 || eventMask & ~ALL_EVENT_TYPES != 0) revert InvalidEventMask();

        grantId = keccak256(abi.encode(msg.sender, consumer, ++nextGrantNonce, block.chainid));
        grants[grantId] = AdvanceTypes.Grant({
            wallet: msg.sender,
            consumer: consumer,
            sourceChainKey: SOURCE_CHAIN_KEY,
            sourceContract: SOURCE_CONTRACT,
            eventMask: eventMask,
            expiresAt: expiresAt,
            revoked: false
        });

        emit GrantCreated(grantId, msg.sender, consumer, eventMask, expiresAt);
    }

    function revokeGrant(bytes32 grantId) external {
        AdvanceTypes.Grant storage grant = _grant(grantId);
        if (grant.wallet != msg.sender) revert NotGrantOwner(msg.sender);
        grant.revoked = true;
        emit GrantRevoked(grantId, grant.wallet, grant.consumer);
    }

    function getGrant(bytes32 grantId) external view returns (AdvanceTypes.Grant memory) {
        return _grant(grantId);
    }

    function getProfile(address wallet) external view returns (AdvanceTypes.Profile memory) {
        return profiles[wallet];
    }

    function getScoreSession(bytes32 sessionId) external view returns (AdvanceTypes.ScoreSession memory) {
        return scoreSessions[sessionId];
    }

    function _grant(bytes32 grantId) internal view returns (AdvanceTypes.Grant storage grant) {
        grant = grants[grantId];
        if (grant.wallet == address(0)) revert GrantNotFound(grantId);
    }

    function _processAndEmitEvent(uint8 action, bytes32, bytes memory) internal pure override {
        revert UnsupportedAction(action);
    }

    function requestScore(bytes32, uint64) external pure returns (bytes32) {
        revert("score sessions not implemented");
    }

    function isScoreValid(bytes32, address) external pure returns (bool) {
        return false;
    }

    function computeScore(address) external pure returns (uint16) {
        return 500;
    }
}

