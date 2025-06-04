const ExchangeETH = artifacts.require("ExchangeETH");
const MyCoin = artifacts.require("MyCoin");

module.exports = async function(deployer) {
  // 获取已部署的 MyCoin 地址
  const myCoinInstance = await MyCoin.deployed();

  // 部署 ExchangeETH，传入 MyCoin 地址
  await deployer.deploy(ExchangeETH, myCoinInstance.address);
};