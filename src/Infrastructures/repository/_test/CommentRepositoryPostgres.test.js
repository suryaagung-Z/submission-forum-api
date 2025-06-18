const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
  
  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });

      const newComment = new NewComment({
        content: 'komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepository.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'komentar',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyCommentExists function', () => {
    it('should throw NotFoundError if comment does not exist', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.verifyCommentExists('comment-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw error if comment exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'komentar',
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.verifyCommentExists('comment-123'))
        .resolves.not.toThrow();
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if owner does not match', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'komentar',
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-xxx'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw error if owner is correct', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'komentar',
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrow();
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete the comment by setting is_delete to true', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'komentar',
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepository.deleteComment('comment-123');

      // Assert
      const [comment] = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment.is_delete).toBe(true);
    });
  });
});
