import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://*.v2ex.com/t/*"],
  all_frames: true,
  run_at: "document_end"
}

let comments: NodeListOf<Element> | null = null
const style = document.createElement("style")
style.textContent = ` 
    .topic_buttons {
      padding: 5px;
      font-size: 14px;
      line-height: 120%;
      border-radius: 0 0 3px 3px;
      text-align: left;
    } 
  `
document.head.append(style)

// 初始查找所有评论元素
const mainElement = document.querySelector("#Main")
if (mainElement) {
  const boxes = mainElement.querySelectorAll(".box")
  if (boxes.length > 1) {
    const secondBox = boxes[1]
    comments = secondBox.querySelectorAll("[id^='r_']")
  }
}

// 查找 body > #Wrapper > .content > #Main > 第一个 .box > .box
const wrapper = document.querySelector("#Wrapper")
if (wrapper) {
  const content = wrapper.querySelector(".content")
  if (content) {
    const main = content.querySelector("#Main")
    if (main) {
      const firstBox = main.querySelector(".box") as HTMLElement
      if (firstBox && firstBox.classList.contains("box")) {
        let topicButtons = firstBox.querySelector(
          ".topic_buttons"
        ) as HTMLElement
        if (!topicButtons) {
          // 如果不存在 .topic_buttons 元素，则创建一个新的
          topicButtons = document.createElement("div")
          topicButtons.className = "topic_buttons"
          const lastCell = firstBox.lastElementChild
          if (lastCell) {
            lastCell.insertAdjacentElement("afterend", topicButtons)
          } else {
            firstBox.appendChild(topicButtons)
          }
        }
        insertShareButton(topicButtons)
      }
    }
  }
}

// 清理HTML内容，删除所有具有指定class的元素
function cleanHTMLContent(html: string): string {
  const container = document.createElement("div")
  container.innerHTML = html

  // 处理YouTube视频嵌入
  const videoWrappers = container.querySelectorAll(".embedded_video_wrapper")
  videoWrappers.forEach((wrapper) => {
    const iframe = wrapper.querySelector("iframe")
    if (iframe && iframe.src) {
      // 从iframe的src中提取视频ID
      const videoId = iframe.src.split('/').pop()
      if (videoId) {
        // 创建一个包含视频封面的div
        const thumbnailDiv = document.createElement("div")
        thumbnailDiv.className = "youtube-thumbnail"
        thumbnailDiv.innerHTML = `
          <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" 
               alt="YouTube视频封面" 
               style="width: 100%; border-radius: 8px;"
          />
          <div style="text-align: center; margin-top: 8px; color: #666;">
            🎬 点击查看YouTube视频
          </div>
        `
        // 替换原有的iframe
        wrapper.innerHTML = ''
        wrapper.appendChild(thumbnailDiv)
      }
    }
  })

  // 原有的清理代码
  const elementsToRemove = container.querySelectorAll("span.small.fade")
  elementsToRemove.forEach((element) => {
    element.remove()
  })

  const citedReplies = container.querySelectorAll(".cited_reply")
  citedReplies.forEach((citedReply) => {
    const frElements = citedReply.querySelectorAll("div.fr")
    const agoElements = citedReply.querySelectorAll(".ago")

    frElements.forEach((element) => {
      element.remove()
    })

    agoElements.forEach((element) => {
      element.remove()
    })
  })

  return container.innerHTML
}

function sharePostContent() {
  console.log("开始分享帖子内容")

  const postContentElement = document.querySelector(
    ".topic_content:not(.markdown_body)"
  )
  let postContent = postContentElement ? postContentElement.innerHTML : ""
  postContent = cleanHTMLContent(postContent)
  const titleElement = document.querySelector(
    "#Wrapper .content #Main .box .header h1"
  )
  const title = titleElement ? titleElement.textContent : "未找到标题"

  const authorElement = document.querySelector(
    "#Wrapper .content #Main .box .header small a"
  )
  const author = authorElement ? authorElement.textContent : "未找到作者"

  const avatarElement = document.querySelector(
    "#Wrapper .content #Main .box .header img"
  ) as HTMLImageElement
  const avatarUrl = avatarElement ? avatarElement.src : "未找到头像"

  const postscriptElements = document.querySelectorAll(
    "#Wrapper .content #Main .box .subtle .topic_content"
  )
  const postscripts = Array.from(postscriptElements).map((element) => ({
    content: cleanHTMLContent((element as HTMLElement).innerHTML)
  }))

  const checkedComments = collectCheckedComments()
  console.log("checkedComments", checkedComments)
  const currentPageUrl = window.location.href
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
  })
}

function insertShareButton(container: HTMLElement) {
  if (container.querySelector(".tb.share-button")) {
    return
  }

  const shareTextButton = document.createElement("a")
  shareTextButton.href = "#;"
  shareTextButton.className = "tb share-button"
  shareTextButton.textContent = "分享帖子"
  shareTextButton.style.marginRight = "10px"
  shareTextButton.style.marginLeft = "10px"
  shareTextButton.addEventListener("click", sharePostContent)

  container.appendChild(shareTextButton)
}

function collectCheckedComments() {
  const checkedComments = []
  if (comments) {
    comments.forEach((comment) => {
      const commentElement = comment.querySelector("table") as HTMLElement
      if (commentElement) {
        const avatarElement = commentElement.querySelector(
          "img.avatar"
        ) as HTMLImageElement
        const authorElement = commentElement.querySelector(
          "strong a.dark"
        ) as HTMLElement
        const contentElement = commentElement.querySelector(
          ".reply_content"
        ) as HTMLElement

        const avatarUrl = avatarElement ? avatarElement.src : "未找到头像"
        const author = authorElement ? authorElement.textContent : "未找到作者"
        let content = contentElement
          ? contentElement.innerHTML
          : "未找到评论内容"
        content = cleanHTMLContent(content)

        checkedComments.push({ avatarUrl, author, content })
      }
    })
  }
  console.log("checkedComments", checkedComments)
  return checkedComments
}
