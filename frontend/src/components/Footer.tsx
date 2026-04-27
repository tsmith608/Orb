"use client";

/**
 * ---------------------------------------------------------------------------
 * BOILERPLATE TEMPLATE: Footer
 * ---------------------------------------------------------------------------
 * A clean, mobile-first footer. 
 * Often used alongside or replaced by a Bottom Navigation Bar in mobile apps.
 */
export default function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-zinc-900 bg-zinc-950 text-center">
      <p className="text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} MobileApp. All rights reserved.
      </p>
    </footer>
  );
}
