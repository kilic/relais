const Storage = artifacts.require('Storage')
const Forwarder = artifacts.require('Forwarder')
const pad = require('./helpers/padding')
const assertRevert = require('./helpers/assertRevert')
const dates = require('./helpers/dateHelper')

contract('Forwarder', ([acc0, signer, relay_1, relay_2]) => {

  let forwarder
  let storage
  let selector
  let nonce
  let value 

  before( async function (){
    selector = web3.sha3("setX(address,uint256)").substring(0,10)
  })


  describe('Forwarding with no relayer dependency', function(){

    beforeEach( async function (){
      forwarder = await Forwarder.new( {from: acc0} )
      storage = await Storage.new({ from: acc0 })     
      nonce = 1
      value = 2006
    })

    it('forwards without appending address as first argument', async function () {

      let data = selector + pad.address(signer,false) + pad.uint256(value,false)
      let hsh = await forwarder.messageHash_14(storage.address, data, nonce)
      let sig = web3.eth.sign(signer, hsh)
      const { logs } = await forwarder.forward_1(storage.address, data, nonce, sig, { from:relay_1 })
      let _value = await storage.getX()
      let _lastSender = await storage.lastSender()
      assert.equal(_value.valueOf(), value)
      assert.equal(_lastSender, signer)
      assert.equal(logs[logs.length-1].args.sender, signer)
    })
  
    it('forwards appending address as first argument', async function () {

      let data = selector + pad.uint256(value,false)
      let hsh = await forwarder.messageHash_14(storage.address, data,nonce)
      let sig = web3.eth.sign(signer, hsh)
      const { logs } = await forwarder.forward_4(storage.address, data, nonce, sig,{ from:relay_1 })
      let _value = await storage.getX()
      let _lastSender = await storage.lastSender()
      assert.equal(_value.valueOf(), value)
      assert.equal(_lastSender, signer)
      assert.equal(logs[logs.length-1].args.sender, signer)
    })

    it('cannot forward with expired nonce (1)', async function () {

      let data = selector + pad.address(signer,false) + pad.uint256(value,false)
      let hsh = await forwarder.messageHash_14(storage.address, data, nonce)
      let sig = web3.eth.sign(signer, hsh)
      await forwarder.forward_1(storage.address, data, nonce, sig, { from:relay_1 })
      await assertRevert(forwarder.forward_1(storage.address, data, nonce, sig, { from:relay_1 }))
    })

    it('cannot forward with expired nonce (3)', async function () {

      let data = selector + pad.uint256(value, false)
      let hsh = await forwarder.messageHash_14(storage.address, data,nonce)
      let sig = web3.eth.sign(signer, hsh)
      await forwarder.forward_4(storage.address, data, nonce, sig,{ from:relay_1 })
      await assertRevert(forwarder.forward_4(storage.address, data, nonce, sig, { from:relay_1 }))
    })

  })

  describe('Relayer dependent forwarding', function(){

    beforeEach( async function (){
      forwarder = await Forwarder.new( {from: acc0} )
      storage = await Storage.new({ from: acc0 })
    })

    describe('Without appending address', function(){

      let data
      let timeout

      beforeEach( function(){
        nonce = 1
        value = 2006
        data = selector + pad.address(signer,false) + pad.uint256(value,false)
        timeout = dates.daysAhead(20)
      })

      it('forwards without appending address as first argument', async function () {

        let hsh = await forwarder.messageHash_25(storage.address, data, relay_1 ,timeout, nonce)
        let sig = web3.eth.sign(signer,hsh)
        const {logs}  = await forwarder.forward_2(storage.address, data, timeout, nonce, sig, { from:relay_1 })
        let _value = await storage.getX()
        let _lastSender = await storage.lastSender()
        assert.equal(_value.valueOf(),value)
        assert.equal(_lastSender,signer)
        assert.equal(logs[logs.length-1].args.sender, signer)
      })

      it('cannot forward expired order', async function () {

        timeout = dates.yesterday(0)
        let hsh = await forwarder.messageHash_25(storage.address, data, relay_1 ,timeout, nonce)
        let sig = web3.eth.sign(signer,hsh)
        await assertRevert(forwarder.forward_2(storage.address, data, timeout, nonce, sig, { from:relay_1 }))
      })

      it('undesired relayer cannot forward', async function () {
        
        let hsh = await forwarder.messageHash_25(storage.address, data, relay_1 ,timeout, nonce)
        let sig = web3.eth.sign(signer, hsh)
        const { logs } = await forwarder.forward_2(storage.address, data, timeout, nonce, sig, { from:relay_2 })
        assert.notEqual(logs[logs.length-1].args.sender, signer)
      })

      it('cannot forward with expired nonce ', async function () {

        let hsh = await forwarder.messageHash_25(storage.address, data, relay_1 ,timeout, nonce)
        let sig = web3.eth.sign(signer,hsh)
        await forwarder.forward_2(storage.address, data, timeout, nonce, sig, { from:relay_1 })
        await assertRevert(forwarder.forward_2(storage.address, data, timeout, nonce, sig, { from:relay_1 }))
      })
    })

    describe('Appending address as first argument', function(){

      let data
      let timeout

      beforeEach( function(){
        nonce = 1
        value = 2006
        data = selector + pad.uint256(value,false)
        timeout = dates.daysAhead(20)
      })

      it('forwards appending address as first argument', async function () {
        
        let hsh = await forwarder.messageHash_25(storage.address, data, relay_1 ,timeout, nonce)
        let sig = web3.eth.sign(signer,hsh)
        const {logs}  = await forwarder.forward_5(storage.address, data, timeout, nonce, sig, { from:relay_1 })
        let _value = await storage.getX()
        let _lastSender = await storage.lastSender()
        assert.equal(_value.valueOf(),value)
        assert.equal(_lastSender,signer)
        assert.equal(logs[logs.length-1].args.sender, signer)
      })

      it('cannot forward expired order', async function () {

        timeout = dates.yesterday(0)
        let hsh = await forwarder.messageHash_25(storage.address, data, relay_1 ,timeout, nonce)
        let sig = web3.eth.sign(signer,hsh)
        await assertRevert(forwarder.forward_5(storage.address, data, timeout, nonce, sig, { from:relay_1 }))
      })

      it('undesired relayer cannot forward', async function () {

        let hsh = await forwarder.messageHash_25(storage.address, data, relay_1 ,timeout, nonce)
        let sig = web3.eth.sign(signer, hsh)
        const { logs } = await forwarder.forward_5(storage.address, data, timeout, nonce, sig, { from:relay_2 })
        assert.notEqual(logs[logs.length-1].args.sender, signer)
      })

      it('cannot forward with expired nonce ', async function () {
        
        let hsh = await forwarder.messageHash_25(storage.address, data, relay_1 ,timeout, nonce)
        let sig = web3.eth.sign(signer,hsh)
        await forwarder.forward_5(storage.address, data, timeout, nonce, sig, { from:relay_1 })
        await assertRevert(forwarder.forward_5(storage.address, data, timeout, nonce, sig, { from:relay_1 }))
      })
    })
  })
})