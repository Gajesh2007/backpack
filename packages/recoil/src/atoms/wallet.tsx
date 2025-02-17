import { atom, selector, selectorFamily } from "recoil";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEY_DATA,
} from "@coral-xyz/common";
import { WalletPublicKeys } from "../types";
import { backgroundClient } from "./client";

/**
 * All public key data associated with the currently active username.
 * All the other pieces of wallet data are derived via selectors from this atom.
 */
export const walletPublicKeyData = atom<{
  activePublicKeys: Array<string>;
  publicKeys: WalletPublicKeys;
}>({
  key: "walletPublicKeyData",
  default: selector({
    key: "walletPublicKeyDataDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEY_DATA,
        params: [],
      });
    },
  }),
});

/**
 * Pubkey of the currently selected wallet for each blockchain.
 */
export const activeWallets = selector<Array<string>>({
  key: "activeWalletsDefault",
  get: ({ get }) => {
    const data = get(walletPublicKeyData);
    return data.activePublicKeys;
  },
});

/**
 * List of all public keys for the wallet along with associated nicknames.
 */
export const walletPublicKeys = selector<WalletPublicKeys>({
  key: "walletPublicKeys",
  get: ({ get }) => {
    const data = get(walletPublicKeyData);
    return data.publicKeys;
  },
});

/**
 * Augment a public key with the name and blockchain and return as an object.
 */
export const walletWithData = selectorFamily({
  key: "walletWithData",
  get:
    (publicKey: string) =>
    ({ get }) => {
      const publicKeys = get(walletPublicKeys);
      for (const [blockchain, keyring] of Object.entries(publicKeys)) {
        for (const namedPublicKeys of Object.values(keyring)) {
          for (const namedPublicKey of namedPublicKeys) {
            if (namedPublicKey.publicKey === publicKey)
              return {
                ...namedPublicKey,
                blockchain: blockchain as Blockchain,
              };
          }
        }
      }
      return undefined;
    },
});

/**
 *  Active wallet for each blockchain with name and blockchain.
 */
export const activeWalletsWithData = selector({
  key: "activeWalletsWithData",
  get: ({ get }) => {
    const _activeWallets = get(activeWallets);
    return _activeWallets.map((publicKey) => get(walletWithData(publicKey)!)!);
  },
});

/**
 * Object mapping blockchain => publicKey.
 */
export const activePublicKeys = selector({
  key: "activePublicKeys",
  get: ({ get }) => {
    return Object.fromEntries(
      get(activeWalletsWithData).map((w) => [w.blockchain, w.publicKey])
    );
  },
});

export const activeEthereumWallet = selector({
  key: "activeEthereumWallet",
  get: ({ get }) => {
    const activeWallets = get(activeWalletsWithData);
    return activeWallets.find(
      (w: any) => w!.blockchain === Blockchain.ETHEREUM
    );
  },
});

export const ethereumPublicKey = selector({
  key: "ethereumPublicKey",
  get: ({ get }) => {
    return get(activeEthereumWallet)?.publicKey ?? null;
  },
});

export const activeSolanaWallet = selector({
  key: "ethereumWallet",
  get: ({ get }) => {
    const activeWallets = get(activeWalletsWithData);
    return activeWallets.find((w: any) => w!.blockchain === Blockchain.SOLANA);
  },
});

export const solanaPublicKey = selector({
  key: "solanaPublicKey",
  get: ({ get }) => {
    return get(activeSolanaWallet)?.publicKey ?? null;
  },
});
