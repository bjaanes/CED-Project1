pragma solidity ^0.4.17;

contract Splitter {
    address public owner;
    mapping (address => uint) public pendingWithdrawls;

    event LogSplitFunds(address indexed sender, address indexed recipient1, address indexed recipient2, uint amount, uint amountToRecipient1, uint amountToRecipient2);
    event LogWithdrawal(address indexed receiver, uint amount);

    function Splitter() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function splitEther(address recipient1, address recipient2) public payable returns(uint amountToRecipient1, uint amountToRecipient2) {
        require(msg.value != 0);
        require(recipient1 != address(0));
        require(recipient2 != address(0));

        uint half = msg.value / 2;
        uint remainder = msg.value % 2;
        uint splitToRecipient1 = half;
        uint splitToRecipient2 = half;

        pendingWithdrawls[recipient1] += splitToRecipient1;
        pendingWithdrawls[recipient2] += splitToRecipient2;
        if (remainder > 0) {
            pendingWithdrawls[msg.sender] += remainder;
        }

        LogSplitFunds(msg.sender, recipient1, recipient2, msg.value, splitToRecipient1, splitToRecipient2);
        return (splitToRecipient1, splitToRecipient2);
    }

    function withdraw() public {
        uint amount = pendingWithdrawls[msg.sender];
        require(amount > 0);
        pendingWithdrawls[msg.sender] = 0;
        LogWithdrawal(msg.sender, amount);
        msg.sender.transfer(amount);
    }

    function kill() onlyOwner public {
        selfdestruct(owner);
    }
    
}