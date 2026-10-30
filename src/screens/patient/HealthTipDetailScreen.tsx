import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type HealthTip = {
  title: string;
  category: string;
  readTime: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  description: string;
};

const categories = ['All', 'Nutrition', 'Mental health', 'Fitness'];

const tips: HealthTip[] = [
  {
    title: 'Eat more leafy and greens',
    category: 'Nutrition',
    readTime: '2 min read',
    icon: 'food-apple',
    color: '#789574',
    description: 'Add leafy greens to your meals for fibre, vitamins, and minerals.',
  },
  {
    title: 'Breathing for stress relief',
    category: 'Mental health',
    readTime: '3 min read',
    icon: 'flower',
    color: '#4D9B42',
    description: 'Slow, steady breathing can help your body relax when you feel stressed.',
  },
  {
    title: 'Walk 30 minutes daily',
    category: 'Fitness',
    readTime: '1 min read',
    icon: 'walk',
    color: '#4D9B42',
    description: 'A brisk daily walk is a simple way to support your heart and overall health.',
  },
  {
    title: 'Stay hydrated - 8 cups',
    category: 'General',
    readTime: '1 min read',
    icon: 'water',
    color: '#59B6CC',
    description: 'Drink water throughout the day and remember to hydrate after activity.',
  },
  {
    title: 'Sleep 7 - 8 hours nightly',
    category: 'Wellness',
    readTime: '2 min read',
    icon: 'bed',
    color: '#455A45',
    description: 'A regular sleep routine gives your mind and body time to recover.',
  },
];

export default function HealthTipDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isArticleExpanded, setIsArticleExpanded] = useState(false);

  const initials = `${profile?.first_name?.charAt(0) || ''}${profile?.last_name?.charAt(0) || ''}` || 'AS';
  const visibleTips = useMemo(() => {
    if (selectedCategory === 'All') return tips;
    const normalizedCategory = selectedCategory.toLowerCase();
    return tips.filter((tip) => tip.category.toLowerCase() === normalizedCategory);
  }, [selectedCategory]);
  const compact = width < 380;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.3, 0.55]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={17} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.title}>Health Tips</Text>
                <Text style={styles.subtitle}>Personalized for you</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
              accessibilityLabel="Health tip categories"
            >
              {categories.map((category) => {
                const selected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.featuredCard}>
              <View style={styles.featuredAccent} />
              <View style={styles.featuredContent}>
                <Text style={styles.featuredEyebrow}>FEATURED CHRONIC CARE</Text>
                <Text style={styles.featuredTitle}>Managing diabetes daily</Text>
                <Text style={styles.featuredDescription}>
                  Check your blood sugar levels in the morning before eating, and keep a small snack on hand for low reading
                </Text>
                {isArticleExpanded && (
                  <Text style={styles.expandedDescription}>
                    Keeping a regular routine can make diabetes easier to manage. Follow your care plan and speak with your healthcare provider about any changes.
                  </Text>
                )}
                <View style={styles.featuredFooter}>
                  <Text style={styles.stars} accessibilityLabel="5 out of 5 stars">
                    ★★★★★
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsArticleExpanded((expanded) => !expanded)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.readMore}>
                      {isArticleExpanded ? 'Read less' : 'Read more'} →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>TODAY’S TIPS</Text>
            <View style={styles.tipsCard}>
              {visibleTips.length > 0 ? visibleTips.map((tip, index) => (
                <View
                  key={tip.title}
                  style={[styles.tipRow, index === visibleTips.length - 1 && styles.tipRowLast]}
                >
                  <View style={styles.tipIcon}>
                    <MaterialCommunityIcons name={tip.icon} size={17} color={tip.color} />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle} numberOfLines={1}>{tip.title}</Text>
                    <Text style={styles.tipDescription} numberOfLines={1}>
                      {tip.category} · {tip.readTime}
                    </Text>
                  </View>
                  <View style={styles.tipTag}>
                    <Text style={styles.tipTagText}>
                      {tip.category === 'Mental health' ? 'Mental' : tip.category}
                    </Text>
                  </View>
                </View>
              )) : (
                <View style={styles.emptyTips}>
                  <Text style={styles.emptyTipsText}>No tips available for this category.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255,255,255,0.9)',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 36,
  },
  scrollContentCompact: {
    paddingHorizontal: 26,
    paddingTop: 34,
  },
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: '#171717',
    fontSize: 9,
    marginTop: 1,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E6E4E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#111',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryRow: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 18,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  categoryChipSelected: {
    backgroundColor: '#FFF',
    borderColor: '#777',
  },
  categoryText: {
    color: '#111',
    fontSize: 10,
  },
  categoryTextSelected: {
    fontWeight: '600',
  },
  featuredCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D1D1',
    padding: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 2,
  },
  featuredAccent: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#789574',
    marginTop: 1,
    marginRight: 10,
  },
  featuredContent: {
    flex: 1,
  },
  featuredEyebrow: {
    color: '#3F4B6B',
    fontSize: 8,
    marginBottom: 7,
  },
  featuredTitle: {
    color: '#263A77',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  featuredDescription: {
    color: '#334775',
    fontSize: 8,
    lineHeight: 10,
  },
  expandedDescription: {
    color: '#334775',
    fontSize: 8,
    lineHeight: 11,
    marginTop: 5,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stars: {
    color: '#B28A00',
    fontSize: 12,
    letterSpacing: -1,
  },
  readMore: {
    color: '#263A77',
    fontSize: 7,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#111',
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 6,
  },
  tipsCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D1D1',
    paddingHorizontal: 9,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 2,
  },
  tipRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    gap: 5,
  },
  tipRowLast: {
    borderBottomWidth: 0,
  },
  tipIcon: {
    width: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    minWidth: 0,
  },
  tipTitle: {
    color: '#222',
    fontSize: 8,
    fontWeight: '700',
  },
  tipDescription: {
    color: '#777',
    fontSize: 7,
    marginTop: 1,
  },
  tipTag: {
    maxWidth: 58,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tipTagText: {
    color: '#333',
    fontSize: 7,
  },
  emptyTips: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyTipsText: {
    color: '#777',
    fontSize: 11,
  },
});