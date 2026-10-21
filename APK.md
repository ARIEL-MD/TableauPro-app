# Générer l'APK de TableauPro

## Méthode 1 : GitHub Actions (sans rien installer)
1. Crée un dépôt GitHub et envoie-y ce dossier (sans `node_modules`).
2. Onglet **Actions → Build APK → Run workflow**.
3. Une fois terminé, télécharge l'artefact **TableauPro-apk** : il contient `app-debug.apk`.

## Méthode 2 : Android Studio
1. `npm install && npm run build && npx cap sync android`
2. `npx cap open android`
3. **Build → Build APK(s)**. Fichier : `android/app/build/outputs/apk/debug/app-debug.apk`

## APK signé pour distribution (release)
Générer une clé : `keytool -genkey -v -keystore tableaupro.jks -keyalg RSA -keysize 2048 -validity 10000 -alias tableaupro`
puis Android Studio : **Build → Generate Signed Bundle / APK**. Garde la même clé pour toutes les mises à jour.
