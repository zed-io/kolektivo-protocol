// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Kolektivo TTD Token
/// @notice This its the ERC20 representing a collateralized
/// TTD stable coin of the Trinidad & Tobago Dollar by the
/// Kolektivo Project.
/// @dev This contract is Ownable to allow minting by an
/// authorized signatory. It is also Pausable to control
/// flow of tokens during an initial gathering phase.
/// @author wasteofintel.eth
contract KolektivoTTD is Ownable, Pausable, ERC20 {
    /// @notice Stores the known list of impact partners
    /// @dev Check this list on transfer for special events
    mapping(address => bool) _isImpactPartner;

    constructor() ERC20("Kolektivo Trinidad & Tobago Dollar", "KTTD") Ownable(msg.sender) {}

    /// @notice Disburse tokens to an account.
    /// @dev Only the owner can disburse tokens, and they are
    /// minted by assigning / updating them directly in the recipient's balance.
    /// @param account account to be disbursed tokens
    /// @param amount of tokens to be disbursed
    function mint(address account, uint256 amount) public onlyOwner whenNotPaused {
        _mint(account, amount);
    }

    /// @notice Burn tokens from the locked supply.
    /// @dev Only the owner can burn tokens, and tokens are burned
    /// by transferring them from the contract to the zero address.
    /// @param amount amount of tokens to be burned
    function burn(uint256 amount) public onlyOwner {
        super._transfer(address(this), address(0), amount);
    }

    function _update(address from, address to, uint256 amount) internal virtual override {
        if (_isImpactPartner[to]) {
            emit ImpactPartnerTransfer(from, to, amount);
        }
        super._update(from, to, amount);
    }

    function addPartner(address account) external onlyOwner {
        _isImpactPartner[account] = true;
    }

    function addPartners(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            _isImpactPartner[accounts[i]] = true;
        }
    }

    function isPartner(address account) external view returns (bool) {
        return _isImpactPartner[account];
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Emitted when a transfer is made to an impact partner
    event ImpactPartnerTransfer(address indexed customer, address indexed partner, uint256 amount);
}
