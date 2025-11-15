# Fetch MCP Server - Kanban Next.js

A Model Context Protocol (MCP) server implementation that provides comprehensive web content fetching capabilities. This server enables LLMs to retrieve and process content from web pages, converting HTML to markdown for easier consumption and analysis.

## ⚠️ **Security Warning**

This server can access local/internal IP addresses and may represent a security risk. Exercise caution when using this MCP server to ensure sensitive data is not exposed.

## 🚀 Features

### **Web Content Fetching**
- ✅ **URL Fetching**: Retrieve content from any HTTP/HTTPS URL
- ✅ **HTML to Markdown**: Automatic conversion using Turndown service
- ✅ **Raw Content**: Option to get raw HTML without conversion
- ✅ **Content Pagination**: Start from specific character index
- ✅ **Length Control**: Limit content to specified character count

### **Search Engine Integration**
- ✅ **Multi-Engine Search**: Google, Bing, DuckDuckGo support
- ✅ **Result Processing**: Extract titles, URLs, and snippets
- ✅ **Metadata Extraction**: Complete page metadata analysis
- ✅ **Robots.txt Compliance**: Respect website access rules

### **Advanced Features**
- ✅ **User Agent Control**: Customizable user agents for requests
- ✅ **Timeout Management**: Configurable request timeouts
- ✅ **Redirect Following**: Control HTTP redirect behavior
- ✅ **Batch Operations**: Fetch multiple URLs simultaneously

## 🛠️ Available Tools (5 tools)

### **Core Fetching Tools**
```bash
fetch              - Fetch URL and convert HTML to markdown
fetch_multiple     - Fetch multiple URLs simultaneously
extract_metadata   - Extract metadata from webpages
```

### **Search Tools**
```bash
search_web         - Search web using multiple engines
check_robots_txt   - Check robots.txt compliance
```

## 📊 Resources

### **Dynamic Resources**
```bash
web://cache         - Cached web content and metadata
web://search-history - History of searches and results
web://api-docs      - Collection of API documentation
```

## 💬 Interactive Prompts (3 prompts)

### **Research Prompts**
```bash
web-research       - Interactive web research and analysis
api-documentation  - Fetch and analyze API documentation
market-research    - Conduct market research and analysis
```

## 🎯 Usage Examples

### **Basic Web Fetching**
```bash
# Fetch a webpage and convert to markdown
fetch {"url": "https://example.com", "max_length": 3000}

# Get raw HTML content
fetch {"url": "https://api.example.com/docs", "raw": true}

# Fetch with pagination
fetch {"url": "https://long-article.com", "start_index": 5000, "max_length": 2000}
```

### **Search Engine Queries**
```bash
# Search using Google
search_web {"query": "Next.js best practices 2024", "engine": "google", "max_results": 5}

# Search using DuckDuckGo
search_web {"query": "React performance optimization", "engine": "duckduckgo"}

# Search using Bing
search_web {"query": "TypeScript patterns", "engine": "bing"}
```

### **Metadata Extraction**
```bash
# Get complete metadata from a page
extract_metadata {"url": "https://github.com"}

# This returns:
# - Title, description, keywords
# - Open Graph metadata
# - Twitter card data
# - Canonical URLs
# - RSS feeds
```

### **Batch Operations**
```bash
# Fetch multiple URLs at once
fetch_multiple {
  "urls": [
    "https://react.dev",
    "https://nextjs.org",
    "https://typescriptlang.org"
  ],
  "max_length": 2000
}
```

### **Research and Analysis**
```bash
# Start interactive research
web-research {"topic": "machine learning trends 2024"}

# This guides you through:
# 1. Robots.txt compliance check
# 2. Search engine queries
# 3. Content fetching and analysis
# 4. Metadata extraction
# 5. Result compilation
```

## 🔒 Security Features

### **Robots.txt Compliance**
```bash
# Check if URL is allowed
check_robots_txt {"url": "https://example.com/api"}

# Returns robots.txt content and access permission
```

### **User Agent Control**
```bash
# Use autonomous user agent (respects robots.txt)
fetch {"url": "https://example.com", "user_agent": "autonomous"}

# Use user-specified user agent (ignores robots.txt)
fetch {"url": "https://example.com", "user_agent": "user"}
```

### **Request Configuration**
```bash
# Custom timeout and redirect settings
fetch {
  "url": "https://slow-api.com",
  "timeout": 30000,
  "follow_redirects": false
}
```

## 🚀 Integration with AI

### **VS Code / Cursor Setup**
```json
{
  "mcp": {
    "servers": {
      "kanban-fetch": {
        "command": "node",
        "args": ["src/mcp/fetch-server.js"],
        "cwd": "C:/DEV/kanban-nextjs"
      }
    }
  }
}
```

### **AI Command Examples**
```bash
"Research the latest React features"
"Find documentation for Next.js 15"
"Search for TypeScript best practices"
"Analyze competitor websites"
"Fetch API documentation for Stripe"
"Get market research on e-commerce trends"
"Extract metadata from a blog post"
"Search for tutorials on a specific topic"
```

