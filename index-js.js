import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatEther,
  parseEther,
} from "https://esm.sh/viem";
import "https://esm.sh/viem/window";
import { coffeeAbi, contractAddress } from "./constants-js.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const ethAmountInput = document.getElementById("ethAmount");

let walletClient;
let publicClient;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });

    const accounts = await walletClient.requestAddresses();
    console.log(accounts);
    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function fund() {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount}...`);

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });

    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    console.log("Processing transaction...");
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: coffeeAbi,
      functionName: "fund",
      account: connectedAccount,
      chain: currentChain,
      value: parseEther(ethAmount),
    });

    const hash = await walletClient.writeContract(request);
    console.log(`Transaction hash: ${hash}`);
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    try {
      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      });
      const balance = await publicClient.getBalance({
        address: contractAddress,
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

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    try {
      walletClient = createWalletClient({
        transport: custom(window.ethereum),
      });

      const [connectedAccount] = await walletClient.requestAddresses();
      const currentChain = await getCurrentChain(walletClient);

      console.log("Processing withdrawal...");
      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: coffeeAbi,
        functionName: "withdraw",
        account: connectedAccount,
        chain: currentChain,
      });

      const hash = await walletClient.writeContract(request);
      console.log(`Withdrawal transaction hash: ${hash}`);
      alert("Withdrawal successful!");
    } catch (error) {
      console.log(error);
      alert("Withdrawal failed: " + error.message);
    }
  }
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId();
  const currentChain = defineChain({
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

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
