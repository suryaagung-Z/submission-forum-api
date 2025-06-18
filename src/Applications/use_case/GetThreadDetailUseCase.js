class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExists(threadId);

    const thread = await this._threadRepository.getThreadDetail(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const formattedComments = comments.map((comment) => {
      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      };
    });

    return {
      ...thread,
      comments: formattedComments,
    };
  }
}

module.exports = GetThreadDetailUseCase;
