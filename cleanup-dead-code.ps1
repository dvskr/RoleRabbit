# Cleanup Script for Dead Code from Claude Merges
# Based on analysis in CLAUDE_MERGES_ANALYSIS_AND_CLEANUP_PLAN.md
# Run this script from the project root

param(
    [switch]$DryRun = $false,
    [switch]$Phase1Only = $false,
    [switch]$Phase2Only = $false,
    [switch]$Phase3Only = $false
)

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Dead Code Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be deleted" -ForegroundColor Yellow
    Write-Host ""
}

$deletedCount = 0
$savedSpace = 0

function Remove-ItemSafe {
    param([string]$Path, [string]$Description)
    
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($size / 1MB, 2)
        
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would delete: $Description ($sizeMB MB)" -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Deleting: $Description ($sizeMB MB)" -ForegroundColor Red
            Remove-Item -Path $Path -Recurse -Force
            $script:deletedCount++
            $script:savedSpace += $size
        }
    } else {
        Write-Host "  ⚠️  Not found: $Path" -ForegroundColor DarkGray
    }
}

# ============================================================================
# PHASE 1: Remove Unused Portfolio Code from PR #58
# ============================================================================

if (-not $Phase2Only -and -not $Phase3Only) {
    Write-Host "📦 PHASE 1: Removing Unused Portfolio Code" -ForegroundColor Cyan
    Write-Host "──────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "1. Database migrations (incompatible schema)..." -ForegroundColor White
    Remove-ItemSafe "apps/web/src/database/migrations" "Database migrations"
    Remove-ItemSafe "apps/web/src/database/client.ts" "Database client"
    Remove-ItemSafe "apps/web/src/database/types.ts" "Database types"
    Write-Host ""

    Write-Host "2. Unused Portfolio API routes..." -ForegroundColor White
    Remove-ItemSafe "apps/web/src/app/api/portfolios" "Portfolio API routes"
    Remove-ItemSafe "apps/web/src/app/api/shares" "Share API routes"
    Remove-ItemSafe "apps/web/src/app/api/templates" "Templates API routes"
    Remove-ItemSafe "apps/web/src/app/api/subdomains" "Subdomains API routes"
    Write-Host ""

    Write-Host "3. Unused services..." -ForegroundColor White
    Remove-ItemSafe "apps/web/src/services/portfolio.service.ts" "Portfolio service"
    Remove-ItemSafe "apps/web/src/services/template.service.ts" "Template service"
    Remove-ItemSafe "apps/web/src/services/version.service.ts" "Version service"
    Remove-ItemSafe "apps/web/src/services/export.service.ts" "Export service"
    Remove-ItemSafe "apps/web/src/services/import.service.ts" "Import service"
    Remove-ItemSafe "apps/web/src/services/deployment.service.ts" "Deployment service"
    Remove-ItemSafe "apps/web/src/services/build.service.ts" "Build service"
    Remove-ItemSafe "apps/web/src/services/analytics.service.ts" "Analytics service"
    Write-Host ""

    Write-Host "4. Unused library code..." -ForegroundColor White
    Remove-ItemSafe "apps/web/src/lib/queue" "Queue library"
    Remove-ItemSafe "apps/web/src/lib/storage" "Storage library"
    Remove-ItemSafe "apps/web/src/lib/cdn" "CDN library"
    Remove-ItemSafe "apps/web/src/lib/dns" "DNS library"
    Remove-ItemSafe "apps/web/src/lib/integrations" "Integrations library"
    Remove-ItemSafe "apps/web/src/lib/jobs" "Jobs library"
    Remove-ItemSafe "apps/web/src/lib/builder" "Builder library"
    Write-Host ""

    Write-Host "5. Unused components..." -ForegroundColor White
    Remove-ItemSafe "apps/web/src/components/portfolio" "Portfolio components (NOT portfolio-generator)"
    Remove-ItemSafe "apps/web/src/components/wizard" "Wizard components"
    Remove-ItemSafe "apps/web/src/components/validation" "Validation components"
    Remove-ItemSafe "apps/web/src/components/statePersistence" "State persistence components"
    Remove-ItemSafe "apps/web/src/components/CookieConsent.tsx" "Cookie consent component"
    Remove-ItemSafe "apps/web/src/components/accessibility" "Accessibility components"
    Remove-ItemSafe "apps/web/src/components/empty-state" "Empty state components"
    Write-Host ""

    Write-Host "6. Example code (not used in production)..." -ForegroundColor White
    Remove-ItemSafe "apps/web/src/examples" "Example code"
    Write-Host ""

    Write-Host "7. Unused stores..." -ForegroundColor White
    Remove-ItemSafe "apps/web/src/stores/portfolioStore.ts" "Portfolio store"
    Write-Host ""

    Write-Host "8. Moderation/Privacy features (no frontend integration)..." -ForegroundColor White
    Write-Host "  ⚠️  Skipping for manual review: apps/web/src/pages/api/abuse/" -ForegroundColor Yellow
    Write-Host "  ⚠️  Skipping for manual review: apps/web/src/pages/api/admin/" -ForegroundColor Yellow
    Write-Host "  ⚠️  Skipping for manual review: apps/web/src/lib/moderation/" -ForegroundColor Yellow
    Write-Host "  (Review these manually - they have backend code but no frontend UI)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# PHASE 2: Consolidate Documentation
# ============================================================================

if (-not $Phase1Only -and -not $Phase3Only) {
    Write-Host "📚 PHASE 2: Consolidating Documentation" -ForegroundColor Cyan
    Write-Host "──────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host ""

    $docsToDelete = @(
        "ACCESSIBILITY_VERIFICATION_REPORT.md",
        "ALL_REMAINING_WORK_COMPLETE.md",
        "BACKEND_API_VERIFICATION.md",
        "BE_059_TO_066_IMPLEMENTATION.md",
        "CHECKLIST_REVALIDATION_COMPLETE.md",
        "CHECKLIST_UPDATE_1.3_1.4.md",
        "CHECKLIST_VALIDATION_REPORT.md",
        "CLIENT_SIDE_VALIDATION_IMPLEMENTATION.md",
        "COMPLETE_IMPLEMENTATION_FINAL.md",
        "COMPLETE_IMPLEMENTATION_SUMMARY.md",
        "COMPLETE_PRODUCTION_CHECKLIST_SUMMARY.md",
        "COMPLETE_PRODUCTION_IMPLEMENTATION.md",
        "COMPLETE_PRODUCTION_READY_FINAL.md",
        "COMPLETE_PRODUCTION_READY_SUMMARY.md",
        "COMPLETE_PRODUCTION_SECURITY_IMPLEMENTATION.md",
        "COMPLETION_SUMMARY.md",
        "DB_001_TO_040_IMPLEMENTATION.md",
        "DB_041_TO_065_COMPLETION.md",
        "DEPENDENCY_FIXES_COMPLETE.md",
        "ERROR_HANDLING_VERIFICATION.md",
        "FINAL_COMPLETE_SUMMARY.md",
        "FINAL_COMPLETION_REPORT.md",
        "FINAL_COMPLETION_SUMMARY.md",
        "FINAL_DEPLOYMENT_SUMMARY.md",
        "FINAL_RESUME_BUILDER_ANALYSIS.md",
        "FINAL_STATUS.md",
        "FULL_IMPLEMENTATION_STATUS.md",
        "IMPLEMENTATION_COMPLETE.md",
        "IMPLEMENTATION_PROGRESS.md",
        "IMPLEMENTATION_SESSION_SUMMARY.md",
        "IMPLEMENTATION_SUMMARY.md",
        "INFRA_001_TO_029_COMPLETION.md",
        "INTEGRATION_COMPLETION_SUMMARY.md",
        "LOADING_STATES_VERIFICATION.md",
        "MERGE_SUCCESS_SUMMARY.md",
        "MIGRATION_COMPLETE.md",
        "MIGRATIONS_COMPLETE.md",
        "MISSING_IMPLEMENTATIONS.md",
        "MY_FILES_COMPLETE_STATUS.md",
        "MY_FILES_CRITICAL_GAPS.md",
        "MY_FILES_FINAL_FIXES.md",
        "MY_FILES_FINAL_REANALYSIS.md",
        "MY_FILES_FULL_STACK_ANALYSIS.md",
        "MY_FILES_FULL_STACK_REANALYSIS.md",
        "MY_FILES_GAP_ANALYSIS.md",
        "MY_FILES_REANALYSIS_SUMMARY.md",
        "MY_FILES_REANALYSIS.md",
        "P1_FEATURES_PROGRESS.md",
        "P1_IMPLEMENTATION_COMPLETE.md",
        "P1_IMPLEMENTATION_SUMMARY.md",
        "P2_IMPLEMENTATION_COMPLETE.md",
        "PERFORMANCE_OPTIMIZATION_COMPLETE.md",
        "PORTFOLIO_API_IMPLEMENTATION_PROOF.md",
        "PORTFOLIO_IMPLEMENTATION_PLAN.md",
        "PORTFOLIO_MANAGEMENT.md",
        "PORTFOLIO_VALIDATION_GUIDE.md",
        "PORTFOLIO_VALIDATION_VERIFICATION.md",
        "POST_MERGE_CHECKLIST.md",
        "PRODUCTION_READINESS_COMPLETE.md",
        "PRODUCTION_READINESS_STATUS.md",
        "README_SECURITY_IMPLEMENTATION.md",
        "REMAINING_WORK_COMPLETE.md",
        "REMAINING_WORK_COMPLETION_STATUS.md",
        "REMAINING_WORK_STATUS.md",
        "RESUME_BUILDER_COMPLETE_STATUS.md",
        "RESUME_BUILDER_DATABASE_SCHEMA.md",
        "RESUME_BUILDER_INCONSISTENCIES_ANALYSIS.md",
        "RESUME_BUILDER_PRODUCTION_CHECKLIST.md",
        "RESUME_BUILDER_USER_JOURNEYS.md",
        "SAFE_LOGGING_INTEGRATION_GUIDE.md",
        "SEC_001_TO_025_COMPLETION.md",
        "SECTION_1.6_COMPLETE.md",
        "SECTION_2.11_VERIFICATION.md",
        "SECTION_3_DATABASE_COMPLETE.md",
        "SECTION_3.4_TO_3.6_COMPLETE.md",
        "SECTION_4.1_AND_4.2_COMPLETE.md",
        "SECTION_4.3_TO_4.6_COMPLETE.md",
        "SECTION_5.1_UNIT_TESTS_COMPLETE.md",
        "SECTION_5.2_AND_5.3_TESTS_COMPLETE.md",
        "SECTION_5.4_AND_5.5_COMPLETE.md",
        "SECTION_6_DEPLOYMENT_INSTRUCTIONS.md",
        "SECTION_6_SECURITY_COMPLETE.md",
        "SECTION_6_SECURITY_PRIVACY_COMPLIANCE_COMPLETE.md",
        "SECTIONS_1.7_AND_2.1_FINAL_SUMMARY.md",
        "SECTIONS_1.7_AND_2.1_IMPLEMENTATION_PLAN.md",
        "SECTIONS_1.7_AND_2.1_STATUS.md",
        "SECTIONS_2.12-2.14_README.md",
        "SECTIONS_2.2_AND_2.3_COMPLETE.md",
        "SECTIONS_2.4_AND_2.5_COMPLETE.md",
        "SECTIONS_2.6_2.7_2.8_COMPLETE.md",
        "SECTIONS_2.6_2.7_2.8_VERIFICATION.md",
        "SECTIONS_2.9_2.10_VERIFICATION.md",
        "STATE_MANAGEMENT_AND_API_IMPROVEMENTS_COMPLETE.md",
        "STATE_PERSISTENCE.md",
        "STATUS_AT_A_GLANCE.md",
        "TEMPLATES_TAB_ISSUES_CHECKLIST.md",
        "TEST_001_TO_043_COMPLETION.md",
        "TEST_RESULTS_SUMMARY.md",
        "TESTING_IMPLEMENTATION_COMPLETE.md",
        "TODO_REMAINING_TASKS.md",
        "UI_UX_ENHANCEMENTS_COMPLETE.md",
        "VALIDATION_AND_TESTING_FINAL_SUMMARY.md",
        "VALIDATION_IMPLEMENTATION_COMPLETE.md",
        "VALIDATION_IMPLEMENTATION_GUIDE.md",
        "WARNINGS_FIXED.md"
    )

    Write-Host "Removing duplicate/outdated documentation files..." -ForegroundColor White
    foreach ($doc in $docsToDelete) {
        Remove-ItemSafe $doc "Documentation: $doc"
    }
    Write-Host ""

    Write-Host "  ⚠️  KEEP these important docs:" -ForegroundColor Green
    Write-Host "    - ACTIVATION_GUIDE.md" -ForegroundColor Green
    Write-Host "    - QUICK_START_CHECKLIST.md" -ForegroundColor Green
    Write-Host "    - DEVELOPER_QUICK_START.md" -ForegroundColor Green
    Write-Host "    - DEPLOYMENT_GUIDE.md" -ForegroundColor Green
    Write-Host "    - CONTRIBUTING.md" -ForegroundColor Green
    Write-Host "    - docs/ folder" -ForegroundColor Green
    Write-Host ""
}

# ============================================================================
# PHASE 3: Clean Up Test/Build Artifacts
# ============================================================================

if (-not $Phase1Only -and -not $Phase2Only) {
    Write-Host "🧹 PHASE 3: Cleaning Build Artifacts" -ForegroundColor Cyan
    Write-Host "──────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Removing temporary/test files..." -ForegroundColor White
    Remove-ItemSafe "temp-check-resume.js" "Temp script"
    Remove-ItemSafe "temp-resume.txt" "Temp file"
    Remove-ItemSafe "check-resumes-db.js" "Temp script"
    Remove-ItemSafe "cookiejar.txt" "Cookie jar"
    Remove-ItemSafe "cookies.txt" "Cookies file"
    Remove-ItemSafe "test-results.json" "Test results"
    Remove-ItemSafe "test-share-complete.js" "Test script"
    Remove-ItemSafe "parse-response.json" "Parse response"
    Remove-ItemSafe "sample_resume.txt" "Sample resume"
    Remove-ItemSafe "server_err.txt" "Server error log"
    Remove-ItemSafe "server_out.txt" "Server output log"
    Write-Host ""
}

# ============================================================================
# Summary
# ============================================================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Cleanup Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN COMPLETE - No files were actually deleted" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To perform the actual cleanup, run:" -ForegroundColor White
    Write-Host "  .\cleanup-dead-code.ps1" -ForegroundColor Cyan
} else {
    $savedMB = [math]::Round($savedSpace / 1MB, 2)
    Write-Host "✅ Cleanup complete!" -ForegroundColor Green
    Write-Host "   Items deleted: $deletedCount" -ForegroundColor White
    Write-Host "   Space saved: $savedMB MB" -ForegroundColor White
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes" -ForegroundColor White
Write-Host "2. Run tests: npm test" -ForegroundColor White
Write-Host "3. Test the app: npm run dev" -ForegroundColor White
Write-Host "4. Commit if everything works" -ForegroundColor White
Write-Host ""
Write-Host "For detailed analysis, see: CLAUDE_MERGES_ANALYSIS_AND_CLEANUP_PLAN.md" -ForegroundColor Cyan
Write-Host ""

