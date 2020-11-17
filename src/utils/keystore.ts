import { leftPadString } from '../utils/data';
import BitCore from 'bitcore-lib';
import Mnemonic from 'bitcore-mnemonic';
import Nacl from 'tweetnacl';
import NaclUtil from 'tweetnacl-util';
import ScryptAsync from 'scrypt-async';
import * as filecoin_signer from '@zondax/filecoin-signing-tools';

export class Keystore {
    public salt!: string;
    public hdPathString!: string;
    public encSeed!: { encStr: any; nonce: any; } | undefined;
    public version = 1;
    public hdIndex = 0;
    public encPrivKeys!: any;
    public addresses!: string[];
    private defaultAddressIndex: number = 0;

    public serialize() {
        return JSON.stringify({
            encSeed: this.encSeed,
            addresses: this.addresses,
            encPrivKeys: this.encPrivKeys,
            hdPathString: this.hdPathString,
            salt: this.salt,
            hdIndex: this.hdIndex,
            version: this.version,
        });
    };

    public deserialize(keystore: string) {
        const dataKS = JSON.parse(keystore);
        const { version, salt, encSeed, encPrivKeys, hdIndex, hdPathString, addresses } = dataKS;

        this.salt = salt;
        this.hdPathString = hdPathString;
        this.encSeed = encSeed;
        this.version = version;
        this.hdIndex = hdIndex;
        this.encPrivKeys = encPrivKeys;
        this.addresses = addresses;
    };

    public init(mnemonic: string, pwDerivedKey: Uint8Array, hdPathString: string, salt: string) {
        this.salt = salt;
        const pathParts = hdPathString.split('/');
        if (pathParts.length === 6) {
            const hdPathIndex = pathParts.splice(pathParts.length - 1, 1);
            this.hdIndex = parseInt(hdPathIndex[0].replace("'", ""));
        }
        this.hdPathString = pathParts.join('/');
        this.encSeed = undefined;
        this.encPrivKeys = {};
        this.addresses = [];

        if ((typeof pwDerivedKey !== 'undefined') && (typeof mnemonic !== 'undefined')) {
            const words = mnemonic.split(' ');

            if (!this.isSeedValid(mnemonic) || words.length !== 12) {
                throw new Error('KeyStore: Invalid mnemonic');
            }

            // Pad the seed to length 120 before encrypting
            const paddedSeed = leftPadString(mnemonic, ' ', 120);
            this.encSeed = this._encryptString(paddedSeed, pwDerivedKey);

            this.generateNewAddress(pwDerivedKey, 1);
        }
    }

    public async createVault(opts: any) {
        const { hdPathString, seedPhrase, password } = opts;
        let salt = opts.salt;

        // Default hdPathString
        if (!hdPathString) {
            const err = new Error("Keystore: Must include hdPathString in createVault inputs. Suggested value m/44'/461'/0/0/1");
            return err;
        }

        if (!seedPhrase) {
            const err = new Error('Keystore: Must include seedPhrase in createVault inputs.');
            return err;
        }

        if (!salt) {
            salt = this.generateSalt(32);
        }

        const pwDerivedKey: Uint8Array = await this.deriveKeyFromPasswordAndSalt(password, salt);

        this.init(seedPhrase, pwDerivedKey, hdPathString, salt);

        return null;
    };

    private generateSalt(byteCount: number) {
        return BitCore.crypto.Random.getRandomBuffer(byteCount || 32).toString('base64');
    };

    private isSeedValid(seed: string) {
        return Mnemonic.isValid(seed, Mnemonic.Words.ENGLISH);
    };

    private _encryptString(string: string, pwDerivedKey: Uint8Array) {
        const nonce = Nacl.randomBytes(Nacl.secretbox.nonceLength);
        const encStr = Nacl.secretbox(NaclUtil.decodeUTF8(string), nonce, pwDerivedKey);

        return {
            encStr: NaclUtil.encodeBase64(encStr),
            nonce: NaclUtil.encodeBase64(nonce),
        };
    };

    private _decryptString(encryptedStr: any, pwDerivedKey: Uint8Array) {
        const decStr = NaclUtil.decodeBase64(encryptedStr.encStr);
        const nonce = NaclUtil.decodeBase64(encryptedStr.nonce);

        const decryptedStr = Nacl.secretbox.open(decStr, nonce, pwDerivedKey);

        if (decryptedStr === null) {
            return false;
        }

        return NaclUtil.encodeUTF8(decryptedStr);
    };

    private encodeHex(msgUInt8Arr: any) {
        const msgBase64 = NaclUtil.encodeBase64(msgUInt8Arr);

        return (Buffer.from(msgBase64, 'base64')).toString('hex');
    }

    private decodeHex(msgHex: any) {
        const msgBase64 = (Buffer.from(msgHex, 'hex')).toString('base64');

        return NaclUtil.decodeBase64(msgBase64);
    }

    private _encryptKey(privateKey: string, pwDerivedKey: Uint8Array) {
        const nonce = Nacl.randomBytes(Nacl.secretbox.nonceLength);
        const privateKeyArray = this.decodeHex(privateKey);
        const encKey = Nacl.secretbox(privateKeyArray, nonce, pwDerivedKey);

        return {
            key: NaclUtil.encodeBase64(encKey),
            nonce: NaclUtil.encodeBase64(nonce),
        };
    };

