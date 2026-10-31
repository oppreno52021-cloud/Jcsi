# Capacitor ProGuard Rules
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.BridgeActivity { *; }
-keep public class com.getcapacitor.** { *; }
-keep class * implements com.getcapacitor.PluginMethod { *; }

# Keep WebView JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Biometrics plugin keep rules
-keep class com.aparajita.capacitor.biometricauth.** { *; }

# Preserve stack traces and annotations for reliable runtime execution
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature

