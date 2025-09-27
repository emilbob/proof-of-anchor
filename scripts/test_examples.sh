#!/bin/bash

# Test multiple proof examples
echo "🧪 Testing multiple proof examples..."

EXAMPLES=("input" "example1" "example2" "example3")
SUCCESS_COUNT=0
TOTAL_COUNT=${#EXAMPLES[@]}

for example in "${EXAMPLES[@]}"; do
    echo ""
    echo "🔍 Testing example: $example"
    echo "=================================="
    
    # Copy the example to input.json
    cp "noir/witness/${example}.json" "noir/witness/input.json"
    
    # Run the proof pipeline
    if ./scripts/run_proof.sh > /dev/null 2>&1; then
        echo "✅ Example $example: SUCCESS"
        ((SUCCESS_COUNT++))
    else
        echo "❌ Example $example: FAILED"
    fi
done

echo ""
echo "📊 Test Results Summary:"
echo "========================="
echo "✅ Successful: $SUCCESS_COUNT/$TOTAL_COUNT"
echo "❌ Failed: $((TOTAL_COUNT - SUCCESS_COUNT))/$TOTAL_COUNT"

if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
    echo "🎉 All examples passed!"
    exit 0
else
    echo "⚠️  Some examples failed"
    exit 1
fi
