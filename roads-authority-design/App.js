import React, { useState, useEffect } from 'react';
import { View, Image, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { authService } from './services/authService';
import { StatusBar } from 'expo-status-bar';
import { spacing } from './theme/spacing';
import { CONTENT_BACKGROUND } from './theme/colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  AppHeader,
  HomeHeader,
  HeaderMenu,
  ScreenContainer,
  BottomNavBar,
  HomeCarousel,
} from './components';
import { HomeDesignToggle } from './components/HomeDesignToggle';
import { HomeGridLayout, HomeListLayout, HomeCardsLayout, HomeSimpleTilesLayout, HomeTopicsLayout, HomeEmptyLayout } from './components/HomeScreenLayouts';
import { ReportRoadDamageScreen } from './screens/ReportRoadDamageScreen';
import { FindOfficesScreen } from './screens/FindOfficesScreen';
import { HelpScreen } from './screens/HelpScreen';
import { ContactScreen } from './screens/ContactScreen';
import { FormsScreen } from './screens/FormsScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { ForgotUsernameScreen } from './screens/ForgotUsernameScreen';
import { RoadStatusScreen } from './screens/RoadStatusScreen';
import { MyReportsScreen } from './screens/MyReportsScreen';
import { MyReportDetailScreen } from './screens/MyReportDetailScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
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
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NatisServicesScreen } from './screens/NatisServicesScreen';
import { NatisFaqsScreen } from './screens/NatisFaqsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LearnersLicenceTestScreen } from './screens/LearnersLicenceTestScreen';
import { LicenceUnlockScreen } from './screens/LicenceUnlockScreen';

function buildServiceItems(onViewDrivingLicence, onNatisServices, onReportDamage, onViewReport, onRoadStatus, onOffices, onFeedback, onSettings) {
  return [
    { key: 'view-driving-licence', iconName: 'id-card-outline', label: 'Driving Licence', onPress: onViewDrivingLicence },
    { key: 'natis-services', iconName: 'apps-outline', label: 'NaTIS Services', onPress: onNatisServices },
    { key: 'report-road-damage', iconName: 'warning-outline', label: 'Report Road Damage', onPress: onReportDamage },
    { key: 'view-report', iconName: 'document-text-outline', label: 'View Report', onPress: onViewReport },
    { key: 'road-status', iconName: 'trail-sign-outline', label: 'Road Status', onPress: onRoadStatus },
    { key: 'offices', iconName: 'location-outline', label: 'Offices', onPress: onOffices },
    { key: 'feed-back', iconName: 'chatbox-ellipses-outline', label: 'Feed Back', onPress: onFeedback },
    { key: 'settings', iconName: 'settings-outline', label: 'Settings', onPress: onSettings },
  ];
}

const NAV_ITEMS = [
  { key: 'home', iconName: 'home-outline', iconNameActive: 'home', label: 'Home', onPress: () => {} },
  { key: 'notifications', iconName: 'notifications-outline', iconNameActive: 'notifications', label: 'Notifications', onPress: () => {} },
  { key: 'help', iconName: 'help-circle-outline', iconNameActive: 'help-circle', label: 'Help', onPress: () => {} },
];

function getWelcomeMessage(user) {
  if (!user) return 'Welcome';
  const name = user.fullName?.trim();
  if (name) return `Welcome back, ${name.split(/\s+/)[0]}`;
  if (user.email) return `Welcome back, ${user.email.split('@')[0]}`;
  return 'Welcome back';
}

const MOCK_RENEWAL_ITEMS = [
  { id: 'driver', dueDate: '2026-01-20' },
  { id: 'vehicle-1', dueDate: '2026-06-18' },
];

