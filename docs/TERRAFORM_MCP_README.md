# Terraform MCP Server - Kanban Next.js

A Model Context Protocol (MCP) server implementation that provides comprehensive Terraform Registry API integration and Infrastructure as Code (IaC) capabilities. This server enables advanced automation and interaction with Terraform for development workflows.

## ⚠️ **Security Warning**

This server can access Terraform Enterprise/Cloud instances and may represent a security risk. Exercise caution when configuring TFE_TOKEN to ensure sensitive infrastructure data is not exposed.

## 🚀 Features

### **Terraform Registry Integration**
- ✅ **Provider Search**: Search and discover Terraform providers
- ✅ **Module Discovery**: Find and analyze Terraform modules
- ✅ **Version Management**: Provider and module version handling
- ✅ **Registry API**: Direct integration with public Terraform Registry

### **Workspace Management**
- ✅ **Workspace Operations**: Create, update, delete, and list workspaces
- ✅ **Run Management**: Create and monitor Terraform runs
- ✅ **Variable Handling**: Workspace variables and configurations
- ✅ **TFE Integration**: HCP Terraform & Terraform Enterprise support

### **Configuration Tools**
- ✅ **Configuration Generation**: Generate Terraform configurations
- ✅ **Validation**: Terraform configuration syntax validation
- ✅ **Plan Generation**: Create and analyze execution plans
- ✅ **Init Commands**: Generate terraform init commands

### **Security & Best Practices**
- ✅ **Policy Integration**: Terraform policy management
- ✅ **Compliance**: Security best practices and validation
- ✅ **Access Control**: Secure API token management
- ✅ **Audit Trail**: Operation logging and monitoring

## 🛠️ Available Tools (15 tools)

### **Registry Tools**
```bash
search_providers         - Search Terraform providers in registry
get_provider_details     - Get detailed provider information
search_modules           - Search Terraform modules in registry
get_module_details       - Get detailed module information
```

### **Workspace Management**
```bash
list_workspaces          - List Terraform workspaces
get_workspace_details    - Get workspace information
create_workspace         - Create new workspace
update_workspace         - Update existing workspace
```

### **Run Management**
```bash
list_runs               - List runs for a workspace
get_run_details         - Get detailed run information
create_run              - Create new Terraform run
```

### **Configuration Tools**
```bash
validate_configuration  - Validate Terraform syntax
terraform_init          - Generate terraform init commands
terraform_plan          - Generate terraform plan commands
generate_terraform_config - Generate Terraform configurations
```

## 📊 Resources

### **Dynamic Resources**
```bash
terraform://registry      - Terraform Registry API data
terraform://workspaces    - Current workspace information
terraform://best-practices - Terraform best practices guide
```

## 💬 Interactive Prompts (3 prompts)

### **Infrastructure Prompts**
```bash
terraform-setup         - Interactive Terraform infrastructure setup
terraform-optimization  - Optimize existing Terraform configurations
terraform-security      - Security analysis and best practices
```

## 🎯 Usage Examples

### **Provider Search and Discovery**
```bash
# Search for AWS providers
search_providers {"query": "aws", "limit": 5}

# Get specific provider details
get_provider_details {"namespace": "hashicorp", "name": "aws", "version": "5.0"}

# Search for VPC modules
search_modules {"query": "vpc networking", "provider": "aws", "limit": 3}
```

### **Workspace Management**
```bash
# List all workspaces
list_workspaces {}

# Create a new workspace
create_workspace {
  "name": "production-infrastructure",
  "description": "Production environment infrastructure",
  "terraform_version": "1.5.0",
  "tags": ["production", "infrastructure"]
}

# Update workspace
update_workspace {
  "workspace_id": "ws-123",
  "terraform_version": "1.6.0",
  "working_directory": "terraform/prod"
}
```

### **Run Management**
```bash
# List runs for a workspace
list_runs {"workspace_id": "ws-123", "page_size": 10}

# Create a new run
create_run {
  "workspace_id": "ws-123",
  "message": "Infrastructure update",
  "plan_only": true,
  "variables": {
    "environment": "production",
    "region": "us-east-1"
  }
}
```

