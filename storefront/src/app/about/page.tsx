import type { Metadata } from 'next';
import Image from "next/image";

export const metadata: Metadata = {
  title:"About",
  description:"About page of crunch it app."
}

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      {/* Founder Intro */}
      <section className="text-center space-y-6">
        <div className="relative w-32 h-32 mx-auto">
          <Image
            src="/assets/avatar.svg"
            alt="Founder"
            fill
            className="rounded-full object-cover border-4 border-gray-200 shadow-md"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-hover-green">
            Hi there <span className="wave">👋</span>
          </h1>
          <p className="mt-2">
            I’m building this platform to make file compression and conversion **fast, simple, and private**. No ads, no
            clutter — just a tool that works for you.
          </p>
        </div>
      </section>

      {/* Mission / What we do */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Why this project?</h2>
        <p>
          Sharing large files is painful. Cloud services are slow, apps are bloated, and privacy is questionable. I
          wanted a tool that just
          <span className="font-medium"> compresses files quickly and securely</span>.
        </p>
      </section>

      {/* Features (Minimal Grid) */}
      <section className="grid md:grid-cols-3 gap-6 text-center">
        <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-lg">⚡ Fast</h3>
          <p className="text-sm mt-2">Optimized for speed so you can compress files in seconds.</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-lg">🔒 Private</h3>
          <p className="text-sm  mt-2">Files are processed securely and never stored permanently.</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-lg">🎯 Simple</h3>
          <p className="text-sm  mt-2">No signup, no fluff. Upload → compress → download.</p>
        </div>
      </section>

      {/* Future Vision */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">What’s Next?</h2>
        <p>
          Today we compress videos and images. Tomorrow, we’ll support conversions across formats — making file handling
          effortless.
        </p>
      </section>
    </div>
  );
}

export default AboutPage;
