# 🏪 Fuel Station Information Guide

## ❓ Why Don't I See Station Information?

Your current fuel records show **"No station info"** because they were added **before** the station extraction feature was implemented.

---

## 🔍 How Station Info Works

### Automatic Extraction via OCR

When you scan a fuel bill, the app automatically:

1. **Extracts Station Name**
   - Detects: Indian Oil, BPCL, HPCL, Shell, Reliance, Nayara, etc.
   - Looks in the first 8 lines of the bill

2. **Extracts Station Address**
   - Detects address keywords: Road, Street, Colony, Nagar, etc.
   - Captures PIN codes (6-digit numbers)
   - Combines multiple address lines
   - Looks in the first 15 lines of the bill

3. **Saves to Database**
   - Stored with your fuel record
   - Available in History table
   - Grouped in Stations page

---

## 📊 Where to See Station Information

### 1. **History Page** (Updated!)
```
DATE              | STATION                    | FUEL TYPE | VOLUME
Sep 21, 2025      | INDIAN OIL                 | Petrol    | 11.9 L
                  | Main Road, City, 123456    |           |
                  
Sep 21, 2025      | No station info            | Petrol    | 90 L
                  (old record)
```

### 2. **Stations Page** (New!)
```
📍 INDIAN OIL
Main Road, City, 123456

Visits: 2 | Spent: ₹2,532 | Fuel: 23.8 L
Last visit: Sep 21, 2025

[Click to see full visit history →]
```

### 3. **Dashboard**
- Shows recent records (coming soon: station column)

---

## 🎯 How to Get Station Information

### ✅ For New Records (Works Now!)

**Step 1: Scan a Bill**
1. Go to "Scan Bill" page
2. Take photo of fuel bill
3. Click "Extract Data"

**Step 2: OCR Extracts Station Info**
```
✅ Date: Sep 21, 2025
✅ Amount: ₹1,266.28
✅ Fuel Volume: 11.9 L
✅ Station Name: INDIAN OIL ← Automatically extracted!
✅ Station Address: Main Road, Delhi, 110001 ← Automatically extracted!
✅ Odometer: 3920 km
```

**Step 3: Auto-Saved**
- All data saved to database
- Station appears in History
- Station appears in Stations page

---

## 📝 For Old Records (Manual Update)

Your existing records (without station info) have 3 options:

### Option 1: Leave As-Is ✅ Recommended
- Keep old records without station info
- They'll show "No station info" in table
- Add new records with station info going forward
- Both types of records work fine together!

### Option 2: Delete & Re-scan
1. Delete old records (trash icon)
2. Re-scan the bills if you still have them
3. New records will include station info

### Option 3: Manual Entry (Future Feature)
- Coming soon: Edit button to manually add station info
- Will allow updating old records

---

## 🏪 Station Page Features

### Main View - All Stations
```
┌──────────────────────────────────────┐
│ 🏪 INDIAN OIL                        │
│ 📍 Main Road, Delhi, 110001          │
│                                      │
│ Visits: 5  Spent: ₹6,331  Fuel: 59.5L│
│ Last visit: Sep 21, 2025             │
│                                  [→] │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 🏪 BPCL PETROL PUMP                  │
│ 📍 Highway Circle, Mumbai, 400001    │
│                                      │
│ Visits: 3  Spent: ₹3,798  Fuel: 35.7L│
│ Last visit: Sep 15, 2025             │
│                                  [→] │
└──────────────────────────────────────┘
```

### Station Details (Click Any Station)
```
[← Back to Stations]

🏪 INDIAN OIL
📍 Main Road, Delhi, 110001

Visits: 5 | Spent: ₹6,331.40 | Fuel: 59.5 L

━━━━━━━━━━━ VISIT HISTORY ━━━━━━━━━━━

┌─────────────────────────────────────┐
│ 📅 Saturday, September 21, 2025     │
│ 🕐 14:30                  ₹1,266.28 │
│                              11.9 L │
│                                     │
│ Fuel Type: Petrol                   │
│ Price/L: ₹106.39                    │
│ Odometer: 3920 km                   │
│ Pump No.: 5                         │
│ Invoice: INV-12345                  │
│ Payment: Credit Card                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📅 Friday, September 15, 2025       │
│ 🕐 10:15                  ₹1,200.00 │
│                              11.3 L │
│                                     │
│ Fuel Type: Petrol                   │
│ Price/L: ₹106.19                    │
│ Odometer: 3800 km                   │
│ Pump No.: 3                         │
└─────────────────────────────────────┘
```

