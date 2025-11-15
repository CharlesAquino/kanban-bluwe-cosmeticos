# SQLite MCP Server - Kanban Production System

A Model Context Protocol (MCP) server implementation that provides comprehensive database interaction and business intelligence capabilities for the Kanban production system. This server enables SQL queries, data analysis, and automatic business insights generation through SQLite.

## 🚀 Features

### **Database Operations**
- ✅ Execute complex SQL queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ Create and manage database tables
- ✅ View table schemas and structures
- ✅ Real-time database statistics

### **Business Intelligence**
- ✅ Automatic production data analysis
- ✅ Efficiency metrics and KPIs
- ✅ Business insights memo system
- ✅ Production stage analysis
- ✅ Timeline and duration analysis

### **Interactive Prompts**
- ✅ Guided database exploration
- ✅ Business domain analysis
- ✅ Interactive data discovery

## 🛠️ Tools Available

### **Query Tools**
```bash
read_query      - Execute SELECT queries
write_query     - Execute INSERT/UPDATE/DELETE queries
create_table    - Create new database tables
```

### **Schema Tools**
```bash
list_tables     - Get all available tables
describe_table  - View table structure and columns
```

### **Analysis Tools**
```bash
append_insight        - Add business insights to memo
get_business_metrics  - Get KPIs and performance metrics
analyze_production_data - Comprehensive production analysis
```

## 📊 Resources

### **Dynamic Resources**
```bash
memo://insights     - Continuously updated business insights memo
database://schema   - Complete database schema documentation
database://metrics  - Real-time business metrics and KPIs
```

### **Interactive Prompts**
```bash
kanban-analysis     - Guided business analysis with topic selection
```

## 🎯 Usage Examples

### **Basic Database Operations**
```bash
# List all tables
list_tables

# View products table schema
describe_table {"table_name": "products"}

# Get all active products
read_query {"query": "SELECT * FROM products WHERE status = 'active'"}
```

### **Business Analysis**
```bash
# Analyze production efficiency
get_business_metrics {"metric_type": "efficiency"}

# Generate comprehensive production insights
analyze_production_data

# Add custom business insight
append_insight {"insight": "Q4 production efficiency improved by 15% due to process optimization"}
```

### **Interactive Analysis**
```bash
# Start guided analysis
kanban-analysis {"topic": "production"}

# This will guide you through:
# 1. Table exploration
# 2. Schema analysis
# 3. Data insights generation
# 4. Business recommendations
```

## 🔧 Configuration

### **Environment Variables**
```json
{
  "NODE_ENV": "development",
  "DATABASE_PATH": "./dev.db"
}
```

### **Package.json Scripts**
```bash
npm run mcp:sqlite    # Run SQLite MCP server
npm run mcp:all       # Run all MCP servers
npm run mcp:setup     # Setup all dependencies
```

## 🎨 Business Insights Memo

The server automatically maintains a business insights memo that updates as you analyze data:

```
# Business Insights Memo

## Sistema Kanban de Produção - Bluwe Cosméticos

### 📋 Insights Coletados

#### 1. 2025-01-25T10:30:00.000Z
📊 **Análise de Estágios de Produção:**
• backlog: 5 produtos (125.5kg total)
• producao_1kg: 3 produtos (75.2kg total)
• avaliacao_cor: 2 produtos (45.8kg total)

📈 **Tendência de Eficiência (últimos 7 dias):**
• 2025-01-24: 92.5% (8 controles)
• 2025-01-23: 88.3% (6 controles)

🎯 **Taxa de Conclusão:** 75.2% dos produtos foram completados
✅ Excelente taxa de conclusão!
```

## 🚀 Integration with AI

### **VS Code / Cursor Setup**
```json
{
  "mcp": {
    "servers": {
      "kanban-sqlite": {
        "command": "node",
        "args": ["src/mcp/sqlite-server.js"],
        "cwd": "C:/DEV/kanban-nextjs"
      }
    }
  }
}
```

### **Usage with Claude/GPT**
```bash
# The AI can now execute commands like:
"Analyze the production efficiency for the last week"
"Show me products in the evaluation stage"
"Generate a business insights report"
"Create a summary of production metrics"
```

## 📈 Automatic Insights

The server automatically generates insights including:

- **Production Stage Analysis**: Products distribution across stages
- **Efficiency Trends**: Daily efficiency tracking
- **Completion Rates**: Success metrics and recommendations
- **Timeline Analysis**: Process duration optimization
- **Quality Metrics**: Performance indicators

## 🔄 Real-time Updates

- **Live Data**: All queries access current database state
- **Dynamic Insights**: Memo updates as new data is analyzed
- **Interactive Analysis**: Guided exploration with AI assistance

## 📝 Sample Commands

### **Production Analysis**
```bash
# Get production overview
read_query {"query": "SELECT currentStage, COUNT(*) as count FROM products GROUP BY currentStage"}

# Analyze efficiency trends
read_query {"query": "SELECT DATE(date) as date, AVG(efficiency) as avg_eff FROM hourly_controls GROUP BY DATE(date) ORDER BY date DESC LIMIT 7"}
```

### **Business Intelligence**
```bash
# Generate insights automatically
analyze_production_data

# Get specific metrics
get_business_metrics {"metric_type": "production"}
```

---

## 🎊 **Ready to Use!**

The SQLite MCP server is now fully integrated with your Kanban system and ready for AI-assisted analysis!

**Start using:** `npm run mcp:sqlite`

**All servers:** `npm run mcp:all`

Your AI assistant can now analyze your production data, generate business insights, and help optimize your manufacturing processes! 🤖📊✨
