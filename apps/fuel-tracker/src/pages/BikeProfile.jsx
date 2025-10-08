import { useState, useEffect } from "react";
import { useAuth } from "@bill-reader/shared-auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Bike, Save, User, Mail, Calendar, CheckCircle } from "lucide-react";
import { getBikeMakes, getBikeDetails } from "../services/bikeService";

function BikeProfile() {
  const { currentUser } = useAuth();
  const [bikeData, setBikeData] = useState({
    make: "",
    model: "",
    year: "",
    engineCapacity: "",
    fuelCapacity: "",
    mileageStandard: "",
    fuelType: "Petrol",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableMakes, setAvailableMakes] = useState([]);
  const [fetchingSpecs, setFetchingSpecs] = useState(false);
  const [specsLoaded, setSpecsLoaded] = useState(false);
  const [hasSavedBike, setHasSavedBike] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBikeMakes();
    fetchBikeProfile();
  }, [currentUser]);

  const fetchBikeMakes = async () => {
    try {
      const makes = await getBikeMakes();
      setAvailableMakes(makes);
    } catch (error) {
      console.error("Error fetching bike makes:", error);
    }
  };

  const fetchBikeProfile = async () => {
    try {
      const docRef = doc(db, "bikeProfiles", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setBikeData(data);
        setHasSavedBike(true);
        setShowForm(false);
        if (data.engineCapacity && data.fuelCapacity && data.mileageStandard) {
          setSpecsLoaded(true);
        }
      } else {
        setHasSavedBike(false);
        setShowForm(true);
      }
    } catch (error) {
      console.error("Error fetching bike profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeChange = (e) => {
    const make = e.target.value;
    setBikeData((prev) => ({
      ...prev,
      make,
      model: "",
      engineCapacity: "",
      fuelCapacity: "",
      mileageStandard: "",
      fuelType: "Petrol",
    }));
    setSpecsLoaded(false);
  };

  const fetchBikeSpecs = async () => {
    if (!bikeData.make || !bikeData.model) {
      alert("Please enter both make and model");
      return;
    }

    setFetchingSpecs(true);
    try {
      console.log(`Fetching specs for ${bikeData.make} ${bikeData.model}...`);
      const details = await getBikeDetails(bikeData.make, bikeData.model);

      if (
        details &&
        details.engineCapacity &&
        details.engineCapacity !== "N/A"
      ) {
        setBikeData((prev) => ({
          ...prev,
          year: details.year || prev.year,
          engineCapacity: details.engineCapacity,
          fuelCapacity: details.fuelCapacity,
          mileageStandard: details.mileageStandard,
          fuelType: details.fuelType,
        }));
        setSpecsLoaded(true);
        alert("✅ Specifications loaded successfully!");
      } else {
        alert(
          "⚠️ No specifications found for this bike. Please enter manually."
        );
        setSpecsLoaded(false);
      }
    } catch (error) {
      console.error("Error fetching bike specs:", error);
      alert(
        "❌ Failed to fetch specifications. Please try again or enter manually."
      );
      setSpecsLoaded(false);
    } finally {
      setFetchingSpecs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await setDoc(doc(db, "bikeProfiles", currentUser.uid), {
        ...bikeData,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString(),
      });

      setHasSavedBike(true);
      setShowForm(false);
      alert("✅ Bike profile saved successfully!");
    } catch (error) {
      console.error("Error saving bike profile:", error);
      alert("❌ Failed to save bike profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewBike = () => {
    setBikeData({
      make: "",
      model: "",
      year: "",
      engineCapacity: "",
      fuelCapacity: "",
      mileageStandard: "",
      fuelType: "Petrol",
    });
    setSpecsLoaded(false);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    fetchBikeProfile();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBikeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary-100 p-3 rounded-full">
          <Bike className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Bike Profile
        </h1>
      </div>

      {/* User Information Card */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary-600" />
          Account Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Mail className="w-4 h-4 mr-3 text-primary-600" />
            <span className="font-medium mr-2">Email:</span>
            <span>{currentUser?.email}</span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-3 text-primary-600" />
            <span className="font-medium mr-2">Member since:</span>
            <span>
              {currentUser?.metadata?.creationTime
                ? new Date(
                    currentUser.metadata.creationTime
                  ).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 mr-3 text-primary-600" />
            <span className="font-medium mr-2">User ID:</span>
            <span className="text-sm font-mono bg-white px-2 py-1 rounded">
              {currentUser?.uid?.substring(0, 12)}...
            </span>
          </div>
        </div>
      </div>

      {/* Saved Bike Display */}
      {hasSavedBike && !showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Saved Bike
            </h2>
            <button
              onClick={handleAddNewBike}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Bike className="w-5 h-5" />
              <span>Edit / Add New</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Make / Brand</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bikeData.make}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Model</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bikeData.model}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Year</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bikeData.year}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Engine Capacity</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bikeData.engineCapacity} cc
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Fuel Tank Capacity</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bikeData.fuelCapacity} L
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Claimed Mileage</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bikeData.mileageStandard !== "N/A"
                  ? `${bikeData.mileageStandard} km/l`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg col-span-2">
              <p className="text-sm text-gray-600 mb-1">Fuel Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {bikeData.fuelType}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Bike Form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {hasSavedBike ? "Edit Bike Profile" : "Add Your Bike"}
            </h2>
            {hasSavedBike && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Make Selection - Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make / Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={bikeData.make}
                onChange={handleMakeChange}
                className="input-field"
                required
              >
                <option value="">Select Make</option>
                {availableMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Input - Text Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="model"
                  value={bikeData.model}
                  onChange={handleInputChange}
                  className="input-field flex-1"
                  placeholder="e.g., Pulsar 150, CB Shine, Classic 350"
                  required
                />
                <button
                  type="button"
                  onClick={fetchBikeSpecs}
                  disabled={!bikeData.make || !bikeData.model || fetchingSpecs}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {fetchingSpecs ? "Fetching..." : "Get Specs"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter model name and click &quot;Get Specs&quot; to auto-fill
                specifications
              </p>
            </div>

            {/* Year - Only field user needs to fill */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={bikeData.year}
                onChange={handleInputChange}
                className="input-field"
                placeholder="2023"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            {/* Auto-filled Specifications - Show when specs are loaded */}
            {specsLoaded && bikeData.engineCapacity && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-green-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Auto-Filled Specifications
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Engine Capacity:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {bikeData.engineCapacity} cc
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Fuel Tank:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {bikeData.fuelCapacity} L
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Claimed Mileage:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {bikeData.mileageStandard} km/l
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Fuel Type:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {bikeData.fuelType}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Entry Fields - Show if specs not loaded */}
            {!specsLoaded && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Capacity (cc)
                  </label>
                  <input
                    type="number"
                    name="engineCapacity"
                    value={bikeData.engineCapacity}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Tank Capacity (Liters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="fuelCapacity"
                    value={bikeData.fuelCapacity}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="12.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer&apos;s Claimed Mileage (km/l)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="mileageStandard"
                    value={bikeData.mileageStandard}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="45.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    name="fuelType"
                    value={bikeData.fuelType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Saving..." : "Save Bike Profile"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Info Card - Show when bike is saved */}
      {hasSavedBike &&
        !showForm &&
        bikeData.mileageStandard &&
        bikeData.mileageStandard !== "N/A" && (
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Info
            </h3>
            <p className="text-blue-800">
              Your {bikeData.make} {bikeData.model} has a manufacturer&apos;s
              claimed mileage of{" "}
              <strong>{bikeData.mileageStandard} km/l</strong>. Compare this
              with your actual mileage on the dashboard to see how efficiently
              you&apos;re riding!
            </p>
          </div>
        )}
    </div>
  );
}

export default BikeProfile;
