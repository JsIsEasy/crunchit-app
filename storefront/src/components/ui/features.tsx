export function Features () {
    return  <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
    <div className="bg-emerald-500/10 p-6 rounded-2xl shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition">
      <h3 className="text-2xl font-bold mb-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">
        Fast Compression
      </h3>
      <p className="text-gray-300">Shrink images, PDFs, and videos instantly without losing quality.</p>
    </div>
    <div className="bg-emerald-500/10 p-6 rounded-2xl shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition">
      <h3 className="text-2xl font-bold mb-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">
        File Conversion
      </h3>
      <p className="text-gray-300">Convert files between popular formats like PNG ↔ JPG, PDF ↔ Word, MP4 ↔ MP3.</p>
    </div>
    <div className="bg-emerald-500/10 p-6 rounded-2xl shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition">
      <h3 className="text-2xl font-bold mb-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">
        Secure & Private
      </h3>
      <p className="text-gray-300">Your files are deleted automatically after processing. No retention.</p>
    </div>
  </section>
}