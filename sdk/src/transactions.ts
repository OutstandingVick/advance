import { Contract, type ContractTransactionResponse, type TransactionReceipt } from "ethers";
import { AdvanceReader } from "./client";
import { lenderAbi } from "./abi";
import { address, bytes32, parseProof } from "./validation";
import type { Hex, OnTransaction, ProofBundle } from "./types";

export class AdvanceClient extends AdvanceReader {
  private async send(
    call: () => Promise<ContractTransactionResponse>,
    event: string,
    field: string,
    notify?: OnTransaction,
  ): Promise<{ id: Hex; receipt: TransactionReceipt }> {
    notify?.("awaiting-wallet");
    const tx = await call();
    notify?.("submitted", tx.hash);
    let receipt: TransactionReceipt | null;
    try {
      receipt = await tx.wait();
    } catch (error) {
      const replacement = error as {
        code?: string;
        cancelled?: boolean;
        receipt?: TransactionReceipt;
      };
      // Only a same-intent gas-price replacement may complete this operation.
      if (
        replacement.code !== "TRANSACTION_REPLACED" ||
        replacement.cancelled ||
        !replacement.receipt
      )
        throw error;
      receipt = replacement.receipt;
    }
    if (!receipt || receipt.status !== 1)
      throw new Error("Transaction did not confirm successfully.");
    notify?.("confirmed", receipt.hash);
    for (const log of receipt.logs) {
      if (address(log.address) !== address(this.registryAddress)) continue;
      const decoded = this.registry.interface.parseLog(log);
      if (decoded?.name === event) return { id: decoded.args[field] as Hex, receipt };
    }
    throw new Error(`Confirmed transaction did not emit ${event}. Refresh before retrying.`);
  }
  createGrant(consumer: string, expiresAt: bigint, notify?: OnTransaction) {
    return this.send(
      () => this.registry.createGrant(address(consumer), 7, expiresAt),
      "GrantCreated",
      "grantId",
      notify,
    );
  }
  revokeGrant(grantId: string, notify?: OnTransaction) {
    return this.send(
      () => this.registry.revokeGrant(bytes32(grantId)),
      "GrantRevoked",
      "grantId",
      notify,
    );
  }
  requestScore(lender: string, grantId: string, notify?: OnTransaction) {
    const contract = new Contract(address(lender), lenderAbi, this.runner);
    return this.send(
      async () => {
        if (address(await contract.ADVANCE()) !== address(this.registryAddress))
          throw new Error("Lender uses another registry.");
        return contract.requestBorrowerScore(bytes32(grantId));
      },
      "ScoreIssued",
      "sessionId",
      notify,
    );
  }
  submitEvidence(action: number, input: ProofBundle, notify?: OnTransaction) {
    if (![0, 1, 2].includes(action)) throw new Error("Unsupported credit event action.");
    const p = parseProof(input);
    return this.send(
      () =>
        this.registry.submitAttestedEvent(
          action,
          p.chainKey,
          p.headerNumber,
          p.txBytes,
          p.merkleProof.root,
          p.merkleProof.siblings,
          p.continuityProof.lowerEndpointDigest,
          p.continuityProof.roots,
        ),
      "EvidenceAccepted",
      "evidenceId",
      notify,
    );
  }
}
