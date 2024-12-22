import SDVTool from './components/SDVTool';  // Using relative path since it's in app/components

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <SDVTool />
    </main>
  );
}