    private _decryptKey(encryptedKey: any, pwDerivedKey: Uint8Array) {
        const decKey = NaclUtil.decodeBase64(encryptedKey.key);
        const nonce = NaclUtil.decodeBase64(encryptedKey.nonce);
        const decryptedKey = Nacl.secretbox.open(decKey, nonce, pwDerivedKey);

        if (decryptedKey === null) {
            throw new Error('Decryption failed!');
        }

        return this.encodeHex(decryptedKey);
    };

    private async deriveKeyFromPasswordAndSalt(password: string, salt: string): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const logN = 14;
            const r = 8;
            const dkLen = 16;

            const cb = function (derKey: any) {
                let err = null;
                let ui8arr = undefined;
                try {
                    ui8arr = Uint8Array.from(derKey);
                } catch (e) {
                    reject(e);
                }

                resolve(ui8arr);
            };

            ScryptAsync(password, salt, {
                logN,
                r,
                p: 1,
                dkLen,
                encoding: 'hex'
            }, cb);
        });

    };

    private generateNewAddress(pwDerivedKey: Uint8Array, n: number) {
        //Assert.derivedKey(this, pwDerivedKey);

        if (!this.encSeed) {
            throw new Error('KeyStore.generateNewAddress: No seed set');
        }

        n = n || 1;

        const keys = this._generatePrivKeys(pwDerivedKey, n);

        for (let i = 0; i < n; i++) {
            const keyObj = keys[i];
            const address: string = keyObj.privKey.address;

            this.encPrivKeys[address] = keyObj.encPrivKey;
            this.addresses.push(address);
        }

        this.hdIndex += n;
    };

    async newAddress(n: number, password: string) {
        const pwDerivedKey: Uint8Array = await this.deriveKeyFromPasswordAndSalt(password, this.salt);
        this.generateNewAddress(pwDerivedKey, n);
    };

    async deleteAddress(address: string, password: string) {
        const addressIndex = this.addresses.indexOf(address);
        if (addressIndex >= 0) {
            const pwDerivedKey: Uint8Array = await this.deriveKeyFromPasswordAndSalt(password, this.salt);
            const encPrivateKey = this.encPrivKeys[address];

            if (this._decryptKey(encPrivateKey, pwDerivedKey)) {
                this.addresses[addressIndex] = '';
                this.encPrivKeys[address] = '';
                if (this.defaultAddressIndex === addressIndex) {
                    const addresses = await this.getAddresses();
                    if (addresses.length > 0) {
                        await this.setDefaultAddress(addresses[0]);
                    }
                }
            };
        }
    }

    private _generatePrivKeys(pwDerivedKey: Uint8Array, n: number) {
        //Assert.derivedKey(this, pwDerivedKey);

        const seed = this._decryptString(this.encSeed, pwDerivedKey);
        if (!seed || seed.length === 0) {
            throw new Error('Provided password derived key is wrong');
        }

        const keys = [];

        for (let i = 0; i < n; i++) {
            const key = filecoin_signer.keyDerive(seed, `${this.hdPathString}/${i + this.hdIndex}`, '');

            const encPrivateKey = this._encryptKey(key.private_hexstring, pwDerivedKey);

            keys[i] = {
                privKey: key,
                encPrivKey: encPrivateKey
            };
        }

        return keys;
    };

    async getPrivateKey(address: string, password: string) {
        const pwDerivedKey: Uint8Array = await this.deriveKeyFromPasswordAndSalt(password, this.salt);

        if (this.encPrivKeys[address] === undefined) {
            throw new Error('KeyStore.exportPrivateKey: Address not found in KeyStore');
        }

        const encPrivateKey = this.encPrivKeys[address];

        return this._decryptKey(encPrivateKey, pwDerivedKey);
    };

    async getDefaultAddress(): Promise<string> {
        return this.addresses[this.defaultAddressIndex];
    }

    async setDefaultAddress(address: string): Promise<void> {
        const addressIndex = this.addresses.indexOf(address);
        if (addressIndex >= 0) {
            this.defaultAddressIndex = addressIndex;
        }
    }

    public async getAddresses(): Promise<string[]> {
        return this.addresses.filter((a, i) => { return a != '' });
    }

    async hasAddress(address: string): Promise<boolean> {
        return this.addresses.indexOf(address) >= 0;
    }

    generateRandomSeed(extraEntropy?: any) {
        let seed = '';

        if (extraEntropy === undefined) {
            seed = new Mnemonic(Mnemonic.Words.ENGLISH);
        } else if (typeof extraEntropy === 'string') {
            const entBuf = Buffer.from(extraEntropy);
            const randBuf = BitCore.crypto.Random.getRandomBuffer(256 / 8);
            const hashedEnt = this._concatAndSha256(randBuf, entBuf).slice(0, 128 / 8);

            seed = new Mnemonic(hashedEnt, Mnemonic.Words.ENGLISH);
        } else {
            throw new Error('generateRandomSeed: extraEntropy is set but not a string.');
        }

        return seed.toString();
    };

    _concatAndSha256 = function (entropyBuf0: any, entropyBuf1: any) {
        const totalEnt = Buffer.concat([entropyBuf0, entropyBuf1]);

        if (totalEnt.length !== entropyBuf0.length + entropyBuf1.length) {
            throw new Error('generateRandomSeed: Logic error! Concatenation of entropy sources failed.');
        }

        return BitCore.crypto.Hash.sha256(totalEnt);
    };
}