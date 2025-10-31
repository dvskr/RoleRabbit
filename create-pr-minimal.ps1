$token = "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"

$body = @"
# Major Refactoring and Documentation Cleanup

## Summary
This PR includes comprehensive refactoring work:
- **407 files changed** (30,417 insertions, 28,678 deletions)
- Major component modularization (AIAgents, DashboardFigma, ResumeEditor, etc.)
- Complete documentation cleanup (removed 111 temporary .md files)
- Enhanced error handling

## Major Changes
- Modularized large components into reusable modules
- Extracted hooks and utilities
- Removed unused components and temporary docs
- Added comprehensive test coverage

See PR_DESCRIPTION.md for full details.
"@

$uri = "https://api.github.com/repos/dvskr/RoleReady-FullStack/pulls"

$data = @{
    title = "feat: Major refactoring and documentation cleanup"
    head = "dvskr:feature_pro_2"
    base = "main"
    body = $body
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
}

Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $data -ContentType "application/json" | ForEach-Object {
    Write-Host "✅ PR Created: $($_.html_url)" -ForegroundColor Green
    Start-Process $_.html_url
}

