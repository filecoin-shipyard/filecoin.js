import { leftPadString } from '../utils/data';
import BitCore from 'bitcore-lib';
import Mnemonic from 'bitcore-mnemonic';
import Nacl from 'tweetnacl';
import NaclUtil from 'tweetnacl-util';
import ScryptAsync from 'scrypt-async';

export class Keystore {
    public salt!: string;
    public hdPathString!: string;
    public encSeed!: { encStr: any; nonce: any; } | undefined;
    public encHdRootPriv!: { encStr: any; nonce: any; } | undefined;
    public version = 1;
    public hdIndex = 0;
    public encPrivKeys!: {};
    public addresses!: [];

    public serialize() {
        return JSON.stringify({
            encSeed: this.encSeed,
            encHdRootPriv: this.encHdRootPriv,
            addresses: this.addresses,
            encPrivKeys: this.encPrivKeys,
            hdPathString: this.hdPathString,
            salt: this.salt,
            hdIndex: this.hdIndex,
            version: this.version,
        });
    };

    public init(mnemonic: string, pwDerivedKey: Uint8Array, hdPathString: string, salt: string) {
        this.salt = salt;
        this.hdPathString = hdPathString;
        this.encSeed = undefined;
        this.encHdRootPriv = undefined;
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

            // hdRoot is the relative root from which we derive the keys using generateNewAddress().
            // The derived keys are then `hdRoot/hdIndex`.

            const hdRoot = new Mnemonic(mnemonic).toHDPrivateKey().xprivkey;
            const hdRootKey = new BitCore.HDPrivateKey(hdRoot);
            // @ts-ignore
            const hdPathKey = hdRootKey.derive(hdPathString).xprivkey;

            this.encHdRootPriv = this._encryptString(hdPathKey, pwDerivedKey);
        }
    }

    public async createVault(opts: any) {
        const { hdPathString, seedPhrase, password } = opts;
        let salt = opts.salt;

        // Default hdPathString
        if (!hdPathString) {
            const err = new Error('Keystore: Must include hdPathString in createVault inputs. Suggested alternatives are m/0\'/0\'/0\' for previous lightwallet default, or m/44\'/60\'/0\'/0 for BIP44 (used by Jaxx & MetaMask)');
            return err;
        }

        if (!seedPhrase) {
            const err = new Error('Keystore: Must include seedPhrase in createVault inputs.');
            return err;
        }

        if (!salt) {
            salt = this.generateSalt(32);
        }

        this.deriveKeyFromPasswordAndSalt(password, salt, (err: any, pwDerivedKey: any) => {
            this.init(seedPhrase, pwDerivedKey, hdPathString, salt);
        });

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
        console.log(pwDerivedKey);
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

    private async deriveKeyFromPasswordAndSalt(password: string, salt: string, callback: any) {
        const logN = 14;
        const r = 8;
        const dkLen = 16;

        const cb = function (derKey: any) {
            let err = null;
            let ui8arr = null;
            console.log(derKey.length)
            try {
                ui8arr = Uint8Array.from(derKey);
            } catch (e) {
                err = e;
            }

            callback(err, ui8arr);
        };

        ScryptAsync(password, salt, {
            logN,
            r,
            p: 1,
            dkLen,
            encoding: 'hex'
        }, cb);
    };
}