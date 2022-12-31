use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use mpl_token_metadata::state::{Metadata, TokenMetadataAccount};

use crate::{
    state::Descriptor,
    utils::{resize_account, verify_descriptor_mint, verify_metadata},
};

#[derive(Accounts)]
#[instruction(new_size: u64)]
pub struct Resize<'info> {
    /// entity that funds transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// descriptor authority, same as metadata update authority
    pub authority: Signer<'info>,

    /// CHECK: descriptor account to resize
    #[account(
        mut,
        constraint = descriptor.to_account_info().owner == program_id,
    )]
    pub descriptor: UncheckedAccount<'info>,

    /// mint associated with the descriptor
    pub mint: Account<'info, Mint>,

    /// CHECK: metadata associated with the mint
    #[account(
        constraint = token_metadata.owner == token_metadata_program.key &&
        token_metadata.to_account_info().data_len() > 0
    )]
    pub token_metadata: UncheckedAccount<'info>,

    /// CHECK: token metadata program
    #[account(address = mpl_token_metadata::id())]
    pub token_metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn resize_handler(ctx: Context<Resize>, new_size: u64) -> Result<()> {
    let payer_account = &ctx.accounts.payer;
    let authority_account = &ctx.accounts.authority;
    let descriptor_account = &ctx.accounts.descriptor;
    let mint_account = &ctx.accounts.mint;
    let token_metadata_account = &ctx.accounts.token_metadata;
    let system_program = &ctx.accounts.system_program;

    let payer_account_info = &payer_account.to_account_info();
    let descriptor_account_info = &descriptor_account.to_account_info();
    let token_metadata_account_info = &token_metadata_account.to_account_info();
    let system_program_account_info = &system_program.to_account_info();

    let rent = Rent::get()?;
    let mint_key = mint_account.key();

    let descriptor = Descriptor::from_account_info(&descriptor_account_info)?;
    let metadata: Metadata =
        Metadata::from_account_info(&token_metadata_account_info)?;

    verify_descriptor_mint(&descriptor, &mint_key)?;
    verify_metadata(&metadata, &authority_account.key(), &mint_key)?;

    resize_account(
        &payer_account_info,
        &descriptor_account_info,
        new_size as usize,
        &system_program_account_info,
        &rent,
    )?;

    Ok(())
}
