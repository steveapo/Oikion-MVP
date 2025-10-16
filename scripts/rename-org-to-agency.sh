#!/bin/bash

# Script to rename all "organization" references to "agency" across the codebase
# This script performs case-sensitive replacements to maintain proper naming conventions

echo "🔄 Starting organization → agency rename across codebase..."
echo ""

# Define the root directory
ROOT_DIR="/Users/stapo/Desktop/next-saas-stripe-starter-main"

# Function to replace in files
replace_in_files() {
    local pattern=$1
    local replacement=$2
    local description=$3
    
    echo "📝 $description"
    
    # Find and replace in TypeScript, TSX, JS, JSX files
    find "$ROOT_DIR" \
        -type f \
        \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/.next/*" \
        ! -path "*/dist/*" \
        ! -path "*/scripts/rename-org-to-agency.sh" \
        -exec sed -i '' "s/$pattern/$replacement/g" {} +
}

# Perform replacements in order (most specific first)
replace_in_files "organizationId" "agencyId" "  • Replacing organizationId → agencyId"
replace_in_files "organizationName" "agencyName" "  • Replacing organizationName → agencyName"
replace_in_files "Organization" "Agency" "  • Replacing Organization → Agency"
replace_in_files "organization" "agency" "  • Replacing organization → agency"  
replace_in_files "organizations" "agencies" "  • Replacing organizations → agencies"
replace_in_files "ORGANIZATION" "AGENCY" "  • Replacing ORGANIZATION → AGENCY"

echo ""
echo "✅ Replacement complete!"
echo ""
echo "⚠️  Please manually review:"
echo "  • Comments and documentation"
echo "  • String literals that shouldn't change"
echo "  • Configuration files"
echo ""
