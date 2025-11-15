# Filesystem MCP Server - Kanban Next.js

Node.js server implementing Model Context Protocol (MCP) for comprehensive filesystem operations. Based on the filesystem MCP server specification, this implementation provides complete file system access with security controls and business intelligence integration.

## 🚀 Features

### **File Operations**
- ✅ **Read Files**: Text files with head/tail options, media files with base64 encoding
- ✅ **Write Files**: Create new files or overwrite existing ones
- ✅ **Edit Files**: Advanced pattern matching with dry-run preview
- ✅ **Move/Rename**: Files and directories with path validation

### **Directory Operations**
- ✅ **Create Directories**: With automatic parent directory creation
- ✅ **List Directories**: With [FILE]/[DIR] prefixes and optional size sorting
- ✅ **Directory Trees**: Recursive JSON structure with exclude patterns
- ✅ **Search Files**: Glob-based pattern matching across directories

### **Security & Access Control**
- ✅ **Directory Restrictions**: Configurable allowed directories
- ✅ **Path Validation**: All operations checked against allowed paths
- ✅ **Roots Protocol**: Support for dynamic directory updates via MCP Roots
- ✅ **Access Monitoring**: Real-time directory access reporting

### **Metadata & Analysis**
- ✅ **File Info**: Complete metadata (size, dates, permissions, type)
- ✅ **Directory Statistics**: File counts, total sizes, summaries
- ✅ **Configuration Analysis**: Auto-detection of config files
- ✅ **Documentation Discovery**: Automatic markdown and doc detection

## 🛠️ Available Tools (13 tools)

### **File Reading Tools**
```bash
read_text_file              - Read text files with optional head/tail
read_media_file             - Read images/audio with base64 encoding
read_multiple_files         - Batch read multiple files simultaneously
```

### **File Writing Tools**
```bash
write_file                  - Create/overwrite files with content
edit_file                   - Advanced editing with pattern matching
```

### **Directory Tools**
```bash
create_directory            - Create directories with parent auto-creation
list_directory              - List contents with [FILE]/[DIR] prefixes
list_directory_with_sizes   - List with sizes and sorting options
```

### **File Management**
```bash
move_file                   - Move/rename files and directories
delete_file                 - Delete files (directories not implemented)
```

### **Search & Navigation**
```bash
search_files                - Recursive glob pattern search
directory_tree              - JSON tree structure of directories
```

### **Metadata Tools**
```bash
get_file_info               - Complete file/directory metadata
list_allowed_directories    - Show current access permissions
```

## 📊 Resources

### **Dynamic Resources**
```bash
filesystem://structure     - Complete project filesystem structure
filesystem://config        - All configuration files analysis
filesystem://documentation - All documentation files
```

### **Interactive Prompts**
```bash
filesystem-analysis        - Guided filesystem exploration
```

## 🔒 Directory Access Control

### **Method 1: Command Line Arguments**
```bash
# Allow specific directories
npm run mcp:filesystem /path/to/project /path/to/docs

# Allow current directory only
npm run mcp:filesystem .
```

### **Method 2: MCP Roots (Recommended)**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["src/mcp/filesystem-server.js"],
      "cwd": ".",
      "roots": ["/project", "/docs"]
    }
  }
}
```

## 🎯 Usage Examples

### **Basic File Operations**
```bash
# Read a configuration file
read_text_file {"path": "package.json"}

# Read first 20 lines of a file
read_text_file {"path": "README.md", "head": 20}

# List directory contents
list_directory {"path": "src"}

# List with sizes sorted by size
list_directory_with_sizes {"path": "src", "sortBy": "size"}
```

### **Advanced File Editing**
```bash
# Edit file with preview (dry run)
edit_file {
  "path": "config.js",
  "edits": [{
    "oldText": "const port = 3000",
    "newText": "const port = 3001"
  }],
  "dryRun": true
}

# Apply the edit
edit_file {
  "path": "config.js",
  "edits": [{
    "oldText": "const port = 3000",
    "newText": "const port = 3001"
  }]
}
```

### **Search and Analysis**
```bash
# Search for all TypeScript files
search_files {"path": ".", "pattern": "*.ts"}

# Find all configuration files
search_files {"path": ".", "pattern": "*config*"}

# Get directory tree
directory_tree {"path": "src"}

# Get file metadata
get_file_info {"path": "package.json"}
```

### **Project Analysis**
```bash
# Analyze configuration files
filesystem-analysis {"project_type": "nextjs"}

