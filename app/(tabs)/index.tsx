/**
 * MyTasks App - Main Screen
 * 
 * This component implements a task management application with the following features:
 * - Create, read, update, and delete tasks
 * - Set task priorities (low, medium, high)
 * - Mark tasks as completed
 * - Edit existing tasks
 * - Receive notifications for task reminders
 * - Persist tasks using AsyncStorage
 */

// React and React Native imports
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

// Third-party library imports
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

// Custom component imports
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

/**
 * Configure Expo Notifications
 * 
 * This configuration determines how notifications are handled when received by the device.
 * - shouldShowAlert: Display an alert when notification is received
 * - shouldPlaySound: Play a sound when notification is received
 * - shouldSetBadge: Update the app badge count (disabled)
 * - shouldShowBanner: Show a banner notification
 * - shouldShowList: Show in notification list
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Task Interface
 * 
 * Defines the structure of a task in the application:
 * @property {string} id - Unique identifier for the task
 * @property {string} text - The task description
 * @property {boolean} completed - Whether the task is completed
 * @property {string} [notificationId] - ID of the scheduled notification (if any)
 * @property {"low" | "medium" | "high"} priority - Task priority level
 * @property {boolean} [isEditing] - Whether the task is currently being edited
 */
interface Task {
  id: string;
  text: string;
  completed: boolean;
  notificationId?: string;
  priority: "low" | "medium" | "high";
  isEditing?: boolean;
}

/**
 * HomeScreen Component
 * 
 * Main component for the task management application.
 * Handles all task-related operations and UI rendering.
 */
export default function HomeScreen() {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]); // List of all tasks
  const [newTask, setNewTask] = useState(""); // Text for new task input
  const [editingText, setEditingText] = useState(""); // Text for editing existing task

  /**
   * Initialize the app on component mount
   * - Load saved tasks from AsyncStorage
   * - Request notification permissions
   */
  useEffect(() => {
    loadTasks();
    requestNotificationPermissions();
  }, []);

  // ===== TASK MANAGEMENT FUNCTIONS =====

  /**
   * Request notification permissions from the user
   * Alerts the user if permissions are not granted
   */
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please enable notifications for task reminders"
      );
    }
  };

  /**
   * Load tasks from AsyncStorage
   */
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  /**
   * Save tasks to AsyncStorage
   * @param updatedTasks - The tasks array to save
   */
  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  /**
   * Schedule a notification for a task
   * @param taskText - The task text to include in the notification
   * @returns The notification ID or null if scheduling failed
   */
  const scheduleNotification = async (taskText: string) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Reminder",
          body: `Time to complete: ${taskText}`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10, // Notification after 10 seconds
        },
      });
      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  };

  /**
   * Add a new task to the list
   * - Creates a task with default medium priority
   * - Schedules a notification
   * - Updates state and persists to storage
   */
  const addTask = async () => {
    if (newTask.trim().length === 0) return;

    const notificationId = await scheduleNotification(newTask);
    const newTaskItem: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      notificationId: notificationId || undefined,
      priority: "medium", // default priority
    };

    const updatedTasks = [...tasks, newTaskItem];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setNewTask("");
  };

  /**
   * Toggle edit mode for a task
   * @param id - The task ID to toggle edit mode for
   * @param initialText - The initial text to populate the edit field
   */
  const toggleEditMode = (id: string, initialText: string) => {
    setTasks(
      tasks.map((task) => ({
        ...task,
        isEditing: task.id === id ? !task.isEditing : false,
      }))
    );
    setEditingText(initialText);
  };

  /**
   * Update the text of a task
   * @param id - The ID of the task to update
   */
  const updateTaskText = async (id: string) => {
    if (editingText.trim().length === 0) return;

    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, text: editingText.trim(), isEditing: false };
      }
      return task;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditingText("");
  };

  /**
   * Update the priority of a task
   * @param id - The ID of the task to update
   * @param priority - The new priority value
   */
  const updateTaskPriority = async (id: string, priority: Task["priority"]) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, priority } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  /**
   * Toggle the completed status of a task
   * - Cancels notification if task is being marked as completed
   * @param id - The ID of the task to toggle
   */
  const toggleTask = async (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        // Cancel notification if task is completed
        if (!task.completed && task.notificationId) {
          Notifications.cancelScheduledNotificationAsync(task.notificationId);
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  /**
   * Delete a task
   * - Cancels any associated notification
   * - Removes the task from state and storage
   * @param id - The ID of the task to delete
   */
  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((task) => task.id === id);
    if (taskToDelete?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        taskToDelete.notificationId
      );
    }
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  /**
   * Render the component
   */
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedText type="title" style={styles.header}>
        My Tasks
      </ThemedText>

      {/* Task Input Section */}
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new task"
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <ThemedText style={styles.buttonText}>Add</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item: task }) => (
          <ThemedView
            style={[
              styles.taskItem,
              // Apply priority styling based on task priority
              // Get priority style by building the property name
              task.priority === 'high' ? styles.priorityHigh : 
              task.priority === 'medium' ? styles.priorityMedium : 
              styles.priorityLow,
            ]}
          >
            {/* Task Checkbox */}
            <TouchableOpacity
              style={styles.taskCheckbox}
              onPress={() => toggleTask(task.id)}
            >
              {task.completed && <ThemedText>✓</ThemedText>}
            </TouchableOpacity>

            {/* Task Text (or Edit Input) */}
            {task.isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editingText}
                onChangeText={setEditingText}
                onSubmitEditing={() => updateTaskText(task.id)}
                autoFocus
              />
            ) : (
              <ThemedText
                style={[
                  styles.taskText,
                  task.completed && styles.completedTask,
                ]}
              >
                {task.text}
              </ThemedText>
            )}

            {/* Task Action Buttons */}
            <ThemedView style={styles.actionButtons}>
              {/* Priority Toggle Button */}
              <TouchableOpacity
                style={styles.priorityButton}
                onPress={() => {
                  // Cycle through priorities: low -> medium -> high -> low
                  const priorities: Task["priority"][] = [
                    "low",
                    "medium",
                    "high",
                  ];
                  const currentIndex = priorities.indexOf(task.priority);
                  const nextPriority =
                    priorities[(currentIndex + 1) % priorities.length];
                  updateTaskPriority(task.id, nextPriority);
                }}
              >
                <ThemedText style={styles.priorityText}>
                  {task.priority === "high"
                    ? "🔴"
                    : task.priority === "medium"
                    ? "🟡"
                    : "🟢"}
                </ThemedText>
              </TouchableOpacity>

              {/* Edit Button */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => toggleEditMode(task.id, task.text)}
              >
                <ThemedText>✏️</ThemedText>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(task.id)}
              >
                <ThemedText style={styles.deleteText}>🗑️</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        
        // Performance Optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={10}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate height of each item
          offset: 80 * index,
          index,
        })}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    </ThemedView>
  );
}