function getRenewalAlertFlags(items = []) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const threeMonthsAhead = new Date(today);
  threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

  const hasExpired = items.some((item) => new Date(item.dueDate) < today);
  const hasAlmostDue = items.some((item) => {
    const due = new Date(item.dueDate);
    return due >= today && due <= threeMonthsAhead;
  });

  return {
    hasExpired,
    hasAlmostDue,
  };
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState('home');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [lastReportDamageLocation, setLastReportDamageLocation] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [homeDesignOption, setHomeDesignOption] = useState(6);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReturnScreen, setAuthReturnScreen] = useState('settings');
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [licenceUnlocked, setLicenceUnlocked] = useState(false);
  const [licenceUnlockChangePin, setLicenceUnlockChangePin] = useState(false);
  const { hasExpired, hasAlmostDue } = getRenewalAlertFlags(MOCK_RENEWAL_ITEMS);

  useEffect(() => {
    authService.getStoredUser().then(setCurrentUser);
    // Always start on Home Design "Extra" when app opens.
    setHomeDesignOption(6);
  }, []);

  useEffect(() => {
    if (screen === 'pln-wizard' && !currentUser) {
      setScreen('pln-info');
    }
  }, [screen, currentUser]);

  useEffect(() => {
    if (screen === 'licence-unlock' && !currentUser) {
      setAuthReturnScreen('licence-unlock');
      setScreen('sign-in');
    }
  }, [screen, currentUser]);

  useEffect(() => {
    if (screen === 'my-licences' && !licenceUnlocked) {
      setScreen('licence-unlock');
    }
  }, [screen, licenceUnlocked]);

  const openDrivingLicence = () => {
    if (!currentUser) {
      setAuthReturnScreen('licence-unlock');
      setScreen('sign-in');
      return;
    }
    setLicenceUnlocked(false);
    setLicenceUnlockChangePin(false);
    setScreen('licence-unlock');
  };

  const serviceItems = buildServiceItems(
    openDrivingLicence,
    () => setScreen('natis-services'),
    () => setScreen('report-damage'),
    () => setScreen('my-reports'),
    () => setScreen('road-status'),
    () => setScreen('find-offices'),
    () => setScreen('feedback'),
    () => setScreen('settings')
  );
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    onPress: () => {
      setActiveTab(item.key);
      if (item.key === 'home') setScreen('home');
      else if (item.key === 'notifications') setScreen('notifications');
      else if (item.key === 'help') setScreen('help');
    },
  }));

  const handleExtraHomeMenuPress = (key) => {
    if (key === 'natis-services') setScreen('natis-services');
    else if (key === 'view-driving-licence') openDrivingLicence();
    else if (key === 'report-road-damage') setScreen('report-damage');
    else if (key === 'view-report') setScreen('my-reports');
    else if (key === 'road-status') setScreen('road-status');
    else if (key === 'offices') setScreen('find-offices');
    else if (key === 'downloads') setScreen('downloads');
    else if (key === 'feed-back') setScreen('feedback');
    else if (key === 'settings') setScreen('settings');
  };

  const handleNatisServicesMenuPress = (key) => {
    if (key === 'view-driving-licence') openDrivingLicence();
    else if (key === 'faqs') setScreen('natis-faqs');
    else if (key === 'renew-vehicle') setScreen('vehicles-due');
    else if (key === 'learner-test') setScreen('learners-licence-test');
    else if (key === 'driving-test' || key === 'forms') setScreen('downloads');
  };

  const isReportDamage = screen === 'report-damage';
  const isFaqs = screen === 'faqs';
  const isFindOffices = screen === 'find-offices';
  const isHelp = screen === 'help';
  const isContact = screen === 'contact';
  const isForms = screen === 'downloads';
  const isSignIn = screen === 'sign-in';
  const isSignUp = screen === 'sign-up';
  const isForgotPassword = screen === 'forgot-password';
  const isForgotUsername = screen === 'forgot-username';
  const isRoadStatus = screen === 'road-status';
  const isMyReports = screen === 'my-reports';
  const isMyReportDetail = screen === 'my-report-detail';
  const isFeedback = screen === 'feedback';
  const isFeedbackSuccess = screen === 'feedback-success';
  const isPlnInfo = screen === 'pln-info';
  const isPlnWizard = screen === 'pln-wizard';
  const isMyApplications = screen === 'my-applications';
  const isApplicationDetail = screen === 'application-detail';
  const isPayment = screen === 'payment';
  const isReportDamageSuccess = screen === 'report-damage-success';
  const isPlnApplicationSuccess = screen === 'pln-application-success';
  const isReportDamageMap = screen === 'report-damage-map';
  const isLicenceUnlock = screen === 'licence-unlock';
  const isMyLicences = screen === 'my-licences';
  const isVehiclesDue = screen === 'vehicles-due';
  const isVehicleDetail = screen === 'vehicle-detail';
  const isNotifications = screen === 'notifications';
  const isNatisServices = screen === 'natis-services';
  const isNatisFaqs = screen === 'natis-faqs';
  const isSettings = screen === 'settings';
  const isLearnersLicenceTest = screen === 'learners-licence-test';
  const isSubScreen = isReportDamage || isFaqs || isFindOffices || isHelp || isContact || isForms || isSignIn || isSignUp || isForgotPassword || isForgotUsername || isRoadStatus || isMyReports || isMyReportDetail || isFeedback || isFeedbackSuccess || isPlnInfo || isPlnWizard || isMyApplications || isApplicationDetail || isPayment || isReportDamageSuccess || isPlnApplicationSuccess || isReportDamageMap || isLicenceUnlock || isMyLicences || isVehiclesDue || isVehicleDetail || isNotifications || isNatisServices || isNatisFaqs || isSettings || isLearnersLicenceTest;
  const screenTitle = isReportDamage ? 'Report Road Damage' : isFaqs ? 'FAQs' : isFindOffices ? 'Find Offices' : isHelp ? 'Help' : isContact ? 'Contact' : isForms ? 'Forms' : isSignIn ? '' : isSignUp ? '' : isForgotPassword ? '' : isForgotUsername ? '' : isRoadStatus ? 'Road Status' : isMyReports ? 'View Report' : isMyReportDetail ? 'Report details' : isFeedback ? '' : isFeedbackSuccess ? 'Submission successful' : isPlnInfo ? 'PLN Application' : isPlnWizard ? 'PLN Application' : isMyApplications ? 'My Applications' : isApplicationDetail ? 'Application details' : isPayment ? 'Pay online' : isReportDamageSuccess ? 'Submission successful' : isPlnApplicationSuccess ? 'Application submitted' : isReportDamageMap ? 'Report on map' : isLicenceUnlock ? (licenceUnlockChangePin ? 'Change licence PIN' : 'Driving Licence') : isMyLicences ? 'Driving Licence' : isVehiclesDue ? 'Vehicle Disk Renewal' : isVehicleDetail ? 'Vehicle details' : isNotifications ? 'Notifications' : isNatisServices ? 'NaTIS Services' : isNatisFaqs ? '' : isSettings ? 'Settings' : isLearnersLicenceTest ? 'Bookings' : '';

  const handleBackPress = () => {
    if (isMyReportDetail) {
      setScreen('my-reports');
      setSelectedReport(null);
      return;
    }
    if (isPlnWizard) {
      setScreen('pln-info');
      return;
    }
    if (isApplicationDetail) {
      setScreen('my-applications');
      setSelectedApplication(null);
      return;
    }
    if (isPayment) {
      setScreen('application-detail');
      return;
    }
    if (isVehicleDetail) {
      setScreen('vehicles-due');
      setSelectedVehicle(null);
      return;
    }
    if (isForgotPassword || isForgotUsername) {
      setScreen('sign-in');
      return;
    }
    if (isNatisFaqs) {
      setScreen('natis-services');
      return;
    }
    if (isLearnersLicenceTest) {
      setScreen('natis-services');
      return;
    }
    if (isLicenceUnlock || isMyLicences) {
      setLicenceUnlocked(false);
      setLicenceUnlockChangePin(false);
    }
    setScreen('home');
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={styles.screen}>
        <StatusBar style="light" />
        {screen === 'home' ? (
          <HomeHeader
            welcomeMessage={getWelcomeMessage(currentUser)}
            showMenu={!!currentUser}
            onMenuPress={() => setMenuVisible(true)}
            showNotificationBell
            showExpiredDot={hasExpired}
            showAlmostDueDot={hasAlmostDue}
            onNotificationPress={() => {
              setActiveTab('notifications');
              setScreen('notifications');
            }}
            searchValue={homeSearchQuery}
            onSearchChangeText={setHomeSearchQuery}
            onSearchSubmit={() => {
              setActiveTab('help');
              setScreen('help');
            }}
          />
        ) : (
          <AppHeader
            logo={
              <View style={styles.headerLogoRow}>
                <Image
                  source={require('./assets/ra logo.png')}
                  style={styles.headerRaLogo}
                  resizeMode="contain"
                  accessibilityLabel="Roads Authority logo"
                />
              </View>
            }
            welcomeMessage={!isSubScreen ? getWelcomeMessage(currentUser) : null}
            title={screenTitle}
            showBack={isSubScreen}
            onBackPress={isSubScreen ? handleBackPress : undefined}
            showMenu={!isSubScreen && !!currentUser}
            onMenuPress={() => setMenuVisible(true)}
            showNotificationBell={false}
            showExpiredDot={false}
            showAlmostDueDot={false}
            onNotificationPress={undefined}
          />
        )}
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
            message="Your road damage report was submitted."
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
          />
        ) : isLicenceUnlock ? (
          <LicenceUnlockScreen
            user={currentUser}
            changePin={licenceUnlockChangePin}
            onUnlocked={() => {
              setLicenceUnlocked(true);
              setLicenceUnlockChangePin(false);
              setScreen('my-licences');
            }}
            onCancel={() => {
              setLicenceUnlockChangePin(false);
              setScreen(licenceUnlockChangePin ? 'settings' : 'home');
            }}
          />
        ) : isMyLicences ? (
          <MyLicencesScreen
            onBack={() => {
              setLicenceUnlocked(false);
              setScreen('home');
            }}
          />
        ) : isVehiclesDue ? (
          <VehiclesDueForRenewalScreen
            onBack={() => setScreen('home')}
            onSelectVehicle={(vehicle) => {
              setSelectedVehicle(vehicle);
              setScreen('vehicle-detail');
            }}
          />
        ) : isVehicleDetail ? (
          <VehicleDetailScreen vehicle={selectedVehicle} />
        ) : isNotifications ? (
          <NotificationsScreen onBack={() => setScreen('home')} />
        ) : isFindOffices ? (
          <FindOfficesScreen onBack={() => setScreen('home')} />
        ) : isContact ? (
          <ContactScreen onBack={() => setScreen('home')} />
        ) : isForms ? (
          <FormsScreen onBack={() => setScreen('home')} />
        ) : isLearnersLicenceTest ? (
          <LearnersLicenceTestScreen onCancel={() => setScreen('natis-services')} />
        ) : isSignIn ? (
          <SignInScreen
            onBack={() => setScreen(authReturnScreen)}
            onSignInSuccess={(user) => { setCurrentUser(user); }}
            onGoToSignUp={() => setScreen('sign-up')}
            onGoToForgotPassword={() => setScreen('forgot-password')}
            onGoToForgotUsername={() => setScreen('forgot-username')}
          />
        ) : isSignUp ? (
          <SignUpScreen
            onBack={() => setScreen(authReturnScreen)}
            onSignUpSuccess={(user) => { setCurrentUser(user); }}
            onGoToSignIn={() => setScreen('sign-in')}
          />
        ) : isForgotPassword ? (
          <ForgotPasswordScreen onCancel={() => setScreen('sign-in')} />
        ) : isForgotUsername ? (
          <ForgotUsernameScreen onCancel={() => setScreen('sign-in')} />
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
          <FeedbackScreen
            onBack={() => setScreen('home')}
            onSubmit={() => setScreen('feedback-success')}
          />
        ) : isFeedbackSuccess ? (
          <SuccessScreen
            message="Your feedback was submitted."
            buttonText="Back to Home"
            onDone={() => setScreen('home')}
          />
        ) : isPlnWizard ? (
          <PLNApplicationWizardScreen
            onBack={() => setScreen('pln-info')}
            onSubmit={() => setScreen('pln-application-success')}
          />
        ) : isPlnApplicationSuccess ? (
          <SuccessScreen
            message="Your PLN application was submitted."
            buttonText="Back to Home"
            onDone={() => setScreen('home')}
          />
        ) : isPlnInfo ? (
          <PLNApplicationInfoScreen
            onBack={() => setScreen('home')}
            onStartApplication={() => setScreen('pln-wizard')}
            isLoggedIn={!!currentUser}
            onSignInRequired={() => {
              setAuthReturnScreen('pln-info');
              setScreen('sign-in');
            }}
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
            onBack={() => setScreen('home')}
            onSelectApplication={(app) => { setSelectedApplication(app); setScreen('application-detail'); }}
          />
        ) : isNatisServices ? (
          <NatisServicesScreen onMenuItemPress={handleNatisServicesMenuPress} />
        ) : isNatisFaqs ? (
          <NatisFaqsScreen />
        ) : isSettings ? (
          <SettingsScreen
            user={currentUser}
            onSignIn={() => {
              setAuthReturnScreen('settings');
              setScreen('sign-in');
            }}
            onSignUp={() => {
              setAuthReturnScreen('settings');
              setScreen('sign-up');
            }}
            onChangeLicencePin={() => {
              if (!currentUser) {
                setAuthReturnScreen('settings');
                setScreen('sign-in');
                return;
              }
              setLicenceUnlockChangePin(true);
              setLicenceUnlocked(false);
              setScreen('licence-unlock');
            }}
            onLogout={async () => {
              await authService.logout();
              setCurrentUser(null);
              setLicenceUnlocked(false);
              setScreen('home');
            }}
          />
        ) : (
          <KeyboardAvoidingView
            style={styles.homeWrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <ScreenContainer roundedTop contentContainerStyle={styles.homeContent}>
              {homeDesignOption === 1 && <HomeGridLayout items={serviceItems} />}
              {homeDesignOption === 2 && <HomeListLayout items={serviceItems} />}
              {homeDesignOption === 3 && <HomeCardsLayout items={serviceItems} />}
              {homeDesignOption === 4 && <HomeSimpleTilesLayout items={serviceItems} />}
              {homeDesignOption === 5 && <HomeTopicsLayout items={serviceItems} />}
              {homeDesignOption === 6 && <HomeEmptyLayout onMenuItemPress={handleExtraHomeMenuPress} />}
              <HomeDesignToggle value={homeDesignOption} onChange={setHomeDesignOption} />
            </ScreenContainer>
          </KeyboardAvoidingView>
        )}
        <HeaderMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          isLoggedIn={!!currentUser}
          onSignOut={async () => {
            await authService.logout();
            setCurrentUser(null);
          }}
        />
        {(screen === 'home' || screen === 'natis-services') && <HomeCarousel />}
        <BottomNavBar items={navItems} activeKey={activeTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
  },
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    gap: spacing.md,
  },
  headerRaLogo: {
    width: 88,
    height: 88,
  },
  homeWrapper: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
  },
  homeContent: {
    paddingTop: spacing.lg,
  },
});
