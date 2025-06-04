// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
import "./MyCoin.sol";

contract ExchangeETH {
   address public owner; //我的地址
   MyCoin public hczToken; //代币的合约地址
   uint256 public rate = 100; // 1 ETH = 100 HCZ

   constructor(address _tokenAddress) {
     owner = msg.sender;
     hczToken = MyCoin(_tokenAddress); // 初始化，绑定已部署的 MyCoin 合约
   }
   // 接收 ETH 并兑换代币
    receive() external payable {
        buyTokens();
    }
    // 用ETH购买代币
    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");

        uint256 tokenAmount = msg.value * rate;

        require(hczToken.balanceOf(address(this)) >= tokenAmount, "Not enough tokens in the contract"); //账户余额不能少于用户要买的代币

        hczToken.transfer(msg.sender, tokenAmount);
    }
     // 查询合约从 owner 被授权的额度
    function allowance() public view returns (uint256) {
        return hczToken.allowance(owner, address(this));
    }
    // 提现功能（只允许 owner）
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}

