#!/bin/bash
# WeasyPrint Installation Script for Linux and macOS
# This script installs WeasyPrint and its system dependencies for PDF export functionality

set -e  # Exit on error

echo "================================================"
echo "WeasyPrint Installation Script"
echo "================================================"
echo ""

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "Detected OS: $MACHINE"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

echo "Python found: $(python3 --version)"
echo ""

# Check if pip is available
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "Error: pip is not installed or not in PATH"
    echo "Please install pip and try again."
    exit 1
fi

# Use pip3 if available, otherwise pip
PIP_CMD="pip3"
if ! command -v pip3 &> /dev/null; then
    PIP_CMD="pip"
fi

echo "pip found: $($PIP_CMD --version)"
echo ""

# Install system dependencies based on OS
if [ "$MACHINE" = "Linux" ]; then
    echo "Installing Linux system dependencies..."
    echo ""
    
    # Detect Linux distribution
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        echo "Detected Debian/Ubuntu system"
        echo "Installing dependencies with apt-get (requires sudo)..."
        echo ""
        
        if command -v sudo &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y python3-cffi python3-brotli libpango-1.0-0 libpangoft2-1.0-0
        else
            echo "Warning: sudo not available. Please install the following packages manually:"
            echo "  apt-get install python3-cffi python3-brotli libpango-1.0-0 libpangoft2-1.0-0"
            echo ""
            read -p "Press Enter to continue with WeasyPrint installation (may fail if dependencies are missing)..."
        fi
    elif [ -f /etc/redhat-release ]; then
        # RedHat/CentOS/Fedora
        echo "Detected RedHat/CentOS/Fedora system"
        echo "Installing dependencies with yum/dnf (requires sudo)..."
        echo ""
        
        if command -v sudo &> /dev/null; then
            if command -v dnf &> /dev/null; then
                sudo dnf install -y pango pango-devel cairo cairo-devel
            else
                sudo yum install -y pango pango-devel cairo cairo-devel
            fi
        else
            echo "Warning: sudo not available. Please install the following packages manually:"
            echo "  yum install pango pango-devel cairo cairo-devel"
            echo "  or"
            echo "  dnf install pango pango-devel cairo cairo-devel"
            echo ""
            read -p "Press Enter to continue with WeasyPrint installation (may fail if dependencies are missing)..."
        fi
    else
        echo "Warning: Unknown Linux distribution. You may need to install system dependencies manually."
        echo "Common packages needed: cairo, pango, pango-devel, cairo-devel"
        echo ""
        read -p "Press Enter to continue with WeasyPrint installation (may fail if dependencies are missing)..."
    fi
elif [ "$MACHINE" = "Mac" ]; then
    echo "Installing macOS system dependencies..."
    echo ""
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "Error: Homebrew is not installed"
        echo "Please install Homebrew from https://brew.sh and try again."
        exit 1
    fi
    
    echo "Installing dependencies with Homebrew..."
    brew install cairo pango gdk-pixbuf libffi
    echo ""
else
    echo "Warning: Unknown operating system. System dependencies may need to be installed manually."
    echo ""
    read -p "Press Enter to continue with WeasyPrint installation (may fail if dependencies are missing)..."
fi

echo ""
echo "Installing WeasyPrint via pip..."
echo "This may take a few minutes..."
echo ""

# Install WeasyPrint
$PIP_CMD install "weasyprint>=60.0"

if [ $? -eq 0 ]; then
    echo ""
    echo "WeasyPrint installed successfully!"
else
    echo ""
    echo "Error: Failed to install WeasyPrint"
    exit 1
fi

echo ""
echo "Verifying WeasyPrint installation..."
echo ""

# Verify installation by attempting to import
python3 << EOF
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
    # Try to generate a test PDF
    try:
        import tempfile
        test_html = "<html><body><h1>Test</h1></body></html>"
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=True) as tmp_file:
            HTML(string=test_html).write_pdf(tmp_file.name)
        print("SUCCESS: WeasyPrint can generate PDFs")
        sys.exit(0)
    except Exception as pdf_error:
        print(f"WARNING: WeasyPrint imported but PDF generation failed: {pdf_error}")
        print("You may need to install additional system dependencies.")
        sys.exit(1)
EOF

VERIFY_RESULT=$?

if [ $VERIFY_RESULT -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "WeasyPrint Installation Complete!"
    echo "================================================"
    echo ""
    echo "Next steps:"
    echo "1. Restart your Django server"
    echo "2. Verify installation: python manage.py check_weasyprint"
    echo "3. Test PDF export in the application"
    echo ""
else
    echo ""
    echo "================================================"
    echo "WeasyPrint Installation Issues Detected"
    echo "================================================"
    echo ""
    echo "WeasyPrint may require additional system dependencies."
    echo ""
    if [ "$MACHINE" = "Linux" ]; then
        echo "For Linux, ensure the following packages are installed:"
        echo "  - cairo"
        echo "  - pango"
        echo "  - pango-devel"
        echo "  - cairo-devel"
        echo "  - python3-cffi"
        echo "  - python3-brotli"
        echo ""
    elif [ "$MACHINE" = "Mac" ]; then
        echo "For macOS, ensure the following packages are installed via Homebrew:"
        echo "  - cairo"
        echo "  - pango"
        echo "  - gdk-pixbuf"
        echo "  - libffi"
        echo ""
    fi
    echo "For more information, visit:"
    echo "  https://doc.courtbouillon.org/weasyprint/stable/first_steps.html"
    echo ""
    echo "You can also check the installation status with:"
    echo "  python manage.py check_weasyprint"
    echo ""
    exit 1
fi

