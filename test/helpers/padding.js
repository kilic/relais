function uint256(i,prefix) {
  
  var d = web3.toHex(i).substring(2)
  if(prefix){
    return "0x" + web3.padLeft(d,64)
  }
  return web3.padLeft(d,64)

  
}

function address(addr,prefix) {
  
  var d = addr.substring(2)
  if(prefix){
    return "0x" + web3.padLeft(d,64)
  }
  return web3.padLeft(d,64)
}

module.exports = {uint256,address};
