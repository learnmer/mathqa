# Learnmer MathQA

This is a math question answering app, with image support, built with Remix, React, and Google's Gemini Flash.

[Demo on Vercel](https://mathqa.vercel.app/)

https://github.com/learnmer/mathqa/assets/91375035/fa2377bd-bd06-478c-9300-d50fa7f989f3

## Environmental variables

```
# .env
GEMINI_API_KEY=<YOUR_API_KEY>
```

## Docker

```bash
docker build . -t mathqa
```

```bash
docker run -it -p 3000:3000 -e GEMINI_API_KEY=<YOUR_GEMINI_API_KEY> mathqa
```

## Development

Run the Vite dev server:

```shellscript
yarn dev
```

## Deployment

First, build your app for production:

```sh
yarn build
```

Then run the app in production mode:

```sh
yarn start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
