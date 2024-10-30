"use client";

import { useState, useEffect } from "react";
import { Keypair, Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import nacl from "tweetnacl";

interface WalletProps {
    mnemonic: string; // Seed phrase
}

export const Wallet = ({ mnemonic }: WalletProps) => {
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [privateKey, setPrivateKey] = useState<string>("");
    const [publicKey, setPublicKey] = useState<string>("");
    const [balance, setBalance] = useState<number | null>(null);
    const connection = new Connection(clusterApiUrl('devnet')); // Use your desired network

    

    useEffect(() => {
        const generateKeys = async () => {
            try {
                // Ensure mnemonic is defined
                if (!mnemonic) {
                    throw new Error('Mnemonic is undefined');
                }

                // Validate the mnemonic phrase
                if (!bip39.validateMnemonic(mnemonic)) {
                    throw new Error('Invalid mnemonic phrase');
                }

                // Generate seed from mnemonic
                const seed = bip39.mnemonicToSeedSync(mnemonic);

                // Define the derivation path
                const derivationPath = `m/44'/501'/0'/0'`; // For a single Solana wallet

                // Derive the seed based on the path
                const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;

                // Generate secret key pair from the derived seed
                const keypair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
                
                // Set the private key in hex format
                setPrivateKey(Buffer.from(keypair.secretKey).toString('hex')); 

                // Set the public key in base58 format
                setPublicKey(keypair.publicKey.toBase58());

                // Fetch balance after setting public key
                await getBalance(keypair.publicKey.toBase58());
            } catch (error) {
                console.error("Error generating keys:", error);
            }
        };

        const getBalance = async (publicKey: string) => {
            try {
                const pubKey = new PublicKey(publicKey); // Convert publicKey string to a PublicKey object
                
                // Fetch the balance in lamports
                const balanceLamports = await connection.getBalance(pubKey);
                
                // Convert balance to SOL
                const balanceInSol = balanceLamports / 1e9; // 1 SOL = 1 billion lamports
                
                console.log(`Balance for wallet ${publicKey}: ${balanceInSol} SOL`);
                setBalance(balanceInSol); // Set the balance state
            } catch (error) {
                console.error("Error fetching balance:", error);
                setBalance(null); // Return null in case of an error
            }
        };

        generateKeys();
    }, [mnemonic]);

    

    const getPrivateKeyPlaceholder = () => {
        return privateKey ? "● ".repeat(privateKey.length / 2) : "";
    };

    return (<div className="border rounded-xl border-zinc-600 mt-8 mb-[70px]">
        <p className="text-[25px] font-roboto font-bold px-8 pt-6">
            Wallet
        </p>
        <div className="bg-neutral-900 border border-neutral-900 rounded-xl px-8 py-5 mt-5">
            <div>
                <p className="font-semibold text-[22px] mb-1.5">Public Key</p>
                <p className="mb-8 text-[15px]">
                    {publicKey || "Generating..."}
                </p>
            </div>
            <div>
                <p className="font-semibold text-[22px] mb-1.5">Balance</p>
                <p className="mb-8 text-[15px]">
                    {balance !== null ? `${balance.toFixed(2)} SOL` : "Loading..."}
                </p>
            </div>
            <div className="relative">
                <p className="font-semibold text-[22px] mb-1.5">Private Key</p>
                <p className="text-[15px]">
                    {showPrivateKey ? privateKey : getPrivateKeyPlaceholder()}
                </p>
                <button
                    className="absolute right-0 top-0 mt-1"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    aria-label="Toggle Private Key Visibility"
                >
                    {showPrivateKey ? <FaEyeSlash className="w-6 h-6" /> : <FaEye className="w-6 h-6" />}
                </button>
            </div>
        </div>
    </div>);
};
