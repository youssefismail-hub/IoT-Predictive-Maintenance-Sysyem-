# Guide de déploiement des règles Firestore

## Option 1 : Via Firebase Console (Recommandé)

1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet : `angularprojet-e6cf0`
3. Dans le menu de gauche, allez dans **Firestore Database**
4. Cliquez sur l'onglet **Règles**
5. Copiez le contenu du fichier `firestore.rules`
6. Collez-le dans l'éditeur de règles
7. Cliquez sur **Publier**

## Option 2 : Via Firebase CLI (si installé)

1. Installez Firebase CLI :
   ```bash
   npm install -g firebase-tools
   ```

2. Connectez-vous à Firebase :
   ```bash
   firebase login
   ```

3. Initialisez Firebase dans le projet (si pas déjà fait) :
   ```bash
   firebase init firestore
   ```

4. Déployez les règles :
   ```bash
   firebase deploy --only firestore:rules
   ```

## Règles temporaires pour le développement (ATTENTION : À NE PAS UTILISER EN PRODUCTION)

Si vous voulez tester rapidement sans déployer, vous pouvez temporairement utiliser ces règles dans Firebase Console (UNIQUEMENT pour le développement) :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **AVERTISSEMENT** : Ces règles permettent à tous les utilisateurs authentifiés de lire et écrire toutes les données. Utilisez-les UNIQUEMENT pour le développement et remplacez-les par les règles complètes avant la mise en production.

