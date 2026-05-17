import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";
import { getTasks, getRecords, getUsers } from "../services/api/crm";

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

const STATUS_STYLES = {
  todo: "bg-neutral-100 text-neutral-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-emerald-100 text-emerald-700",
};

const PRIORITY_STYLES = {
  low: "bg-neutral-100 text-neutral-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

const TasksPage = () => {
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const {
    data: records = [],
    isLoading: recordsLoading,
    isError: recordsError,
  } = useQuery({
    queryKey: ["records"],
    queryFn: getRecords,
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const recordsById = useMemo(() => {
    return records.reduce((acc, record) => {
      acc[record.id] = `${record.first_name} ${record.last_name}`;
      return acc;
    }, {});
  }, [records]);

  const usersById = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user.username || user.email;
      return acc;
    }, {});
  }, [users]);

  const queryClient = useQueryClient();

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: "Delete this task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await apiClient.delete(`/tasks/${taskId}/`);
      queryClient.setQueryData(["tasks"], (current) =>
        Array.isArray(current)
          ? current.filter((task) => task.id !== taskId)
          : current
      );
      Swal.fire({
        title: "Task deleted",
        icon: "success",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      Swal.fire({
        title: "Failed to delete task",
        icon: "error",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/`, {
        status,
      });
      queryClient.setQueryData(["tasks"], (current) =>
        Array.isArray(current)
          ? current.map((task) =>
              task.id === taskId ? { ...task, status } : task
            )
          : current
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      Swal.fire({
        title: "Failed to update status",
        icon: "error",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="w-full flex justify-center px-6 pb-10">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
              Execution Board
            </p>
            <h1 className="text-3xl font-semibold text-neutral-900">Tasks</h1>
          </div>
          <Link
            to="/dashboard/tasks/add"
            className="inline-flex items-center justify-center rounded-full bg-orange-400 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-orange-500"
          >
            Add Task
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/80 shadow-sm backdrop-blur">
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-lg font-semibold text-neutral-900">Task Pipeline</p>
            <p className="text-sm text-neutral-500">
              Assign work, set priorities, and track progress in real time.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 text-left text-neutral-600">
                <tr>
                  <th className="px-6 py-3">Task</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Assignee</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Due</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tasksLoading || recordsLoading || usersLoading ? (
                  <tr>
                    <td className="px-6 py-6 text-neutral-500" colSpan="7">
                      Loading tasks...
                    </td>
                  </tr>
                ) : tasksError || recordsError || usersError ? (
                  <tr>
                    <td className="px-6 py-6 text-neutral-500" colSpan="7">
                      Unable to load tasks right now.
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-neutral-500" colSpan="7">
                      No tasks yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-neutral-900">
                          {task.title}
                        </p>
                        {task.description ? (
                          <p className="text-xs text-neutral-500">
                            {task.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {task.record ? recordsById[task.record] : "-"}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {task.assigned_to
                          ? usersById[task.assigned_to] || "-"
                          : "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={task.status}
                          onChange={(event) =>
                            handleStatusChange(task.id, event.target.value)
                          }
                          className={`rounded-full border border-transparent px-3 py-1 text-xs font-semibold ${
                            STATUS_STYLES[task.status] || "bg-neutral-100"
                          }`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            PRIORITY_STYLES[task.priority] ||
                            "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {task.priority ?
                            task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {task.due_date || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/dashboard/tasks/${task.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:border-orange-300"
                          >
                            <FiEdit2 />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(task.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            <MdDelete />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
