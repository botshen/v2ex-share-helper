import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["*://*.v2ex.com/t/*"],
  all_frames: true
};

console.log(
  "You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
);

// 查找所有评论元素
const comments = document.querySelectorAll(".cell[data-floor-number]"); // 选择具有 data-floor-number 属性的 .cell 元素

comments.forEach(comment => {
  const commentElement = comment as HTMLElement;

  // 设置 .cell 元素为 flex 布局
  commentElement.style.display = "flex";
  commentElement.style.alignItems = "center";

  // 创建勾选框元素
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.style.marginRight = "10px"; // 添加一些右边距使得勾选框和评论内容之间有间隔
  checkbox.classList.add("custom-checkbox"); // 添加自定义 CSS 类

  // 将勾选框插入到每条评论前面
  commentElement.insertBefore(checkbox, commentElement.firstChild);
});

// 查找 body > #Wrapper > .content > #Main > 第一个 .box > .box
const wrapper = document.querySelector("#Wrapper");
if (wrapper) {
  const content = wrapper.querySelector(".content");
  if (content) {
    const main = content.querySelector("#Main");
    if (main) {
      const firstBox = main.querySelector(".box") as HTMLElement;
      console.log('firstBox', firstBox);
      if (firstBox && firstBox.classList.contains("box")) {
        const lastCell = firstBox.querySelector(".cell");
        let nextSibling = lastCell ? lastCell.nextElementSibling : null;
        console.log('nextSibling', nextSibling);
        if (!nextSibling || !nextSibling.classList.contains("topic_buttons")) {
          // 如果没有 .topic_buttons 元素，则创建一个新的
          const topicButtons = document.createElement("div");
          topicButtons.className = "topic_buttons";
          topicButtons.style.padding = "5px";
          topicButtons.style.fontSize = "14px";
          topicButtons.style.lineHeight = "120%";
          topicButtons.style.background = "linear-gradient(#eee 0,#ccc 100%)";
          topicButtons.style.borderRadius = "0 0 3px 3px";
          topicButtons.style.textAlign = "left";

          // 创建新的分享文字按钮
          const shareTextButton = document.createElement("a");
          shareTextButton.href = "#;";
          shareTextButton.className = "tb";
          shareTextButton.textContent = "分享文章";
          shareTextButton.style.marginRight = "10px"; // 添加一些右边距使得按钮之间有间隔
 

          // 添加点击事件处理函数
          shareTextButton.addEventListener("click", () => {
            sharePostContent();
          });

          // 将新的按钮插入到操作按钮容器中
          topicButtons.appendChild(shareTextButton);

          // 将新的 .topic_buttons 元素插入到 .cell 元素之后
          if (lastCell) {
            lastCell.insertAdjacentElement("afterend", topicButtons);
          }

        } else {
          // 如果存在 .topic_buttons 元素，则按照原逻辑处理
          const topicButtons = nextSibling as HTMLElement;

          // 创建新的分享文字按钮
          const shareTextButton = document.createElement("a");
          shareTextButton.href = "#;";
          shareTextButton.className = "tb";
          shareTextButton.textContent = "分享文章";
          shareTextButton.style.marginRight = "10px"; // 添加一些右边距使得按钮之间有间隔
          shareTextButton.style.marginLeft = "10px"; // 添加一些右边距使得按钮之间有间隔

          // 添加点击事件处理函数
          shareTextButton.addEventListener("click", () => {
            sharePostContent();
          });

          // 将新的按钮插入到操作按钮容器中
          topicButtons.appendChild(shareTextButton);
        }
      }
    }
  }
}

// 添加自定义样式
const style = document.createElement("style");
style.textContent = `
    .custom-checkbox {
      margin-right: 10px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #007BFF; /* 修改为你喜欢的颜色 */
      border: 2px solid #007BFF; /* 添加边框使其更显眼 */
      border-radius: 4px; /* 添加圆角 */
    }
    .custom-checkbox:checked {
      background-color: #007BFF; /* 修改为你喜欢的颜色 */
    }
    .topic_buttons {
      padding: 5px;
      font-size: 14px;
      line-height: 120%;
      background: linear-gradient(#eee 0,#ccc 100%);
      border-radius: 0 0 3px 3px;
      text-align: left;
    }
  `;
document.head.append(style);

// 分享帖子内容的函数
function sharePostContent() {
  console.log('开始分享帖子内容');

  // 获取帖子内容
  const postContentElement = document.querySelector(".topic_content");
  if (!postContentElement) {
    alert("未找到帖子内容！");
    return;
  }
  const postContent = postContentElement.innerHTML;

  // 获取标题
  const titleElement = document.querySelector("#Wrapper .content #Main .box .header h1");
  const title = titleElement ? titleElement.textContent : "未找到标题";
  console.log('title', title)

  // 获取作者名字
  const authorElement = document.querySelector("#Wrapper .content #Main .box .header small a");
  const author = authorElement ? authorElement.textContent : "未找到作者";
  console.log('author', author)

  // 获取头像 URL
  const avatarElement = document.querySelector("#Wrapper .content #Main .box .header img") as HTMLImageElement;
  const avatarUrl = avatarElement ? avatarElement.src : "未找到头像";
  console.log('avatarUrl', avatarUrl)
  // 示例：获取并打印所有勾选的评论信息
  const checkedComments = collectCheckedComments();
  console.log('Checked Comments:', checkedComments);
  // 创建新的标签页并传递内容
  chrome.runtime.sendMessage({
    action: "openNewTab",
    data: {
      postContent,
      title,
      author,
      avatarUrl,
      comments: checkedComments
    }
  });
}

// 收集勾选的评论信息
function collectCheckedComments() {
  const checkedComments = [];
  comments.forEach(comment => {
    const checkbox = comment.querySelector(".custom-checkbox") as HTMLInputElement;
    if (checkbox && checkbox.checked) {
      const commentElement = comment.querySelector("table") as HTMLElement;
      if (commentElement) {
        const avatarElement = commentElement.querySelector("img.avatar") as HTMLImageElement;
        const authorElement = commentElement.querySelector("strong a.dark") as HTMLElement;
        const contentElement = commentElement.querySelector(".reply_content") as HTMLElement;

        const avatarUrl = avatarElement ? avatarElement.src : "未找到头像";
        const author = authorElement ? authorElement.textContent : "未找到作者";
        const content = contentElement ? contentElement.textContent : "未找到评论内容";

        checkedComments.push({
          avatarUrl,
          author,
          content
        });
      }
    }
  });
  return checkedComments;
}


