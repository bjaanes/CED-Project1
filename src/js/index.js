import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";
import "./../css/index.css";
import UserGreeting from "./user_greeting";
import Split from "./split";

const promisify = inner =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  );

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userAccount: 0x0,
      aliceBalance: 0,
      bobBalance: 0,
      carolBalance: 0
    };
    if (typeof web3 !== "undefined") {
      console.log("Using web3 detected from external source like Metamask");
      this.web3 = new Web3(web3.currentProvider);
    } else {
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:7545")
      );
    }

    const filter = web3.eth.filter("latest");
    filter.watch((err, res) => {
      if (err) {
        console.log(`Watch error: ${err}`);
      } else {
        web3.eth.getBalance(this.state.alice, (err, bal) => {
          this.setState({ aliceBalance: bal });
        });

        web3.eth.getBalance(this.state.bob, (err, bal) => {
          this.setState({ bobBalance: bal });
        });

        web3.eth.getBalance(this.state.carol, (err, bal) => {
          this.setState({ carolBalance: bal });
        });
      }
    });

    const MyContract = this.web3.eth.contract(
      JSON.parse(
        '[ { "constant": true, "inputs": [], "name": "carol", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "bob", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "alice", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "_bob", "type": "address" }, { "name": "_carol", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [], "name": "splitEther", "outputs": [ { "name": "toBob", "type": "uint256" }, { "name": "toCarol", "type": "uint256" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]'
      )
    );

    this.state.ContractInstance = MyContract.at(
      "0x68b5e461314b450c3740fc6e489b88bbdfe3117b"
    );

    this.split = this.split.bind(this);
  }

  componentDidMount() {
    this.updateState();
    //this.setupListeners();
  }

  async updateState() {
    if (!this.state.alice) {
      this.setState({
        alice: await promisify(cb => this.state.ContractInstance.alice(cb))
      });
    }
    if (!this.state.bob) {
      this.setState({
        bob: await promisify(cb => this.state.ContractInstance.bob(cb))
      });
    }
    if (!this.state.carol) {
      this.setState({
        carol: await promisify(cb => this.state.ContractInstance.carol(cb))
      });
    }

    this.setState({
      aliceBalance: await promisify(cb =>
        this.web3.eth.getBalance(this.state.alice, cb)
      )
    });
    this.setState({
      bobBalance: await promisify(cb =>
        this.web3.eth.getBalance(this.state.bob, cb)
      )
    });
    this.setState({
      carolBalance: await promisify(cb =>
        this.web3.eth.getBalance(this.state.carol, cb)
      )
    });

    this.setState({ userAccount: this.web3.eth.accounts[0] });
  }

  split(ether) {
    this.state.ContractInstance.splitEther(
      { from: this.state.alice, value: this.web3.toWei(ether) },
      (err, txHash) => {
        this.web3.eth
          .getTransactionReceiptMined(txHash)
          .then(txRes => {})
          .catch(console.log);
      }
    );
  }

  render() {
    return (
      <div>
        <UserGreeting
          user={this.state.userAccount}
          alice={this.state.alice}
          bob={this.state.bob}
          carol={this.state.carol}
        />
        <div>
          Alice's Balance:{" "}
          {this.web3.fromWei(this.state.aliceBalance).toString(10)}
        </div>
        <div>
          Bob' Balance: {this.web3.fromWei(this.state.bobBalance).toString(10)}
        </div>
        <div>
          Carol's Balance:{" "}
          {this.web3.fromWei(this.state.carolBalance).toString(10)}
        </div>
        <Split
          user={this.state.userAccount}
          alice={this.state.alice}
          onClick={this.split}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
