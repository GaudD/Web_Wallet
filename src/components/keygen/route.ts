import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

interface SolanaKeypair {
  publicKey: string;
  privateKey: string;
  mnemonic: string;
}

export const generateSolanaKeypair = (): SolanaKeypair => {
  const mnemonic: string = bip39.generateMnemonic();

  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // Derive path for the Solana keypair (m/44'/501'/0'/0' is standard for Solana)
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;

  // Create a Solana keypair from the derived seed
  const keypair = Keypair.fromSeed(derivedSeed);

  // Extract public and secret keys
  const publicKey: string = keypair.publicKey.toBase58();
  const privateKey: string = `[${keypair.secretKey.toString()}]`; // Array format of the private key bytes

  return {
    publicKey,
    privateKey,
    mnemonic,
  };
};