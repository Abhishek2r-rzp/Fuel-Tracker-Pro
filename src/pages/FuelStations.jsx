import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { MapPin, Calendar, Fuel, ChevronRight } from "lucide-react";
import { format } from "date-fns";

function FuelStations() {
  const { currentUser } = useAuth();
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationRecords, setStationRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFuelStations();
  }, [currentUser]);

  const fetchFuelStations = async () => {
    try {
      // Get all fuel records with station info
      const recordsQuery = query(
        collection(db, "fuelRecords"),
        where("userId", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(recordsQuery);
      const records = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.stationName) {
          records.push({ id: doc.id, ...data });
        }
      });

      // Sort by date
      records.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Group by station name
      const stationsMap = new Map();
      records.forEach((record) => {
        const key = record.stationName;
        if (!stationsMap.has(key)) {
          stationsMap.set(key, {
            name: record.stationName,
            address: record.stationAddress || "Address not available",
            visits: [],
            totalSpent: 0,
            totalFuel: 0,
          });
        }
        const station = stationsMap.get(key);
        station.visits.push(record);
        station.totalSpent += record.amount || 0;
        station.totalFuel += record.fuelVolume || 0;
        station.lastVisit = record.date;
      });

      setStations(Array.from(stationsMap.values()));
    } catch (error) {
      console.error("Error fetching fuel stations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStationClick = (station) => {
    setSelectedStation(station);
    setStationRecords(station.visits);
  };

  const handleBack = () => {
    setSelectedStation(null);
    setStationRecords([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Station Details View
  if (selectedStation) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
        >
          <ChevronRight className="w-5 h-5 transform rotate-180" />
          <span>Back to Stations</span>
        </button>

        {/* Station Header */}
        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <Fuel className="w-8 h-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedStation.name}
              </h1>
              <div className="flex items-start space-x-2 mt-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{selectedStation.address}</p>
              </div>
            </div>
          </div>

          {/* Station Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Visits
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {selectedStation.visits.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{selectedStation.totalSpent.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Fuel
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {selectedStation.totalFuel.toFixed(2)} L
              </p>
            </div>
          </div>
        </div>

        {/* Visit History */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Visit History
          </h2>
          <div className="space-y-4">
            {stationRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {format(new Date(record.date), "EEEE, MMMM dd, yyyy")}
                    </p>
                    {record.time && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {record.time}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{record.amount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {record.fuelVolume} L
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Fuel Type
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.fuelType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Price/L</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.pricePerLiter
                        ? `₹${record.pricePerLiter}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Odometer</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {record.odometerReading
                        ? `${record.odometerReading} km`
                        : "N/A"}
                    </p>
                  </div>
                  {record.pumpNumber && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Pump No.
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.pumpNumber}
                      </p>
                    </div>
                  )}
                  {record.invoiceNumber && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Invoice
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.invoiceNumber}
                      </p>
                    </div>
                  )}
                  {record.paymentMethod && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Payment
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {record.paymentMethod}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Stations List View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Fuel Stations
        </h1>
      </div>

      {stations.length === 0 ? (
        <div className="card text-center py-12">
          <Fuel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No fuel station data yet.</p>
          <p className="text-gray-400 text-sm mt-2">
            Fuel stations will appear here after scanning bills with station
            names.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stations.map((station, index) => (
            <div
              key={index}
              onClick={() => handleStationClick(station)}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                  <Fuel className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {station.name}
                  </h3>
                  <div className="flex items-start space-x-2 mt-1 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm line-clamp-2">{station.address}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Visits
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {station.visits.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Spent
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{station.totalSpent.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Fuel
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {station.totalFuel.toFixed(1)}L
                      </p>
                    </div>
                  </div>

                  {station.lastVisit && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last visit:{" "}
                        {format(new Date(station.lastVisit), "MMM dd, yyyy")}
                      </p>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FuelStations;
