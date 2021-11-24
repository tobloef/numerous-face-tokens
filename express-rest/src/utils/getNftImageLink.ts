export const getNftImageLink = (seed: string) => {
  return `https://server.tobloef.com/faces/${encodeURIComponent(seed)}.png`;
}
