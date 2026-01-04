export function Compression() {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="compression-selector" className="text-white">
        Compression:
      </label>
      <select
        id="compression-selector"
        name="compression"
        className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <option value="90" defaultChecked>
          90% (Light)
        </option>
        <option value="70">70% (Balanced)</option>
        <option value="50">50% (Strong)</option>
        <option value="30">30% (Max Crunch)</option>
      </select>
    </div>
  );
}
