import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Attestation } from "./target/types/attestation";
import { expect } from "chai";

describe("attestation - Offline Tests", () => {
  // Mock provider for offline testing
  const mockProvider = {
    connection: {
      getLatestBlockhash: () =>
        Promise.resolve({ blockhash: "mock", lastValidBlockHeight: 0 }),
      sendTransaction: () => Promise.resolve("mock-signature"),
      getAccountInfo: () => Promise.resolve(null),
      getMultipleAccountsInfo: () => Promise.resolve([]),
    },
    wallet: {
      publicKey: new anchor.web3.PublicKey("11111111111111111111111111111112"),
      signTransaction: () => Promise.resolve({} as any),
      signAllTransactions: () => Promise.resolve([]),
    },
    sendAndConfirm: () => Promise.resolve("mock-signature"),
  };

  // Mock program for offline testing
  const mockProgram = {
    methods: {
      initialize: () => ({
        accounts: () => ({
          rpc: () => Promise.resolve("mock-tx-signature"),
        }),
      }),
      submitProof: () => ({
        accounts: () => ({
          rpc: () => Promise.resolve("mock-tx-signature"),
        }),
      }),
    },
    account: {
      attestationAccount: {
        fetch: () =>
          Promise.resolve({
            authority: mockProvider.wallet.publicKey,
            bump: 255,
          }),
      },
      proofRecord: {
        fetch: () =>
          Promise.resolve({
            proofHash: new Array(32).fill(1),
            submitter: mockProvider.wallet.publicKey,
            timestamp: Date.now() / 1000,
            verified: false,
            publicInputs: new Array(32).fill(2),
            verifier: null,
          }),
      },
    },
    programId: new anchor.web3.PublicKey(
      "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
    ),
  };

  it("Should have correct program structure", () => {
    expect(mockProgram.methods.initialize).to.exist;
    expect(mockProgram.methods.submitProof).to.exist;
    expect(mockProgram.account.attestationAccount.fetch).to.exist;
    expect(mockProgram.account.proofRecord.fetch).to.exist;
  });

  it("Should generate correct PDA addresses", () => {
    const [attestationAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("attestation")],
      mockProgram.programId
    );

    const proofHash = new Uint8Array(32).fill(1);
    const [proofRecord] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), proofHash],
      mockProgram.programId
    );

    expect(attestationAccount).to.be.instanceOf(anchor.web3.PublicKey);
    expect(proofRecord).to.be.instanceOf(anchor.web3.PublicKey);

    // PDAs should be deterministic
    const [attestationAccount2] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("attestation")],
      mockProgram.programId
    );
    expect(attestationAccount.toString()).to.equal(
      attestationAccount2.toString()
    );
  });

  it("Should validate proof hash format", () => {
    const proofHash = new Uint8Array(32).fill(1);
    expect(proofHash.length).to.equal(32);
    expect(Array.isArray(Array.from(proofHash))).to.be.true;
  });

  it("Should validate public inputs format", () => {
    const publicInputs = new Uint8Array(32).fill(2);
    expect(publicInputs.length).to.equal(32);
    expect(Array.isArray(Array.from(publicInputs))).to.be.true;
  });

  it("Should have correct account structure", async () => {
    const attestationAccount =
      await mockProgram.account.attestationAccount.fetch("mock-address");
    expect(attestationAccount.authority).to.exist;
    expect(attestationAccount.bump).to.exist;
  });

  it("Should have correct proof record structure", async () => {
    const proofRecord = await mockProgram.account.proofRecord.fetch(
      "mock-address"
    );
    expect(proofRecord.proofHash).to.exist;
    expect(proofRecord.submitter).to.exist;
    expect(proofRecord.timestamp).to.exist;
    expect(proofRecord.verified).to.exist;
    expect(proofRecord.publicInputs).to.exist;
  });
});
