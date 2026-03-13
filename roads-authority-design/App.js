import React, { useState, useEffect } from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { authService } from './services/authService';
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
import { HomeGridLayout, HomeListLayout, HomeCardsLayout, HomeSimpleTilesLayout, HomeTopicsLayout } from './components/HomeScreenLayouts';
import { HomeSearchWithSuggestions } from './components/HomeSearchWithSuggestions';
import { searchAppContent } from './data/searchIndex';
import { ReportRoadDamageScreen } from './screens/ReportRoadDamageScreen';
import { ServicesScreen } from './screens/ServicesScreen';
import { NewsScreen } from './screens/NewsScreen';
import { NewsDetailScreen } from './screens/NewsDetailScreen';
import { FindOfficesScreen } from './screens/FindOfficesScreen';
import { HelpScreen } from './screens/HelpScreen';
import { ContactScreen } from './screens/ContactScreen';
import { FormsScreen } from './screens/FormsScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { RoadStatusScreen } from './screens/RoadStatusScreen';
import { MyReportsScreen } from './screens/MyReportsScreen';
import { MyReportDetailScreen } from './screens/MyReportDetailScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { ChatScreen } from './screens/ChatScreen';
import { PLNApplicationInfoScreen } from './screens/PLNApplicationInfoScreen';
import { PLNApplicationWizardScreen } from './screens/PLNApplicationWizardScreen';
import { MyApplicationsScreen } from './screens/MyApplicationsScreen';
import { ApplicationDetailScreen } from './screens/ApplicationDetailScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { ReportDamageMapScreen } from './screens/ReportDamageMapScreen';
import { MyLicencesScreen } from './screens/MyLicencesScreen';
import { VehiclesDueForRenewalScreen } from './screens/VehiclesDueForRenewalScreen';
import { VehicleDetailScreen } from './screens/VehicleDetailScreen';

function buildServiceItems(onReportDamage, onServices, onMyLicences, onVehiclesDue, onNews, onFindOffices, onForms, onRoadStatus, onMyReports, onFeedback) {
  return [
    { key: 'services', iconName: 'construct-outline', label: 'Services', onPress: onServices },
    { key: 'my-licence', iconName: 'id-card-outline', label: 'My licence', onPress: onMyLicences },
    { key: 'vehicles-due', iconName: 'car-outline', label: 'Vehicles due', onPress: onVehiclesDue },
    { key: 'road-status', iconName: 'trail-sign-outline', label: 'Road Status', onPress: onRoadStatus },
    { key: 'report-damage', iconName: 'warning-outline', label: 'Report Road Damage', onPress: onReportDamage },
    { key: 'reports', iconName: 'document-text-outline', label: 'My Reports', onPress: onMyReports },
    { key: 'forms', iconName: 'documents-outline', label: 'Downloads', onPress: onForms },
    { key: 'find-offices', iconName: 'location-outline', label: 'Find Offices', onPress: onFindOffices },
    { key: 'news', iconName: 'newspaper-outline', label: 'News', onPress: onNews },
    { key: 'feedback', iconName: 'chatbox-ellipses-outline', label: 'Feedback', onPress: onFeedback },
  ];
}

const NAV_ITEMS = [
  { key: 'home', iconName: 'home-outline', iconNameActive: 'home', label: 'Home', onPress: () => {} },
  { key: 'services', iconName: 'construct-outline', iconNameActive: 'construct', label: 'Services', onPress: () => {} },
  { key: 'contact', iconName: 'call-outline', iconNameActive: 'call', label: 'Contact', onPress: () => {} },
  { key: 'help', iconName: 'help-circle-outline', iconNameActive: 'help-circle', label: 'Help', onPress: () => {} },
  { key: 'chat', iconName: 'chatbubble-outline', iconNameActive: 'chatbubble', label: 'Chat', onPress: () => {} },
];

function getWelcomeMessage(user) {
  if (!user) return 'Welcome';
  const name = user.fullName?.trim();
  if (name) return `Welcome, ${name.split(/\s+/)[0]}`;
  if (user.email) return `Welcome, ${user.email.split('@')[0]}`;
  return 'Welcome';
}

