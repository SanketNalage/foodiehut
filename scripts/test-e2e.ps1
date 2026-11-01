# scripts/test-e2e.ps1
# End-to-End API Integration & Verification Test Suite

param (
    [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         FOODIEHUT - END-TO-END VERIFICATION TEST         " -ForegroundColor Cyan
Write-Host "         Target URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

function Call-Api {
    param(
        [Parameter(Mandatory=$true)][string]$Method,
        [Parameter(Mandatory=$true)][string]$Endpoint,
        $Body = $null,
        [string]$Token = ""
    )

    $headers = @{}
    if ($Token -ne "") {
        $headers["Authorization"] = "Bearer $Token"
    }

    $uri = "$BaseUrl$Endpoint"

    if ($Method -eq "GET") {
        return Invoke-RestMethod -Uri $uri -Method GET -Headers $headers -UseBasicParsing
    }

    $jsonBody = $Body | ConvertTo-Json -Depth 5
    $headers["Content-Type"] = "application/json"
    return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody -UseBasicParsing
}

# 1. Categories Check
Write-Host "`n[Step 1/11] Checking default categories API..." -ForegroundColor Yellow
$catResp = Call-Api -Method "GET" -Endpoint "/api/categories"
$catCount = $catResp.data.Count
Write-Host "  Categories loaded: $catCount found." -ForegroundColor Green

# 2. Canteen Owner Registration
$uniqueId = Get-Random -Minimum 1000 -Maximum 9999
$canteenEmail = "canteen${uniqueId}@campus.edu"
$canteenPhone = "+91987654$uniqueId"
Write-Host "`n[Step 2/11] Registering Canteen Owner: $canteenEmail" -ForegroundColor Yellow
$canteenRegBody = @{
    ownerName = "Chef Gordon"
    canteenName = "Campus Delights $uniqueId"
    email = $canteenEmail
    phone = $canteenPhone
    description = "Authentic fresh meals"
    address = "Building 3, 1st Floor"
}
$canteenRegResp = Call-Api -Method "POST" -Endpoint "/api/auth/canteen/register" -Body $canteenRegBody
$canteenCode = $canteenRegResp.data.canteenCode
Write-Host "  Registered! Assigned Canteen Code: $canteenCode" -ForegroundColor Green

# 3. Canteen OTP Verification
Write-Host "`n[Step 3/11] Verifying Canteen Owner OTP with code 123456..." -ForegroundColor Yellow
$canteenOtpBody = @{
    contact = $canteenEmail
    otp = "123456"
    role = "ROLE_CANTEEN_OWNER"
}
$canteenAuthResp = Call-Api -Method "POST" -Endpoint "/api/auth/canteen/verify-otp" -Body $canteenOtpBody
$canteenToken = $canteenAuthResp.data.token
Write-Host "  Authenticated! JWT acquired for Canteen Owner." -ForegroundColor Green

# 4. Add Food Item
Write-Host "`n[Step 4/11] Adding food item to canteen menu..." -ForegroundColor Yellow
$catId = $catResp.data[0].id
$foodBody = @{
    name = "Paneer Butter Masala"
    description = "Rich cottage cheese in creamy tomato gravy"
    categoryId = $catId
    price = 140.00
    preparationTime = 12
    isVeg = $true
    available = $true
}
$foodResp = Call-Api -Method "POST" -Endpoint "/api/canteens/me/foods" -Body $foodBody -Token $canteenToken
$foodId = $foodResp.data.id
$foodName = $foodResp.data.name
$foodPrice = $foodResp.data.price
Write-Host "  Food created: ID $foodId - $foodName at Rs $foodPrice" -ForegroundColor Green

# 5. Student Registration
$studentEmail = "student${uniqueId}@college.edu"
$studentPhone = "+91912345$uniqueId"
Write-Host "`n[Step 5/11] Registering Student: $studentEmail" -ForegroundColor Yellow
$studentRegBody = @{
    fullName = "Rohan Sharma"
    email = $studentEmail
    phone = $studentPhone
    college = "IIT Bombay"
    studentIdNumber = "21CS$uniqueId"
    section = "A1"
}
$studentRegResp = Call-Api -Method "POST" -Endpoint "/api/auth/student/register" -Body $studentRegBody
$studentCode = $studentRegResp.data.studentCode
Write-Host "  Registered! Assigned Student Code: $studentCode" -ForegroundColor Green

# 6. Student OTP Verification
Write-Host "`n[Step 6/11] Verifying Student OTP..." -ForegroundColor Yellow
$studentOtpBody = @{
    contact = $studentEmail
    otp = "123456"
    role = "ROLE_STUDENT"
}
$studentAuthResp = Call-Api -Method "POST" -Endpoint "/api/auth/student/verify-otp" -Body $studentOtpBody
$studentToken = $studentAuthResp.data.token
Write-Host "  Authenticated! JWT acquired for Student." -ForegroundColor Green

# 7. Student Discovers Canteen Menu
Write-Host "`n[Step 7/11] Student fetching canteen menu for $canteenCode..." -ForegroundColor Yellow
$menuResp = Call-Api -Method "GET" -Endpoint "/api/canteens/$canteenCode/menu"
$menuCount = $menuResp.data.Count
Write-Host "  Menu loaded: $menuCount items found." -ForegroundColor Green

# 8. Student Places Order
Write-Host "`n[Step 8/11] Student placing food order for 2x Paneer Butter Masala..." -ForegroundColor Yellow
$orderBody = @{
    canteenCode = $canteenCode
    items = @(
        @{ foodItemId = $foodId; quantity = 2 }
    )
}
$orderResp = Call-Api -Method "POST" -Endpoint "/api/orders" -Body $orderBody -Token $studentToken
$orderId = $orderResp.data.id
$orderNumber = $orderResp.data.orderNumber
$orderTotal = $orderResp.data.totalAmount
$orderStatus = $orderResp.data.status
Write-Host "  Order Placed! Order #$orderNumber | Total: Rs $orderTotal | Status: $orderStatus" -ForegroundColor Green

if ($orderTotal -ne 280.00) {
    throw "Server price recalculation error! Expected 280.00, got $orderTotal"
}

# 9. Canteen Sees Incoming Order
Write-Host "`n[Step 9/11] Canteen verifying incoming order list..." -ForegroundColor Yellow
$canteenOrders = Call-Api -Method "GET" -Endpoint "/api/canteens/me/orders" -Token $canteenToken
$found = $canteenOrders.data | Where-Object { $_.id -eq $orderId }
if ($found) {
    Write-Host "  Verified: Order found in canteen kitchen queue." -ForegroundColor Green
} else {
    throw "Order not found in canteen orders!"
}

# 10. Order Status Transitions: ACCEPTED -> PREPARING -> READY -> COMPLETED
Write-Host "`n[Step 10/11] Progressing order status through valid transitions..." -ForegroundColor Yellow

# ACCEPTED
$null = Call-Api -Method "PATCH" -Endpoint "/api/canteens/me/orders/$orderId/status" -Body @{ status = "ACCEPTED" } -Token $canteenToken
Write-Host "  Transitioned -> ACCEPTED" -ForegroundColor DarkGray

# PREPARING
$null = Call-Api -Method "PATCH" -Endpoint "/api/canteens/me/orders/$orderId/status" -Body @{ status = "PREPARING" } -Token $canteenToken
Write-Host "  Transitioned -> PREPARING" -ForegroundColor DarkGray

# READY
$null = Call-Api -Method "PATCH" -Endpoint "/api/canteens/me/orders/$orderId/status" -Body @{ status = "READY" } -Token $canteenToken
Write-Host "  Transitioned -> READY" -ForegroundColor DarkGray

# COMPLETED
$null = Call-Api -Method "PATCH" -Endpoint "/api/canteens/me/orders/$orderId/status" -Body @{ status = "COMPLETED" } -Token $canteenToken
Write-Host "  Transitioned -> COMPLETED" -ForegroundColor Green

# 11. Student Checks Final Order History
Write-Host "`n[Step 11/11] Student verifying completed order history..." -ForegroundColor Yellow
$studentOrders = Call-Api -Method "GET" -Endpoint "/api/students/me/orders" -Token $studentToken
$myOrder = $studentOrders.data | Where-Object { $_.id -eq $orderId }
if ($myOrder -and $myOrder.status -eq "COMPLETED") {
    Write-Host "  Verified: Order #$orderNumber is marked COMPLETED in Student Dashboard." -ForegroundColor Green
} else {
    throw "Order status was not COMPLETED in student view!"
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "ALL 11 END-TO-END FLOW VERIFICATION STEPS PASSED 100%!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
