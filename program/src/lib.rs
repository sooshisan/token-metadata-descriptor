use anchor_lang::prelude::*;
use solana_security_txt::security_txt;

mod constants;
pub mod instructions;
pub mod state;
mod utils;

use constants::*;
use instructions::*;
use state::*;

declare_id!("DesCwDwfrbxTDSjAm5Xjqh9Cij5Ucb46F6qH7cwieXB");

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "Token Metadata Descriptor",
    project_url: "https://github.com/sooshisan/token-metadata-descriptor",
    contacts: "link:https://github.com/sooshisan/token-metadata-descriptor/security/advisories/new",
    policy: "https://github.com/sooshisan/token-metadata-descriptor/blob/main/SECURITY.md",
    preferred_languages: "en"
}

#[program]
pub mod token_metadata_descriptor {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        data_size: u64,
        encoding: Encoding,
        bump: u8,
    ) -> Result<()> {
        instructions::initialize_handler(ctx, data_size, encoding, bump)
    }

    pub fn resize(ctx: Context<Resize>, new_size: u64) -> Result<()> {
        instructions::resize_handler(ctx, new_size)
    }

    pub fn copy(
        ctx: Context<Copy>,
        buffer_range: Range,
        descriptor_start_range: u64,
        encoding: Encoding,
    ) -> Result<()> {
        instructions::copy_handler(ctx, buffer_range, descriptor_start_range, encoding)
    }

    pub fn close(ctx: Context<Close>) -> Result<()> {
        instructions::close_handler(ctx)
    }

    /// Combination of `initialize` and `copy` in one instruction
    pub fn initialize_with_buffer(
        ctx: Context<InitializeWithBuffer>,
        range: Option<Range>,
        encoding: Encoding,
        bump: u8,
    ) -> Result<()> {
        instructions::initialize_with_buffer_handler(ctx, range, encoding, bump)
    }

    /// Special version of `initialize` with data passed in directly as the MTU
    /// upper bound (1280 bytes) is observed. This can be used to avoid the overhead
    /// of building multiple instructions and or dealing with an intermediary buffer.
    pub fn initialize_with_data(
        ctx: Context<InitializeWithData>,
        encoding: Encoding,
        bump: u8,
        data: Vec<u8>
    ) -> Result<()> {
        instructions::initialize_with_data_handler(ctx, encoding, bump, &data)
    }
}

#[error_code]
pub enum DescriptorError {
    #[msg("Authority is not allowed to perform such action")]
    IncorrectAuthority,
    #[msg("Account already initialized")]
    Initialized,
    #[msg("Account is not initialized")]
    Uninitialized,
    #[msg("Mint Mismatch")]
    MintMismatch,
    #[msg("Incorrect seeds")]
    IncorrectSeeds,
    #[msg("Target account exceeds limit")]
    AccountTooLarge,
    #[msg("Invalid range")]
    InvalidRange,
    #[msg("Math error")]
    MathError,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}
