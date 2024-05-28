import { Watermark } from '@hirohe/react-watermark';
import download from 'downloadjs';
import { QRCodeSVG } from 'qrcode.react';
import { Resizable } from 're-resizable';
import { ReloadIcon } from "@radix-ui/react-icons"

import { toPng, toJpeg } from 'html-to-image';
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Button } from "~components/ui/button";
import '../style.css';
const notify = () => toast('已复制到剪贴板📋', { icon: '✅' });

const toastStyles = {
  borderRadius: '10px',
  background: '#333',
  color: '#fff',
  padding: '14px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  fontSize: '18px',
  animation: 'zoomIn 0.5s ease, fadeOut 1.5s ease 3s forwards',
};

interface Comment {
  avatarUrl: string;
  author: string;
  content: string;
}

interface Postscript {
  content: string;
}

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
        <Button disabled={loading} onClick={copyImageToClipboard} >
          {
            loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          }
          复制为图片</Button>
        <Button onClick={downloadImage} disabled={loadingDownload} >
          {
            loadingDownload && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          }
          保存为图片</Button>
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
            <div className="absolute top-0 right-0 h-full w-2 bg-[#436684] cursor-ew-resize"></div>
          ),
        }}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
      >
        <div id="post-content" className="bg-white   p-6   shadow-md">
          <Watermark lineHeight="1.2rem" opacity={0.5} textSize={12}
            text={``}
            gutter={50} multiline >
            <div>
              <div className="font-bold text-3xl h-10 mb-4 text-[#333333]">V2EX</div>
              <div className="text-2xl font-bold text-[#333333]">{title}</div>
              <div className="flex items-center mt-2">
                {avatarUrl && <img src={avatarUrl} alt="头像" className="w-10 h-10 rounded-full mr-2" />}
                <span className="text-lg text-[#555555]">{author}</span>
              </div>
              <hr className="my-3 border-main-400" />
              {
                showPost && postContent.length > 0 && (
                  <div className="text-lg text-[#444444] leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: postContent }} />
                )
              }
              {showSubPost && postscripts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-[#333333] mb-2">附言</h3>
                  {postscripts.map((postscript, index) => (
                    <div key={index} className="text-lg text-[#555555] leading-relaxed mt-2 bg-[#f9f9f9] p-4 rounded-md" dangerouslySetInnerHTML={{ __html: postscript.content }} />
                  ))}
                </div>
              )}

              {showComments && comments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-[#333333] mb-2">精选评论</h3>
                  {comments.map((comment, index) => (
                    <div key={index} className="flex items-center mb-4">
                      <img src={comment.avatarUrl} alt="头像" className="w-8 h-8 rounded-full mr-2 border border-gray-400" />
                      <div className="flex-1 bg-[#f9f9f9] rounded-md p-4">
                        <span className="text-sm font-bold text-[#555555] mb-1">{comment.author}</span>
                        <div className="text-sm text-[#555555]" dangerouslySetInnerHTML={{ __html: comment.content }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showQrCode && (
                <div className="mt-6 flex justify-end items-center  "> 
                  <div className='flex flex-row gap-3 items-center justify-center text-lg'>
                    <div className='flex flex-col items-center justify-center text-lg'>
                      <div>长按扫码</div>
                      <div>查看详情</div>
                    </div>
                    <QRCodeSVG value={url} size={64} />
                  </div>
                </div>
              )}
              <div className="w-full mt-4">
                <footer className="bg-[#f9f9f9] rounded-md   p-2"> 
                    <div className="text-gray-700 text-lg text-center">
                      在Chrome商店搜索"v2ex share"即可安装
                    </div>
                 </footer>
              </div>
            </div>
          </Watermark>
        </div>
      </Resizable>
      <Toaster toastOptions={{
        style: toastStyles,
      }} />
    </div>
  );
}


