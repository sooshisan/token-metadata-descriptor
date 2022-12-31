use crate::{
    state::{Descriptor, Encoding},
    DescriptorError,
};
use anchor_lang::prelude::*;
use mpl_token_metadata::state::Metadata;
use solana_program::{
    account_info::AccountInfo,
    keccak::hash,
    msg,
    program::{invoke, invoke_signed},
    program_memory::sol_memcmp,
    pubkey::{Pubkey, PUBKEY_BYTES},
    rent::Rent,
    system_instruction,
};

fn cmp_pubkeys(a: &Pubkey, b: &Pubkey) -> bool {
    sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

pub fn discriminator(account: &'static str) -> [u8; 8] {
    let mut discriminator = [0u8; 8];
    discriminator.copy_from_slice(&hash(account.as_bytes()).to_bytes()[..8]);

    discriminator
}

pub fn transfer_lamports(
    source: &AccountInfo<'_>,
    dest: &AccountInfo<'_>,
    amount: u64,
) -> Result<()> {
    if **source.try_borrow_lamports()? < amount {
        return err!(DescriptorError::InsufficientBalance);
    }

    **source
        .try_borrow_mut_lamports()? -= amount;

    **dest.try_borrow_mut_lamports()? += amount;

    Ok(())
}

/// Create account almost from scratch, lifted from
/// <https://github.com/solana-labs/solana-program-library/tree/master/associated-token-account/program/src/processor.rs#L51-L98>
#[inline(always)]
pub fn create_or_allocate_account_raw<'a>(
    payer_info: &AccountInfo<'a>,
    new_account_info: &AccountInfo<'a>,
    account_size: usize,
    account_address_seeds: &[&[u8]],
    expected_bump: u8,
    program_id: &Pubkey,
    system_program_info: &AccountInfo<'a>,
    rent: &Rent,
) -> Result<()> {
    // Get PDA and assert it's the same as the requested account address
    let (account_address, bump_seed) =
        Pubkey::find_program_address(account_address_seeds, program_id);

    if account_address != *new_account_info.key || expected_bump != bump_seed {
        msg!(
            "Create account with PDA: {:?} was requested while PDA: {:?} was expected",
            new_account_info.key,
            account_address
        );

        return err!(DescriptorError::IncorrectSeeds);
    }

    let mut signers_seeds = account_address_seeds.to_vec();
    let bump = &[bump_seed];
    signers_seeds.push(bump);

    let required_lamports = rent.minimum_balance(account_size).max(1);

    if required_lamports > 0 {
        msg!("Transfer {} lamports to the new account", required_lamports);
        invoke(
            &system_instruction::transfer(payer_info.key, new_account_info.key, required_lamports),
            &[
                payer_info.clone(),
                new_account_info.clone(),
                system_program_info.clone(),
            ],
        )?;
    }

    let accounts = &[new_account_info.clone(), system_program_info.clone()];

    msg!("Allocate space for the account");
    // [source] https://github.com/solana-labs/solana/blob/b9f4c8e3c0948e0b2b1be29c1a893f264a5166a0/runtime/src/system_instruction_processor.rs#L74-L114
    // [allocation must not exceed `MAX_PERMITTED_DATA_LENGTH`] https://github.com/solana-labs/solana/blob/6972afe2c4ed4202268dd71dc7d223f8348b4d01/sdk/program/src/system_instruction.rs#L180
    invoke_signed(
        &system_instruction::allocate(new_account_info.key, account_size.try_into().unwrap()),
        accounts,
        &[&signers_seeds[..]],
    )?;

    msg!("Assign the account to the owning program");
    invoke_signed(
        &system_instruction::assign(new_account_info.key, &program_id),
        accounts,
        &[&signers_seeds[..]],
    )?;

    Ok(())
}

/// [source] invoke realloc processor: https://github.com/solana-labs/solana/blob/master/programs/sbf/rust/realloc_invoke/src/processor.rs
/// [reference] https://solanacookbook.com/references/programs.html#how-to-change-account-size
pub fn resize_account<'a>(
    payer_info: &AccountInfo<'a>,
    account_info: &AccountInfo<'a>,
    new_size: usize,
    system_program_info: &AccountInfo<'a>,
    rent: &Rent,
) -> Result<()> {
    msg!(
        "Resizing account {:?} from {:?} to {:?}",
        account_info.key,
        account_info.data_len(),
        new_size
    );

    let new_minimum_balance = rent.minimum_balance(new_size);

    // transfer lamports from payer to account
    if new_size > account_info.data_len() {
        let lamports_diff = new_minimum_balance.saturating_sub(account_info.lamports());
        invoke(
            &system_instruction::transfer(payer_info.key, account_info.key, lamports_diff),
            &[
                payer_info.clone(),
                account_info.clone(),
                system_program_info.clone(),
            ],
        )?;
    } else {
        let lamports_diff = account_info.lamports().saturating_sub(new_minimum_balance);

        // source account is a PDA owned by this program && dest account likely owned by another entity; incompatability
        // with system_program means we cannot use vanilla `transfer` instruction
        transfer_lamports(&account_info, &payer_info, lamports_diff)?;
    }

    // [source] https://github.com/solana-labs/solana/blob/master/sdk/program/src/account_info.rs#L129-L182
    account_info.realloc(new_size, true)?;

    Ok(())
}

pub fn verify_metadata(metadata: &Metadata, authority: &Pubkey, mint: &Pubkey) -> Result<()> {
    // validate authority on descriptor
    if !cmp_pubkeys(&authority, &metadata.update_authority) {
        return err!(DescriptorError::IncorrectAuthority);
    }

    if !cmp_pubkeys(&mint, &metadata.mint) {
        return err!(DescriptorError::MintMismatch);
    }

    Ok(())
}

pub fn verify_empty_account<'a>(account: &AccountInfo<'a>) -> Result<()> {
    // guard against descriptor reinitialization
    if !account.data_is_empty() {
        return err!(DescriptorError::Initialized);
    }

    Ok(())
}

pub fn verify_non_empty_account<'a>(account: &UncheckedAccount<'a>) -> Result<()> {
    if account.data_is_empty() {
        return err!(DescriptorError::Uninitialized);
    }

    Ok(())
}

pub fn verify_descriptor_mint(descriptor: &Descriptor, mint: &Pubkey) -> Result<()> {
    // validate mint for provided descriptor
    if !cmp_pubkeys(&mint, &descriptor.mint) {
        return err!(DescriptorError::MintMismatch);
    }

    Ok(())
}

pub fn initialize_descriptor_helper<'a>(
    payer_info: &AccountInfo<'a>,
    descriptor_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    rend_info: &Rent,
    desc_bump: u8,
    mint_key: &Pubkey,
    encoding: Encoding,
    data_size: u32,
) -> Result<Descriptor> {
    let descriptor_struct = Descriptor {
        discriminator: Descriptor::discriminator(),
        bump: desc_bump,
        mint: *mint_key,
        encoding,
        data_len: data_size as u32,
    };

    descriptor_struct.verify_size()?;

    create_or_allocate_account_raw(
        &payer_info,
        &descriptor_info,
        descriptor_struct.size_of(),
        &Descriptor::make_seeds(&mint_key.as_ref()),
        desc_bump,
        &crate::id(),
        &system_program_info,
        &rend_info,
    )?;

    Ok(descriptor_struct)
}
