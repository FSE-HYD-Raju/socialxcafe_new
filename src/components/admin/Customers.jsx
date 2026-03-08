import { useEffect, useState, useRef } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AddCustomerModal from "../customer/AddCustomerModal";
import EditCustomerModal from "../customer/EditCustomerModal";
import TransactionHistoryModal from "../customer/TransactionHistoryModal";
import { db } from "../../lib/firebase";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const dropdownRef = useRef();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const fetchData = async () => {
    const customersSnap = await getDocs(collection(db, "customers"));
    const transactionsSnap = await getDocs(
      collection(db, "walletTransactions"),
    );
    setCustomers(
      customersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })),
    );
    setTransactions(transactionsSnap.docs.map((d) => d.data()));
  };
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteDoc(doc(db, "customers", deleteConfirm.id));
    setDeleteConfirm(null);
    fetchData();
  };
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  // Export All With History
  const exportAll = () => {
    const rows = [];
    customers.forEach((c) => {
      const userTxns = transactions.filter((t) => t.customerId === c.id);
      if (userTxns.length === 0) {
        rows.push({
          Name: c.name,
          Phone: c.phone,
          Wallet: c.walletBalance,
          Type: "",
          Amount: "",
          Note: "",
          Date: "",
        });
      } else {
        userTxns.forEach((t) => {
          rows.push({
            Name: c.name,
            Phone: c.phone,
            Wallet: c.walletBalance,
            Type: t.type,
            Amount: t.amount,
            Note: t.note || "",
            Date: t.createdAt?.toDate()?.toLocaleString() || "",
          });
        });
      }
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });
    const date = new Date();
    const shortDate = date.toLocaleDateString();
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `customers-${shortDate}.xlsx`,
    );
  };
  return (
    <div>
      {/* Top Controls */}
      <div className="flex justify-between mb-6 items-center">
        <input
          type="text"
          placeholder="Search customers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-xl w-72 text-sm"
        />
        <div className="flex gap-4">
          <button
            onClick={exportAll}
            className="border px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
          >
            Export
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm"
          >
            + Add Customer
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="bg-white rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Phone</th>
              <th className="text-left p-3 font-medium">Wallet</th>
              <th className="text-left p-3 font-medium">History</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((c) => (
              <tr key={c.phone} className="border-b hover:bg-gray-50">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 font-medium">₹{c.walletBalance}</td>
                <td className="p-3">
                  <button
                    onClick={() => setHistoryCustomer(c)}
                    className="text-blue-600 text-sm"
                  >
                    View
                  </button>
                </td>
                <td className="p-3 relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === c.phone ? null : c.phone,
                      )
                    }
                  >
                    ⋮
                  </button>
                  {activeDropdown === c.phone && (
                    <div className="absolute right-20 top-3 bg-white border rounded-xl shadow-lg w-32 z-50">
                      <button
                        onClick={() => {
                          setEditCustomer(c);
                          setActiveDropdown(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirm(c);
                          setActiveDropdown(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          {Array.from({
            length: totalPages,
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                currentPage === i + 1 ? "bg-primary text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96">
            <h2 className="font-heading text-lg mb-4">Confirm Delete</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="border px-4 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showAdd && (
        <AddCustomerModal
          onClose={() => {
            setShowAdd(false);
            fetchData();
          }}
        />
      )}
      {editCustomer && (
        <EditCustomerModal
          customer={editCustomer}
          onClose={() => {
            setEditCustomer(null);
            fetchData();
          }}
        />
      )}
      {historyCustomer && (
        <TransactionHistoryModal
          customer={historyCustomer}
          onClose={() => setHistoryCustomer(null)}
        />
      )}
    </div>
  );
}
