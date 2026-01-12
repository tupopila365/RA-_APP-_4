# News Filter Expansion Fix

## Issue
Filter boxes in NewsScreen were expanding sometimes, causing inconsistent layout and visual issues.

## Root Cause
- No maximum width constraint
- No fixed height
- Text could wrap to multiple lines
- Container allowed flexible sizing

## Solution Applied

### 1. Fixed Dimensions
```javascript
filterChip: {
  minWidth: 60,        // Minimum width
  maxWidth: 120,       // Maximum width (prevents expansion)
  height: 36,          // Fixed height
  flexShrink: 0,       // Prevents shrinking
  alignItems: 'center',
  justifyContent: 'center',
}
```

### 2. Text Constraints
```javascript
filterChipText: {
  numberOfLines: 1,    // Single line only
  flexShrink: 1,       // Allow text to shrink if needed
  textAlign: 'center',
}
```

### 3. JSX Text Props
```javascript
<Text 
  numberOfLines={1}    // Prevents text wrapping
  maxFontSizeMultiplier={1.3}
>
  {category}
</Text>
```

### 4. Container Constraints
```javascript
filterContainer: {
  flexDirection: 'row',
  flexWrap: 'nowrap',  // Prevents wrapping to new lines
}
```

## Key Improvements

1. **Fixed Height**: 36px height prevents vertical expansion
2. **Width Limits**: 60px min, 120px max prevents horizontal expansion
3. **No Text Wrapping**: `numberOfLines={1}` keeps text on single line
4. **Flex Constraints**: `flexShrink: 0` prevents unwanted shrinking
5. **Container Control**: `flexWrap: 'nowrap'` maintains horizontal layout

## Result
- ✅ Filter chips maintain consistent size
- ✅ No more expansion issues
- ✅ Professional, uniform appearance
- ✅ Text stays on single line
- ✅ Horizontal scrolling works properly

## Files Modified
- `app/screens/NewsScreen.js` - Enhanced filter chip styling with expansion prevention

The filter chips now have strict dimensional constraints that prevent any expansion while maintaining a professional appearance.