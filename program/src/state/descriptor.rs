use anchor_lang::prelude::*;
use solana_program::{account_info::AccountInfo, borsh::try_from_slice_unchecked};

use super::Encoding;
use crate::{utils::discriminator as disc_fn, DescriptorError, DESCRIPTOR_SEED, MAX_ACCOUNT_SIZE};

/// Since the descriptor is dynamic and not known until runtime, we cannot allocate a fixed
/// amount of space. Thus, beyond the attributes of this struct, we will assume all data is
/// of the specified encoding. Clients should be provided sufficient tooling to perform read
/// operations on these accounts.
///
/// The descriptor authority is same as metadata authority in this implementation. We do not
/// serialize here so that there is only 1 source of truth - the metadata account. This can
/// be extended/changed in various implementations depending on requirements.

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
#[repr(C)]
pub struct Descriptor {
    /// Discriminator
    pub discriminator: [u8; 8],
    /// PDA bump
    pub bump: u8,
    /// Associated mint pubkey
    pub mint: Pubkey,
    /// Data encoding
    pub encoding: Encoding,
    /// Data length
    pub data_len: u32,
}

impl Descriptor {
    pub fn discriminator() -> [u8; 8] {
        disc_fn(DESCRIPTOR_SEED)
    }

    pub fn base() -> usize {
        8 + 1 + 32 + 1 + 4
    }

    pub fn size_of(&self) -> usize {
        Self::base() + (self.data_len as usize)
    }

    pub fn from_account_info(account_info: &AccountInfo) -> Result<Descriptor> {
        let data = &account_info.data.borrow()[0..Self::base()];
        Ok(try_from_slice_unchecked(data)?)
    }

    pub fn make_seeds<'a>(bytes: &'a [u8]) -> [&'a [u8]; 2] {
        [crate::seeds::DESCRIPTOR, bytes]
    }

    pub fn verify_size(&self) -> Result<()> {
        // since `descriptor` is a PDA, account size > 10_240 bytes is invalid
        if self.size_of() > MAX_ACCOUNT_SIZE {
            return err!(DescriptorError::AccountTooLarge);
        }

        Ok(())
    }
}
