import { cryptoWaitReady } from '@polkadot/util-crypto';
import { KeyringPair } from '@polkadot/keyring/types';
import { Keyring } from '@polkadot/keyring';
import { Sdk } from '@unique-nft/sdk';
import { SdkOptions } from '@unique-nft/sdk/types';

import '@unique-nft/sdk/extrinsics';
import '@unique-nft/sdk/balance';
import '@unique-nft/sdk/tokens';

export type TestAccounts = {
  alice: KeyringPair;
  bob: KeyringPair;
  charlie: KeyringPair;
  dave: KeyringPair;
  eve: KeyringPair;
  ferdie: KeyringPair;
};

export const getKeyringPairs = async (): Promise<TestAccounts> => {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'sr25519' });

  return {
    alice: keyring.addFromUri('//Alice'),
    bob: keyring.addFromUri('//Bob'),
    charlie: keyring.addFromUri('//Charlie'),
    dave: keyring.addFromUri('//Dave'),
    eve: keyring.addFromUri('//Eve'),
    ferdie: keyring.addFromUri('//Ferdie'),
  };
};

export const getLastCollectionId = (sdk: Sdk): Promise<number> =>
  sdk.api.rpc.unique
    .collectionStats()
    .then(({ created }) => created.toNumber());

export const getLastTokenId = (
  sdk: Sdk,
  collectionId: number,
): Promise<number> =>
  sdk.api.rpc.unique
    .lastTokenId(collectionId)
    .then((tokenId) => tokenId.toNumber());

export const delay = (ms = 1000) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const getDefaultSdkOptions = (): SdkOptions => ({
  chainWsUrl: 'wss://ws-quartz-dev.unique.network',
  ipfsGatewayUrl: 'https://ipfs.unique.network/ipfs/',
});
