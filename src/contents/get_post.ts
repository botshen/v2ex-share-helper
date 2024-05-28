import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["*://*.v2ex.com/t/*"],
  all_frames: true,
  run_at: "document_end"
};

let comments: NodeListOf<Element> | null = null;
const style = document.createElement("style");
style.textContent = `
    .custom-checkbox {
      margin-right: 10px;
      margin-top: 10px; 
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #007BFF;
      border: 2px solid #007BFF;
      border-radius: 4px;
    }
    .custom-checkbox:checked {
      background-color: #007BFF;
    }
    .topic_buttons {
      padding: 5px;
      font-size: 14px;
      line-height: 120%;
      border-radius: 0 0 3px 3px;
      text-align: left;
    }
    .custom-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      padding: 10px 20px;
      background-color: #dc503e;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  `;
document.head.append(style);

// 创建总开关按钮
const toggleButton = document.createElement("button");
toggleButton.textContent = "选择模式";
toggleButton.className = "custom-button";
toggleButton.addEventListener("click", toggleSelectionMode);
document.body.appendChild(toggleButton);

function toggleSelectionMode() {
  if (comments) {
    comments.forEach((comment) => {
      const commentElement = comment as HTMLElement;
      const existingCheckbox = commentElement.querySelector(".custom-checkbox");
      if (existingCheckbox) {
        existingCheckbox.remove();
      } else {
        addCheckboxToComment(comment);
      }
    });
  }
}

function addCheckboxToComment(comment: Element) {
  const commentElement = comment as HTMLElement;

  // 创建一个容器用于包裹勾选框和评论内容
  const wrapperDiv = document.createElement("div");
  wrapperDiv.style.display = "flex";

  // 创建勾选框元素
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("custom-checkbox");

  // 将勾选框插入到新的容器中
  wrapperDiv.appendChild(checkbox);

  // 将原评论内容移至容器中
  while (commentElement.firstChild) {
    wrapperDiv.appendChild(commentElement.firstChild);
  }

  // 将新的容器插入到原评论元素中
  commentElement.appendChild(wrapperDiv);
}

// 初始查找所有评论元素
const mainElement = document.querySelector("#Main");
if (mainElement) {
  const boxes = mainElement.querySelectorAll(".box");
  if (boxes.length > 1) {
    const secondBox = boxes[1];
    comments = secondBox.querySelectorAll("[id^='r_']");
  }
}

// 其余代码保留原样，包括分享按钮的创建和分享功能实现

// 查找 body > #Wrapper > .content > #Main > 第一个 .box > .box
const wrapper = document.querySelector("#Wrapper");
if (wrapper) {
  const content = wrapper.querySelector('.content');
  if (content) {
    const main = content.querySelector("#Main");
    if (main) {
      const firstBox = main.querySelector(".box") as HTMLElement;
      if (firstBox && firstBox.classList.contains("box")) {
        let topicButtons = firstBox.querySelector(".topic_buttons") as HTMLElement;
        if (!topicButtons) {
          // 如果不存在 .topic_buttons 元素，则创建一个新的
          topicButtons = document.createElement("div");
          topicButtons.className = "topic_buttons";
          const lastCell = firstBox.lastElementChild;
          if (lastCell) {
            lastCell.insertAdjacentElement("afterend", topicButtons);
          } else {
            firstBox.appendChild(topicButtons);
          }
        }
        insertShareButton(topicButtons);
      }
    }
  }
}

function sharePostContent() {
  console.log('开始分享帖子内容');

  const postContentElement = document.querySelector(".topic_content");
  const postContent = postContentElement ? postContentElement.innerHTML : "";

  const titleElement = document.querySelector("#Wrapper .content #Main .box .header h1");
  const title = titleElement ? titleElement.textContent : "未找到标题";

  const authorElement = document.querySelector("#Wrapper .content #Main .box .header small a");
  const author = authorElement ? authorElement.textContent : "未找到作者";

  const avatarElement = document.querySelector("#Wrapper .content #Main .box .header img") as HTMLImageElement;
  const avatarUrl = avatarElement ? avatarElement.src : "未找到头像";

  const postscriptElements = document.querySelectorAll("#Wrapper .content #Main .box .subtle .topic_content");
  const postscripts = Array.from(postscriptElements).map(element => ({ content: element.innerHTML }));

  const checkedComments = collectCheckedComments();
  const currentPageUrl = window.location.href;

  chrome.runtime.sendMessage({
    action: "openNewTab",
    data: {
      postContent,
      title,
      author,
      avatarUrl,
      comments: checkedComments,
      postscripts,
      url: currentPageUrl
    }
  });
}

function insertShareButton(container: HTMLElement) {
  if (container.querySelector(".tb.share-button")) {
    return;
  }

  const shareTextButton = document.createElement("a");
  shareTextButton.href = "#;";
  shareTextButton.className = "tb share-button";
  shareTextButton.textContent = "分享帖子";
  shareTextButton.style.marginRight = "10px";
  shareTextButton.style.marginLeft = "10px";
  shareTextButton.addEventListener("click", sharePostContent);

  container.appendChild(shareTextButton);
}

function collectCheckedComments() {
  const checkedComments = [];
  if (comments) {
    comments.forEach(comment => {
      const checkbox = comment.querySelector(".custom-checkbox") as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        const commentElement = comment.querySelector("table") as HTMLElement;
        if (commentElement) {
          const avatarElement = commentElement.querySelector("img.avatar") as HTMLImageElement;
          const authorElement = commentElement.querySelector("strong a.dark") as HTMLElement;
          const contentElement = commentElement.querySelector(".reply_content") as HTMLElement;
          if (contentElement) {
            const citedReplyElement = contentElement.querySelector(".cited_reply");
            if (citedReplyElement) {
              const checkboxesInCitedReply = citedReplyElement.querySelectorAll(".custom-checkbox");
              checkboxesInCitedReply.forEach(checkbox => {
                if (checkbox.parentNode === citedReplyElement) {
                  citedReplyElement.removeChild(checkbox);
                } else {
                  checkbox.remove();
                }
              });
            }
          }
          const avatarUrl = avatarElement ? avatarElement.src : "未找到头像";
          const author = authorElement ? authorElement.textContent : "未找到作者";
          const content = contentElement ? contentElement.innerHTML : "未找到评论内容";

          checkedComments.push({ avatarUrl, author, content });
        }
      }
    });
  }
  return checkedComments;
}
