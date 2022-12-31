use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use mpl_token_metadata::state::{Metadata, TokenMetadataAccount};

use crate::{
    state::Descriptor,
    utils::{transfer_lamports, verify_descriptor_mint, verify_metadata},
};

#[derive(Accounts)]
pub struct Close<'info> {
    /// entity that funds transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// descriptor authority, same as metadata update authority
    pub authority: Signer<'info>,

    /// CHECK: lamports destination for descriptor account lamports
    #[account(mut)]
    pub destination: UncheckedAccount<'info>,

    /// CHECK: descriptor account to close
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
}

pub fn close_handler(ctx: Context<Close>) -> Result<()> {
    let authority_account = &ctx.accounts.authority;
    let descriptor_account = &ctx.accounts.descriptor;
    let mint_account = &ctx.accounts.mint;
    let token_metadata_account = &ctx.accounts.token_metadata;

    let descriptor_account_info = &descriptor_account.to_account_info();
    let destination_account_info = &ctx.accounts.destination.to_account_info();

    let descriptor = Descriptor::from_account_info(&descriptor_account_info)?;
    let metadata: Metadata =
        Metadata::from_account_info(&token_metadata_account.to_account_info())?;

    // return early if descriptor is already empty
    if descriptor_account_info.data_len() == 0 {
        return Ok(());
    }

    verify_descriptor_mint(&descriptor, &mint_account.key())?;
    verify_metadata(&metadata, &authority_account.key(), &mint_account.key())?;

    transfer_lamports(
        &descriptor_account_info,
        &destination_account_info,
        descriptor_account_info.lamports(),
    )?;

    let mut source_data = descriptor_account_info.data.borrow_mut();
    source_data.fill(0);

    Ok(())
}
