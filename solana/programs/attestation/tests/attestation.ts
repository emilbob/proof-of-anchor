import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Attestation } from "../target/types/attestation";
import { expect } from "chai";

describe("attestation", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Attestation as Program<Attestation>;
  const provider = anchor.getProvider();

  it("Initializes the attestation account", async () => {
    const [attestationAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("attestation")],
      program.programId
    );

    const tx = await program.methods
      .initialize()
      .accounts({
        attestationAccount,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize transaction signature", tx);

    const account = await program.account.attestationAccount.fetch(
      attestationAccount
    );
    expect(account.authority.toString()).to.equal(
      provider.wallet.publicKey.toString()
    );
  });

  it("Submits a proof", async () => {
    const [attestationAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("attestation")],
      program.programId
    );

    const proofHash = new Uint8Array(32).fill(1);
    const publicInputs = Buffer.from("test public inputs");

    const [proofRecord] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), proofHash],
      program.programId
    );

    const tx = await program.methods
      .submitProof(proofHash, Array.from(publicInputs))
      .accounts({
        attestationAccount,
        proofRecord,
        submitter: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Submit proof transaction signature", tx);

    const account = await program.account.proofRecord.fetch(proofRecord);
    expect(account.proofHash).to.deep.equal(Array.from(proofHash));
    expect(account.submitter.toString()).to.equal(
      provider.wallet.publicKey.toString()
    );
  });
});
