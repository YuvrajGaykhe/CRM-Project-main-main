import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const EditTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    record: "",
    assigned_to: "",
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/tasks/${taskId}/`
        );
        setFormData({
          title: response.data.title || "",
          description: response.data.description || "",
          status: response.data.status || "todo",
          priority: response.data.priority || "medium",
          due_date: response.data.due_date || "",
          record: response.data.record || "",
          assigned_to: response.data.assigned_to || "",
        });
      } catch (error) {
        console.error("Error loading task:", error);
      }
    };

    const fetchRecords = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/records/");
        setRecords(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchTask();
    fetchRecords();
    fetchUsers();
  }, [taskId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
        ...formData,
        record: formData.record || null,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null,
      });
      Swal.fire({
        title: "Task updated",
        icon: "success",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
      navigate("/dashboard/tasks");
    } catch (error) {
      console.error("Error updating task:", error);
      Swal.fire({
        title: "Failed to update task",
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
      <div className="w-full max-w-3xl rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-sm backdrop-blur">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
            Update Task
          </p>
          <h2 className="text-2xl font-semibold text-neutral-900">Edit Task</h2>
          <p className="text-sm text-neutral-500">
            Adjust assignment, priority, and next steps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Customer
              </label>
              <select
                name="record"
                value={formData.record}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
              >
                <option value="">Select a customer</option>
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.first_name} {record.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Assignee
              </label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username || user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/tasks")}
              className="rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-600 hover:border-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-orange-400 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-orange-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
