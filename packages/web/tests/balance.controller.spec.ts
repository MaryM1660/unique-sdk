import { INestApplication } from '@nestjs/common';
import { KeyringPair } from '@polkadot/keyring/types';
import { Keyring } from '@polkadot/keyring';
import request from 'supertest';
import { u8aToHex } from '@polkadot/util';
import { ErrorCodes } from '@unique-nft/sdk/errors';

import { BalanceController } from '../src/app/controllers';
import { createApp } from './utils.test';

describe(BalanceController.name, () => {
  let app: INestApplication;
  let alice: KeyringPair;
  let bob: KeyringPair;
  let emptyUser: KeyringPair;

  beforeAll(async () => {
    app = await createApp();

    alice = new Keyring({ type: 'sr25519' }).addFromUri('//Alice');
    bob = new Keyring({ type: 'sr25519' }).addFromUri('//Bob');
    emptyUser = new Keyring({ type: 'sr25519' }).addFromUri('EmptyUser');
  });

  function getBalance(address: string): request.Test {
    return request(app.getHttpServer()).get(`/api/balance`).query({ address });
  }
  function transferBuild(
    amount: number,
    from: KeyringPair,
    to: KeyringPair,
  ): request.Test {
    return request(app.getHttpServer()).post(`/api/balance/transfer`).send({
      address: from.address,
      destination: to.address,
      amount,
    });
  }
  async function transfer(
    amount: number,
    from: KeyringPair,
    to: KeyringPair,
  ): Promise<request.Test> {
    const buildResponse = await transferBuild(amount, from, to);
    expect(buildResponse.ok).toEqual(true);
    expect(buildResponse.body).toMatchObject({
      signerPayloadJSON: expect.any(Object),
      signerPayloadHex: expect.any(String),
    });

    const { signerPayloadJSON, signerPayloadHex } = buildResponse.body;
    const signature = u8aToHex(from.sign(signerPayloadHex));

    return request(app.getHttpServer()).post(`/api/extrinsic/submit`).send({
      signature,
      signatureType: from.type,
      signerPayloadJSON,
    });
  }

  describe('GET /api/balance', () => {
    it('ok', async () => {
      const response = await getBalance(alice.address);

      expect(response.ok).toEqual(true);

      expect(response.body).toMatchObject({
        amount: expect.any(String),
        formatted: expect.any(String),
      });
    });

    it('not ok', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/balance`)
        .query({ address: 'foo' });

      expect(response.ok).toEqual(false);
    });
  });

  describe('GET /api/balance/transfer', () => {
    it('ok', async () => {
      const submitResponse = await transfer(0.001, alice, bob);

      expect(submitResponse.ok).toEqual(true);

      expect(submitResponse.body).toMatchObject({
        hash: expect.any(String),
      });
    });

    it('balance too low', async () => {
      const balanceResponse = await getBalance(emptyUser.address);
      const currentAmount = +balanceResponse.body.amount;
      const submitResponse = await transfer(
        currentAmount + 1,
        emptyUser,
        alice,
      );

      expect(submitResponse.ok).toEqual(false);

      expect(submitResponse.body.error.code).toEqual(
        ErrorCodes.SubmitExtrinsic,
      );
    });

    it.each([-1, 0])('invalid amount: %d', async (amount) => {
      const buildResponse = await transferBuild(amount, alice, bob);
      expect(buildResponse.ok).toEqual(false);
      expect(buildResponse.body.error.code).toEqual(ErrorCodes.Validation);
    });

    it('invalid transfer to myself', async () => {
      const buildResponse = await transferBuild(1, alice, alice);
      expect(buildResponse.ok).toEqual(false);
      expect(buildResponse.body.error.code).toEqual(ErrorCodes.Validation);
    });
  });
});
