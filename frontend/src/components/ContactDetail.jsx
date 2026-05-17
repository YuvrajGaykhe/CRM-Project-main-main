import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

const ContactDetail = () => {
  const { contactId } = useParams();
  const [contact, setContact] = useState(null);
  const [recordName, setRecordName] = useState("");
  const [interactions, setInteractions] = useState([]);
  const [formData, setFormData] = useState({
    interaction_type: "call",
    summary: "",
    occurred_at: "",
  });

  const defaultDateTime = useMemo(() => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      occurred_at: prev.occurred_at || defaultDateTime,
    }));
  }, [defaultDateTime]);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/contacts/${contactId}/`
        );
        setContact(response.data);

        if (response.data.record) {
          const recordResponse = await axios.get(
            `http://127.0.0.1:8000/api/records/${response.data.record}/`
          );
          setRecordName(
            `${recordResponse.data.first_name} ${recordResponse.data.last_name}`
          );
        }
      } catch (error) {
        console.error("Error fetching contact:", error);
      }
    };

    const fetchInteractions = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/contacts/${contactId}/interactions/`
        );
        setInteractions(response.data);
      } catch (error) {
        console.error("Error fetching interactions:", error);
      }
    };

    fetchContact();
    fetchInteractions();
  }, [contactId]);

  const handleInteractionChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInteractionSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/contacts/${contactId}/interactions/`,
        formData
      );
      setInteractions((prev) => [response.data, ...prev]);
      setFormData((prev) => ({
        ...prev,
        summary: "",
        occurred_at: defaultDateTime,
      }));
      Swal.fire({
        title: "Interaction logged",
        icon: "success",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error logging interaction:", error);
      Swal.fire({
        title: "Failed to log interaction",
        icon: "error",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    const result = await Swal.fire({
      title: "Delete this interaction?",
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
      await axios.delete(
        `http://127.0.0.1:8000/api/interactions/${interactionId}/`
      );
      setInteractions((prev) =>
        prev.filter((interaction) => interaction.id !== interactionId)
      );
      Swal.fire({
        title: "Interaction deleted",
        icon: "success",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting interaction:", error);
      Swal.fire({
        title: "Failed to delete interaction",
        icon: "error",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  if (!contact) {
    return (
      <div className="w-full flex justify-center px-6 pb-10">
        <div className="w-full max-w-5xl text-neutral-500">Loading contact...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center px-6 pb-10">
      <div className="w-full max-w-5xl space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
                Contact Profile
              </p>
              <h2 className="text-2xl font-semibold text-neutral-900">
                {contact.full_name}
              </h2>
              <p className="text-sm text-neutral-500">
                {contact.title || "Role not specified"}
              </p>
            </div>
            <Link
              to={`/dashboard/contacts/${contactId}/edit`}
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Edit Contact
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Customer
              </p>
              <p className="text-sm font-semibold text-neutral-900">
                {recordName || "Not linked"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Email
              </p>
              <p className="text-sm font-semibold text-neutral-900">
                {contact.email || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Phone
              </p>
              <p className="text-sm font-semibold text-neutral-900">
                {contact.phone || "-"}
              </p>
            </div>
          </div>

          {contact.notes ? (
            <div className="mt-5 rounded-2xl border border-neutral-100 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Notes
              </p>
              <p className="text-sm text-neutral-700 mt-1">{contact.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
                  Interaction Log
                </p>
                <h3 className="text-xl font-semibold text-neutral-900">
                  Recent Touchpoints
                </h3>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                {interactions.length} entries
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {interactions.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No interactions logged yet.
                </p>
              ) : (
                interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                          {interaction.interaction_type}
                        </p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {interaction.summary}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(interaction.occurred_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteInteraction(interaction.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <MdDelete />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
              Log Interaction
            </p>
            <h3 className="text-xl font-semibold text-neutral-900">
              Add a Touchpoint
            </h3>
            <form onSubmit={handleInteractionSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Type
                </label>
                <select
                  name="interaction_type"
                  value={formData.interaction_type}
                  onChange={handleInteractionChange}
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Summary
                </label>
                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInteractionChange}
                  required
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="occurred_at"
                  value={formData.occurred_at}
                  onChange={handleInteractionChange}
                  required
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-orange-400 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-orange-500"
              >
                Save Interaction
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
