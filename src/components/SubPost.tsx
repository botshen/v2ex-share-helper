import React from 'react'

export const SubPost = ({ postscripts }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-[#333333] mb-2">附言</h3>
      {postscripts.map((postscript, index) => (
        <div key={index} className="text-lg text-[#555555] leading-relaxed mt-2 bg-[#f9f9f9] p-4 rounded-md" dangerouslySetInnerHTML={{ __html: postscript.content }} />
      ))}
    </div>
  )
}

