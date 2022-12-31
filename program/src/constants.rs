pub const DESCRIPTOR_SEED: &str = "descriptor";
pub const MAX_ACCOUNT_SIZE: usize = 10_240;

pub mod seeds {
    use anchor_lang::prelude::constant;
    #[constant]
    pub const DESCRIPTOR: &[u8] = b"descriptor";
}