### **Configuration Generation**
```bash
# Generate AWS EC2 instance configuration
generate_terraform_config {
  "resource_type": "aws_instance",
  "provider": "aws",
  "resource_name": "web_server",
  "configuration": {
    "ami": "ami-0c55b159cbfafe1d0",
    "instance_type": "t2.micro",
    "tags": {
      "Name": "WebServer",
      "Environment": "production"
    }
  }
}

# Validate configuration
validate_configuration {
  "configuration": "terraform {\n  required_providers {\n    aws = {\n      source = \"hashicorp/aws\"\n    }\n  }\n}\n\nresource \"aws_instance\" \"example\" {\n  ami = \"ami-123\"\n  instance_type = \"t2.micro\"\n}",
  "terraform_version": "1.5.0"
}
```

### **Infrastructure Setup**
```bash
# Start interactive setup
terraform-setup {"infrastructure_type": "aws"}

# This guides you through:
# 1. Provider discovery and selection
# 2. Module search and selection
# 3. Configuration generation
# 4. Workspace setup
# 5. Initial plan creation
```

## 🔒 Security Configuration

### **Environment Variables**
```bash
# Required for TFE/HCP Terraform
TFE_ADDRESS=https://app.terraform.io
TFE_TOKEN=your-terraform-token-here

# Optional security settings
TFE_SKIP_TLS_VERIFY=false
TRANSPORT_MODE=stdio
MCP_CORS_MODE=strict
```

### **Access Control**
```bash
# Restrict origins for HTTP transport
MCP_ALLOWED_ORIGINS=https://your-domain.com,https://trusted-domain.com

# Rate limiting
MCP_RATE_LIMIT_GLOBAL=10:20
MCP_RATE_LIMIT_SESSION=5:10

# TLS for production
MCP_TLS_CERT_FILE=/path/to/cert.pem
MCP_TLS_KEY_FILE=/path/to/key.pem
```

## 🚀 Integration with AI

### **VS Code / Cursor Setup**
```json
{
  "mcp": {
    "servers": {
      "kanban-terraform": {
        "command": "node",
        "args": ["src/mcp/terraform-server.js"],
        "cwd": "C:/DEV/kanban-nextjs",
        "env": {
          "TFE_TOKEN": "${input:tfe_token}",
          "TFE_ADDRESS": "${input:tfe_address}"
        }
      }
    },
    "inputs": [
      {
        "type": "promptString",
        "id": "tfe_token",
        "description": "Terraform API Token",
        "password": true
      },
      {
        "type": "promptString",
        "id": "tfe_address",
        "description": "Terraform Address",
        "password": false
      }
    ]
  }
}
```

### **AI Command Examples**
```bash
"Search for AWS providers in Terraform Registry"
"Create a new workspace for production infrastructure"
"Generate Terraform configuration for a web server"
"Validate my Terraform configuration syntax"
"Find modules for Kubernetes deployment"
"List all runs in the development workspace"
"Update workspace to use Terraform 1.6"
"Generate terraform init command for S3 backend"
"Search for security best practices modules"
"Create a plan for infrastructure changes"
```

## 📁 Project Integration

### **Infrastructure as Code**
```bash
# Generate complete infrastructure
terraform-setup {"infrastructure_type": "kubernetes"}

# Optimize existing configurations
terraform-optimization {"config_path": "./terraform/k8s"}

# Security analysis
terraform-security {"config_path": "./terraform/prod"}
```

### **Business Integration**
```bash
# Production infrastructure setup
create_workspace {
  "name": "production-kubernetes",
  "description": "Production Kubernetes cluster",
  "terraform_version": "1.6.0",
  "tags": ["production", "kubernetes", "critical"]
}

# Infrastructure planning
terraform_plan {
  "working_directory": "./terraform/production",
  "variables": {
    "cluster_name": "prod-cluster",
    "node_count": 3,
    "instance_type": "t3.medium"
  }
}
```

## 🎮 Available Scripts

