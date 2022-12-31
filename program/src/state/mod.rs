use anchor_lang::prelude::*;

pub use descriptor::*;

pub mod descriptor;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Encoding {
    None,
    Utf8,
    Base64,
    Custom
}

impl Default for Encoding {
    fn default() -> Self {
        Encoding::None
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[repr(C)]
pub struct Range {
    pub start: u64,
    pub end: u64
}