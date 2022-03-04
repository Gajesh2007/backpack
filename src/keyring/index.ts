import { validateMnemonic, generateMnemonic, mnemonicToSeedSync } from "bip39";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as nacl from "tweetnacl";
import * as bs58 from "bs58";
import { deriveKeypairs, deriveKeypair, DerivationPath } from "./crypto";

export class Keyring {
  constructor(readonly keypairs: Array<Keypair>) {}

  public publicKeys(): Array<PublicKey> {
    return this.keypairs.map((kp) => kp.publicKey);
  }

  // `address` is the key on the keyring to use for signing.
  public signTransaction(tx: Buffer, address: PublicKey): string {
    const kp = this.keypairs.find((kp) => kp.publicKey.equals(address));
    if (!kp) {
      throw new Error(`unable to find ${address.toString()}`);
    }
    return bs58.encode(nacl.sign.detached(tx, kp.secretKey));
  }

  public exportPrivateKey(address: PublicKey): string {
    const kp = this.keypairs.find((kp) => kp.publicKey.equals(address));
    if (!kp) {
      throw new Error(`unable to find ${address.toString()}`);
    }
    return bs58.encode(kp.secretKey);
  }

  public toString(): string {
    return JSON.stringify({
      keypairs: this.keypairs.map((kp) =>
        Buffer.from(kp.secretKey).toString("hex")
      ),
    });
  }

  public static fromString(str: string): Keyring {
    const payload = JSON.parse(str);
    const keypairs = payload.keypairs.map((secret: string) =>
      Keypair.fromSecretKey(Buffer.from(secret, "hex"))
    );
    return new Keyring(keypairs);
  }
}

export class HdKeyring extends Keyring {
  private mnemonic: string;
  private seed: Buffer;
  private numberOfAccounts: number;
  private derivationPath: DerivationPath;

  constructor({
    mnemonic,
    seed,
    numberOfAccounts,
    keypairs,
    derivationPath,
  }: {
    mnemonic: string;
    seed: Buffer;
    numberOfAccounts: number;
    keypairs: Array<Keypair>;
    derivationPath: DerivationPath;
  }) {
    super(keypairs);
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.numberOfAccounts = numberOfAccounts;
    this.derivationPath = derivationPath;
  }

  public static fromMnemonic(
    mnemonic: string,
    derivationPath?: DerivationPath
  ): HdKeyring {
    if (!derivationPath) {
      derivationPath = DerivationPath.Bip44Change;
    }
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid seed words");
    }
    const seed = mnemonicToSeedSync(mnemonic);
    const numberOfAccounts = 1;
    const keypairs = deriveKeypairs(seed, derivationPath, numberOfAccounts);
    return new HdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      keypairs,
      derivationPath,
    });
  }

  public static generate() {
    const mnemonic = generateMnemonic();
    const seed = mnemonicToSeedSync(mnemonic);
    const numberOfAccounts = 1;
    const derivationPath = DerivationPath.Bip44;
    const keypairs = deriveKeypairs(seed, derivationPath, numberOfAccounts);

    return new HdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      derivationPath,
      keypairs,
    });
  }

  public deriveNext() {
    this.keypairs.push(
      deriveKeypair(
        this.seed.toString("hex"),
        this.numberOfAccounts,
        this.derivationPath
      )
    );
    this.numberOfAccounts += 1;
  }

  public toString(): string {
    return JSON.stringify({
      mnemonic: this.mnemonic,
      seed: this.seed.toString("hex"),
      numberOfAccounts: this.numberOfAccounts,
      derivationPath: this.derivationPath,
    });
  }

  public static fromString(str: string): HdKeyring {
    const {
      mnemonic,
      seed: seedStr,
      numberOfAccounts,
      derivationPath,
    } = JSON.parse(str);
    const seed = Buffer.from(seedStr, "hex");
    const keypairs = deriveKeypairs(seed, derivationPath, numberOfAccounts);

    const kr = new HdKeyring({
      mnemonic,
      seed,
      numberOfAccounts,
      derivationPath,
      keypairs,
    });

    return kr;
  }
}

export class LedgerKeyring {
  private derivationPath: DerivationPath;
  private iframe: any;
  private iframeUrl: string;

  constructor({ derivationPath }: { derivationPath: DerivationPath }) {
    this.derivationPath = derivationPath;

    // Iframe.
    this.iframeUrl = "https://200ms-labs.github.io/anchor-wallet";
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.iframeUrl;
    this.iframe.allow = `hid 'src'`;
    document.head.appendChild(this.iframe);
  }

  public signTransaction(tx: Buffer, address: PublicKey): string {
    // todo
    return "";
  }

  public toString(): string {
    return JSON.stringify({
      derivationPath: this.derivationPath,
    });
  }

  public static fromString(str: string): LedgerKeyring {
    const { derivationPath } = JSON.parse(str);

    return new LedgerKeyring({
      derivationPath,
    });
  }
}