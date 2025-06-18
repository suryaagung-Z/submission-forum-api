const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
      verifyCommentOwner: jest.fn().mockResolvedValue(),
      deleteComment: jest.fn().mockResolvedValue(),
    };

    const mockThreadRepository = {
      verifyThreadExists: jest.fn().mockResolvedValue(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith('comment-123');
  });
});
