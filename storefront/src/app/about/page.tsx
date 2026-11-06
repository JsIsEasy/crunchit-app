import type { Metadata } from 'next';
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "Learn why CrunchIt was built and how its browser-based image tools work.",
  alternates: { canonical: "/about" },
};

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
            About CrunchIt
          </h1>
          <p className="mt-2">
            I’m building CrunchIt to make everyday file tasks simpler. The first tools convert images between JPG and
            PNG directly in your browser.
          </p>
        </div>
      </section>

      {/* Mission / What we do */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Why this project?</h2>
        <p>
          Sometimes you need a different image format to upload a photo, open it in an editor, or share it with
          someone. CrunchIt gives you one workspace to add a batch of images and download the converted files.
        </p>
      </section>

      {/* Features (Minimal Grid) */}
      <section className="grid md:grid-cols-3 gap-6 text-center">
        <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-lg">⚡ Fast</h3>
          <p className="text-sm mt-2">Convert up to 10 images in a batch.</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-lg">🔒 Private</h3>
          <p className="text-sm mt-2">The current converters process your images on your device.</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-lg">🎯 Simple</h3>
          <p className="text-sm mt-2">Choose a format, add your images, and download the results.</p>
        </div>
      </section>

      {/* Future Vision */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">What’s Next?</h2>
        <p>
          Image compression and more file formats are future additions. Today, CrunchIt supports JPG to PNG and PNG
          to JPG conversion.
        </p>
      </section>
    </div>
  );
}

export default AboutPage;
