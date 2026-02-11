import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { CachedImage } from '../components/CachedImage';
import { Badge } from '../components/Badge';
import { NoDataDisplay } from '../components/NoDataDisplay';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const FEATURED_IMAGE_HEIGHT = 240;

function estimateReadTime(content) {
  if (!content || typeof content !== 'string') return null;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return minutes;
}

function getFormattedDate(article) {
  if (typeof article?.getFormattedDate === 'function') {
    return article.getFormattedDate();
  }
  if (article?.publishedAt) {
    const d = new Date(article.publishedAt);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return '';
}

export default function NewsDetailScreen({ route }) {
  const { colors } = useTheme();
  const { article } = route.params;
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const hasImage = typeof article?.hasImage === 'function' ? article.hasImage() : !!article?.imageUrl;
  const readTime = article?.readTime ?? estimateReadTime(article?.content);
  const formattedDate = getFormattedDate(article);
  const styles = getStyles(colors);

  const handleImagePress = () => {
    if (hasImage) setImageModalVisible(true);
  };

  const closeImageModal = () => setImageModalVisible(false);

  if (!article) {
    return (
      <View style={styles.container}>
        <NoDataDisplay
          icon="document-outline"
          title="Article not found"
          message="The requested article could not be loaded. It may have been removed or the link may be invalid."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {hasImage ? (
          <TouchableOpacity
            onPress={handleImagePress}
            activeOpacity={0.95}
            accessible
            accessibilityLabel="Featured image, tap to view full size"
            accessibilityRole="imagebutton"
          >
            <CachedImage
              uri={article.imageUrl}
              style={styles.featuredImage}
              resizeMode="cover"
              accessibilityLabel={`Featured image for ${article.title}`}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.card }]}>
            <Ionicons name="newspaper-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.imagePlaceholderText}>No image</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.metaRow}>
            {article.category && (
              <Badge label={article.category} variant="info" size="small" />
            )}
            <Text style={styles.dateText}>
              {formattedDate}
            </Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>

          {(readTime || article.author) && (
            <View style={styles.detailMeta}>
              {readTime && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{readTime} min read</Text>
                </View>
              )}
              {article.author && (
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{article.author}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.articleContent}>
            {article.content || article.excerpt || ''}
          </Text>

          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Tags</Text>
              <View style={styles.tagsRow}>
                {article.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tag, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}
                  >
                    <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeImageModal}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeImageModal}
          accessible
          accessibilityLabel="Close full screen image"
          accessibilityRole="button"
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeImageModal}
              accessible
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            {hasImage && (
              <CachedImage
                uri={article.imageUrl}
                style={styles.fullScreenImage}
                resizeMode="contain"
                accessibilityLabel={`Full size image for ${article.title}`}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

NewsDetailScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      article: PropTypes.object,
    }),
  }).isRequired,
};

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.xxxl,
    },
    featuredImage: {
      width: '100%',
      height: FEATURED_IMAGE_HEIGHT,
      backgroundColor: colors.surface,
    },
    imagePlaceholder: {
      width: '100%',
      height: FEATURED_IMAGE_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePlaceholderText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    dateText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    title: {
      ...typography.h3,
      color: colors.text,
      lineHeight: 32,
      marginBottom: spacing.lg,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    detailMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xl,
      marginBottom: spacing.lg,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    metaText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.xl,
    },
    articleContent: {
      ...typography.body,
      color: colors.text,
      lineHeight: 26,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    tagsSection: {
      marginTop: spacing.xxl,
      paddingTop: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    tagsLabel: {
      ...typography.label,
      color: colors.text,
      marginBottom: spacing.sm,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      borderWidth: 1,
    },
    tagText: {
      ...typography.bodySmall,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    modalOverlay: {
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
      top: 56,
      right: spacing.lg,
      zIndex: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenImage: {
      width: '100%',
      height: '100%',
    },
  });
}
