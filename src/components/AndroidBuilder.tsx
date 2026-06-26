import { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Settings, 
  Code, 
  Terminal, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RefreshCw, 
  FileCode, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';

interface AndroidBuilderProps {
  onClose: () => void;
  appName: string;
}

export default function AndroidBuilder({ onClose, appName }: AndroidBuilderProps) {
  // Build configuration states
  const [appId, setAppId] = useState('com.farshout.talabat');
  const [displayName, setDisplayName] = useState(appName || 'طلبات فرشوط');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [buildType, setBuildType] = useState<'debug' | 'release'>('debug');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'INTERNET',
    'ACCESS_FINE_LOCATION',
    'CALL_PHONE',
    'POST_NOTIFICATIONS'
  ]);

  // Build simulation state
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'failed'>('idle');
  const [buildProgress, setBuildProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'files' | 'logs' | 'guide'>('config');
  const [activeFile, setActiveFile] = useState<'capacitor' | 'manifest' | 'gradle' | 'activity' | 'expo_json' | 'expo_js'>('capacitor');
  const [copiedText, setCopiedText] = useState(false);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Toggle permission selection
  const handleTogglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  // Code snippets based on states
  const getCapacitorConfig = () => {
    return `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${appId}',
  appName: '${displayName}',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#ef4444",
      sound: "beep.wav"
    }
  }
};

export default config;`;
  };

  const getAndroidManifest = () => {
    const permissionsXml = selectedPermissions.map(p => {
      switch (p) {
        case 'INTERNET':
          return '    <uses-permission android:name="android.permission.INTERNET" />';
        case 'ACCESS_FINE_LOCATION':
          return '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />';
        case 'CALL_PHONE':
          return '    <uses-permission android:name="android.permission.CALL_PHONE" />';
        case 'POST_NOTIFICATIONS':
          return '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />';
        case 'CAMERA':
          return '    <uses-permission android:name="android.permission.CAMERA" />';
        default:
          return `    <uses-permission android:name="android.permission.${p}" />`;
      }
    }).join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${appId}">

    <!-- مصفوفة الأذونات والصلاحيات للأندرويد -->
${permissionsXml}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${displayName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection"
            android:exported="true"
            android:label="${displayName}"
            android:theme="@style/AppTheme.NoActionBar">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

    </application>
</manifest>`;
  };

  const getBuildGradle = () => {
    return `apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'

android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "${appId}"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 100
        versionName "${appVersion}"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled ${buildType === 'release' ? 'true' : 'false'}
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version"
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation project(':capacitor-android')
    testImplementation 'junit:junit:4.13.2'
}
`;
  };

  const getMainActivity = () => {
    return `package ${appId}

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // تهيئة الإضافات الأصلية للأندرويد لـ طلبات فرشوط
        registerPlugin(com.capacitorjs.plugins.notifications.LocalNotificationsPlugin::class.java)
        registerPlugin(com.capacitorjs.plugins.geolocation.GeolocationPlugin::class.java)
    }
}
`;
  };

  const getExpoAppJson = () => {
    return `{
  "expo": {
    "name": "${displayName}",
    "slug": "talabat-farshout",
    "version": "${appVersion}",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ef4444"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "${appId}",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "نحتاج للوصول إلى موقعك الحالي لتوصيل الطلبات بدقة في مركز فرشوط."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ef4444"
      },
      "package": "${appId}",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE",
        "INTERNET"
      ]
    }
  }
}`;
  };

  const getExpoAppJs = () => {
    return `import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, BackHandler, ActivityIndicator, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);
  const TARGET_URL = '${typeof window !== 'undefined' ? window.location.origin : 'https://talabat-farshout.web.app'}';

  // طلب صلاحيات الموقع لتمريرها تلقائياً للويب فيو
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  // معالجة زر الرجوع في هواتف الأندرويد لعدم الخروج المفاجئ
  useEffect(() => {
    const onBackPress = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ef4444" barStyle="light-content" />
      <View style={styles.innerContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: TARGET_URL }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          geolocationEnabled={true}
          originWhitelist={['*']}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            Alert.alert(
              'خطأ في الاتصال',
              'يرجى التأكد من اتصالك بالإنترنت لتشغيل طلبات فرشوط.',
              [{ text: 'تحديث', onPress: () => webViewRef.current?.reload() }]
            );
          }}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size=\"large\" color=\"#ef4444\" />
            <Text style={styles.loadingText}>جاري تحميل طلبات فرشوط...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ef4444' },
  innerContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1 },
  loadingContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center'
  },
  loadingText: { marginTop: 10, fontSize: 14, fontWeight: 'bold', color: '#334155' }
});`;
  };

  const getActiveFileContent = () => {
    switch (activeFile) {
      case 'capacitor': return getCapacitorConfig();
      case 'manifest': return getAndroidManifest();
      case 'gradle': return getBuildGradle();
      case 'activity': return getMainActivity();
      case 'expo_json': return getExpoAppJson();
      case 'expo_js': return getExpoAppJs();
    }
  };

  const getFileName = () => {
    switch (activeFile) {
      case 'capacitor': return 'capacitor.config.ts';
      case 'manifest': return 'AndroidManifest.xml';
      case 'gradle': return 'app/build.gradle';
      case 'activity': return 'MainActivity.kt';
      case 'expo_json': return 'expo/app.json';
      case 'expo_js': return 'expo/App.js';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveFileContent());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Simulate Android Build Console logs
  const runBuildSimulation = () => {
    setBuildStatus('building');
    setBuildProgress(5);
    setActiveSubTab('logs');
    setConsoleLogs([]);

    const logsList = [
      `[GRADLE] Starting Gradle Daemon (using JDK 17)...`,
      `[CAPACITOR] Synchronizing web assets with native platform...`,
      `[CAPACITOR] Directory 'dist' verified. Loading modern React resources.`,
      `[CAPACITOR] Loading Capacitor core hooks: Geolocation, LocalNotifications, Camera`,
      `[GRADLE] Configured project appId: ${appId}`,
      `[GRADLE] App display name: "${displayName}"`,
      `[GRADLE] Running lint checks on AndroidManifest.xml...`,
      `[LINT] AndroidManifest permissions verified: [${selectedPermissions.join(', ')}]`,
      `[GRADLE] Compiling MainActivity.kt (Kotlin compiler version 1.8.20)...`,
      `[GRADLE] Bundling dex files (R8 shrinker enabled: ${buildType === 'release' ? 'YES' : 'NO'})...`,
      `[GRADLE] Processing vector assets and app launchers (@mipmap/ic_launcher)...`,
      `[GRADLE] Signing APK file with default ${buildType === 'release' ? 'Release production keystore' : 'Debug keystore'}...`,
      `[GRADLE] Aligning zip file for optimal Android runtime consumption...`,
      `[GRADLE] BUILD SUCCESSFUL in 8s`,
      `[OUTPUT] APK successfully compiled: app-${buildType}.apk (Size: 8.4 MB)`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logsList.length) {
        setConsoleLogs(prev => [...prev, logsList[currentLogIndex]]);
        setBuildProgress(Math.min(100, Math.floor(((currentLogIndex + 1) / logsList.length) * 100)));
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setBuildStatus('success');
      }
    }, 550);
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  return (
    <div className="bg-slate-50 min-h-full flex flex-col relative pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">منشئ ومبرمج تطبيقات أندرويد 🤖</h3>
            <p className="text-[10px] text-slate-400 font-bold">بناء وتصدير تطبيق طلبات فرشوط (APK) من الصفر</p>
          </div>
        </div>
        <span className="text-[10px] bg-red-50 text-red-500 px-2.5 py-1 rounded-full font-black flex items-center gap-1 animate-pulse">
          <Smartphone className="h-3 w-3" />
          <span>Android SDK 34</span>
        </span>
      </div>

      <div className="p-4 space-y-4 flex-grow overflow-y-auto max-h-[calc(840px-140px)]">
        {/* Intro Card */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-3xl p-4 shadow-md space-y-2">
          <h4 className="font-black text-xs flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>بيئة تطوير مدمجة للأندرويد (Capacitor Engine)</span>
          </h4>
          <p className="text-[10px] text-white/90 leading-relaxed font-semibold">
            هذه الأداة تتيح لك إعداد وضبط وتوليد ملفات مشروع أندرويد حقيقي متكامل لـ "طلبات فرشوط". يمكنك تخصيص الأذونات وتوليد الأكواد ومحاكاة تجميع الـ APK بنجاح!
          </p>
        </div>

        {/* Sub tabs navigation */}
        <div className="bg-white border border-slate-100 p-1 rounded-2xl flex justify-between gap-1">
          <button
            onClick={() => setActiveSubTab('config')}
            className={`flex-1 text-center py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${activeSubTab === 'config' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <Settings className="h-3.5 w-3.5 mx-auto mb-1" />
            <span>الإعدادات</span>
          </button>
          <button
            onClick={() => setActiveSubTab('files')}
            className={`flex-1 text-center py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${activeSubTab === 'files' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <Code className="h-3.5 w-3.5 mx-auto mb-1" />
            <span>ملفات الكود</span>
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex-1 text-center py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${activeSubTab === 'logs' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <Terminal className="h-3.5 w-3.5 mx-auto mb-1" />
            <span>مترجم APK</span>
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex-1 text-center py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${activeSubTab === 'guide' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <BookOpen className="h-3.5 w-3.5 mx-auto mb-1" />
            <span>دليل التشغيل</span>
          </button>
        </div>

        {/* TAB Content 1: Configurations */}
        {activeSubTab === 'config' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Smartphone className="h-4 w-4 text-red-500" />
                <span>بيانات ومعرفات حزمة الأندرويد</span>
              </h5>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-1">
                  <label className="text-[10px] font-bold text-slate-400">معرّف التطبيق الفريد (Package ID / ApplicationId)</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-left"
                    dir="ltr"
                  />
                  <p className="text-[8px] text-slate-400 font-semibold">يجب أن يبدأ بـ com ويحدد هويتك في متجر جوجل بلاي.</p>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  <label className="text-[10px] font-bold text-slate-400">اسم التطبيق الظاهري بالهاتف</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[10px] font-bold text-slate-400">إصدار التطبيق</label>
                    <input
                      type="text"
                      value={appVersion}
                      onChange={(e) => setAppVersion(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-center"
                      dir="ltr"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[10px] font-bold text-slate-400">نوع البناء والضغط</label>
                    <select
                      value={buildType}
                      onChange={(e) => setBuildType(e.target.value as 'debug' | 'release')}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500"
                    >
                      <option value="debug">Debug (اختبار محلي)</option>
                      <option value="release">Release (للمتجر والإنتاج)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Layers className="h-4 w-4 text-red-500" />
                <span>أذونات وصلاحيات الأندرويد المطلوبة</span>
              </h5>
              <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
                حدد المميزات والصلاحيات التي سيطلبها التطبيق من العميل عند تثبيته على هاتف الأندرويد بفرشوط:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {[
                  { key: 'INTERNET', label: 'الاتصال بالإنترنت', desc: 'لربط العميل بـ المطعم والطيار' },
                  { key: 'ACCESS_FINE_LOCATION', label: 'موقع الـ GPS الدقيق', desc: 'لتحديد وتتبع الكابتن المباشر بفرشوط' },
                  { key: 'CALL_PHONE', label: 'الاتصال الهاتفي المباشر', desc: 'للاتصال السريع بالطيار من التطبيق' },
                  { key: 'POST_NOTIFICATIONS', label: 'إرسال الإشعارات الفورية', desc: 'لتنبيه العميل عند تجهيز أو تحرك طلبه' },
                  { key: 'CAMERA', label: 'استخدام الكاميرا', desc: 'لمسح أكواد الدفع أو التقاط إيصال الاستلام' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleTogglePermission(item.key)}
                    className={`text-right p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${selectedPermissions.includes(item.key) ? 'bg-red-50/50 border-red-200 text-slate-800' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(item.key)}
                      onChange={() => {}} // handled by button onClick
                      className="mt-0.5 pointer-events-none accent-red-500"
                    />
                    <div>
                      <h6 className="text-[11px] font-black text-slate-750">{item.label}</h6>
                      <p className="text-[8px] text-slate-400 font-bold mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Build Button trigger */}
            <button
              onClick={runBuildSimulation}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-2xl py-3.5 text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
            >
              <Play className="h-4.5 w-4.5" />
              <span>ابدأ تجميع وبناء ملف الـ APK وتوليد الأكواد 🚀</span>
            </button>
          </div>
        )}

        {/* TAB Content 2: File Viewer */}
        {activeSubTab === 'files' && (
          <div className="space-y-4">
            {/* File selection chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { key: 'capacitor', label: 'capacitor.config.ts', icon: '⚡' },
                { key: 'manifest', label: 'AndroidManifest.xml', icon: '📋' },
                { key: 'gradle', label: 'build.gradle', icon: '🐘' },
                { key: 'activity', label: 'MainActivity.kt', icon: '📱' },
                { key: 'expo_json', label: 'expo/app.json', icon: '📦' },
                { key: 'expo_js', label: 'expo/App.js', icon: '⚛️' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFile(f.key as any)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black shrink-0 flex items-center gap-1 transition-all cursor-pointer ${activeFile === f.key ? 'bg-slate-800 text-white' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            {/* Code Box container */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 flex flex-col shadow-lg">
              {/* Box header */}
              <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-red-500" />
                  <span className="font-mono text-[10px] text-slate-300 font-bold">{getFileName()}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedText ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedText ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>
              </div>

              {/* Code text */}
              <pre className="p-4 overflow-x-auto text-[9px] text-sky-350 font-mono leading-relaxed bg-slate-900/95 max-h-80 select-text" dir="ltr">
                <code>{getActiveFileContent()}</code>
              </pre>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                ⚠️ <span className="text-red-500">ملاحظة تقنية:</span> تم دمج وحفظ ملف <code className="bg-slate-150 px-1 py-0.5 rounded text-slate-600 font-mono font-black">capacitor.config.ts</code> مسبقاً في جذر الكود الخاص بك. عند تنزيلك للمشروع، ستكون كافة الإعدادات جاهزة للتشغيل الفوري للأندرويد.
              </p>
            </div>
          </div>
        )}

        {/* TAB Content 3: Compiler Logs */}
        {activeSubTab === 'logs' && (
          <div className="space-y-4">
            {/* Progress bar */}
            {buildStatus === 'building' && (
              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span>جاري الضغط والتجميع (Gradle Assembler)...</span>
                  </span>
                  <span>{buildProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-rose-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${buildProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Simulated compiler output terminal */}
            <div className="bg-slate-950 text-emerald-400 font-mono text-[9px] rounded-3xl p-4 border border-slate-900 shadow-xl overflow-hidden min-h-64 max-h-80 flex flex-col justify-between" dir="ltr">
              <div className="space-y-1.5 overflow-y-auto max-h-72 flex-grow pr-1">
                <span className="text-slate-500 font-bold block mb-2">[SYSTEM] Farshout Android Compiler Console - Initiated successfully</span>
                {consoleLogs.length === 0 && (
                  <div className="text-slate-500 italic py-12 text-center font-bold">
                    بانتظار بدء التجميع للـ APK... اضغط على زر تجميع التطبيق لتشغيل المحاكي.
                  </div>
                )}
                {consoleLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-slate-500">[{new Date().toLocaleTimeString('ar-EG', { hour12: false })}]</span>{' '}
                    <span className={log.includes('SUCCESSFUL') || log.includes('successfully') ? 'text-emerald-400 font-extrabold' : log.includes('error') || log.includes('failed') ? 'text-red-400 font-extrabold' : 'text-slate-200'}>
                      {log}
                    </span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            </div>

            {/* Actions post build */}
            {buildStatus === 'success' && (
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                    🎉
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">تم تجميع الـ APK بنجاح!</h5>
                    <p className="text-[9px] text-slate-400 font-bold">الملف متاح الآن للتنزيل والتثبيت الفوري بفرشوط</p>
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl text-[9px] font-bold leading-relaxed">
                  تم التوقيع باستخدام مفتاح تصحيح الأخطاء (Debug Certificate). التطبيق متوافق مع كافة هواتف الأندرويد (إصدار 5.0 فما فوق).
                </div>

                <div className="flex gap-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('تمت محاكاة تحميل ملف APK لـ "طلبات فرشوط"! عند تنزيل مجلد الكود بالكامل من القائمة، سيكون مشروع الأندرويد مهيأً للتجربة الفورية في جهازك الحقيقي.');
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 text-[10px] font-black text-center flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>تنزيل ملف طلبات_فرشوط.apk</span>
                  </a>
                  <button
                    onClick={runBuildSimulation}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 h-10 px-3.5 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB Content 4: Guides */}
        {activeSubTab === 'guide' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <BookOpen className="h-4 w-4 text-red-500" />
                <span>دليل تشغيل التطبيق كـ تطبيق أندرويد عبر Expo</span>
              </h5>

              <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-2xl text-[9px] text-emerald-800 font-bold leading-relaxed mb-1 space-y-1">
                <p>🚀 <span className="font-black text-emerald-950">ميزة بايلود Expo الممتازة:</span></p>
                <p className="text-[8px] leading-normal text-emerald-900 font-semibold">
                  باستخدام Expo WebView، يمكنك بناء تطبيق أندرويد (APK) و آيفون (iOS) فائق السرعة وخفيف الوزن جداً (أقل من 5 ميجابايت). يعتمد التطبيق على التحميل السحابي التلقائي لطلبات فرشوط، مما يعني أن أي تحديثات تقوم بها للويب تظهر فوراً لدى مستخدمي التطبيق دون الحاجة لتحديث التطبيق من المتجر!
                </p>
              </div>

              <div className="space-y-4 text-[10px] text-slate-600 leading-relaxed font-bold">
                <p>خطوات بناء مشروع أندرويد متكامل باستخدام بايلود Expo المرفق:</p>
                
                <div className="space-y-3.5 pt-1">
                  {[
                    { step: '1', title: 'إنشاء مشروع Expo فارغ', desc: 'افتح منفذ الأوامر Terminal في مجلد فارغ واكتب الأمر:\n`npx create-expo-app talabat-farshout --template blank`' },
                    { step: '2', title: 'تثبيت الإضافات المطلوبة للويب والموقع', desc: 'ادخل لمجلد المشروع واكتب:\n`cd talabat-farshout`\nثم ثبت الإضافات المطلوبة:\n`npx expo install react-native-webview expo-location expo-device expo-status-bar`' },
                    { step: '3', title: 'استبدال ملفات الإعدادات والبايلود', desc: 'انسخ كود ملف `expo/app.json` و `expo/App.js` من تبويب "الملفات البرمجية" بالأعلى، واستبدل بهما الملفات الموجودة في مشروعك الجديد.' },
                    { step: '4', title: 'التجربة والتشغيل الفوري', desc: 'لتجربة التطبيق مباشرة على هاتفك عبر تطبيق Expo Go، اكتب:\n`npx expo start`\nثم امسح كود QR الظاهر بكاميرا هاتفك.' },
                    { step: '5', title: 'بناء ملف الـ APK النهائي', desc: 'لبناء التطبيق ورفع حزمة الـ APK، سجل في موقع Expo واكتب:\n`eas build --platform android`' }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <div className="space-y-1">
                        <h6 className="text-[11px] font-black text-slate-800">{item.title}</h6>
                        <p className="text-[9px] text-slate-400 leading-normal font-semibold whitespace-pre-line">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Smartphone className="h-4 w-4 text-red-500" />
                <span>دليل تشغيل التطبيق كـ تطبيق أندرويد عادي (طريقة Capacitor)</span>
              </h5>

              <div className="bg-amber-50/70 border border-amber-150 p-3 rounded-2xl text-[9px] text-amber-800 font-bold leading-relaxed mb-1 space-y-1">
                <p>💡 <span className="font-black text-amber-950">حل مشكلة الشاشة البيضاء (White Screen Fix):</span></p>
                <p className="text-[8px] leading-normal text-amber-900 font-semibold">
                  تظهر شاشة بيضاء في تطبيقات WebView إذا كانت مسارات الملفات مطلقة أو إذا حاول الـ Service Worker العمل محلياً في بيئة الأندرويد. قمنا بحل هذه المشكلة بالكامل وتلقائياً عبر ضبط الـ <code className="bg-amber-100/60 px-1 rounded">base: "./"</code> في <code className="bg-amber-100/60 px-1 rounded">vite.config.ts</code> وتعطيل الـ SW في الهواتف!
                </p>
              </div>

              <div className="space-y-4 text-[10px] text-slate-600 leading-relaxed font-bold">
                <p>لتشغيل التطبيق المباشر كـ تطبيق أندرويد أصلي (Capacitor)، اتبع الآتي:</p>
                
                <div className="space-y-3.5 pt-1">
                  {[
                    { step: '1', title: 'تنزيل الكود وتثبيت Node.js', desc: 'قم بتنزيل كود هذا المشروع بالكامل كملف ZIP من قائمة الإعدادات الجانبية، ثم فك الضغط وافتح منفذ الأوامر Terminal في مجلد المشروع.' },
                    { step: '2', title: 'تثبيت الحزم البرمجية', desc: 'اكتب الأمر التالي لتنزيل وتثبيت كافة المكتبات اللازمة للمشروع:\n`npm install`' },
                    { step: '3', title: 'بناء وتجميع الواجهات', desc: 'قم بعمل نسخة إنتاجية للواجهات باستخدام Vite عن طريق كتابة:\n`npm run build`' },
                    { step: '4', title: 'إضافة منصة الأندرويد للمشروع', desc: 'لتوليد مجلد أندرويد حقيقي يحوي مشروع Capacitor من الصفر، اكتب:\n`npx cap add android`' },
                    { step: '5', title: 'مزامنة الكود مع الأندرويد', desc: 'لمزامنة ملفات React مع منصة الأندرويد والـ WebView، اكتب:\n`npx cap sync`' },
                    { step: '6', title: 'فتح المشروع في Android Studio', desc: 'لفتح مشروع الأندرويد في ستوديو التطوير وتثبيته على هاتفك، اكتب:\n`npx cap open android`' }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <span className="h-5 w-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <div className="space-y-1">
                        <h6 className="text-[11px] font-black text-slate-800">{item.title}</h6>
                        <p className="text-[9px] text-slate-400 leading-normal font-semibold whitespace-pre-line">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
