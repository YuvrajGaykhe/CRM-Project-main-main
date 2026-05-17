import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const EditContact = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    record: "",
    full_name: "",
    title: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/contacts/${contactId}/`
        );
        setFormData({
          record: response.data.record || "",
          full_name: response.data.full_name || "",
          title: response.data.title || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          notes: response.data.notes || "",
        });
      } catch (error) {
        console.error("Error loading contact:", error);
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

    fetchContact();
    fetchRecords();
  }, [contactId]);

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
      await axios.put(
        `http://127.0.0.1:8000/api/contacts/${contactId}/`,
        formData
      );
      Swal.fire({
        title: "Contact updated",
        icon: "success",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
      navigate(`/dashboard/contacts/${contactId}`);
    } catch (error) {
      console.error("Error updating contact:", error);
      Swal.fire({
        title: "Failed to update contact",
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
            Update Contact
          </p>
          <h2 className="text-2xl font-semibold text-neutral-900">
            Edit Contact
          </h2>
          <p className="text-sm text-neutral-500">
            Keep contact details fresh and aligned with the account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Customer
            </label>
            <select
              name="record"
              value={formData.record}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2"
            >
              <option value="">Select a customer</option>
              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.first_name} {record.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/contacts/${contactId}`)}
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

export default EditContact;
