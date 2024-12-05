export const Header = ({ title, avatarUrl, author }) => {
  return (
    <header className="space-y-4">
      <div className="font-bold text-3xl tracking-tight">V2EX</div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {avatarUrl && (
          <img 
            src={avatarUrl} 
            alt={`${author}的头像`}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" 
          />
        )}
        <span className="text-lg text-gray-700">{author}</span>
      </div>
      <hr className="border-gray-200" />
    </header>
  )
}

