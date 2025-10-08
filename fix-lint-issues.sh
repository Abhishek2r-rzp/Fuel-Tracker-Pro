#!/bin/bash

# Script to fix all linting issues systematically

echo "🔧 Fixing linting issues across the codebase..."

# Fix DateRangeFilter - remove unused ChevronDown
sed -i '' 's/  ChevronDown,//' apps/expense-tracker/src/components/DateRangeFilter.jsx

# Fix Analytics - remove unused DollarSign  
sed -i '' 's/, DollarSign//' apps/expense-tracker/src/pages/Analytics.jsx

# Fix Statements - remove unused imports
sed -i '' '/CardHeader,/d' apps/expense-tracker/src/pages/Statements.jsx
sed -i '' '/Badge,/d' apps/expense-tracker/src/pages/Statements.jsx

# Fix StatementDetail - remove unused Loader
sed -i '' '/Loader,/d' apps/expense-tracker/src/pages/StatementDetail.jsx

# Fix UploadStatement - remove unused imports
sed -i '' '/FileText,/d' apps/expense-tracker/src/pages/UploadStatement.jsx
sed -i '' '/getCategoryEmoji,/d' apps/expense-tracker/src/pages/UploadStatement.jsx

# Fix CreditCards - rename unused err to _err
sed -i '' 's/) catch (err) {/) catch (_err) {/' apps/expense-tracker/src/pages/CreditCards.jsx

# Fix unused error parameters across files
sed -i '' 's/.catch((error) => {/.catch(() => {/g' apps/expense-tracker/src/pages/BulkCategorize.jsx
sed -i '' 's/.catch((error) => {/.catch(() => {/g' apps/expense-tracker/src/pages/BulkTag.jsx
sed -i '' 's/.catch((error) => {/.catch(() => {/g' apps/expense-tracker/src/pages/Tags.jsx

# Fix categoryMappingService - rename unused key to _key
sed -i '' 's/for (const \[key, config\]/for (const \[_key, config\]/' apps/expense-tracker/src/services/categoryMappingService.js

echo "✅ Fixed unused variables and imports!"
echo "📝 Remaining issues require manual fixes (alerts, console statements, etc.)"

