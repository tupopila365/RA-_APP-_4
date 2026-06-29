import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
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
  ScreenTransitionOverlay,
  RaLogoRing,
} from './components';
import { useScreenTransition } from './hooks/useScreenTransition';
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
import { MyProfileHubScreen } from './screens/MyProfileHubScreen';
import { AccountDetailsScreen } from './screens/AccountDetailsScreen';
import { RegisteredVehiclesScreen } from './screens/RegisteredVehiclesScreen';
import { AppSettingsScreen } from './screens/AppSettingsScreen';
import { PreferencesScreen } from './screens/PreferencesScreen';
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
    { key: 'settings', iconName: 'person-outline', label: 'My Profile', onPress: onSettings },
  ];
}

const NAV_ITEMS = [
  { key: 'home', iconName: 'home-outline', iconNameActive: 'home', label: 'Home', onPress: () => {} },
  { key: 'notifications', iconName: 'chatbubble-outline', iconNameActive: 'chatbubble', label: 'Messages', onPress: () => {} },
  { key: 'help', iconName: 'information-circle-outline', iconNameActive: 'information-circle', label: 'Info', onPress: () => {} },
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
  const [vehicleDetailReturnScreen, setVehicleDetailReturnScreen] = useState('vehicles-due');
  const [licenceUnlocked, setLicenceUnlocked] = useState(false);
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [notificationsUnlocked, setNotificationsUnlocked] = useState(false);
  const [pinUnlockTarget, setPinUnlockTarget] = useState('my-licences');
  const [licenceUnlockChangePin, setLicenceUnlockChangePin] = useState(false);
  const { transitionVisible, transitionTo } = useScreenTransition();
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
      setPinUnlockTarget('my-licences');
      setScreen('licence-unlock');
    }
  }, [screen, licenceUnlocked]);

  useEffect(() => {
    if (screen === 'settings' && currentUser && !settingsUnlocked && !licenceUnlockChangePin) {
      setPinUnlockTarget('settings');
      setScreen('licence-unlock');
    }
  }, [screen, currentUser, settingsUnlocked, licenceUnlockChangePin]);

  useEffect(() => {
    if (screen === 'notifications' && currentUser && !notificationsUnlocked && !licenceUnlockChangePin) {
      setPinUnlockTarget('notifications');
      setScreen('licence-unlock');
    }
  }, [screen, currentUser, notificationsUnlocked, licenceUnlockChangePin]);

  // Forward navigation: show the transparent loader, mount the next screen
  // behind it, then reveal it. Use plain setScreen for back/auth/success.
  const go = (action) => {
    const navigate = typeof action === 'function' ? action : () => setScreen(action);
    transitionTo(navigate);
  };

  const openDrivingLicence = () => {
    if (!currentUser) {
      go(() => {
        setAuthReturnScreen('licence-unlock');
        setPinUnlockTarget('my-licences');
        setScreen('sign-in');
      });
      return;
    }
    go(() => {
      setLicenceUnlocked(false);
      setLicenceUnlockChangePin(false);
      setPinUnlockTarget('my-licences');
      setScreen('licence-unlock');
    });
  };

  const openSettings = () => {
    if (!currentUser) {
      go(() => {
        setAuthReturnScreen('licence-unlock');
        setPinUnlockTarget('settings');
        setScreen('sign-in');
      });
      return;
    }
    go(() => {
      setSettingsUnlocked(false);
      setLicenceUnlockChangePin(false);
      setPinUnlockTarget('settings');
      setScreen('licence-unlock');
    });
  };

  const openNotifications = () => {
    if (!currentUser) {
      go(() => {
        setAuthReturnScreen('licence-unlock');
        setPinUnlockTarget('notifications');
        setScreen('sign-in');
      });
      return;
    }
    go(() => {
      setNotificationsUnlocked(false);
      setLicenceUnlockChangePin(false);
      setPinUnlockTarget('notifications');
      setScreen('licence-unlock');
    });
  };

  const handlePinUnlockSuccess = () => {
    go(() => {
      setLicenceUnlockChangePin(false);
      if (pinUnlockTarget === 'settings') {
        setSettingsUnlocked(true);
        setScreen('settings');
      } else if (pinUnlockTarget === 'notifications') {
        setNotificationsUnlocked(true);
        setActiveTab('notifications');
        setScreen('notifications');
      } else {
        setLicenceUnlocked(true);
        setScreen('my-licences');
      }
    });
  };

  const cancelPinUnlock = () => {
    const returnToSettings = licenceUnlockChangePin;
    const wasNotifications = pinUnlockTarget === 'notifications';
    setLicenceUnlockChangePin(false);
    if (wasNotifications) setActiveTab('home');
    setScreen(returnToSettings ? 'settings' : 'home');
  };

  const openLicencePinSettings = () => {
    if (!currentUser) {
      go(() => {
        setAuthReturnScreen('licence-unlock');
        setPinUnlockTarget('settings');
        setScreen('sign-in');
      });
      return;
    }
    go(() => {
      setLicenceUnlockChangePin(true);
      setScreen('licence-unlock');
    });
  };

  const serviceItems = buildServiceItems(
    openDrivingLicence,
    () => go('natis-services'),
    () => go('report-damage'),
    () => go('my-reports'),
    () => go('road-status'),
    () => go('find-offices'),
    () => go('feedback'),
    openSettings
  );
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    onPress: () => {
      if (item.key === 'home') {
        setActiveTab(item.key);
        setScreen('home');
      } else if (item.key === 'notifications') {
        openNotifications();
      } else if (item.key === 'help') {
        setActiveTab(item.key);
        go('help');
      }
    },
  }));

  const handleExtraHomeMenuPress = (key) => {
    if (key === 'natis-services') go('natis-services');
    else if (key === 'view-driving-licence') openDrivingLicence();
    else if (key === 'report-road-damage') go('report-damage');
    else if (key === 'view-report') go('my-reports');
    else if (key === 'road-status') go('road-status');
    else if (key === 'offices') go('find-offices');
    else if (key === 'downloads') go('downloads');
    else if (key === 'feed-back') go('feedback');
    else if (key === 'settings') openSettings();
  };

  const handleNatisServicesMenuPress = (key) => {
    if (key === 'view-driving-licence') openDrivingLicence();
    else if (key === 'faqs') go('natis-faqs');
    else if (key === 'renew-vehicle') go('vehicles-due');
    else if (key === 'learner-test') go('learners-licence-test');
    else if (key === 'driving-test' || key === 'forms') go('downloads');
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
  const isProfileAccount = screen === 'profile-account';
  const isProfileVehicles = screen === 'profile-vehicles';
  const isProfileAppSettings = screen === 'profile-app-settings';
  const isProfilePreferences = screen === 'profile-preferences';
  const isLearnersLicenceTest = screen === 'learners-licence-test';
  const isProfileScreen = isSettings || isProfileAccount || isProfileVehicles || isProfileAppSettings || isProfilePreferences;
  const isSuccessScreen = isFeedbackSuccess || isReportDamageSuccess || isPlnApplicationSuccess;
  const isSubScreen = isReportDamage || isFaqs || isFindOffices || isHelp || isContact || isForms || isSignIn || isSignUp || isForgotPassword || isForgotUsername || isRoadStatus || isMyReports || isMyReportDetail || isFeedback || isPlnInfo || isPlnWizard || isMyApplications || isApplicationDetail || isPayment || isReportDamageMap || isMyLicences || isVehiclesDue || isVehicleDetail || isNotifications || isNatisServices || isNatisFaqs || isProfileScreen || isLearnersLicenceTest;
  const screenTitle = isReportDamage ? 'Report Road Damage' : isFaqs ? 'FAQs' : isFindOffices ? 'Find Offices' : isHelp ? 'Info' : isContact ? 'Contact' : isForms ? 'Forms' : isSignIn ? '' : isSignUp ? '' : isForgotPassword ? '' : isForgotUsername ? '' : isRoadStatus ? 'Road Status' : isMyReports ? 'View Report' : isMyReportDetail ? 'Report details' : isFeedback ? '' : isPlnInfo ? 'PLN Application' : isPlnWizard ? 'PLN Application' : isMyApplications ? 'My Applications' : isApplicationDetail ? 'Application details' : isPayment ? 'Pay online' : isReportDamageMap ? 'Report on map' : isMyLicences ? 'Driving Licence' : isVehiclesDue ? 'Vehicle Disk Renewal' : isVehicleDetail ? 'Vehicle details' : isNotifications ? 'Messages' : isNatisServices ? 'NaTIS Services' : isNatisFaqs ? '' : isSettings ? 'My Profile' : isProfileAccount ? 'Account details' : isProfileVehicles ? 'Registered vehicles' : isProfileAppSettings ? 'Settings' : isProfilePreferences ? 'Preferences' : isLearnersLicenceTest ? 'Bookings' : '';

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
      setScreen(vehicleDetailReturnScreen);
      setSelectedVehicle(null);
      return;
    }
    if (isProfilePreferences) {
      setScreen('profile-app-settings');
      return;
    }
    if (isProfileAccount || isProfileVehicles || isProfileAppSettings) {
      setScreen('settings');
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
    if (isLicenceUnlock) {
      const returnToSettings = licenceUnlockChangePin;
      const wasNotifications = pinUnlockTarget === 'notifications';
      setLicenceUnlocked(false);
      setSettingsUnlocked(false);
      setNotificationsUnlocked(false);
      if (wasNotifications) setActiveTab('home');
      setScreen(returnToSettings ? 'settings' : 'home');
      setLicenceUnlockChangePin(false);
      return;
    }
    if (isNotifications) {
      setNotificationsUnlocked(false);
    }
    if (isSettings) {
      setSettingsUnlocked(false);
    }
    if (isMyLicences) {
      setLicenceUnlocked(false);
      setLicenceUnlockChangePin(false);
    }
    setScreen('home');
  };

  if (!fontsLoaded) return null;

  const useCircleHeaderLogo =
    isSignIn || isSignUp || isFeedback || isForgotPassword || isForgotUsername;

  return (
    <SafeAreaProvider>
      <View style={styles.screen}>
        <StatusBar style={isLicenceUnlock || isSuccessScreen ? 'dark' : 'light'} />
        {screen === 'home' ? (
          <HomeHeader
            welcomeMessage={getWelcomeMessage(currentUser)}
            showNotificationBell
            showExpiredDot={hasExpired}
            showAlmostDueDot={hasAlmostDue}
            onNotificationPress={() => {
              openNotifications();
            }}
            searchValue={homeSearchQuery}
            onSearchChangeText={setHomeSearchQuery}
            onSearchSubmit={() => {
              setActiveTab('help');
              go('help');
            }}
          />
        ) : screen === 'natis-services' ? (
          <HomeHeader
            welcomeMessage="NaTIS Services"
            showBack
            onBackPress={handleBackPress}
            showNotificationBell={false}
            showSearch={false}
          />
        ) : isLicenceUnlock || isSuccessScreen ? null : (
          <AppHeader
            logo={
              <RaLogoRing
                size={useCircleHeaderLogo ? 68 : 72}
                logoSize={useCircleHeaderLogo ? 54 : 58}
              />
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
            compact={useCircleHeaderLogo}
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
            onUnlocked={handlePinUnlockSuccess}
            onCancel={cancelPinUnlock}
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
              go(() => {
                setVehicleDetailReturnScreen('vehicles-due');
                setSelectedVehicle(vehicle);
                setScreen('vehicle-detail');
              });
            }}
          />
        ) : isVehicleDetail ? (
          <VehicleDetailScreen
            vehicle={selectedVehicle}
            onRenew={
              vehicleDetailReturnScreen === 'profile-vehicles'
                ? () => go('vehicles-due')
                : undefined
            }
          />
        ) : isNotifications ? (
          <NotificationsScreen
            onBack={() => {
              setNotificationsUnlocked(false);
              setActiveTab('home');
              setScreen('home');
            }}
          />
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
            onSelectReport={(report) => { go(() => { setSelectedReport(report); setScreen('my-report-detail'); }); }}
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
            title="Application submitted"
            message="Your PLN application was submitted."
            buttonText="Back to Home"
            onDone={() => setScreen('home')}
          />
        ) : isPlnInfo ? (
          <PLNApplicationInfoScreen
            onBack={() => setScreen('home')}
            onStartApplication={() => go('pln-wizard')}
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
            onFindOffices={() => go('find-offices')}
            onPayOnline={() => go('payment')}
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
            onSelectApplication={(app) => { go(() => { setSelectedApplication(app); setScreen('application-detail'); }); }}
          />
        ) : isNatisServices ? (
          <NatisServicesScreen
            user={currentUser}
            onMenuItemPress={handleNatisServicesMenuPress}
            onSignIn={() => {
              setAuthReturnScreen('natis-services');
              setScreen('sign-in');
            }}
            onSignUp={() => {
              setAuthReturnScreen('natis-services');
              setScreen('sign-up');
            }}
            onOpenProfile={openSettings}
          />
        ) : isNatisFaqs ? (
          <NatisFaqsScreen />
        ) : isProfileAccount ? (
          <AccountDetailsScreen user={currentUser} />
        ) : isProfileVehicles ? (
          <RegisteredVehiclesScreen
            onSelectVehicle={(vehicle) => {
              go(() => {
                setVehicleDetailReturnScreen('profile-vehicles');
                setSelectedVehicle(vehicle);
                setScreen('vehicle-detail');
              });
            }}
            onRenewVehicle={() => go('vehicles-due')}
          />
        ) : isProfileAppSettings ? (
          <AppSettingsScreen
            user={currentUser}
            onChangeLicencePin={openLicencePinSettings}
            onOpenPreferences={() => go('profile-preferences')}
          />
        ) : isProfilePreferences ? (
          <PreferencesScreen />
        ) : isSettings ? (
          <MyProfileHubScreen
            user={currentUser}
            onSignIn={() => {
              setAuthReturnScreen('licence-unlock');
              setPinUnlockTarget('settings');
              setScreen('sign-in');
            }}
            onSignUp={() => {
              setAuthReturnScreen('licence-unlock');
              setPinUnlockTarget('settings');
              setScreen('sign-up');
            }}
            onOpenAccountDetails={() => go('profile-account')}
            onOpenRegisteredVehicles={() => go('profile-vehicles')}
            onOpenAppSettings={() => go('profile-app-settings')}
            onLogout={async () => {
              await authService.logout();
              setCurrentUser(null);
              setLicenceUnlocked(false);
              setSettingsUnlocked(false);
              setNotificationsUnlocked(false);
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
        {screen !== 'licence-unlock' && !isSuccessScreen ? <BottomNavBar items={navItems} activeKey={activeTab} /> : null}
        <ScreenTransitionOverlay visible={transitionVisible} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
  },
  homeWrapper: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
  },
  homeContent: {
    paddingTop: spacing.lg,
  },
});
