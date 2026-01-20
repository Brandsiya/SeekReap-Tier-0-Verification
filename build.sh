#!/bin/bash
# SeekReap Tier 0 - Build Script
set -e
echo "🔨 SeekReap Tier 0 Build Process"
echo "================================="

VERSION="1.1.0"
TIER="0"
BUILD_DIR="./dist"
SOURCE_DIR="."

print_header() {
    echo -e "\n=== $1 ==="
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

print_header "Cleaning previous build"
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    print_success "Cleaned build directory"
fi

mkdir -p "$BUILD_DIR"
print_success "Created build directory: $BUILD_DIR"
print_header "Copying canonical files"

DOC_FILES=(
    "MASTER_INDEX.md"
    "README.md"
    "SETUP.md"
    "TIER0_OVERVIEW.md"
    "TIER_BOUNDARY_CONTRACT.md"
    "TIERO_INSTALLATION.md"
    "TIERO_QUICKSTART.md"
    "TIERO_CLI_REFERENCE.md"
    "TIERO_POSITIONING.md"
    "LICENSE"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BUILD_DIR/"
        print_success "Copied: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

IMPLEMENTATION_FILES=("cli.js" "package.json" "test.js")
for file in "${IMPLEMENTATION_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BUILD_DIR/"
        print_success "Copied: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done
VERIFICATION_SCRIPTS=(
    "verify_tier0.sh"
    "verify_tier0_final.sh"
    "verify_final_clean.sh"
    "complete_tier0.sh"
    "build.sh"
)

for script in "${VERIFICATION_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        cp "$script" "$BUILD_DIR/"
        chmod +x "$BUILD_DIR/$script"
        print_success "Copied: $script"
    else
        print_error "Missing: $script"
        exit 1
    fi
done

print_header "Copying examples"
if [ -d "examples" ]; then
    cp -r "examples" "$BUILD_DIR/"
    print_success "Copied examples directory"
else
    print_error "Missing examples directory"
    exit 1
fi

if [ -f ".gitignore" ]; then
    cp ".gitignore" "$BUILD_DIR/"
    print_success "Copied .gitignore"
fi

print_header "Verifying package.json"
if [ -f "package.json" ]; then
    PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")
    if [ "$PACKAGE_VERSION" = "$VERSION" ]; then
        print_success "Package version correct: $PACKAGE_VERSION"
    else
        print_error "Package version mismatch"
        exit 1
    fi
fi
print_header "Running tests"
cd "$BUILD_DIR"
npm install --production --silent
print_success "Dependencies installed"

echo ""
node test.js
if [ $? -eq 0 ]; then
    print_success "All tests passed"
else
    print_error "Tests failed"
    exit 1
fi

print_header "Testing CLI"
CLI_VERSION=$(node cli.js --version | head -1)
if [[ "$CLI_VERSION" == *"$VERSION"* ]]; then
    print_success "CLI version correct: $CLI_VERSION"
else
    print_error "CLI version mismatch"
    exit 1
fi

print_header "Running verification"
./verify_tier0.sh
if [ $? -eq 0 ]; then
    print_success "Tier 0 verification passed"
else
    print_error "Tier 0 verification failed"
    exit 1
fi

print_header "Creating distribution archive"
cd ..
ARCHIVE_NAME="seekreap-tier0-v${VERSION}.tar.gz"
tar -czf "$ARCHIVE_NAME" -C "$BUILD_DIR" .
print_success "Created archive: $ARCHIVE_NAME"

print_header "Verifying archive"
tar -tzf "$ARCHIVE_NAME" | head -20
print_success "Archive verified"

print_header "Build Summary"
echo "Version:          $VERSION"
echo "Tier:             $TIER"
echo "Build Directory:  $BUILD_DIR"
echo "Archive:          $ARCHIVE_NAME"
echo "Files in build:   $(find "$BUILD_DIR" -type f | wc -l)"
echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "To test the build:"
echo "  tar -xzf $ARCHIVE_NAME"
echo "  cd $(basename "$BUILD_DIR")"
echo "  node cli.js --version"
echo ""
echo "Distribution ready for Tier 1 implementation."
