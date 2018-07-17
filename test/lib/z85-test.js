/*!
 * test/lib/z85-test.js
 */

'use strict'

const assert = require('assert')
const Z85 = require('../../lib/z85')


/**
 * Test vectors
 */
const VECTOR_1 = [{
  z85Tx: '0rr910099?BH{)mCfen5Qmo<?G*.8{pqa2YWg7WztdsyFxcu*E0000n7624Wwh)}]4]@+D.]z!8sa@W<+GzQt%nS92f<Gn}000007Pwapa.v!NI%<&{zRotVY}net9Y?P40f\/u+000007Pw9vOAa>sv23If5M([.93h2h[v4ng0.j}j0W8+z}Mxm3hzK7p?]+pAhUQM6Zra^h<lT-?V+[8G@jSjPf\/:o[:UUK=P?Hn%6E4KQ=9mO:mYRQdX*34nNu$Y<0u?Kdk6l?@1FhE]^BHSJ!FQy>-*Y=0I1tEqp85]MTn}O!0000',
  rawTx: '010000000001014574baee4d76c9d4efa29bda2e8544929d4ebdb47bb50cd7de5ab7fbc56720f401000000171600146564385fa70f5602bfc3c7017b57853a32cbcb30ffffffff02315c81410000000017a914992165adfc8bef5ace6ed97a76bd9f516e1e3ace87009435770000000017a9144a9ce476ce6087329f1158c2671c1ea784f0b6e0870247304402207932faaeee6a3631ded2dfcaec3736f75f23bec9d1b6e3ecc55bb3c3258dfcbe0220313972c5c9342c18a14c88861422718ccdb109b746ab8fe0ba22dfaf9997c057012102e83e74fff3049ea605d1d64242d5193a21c69b4fa388f36d304e1493e4ac00ec00000000'
}, {
  z85Tx: '0rr910MHQV3uJ$j7oWEnNmZ6:cXNQa^*r/LOu}P4.+*w:q2*N@0bt1Tl&[GtYaNF36u3LsZ7s%i90ajLr5Mm(1cCRXf!OW4d]}Yjapo<^StW74wVC7CMnWP6oa$h%a4+6*m6dcIvCus#h#$f7k*^n@E>MKc(P2c18nN:i%dZ>v9F5i.fRZvWcB2hC%nSc00*ukT0000002Y%V6W0nN)oUy?DH]-rKxR1)We)x]iF:=ucXqr#0000nSt8W):K%rp}?$1-9i$+=G7?2xUEPz*0000',
  rawTx: '0100000001c69b800a73bf8016aef958994a4a1227849122d309c03c9cb3ed1bc350ff8151000000006a473044022061bb12434713c4a04ebe1068301c01caf154362b9503913a17312e93bb2b568f02200a31e7a91a257065aaebd49636de5a4b13524c1f49d75b44ad13d161db80eb3801210240d1bd817f2f862ceb39058119c1290effa325011d81718330a3318a26b12ecaffffffff02934a5700000000001976a914caa5aced5e82cd7af3d72a905aecc9b501ad3f3988acaf2782000000000017a914b385c8d94e28fb8bf21a1cb2933582f7321fafb98700000000'
}]


describe('Z85', function() {
  
  describe('encode()', function() {
    it('should successfully encode a raw transaction', function() {
      for (let i = 0; i < VECTOR_1.length; i++) {
        const rawTx = VECTOR_1[i].rawTx
        const expectedZ85Tx = VECTOR_1[i].z85Tx

        const buffRawTx = Buffer.from(rawTx, 'hex')
        const z85Tx = Z85.encode(buffRawTx)
        assert(z85Tx == expectedZ85Tx)
      }      
    })
  })

  describe('decode()', function() {
    it('should successfully decode a transaction encoded in z85', function() {
      for (let i = 0; i < VECTOR_1.length; i++) {
        const z85Tx = VECTOR_1[i].z85Tx
        const expectedRawTx = VECTOR_1[i].rawTx

        const rawTx = Z85.decode(z85Tx).toString('hex')
        assert(rawTx == expectedRawTx)
      }      
    })
  })

})