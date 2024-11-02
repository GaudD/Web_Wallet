"use client";

import { generateSolanaKeypair } from "@/app/api/keygen/route";
import DropDown from "./dropdown";
import { useState, useEffect } from "react";
import * as bip39 from "bip39"; // Import bip39 for mnemonic validation

export default function Main() {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [inputMnemonic, setInputMnemonic] = useState<string>(""); // State to hold user input
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [loading, setLoading] = useState(true); // State to control loading screen

  // Check if a mnemonic exists in localStorage upon component mount
  useEffect(() => {
    const storedMnemonic = localStorage.getItem("mnemonic");
    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
    }
    // Set loading to false after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  const Generate = () => {
    // Check if the inputMnemonic is valid
    if (inputMnemonic) {
      if (bip39.validateMnemonic(inputMnemonic)) {
        setMnemonic(inputMnemonic);
        localStorage.setItem("mnemonic", inputMnemonic); // Save valid mnemonic in localStorage
        setError(null); // Clear any previous error
      } else {
        setError("Invalid mnemonic."); // Set error for invalid mnemonic
        setMnemonic(null); // Reset mnemonic state to null
      }
    } else {
      const { mnemonic: generatedMnemonic } = generateSolanaKeypair();
      setMnemonic(generatedMnemonic);
      localStorage.setItem("mnemonic", generatedMnemonic); // Save generated mnemonic in localStorage
      setError(null); // Clear any previous error
    }
  };

  const clearMnemonic = () => {
    localStorage.removeItem("mnemonic"); // Clear mnemonic from localStorage
    setMnemonic(null); // Reset mnemonic state to null
    setInputMnemonic(""); // Clear input field
    setError(null); // Clear any error
  };

  return (
    <div className="h-full mx-auto pr-[65px] font-roboto relative">
      {loading && (
        <div className="absolute inset-0 bg-neutral-950 bg-opacity-70 flex items-center justify-center z-50 h-screen">
        </div>
      )}
      <div className={`mt-[22px] h-screen ml-10 transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}>
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
                type="password" // Use text instead of password for mnemonic input
                placeholder="Enter Secret Phrase or leave blank to generate new wallet"
                value={inputMnemonic}
                onChange={(e) => setInputMnemonic(e.target.value)} // Update input state on change
                className="password-input bg-transparent border border-gray-900 placeholder-slate-300 rounded w-9/12 px-3 py-2 mt-2"
              />
              <button
                type="button"
                className="text-gray-900 font-light bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-gray-100 rounded-lg text-sm px-5 py-2.5 ml-2 mt-2"
                onClick={Generate}
              >
                Generate Wallet
              </button>
              {error && <p className="text-red-500 mt-2">Invalid Secret Phrase</p>} {/* Display error message */}
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
