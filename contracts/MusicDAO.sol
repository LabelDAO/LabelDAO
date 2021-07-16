// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetMinterPauserUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MusicDAO is
    Initializable,
    ERC20PresetMinterPauserUpgradeable,
    OwnableUpgradeable
{
    function init() public initializer  {
        __ERC20PresetMinterPauser_init("MusicDAO", "SOUND");
        _mint(msg.sender, 1000000000 * 10**decimals());
    }
}
