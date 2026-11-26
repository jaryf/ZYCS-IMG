# jary 图床

简体中文 · [English](README.md)

基于 Vue 和 Cloudflare Pages Functions 的图片上传工具。支持选择、拖放和粘贴图片，上传成功后可复制图片链接、Markdown 或显示二维码。图片存放在 Imgur，上传记录保存在当前浏览器。

## 本地预览

使用 Node.js 22.12+ 和 pnpm。

~~~sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run preview:pages
~~~

打开 http://localhost:8788。Pages 预览会运行本地上传函数，并实际将图片上传到 Imgur。由于 WordPress 图片缓存无法回源到 localhost，本地预览显示 Imgur 直链。

只调试前端时可运行 `pnpm run dev`。如需连接已有的上传服务，在 `.env.dev.local` 中设置 `VITE_IMG_API_URL`。

## 部署到 Cloudflare Pages

将此仓库连接到 Pages，构建命令填 `pnpm run build`，构建输出目录填 `dist`。构建根目录使用仓库根目录，Pages 会加载 `functions` 中的路由。

生产环境默认上传到当前站点的 `/upload`，分享链接使用 `/v2` 图片缓存路由。要使用自己的 Imgur Client ID，在 Pages 的 Functions 环境变量中设置 `IMGUR_CLIENT_ID`。

## 许可证

[MIT](LICENSE)
