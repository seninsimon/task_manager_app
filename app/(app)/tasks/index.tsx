import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tasksAPI } from '@/lib/api/endpoints';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const queryClient = useQueryClient();

  // ✅ Fetch tasks and normalize keys
  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAll(),
    select: (res) => {
      console.log('TASK RESPONSE:', res.data);

      return res.data.map((task: any) => ({
        id: task.ID,
        title: task.Title,
        status: task.Status,
      }));
    },
  });

  // ✅ Create Task
  const createMutation = useMutation({
    mutationFn: (title: string) => tasksAPI.create({ title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setModalVisible(false);
      setNewTaskTitle('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    },
  });

  // ✅ Update Task
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => tasksAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // ✅ Delete Task
  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // ✅ Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/(auth)/login');
  };

  // ✅ Create Handler
  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Enter task title');
      return;
    }
    createMutation.mutate(newTaskTitle);
  };

  // ✅ Toggle Status
  const handleUpdateTask = (task: any) => {
    updateMutation.mutate({
      id: task.id,
      data: {
        title: task.title,
        status: task.status === 'todo' ? 'done' : 'todo',
      },
    });
  };

  // ✅ Delete Handler
  const handleDeleteTask = (id: number) => {
    Alert.alert('Delete Task?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  // ✅ Render Task
  const renderTask = ({ item }: any) => (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => handleUpdateTask(item)}
      >
        <Icon
          name={item.status === 'done' ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={item.status === 'done' ? '#34C759' : '#8E8E93'}
        />

        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskStatus}>{item.status.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(item.id)}
      >
        <Icon name="delete" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Task</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter task title"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateTask}
            >
              <Text style={styles.createButtonText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 15, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },

  headerTitle: { fontSize: 24, fontWeight: '700' },

  headerButtons: { flexDirection: 'row', gap: 10 },

  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutButton: {
    backgroundColor: '#eee',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  taskContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },

  taskInfo: { marginLeft: 15 },

  taskTitle: { fontSize: 16, fontWeight: '600' },

  taskStatus: { fontSize: 12, color: '#777' },

  deleteButton: { padding: 8 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15 },

  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
  },

  createButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  createButtonText: { color: '#fff', fontWeight: '700' },
});
