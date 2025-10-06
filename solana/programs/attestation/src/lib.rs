use anchor_lang::prelude::*;

declare_id!("4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW");

#[program]
pub mod attestation {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let attestation_account = &mut ctx.accounts.attestation_account;
        attestation_account.authority = ctx.accounts.authority.key();
        attestation_account.bump = ctx.bumps.attestation_account;
        attestation_account.total_projects = 0;
        attestation_account.total_verifications = 0;
        Ok(())
    }

    // Submit a project for transparency verification
    pub fn submit_project(
        ctx: Context<SubmitProject>,
        domain_hash: [u8; 32],
        project_name: String,
        transparency_score: u32,
        risk_level: u8,
        certificate_validity_hash: [u8; 32],
    ) -> Result<()> {
        let attestation_account = &mut ctx.accounts.attestation_account;
        let project_record = &mut ctx.accounts.project_record;

        // Validate inputs
        require!(transparency_score <= 100, ErrorCode::InvalidTransparencyScore);
        require!(risk_level <= 10, ErrorCode::InvalidRiskLevel);
        require!(project_name.len() <= 100, ErrorCode::ProjectNameTooLong);

        // Store project data
        project_record.domain_hash = domain_hash;
        project_record.project_name = project_name;
        project_record.transparency_score = transparency_score;
        project_record.risk_level = risk_level;
        project_record.certificate_validity_hash = certificate_validity_hash;
        project_record.submitter = ctx.accounts.submitter.key();
        project_record.timestamp = Clock::get()?.unix_timestamp;
        project_record.verified = false;
        project_record.verification_count = 0;
        project_record.positive_votes = 0;
        project_record.negative_votes = 0;
        project_record.final_score = 0;

        // Update global counters
        attestation_account.total_projects += 1;

        emit!(ProjectSubmitted {
            domain_hash,
            project_name: project_record.project_name.clone(),
            transparency_score,
            risk_level,
            submitter: ctx.accounts.submitter.key(),
            timestamp: project_record.timestamp,
        });

        Ok(())
    }

    // Community verification vote
    pub fn vote_on_project(
        ctx: Context<VoteOnProject>,
        domain_hash: [u8; 32],
        is_legitimate: bool,
        confidence_level: u8,
    ) -> Result<()> {
        let project_record = &mut ctx.accounts.project_record;
        let voter_record = &mut ctx.accounts.voter_record;

        // Validate inputs
        require!(confidence_level <= 10, ErrorCode::InvalidConfidenceLevel);

        // Check if voter has already voted on this project
        require!(!voter_record.has_voted, ErrorCode::AlreadyVoted);

        // Update vote counts
        if is_legitimate {
            project_record.positive_votes += 1;
        } else {
            project_record.negative_votes += 1;
        }

        project_record.verification_count += 1;

        // Mark voter as having voted
        voter_record.has_voted = true;
        voter_record.vote = is_legitimate;
        voter_record.confidence_level = confidence_level;
        voter_record.timestamp = Clock::get()?.unix_timestamp;

        // Calculate final score (weighted average)
        let total_votes = project_record.positive_votes + project_record.negative_votes;
        if total_votes >= 5 { // Minimum votes for verification
            let legitimacy_ratio = (project_record.positive_votes as f64) / (total_votes as f64);
            project_record.final_score = (legitimacy_ratio * 100.0) as u32;
            project_record.verified = project_record.final_score >= 70; // 70% threshold for legitimacy
        }

        emit!(ProjectVoted {
            domain_hash,
            voter: ctx.accounts.voter.key(),
            is_legitimate,
            confidence_level,
            total_votes,
            final_score: project_record.final_score,
            verified: project_record.verified,
        });

        Ok(())
    }

    // Verify a project's zkTLS proof
    pub fn verify_zk_tls_proof(
        ctx: Context<VerifyZkTlsProof>,
        domain_hash: [u8; 32],
        proof_hash: [u8; 32],
        public_inputs: Vec<u8>,
        is_valid: bool,
    ) -> Result<()> {
        let attestation_account = &mut ctx.accounts.attestation_account;
        let proof_record = &mut ctx.accounts.proof_record;

        // Store the proof verification
        proof_record.proof_hash = proof_hash;
        proof_record.public_inputs = public_inputs;
        proof_record.submitter = ctx.accounts.submitter.key();
        proof_record.timestamp = Clock::get()?.unix_timestamp;
        proof_record.verified = is_valid;
        proof_record.verifier = Some(ctx.accounts.verifier.key());

        // Update global counters
        attestation_account.total_verifications += 1;

        emit!(ZkTLSProofVerified {
            domain_hash,
            proof_hash,
            verified: is_valid,
            verifier: ctx.accounts.verifier.key(),
            timestamp: proof_record.timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8 + 8, // authority + bump + total_projects + total_verifications
        seeds = [b"attestation"],
        bump
    )]
    pub attestation_account: Account<'info, AttestationAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(domain_hash: [u8; 32])]
pub struct SubmitProject<'info> {
    #[account(
        mut,
        seeds = [b"attestation"],
        bump = attestation_account.bump
    )]
    pub attestation_account: Account<'info, AttestationAccount>,
    #[account(
        init,
        payer = submitter,
        space = 8 + 32 + 4 + 100 + 4 + 1 + 32 + 32 + 8 + 1 + 8 + 8 + 8 + 4, // domain_hash + project_name + transparency_score + risk_level + certificate_validity_hash + submitter + timestamp + verified + verification_count + positive_votes + negative_votes + final_score
        seeds = [b"project", domain_hash.as_ref()],
        bump
    )]
    pub project_record: Account<'info, ProjectRecord>,
    #[account(mut)]
    pub submitter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(domain_hash: [u8; 32])]
