"use client";

import { generateSolanaKeypair } from "@/app/api/keygen/route";
import DropDown from "./dropdown";
import { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import js-cookie

export default function Main() {
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  // Check if a mnemonic exists in cookies upon component mount
  useEffect(() => {
    const storedMnemonic = Cookies.get("mnemonic");
    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
    }
  }, []);

  const Generate = () => {
    const { mnemonic: generatedMnemonic } = generateSolanaKeypair();
    setMnemonic(generatedMnemonic);

    // Set the generated mnemonic in a cookie
    Cookies.set("mnemonic", generatedMnemonic, { expires: 7 });
  };

  return (
    <div className="h-screen mx-auto pr-[65px] font-roboto">
      <div className="mt-[22px] ml-10">
        <div className="flex items-center text-[35px] font-semibold">
          <svg
            className="pr-2.5 w-8 h-8 text-gray-800 dark:text-white ml-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M19.728 10.686c-2.38 2.256-6.153 3.381-9.875 3.381-3.722 0-7.4-1.126-9.571-3.371L0 10.437V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7.6l-.272.286Z" />
            <path d="m.135 7.847 1.542 1.417c3.6 3.712 12.747 3.7 16.635.01L19.605 7.9A.98.98 0 0 1 20 7.652V6a2 2 0 0 0-2-2h-3V3a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v1H2a2 2 0 0 0-2 2v1.765c.047.024.092.051.135.082ZM10 10.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5ZM7 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H7V3Z" />
          </svg>
          Gaud
        </div>

        {!mnemonic && <div className="mb-5 mt-[45px] flex flex-col">
          <p className="text-[50px] font-semibold">
            Secret Recovery Phrase
          </p>

          {!mnemonic && (
            <>
              <p className="text-[20px] mb-3">
                Save these words, don`t share them with just anyone
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
            </>
          )}
        </div>}
        
        <div className={`transition-opacity transform ${mnemonic ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"} duration-500 ease-in-out`}>
          {mnemonic && <DropDown mnemonic={mnemonic} />}
        </div>
      </div>
    </div>
  );
}
