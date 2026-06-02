# IoT Predictive Maintenance Platform

A comprehensive Angular application with Firebase backend for real-time equipment monitoring, predictive maintenance alerts, and role-based user management.

## 🚀 Features Implemented

### ✅ Core Infrastructure
- **Angular 19** with standalone components
- **Firebase Integration** (Authentication, Firestore, Cloud Messaging)
- **TypeScript** with strict typing
- **SCSS** with modern design system
- **Lazy Loading** routes for optimal performance

### ✅ Authentication & Authorization
- Email/password authentication
- User registration with role selection (Admin/Technician)
- Protected routes with auth guards
- Role-based access control
- Automatic session management

### ✅ Models & Data Structures
- User model with roles and permissions
- Equipment model with status tracking
- Alert model with severity levels
- Sensor reading model for real-time data

### ✅ Services
- **AuthService**: Login, register, logout, current user
- **UserService**: User CRUD operations
- **EquipmentService**: Equipment management
- **AlertService**: Alert management with unread count
- **SensorDataService**: Real-time sensor data subscriptions
- **NotificationService**: Firebase Cloud Messaging integration

### ✅ Guards & Security
- Authentication guard for protected routes
- Role-based guard for admin-only features
- Automatic redirect to login for unauthorized access

### ✅ Pipes & Directives
- Search filter pipe for dynamic filtering
- Status filter pipe for equipment status
- Role label pipe for display formatting
- HasRole directive for conditional rendering

### ✅ Pages Implemented
- **Login Page**: Modern auth UI with validation
- **Register Page**: User registration with role selection
- **Dashboard**: Overview with stats cards and recent data
- **Equipment List**: Grid view with search and filters

### ✅ Design System
- Modern dark theme with gradient accents
- Comprehensive CSS variables for theming
- Reusable component styles (cards, buttons, forms, badges)
- Smooth animations and transitions
- Fully responsive design
- Custom scrollbar styling

## 📦 Installation

```bash
# Navigate to project directory
cd maintenance-app

# Install dependencies (already done)
npm install

# Start development server
ng serve

# Open browser to
http://localhost:4200
```

## 🔥 Firebase Setup

### Required Firebase Services
1. **Authentication**: Enable Email/Password provider
2. **Firestore Database**: Create database in production mode
3. **Cloud Messaging**: Enable for push notifications

### Firestore Collections Structure

```
users/
  {uid}/
    - name: string
    - email: string
    - role: 'admin' | 'technician'
    - isActive: boolean
    - createdAt: timestamp

equipment/
  {id}/
    - name: string
    - type: string
    - status: 'operational' | 'warning' | 'critical' | 'offline'
    - location: string
    - temperature: number
    - vibration: number
    - createdAt: timestamp
    - updatedAt: timestamp

alerts/
  {id}/
    - equipmentId: string
    - message: string
    - type: string
    - severity: 'info' | 'warning' | 'critical'
    - isRead: boolean
    - createdAt: timestamp

sensor-readings/
  {id}/
    - equipmentId: string
    - temperature: number
    - vibration: number
    - pressure: number
    - timestamp: timestamp
```

### Firestore Security Rules

Create `firestore.rules` in project root:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isTechnician() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'technician';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || request.auth.uid == userId;
    }
    
    // Equipment collection
    match /equipment/{equipmentId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin() || isTechnician();
      allow delete: if isAdmin();
    }
    
    // Alerts collection
    match /alerts/{alertId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }
    
    // Sensor readings collection
    match /sensor-readings/{readingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
  }
}
```

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, 700 weight
- **Body**: Regular, 400 weight

## 📝 Remaining Components to Implement

### Equipment Pages
1. **Equipment Detail** (`equipment-detail.ts`)
   - Display equipment information
   - Show real-time sensor readings with gauges
   - Display historical data charts
   - List related alerts

2. **Equipment Form** (`equipment-form.ts`)
   - Add/Edit equipment form
   - Validation for all fields
   - Status selection
   - Location and type inputs

### Alert Page
3. **Alerts** (`alerts.ts`)
   - List all alerts with filtering
   - Mark as read functionality
   - Severity-based styling
   - Real-time updates

### Admin Pages
4. **User List** (`admin/user-list.ts`)
   - Display all users
   - Role management
   - User activation/deactivation
   - Search and filter

5. **User Form** (`admin/user-form.ts`)
   - Create/edit users
   - Role assignment
   - Password management

6. **Settings** (`admin/settings.ts`)
   - Application configuration
   - System preferences
   - Notification settings

### Reusable Components (Optional)
- Navbar component (currently inline)
- Equipment card component
- Alert item component
- Line chart component (using Chart.js)
- Gauge chart component
- Confirm dialog component

## 🔧 Quick Fix for Component Names

The generated components need their class names updated. Run these commands:

```powershell
# Update component class names to match routing
(Get-Content "src/app/pages/equipment-form/equipment-form.ts") -replace 'export class EquipmentForm', 'export class EquipmentFormComponent' | Set-Content "src/app/pages/equipment-form/equipment-form.ts"

(Get-Content "src/app/pages/equipment-detail/equipment-detail.ts") -replace 'export class EquipmentDetail', 'export class EquipmentDetailComponent' | Set-Content "src/app/pages/equipment-detail/equipment-detail.ts"

(Get-Content "src/app/pages/alerts/alerts.ts") -replace 'export class Alerts', 'export class AlertsComponent' | Set-Content "src/app/pages/alerts/alerts.ts"

(Get-Content "src/app/pages/admin/user-list/user-list.ts") -replace 'export class UserList', 'export class UserListComponent' | Set-Content "src/app/pages/admin/user-list/user-list.ts"

(Get-Content "src/app/pages/admin/user-form/user-form.ts") -replace 'export class UserForm', 'export class UserFormComponent' | Set-Content "src/app/pages/admin/user-form/user-form.ts"

(Get-Content "src/app/pages/admin/settings/settings.ts") -replace 'export class Settings', 'export class SettingsComponent' | Set-Content "src/app/pages/admin/settings/settings.ts"
```

## 🚦 Getting Started

1. **Fix Component Names** (run the PowerShell commands above)
2. **Start the dev server**: `ng serve`
3. **Register a new user** at `/register`
4. **Promote first user to admin** in Firebase Console:
   - Go to Firestore Database
   - Find your user document in `users` collection
   - Change `role` field to `"admin"`
5. **Add test equipment** through the UI
6. **Create test alerts** in Firestore Console

## 📚 Technologies Used

- **Angular 19**: Latest Angular framework
- **Firebase**: Backend-as-a-Service
  - Authentication
  - Firestore Database
  - Cloud Messaging
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe JavaScript
- **SCSS**: Advanced CSS with variables
- **Chart.js**: Data visualization (installed, not yet implemented)

## 🎯 Next Steps

1. Fix component class names (see commands above)
2. Implement remaining page components
3. Add Chart.js integration for sensor data visualization
4. Implement Firebase Cloud Messaging service worker
5. Add unit tests
6. Add E2E tests
7. Deploy to Firebase Hosting

## 📖 Documentation

- [Angular Documentation](https://angular.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

## 🐛 Known Issues

- Component class names need to be updated (see Quick Fix section)
- Some pages are placeholder components and need full implementation
- FCM service worker not yet configured
- No unit tests yet

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

**Built with ❤️ using Angular and Firebase**
