use anchor_lang::prelude::*;

declare_id!("4V9JeMfapy9cYg4yo86swLK3b16FziPWrxfRnU11kMc6");

#[program]
pub mod favorites {
    use super::*;

    pub fn set_favorites(ctx: Context<SetFavarites>, number:u64,color: String, hobbies:Vec<String>) -> Result<()> {
        let user_public_key = ctx.accounts.user.key();
        msg!("Greetings from {}", ctx.program_id);
        msg!(
            "User {user_public_key}'s favorite number is {number}, favorite color is: {color}",
        );
        msg!(
            "User's hobbies are: {:?}",
            hobbies
        ); 
        ctx.accounts.favorite.set_inner(Favorites{
            num:number,
            color:color,
            hobbies,
        });
        Ok(())
    }
}
#[account]
#[derive(InitSpace)]
pub struct  Favorites{
   pub  num:u64,
   #[max_len(50)]
   pub color:String,
   #[max_len(5,50)]
   hobbies:Vec<String>
}
#[derive(Accounts)]
pub struct SetFavarites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init_if_needed, payer=user, space=8+Favorites::INIT_SPACE,
      seeds=[b"favorites",user.key().as_ref()],bump
    )]
    pub favorite:Account<'info,Favorites>,
    pub  system_program:Program<'info,System>
}
/* explain the favarite account: 
    1. Because it is PDA account so this program(program_id) is owner.
    2. It's created by this program so we don't need to pass this parameter on the client side.
  */