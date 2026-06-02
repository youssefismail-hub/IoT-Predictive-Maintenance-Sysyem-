# 🚨 DÉPLOIEMENT URGENT DES RÈGLES FIRESTORE

L'erreur "Missing or insufficient permissions" est due aux règles Firestore non déployées.

## Solution rapide (5 minutes) :

### Option 1 : Via Firebase Console (RECOMMANDÉ - Le plus rapide)

1. **Ouvrez votre navigateur** et allez sur : https://console.firebase.google.com/

2. **Sélectionnez votre projet** : `angularprojet-e6cf0`

3. Dans le menu de gauche, cliquez sur **"Firestore Database"**

4. Cliquez sur l'onglet **"Règles"** (en haut de la page)

5. **Copiez TOUT le contenu** du fichier `firestore.rules` dans ce projet

6. **Collez-le** dans l'éditeur de règles de Firebase Console

7. Cliquez sur le bouton **"Publier"** (en haut à droite)

8. **Attendez quelques secondes** pour que les règles soient déployées

9. **Rechargez votre application Angular** dans le navigateur

### Option 2 : Règles temporaires pour développement (SI VOUS VOULEZ TESTER PLUS RAPIDEMENT)

⚠️ **ATTENTION** : Ces règles sont très permissives. Utilisez-les UNIQUEMENT pour le développement !

Si vous voulez tester rapidement, copiez ces règles temporaires dans Firebase Console :

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

**Ces règles permettent à tout utilisateur authentifié de lire et écrire toutes les données.**

Une fois que vous avez testé, remplacez-les par les règles complètes du fichier `firestore.rules`.

---

## Après le déploiement :

1. Les erreurs "Missing or insufficient permissions" devraient disparaître
2. Vous pourrez vous connecter et créer des utilisateurs
3. L'application devrait fonctionner correctement

## Si vous avez des problèmes :

- Vérifiez que vous êtes bien connecté avec le compte qui a accès au projet Firebase
- Vérifiez que le projet `angularprojet-e6cf0` existe bien dans Firebase Console
- Assurez-vous que Firestore est activé dans votre projet Firebase

