import { ReactNode } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Image src="/logo.svg" width={200} height={100} alt="logo" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <div className="fixed right-0 top-0 h-screen w-1/2">
          <Image
            src="/auth-screen.jpg"
            alt="Auth Background"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
