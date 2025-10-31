$token = "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"
$body = Get-Content "PR_DESCRIPTION.md" -Raw

$uri = "https://api.github.com/repos/dvskr/RoleReady-FullStack/pulls"

$data = @{
    title = "feat: Major refactoring and documentation cleanup"
    head = "dvskr:feature_pro_2"
    base = "main"
    body = $body
}

$json = $data | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $result = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $json -ContentType "application/json"
    Write-Host "Success! PR #$($result.number) created: $($result.html_url)"
    Start-Process $result.html_url
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

