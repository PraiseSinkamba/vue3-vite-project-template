// Simulate a realistic backend with delays, errors, and caching
export interface BackendOption {
  id: string
  label: string
  value: string
  parentId?: string
  hasChildren?: boolean
  metadata?: Record<string, any>
}

class FakeBackend {
  private cache = new Map<string, BackendOption[]>()
  private loadingStates = new Set<string>()

  // Simulate network delay
  private async delay(ms: number = 500 + Math.random() * 1000) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Simulate occasional errors
  private shouldError(errorRate = 0.1): boolean {
    return Math.random() < errorRate
  }

  async loadCategories(parentId?: string): Promise<BackendOption[]> {
    const cacheKey = parentId || "root"

    // Return cached data if available
    if (this.cache.has(cacheKey)) {
      await this.delay(100) // Small delay for cached data
      return this.cache.get(cacheKey)!
    }

    // Prevent duplicate requests
    if (this.loadingStates.has(cacheKey)) {
      await new Promise((resolve) => {
        const checkLoading = () => {
          if (!this.loadingStates.has(cacheKey)) {
            resolve(void 0)
          } else {
            setTimeout(checkLoading, 100)
          }
        }
        checkLoading()
      })
      return this.cache.get(cacheKey) || []
    }

    this.loadingStates.add(cacheKey)

    try {
      await this.delay()

      if (this.shouldError()) {
        throw new Error("Failed to load categories")
      }

      const data = this.generateCategoryData(parentId)
      this.cache.set(cacheKey, data)
      return data
    } finally {
      this.loadingStates.delete(cacheKey)
    }
  }

  async loadLocations(parentId?: string): Promise<BackendOption[]> {
    const cacheKey = `locations-${parentId || "root"}`

    if (this.cache.has(cacheKey)) {
      await this.delay(100)
      return this.cache.get(cacheKey)!
    }

    await this.delay()

    if (this.shouldError(0.05)) {
      throw new Error("Failed to load locations")
    }

    const data = this.generateLocationData(parentId)
    this.cache.set(cacheKey, data)
    return data
  }

  async loadFileSystem(parentId?: string): Promise<BackendOption[]> {
    const cacheKey = `files-${parentId || "root"}`

    if (this.cache.has(cacheKey)) {
      await this.delay(50)
      return this.cache.get(cacheKey)!
    }

    await this.delay(200)

    const data = this.generateFileSystemData(parentId)
    this.cache.set(cacheKey, data)
    return data
  }

  async createOption(
    label: string,
    parentId?: string,
    type: "category" | "location" | "file" = "category",
  ): Promise<BackendOption> {
    await this.delay(300)

    if (this.shouldError(0.05)) {
      throw new Error("Failed to create option")
    }

    const newOption: BackendOption = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label,
      value: label.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      parentId,
      hasChildren: false,
      metadata: {
        createdAt: new Date().toISOString(),
        type: "custom",
      },
    }

    // Add to cache
    const cacheKey = parentId || "root"
    if (this.cache.has(cacheKey)) {
      const existing = this.cache.get(cacheKey)!
      this.cache.set(cacheKey, [...existing, newOption])
    }

