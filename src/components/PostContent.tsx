export const PostContent = ({ postContent, contentEditable = false }) => {
  return (
    <>
      {postContent.length > 0 && (
        <div
          className="text-lg leading-relaxed mt-4"
          contentEditable={contentEditable}
          suppressContentEditableWarning={true}
          dangerouslySetInnerHTML={{ __html: postContent }}
        />
      )}
    </>
  )
}
