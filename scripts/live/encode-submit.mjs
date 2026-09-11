import { readFileSync } from "node:fs";
import { Interface } from "ethers";

const proof = JSON.parse(readFileSync(".advance/proof.json", "utf8"));
const artifact = JSON.parse(readFileSync("out/AdvanceRegistry.sol/AdvanceRegistry.json", "utf8"));
const iface = new Interface(artifact.abi);

process.stdout.write(
  iface.encodeFunctionData("submitAttestedEvent", [
    1,
    proof.chainKey,
    proof.headerNumber,
    proof.txBytes,
    proof.merkleProof.root,
    proof.merkleProof.siblings,
    proof.continuityProof.lowerEndpointDigest,
    proof.continuityProof.roots,
  ]),
);
