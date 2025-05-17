import {
  Address,
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatEther,
  Hash,
  parseEther,
  PublicClient,
  WalletClient,
} from "viem";
import "viem/window";
import { coffeeAbi, contractAddress } from "./constants-ts";

// DOM Elements
const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const balanceButton = document.getElementById("balanceButton") as HTMLButtonElement;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;

// Client variables
let walletClient: WalletClient;
let publicClient: PublicClient;

/**
 * Connects to the user's Ethereum wallet
 */
async function connect(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });

    const accounts: Address[] = await walletClient.requestAddresses();
    console.log(accounts);
    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

/**
 * Funds the contract with the specified ETH amount
 */
async function fund(): Promise<void> {
  const ethAmount: string = ethAmountInput.value;
  console.log(`Funding with ${ethAmount}...`);

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });

    const [connectedAccount]: Address[] = await walletClient.requestAddresses();
    const currentChain: Chain = await getCurrentChain(walletClient);

    console.log("Processing transaction...");
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress as Address,
      abi: coffeeAbi,
      functionName: "fund",
      account: connectedAccount,
      chain: currentChain,
      value: parseEther(ethAmount),
    });

    const hash: Hash = await walletClient.writeContract(request);
    console.log(`Transaction hash: ${hash}`);
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

/**
 * Gets the balance of the contract
 */
async function getBalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    try {
      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      });
      const balance = await publicClient.getBalance({
        address: contractAddress as Address,
      });
      console.log(formatEther(balance));
      alert(`Current Contract Balance: ${formatEther(balance)} ETH`);
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

/**
 * Withdraws funds from the contract
 */
async function withdraw(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    try {
      walletClient = createWalletClient({
        transport: custom(window.ethereum),
      });

      const [connectedAccount]: Address[] =
        await walletClient.requestAddresses();
      const currentChain: Chain = await getCurrentChain(walletClient);

      console.log("Processing withdraw...");
      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: contractAddress as Address,
        abi: coffeeAbi,
        functionName: "withdraw",
        account: connectedAccount,
        chain: currentChain,
      });

      const hash: Hash = await walletClient.writeContract(request);
      console.log(`Withdraw transaction hash: ${hash}`);
      alert("Withdraw successful!");
    } catch (error: any) {
      console.log(error);
      alert(`Withdraw failed: ${error.message}`);
    }
  } else {
    alert("Please install MetaMask!");
  }
}

/**
 * Gets the current blockchain chain
 * @param client - The wallet client
 * @returns The current chain
 */
async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId: number = await client.getChainId();
  const currentChain: Chain = defineChain({
    id: chainId,
    name: "Anvil",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  });
  return currentChain;
}

// Event Listeners
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
