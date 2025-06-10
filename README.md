# My Tasks App

A feature-rich task management application built with React Native and Expo.
<br>
<img src="https://github.com/user-attachments/assets/1c586211-6f6e-4c03-9b44-5aacae4d32d7" height="400px" width="200px">
<img src="https://github.com/user-attachments/assets/a02239d3-9835-4245-8ad8-3db06c26a712" height="400px" width="200px">



## demo

https://github.com/user-attachments/assets/a08d4d94-a498-4036-a2e8-58135c02a8f7

## Features

- ✅ Create, edit, and delete tasks
- 🔔 Local notifications for task reminders
- 💾 Persistent storage using AsyncStorage
- 🎯 Task prioritization (Low, Medium, High)
- ✏️ In-line task editing
- 🎨 Clean and intuitive UI

## Tech Stack

- React Native
- Expo
- TypeScript
- AsyncStorage for persistence
- Expo Notifications

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vkprogrammer-001/MyTasks.git
cd MyTasks
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your device:
- Scan the QR code with Expo Go (Android)
- Scan the QR code with Camera app (iOS)

## Implementation Details

### Core Features
- Tasks are stored locally using AsyncStorage
- Each task has a priority level and completion status
- Notifications are scheduled when tasks are created
- Notifications are automatically cancelled when tasks are completed

### Bonus Features
- Task prioritization with visual indicators
- In-line task editing
- Optimized performance with proper state management
- Enhanced UI/UX with visual feedback

### Challenges & Solutions
- Implemented proper notification handling with TypeScript
- Created a smooth editing experience with inline editing
- Managed complex state updates while maintaining performance
- Ensured proper data persistence with error handling
