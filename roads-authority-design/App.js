import React, { useState } from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { spacing } from './theme/spacing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  AppHeader,
  HeaderMenu,
  SearchBar,
  ScreenContainer,
  BottomNavBar,
} from './components';
import { HomeDesignToggle } from './components/HomeDesignToggle';
import { HomeGridLayout, HomeListLayout, HomeCardsLayout } from './components/HomeScreenLayouts';
import { ReportRoadDamageScreen } from './screens/ReportRoadDamageScreen';
import { FAQsScreen } from './screens/FAQsScreen';
import { ServicesScreen } from './screens/ServicesScreen';
import { NewsScreen } from './screens/NewsScreen';
import { NewsDetailScreen } from './screens/NewsDetailScreen';
import { FindOfficesScreen } from './screens/FindOfficesScreen';
import { FormsScreen } from './screens/FormsScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { RoadStatusScreen } from './screens/RoadStatusScreen';
import { MyReportsScreen } from './screens/MyReportsScreen';
import { MyReportDetailScreen } from './screens/MyReportDetailScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { ApplicationsScreen } from './screens/ApplicationsScreen';
import { ChatScreen } from './screens/ChatScreen';
import { PLNApplicationInfoScreen } from './screens/PLNApplicationInfoScreen';
import { PLNApplicationWizardScreen } from './screens/PLNApplicationWizardScreen';
import { MyApplicationsScreen } from './screens/MyApplicationsScreen';
import { ApplicationDetailScreen } from './screens/ApplicationDetailScreen';

function buildServiceItems(onReportDamage, onFaq, onServices, onNews, onFindOffices, onForms, onRoadStatus, onMyReports, onApplications) {
  return [
    { key: 'services', iconName: 'construct-outline', label: 'Services', onPress: onServices },
    { key: 'road-status', iconName: 'trail-sign-outline', label: 'Road Status', onPress: onRoadStatus },
    { key: 'report-damage', iconName: 'warning-outline', label: 'Report Road Damage', onPress: onReportDamage },
    { key: 'reports', iconName: 'document-text-outline', label: 'My Reports', onPress: onMyReports },
    { key: 'faq', iconName: 'help-circle-outline', label: 'FAQs', onPress: onFaq },
    { key: 'applications', iconName: 'folder-open-outline', label: 'Applications', onPress: onApplications },
    { key: 'forms', iconName: 'documents-outline', label: 'Forms', onPress: onForms },
    { key: 'find-offices', iconName: 'location-outline', label: 'Find Offices', onPress: onFindOffices },
    { key: 'news', iconName: 'newspaper-outline', label: 'News', onPress: onNews },
  ];
}

const NAV_ITEMS = [
  { key: 'home', iconName: 'home', label: 'Home', onPress: () => {} },
  { key: 'services', iconName: 'construct-outline', label: 'Services', onPress: () => {} },
  { key: 'reports', iconName: 'document-text-outline', label: 'Reports', onPress: () => {} },
  { key: 'find-offices', iconName: 'location-outline', label: 'Offices', onPress: () => {} },
  { key: 'chat', iconName: 'chatbubble-outline', label: 'Chat', onPress: () => {} },
];