---

## 🧪 Testing Station Extraction

### Test with Your Next Bill

**What to look for on the bill:**
- Company logo/name (top of bill)
- Address below company name
- PIN code somewhere in top section

**Example Bill Layout:**
```
═══════════════════════════════════
    🛢️ INDIAN OIL CORPORATION
     DEALER: ABC FUEL STATION
    Main Road, Sector 21, Delhi
          PIN: 110001
───────────────────────────────────
Date: 21/09/2025        Time: 14:30
───────────────────────────────────
Product: MS (PETROL)
Quantity: 11.900 Litres
Rate: ₹106.39/Ltr
Amount: ₹1,266.28
───────────────────────────────────
```

**What OCR Will Extract:**
```
✅ stationName: "INDIAN OIL CORPORATION"
✅ stationAddress: "Main Road, Sector 21, Delhi, PIN: 110001"
✅ date: "2025-09-21"
✅ time: "14:30"
✅ fuelVolume: "11.9"
✅ pricePerLiter: "106.39"
✅ amount: "1266.28"
✅ fuelType: "Petrol"
```

---

## 🔧 OCR Station Detection Patterns

### Station Names Detected:
- INDIAN OIL, IOCL, IOC
- BPCL, BHARAT PETROLEUM, BP
- HPCL, HINDUSTAN PETROLEUM, HP
- SHELL
- ESSAR
- RELIANCE
- NAYARA

### Address Keywords Detected:
- Road, Street, Avenue
- Colony, Nagar, Pura, Pur, Ganj
- Market, Circle, Cross
- Area, Sector
- PIN codes (6 digits)
- City names

---

## 💡 Tips for Best Results

### 📸 When Scanning:
1. ✅ Ensure bill is well-lit
2. ✅ Keep camera steady
3. ✅ Include top portion of bill (has station name/address)
4. ✅ Avoid shadows
5. ✅ Bill should be flat, not crumpled

### 📝 What Gets Saved:
- ✅ **Always:** Date, Amount, Fuel Volume, Odometer
- ✅ **If detected:** Station Name, Address, Time, Pump Number, Invoice
- ✅ **Calculated:** Price per liter (if not found)

---

## 📊 Current Status

### Your Records:
```
Record 1: Sep 21, 2025 - No station info (old)
Record 2: Sep 21, 2025 - No station info (old)
```

### Next Record:
```
Will include:
✅ Station Name
✅ Station Address
✅ All other details
```

---

## 🎯 Quick Action Items

### Right Now:
1. ✅ Refresh History page → See new "Station" column
2. ✅ Click "Stations" in nav → See empty state (no stations yet)
3. ✅ Read the info notice on History page

### Next Time You Refuel:
1. 📸 Take photo of bill
2. 📱 Scan in app
3. ✅ Station info automatically saved!
4. 📍 See it appear in Stations page!

---

## ❓ FAQ

### Q: Why don't my old records have station info?
**A:** Station extraction was just added. Old records were saved before this feature existed.

### Q: Can I add station info to old records manually?
**A:** Not yet, but an edit feature is planned for future updates.

### Q: Do I need to do anything special?
**A:** No! Just scan bills normally. Station info is extracted automatically.

### Q: What if OCR misses the station name?
**A:** It will show "No station info" in the table. The record is still saved with all other details.

### Q: Can I see which station I visit most?
**A:** Yes! Go to Stations page → Shows visit count per station.

### Q: Does this work with all fuel stations?
**A:** It works best with major brands (Indian Oil, BPCL, HPCL, Shell, etc.) but can detect others too.

---

## 🎉 Summary

### ✅ What's Working:
- Station info extraction from new scans
- Station display in History table
- Dedicated Stations page
- Station visit history

### 📋 What Shows "No station info":
- Your current 2 records (added before feature)
- Future records where OCR can't detect station name

### 🚀 What to Do:
1. Refresh app to see changes
2. Scan your next bill
3. Watch station info appear automatically!

---

**Station tracking is ready!** Just scan your next fuel bill and see the magic! ✨

