import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  // { href: "/manage-account", label: "Manage Account" },
];

interface NavLinksProps {
  className?: string;
  onItemClick?: () => void;
}

export function NavLinks({ className = "", onItemClick }: NavLinksProps) {
  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
          onClick={onItemClick}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
