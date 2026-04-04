import CustomEvents from "../components/CustomEvents";

export default function CustomEventsPage() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Custom Events</h1>
        <p className="text-gray-500 mt-2">
          Track specific user interactions via code implementation.
        </p>
      </header>
      <CustomEvents />
    </div>
  );
}
