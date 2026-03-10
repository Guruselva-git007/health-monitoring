import { I18n } from "i18n-js";
import * as Localization from "expo-localization";

const translations = {
  en: {
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    name: "Full Name",
    symptomReport: "Symptom Report",
    submit: "Submit",
    symptoms: "Symptoms",
    waterSource: "Water source type",
    household: "Household size",
    travel: "Recent travel",
    notes: "Notes",
    alerts: "Alerts",
    logout: "Logout",
    language: "Language",
    queuePending: "Queued reports pending sync",
    useLocation: "Use current location",
    capturePhoto: "Upload sample photo"
  },
  hi: {
    login: "लॉगिन",
    register: "रजिस्टर",
    email: "ईमेल",
    password: "पासवर्ड",
    name: "पूरा नाम",
    symptomReport: "लक्षण रिपोर्ट",
    submit: "जमा करें",
    symptoms: "लक्षण",
    waterSource: "जल स्रोत प्रकार",
    household: "परिवार का आकार",
    travel: "हाल की यात्रा",
    notes: "टिप्पणियां",
    alerts: "अलर्ट",
    logout: "लॉगआउट",
    language: "भाषा",
    queuePending: "कतार में रिपोर्ट सिंक होना बाकी है",
    useLocation: "वर्तमान स्थान उपयोग करें",
    capturePhoto: "जल नमूना फोटो अपलोड"
  }
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = Localization.getLocales()[0]?.languageCode || "en";

export default i18n;
