const { ethers } = require('ethers');
const { encode, decode } = require('@ipld/dag-cbor');

const iface = new ethers.utils.Interface([
  // Constructor
  'constructor(string name, string symbol)',
]);

// console.log(iface.encodeDeploy(['LIT', 'littlecoin']));
const wallet = new ethers.Wallet(
  '0x2e449673a4b0b7e561c4c105c64d725556335cce15d2b345cce13057ef9aa8aa',
);
wallet.getAddress().then((a) => console.log(a));

//echo "7b2254797065223a22736563703235366b31222c22507269766174654b6579223a224c6b535763365377742b5668784d4546786b31795656597a584d345630724e467a4f4577562b2b61714b6f3d227d" > p.key
//lotus wallet import p.key

//0x6F19f31e0e1Ac15a64272723131e66588a3e692b
