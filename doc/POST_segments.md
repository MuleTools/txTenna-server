# Notify a new segment

Allows a TxTenna node to push a new segment to the Gateway.
When all segments related to a transaction have been received, the Gateway pushes the transaction.


```
POST /segments
```

## Parameters
* **s** - `integer` - Number of segments for the transaction. Only used in the first segment for a given transaction.
* **h** - `string` - Hash of the transaction. Only used in the first segment for a given transaction. May be Z85-encoded.
* **n** - `char` (optional) - Network to use. 't' for TestNet3, otherwise assume MainNet. Only used in the first segment for a given transaction.
* **i** - `string` - TxTenna unid identifying the transaction (8 bytes).
* **c** - `integer` - Sequence number for this segment. May be omitted in first segment for a given transaction (assumed to be 0).
* **t** - `string` - Hex transaction data for this segment. May be Z85-encoded.

### Example

```
POST /segments

Request Body
{
  "s": "5",
  "i": "0123456789abcdef",
  "h": "fa6ffa1b50c7638c692de20b9a6a0e2f7d5ae760c05201fc3307b1f9f84e020d&",
  "t": "0100000001c69b800a73bf8016aef958994a4a1227849122d3"
}

POST /segments

Request Body
{
  "c": "1",
  "i": "0123456789abcdef",
  "t": "09c03c9cb3ed1bc350ff8151000000006a473044022061bb12434713c4a04ebe1068301c01caf154362b9503913a17312e93bb2b568f02200a31e7a91a257065aa"
}
```

#### Success
Status code 200 with JSON response:
```json
{
  "status": "ok"
}
```

#### Failure
Status code 400 with JSON response:
```json
{
  "status": "error",
  "error": "<error message>"
}
```
