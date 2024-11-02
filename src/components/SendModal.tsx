'use client'

import { useState } from "react";
import axios from "axios";

interface SendModalProps {
    isOpen: boolean;
    onClose: () => void;
    publicKey: string; // Pass public key to use it for sending
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, publicKey }) => {
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSend = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post("/api/send", {
                from: publicKey,
                to: recipientAddress,
                amount: amount,
            });

            if (response.status === 200) {
                setSuccess("Transaction successful!");
            } else {
                setError("Transaction failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Error sending SOL.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-neutral-950 rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Send SOL</h2>
                    <button onClick={onClose} aria-label="Close Modal" className="text-gray-600 hover:text-gray-900">
                        &times; {/* Close icon */}
                    </button>
                </div>
                {error && <p className="text-red-600 mt-2">{error}</p>}
                {success && <p className="text-green-600 mt-2">{success}</p>}
                <div className="mb-4 mt-4">
                    <label className="block mb-2">Recipient Address</label>
                    <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="border rounded-lg p-2 w-full text-black"
                        placeholder="Enter recipient address"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Amount (SOL)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="border rounded-lg p-2 w-full text-black"
                        placeholder="Enter amount to send"
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-blue-500 text-white rounded-lg px-4 py-2"
                >
                    {loading ? "Sending..." : "Send"}
                </button>
                <button
                    onClick={onClose}
                    className="ml-2 rounded-lg px-4 py-2 bg-red-900"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SendModal;