    return newOption
  }

  private generateCategoryData(parentId?: string): BackendOption[] {
    const categoryData: Record<string, BackendOption[]> = {
      root: [
        { id: "electronics", label: "Electronics", value: "electronics", hasChildren: true },
        { id: "clothing", label: "Clothing & Accessories", value: "clothing", hasChildren: true },
        { id: "home", label: "Home & Garden", value: "home", hasChildren: true },
        { id: "sports", label: "Sports & Outdoors", value: "sports", hasChildren: true },
        { id: "books", label: "Books & Media", value: "books", hasChildren: true },
      ],
      electronics: [
        {
          id: "computers",
          label: "Computers & Tablets",
          value: "computers",
          parentId: "electronics",
          hasChildren: true,
        },
        { id: "phones", label: "Mobile Phones", value: "phones", parentId: "electronics", hasChildren: true },
        { id: "audio", label: "Audio & Headphones", value: "audio", parentId: "electronics", hasChildren: true },
        { id: "gaming", label: "Gaming", value: "gaming", parentId: "electronics", hasChildren: true },
      ],
      computers: [
        { id: "laptops", label: "Laptops", value: "laptops", parentId: "computers" },
        { id: "desktops", label: "Desktop Computers", value: "desktops", parentId: "computers" },
        { id: "tablets", label: "Tablets", value: "tablets", parentId: "computers" },
        {
          id: "accessories",
          label: "Computer Accessories",
          value: "accessories",
          parentId: "computers",
          hasChildren: true,
        },
      ],
      clothing: [
        { id: "mens", label: "Men's Clothing", value: "mens", parentId: "clothing" },
        { id: "womens", label: "Women's Clothing", value: "womens", parentId: "clothing" },
        { id: "kids", label: "Children's Clothing", value: "kids", parentId: "clothing" },
        { id: "shoes", label: "Shoes", value: "shoes", parentId: "clothing"},
      ],
    }

    return categoryData[parentId || "root"] || []
  }

  private generateLocationData(parentId?: string): BackendOption[] {
    const locationData: Record<string, BackendOption[]> = {
      root: [
        { id: "us", label: "United States", value: "us", hasChildren: true },
        { id: "ca", label: "Canada", value: "ca", hasChildren: true },
        { id: "uk", label: "United Kingdom", value: "uk", hasChildren: true },
        { id: "de", label: "Germany", value: "de", hasChildren: true },
        { id: "fr", label: "France", value: "fr", hasChildren: true },
      ],
      us: [
        { id: "us-ca", label: "California", value: "us-ca", parentId: "us", hasChildren: true },
        { id: "us-ny", label: "New York", value: "us-ny", parentId: "us", hasChildren: true },
        { id: "us-tx", label: "Texas", value: "us-tx", parentId: "us", hasChildren: true },
        { id: "us-fl", label: "Florida", value: "us-fl", parentId: "us", hasChildren: true },
      ],
      "us-ca": [
        { id: "us-ca-sf", label: "San Francisco", value: "us-ca-sf", parentId: "us-ca", hasChildren: true },
        { id: "us-ca-la", label: "Los Angeles", value: "us-ca-la", parentId: "us-ca", hasChildren: true },
        { id: "us-ca-sd", label: "San Diego", value: "us-ca-sd", parentId: "us-ca" },
      ],
      "us-ca-sf": [
        { id: "us-ca-sf-soma", label: "SOMA", value: "us-ca-sf-soma", parentId: "us-ca-sf" },
        { id: "us-ca-sf-mission", label: "Mission District", value: "us-ca-sf-mission", parentId: "us-ca-sf" },
        { id: "us-ca-sf-castro", label: "Castro", value: "us-ca-sf-castro", parentId: "us-ca-sf" },
      ],
    }

    return locationData[parentId || "root"] || []
  }

  private generateFileSystemData(parentId?: string): BackendOption[] {
    const fileData: Record<string, BackendOption[]> = {
      root: [
        { id: "documents", label: "📁 Documents", value: "documents", hasChildren: true },
        { id: "downloads", label: "📁 Downloads", value: "downloads", hasChildren: true },
        { id: "pictures", label: "📁 Pictures", value: "pictures", hasChildren: true },
        { id: "projects", label: "📁 Projects", value: "projects", hasChildren: true },
      ],
      documents: [
        { id: "work", label: "📁 Work", value: "work", parentId: "documents", hasChildren: true },
        { id: "personal", label: "📁 Personal", value: "personal", parentId: "documents", hasChildren: true },
        { id: "resume.pdf", label: "📄 Resume.pdf", value: "resume-pdf", parentId: "documents" },
      ],
      projects: [
        { id: "web-apps", label: "📁 Web Apps", value: "web-apps", parentId: "projects", hasChildren: true },
        { id: "mobile-apps", label: "📁 Mobile Apps", value: "mobile-apps", parentId: "projects", hasChildren: true },
        { id: "readme.md", label: "📄 README.md", value: "readme-md", parentId: "projects" },
      ],
    }

    return fileData[parentId || "root"] || []
  }

  clearCache() {
    this.cache.clear()
  }
}

export const fakeBackend = new FakeBackend()
