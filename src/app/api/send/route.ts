import { NextResponse } from 'next/server';
import { Connection, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';

const connection = new Connection(clusterApiUrl('devnet'));

export async function POST(request: Request) {
    try {
        const { recipient, amount, privateKey } = await request.json();

        // Validate input
        if (!recipient || !privateKey || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ success: false, error: 'Invalid input parameters' }, { status: 400 });
        }

        // Decode the private key from base58
        const decodedKey = bs58.decode(privateKey);
        const senderKeypair = Keypair.fromSecretKey(decodedKey);

        // Create the transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: senderKeypair.publicKey,
                toPubkey: recipient,
                lamports: amount * 1e9, // Convert SOL to lamports
            })
        );

        // Send the transaction
        const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

        // Send response back to client
        return NextResponse.json({ success: true, signature });
    } catch (error) {
        console.error("Transaction error:", error);
        const errorMessage = (error as Error).message || 'Transaction failed';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
    
}
