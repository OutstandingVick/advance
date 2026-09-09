// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {EvmV1Decoder} from "@gluwa/asc-contracts/contracts/common/EvmV1Decoder.sol";
import {AttestcoinVerifierAdapter} from "./AttestcoinVerifierAdapter.sol";
import {AdvanceTypes} from "./AdvanceTypes.sol";
import {IAdvance} from "./interfaces/IAdvance.sol";

/// @title AdvanceRegistry
/// @notice Permissioned, reusable credit signals backed by Attestcoin-verified source events.
contract AdvanceRegistry is AttestcoinVerifierAdapter, IAdvance {
    error InvalidAddress();
    error InvalidExpiry();
    error InvalidEventMask();
    error GrantNotFound(bytes32 grantId);
    error NotGrantOwner(address caller);
    error UnsupportedAction(uint8 action);
    error GrantInactive(bytes32 grantId);
    error UnauthorizedConsumer(address caller);
    error InvalidScoreValidity();
    error FailedSourceTransaction();
    error AmbiguousCreditEvent(uint256 count);
    error WrongSourceContract(address supplied, address expected);
    error MalformedCreditEvent();

    event GrantCreated(
        bytes32 indexed grantId, address indexed wallet, address indexed consumer, uint8 eventMask, uint64 expiresAt
    );
    event GrantRevoked(bytes32 indexed grantId, address indexed wallet, address indexed consumer);
    event EvidenceAccepted(
        bytes32 indexed evidenceId,
        address indexed wallet,
        bytes32 indexed facilityId,
        AdvanceTypes.CreditEventType eventType,
        uint256 amount,
        uint64 occurredAt,
        uint64 profileVersion
    );
    event ScoreIssued(
        bytes32 indexed sessionId,
        bytes32 indexed grantId,
        address indexed consumer,
        address wallet,
        uint16 score,
        uint64 profileVersion,
        uint64 expiresAt
    );

    uint8 public constant ALL_EVENT_TYPES = 0x07;
    uint64 public constant MIN_SCORE_VALIDITY = 5 minutes;
    uint64 public constant MAX_SCORE_VALIDITY = 24 hours;

    address public immutable SOURCE_CONTRACT;
    bytes32 public constant CREDIT_EVENT_SIGNATURE = keccak256("CreditEvent(address,bytes32,uint8,uint256,uint64)");

    uint256 private nextGrantNonce;
    uint256 private nextSessionNonce;
    mapping(bytes32 => AdvanceTypes.Grant) private grants;
    mapping(address => AdvanceTypes.Profile) private profiles;
    mapping(bytes32 => AdvanceTypes.ScoreSession) private scoreSessions;

    constructor(uint64 sourceChainKey, address sourceContract) AttestcoinVerifierAdapter(sourceChainKey) {
        if (sourceContract == address(0)) revert InvalidAddress();
        SOURCE_CONTRACT = sourceContract;
    }

    function createGrant(address consumer, uint8 eventMask, uint64 expiresAt) external returns (bytes32 grantId) {
        if (consumer == address(0)) revert InvalidAddress();
        if (expiresAt <= block.timestamp) revert InvalidExpiry();
        // The MVP refuses selective disclosure because hiding negative events would make
        // the resulting score misleading. The field is retained for future proof policy.
        if (eventMask != ALL_EVENT_TYPES) revert InvalidEventMask();

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

    function _processVerifiedEvent(uint8 action, bytes32 evidenceId, bytes memory encodedTransaction)
        internal
        override
    {
        if (action > uint8(AdvanceTypes.CreditEventType.DefaultRecorded)) revert UnsupportedAction(action);
        if (!EvmV1Decoder.isValidTransactionType(EvmV1Decoder.getTransactionType(encodedTransaction))) {
            revert MalformedCreditEvent();
        }

        EvmV1Decoder.ReceiptFields memory receipt = EvmV1Decoder.decodeReceiptFields(encodedTransaction);
        if (receipt.receiptStatus != 1) revert FailedSourceTransaction();

        EvmV1Decoder.LogEntry[] memory logs = EvmV1Decoder.getLogsByEventSignature(receipt, CREDIT_EVENT_SIGNATURE);
        if (logs.length != 1) revert AmbiguousCreditEvent(logs.length);

        EvmV1Decoder.LogEntry memory creditLog = logs[0];
        if (creditLog.address_ != SOURCE_CONTRACT) {
            revert WrongSourceContract(creditLog.address_, SOURCE_CONTRACT);
        }
        if (creditLog.topics.length != 3 || creditLog.data.length != 96) revert MalformedCreditEvent();

        address wallet = address(uint160(uint256(creditLog.topics[1])));
        bytes32 facilityId = creditLog.topics[2];
        (AdvanceTypes.CreditEventType eventType, uint256 amount, uint64 occurredAt) =
            abi.decode(creditLog.data, (AdvanceTypes.CreditEventType, uint256, uint64));
        if (uint8(eventType) != action) revert UnsupportedAction(action);
        AdvanceTypes.Profile storage profile = profiles[wallet];
        if (eventType == AdvanceTypes.CreditEventType.LoanOpened) {
            profile.loansOpened++;
            profile.totalBorrowed += amount;
        } else if (eventType == AdvanceTypes.CreditEventType.PaymentRecorded) {
            profile.paymentsRecorded++;
            profile.totalRepaid += amount;
        } else {
            profile.defaultsRecorded++;
            profile.totalDefaulted += amount;
        }
        profile.lastActivityAt = occurredAt;
        profile.version++;

        emit EvidenceAccepted(evidenceId, wallet, facilityId, eventType, amount, occurredAt, profile.version);
    }

    function requestScore(bytes32 grantId, uint64 validitySeconds) external returns (bytes32 sessionId) {
        AdvanceTypes.Grant storage grant = _grant(grantId);
        if (!_isGrantActive(grant)) revert GrantInactive(grantId);
        if (grant.consumer != msg.sender) revert UnauthorizedConsumer(msg.sender);
        if (validitySeconds < MIN_SCORE_VALIDITY || validitySeconds > MAX_SCORE_VALIDITY) {
            revert InvalidScoreValidity();
        }

        AdvanceTypes.Profile storage profile = profiles[grant.wallet];
        uint16 score = _computeScore(profile);
        uint64 issuedAt = uint64(block.timestamp);
        uint64 expiresAt = issuedAt + validitySeconds;
        if (expiresAt > grant.expiresAt) expiresAt = grant.expiresAt;
        sessionId = keccak256(abi.encode(grantId, msg.sender, ++nextSessionNonce, profile.version));
        scoreSessions[sessionId] = AdvanceTypes.ScoreSession({
            grantId: grantId,
            wallet: grant.wallet,
            consumer: msg.sender,
            score: score,
            profileVersion: profile.version,
            issuedAt: issuedAt,
            expiresAt: expiresAt
        });

        emit ScoreIssued(sessionId, grantId, msg.sender, grant.wallet, score, profile.version, expiresAt);
    }

    function isScoreValid(bytes32 sessionId, address consumer) public view returns (bool) {
        AdvanceTypes.ScoreSession storage session = scoreSessions[sessionId];
        if (session.wallet == address(0) || session.consumer != consumer || session.expiresAt <= block.timestamp) {
            return false;
        }
        AdvanceTypes.Grant storage grant = grants[session.grantId];
        return _isGrantActive(grant) && profiles[session.wallet].version == session.profileVersion;
    }

    function computeScore(address wallet) public view returns (uint16) {
        return _computeScore(profiles[wallet]);
    }

    function _isGrantActive(AdvanceTypes.Grant storage grant) internal view returns (bool) {
        return grant.wallet != address(0) && !grant.revoked && grant.expiresAt > block.timestamp;
    }

    function _computeScore(AdvanceTypes.Profile storage profile) internal view returns (uint16) {
        uint256 positive =
            _min(uint256(profile.loansOpened) * 10, 50) + _min(uint256(profile.paymentsRecorded) * 25, 250);
        if (profile.totalBorrowed != 0) {
            positive += _min(profile.totalRepaid * 100 / profile.totalBorrowed, 100);
        }
        uint256 penalty = _min(uint256(profile.defaultsRecorded) * 150, 400);
        uint256 raw = 500 + positive;
        raw = penalty >= raw ? 100 : raw - penalty;
        return uint16(_min(raw, 900));
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}
