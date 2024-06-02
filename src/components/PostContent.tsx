
export const PostContent = ({ postContent }) => (
  <>
    {postContent.length > 0 && (
      <div className="text-lg leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: postContent }} />
    )}
  </>
);