## 📁 Project Integration

### **Business Intelligence**
```bash
# Research production optimization
web-research {"topic": "manufacturing efficiency 2024"}

# Get competitor analysis
market-research {"industry": "cosmetics manufacturing"}

# Fetch API documentation
api-documentation {"api_name": "production management API"}
```

### **Content Analysis**
```bash
# Analyze blog content
fetch {"url": "https://industry-blog.com/article", "max_length": 5000}

# Extract article metadata
extract_metadata {"url": "https://research-paper.com"}
```

## 🎮 Available Scripts

```bash
npm run mcp:fetch     # Run fetch server only
npm run mcp:all       # Run all MCP servers
npm run mcp:setup     # Setup all dependencies
```

## 🔍 Advanced Configuration

### **Custom User Agent**
```bash
# Add to mcp.json args
"--user-agent=CustomBot/1.0 (Research; +https://your-domain.com)"
```

### **Proxy Configuration**
```bash
# Add to mcp.json args
"--proxy-url=http://proxy.company.com:8080"
```

### **Robots.txt Control**
```bash
# Disable robots.txt checking (NOT RECOMMENDED)
"--ignore-robots-txt"
```

## 📊 Content Processing

### **HTML to Markdown Conversion**
- ✅ **Headers**: Converted to ATX style (# ## ###)
- ✅ **Links**: Inline style with titles preserved
- ✅ **Images**: Markdown image syntax with alt text
- ✅ **Code Blocks**: Fenced code blocks with language detection
- ✅ **Lists**: Bullet and numbered lists preserved
- ✅ **Tables**: Markdown table format maintained

### **Content Filtering**
- ✅ **Scripts Removed**: All JavaScript code eliminated
- ✅ **Styles Removed**: CSS and styling stripped
- ✅ **Navigation Removed**: Headers, footers, sidebars filtered
- ✅ **Ads Removed**: Advertisement content eliminated

## 🚦 Response Format

### **Standard Response**
```json
{
  "content": [{
    "type": "text",
    "text": "URL: https://example.com\nStatus: 200\nLength: 1500 characters\n\n# Page Title\n\nContent in markdown format..."
  }]
}
```

### **Search Response**
```json
{
  "content": [{
    "type": "text",
    "text": "Search Results for \"query\" using google\n\nFound 5 results:\n\n1. **Title 1**\n   URL: https://example1.com\n   Snippet: Description 1\n\n2. **Title 2**\n   URL: https://example2.com\n   Snippet: Description 2"
  }]
}
```

## 📈 Performance Features

### **Caching System**
```bash
✅ Response caching for repeated requests
✅ Metadata caching for efficiency
✅ Search history tracking
✅ Request optimization
```

### **Rate Limiting**
```bash
✅ Respectful request timing
✅ User agent rotation
✅ Timeout management
✅ Error retry logic
```

## 🎯 Use Cases

### **Research & Analysis**
```bash
✅ Market research and competitive analysis
✅ Technical documentation gathering
✅ Industry trends and news
✅ Best practices research
✅ Tutorial and guide collection
```

### **Content Processing**
```bash
✅ Blog post analysis and summarization
✅ Documentation conversion and indexing
✅ News article processing
✅ Research paper extraction
✅ Website content migration
```

### **Business Intelligence**
```bash
✅ Competitor website analysis
✅ Industry news monitoring
✅ Market trend research
✅ Supplier information gathering
✅ Regulatory documentation
```

## 🔄 Real-time Capabilities

- ✅ **Live Web Content**: Access current state of websites
- ✅ **Dynamic Search**: Real-time search engine results
- ✅ **Metadata Updates**: Current page metadata
- ✅ **Content Monitoring**: Track changes over time

## 📋 Integration with Kanban System

The fetch server integrates with other MCP servers to provide:

- **Production Research**: Industry best practices and trends
- **Competitor Analysis**: Market research and competitive intelligence
- **Documentation**: API docs, tutorials, and technical guides
- **News Monitoring**: Industry news and updates
- **Supplier Research**: Vendor information and capabilities

---

## 🎊 **Ready for Production!**

The Fetch MCP Server is now fully integrated with your Kanban system!

**Features:**
- ✅ 5 comprehensive web tools
- ✅ HTML to Markdown conversion
- ✅ Multi-engine search capabilities
- ✅ Security and compliance features
- ✅ Business intelligence integration
- ✅ Interactive research prompts

**Usage:** `npm run mcp:fetch`

**All Tools:** `npm run mcp:all`

**Your system can now research the web, analyze content, and gather business intelligence!** 🌐📊✨

---

## 📚 **Based on MCP Fetch Specification**

This implementation follows the official MCP fetch server specification with:

- **Content Fetching**: URL retrieval with HTML to Markdown conversion
- **Search Integration**: Multi-engine search capabilities
- **Security Features**: Robots.txt compliance and access control
- **Metadata Extraction**: Complete webpage metadata analysis
- **Business Integration**: Research and analysis capabilities
- **Performance Optimization**: Caching and efficient processing

**Perfect integration with your Kanban production system!** 🏭📈🚀
