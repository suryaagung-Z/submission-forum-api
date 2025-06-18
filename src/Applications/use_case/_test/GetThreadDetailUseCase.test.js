const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-123';

    const mockThread = {
      id: mockThreadId,
      title: 'Sebuah thread',
      body: 'Isi thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'user1',
        date: '2021-08-08T07:22:33.555Z',
        content: 'komentar pertama',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'user2',
        date: '2021-08-08T07:26:21.338Z',
        content: 'komentar dihapus',
        is_delete: true,
      },
    ];

    const expectedThreadDetail = {
      ...mockThread,
      comments: [
        {
          id: 'comment-123',
          username: 'user1',
          date: '2021-08-08T07:22:33.555Z',
          content: 'komentar pertama',
        },
        {
          id: 'comment-456',
          username: 'user2',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    const mockThreadRepository = {
      verifyThreadExists: jest.fn(() => Promise.resolve()),
      getThreadDetail: jest.fn(() => Promise.resolve(mockThread)),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn(() => Promise.resolve(mockComments)),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute(mockThreadId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(mockThreadId);
    expect(mockThreadRepository.getThreadDetail).toHaveBeenCalledWith(mockThreadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(mockThreadId);
    expect(result).toEqual(expectedThreadDetail);
  });
});
