var Splitter = artifacts.require("./Splitter.sol");

contract("Splitter", function(accounts) {
  var contract;

  const account0 = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];

  beforeEach(async () => {
    contract = await Splitter.new({ from: account0 });
  });

  it("should have set owner correctly", async () => {
    let actualOwnerAddress = await contract.owner();

    assert.strictEqual(
      actualOwnerAddress,
      account0,
      "owner is not set up correctly"
    );
  });

  describe("splitEther", function() {
    it("should revert if no Ether is sent in", async () => {
      try {
        await contract.splitEther(account1, account2, { from: account0, value: 0 });
      } catch (e) {
        return true;
      }

      throw new Error("Should fail when no Ether sent in");
    });

    it("should revert if null account is sent in", async () => {
      try {
        await contract.splitEther(0x0, account2, { from: account0, value: 0 });
      } catch (e) {
        return true;
      }

      try {
        await contract.splitEther(accoun1, 0x0, { from: account0, value: 0 });
      } catch (e) {
        return true;
      }

      throw new Error("Should fail when null account sent in");
    });

    it("should return the split equal between account1 and account2", async () => {
      let returnValues = await contract.splitEther.call(account1, account2, {
        from: account0,
        value: 10
      });

      assert.strictEqual(
        returnValues[0].toString(10),
        "5",
        "recipient1 split is not correct"
      );
      assert.strictEqual(
        returnValues[1].toString(10),
        "5",
        "recipient2 split is not correct"
      );
    });

    it("should update recipient1 and recipient2 owed", async () => {
      await contract.splitEther(account1, account2, { from: account0, value: 20 });
      await contract.splitEther(account1, account2, { from: account0, value: 10 });

      let actualRecipient1 = await contract.pendingWithdrawls(account1);
      let actualRecipient2 = await contract.pendingWithdrawls(account2);

      assert.strictEqual(
        actualRecipient1.toString(10),
        "15",
        "Recipient1 pending is not correct"
      );
      assert.strictEqual(
        actualRecipient1.toString(10),
        "15",
        "Recipient2 pending is not correct"
      );
    });

    it("should update senders owed when wei is odd", async () => {
      await contract.splitEther(account1, account2, { from: account0, value: 21 });
      
      let actualRecipient1 = await contract.pendingWithdrawls(account1);
      let actualRecipient2 = await contract.pendingWithdrawls(account2);
      let actualSenderOwed = await contract.pendingWithdrawls(account0);

      assert.strictEqual(
        actualRecipient1.toString(10),
        "10",
        "Recipient1 pending is not correct"
      );
      assert.strictEqual(
        actualRecipient2.toString(10),
        "10",
        "Recipient2 pending is not correct"
      );
      assert.strictEqual(
        actualSenderOwed.toString(10),
        "1",
        "Sender pending is not correct"
      );
    });
  });

  describe("withdraw", async () => {
    it("should revert if nothing to withdraw", async () => {
      try {
        await contract.withdraw({ from: account0 });
      } catch (e) {
        return true;
      }

      throw new Error("Should fail when anyone nothing to withdraw");
    });

    it("should send correct amount if account1 withdraws", async () => {
      await contract.splitEther(account1, account2, { from: account0, value: 20 });

      let account1BeforeBalance = await web3.eth.getBalance(account1);
      let receipt = await contract.withdraw({ from: account1 });
      const gasUsed = receipt.receipt.gasUsed;
      const tx = await web3.eth.getTransaction(receipt.tx);
      const gasPrice = tx.gasPrice;

      let account1ActualBalance = await web3.eth.getBalance(account1);
      assert.strictEqual(
        account1ActualBalance.toString(10),
        account1BeforeBalance
          .plus(10)
          .minus(gasPrice.mul(gasUsed))
          .toString(10),
        "Account1 has not gotten the correct amound withdrawn"
      );
    });

    it("should send correct amount if account2 withdraws", async () => {
      await contract.splitEther(account1, account2, { from: account0, value: 30 });

      let account2BeforeBalance = await web3.eth.getBalance(account2);
      let receipt = await contract.withdraw({ from: account2 });
      const gasUsed = receipt.receipt.gasUsed;
      const tx = await web3.eth.getTransaction(receipt.tx);
      const gasPrice = tx.gasPrice;

      let account2ActualBalance = await web3.eth.getBalance(account2);
      assert.strictEqual(
        account2ActualBalance.toString(10),
        account2BeforeBalance
          .plus(15)
          .minus(gasPrice.mul(gasUsed))
          .toString(10),
        "Account2 has not gotten the correct amound withdrawn"
      );
    });
  });

  describe("kill", function() {
    it("should revert if sender is not owner", async () => {
      try {
        await contract.kill({ from: account1 });
      } catch (e) {
        return true;
      }

      throw new Error("Should fail when anyone but Owner (account0) tries to kill");
    });
  });
});
