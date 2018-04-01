var Splitter = artifacts.require("./Splitter.sol");

contract("Splitter", function(accounts) {
  var contract;

  const alice = accounts[0];
  const bob = accounts[1];
  const carol = accounts[2];

  beforeEach(async () => {
    contract = await Splitter.new(bob, carol, { from: alice });
  });

  it("should have set up alice, bob and carol correctly", async () => {
    let actualAliceAddress = await contract.alice();
    let actualBobAddress = await contract.bob();
    let actualCarolAddress = await contract.carol();

    assert.strictEqual(
      actualAliceAddress,
      alice,
      "Alice is not set up correctly"
    );
    assert.strictEqual(actualBobAddress, bob, "Bob is not set up correctly");
    assert.strictEqual(
      actualCarolAddress,
      carol,
      "Carol is not set up correctly"
    );
  });

  describe("splitEther", function() {
    it("should revert if no Ether is sent in", async () => {
      try {
        await contract.splitEther({ from: alice, value: 0 });
      } catch (e) {
        return true;
      }

      throw new Error("Should fail when no Ether sent in");
    });

    it("should revert if anyone but Alice sends Ether in", async () => {
      try {
        await contract.splitEther({ from: bob, value: 10 });
      } catch (e) {
        return true;
      }

      throw new Error("Should fail when bob tries to call splitEther");
    });

    it("should return the split equal between bob and carol", async () => {
      let returnValues = await contract.splitEther.call({
        from: alice,
        value: 10
      });
      assert.strictEqual(
        returnValues[0].toString(10),
        "5",
        "Bobss split is not correct"
      );
      assert.strictEqual(
        returnValues[1].toString(10),
        "5",
        "Carol's split is not correct"
      );
    });

    it("should send ether to bob and carol with correct split", async () => {
      let bobPreviousBalance = await web3.eth.getBalance(bob);
      let carolPreviousBalance = await web3.eth.getBalance(carol);
      await contract.splitEther({ from: alice, value: 20 });

      let actualBobBalance = await web3.eth.getBalance(bob);
      let actualCarolBalance = await web3.eth.getBalance(carol);

      assert.strictEqual(
        actualBobBalance.toString(10),
        bobPreviousBalance.plus(10).toString(10),
        "Bob's balance is not correct"
      );
      assert.strictEqual(
        actualCarolBalance.toString(10),
        carolPreviousBalance.plus(10).toString(10),
        "Carol's balance is not correct"
      );
    });

    it("should round down when wei is odd", async () => {
      let bobPreviousBalance = await web3.eth.getBalance(bob);
      let carolPreviousBalance = await web3.eth.getBalance(carol);
      await contract.splitEther({ from: alice, value: 21 });

      let actualBobBalance = await web3.eth.getBalance(bob);
      let actualCarolBalance = await web3.eth.getBalance(carol);

      assert.strictEqual(
        actualBobBalance.toString(10),
        bobPreviousBalance.plus(10).toString(10),
        "Bob's balance is not correct"
      );
      assert.strictEqual(
        actualCarolBalance.toString(10),
        carolPreviousBalance.plus(10).toString(10),
        "Carol's balance is not correct"
      );
    });
  });

  describe("kill", function() {
    it("should revert if sender is not alice", async () => {
      try {
        await contract.kill({ from: bob });
      } catch (e) {
        return true;
      }

      throw new Error("Should fail when anyone but Alice tries to kill");
    });
  });
});
