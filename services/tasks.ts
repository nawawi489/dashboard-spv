import { ENDPOINTS } from '../constants';
import { TaskData, TaskSubmission } from '../types';

export const fetchTasks = async (outletName: string): Promise<TaskData[]> => {
  try {
    const url = new URL(ENDPOINTS.GET_TASKS);
    url.searchParams.append('outlet', outletName);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const data = await response.json();
    let tasks: TaskData[] = [];
    if (Array.isArray(data)) {
      tasks = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray((data as any).data)) {
        tasks = (data as any).data;
      } else {
        tasks = [data] as TaskData[];
      }
    }
    return tasks.filter(item => item && typeof item === 'object');
  } catch (error) {
    console.error('API Error (fetchTasks):', error);
    throw error;
  }
};

export const submitTask = async (payload: TaskSubmission): Promise<any> => {
  try {
    const response = await fetch(ENDPOINTS.SUBMIT_TASK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error (${response.status}): ${errorText || response.statusText || 'Unknown Error'}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('API Error (submitTask):', error);
    throw error;
  }
};
