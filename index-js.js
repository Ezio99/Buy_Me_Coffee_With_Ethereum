//Viem is a modern TypeScript/JavaScript library for interacting with Ethereum (and other EVM-compatible blockchains)
import { createWalletClient, custom } from "https://esm.sh/viem"

const connectButton = document.getElementById("connect_wallet")
const fundButton = document.getElementById("fundButton")
const fundingAmount = document.getElementById("ethAmount")

let walletClient


//Connect to browser meta mask
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Eth wallet is present")
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        })
        await walletClient.requestAddresses()
        connectButton.innerHTML = "Connected!"
    }
    else {
        connectButton.innerHTML = "Please install a ETH wallet!"
    }
}


async function fund() {
    if (!walletClient) {
        console.log("Auto connecting to wallet")
        await connect()
    }



    const ethAmount = fundingAmount.value;
    console.log(`Funding contract with ${ethAmount} ETH...`)


}

// Here, you are calling connect() right away when this line of code runs.
// connectButton.onclick = connect();

// assigning the function connect itself as the event handler
connectButton.onclick = connect

fundButton.onclick = fund


