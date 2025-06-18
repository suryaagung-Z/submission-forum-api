const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should return 201 and the added thread', async () => {
      const server = await createServer(container);

      // Register user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'userthread',
          password: 'rahasia',
          fullname: 'User Thread',
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'userthread',
          password: 'rahasia',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Act
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Sebuah thread',
          body: 'Isi thread',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual('Sebuah thread');
    });

    it('should return 400 when payload missing required property (no title)', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'usernoTitle',
          password: 'rahasia',
          fullname: 'User No Title',
        },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'usernoTitle',
          password: 'rahasia',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          body: 'Hanya body, tidak ada title',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should return 400 when payload has invalid data type', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'userwrongtype',
          password: 'rahasia',
          fullname: 'User Salah Tipe',
        },
      });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'userwrongtype',
          password: 'rahasia',
        },
      });

      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 123,
          body: ['bukan string'],
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should return 401 when no access token provided', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Tanpa token',
          body: 'Isi tanpa autentikasi',
        },
      });

      expect(response.statusCode).toEqual(401);
    });
  });
});