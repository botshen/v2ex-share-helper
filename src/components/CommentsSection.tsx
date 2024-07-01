import React from 'react';

interface Comment {
  avatarUrl: string;
  author: string;
  content: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  previewMode: boolean;
  selectedComments: Set<number>;
  handleCommentChange: (index: number) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, previewMode, selectedComments, handleCommentChange }) => {
    // 检查在预览模式下是否有选中的评论
    const hasSelectedComments = previewMode ? Array.from(selectedComments).some(index => comments[index]) : true;

    if (!hasSelectedComments) {
      return null; // 如果在预览模式下没有选中的评论，则不渲染任何内容
    }
  return (
    <div className="mt-6"> 
      <h3 className="text-xl font-bold mb-2">精选评论</h3>
      {comments.map((comment, index) => {
        if (previewMode && !selectedComments.has(index)) {
          return null; // 预览模式下未勾选的评论不显示
        }
        return (
          <div key={index} className="flex items-center mb-4">
            {!previewMode && (
              <input
                type="checkbox"
                className="mr-2"
                style={{ width: '20px', height: '20px' }}  // 调整勾选框的大小 
                checked={selectedComments.has(index)}
                onChange={() => handleCommentChange(index)}
              />
            )}
            <img src={comment.avatarUrl} alt="头像" className="w-8 h-8 rounded-full mr-2 border border-gray-400" />
            <div className="flex-1 comment-bg shadow-md rounded-md p-4">
              <span className="text-sm font-bold  mb-1">{comment.author}</span>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: comment.content }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
