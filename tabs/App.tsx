import { useEffect, useState, type CSSProperties } from "react";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
 
export default function DeltaFlyerPage() {
  const [postContent, setPostContent] = useState<string>("");

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === "showPostContent") {
        setPostContent(message.data);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
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
    <div style={styles.container as CSSProperties}>
      <div id="post-content" style={styles.wrapper as CSSProperties}>
        <div className="title" style={styles.title as CSSProperties}>喜欢的女同事要离职了怎么办？
        </div>
        <div style={styles.content as CSSProperties} dangerouslySetInnerHTML={{ __html: postContent }} />
      </div>
      <div style={styles.buttonContainer as CSSProperties}>
        <button style={styles.button as CSSProperties} onClick={copyImageToClipboard}>复制图片</button>
        <button style={styles.button as CSSProperties} onClick={downloadImage}>下载图片</button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
     fontFamily: 'Arial, sans-serif'

  },
  container: {
    padding: '20px',
    maxWidth: '406px',
    margin: 'auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    fontSize: '22px', // 增大标题字体
    fontWeight: 'bold' as 'bold',
    color: '#333',
    backgroundColor: '#fff',

  },
  content: {
    fontSize: '16px', // 增大内容字体
    lineHeight: '1.8',
    color: '#444',
    backgroundColor: '#fff',
    wordBreak: 'break-word' as 'break-word'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px'
  },
  button: {
    flex: '1',
    padding: '12px 15px',
    margin: '0 5px',
    fontSize: '20px', // 增大按钮字体
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center' as 'center'
  }
};
