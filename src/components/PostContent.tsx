
export const PostContent = ({ postContent }) => (
  <>
    {postContent.length > 0 && (
      <div className="text-lg text-[#444444] leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: postContent }} />
    )}
  </>
);

