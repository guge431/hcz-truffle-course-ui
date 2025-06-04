// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyCoin is ERC20 {
  string public constant myName="HczERC20Toke";
  string public constant mySymbol = "HCZ";
   //初始发行量
   uint256 public constant inital_supply = 1000000;

  constructor() ERC20(myName,mySymbol) {
    _mint(msg.sender,inital_supply * 10 ** 18);
  }

  function decimals() public view virtual override returns (uint8){
    return 0 ;
  }

}

