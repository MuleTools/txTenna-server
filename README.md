# TxTenna Gateway

A Gateway bridging the TxTenna mesh network with the Bitcoin network and allowing to push transactions on the Bitcoin network.

Runs on testnet and mainnet.

[View API documentation](../master/doc/POST_segments.md)

## Theory of Operation

The Gateway provides a REST API allowing a TxTenna node to push a segment related to a new transaction.
THe gateway temporarily stores the segments. When all segments related to a transaction have been received, the Gateway builds the raw transaction and pushes it on the Bitcoin network.

## Architecture

The Gateway is provided with a default storage system using a transient memory cache. Additional types of storage may be implemented in the future (temporary storage in a database, etc). Note that a single storage can be used at once.

For pushing transactions on the Bitcoin network, the Gateway currently supports pushes through the RPC API of a bitcoin node or through the PushTx service provided by an instance of the Samourai backend. Additional PushTx services may be implemented in the future. Multiple PushTx services can be activated. The Gateway randomly selects a service for each push.

## Known limitations

The current version of the Gateway is provided as a Proof of Concept. It doesn't provide any mechanism protecting the Gatweway from Denial of Service attacks by byzantines TxTenna nodes. While the protocol allows to check the integrity of the segments thanks to the transaction TXID, it's still possible for byzantines TXTenna nodes to flood the Gateway with tempered segments preventing the reconstruction of the correct transaction.

## Requirements

* Node JS (>= v8)
* A Bitcoin node (optional)
* Url and credentials to access the REST API of a Samourai backend (optional)

## Installation

* Install forever as a global package (optional)

```
> npm install -g forever
```

* Get the source code from the server with Git

* Install the required packages

```
> npm install
```

* Configure the Gateway by copying /keys/index-example.js into /keys/index.js and editing the content of index.js with correct values for your setup.

* Start the Gateway

```
With npm (from root directory of the project)
> npm start

With Forever (from root directory of the project)
> forever start -a -l forever.log -o output.log -e error.log index.js
```
