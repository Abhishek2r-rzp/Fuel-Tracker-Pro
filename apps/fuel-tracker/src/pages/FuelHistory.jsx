import { useState, useEffect } from 'react';
import { useAuth } from '@bill-reader/shared-auth';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format } from 'date-fns';
import { Trash2, Filter, Info, Image, X } from "lucide-react";

function FuelHistory() {
  const { currentUser } = useAuth();
  const [fuelRecords, setFuelRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchFuelRecords();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [filter, dateRange, fuelRecords]);

  const fetchFuelRecords = async () => {
    try {
      const q = query(
        collection(db, "fuelRecords"),
        where("userId", "==", currentUser.uid),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
      });

      setFuelRecords(records);
      setFilteredRecords(records);
    } catch (error) {
      console.error("Error fetching fuel records:", error);

      // If index error, try without orderBy (same fallback as Dashboard)
      if (
        error.code === "failed-precondition" ||
        error.message?.includes("index")
      ) {
        console.log("Index not ready, fetching without ordering...");
        try {
          const simpleQuery = query(
            collection(db, "fuelRecords"),
            where("userId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(simpleQuery);
          const records = [];
          querySnapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() });
          });

          // Sort manually by date (newest first)
          records.sort((a, b) => new Date(b.date) - new Date(a.date));

          setFuelRecords(records);
          setFilteredRecords(records);
        } catch (innerError) {
          console.error("Fallback query also failed:", innerError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...fuelRecords];

    // Filter by fuel type
    if (filter !== "all") {
      filtered = filtered.filter((record) => record.fuelType === filter);
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate >= new Date(dateRange.start) &&
          recordDate <= new Date(dateRange.end)
        );
      });
    }

    setFilteredRecords(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteDoc(doc(db, "fuelRecords", id));
        setFuelRecords((prev) => prev.filter((record) => record.id !== id));
      } catch (error) {
        console.error("Error deleting record:", error);
        alert("Failed to delete record");
      }
    }
  };

  const calculateMileage = (index) => {
    if (index >= filteredRecords.length - 1) return "-";

    const current = filteredRecords[index];
    const previous = filteredRecords[index + 1];

    const distance = current.odometerReading - previous.odometerReading;
    if (distance <= 0) return "-";

    const mileage = distance / current.fuelVolume;
    return mileage.toFixed(2) + " km/l";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fuel History</h1>
      </div>

      {/* Station Info Notice */}
      {fuelRecords.some((r) => !r.stationName) && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-900 font-medium mb-1">
                ℹ️ Station Information
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                Station names and addresses are automatically extracted from
                scanned bills using OCR. Your current records show "No station
                info" because they were added before this feature was enabled.
              </p>
              <p className="text-blue-800 mt-2">
                <strong>Next time you scan a bill:</strong> Station details will
                be automatically saved!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Odometer (km)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record, index) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {format(new Date(record.date), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {record.stationName ? (
                      <div>
                        <div className="font-medium">{record.stationName}</div>
                        {record.stationAddress && (
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {record.stationAddress}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        No station info
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        record.fuelType === "Petrol"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {record.fuelType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {record.fuelVolume}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{record.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {record.odometerReading}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {calculateMileage(index)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {record.billImageUrl && (
                        <button
                          onClick={() => setSelectedImage(record.billImageUrl)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Bill Image"
                        >
                          <Image className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Record"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {filteredRecords.length > 0 && (
        <div className="card bg-primary-50 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-primary-700">Total Records</p>
              <p className="text-2xl font-bold text-primary-900">
                {filteredRecords.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-700">Total Fuel</p>
              <p className="text-2xl font-bold text-primary-900">
                {filteredRecords
                  .reduce((sum, r) => sum + r.fuelVolume, 0)
                  .toFixed(2)}{" "}
                L
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-700">Total Spent</p>
              <p className="text-2xl font-bold text-primary-900">
                ₹
                {filteredRecords
                  .reduce((sum, r) => sum + r.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-700">Avg Price/L</p>
              <p className="text-2xl font-bold text-primary-900">
                ₹
                {(
                  filteredRecords.reduce((sum, r) => sum + r.amount, 0) /
                  filteredRecords.reduce((sum, r) => sum + r.fuelVolume, 0)
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
            <img
              src={selectedImage}
              alt="Fuel Bill"
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FuelHistory;

