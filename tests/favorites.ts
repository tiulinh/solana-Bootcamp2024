import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import { getCustomErrorMessage } from '@solana-developers/helpers';
import { assert } from 'chai';
import { systemProgramErrors } from './system-errors';
const web3 = anchor.web3;
describe("favorites", () => {
  // Configure the client to use the local cluster.
  const provider =anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Favorites as Program<Favorites>;
  const user =(provider.wallet as anchor.Wallet).payer;
  const someRandomGuy= web3.Keypair.generate();
  // Here's what we want to write to the blockchain
  const favoriteNumber = new anchor.BN(23);
  const favoriteColor = 'purple';
  const favoriteHobbies = ['skiing', 'skydiving', 'biking'];

  before("Airdrop sol", async()=>{
    const balance=await provider.connection.getBalance(user.publicKey);
    const balanceInSOL = balance / web3.LAMPORTS_PER_SOL;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSOL);
    console.log(`Balance: ${formattedBalance} SOL`);
  });

  it.skip("Write your fovarites to blockchain", async () => {
    
    const tx = await program.methods.
    // // set_favourites in Rust becomes setFavorites in TypeScript
    setFavorites(favoriteNumber,favoriteColor,favoriteHobbies)
    // sign the transaction
    .signers([user])
    // Send the transaction to the cluster or RPC
    .rpc();
    console.log("Your transaction signature", tx);
   // Find the PDA user's fovarites
   const favoritesPdaAndBump =web3.PublicKey.findProgramAddressSync([Buffer.from("favorites"),user.publicKey.toBuffer()],program.programId);
   const favoritesPda = favoritesPdaAndBump[0];
   const dataFromPda = await program.account.favorites.fetch(favoritesPda);
   console.log(" PDA user address:",favoritesPda.toBase58());
  //  console.log("PDA data: ",dataFromPda);
  //  console.log("type of PDA: ", typeof(dataFromPda.hobbies), "favoriteHobbies: ",typeof(favoriteHobbies));
   //check invalid 
   assert.equal(dataFromPda.color,favoriteColor,"fail color");
   assert.equal(dataFromPda.num.toString(),favoriteNumber.toString(),"fail number");
   assert.deepEqual(dataFromPda.hobbies,favoriteHobbies,"fail hobbies");
  });
  it("Update favorites",async()=>{
    // const newFavoriteHobbies = ['skiing', 'skydiving', 'biking', 'swimming'];
    const newFavoriteHobbies = ['skiing', 'skydiving', 'biking', 'swimming','boxing','football'];
    try {
      const tx=await program.methods
      .setFavorites(favoriteNumber,favoriteColor, newFavoriteHobbies)
      // .signers([]) // Signer is default signer( provider.wallet) 
      .signers([user])
      .rpc();
      console.log("transaction: ",tx)
      const favoritesPdaAndBump =web3.PublicKey.findProgramAddressSync([Buffer.from("favorites"),user.publicKey.toBuffer()],program.programId);
      const favoritesPda = favoritesPdaAndBump[0];
      const dataFromPda = await program.account.favorites.fetch(favoritesPda);
      console.log("Data of PDA account: ",dataFromPda);

    } catch (error) {
      console.error("system Error:",(error as Error).message);
      const customErrorMessage = getCustomErrorMessage(systemProgramErrors, error);
      throw new Error(customErrorMessage);
    }
  });
 // only signer can set data. 
  it.skip('Rejects transactions from unauthorized signers', async () => {
    try {
     const tx= await program.methods
        // set_favourites in Rust becomes setFavorites in TypeScript
        .setFavorites(favoriteNumber, favoriteColor, favoriteHobbies)
        // Sign the transaction
        .signers([someRandomGuy])
        // Send the transaction to the cluster or RPC
        .rpc();
    } catch (error) {
      const errorMessage = (error as Error).message;
      assert.isTrue(errorMessage.includes('unknown signer'));
    }
  });

});
