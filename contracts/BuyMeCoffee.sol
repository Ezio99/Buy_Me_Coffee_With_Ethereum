// // SPDX-License-Identifier: MIT
// pragma solidity 0.8.19;

// contract BuyMeCoffee {
//     /* Errors */
//     error BuyMeCoffee__OnlyOwnerAccessible();
//     error BuyMeCoffee__FundWithoutEth();
//     error BuyMeCoffee__NoFundsToWithdraw();
//     error BuyMeCoffee__ErrorWithdrawingFunds();

//     /* State Variables */
//     address private immutable i_owner;

//     address[] private s_funders;

//     constructor(address owner) {
//         i_owner = owner;
//     }

//     function buyCoffee() external payable {
//         if (msg.value == 0) {
//             revert BuyMeCoffee__FundWithoutEth();
//         }

//         s_funders.push(msg.sender);
//     }

//     function withdrawCoffeeFunds() external onlyOwner {
//         if (address(this).balance == 0) {
//             revert BuyMeCoffee__NoFundsToWithdraw();
//         }

//         (bool success, ) = i_owner.call{value: address(this).balance}("");

//         if(!success){
//             revert BuyMeCoffee__ErrorWithdrawingFunds();
//         }
//     }

//     modifier onlyOwner() {
//         if (msg.sender != i_owner) {
//             revert BuyMeCoffee__OnlyOwnerAccessible();
//         }
//         _;
//     }
// }
