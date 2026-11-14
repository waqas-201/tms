# sanity

## Overview
Shared backend utility and integration logic for sanity.

## Interface
- `projectId` in [client.ts:projectId]
- `dataset` in [client.ts:dataset]
- `apiVersion` in [client.ts:apiVersion]
- `client` in [client.ts:client]
- `urlFor` in [image.ts:urlFor]
- `SanityLive` in [live.ts:SanityLive]
- `sanityFetch` in [live.ts:sanityFetch]
- `SanityFetchResult` in [live.ts:SanityFetchResult]
- `POSTS_QUERY` in [queries.ts:POSTS_QUERY]
- `POST_QUERY` in [queries.ts:POST_QUERY]
- `POST_SLUGS_QUERY` in [queries.ts:POST_SLUGS_QUERY]
- `ACTIVE_ANNOUNCEMENTS_QUERY` in [queries.ts:ACTIVE_ANNOUNCEMENTS_QUERY]
- `CATEGORIES_QUERY` in [queries.ts:CATEGORIES_QUERY]
- `SanityImageCrop` in [types.ts:SanityImageCrop]
- `SanityImageHotspot` in [types.ts:SanityImageHotspot]
- `SanityImage` in [types.ts:SanityImage]
- `SanityAuthor` in [types.ts:SanityAuthor]
- `SanityCategory` in [types.ts:SanityCategory]
- `SanityPost` in [types.ts:SanityPost]
- `SanityAnnouncement` in [types.ts:SanityAnnouncement]

## Invariants
- None

## Side Effects
- None

## Verification
- Run: `npm run build`
