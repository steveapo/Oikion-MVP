#!/bin/bash

# i18n Setup Verification Script
# Run this script to verify i18n implementation is complete

echo "🌍 Oikion MVP - i18n Setup Verification"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 - MISSING"
        ((ERRORS++))
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ - MISSING"
        ((ERRORS++))
    fi
}

echo "1️⃣  Checking Translation Files..."
echo "-----------------------------------"
check_dir "messages"
check_dir "messages/en"
check_dir "messages/el"

EN_FILES=("common" "dashboard" "properties" "relations" "oikosync" "members" "billing" "settings" "navigation" "validation" "errors")
for file in "${EN_FILES[@]}"; do
    check_file "messages/en/$file.json"
    check_file "messages/el/$file.json"
done
echo ""

echo "2️⃣  Checking Configuration Files..."
echo "-----------------------------------"
check_file "i18n.ts"
check_file "next.config.js"
check_file "middleware.ts"
check_file "package.json"
echo ""

echo "3️⃣  Checking Utility Files..."
echo "-----------------------------------"
check_file "lib/i18n-utils.ts"
check_file "actions/locale.ts"
check_file "types/i18n.d.ts"
echo ""

echo "4️⃣  Checking Components..."
echo "-----------------------------------"
check_file "components/shared/language-switcher.tsx"
echo ""

echo "5️⃣  Checking Scripts..."
echo "-----------------------------------"
check_file "scripts/validate-translations.mjs"
echo ""

echo "6️⃣  Checking Database Migration..."
echo "-----------------------------------"
check_file "prisma/schema.prisma"
check_dir "prisma/migrations/20251018_add_preferred_locale"
check_file "prisma/migrations/20251018_add_preferred_locale/migration.sql"
echo ""

echo "7️⃣  Checking Documentation..."
echo "-----------------------------------"
check_file "I18N_README.md"
check_file "I18N_QUICKSTART.md"
check_file "I18N_SETUP_SUMMARY.md"
check_file "I18N_DEPLOYMENT_CHECKLIST.md"
check_file "docs/I18N_IMPLEMENTATION.md"
echo ""

echo "8️⃣  Checking package.json Dependencies..."
echo "-----------------------------------"
if grep -q "next-intl" package.json; then
    echo -e "${GREEN}✓${NC} next-intl listed in package.json"
else
    echo -e "${RED}✗${NC} next-intl NOT found in package.json"
    ((ERRORS++))
fi

if grep -q "validate:i18n" package.json; then
    echo -e "${GREEN}✓${NC} validate:i18n script configured"
else
    echo -e "${RED}✗${NC} validate:i18n script NOT configured"
    ((ERRORS++))
fi
echo ""

echo "9️⃣  Checking Build Script..."
echo "-----------------------------------"
if grep -q "pnpm validate:i18n" package.json; then
    echo -e "${GREEN}✓${NC} Build script includes validation"
else
    echo -e "${YELLOW}⚠${NC} Build script does not include validation"
    ((WARNINGS++))
fi
echo ""

echo "🔟 Checking Prisma Schema..."
echo "-----------------------------------"
if grep -q "preferredLocale" prisma/schema.prisma; then
    echo -e "${GREEN}✓${NC} preferredLocale field exists in schema"
else
    echo -e "${RED}✗${NC} preferredLocale field NOT found in schema"
    ((ERRORS++))
fi
echo ""

# Summary
echo "========================================"
echo "Summary:"
echo "========================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: pnpm install"
    echo "2. Run: npx prisma migrate deploy"
    echo "3. Run: pnpm validate:i18n"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Setup complete with ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: pnpm install"
    echo "2. Run: npx prisma migrate deploy"
    echo "3. Run: pnpm validate:i18n"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Setup incomplete: ${ERRORS} error(s), ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Please review the errors above and ensure all files are created."
    exit 1
fi