/**
/**
 * Styles Interface
 * 
 * Defines the types for all style properties used in the application
 */
interface Styles {
  // Layout styles
  container: ViewStyle;
  header: TextStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  addButton: ViewStyle;
  buttonText: TextStyle;
  
  // Task list styles
  taskList: ViewStyle;
  taskListContent: ViewStyle;
  taskItem: ViewStyle;
  
  // Priority styles
  priorityHigh: ViewStyle;
  priorityMedium: ViewStyle;
  priorityLow: ViewStyle;
  
  // Task item components
  taskCheckbox: ViewStyle;
  taskText: TextStyle;
  completedTask: TextStyle;
  
  // Action button styles
  actionButtons: ViewStyle;
  priorityButton: ViewStyle;
  priorityText: TextStyle;
  editButton: ViewStyle;
  deleteButton: ViewStyle;
  deleteText: TextStyle;
  editInput: TextStyle;
}
/**
 * Application Styles
 * 
 * Defines all the styles used throughout the application
 */
const styles = StyleSheet.create<Styles>({
  // ===== LAYOUT STYLES =====
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  
  // ===== TASK LIST STYLES =====
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 20, // Add some padding at the bottom for better scrolling
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 5,
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
  },
  
  // ===== PRIORITY STYLES =====
  priorityHigh: {
    borderLeftWidth: 5,
    borderLeftColor: "#FF3B30", // Red color for high priority
  },
  priorityMedium: {
    borderLeftWidth: 5,
    borderLeftColor: "#FFCC00", // Yellow color for medium priority
  },
  priorityLow: {
    borderLeftWidth: 5,
    borderLeftColor: "#34C759", // Green color for low priority
  },
  
  // ===== TASK ITEM COMPONENTS =====
  taskCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  
  // ===== ACTION BUTTON STYLES =====
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityButton: {
    marginRight: 10,
  },
  priorityText: {
    fontSize: 16,
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  deleteText: {
    fontSize: 20,
  },
  editInput: {
    flex: 1,
    padding: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 3,
  },
});
