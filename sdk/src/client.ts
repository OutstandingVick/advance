import { Contract, type ContractRunner } from "ethers";
import { registryAbi, lenderAbi } from "./abi";
import { address, bytes32 } from "./validation";
import type { Address, Grant, Profile, Quote, ScoreSession } from "./types";

export class AdvanceReader {
  readonly registry: Contract;
  constructor(
    readonly registryAddress: Address,
    readonly runner: ContractRunner,
  ) {
    this.registry = new Contract(address(registryAddress), registryAbi, runner);
  }
  async getProfile(wallet: string): Promise<Profile> {
    return this.registry.getProfile(address(wallet));
  }
  async getGrant(id: string): Promise<Grant> {
    return this.registry.getGrant(bytes32(id));
  }
  async getScoreSession(id: string): Promise<ScoreSession> {
    return this.registry.getScoreSession(bytes32(id));
  }
  async computeScore(wallet: string): Promise<bigint> {
    return this.registry.computeScore(address(wallet));
  }
  async isScoreValid(id: string, consumer: string): Promise<boolean> {
    return this.registry.isScoreValid(bytes32(id), address(consumer));
  }
  async getQuote(lender: string, session: string): Promise<Quote> {
    const contract = new Contract(address(lender), lenderAbi, this.runner);
    if (address(await contract.ADVANCE()) !== address(this.registryAddress))
      throw new Error("Lender uses another registry.");
    return contract.quote.staticCall(bytes32(session));
  }
}
