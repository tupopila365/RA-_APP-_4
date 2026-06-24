import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NEUTRAL_COLORS } from '../../theme/colors';
import { DESIGN_V2_HEADER } from '../../designTokens';
import { Image } from 'react-native-svg';




const PhotoSection = () => {
    return (
        // 1. CHANGED: Fixed style name from styles.container to styles.PhotoSection
        <View style={styles.PhotoSection}>
            <Image 
                source={require('../../assets/passport.jpg')}
                style={styles.photo}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    PhotoSection: {
        flex: 1,
        padding: 20, // Replaced placeholder spacing.md for demonstration
        backgroundColor: NEUTRAL_COLORS.gray100, // Replaced placeholder NEUTRAL_COLORS.white
        justifyContent: 'center', // Centers the image vertically
        alignItems: 'center',    // Centers the image horizontally
    },
    photo: {
        // 2. FIXED: Changed 'windth' to 'width'
        // 3. RECOMMENDATION: Use fixed dimensions or ensure parent layout allows percentages
        width: 120, 
        height: 160,
        resizeMode: 'contain' 
    }
});

export default PhotoSection;
