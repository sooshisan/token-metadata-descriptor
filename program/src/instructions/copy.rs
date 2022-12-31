use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use mpl_token_metadata::state::{Metadata, TokenMetadataAccount};

use crate::{
    state::{Descriptor, Encoding, Range},
    utils::{verify_descriptor_mint, verify_metadata, verify_non_empty_account},
    DescriptorError,
};

#[derive(Accounts)]
#[instruction(buffer_range: Range, descriptor_start: u64, encoding: Encoding)]
pub struct Copy<'info> {
    /// entity that funds transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// descriptor authority, same as metadata update authority
    pub authority: Signer<'info>,

    /// CHECK: read-only account
    pub buffer: UncheckedAccount<'info>,

    /// CHECK: descriptor into which we will copy buffer data
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

pub fn copy_handler(
    ctx: Context<Copy>,
    buffer_range: Range,
    descriptor_range_start: u64,
    encoding: Encoding,
) -> Result<()> {
    let authority_account = &ctx.accounts.authority;
    let buffer_account = &ctx.accounts.buffer;
    let descriptor_account = &ctx.accounts.descriptor;
    let mint_account = &ctx.accounts.mint;
    let token_metadata_account = &ctx.accounts.token_metadata;

    let descriptor_account_info = &descriptor_account.to_account_info();
    let token_metadata_account_info = &token_metadata_account.to_account_info();

    let metadata: Metadata = Metadata::from_account_info(&token_metadata_account_info)?;
    let mut descriptor = Descriptor::from_account_info(&descriptor_account_info)?;

    verify_descriptor_mint(&descriptor, &mint_account.key())?;
    verify_metadata(&metadata, &authority_account.key(), &mint_account.key())?;
    verify_non_empty_account(buffer_account)?;

    // verify ranges

    if buffer_range.end as usize > buffer_account.data_len() {
        return err!(DescriptorError::InvalidRange);
    }

    let descriptor_start_idx = Descriptor::base() + descriptor_range_start as usize;
    let buffer_start_idx = buffer_range.start as usize;
    let buffer_end_idx = buffer_range.end as usize;

    let buffer_range_length = (buffer_range.end - buffer_range.start) as usize;
    let descriptor_range_end = descriptor_start_idx + buffer_range_length;

    if descriptor_range_end > descriptor_account.data_len() {
        return err!(DescriptorError::InvalidRange);
    }

    // build new descriptor

    let data_len = (descriptor_start_idx - Descriptor::base()) + buffer_range_length;
    descriptor.data_len = data_len as u32;
    descriptor.encoding = encoding;

    // serialize desciptor and buffer data

    let descriptor_bytes = descriptor.try_to_vec().unwrap();
    let descriptor_length = descriptor_bytes.len();
    let descriptor_account_data = &mut descriptor_account_info.data.borrow_mut();

    descriptor_account_data[0..descriptor_length].copy_from_slice(&descriptor_bytes);
    descriptor_account_data[descriptor_start_idx..descriptor_range_end]
        .copy_from_slice(&buffer_account.data.borrow()[buffer_start_idx..buffer_end_idx]);

    Ok(())
}
