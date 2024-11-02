"use client";

import { useState, useEffect } from "react";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import nacl from "tweetnacl";
import axios from "axios";
import bs58 from "bs58";
import SendModal from './SendModal'; // Import SendModal

interface WalletProps {
    mnemonic: string;
}

export const Wallet = ({ mnemonic }: WalletProps) => {
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [privateKey, setPrivateKey] = useState<string>("");
    const [publicKey, setPublicKey] = useState<string>("");
    const [balance, setBalance] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

    useEffect(() => {
        const cachedPublicKey = localStorage.getItem("publicKey");

        if (cachedPublicKey) {
            setPublicKey(cachedPublicKey);
            console.log("Using cached public key:", cachedPublicKey);
            fetchBalance(cachedPublicKey);
        } else {
            generateKeys();
        }
    }, [mnemonic]);

    const generateKeys = async () => {
        try {
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            const derivationPath = `m/44'/501'/0'/0'`;
            const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;
            const keypair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);

            const publicKeyBase58 = keypair.publicKey.toBase58();
            const privateKeyBase58 = bs58.encode(keypair.secretKey);

            setPrivateKey(privateKeyBase58);
            setPublicKey(publicKeyBase58);

            // Cache public key
            localStorage.setItem("publicKey", publicKeyBase58);
            console.log("Generated and cached public key:", publicKeyBase58);

            // Fetch balance for the new public key
            fetchBalance(publicKeyBase58);
        } catch (error) {
            console.error("Error generating keys:", error);
        }
    };

    const fetchBalance = async (address: string) => {
        try {
            console.log(`Fetching balance for address: ${address}`);
            const response = await axios.get(`/api/balancefetch?Address=${address}`);
            if (response.status === 200 && response.data) {
                setBalance(response.data.balance);
                console.log(`Balance updated: ${response.data.balance} SOL`);
            } else {
                console.warn(`Failed to fetch balance for ${address}. Status: ${response.status}`);
                setBalance(0);
            }
        } catch (error) {
            console.error("Error fetching balance from API:", error);
            setBalance(null);
        }
    };

    useEffect(() => {
        if (publicKey) {
            fetchBalance(publicKey);

            const intervalId = setInterval(() => {
                fetchBalance(publicKey);
            }, 3000);

            return () => clearInterval(intervalId);
        }
    }, [publicKey]);

    const getPrivateKeyPlaceholder = () => {
        return privateKey ? "● ".repeat(privateKey.length / 2) : "";
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="relative">
            {isModalOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />} {/* Full-screen translucent background */}
            <div className="border rounded-xl border-zinc-600 mt-8 mb-[70px] max-h-screen z-50 relative">
                <div className="flex justify-between">
                    <p className="text-[25px] font-roboto font-bold px-8 pt-6">Wallet</p>
                    <div className="pt-4 px-9 flex">
                        <button 
                            onClick={() => setIsModalOpen(true)} // Open the modal
                            className="border rounded-xl px-4 mr-3 bg-neutral-900 hover:bg-neutral-700"
                        >
                            Send
                        </button>
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
                            className="text-[15px] cursor-pointer"
                            onClick={() => copyToClipboard(privateKey)}
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
            <SendModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                publicKey={publicKey} 
            />
        </div>
    );
};
