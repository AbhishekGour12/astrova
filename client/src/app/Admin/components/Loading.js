export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#003D33] font-semibold">Loading Cosmic Dashboard...</p>
    </div>
  </div>
);

export const TableLoader = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 rounded"></div>
  </div>
);

export const ChartLoader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-[#00695C] text-sm">Loading chart...</p>
    </div>
  </div>
);