pub struct VoteOnProject<'info> {
    #[account(
        mut,
        seeds = [b"project", domain_hash.as_ref()],
        bump
    )]
    pub project_record: Account<'info, ProjectRecord>,
    #[account(
        init,
        payer = voter,
        space = 8 + 32 + 1 + 1 + 8, // voter + has_voted + vote + confidence_level + timestamp
        seeds = [b"vote", domain_hash.as_ref(), voter.key().as_ref()],
        bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proof_hash: [u8; 32])]
pub struct VerifyZkTlsProof<'info> {
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
    pub verifier: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct AttestationAccount {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_projects: u64,
    pub total_verifications: u64,
}

#[account]
pub struct ProjectRecord {
    pub domain_hash: [u8; 32],
    pub project_name: String,
    pub transparency_score: u32,
    pub risk_level: u8,
    pub certificate_validity_hash: [u8; 32],
    pub submitter: Pubkey,
    pub timestamp: i64,
    pub verified: bool,
    pub verification_count: u64,
    pub positive_votes: u64,
    pub negative_votes: u64,
    pub final_score: u32,
}

#[account]
pub struct VoterRecord {
    pub voter: Pubkey,
    pub has_voted: bool,
    pub vote: bool,
    pub confidence_level: u8,
    pub timestamp: i64,
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
pub struct ProjectSubmitted {
    pub domain_hash: [u8; 32],
    pub project_name: String,
    pub transparency_score: u32,
    pub risk_level: u8,
    pub submitter: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProjectVoted {
    pub domain_hash: [u8; 32],
    pub voter: Pubkey,
    pub is_legitimate: bool,
    pub confidence_level: u8,
    pub total_votes: u64,
    pub final_score: u32,
    pub verified: bool,
}

#[event]
pub struct ZkTLSProofVerified {
    pub domain_hash: [u8; 32],
    pub proof_hash: [u8; 32],
    pub verified: bool,
    pub verifier: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid proof hash")]
    InvalidProofHash,
    #[msg("Invalid transparency score")]
    InvalidTransparencyScore,
    #[msg("Invalid risk level")]
    InvalidRiskLevel,
    #[msg("Project name too long")]
    ProjectNameTooLong,
    #[msg("Invalid confidence level")]
    InvalidConfidenceLevel,
    #[msg("Already voted on this project")]
    AlreadyVoted,
}