export default function App() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [homeDesignOption, setHomeDesignOption] = useState(1);

  const serviceItems = buildServiceItems(
    () => setScreen('report-damage'),
    () => setScreen('faqs'),
    () => setScreen('services'),
    () => setScreen('news'),
    () => setScreen('find-offices'),
    () => setScreen('forms'),
    () => setScreen('road-status'),
    () => setScreen('my-reports'),
    () => setScreen('applications')
  );
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    onPress: () => {
      setActiveTab(item.key);
      if (item.key === 'home') setScreen('home');
      else if (item.key === 'services') setScreen('services');
      else if (item.key === 'reports') setScreen('my-reports');
      else if (item.key === 'find-offices') setScreen('find-offices');
      else if (item.key === 'chat') setScreen('chat');
    },
  }));

  const isReportDamage = screen === 'report-damage';
  const isFaqs = screen === 'faqs';
  const isServices = screen === 'services';
  const isNews = screen === 'news';
  const isNewsDetail = screen === 'news-detail';
  const isFindOffices = screen === 'find-offices';
  const isForms = screen === 'forms';
  const isSignIn = screen === 'sign-in';
  const isSignUp = screen === 'sign-up';
  const isRoadStatus = screen === 'road-status';
  const isMyReports = screen === 'my-reports';
  const isMyReportDetail = screen === 'my-report-detail';
  const isFeedback = screen === 'feedback';
  const isApplications = screen === 'applications';
  const isChat = screen === 'chat';
  const isPlnInfo = screen === 'pln-info';
  const isPlnWizard = screen === 'pln-wizard';
  const isMyApplications = screen === 'my-applications';
  const isApplicationDetail = screen === 'application-detail';
  const isSubScreen = isReportDamage || isFaqs || isServices || isNews || isNewsDetail || isFindOffices || isForms || isSignIn || isSignUp || isRoadStatus || isMyReports || isMyReportDetail || isFeedback || isApplications || isChat || isPlnInfo || isPlnWizard || isMyApplications || isApplicationDetail;
  const screenTitle = isReportDamage ? 'Report Road Damage' : isFaqs ? 'FAQs' : isServices ? 'Services' : isNews ? 'News' : isNewsDetail ? 'Article' : isFindOffices ? 'Find Offices' : isForms ? 'Forms' : isSignIn ? 'Sign in' : isSignUp ? 'Sign up' : isRoadStatus ? 'Road Status' : isMyReports ? 'My Reports' : isMyReportDetail ? 'Report details' : isFeedback ? 'Feedback' : isApplications ? 'Applications' : isChat ? 'Chat' : isPlnInfo ? 'PLN Application' : isPlnWizard ? 'PLN Application' : isMyApplications ? 'My Applications' : isApplicationDetail ? 'Application details' : 'Roads Authority';

  return (
    <SafeAreaProvider>
      <View style={styles.screen}>
        <StatusBar style="light" />
        <AppHeader
          logo={
            !isSubScreen ? (
              <Image
                source={require('./assets/ra logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
                accessibilityLabel="Roads Authority logo"
              />
            ) : null
          }
          welcomeMessage={isSubScreen ? null : 'Welcome'}
          title={screenTitle}
          showBack={isSubScreen}
          onBackPress={isSubScreen ? () => { if (isNewsDetail) { setScreen('news'); setSelectedArticle(null); } else if (isMyReportDetail) { setScreen('my-reports'); setSelectedReport(null); } else if (isFeedback) { setScreen('home'); } else if (isChat) { setScreen('home'); } else if (isPlnInfo) { setScreen('applications'); } else if (isPlnWizard) { setScreen('pln-info'); } else if (isMyApplications) { setScreen('applications'); } else if (isApplicationDetail) { setScreen('my-applications'); setSelectedApplication(null); } else { setScreen('home'); } } : undefined}
          showMenu={!isSubScreen}
          onMenuPress={() => setMenuVisible(true)}
        />
        {isReportDamage ? (
          <ReportRoadDamageScreen
            onBack={() => setScreen('home')}
            onSubmit={(data) => {
              setScreen('home');
            }}
          />
        ) : isFaqs ? (
          <FAQsScreen onBack={() => setScreen('home')} />
        ) : isServices ? (
          <ServicesScreen onBack={() => setScreen('home')} />
        ) : isNewsDetail ? (
          <NewsDetailScreen
            article={selectedArticle}
            onBack={() => { setScreen('news'); setSelectedArticle(null); }}
          />
        ) : isNews ? (
          <NewsScreen
            onBack={() => setScreen('home')}
            onSelectArticle={(article) => { setSelectedArticle(article); setScreen('news-detail'); }}
          />
        ) : isFindOffices ? (
          <FindOfficesScreen onBack={() => setScreen('home')} />
        ) : isForms ? (
          <FormsScreen onBack={() => setScreen('home')} />
        ) : isSignIn ? (
          <SignInScreen onBack={() => setScreen('home')} />
        ) : isSignUp ? (
          <SignUpScreen onBack={() => setScreen('home')} />
        ) : isRoadStatus ? (
          <RoadStatusScreen onBack={() => setScreen('home')} />
        ) : isMyReportDetail ? (
          <MyReportDetailScreen
            report={selectedReport}
            onBack={() => { setScreen('my-reports'); setSelectedReport(null); }}
          />
        ) : isMyReports ? (
          <MyReportsScreen
            onBack={() => setScreen('home')}
            onSelectReport={(report) => { setSelectedReport(report); setScreen('my-report-detail'); }}
          />
        ) : isFeedback ? (
          <FeedbackScreen onBack={() => setScreen('home')} />
        ) : isPlnWizard ? (
          <PLNApplicationWizardScreen
            onBack={() => setScreen('pln-info')}
            onSubmit={(data) => {
              setScreen('applications');
            }}
          />
        ) : isPlnInfo ? (
          <PLNApplicationInfoScreen
            onBack={() => setScreen('applications')}
            onStartApplication={() => setScreen('pln-wizard')}
          />
        ) : isApplicationDetail ? (
          <ApplicationDetailScreen
            application={selectedApplication}
            onBack={() => { setScreen('my-applications'); setSelectedApplication(null); }}
          />
        ) : isMyApplications ? (
          <MyApplicationsScreen
            onBack={() => setScreen('applications')}
            onSelectApplication={(app) => { setSelectedApplication(app); setScreen('application-detail'); }}
          />
        ) : isApplications ? (
          <ApplicationsScreen
            onBack={() => setScreen('home')}
            onPlnApplication={() => setScreen('pln-info')}
            onMyApplications={() => setScreen('my-applications')}
          />
        ) : isChat ? (
          <ChatScreen onBack={() => setScreen('home')} />
        ) : (
          <ScreenContainer>
            <SearchBar
              placeholder="Search the RA app"
              value={search}
              onChangeText={setSearch}
            />
            <View style={styles.searchSpacer} />
            {homeDesignOption === 1 && <HomeGridLayout items={serviceItems} />}
            {homeDesignOption === 2 && <HomeListLayout items={serviceItems} />}
            {homeDesignOption === 3 && <HomeCardsLayout items={serviceItems} />}
            <HomeDesignToggle value={homeDesignOption} onChange={setHomeDesignOption} />
            <Pressable style={styles.feedbackLinkWrap} onPress={() => setScreen('feedback')}>
              <Text style={styles.feedbackLink}>Send feedback</Text>
            </Pressable>
          </ScreenContainer>
        )}
        <HeaderMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onSignIn={() => setScreen('sign-in')}
          onSignUp={() => setScreen('sign-up')}
          onFeedback={() => setScreen('feedback')}
        />
        <BottomNavBar items={navItems} activeKey={activeTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#00B4E6',
  },
  headerLogo: {
    height: 40,
    width: 140,
    marginBottom: 4,
  },
  searchSpacer: {
    height: 20,
  },
  feedbackLinkWrap: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
  },
  feedbackLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B4E6',
  },
});
