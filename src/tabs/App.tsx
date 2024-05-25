import { useEffect, useReducer, useState, type CSSProperties } from "react";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import '../style.scss';
import { Watermark } from '@hirohe/react-watermark';
import toast, { Toaster } from 'react-hot-toast';
const notify = () => toast('已复制到剪贴板📋', { icon: '✅' });
const toastStyles = {
  borderRadius: '10px',
  background: '#333',
  color: '#fff',
  padding: '14px 18px',
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
  const [randomBgColor, setRandomBgColor] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [postscripts, setPostscripts] = useState<Postscript[]>([]);


  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === "showPostContent") {
        const { postContent, title, author, avatarUrl, comments, postscripts } = message.data;
        setPostContent(postContent);
        setTitle(title);
        setAuthor(author);
        setAvatarUrl(avatarUrl);
        setComments(comments);
        setPostscripts(postscripts); // 添加这行代码
      }
    };


    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  useEffect(() => {
    const generateRandomColor = () => {
      const hue = Math.floor(Math.random() * 360); // 色相
      const saturation = 50 + Math.floor(Math.random() * 30); // 饱和度在50%到80%之间
      const lightness = 70 + Math.floor(Math.random() * 10); // 亮度在70%到80%之间
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };
    setRandomBgColor(generateRandomColor());
  }, []);

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
  const [count, increase] = useReducer((c) => c + 1, 0)

  return (
    <div style={{ ...styles.pageContainer, backgroundColor: randomBgColor }} className="xxx">
      <div style={styles.buttonContainer as CSSProperties}>
        <button style={styles.button as CSSProperties} onClick={copyImageToClipboard}>复制图片</button>
        <button style={styles.button as CSSProperties} onClick={downloadImage}>下载图片</button>
      </div>
      <div id="post-content">
        <button
          onClick={() => increase()}
          type="button"
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Count:
          <span className="inline-flex items-center justify-center w-8 h-4 ml-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
            {count}
          </span>
        </button>
        <Watermark text="V2ex" gutter={16} multiline>
          <div style={styles.container as CSSProperties}>
            <div style={styles.wrapper as CSSProperties}>
              <div style={{
                fontWeight: '800',
                fontSize: "30px",
                height: '40px',
                color: '#333333'
              }}>V2EX</div>
              <div className="title" style={styles.title as CSSProperties}>{title}</div>
              <div style={styles.authorContainer as CSSProperties}>
                {avatarUrl && <img src={avatarUrl} alt="头像" style={styles.avatar as CSSProperties} />}
                <span style={styles.author as CSSProperties}>{author}</span>
              </div>
              <div style={styles.content as CSSProperties} dangerouslySetInnerHTML={{ __html: postContent }} />

              {postscripts.length > 0 && (
                <div style={styles.postscriptSection as CSSProperties}>
                  <h3 style={styles.postscriptTitle as CSSProperties}>附言</h3>
                  {postscripts.map((postscript, index) => (
                    <div key={index} style={styles.postscript as CSSProperties} dangerouslySetInnerHTML={{ __html: postscript.content }} />
                  ))}
                </div>
              )}

              {comments.length > 0 && (
                <div style={styles.commentsSection as CSSProperties}>
                  <h3 style={styles.commentsTitle as CSSProperties}>精选评论</h3>
                  {comments.map((comment, index) => (
                    <div key={index} style={styles.comment as CSSProperties}>
                      <img src={comment.avatarUrl} alt="头像" style={styles.commentAvatar as CSSProperties} />
                      <div style={styles.commentContent as CSSProperties}>
                        <span style={styles.commentAuthor as CSSProperties}>{comment.author}</span>
                        <div style={styles.commentText as CSSProperties} dangerouslySetInnerHTML={{ __html: comment.content }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Watermark>
      </div>
      <Toaster toastOptions={{
        style: toastStyles,
      }} />
    </div>
  );

}

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: '20px',
    minHeight: '100vh',
  },
  wrapper: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif'
  },
  container: {
    padding: '20px',
    maxWidth: '406px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '24px', // 增大标题字体
    fontWeight: 'bold' as 'bold',
    color: '#333',
    backgroundColor: '#fff',
  },
  authorContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  author: {
    fontSize: '16px',
    color: '#555',
  },
  content: {
    fontSize: '18px', // 增大内容字体
    lineHeight: '1.8',
    color: '#444',
    backgroundColor: '#fff',
    wordBreak: 'break-word' as 'break-word',
  },
  buttonContainer: {
    position: 'fixed',
    top: '20px',
    left: '67%',
    display: 'flex',
    justifyContent: 'center',
    padding: '10px',
    zIndex: 1000,
    backgroundColor: '#fff',
    transition: 'all 0.3s ease-in-out',
    borderRadius: '8px'
  },
  button: {
    padding: '10px 15px',
    margin: '0 10px',
    fontSize: '16px', // 调整按钮字体
    color: '#fff',
    backgroundColor: '#8f7ad0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center' as 'center',
    transition: 'background-color 0.3s ease',
  },
  commentsSection: {
    marginTop: '20px',
  },
  commentsTitle: {
    fontSize: '20px',
    fontWeight: 'bold' as 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  comment: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  commentAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    marginRight: '10px',
    border: '1px solid #838383'
  },
  commentContent: {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '10px',
    flex: 1,
  },
  commentAuthor: {
    fontSize: '14px',
    fontWeight: 'bold' as 'bold',
    color: '#555',
    marginBottom: '5px',
    marginLeft: '8px',
  },
  commentText: {
    fontSize: '14px',
    color: '#555',
    wordBreak: 'break-word' as 'break-word',
  },
  postscriptSection: {
    marginTop: '20px',
  },
  postscriptTitle: {
    fontSize: '20px',
    fontWeight: 'bold' as 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  postscript: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '10px',
  },
};
