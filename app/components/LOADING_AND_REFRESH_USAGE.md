# LoadingIndicator and PullToRefresh Usage Guide

## LoadingIndicator Component

A reusable loading component with a blue circle spinner (uses primary theme color).

### Basic Usage

```javascript
import { LoadingIndicator } from '../components';

// Simple loading spinner
<LoadingIndicator />

// With message
<LoadingIndicator message="Loading data..." />

// Full screen loading
<LoadingIndicator fullScreen message="Please wait..." />

// Custom size
<LoadingIndicator size="small" />
<LoadingIndicator size={40} /> // numeric size
```

### Props

- `size` (string | number): Size of spinner - 'small', 'large', or numeric value (default: 'large')
- `message` (string): Optional message to display below spinner
- `fullScreen` (boolean): Whether to show as full screen overlay (default: false)
- `testID` (string): Test identifier for testing
- `color` (string): Custom color for spinner (defaults to primary blue #00B4E6)

### Example in Screen

```javascript
import { LoadingIndicator } from '../components';

function MyScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.getData();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator fullScreen message="Fetching data..." />;
  }

  return (
    <View>
      {/* Your content */}
    </View>
  );
}
```

## PullToRefresh Component

A wrapper component that adds pull-to-refresh functionality to ScrollView.

### Basic Usage with ScrollView

```javascript
import { PullToRefresh } from '../components';

function MyScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PullToRefresh
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <View>
        {/* Your scrollable content */}
      </View>
    </PullToRefresh>
  );
}
```

### Usage with FlatList

```javascript
import { PullToRefreshFlatList } from '../components';

function MyListScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const newData = await fetchData();
      setData(newData);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PullToRefreshFlatList
      refreshing={refreshing}
      onRefresh={handleRefresh}
      data={data}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Props

#### PullToRefresh (ScrollView wrapper)

- `refreshing` (boolean): Whether refresh is in progress
- `onRefresh` (Function): Callback when user pulls to refresh
- `children` (ReactNode): Content to wrap
- `style` (Object): Additional styles for ScrollView
- `contentContainerStyle` (Object): Styles for content container
- `testID` (string): Test identifier
- `enabled` (boolean): Enable/disable pull to refresh (default: true)
- `tintColor` (string): Color of refresh indicator (iOS, defaults to primary blue)
- `colors` (Array<string>): Colors for refresh indicator (Android, defaults to [primary blue])
- All other ScrollView props are supported

#### PullToRefreshFlatList (FlatList wrapper)

- `refreshing` (boolean): Whether refresh is in progress
- `onRefresh` (Function): Callback when user pulls to refresh
- `data` (Array): Data array for FlatList
- `renderItem` (Function): Render function for items
- `testID` (string): Test identifier
- `enabled` (boolean): Enable/disable pull to refresh (default: true)
- `tintColor` (string): Color of refresh indicator (iOS, defaults to primary blue)
- `colors` (Array<string>): Colors for refresh indicator (Android, defaults to [primary blue])
- All other FlatList props are supported

### Complete Example with Loading and Refresh

```javascript
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { LoadingIndicator, PullToRefresh } from '../components';

function MyScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await api.getData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingIndicator fullScreen message="Loading data..." />;
  }

  return (
    <PullToRefresh
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <View>
        {data.map((item) => (
          <Text key={item.id}>{item.title}</Text>
        ))}
      </View>
    </PullToRefresh>
  );
}
```

## Notes

- Both components automatically use the primary blue color (#00B4E6) from your theme
- The refresh indicator adapts to light/dark mode
- All components are fully accessible with proper accessibility labels
- The components work on both iOS and Android with platform-specific optimizations













