const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly including comments and replies', async () => {
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

    const mockReplies = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        username: 'user3',
        date: '2021-08-08T07:30:00.000Z',
        content: 'balasan pertama',
        is_delete: false,
      },
      {
        id: 'reply-456',
        comment_id: 'comment-123',
        username: 'user4',
        date: '2021-08-08T07:35:00.000Z',
        content: 'balasan dihapus',
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
          replies: [
            {
              id: 'reply-123',
              content: 'balasan pertama',
              date: '2021-08-08T07:30:00.000Z',
              username: 'user3',
            },
            {
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T07:35:00.000Z',
              username: 'user4',
            },
          ],
        },
        {
          id: 'comment-456',
          username: 'user2',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          replies: [],
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

    const mockReplyRepository = {
      getRepliesByCommentIds: jest.fn(() => Promise.resolve(mockReplies)),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute(mockThreadId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(mockThreadId);
    expect(mockThreadRepository.getThreadDetail).toHaveBeenCalledWith(mockThreadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(mockThreadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith(['comment-123', 'comment-456']);
    expect(result).toEqual(expectedThreadDetail);
  });
});