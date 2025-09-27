#!/bin/bash

# Test error handling with invalid inputs
echo "🧪 Testing error handling and edge cases..."

# Test 1: Invalid witness data
echo ""
echo "🔍 Test 1: Invalid witness data"
echo "================================"
echo '{"invalid": "data"}' > noir/witness/input.json
if ./scripts/run_proof.sh > /dev/null 2>&1; then
    echo "❌ Expected failure but got success"
else
    echo "✅ Correctly failed with invalid data"
fi

# Test 2: Empty witness data
echo ""
echo "🔍 Test 2: Empty witness data"
echo "=============================="
echo '{}' > noir/witness/input.json
if ./scripts/run_proof.sh > /dev/null 2>&1; then
    echo "❌ Expected failure but got success"
else
    echo "✅ Correctly failed with empty data"
fi

# Test 3: Malformed JSON
echo ""
echo "🔍 Test 3: Malformed JSON"
echo "========================="
echo '{invalid json}' > noir/witness/input.json
if ./scripts/run_proof.sh > /dev/null 2>&1; then
    echo "❌ Expected failure but got success"
else
    echo "✅ Correctly failed with malformed JSON"
fi

# Restore valid input
echo ""
echo "🔧 Restoring valid input..."
cp noir/witness/example1.json noir/witness/input.json

echo ""
echo "✅ Error handling tests completed!"