```bash
npm run mcp:terraform    # Run terraform server only
npm run mcp:all          # Run all MCP servers
npm run mcp:setup        # Setup all dependencies
```

## 🔍 Advanced Features

### **Multi-Provider Support**
```bash
# Search across multiple providers
search_providers {"query": "database", "limit": 10}

# AWS specific modules
search_modules {"query": "rds mysql", "provider": "aws"}

# Azure infrastructure
search_modules {"query": "virtual machine", "provider": "azurerm"}
```

### **Version Management**
```bash
# Get latest provider version
get_provider_details {"namespace": "hashicorp", "name": "aws"}

# Specific version details
get_provider_details {"namespace": "hashicorp", "name": "kubernetes", "version": "2.25.0"}

# Module version compatibility
get_module_details {"namespace": "terraform-aws-modules", "name": "vpc", "provider": "aws", "version": "5.0"}
```

### **Configuration Templates**
```bash
# Generate VPC configuration
generate_terraform_config {
  "resource_type": "aws_vpc",
  "provider": "aws",
  "resource_name": "main",
  "configuration": {
    "cidr_block": "10.0.0.0/16",
    "enable_dns_hostnames": true,
    "enable_dns_support": true,
    "tags": {
      "Name": "MainVPC",
      "Environment": "production"
    }
  }
}

# Generate security group
generate_terraform_config {
  "resource_type": "aws_security_group",
  "provider": "aws",
  "resource_name": "web",
  "configuration": {
    "name": "web-access",
    "description": "Security group for web servers",
    "ingress": [{
      "from_port": 80,
      "to_port": 80,
      "protocol": "tcp",
      "cidr_blocks": ["0.0.0.0/0"]
    }],
    "tags": {
      "Name": "WebSecurityGroup"
    }
  }
}
```

## 📊 Registry API Integration

### **Provider Discovery**
```bash
# Comprehensive provider search
search_providers {"query": "monitoring", "namespace": "hashicorp"}

# Get provider documentation
get_provider_details {"namespace": "hashicorp", "name": "aws"}

# Provider version history
get_provider_details {"namespace": "hashicorp", "name": "kubernetes", "version": "2.24.0"}
```

### **Module Marketplace**
```bash
# Find production-ready modules
search_modules {"query": "eks cluster", "limit": 5}

# Get module usage examples
get_module_details {"namespace": "terraform-aws-modules", "name": "eks", "provider": "aws"}

# Module version selection
get_module_details {"namespace": "terraform-aws-modules", "name": "vpc", "provider": "aws", "version": "5.1.0"}
```

## 🔄 Terraform Enterprise Integration

### **Workspace Management**
```bash
# Organization workspaces
list_workspaces {"organization": "my-organization"}

# Project-specific workspaces
list_workspaces {"project": "infrastructure-project"}

# Detailed workspace info
get_workspace_details {"workspace_id": "ws-abc123", "organization": "my-org"}
```

### **Run Operations**
```bash
# Monitor runs
list_runs {"workspace_id": "ws-123"}

# Run details and status
get_run_details {"run_id": "run-456"}

# Execute infrastructure changes
create_run {
  "workspace_id": "ws-123",
  "message": "Security updates",
  "plan_only": false,
  "auto_apply": true
}
```

## 🎯 Infrastructure Types

### **Cloud Infrastructure**
```bash
✅ AWS (EC2, S3, RDS, VPC, EKS, Lambda)
✅ Azure (VM, Storage, SQL, VNet, AKS)
✅ GCP (Compute, Storage, SQL, VPC, GKE)
✅ DigitalOcean, Linode, Vultr
```

### **Container Orchestration**
```bash
✅ Kubernetes (EKS, AKS, GKE, self-hosted)
✅ Docker (ECS, ACI, GCR)
✅ Serverless (Lambda, Functions, Cloud Run)
```

### **Networking & Security**
```bash
✅ VPC, subnets, routing tables
✅ Security groups, firewalls, ACLs
✅ Load balancers, API gateways
✅ DNS, certificates, secrets management
```

## 📈 Performance & Monitoring

