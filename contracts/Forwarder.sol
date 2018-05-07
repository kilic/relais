pragma solidity ^0.4.21;

import "./ECRecover.sol";
import "./BytesOp.sol";

contract Forwarder{

  using ECRecovery for bytes32;
  using BytesOp for *;
  mapping(address => uint256) senderNonce;
  mapping(address => mapping(address => uint)) relayerNonce;
  uint constant SELECTOR_SIZE = 4;
  event Forwarded(address sender, address  dst, bytes inputData, bool success);

  function messageHash_13(address dst, bytes data, uint nonce) pure public returns(bytes32){
    return keccak256(dst, data, nonce);
  }

  function messageHash_24(address dst, bytes data, address relayer, uint timeout, uint nonce) pure public returns(bytes32){
    return keccak256(dst, data, relayer, timeout, nonce);
  }

  function forward_1(address dst, bytes data, uint nonce, bytes sig) public { 
    bytes32 dataHash = keccak256(dst,data,nonce);
    address sender = dataHash.recover2(sig);
    require(nonce > senderNonce[sender]);
    senderNonce[sender] = nonce;
    bool success = fwd(dst, data);
    emit Forwarded(sender, dst, data, success);
  }

  function forward_2(address dst, bytes data, uint timeout, uint nonce, bytes sig) public { 
    bytes32 dataHash = keccak256(dst, data, msg.sender, timeout, nonce);
    address sender = dataHash.recover2(sig);
    require(nonce > relayerNonce[sender][msg.sender]);
    require(timeout > block.timestamp);
    relayerNonce[sender][msg.sender] = nonce;
    bool success = fwd(dst, data);
    emit Forwarded(sender, dst, data, success);
  }

  function forward_3(address signer, address dst, bytes data, uint timeout, uint nonce, bytes sig) public { 
    bytes32 dataHash = keccak256(signer, dst, data, msg.sender, timeout, nonce);
    address _signer = dataHash.recover2(sig);
    require(_signer == signer);
    require(nonce > relayerNonce[signer][msg.sender]);
    require(timeout > block.timestamp);
    relayerNonce[signer][msg.sender] = nonce;
    bool success = fwd(dst, data);
    emit Forwarded(signer, dst, data, success);
  }

  function forward_4(address dst, bytes data, uint nonce, bytes sig) public { 
    bytes32 dataHash = keccak256(dst,data,nonce);
    address sender = dataHash.recover2(sig);
    require(nonce > senderNonce[sender]);
    senderNonce[sender] = nonce;
    uint ptr1 = BytesOp.dataPtr(data);
    bytes memory encodedAddress = abi.encode(sender);
    uint ptr2 = BytesOp.dataPtr(encodedAddress);
    bytes memory calldata = new bytes(data.length + encodedAddress.length );
    uint dest = BytesOp.dataPtr(calldata);
    BytesOp.copy(ptr1, dest, SELECTOR_SIZE);
    BytesOp.copy(ptr2, dest + SELECTOR_SIZE, encodedAddress.length);
    BytesOp.copy(ptr1 + SELECTOR_SIZE, dest + SELECTOR_SIZE + encodedAddress.length, data.length - SELECTOR_SIZE);
    bool success = fwd(dst,calldata);
    emit Forwarded(sender, dst, calldata, success);
  }

  function forward_5(address dst, bytes data, uint timeout, uint nonce, bytes sig) public { 
    bytes32 dataHash = keccak256(dst, data, msg.sender, timeout, nonce);
    address sender = dataHash.recover2(sig);
    require(nonce > relayerNonce[sender][msg.sender]);
    require(timeout > block.timestamp);
    relayerNonce[sender][msg.sender] = nonce;
    uint ptr1 = BytesOp.dataPtr(data);
    bytes memory encodedAddress = abi.encode(sender);
    uint ptr2 = BytesOp.dataPtr(encodedAddress);
    bytes memory calldata = new bytes(data.length + encodedAddress.length);
    uint dest = BytesOp.dataPtr(calldata);
    BytesOp.copy(ptr1, dest, SELECTOR_SIZE);
    BytesOp.copy(ptr2, dest + SELECTOR_SIZE, encodedAddress.length);
    BytesOp.copy(ptr1 + SELECTOR_SIZE, dest + SELECTOR_SIZE + encodedAddress.length, data.length - SELECTOR_SIZE);
    bool success = fwd(dst, calldata);
    emit Forwarded(sender, dst, calldata, success);
  }

  function forward_6(address signer, address dst, bytes data, uint timeout, uint nonce, bytes sig) public { 
    bytes32 dataHash = keccak256(signer, dst, data, msg.sender, timeout, nonce);
    address _signer = dataHash.recover2(sig);
    require(signer == _signer);
    require(nonce > relayerNonce[signer][msg.sender]);
    require(timeout > block.timestamp);
    relayerNonce[signer][msg.sender] = nonce;
    uint ptr1 = BytesOp.dataPtr(data);
    bytes memory encodedAddress = abi.encode(signer);
    uint ptr2 = BytesOp.dataPtr(encodedAddress);
    bytes memory calldata = new bytes(data.length + encodedAddress.length);
    uint dest = BytesOp.dataPtr(calldata);
    BytesOp.copy(ptr1, dest, SELECTOR_SIZE);
    BytesOp.copy(ptr2, dest + SELECTOR_SIZE, encodedAddress.length);
    BytesOp.copy(ptr1 + SELECTOR_SIZE, dest + SELECTOR_SIZE + encodedAddress.length, data.length - SELECTOR_SIZE);
    bool success = fwd(dst, calldata);
    emit Forwarded(signer, dst, calldata, success);
  }

  function fwd(address dst, bytes calldata) internal returns(bool success){
    assembly{
			success := call(sub(gas,5000),
				dst,
				0,
				add(calldata,0x20),
				mload(calldata),
				0,0)
    }
  }
}