import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Gauge, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { deleteDoc, doc } from 'firebase/firestore';

function Dashboard() {
  const { currentUser } = useAuth();
  const [fuelRecords, setFuelRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgMileage: 0,
    costPerKm: 0,
    totalSpent: 0,
    totalFuel: 0
  });

  useEffect(() => {
    fetchFuelRecords();
  }, [currentUser]);

  const fetchFuelRecords = async () => {
    try {
      const q = query(
        collection(db, 'fuelRecords'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() });
      });
      
      setFuelRecords(records);
      calculateStats(records);
    } catch (error) {
      console.error('Error fetching fuel records:', error);
      
      // If index error, try without orderBy
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.log('Index not ready, fetching without ordering...');
        try {
          const simpleQuery = query(
            collection(db, 'fuelRecords'),
            where('userId', '==', currentUser.uid)
          );
          const querySnapshot = await getDocs(simpleQuery);
          const records = [];
          querySnapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() });
          });
          
          // Sort manually by date
          records.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setFuelRecords(records.slice(0, 10));
          calculateStats(records.slice(0, 10));
        } catch (innerError) {
          console.error('Fallback query also failed:', innerError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    if (records.length < 2) {
      setStats({
        avgMileage: 0,
        costPerKm: 0,
        totalSpent: records.reduce((sum, r) => sum + r.amount, 0),
        totalFuel: records.reduce((sum, r) => sum + r.fuelVolume, 0)
      });
      return;
    }

    let totalDistance = 0;
    let totalFuel = 0;
    let totalCost = 0;

    // Calculate mileage between consecutive records
    for (let i = 0; i < records.length - 1; i++) {
      const distance = records[i].odometerReading - records[i + 1].odometerReading;
      if (distance > 0) {
        totalDistance += distance;
        totalFuel += records[i].fuelVolume;
        totalCost += records[i].amount;
      }
    }

    const avgMileage = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : 0;
    const costPerKm = totalDistance > 0 ? (totalCost / totalDistance).toFixed(2) : 0;

    setStats({
      avgMileage: parseFloat(avgMileage),
      costPerKm: parseFloat(costPerKm),
      totalSpent: records.reduce((sum, r) => sum + r.amount, 0),
      totalFuel: records.reduce((sum, r) => sum + r.fuelVolume, 0)
    });
  };

  const getMileageChartData = () => {
    const data = [];
    for (let i = 0; i < fuelRecords.length - 1; i++) {
      const distance = fuelRecords[i].odometerReading - fuelRecords[i + 1].odometerReading;
      if (distance > 0) {
        const mileage = distance / fuelRecords[i].fuelVolume;
        data.unshift({
          date: format(new Date(fuelRecords[i].date), 'MMM dd'),
          mileage: parseFloat(mileage.toFixed(2))
        });
      }
    }
    return data;
  };

  const getCostChartData = () => {
    return fuelRecords.slice(0, 7).reverse().map(record => ({
      date: format(new Date(record.date), 'MMM dd'),
      cost: record.amount,
      volume: record.fuelVolume
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this fuel record? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'fuelRecords', id));
      alert('✅ Record deleted successfully!');
      fetchFuelRecords(); // Refresh data
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('❌ Failed to delete record. Please try again.');
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Mileage</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.avgMileage} <span className="text-sm font-normal">km/l</span>
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Gauge className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cost per km</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{stats.costPerKm}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{stats.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fuel</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalFuel.toFixed(2)} <span className="text-sm font-normal">L</span>
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {fuelRecords.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mileage Trend */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Mileage Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMileageChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="mileage" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Analysis */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Fuel Cost Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCostChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mileage Calculation Info */}
      {fuelRecords.length > 0 && fuelRecords.length < 2 && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">ℹ️ How to See Mileage & Cost per km</h3>
              <p className="text-sm text-blue-800">
                <strong>Add one more fuel record</strong> to calculate your average mileage and cost per km!
              </p>
              <p className="text-sm text-blue-700 mt-2">
                📊 <strong>Calculation:</strong> Mileage = (Current Odometer - Previous Odometer) ÷ Fuel Volume
              </p>
              <p className="text-sm text-blue-700 mt-1">
                💰 <strong>Cost per km:</strong> Total Amount ÷ Distance Traveled
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Records */}
      {fuelRecords.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Fuel Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Odometer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fuelRecords.slice(0, 5).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.fuelVolume} L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{record.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.odometerReading} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-800 transition-colors inline-flex items-center space-x-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {fuelRecords.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No fuel records yet. Start by scanning a bill!</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

