import { ReloadIcon } from "@radix-ui/react-icons"
import download from "downloadjs"
import { toPng } from "html-to-image"
import { Resizable } from "re-resizable"
import { useState } from "react"
import toast, { Toaster } from "react-hot-toast"

import { CommentsSection } from "~components/CommentsSection"
import { Footer } from "~components/Footer"
import { Header } from "~components/Header"
import { PostContent } from "~components/PostContent"
import { QrCode } from "~components/QrCode"
import { SubPost } from "~components/SubPost"
import { Button } from "~components/ui/button"
import { toastStyles } from "~const"

import "../style.css"

const notify = () => toast("已复制到剪贴板📋", { icon: "✅" })
const notifyError = () => toast("复制图片失败", { icon: "❌" })
const notifyCopyUrl = () => toast("URL已复制到剪贴板📋", { icon: "✅" })

export default function DeltaFlyerPage() {
  const [postContent, setPostContent] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [author, setAuthor] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [comments, setComments] = useState<Comment[]>([])
  const [postscripts, setPostscripts] = useState<Postscript[]>([])
  const [showQrCode, setShowQrCode] = useState<boolean>(true)
  const [showSubPost, setShowSubPost] = useState<boolean>(true)
  const [showComments, setShowComments] = useState<boolean>(true)
  const [showPost, setShowPost] = useState<boolean>(true)
  const [showAllComments, setShowAllComments] = useState<boolean>(false)
  const [url, setUrl] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingDownload, setLoadingloadingDownload] = useState<boolean>(false)
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [selectedComments, setSelectedComments] = useState<Set<number>>(
    new Set()
  )
  const [themeColor, setThemeColor] = useState<string>("white") // 添加主题颜色状态

  const handleThemeChange = (color: string) => {
    setThemeColor(color)
  }

  const handleMessage = (message: any) => {
    if (message.action === "showPostContent") {
      const {
        postContent,
        title,
        author,
        avatarUrl,
        comments,
        postscripts,
        url
      } = message.data
      setPostContent(postContent)
      setTitle(title)
      setAuthor(author)
      setAvatarUrl(avatarUrl)
      setComments(comments)
      setPostscripts(postscripts)
      setUrl(url)
    }
  }

  chrome.runtime.onMessage.addListener(handleMessage)

  const handleCommentChange = (index: number) => {
    const updatedSet = new Set(selectedComments)
    if (updatedSet.has(index)) {
      updatedSet.delete(index)
    } else {
      updatedSet.add(index)
    }
    setSelectedComments(updatedSet)
  }

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode)
  }

  const convertImageToBase64 = async (imgUrl: string): Promise<string> => {
    try {
      // 使用 chrome.runtime.getURL 来避免跨域问题
      const response = await fetch(imgUrl)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error("转换图片失败:", error)
      return ""
    }
  }

  const copyImageToClipboard = async () => {
    const element = document.getElementById("post-content")
    if (element) {
      try {
        setLoading(true)

        const { width, height } = element.getBoundingClientRect()

        const dataUrl = await toPng(element, {
          fetchRequestInit: {
            cache: "no-cache"
          },
          pixelRatio: 3,
          quality: 1,
          width: width,
          height: height,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left"
          },
          filter: (node) => {
            if (node instanceof HTMLElement) {
              node.style.textRendering = "optimizeLegibility"
              node.style.webkitFontSmoothing = "antialiased"
            }
            return true
          }
        })

        const blob = await (await fetch(dataUrl)).blob()
        const item = new ClipboardItem({ "image/png": blob })
        await navigator.clipboard.write([item])
        setLoading(false)
        notify()
      } catch (error) {
        console.error("复制图片失败:", error)
        setLoading(false)
        notifyError()
      }
    }
  }

  const downloadImage = async () => {
    const element = document.getElementById("post-content")
    if (element) {
      try {
        setLoadingloadingDownload(true)

        // 预处理所有第三方图片
        const images = element.getElementsByTagName("img")
        console.log(images)
        for (const img of images) {
          const base64Url = await convertImageToBase64(img.src)
          if (base64Url) {
            img.src = base64Url
            img.removeAttribute("rel")
          }
        }

        const dataUrl = await toPng(element, {
          fetchRequestInit: {
            cache: "no-cache"
          },
          pixelRatio: 2,
          quality: 1,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left"
          }
        })

        setLoadingloadingDownload(false)
        download(dataUrl, "v2ex.png")
      } catch (error) {
        console.error("下载图片失败:", error)
        setLoadingloadingDownload(false)
      }
    }
  }

  const handleShowAllComments = (checked: boolean) => {
    setShowAllComments(checked)
    if (checked) {
      setSelectedComments(new Set(comments.map((_, index) => index)))
    } else {
      setSelectedComments(new Set())
    }
  }

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      notifyCopyUrl()
    } catch (error) {
      console.error("复制URL失败:", error)
    }
  }

  return (
    <div className={`flex flex-col items-center p-6 min-h-screen bg-slate-300`}>
      <div className="fixed top-5 right-5 flex flex-col justify-center p-4 gap-4 z-50 bg-white border-black rounded-lg shadow-lg">
        <Button
          className={
            loading || !previewMode
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
          }
          disabled={loading || !previewMode}
          onClick={copyImageToClipboard}>
          {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          复制为图片
        </Button>
        <Button
          className={
            loadingDownload || !previewMode
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors"
          }
          onClick={downloadImage}
          disabled={loadingDownload || !previewMode}>
          {loadingDownload && (
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          )}
          保存为图片
        </Button>
        <Button
          className={`${
            previewMode
              ? "bg-rose-500 hover:bg-rose-600"
              : "bg-emerald-500 hover:bg-emerald-600"
          } text-white font-medium transition-colors`}
          variant="destructive"
          onClick={togglePreviewMode}>
          {previewMode ? "退出预览" : "预览图片"}
        </Button>
        {postContent.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600 rounded"
              type="checkbox"
              checked={showPost}
              onChange={(e) => setShowPost(e.target.checked)}
            />
            <span className="text-sm">显示正文</span>
          </div>
        )}
        {postscripts.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600 rounded"
              type="checkbox"
              checked={showSubPost}
              onChange={(e) => setShowSubPost(e.target.checked)}
            />
            <span className="text-sm">显示附言</span>
          </div>
        )}
        {comments.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600 rounded"
              type="checkbox"
              checked={showComments}
              onChange={(e) => setShowComments(e.target.checked)}
            />
            <span className="text-sm">显示评论</span>
          </div>
        )}
        {comments.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600 rounded"
              type="checkbox"
              checked={showAllComments}
              onChange={(e) => handleShowAllComments(e.target.checked)}
            />
            <span className="text-sm">全选评论</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600 rounded"
            type="checkbox"
            checked={showQrCode}
            onChange={(e) => setShowQrCode(e.target.checked)}
          />
          <span className="text-sm">显示二维码</span>
        </div>
        {url && (
          <div className="flex flex-col items-start gap-2 mt-4">
            <span className="text-gray-700">文章链接:</span>
            <div className="flex items-center gap-2">
              <input
                className="border p-2 w-full text-gray-700"
                value={url}
                readOnly
              />
              <Button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold"
                onClick={copyUrlToClipboard}>
                复制URL
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-5 left-5 flex flex-col justify-center p-4 gap-4 z-50 bg-white border-black rounded-lg">
        <div className="text-lg font-semibold mb-2">选择主题颜色:</div>
        <div className="grid grid-cols-5 gap-2">
          <button
            className={`w-8 h-8 rounded-full border-2 bg-white border-gray-950`}
            onClick={() => handleThemeChange("white")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-green-100 border-gray-950`}
            onClick={() => handleThemeChange("green")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-yellow-100 border-gray-950`}
            onClick={() => handleThemeChange("yellow")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-gray-500 border-gray-950`}
            onClick={() => handleThemeChange("gray")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-black border-gray-950`}
            onClick={() => handleThemeChange("black")}
          />

          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#E6E6FA] border-gray-950`}
            onClick={() => handleThemeChange("lavender")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#F5FFFA] border-gray-950`}
            onClick={() => handleThemeChange("mint")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#FFDAB9] border-gray-950`}
            onClick={() => handleThemeChange("peach")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#E1FFFF] border-gray-950`}
            onClick={() => handleThemeChange("skyblue")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#FFE4E1] border-gray-950`}
            onClick={() => handleThemeChange("rose")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#FFFDD0] border-gray-950`}
            onClick={() => handleThemeChange("cream")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#DCD0FF] border-gray-950`}
            onClick={() => handleThemeChange("lilac")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#E0EEE0] border-gray-950`}
            onClick={() => handleThemeChange("sage")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#F4E4BC] border-gray-950`}
            onClick={() => handleThemeChange("sand")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#FFE5D4] border-gray-950`}
            onClick={() => handleThemeChange("coral")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#708090] border-gray-950`}
            onClick={() => handleThemeChange("slate")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#4A3C31] border-gray-950`}
            onClick={() => handleThemeChange("coffee")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#000080] border-gray-950`}
            onClick={() => handleThemeChange("navy")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#228B22] border-gray-950`}
            onClick={() => handleThemeChange("forest")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#800020] border-gray-950`}
            onClick={() => handleThemeChange("burgundy")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#008080] border-gray-950`}
            onClick={() => handleThemeChange("teal")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#673147] border-gray-950`}
            onClick={() => handleThemeChange("plum")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#F0E68C] border-gray-950`}
            onClick={() => handleThemeChange("khaki")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#F0FFFF] border-gray-950`}
            onClick={() => handleThemeChange("azure")}
          />
          <button
            className={`w-8 h-8 rounded-full border-2 bg-[#E2725B] border-gray-950`}
            onClick={() => handleThemeChange("terracotta")}
          />
        </div>
      </div>

      <Resizable
        resizeRatio={[2, 1]}
        defaultSize={{ width: 448 }}
        minWidth={390}
        maxWidth={1000}
        handleComponent={{
          right: (
            <div className="absolute top-0 right-0 h-full w-2 bg-[#101729] cursor-ew-resize"></div>
          )
        }}
        enable={{ right: previewMode ? false : true }}>
        <div id="post-content" className={`p-6 shadow-md theme-${themeColor}`}>
          <Header title={title} avatarUrl={avatarUrl} author={author} />
          {showPost && (
            <PostContent
              postContent={postContent}
              contentEditable={!previewMode}
            />
          )}
          {showSubPost && postscripts.length > 0 && (
            <SubPost postscripts={postscripts} />
          )}
          {showComments && comments.length > 0 && (
            <CommentsSection
              comments={comments}
              previewMode={previewMode}
              selectedComments={selectedComments}
              handleCommentChange={handleCommentChange}
            />
          )}
          {showQrCode && <QrCode url={url} />}
          <Footer />
        </div>
      </Resizable>
      <Toaster toastOptions={{ style: toastStyles }} />
    </div>
  )
}
