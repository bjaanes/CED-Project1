var Splitter = artifacts.require("./Splitter.sol");

module.exports = function(deployer) {
  deployer.deploy(Splitter, '0xf17f52151EbEF6C7334FAD080c5704D77216b732', '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef');
};
