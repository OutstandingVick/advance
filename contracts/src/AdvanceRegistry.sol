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
    error FailedSourceTransaction();
    error AmbiguousCreditEvent(uint256 count);
    error WrongSourceContract(address supplied, address expected);
    error MalformedCreditEvent();

    event GrantCreated(
        bytes32 indexed grantId,
        address indexed wallet,
        address indexed consumer,
        uint8 eventMask,
        uint64 expiresAt
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

    uint8 public constant ALL_EVENT_TYPES = 0x07;

    address public immutable SOURCE_CONTRACT;
    bytes32 public constant CREDIT_EVENT_SIGNATURE =
        keccak256("CreditEvent(address,bytes32,uint8,uint256,uint64)");

    uint256 private nextGrantNonce;
    mapping(bytes32 => AdvanceTypes.Grant) private grants;
    mapping(address => AdvanceTypes.Profile) private profiles;
    mapping(bytes32 => AdvanceTypes.ScoreSession) private scoreSessions;

    constructor(uint64 sourceChainKey, address sourceContract) AttestcoinVerifierAdapter(sourceChainKey) {
        if (sourceContract == address(0)) revert InvalidAddress();
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

        EvmV1Decoder.LogEntry[] memory logs =
            EvmV1Decoder.getLogsByEventSignature(receipt, CREDIT_EVENT_SIGNATURE);
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
