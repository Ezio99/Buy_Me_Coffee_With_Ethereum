import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseEther,
  formatEther,
  defineChain,
  type Address,
  type Chain,
  type PublicClient,
  type WalletClient,
} from "viem";
// If your ABI/address are in TS, import them like below.
// If they are still in a .js file, change to: `./constants-js.js` and add `// @ts-ignore` on the import line.
import { contractAddress, coffeeAbi } from "./constants-ts";

// --- Minimal typing for window.ethereum (EIP-1193) ---
declare global {
  interface Window {
    ethereum?: any; // Replace `any` with a stricter EIP-1193 type if you have one available
  }
}

// --- DOM elements (safe-typed) ---
const connectButton = document.getElementById("connect_wallet") as HTMLButtonElement | null;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement | null;
const fundingAmount = document.getElementById("ethAmount") as HTMLInputElement | null;
const balanceButton = document.getElementById("getBalanceButton") as HTMLButtonElement | null;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement | null;
(document.getElementById("contractAddressText") as HTMLElement).textContent = contractAddress;

// --- Clients & state ---
let walletClient: WalletClient | undefined;
let connectedAccount: Address | undefined;
let currentChain: Chain | undefined;

// Reads/simulations: talk directly to Anvil (adjust URL if needed)
const RPC_URL = "http://localhost:8545";
const publicClient = createPublicClient({ transport: http(RPC_URL) });



// --- Helpers ---
async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId = await client.getChainId();
  return defineChain({
    id: chainId,
    name: "Local Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  });
}

function requireElement<T extends HTMLElement>(el: T | null, name: string): T {
  if (!el) throw new Error(`Missing DOM element: ${name}`);
  return el;
}

// --- Actions ---
async function connect(): Promise<void> {
  const btn = requireElement(connectButton, "connect_wallet");
  if (!window.ethereum) {
    btn.innerHTML = "Please install an ETH wallet!";
    return;
  }

  walletClient = createWalletClient({
    transport: custom(window.ethereum),
  });

  const accounts = await walletClient.requestAddresses();
  connectedAccount = accounts[0] as Address;

  (document.getElementById("accountBadge") as HTMLElement).textContent =
    connectedAccount.slice(0, 6) + "…" + connectedAccount.slice(-4);

  currentChain = await getCurrentChain(walletClient);
  (document.getElementById("networkName") as HTMLElement).textContent = currentChain.name


  btn.innerHTML = "Connected!";
  console.log(`Connected account ${connectedAccount}`);
}

async function fundContract(): Promise<void> {
  if (!walletClient) {
    console.log("Attempting to auto-connect to wallet");
    await connect();
  }
  if (!walletClient || !connectedAccount) {
    throw new Error("Wallet not connected");
  }

  const input = requireElement(fundingAmount, "ethAmount");
  const ethAmountStr = input.value?.trim();
  if (!ethAmountStr) throw new Error("Please enter an ETH amount");

  const valueWei = parseEther(ethAmountStr);
  console.log(`Funding contract with ${ethAmountStr} ETH...`);
  console.log(`Funding contract with ${valueWei} wei...`);

  // Simulate first
  const { request } = await publicClient.simulateContract({
    address: contractAddress as Address,
    abi: coffeeAbi,
    functionName: "fund",
    account: connectedAccount,
    chain: currentChain,
    value: valueWei,
    // blockTag: "latest", // optional; default is fine
  });

  console.log("Simulated request:", request);

  // Send tx via MetaMask wallet client
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Receipt:", receipt);
  console.log(`Txn hash - ${hash}`);
}

async function getBalance(): Promise<void> {
  const bal = await publicClient.getBalance({ address: contractAddress as Address });
  console.log(`Current contract balance - ${formatEther(bal)} ETH`);
  (document.getElementById("contractBalance") as HTMLElement).textContent = formatEther(bal);
}

async function withdraw(): Promise<void> {
  if (!walletClient) {
    console.log("Attempting to auto-connect to wallet");
    await connect();
  }
  if (!walletClient || !connectedAccount) {
    throw new Error("Wallet not connected");
  }

  console.log(`Attempting to withdraw funds with wallet ${connectedAccount}`);

  const { request } = await publicClient.simulateContract({
    address: contractAddress as Address,
    abi: coffeeAbi,
    functionName: "cheaperWithdraw",
    account: connectedAccount,
    chain: currentChain,
  });

  console.log("Simulated request:", request);

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Receipt:", receipt);
  console.log(`Txn hash - ${hash}`);
}

// --- Wire up buttons safely ---
requireElement(connectButton, "connect_wallet").onclick = () => void connect();
requireElement(fundButton, "fundButton").onclick = () => void fundContract();
requireElement(balanceButton, "getBalanceButton").onclick = () => void getBalance();
requireElement(withdrawButton, "withdrawButton").onclick = () => void withdraw();




