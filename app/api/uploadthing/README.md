# uploadthing

## Overview
Next.js API route endpoint for `/api/uploadthing`.

## Interface
- `ourFileRouter` in [core.ts:ourFileRouter]
- `OurFileRouter` in [core.ts:OurFileRouter]
- `GET` in [route.ts:GET]
- `POST` in [route.ts:POST]

## Invariants
- Requires authenticated user session in [core.ts:getSession]

## Side Effects
- Uploads files or processes webhooks with UploadThing in [route.ts:uploadthing]
- Uploads files or processes webhooks with UploadThing in [core.ts:uploadthing]

## Verification
- Run: `npm run build`