export default function App() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState('home');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [lastReportDamageLocation, setLastReportDamageLocation] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [homeDesignOption, setHomeDesignOption] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    authService.getStoredUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (screen === 'pln-wizard' && !currentUser) {
      setScreen('pln-info');
    }
  }, [screen, currentUser]);

  const serviceItems = buildServiceItems(
    () => setScreen('report-damage'),
    () => setScreen('services'),
    () => setScreen('my-licences'),
    () => setScreen('vehicles-due'),
    () => setScreen('news'),
    () => setScreen('find-offices'),
    () => setScreen('downloads'),
    () => setScreen('road-status'),
    () => setScreen('my-reports'),
    () => setScreen('feedback')
  );
  const getSearchSuggestions = (query) => searchAppContent(query);
  const handleSearchSelect = (result) => {
    setSearch('');
    if (result.type === 'news') {
      setSelectedArticle(result.payload);
      setScreen('news-detail');
    } else if (result.type === 'faq') {
      setScreen('help');
    } else if (result.type === 'form') {
      setScreen('downloads');
    } else if (result.type === 'service') {
      setScreen('services');
    } else if (result.type === 'road') {
      setScreen('road-status');
    } else if (result.type === 'office') {
      setScreen('find-offices');
    }
  };
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    onPress: () => {
      setActiveTab(item.key);
      if (item.key === 'home') setScreen('home');
      else if (item.key === 'services') setScreen('services');
      else if (item.key === 'contact') setScreen('contact');
      else if (item.key === 'help') setScreen('help');
      else if (item.key === 'chat') setScreen('chat');
    },
  }));

  const isReportDamage = screen === 'report-damage';
  const isFaqs = screen === 'faqs';
  const isServices = screen === 'services';
  const isNews = screen === 'news';
  const isNewsDetail = screen === 'news-detail';
  const isFindOffices = screen === 'find-offices';
  const isHelp = screen === 'help';
  const isContact = screen === 'contact';
  const isForms = screen === 'downloads';
  const isSignIn = screen === 'sign-in';
  const isSignUp = screen === 'sign-up';
  const isRoadStatus = screen === 'road-status';
  const isMyReports = screen === 'my-reports';
  const isMyReportDetail = screen === 'my-report-detail';
  const isFeedback = screen === 'feedback';
  const isChat = screen === 'chat';
  const isPlnInfo = screen === 'pln-info';
  const isPlnWizard = screen === 'pln-wizard';
  const isMyApplications = screen === 'my-applications';
  const isApplicationDetail = screen === 'application-detail';
  const isPayment = screen === 'payment';
  const isReportDamageSuccess = screen === 'report-damage-success';
  const isPlnApplicationSuccess = screen === 'pln-application-success';
  const isReportDamageMap = screen === 'report-damage-map';
  const isMyLicences = screen === 'my-licences';
  const isVehiclesDue = screen === 'vehicles-due';
  const isVehicleDetail = screen === 'vehicle-detail';
  const isSubScreen = isReportDamage || isFaqs || isServices || isNews || isNewsDetail || isFindOffices || isHelp || isContact || isForms || isSignIn || isSignUp || isRoadStatus || isMyReports || isMyReportDetail || isFeedback || isChat || isPlnInfo || isPlnWizard || isMyApplications || isApplicationDetail || isPayment || isReportDamageSuccess || isPlnApplicationSuccess || isReportDamageMap || isMyLicences || isVehiclesDue || isVehicleDetail;
  const screenTitle = isReportDamage ? 'Report Road Damage' : isFaqs ? 'FAQs' : isServices ? 'Services' : isNews ? 'News' : isNewsDetail ? 'Article' : isFindOffices ? 'Find Offices' : isHelp ? 'Help' : isContact ? 'Contact' : isForms ? 'Downloads' : isSignIn ? 'Sign in' : isSignUp ? 'Sign up' : isRoadStatus ? 'Road Status' : isMyReports ? 'My Reports' : isMyReportDetail ? 'Report details' : isFeedback ? 'Feedback' : isChat ? 'Chat' : isPlnInfo ? 'PLN Application' : isPlnWizard ? 'PLN Application' : isMyApplications ? 'My Applications' : isApplicationDetail ? 'Application details' : isPayment ? 'Pay online' : isReportDamageSuccess ? 'Submission successful' : isPlnApplicationSuccess ? 'Application submitted' : isReportDamageMap ? 'Report on map' : isMyLicences ? 'My licence' : isVehiclesDue ? 'Vehicles due for renewal' : isVehicleDetail ? 'Vehicle details' : 'Roads Authority';

  return (
    <SafeAreaProvider>
      <View style={styles.screen}>
        <StatusBar style="light" />
        <AppHeader
          logo={
            <Image
              source={require('./assets/ra logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
              accessibilityLabel="Roads Authority logo"
            />
          }
          welcomeMessage={isSubScreen ? null : getWelcomeMessage(currentUser)}
          title={screenTitle}
          showBack={isSubScreen}
          onBackPress={isSubScreen ? () => { if (isNewsDetail) { setScreen('news'); setSelectedArticle(null); } else if (isMyReportDetail) { setScreen('my-reports'); setSelectedReport(null); } else if (isFeedback) { setScreen('home'); } else if (isChat) { setScreen('home'); } else if (isHelp) { setScreen('home'); } else if (isPlnInfo) { setScreen('services'); } else if (isPlnWizard) { setScreen('pln-info'); } else if (isMyApplications) { setScreen('services'); } else if (isApplicationDetail) { setScreen('my-applications'); setSelectedApplication(null); } else if (isPayment) { setScreen('application-detail'); } else if (isReportDamageSuccess || isPlnApplicationSuccess || isReportDamageMap) { setScreen('home'); } else if (isVehicleDetail) { setScreen('vehicles-due'); setSelectedVehicle(null); } else if (isMyLicences || isVehiclesDue) { setScreen('services'); } else { setScreen('home'); } } : undefined}
          showMenu={!isSubScreen}
          onMenuPress={() => setMenuVisible(true)}
        />
        {isReportDamage ? (
          <ReportRoadDamageScreen
            onBack={() => setScreen('home')}
            onSubmit={(data) => {
              setLastReportDamageLocation(data?.location ?? null);
              setScreen('report-damage-success');
            }}
          />
        ) : isReportDamageSuccess ? (
          <SuccessScreen
            title="Report submitted"
            message="Your road damage report has been submitted successfully. You can track its status under My Reports."
            buttonText="Back to Home"
            onDone={() => setScreen('home')}
          />
        ) : isReportDamageMap ? (
          <ReportDamageMapScreen
            location={lastReportDamageLocation}
            onBack={() => setScreen('home')}
          />
        ) : isFaqs || isHelp ? (
          <HelpScreen
            onBack={() => setScreen('home')}
            onOpenChat={() => setScreen('chat')}
          />
        ) : isServices ? (
          <ServicesScreen
            onBack={() => setScreen('home')}
            onPlnApplication={() => setScreen('pln-info')}
            onMyApplications={() => setScreen('my-applications')}
            onMyLicences={() => setScreen('my-licences')}
            onVehiclesDue={() => setScreen('vehicles-due')}
          />
        ) : isMyLicences ? (
          <MyLicencesScreen onBack={() => setScreen('services')} />
        ) : isVehiclesDue ? (
          <VehiclesDueForRenewalScreen
            onBack={() => setScreen('services')}
            onSelectVehicle={(vehicle) => {
              setSelectedVehicle(vehicle);
              setScreen('vehicle-detail');
            }}
          />
        ) : isVehicleDetail ? (
          <VehicleDetailScreen vehicle={selectedVehicle} />
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
        ) : isContact ? (
          <ContactScreen onBack={() => setScreen('home')} />
        ) : isForms ? (
          <FormsScreen onBack={() => setScreen('home')} />
        ) : isSignIn ? (
          <SignInScreen
            onBack={() => setScreen('home')}
            onSignInSuccess={(user) => { setCurrentUser(user); }}
          />
        ) : isSignUp ? (
          <SignUpScreen
            onBack={() => setScreen('home')}
            onSignUpSuccess={(user) => { setCurrentUser(user); }}
          />
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
            onSubmit={() => setScreen('pln-application-success')}
          />
        ) : isPlnApplicationSuccess ? (
          <SuccessScreen
            title="Application submitted"
            message="Your PLN application has been received. You can track its status under My Applications. Review usually takes 5–7 working days."
            buttonText="Back to Services"
            onDone={() => setScreen('services')}
          />
        ) : isPlnInfo ? (
          <PLNApplicationInfoScreen
            onBack={() => setScreen('services')}
            onStartApplication={() => setScreen('pln-wizard')}
            isLoggedIn={!!currentUser}
            onSignInRequired={() => setScreen('sign-in')}
          />
        ) : isApplicationDetail ? (
          <ApplicationDetailScreen
            application={selectedApplication}
            onBack={() => { setScreen('my-applications'); setSelectedApplication(null); }}
            onFindOffices={() => setScreen('find-offices')}
            onPayOnline={() => setScreen('payment')}
          />
        ) : isPayment ? (
          <PaymentScreen
            application={selectedApplication}
            onBack={() => setScreen('application-detail')}
            onPaymentSuccess={() => setScreen('application-detail')}
          />
        ) : isMyApplications ? (
          <MyApplicationsScreen
            onBack={() => setScreen('services')}
            onSelectApplication={(app) => { setSelectedApplication(app); setScreen('application-detail'); }}
          />
        ) : isChat ? (
          <ChatScreen onBack={() => setScreen('home')} />
        ) : (
          <ScreenContainer>
            <HomeSearchWithSuggestions
              value={search}
              onChangeText={setSearch}
              getSuggestions={getSearchSuggestions}
              onSelectSuggestion={handleSearchSelect}
            />
            <View style={styles.searchSpacer} />
            {homeDesignOption === 1 && <HomeGridLayout items={serviceItems} />}
            {homeDesignOption === 2 && <HomeListLayout items={serviceItems} />}
            {homeDesignOption === 3 && <HomeCardsLayout items={serviceItems} />}
            {homeDesignOption === 4 && <HomeSimpleTilesLayout items={serviceItems} />}
            {homeDesignOption === 5 && <HomeTopicsLayout items={serviceItems} />}
            <HomeDesignToggle value={homeDesignOption} onChange={setHomeDesignOption} />
          </ScreenContainer>
        )}
        <HeaderMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          isLoggedIn={!!currentUser}
          onSignIn={() => setScreen('sign-in')}
          onSignUp={() => setScreen('sign-up')}
          onSignOut={async () => {
            await authService.logout();
            setCurrentUser(null);
          }}
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
});
