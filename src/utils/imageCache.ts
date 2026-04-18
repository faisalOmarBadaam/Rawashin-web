type CachedImage = {
  url: string
  refs: number
}

const cache = new Map<string, CachedImage>()

export const imageCache = {
  get(id: string) {
    return cache.get(id)
  },

  set(id: string, url: string) {
    cache.set(id, { url, refs: 1 })
  },

  retain(id: string) {
    const item = cache.get(id)
    if (item) item.refs++
  },

  release(id: string) {
    const item = cache.get(id)
    if (!item) return

    item.refs--

    if (item.refs <= 0) {
      URL.revokeObjectURL(item.url)
      cache.delete(id)
    }
  },

  clear() {
    cache.forEach(item => URL.revokeObjectURL(item.url))
    cache.clear()
  }
}
