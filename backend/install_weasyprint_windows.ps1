# WeasyPrint Installation Script for Windows
# This script installs WeasyPrint and its dependencies for PDF export functionality

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "WeasyPrint Installation Script for Windows" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ and try again." -ForegroundColor Yellow
    exit 1
}

# Check if pip is available
try {
    $pipVersion = pip --version 2>&1
    Write-Host "pip found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: pip is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install pip and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Installing WeasyPrint with Windows extras..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Install WeasyPrint with Windows extras
try {
    pip install "weasyprint[windows]>=60.0"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "WeasyPrint installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Warning: pip install returned exit code $LASTEXITCODE" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error installing WeasyPrint: $_" -ForegroundColor Red
    Write-Host "Trying without Windows extras..." -ForegroundColor Yellow
    pip install "weasyprint>=60.0"
}

Write-Host ""
Write-Host "Verifying WeasyPrint installation..." -ForegroundColor Yellow

# Verify installation by attempting to import
$testScript = @"
import sys
try:
    from weasyprint import HTML
    print("SUCCESS: WeasyPrint imported successfully")
    sys.exit(0)
except ImportError as e:
    print(f"ERROR: Failed to import WeasyPrint: {e}")
    sys.exit(1)
except Exception as e:
    print(f"WARNING: WeasyPrint imported but may have issues: {e}")
    sys.exit(0)
"@

$testScript | python
$importResult = $LASTEXITCODE

if ($importResult -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "WeasyPrint Installation Complete!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your Django server" -ForegroundColor White
    Write-Host "2. Verify installation: python manage.py check_weasyprint" -ForegroundColor White
    Write-Host "3. Test PDF export in the application" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "WeasyPrint Installation Issues Detected" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "WeasyPrint may require additional system dependencies:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install GTK3 Runtime (Recommended)" -ForegroundColor Cyan
    Write-Host "  Download from: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer" -ForegroundColor White
    Write-Host "  After installation, restart your computer and try again." -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Use HTML Export" -ForegroundColor Cyan
    Write-Host "  PDF export requires WeasyPrint, but HTML export works without it." -ForegroundColor White
    Write-Host ""
    Write-Host "For more information, visit:" -ForegroundColor Cyan
    Write-Host "  https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows" -ForegroundColor White
    Write-Host ""
    Write-Host "You can also check the installation status with:" -ForegroundColor Cyan
    Write-Host "  python manage.py check_weasyprint" -ForegroundColor White
    Write-Host ""
    exit 1
}