# This will guide you through:
# 1. Directory structure exploration
# 2. Configuration file analysis
# 3. Documentation discovery
# 4. Code organization review
```

## 🚀 Integration with AI

### **VS Code / Cursor Setup**
```json
{
  "mcp": {
    "servers": {
      "kanban-filesystem": {
        "command": "node",
        "args": ["src/mcp/filesystem-server.js", "."],
        "cwd": "C:/DEV/kanban-nextjs"
      }
    }
  }
}
```

### **AI Commands Examples**
```bash
"Analyze the project structure"
"Show me all configuration files"
"Find all TypeScript files in src"
"Read the main README file"
"List all dependencies"
"Show the directory tree"
"Find files larger than 1MB"
"Search for TODO comments"
"Edit the package.json version"
"Create a new component file"
```

## 📁 Project Integration

### **Allowed Directories Configuration**
```bash
# Current setup allows:
✅ Current project directory (.)
✅ All subdirectories
✅ Configuration files
✅ Source code
✅ Documentation
```

### **Security Features**
```bash
✅ Path validation on all operations
✅ Directory access restrictions
✅ Read-only operations by default
✅ Safe file operations with validation
```

## 🔍 Advanced Features

### **Pattern Matching**
```bash
# Search with exclude patterns
search_files {
  "path": ".",
  "pattern": "**/*.tsx",
  "excludePatterns": ["node_modules", ".next", "dist"]
}

# Directory tree with exclusions
directory_tree {
  "path": ".",
  "excludePatterns": ["node_modules", ".git", "*.log"]
}
```

### **Batch Operations**
```bash
# Read multiple files
read_multiple_files {
  "paths": [
    "package.json",
    "README.md",
    "src/app/page.tsx"
  ]
}
```

### **Metadata Analysis**
```bash
# Get detailed file info
get_file_info {"path": "src"}

# Directory statistics
list_directory_with_sizes {"path": "src", "sortBy": "size"}
```

## 📊 Business Intelligence Integration

The filesystem server integrates with the SQLite MCP server to provide:

- **Code Analysis**: Automatic analysis of code structure and organization
- **Configuration Review**: Complete setup and dependency analysis
- **Documentation Discovery**: Auto-detection of all documentation files
- **Project Metrics**: File counts, sizes, and organization metrics
- **Development Insights**: Best practices and improvement suggestions

## 🎮 Available Scripts

```bash
npm run mcp:filesystem    # Run filesystem server only
npm run mcp:all          # Run all MCP servers
npm run mcp:setup        # Setup all dependencies
```

## 📝 Configuration Files Auto-Detection

The server automatically identifies and analyzes:

- **Package Management**: package.json, package-lock.json, yarn.lock
- **TypeScript**: tsconfig.json, *.ts, *.tsx
- **Build Tools**: next.config.js, vite.config.js, webpack.config.js
- **Linting**: eslint.config.*, .eslintrc.*, prettier.config.*
- **Testing**: jest.config.js, playwright.config.ts, *.test.*, *.spec.*
- **Database**: prisma/schema.prisma, *.db, *.sqlite
- **Documentation**: README.md, *.md, docs/**/*, **/*.md

## 🔄 Real-time Capabilities

- **Live File System**: Access current state of all files
- **Dynamic Updates**: Immediate reflection of file changes
- **Interactive Analysis**: Guided exploration with AI assistance
- **Security Monitoring**: Real-time access control validation

---

## 🎊 **Ready for Production!**

The Filesystem MCP Server is now fully integrated with your Kanban system!

**Features:**
- ✅ 13 comprehensive filesystem tools
- ✅ Advanced security with access controls
- ✅ Business intelligence integration
- ✅ Interactive AI guidance
- ✅ Real-time file operations
- ✅ Complete project analysis

**Usage:** `npm run mcp:filesystem .`

**All Tools:** `npm run mcp:all`

**Your filesystem is now AI-accessible with enterprise-grade security!** 🔒🤖✨

---

## 📚 **Based on MCP Filesystem Specification**

This implementation follows the official MCP filesystem server specification with:

- **Roots Protocol Support**: Dynamic directory management
- **Security First**: Comprehensive access control
- **Tool Rich**: 13 specialized tools for all operations
- **Business Ready**: Integrated with project analysis
- **AI Optimized**: Designed for natural language interaction

**Perfect integration with your Kanban production system!** 📊🏭🚀
