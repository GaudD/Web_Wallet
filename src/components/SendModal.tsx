'use client';

import { useEffect, useState } from "react";
import axios from "axios";

interface SendModalProps {
    isOpen: boolean;
    onClose: () => void;
    privateKey: string; // Remove publicKey if not needed
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, privateKey }) => {
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState<number | string>(""); // Initialize as an empty string
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<JSX.Element | null>(null);

    useEffect(() => {
        if (success) {
            setSuccess(null)
        }
        if (error) {
            setError(null)
        }
        if (recipientAddress != "") {
            setRecipientAddress("")
        }
        if (amount != "") {
            setAmount("")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onClose])

    const handleSend = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Input validation
        if (!recipientAddress || !privateKey || !amount || Number(amount) <= 0) {
            setError("Please enter valid recipient address and amount.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post("/api/send", {
                recipient: recipientAddress,
                amount: Number(amount),
                privateKey,
            });

            if (response.status === 200 && response.data.success) {
                const transactionSignature = response.data.signature;
                setSuccess(
                    <>
                        Transaction successful!{" "}
                        <a 
                            href={`https://solscan.io/tx/${transactionSignature}?cluster=devnet`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 underline"
                        >
                            View on Solscan
                        </a>
                    </>
                );
                setRecipientAddress(""); // Clear the input field
                setAmount(""); // Clear the input field
            } else {
                setError("Transaction failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            const errorMessage = (err as Error).message || "Error sending SOL."; // Specify the type as Error
            setError("Error sending SOL: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-neutral-950 h-screen mr-36">
            <div className="bg-neutral-950 rounded-lg p-6 max-w-md w-full border mb-20">
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
                        onChange={(e) => setAmount(e.target.value)}
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
