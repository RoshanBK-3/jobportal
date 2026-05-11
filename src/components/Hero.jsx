export function Hero() {
  return (
    <section className="text-center py-16 bg-gray-50">
      <h2 className="text-3xl font-bold mb-4">
        Find Your Next Internship
      </h2>

      <p className="text-gray-600 mb-6">
        Explore opportunities tailored for you
      </p>

      <div className="flex justify-center gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search skills"
          className="px-4 py-2 border rounded-lg w-64"
        />

        <input
          type="text"
          placeholder="Location"
          className="px-4 py-2 border rounded-lg w-48"
        />

        <button className="bg-purple-600 text-white px-5 py-2 rounded-lg">
          Search
        </button>
      </div>
    </section>
  );
}