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

    it("should update bob and carols owed", async () => {
      await contract.splitEther({ from: alice, value: 20 });
      await contract.splitEther({ from: alice, value: 10 });

      let actualBobPending = await contract.pendingWithdrawls(bob);
      let actualCarolPending = await contract.pendingWithdrawls(carol);

      assert.strictEqual(
        actualBobPending.toString(10),
        "15",
        "Bob's pending is not correct"
      );
      assert.strictEqual(
        actualCarolPending.toString(10),
        "15",
        "Carols's pending is not correct"
      );
    });

    it("should round down when wei is odd", async () => {
      await contract.splitEther({ from: alice, value: 21 });

      let actualBobPending = await contract.pendingWithdrawls(bob);
      let actualCarolPending = await contract.pendingWithdrawls(carol);

      assert.strictEqual(
        actualBobPending.toString(10),
        "10",
        "Bob's pending is not correct"
      );
      assert.strictEqual(
        actualCarolPending.toString(10),
        "10",
        "Carols's pending is not correct"
      );
    });
  });

  describe("withdraw", async () => {
    it("should revert if sender is not bob or carol", async () => {
      try {
        await contract.withdraw({ from: alice });
      } catch (e) {
        return true;
      }

      throw new Error(
        "Should fail when anyone but Bob or Carol tries to withdraw"
      );
    });

    it("should revert if nothing to withdraw", async () => {
      try {
        await contract.withdraw({ from: bob });
      } catch (e) {
        return true;
      }

      throw new Error("Should fail when anyone nothing to withdraw");
    });

    it("should send correct amount if Bob withdraws", async () => {
      await contract.splitEther({ from: alice, value: 20 });

      let bobBeforeBalance = await web3.eth.getBalance(bob);
      let receipt = await contract.withdraw({ from: bob });
      const gasUsed = receipt.receipt.gasUsed;
      const tx = await web3.eth.getTransaction(receipt.tx);
      const gasPrice = tx.gasPrice;

      let bobActualBalance = await web3.eth.getBalance(bob);
      assert.strictEqual(
        bobActualBalance.toString(10),
        bobBeforeBalance
          .plus(10)
          .minus(gasPrice.mul(gasUsed))
          .toString(10),
        "Bob has not gotten the correct amound withdrawn"
      );
    });

    it("should send correct amount if Carol withdraws", async () => {
      await contract.splitEther({ from: alice, value: 30 });

      let carolBeforeBalance = await web3.eth.getBalance(carol);
      let receipt = await contract.withdraw({ from: carol });
      const gasUsed = receipt.receipt.gasUsed;
      const tx = await web3.eth.getTransaction(receipt.tx);
      const gasPrice = tx.gasPrice;

      let carolActualBalance = await web3.eth.getBalance(carol);
      assert.strictEqual(
        carolActualBalance.toString(10),
        carolBeforeBalance
          .plus(15)
          .minus(gasPrice.mul(gasUsed))
          .toString(10),
        "Carol has not gotten the correct amound withdrawn"
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
