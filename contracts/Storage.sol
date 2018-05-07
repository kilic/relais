pragma solidity ^0.4.21;

contract Storage{

  uint x = 1000;
  address public lastSender;
  event ValueSet(address sender, uint256 value);

  function setX(address sender, uint value) public {
    x = value;
    lastSender = sender;
    emit ValueSet(sender,value);
  }

  function getX() public view returns(uint){
    return x;
  }
}