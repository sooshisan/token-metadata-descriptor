use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use mpl_token_metadata::state::{Metadata, TokenMetadataAccount};

use crate::{
    state::Encoding,
    utils::{initialize_descriptor_helper, verify_empty_account, verify_metadata},
};

#[derive(Accounts)]
// todo: does this mismatch work?
#[instruction(encoding: Encoding, bump: u8, data: Vec<u8>)]
pub struct InitializeWithData<'info> {
    /// entity that funds transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// descriptor authority, same as metadata update authority
    pub authority: Signer<'info>,

    /// CHECK: descriptor account to initialize
    #[account(mut)]
    pub descriptor: UncheckedAccount<'info>,

    /// mint associated with the descriptor
    pub mint: Account<'info, Mint>,

    /// CHECK: metadata associated with the mint
    #[account(
        constraint = token_metadata.owner == token_metadata_program.key &&
        token_metadata.to_account_info().data_len() > 0
    )]
    pub token_metadata: UncheckedAccount<'info>,

    /// CHECK: mpl token metadata
    #[account(address = mpl_token_metadata::id())]
    pub token_metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_with_data_handler(
    ctx: Context<InitializeWithData>,
    encoding: Encoding,
    bump: u8,
    data: &Vec<u8>,
) -> Result<()> {
    let payer_account_info = &ctx.accounts.payer.to_account_info();
    let authority_account_info = &ctx.accounts.authority.to_account_info();
    let descriptor_account_info = &ctx.accounts.descriptor.to_account_info();
    let mint_account_info = &ctx.accounts.mint.to_account_info();
    let token_metadata_account_info = &ctx.accounts.token_metadata.to_account_info();
    let system_program_info = &ctx.accounts.system_program.to_account_info();

    let rent = Rent::get()?;
    let mint_key = mint_account_info.key();

    let metadata = Metadata::from_account_info(&token_metadata_account_info)?;

    verify_metadata(&metadata, &authority_account_info.key(), &mint_key)?;
    verify_empty_account(&descriptor_account_info)?;

    let data_len = data.len();
    let descriptor = initialize_descriptor_helper(
        &payer_account_info,
        &descriptor_account_info,
        &system_program_info,
        &rent,
        bump,
        &mint_key,
        encoding,
        data_len as u32,
    )?;

    let descriptor_bytes = descriptor.try_to_vec().unwrap();
    let descriptor_attributes_len = descriptor_bytes.len();

    let descriptor_account_data = &mut descriptor_account_info.data.borrow_mut();
    descriptor_account_data[0..descriptor_attributes_len].copy_from_slice(&descriptor_bytes);

    let descriptor_range_end = descriptor_bytes.len() + data_len;
    descriptor_account_data[descriptor_attributes_len..descriptor_range_end]
        .copy_from_slice(&data[..]);

    Ok(())
}
