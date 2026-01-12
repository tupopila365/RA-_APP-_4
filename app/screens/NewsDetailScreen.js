import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
  useWindowDimensions,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { CachedImage } from '../components/CachedImage';

export default function NewsDetailScreen({ route }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const { article } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const styles = getStyles(colors, screenWidth);

  const handleImagePress = () => {
    if (article.hasImage && article.hasImage()) {
      setImageModalVisible(true);
    }
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Featured Image */}
        {article.hasImage && article.hasImage() ? (
          <TouchableOpacity 
            onPress={handleImagePress}
            activeOpacity={0.9}
            accessible={true}
            accessibilityLabel="Featured image, tap to view full size"
            accessibilityHint="Double tap to open image in full screen"
          >
            <CachedImage
              uri={article.imageUrl}
              style={styles.featuredImage}
              resizeMode="cover"
              accessibilityLabel={`Featured image for ${article.title}`}
              testID="news-detail-image"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.imagePlaceholderText}>No Image Available</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {article.category}
              </Text>
            </View>
            <Text style={styles.dateText}>{article.date}</Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{article.readTime} min read</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{article.author}</Text>
            </View>
          </View>

          <Text style={styles.articleContent}>{article.content}</Text>

          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Tags:</Text>
              <View style={styles.tags}>
                {article.tags.map((tag, index) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Zoom Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
        statusBarTranslucent={true}
      >
        <Pressable 
          style={styles.modalContainer}
          onPress={closeImageModal}
          accessible={true}
          accessibilityLabel="Close full screen image"
          accessibilityHint="Tap anywhere to close"
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeImageModal}
              accessible={true}
              accessibilityLabel="Close button"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            {article.hasImage && article.hasImage() && (
              <CachedImage
                uri={article.imageUrl}
                style={styles.fullScreenImage}
                resizeMode="contain"
                accessibilityLabel={`Full size image for ${article.title}`}
                testID="news-detail-image-fullscreen"
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function getStyles(colors, screenWidth) {
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  const isLargeScreen = screenWidth >= 768;

  const contentPadding = isSmallScreen ? 15 : isMediumScreen ? 20 : 30;
  const titleSize = isSmallScreen ? 22 : isMediumScreen ? 26 : 30;
  const contentSize = isSmallScreen ? 15 : 16;
  const imageHeight = isSmallScreen ? 200 : isMediumScreen ? 250 : 300;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    featuredImage: {
      width: '100%',
      height: imageHeight,
      backgroundColor: colors.surface,
    },
    imagePlaceholder: {
      width: '100%',
      height: imageHeight,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    imagePlaceholderText: {
      marginTop: 10,
      fontSize: 14,
      color: colors.textSecondary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      padding: 8,
    },
    fullScreenImage: {
      width: '100%',
      height: '100%',
    },
    content: {
      padding: contentPadding,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      flexWrap: 'wrap',
      gap: 10,
    },
    categoryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    categoryText: {
      fontSize: isSmallScreen ? 11 : 12,
      fontWeight: '600',
    },
    dateText: {
      fontSize: isSmallScreen ? 11 : 12,
      color: colors.textSecondary,
    },
    title: {
      fontSize: titleSize,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
      lineHeight: titleSize * 1.3,
    },
    metaInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isSmallScreen ? 15 : 20,
      marginBottom: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      fontSize: isSmallScreen ? 13 : 14,
      color: colors.textSecondary,
    },
    articleContent: {
      fontSize: contentSize,
      color: colors.text,
      lineHeight: contentSize * 1.6,
      marginBottom: 20,
    },
    tagsContainer: {
      marginTop: 20,
    },
    tagsLabel: {
      fontSize: isSmallScreen ? 13 : 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tagText: {
      fontSize: isSmallScreen ? 11 : 12,
      color: colors.primary,
      fontWeight: '500',
    },
  });
}

NewsDetailScreen.propTypes = {
  route: PropTypes.object.isRequired,
};
