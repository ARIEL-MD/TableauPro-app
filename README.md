# TableauPro

Application de conception de tableaux électriques modulaires (rails DIN, appareils, bornes et blocs de répartition), avec aperçu visuel identique au tiroir d'appareils et export pour Android.

## Fonctionnalités

- Plan de l'armoire en surface libre, avec déplacement au doigt sur téléphone et tablette
- Appareils (disjoncteurs, différentiels, RCBO, AFDD, contacteurs, parafoudres…) dessinés comme dans le tiroir
- Calcul automatique des modules utilisés et de la réserve
- Application Android générée avec Capacitor

## Lancer en local

**Prérequis :** Node.js 20 ou plus récent

1. Installer les dépendances :
   `npm install`
2. Lancer l'application :
   `npm run dev`
3. Ouvrir l'adresse affichée dans le terminal (par défaut `http://localhost:3000`).

## Générer l'APK Android

### Méthode 1 : GitHub Actions (sans rien installer)

1. Onglet **Actions → Build signed APK → Run workflow**.
2. Une fois terminé, télécharge l'artefact **TableauPro-release-apk**.

Le workflow a besoin de quatre secrets dans *Settings → Secrets and variables → Actions* : `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

### Méthode 2 : en local

1. `npm install && npm run build && npx cap sync android`
2. `cd android && ./gradlew assembleDebug`

Le fichier se trouve dans `android/app/build/outputs/apk/debug/`.

## Signature de l'APK

Garde la même clé de signature pour toutes les mises à jour, sinon Android refusera d'installer la nouvelle version par-dessus l'ancienne. Pour créer une clé :

`keytool -genkey -v -keystore tableaupro.jks -keyalg RSA -keysize 2048 -validity 10000 -alias tableaupro`

## Structure

- `src/` : code de l'application (composants React, données, types)
- `android/` : projet Android généré par Capacitor
- `assets/` : icônes et écrans de démarrage
- `.github/workflows/` : pipeline de build de l'APK
