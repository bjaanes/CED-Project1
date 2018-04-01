pragma solidity ^0.4.17;

contract Splitter {
    address public alice;
    address public bob;
    address public carol;

    function Splitter(address _bob, address _carol) public {
        alice = msg.sender;
        bob = _bob;
        carol = _carol;
    }

    function splitEther() public payable returns(uint toBob, uint toCarol) {
        if (msg.sender != alice) revert();
        if (msg.value <= 1) revert();
        
        uint splitToBob = msg.value/2;
        uint splitToCarol = msg.value/2;

        bob.transfer(splitToBob);
        carol.transfer(splitToCarol);

        return (splitToBob, splitToCarol);
    }

    function kill() public {
        if(msg.sender != alice) revert();
        selfdestruct(alice);
    }
    
}