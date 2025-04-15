import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="max-w-md w-full">
        <h1 className="text-7xl font-normal mb-6 text-center">404</h1>
        <h2 className="text-3xl font-normal mb-8 text-center">страница не найдена</h2>
        <p className="text-gray-600 mb-10 text-center text-lg">
          запрашиваемая вами страница не существует или была перемещена
        </p>
        <div className="flex justify-center">
          <Link href="/" className="bg-black hover:bg-gray-900 text-white px-12 py-4 rounded-xl transition-colors">
            вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
