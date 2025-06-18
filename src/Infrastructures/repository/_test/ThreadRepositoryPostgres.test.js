const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const newThread = new NewThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
      expect(addedThread).toEqual({
        id: 'thread-123',
        title: 'judul',
        owner: 'user-123',
      });
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-404')).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'testuser',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'judul',
        body: 'isi',
        owner: 'user-456',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).resolves.not.toThrow(NotFoundError);
    });
  });
});
