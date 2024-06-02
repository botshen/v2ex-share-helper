import React from 'react'

export const SubPost = ({ postscripts }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold   mb-2">附言</h3>
      {postscripts.map((postscript, index) => (
        <div key={index} className="text-lg  leading-relaxed mt-2 comment-bg shadow-md p-4 rounded-md" dangerouslySetInnerHTML={{ __html: postscript.content }} />
      ))}
    </div>
  )
}

