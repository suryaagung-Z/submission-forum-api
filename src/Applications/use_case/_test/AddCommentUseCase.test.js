const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'komentar',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'komentar',
      owner: 'user-123',
    });

    const mockCommentRepository = {
      addComment: jest.fn().mockResolvedValue(expectedAddedComment),
    };

    const mockThreadRepository = {
      verifyThreadExists: jest.fn().mockResolvedValue(),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new NewComment(useCasePayload));
    expect(addedComment).toStrictEqual(expectedAddedComment);
  });
});
