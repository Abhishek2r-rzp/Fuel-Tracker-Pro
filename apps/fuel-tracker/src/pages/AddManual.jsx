import { useState } from 'react';
import { useAuth } from '@bill-reader/shared-auth';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Save, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { FEATURES } from '@bill-reader/shared-utils';

function AddManual() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    amount: '',
    fuelVolume: '',
    odometerReading: '',
    fuelType: 'Petrol',
    stationName: '',
    stationAddress: '',
    pumpNumber: '',
    attendantName: '',
    invoiceNumber: '',
    paymentMethod: '',
    vehicleNumber: '',
    pricePerLiter: '',
    taxAmount: '',
    discountAmount: '',
    notes: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate price per liter if amount and volume are present
    if (name === 'amount' || name === 'fuelVolume') {
      const amount = name === 'amount' ? parseFloat(value) : parseFloat(formData.amount);
      const volume = name === 'fuelVolume' ? parseFloat(value) : parseFloat(formData.fuelVolume);
      
      if (amount && volume && amount > 0 && volume > 0) {
        const pricePerLiter = (amount / volume).toFixed(2);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          pricePerLiter: pricePerLiter
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.date || !formData.amount || !formData.fuelVolume || !formData.odometerReading) {
        alert('Please fill in all required fields: Date, Amount, Fuel Volume, and Odometer Reading');
        setSaving(false);
        return;
      }

      // Compress and upload image if present (only if feature is enabled)
      let billImageUrl = null;
      if (FEATURES.ENABLE_IMAGE_STORAGE && image) {
        try {
          console.log('Compressing image...');
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/jpeg'
          };
          
          const compressedImage = await imageCompression(image, options);
          console.log('Compressed image size:', (compressedImage.size / 1024 / 1024).toFixed(2), 'MB');
          
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(7);
          const filename = `${currentUser.uid}_${timestamp}_${randomId}.jpg`;
          
          const storageRef = ref(storage, `billImages/${currentUser.uid}/${filename}`);
          await uploadBytes(storageRef, compressedImage);
          billImageUrl = await getDownloadURL(storageRef);
          console.log('Image uploaded successfully');
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Image upload failed, but record will be saved without image');
        }
      }

      // Combine date and time
      const dateTime = formData.date + (formData.time ? `T${formData.time}` : 'T00:00');
      
      // Prepare record
      const record = {
        userId: currentUser.uid,
        date: dateTime,
        amount: parseFloat(formData.amount),
        fuelVolume: parseFloat(formData.fuelVolume),
        odometerReading: parseFloat(formData.odometerReading),
        fuelType: formData.fuelType,
        createdAt: new Date().toISOString(),
        manualEntry: true, // Flag to indicate manual entry
        ...(billImageUrl && { billImageUrl: billImageUrl }),
        ...(formData.stationName && { stationName: formData.stationName }),
        ...(formData.stationAddress && { stationAddress: formData.stationAddress }),
        ...(formData.pumpNumber && { pumpNumber: formData.pumpNumber }),
        ...(formData.attendantName && { attendantName: formData.attendantName }),
        ...(formData.invoiceNumber && { invoiceNumber: formData.invoiceNumber }),
        ...(formData.paymentMethod && { paymentMethod: formData.paymentMethod }),
        ...(formData.vehicleNumber && { vehicleNumber: formData.vehicleNumber }),
        ...(formData.pricePerLiter && { pricePerLiter: parseFloat(formData.pricePerLiter) }),
        ...(formData.taxAmount && { taxAmount: parseFloat(formData.taxAmount) }),
        ...(formData.discountAmount && { discountAmount: parseFloat(formData.discountAmount) }),
        ...(formData.notes && { notes: formData.notes })
      };
      
      await addDoc(collection(db, 'fuelRecords'), record);
      
      // Save fuel station info if provided
      if (formData.stationName) {
        await addDoc(collection(db, 'fuelStations'), {
          userId: currentUser.uid,
          stationName: formData.stationName,
          stationAddress: formData.stationAddress || '',
          lastVisited: dateTime,
          updatedAt: new Date().toISOString()
        });
      }
      
      alert('✅ Fuel record saved successfully!');
      navigate('/history');
    } catch (error) {
      console.error('Error saving fuel record:', error);
      
      // Show specific error message
      let errorMessage = 'Failed to save fuel record. ';
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'Firebase Storage rules not configured. Please deploy storage rules first, then try again.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Fuel Record Manually</h1>
        <button
          onClick={() => navigate('/scan')}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Or Scan Bill →
        </button>
      </div>

      <div className="card bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> You can scan bills automatically using the camera, or enter details manually here if you don't have a receipt image.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📋 Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fuel Type <span className="text-red-500">*</span>
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fuel Volume (Liters) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="fuelVolume"
                value={formData.fuelVolume}
                onChange={handleInputChange}
                className="input-field"
                placeholder="10.50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field"
                placeholder="1050.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price per Liter (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="pricePerLiter"
                value={formData.pricePerLiter}
                onChange={handleInputChange}
                className="input-field bg-gray-50"
                placeholder="Auto-calculated"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from amount and volume</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Odometer Reading (km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="odometerReading"
                value={formData.odometerReading}
                onChange={handleInputChange}
                className="input-field"
                placeholder="12345"
                required
              />
            </div>
          </div>
        </div>

        {/* Fuel Station Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">🏪 Fuel Station (Optional)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Station Name
              </label>
              <input
                type="text"
                name="stationName"
                value={formData.stationName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Indian Oil, BPCL, HP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select...</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Station Address
              </label>
              <textarea
                name="stationAddress"
                value={formData.stationAddress}
                onChange={handleInputChange}
                className="input-field"
                rows="2"
                placeholder="Station location address"
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📝 Additional Details (Optional)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                className="input-field"
                placeholder="INV-12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pump Number
              </label>
              <input
                type="text"
                name="pumpNumber"
                value={formData.pumpNumber}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Pump 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                className="input-field"
                placeholder="DL-01-XX-1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attendant Name
              </label>
              <input
                type="text"
                name="attendantName"
                value={formData.attendantName}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Attendant name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tax Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="taxAmount"
                value={formData.taxAmount}
                onChange={handleInputChange}
                className="input-field"
                placeholder="50.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleInputChange}
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input-field"
                rows="3"
                placeholder="Any additional notes about this fuel-up..."
              />
            </div>
          </div>
        </div>

        {/* Receipt Image Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📸 Receipt Image (Optional)</h2>
          
          {!preview ? (
            <div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Click to upload receipt image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={preview} 
                alt="Receipt preview" 
                className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-600 mt-2">
                ✓ Image will be compressed before saving (max 500KB)
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Record</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddManual;