### **Plan Analysis**
```bash
# Generate execution plans
terraform_plan {
  "working_directory": "./terraform/production",
  "variables": {
    "environment": "prod",
    "region": "us-east-1"
  }
}

# Validate configurations
validate_configuration {
  "configuration": "complete terraform config here",
  "terraform_version": "1.6.0"
}
```

### **Resource Optimization**
```bash
# Right-sizing recommendations
terraform-optimization {"config_path": "./terraform"}

# Cost analysis
generate_terraform_config {
  "resource_type": "aws_instance",
  "resource_name": "optimized",
  "configuration": {
    "instance_type": "t3.medium",
    "monitoring": true,
    "tags": {"CostCenter": "optimized"}
  }
}
```

## 🔐 Security & Compliance

### **Policy Integration**
```bash
# List security policies
list_policies {"organization": "security-team"}

# Compliance validation
terraform-security {"config_path": "./terraform/production"}

# Secure configurations
generate_terraform_config {
  "resource_type": "aws_security_group",
  "resource_name": "compliant",
  "configuration": {
    "name": "compliant-access",
    "ingress": [{
      "from_port": 443,
      "to_port": 443,
      "protocol": "tcp",
      "cidr_blocks": ["10.0.0.0/8"],
      "description": "HTTPS from VPC only"
    }]
  }
}
```

## 🚦 Response Format

### **Standard Response**
```json
{
  "content": [{
    "type": "text",
    "text": "Terraform Providers Search for \"aws\"\nLimit: 5\nNamespace: hashicorp\n\nFound 3 providers:\n\n{\n  \"providers\": [\n    {\n      \"name\": \"aws\",\n      \"namespace\": \"hashicorp\",\n      \"version\": \"5.0.0\"\n    }\n  ]\n}"
  }]
}
```

### **Configuration Response**
```json
{
  "content": [{
    "type": "text",
    "text": "Terraform Configuration Generated\nResource: aws_instance\nProvider: aws\nName: web_server\n\n```terraform\nterraform {\n  required_providers {\n    aws = {\n      source  = \"hashicorp/aws\"\n      version = \"~> 5.0\"\n    }\n  }\n}\n\nprovider \"aws\" {\n  # Provider configuration\n}\n\nresource \"aws_instance\" \"web_server\" {\n  ami = \"ami-0c55b159cbfafe1d0\"\n  instance_type = \"t2.micro\"\n  tags = {\n    Name = \"WebServer\"\n    Environment = \"production\"\n  }\n}\n```"
  }]
}
```

## 📋 Integration with Kanban System

The Terraform server integrates with other MCP servers to provide:

- **Infrastructure Planning**: Design and plan infrastructure changes
- **Configuration Management**: Generate and validate Terraform configs
- **Workspace Organization**: Manage development and production environments
- **Run Monitoring**: Track infrastructure deployment status
- **Security Compliance**: Ensure configurations meet security standards
- **Cost Optimization**: Analyze and optimize infrastructure costs

---

## 🎊 **Ready for Infrastructure as Code!**

The Terraform MCP Server is now fully integrated with your Kanban system!

**Features:**
- ✅ 15 comprehensive Terraform tools
- ✅ Registry API integration
- ✅ Workspace and run management
- ✅ Configuration generation and validation
- ✅ Security and best practices
- ✅ Business intelligence integration

**Usage:** `npm run mcp:terraform`

**All Tools:** `npm run mcp:all`

**Your system can now manage infrastructure as code, deploy to any cloud, and maintain security compliance!** ☁️🏗️✨

---

## 📚 **Based on Terraform MCP Specification**

This implementation follows the official Terraform MCP server specification with:

- **Registry Integration**: Direct Terraform Registry API access
- **Workspace Management**: Complete HCP Terraform & TFE support
- **Run Operations**: Plan, apply, and monitor infrastructure changes
- **Security Features**: Policy management and compliance validation
- **Multi-Provider**: Support for AWS, Azure, GCP, and more
- **Best Practices**: Security, performance, and cost optimization

**Perfect integration with your Kanban production system!** 🏭📈🚀
