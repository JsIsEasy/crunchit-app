import Link from "next/link";
function Header() {
  return (
    <header className="w-full max-w-5xl flex justify-between items-center mb-16">
      <Link href="/" className="text-3xl font-bold tracking-tight text-hover-green drop-shadow-[0_0_6px_text-primary-green]">
        CrunchIt
      </Link>
      <nav className="flex gap-6 text-lg">
        <Link href="login" className="hover:text-hover-green transition-colors">
          Log In
        </Link>
        <Link href="about" className="hover:text-hover-green transition-colors">
          About
        </Link>
      </nav>
    </header>
  );
}

export default Header;
