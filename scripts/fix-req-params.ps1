# Remove `req` parameter from payload local API calls in API routes
# This is needed because passing NextRequest to payload.create/find/update/delete
# causes crashes in Payload 3 production due to circular reference serialization

$files = Get-ChildItem -Path "src/app/api" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Pattern 1: Remove standalone `req,` line before closing })
    # Matches: "      req,\n    })" and similar patterns
    $content = $content -replace '(\s+)req,\r?\n(\s+}\))', "`$1`$2"
    
    # Pattern 2: Remove `req,` after overrideAccess line
    $content = $content -replace '(overrideAccess:\s*true,)\r?\n\s+req,', '$1'
    
    # Pattern 3: Remove `req: rollbackReq,` lines
    $content = $content -replace '\r?\n\s+req:\s*rollbackReq,', ''

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "FIXED: $($file.FullName)"
    }
}

Write-Host "Done!"
