"use client";

import { generateSolanaKeypair } from "@/app/api/keygen/route";
import DropDown from "./dropdown";
import { useState, useEffect } from "react";

export default function Main() {
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  // Check if a mnemonic exists in localStorage upon component mount
  useEffect(() => {
    const storedMnemonic = localStorage.getItem("mnemonic");
    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
    }
  }, []);

  const Generate = () => {
    const { mnemonic: generatedMnemonic } = generateSolanaKeypair();
    setMnemonic(generatedMnemonic);

    // Set the generated mnemonic in localStorage
    localStorage.setItem("mnemonic", generatedMnemonic);
  };

  const clearMnemonic = () => {
    localStorage.removeItem("mnemonic"); // Clear mnemonic from localStorage
    setMnemonic(null); // Reset mnemonic state to null
  };

  return (
    <div className="h-screen mx-auto pr-[65px] font-roboto">
      <div className="mt-[22px] ml-10">
        {!mnemonic && (
          <div className="mb-5 mt-[45px] flex flex-col">
            <p className="text-[50px] font-semibold">
              Secret Recovery Phrase
            </p>

            <p className="text-[20px] mb-3">
              Save these words, don’t share them with just anyone
            </p>

            <div className={`transition-opacity duration-500 ${mnemonic ? "opacity-0 h-0" : "opacity-100 h-auto"}`}>
              <input
                type="password"
                placeholder="Enter Secret Phrase or leave blank to generate new wallet"
                className="password-input bg-transparent border border-gray-900 placeholder-slate-300 rounded w-9/12 px-3 py-2 mt-2"
              />
              <button
                type="button"
                className="text-gray-900 font-light bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-gray-100 rounded-lg text-sm px-5 py-2.5 ml-2 mt-2"
                onClick={Generate}
              >
                Generate Wallet
              </button>
            </div>
          </div>
        )}
        
        <div className={`transition-opacity transform ${mnemonic ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"} duration-500 ease-in-out`}>
          {mnemonic && <DropDown mnemonic={mnemonic} clearMnemonic={clearMnemonic} />}
        </div>
      </div>
    </div>
  );
}
