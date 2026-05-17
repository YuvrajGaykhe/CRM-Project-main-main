import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { MdDelete, MdOutlineVisibility } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";
import { getContacts, getRecords } from "../services/api/crm";

const ContactsPage = () => {
  const {
    data: contacts = [],
    isLoading: contactsLoading,
    isError: contactsError,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: getContacts,
  });

  const {
    data: records = [],
    isLoading: recordsLoading,
    isError: recordsError,
  } = useQuery({
    queryKey: ["records"],
    queryFn: getRecords,
  });

  const recordsById = useMemo(() => {
    return records.reduce((acc, record) => {
      acc[record.id] = `${record.first_name} ${record.last_name}`;
      return acc;
    }, {});
  }, [records]);

  const queryClient = useQueryClient();

  const handleDelete = async (contactId) => {
    const result = await Swal.fire({
      title: "Delete this contact?",
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
      await apiClient.delete(`/contacts/${contactId}/`);
      queryClient.setQueryData(["contacts"], (current) =>
        Array.isArray(current)
          ? current.filter((contact) => contact.id !== contactId)
          : current
      );
      Swal.fire({
        title: "Contact deleted",
        icon: "success",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      Swal.fire({
        title: "Failed to delete contact",
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
              Customer Network
            </p>
            <h1 className="text-3xl font-semibold text-neutral-900">Contacts</h1>
          </div>
          <Link
            to="/dashboard/contacts/add"
            className="inline-flex items-center justify-center rounded-full bg-orange-400 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-orange-500"
          >
            Add Contact
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/80 shadow-sm backdrop-blur">
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-lg font-semibold text-neutral-900">All Contacts</p>
            <p className="text-sm text-neutral-500">
              Track decision makers, champions, and customer touchpoints.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 text-left text-neutral-600">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {contactsLoading || recordsLoading ? (
                  <tr>
                    <td className="px-6 py-6 text-neutral-500" colSpan="6">
                      Loading contacts...
                    </td>
                  </tr>
                ) : contactsError || recordsError ? (
                  <tr>
                    <td className="px-6 py-6 text-neutral-500" colSpan="6">
                      Unable to load contacts right now.
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-neutral-500" colSpan="6">
                      No contacts yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        {contact.full_name}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {recordsById[contact.record] || "-"}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {contact.title || "-"}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {contact.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-neutral-700">
                        {contact.phone || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/dashboard/contacts/${contact.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:border-orange-300"
                          >
                            <MdOutlineVisibility />
                            View
                          </Link>
                          <Link
                            to={`/dashboard/contacts/${contact.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:border-orange-300"
                          >
                            <FiEdit2 />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(contact.id)}
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

export default ContactsPage;
