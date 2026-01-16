# Tier 0 Installation

## Quick Install
```bash
cd tier0-boundary
npm install
npm run build
```

## Verify Installation
```bash
./dist/cli.js --help
```

## Build from Source
```bash
./build.sh
```

## Docker (Optional)
```bash
docker build -t seekreap-tier0 .
docker run -v $(pwd):/data seekreap-tier0 verify /data/examples/basic-policy.json
```

## Requirements
- Node.js 16+ 
- npm or yarn
- Git (for source checkout)
