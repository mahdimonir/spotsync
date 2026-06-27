"use client";

import React, { useEffect, useState } from "react";
import { api, Zone, Reservation } from "@/lib/api";
import {
  ParkingSquare,
  BookmarkCheck,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Zap,
  Info,
  CheckCircle,
  XCircle,
  DollarSign
} from "lucide-react";

export default function DashboardPage() {
  // Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "zones" | "reservations">("overview");

  // User session details
  const [role, setRole] = useState<string>("driver");
  const [userID, setUserID] = useState<number | null>(null);

  // States
  const [zones, setZones] = useState<Zone[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals state
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Zone form states
  const [zoneName, setZoneName] = useState("");
  const [zoneType, setZoneType] = useState<"general" | "ev_charging" | "covered">("general");
  const [zoneCapacity, setZoneCapacity] = useState<number>(10);
  const [zonePrice, setZonePrice] = useState<number>(2.0);

  // Reservation booking states
  const [showBookModal, setShowBookModal] = useState(false);
  const [targetBookZone, setTargetBookZone] = useState<Zone | null>(null);
  const [licensePlate, setLicensePlate] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole") || "driver";
    const id = localStorage.getItem("userID");
    setRole(userRole);
    if (id) setUserID(Number(id));

    fetchData(userRole);
  }, []);

  const fetchData = async (userRole: string) => {
    setLoading(true);
    setError(null);
    try {
      const zonesRes = await api.getZones();
      if (zonesRes.success && zonesRes.data) {
        setZones(zonesRes.data);
      }

      const myRes = await api.getMyReservations();
      if (myRes.success && myRes.data) {
        setMyReservations(myRes.data);
      }

      if (userRole === "admin") {
        const allRes = await api.getAllReservations();
        if (allRes.success && allRes.data) {
          setAllReservations(allRes.data);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load database records.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Create or Update Zone
  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName || zoneCapacity <= 0 || zonePrice <= 0) {
      setError("Please input valid field parameters.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const payload = {
        name: zoneName,
        type: zoneType,
        total_capacity: zoneCapacity,
        price_per_hour: zonePrice,
      };

      if (modalMode === "create") {
        await api.createZone(payload);
        triggerSuccess("Parking zone created successfully.");
      } else if (modalMode === "edit" && selectedZone) {
        await api.updateZone(selectedZone.id, payload);
        triggerSuccess("Parking zone updated successfully.");
      }

      setShowZoneModal(false);
      resetZoneForm();
      fetchData(role);
    } catch (err: any) {
      setError(err?.message || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const resetZoneForm = () => {
    setZoneName("");
    setZoneType("general");
    setZoneCapacity(10);
    setZonePrice(2.0);
    setSelectedZone(null);
  };

  const handleOpenCreateModal = () => {
    resetZoneForm();
    setModalMode("create");
    setShowZoneModal(true);
  };

  const handleOpenEditModal = (zone: Zone) => {
    setSelectedZone(zone);
    setZoneName(zone.name);
    setZoneType(zone.type);
    setZoneCapacity(zone.total_capacity);
    setZonePrice(zone.price_per_hour);
    setModalMode("edit");
    setShowZoneModal(true);
  };

  // Delete Zone
  const handleDeleteZone = async (id: number) => {
    if (!confirm("Are you sure you want to delete this parking zone? All reservations under this zone will be affected.")) return;
    setActionLoading(true);
    try {
      await api.deleteZone(id);
      triggerSuccess("Zone deleted successfully.");
      fetchData(role);
    } catch (err: any) {
      setError(err?.message || "Failed to delete parking zone.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reserve Spot
  const handleOpenBookModal = (zone: Zone) => {
    setTargetBookZone(zone);
    setLicensePlate("");
    setShowBookModal(true);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBookZone || !licensePlate.trim()) {
      setError("Please specify license plate details.");
      return;
    }

    if (licensePlate.length > 15) {
      setError("License plate cannot exceed 15 characters.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const res = await api.createReservation({
        zone_id: targetBookZone.id,
        license_plate: licensePlate.trim(),
      });

      if (res.success) {
        triggerSuccess("Spot reserved successfully!");
        setShowBookModal(false);
        fetchData(role);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to make reservation.");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    setActionLoading(true);
    try {
      await api.cancelReservation(id);
      triggerSuccess("Reservation cancelled successfully.");
      fetchData(role);
    } catch (err: any) {
      setError(err?.message || "Failed to cancel reservation.");
    } finally {
      setActionLoading(false);
    }
  };

  // Render Stats overview helper
  const renderOverview = () => {
    const activeCount = myReservations.filter((r) => r.status === "active").length;
    
    // Cross-reference cost based on zones
    const totalSpent = myReservations
      .filter((r) => r.status === "active")
      .reduce((acc, r) => {
        const zone = zones.find((z) => z.id === r.zone_id);
        return acc + (zone?.price_per_hour || 0);
      }, 0);

    // Admin metrics
    const totalZones = zones.length;
    const globalReservations = allReservations.length;
    const globalActiveReservations = allReservations.filter((r) => r.status === "active").length;
    const totalCapacity = zones.reduce((acc, z) => acc + z.total_capacity, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((globalActiveReservations / totalCapacity) * 100) : 0;

    return (
      <div className="space-y-6">
        
        {/* Banner Alert messages */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 shadow-xs">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {role === "admin" ? (
            <>
              {/* Admin Stat 1 */}
              <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Zones</span>
                  <Layers className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">{totalZones}</span>
                  <span className="text-xs text-neutral-500">active configurations</span>
                </div>
              </div>

              {/* Admin Stat 2 */}
              <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">System Bookings</span>
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">{globalReservations}</span>
                  <span className="text-xs text-neutral-500">total records</span>
                </div>
              </div>

              {/* Admin Stat 3 */}
              <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Active Bookings</span>
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">{globalActiveReservations}</span>
                  <span className="text-xs text-neutral-500">active vehicles</span>
                </div>
              </div>

              {/* Admin Stat 4 */}
              <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Global Occupancy</span>
                  <Zap className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">{occupancyRate}%</span>
                  <span className="text-xs text-neutral-500">filled spaces ({globalActiveReservations}/{totalCapacity})</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Driver Stat 1 */}
              <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">My Active Bookings</span>
                  <ParkingSquare className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">{activeCount}</span>
                  <span className="text-xs text-neutral-500">locked spots</span>
                </div>
              </div>

              {/* Driver Stat 2 */}
              <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Reservations</span>
                  <BookmarkCheck className="h-5 w-5 text-neutral-500" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">{myReservations.length}</span>
                  <span className="text-xs text-neutral-500">lifetime bookings</span>
                </div>
              </div>

              {/* Driver Stat 3 */}
              <div className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Estimated Hourly Cost</span>
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900">${totalSpent.toFixed(2)}</span>
                  <span className="text-xs text-neutral-500">USD / hour total</span>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Helpful Info Panel */}
        <div className="rounded-xl border border-[#ebebeb] bg-white p-6 flex items-start gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-neutral-900">SpotSync Platform Rules</h4>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-3xl">
              Parking zones support dynamic availability counts. Reserves are concurrent-safe under transaction locks. 
              As a {role === 'admin' ? 'System Administrator' : 'Driver'}, you can fully explore zone pricing, track occupancy records, or cancel reservations anytime to free up charging spots.
            </p>
          </div>
        </div>

      </div>
    );
  };

  // Render Parking Zones subview
  const renderZones = () => {
    return (
      <div className="space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">SpotSync Parking Bays</h2>
            <p className="text-xs text-neutral-500 mt-1">Explore zone capacities, hourly costs, and EV status.</p>
          </div>
          {role === "admin" && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Zone</span>
            </button>
          )}
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <div key={zone.id} className="rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              
              <div>
                {/* Zone Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-neutral-900 tracking-tight truncate max-w-[150px]">{zone.name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    zone.type === "ev_charging" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : zone.type === "covered" 
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200" 
                      : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                  }`}>
                    {zone.type === "ev_charging" ? "EV Space" : zone.type}
                  </span>
                </div>

                {/* Capacity count */}
                <div className="flex items-center justify-between text-xs py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Available Spots</span>
                  <span className={`font-bold ${zone.available_spots > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {zone.available_spots} / {zone.total_capacity} free
                  </span>
                </div>

                {/* Pricing info */}
                <div className="flex items-center justify-between text-xs py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Price / Hour</span>
                  <span className="font-bold text-neutral-900">${zone.price_per_hour.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2">
                {role === "admin" ? (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(zone)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-neutral-350 bg-white py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenBookModal(zone)}
                    disabled={zone.available_spots <= 0}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Reserve Spot</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    );
  };

  // Render Reservations Subview
  const renderReservations = () => {
    return (
      <div className="space-y-8">
        
        {/* Driver Reservations */}
        <div>
          <div className="mb-4">
            <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">My Reservations</h2>
            <p className="text-xs text-neutral-500 mt-1">Browse your personal booking logs and cancellations.</p>
          </div>

          <div className="rounded-xl border border-[#ebebeb] bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#ebebeb] bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Reservation ID</th>
                    <th className="p-4">License Plate</th>
                    <th className="p-4">Zone</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Booked At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebebeb] text-neutral-750">
                  {myReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400 italic">No bookings recorded.</td>
                    </tr>
                  ) : (
                    myReservations.map((res) => (
                      <tr key={res.id} className="hover:bg-neutral-50/50">
                        <td className="p-4 font-mono">#{res.id}</td>
                        <td className="p-4 font-bold text-neutral-900">{res.license_plate}</td>
                        <td className="p-4">{res.zone?.name || "T1 EV charging"}</td>
                        <td className="p-4 capitalize">{res.zone?.type || "ev_charging"}</td>
                        <td className="p-4">{new Date(res.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            res.status === "active" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {res.status === "active" && (
                            <button
                              onClick={() => handleCancelBooking(res.id)}
                              className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 text-[10px] font-bold transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Admin System Reservations List */}
        {role === "admin" && (
          <div>
            <div className="mb-4">
              <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">System-Wide Audit Log (Admin Only)</h2>
              <p className="text-xs text-neutral-500 mt-1">Audit active and cancelled slots across the entire parking network.</p>
            </div>

            <div className="rounded-xl border border-[#ebebeb] bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#ebebeb] bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Reservation ID</th>
                      <th className="p-4">User ID</th>
                      <th className="p-4">License Plate</th>
                      <th className="p-4">Zone</th>
                      <th className="p-4">Booked At</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebebeb] text-neutral-755">
                    {allReservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-400 italic">No global reservations recorded.</td>
                      </tr>
                    ) : (
                      allReservations.map((res) => (
                        <tr key={res.id} className="hover:bg-neutral-50/50">
                          <td className="p-4 font-mono">#{res.id}</td>
                          <td className="p-4 font-mono text-neutral-500">User ID {res.user_id}</td>
                          <td className="p-4 font-bold text-neutral-900">{res.license_plate}</td>
                          <td className="p-4">{res.zone?.name || "T1 EV space"}</td>
                          <td className="p-4">{new Date(res.created_at).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              res.status === "active" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                            }`}>
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Workspace Menu Tabs */}
      <div className="flex border-b border-[#ebebeb] overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "overview"
              ? "border-emerald-600 text-neutral-900"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("zones")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "zones"
              ? "border-emerald-600 text-neutral-900"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Parking Zones
        </button>
        <button
          onClick={() => setActiveTab("reservations")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "reservations"
              ? "border-emerald-600 text-neutral-900"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Reservations
        </button>
      </div>

      {/* Main Tab Rendering Frame */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <span className="text-xs text-neutral-500 font-medium">Loading data...</span>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-600">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "overview" && renderOverview()}
          {activeTab === "zones" && renderZones()}
          {activeTab === "reservations" && renderReservations()}
        </>
      )}

      {/* MODAL: Add/Edit Zone (Admin) */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-xs">
          <div className="w-full max-w-sm sm:max-w-md rounded-xl border border-[#ebebeb] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-widest mb-6">
              {modalMode === "create" ? "Create Parking Zone" : "Edit Parking Zone"}
            </h3>

            <form onSubmit={handleZoneSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Zone Name</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. Terminal 2 EV Spot"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-650 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Zone Type</label>
                <select
                  value={zoneType}
                  onChange={(e) => setZoneType(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-indigo-650 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="ev_charging">EV Charging</option>
                  <option value="covered">Covered</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Capacity</label>
                  <input
                    type="number"
                    value={zoneCapacity}
                    onChange={(e) => setZoneCapacity(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-indigo-650 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Price/Hour ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={zonePrice}
                    onChange={(e) => setZonePrice(Number(e.target.value))}
                    min={0.1}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-indigo-650 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  className="rounded-lg border border-neutral-250 bg-neutral-50 hover:bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Book Spot (Driver) */}
      {showBookModal && targetBookZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-xs">
          <div className="w-full max-w-sm sm:max-w-md rounded-xl border border-[#ebebeb] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-widest mb-2">Reserve Spot</h3>
            <p className="text-xs text-neutral-500">Locking parking slot inside <span className="font-bold text-neutral-950">{targetBookZone.name}</span></p>

            <form onSubmit={handleBookSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">License Plate Number</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC-1234"
                  maxLength={15}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-emerald-600 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-neutral-400 mt-1">Maximum 15 characters.</p>
              </div>

              <div className="rounded-lg bg-[#f8f8f8] p-4 space-y-2 text-xs border border-[#ebebeb]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Bay Type:</span>
                  <span className="font-bold text-neutral-900 uppercase">{targetBookZone.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Hourly Rate:</span>
                  <span className="font-bold text-emerald-600">${targetBookZone.price_per_hour.toFixed(2)} / hr</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="rounded-lg border border-neutral-250 bg-neutral-50 hover:bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
