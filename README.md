# jary Image Hosting

English · [简体中文](README_CN.md)

A Vue image uploader backed by Cloudflare Pages Functions and Imgur. Select, drag, or paste images, then copy a link or Markdown snippet or open a QR code. Upload history is stored in your browser.

## Local preview

Use Node.js 22.12+ and pnpm.

~~~sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run preview:pages
~~~

Open http://localhost:8788. The Pages preview runs the local upload function and sends images to Imgur. It shows Imgur links because the WordPress image cache cannot fetch from localhost.

For frontend-only development, run `pnpm run dev`. To use an existing upload service, set `VITE_IMG_API_URL` in `.env.dev.local`.

## Deploy to Cloudflare Pages

Connect this repository to Pages. Set the build command to `pnpm run build` and the build output directory to `dist`. Use the repository root as the build root so Pages can load the `functions` directory.

By default the browser uploads to `/upload` on the current site. Shared links use the `/v2` image cache route. To use your own Imgur Client ID, set `IMGUR_CLIENT_ID` as a Pages Functions environment variable.

## License

[MIT](LICENSE)
