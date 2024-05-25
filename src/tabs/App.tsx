import { Watermark } from '@hirohe/react-watermark';
import download from 'downloadjs';
import { QRCodeSVG } from 'qrcode.react';

import { toPng } from 'html-to-image';
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Button } from "~components/ui/button";
import { Checkbox } from "~components/ui/checkbox";
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
  const [showSubPost, setshowSubPost] = useState<boolean>(true);
  const [url, setUrl] = useState<string>("");



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
        const dataUrl = await toPng(element);
        const blob = await (await fetch(dataUrl)).blob();
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        notify()
      } catch (error) {
        console.error('复制图片失败:', error);
      }
    }
  };

  const downloadImage = async () => {
    const element = document.getElementById("post-content");
    if (element) {
      try {
        const dataUrl = await toPng(element);
        download(dataUrl, 'v2ex.png');
      } catch (error) {
        console.error('下载图片失败:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-slate-300" >
      <div className="fixed top-5 left-[67%] flex flex-col justify-center p-2 gap-4 z-50 bg-white rounded-lg">
        <Button onClick={copyImageToClipboard} >复制图片</Button>
        <Button onClick={downloadImage} >下载图片</Button>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={showQrCode}
            onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') {
                setShowQrCode(checked);
              }
            }}
          />
          显示分享二维码
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={showSubPost}
            onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') {
                setshowSubPost(checked);
              }
            }}
          />
          显示附言
        </div>
      </div>
      <div id="post-content" className="bg-white rounded-lg p-6 max-w-sm shadow-md">
        <Watermark text="V2ex" gutter={16} multiline>
          <div>
            <div className="font-bold text-3xl h-10 text-[#333333]">V2EX</div>
            <div className="text-2xl font-bold text-[#333333]">{title}</div>
            <div className="flex items-center mt-2">
              {avatarUrl && <img src={avatarUrl} alt="头像" className="w-10 h-10 rounded-full mr-2" />}
              <span className="text-lg text-[#555555]">{author}</span>
            </div>
            <div className="text-lg text-[#444444] leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: postContent }} />

            {showSubPost && postscripts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-[#333333] mb-2">附言</h3>
                {postscripts.map((postscript, index) => (
                  <div key={index} className="text-lg text-[#555555] leading-relaxed mt-2 bg-[#f9f9f9] p-4 rounded-md" dangerouslySetInnerHTML={{ __html: postscript.content }} />
                ))}
              </div>
            )}

            {comments.length > 0 && (
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
              <div className="mt-6 flex gap-3 justify-end">
                <div className='flex flex-col items-center justify-center text-lg'>
                  <div>长按扫码</div>
                  <div>查看详情</div>
                </div>
                <QRCodeSVG value={url} size={64} />
              </div>
            )}
          </div>
        </Watermark>
      </div>
      <Toaster toastOptions={{
        style: toastStyles,
      }} />
    </div>
  );
}
