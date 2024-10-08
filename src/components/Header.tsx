
export const Header = ({ title, avatarUrl, author }) => {
  return (
    <div>
      <div className="font-bold text-3xl h-10 mb-4 ">V2EX</div>
      <div className="text-2xl font-bold ">{title}</div>
      <div className="flex items-center mt-2">
        {avatarUrl && <img src={avatarUrl} alt="头像" className="w-10 h-10 rounded-full mr-2" />}
        <span className="text-lg ">{author}</span>
      </div>
      <hr className="my-3 border-main-400" />
    </div>
  )
}

