# Token Metadata Descriptor

> 🚧 **This is an experimental contract and has not been formally audited. Please use/modify at your own risk.**

## Overview

Please see this document for more info: https://broken-bellflower-f99.notion.site/Token-Metadata-Descriptor-6227a069bd1049e78fddc3ce1cbf36f1

Reading the tests in `/sdk/test` can also provide insight into how the program instructions work.

## Example Usage

### Initialize with data

```
// imports
use token_metadata_descriptor::{
    cpi::accounts::InitializeWithData,
    state::Encoding,
};

// context
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // assumption: authority is an end-user here, but could be a pda
    pub update_authority: Signer<'info>,

    #[account(mut)]
    pub descriptor: AccountInfo<'info>,

    // assumption: nft already exists
    pub mint: Account<'info, Mint>,

    pub metadata: AccountInfo<'info>,

    #[account(address = mpl_token_metadata::id())]
    pub token_metadata_program: UncheckedAccount<'info>,

    #[account(address = token_metadata_descriptor::id())]
    pub token_metadata_descriptor: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

...
other code
...

// logic using `Initialize` in context

let cpi_program = ctx.accounts.token_metadata_descriptor.to_account_info();

let cpi_accounts = InitializeWithData {
    payer: ctx.accounts.payer.to_account_info(),
    mint: ctx.accounts.mint.to_account_info(),
    token_metadata: ctx.accounts.metadata.to_account_info(),
    authority: ctx.accounts.update_authority.to_account_info(),
    descriptor: ctx.accounts.descriptor.to_account_info(),
    token_metadata_program: ctx.accounts.token_metadata_program.to_account_info(),
    system_program: ctx.accounts.system_program.to_account_info(),
};

let data = "hello world".try_to_vec().unwrap();

token_metadata_descriptor::cpi::initialize_with_data(
    CpiContext::new(cpi_program, cpi_accounts)
    Encoding::Utf8,
    bump,
    data
)?;
```

### Initialize with buffer

```
// imports
use token_metadata_descriptor::{
    cpi::accounts::InitializeWithBuffer,
    state::Encoding,
};

// context
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    // assumption: authority is an end-user here, but could be a pda
    pub update_authority: Signer<'info>,

    #[account(mut)]
    pub descriptor: AccountInfo<'info>,

    #[account(mut)]
    pub buffer: AccountInfo<'info>,

    // assumption: nft already exists
    pub mint: Account<'info, Mint>,

    pub metadata: AccountInfo<'info>,

    #[account(address = mpl_token_metadata::id())]
    pub token_metadata_program: UncheckedAccount<'info>,

    #[account(address = token_metadata_descriptor::id())]
    pub token_metadata_descriptor: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

...
other code, like initialize and fill buffer
...

// logic using `Initialize` in context

let cpi_program = ctx.accounts.token_metadata_descriptor.to_account_info();

let cpi_accounts = InitializeWithBuffer {
    payer: ctx.accounts.payer.to_account_info(),
    mint: ctx.accounts.mint.to_account_info(),
    token_metadata: ctx.accounts.metadata.to_account_info(),
    authority: ctx.accounts.update_authority.to_account_info(),
    descriptor: ctx.accounts.descriptor.to_account_info(),
    buffer: ctx.accounts.buffer.to_account_info(),
    token_metadata_program: ctx.accounts.token_metadata_program.to_account_info(),
    system_program: ctx.accounts.system_program.to_account_info(),
};

token_metadata_descriptor::cpi::initialize_with_buffer(
    CpiContext::new(cpi_program, cpi_accounts)
    None, // copy entire buffer
    Encoding::Base64,
    desc_bump,
)?;
```