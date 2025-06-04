const MyCoin = artifacts.require("MyCoin");
const BuyCourses = artifacts.require("BuyCourses");
const ExchangeETH = artifacts.require("ExchangeETH");

module.exports = async function (deployer) {
  await deployer.deploy(MyCoin);
  const myCoin = await MyCoin.deployed();

  await deployer.deploy(BuyCourses, myCoin.address);
  await deployer.deploy(ExchangeETH, myCoin.address);
}