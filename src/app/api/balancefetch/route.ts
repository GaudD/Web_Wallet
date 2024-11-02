import { NextResponse } from 'next/server';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('Address');
  
  if (!address) {
    return NextResponse.json({ error: 'Address parameter is missing' }, { status: 400 });
  }

  try {
    // Fetch balance from the Solana network
    const balance = await getBalanceFromSolana(address);

    // Add CORS headers manually
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*'); // Adjust this for specific origins in production
    headers.set('Access-Control-Allow-Methods', 'GET');

    return NextResponse.json({ balance }, { headers });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}

// Define your balance-fetching function here
async function getBalanceFromSolana(publicKey: string) {
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const pubKey = new PublicKey(publicKey);

  // Check if the account exists on-chain
  const accountInfo = await connection.getAccountInfo(pubKey);
  if (accountInfo === null) {
    console.warn(`Account ${publicKey} does not exist on-chain.`);
    return 0; // Set balance to 0 for unfunded accounts
  }

  // Fetch the balance in lamports and convert to SOL
  const balanceLamports = await connection.getBalance(pubKey);
  return balanceLamports / 1e9; // 1 SOL = 1 billion lamports
}
