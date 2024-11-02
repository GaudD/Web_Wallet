import { NextResponse } from 'next/server';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Define the expected response shape for successful or failed API calls
interface BalanceResponse {
  balance?: number;
  error?: string;
}

// Define the function for fetching balance from the Solana network
export async function GET(request: Request): Promise<NextResponse<BalanceResponse>> {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('Address');

  if (!address) {
    return NextResponse.json({ error: 'Address parameter is missing' }, { status: 400 });
  }

  try {
    // Fetch balance from the Solana network
    const balance = await getBalanceFromSolana(address);

    // Set up CORS headers (adjust for production)
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');

    return NextResponse.json({ balance }, { headers });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}

// Define the balance-fetching function with correct types
async function getBalanceFromSolana(publicKey: string): Promise<number> {
  const connection = new Connection(clusterApiUrl('devnet'));
  const pubKey = new PublicKey(publicKey);

  // Check if the account exists on-chain
  const accountInfo = await connection.getAccountInfo(pubKey);
  if (accountInfo === null) {
    console.warn(`Account ${publicKey} does not exist on-chain.`);
    return 0; // Return 0 for unfunded accounts
  }

  // Fetch the balance in lamports and convert to SOL
  const balanceLamports = await connection.getBalance(pubKey);
  return balanceLamports / 1e9; // Convert lamports to SOL
}
