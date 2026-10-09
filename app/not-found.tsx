import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow mb-4">404 · no such resource</p>
        <h1 className="display text-[4rem] leading-none text-ink sm:text-[6rem]">Off the map</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          This page is not in the library. The library is where you want to be.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Reading room
          </Link>
          <Link href="/library" className="btn">
            Open library
          </Link>
        </div>
      </div>
    </div>
  );
}
