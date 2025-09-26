use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod attestation {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let attestation_account = &mut ctx.accounts.attestation_account;
        attestation_account.authority = ctx.accounts.authority.key();
        attestation_account.bump = ctx.bumps.attestation_account;
        Ok(())
    }

    pub fn submit_proof(
        ctx: Context<SubmitProof>,
        proof_hash: [u8; 32],
        public_inputs: Vec<u8>,
    ) -> Result<()> {
        let _attestation_account = &mut ctx.accounts.attestation_account;
        let proof_record = &mut ctx.accounts.proof_record;

        // Store the proof hash and public inputs
        proof_record.proof_hash = proof_hash;
        proof_record.public_inputs = public_inputs;
        proof_record.submitter = ctx.accounts.submitter.key();
        proof_record.timestamp = Clock::get()?.unix_timestamp;
        proof_record.verified = false;

        // Emit event for off-chain verification
        emit!(ProofSubmitted {
            proof_hash,
            submitter: ctx.accounts.submitter.key(),
            timestamp: proof_record.timestamp,
        });

        Ok(())
    }

    pub fn verify_proof(
        ctx: Context<VerifyProof>,
        proof_hash: [u8; 32],
        is_valid: bool,
    ) -> Result<()> {
        let proof_record = &mut ctx.accounts.proof_record;
        
        require!(
            proof_record.proof_hash == proof_hash,
            ErrorCode::InvalidProofHash
        );

        proof_record.verified = is_valid;
        proof_record.verifier = Some(ctx.accounts.verifier.key());

        emit!(ProofVerified {
            proof_hash,
            verified: is_valid,
            verifier: ctx.accounts.verifier.key(),
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1,
        seeds = [b"attestation"],
        bump
    )]
    pub attestation_account: Account<'info, AttestationAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proof_hash: [u8; 32])]
pub struct SubmitProof<'info> {
    #[account(
        mut,
        seeds = [b"attestation"],
        bump = attestation_account.bump
    )]
    pub attestation_account: Account<'info, AttestationAccount>,
    #[account(
        init,
        payer = submitter,
        space = 8 + 32 + 4 + 1000 + 32 + 8 + 1 + 32,
        seeds = [b"proof", proof_hash.as_ref()],
        bump
    )]
    pub proof_record: Account<'info, ProofRecord>,
    #[account(mut)]
    pub submitter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proof_hash: [u8; 32])]
pub struct VerifyProof<'info> {
    #[account(
        mut,
        seeds = [b"attestation"],
        bump = attestation_account.bump
    )]
    pub attestation_account: Account<'info, AttestationAccount>,
    #[account(
        mut,
        seeds = [b"proof", proof_hash.as_ref()],
        bump
    )]
    pub proof_record: Account<'info, ProofRecord>,
    pub verifier: Signer<'info>,
}

#[account]
pub struct AttestationAccount {
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
pub struct ProofRecord {
    pub proof_hash: [u8; 32],
    pub public_inputs: Vec<u8>,
    pub submitter: Pubkey,
    pub timestamp: i64,
    pub verified: bool,
    pub verifier: Option<Pubkey>,
}

#[event]
pub struct ProofSubmitted {
    pub proof_hash: [u8; 32],
    pub submitter: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProofVerified {
    pub proof_hash: [u8; 32],
    pub verified: bool,
    pub verifier: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid proof hash")]
    InvalidProofHash,
}
