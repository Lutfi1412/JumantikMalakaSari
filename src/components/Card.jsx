import React from "react";
import { FaUserNurse, FaHome, FaBug, FaPercentage } from "react-icons/fa";

const SummaryCards = ({ total }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {/* Card 1: Jumantik & Melapor */}
      <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl shadow-lg p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <FaUserNurse className="text-4xl opacity-90" />
          <span className="text-sm font-medium">Data Jumantik</span>
        </div>
        <div className="mt-3">
          <p className="text-lg font-semibold">Jumantik: {total.jumantik}</p>
          <p className="text-sm opacity-90">Melapor: {total.melapor}</p>
        </div>
      </div>

      {/* Card 2: Total Bangunan */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <FaHome className="text-4xl opacity-90" />
          <span className="text-sm font-medium">Total Bangunan</span>
        </div>
        <div className="mt-3 text-2xl font-semibold">
          {total.total_bangunan}
        </div>
      </div>

      {/* Card 3: Total Jentik */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl shadow-lg p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <FaBug className="text-4xl opacity-90" />
          <span className="text-sm font-medium">Total Jentik</span>
        </div>
        <div className="mt-3 text-2xl font-semibold">{total.total_jentik}</div>
      </div>

      {/* Card 4: ABJ */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <FaPercentage className="text-4xl opacity-90" />
          <span className="text-sm font-medium">Angka Bebas Jentik (ABJ)</span>
        </div>
        <div className="mt-3 text-2xl font-semibold">{total.abj}</div>
      </div>
    </div>
  );
};

export default SummaryCards;
