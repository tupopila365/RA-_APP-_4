import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, SearchBar, ServiceTile } from '../components';
import { spacing } from '../theme/spacing';

const GAP = spacing.md;

export function ApplicationsScreen({ onBack, onPlnApplication, onMyApplications }) {
  const [search, setSearch] = useState('');

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SearchBar
        placeholder="Search applications"
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.spacer} />
      <View style={styles.row}>
        <View style={styles.cell}>
          <ServiceTile
            iconName="document-text-outline"
            label="PLN Application"
            onPress={onPlnApplication || (() => {})}
          />
        </View>
        <View style={styles.cell}>
          <ServiceTile
            iconName="folder-open-outline"
            label="My Applications"
            onPress={onMyApplications || (() => {})}
          />
        </View>
        <View style={styles.cell} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  spacer: {
    height: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: GAP,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: GAP / 2,
    aspectRatio: 1,
  },
});
