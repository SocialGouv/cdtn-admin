export const buildFilePathUrl = () =>
  `${
    process.env.NEXT_PUBLIC_BUCKET_PUBLIC_ENDPOINT ?? "http://localhost:9000"
  }/${process.env.NEXT_PUBLIC_BUCKET_DRAFT_FOLDER ?? "draft"}/${
    process.env.NEXT_PUBLIC_BUCKET_DEFAULT_FOLDER ?? "default"
  }`;
