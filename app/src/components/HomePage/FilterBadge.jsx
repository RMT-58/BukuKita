// filter kalau di mobile
export const FilterBadge = ({ label, count, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
          flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-all
          ${isActive ? "bg-[#00A8FF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
        `}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ml-1 ${isActive ? "bg-white/30 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
