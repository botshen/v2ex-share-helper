import { Watermark } from '@hirohe/react-watermark';
import { ReloadIcon } from "@radix-ui/react-icons";
import download from 'downloadjs';
import { Resizable } from 're-resizable';

import { toPng } from 'html-to-image';
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Footer } from '~components/Footer';
import { Header } from '~components/Header';
import { PostContent } from '~components/PostContent';
import { QrCode } from '~components/QrCode';
import { SubPost } from '~components/SubPost';
import { Button } from "~components/ui/button";
import { toastStyles } from '~const';
import '../style.css';
import { CommentsSection } from '~components/CommentsSection';
const notify = () => toast('已复制到剪贴板📋', { icon: '✅' });

export default function DeltaFlyerPage() {
  const [postContent, setPostContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [postscripts, setPostscripts] = useState<Postscript[]>([]);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showSubPost, setShowSubPost] = useState<boolean>(true);
  const [showComments, setShowComments] = useState<boolean>(true);
  const [showPost, setShowPost] = useState<boolean>(true);
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDownload, setLoadingloadingDownload] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [selectedComments, setSelectedComments] = useState<Set<number>>(new Set());

  const handleMessage = (message: any) => {
    if (message.action === "showPostContent") {
      const { postContent, title, author, avatarUrl, comments, postscripts, url } = message.data;
      setPostContent(postContent);
      setTitle(title);
      setAuthor(author);
      setAvatarUrl(avatarUrl);
      setComments(comments);
      setPostscripts(postscripts);
      setUrl(url)
    }
  };
  chrome.runtime.onMessage.addListener(handleMessage);

  const handleCommentChange = (index: number) => {
    const updatedSet = new Set(selectedComments);
    if (updatedSet.has(index)) {
      updatedSet.delete(index);
    } else {
      updatedSet.add(index);
    }
    setSelectedComments(updatedSet);
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const copyImageToClipboard = async () => {
    const element = document.getElementById("post-content");
    if (element) {
      try {
        setLoading(true);
        const dataUrl = await toPng(element, {
          fetchRequestInit: {
            cache: 'no-cache',
          },
        });
        const blob = await (await fetch(dataUrl)).blob();
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setLoading(false);
        notify()
      } catch (error) {
        console.error('复制图片失败:', error);
        setLoading(false);
      }
    }
  };

  const downloadImage = async () => {
    const element = document.getElementById("post-content");
    if (element) {
      try {
        setLoadingloadingDownload(true)
        const dataUrl = await toPng(element, {
          fetchRequestInit: {
            cache: 'no-cache',
          },
        });
        setLoadingloadingDownload(false)

        download(dataUrl, 'v2ex.png');
      } catch (error) {
        console.error('下载图片失败:', error);
        setLoadingloadingDownload(false)

      }
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-slate-300" >
      <div className="fixed top-5 right-5 flex flex-col justify-center p-4 gap-4 z-50 bg-white border-black rounded-lg">
        <Button disabled={loading || !previewMode} onClick={copyImageToClipboard} >
          {
            loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          }
          复制为图片</Button>
        <Button onClick={downloadImage} disabled={loadingDownload || !previewMode} >
          {
            loadingDownload && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          }
          保存为图片</Button>
        <Button variant="destructive" onClick={togglePreviewMode} >{previewMode ? "退出预览" : "预览图片"}</Button>
        {
          postContent.length > 0 && <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600"
              type="checkbox"
              checked={showPost}
              onChange={(e) => setShowPost(e.target.checked)}
            />
            显示正文
          </div>
        }
        {
          postscripts.length > 0 && <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600"
              type="checkbox"
              checked={showSubPost}
              onChange={(e) => setShowSubPost(e.target.checked)}
            />
            显示附言
          </div>
        }
        {
          comments.length > 0 && <div className="flex items-center gap-2">
            <input
              className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600"
              type="checkbox"
              checked={showComments}
              onChange={(e) => setShowComments(e.target.checked)}
            />
            显示评论
          </div>
        }
        <div className="flex items-center gap-2">
          <input
            className="w-4 h-4 text-gray-800 bg-gray-700 border-gray-600"
            type="checkbox"
            checked={showQrCode}
            onChange={(e) => setShowQrCode(e.target.checked)}
          />
          显示二维码
        </div>
      </div>
      <Resizable
        resizeRatio={[2, 1]}
        defaultSize={{
          width: 448
        }}
        minWidth={390}
        maxWidth={1000}
        handleComponent={{
          right: (
            <div className="absolute top-0 right-0 h-full w-2 bg-[#101729] cursor-ew-resize"></div>
          ),
        }}
        enable={{
          right: previewMode ? false : true,
        }}
      >
        <div id="post-content" className="bg-white p-6 shadow-md">
          <div>
            <Header title={title} avatarUrl={avatarUrl} author={author} />
            {showPost && <PostContent postContent={postContent} />}
            {showSubPost && <SubPost postscripts={postscripts} />}
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
        </div>
      </Resizable>
      <Toaster toastOptions={{
        style: toastStyles,
      }} />
    </div>
  );
}
