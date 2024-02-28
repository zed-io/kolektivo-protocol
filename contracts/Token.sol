// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol" as Ownable;
import "@openzeppelin/contracts/utils/Pausable.sol" as Pausable;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol" as ERC20;

/// @title Kolektivo TTD Token
/// @author wasteofintel.eth
/// @notice This its the ERC20 representing a collateralized
/// TTD stable coin of the Trinidad & Tobago Dollar by the
/// Kolektivo Project.
/// @dev This contract is Ownable to allow minting by an
/// authorized signatory. It is also Pausable to control
/// flow of tokens during an initial gathering phase.
contract KolektivoTTD is Ownable, Pausable {
    uint256 private perUserFaucetLimit = 1 ether;

    constructor() ERC20("Kolektivo TTD", "KTTD") {
        init();
    }

    /// @notice Disburse tokens to an account.
    /// @dev Only the owner can disburse tokens.
    /// @param address account to be disbursed tokens
    /// @param uint256 amount of tokens to be disbursed
    function mint(address account, uint256 amount) public onlyOwner {
        if (ERC20.balanceOf(account) < perUserFaucetLimit) {
            revert FaucetDripLimitReached();
        }
        _mint(account, amount);
    }

    /// @notice Transfers tokens from the sender to the recipient.
    /// @dev Internal accounting for managing sender / recipient balances
    /// this logic is pausable to incentivice the accumulation phase.
    /// @param address Sender's address
    /// @param address Recipient's address
    /// @param uint256 Amount of tokens to transfer
    function _transfer(address sender, address recipient, uint256 amount) internal override whenNotPaused {
        ERC20._transfer(sender, recipient, amount);
    }

    /// @notice This account has reached the maximum threshold to be
    /// dripped any more tokens.
    /// @dev The maximum drip limit is controlled by _faucetLimit
    /// and is not configurable.
    error FaucetDripLimitReached();
}
