#!/bin/bash
# Pre-commit Security Check
# Roda antes de cada commit para detectar segredos

set -e

echo "🔒 Running pre-commit security checks..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gitleaks is installed
if ! command -v gitleaks &> /dev/null; then
    echo -e "${YELLOW}⚠️  Gitleaks not installed. Installing...${NC}"
    if command -v brew &> /dev/null; then
        brew install gitleaks
    elif command -v apt-get &> /dev/null; then
        sudo apt-get install gitleaks
    else
        echo -e "${RED}❌ Please install gitleaks manually: https://github.com/gitleaks/gitleaks${NC}"
        exit 1
    fi
fi

# Run gitleaks
echo "🔍 Scanning for secrets with Gitleaks..."
if gitleaks protect --staged --verbose; then
    echo -e "${GREEN}✅ No secrets detected${NC}"
else
    echo -e "${RED}🚨 SECRETS DETECTED! Commit blocked.${NC}"
    echo -e "${YELLOW}Please remove the secrets and try again.${NC}"
    exit 1
fi

# Check for common patterns in staged files
echo "🔍 Checking for common secret patterns..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}✅ No files to check${NC}"
    exit 0
fi

FOUND_ISSUES=0

# Patterns to check
declare -A PATTERNS=(
    ["redis://.*:[^*]+@"]="Redis URL with password"
    ["postgresql://.*:[^*]+@"]="PostgreSQL URL with password"
    ["mongodb://.*:[^*]+@"]="MongoDB URL with password"
    ["sk-[a-zA-Z0-9]{48}"]="OpenAI API Key"
    ["ghp_[a-zA-Z0-9]{36}"]="GitHub Personal Access Token"
    ["AKIA[0-9A-Z]{16}"]="AWS Access Key"
)

for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        for pattern in "${!PATTERNS[@]}"; do
            if grep -qE "$pattern" "$file" 2>/dev/null; then
                # Check if it's a placeholder
                if ! grep -qE "\*\*\*|COPIE_DO|sua-chave|seu_token|example" "$file" 2>/dev/null; then
                    echo -e "${RED}❌ Found ${PATTERNS[$pattern]} in: $file${NC}"
                    FOUND_ISSUES=1
                fi
            fi
        done
    fi
done

if [ $FOUND_ISSUES -eq 1 ]; then
    echo -e "${RED}🚨 SECURITY ISSUE: Potential secrets found!${NC}"
    echo -e "${YELLOW}Please review the files above and remove any sensitive data.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All security checks passed!${NC}"
exit 0
