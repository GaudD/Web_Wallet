"use client";

import { useState } from 'react';
import { Wallet } from './wallets';

interface DropDownProps {
    mnemonic: string;
  }

const DropDown: React.FC<DropDownProps> = ({ mnemonic }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sample seed phrase - replace with actual data as needed
    const seedPhrase = mnemonic.split(" ");

  const toggleDropdown = () => {
    setIsOpen(prevState => !prevState);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(seedPhrase.join(' '));
  };

  return (<div className="relative w-10/12 pt-5">
    <div className={`transition-all duration-300 border p-2.5 rounded-md border-zinc-700`}>
        <button
            onClick={toggleDropdown}
            className="flex items-center justify-between w-full px-8 py-6 text-white bg-transparent focus:outline-none font-medium text-[30px]"
        >
            Your Secret Phrase
            <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                ▼
            </span>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-2 bg-transparent text-white rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8">
                    {seedPhrase.map((word, index) => (
                        <div 
                            key={index} 
                            className="flex justify-center"
                            onClick={copyToClipboard} // Copy all words on click
                        >
                            <p className="md:text-lg bg-zinc-900 text-white transition-all duration-300 rounded-lg p-4 w-[250px] cursor-pointer hover:bg-zinc-700">
                                {word}
                            </p>
                        </div>
                    ))}
                </div>
                <button
                    onClick={copyToClipboard}
                    className="mt-2 mx-8 mb-8 pb-1 px-1 text-white border-b-2 border-transparent hover:border-white transition-all duration-300"
                >
                    Copy to Clipboard
                </button>
            </div>
        </div>
    </div>
    <div className='flex justify-between pt-6'>
        <p className='text-[40px] font-roboto font-semibold'>
            Solana Wallet
        </p>
        <div>
            <button type="button" className="py-2.5 px-4 me-2 mb-2 mt-[10px] text-sm text-white font-roboto bg-red-900 rounded-md hover:bg-red-950">
                Clear Wallet
            </button>
        </div>
    </div>
    <div>
        <Wallet mnemonic={mnemonic} />
    </div>
</div>

  );
};

export default DropDown;
