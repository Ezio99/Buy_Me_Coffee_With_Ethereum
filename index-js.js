//Viem is a modern TypeScript/JavaScript library for interacting with Ethereum (and other EVM-compatible blockchains)
import { createWalletClient, custom, createPublicClient, parseEther, formatEther, defineChain } from "https://esm.sh/viem"
import { contractAddress, coffeeAbi } from "./constants-js.js"




const connectButton = document.getElementById("connect_wallet")
const fundButton = document.getElementById("fundButton")
const fundingAmount = document.getElementById("ethAmount")
const balanceButton = document.getElementById("get_balance")

let walletClient
let connectedAccount




//Connect to browser meta mask
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Eth wallet is present")
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        })
        const accounts = await walletClient.requestAddresses()
        connectedAccount = accounts[0]
        connectButton.innerHTML = "Connected!"
        console.log(`Connected account ${connectedAccount}`)
    }
    else {
        connectButton.innerHTML = "Please install a ETH wallet!"
    }
}


async function fundContract() {
    if (!walletClient) {
        console.log("Attempting to auto-connect to wallet")
        await connect()
    }

    const ethAmount = fundingAmount.value;
    console.log(`Funding contract with ${ethAmount} ETH...`)
    console.log(`Funding contract with ${parseEther(ethAmount)} wei...`)


    let publicClient = createPublicClient({
        transport: custom(window.ethereum)
    })

    const currentChain = await getCurrentChain(walletClient)


    //Simulate calling contract, if it passes we actually call the contract
    const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: coffeeAbi,
        functionName: "fund",
        account: connectedAccount,
        chain: currentChain,
        // parseEther -> string representation of ether to numerical wei.
        value: parseEther(ethAmount),
    })

    console.log(request)

    const hash = await walletClient.writeContract(request)
    console.log(`Txn hash -  ${hash}`)



}

async function getCurrentChain(client) {
    const chainId = await client.getChainId()
    const currentChain = defineChain({
        id: chainId,
        name: "Custom Chain",
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

async function getBalance() {
    let publicClient = createPublicClient({
        transport: custom(window.ethereum)
    })

    const balance = await publicClient.getBalance({
        address: contractAddress
    })

    console.log(`Current contract balance - ${formatEther(balance)}`)
    console.log(formatEther(balance))




}

// Here, you are calling connect() right away when this line of code runs.
// connectButton.onclick = connect();

// assigning the function connect itself as the event handler
connectButton.onclick = connect
fundButton.onclick = fundContract
balanceButton.onclick = getBalance




