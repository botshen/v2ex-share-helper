import { useEffect, useState, type CSSProperties } from "react";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import '../style.scss'
 

export default function DeltaFlyerPage() {
  const [postContent, setPostContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [randomBgColor, setRandomBgColor] = useState<string>("");

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === "showPostContent") {
        const { postContent, title, author, avatarUrl } = message.data;
        setPostContent(postContent);
        setTitle(title);
        setAuthor(author);
        setAvatarUrl(avatarUrl);
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
        alert("图片已复制到剪贴板！");
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
        download(dataUrl, 'post-content.png');
      } catch (error) {
        console.error('下载图片失败:', error);
      }
    }
  };

  return (
    <div style={{ ...styles.pageContainer, backgroundColor: randomBgColor }} className="xxx">
      <div style={styles.buttonContainer as CSSProperties}>
        <button style={styles.button as CSSProperties} onClick={copyImageToClipboard}>复制图片</button>
        <button style={styles.button as CSSProperties} onClick={downloadImage}>下载图片</button>
      </div>
      <div style={styles.container as CSSProperties} id="post-content">
        <div style={styles.wrapper as CSSProperties}>
          <div className="title" style={styles.title as CSSProperties}>{title}</div>
          <div style={styles.authorContainer as CSSProperties}>
            {avatarUrl && <img src={avatarUrl} alt="头像" style={styles.avatar as CSSProperties} />}
            <span style={styles.author as CSSProperties}>{author}</span>
          </div>
          <div style={styles.content as CSSProperties} dangerouslySetInnerHTML={{ __html: postContent }} />
        </div>
      </div>
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
    top: '0',
    left: '65%',
    display: 'flex',
    justifyContent: 'center',
    padding: '10px',
    zIndex: 1000,
    backgroundColor: '#fff',
    transition: 'all 0.3s ease-in-out',
    borderRadius:'8px'


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
}

