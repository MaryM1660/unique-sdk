import { HexString } from '@polkadot/util/types';
import {
  SignerPayloadJSON,
  SignerPayloadRaw,
} from '@polkadot/types/types/extrinsic';
import {
  AnyObject,
  CollectionInfo,
  CollectionInfoBase,
  TokenInfo,
} from './unique-types';
import {
  SdkSigner,
  SignTxArguments,
  SignTxResult,
  SubmitResult,
  SubmitTxArguments,
  TxBuildArguments,
} from './arguments';

export interface ChainProperties {
  SS58Prefix: number;
  token: string;
  decimals: number;
  wsUrl: string;
  genesisHash: HexString;
}

export interface Balance {
  amount: string;
  formatted: string;

  // todo see sdk.ts line 50
  // todo formatted: string
  // todo withUnit: string
}

export interface TransferBuildArguments {
  address: string;
  destination: string;
  amount: number;
}

export interface CollectionIdArguments {
  collectionId: number;
}

export interface TokenIdArguments extends CollectionIdArguments {
  tokenId: number;
}

export interface AddressArguments {
  address: string;
}

export interface CreateCollectionArguments extends CollectionInfoBase {
  address: string;
}

export interface BurnCollectionArguments {
  collectionId: number;
  address: string;
}
export interface TransferCollectionArguments {
  collectionId: number;
  from: string;
  to: string;
}

export interface CreateTokenArguments {
  collectionId: number;
  address: string;
  constData: AnyObject;
}

export interface BurnTokenArguments extends TokenIdArguments {
  address: string;
}
export interface TransferTokenArguments extends TokenIdArguments {
  from: string;
  to: string;
}

export interface ISdkCollection {
  get(args: CollectionIdArguments): Promise<CollectionInfo | null>;
  create(collection: CreateCollectionArguments): Promise<UnsignedTxPayload>;
  burn(args: BurnCollectionArguments): Promise<UnsignedTxPayload>;
  transfer(args: TransferCollectionArguments): Promise<UnsignedTxPayload>;
}

export interface ISdkToken {
  get(args: TokenIdArguments): Promise<TokenInfo | null>;
  create(token: CreateTokenArguments): Promise<UnsignedTxPayload>;
  burn(args: BurnTokenArguments): Promise<UnsignedTxPayload>;
  transfer(args: TransferTokenArguments): Promise<UnsignedTxPayload>;
}

export interface ISdkBalance {
  get(args: AddressArguments): Promise<Balance>;
  transfer(buildArgs: TransferBuildArguments): Promise<UnsignedTxPayload>;
}

export interface ISdk {
  extrinsics: ISdkExtrinsics;
  balance: ISdkBalance;
  collection: ISdkCollection;
  token: ISdkToken;
  chainProperties(): ChainProperties;
}

export interface UnsignedTxPayload {
  signerPayloadJSON: SignerPayloadJSON;
  signerPayloadRaw: SignerPayloadRaw;
  signerPayloadHex: HexString;
}

export interface ISdkExtrinsics {
  build(buildArgs: TxBuildArguments): Promise<UnsignedTxPayload>;
  sign(
    args: SignTxArguments,
    signer: SdkSigner | undefined,
  ): Promise<SignTxResult>;
  submit(args: SubmitTxArguments): Promise<SubmitResult>;
}
