/*!
 * test/gateway/gateway-test.js
 */

'use strict'

const assert = require('assert')
const gateway = require('../../gateway/gateway')
const keys = require('../../keys')


/**
 * Test vectors
 */
const VECTOR_1 = {
  h: 'fa6ffa1b50c7638c692de20b9a6a0e2f7d5ae760c05201fc3307b1f9f84e020d',
  s: 5,
  i: 'it_should_be_an_uuid_1',
  segments: {
    '0': {t: '0100000001c69b800a73bf8016aef958994a4a1227849122d3'},
    '1': {t: '09c03c9cb3ed1bc350ff8151000000006a473044022061bb12434713c4a04ebe1068301c01caf154362b9503913a17312e93bb2b568f02200a31e7a91a257065aa'},
    '2': {t: 'ebd49636de5a4b13524c1f49d75b44ad13d161db80eb3801210240d1bd817f2f862ceb39058119c1290effa325011d81718330a3318a26b12ecaffffffff02934a'},
    '3': {t: '5700000000001976a914caa5aced5e82cd7af3d72a905aecc9b501ad3f3988acaf2782000000000017a914b385c8d94e28fb8bf21a1cb2933582f7321fafb98700'},
    '4': {t: '000000'}
  }
}

const VECTOR_2 = {
  n: 't',
  h: '31fe18833073f818846ef56d663920f835b84ec5a9a28a18dd13b7da0f7339ae',
  s: 4,
  i: 'it_should_be_an_uuid_2',
  segments: {
    '0': {t: '0rr910099?BH{)mCfen5Qmo<?G*.8{pqa2YWg7Wz'},
    '1': {t: 'tdsyFxcu*E0000n7624Wwh)}]4]@+D.]z!8sa@W<+GzQt%nS92f<Gn}000007Pwapa.v!NI%<&{zRotVY}net9Y?P40f\/u+000007Pw9vOAa>sv23If5M([.'},
    '2': {t: '93h2h[v4ng0.j}j0W8+z}Mxm3hzK7p?]+pAhUQM6Zra^h<lT-?V+[8G@jSjPf\/:o[:UUK=P?Hn%6E4KQ=9mO:mYRQdX*34nNu$Y<0u?Kdk6l?@1FhE]^BHSJ'},
    '3': {t: '!FQy>-*Y=0I1tEqp85]MTn}O!0000'}
  }
}

const VECTOR_3 = {
  h: 'fa6ffa1b50c7638c692de20b9a6a0e2f7d5ae760c05201fc3307b1f9f84e020d',
  s: 5,
  i: 'it_should_be_an_uuid_3',
  segments: {
    // First segment is broken (bad first hexit)
    '0': {t: '1100000001c69b800a73bf8016aef958994a4a1227849122d3'},
    '1': {t: '09c03c9cb3ed1bc350ff8151000000006a473044022061bb12434713c4a04ebe1068301c01caf154362b9503913a17312e93bb2b568f02200a31e7a91a257065aa'},
    '2': {t: 'ebd49636de5a4b13524c1f49d75b44ad13d161db80eb3801210240d1bd817f2f862ceb39058119c1290effa325011d81718330a3318a26b12ecaffffffff02934a'},
    '3': {t: '5700000000001976a914caa5aced5e82cd7af3d72a905aecc9b501ad3f3988acaf2782000000000017a914b385c8d94e28fb8bf21a1cb2933582f7321fafb98700'},
    '4': {t: '000000'}
  }
}

const VECTOR_4 = {
  n: 't',
  h: '31fe18833073f818846ef56d663920f835b84ec5a9a28a18dd13b7da0f7339ae',
  s: 4,
  i: 'it_should_be_an_uuid_4',
  segments: {
    // First segment is broken (bad first hexit)
    '0': {t: '1rr910099?BH{)mCfen5Qmo<?G*.8{pqa2YWg7Wz'},
    '1': {t: 'tdsyFxcu*E0000n7624Wwh)}]4]@+D.]z!8sa@W<+GzQt%nS92f<Gn}000007Pwapa.v!NI%<&{zRotVY}net9Y?P40f\/u+000007Pw9vOAa>sv23If5M([.'},
    '2': {t: '93h2h[v4ng0.j}j0W8+z}Mxm3hzK7p?]+pAhUQM6Zra^h<lT-?V+[8G@jSjPf\/:o[:UUK=P?Hn%6E4KQ=9mO:mYRQdX*34nNu$Y<0u?Kdk6l?@1FhE]^BHSJ'},
    '3': {t: '!FQy>-*Y=0I1tEqp85]MTn}O!0000'}
  }
}



describe('Gateway', function() {
  
  describe('init()', function() {
    it('should successfully initialize the gateway', function() {
      const success = gateway.init(keys['bitcoin'])
      assert(success)
    })
  })

  describe('buildTx()', function() {
    it('should successfully reconstruct a valid tx from hex encoded segments', function() {
      const rawtx = gateway.buildTx(VECTOR_1)
      assert(rawtx)
    })

    it('should successfully reconstruct a valid tx from z85 encoded segments', function() {
      const rawtx = gateway.buildTx(VECTOR_2)
      assert(rawtx)
    })

    it('should successfully detect an invalid tx from hex encoded segments', function() {
      const rawtx = gateway.buildTx(VECTOR_3)
      assert(!rawtx)
    })

    it('should successfully detect an invalid tx from z85 encoded segments', function() {
      const rawtx = gateway.buildTx(VECTOR_4)
      assert(!rawtx)
    })
  })

})
