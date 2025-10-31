# Direct GitHub API PR Creation
$owner = "dvskr"
$repo = "RoleReady-FullStack"
$base = "main"
$head = "feature_pro_2"
$title = "feat: Major refactoring and documentation cleanup"

# Read PR description
$body = Get-Content "PR_DESCRIPTION.md" -Raw

# GitHub API endpoint
$uri = "https://api.github.com/repos/$owner/$repo/pulls"

# PR payload
$prPayload = @{
    title = $title
    head = "$owner`:$head"
    base = $base
    body = $body
} | ConvertTo-Json -Depth 10

Write-Host "Creating PR via GitHub API..."
Write-Host "Owner: $owner"
Write-Host "Repo: $repo"
Write-Host "Head: $head"
Write-Host "Base: $base"
Write-Host ""

# Try to get token from environment or prompt
$token = $env:GITHUB_TOKEN

if (-not $token) {
    Write-Host "⚠️  GitHub token not found."
    Write-Host ""
    Write-Host "To create PR automatically, you need a GitHub Personal Access Token."
    Write-Host "1. Go to: https://github.com/settings/tokens"
    Write-Host "2. Generate new token (classic) with 'repo' scope"
    Write-Host "3. Run: `$env:GITHUB_TOKEN = 'your_token_here'`"
    Write-Host "4. Then run this script again"
    Write-Host ""
    Write-Host "Alternatively, use the direct PR creation URL:"
    Write-Host "https://github.com/$owner/$repo/compare/$base...$head?quick_pull=1&title=$([System.Web.HttpUtility]::UrlEncode($title))"
    Write-Host ""
    Write-Host "Or try this workaround - create PR manually by going to:"
    Write-Host "https://github.com/$owner/$repo/pulls/new"
    Write-Host "And selecting: base: $base ← compare: $head"
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

try {
    Write-Host "Sending request to GitHub API..."
    $response = Invoke-RestMethod -Uri $uri `
        -Method Post `
        -Headers $headers `
        -Body $prPayload `
        -ContentType "application/json"
    
    Write-Host ""
    Write-Host "✅ SUCCESS! PR created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "PR Number: #$($response.number)" -ForegroundColor Cyan
    Write-Host "PR URL: $($response.html_url)" -ForegroundColor Cyan
    Write-Host "PR Title: $($response.title)" -ForegroundColor Cyan
    Write-Host ""
    Start-Process $response.html_url
} catch {
    Write-Host ""
    Write-Host "❌ Error creating PR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Trying alternative method - opening manual PR creation..."
    Write-Host "https://github.com/$owner/$repo/compare/$base...$head"
    Start-Process "https://github.com/$owner/$repo/compare/$base...$head"
}

