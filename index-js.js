import { createWalletClient, custom, createPublicClient, parseEther, defineChain } from "https://esm.sh/viem";
import { contractAddress, coffeeAbi } from "./constants-js.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmountInput = document.getElementById("ethAmount");

let walletClient;
let publicClient;


async function connect() { 
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
    
    const accounts = await walletClient.requestAddresses();
    console.log(accounts);
    connectButton.innerHTML = "Connected: " + accounts[0];
  }
  else {
    connectButton.innerHTML = "Please install MetaMask!";
  }  
}

async function fund() { 
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount}...`);

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum)
    });
    
    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum)
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
  }
  else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
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
  })
  return currentChain
}

connectButton.onclick = connect;
fundButton.onclick = fund;