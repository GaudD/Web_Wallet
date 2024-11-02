"use client";

import { useState, useEffect } from "react";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import nacl from "tweetnacl";
import axios from "axios";
import bs58 from "bs58"; // Import the bs58 library for encoding

interface WalletProps {
    mnemonic: string; // Seed phrase
}

export const Wallet = ({ mnemonic }: WalletProps) => {
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [privateKey, setPrivateKey] = useState<string>("");
    const [publicKey, setPublicKey] = useState<string>("");
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        const generateKeys = async () => {
            try {
                // Generate seed from mnemonic
                const seed = bip39.mnemonicToSeedSync(mnemonic);

                // Define the derivation path
                const derivationPath = `m/44'/501'/0'/0'`; // For a single Solana wallet

                // Derive the seed based on the path
                const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;

                // Generate secret key pair from the derived seed
                const keypair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
                
                // Set the private key in Base58 format
                const privateKeyBase58 = bs58.encode(keypair.secretKey); // Convert to Base58
                setPrivateKey(privateKeyBase58); 

                // Set the public key in base58 format
                setPublicKey(keypair.publicKey.toBase58());

                // Fetch balance after setting public key
                await getBalance(keypair.publicKey.toBase58());
            } catch (error) {
                console.error("Error generating keys:", error);
            }
        };

        const getBalance = async (publicKey: string) => {
            console.log("Address:", publicKey);
            try {
                // Make a call to the API you created
                const response = await axios.get(`/api/balancefetch`, {
                    params: { Address: publicKey },
                });
        
                // Handle the API response
                if (response.status === 200 && response.data) {
                    const balanceInSol = response.data.balance;
                    console.log(`Balance for wallet ${publicKey}: ${balanceInSol} SOL`);
                    setBalance(balanceInSol); // Set the balance state
                } else {
                    console.warn(`Failed to fetch balance for ${publicKey}. Status: ${response.status}`);
                    setBalance(0); // Set balance to 0 in case of a failed response
                }
            } catch (error) {
                console.error("Error fetching balance from API:", error);
                setBalance(null); // Set balance to null in case of an error
            }
        };

        generateKeys();
    }, [mnemonic]);

    const getPrivateKeyPlaceholder = () => {
        return privateKey ? "● ".repeat(privateKey.length / 2) : "";
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="border rounded-xl border-zinc-600 mt-8 mb-[70px] max-h-screen">
            <div className="flex justify-between">
                <p className="text-[25px] font-roboto font-bold px-8 pt-6">Wallet</p>
                <div className="pt-4 px-9 flex">
                    <p className="font-semibold text-[22px] mt-1.5">Balance :</p>
                    <p className="text-[20px] mt-2 ml-2 font-semibold">
                        {balance !== null ? `${balance.toFixed(2)} SOL` : "Loading..."}
                    </p>
                </div>
            </div>
            <div className="bg-neutral-900 border border-neutral-900 rounded-xl px-8 py-5 mt-5">
                <div>
                    <p className="font-semibold text-[22px] mb-1.5">Public Key</p>
                    <p onClick={() => copyToClipboard(publicKey)} className="mb-8 text-[15px] cursor-pointer">
                        {publicKey || "Generating..."}
                    </p>
                </div>
                <div className="relative">
                    <p className="font-semibold text-[22px] mb-1.5">Private Key</p>
                    <p
                        className="text-[15px] cursor-pointer" // Add cursor-pointer for better UX
                        onClick={() => {
                        copyToClipboard(privateKey);        
                        }}
                    >
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
        </div>
    );
};
