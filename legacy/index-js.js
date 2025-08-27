//Viem is a modern TypeScript/JavaScript library for interacting with Ethereum (and other EVM-compatible blockchains)
import { createWalletClient, custom, createPublicClient, parseEther, formatEther, defineChain } from "https://esm.sh/viem"
import { contractAddress, coffeeAbi } from "./constants-js.js"




const connectButton = document.getElementById("connect_wallet")
const fundButton = document.getElementById("fundButton")
const fundingAmount = document.getElementById("ethAmount")
const balanceButton = document.getElementById("get_balance")
const withdrawButton = document.getElementById("withdraw")

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
    // Waits for the Transaction to be included on a Block (one confirmation), and then returns the Transaction Receipt. If the Transaction reverts, then the action will throw an error.
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(receipt)
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

async function withdraw(){
    if (!walletClient) {
        console.log("Attempting to auto-connect to wallet")
        await connect()
    }

        let publicClient = createPublicClient({
        transport: custom(window.ethereum)
    })

    const currentChain = await getCurrentChain(walletClient)

    console.log(`Attempting to withdraw funds with wallet ${connectedAccount}`)

    //Simulate calling contract, if it passes we actually call the contract
    const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: coffeeAbi,
        functionName: "cheaperWithdraw",
        account: connectedAccount,
        chain: currentChain,
        value:0,
    })

    console.log(request)

    const hash = await walletClient.writeContract(request)
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(receipt)
    console.log(`Txn hash -  ${hash}`)
}

// Here, you are calling connect() right away when this line of code runs.
// connectButton.onclick = connect();

// assigning the function connect itself as the event handler
connectButton.onclick = connect
fundButton.onclick = fundContract
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw



