"use client";

import { useState, useEffect } from "react";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface WalletProps {
    id: number; // Unique identifier for each wallet
    mnemonic: string; // Seed phrase
}

export const Wallet = ({ id, mnemonic }: WalletProps) => {
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);

    useEffect(() => {
        const generateKeys = async () => {
            try {
                if (!bip39.validateMnemonic(mnemonic)) {
                    throw new Error('Invalid mnemonic phrase');
                }

                const seed = await bip39.mnemonicToSeed(mnemonic);

                const derivationPath = `m/44'/501'/${id}'/0'`;
                const { key } = derivePath(derivationPath, seed.toString("hex"));

                const slicedKey = key.slice(0, 32); // Take the first 32 bytes

                const derivedKeypair = Keypair.fromSeed(slicedKey);

                setPrivateKey(Buffer.from(derivedKeypair.secretKey).toString("hex")); // Hex format
                setPublicKey(derivedKeypair.publicKey.toBase58());
            } catch (error) {
                console.error("Error generating keys:", error);
            }
        };

        generateKeys();
    }, [mnemonic, id]);

    const getPrivateKeyPlaceholder = () => {
        return privateKey ? "● ".repeat(privateKey.length /2 ) : "";
    };

    return (
        <div className="border rounded-xl border-zinc-600 mt-8">
            <p className="text-[25px] font-roboto font-bold px-8 pt-6">
                Wallet {id + 1}
            </p>
            <div className="bg-neutral-900 border border-neutral-900 rounded-xl px-8 py-5 mt-5">
                
                {/* Public Key Section */}
                <div>
                    <p className="font-semibold text-[22px] mb-1.5">Public Key</p>
                    <p className="mb-8 text-[15px]">
                        {publicKey || "Generating..."}
                    </p>
                </div>
                
                {/* Private Key Section */}
                <div className="relative">
                    <p className="font-semibold text-[22px] mb-1.5">Private Key</p>
                    <p className="text-[15px]">
                        {showPrivateKey ? privateKey : getPrivateKeyPlaceholder()}
                    </p>
                    
                    {/* Toggle Button for Private Key Visibility */}
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