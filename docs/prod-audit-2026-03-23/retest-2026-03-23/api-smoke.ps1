$base = "https://nextacademyedu.com"
$results = @()

function Test-Endpoint {
    param($Name, $Method, $Url, $Body, $Headers, $ExpectedStatus)
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        if ($Body) { $params.Body = $Body }
        if ($Headers) { $params.Headers = $Headers }
        if ($Body) { $params.ContentType = "application/json" }
        
        $resp = Invoke-WebRequest @params
        $status = $resp.StatusCode
        $content = $resp.Content.Substring(0, [Math]::Min(300, $resp.Content.Length))
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if (-not $status) { $status = "ERR" }
        try { 
            $sr = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $content = $sr.ReadToEnd().Substring(0, [Math]::Min(300, 9999))
        } catch { $content = $_.Exception.Message.Substring(0, [Math]::Min(300, $_.Exception.Message.Length)) }
    }
    $pass = if ($ExpectedStatus -eq $status) { "PASS" } else { "FAIL" }
    Write-Host "$pass | $Name | Status=$status (expected=$ExpectedStatus) | $content"
    return [PSCustomObject]@{Name=$Name;Status=$status;Expected=$ExpectedStatus;Pass=$pass;Response=$content}
}

Write-Host "=== F: API SMOKE TESTS ==="

# F1: Public endpoints
Test-Endpoint -Name "Homepage /ar" -Method GET -Url "$base/ar" -ExpectedStatus 200
Test-Endpoint -Name "Homepage /en" -Method GET -Url "$base/en" -ExpectedStatus 200
Test-Endpoint -Name "Programs listing /ar/programs" -Method GET -Url "$base/ar/programs" -ExpectedStatus 200
Test-Endpoint -Name "API programs/public" -Method GET -Url "$base/api/programs/public" -ExpectedStatus 200

# F2: Auth-required endpoints (should 401/403 without token)
Test-Endpoint -Name "Bookings create (no auth, no origin)" -Method POST -Url "$base/api/bookings/create" -Body '{"roundId":1}' -ExpectedStatus 401
Test-Endpoint -Name "User profile (no auth)" -Method GET -Url "$base/api/users/me" -ExpectedStatus 401

Write-Host ""
Write-Host "=== E: SECURITY TESTS ==="

# E1: Role escalation via user signup
Test-Endpoint -Name "Signup with role=admin" -Method POST -Url "$base/api/users" -Body '{"email":"escalation-test@test.com","password":"Test12345!","name":"EscTest","phone":"01234567890","role":"admin"}' -Headers @{Origin="https://nextacademyedu.com"} -ExpectedStatus 201

# E2: CSRF - cross-origin POST to login
Test-Endpoint -Name "CSRF: Login from evil origin" -Method POST -Url "$base/api/users/login" -Body '{"email":"t@t.com","password":"x"}' -Headers @{Origin="https://evil.com"} -ExpectedStatus 403

# E2b: CSRF - cross-origin POST to booking
Test-Endpoint -Name "CSRF: Booking from evil origin" -Method POST -Url "$base/api/bookings/create" -Body '{"roundId":1}' -Headers @{Origin="https://evil.com"} -ExpectedStatus 403

# E3: OTP rate limiting (fire 6 rapid requests)
Write-Host ""
Write-Host "--- E3: OTP brute-force rate limit test ---"
for ($i=1; $i -le 6; $i++) {
    Test-Endpoint -Name "OTP attempt $i" -Method POST -Url "$base/api/auth/verify-otp" -Body "{`"email`":`"ratelimit-test@test.com`",`"otp`":`"00000$i`"}" -Headers @{Origin="https://nextacademyedu.com"} -ExpectedStatus 400
}

# E5: Check error responses don't leak stage info
Test-Endpoint -Name "Error leak check: bad booking" -Method POST -Url "$base/api/bookings/create" -Body '{"roundId":"invalid"}' -Headers @{Origin="https://nextacademyedu.com"} -ExpectedStatus 400

# E6: Cookie behavior - login sets proper cookie
Write-Host ""
Write-Host "--- E6: Cookie check on login response ---"
try {
    $loginResp = Invoke-WebRequest -Uri "$base/api/users/login" -Method POST -Body '{"email":"a@b.com","password":"x"}' -ContentType "application/json" -Headers @{Origin="https://nextacademyedu.com"} -UseBasicParsing -ErrorAction Stop
} catch {
    $loginResp = $_.Exception.Response
    Write-Host "Login (invalid creds) status: $($loginResp.StatusCode.value__)"
    $setCookie = $loginResp.Headers["Set-Cookie"]
    if ($setCookie) {
        Write-Host "Set-Cookie present: YES (checking for payload-token)"
        Write-Host "Set-Cookie value: $setCookie"
    } else {
        Write-Host "Set-Cookie present: NO (expected for failed login)"
    }
}

Write-Host ""
Write-Host "=== DONE ==="
