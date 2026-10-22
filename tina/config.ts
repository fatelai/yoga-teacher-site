import { defineConfig } from "tinacms";

// Tina Cloud 的設定值放在環境變數（GitHub repo 的 Secrets），不寫進程式碼
const branch = process.env.GITHUB_BRANCH || process.env.GITHUB_REF_NAME || "main";

const text = (name: string, label: string, extra: object = {}) => ({ type: "string", name, label, ...extra });
const textarea = (name: string, label: string) => text(name, label, { ui: { component: "textarea" } });
const image = (name: string, label: string) => ({ type: "image", name, label });
const sectionHead = [text("eyebrow", "小標（英文）"), text("heading", "標題")];

export default defineConfig({
  branch,
  // 後台網頁只看得到 TINA_PUBLIC_ 開頭的環境變數；Token 只在建置時使用，不會出現在網頁上
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
    // GitHub Pages 的子路徑（repo 名稱），與 astro.config.mjs 相同
    basePath: process.env.TINA_PUBLIC_BASE_PATH || undefined,
  },
  media: { tina: { mediaRoot: "uploads", publicFolder: "public" } },

  schema: {
    collections: [
      {
        name: "site",
        label: "網站內容",
        path: "content/site",
        format: "json",
        ui: {
          // 只有一頁，不允許新增或刪除
          allowedActions: { create: false, delete: false },
          router: () => "/",
        },
        fields: [
          {
            type: "object", name: "seo", label: "網頁標題與描述（Google 搜尋用）",
            fields: [text("title", "網頁標題"), textarea("description", "網頁描述")],
          },
          {
            type: "object", name: "brand", label: "Logo 文字",
            fields: [text("name", "主要文字"), text("suffix", "副文字")],
          },
          {
            type: "object", name: "hero", label: "首頁大圖區",
            fields: [
              text("eyebrow", "小標（英文）"),
              textarea("title", "大標題（按 Enter 換行）"),
              textarea("subtitle", "介紹文字（按 Enter 換行）"),
              image("image", "背景圖片"),
              text("primaryLabel", "報名按鈕文字"),
              text("secondaryLabel", "查看課程按鈕文字"),
            ],
          },
          {
            type: "object", name: "about", label: "關於我",
            fields: [
              ...sectionHead,
              image("image", "老師照片"),
              text("paragraphs", "介紹段落", { list: true, ui: { component: "textarea" } }),
              {
                type: "object", name: "stats", label: "數字亮點", list: true,
                ui: { itemProps: (item: any) => ({ label: `${item?.value ?? ""} ${item?.label ?? ""}` }) },
                fields: [text("value", "數字"), text("label", "說明")],
              },
              text("certs", "證照", { list: true }),
            ],
          },
          {
            type: "object", name: "classes", label: "課程介紹",
            fields: [
              ...sectionHead,
              text("intro", "說明文字"),
              {
                type: "object", name: "items", label: "課程", list: true,
                ui: { itemProps: (item: any) => ({ label: item?.title }) },
                fields: [
                  text("title", "課程名稱"),
                  text("tag", "標籤（例如：初學友善）"),
                  textarea("description", "課程說明"),
                  text("duration", "時長"),
                  text("price", "價格"),
                  image("image", "課程圖片"),
                ],
              },
            ],
          },
          {
            type: "object", name: "schedule", label: "每週課表",
            fields: [
              ...sectionHead,
              text("note", "地點說明"),
              {
                type: "object", name: "rows", label: "時段", list: true,
                ui: { itemProps: (item: any) => ({ label: item?.time }) },
                fields: [
                  text("time", "時間"),
                  text("mon", "週一"), text("tue", "週二"), text("wed", "週三"),
                  text("thu", "週四"), text("fri", "週五"), text("sat", "週六"),
                ],
              },
            ],
          },
          {
            type: "object", name: "testimonials", label: "學員回饋",
            fields: [
              ...sectionHead,
              {
                type: "object", name: "items", label: "回饋", list: true,
                ui: { itemProps: (item: any) => ({ label: item?.author }) },
                fields: [textarea("quote", "回饋內容"), text("author", "學員")],
              },
            ],
          },
          {
            type: "object", name: "cta", label: "報名體驗課區塊",
            fields: [text("heading", "標題"), text("text", "說明"), text("button", "按鈕文字")],
          },
          {
            type: "object", name: "signup", label: "報名連結",
            fields: [
              text("url", "報名連結網址（LINE、Google 表單等，所有報名按鈕都會連到這裡）"),
            ],
          },
          {
            type: "object", name: "contact", label: "頁尾與聯絡方式",
            fields: [
              text("tagline", "頁尾標語"),
              text("email", "Email"),
              text("phone", "電話"),
              text("line", "LINE"),
              {
                type: "object", name: "socials", label: "社群連結", list: true,
                ui: { itemProps: (item: any) => ({ label: item?.label }) },
                fields: [text("label", "名稱"), text("url", "網址")],
              },
              text("copyright", "版權文字"),
            ],
          },
        ],
      },
    ],
  },
});
