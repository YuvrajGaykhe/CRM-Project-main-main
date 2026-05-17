// frontend/src/components/ReadRecords.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const ReadRecords = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    // Fetch records when the component mounts
    const fetchRecords = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/records/");
        setRecords(response.data);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []);

  const handleDelete = async (recordId) => {
    const result = await Swal.fire({
      title: "Delete this record?",
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
      await axios.delete(`http://127.0.0.1:8000/api/records/${recordId}/`);
      setRecords((prev) => prev.filter((record) => record.id !== recordId));
      Swal.fire({
        title: "Record deleted",
        icon: "success",
        toast: true,
        timer: 3000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      Swal.fire({
        title: "Failed to delete record",
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
    <div className="w-4/5">
      <h2 className="text-xl font-bold mb-4"> All Records</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">First Name</th>
              <th className="px-4 py-2">Last Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">State</th>
              <th className="px-4 py-2">Zipcode</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td className="border px-4 py-2">{record.first_name}</td>
                <td className="border px-4 py-2">{record.last_name}</td>
                <td className="border px-4 py-2">{record.email}</td>
                <td className="border px-4 py-2">{record.phone}</td>
                <td className="border px-4 py-2">{record.address}</td>
                <td className="border px-4 py-2">{record.city}</td>
                <td className="border px-4 py-2">{record.state}</td>
                <td className="border px-4 py-2">{record.zipcode}</td>
                <td className="border px-4 py-2 space-y-2">
                  <Link
                    to={`/dashboard/edit-record/${record.id}`}
                    className="w-full flex justify-center items-center bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded"
                  >
                    <FaRegEdit />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(record.id)}
                    className="w-full flex justify-center items-center bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReadRecords;
