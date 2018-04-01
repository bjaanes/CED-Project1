pragma solidity ^0.4.17;

contract Splitter {
    address public alice;
    address public bob;
    address public carol;

    mapping (address => uint) public pendingWithdrawls;

    function Splitter(address _bob, address _carol) public {
        alice = msg.sender;
        bob = _bob;
        carol = _carol;
    }

    function splitEther() public payable returns(uint toBob, uint toCarol) {
        require(msg.sender == alice);
        require(msg.value >= 2);
        
        uint splitToBob = msg.value/2;
        uint splitToCarol = msg.value/2;

        pendingWithdrawls[bob] += splitToBob;
        pendingWithdrawls[carol] += splitToCarol;

        return (splitToBob, splitToCarol);
    }

    function withdraw() public {
        require(msg.sender == bob || msg.sender == carol);
        uint amount = pendingWithdrawls[msg.sender];
        require(amount > 0);
        pendingWithdrawls[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    function kill() public {
        if(msg.sender != alice) revert();
        selfdestruct(alice);
    }
    
}